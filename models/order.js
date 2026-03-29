import mongoose from "mongoose";

// Subschema for individual items in the order
const OrderItemSchema = new mongoose.Schema({
  pid: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "products",
    required: true
  },
  qty: {
    type: Number,
    required: true
  }
});

// Main schema for an order
const OrderSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "users",
    required: true
  },
  email: {
    type: String
  },
  phone: {
    type: String
  },
  address: {
    type: String
  },
  fname: {
    type: String
  },
  lname: {
    type: String
  },
  orderedItems: {
    type: [OrderItemSchema],
    required: true
  },
  TotalPrice:{
    type:Number
  },
  status: {
    type: String,
    enum: ['pending', 'shipping', 'delivered', 'canceled'],
    default: 'pending'
  }
}, { timestamps: true }); // optional: adds createdAt and updatedAt fields

// Exporting model
const OrderModel= mongoose.model("orders", OrderSchema);

export default OrderModel;