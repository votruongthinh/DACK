const Review = require('../models/review');

// 🟢 Tạo mới review
exports.createReview = async (req, res) => {
  try {
    const { productId, rating, comment } = req.body;
    const review = new Review({
      productId,
      userId: req.user.id, // lấy từ middleware xác thực
      rating,
      comment,
    });
    await review.save();
    res.status(201).json({ message: 'Thêm review thành công', review });
  } catch (error) {
    res.status(500).json({ message: 'Lỗi khi thêm review', error });
  }
};

// 🔵 Lấy tất cả review (admin có thể xem tất cả)
exports.getAllReviews = async (req, res) => {
  try {
    const reviews = await Review.find({ isDeleted: false })
      .populate('productId', 'name')
      .populate('userId', 'username');
    res.json(reviews);
  } catch (error) {
    res.status(500).json({ message: 'Lỗi khi lấy danh sách review', error });
  }
};

// 🟠 Lấy review theo product
exports.getReviewsByProduct = async (req, res) => {
  try {
    const { productId } = req.params;
    const reviews = await Review.find({ productId, isDeleted: false })
      .populate('userId', 'username');
    res.json(reviews);
  } catch (error) {
    res.status(500).json({ message: 'Lỗi khi lấy review theo sản phẩm', error });
  }
};

// 🟡 Cập nhật review (chỉ người tạo mới được sửa)
exports.updateReview = async (req, res) => {
  try {
    const { id } = req.params;
    const review = await Review.findById(id);
    if (!review || review.isDeleted) {
      return res.status(404).json({ message: 'Không tìm thấy review' });
    }

    if (review.userId.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Không có quyền sửa review này' });
    }

    const updated = await Review.findByIdAndUpdate(
      id,
      { rating: req.body.rating, comment: req.body.comment },
      { new: true }
    );
    res.json({ message: 'Cập nhật review thành công', review: updated });
  } catch (error) {
    res.status(500).json({ message: 'Lỗi khi cập nhật review', error });
  }
};

// 🔴 Xóa mềm review (chỉ người tạo hoặc admin)
exports.deleteReview = async (req, res) => {
  try {
    const { id } = req.params;
    const review = await Review.findById(id);
    if (!review || review.isDeleted) {
      return res.status(404).json({ message: 'Không tìm thấy review' });
    }

    if (review.userId.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Không có quyền xóa review này' });
    }

    await Review.findByIdAndUpdate(id, { isDeleted: true });
    res.json({ message: 'Xóa review thành công (soft delete)' });
  } catch (error) {
    res.status(500).json({ message: 'Lỗi khi xóa review', error });
  }
};
