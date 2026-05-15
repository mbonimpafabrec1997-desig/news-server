import News from "../models/News.js";
import { handleError, handleSuccess } from "../utils/responseHandler.js";
import { StatusCodes } from "http-status-codes";
import { sendNewArticleEmail } from "../utils/sendEmail.js";
import User from "../models/user.js";


export const getNews = async (req, res) => {
  try {
    const news = await News.find()
      .populate("author", "name email")
      .sort({ createdAt: -1 });

    return handleSuccess(res, StatusCodes.OK, "News fetched successfully", news);
  } catch (error) {
    return handleError(res, StatusCodes.INTERNAL_SERVER_ERROR, error.message);
  }
};


export const getMyNews = async (req, res) => {
  try {
    const news = await News.find({ author: req.user._id })
      .sort({ createdAt: -1 });

    return handleSuccess(res, StatusCodes.OK, "My news fetched successfully", news);
  } catch (error) {
    return handleError(res, StatusCodes.INTERNAL_SERVER_ERROR, error.message);
  }
};


export const getNewsById = async (req, res) => {
  try {
    const news = await News.findById(req.params.id)
      .populate("author", "name email");

    if (!news) {
      return handleError(res, StatusCodes.NOT_FOUND, "Inkuru ntiboneka");
    }

    return handleSuccess(res, StatusCodes.OK, "Inkuru iboneka", news);
  } catch (error) {
    return handleError(res, StatusCodes.INTERNAL_SERVER_ERROR, error.message);
  }
};


export const createNews = async (req, res) => {
  try {
    let imageUrl = "";

    
    if (req.files && req.files.image) {
      const image = req.files.image;
      const fileName = Date.now() + "_" + image.name;
      const uploadPath = `uploads/${fileName}`;
      await image.mv(uploadPath);
      imageUrl = `http://localhost:3000/uploads/${fileName}`; 
    }

    
    const news = await News.create({
      title:    req.body.title,
      content:  req.body.content,
      category: req.body.category,
      image:    imageUrl,
      author:   req.user._id,
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