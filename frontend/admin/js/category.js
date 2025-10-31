import { getData, postData, putData, deleteData } from './api.js';

const module = 'categories';
const table = document.getElementById('categoryTable');
const form = document.getElementById('categoryForm');

// 🟢 Lấy danh sách category
async function fetchCategories() {
  try {
    const categories = await getData(module);
    console.log("Danh sách category:", categories); // log
    table.innerHTML = '';
    categories.forEach(cat => {
        const row = document.createElement('tr');
        row.innerHTML = `
          <td>${cat.categoryId}</td>
          <td>${cat.name}</td>
          <td>${cat.description || ''}</td>
          <td>
            <button onclick="deleteCategory('${cat.categoryId}')">Xoá</button>
            <button onclick="editCategory('${cat.categoryId}', '${cat.name}', '${cat.description || ''}')">Sửa</button>
          </td>
        `;
        table.appendChild(row);
      });
      
  } catch (error) {
    console.error('Lỗi fetchCategories:', error.message);
  }
}

// 🟢 Thêm category
form.addEventListener('submit', async e => {
  e.preventDefault();
  const categoryId = document.getElementById('categoryId').value;
  const name = document.getElementById('name').value;
  const description = document.getElementById('description').value;

  try {
    await postData(module, { categoryId, name, description });
    form.reset();
    fetchCategories();
  } catch (error) {
    console.error('Lỗi thêm category:', error.message);
  }
});

// 🟢 Xoá category
window.deleteCategory = async (id) => {
  if (!confirm('Bạn có chắc muốn xoá?')) return;
  try {
    await deleteData(module, id);
    fetchCategories();
  } catch (error) {
    console.error('Lỗi xoá category:', error.message);
  }
}

// 🟢 Sửa category (prompt đơn giản)
window.editCategory = async (id, oldName, oldDescription) => {
  const name = prompt('Tên mới:', oldName);
  const description = prompt('Mô tả mới:', oldDescription);
  if (name !== null) {
    try {
      await putData(module, id, { name, description });
      fetchCategories();
    } catch (error) {
      console.error('Lỗi cập nhật category:', error.message);
    }
  }
}

// 🟢 Khởi chạy
fetchCategories();
