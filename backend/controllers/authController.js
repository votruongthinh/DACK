const Auth = require("../models/auth.js");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

// 🔑 Đăng ký
exports.register = async (req, res) => {
  try {
    const { username, password, role } = req.body;

    const existingUser = await Auth.findOne({ username });
    if (existingUser) return res.status(400).json({ message: "Tài khoản đã tồn tại" });

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new Auth({ username, password: hashedPassword, role });
    await newUser.save();

    res.status(201).json({ message: "Đăng ký thành công", user: newUser });
  } catch (error) {
    res.status(500).json({ message: "Lỗi khi đăng ký", error });
  }
};

// 🔐 Đăng nhập
exports.login = async (req, res) => {
  try {
    const { username, password } = req.body;
    const user = await Auth.findOne({ username, isDeleted: false });

    if (!user) return res.status(404).json({ message: "Không tìm thấy tài khoản" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: "Sai mật khẩu" });

    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET || "secretkey",
      { expiresIn: "1d" }
    );

    res.status(200).json({ message: "Đăng nhập thành công", token });
  } catch (error) {
    res.status(500).json({ message: "Lỗi khi đăng nhập", error });
  }
};

// 👥 Lấy danh sách user (chỉ admin)
exports.getAllUsers = async (req, res) => {
  try {
    if (req.user.role !== "admin") {
      return res.status(403).json({ message: "Chỉ admin mới được xem danh sách user" });
    }

    const users = await Auth.find({ isDeleted: false }).select("-password");
    res.status(200).json(users);
  } catch (error) {
    res.status(500).json({ message: "Lỗi khi lấy danh sách người dùng", error });
  }
};

// 👤 Lấy thông tin user theo ID (user hoặc admin)
exports.getUserById = async (req, res) => {
  try {
    const { id } = req.params;

    // chỉ cho phép xem chính mình hoặc admin
    if (req.user.role !== "admin" && req.user.id !== id) {
      return res.status(403).json({ message: "Bạn không có quyền xem thông tin người khác" });
    }

    const user = await Auth.findOne({ _id: id, isDeleted: false }).select("-password");
    if (!user) return res.status(404).json({ message: "Không tìm thấy người dùng" });

    res.status(200).json(user);
  } catch (error) {
    res.status(500).json({ message: "Lỗi khi lấy thông tin người dùng", error });
  }
};

// ✏️ Cập nhật thông tin user (user hoặc admin, không được đổi role)
exports.updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { username, password } = req.body;

    // chỉ chính chủ hoặc admin được sửa
    if (req.user.role !== "admin" && req.user.id !== id) {
      return res.status(403).json({ message: "Bạn không có quyền cập nhật người khác" });
    }

    const updateData = {};
    if (username) updateData.username = username;
    if (password) {
      const hashedPassword = await bcrypt.hash(password, 10);
      updateData.password = hashedPassword;
    }

    const updatedUser = await Auth.findByIdAndUpdate(id, updateData, { new: true }).select("-password");
    if (!updatedUser) return res.status(404).json({ message: "Không tìm thấy user để cập nhật" });

    res.status(200).json({ message: "Cập nhật thông tin thành công", user: updatedUser });
  } catch (error) {
    res.status(500).json({ message: "Lỗi khi cập nhật user", error });
  }
};

// 🗑️ Xóa mềm user (chỉ admin)
exports.softDeleteUser = async (req, res) => {
  try {
    if (req.user.role !== "admin") {
      return res.status(403).json({ message: "Chỉ admin mới được xóa user" });
    }

    const user = await Auth.findByIdAndUpdate(req.params.id, { isDeleted: true }, { new: true });
    if (!user) return res.status(404).json({ message: "Không tìm thấy user để xóa" });

    res.status(200).json({ message: "Đã xóa mềm user", user });
  } catch (error) {
    res.status(500).json({ message: "Lỗi khi xóa user", error });
  }
};

// 🔁 Khôi phục user (chỉ admin)
exports.restoreUser = async (req, res) => {
  try {
    if (req.user.role !== "admin") {
      return res.status(403).json({ message: "Chỉ admin mới được khôi phục user" });
    }

    const user = await Auth.findByIdAndUpdate(req.params.id, { isDeleted: false }, { new: true });
    if (!user) return res.status(404).json({ message: "Không tìm thấy user để khôi phục" });

    res.status(200).json({ message: "Khôi phục user thành công", user });
  } catch (error) {
    res.status(500).json({ message: "Lỗi khi khôi phục user", error });
  }
};
