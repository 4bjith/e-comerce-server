import express from "express"

import { getUser, Login,Register } from "../controller/auth.js"
import { LoginCheck } from "../middleware/auth.js"

const router=express.Router()



router.post("/register",Register)

router.post("/login",Login)
router.get("/user",LoginCheck,getUser)


export default router