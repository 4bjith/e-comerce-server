import express from "express";

import ProductModel from "../models/model.js";

// export const GetProduct = async (req, res) => {
//   try {
//     const { search, page = 1, limit = 10 } = req.query;

//     const numericLimit = parseInt(limit);
//     const numericPage = parseInt(page);
//     const skip = (numericPage - 1) * numericLimit;
    

//     // -----------------------------------------
//     // 🔍 If search exists → return exact product
//     // -----------------------------------------
//     if (search) {
//       const product = await ProductModel.findOne({ title: search }).populate("catagory");
//       let allProducts = await ProductModel.find({});
//       let suggestions = allProducts.map(prod => prod.title.startsWith(search)).filter(title => title.toLowerCase().includes(search.toLowerCase()) && title.toLowerCase() !== search.toLowerCase());

//       if (!product) {
//         return res.status(200).json({
//           total: 0,
//           page: numericPage,
//           limit: numericLimit,
//           totalPages: 0,
//           data: []
//         });
//       }

//       return res.status(200).json({
//         total: 1,
//         page: numericPage,
//         limit: numericLimit,
//         totalPages: 1,
//         suggestions: suggestions,
//         data: [product]
//       });
//     }

//     // -----------------------------------------
//     // 📄 Normal Pagination (No Search)
//     // -----------------------------------------
//     const totalProducts = await ProductModel.countDocuments();

//     const products = await ProductModel.find({})
//       .populate("catagory")
//       .skip(skip)
//       .limit(numericLimit)
//       .exec();

//     return res.status(200).json({
//       total: totalProducts,
//       page: numericPage,
//       limit: numericLimit,
//       totalPages: Math.ceil(totalProducts / numericLimit),
//       data: products
//     });

//   } catch (err) {
//     console.error("Error in GetProduct:", err);
//     return res.status(500).json({ message: "Internal server error" });
//   }
// };

export const GetProduct = async (req, res) => {
  try {
    const { search = "", page = 1, limit = 10 } = req.query;

    const numericLimit = Number(limit);
    const numericPage = Number(page);
    const skip = (numericPage - 1) * numericLimit;

    // -----------------------------------------
    // 🔍 SEARCH + SUGGESTIONS
    // -----------------------------------------
    if (search) {
      const regex = new RegExp(search, "i"); // case-insensitive

      const products = await ProductModel.find({
        title: { $regex: regex }
      })
        .populate("catagory")
        .limit(numericLimit);

      const suggestions = products.map(p => p.title);

      return res.status(200).json({
        total: products.length,
        page: numericPage,
        limit: numericLimit,
        totalPages: 1,
        suggestions,
        data: products
      });
    }

    // -----------------------------------------
    // 📄 NORMAL PAGINATION (NO SEARCH)
    // -----------------------------------------
    const totalProducts = await ProductModel.countDocuments();

    const products = await ProductModel.find({})
      .populate("catagory")
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
    console.error("Error in GetProduct:", err);
    return res.status(500).json({ message: "Internal server error" });
  }
};



export const PostProduct = async (req, res) => {
  try {

    const { title, price, catagory, discount, countInStock, brand, description } = req.body;


    let image = "";
    if (req.file) {
      image = req.file.path.replace(/\\/g, "/"); // Normalize path
    }

    if (!title || !price || !catagory) {
      return res.status(400).json({ message: "Title, Price and Category are required" });
    }

    let userRole = req.user?.role;
    if (userRole !== "admin") {
      return res.status(403).json({ message: "Access denied: Admins only" });
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
    console.error("Error creating product:", err);
    res.status(500).send("Error creating product: " + err.message);
  }
};

export const DeleteProduct = async (req, res) => {
  try {
    const { id } = req.params;

    const userRole = req.user?.role;
    if (userRole !== "admin") {
      return res.status(403).json({ message: "Access denied: Admins only" });
    }

    const deleteItem = await ProductModel.findByIdAndDelete(id);

    if (!deleteItem) {
      return res.status(404).send("Item not found");
    }

    res.status(200).send("Item delete sucessfully. ");
  } catch (err) {
    res.status(500).send(err.message);
  }
};

export const UpdateProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, price, catagory, discount, countInStock, brand, description } = req.body;



    let updateData = {
      title, price, catagory, discount, countInStock, brand, description
    };

    if (req.file) {
      updateData.image = req.file.path.replace(/\\/g, "/");
    } else if (req.body.image) {
      // If sending image as URL string
      updateData.image = req.body.image;
    }

    let userRole = req.user?.role;
    if (userRole !== "admin") {
      return res.status(403).json({ message: "Access denied: Admins only" });
    }

    // find product by id and update
    const updatedProduct = await ProductModel.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true } // return updated doc + validate schema
    );

    if (!updatedProduct) {
      return res.status(404).json({ message: "Product not found" });
    }

    res.status(200).json(updatedProduct);
  } catch (err) {
    console.error("Error updating product:", err);
    res.status(500).json({ message: "Error updating product: " + err.message });
  }
};

export const GetSingleProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const product = await ProductModel.findById(id).populate("catagory").exec();

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    res.status(200).json(product);
  } catch (err) {
    console.error("Error fetching product:", err);
    res.status(500).json({ message: "Error fetching product: " + err.message });
  }
};