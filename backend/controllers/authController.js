const crypto = require("crypto");
const { sendEmail,verificationEmailTemplate,} = require("../utils/email");
const asyncHandler = require("express-async-handler");
const User = require("../models/User");
const generateToken = require("../utils/generateToken");

// ================= REGISTER =================


 // ================= REGISTER =================

const registerUser = asyncHandler(async (req, res) => {
  const { name, email, password, role } = req.body;

  if (!name || !email || !password) {
    res.status(400);
    throw new Error("Please provide name, email and password");
  }

  const userExists = await User.findOne({ email });

  if (userExists) {
    res.status(400);
    throw new Error("A user with this email already exists");
  }

  const allowedRole = ["user", "organizer"].includes(role)
    ? role
    : "user";

  const verificationCode = Math.floor(
    100000 + Math.random() * 900000
  ).toString();

  const user = await User.create({
    name,
    email,
    password,
    role: allowedRole,
    verificationCode,
    verificationCodeExpire: Date.now() + 10 * 60 * 1000,
  });

  await sendEmail({
    to: user.email,
    subject: "Verify Your Email",
    html: verificationEmailTemplate({
      name: user.name,
      code: verificationCode,
    }),
  });

  const responsePayload = {
    success: true,
    message:
      "Verification code sent successfully. Please check your email.",
    email: user.email,
  };

  if (process.env.NODE_ENV !== "production") {
    responsePayload.debug = {
      sentTo: user.email,
      from: process.env.EMAIL_FROM || process.env.EMAIL_USER,
    };
  }

  res.status(201).json(responsePayload);
});
const verifyEmail = asyncHandler(async (req, res) => {
  const { email, code } = req.body;

  if (!email || !code) {
    res.status(400);
    throw new Error("Email and verification code are required");
  }

  const user = await User.findOne({ email }).select("+password");

  if (!user) {
    res.status(404);
    throw new Error("User not found");
  }

  if (user.isVerified) {
    return res.status(200).json({
      success: true,
      message: "Email already verified",
      data: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        token: generateToken(user._id, user.role),
      },
    });
  }

  if (
    user.verificationCode !== code ||
    user.verificationCodeExpire < Date.now()
  ) {
    res.status(400);
    throw new Error("Invalid or expired verification code");
  }

  user.isVerified = true;
  user.verificationCode = undefined;
  user.verificationCodeExpire = undefined;

  await user.save();

  res.status(200).json({
    success: true,
    message: "Email verified successfully",
    data: {
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      token: generateToken(user._id, user.role),
    },
  });
});
  

// ================= LOGIN =================
const loginUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    res.status(400);
    throw new Error("Please provide email and password");
  }

  const user = await User.findOne({ email }).select("+password");

  if (!user || !(await user.matchPassword(password))) {
    res.status(401);
    throw new Error("Invalid email or password");
  }

  if (!user.isVerified) {
    res.status(401);
    throw new Error("Please verify your email before logging in.");
  }

  res.json({
    success: true,
    data: {
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      token: generateToken(user._id, user.role),
    },
  });
});

// ================= UPDATE PROFILE =================

const updateProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);

  if (!user) {
    res.status(404);
    throw new Error("User not found");
  }

  user.name = req.body.name || user.name;
  user.phone = req.body.phone || user.phone;
  user.profileImage =
    req.body.profileImage || user.profileImage;

  if (req.body.profilePic) {
    user.profilePic = req.body.profilePic;
  }

  const updatedUser = await user.save();

  res.json({
    success: true,
    data: updatedUser,
  });
});

// ================= FORGOT PASSWORD =================

const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "No user found with that email",
      });
    }

    const resetToken = crypto.randomBytes(32).toString("hex");

    user.resetPasswordToken = crypto
      .createHash("sha256")
      .update(resetToken)
      .digest("hex");

    user.resetPasswordExpire =
      Date.now() + 10 * 60 * 1000;

    await user.save();

    const resetUrl = `${process.env.CLIENT_URL}/reset-password/${resetToken}`;

console.log("Forgot password request received for:", email);

const result = await sendEmail({
  to: user.email,
  subject: "Password Reset",
  html: `
    <h2>Password Reset</h2>

    <p>You requested a password reset.</p>

    <p>
      <a href="${resetUrl}">
        Reset Password
      </a>
    </p>
  `,
});

console.log("sendEmail result:", result);
if (!result.success) {
  console.error("Forgot password email failed for:", email, result.error);
  return res.status(500).json({
    success: false,
    message: "Failed to send reset email. Check email settings.",
    error: result.error,
  });
}

    const responsePayload = {
      success: true,
      message: "Password reset email sent",
    };

    if (process.env.NODE_ENV !== "production") {
      responsePayload.debug = {
        messageId: result.info?.messageId,
        response: result.info?.response,
        sentTo: user.email,
      };
    }

    res.json(responsePayload);
  } catch (err) {
    console.log(err);

    res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};

// ================= RESET PASSWORD =================

const resetPassword = async (req, res) => {
  try {
    const resetPasswordToken = crypto
      .createHash("sha256")
      .update(req.params.token)
      .digest("hex");

    const user = await User.findOne({
      resetPasswordToken,
      resetPasswordExpire: {
        $gt: Date.now(),
      },
    }).select("+password");

    if (!user) {
      return res.status(400).json({
        success: false,
        message: "Invalid or expired reset token",
      });
    }

    user.password = req.body.password;

    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;

    await user.save();

    res.json({
      success: true,
      message: "Password reset successful",
    });
  } catch (err) {
    console.log(err);

    res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};

// ================= GET CURRENT USER =================

const getMe = asyncHandler(async (req, res) => {
  res.json({
    success: true,
    data: req.user,
  });
});

module.exports = {
  registerUser,
  verifyEmail,
  loginUser,
  getMe,
  updateProfile,
  forgotPassword,
  resetPassword,
};