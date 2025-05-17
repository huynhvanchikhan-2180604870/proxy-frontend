import { useEffect, useRef, useState } from "react";
import { checkIpAddress, rotateProxyIp } from "../services/proxyService";
import { formatProxy } from "../utils/proxyFormatter";
import { useLocalStorage } from "./useLocalStorage";

export function useProxyManagement() {
  const [proxyString, setProxyString] = useLocalStorage("proxyString", "");
  const [apiKey, setApiKey] = useLocalStorage("apiKey", "");
  const [targetIpPrefix, setTargetIpPrefix] = useLocalStorage(
    "targetIpPrefix",
    ""
  );
  const [proxyIPs, setProxyIPs] = useLocalStorage("proxyIPs", []);
  const [tempProxyIPs, setTempProxyIPs] = useLocalStorage("tempProxyIPs", []);
  const [loading, setLoading] = useState(false);
  const [autoRotating, setAutoRotating] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const autoRotateRef = useRef(null);
  const attemptCountRef = useRef(0);
  // Thêm ref để theo dõi trạng thái thực tế
  const isAutoRotatingRef = useRef(false);

  // Cập nhật ref khi state thay đổi
  useEffect(() => {
    isAutoRotatingRef.current = autoRotating;
    console.log("State autoRotating đã thay đổi:", autoRotating);
  }, [autoRotating]);

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

  // Dừng auto rotate khi component unmount
  useEffect(() => {
    return () => {
      if (autoRotateRef.current) {
        clearTimeout(autoRotateRef.current);
        autoRotateRef.current = null;
      }
    };
  }, []);

  const checkIp = async () => {
    if (!proxyString) {
      setError("Vui lòng nhập thông tin proxy.");
      return null;
    }

    try {
      if (!isAutoRotatingRef.current) {
        setLoading(true);
      }
      setError("");

      console.log("Đang kiểm tra IP...");
      const formattedProxy = formatProxy(proxyString);
      const result = await checkIpAddress(formattedProxy);
      console.log("Kết quả kiểm tra IP:", result);

      if (result.ip) {
        // Thêm vào đầu mảng nếu chưa tồn tại IP này
        const existingIndex = proxyIPs.findIndex(
          (entry) => entry.ip === result.ip
        );

        if (existingIndex === -1) {
          const newEntry = {
            proxy: proxyString,
            ip: result.ip,
            timestamp: new Date().toISOString(),
          };

          setProxyIPs((prev) => [newEntry, ...prev]);
        } else {
          // Cập nhật timestamp nếu IP đã tồn tại
          const updatedProxyIPs = [...proxyIPs];
          updatedProxyIPs[existingIndex].timestamp = new Date().toISOString();
          setProxyIPs(updatedProxyIPs);
        }

        setMessage(`Đã lấy thành công IP: ${result.ip}`);
        return result.ip;
      } else {
        setError("Không thể lấy được địa chỉ IP.");
        return null;
      }
    } catch (err) {
      console.error("Lỗi khi kiểm tra IP:", err);
      setError(err.message || "Lỗi khi kiểm tra địa chỉ IP.");
      return null;
    } finally {
      if (!isAutoRotatingRef.current) {
        setLoading(false);
      }
    }
  };

  const rotateIp = async () => {
    if (!apiKey) {
      setError("Vui lòng nhập API key.");
      return false;
    }

    try {
      if (!isAutoRotatingRef.current) {
        setLoading(true);
      }
      setError("");

      console.log("Đang đổi IP...");
      const result = await rotateProxyIp(apiKey);
      console.log("Kết quả đổi IP:", result);

      if (result.status === 0) {
        setMessage(result.message);
        return true;
      } else {
        setError(result.message || "Đã xảy ra lỗi không xác định.");
        return false;
      }
    } catch (err) {
      console.error("Lỗi khi đổi IP:", err);
      setError(err.message || "Lỗi khi đổi địa chỉ IP.");
      return false;
    } finally {
      if (!isAutoRotatingRef.current) {
        setLoading(false);
      }
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

      console.log("Bắt đầu đổi và kiểm tra IP...");
      // Đổi IP trước
      const rotateResult = await rotateProxyIp(apiKey);
      console.log("Kết quả đổi IP:", rotateResult);

      if (rotateResult.status === 0) {
        // Nếu đổi IP thành công, chờ 5 giây cho IP ổn định
        setMessage("Đổi IP thành công. Đang đợi IP ổn định...");

        await new Promise((resolve) => setTimeout(resolve, 5000));

        // Sau đó kiểm tra IP
        const formattedProxy = formatProxy(proxyString);
        const ipResult = await checkIpAddress(formattedProxy);
        console.log("Kết quả kiểm tra IP:", ipResult);

        if (ipResult.ip) {
          // Thêm vào đầu mảng nếu chưa tồn tại IP này
          const existingIndex = proxyIPs.findIndex(
            (entry) => entry.ip === ipResult.ip
          );

          if (existingIndex === -1) {
            const newEntry = {
              proxy: proxyString,
              ip: ipResult.ip,
              timestamp: new Date().toISOString(),
            };

            setProxyIPs((prev) => [newEntry, ...prev]);
          } else {
            // Cập nhật timestamp nếu IP đã tồn tại
            const updatedProxyIPs = [...proxyIPs];
            updatedProxyIPs[existingIndex].timestamp = new Date().toISOString();
            setProxyIPs(updatedProxyIPs);
          }

          setMessage(`Đã đổi và kiểm tra IP thành công: ${ipResult.ip}`);
        } else {
          setError("Đổi IP thành công nhưng không thể kiểm tra IP mới.");
        }
      } else {
        setError(rotateResult.message || "Lỗi khi đổi IP.");
      }
    } catch (err) {
      console.error("Lỗi đổi và kiểm tra IP:", err);
      setError(err.message || "Lỗi trong quá trình đổi và kiểm tra IP.");
    } finally {
      setLoading(false);
    }
  };

  // Hàm xóa tất cả IP tạm thời
  const clearTempProxyIPs = () => {
    setTempProxyIPs([]);
    setMessage("Đã xóa tất cả IP tạm thời.");
  };

  // Hàm tự động đổi IP và kiểm tra cho đến khi khớp với tiền tố mong muốn
  const autoRotateIp = () => {
    console.log("Bắt đầu hàm autoRotateIp, trạng thái hiện tại:", autoRotating);

    // Nếu đã đang tự động đổi, dừng lại
    if (isAutoRotatingRef.current) {
      console.log("Đang trong trạng thái tự động, tiến hành dừng");
      if (autoRotateRef.current) {
        console.log("Xóa timeout hiện tại");
        clearTimeout(autoRotateRef.current);
        autoRotateRef.current = null;
      }
      isAutoRotatingRef.current = false;
      setAutoRotating(false);
      setLoading(false);
      setMessage("Đã dừng quá trình tự động đổi IP.");
      return;
    }

    // Kiểm tra xem có đủ thông tin cần thiết không
    if (!apiKey) {
      setError("Vui lòng nhập API key.");
      return;
    }

    if (!proxyString) {
      setError("Vui lòng nhập thông tin proxy.");
      return;
    }

    if (!targetIpPrefix) {
      setError("Vui lòng nhập tiền tố IP mong muốn.");
      return;
    }

    // Bắt đầu tự động đổi IP
    console.log("Khởi tạo quá trình tự động đổi IP");
    // BỎ DÒNG NÀY: setTempProxyIPs([]); - Không xóa danh sách IP tạm khi bắt đầu quá trình mới
    isAutoRotatingRef.current = true; // Cập nhật ref trước
    setAutoRotating(true);
    setLoading(true);
    attemptCountRef.current = 0;

    // Gọi performAutoRotation trực tiếp
    console.log("Gọi trực tiếp performAutoRotation");
    performAutoRotation();
  };

  const performAutoRotation = async () => {
    // Bảo vệ để đảm bảo chúng ta đang trong trạng thái auto-rotating
    // Sử dụng ref thay vì state để kiểm tra trạng thái
    console.log(
      "Bắt đầu performAutoRotation, trạng thái ref:",
      isAutoRotatingRef.current
    );

    if (!isAutoRotatingRef.current) {
      console.log("Không còn trong trạng thái tự động đổi, dừng thực thi");
      setLoading(false);
      return;
    }

    try {
      attemptCountRef.current += 1;
      console.log(`Thực hiện lần đổi IP thứ ${attemptCountRef.current}...`);
      setMessage(`Đang thực hiện lần đổi IP thứ ${attemptCountRef.current}...`);

      // Đổi IP trước
      console.log("Gọi API đổi IP với key:", apiKey);
      const rotateResult = await rotateProxyIp(apiKey);
      console.log("Kết quả đổi IP:", rotateResult);

      // Kiểm tra lại trạng thái sau khi đổi IP
      if (!isAutoRotatingRef.current) {
        console.log("Đã dừng quá trình tự động sau khi đổi IP");
        setLoading(false);
        return;
      }

      if (rotateResult.status === 0) {
        // Nếu đổi IP thành công, chờ 5 giây cho IP ổn định
        setMessage(
          `Đổi IP thành công lần thứ ${attemptCountRef.current}. Đang đợi IP ổn định...`
        );

        // Sử dụng setTimeout thay vì Promise để có thể hủy
        console.log("Đợi 5 giây cho IP ổn định");
        const waitForStableIp = setTimeout(async () => {
          // Kiểm tra lại trạng thái sau khi đợi
          if (!isAutoRotatingRef.current) {
            console.log("Đã dừng quá trình tự động sau khi đợi IP ổn định");
            setLoading(false);
            return;
          }

          try {
            // Kiểm tra IP
            const formattedProxy = formatProxy(proxyString);
            console.log("Kiểm tra IP với proxy:", formattedProxy);
            const ipResult = await checkIpAddress(formattedProxy);
            console.log("Kết quả kiểm tra IP:", ipResult);

            // Kiểm tra lại trạng thái sau khi kiểm tra IP
            if (!isAutoRotatingRef.current) {
              console.log("Đã dừng quá trình tự động sau khi kiểm tra IP");
              setLoading(false);
              return;
            }

            if (ipResult.ip) {
              const newEntry = {
                proxy: proxyString,
                ip: ipResult.ip,
                timestamp: new Date().toISOString(),
                attemptCount: attemptCountRef.current, // Thêm số lần thử để có thể theo dõi
                isTemp: true, // Đánh dấu là IP tạm
              };

              // Kiểm tra xem IP có khớp với tiền tố mong muốn không
              if (ipResult.ip.startsWith(targetIpPrefix)) {
                console.log(`Tìm thấy IP phù hợp: ${ipResult.ip}`);
                // Nếu tìm thấy IP mong muốn, thêm vào danh sách chính và dừng lại
                setProxyIPs((prev) => [
                  { ...newEntry, isTemp: false }, // Bỏ đánh dấu tạm thời khi lưu vào danh sách chính
                  ...prev,
                ]);

                setMessage(
                  `Tìm thấy IP phù hợp sau ${attemptCountRef.current} lần thử: ${ipResult.ip}`
                );
                isAutoRotatingRef.current = false;
                setAutoRotating(false);
                setLoading(false);
              } else {
                console.log(`IP không khớp: ${ipResult.ip}, tiếp tục tìm kiếm`);

                // Kiểm tra xem IP này đã tồn tại trong danh sách tạm chưa (tránh trùng lặp)
                const duplicateIndex = tempProxyIPs.findIndex(
                  (item) => item.ip === ipResult.ip
                );
                if (duplicateIndex === -1) {
                  // Thêm IP không khớp vào danh sách tạm và tiếp tục đổi
                  setTempProxyIPs((prev) => [newEntry, ...prev]);
                } else {
                  console.log(
                    `IP ${ipResult.ip} đã tồn tại trong danh sách tạm, không thêm lại`
                  );
                }

                setMessage(
                  `IP hiện tại (${ipResult.ip}) không khớp với tiền tố ${targetIpPrefix}. Tiếp tục đổi IP...`
                );

                // Đợi 10 giây trước khi thử lại, nhưng chỉ nếu vẫn đang tự động đổi
                console.log("Đặt hẹn giờ đổi IP tiếp theo sau 10 giây");
                autoRotateRef.current = setTimeout(() => {
                  if (isAutoRotatingRef.current) {
                    performAutoRotation();
                  }
                }, 10000);
              }
            } else {
              console.log("Không lấy được IP, thử lại sau 10 giây");
              // Nếu không thể lấy IP, thử lại sau 10 giây
              setError("Không thể lấy được địa chỉ IP. Đang thử lại...");
              autoRotateRef.current = setTimeout(() => {
                if (isAutoRotatingRef.current) {
                  performAutoRotation();
                }
              }, 10000);
            }
          } catch (checkError) {
            console.error("Lỗi khi kiểm tra IP:", checkError);
            setError(
              `Lỗi khi kiểm tra IP: ${checkError.message}. Thử lại sau 10 giây...`
            );
            autoRotateRef.current = setTimeout(() => {
              if (isAutoRotatingRef.current) {
                performAutoRotation();
              }
            }, 10000);
          }
        }, 5000);

        // Lưu reference vào autoRotateRef để có thể hủy nếu cần
        autoRotateRef.current = waitForStableIp;
      } else {
        console.log("Đổi IP thất bại, thử lại sau 30 giây");
        // Nếu đổi IP thất bại, thử lại sau 30 giây
        setError(
          `${rotateResult.message || "Lỗi khi đổi IP"}. Thử lại sau 30 giây...`
        );
        autoRotateRef.current = setTimeout(() => {
          if (isAutoRotatingRef.current) {
            performAutoRotation();
          }
        }, 30000);
      }
    } catch (error) {
      console.error("Lỗi trong quá trình tự động đổi IP:", error);
      // Xử lý lỗi và thử lại sau 30 giây
      setError(
        `${
          error.message || "Lỗi trong quá trình tự động đổi IP"
        }. Thử lại sau 30 giây...`
      );
      autoRotateRef.current = setTimeout(() => {
        if (isAutoRotatingRef.current) {
          performAutoRotation();
        }
      }, 30000);
    }
  };

  const deleteProxyRecord = (index, isTemp = false) => {
    if (isTemp) {
      setTempProxyIPs((prev) => prev.filter((_, i) => i !== index));
    } else {
      setProxyIPs((prev) => prev.filter((_, i) => i !== index));
    }
  };

  return {
    proxyString,
    setProxyString,
    apiKey,
    setApiKey,
    targetIpPrefix,
    setTargetIpPrefix,
    proxyIPs,
    tempProxyIPs,
    loading,
    autoRotating,
    error,
    message,
    checkIp,
    rotateIp,
    rotateAndCheckIp,
    autoRotateIp,
    deleteProxyRecord,
    clearTempProxyIPs,
  };
}
