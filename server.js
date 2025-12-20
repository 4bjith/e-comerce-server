import dotenv from "dotenv";
import express from "express";
import cors from "cors";
import mongoose from "mongoose";
import path from 'path';

import AuthRoute from "./routes/auth.js";

import ProductRoute from "./routes/product.js";
import catagoryRoute from "./routes/catagory.js";
import indCatagory from "./routes/IndCatagory.js";
import OrderRoute from "./routes/order.js";

dotenv.config();
//configuring port and database url
const PORT = process.env.PORT;
const app = express();
const MONGO_URL = process.env.MONGO_URL;

mongoose
  .connect(MONGO_URL)
  .then(() => console.log("MongoDB connected successfully."))
  .catch((err) => console.error("MongoDB connection error:", err));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());

// Make uploads folder static
app.use('/uploads', express.static('uploads'));

app.use(AuthRoute);

app.use(ProductRoute);

app.use(catagoryRoute);

app.use(indCatagory);

app.use(OrderRoute);

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

// // Product section
// app.get("/products",async(req,res)=>{

//     const items = await ProductModel.find({})
//     res.json(items)
// })

// app.post("/products",async(req,res)=>{

//     // const {title,price,image}=req.body

//     // console.log(title,price,image)
//     // await UserModel.create({title,price,image})
//     // res.send("ok created")

//     try {
//         const { title, price, image } = req.body;

//         // Return the newly created document as JSON
//         const newProduct = await ProductModel.create({ title, price, image });
//         res.status(201).json(newProduct);
//     } catch (err) {
//         console.error("Error creating product:", err);
//         res.status(500).send("Error creating product: " + err.message);
//     }
// })

// app.delete("/products/:id",async(req,res) => {
//     try{
//         const {id} = req.params

//         const deleteItem = await ProductModel.findByIdAndDelete(id)

//         if(!deleteItem){
//             return res.status(404).send("Item not found")
//         }

//         res.status(200).send("Item delete sucessfully. ")

//     }catch(err){
//         res.status(500).send(err.message)
//     }
// })

// // User section

// app.get('/user',async(req,res)=>{
//     try{
//         const response = await UserModel.find({})
//         res.json(response)

//         if(!response){
//             return res.status(404).send('User not found')
//         }
//     }catch(err){
//         res.status(500).send(err.message)
//     }
// })

// app.post('/user',async(req,res)=>{
//     try{
//         const {name,email,mobile,profile,password,age,address} = req.body

//         const newUser = await UserModel.create({name,email,mobile,profile,password,age,address})
//         res.status(201).json(newUser);
//     }catch(err){
//         console.error("Error creating product:", err);
//         res.status(500).send("Error adding new user: " + err.message);
//     }
// })
