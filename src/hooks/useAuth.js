import { useEffect, useState } from "react";
import {
  getUserProfile,
  loginUser,
  registerUser,
} from "../services/authService";

export function useAuth() {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem("token") || "");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Kiểm tra token và lấy thông tin người dùng khi component mount
  useEffect(() => {
    const verifyToken = async () => {
      if (token) {
        setLoading(true);
        try {
          const userData = await getUserProfile(token);
          setUser(userData);
          setIsAuthenticated(true);
        } catch (err) {
          console.error("Token verification failed:", err);
          logout(); // Token không hợp lệ, đăng xuất
        } finally {
          setLoading(false);
        }
      }
    };

    verifyToken();
  }, [token]);

  const login = async (username, password) => {
    setLoading(true);
    setError("");
    try {
      const data = await loginUser({ username, password });

      // Lưu token và thông tin người dùng
      localStorage.setItem("token", data.token);
      setToken(data.token);
      setUser(data);
      setIsAuthenticated(true);

      return { success: true };
    } catch (err) {
      setError(err.message);
      return { success: false, message: err.message };
    } finally {
      setLoading(false);
    }
  };

  const register = async (name, username, password, proxyno1UserKey) => {
    setLoading(true);
    setError("");
    try {
      const userData = await registerUser({
        name,
        username,
        password,
        proxyno1UserKey,
      });

      // Đăng ký thành công nhưng tài khoản chưa được kích hoạt
      return {
        success: true,
        message: userData.message,
        needsActivation: true,
      };
    } catch (err) {
      setError(err.message);
      return { success: false, message: err.message };
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem("token");
    setToken("");
    setUser(null);
    setIsAuthenticated(false);
  };

  return {
    user,
    token,
    loading,
    error,
    isAuthenticated,
    login,
    register,
    logout,
  };
}
