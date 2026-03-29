import UserModel from "../models/user.js";
import ProductModel from "../models/model.js";
import CategoryModel from "../models/catagory.js";
import OrderModel from "../models/order.js";
import LogModel from "../models/log.js";
import { ErrorHandler } from "../middleware/errorMiddleware.js";

// DASHBOARD STATS
export const getAdminStats = async (req, res, next) => {
  try {
    const { timeframe } = req.query;
    let startDate = new Date();
    
    switch(timeframe) {
      case '1W': startDate.setDate(startDate.getDate() - 7); break;
      case '1M': startDate.setMonth(startDate.getMonth() - 1); break;
      case '6M': startDate.setMonth(startDate.getMonth() - 6); break;
      case '1Y': startDate.setFullYear(startDate.getFullYear() - 1); break;
      default: startDate.setMonth(startDate.getMonth() - 6);
    }

    const totalUsers = await UserModel.countDocuments();
    const totalProducts = await ProductModel.countDocuments();
    const totalCategories = await CategoryModel.countDocuments();
    const totalOrders = await OrderModel.countDocuments({ createdAt: { $gte: startDate } });
    
    // Revenue Calculation (Total)
    const allOrders = await OrderModel.find({});
    const totalRevenue = allOrders.reduce((acc, order) => acc + (order.TotalPrice || 0), 0);

    // Timeline Aggregation
    const statsByMonth = await OrderModel.aggregate([
      { $match: { createdAt: { $gte: startDate } } },
      {
        $group: {
          _id: { $month: "$createdAt" },
          revenue: { $sum: "$TotalPrice" },
          count: { $sum: 1 }
        }
      },
      { $sort: { "_id": 1 } }
    ]);

    res.json({
      status: "success",
      counts: {
        users: totalUsers,
        products: totalProducts,
        categories: totalCategories,
        orders: totalOrders,
        revenue: totalRevenue
      },
      chartData: statsByMonth
    });
  } catch (err) {
    next(err);
  }
};

// PLATFORM USERS
export const getPlatformUsers = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    const search = req.query.search || "";

    const query = {
      $or: [
        { name: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } }
      ]
    };

    const users = await UserModel.find(query)
      .select("-password")
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 });

    const total = await UserModel.countDocuments(query);

    res.json({
      status: "success",
      users,
      total,
      totalPages: Math.ceil(total / limit)
    });
  } catch (err) {
    next(err);
  }
};

// SYSTEM LOGS
export const getSystemLogs = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    const logs = await LogModel.find({})
      .populate("userId", "name email")
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 });

    const total = await LogModel.countDocuments();

    res.json({
      status: "success",
      logs,
      total,
      totalPages: Math.ceil(total / limit)
    });
  } catch (err) {
    next(err);
  }
};
