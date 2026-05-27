import dotenv from "dotenv";
dotenv.config();

import express from "express";
import connectDB from "./config/db.js";
import cors from "cors";
import fileUpload from "express-fileupload";
import fs from "fs";

import newsRoutes from "./routes/newsRoutes.js";
import authRoutes from "./routes/authRoutes.js";
import messageRoutes from "./routes/messageRoutes.js";
import contactRoutes from "./routes/contactRoutes.js";
import adRoutes from "./routes/adRoutes.js";
import categoryRoutes from "./routes/categoryRoutes.js";
import adminRoutes from "./routes/adminRoutes.js"; 
import statusRoutes from "./routes/status.js";

const app = express();
app.use(cors());

app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));


app.use(fileUpload({ useTempFiles: true, tempFileDir: "/tmp/" }));
app.use("/uploads", express.static("uploads"));

app.use("/api/v1/news", newsRoutes);
app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/messages", messageRoutes);
app.use("/api/v1/contact", contactRoutes);
app.use("/api/v1/ads", adRoutes);
app.use("/api/v1/Category", categoryRoutes);
app.use("/api/v1", adminRoutes);
app.use("/api/v1/status", statusRoutes);

app.get("/", (req, res) => res.send("API is running 🔥"));

const startServer = async () => {
  try {
    await connectDB();
    
    if (!fs.existsSync("./uploads")) {
      fs.mkdirSync("./uploads");
      console.log("✅ Uploads folder created");
    }
    
    const PORT = process.env.PORT || 3000;
    app.listen(PORT, () => console.log(`✅ Server running on port ${PORT} 🚀`));
  } catch (error) {
    console.error("❌ Failed to start the backend engine node:", error.message);
  }
};

startServer();