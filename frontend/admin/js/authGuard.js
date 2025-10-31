export const checkAdminaccess = ()=>{
    const user = JSON.parse(localStorage.getItem("user"));
    if(!user || user.role !== "admin"){
        alert("Bạn không có quyền truy cập trang này!");
        window.location.href = "../../user/html/login.html";
    }
}
export const checkUseraccess = ()=>{
    const user = JSON.parse(localStorage.getItem("user"));
  if (!user || user.role !== "user") {
    alert("Chỉ người dùng mới có thể vào trang này!");
    window.location.href = "../../user/html/login.html";
  }
}