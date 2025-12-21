import mongoose from "mongoose";
import bcrypt from "bcryptjs";

// Define schema
const UserSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  mobile: { type: Number , required: true, unique: true },
  profile: { type: String },
  password: { type: String, required: true },
  age: { type: Number },
  address: { type: String },
  role: { type: String, enum: ["user", "admin"], default: "user" },
});

// Pre-save hook to hash password
UserSchema.pre('save', async function (next) {
  if (!this.isModified('password')) {
    return next();
  }

  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Instance method to compare password
UserSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

// Create model
const UserModel = mongoose.model("users", UserSchema);

// Export model
export default UserModel;
