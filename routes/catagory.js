import express from "express";
import upload from "../middleware/upload.js"; // Import upload middleware

import { deleteCatagory, getCatagory, postCatagory, updateCatagory } from "../controller/catagory.js";

const catagory = express.Router();

catagory.get("/catagory", getCatagory);
catagory.post("/catagory", upload.single('image'), postCatagory); // Use upload middleware
catagory.put("/catagory/:id", upload.single('image'), updateCatagory); // Use upload middleware
catagory.delete("/catagory/:id", deleteCatagory)
export default catagory;