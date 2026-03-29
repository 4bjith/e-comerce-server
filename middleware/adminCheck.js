import { ErrorHandler } from "./errorMiddleware.js";

const JWT_SECRET = process.env.JWT_SECRET || "qwerty";

export const adminCheck = async (req, res, next) => {
  try {
    const authHeader = req.headers["authorization"];

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      throw new ErrorHandler("Authorization token missing or malformed", 401);
    }

    const token = authHeader.split(" ")[1];

    const decoded = jwt.verify(token, JWT_SECRET);

    req.user = decoded;
    if (req.user.role !== "admin") {
      throw new ErrorHandler("Access denied: Admins only", 403);
    }
    next();
  } catch (err) {
    if (err instanceof ErrorHandler) {
      next(err);
    } else {
      next(new ErrorHandler("Invalid or expired token", 403));
    }
  }
};
