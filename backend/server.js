const express = require("express");
const session = require("express-session");
const dotenv = require("dotenv");
const mongoose = require("mongoose");
const cors = require("cors");
const helmet = require("helmet");
const path = require("path");

dotenv.config();

const authRoutes = require("./routes/auth");
const reminderRoutes = require("./routes/reminder");
const scanRoutes = require("./routes/scan");
const pushRoutes = require("./routes/push");
const startScheduler = require("./jobs/scheduler");

const app = express();

mongoose
  .connect(process.env.MONGO_URI, { dbName: "vit-reminder" })
  .then(() => console.log("Connected to MongoDB"))
  .catch((err) => {
    console.error("MongoDB connection error:", err);
    process.exit(1);
  });

app.use(helmet());
app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true
  })
);
app.use(express.json());

app.use(
  session({
    secret: process.env.SESSION_SECRET || "dev-secret",
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      sameSite: "lax"
    }
  })
);

function requireAuth(req, res, next) {
  if (!req.session.userId) {
    return res.status(401).json({ error: "Not authenticated" });
  }
  next();
}

app.use("/api", authRoutes);
app.use("/api", requireAuth, scanRoutes);
app.use("/api", requireAuth, reminderRoutes);
app.use("/api", requireAuth, pushRoutes);

app.get("/api/health", (req, res) => {
  res.json({ status: "ok" });
});

startScheduler();

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Backend running at http://localhost:${PORT}`);
  console.log(`OAuth login:  http://localhost:${PORT}/api/auth`);
});
