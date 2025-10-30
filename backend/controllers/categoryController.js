const Category = require('../models/category');
const Product = require('../models/product');

// 🟢 Tạo mới category (Admin)
exports.createCategory = async (req, res) => {
  try {
    const { categoryId, name, description } = req.body;

    // Kiểm tra trùng ID
    const existing = await Category.findOne({ categoryId });
    if (existing) {
      return res.status(400).json({ message: "categoryId đã tồn tại!" });
    }

    const category = new Category({ categoryId, name, description });
    await category.save();

    res.status(201).json({ message: 'Thêm danh mục thành công', category });
  } catch (error) {
    res.status(500).json({ message: 'Lỗi khi thêm danh mục', error });
  }
};

// 🔵 Lấy tất cả danh mục (không lấy danh mục đã xóa) kèm products
exports.getAllCategories = async (req, res) => {
  try {
    const categories = await Category.find({ isDeleted: false });

    // Thêm mảng products cho mỗi category
    const categoriesWithProducts = await Promise.all(
      categories.map(async (cat) => {
        const products = await Product.find({ categoryId: cat.categoryId, isDeleted: false });
        return { ...cat._doc, products };
      })
    );

    res.json(categoriesWithProducts);
  } catch (error) {
    res.status(500).json({ message: 'Lỗi khi lấy danh sách danh mục', error });
  }
};

// 🟠 Lấy danh mục theo categoryId kèm products
exports.getCategoryById = async (req, res) => {
  try {
    const { id } = req.params;
    const category = await Category.findOne({ categoryId: id, isDeleted: false });
    if (!category) return res.status(404).json({ message: 'Không tìm thấy danh mục' });

    const products = await Product.find({ categoryId: category.categoryId, isDeleted: false });
    res.json({ ...category._doc, products });
  } catch (error) {
    res.status(500).json({ message: 'Lỗi khi lấy danh mục', error });
  }
};

// 🟡 Cập nhật danh mục (Admin)
exports.updateCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description } = req.body;

    const updated = await Category.findOneAndUpdate(
      { categoryId: id },
      { name, description },
      { new: true }
    );

    if (!updated) return res.status(404).json({ message: 'Không tìm thấy danh mục để cập nhật' });
    res.json({ message: 'Cập nhật danh mục thành công', category: updated });
  } catch (error) {
    res.status(500).json({ message: 'Lỗi khi cập nhật danh mục', error });
  }
};

// 🔴 Xóa mềm danh mục (Admin)
exports.softDeleteCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await Category.findOneAndUpdate(
      { categoryId: id },
      { isDeleted: true },
      { new: true }
    );

    if (!deleted) return res.status(404).json({ message: 'Không tìm thấy danh mục' });
    res.json({ message: 'Xóa danh mục thành công (soft delete)', category: deleted });
  } catch (error) {
    res.status(500).json({ message: 'Lỗi khi xóa danh mục', error });
  }
};

// 🟢 Khôi phục danh mục (Admin)
exports.restoreCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const restored = await Category.findOneAndUpdate(
      { categoryId: id },
      { isDeleted: false },
      { new: true }
    );

    if (!restored) return res.status(404).json({ message: 'Không tìm thấy danh mục để khôi phục' });

    // Lấy lại products sau khi khôi phục
    const products = await Product.find({ categoryId: restored.categoryId, isDeleted: false });
    res.json({ message: 'Khôi phục danh mục thành công', category: { ...restored._doc, products } });
  } catch (error) {
    res.status(500).json({ message: 'Lỗi khi khôi phục danh mục', error });
  }
};
