import mongoose from "mongoose";

const LogSchema = new mongoose.Schema({
  action: {
    type: String,
    required: true
  },
  module: {
    type: String,
    required: true
  },
  details: {
    type: String,
    default: ""
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "users",
    required: false
  },
  ip: {
    type: String,
    default: ""
  }
}, { timestamps: true });

const LogModel = mongoose.model("logs", LogSchema);

export default LogModel;
