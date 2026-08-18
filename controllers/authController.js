import { OAuth2Client } from "google-auth-library";
import User from "../models/User.js";
import News from "../models/News.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { handleSuccess, handleError } from "../utils/responseHandler.js";
import { StatusCodes } from "http-status-codes";
import { sendNewUserEmail } from "../utils/sendEmail.js";

export const register = async (req, res) => {
  try {
    const { firstName, lastName, email, password, country, role } = req.body;

    const exist = await User.findOne({ email });
    if (exist) {
      return handleError(res, 409, "User already exists");
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await User.create({
      name: `${firstName} ${lastName}`,
      email,
      password: hashedPassword,
      country,
      role: role || "user"
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

    // Subiza neza structure yakorewe handleSuccess
    return res.status(StatusCodes.OK).json({
      success: true,
      message: "Login successful",
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

    res.clearCookie('token'); 

    return handleSuccess(res, StatusCodes.OK, "Account and all related news deleted successfully");
  } catch (error) {
    return handleError(res, StatusCodes.INTERNAL_SERVER_ERROR, error.message);
  }
};

export const adminDeleteUser = async (req, res) => {
  try {
    const { id } = req.params;         
 
    await News.deleteMany({ author: id });
 
    const deletedUser = await User.findByIdAndDelete(id);
 
    if (!deletedUser) {
      return handleError(res, StatusCodes.NOT_FOUND, "User not found");
    }
 
    return handleSuccess(
      res,
      StatusCodes.OK,
      `User "${deletedUser.name}" and all their content deleted successfully by Admin`
    );
  } catch (error) {
    return handleError(res, StatusCodes.INTERNAL_SERVER_ERROR, error.message);
  }
};

export const logoutUser = async (req, res) => {
  try {
    res.clearCookie('token'); 
    return res.status(200).json({ 
      success: true, 
      message: "Logged out successfully from server." 
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const googleLogin = async (req, res) => {
  try {
    const { token } = req.body;
    if (!token) {
      return handleError(res, StatusCodes.BAD_REQUEST, "Token is required");
    }

    const googleClientId = process.env.GOOGLE_CLIENT_ID || "YOUR_GOOGLE_CLIENT_ID.apps.googleusercontent.com";
    const client = new OAuth2Client(googleClientId);

    let ticket;
    try {
      ticket = await client.verifyIdToken({
        idToken: token,
        audience: googleClientId,
      });
    } catch (verifyError) {
      console.error("Google token verification failed:", verifyError);
      return handleError(res, StatusCodes.BAD_REQUEST, "Google authentication failed. Check your Client ID configuration.");
    }

    const payload = ticket.getPayload();
    const { email, name, picture } = payload;

    if (!email) {
      return handleError(res, StatusCodes.BAD_REQUEST, "Google authentication did not return an email address.");
    }

    // Find or create user
    let user = await User.findOne({ email });
    if (!user) {
      const randomPassword = Math.random().toString(36).slice(-10);
      const hashedPassword = await bcrypt.hash(randomPassword, 10);

      user = await User.create({
        name: name || email.split("@")[0],
        email: email,
        password: hashedPassword,
        avatar: picture || "",
        role: "user",
        isSubscribed: true
      });

      try {
        await sendNewUserEmail({
          to: process.env.EMAIL_USER,
          name: user.name,
          email: user.email,
          country: "Google Sign-In",
        });
      } catch (mailError) {
        console.error("Email sending failed during Google signup:", mailError);
      }
    }

    // Create JWT token
    const jwtToken = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "90d" }
    );

    const userResponse = user.toObject();
    delete userResponse.password;

    return res.status(StatusCodes.OK).json({
      success: true,
      message: "Google login successful",
      token: jwtToken,
      user: userResponse
    });
  } catch (error) {
    console.error("Google Login Controller Error:", error);
    return handleError(res, StatusCodes.INTERNAL_SERVER_ERROR, error.message);
  }
};
