import UserModel from "../model/user.model.js";
import Cryptr from "cryptr";
import { SendOtpMail } from "../utils/nodemailer.js";

import {
  AlreadyExist,
  BadRequest,
  Created,
  InternalServerError,
  NotFound,
  Unauthorized,
} from "../utils/response.js";
import { generateToken } from "../utils/helper.js";

const getAuthCookieOptions = () => ({
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax",
  path: "/",
});

const SignUp = async (req, res) => {
  try {
    const cryptr = new Cryptr(process.env.CRYPTR_SECRET);

    const { name, email, password, role = "customer" } = req.body;

    if (!name || !email || !password) {
      return BadRequest(res, "All fields are required");
    }

    if (!["customer", "manager", "admin"].includes(role)) {
      return BadRequest(res, "Invalid role");
    }

    const normalizedEmail = email.trim().toLowerCase();
    const user = await UserModel.findOne({ email: normalizedEmail });

    if (user) {
      return AlreadyExist(res, "Email already exists");
    }

    const encryptedPass = cryptr.encrypt(password);

    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    const otpExpire = Date.now() + 10 * 60 * 1000;

    const mailSent = await SendOtpMail(normalizedEmail, otp);

    if (!mailSent) {
      return InternalServerError(res, "OTP mail not sent");
    }

    await UserModel.create({
      name,
      email: normalizedEmail,
      password: encryptedPass,
      role,
      otp,
      otpExpire,
    });

    return Created(res, "Registration successful. Please verify OTP.");
  } catch (error) {
    console.log(error);

    return InternalServerError(res, "Internal Server Error", error);
  }
};
//verify otp
const VerifyOTP = async (req, res) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return BadRequest(res, "Email and OTP are required");
    }

    const user = await UserModel.findOne({ email });

    if (!user) {
      return NotFound(res, "User not found");
    }

    if (user.otp !== otp) {
      return BadRequest(res, "Invalid OTP");
    }

    if (user.otpExpire < Date.now()) {
      return BadRequest(res, "OTP expired");
    }

    user.isVerified = true;
    user.otp = undefined;
    user.otpExpire = undefined;

    await user.save();

    return Created(res, "OTP verified successfully");
  } catch (error) {
    return InternalServerError(res, "Internal Server Error", error);
  }
};

//login
const Login = async (req, res) => {
  try {
    const cryptr = new Cryptr(process.env.CRYPTR_SECRET);

    const { email, password } = req.body;

    if (!email || !password) {
      return BadRequest(res, "Email and password are required");
    }

    const normalizedEmail = email.trim().toLowerCase();

    const account = await UserModel.findOne({
      email: normalizedEmail,
    });

    // Account not found
    if (!account) {
      return Unauthorized(res, "Invalid email or password");
    }

    if (!account.isVerified) {
      return Unauthorized(res, "Please verify your email first");
    }

    // Verify password
    const decryptPass = cryptr.decrypt(account.password);

    if (decryptPass !== password) {
      return Unauthorized(res, "Invalid email or password");
    }

    // Generate token using the database role
    const token = generateToken(account, account.role);

    res.cookie("jwt", token, {
      ...getAuthCookieOptions(),
      maxAge: 30 * 24 * 60 * 60 * 1000,
    });

    return Created(res, "Login successful", {
      id: account._id,
      name: account.name,
      email: account.email,
      role: account.role,
    });
  } catch (error) {
    console.log(error);
    return InternalServerError(res, "Internal Server Error", error);
  }
};

const adminLogin = async (req, res) => {
  try {
    const cryptr = new Cryptr(process.env.CRYPTR_SECRET);
    const { email, password } = req.body;

    if (!email || !password) {
      return BadRequest(res, "Email and password are required");
    }

    const user = await UserModel.findOne({ email: email.trim().toLowerCase() });

    if (!user) {
      return NotFound(res, "User not found");
    }

    if (user.role !== "admin") {
      return Unauthorized(res, "Only Admin can login");
    }

    const decryptPass = cryptr.decrypt(user.password);

    if (decryptPass !== password) {
      return Unauthorized(res, "Invalid email or password");
    }

    const token = generateToken(user);

    res.cookie("jwt", token, {
      ...getAuthCookieOptions(),
      maxAge: 30 * 24 * 60 * 60 * 1000,
    });

    return Created(res, "Admin Login successful");
  } catch (error) {
    return InternalServerError(res, "Internal Server Error", error);
  }
};

const deletebyId = async (req, res) => {
  try {
    const { id } = req.params;

    const user = await UserModel.findById(id);

    if (!user) {
      return NotFound(res, "User not found");
    }

    await UserModel.findByIdAndDelete(id);

    return Created(res, "User deleted successfully");
  } catch (error) {
    return InternalServerError(res, "Internal Server Error", error);
  }
};

const GetProfile = async (req, res) => {
  try {
    const user = req.user;
    if (!user) {
      return res.status(401).json({
        message: "Unauthorized",
        success: false,
        user: null,
      });
    }

    if (user.role !== "user") {
      return res.status(403).json({
        message: "Access Denied",
        success: false,
        user: null,
      });
    }

    return res.status(200).json({
      message: "Data fetched successfully",
      success: true,
      user,
    });
  } catch (error) {
    console.log(error);
    return InternalServerError(res, "Internal Server Error", error);
  }
};

const Logout = async (req, res) => {
  try {
    res.clearCookie("jwt", getAuthCookieOptions());

    return res.status(200).json({
      success: true,
      message: "Logout successful",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const GetCurrentUser = async (req, res) => {
  try {
    const user = req.user;

    if (!user) {
      return NotFound(res, "User not found");
    }

    const safeUser = user.toObject ? user.toObject() : user;
    delete safeUser.password;
    delete safeUser.otp;
    delete safeUser.otpExpire;

    return res.status(200).json({
      success: true,
      user: safeUser,
    });
  } catch (error) {
    console.error("Get Current User Error:", error);
    return InternalServerError(res, "Internal Server Error", error);
  }
};

const userLogout = async (req, res) => {
  try {
    res.clearCookie("jwt", getAuthCookieOptions());

    return res.status(200).json({
      success: true,
      message: "Logout successful",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export {
  SignUp,
  VerifyOTP,
  Login,
  adminLogin,
  Logout,
  GetProfile,
  deletebyId,
  GetCurrentUser,
  userLogout,
};
