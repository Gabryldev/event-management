const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },

  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
  },

  password: {
    type: String,
    required: true,
    minlength: 6,
    select: false, 
  },

  phone: {
    type: String,
    default: "",
  },

  profileImage: {
    type: String,
    default: "https://ui-avatars.com/api/?background=2563eb&color=fff&name=User",
  },

  role: {
  type: String,
  enum: ["user", "organizer", "admin"],
  default: "user",
},

isVerified: {
  type: Boolean,
  default: false,
},

verificationCode: {
  type: String,
  default: "",
},

verificationCodeExpire: {
  type: Date,
},
  resetPasswordToken: {
    type: String,
  },

  resetPasswordExpire: {
    type: Date,
  },
}, {
  timestamps: true
});
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();

  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);

  next();
});

userSchema.methods.matchPassword = async function (enteredPassword) {
  return bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model("User", userSchema);