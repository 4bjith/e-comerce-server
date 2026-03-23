import UserModel from "../models/user.js";
import jwt from 'jsonwebtoken'

export const Login = async (req, res) => {
  const { email, password } = req.body;

  try {
    const usr = await UserModel.findOne({ email });

    if (!usr) {
      return res.status(404).json({ status: "error", message: "No user found" });
    }

    const isMatch = await usr.comparePassword(password);
    if (!isMatch) {
      return res.status(400).json({ status: "error", message: "Wrong password" });
    }

    const token = jwt.sign(
      { email: usr.email, id: usr._id, role: usr.role },
      process.env.JWT_SECRET,
      { expiresIn: "4h" }
    );

    res.json({
      status: "Login done",
      token,
    });

  } catch (error) {
    console.error("Login error:", error);
    return res.status(500).json({ status: "error", message: "Server error" });
  }
};



export const Register = async (req, res) => {
  const { name, email, password, mobile } = req.body

  try {
    const existing = await UserModel.findOne({ email })
    if (existing) {
      return res.status(400).json({ status: "error", message: "User already exist" })
    }

    const newUser = await UserModel.create({ name, email, password, mobile })
    res.status(201).json({
      status: "success",
      message: "User created",
      userId: newUser._id,
    })
  } catch (err) {
    console.error("Register error : ", err)
    res.status(500).json({ status: "error", message: "Server error" })
  }
}

export const getUser = async (req, res) => {
  const email = req.user?.email;
  try {
    const user = await UserModel.findOne({ email })
    if (!user) {
      return res.status(404).json({ status: "error", message: "No user found" })
    }
    res.json({
      status: "success",
      user
    })
  } catch (err) {
    console.error("Get user error : ", err)
    res.status(500).json({ status: "error", message: "Server error" })
  }


}

export const updateUser = async (req, res) => {
  const email = req.user?.email;
  const { name, mobile, address, age, profile } = req.body;

  try {
    const user = await UserModel.findOne({ email });
    if (!user) {
      return res.status(404).json({ status: "error", message: "User not found" });
    }

    // Update fields
    if (name) user.name = name;
    if (mobile) user.mobile = mobile;
    if (address) user.address = address;
    if (age) user.age = age;

    // Handle image upload
    if (req.file) {
      user.profile = req.file.path.replace(/\\/g, "/");
    } else if (profile) {
      // Allow manual URL update if provided and no file
      user.profile = profile;
    }

    await user.save();

    res.json({
      status: "success",
      message: "User updated successfully",
      user
    });

  } catch (err) {
    console.error("Update user error: ", err);
    res.status(500).json({ status: "error", message: "Server error" });
  }
}
