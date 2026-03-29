import jwt from 'jsonwebtoken';
import { ErrorHandler } from "./errorMiddleware.js";

const JWT_SECRET = process.env.JWT_SECRET || "qwerty";

export const LoginCheck = async (req, res, next) => {
  try {
    const authHeader = req.headers["authorization"];

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      throw new ErrorHandler("Authorization token missing or malformed", 401);
    }

    const token = authHeader.split(" ")[1];

    const decoded = jwt.verify(token, JWT_SECRET);

    req.user = decoded;
    next();
  } catch (err) {
    if (err instanceof ErrorHandler) {
      next(err);
    } else {
      next(new ErrorHandler("Invalid or expired token", 403));
    }
  }
};

export const AdminCheck = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    next();
  } else {
    next(new ErrorHandler("Admin privileges required for this operation", 403));
  }
};
