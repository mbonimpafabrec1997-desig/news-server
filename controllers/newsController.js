import News from "../models/News.js";
import { handleError, handleSuccess } from "../utils/responseHandler.js";
import { StatusCodes } from "http-status-codes";
import { sendNewArticleEmail } from "../utils/sendEmail.js";
import User from "../models/User.js";
import fs from "fs";
import jwt from "jsonwebtoken";


const makeAbsoluteImage = (req, image) => {
  if (!image) return "";
  if (image.startsWith("http")) return image;
  return `${req.protocol}://${req.get("host")}${image.startsWith("/") ? "" : "/"}${image}`;
};

export const getNews = async (req, res) => {
  try {
    const news = await News.find()
      .populate("author", "name email")
      .sort({ createdAt: -1 });

    const formattedNews = news.map(item => ({
      ...item.toObject(),
      image: makeAbsoluteImage(req, item.image)
    }));

    return handleSuccess(res, StatusCodes.OK, "News fetched successfully", formattedNews);
  } catch (error) {
    return handleError(res, StatusCodes.INTERNAL_SERVER_ERROR, error.message);
  }
};


export const getMyNews = async (req, res) => {
  try {
    const news = await News.find({ author: req.user._id })
      .sort({ createdAt: -1 });

    const formattedNews = news.map(item => ({
      ...item.toObject(),
      image: makeAbsoluteImage(req, item.image)
    }));

    return handleSuccess(res, StatusCodes.OK, "My news fetched successfully", formattedNews);
  } catch (error) {
    return handleError(res, StatusCodes.INTERNAL_SERVER_ERROR, error.message);
  }
};


export const getNewsById = async (req, res) => {
  try {
    const news = await News.findByIdAndUpdate(
      req.params.id,
      { $inc: { viewsCount: 1 } },
      { new: true }
    ).populate("author", "name email");

    if (!news) {
      return handleError(res, StatusCodes.NOT_FOUND, "Inkuru ntiboneka");
    }

    // Track category interest optionally if user is authenticated
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith("Bearer ") && news.category) {
      const token = authHeader.split(" ")[1];
      try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET || "secretkey");
        const user = await User.findById(decoded.id);
        if (user) {
          if (!user.categoryInterests) {
            user.categoryInterests = new Map();
          }
          const currentCount = user.categoryInterests.get(news.category) || 0;
          user.categoryInterests.set(news.category, currentCount + 1);
          await user.save();
        }
      } catch (err) {
        // Ignore token validation issues for optional tracking
      }
    }

    const formattedNews = {
      ...news.toObject(),
      image: makeAbsoluteImage(req, news.image)
    };

    return handleSuccess(res, StatusCodes.OK, "Inkuru iboneka", formattedNews);
  } catch (error) {
    return handleError(res, StatusCodes.INTERNAL_SERVER_ERROR, error.message);
  }
};


export const createNews = async (req, res) => {
  try {
    let imageUrl = "";

    // Check if image is base64 string
    if (req.body.image && req.body.image.startsWith("data:image")) {
      const base64Data = req.body.image;
      const format = base64Data.substring("data:image/".length, base64Data.indexOf(";base64"));
      const base64Image = base64Data.split(";base64,").pop();
      const fileName = `image_${Date.now()}.${format}`;
      const uploadPath = `uploads/${fileName}`;
      
      if (!fs.existsSync("uploads")) {
        fs.mkdirSync("uploads");
      }
      fs.writeFileSync(uploadPath, base64Image, { encoding: 'base64' });
      imageUrl = `${req.protocol}://${req.get("host")}/uploads/${fileName}`;
    } else if (req.files && req.files.image) {
      const image = req.files.image;
      const fileName = Date.now() + "_" + image.name;
      const uploadPath = `uploads/${fileName}`;
      if (!fs.existsSync("uploads")) {
        fs.mkdirSync("uploads");
      }
      await image.mv(uploadPath);
      imageUrl = `${req.protocol}://${req.get("host")}/uploads/${fileName}`; 
    }

    const news = await News.create({
      title:    req.body.title,
      content:  req.body.content,
      category: req.body.category,
      image:    imageUrl,
      videoUrl: req.body.videoUrl || "",
      author:   req.user._id,
      country:  req.body.country || ""
    });

    const subscribers = await User.find({ isSubscribed: true }).select("email");
    const emails = subscribers.map(u => u.email);

    if (emails.length > 0) {
      await sendNewArticleEmail({
        to:       emails.join(","),
        title:    news.title,
        category: news.category,
        author:   req.user.name,
        link:     `${process.env.CLIENT_URL}/news/${news._id}`,
      });
    }

    return handleSuccess(res, StatusCodes.CREATED, "story created", news);
  } catch (error) {
    return handleError(res, StatusCodes.INTERNAL_SERVER_ERROR, error.message);
  }
};

export const getAIRecommendations = async (req, res) => {
  try {
    const userId = req.user._id;
    const user = await User.findById(userId);
    if (!user) {
      return handleError(res, StatusCodes.NOT_FOUND, "User not found");
    }

    // Get user interests
    const interests = user.categoryInterests ? Object.fromEntries(user.categoryInterests) : {};
    const sortedCategories = Object.keys(interests).sort((a, b) => interests[b] - interests[a]);

    const userCountry = req.query.country || "";

    let recommendedNews = [];

    // Default fallback to fetch all articles
    const newsList = await News.find().populate("author", "name email");

    if (sortedCategories.length > 0 || userCountry) {
      recommendedNews = newsList.filter(article => {
        const matchesCategory = sortedCategories.includes(article.category);
        const matchesCountry = userCountry && article.country === userCountry;
        return matchesCategory || matchesCountry;
      });

      // Sort by ranking
      recommendedNews.sort((a, b) => {
        let scoreA = 0;
        let scoreB = 0;

        if (userCountry && a.country === userCountry) scoreA += 10;
        if (userCountry && b.country === userCountry) scoreB += 10;

        if (interests[a.category]) scoreA += interests[a.category];
        if (interests[b.category]) scoreB += interests[b.category];

        return scoreB - scoreA;
      });

      // Take top 6
      recommendedNews = recommendedNews.slice(0, 6);
    }

    // If still empty or very short, pad with latest news
    if (recommendedNews.length < 3) {
      const ids = new Set(recommendedNews.map(n => n._id.toString()));
      const latestNews = newsList
        .filter(n => !ids.has(n._id.toString()))
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
        .slice(0, 6 - recommendedNews.length);
      recommendedNews = [...recommendedNews, ...latestNews];
    }

    const formattedNews = recommendedNews.map(item => ({
      ...item.toObject(),
      image: makeAbsoluteImage(req, item.image)
    }));

    return handleSuccess(res, StatusCodes.OK, "Recommendations fetched successfully", formattedNews);
  } catch (error) {
    return handleError(res, StatusCodes.INTERNAL_SERVER_ERROR, error.message);
  }
};

export const addComment = async (req, res) => {
  try {
    const { id } = req.params;
    const { text } = req.body;

    const news = await News.findById(id);
    if (!news) {
      return handleError(res, StatusCodes.NOT_FOUND, "Inkuru ntiboneka");
    }

    const user = await User.findById(req.user._id);
    const comment = {
      user: req.user._id,
      userName: user ? user.name : "Anonymous",
      text,
      createdAt: new Date()
    };

    news.comments.push(comment);
    await news.save();

    const newComment = news.comments[news.comments.length - 1];

    return handleSuccess(res, StatusCodes.CREATED, "Comment added successfully", { comment: newComment });
  } catch (error) {
    return handleError(res, StatusCodes.INTERNAL_SERVER_ERROR, error.message);
  }
};

export const likeNews = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;

    const news = await News.findById(id);
    if (!news) {
      return handleError(res, StatusCodes.NOT_FOUND, "Inkuru ntiboneka");
    }

    const likeIndex = news.likes.indexOf(userId);
    if (likeIndex > -1) {
      news.likes.splice(likeIndex, 1);
    } else {
      news.likes.push(userId);
    }

    await news.save();
    return handleSuccess(res, StatusCodes.OK, "Like updated successfully", { likesCount: news.likes.length, likes: news.likes });
  } catch (error) {
    return handleError(res, StatusCodes.INTERNAL_SERVER_ERROR, error.message);
  }
};