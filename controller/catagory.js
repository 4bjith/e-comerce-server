import catagoryModel from "../models/catagory.js";
import { ErrorHandler } from "../middleware/errorMiddleware.js";

export const getCatagory = async (req, res, next) => {
  try {
    const catagory = await catagoryModel.find({});
    res.status(200).json(catagory);
  } catch (err) {
    next(err);
  }
};

export const postCatagory = async (req, res, next) => {
  try {
    const { catagoryName } = req.body;
    let catagoryImage = "";

    if (req.file) {
      catagoryImage = req.file.path.replace(/\\/g, "/");
    }

    const newCatagory = await catagoryModel.create({
      catagoryName,
      catagoryImage,
    });
    res.status(201).json(newCatagory);
  } catch (err) {
    next(err);
  }
};

export const updateCatagory = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { catagoryName } = req.body;
    let updateData = { catagoryName };

    if (req.file) {
      updateData.catagoryImage = req.file.path.replace(/\\/g, "/");
    }

    const updatedCatagory = await catagoryModel.findByIdAndUpdate(
      id,
      updateData,
      { new: true }
    );

    if (!updatedCatagory) {
      throw new ErrorHandler("Category not found", 404);
    }

    res.status(200).json(updatedCatagory);
  } catch (err) {
    next(err);
  }
};

export const deleteCatagory = async (req, res, next) => {
  try {
    const { id } = req.params;

    const delCategory = await catagoryModel.findByIdAndDelete(id);

    if (!delCategory) {
      throw new ErrorHandler("Category not found", 404);
    }
    res.status(200).json({ message: "Category deleted successfully" });
  } catch (err) {
    next(err);
  }
}
