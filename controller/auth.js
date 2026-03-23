import UserModel from "../models/user.js";
import jwt from 'jsonwebtoken'

export const Login = async (req, res) => {
  const { email, password } = req.body;

  try {
    const usr = await UserModel.findOne({ email });

    if(usr){
      const isMatch = await usr.comparePassword(password)

      if(isMatch){
        const token = jwt.sign({email:usr.email,role:usr.role},'qwerty',{expiresIn: '4h'})
        res.json({
          status:"Login done",
          token:token
        })
      }else{
        res.send('Wrong password')
      }
    }else{
      res.send("no user found")
    }

  } catch (error) {
    console.error("Login error:", error);
    return res.status(500).send("Server error");
  }
};


export const Register=async(req,res)=>{
    const {name,email,password}=req.body

    try{
      const existing = await UserModel.findOne({email})
      if(existing){
        return res.status(400).json({status : "error", message:"User already exist"})
      }

      const newUser = await UserModel.create({name,email,password})
      res.status(201).json({
        status:"success",
        message:"User created",
        userId: newUser._id,
      })
    }catch(err){
      console.error("Register error : ",err)
      res.status(500).json({status: "error",message:"Server error"})
    }
}

export const getUser = async(req,res)=>{
  const usr = await UserModel.find({})
  res.status(201).json(usr)
}

export const checkAdmin = async(req,res) => {
  return res.status(200).json({role:"admin"})
}