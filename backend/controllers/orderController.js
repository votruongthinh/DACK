const Order = require("../models/order");

// 🛒 Tạo đơn hàng mới
exports.createOrder = async (req, res) => {
  try {
    const { products, total } = req.body;

    if (!products || products.length === 0) {
      return res.status(400).json({ message: "Danh sách sản phẩm không được để trống" });
    }

    const newOrder = new Order({
      userId: req.user.id,
      products,
      total,
    });

    await newOrder.save();
    res.status(201).json({ message: "Tạo đơn hàng thành công", order: newOrder });
  } catch (error) {
    res.status(500).json({ message: "Lỗi khi tạo đơn hàng", error });
  }
};

// 📦 Lấy tất cả đơn hàng (admin thấy tất cả, user chỉ thấy của mình)
exports.getAllOrders = async (req, res) => {
  try {
    let orders;
    if (req.user.role === "admin") {
      orders = await Order.find({ isDeleted: false }).populate("userId", "username role");
    } else {
      orders = await Order.find({ userId: req.user.id, isDeleted: false });
    }
    res.status(200).json(orders);
  } catch (error) {
    res.status(500).json({ message: "Lỗi khi lấy danh sách đơn hàng", error });
  }
};

// 🔍 Lấy đơn hàng theo ID
exports.getOrderById = async (req, res) => {
  try {
    const order = await Order.findOne({ _id: req.params.id, isDeleted: false }).populate("userId", "username role");
    if (!order) return res.status(404).json({ message: "Không tìm thấy đơn hàng" });

    // user chỉ được xem đơn hàng của mình
    if (req.user.role !== "admin" && order.userId._id.toString() !== req.user.id) {
      return res.status(403).json({ message: "Bạn không có quyền xem đơn hàng này" });
    }

    res.status(200).json(order);
  } catch (error) {
    res.status(500).json({ message: "Lỗi khi lấy đơn hàng", error });
  }
};

// 🔄 Cập nhật trạng thái đơn hàng (chỉ admin)
exports.updateOrderStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const order = await Order.findByIdAndUpdate(req.params.id, { status }, { new: true });

    if (!order) return res.status(404).json({ message: "Không tìm thấy đơn hàng" });

    res.status(200).json({ message: "Cập nhật trạng thái thành công", order });
  } catch (error) {
    res.status(500).json({ message: "Lỗi khi cập nhật trạng thái", error });
  }
};

// 🗑️ Xóa mềm đơn hàng
exports.softDeleteOrder = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ message: "Không tìm thấy đơn hàng" });

    // chỉ admin hoặc người đặt hàng mới được xóa
    if (req.user.role !== "admin" && order.userId.toString() !== req.user.id) {
      return res.status(403).json({ message: "Bạn không có quyền xóa đơn hàng này" });
    }

    order.isDeleted = true;
    await order.save();

    res.status(200).json({ message: "Đã xóa mềm đơn hàng", order });
  } catch (error) {
    res.status(500).json({ message: "Lỗi khi xóa đơn hàng", error });
  }
};

// 🔁 Khôi phục đơn hàng (chỉ admin)
exports.restoreOrder = async (req, res) => {
  try {
    const order = await Order.findByIdAndUpdate(req.params.id, { isDeleted: false }, { new: true });
    if (!order) return res.status(404).json({ message: "Không tìm thấy đơn hàng để khôi phục" });

    res.status(200).json({ message: "Khôi phục đơn hàng thành công", order });
  } catch (error) {
    res.status(500).json({ message: "Lỗi khi khôi phục đơn hàng", error });
  }
};
