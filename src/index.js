import dotenv from "dotenv";
dotenv.config();
import ConnectDb from "./config/categoryDB.js";
import cors from "cors";
import express from "express";
import cookieParser from "cookie-parser";
import UserRouter from "./router/user.router.js";
const app = express();
app.use(cookieParser());
app.use(cors({ origin: "http://localhost:3000", credentials: true }));
app.use(express.json());
app.use("/auth", UserRouter);
// Listen
app.listen(process.env.PORT, () => {
  ConnectDb();
  console.log(`Server is listening ${process.env.PORT}`);
});
