const Cart = require('../models/cart');
const Product = require('../models/product');

// 🟢 Tạo giỏ hàng mới (nếu user chưa có)
exports.createCart = async (req, res) => {
  try {
    const userId = req.user.id;
    const { products } = req.body; // [{ productId, quantity }]

    // Kiểm tra nếu user đã có giỏ hàng
    let cart = await Cart.findOne({ userId, isDeleted: false });
    if (cart) {
      return res.status(400).json({ message: 'Người dùng đã có giỏ hàng' });
    }

    // Tính tổng tiền
    let total = 0;
    for (const item of products) {
      const product = await Product.findById(item.productId);
      if (product) total += product.price * item.quantity;
    }

    const newCart = new Cart({ userId, products, total });
    await newCart.save();

    res.status(201).json({ message: 'Tạo giỏ hàng thành công', cart: newCart });
  } catch (error) {
    res.status(500).json({ message: 'Lỗi khi tạo giỏ hàng', error });
  }
};

// 🔵 Lấy giỏ hàng của user đang đăng nhập
exports.getMyCart = async (req, res) => {
  try {
    const userId = req.user.id;
    const cart = await Cart.findOne({ userId, isDeleted: false })
      .populate('products.productId', 'name price image');
    if (!cart) return res.status(404).json({ message: 'Không tìm thấy giỏ hàng' });
    res.json(cart);
  } catch (error) {
    res.status(500).json({ message: 'Lỗi khi lấy giỏ hàng', error });
  }
};

// 🟡 Cập nhật giỏ hàng (thêm/sửa/xóa sản phẩm)
exports.updateCart = async (req, res) => {
  try {
    const userId = req.user.id;
    const { products } = req.body; // [{ productId, quantity }]

    let cart = await Cart.findOne({ userId, isDeleted: false });
    if (!cart) return res.status(404).json({ message: 'Không tìm thấy giỏ hàng' });

    // Cập nhật danh sách sản phẩm
    cart.products = products;

    // Tính lại tổng tiền
    let total = 0;
    for (const item of products) {
      const product = await Product.findById(item.productId);
      if (product) total += product.price * item.quantity;
    }
    cart.total = total;

    await cart.save();
    res.json({ message: 'Cập nhật giỏ hàng thành công', cart });
  } catch (error) {
    res.status(500).json({ message: 'Lỗi khi cập nhật giỏ hàng', error });
  }
};

// 🔴 Xóa mềm giỏ hàng
exports.softDeleteCart = async (req, res) => {
  try {
    const userId = req.user.id;
    const cart = await Cart.findOneAndUpdate(
      { userId, isDeleted: false },
      { isDeleted: true },
      { new: true }
    );
    if (!cart) return res.status(404).json({ message: 'Không tìm thấy giỏ hàng để xóa' });
    res.json({ message: 'Xóa giỏ hàng thành công (soft delete)' });
  } catch (error) {
    res.status(500).json({ message: 'Lỗi khi xóa giỏ hàng', error });
  }
};

// 🟢 Khôi phục giỏ hàng (nếu lỡ xóa)
exports.restoreCart = async (req, res) => {
  try {
    const userId = req.user.id;
    const cart = await Cart.findOneAndUpdate(
      { userId, isDeleted: true },
      { isDeleted: false },
      { new: true }
    );
    if (!cart) return res.status(404).json({ message: 'Không tìm thấy giỏ hàng để khôi phục' });
    res.json({ message: 'Khôi phục giỏ hàng thành công', cart });
  } catch (error) {
    res.status(500).json({ message: 'Lỗi khi khôi phục giỏ hàng', error });
  }
};
