import { BASE_URL } from "../../admin/js/api.js";

// 🟢 Xử lý form đăng nhập
document.getElementById("loginForm").addEventListener("submit", async (e) => {
  e.preventDefault();

  const username = document.getElementById("username").value.trim();
  const password = document.getElementById("password").value.trim();

  if (!username || !password) {
    alert("Vui lòng nhập đầy đủ tài khoản và mật khẩu!");
    return;
  }

  try {
    const res = await fetch(`${BASE_URL}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password }),
    });

    const data = await res.json();

    if (!res.ok) {
      alert(data.message || "Sai tài khoản hoặc mật khẩu!");
      return;
    }

    // 🟡 Kiểm tra dữ liệu trả về
    if (!data || !data.token || !data.user) {
      alert("Đăng nhập thất bại: Thiếu token hoặc thông tin người dùng!");
      return;
    }

    // 🟢 Lưu token và user
    localStorage.setItem("token", data.token);
    localStorage.setItem("user", JSON.stringify(data.user));

    // 🟢 Điều hướng theo vai trò
    if (data.user.role === "admin") {
      alert("Chào mừng Admin!");
      window.location.href = "/frontend/admin/html/dashboard.html";
    } else {
      alert("Đăng nhập thành công!");
      window.location.href = "/frontend/user/html/home.html";
    }

  } catch (err) {
    console.error("Lỗi đăng nhập:", err);
    alert("Có lỗi xảy ra khi đăng nhập!");
  }
});
