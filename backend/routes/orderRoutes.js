const express = require("express");
const router = express.Router();
const orderController = require("../controllers/orderController");
const { verifyToken, isAdmin } = require("../middlewares/auth.js");

// 🛒 User tạo đơn hàng
router.post("/", verifyToken, orderController.createOrder);

// 📦 Lấy tất cả đơn hàng (user: của mình, admin: tất cả)
router.get("/", verifyToken, orderController.getAllOrders);

// 🔍 Lấy đơn hàng theo ID
router.get("/:id", verifyToken, orderController.getOrderById);

// 🔄 Cập nhật trạng thái đơn hàng (admin)
router.patch("/status/:id", verifyToken, isAdmin, orderController.updateOrderStatus);

// 🗑️ Xóa mềm đơn hàng
router.delete("/:id", verifyToken, orderController.softDeleteOrder);

// 🔁 Khôi phục đơn hàng (admin)
router.patch("/restore/:id", verifyToken, isAdmin, orderController.restoreOrder);

module.exports = router;
