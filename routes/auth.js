import express from "express"

import { getUser, Login, Register, updateUser } from "../controller/auth.js"
import { LoginCheck } from "../middleware/auth.js"
import upload from "../middleware/upload.js"

const router = express.Router()



router.post("/register", Register)

router.post("/login", Login)
router.get("/user", LoginCheck, getUser)
router.put("/user", LoginCheck, upload.single('profile'), updateUser)


export default router