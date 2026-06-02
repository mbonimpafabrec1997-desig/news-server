import jwt from "jsonwebtoken";
import User from "../models/User.js";


export const protect = (roles = []) => {
  return async (req, res, next) => {
    try {
      let token;

      
      if (
        req.headers.authorization &&
        req.headers.authorization.startsWith("Bearer")
      ) {
        token = req.headers.authorization.split(" ")[1];
      }

  
      if (!token) {
        return res.status(401).json({
          success: false,
          message: "Not authorized, no token provided",
        });
      }

      const decoded = jwt.verify(
        token,
        process.env.JWT_SECRET || "secretkey"
      );

      const user = await User.findById(decoded.id).select("-password");

      if (!user) {
        return res.status(401).json({
          success: false,
          message: "User not found",
        });
      }

    
      if (roles.length > 0 && !roles.includes(user.role)) {
        return res.status(403).json({
          success: false,
          message: `Access denied: ${user.role} role not permitted`,
        });
      }

      req.user = user;
      next();
    } catch (error) {
      console.error("JWT Error:", error.message);

      return res.status(401).json({
        success: false,
        message: "Token failed or expired",
      });
    }
  };
};

export const isAdmin = async (req, res, next) => {
  try {
    
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        success: false,
        message: "Not authorized, no token provided",
      });
    }

    const token = authHeader.split(" ")[1];

    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET || "secretkey"
    );

    const user = await User.findById(decoded.id);

    
    if (!user || user.role !== "admin") {
      return res.status(403).json({
        success: false,
        message: "Access denied: Admin only",
      });
    }

    req.user = user;
    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: "Invalid or expired token",
    });
  }
};
