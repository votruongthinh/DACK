const userData = JSON.parse(localStorage.getItem("user"));
const token = localStorage.getItem("token");
const navMenu = document.getElementById("navMenu");

// 🔹 Kiểm tra trạng thái đăng nhập
if (userData) {
  if (userData.role === "admin") {
    window.location.href = "/frontend/admin/html/dashboard.html";
  } else if (userData.role === "user") {
    navMenu.innerHTML = `
      <span>Xin chào, ${userData.username}</span>
      <a href="./cart.html">Giỏ hàng</a>
      <button class="logout-btn" id="logoutBtn">Đăng xuất</button>
    `;
    document
      .getElementById("logoutBtn")
      .addEventListener("click", handleLogout);
  }
}

// 🔹 Đăng xuất
function handleLogout() {
  localStorage.removeItem("token");
  localStorage.removeItem("user");
  alert("Đã đăng xuất!");
  window.location.href = "./home.html";
}

// 🔹 Load danh mục
async function loadCategories() {
  try {
    const res = await fetch("http://localhost:3000/api/categories");
    const categories = await res.json();

    const categoryList = document.getElementById("categoryList");
    categoryList.innerHTML = categories
      .filter((cat) => !cat.isDeleted)
      .map(
        (cat) => `
        <div class="category-card">
          <h4>${cat.name}</h4>
          <p>${cat.description || ""}</p>
          <p>Số sản phẩm: ${cat.products?.length || 0}</p>
        </div>
      `
      )
      .join("");
  } catch (err) {
    console.error("Lỗi tải category:", err);
  }
}

// 🔹 Load sản phẩm
async function loadProducts() {
  try {
    const res = await fetch("http://localhost:3000/api/products");
    const products = await res.json();

    const list = document.getElementById("productList");
    list.innerHTML = products
      .map(
        (p) => `
        <div class="product-card">
          <img src="${p.image || "https://via.placeholder.com/200"}" alt="${p.name}">
          <h3>${p.name}</h3>
          <p>${p.price.toLocaleString()} VND</p>
          <button onclick="handleBuy('${p._id}')">🛒 Mua ngay</button>
        </div>
      `
      )
      .join("");
  } catch (err) {
    console.error("Lỗi tải sản phẩm:", err);
  }
}

// 🔹 Mua ngay
window.handleBuy = function (productId) {
  if (!userData || !token) {
    alert("Vui lòng đăng nhập để mua hàng!");
    window.location.href = "./login.html";
  } else {
    window.location.href = `./cart.html?product=${productId}`;
  }
};

// 🔹 Load đơn hàng user
async function loadUserOrders() {
  const ordersContainer = document.getElementById("userOrders");
  if (!userData || !token) {
    ordersContainer.innerHTML = "<p>Vui lòng đăng nhập để xem đơn hàng.</p>";
    return;
  }

  try {
    const res = await fetch("http://localhost:3000/api/orders", {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });
    const orders = await res.json();

    if (!orders || orders.length === 0) {
      ordersContainer.innerHTML = "<p>Bạn chưa có đơn hàng nào.</p>";
      return;
    }

    ordersContainer.innerHTML = orders
      .map((order) => {
        const products = order.products
          .map((p) => `${p.name} x${p.quantity}`)
          .join(", ");
        return `
          <div class="order-card">
            <p><strong>Order ID:</strong> ${order.orderId}</p>
            <p><strong>Sản phẩm:</strong> ${products}</p>
            <p><strong>Tổng tiền:</strong> ${order.total.toLocaleString()} VND</p>
            <p><strong>Trạng thái:</strong> ${order.status}</p>
            <p><strong>Ngày đặt:</strong> ${new Date(order.createdAt).toLocaleString()}</p>
            <button onclick="deleteOrder('${order.orderId}')">Xóa đơn hàng</button>
          </div>
        `;
      })
      .join("");
  } catch (err) {
    console.error("Lỗi tải đơn hàng:", err);
    ordersContainer.innerHTML = "<p>Lỗi tải đơn hàng.</p>";
  }
}

// 🔹 Xóa mềm đơn hàng
window.deleteOrder = async (orderId) => {
  if (!confirm("Bạn có chắc muốn xóa đơn hàng này?")) return;
  try {
    await fetch(`http://localhost:3000/api/orders/${orderId}`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });
    loadUserOrders();
  } catch (err) {
    console.error(err);
  }
};

// 🔹 Khởi chạy
loadCategories();
loadProducts();
loadUserOrders();
