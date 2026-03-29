import dotenv from "dotenv";
import express from "express";
import cors from "cors";
import mongoose from "mongoose";
import path from 'path';

import AuthRoute from "./routes/auth.js";

import ProductRoute from "./routes/product.js";
import catagoryRoute from "./routes/catagory.js";
import indCatagory from "./routes/IndCatagory.js";
import OrderRoute from "./routes/order.js";
import AdminRoute from "./routes/admin.js";


import { rateLimit } from 'express-rate-limit';
import { errorMiddleware } from './middleware/errorMiddleware.js';

dotenv.config();

const PORT = process.env.PORT || 8000;
const app = express();
const MONGO_URL = process.env.MONGO_URL;

import jwt from 'jsonwebtoken';
import UserModel from "./models/user.js";

const JWT_SECRET = process.env.JWT_SECRET || "qwerty";

// Rate Limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 500, // Increased to 500
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    status: "error",
    message: "Too many requests from this IP, please try again after 15 minutes"
  },
  skip: async (req) => {
    try {
      // 1. Bypass by Token (For logged in admins)
      const authHeader = req.headers["authorization"];
      if (authHeader && authHeader.startsWith("Bearer ")) {
        const token = authHeader.split(" ")[1];
        const decoded = jwt.verify(token, JWT_SECRET);
        if (decoded && decoded.role === 'admin') return true;
      }

      // 2. Bypass by Login Email (For admin identification during login)
      if (req.path === '/login' && req.body?.email) {
        const user = await UserModel.findOne({ email: req.body.email });
        if (user && user.role === 'admin') return true;
      }
    } catch (err) {
      // Fail silent and apply limit
    }
    return false;
  }
});

mongoose
  .connect(MONGO_URL)
  .then(() => console.log("MongoDB connected successfully."))
  .catch((err) => console.error("MongoDB connection error:", err));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());
app.use(limiter);

// Make uploads folder static
app.use('/uploads', express.static('uploads'));

// Routes
app.use(AuthRoute);
app.use(ProductRoute);
app.use(catagoryRoute);
app.use(indCatagory);
app.use(OrderRoute);
app.use(AdminRoute);

// Error Middleware (Must be last)
app.use(errorMiddleware);

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
