import express from "express";
import {
  DeleteProduct,
  GetProduct,
  GetSingleProduct,
  PostProduct,
  UpdateProduct,
} from "../controller/product.js";
import { createProductReview, getProductReviews } from "../controller/review.js";
import { LoginCheck } from "../middleware/auth.js";
import upload from "../middleware/upload.js";

const product = express.Router();

product.get("/product", GetProduct);
product.get("/product/:id", GetSingleProduct);
product.post("/product", LoginCheck, upload.single('image'), PostProduct);
product.delete("/product/:id", LoginCheck, DeleteProduct);
product.put("/product/:id", LoginCheck, upload.single('image'), UpdateProduct);

// Review routes - nested under product
product.get("/product/:id/reviews", getProductReviews);
product.post("/product/:id/reviews", LoginCheck, createProductReview);

export default product;

