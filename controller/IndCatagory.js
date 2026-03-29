import Catagory from "../models/catagory.js";
import ProductModel from "../models/model.js";
import { ErrorHandler } from "../middleware/errorMiddleware.js";

export const cateItem = async (req, res, next) => {
  try {
    const { name } = req.params;

    const category = await Catagory.findOne({ catagoryName: name });
    
    if (!category) {
      throw new ErrorHandler("Category not found", 404);
    }

    const products = await ProductModel.find({ catagory: category._id })
      .populate("catagory")
      .exec();
      
    res.json(products);
  } catch (err) {
    next(err);
  }
};
