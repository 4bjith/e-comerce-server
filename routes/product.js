import express from "express";
import {
  DeleteProduct,
  GetProduct,
  GetSingleProduct,
  PostProduct,
  UpdateProduct,
} from "../controller/product.js";
import { LoginCheck } from "../middleware/auth.js";
import upload from "../middleware/upload.js"; // Import upload middleware

const product = express.Router();

product.get("/product", GetProduct);
product.get("/product/:id", GetSingleProduct);
product.post("/product", LoginCheck, upload.single('image'), PostProduct); // Add upload middleware
product.delete("/product/:id", LoginCheck, DeleteProduct);
product.put("/product/:id", LoginCheck, upload.single('image'), UpdateProduct); // Add upload middleware


export default product;
