# Project‑1‑login‑and‑product – Backend API

## 📚 Overview
**Project‑1‑login‑and‑product** is a **Node.js** REST API built with **Express** and **MongoDB** (via **Mongoose**). It provides authentication, user profile management, product catalog, categories, orders and a simple wishlist‑like feature. The API is consumed by the front‑end **TrendQuick** React application.

---

## 🛠️ Tech Stack & Tools
| Layer | Technology / Tool | Why it’s used |
|-------|-------------------|--------------|
| **Runtime** | **Node.js (v18+)** | Server‑side JavaScript, fast I/O, huge ecosystem |
| **Web Framework** | **Express** | Minimalist routing & middleware system |
| **Database** | **MongoDB** (via **Mongoose**) | Flexible document model, easy to store product images & user data |
| **Authentication** | **JSON Web Tokens (jwt)** | Stateless auth, easy to verify on each request |
| **Environment** | **dotenv** | Loads `.env` variables (DB URL, JWT secret, port) |
| **CORS** | **cors** | Allows the React front‑end (different origin) to call the API |
| **File Uploads** | **multer** | Handles `multipart/form‑data` for profile pictures and product images |
| **Validation** | **Mongoose schema validation** | Guarantees required fields (e.g., title, price) |
| **Logging** | `console.log` (simple) – can be swapped for Winston in production |

---

## 📂 Project Structure
```
Project-1-login-and-product/
├─ .env                # environment variables (MONGO_URL, JWT_SECRET, PORT)
├─ server.js           # entry point – creates Express app, connects DB, registers routes
├─ package.json        # dependencies & scripts
├─ models/             # Mongoose schemas
│   ├─ user.js
│   ├─ product.js
│   ├─ catagory.js
│   └─ order.js
├─ controller/         # Business logic for each domain
│   ├─ auth.js         # login, register, getUser, updateUser
│   ├─ product.js      # CRUD for products (with image handling)
│   ├─ catagory.js
│   └─ order.js
├─ routes/             # Express routers – map HTTP verbs to controller functions
│   ├─ auth.js
│   ├─ product.js
│   ├─ catagory.js
│   └─ order.js
├─ middleware/         # reusable middleware functions
│   ├─ auth.js         # JWT verification (LoginCheck)
│   └─ upload.js       # Multer configuration for image uploads
└─ uploads/            # folder where uploaded images are stored
```

---

## ⚙️ Core Files Explained
### `server.js`
```js
import dotenv from "dotenv";
import express from "express";
import cors from "cors";
import mongoose from "mongoose";
import path from "path";

import AuthRoute from "./routes/auth.js";
import ProductRoute from "./routes/product.js";
import catagoryRoute from "./routes/catagory.js";
import indCatagory from "./routes/IndCatagory.js";
import OrderRoute from "./routes/order.js";

dotenv.config();
const PORT = process.env.PORT || 8000;
const app = express();
const MONGO_URL = process.env.MONGO_URL;

mongoose.connect(MONGO_URL)
  .then(() => console.log("MongoDB connected successfully."))
  .catch(err => console.error("MongoDB connection error:", err));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());

// Serve uploaded files statically
app.use('/uploads', express.static('uploads'));

// Register routers
app.use(AuthRoute);
app.use(ProductRoute);
app.use(catagoryRoute);
app.use(indCatagory);
app.use(OrderRoute);

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
```
*Sets up the Express server, connects to MongoDB, registers all routers, and serves the `uploads/` directory so images can be accessed via `http://localhost:8000/uploads/<filename>`.*

---
### `middleware/auth.js`
```js
import jwt from "jsonwebtoken";
const JWT_SECRET = process.env.JWT_SECRET || "qwerty";

export const LoginCheck = async (req, res, next) => {
  try {
    const authHeader = req.headers["authorization"];
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ message: "Authorization token missing or malformed" });
    }
    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded; // attach payload to request
    next();
  } catch (err) {
    return res.status(403).json({ message: "Invalid or expired token" });
  }
};
```
*Validates the JWT sent in the `Authorization` header. If valid, `req.user` contains `{ email, id, role }` for downstream controllers.*

---
### `middleware/upload.js`
```js
import multer from "multer";
import path from "path";

const storage = multer.diskStorage({
  destination: "./uploads/",
  filename: (req, file, cb) => {
    cb(null, `${file.fieldname}-${Date.now()}${path.extname(file.originalname)}`);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 5_000_000 }, // 5 MB limit
  fileFilter: (req, file, cb) => {
    const allowed = /jpeg|jpg|png|gif|webp/;
    const ext = allowed.test(path.extname(file.originalname).toLowerCase());
    const mime = allowed.test(file.mimetype);
    cb(null, ext && mime);
  },
});

export default upload;
```
*Configures Multer to store uploaded files in `uploads/` with a unique filename and validates image MIME types.*

---
### `controller/auth.js`
Key functions:
* **Login** – verifies email/password, issues a JWT (`jwt.sign({ email, id, role }, JWT_SECRET, { expiresIn: "4h" })`).
* **Register** – creates a new user after checking for duplicates.
* **getUser** – returns the authenticated user’s data (used by the front‑end to display profile).
* **updateUser** – updates name, mobile, address, age, and optionally the profile picture. If a file is uploaded (`req.file`), the path is normalized (`file.path.replace(/\\/g, "/")`) and stored in the `profile` field.

---
### `controller/product.js`
Provides the classic CRUD:
* **GetProduct** – paginated list (`/product?page=&limit=`) with optional search.
* **GetSingleProduct** – fetch a single product by ID.
* **PostProduct** – creates a product; expects an image file (`upload.single('image')`).
* **UpdateProduct** – updates product fields; also accepts a new image.
* **DeleteProduct** – removes a product by ID.

---
### `routes/auth.js`
```js
import express from "express";
import { getUser, Login, Register, updateUser } from "../controller/auth.js";
import { LoginCheck } from "../middleware/auth.js";
import upload from "../middleware/upload.js";

const router = express.Router();
router.post("/register", Register);
router.post("/login", Login);
router.get("/user", LoginCheck, getUser);
router.put("/user", LoginCheck, upload.single('profile'), updateUser);
export default router;
```
*Exposes authentication endpoints and protects the user‑profile routes with JWT verification.*

---
### `routes/product.js`
```js
import express from "express";
import {
  DeleteProduct,
  GetProduct,
  GetSingleProduct,
  PostProduct,
  UpdateProduct,
} from "../controller/product.js";
import { LoginCheck } from "../middleware/auth.js";
import upload from "../middleware/upload.js";

const product = express.Router();
product.get("/product", GetProduct);
product.get("/product/:id", GetSingleProduct);
product.post("/product", LoginCheck, upload.single('image'), PostProduct);
product.delete("/product/:id", LoginCheck, DeleteProduct);
product.put("/product/:id", LoginCheck, upload.single('image'), UpdateProduct);
export default product;
```
*All product‑related routes are protected (except the public GET list) and support image uploads.*

---
### `models/`
* **user.js** – fields: `name`, `email`, `password` (hashed with bcrypt), `mobile`, `profile` (image path), `role`, etc.
* **product.js** – fields: `title`, `price`, `image`, `catagory` (ref), `discount`, `countInStock`, `brand`, `description`.
* **catagory.js** – simple name field, used for product categorisation.
* **order.js** – order details, user reference, items array, status, timestamps.

---

## 📋 API Endpoints Summary
| Method | Path | Protected? | Description |
|--------|------|------------|-------------|
| `POST` | `/register` | No | Register a new user (name, email, password, mobile). |
| `POST` | `/login` | No | Authenticate and receive JWT. |
| `GET` | `/user` | Yes (JWT) | Return logged‑in user profile. |
| `PUT` | `/user` | Yes (JWT) | Update profile – accepts `multipart/form-data` for image. |
| `GET` | `/product` | No | List products (supports `page`, `limit`, `search`). |
| `GET` | `/product/:id` | No | Get a single product. |
| `POST` | `/product` | Yes (JWT) | Create product – expects image file. |
| `PUT` | `/product/:id` | Yes (JWT) | Update product – optional new image. |
| `DELETE` | `/product/:id` | Yes (JWT) | Delete product. |
| `GET` | `/catagory` | No | List categories. |
| `POST` | `/catagory` | Yes (JWT) | Create category. |
| `PUT` | `/catagory/:id` | Yes (JWT) | Update category. |
| `DELETE` | `/catagory/:id` | Yes (JWT) | Delete category. |
| `GET` | `/order` | Yes (JWT) | List orders for admin. |
| `POST` | `/order` | Yes (JWT) | Create a new order. |
| `PUT` | `/order/:id` | Yes (JWT) | Update order status. |
| `DELETE` | `/order/:id` | Yes (JWT) | Delete order. |

---

## 🚀 Getting Started (Development)
1. **Clone the repo**
   ```bash
   git clone <repo‑url>
   cd Project-1-login-and-product
   ```
2. **Create a `.env` file** (copy from `.env.example` if present):
   ```env
   MONGO_URL=mongodb://localhost:27017/trendquick
   JWT_SECRET=your‑super‑secret
   PORT=8000
   ```
3. **Install dependencies**
   ```bash
   npm install
   ```
4. **Run the server**
   ```bash
   npm run dev   # (or `node server.js`)
   ```
   The API will be available at `http://localhost:8000`.

---

## 🧪 Testing the API
You can use **Postman**, **Insomnia**, or **curl**. Example login request:
```bash
curl -X POST http://localhost:8000/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"secret"}'
```
The response contains a JWT token which must be sent as `Authorization: Bearer <token>` for protected routes.

---

## 📈 Future Enhancements
* **TypeScript** – add static typing for models and controllers.
* **Validation library** – integrate `express-validator` or `joi` for request payload validation.
* **Logging** – replace `console.log` with a structured logger (Winston/Bunyan).
* **Rate limiting** – protect auth endpoints with `express-rate-limit`.
* **Docker** – containerise the API and MongoDB for easier deployment.
* **Unit tests** – Jest + Supertest for controller and route testing.
* **Cloud storage** – move uploaded images to S3 or Cloudinary instead of local `uploads/`.

---

## 👤 Author & License
**Author:** 4bjith (GitHub: https://github.com/4bjith)  
**License:** MIT – feel free to fork, modify, and use commercially.

---

*This README provides a human‑friendly yet thorough guide to the backend API, its architecture, and how each piece works together.*
