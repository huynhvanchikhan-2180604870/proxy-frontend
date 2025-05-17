// filepath: c:\Users\huynh\OneDrive\Máy tính\RollProxy\app\src\hooks\useProxyManagement.js
import { useEffect, useState } from "react";
import { checkIpAddress, rotateProxyIp } from "../services/proxyService";
import { formatProxy } from "../utils/proxyFormatter";
import { useLocalStorage } from "./useLocalStorage";

export function useProxyManagement() {
  const [proxyString, setProxyString] = useLocalStorage("proxyString", "");
  const [apiKey, setApiKey] = useLocalStorage("apiKey", "");
  const [proxyIPs, setProxyIPs] = useLocalStorage("proxyIPs", []);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  // Xóa thông báo sau một khoảng thời gian
  useEffect(() => {
    if (error || message) {
      const timer = setTimeout(() => {
        setError("");
        setMessage("");
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [error, message]);

  const checkIp = async () => {
    if (!proxyString) {
      setError("Vui lòng nhập thông tin proxy.");
      return;
    }

    try {
      setLoading(true);
      setError("");

      const formattedProxy = formatProxy(proxyString);
      const result = await checkIpAddress(formattedProxy);

      if (result.ip) {
        // Thêm vào đầu mảng
        const newEntry = {
          proxy: proxyString,
          ip: result.ip,
          timestamp: new Date().toISOString(),
        };

        setProxyIPs((prev) => [newEntry, ...prev]);
        setMessage(`Đã lấy thành công IP: ${result.ip}`);
        return result.ip;
      } else {
        setError("Không thể lấy được địa chỉ IP.");
        return null;
      }
    } catch (err) {
      setError(err.message || "Lỗi khi kiểm tra địa chỉ IP.");
      return null;
    } finally {
      setLoading(false);
    }
  };

  const rotateIp = async () => {
    if (!apiKey) {
      setError("Vui lòng nhập API key.");
      return false;
    }

    try {
      setLoading(true);
      setError("");

      const result = await rotateProxyIp(apiKey);

      if (result.status === 0) {
        setMessage(result.message);
        return true;
      } else {
        setError(result.message || "Đã xảy ra lỗi không xác định.");
        return false;
      }
    } catch (err) {
      setError(err.message || "Lỗi khi đổi địa chỉ IP.");
      return false;
    }
  };

  // Kết hợp rotate và check IP thành một hàm
  const rotateAndCheckIp = async () => {
    if (!apiKey) {
      setError("Vui lòng nhập API key.");
      return;
    }

    if (!proxyString) {
      setError("Vui lòng nhập thông tin proxy.");
      return;
    }

    try {
      setLoading(true);
      setError("");

      // Đổi IP trước
      const rotateResult = await rotateProxyIp(apiKey);

      if (rotateResult.status === 0) {
        // Nếu đổi IP thành công, chờ 5 giây cho IP ổn định
        setMessage("Đổi IP thành công. Đang đợi IP ổn định...");

        await new Promise((resolve) => setTimeout(resolve, 5000));

        // Sau đó kiểm tra IP
        const formattedProxy = formatProxy(proxyString);
        const ipResult = await checkIpAddress(formattedProxy);

        if (ipResult.ip) {
          const newEntry = {
            proxy: proxyString,
            ip: ipResult.ip,
            timestamp: new Date().toISOString(),
          };

          setProxyIPs((prev) => [newEntry, ...prev]);
          setMessage(`Đã đổi và kiểm tra IP thành công: ${ipResult.ip}`);
        } else {
          setError("Đổi IP thành công nhưng không thể kiểm tra IP mới.");
        }
      } else {
        setError(rotateResult.message || "Lỗi khi đổi IP.");
      }
    } catch (err) {
      setError(err.message || "Lỗi trong quá trình đổi và kiểm tra IP.");
    } finally {
      setLoading(false);
    }
  };

  const deleteProxyRecord = (index) => {
    setProxyIPs((prev) => prev.filter((_, i) => i !== index));
  };

  return {
    proxyString,
    setProxyString,
    apiKey,
    setApiKey,
    proxyIPs,
    loading,
    error,
    message,
    checkIp,
    rotateIp,
    rotateAndCheckIp,
    deleteProxyRecord,
  };
}
