import { BASE_URL } from "../../admin/js/api.js";

document.getElementById("registerForm").addEventListener("submit", async (e) => {
  e.preventDefault();

  const username = document.getElementById("username").value.trim();
  const password = document.getElementById("password").value.trim();
  const confirmPassword = document.getElementById("confirmPassword").value.trim();

  if (!username || !password || !confirmPassword) {
    alert("Vui lòng nhập đầy đủ thông tin!");
    return;
  }

  if (password !== confirmPassword) {
    alert("Mật khẩu không khớp!");
    return;
  }

  try {
    const res = await fetch(`${BASE_URL}/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password })
    });

    const data = await res.json();

    if (!res.ok) {
      alert(data.message || "Đăng ký thất bại!");
      return;
    }

    alert("Đăng ký thành công! Bạn có thể đăng nhập ngay.");
    window.location.href = "/frontend/user/html/login.html";

  } catch (err) {
    console.error("Lỗi đăng ký:", err);
    alert("Có lỗi xảy ra khi đăng ký!");
  }
});
