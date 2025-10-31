import { getData, postData, putData, deleteData } from "./api.js";

const form = document.getElementById("addProductForm");
const tableBody = document.querySelector("#productTable tbody");

// 🟢 Load danh sách sản phẩm
async function loadProducts() {
  try {
    const products = await getData("products");
    tableBody.innerHTML = "";

    products.forEach((p) => {
      const row = document.createElement("tr");
      row.innerHTML = `
        <td>${p.productId}</td>
        <td>${p.name}</td>
        <td>${p.price.toLocaleString()} đ</td>
        <td>${p.categoryId || "Không có"}</td>
        <td><img src="${p.image || "#"}" width="60"></td>
        <td>
          <button class="btn-edit" data-id="${p._id}">Sửa</button>
          <button class="btn-delete" data-id="${p._id}">Xóa</button>
        </td>
      `;
      tableBody.appendChild(row);
    });

    // 🟡 Gán sự kiện xoá
    document.querySelectorAll(".btn-delete").forEach((btn) => {
      btn.addEventListener("click", async () => {
        const id = btn.dataset.id;
        if (confirm("Bạn có chắc muốn xóa sản phẩm này?")) {
          await deleteData("products", id);
          loadProducts();
        }
      });
    });
  } catch (err) {
    console.error("Lỗi khi load sản phẩm:", err);
  }
}

// 🟢 Thêm sản phẩm mới
form.addEventListener("submit", async (e) => {
  e.preventDefault();
  const newProduct = {
    productId: document.getElementById("productId").value,
    name: document.getElementById("name").value,
    price: Number(document.getElementById("price").value),
    categoryId: document.getElementById("categoryId").value,
    image: document.getElementById("image").value,
  };

  try {
    const res = await postData("products", newProduct);
    alert(res.message || "Thêm sản phẩm thành công!");
    form.reset();
    loadProducts();
  } catch (err) {
    console.error("Lỗi khi thêm sản phẩm:", err);
  }
});

// 🟢 Khi tải trang thì gọi API
loadProducts();
