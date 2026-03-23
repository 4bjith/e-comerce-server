import express  from "express";

import { CreateOrder, GetOrder } from "../controller/order.js";
import { LoginCheck } from "../middleware/auth.js";

import AdminCheck from "../middleware/Admin.js";

const order = express.Router();

order.post("/orders",LoginCheck,CreateOrder);
order.get("/orders",LoginCheck,AdminCheck,GetOrder)
export default order;