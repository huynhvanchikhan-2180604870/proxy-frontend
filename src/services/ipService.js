import axios from "axios";

const IP_API_BASE_URL = "http://localhost:5000";

const createApiWithAuth = (token) => {
  const api = axios.create({
    baseURL: IP_API_BASE_URL,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });

  return api;
};

// Kiểm tra xem IP đã tồn tại trong CSDL hay chưa
export const checkIpInDatabase = async (ip, token) => {
  try {
    if (!token) {
      throw new Error("Token không được cung cấp");
    }

    const api = createApiWithAuth(token);
    const response = await api.get(`/api/ip/check/${ip}`);
    return response.data;
  } catch (error) {
    console.error("Error checking IP in database:", error);
    const errorMessage =
      error.response?.data?.message ||
      error.message ||
      "Không thể kiểm tra IP trong CSDL";
    throw new Error(errorMessage);
  }
};

// Thêm IP vào CSDL
export const addIpToDatabase = async (ip, token) => {
  try {
    if (!token) {
      throw new Error("Token không được cung cấp");
    }

    const api = createApiWithAuth(token);
    const response = await api.get(`/api/ip/add/${ip}`);
    return response.data;
  } catch (error) {
    console.error("Error adding IP to database:", error);
    const errorMessage =
      error.response?.data?.message ||
      error.message ||
      "Không thể thêm IP vào CSDL";
    throw new Error(errorMessage);
  }
};
