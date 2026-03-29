import UserModel from "../models/user.js";
import jwt from 'jsonwebtoken'
import { ErrorHandler } from "../middleware/errorMiddleware.js";

const JWT_SECRET = process.env.JWT_SECRET || "qwerty";

export const Login = async (req, res, next) => {
  const { email, password } = req.body;

  try {
    const usr = await UserModel.findOne({ email });

    if (!usr) {
      throw new ErrorHandler("No user found", 404);
    }

    const isMatch = await usr.comparePassword(password);
    if (!isMatch) {
      throw new ErrorHandler("Wrong password", 400);
    }

    const token = jwt.sign(
      { email: usr.email, id: usr._id, role: usr.role, name: usr.name },
      JWT_SECRET,
      { expiresIn: "4h" }
    );

    const userResponse = usr.toObject();
    delete userResponse.password;

    res.json({
      status: "success",
      message: "Login successful",
      token,
      user: userResponse,
    });

  } catch (error) {
    next(error);
  }
};

export const Register = async (req, res, next) => {
  const { name, email, password, mobile } = req.body;

  try {
    const existing = await UserModel.findOne({ email });
    if (existing) {
      throw new ErrorHandler("User already exists", 400);
    }

    const newUser = await UserModel.create({ name, email, password, mobile });
    res.status(201).json({
      status: "success",
      message: "User created",
      userId: newUser._id,
    });
  } catch (err) {
    next(err);
  }
}

export const getUser = async (req, res, next) => {
  const email = req.user?.email;
  try {
    const user = await UserModel.findOne({ email });
    if (!user) {
      throw new ErrorHandler("No user found", 404);
    }
    res.json({
      status: "success",
      user
    });
  } catch (err) {
    next(err);
  }
}

export const updateUser = async (req, res, next) => {
  const email = req.user?.email;
  const { name, mobile, address, age, profile } = req.body;

  try {
    const user = await UserModel.findOne({ email });
    if (!user) {
      throw new ErrorHandler("User not found", 404);
    }

    if (name) user.name = name;
    if (mobile) user.mobile = mobile;
    if (address) user.address = address;
    if (age) user.age = age;

    if (req.file) {
      user.profile = req.file.path.replace(/\\/g, "/");
    } else if (profile) {
      user.profile = profile;
    }

    await user.save();

    res.json({
      status: "success",
      message: "User updated successfully",
      user
    });

  } catch (err) {
    next(err);
  }
}
