const Product = require("../models/product");
const Category = require("../models/category");

// 📦 [GET] /api/products - Lấy tất cả sản phẩm (chưa bị xóa)
exports.getAllProducts = async (req, res) => {
  try {
    const products = await Product.find({ isDeleted: false });

    // Thêm categoryName cho mỗi sản phẩm
    const productsWithCategory = await Promise.all(
      products.map(async (p) => {
        const category = await Category.findOne({ categoryId: p.categoryId });
        return { ...p._doc, categoryName: category ? category.name : null };
      })
    );

    res.status(200).json(productsWithCategory);
  } catch (error) {
    res.status(500).json({ message: "Lỗi khi lấy danh sách sản phẩm", error: error.message });
  }
};

// 🔍 [GET] /api/products/:id - Lấy chi tiết sản phẩm theo productId
exports.getProductById = async (req, res) => {
  try {
    const product = await Product.findOne({ productId: req.params.id, isDeleted: false });
    if (!product) return res.status(404).json({ message: "Không tìm thấy sản phẩm" });

    const category = await Category.findOne({ categoryId: product.categoryId });
    res.status(200).json({ ...product._doc, categoryName: category ? category.name : null });
  } catch (error) {
    res.status(500).json({ message: "Lỗi khi lấy sản phẩm", error: error.message });
  }
};

// ➕ [POST] /api/products - Tạo mới sản phẩm
exports.createProduct = async (req, res) => {
  try {
    const { productId, name, price, categoryId } = req.body;

    // Kiểm tra trùng ID
    const existing = await Product.findOne({ productId });
    if (existing) return res.status(400).json({ message: "Mã sản phẩm đã tồn tại" });

    // Lấy ảnh nếu có upload
    let imagePath = "";
    if (req.file) imagePath = req.file.filename;

    const newProduct = new Product({
      productId,
      name,
      price,
      categoryId,
      image: imagePath,
    });

    await newProduct.save();

    res.status(201).json({
      message: "Tạo sản phẩm thành công",
      product: newProduct,
    });
  } catch (error) {
    res.status(500).json({ message: "Lỗi khi tạo sản phẩm", error: error.message });
  }
};

// ✏️ [PUT] /api/products/:id - Cập nhật sản phẩm theo productId
exports.updateProduct = async (req, res) => {
  try {
    const { name, price, categoryId } = req.body;

    let updateData = { name, price, categoryId };
    if (req.file) updateData.image = req.file.filename;

    const product = await Product.findOneAndUpdate(
      { productId: req.params.id },
      updateData,
      { new: true }
    );

    if (!product) return res.status(404).json({ message: "Không tìm thấy sản phẩm để cập nhật" });
    res.status(200).json({ message: "Cập nhật sản phẩm thành công", product });
  } catch (error) {
    res.status(500).json({ message: "Lỗi khi cập nhật sản phẩm", error: error.message });
  }
};

// 🗑️ [DELETE] /api/products/:id - Xóa mềm sản phẩm
exports.softDeleteProduct = async (req, res) => {
  try {
    const product = await Product.findOneAndUpdate(
      { productId: req.params.id },
      { isDeleted: true },
      { new: true }
    );

    if (!product) return res.status(404).json({ message: "Không tìm thấy sản phẩm để xóa" });
    res.status(200).json({ message: "Xóa mềm sản phẩm thành công", product });
  } catch (error) {
    res.status(500).json({ message: "Lỗi khi xóa sản phẩm", error: error.message });
  }
};

// 🔁 [PATCH] /api/products/restore/:id - Khôi phục sản phẩm
exports.restoreProduct = async (req, res) => {
  try {
    const product = await Product.findOneAndUpdate(
      { productId: req.params.id },
      { isDeleted: false },
      { new: true }
    );

    if (!product) return res.status(404).json({ message: "Không tìm thấy sản phẩm để khôi phục" });
    res.status(200).json({ message: "Khôi phục sản phẩm thành công", product });
  } catch (error) {
    res.status(500).json({ message: "Lỗi khi khôi phục sản phẩm", error: error.message });
  }
};
