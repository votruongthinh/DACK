const userData = JSON.parse(localStorage.getItem("user"));
const token = localStorage.getItem("token");
const orderTable = document.getElementById("orderTable");

if (!userData || !token) {
  alert("Vui lòng đăng nhập!");
  window.location.href = "./login.html";
}

const headers = { 
  "Content-Type": "application/json",
  "Authorization": `Bearer ${token}`
};

// 🔹 Lấy danh sách đơn hàng
async function loadOrders() {
  try {
    const res = await fetch("http://localhost:3000/api/orders", { headers });
    const orders = await res.json();

    orderTable.innerHTML = orders.map(order => {
      const products = order.products.map(p => `${p.name} x${p.quantity}`).join(", ");
      const userName = order.user?.username || "Ẩn danh";
      
      let actions = "";

      // User chỉ xóa đơn của mình
      if (userData.role === "user") {
        actions = !order.isDeleted 
          ? `<button class="delete-btn" onclick="deleteOrder('${order.orderId}')">Xóa</button>` 
          : "";
      }

      // Admin có thêm restore & update status
      if (userData.role === "admin") {
        actions = `
          ${!order.isDeleted ? `<button class="delete-btn" onclick="deleteOrder('${order.orderId}')">Xóa</button>` 
            : `<button class="restore-btn" onclick="restoreOrder('${order.orderId}')">Khôi phục</button>`}
          <button class="status-btn" onclick="updateStatus('${order.orderId}')">Cập nhật trạng thái</button>
        `;
      }

      return `
        <tr>
          <td>${order.orderId}</td>
          <td>${userName}</td>
          <td>${products}</td>
          <td>${order.total.toLocaleString()} VND</td>
          <td>${order.status}</td>
          <td>${new Date(order.createdAt).toLocaleString()}</td>
          <td>${actions}</td>
        </tr>
      `;
    }).join("");
  } catch (err) {
    console.error("Lỗi tải đơn hàng:", err);
  }
}

// 🔄 Xóa mềm đơn hàng
window.deleteOrder = async (orderId) => {
  if (!confirm("Bạn có chắc muốn xóa đơn hàng này?")) return;
  try {
    await fetch(`http://localhost:3000/api/orders/${orderId}`, {
      method: "DELETE",
      headers
    });
    loadOrders();
  } catch (err) {
    console.error(err);
  }
};

// 🔁 Khôi phục đơn hàng (admin)
window.restoreOrder = async (orderId) => {
  if (!confirm("Bạn muốn khôi phục đơn hàng này?")) return;
  try {
    await fetch(`http://localhost:3000/api/orders/restore/${orderId}`, {
      method: "PATCH",
      headers
    });
    loadOrders();
  } catch (err) {
    console.error(err);
  }
};

// 🔧 Cập nhật trạng thái (admin)
window.updateStatus = async (orderId) => {
  const status = prompt("Nhập trạng thái mới (pending, shipped, delivered):");
  if (!status) return;
  try {
    await fetch(`http://localhost:3000/api/orders/status/${orderId}`, {
      method: "PATCH",
      headers,
      body: JSON.stringify({ status })
    });
    loadOrders();
  } catch (err) {
    console.error(err);
  }
};

// 🔹 Khởi chạy
loadOrders();
