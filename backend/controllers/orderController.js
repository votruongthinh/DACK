const Order = require("../models/order");
const Auth = require("../models/auth.js");
const Product = require("../models/product");

// 🛒 Tạo đơn hàng mới
exports.createOrder = async (req, res) => {
  try {
    const { orderId, products, total } = req.body;

    if (!products || products.length === 0) {
      return res.status(400).json({ message: "Danh sách sản phẩm không được để trống" });
    }

    // ✅ tạo order mới
    const newOrder = await Order.create({
      orderId: orderId || 'ORD' + Date.now(),
      userId: req.body.userId, // dùng userId String
      products,
      total,
    });

    res.status(201).json({
      message: "Tạo đơn hàng thành công",
      order: newOrder,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Lỗi khi tạo đơn hàng", error: error.message });
  }
};

// 📦 Lấy tất cả đơn hàng
exports.getAllOrders = async (req, res) => {
  try {
    let filter = { isDeleted: false };

    if (req.user.role !== "admin") {
      filter.userId = req.user.userId; // dùng userId String
    }

    const orders = await Order.find(filter);

    // Lấy thông tin user + product thủ công
    const ordersWithDetails = await Promise.all(
      orders.map(async order => {
        const user = await Auth.findOne({ userId: order.userId }, "username role");
        const products = await Product.find({
          productId: { $in: order.products.map(p => p.productId) }
        }, "name price");

        // map quantity vào sản phẩm
        const productsWithQuantity = order.products.map(p => {
          const productInfo = products.find(prod => prod.productId === p.productId);
          return {
            ...productInfo?._doc,
            quantity: p.quantity
          };
        });

        return {
          ...order._doc,
          user,
          products: productsWithQuantity
        };
      })
    );

    res.status(200).json(ordersWithDetails);
  } catch (error) {
    res.status(500).json({ message: "Lỗi khi lấy danh sách đơn hàng", error: error.message });
  }
};

// 🔍 Lấy đơn hàng theo orderId
exports.getOrderById = async (req, res) => {
  try {
    const order = await Order.findOne({ orderId: req.params.id, isDeleted: false });

    if (!order) return res.status(404).json({ message: "Không tìm thấy đơn hàng" });

    if (req.user.role !== "admin" && order.userId !== req.user.userId) {
      return res.status(403).json({ message: "Bạn không có quyền xem đơn hàng này" });
    }

    // Lấy user + products
    const user = await Auth.findOne({ userId: order.userId }, "username role");
    const products = await Product.find({
      productId: { $in: order.products.map(p => p.productId) }
    }, "name price");

    const productsWithQuantity = order.products.map(p => {
      const productInfo = products.find(prod => prod.productId === p.productId);
      return {
        ...productInfo?._doc,
        quantity: p.quantity
      };
    });

    res.status(200).json({
      ...order._doc,
      user,
      products: productsWithQuantity
    });
  } catch (error) {
    res.status(500).json({ message: "Lỗi khi lấy đơn hàng", error: error.message });
  }
};

// 🔄 Cập nhật trạng thái đơn hàng (chỉ admin)
exports.updateOrderStatus = async (req, res) => {
  try {
    if (req.user.role !== "admin") {
      return res.status(403).json({ message: "Chỉ admin mới được cập nhật trạng thái" });
    }

    const { status } = req.body;
    const order = await Order.findOneAndUpdate(
      { orderId: req.params.id },
      { status },
      { new: true }
    );

    if (!order) return res.status(404).json({ message: "Không tìm thấy đơn hàng" });

    res.status(200).json({ message: "Cập nhật trạng thái thành công", order });
  } catch (error) {
    res.status(500).json({ message: "Lỗi khi cập nhật trạng thái", error: error.message });
  }
};

// 🗑️ Xóa mềm đơn hàng
exports.softDeleteOrder = async (req, res) => {
  try {
    const order = await Order.findOne({ orderId: req.params.id });

    if (!order) return res.status(404).json({ message: "Không tìm thấy đơn hàng" });

    if (req.user.role !== "admin" && order.userId !== req.user.userId) {
      return res.status(403).json({ message: "Bạn không có quyền xóa đơn hàng này" });
    }

    order.isDeleted = true;
    await order.save();

    res.status(200).json({ message: "Đã xóa mềm đơn hàng", order });
  } catch (error) {
    res.status(500).json({ message: "Lỗi khi xóa đơn hàng", error: error.message });
  }
};

// 🔁 Khôi phục đơn hàng (chỉ admin)
exports.restoreOrder = async (req, res) => {
  try {
    if (req.user.role !== "admin") {
      return res.status(403).json({ message: "Chỉ admin mới được khôi phục đơn hàng" });
    }

    const order = await Order.findOneAndUpdate(
      { orderId: req.params.id },
      { isDeleted: false },
      { new: true }
    );

    if (!order) return res.status(404).json({ message: "Không tìm thấy đơn hàng để khôi phục" });

    res.status(200).json({ message: "Khôi phục đơn hàng thành công", order });
  } catch (error) {
    res.status(500).json({ message: "Lỗi khi khôi phục đơn hàng", error: error.message });
  }
};
