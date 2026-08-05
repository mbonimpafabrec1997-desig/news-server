import User from "../models/User.js";
import News from "../models/News.js";
import { handleError, handleSuccess } from "../utils/responseHandler.js";
import { StatusCodes } from "http-status-codes";
import path from "path";

export const updateAvatar = async (req, res) => {
  try {
    if (!req.files || !req.files.avatar) {
      return handleError(res, StatusCodes.BAD_REQUEST, "No avatar file uploaded");
    }

    const avatar = req.files.avatar;
    const extension = path.extname(avatar.name);
    const fileName = `avatar_${req.user._id}_${Date.now()}${extension}`;
    const uploadPath = `uploads/${fileName}`;

    await avatar.mv(uploadPath);

    // Dynamic host resolution
    const host = req.get("host");
    const protocol = req.protocol;
    const avatarUrl = `${protocol}://${host}/uploads/${fileName}`;

    // Update user in DB
    const user = await User.findById(req.user._id);
    if (!user) {
      return handleError(res, StatusCodes.NOT_FOUND, "User not found");
    }

    user.avatar = avatarUrl;
    await user.save();

    return res.status(StatusCodes.OK).json({
      success: true,
      message: "Profile picture updated successfully",
      avatar: avatarUrl,
    });
  } catch (error) {
    console.error("Avatar upload controller error:", error);
    return handleError(res, StatusCodes.INTERNAL_SERVER_ERROR, error.message);
  }
};

export const getFollowers = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).populate("followers", "name email avatar");
    if (!user) {
      return handleError(res, StatusCodes.NOT_FOUND, "User not found");
    }
    return res.status(StatusCodes.OK).json({
      success: true,
      followers: user.followers || [],
    });
  } catch (error) {
    return handleError(res, StatusCodes.INTERNAL_SERVER_ERROR, error.message);
  }
};

export const toggleFollow = async (req, res) => {
  try {
    const targetUserId = req.params.id;
    const currentUserId = req.user._id;

    if (currentUserId.toString() === targetUserId.toString()) {
      return handleError(res, StatusCodes.BAD_REQUEST, "You cannot follow yourself");
    }

    const targetUser = await User.findById(targetUserId);
    if (!targetUser) {
      return handleError(res, StatusCodes.NOT_FOUND, "User to follow not found");
    }

    const currentUser = await User.findById(currentUserId);
    if (!currentUser) {
      return handleError(res, StatusCodes.NOT_FOUND, "Current user not found");
    }

    // Toggle follow/unfollow
    const isFollowing = targetUser.followers.includes(currentUserId);

    if (isFollowing) {
      // Unfollow
      targetUser.followers = targetUser.followers.filter(id => id.toString() !== currentUserId.toString());
      currentUser.following = currentUser.following.filter(id => id.toString() !== targetUserId.toString());
    } else {
      // Follow
      targetUser.followers.push(currentUserId);
      currentUser.following.push(targetUserId);
    }

    await targetUser.save();
    await currentUser.save();

    return res.status(StatusCodes.OK).json({
      success: true,
      message: isFollowing ? "Unfollowed successfully" : "Followed successfully",
      isFollowing: !isFollowing,
      followersCount: targetUser.followers.length,
    });
  } catch (error) {
    return handleError(res, StatusCodes.INTERNAL_SERVER_ERROR, error.message);
  }
};

export const getUserNotifications = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      return handleError(res, StatusCodes.NOT_FOUND, "User not found");
    }

    const notifications = user.notifications || [];
    const sorted = [...notifications].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    return res.status(StatusCodes.OK).json({
      success: true,
      notifications: sorted,
    });
  } catch (error) {
    return handleError(res, StatusCodes.INTERNAL_SERVER_ERROR, error.message);
  }
};

export const markNotificationsAsRead = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      return handleError(res, StatusCodes.NOT_FOUND, "User not found");
    }

    if (user.notifications) {
      user.notifications.forEach(n => {
        n.isRead = true;
      });
      await user.save();
    }

    return res.status(StatusCodes.OK).json({
      success: true,
      message: "All notifications marked as read",
    });
  } catch (error) {
    return handleError(res, StatusCodes.INTERNAL_SERVER_ERROR, error.message);
  }
};

export const getUserMonetizationStatus = async (req, res) => {
  try {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const newsList = await News.find({
      author: req.user._id,
      createdAt: { $gte: thirtyDaysAgo }
    });

    const lastMonthViews = newsList.reduce((sum, article) => sum + (article.viewsCount || 0), 0);
    const followersCount = req.user.followers?.length || 0;
    const isEligible = followersCount >= 1000 && lastMonthViews >= 10000;

    return res.status(StatusCodes.OK).json({
      success: true,
      followersCount,
      lastMonthViews,
      isEligible,
      isMonetized: req.user.isMonetized || false,
      paymentDetails: req.user.paymentDetails || null,
      requirements: {
        followers: 1000,
        views: 10000
      }
    });
  } catch (error) {
    return handleError(res, StatusCodes.INTERNAL_SERVER_ERROR, error.message);
  }
};

export const savePaymentDetails = async (req, res) => {
  try {
    const { bankName, accountName, accountNumber, swiftCode, country } = req.body;

    const user = await User.findById(req.user._id);
    if (!user) {
      return handleError(res, StatusCodes.NOT_FOUND, "User not found");
    }

    user.paymentDetails = {
      bankName: bankName || "",
      accountName: accountName || "",
      accountNumber: accountNumber || "",
      swiftCode: swiftCode || "",
      country: country || ""
    };

    await user.save();

    return res.status(StatusCodes.OK).json({
      success: true,
      message: "Payment details saved successfully",
      paymentDetails: user.paymentDetails
    });
  } catch (error) {
    return handleError(res, StatusCodes.INTERNAL_SERVER_ERROR, error.message);
  }
};
