import express from "express";
import { createProductReview, getProductReviews } from "../controller/review.js";
import { LoginCheck } from "../middleware/auth.js";

const router = express.Router();

router.get("/:id/reviews", getProductReviews);
router.post("/:id/reviews", LoginCheck, createProductReview);

export default router;
