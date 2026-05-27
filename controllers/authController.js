import User from "../models/User.js";
import News from "../models/News.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { handleSuccess, handleError } from "../utils/responseHandler.js";
import { StatusCodes } from "http-status-codes";
import { sendNewUserEmail } from "../utils/sendEmail.js";

export const register = async (req, res) => {
  try {
    const { firstName, lastName, email, password, country } = req.body;

    
    const exist = await User.findOne({ email });
    if (exist) {
      return handleError(res, 409, "User already exists");
    }

    
    const hashedPassword = await bcrypt.hash(password, 10);

    
    const newUser = await User.create({
      name: `${firstName} ${lastName}`,
      email,
      password: hashedPassword,
      country
    });

    if (newUser) {
      
      try {
        await sendNewUserEmail({
          to: process.env.EMAIL_USER,
          name: newUser.name,
          email: newUser.email,
          country: newUser.country,
        });
      } catch (mailError) {
        console.error("Email sending failed:", mailError);
        
      }

      const userResponse = newUser.toObject();
      delete userResponse.password;

      return handleSuccess(res, 201, "User registered successfully", userResponse);
    }
  } catch (error) {
    return handleError(res, 500, error.message);
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return handleError(res, StatusCodes.NOT_FOUND, "User not found");
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return handleError(res, StatusCodes.BAD_REQUEST, "Wrong password or email");
    }

  
const token = jwt.sign(
  { id: user._id, role: user.role }, 
  process.env.JWT_SECRET, 
  { expiresIn: "90d" } 
);

    const userResponse = user.toObject();
    delete userResponse.password;

    return handleSuccess(res, StatusCodes.OK, "Login successful", { 
      token, 
      user: userResponse 
    });
  } catch (error) {
    return handleError(res, StatusCodes.INTERNAL_SERVER_ERROR, "Internal server error");
  }
};

export const deleteAccount = async (req, res) => {
  try {
    const userId = req.user.id; 

    await News.deleteMany({ author: userId });

    const deletedUser = await User.findByIdAndDelete(userId);
    
    if (!deletedUser) {
      return handleError(res, StatusCodes.NOT_FOUND, "User not found");
    }

    return handleSuccess(res, StatusCodes.OK, "Account and all related news deleted successfully");
  } catch (error) {
    return handleError(res, StatusCodes.INTERNAL_SERVER_ERROR, error.message);
  }
};