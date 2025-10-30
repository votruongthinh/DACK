const Review = require('../models/review');
const Auth = require('../models/auth.js');
const Product = require('../models/product');

// 🟢 Tạo mới review
// 🟢 Tạo mới review
exports.createReview = async (req, res) => {
  try {
    const { productId, rating, comment, userId } = req.body;

    // Kiểm tra dữ liệu
    if (!productId || !userId || !rating) {
      return res.status(400).json({ message: 'productId, userId và rating là bắt buộc' });
    }

    // Tạo review mới
    const review = new Review({ productId, userId, rating, comment });
    await review.save();

    res.status(201).json({ message: 'Thêm review thành công', review });
  } catch (error) {
    res.status(500).json({ message: 'Lỗi khi thêm review', error: error.message });
  }
};


// 🔵 Lấy tất cả review (admin có thể xem tất cả)
exports.getAllReviews = async (req, res) => {
  try {
    const reviews = await Review.find({ isDeleted: false });

    const reviewsWithDetails = await Promise.all(reviews.map(async r => {
      const user = await Auth.findOne({ userId: r.userId }, 'username role');
      const product = await Product.findOne({ productId: r.productId }, 'name price');

      return {
        ...r._doc,
        user,
        product
      };
    }));

    res.status(200).json(reviewsWithDetails);
  } catch (error) {
    res.status(500).json({ message: 'Lỗi khi lấy danh sách review', error: error.message });
  }
};

// 🟠 Lấy review theo product
exports.getReviewsByProduct = async (req, res) => {
  try {
    const { productId } = req.params;
    const reviews = await Review.find({ productId, isDeleted: false });

    const reviewsWithUser = await Promise.all(reviews.map(async r => {
      const user = await Auth.findOne({ userId: r.userId }, 'username role');
      return {
        ...r._doc,
        user
      };
    }));

    res.status(200).json(reviewsWithUser);
  } catch (error) {
    res.status(500).json({ message: 'Lỗi khi lấy review theo sản phẩm', error: error.message });
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

    // chỉ người tạo hoặc admin mới được sửa
    if (review.userId !== req.user.userId && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Không có quyền sửa review này' });
    }

    const updated = await Review.findByIdAndUpdate(
      id,
      { rating: req.body.rating, comment: req.body.comment },
      { new: true }
    );

    res.json({ message: 'Cập nhật review thành công', review: updated });
  } catch (error) {
    res.status(500).json({ message: 'Lỗi khi cập nhật review', error: error.message });
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

    // chỉ người tạo hoặc admin mới được xóa
    if (review.userId !== req.user.userId && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Không có quyền xóa review này' });
    }

    const deleted = await Review.findByIdAndUpdate(id, { isDeleted: true }, { new: true });

    res.json({ message: 'Xóa review thành công (soft delete)', review: deleted });
  } catch (error) {
    res.status(500).json({ message: 'Lỗi khi xóa review', error: error.message });
  }
};
