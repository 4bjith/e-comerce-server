import ProductModel from "../models/model.js";
import mongoose from "mongoose";
import { ErrorHandler } from "../middleware/errorMiddleware.js";

export const GetProduct = async (req, res, next) => {
  try {
    const { 
      search = "", 
      category = "", 
      maxPrice = "", 
      sort = "", 
      page = 1, 
      limit = 10 
    } = req.query;

    const numericLimit = Number(limit);
    const numericPage = Number(page);
    const skip = (numericPage - 1) * numericLimit;

    // Build the query object
    const query = {};
    if (search) {
      query.title = { $regex: new RegExp(search, "i") };
    }
    if (maxPrice && Number(maxPrice) > 0) {
      query.price = { $lte: Number(maxPrice) };
    }
    if (category) {
      // Find category by name to get its ID
      const cat = await mongoose.model("catagory").findOne({ catagoryName: category });
      if (cat) {
        query.catagory = cat._id;
      }
    }

    // Build the sort object
    let sortOptions = { createdAt: -1 }; // Default sort
    if (sort === "asc") {
      sortOptions = { price: 1 };
    } else if (sort === "desc") {
      sortOptions = { price: -1 };
    }

    const totalProducts = await ProductModel.countDocuments(query);
    const products = await ProductModel.find(query)
      .populate("catagory")
      .sort(sortOptions)
      .skip(skip)
      .limit(numericLimit);

    return res.status(200).json({
      total: totalProducts,
      page: numericPage,
      limit: numericLimit,
      totalPages: Math.ceil(totalProducts / numericLimit),
      data: products
    });

  } catch (err) {
    next(err);
  }
};

export const PostProduct = async (req, res, next) => {
  try {
    const { title, price, catagory, discount, countInStock, brand, description } = req.body;

    let image = "";
    if (req.file) {
      image = req.file.path.replace(/\\/g, "/");
    }

    if (!title || !price || !catagory) {
      throw new ErrorHandler("Title, Price and Category are required", 400);
    }

    const newProduct = await ProductModel.create({
      title,
      price,
      image,
      catagory,
      discount: discount || 0,
      countInStock: countInStock || 0,
      brand: brand || "",
      description: description || ""
    });
    res.status(201).json(newProduct);
  } catch (err) {
    next(err);
  }
};

export const DeleteProduct = async (req, res, next) => {
  try {
    const { id } = req.params;

    const deleteItem = await ProductModel.findByIdAndDelete(id);

    if (!deleteItem) {
      throw new ErrorHandler("Product not found", 404);
    }

    res.status(200).json({ message: "Product deleted successfully" });
  } catch (err) {
    next(err);
  }
};

export const UpdateProduct = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { title, price, catagory, discount, countInStock, brand, description } = req.body;

    let updateData = {
      title, price, catagory, discount, countInStock, brand, description
    };

    if (req.file) {
      updateData.image = req.file.path.replace(/\\/g, "/");
    } else if (req.body.image) {
      updateData.image = req.body.image;
    }

    const updatedProduct = await ProductModel.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    );

    if (!updatedProduct) {
      throw new ErrorHandler("Product not found", 404);
    }

    res.status(200).json(updatedProduct);
  } catch (err) {
    next(err);
  }
};

export const GetSingleProduct = async (req, res, next) => {
  try {
    const { id } = req.params;
    const product = await ProductModel.findById(id).populate("catagory").exec();

    if (!product) {
      throw new ErrorHandler("Product not found", 404);
    }

    res.status(200).json(product);
  } catch (err) {
    next(err);
  }
};