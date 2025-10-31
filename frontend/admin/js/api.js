

export const BASE_URL = "http://localhost:3000/api";

// method GET
export const getData = async (module) => {
  try {
    const token = localStorage.getItem("token");
    const res = await fetch(`${BASE_URL}/${module}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) throw new Error("lỗi khi lấy dữ liệu");
    return await res.json();
  } catch (error) {
    console.log("Getdata error:", error.message);
    throw error;
  }
};

// method POST
export const postData = async (module, data) => {
  try {
    const token = localStorage.getItem("token");
    const res = await fetch(`${BASE_URL}/${module}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(data),
    });
    return await res.json();
  } catch (error) {}
};

// method PUT
export const putData = async (module, id, data) => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${BASE_URL}/${module}/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(data)
      });
      return await res.json();
    } catch (error) {
      console.error('❌ putData error:', error.message);
      throw error;
    }
  };
  
  // 🟢 DELETE
export  const deleteData = async (module, id) => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${BASE_URL}/${module}/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      return await res.json();
    } catch (error) {
      console.error('❌ deleteData error:', error.message);
      throw error;
    }
  };