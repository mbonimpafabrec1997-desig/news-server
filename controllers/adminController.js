import News from '../models/News.js'; 
import User from '../models/User.js';
import { handleSuccess, handleError } from "../utils/responseHandler.js";
import { StatusCodes } from "http-status-codes";

export const deleteNewsAdmin = async (req, res) => {
  try {
    const { id } = req.params;
    const deletedStory = await News.findByIdAndDelete(id);
    
    if (!deletedStory) {
      return res.status(404).json({ message: "This article was not found on the server." });
    }
    
    res.status(200).json({ message: "Article successfully deleted from the database!" });
  } catch (error) {
    res.status(500).json({ message: "Internal server error", error: error.message });
  }
};


export const applyCopyrightStrike = async (req, res) => {
  try {
    const { newsId, originalAuthor, compensationFee } = req.body;

    const updatedNews = await News.findByIdAndUpdate(
      newsId,
      {
        $set: {
          "copyrightStrike.isStriked": true,
          "copyrightStrike.originalAuthor": originalAuthor,
          "copyrightStrike.compensationFee": compensationFee,
          "copyrightStrike.strikedAt": new Date()
        }
      },
      { new: true }
    );

    if (!updatedNews) {
      return res.status(404).json({ message: "Article not found." });
    }

    res.status(200).json({ message: "Copyright strike successfully applied!", data: updatedNews });
  } catch (error) {
    res.status(500).json({ message: "Internal server error", error: error.message });
  }
};

export const handleUserViolation = async (req, res) => {
  try {
    const { userId, newsId, reason } = req.body;

    if (userId) {
      await User.findByIdAndUpdate(userId, {
        $set: { isBanned: true, banReason: reason }
      });
    }

    if (newsId) {
      await News.findByIdAndDelete(newsId);
    }

    res.status(200).json({ message: "Violator has been banned and the article removed successfully!" });
  } catch (error) {
    res.status(500).json({ message: "Internal server error", error: error.message });
  }
};

export const adminDeleteUser = async (req, res) => {
  try {
  
    const { userId } = req.params;         
 
    await News.deleteMany({ author: userId });
 
    const deletedUser = await User.findByIdAndDelete(userId);
 
    if (!deletedUser) {
      return res.status(404).json({ message: "User not found on the server." });
    }
 
    res.status(200).json({ 
      message: `User "${deletedUser.name}" and all their news content deleted successfully by Admin.` 
    });
  } catch (error) {
    res.status(500).json({ message: "Internal server error", error: error.message });
  }
};
