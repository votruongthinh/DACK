const express = require('express');
const router = express.Router();
const cartController = require('../controllers/cartController');
const { verifyToken } = require('../middlewares/auth.js');

// 🟢 Tạo giỏ hàng mới (người dùng)
router.post('/', verifyToken, cartController.createCart);

// 🔵 Xem giỏ hàng của user hiện tại
router.get('/my', verifyToken, cartController.getMyCart);

// 🟡 Cập nhật giỏ hàng
router.put('/', verifyToken, cartController.updateCart);

// 🔴 Xóa mềm giỏ hàng
router.delete('/', verifyToken, cartController.softDeleteCart);

// 🟢 Khôi phục giỏ hàng
router.patch('/restore', verifyToken, cartController.restoreCart);

module.exports = router;
