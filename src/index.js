import dotenv from "dotenv";
dotenv.config();
import ConnectDb from "./config/categoryDB.js";
import cors from "cors";
import express from "express";
import cookieParser from "cookie-parser";
import UserRouter from "./router/user.router.js";
const app = express();

const allowedOrigins = new Set(
  [
    "http://localhost:3000",
    "https://nestro-frontend-nmcr.vercel.app",
    process.env.FRONTEND_URL,
    ...(process.env.CORS_ORIGINS || "").split(","),
  ]
    .filter(Boolean)
    .map((origin) => origin.trim().replace(/\/$/, "")),
);

app.use(cookieParser());
app.use(
  cors({
    origin(origin, callback) {
      if (!origin || allowedOrigins.has(origin)) {
        callback(null, true);
        return;
      }

      callback(null, false);
    },
    credentials: true,
  }),
);
app.use(express.json());
app.get("/", (_req, res) => {
  res.status(200).json({ success: true, message: "Authentication API is running." });
});
app.use("/auth", UserRouter);

const port = Number(process.env.PORT) || 5000;

await ConnectDb();
app.listen(port, () => {
  console.log(`Server is listening on port ${port}`);
});
