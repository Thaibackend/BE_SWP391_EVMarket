const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const JWT_SECRET = process.env.JWT_SECRET || "evmarketsecretkey12345";

class AuthService {
  async register({ name, email, phone, password }) {
    const existingUser = await User.findOne({ email });
    if (existingUser) throw new Error("Email already exists");

    const hashPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      name,
      email,
      phone,
      password: hashPassword,
    });

    return user;
  }

  async login({ email, password }) {
    const user = await User.findOne({ email });
    if (!user) throw new Error("Invalid email or password");

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) throw new Error("Invalid email or password");

    const token = jwt.sign({ id: user._id, role: user.role }, JWT_SECRET, {
      expiresIn: "7d",
    });

    return { user, token };
  }
}

module.exports = new AuthService();
