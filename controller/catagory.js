import express from "express";

import catagoryModel from "../models/catagory.js";

export const getCatagory = async (req, res) => {
  try {
    const catagory = await catagoryModel.find({});
    res.status(200).json(catagory);
  } catch (err) {
    res.status(500).json({ message: "Failed to get catagory" });
  }
};

export const postCatagory = async (req, res) => {
  try {
    const { catagoryName } = req.body;
    let catagoryImage = "";

    if (req.file) {
      catagoryImage = req.file.path.replace(/\\/g, "/"); // Convert backslashes
    }

    const newCatagory = await catagoryModel.create({
      catagoryName,
      catagoryImage,
    });
    res.status(201).json(newCatagory);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to create catagory" });
  }
};

export const updateCatagory = async (req, res) => {
  try {
    const { id } = req.params;
    const { catagoryName } = req.body;
    let updateData = { catagoryName };

    if (req.file) {
      updateData.catagoryName = req.file.path.replace(/\\/g, "/");
    }

    const updatedCatagory = await catagoryModel.findByIdAndUpdate(
      id,
      updateData,
      { new: true }
    );

    if (!updatedCatagory) {
      return res.status(404).json({ message: "Category not found" });
    }

    res.status(200).json(updatedCatagory);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to update category: " + err.message });
  }
};

export const deleteCatagory = async (req, res) => {
  try {
    const { id } = req.params;

    const delCategory = await catagoryModel.findByIdAndDelete(id);

    if (!delCategory) {
      return res.status(404).send("specific category not found. ")
    }
    res.status(200).send("Category deleted sucessfully. ")
  } catch (err) {
    res.status(500).send(err.message + "Error while running category delete function")
  }
}
