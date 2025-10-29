const express = require('express');
const router = express.Router();
const reviewController = require('../controllers/reviewController');
const { verifyToken, isAdmin } = require('../middlewares/auth.js');

// 🟢 Tạo mới review
router.post('/', verifyToken, reviewController.createReview);

// 🔵 Lấy tất cả review (admin)
router.get('/', verifyToken, isAdmin, reviewController.getAllReviews);

// 🟠 Lấy review theo product
router.get('/product/:productId', reviewController.getReviewsByProduct);

// 🟡 Cập nhật review
router.put('/:id', verifyToken, reviewController.updateReview);

// 🔴 Xóa mềm review
router.delete('/:id', verifyToken, reviewController.deleteReview);

module.exports = router;
