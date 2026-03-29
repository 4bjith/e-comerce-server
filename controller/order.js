import OrderModel from "../models/order.js";
import UserModel from "../models/user.js";
import ProductModel from "../models/model.js";
import { ErrorHandler } from "../middleware/errorMiddleware.js";

export const CreateOrder = async (req, res, next) => {
  try {
    const { userId, email, phone, address, fname, lname, orderedItems } =
      req.body;

    const user_details = await UserModel.findOne({ email: req.user.email });
    if (!user_details) throw new ErrorHandler("User not found", 404);

    let totalPrice = 0;

    for (const item of orderedItems) {
      const product = await ProductModel.findOne({ _id: item.pid });
      if (product) totalPrice += item.qty * product.price;
    }

    const newOrder = await OrderModel.create({
      userId: user_details._id,
      email,
      phone,
      address,
      fname,
      lname,
      orderedItems: orderedItems,
      TotalPrice: totalPrice,
    });

    res.status(201).json(newOrder);
  } catch (err) {
    next(err);
  }
};

// Get all orders (admin only)
export const GetOrder = async (req, res, next) => {
  try {
    const { page = 1, limit = 10, status = 'all', search = '' } = req.query;

    const query = {};
    if (status !== 'all') {
      query.status = { $regex: new RegExp(`^${status}$`, 'i') };
    }
    
    // We try to match email, fname, or lname for search
    if (search) {
      query.$or = [
        { email: { $regex: search, $options: 'i' } },
        { fname: { $regex: search, $options: 'i' } },
        { lname: { $regex: search, $options: 'i' } }
      ];
      
      // If the search string is exactly 24 chars (MongoDB ObjectId length), add it as an exact ID match
      if (search.length === 24) {
        query.$or.push({ _id: search });
      }
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const total = await OrderModel.countDocuments(query);
    const orders = await OrderModel.find(query)
      .populate("userId", "name email")
      .populate("orderedItems.pid")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    res.status(200).json({
      status: 'success',
      data: orders,
      totalPages: Math.ceil(total / parseInt(limit)),
      total
    });
  } catch (err) {
    next(err);
  }
};

export const UpdateOrderStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const order = await OrderModel.findByIdAndUpdate(id, { status }, { new: true });
    if (!order) throw new ErrorHandler("Order not found", 404);
    res.status(200).json({ status: "success", data: order });
  } catch (err) {
    next(err);
  }
};

export const DeleteOrder = async (req, res, next) => {
  try {
    const { id } = req.params;
    const order = await OrderModel.findByIdAndDelete(id);
    if (!order) throw new ErrorHandler("Order not found", 404);
    res.status(200).json({ status: "success", message: "Order deleted" });
  } catch (err) {
    next(err);
  }
};

// Get orders for the currently logged-in user
export const GetMyOrders = async (req, res, next) => {
  try {
    const user = await UserModel.findOne({ email: req.user.email });
    if (!user) throw new ErrorHandler("User not found", 404);

    const orders = await OrderModel.find({ userId: user._id })
      .populate("orderedItems.pid")
      .sort({ createdAt: -1 });

    res.status(200).json(orders);
  } catch (err) {
    next(err);
  }
};