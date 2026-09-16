const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
require("dotenv").config();

const User = require("./models/User");

const app = express();

/* ==================================================
   MIDDLEWARE
================================================== */

app.use(
  cors({
    origin: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  }),
);

app.use(express.json());

/* ==================================================
   MONGODB CONNECTION
================================================== */

const MONGO_URI = process.env.MONGO_URI;

if (!MONGO_URI) {
  console.error("❌ MONGO_URI is missing");
} else {
  mongoose
    .connect(MONGO_URI)
    .then(() => {
      console.log("✅ MongoDB connected successfully");
    })
    .catch((error) => {
      console.error("❌ MongoDB connection error:", error.message);
    });
}

/* ==================================================
   JWT
================================================== */

const JWT_SECRET = process.env.JWT_SECRET || "myntra_clone_secret_key";

/* ==================================================
   PRODUCTS
================================================== */

const products = [
  {
    id: "1",
    name: "Men's Casual Shirt",
    price: 799,
    oldPrice: 1499,
    discount: "47% OFF",
    category: "Men",
    image: "https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?w=600",
  },
  {
    id: "2",
    name: "Classic Denim Jacket",
    price: 1299,
    oldPrice: 2499,
    discount: "48% OFF",
    category: "Men",
    image: "https://images.unsplash.com/photo-1551028719-00167b16eac5?w=600",
  },
  {
    id: "3",
    name: "Premium Sneakers",
    price: 1599,
    oldPrice: 2999,
    discount: "47% OFF",
    category: "Shoes",
    image: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600",
  },
  {
    id: "4",
    name: "Casual T-Shirt",
    price: 599,
    oldPrice: 999,
    discount: "40% OFF",
    category: "Men",
    image: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=600",
  },
  {
    id: "5",
    name: "Formal Shirt",
    price: 899,
    oldPrice: 1699,
    discount: "47% OFF",
    category: "Men",
    image: "https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=600",
  },
  {
    id: "6",
    name: "Sports Shoes",
    price: 1899,
    oldPrice: 3499,
    discount: "46% OFF",
    category: "Shoes",
    image: "https://images.unsplash.com/photo-1549298916-b41d501d3772?w=600",
  },
];

/* ==================================================
   CATEGORIES
================================================== */

const categories = [
  {
    id: "1",
    name: "Men",
  },
  {
    id: "2",
    name: "Women",
  },
  {
    id: "3",
    name: "Kids",
  },
  {
    id: "4",
    name: "Shoes",
  },
  {
    id: "5",
    name: "Beauty",
  },
];

/* ==================================================
   TEMPORARY ORDERS
================================================== */

const orders = [];

/* ==================================================
   AUTHENTICATION
================================================== */

/* ================= SIGNUP ================= */

app.post("/api/auth/signup", async (req, res) => {
  try {
    console.log("====================================");
    console.log("📥 SIGNUP REQUEST RECEIVED");

    console.log("Request body:", {
      name: req.body?.name,
      email: req.body?.email,
      password: req.body?.password ? "***" : undefined,
    });

    const { name, email, password } = req.body;

    /* Check required fields */

    if (!name || !email || !password) {
      return res.status(400).json({
        message: "Name, email and password are required",
      });
    }

    /* Validate name */

    if (name.trim().length < 2) {
      return res.status(400).json({
        message: "Name must contain at least 2 characters",
      });
    }

    /* Validate email */

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailRegex.test(email.trim())) {
      return res.status(400).json({
        message: "Please enter a valid email address",
      });
    }

    /* Validate password */

    if (password.length < 6) {
      return res.status(400).json({
        message: "Password must be at least 6 characters",
      });
    }

    const cleanEmail = email.toLowerCase().trim();

    console.log("🔍 Checking existing user...");

    /* Check existing user */

    const existingUser = await User.findOne({
      email: cleanEmail,
    });

    if (existingUser) {
      console.log("⚠️ User already exists:", cleanEmail);

      return res.status(409).json({
        message: "User already exists with this email",
      });
    }

    console.log("🔐 Hashing password...");

    /* Hash password */

    const hashedPassword = await bcrypt.hash(password, 10);

    console.log("👤 Creating user in MongoDB...");

    /* Create user */

    const user = await User.create({
      name: name.trim(),
      email: cleanEmail,
      password: hashedPassword,
    });

    console.log("✅ User created:", user._id.toString());

    /* Create JWT */

    const token = jwt.sign(
      {
        userId: user._id.toString(),
        email: user.email,
      },
      JWT_SECRET,
      {
        expiresIn: "7d",
      },
    );

    console.log("🔑 JWT created");
    console.log("✅ NEW USER REGISTERED:", user.email);
    console.log("====================================");

    return res.status(201).json({
      message: "Account created successfully",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
      },
    });
  } catch (error) {
    console.error("====================================");
    console.error("❌ SIGNUP ERROR");
    console.error("Error name:", error.name);
    console.error("Error message:", error.message);
    console.error("Error code:", error.code);
    console.error("Full error:", error);
    console.error("====================================");

    /* Duplicate email */

    if (error.code === 11000) {
      return res.status(409).json({
        message: "This email is already registered",
      });
    }

    return res.status(500).json({
      message: error.message || "Server error while creating account",
    });
  }
});

/* ================= LOGIN ================= */

app.post("/api/auth/login", async (req, res) => {
  try {
    console.log("📥 LOGIN REQUEST RECEIVED");

    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        message: "Email and password are required",
      });
    }

    const cleanEmail = email.toLowerCase().trim();

    const user = await User.findOne({
      email: cleanEmail,
    });

    if (!user) {
      return res.status(401).json({
        message: "Invalid email or password",
      });
    }

    const passwordMatch = await bcrypt.compare(password, user.password);

    if (!passwordMatch) {
      return res.status(401).json({
        message: "Invalid email or password",
      });
    }

    const token = jwt.sign(
      {
        userId: user._id.toString(),
        email: user.email,
      },
      JWT_SECRET,
      {
        expiresIn: "7d",
      },
    );

    console.log("✅ USER LOGGED IN:", user.email);

    return res.json({
      message: "Login successful",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
      },
    });
  } catch (error) {
    console.error("❌ LOGIN ERROR:", error);

    return res.status(500).json({
      message: error.message || "Server error while logging in",
    });
  }
});

/* ================= AUTH CHECK ================= */

app.get("/api/auth/me", async (req, res) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      return res.status(401).json({
        message: "Authorization token required",
      });
    }

    const token = authHeader.startsWith("Bearer ")
      ? authHeader.substring(7)
      : authHeader;

    const decoded = jwt.verify(token, JWT_SECRET);

    const user = await User.findById(decoded.userId).select("-password");

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    return res.json({
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
      },
    });
  } catch (error) {
    console.error("❌ AUTH CHECK ERROR:", error.message);

    return res.status(401).json({
      message: "Invalid or expired token",
    });
  }
});

/* ==================================================
   PRODUCTS
================================================== */

app.get("/", (req, res) => {
  res.json({
    message: "Myntra Clone API is running 🚀",
  });
});

app.get("/api/products", (req, res) => {
  res.json(products);
});

app.get("/api/products/:id", (req, res) => {
  const product = products.find((item) => item.id === req.params.id);

  if (!product) {
    return res.status(404).json({
      message: "Product not found",
    });
  }

  res.json(product);
});

app.get("/api/categories", (req, res) => {
  res.json(categories);
});

/* ==================================================
   ORDERS
================================================== */

app.post("/api/orders", (req, res) => {
  const { items, address, city, pincode, paymentMethod, totalAmount } =
    req.body;

  if (!address || !city || !pincode) {
    return res.status(400).json({
      message: "Address, city and pincode are required",
    });
  }

  const order = {
    id: Date.now().toString(),

    orderNumber: "MYN" + Math.floor(100000 + Math.random() * 900000),

    items: items || [],

    address,

    city,

    pincode,

    paymentMethod: paymentMethod || "Cash on Delivery",

    totalAmount: Number(totalAmount) || 0,

    status: "Order Confirmed",

    createdAt: new Date().toISOString(),
  };

  orders.push(order);

  console.log("✅ New order created:", order.orderNumber);

  res.status(201).json({
    message: "Order created successfully",
    order,
  });
});

app.get("/api/orders", (req, res) => {
  res.json(orders);
});

app.get("/api/orders/:id", (req, res) => {
  const order = orders.find((item) => item.id === req.params.id);

  if (!order) {
    return res.status(404).json({
      message: "Order not found",
    });
  }

  res.json(order);
});

/* ==================================================
   SERVER
================================================== */

const PORT = process.env.PORT || 5000;

app.listen(PORT, "0.0.0.0", () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
