import express from "express"

import { checkAdmin, getUser, Login,Register } from "../controller/auth.js"
import { LoginCheck } from "../middleware/auth.js"
import AdminCheck from "../middleware/Admin.js"

const router=express.Router()



router.post("/register",Register)

router.post("/login",Login)
router.get("/user",getUser)
router.get("/admin-check",LoginCheck,AdminCheck,checkAdmin)

export default router