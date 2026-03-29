import ProductModel from "../models/model.js";
import Review from "../models/review.js";
import { ErrorHandler } from "../middleware/errorMiddleware.js";

/**
 * @desc    Create new review
 * @route   POST /api/product/:id/reviews
 * @access  Private
 */
export const createProductReview = async (req, res, next) => {
  const { rating, comment } = req.body;
  const productId = req.params.id;

  try {
    const product = await ProductModel.findById(productId);

    if (!product) {
      throw new ErrorHandler("Product not found", 404);
    }

    const alreadyReviewed = await Review.findOne({
      user: req.user.id,
      product: productId,
    });

    if (alreadyReviewed) {
      throw new ErrorHandler("Product already reviewed", 400);
    }

    const review = await Review.create({
      name: req.user.name || "User", // Assuming name is in token or fetch user
      rating: Number(rating),
      comment,
      user: req.user.id,
      product: productId,
    });

    // Update product average rating and numReviews
    const reviews = await Review.find({ product: productId });
    product.numReviews = reviews.length;
    product.rating =
      reviews.reduce((acc, item) => item.rating + acc, 0) / reviews.length;

    await product.save();

    res.status(201).json({ message: "Review added", review });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get all reviews for a product
 * @route   GET /api/product/:id/reviews
 * @access  Public
 */
export const getProductReviews = async (req, res, next) => {
  try {
    const reviews = await Review.find({ product: req.params.id }).populate("user", "name");
    res.json(reviews);
  } catch (error) {
    next(error);
  }
};
