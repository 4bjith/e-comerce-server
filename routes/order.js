import express  from "express";

import { CreateOrder, GetOrder, GetMyOrders, UpdateOrderStatus, DeleteOrder } from "../controller/order.js";
import { LoginCheck } from "../middleware/auth.js";

import AdminCheck from "../middleware/Admin.js";

const order = express.Router();

order.post("/orders", LoginCheck, CreateOrder);
order.get("/orders/my", LoginCheck, GetMyOrders);
order.get("/orders", LoginCheck, AdminCheck, GetOrder);
order.put("/orders/:id/status", LoginCheck, AdminCheck, UpdateOrderStatus);
order.delete("/orders/:id", LoginCheck, AdminCheck, DeleteOrder);

export default order;