import express from "express";
import { 
    getAdminStats, 
    getPlatformUsers, 
    getSystemLogs 
} from "../controller/admin.js";
import { LoginCheck, AdminCheck } from "../middleware/auth.js";

const admin = express.Router();

// PROTECTED ADMIN ROUTES
admin.get("/admin/analytics", LoginCheck, AdminCheck, getAdminStats);
admin.get("/admin/users", LoginCheck, AdminCheck, getPlatformUsers);
admin.get("/admin/logs", LoginCheck, AdminCheck, getSystemLogs);

export default admin;
