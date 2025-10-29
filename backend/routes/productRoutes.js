const express = require("express");
const router = express.Router();
const productController = require("../controllers/productController");
const { verifyToken, isAdmin } = require("../middlewares/auth.js");
const upload = require("../middlewares/upload");

// 🔵 Lấy tất cả sản phẩm (ai cũng xem được)
router.get("/", productController.getAllProducts);

// 🔵 Lấy sản phẩm theo ID
router.get("/:id", productController.getProductById);

// 🟢 Thêm sản phẩm (chỉ admin + có upload ảnh)
router.post("/", verifyToken, isAdmin, upload.single("image"), productController.createProduct);

// 🟡 Cập nhật sản phẩm (chỉ admin)
router.put("/:id", verifyToken, isAdmin, upload.single("image"), productController.updateProduct);

// 🔴 Xóa mềm sản phẩm (chỉ admin)
router.delete("/:id", verifyToken, isAdmin, productController.softDeleteProduct);

// 🟠 Khôi phục sản phẩm (chỉ admin)
router.patch("/restore/:id", verifyToken, isAdmin, productController.restoreProduct);

module.exports = router;
