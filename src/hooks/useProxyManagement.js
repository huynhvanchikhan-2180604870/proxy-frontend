import { useEffect, useRef, useState } from "react";
import { addIpToDatabase, checkIpInDatabase } from "../services/ipService";
import { checkIpAddress, rotateProxyIp } from "../services/proxyService";
import { formatProxy } from "../utils/proxyFormatter";
import { useLocalStorage } from "./useLocalStorage";

export function useProxyManagement(token) {
  const [proxyString, setProxyString] = useLocalStorage("proxyString", "");
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
  // State mới cho việc kiểm tra IP trong CSDL
  const [currentIp, setCurrentIp] = useState(null);
  const [ipCheckResult, setIpCheckResult] = useState(null);
  const [checkingDatabase, setCheckingDatabase] = useState(false);
  const [addingToDatabase, setAddingToDatabase] = useState(false);

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

  // Hàm mới để kiểm tra IP trong CSDL - Đã cập nhật để truyền token
  const checkIpInDatabaseFn = async (ip) => {
    try {
      setCheckingDatabase(true);
      setError("");

      console.log(`Đang kiểm tra IP ${ip} trong CSDL...`);
      const result = await checkIpInDatabase(ip, token); // Truyền token
      console.log("Kết quả kiểm tra IP trong CSDL:", result);

      setIpCheckResult(result);

      // Nếu đang trong chế độ tự động đổi IP và IP đã tồn tại
      if (isAutoRotatingRef.current && result.status === "exists") {
        setMessage(`IP ${ip} đã tồn tại trong CSDL. Tiếp tục đổi IP...`);
        // Tự động đổi IP mới nếu đang ở chế độ tự động
        autoRotateRef.current = setTimeout(() => {
          if (isAutoRotatingRef.current) {
            performAutoRotation();
          }
        }, 3000);
      }

      return result;
    } catch (err) {
      console.error("Lỗi khi kiểm tra IP trong CSDL:", err);
      setError(err.message || "Lỗi khi kiểm tra IP trong CSDL");
      return null;
    } finally {
      setCheckingDatabase(false);
    }
  };

  // Hàm mới để thêm IP vào CSDL - Đã cập nhật để truyền token
  const addIpToDatabaseFn = async (ip) => {
    if (!ip) {
      setError("Không có IP để thêm vào CSDL");
      return;
    }

    try {
      setAddingToDatabase(true);
      setError("");

      console.log(`Đang thêm IP ${ip} vào CSDL...`);
      const result = await addIpToDatabase(ip, token); // Truyền token
      console.log("Kết quả thêm IP vào CSDL:", result);

      if (result.status === "success") {
        setMessage(result.message || `Đã thêm IP ${ip} vào CSDL thành công`);

        // Cập nhật lại kết quả kiểm tra
        setIpCheckResult({
          status: "exists",
          date_added: new Date()
            .toISOString()
            .replace("T", " ")
            .substring(0, 19),
          total_ip: ipCheckResult
            ? (parseInt(ipCheckResult.total_ip) + 1).toString()
            : "N/A",
        });

        // Cập nhật trạng thái IP trong danh sách IP
        const updatedProxyIPs = [...proxyIPs];
        const ipIndex = updatedProxyIPs.findIndex((item) => item.ip === ip);
        if (ipIndex !== -1) {
          updatedProxyIPs[ipIndex].existsInDb = true;
          updatedProxyIPs[ipIndex].dateAddedToDb = new Date()
            .toISOString()
            .replace("T", " ")
            .substring(0, 19);
          setProxyIPs(updatedProxyIPs);
        }

        // Kiểm tra và cập nhật IP trong danh sách tạm thời nếu có
        const updatedTempProxyIPs = [...tempProxyIPs];
        const tempIpIndex = updatedTempProxyIPs.findIndex(
          (item) => item.ip === ip
        );
        if (tempIpIndex !== -1) {
          updatedTempProxyIPs[tempIpIndex].existsInDb = true;
          updatedTempProxyIPs[tempIpIndex].dateAddedToDb = new Date()
            .toISOString()
            .replace("T", " ")
            .substring(0, 19);
          setTempProxyIPs(updatedTempProxyIPs);
        }
      } else {
        setError(
          `Không thể thêm IP vào CSDL: ${
            result.message || "Lỗi không xác định"
          }`
        );
      }

      return result;
    } catch (err) {
      console.error("Lỗi khi thêm IP vào CSDL:", err);
      setError(err.message || "Lỗi khi thêm IP vào CSDL");
      return null;
    } finally {
      setAddingToDatabase(false);
    }
  };

  // Sửa lại hàm checkIp để tích hợp kiểm tra CSDL
  const checkIp = async () => {
    if (!proxyString) {
      setError("Vui lòng nhập thông tin proxy.");
      return null;
    }

    if (!token) {
      setError("Bạn chưa đăng nhập. Vui lòng đăng nhập để tiếp tục.");
      return null;
    }

    try {
      if (!isAutoRotatingRef.current) {
        setLoading(true);
      }
      setError("");
      setIpCheckResult(null); // Reset kết quả kiểm tra cũ

      console.log("Đang kiểm tra IP...");
      const formattedProxy = formatProxy(proxyString);
      const result = await checkIpAddress(formattedProxy, token);
      console.log("Kết quả kiểm tra IP:", result);

      if (result.ip) {
        // Lưu IP hiện tại
        setCurrentIp(result.ip);

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

        // Kiểm tra IP trong CSDL
        await checkIpInDatabaseFn(result.ip);

        return result.ip;
      } else {
        setError("Không thể lấy được địa chỉ IP.");
        return null;
      }
    } catch (err) {
      console.error("Lỗi khi kiểm tra IP:", err);

      // Kiểm tra lỗi xác thực
      if (
        err.message &&
        (err.message.includes("token") ||
          err.message.includes("authorized") ||
          err.message.includes("activated"))
      ) {
        setError("Lỗi xác thực: " + err.message);
      } else {
        setError(err.message || "Lỗi khi kiểm tra địa chỉ IP.");
      }

      return null;
    } finally {
      if (!isAutoRotatingRef.current) {
        setLoading(false);
      }
    }
  };

  const rotateIp = async () => {
    if (!token) {
      setError("Bạn chưa đăng nhập. Vui lòng đăng nhập để tiếp tục.");
      return false;
    }

    try {
      if (!isAutoRotatingRef.current) {
        setLoading(true);
      }
      setError("");

      console.log("Đang đổi IP...");
      const result = await rotateProxyIp(token);
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

      // Kiểm tra lỗi xác thực
      if (
        err.message &&
        (err.message.includes("token") ||
          err.message.includes("authorized") ||
          err.message.includes("activated"))
      ) {
        setError("Lỗi xác thực: " + err.message);
      } else {
        setError(err.message || "Lỗi khi đổi địa chỉ IP.");
      }

      return false;
    } finally {
      if (!isAutoRotatingRef.current) {
        setLoading(false);
      }
    }
  };

  // Kết hợp rotate và check IP thành một hàm
  // Sửa lại hàm rotateAndCheckIp để tích hợp kiểm tra CSDL
  const rotateAndCheckIp = async () => {
    if (!token) {
      setError("Bạn chưa đăng nhập. Vui lòng đăng nhập để tiếp tục.");
      return;
    }

    if (!proxyString) {
      setError("Vui lòng nhập thông tin proxy.");
      return;
    }

    try {
      setLoading(true);
      setError("");
      setIpCheckResult(null); // Reset kết quả kiểm tra cũ

      console.log("Bắt đầu đổi và kiểm tra IP...");
      // Đổi IP trước
      const rotateResult = await rotateProxyIp(token);
      console.log("Kết quả đổi IP:", rotateResult);

      if (rotateResult.status === 0) {
        // Nếu đổi IP thành công, chờ 5 giây cho IP ổn định
        setMessage("Đổi IP thành công. Đang đợi IP ổn định...");

        await new Promise((resolve) => setTimeout(resolve, 5000));

        // Sau đó kiểm tra IP
        const formattedProxy = formatProxy(proxyString);
        const ipResult = await checkIpAddress(formattedProxy, token);
        console.log("Kết quả kiểm tra IP:", ipResult);

        if (ipResult.ip) {
          // Lưu IP hiện tại
          setCurrentIp(ipResult.ip);

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

          // Kiểm tra IP trong CSDL
          await checkIpInDatabaseFn(ipResult.ip);
        } else {
          setError("Đổi IP thành công nhưng không thể kiểm tra IP mới.");
        }
      } else {
        setError(rotateResult.message || "Lỗi khi đổi IP.");
      }
    } catch (err) {
      console.error("Lỗi đổi và kiểm tra IP:", err);

      // Kiểm tra lỗi xác thực
      if (
        err.message &&
        (err.message.includes("token") ||
          err.message.includes("authorized") ||
          err.message.includes("activated"))
      ) {
        setError("Lỗi xác thực: " + err.message);
      } else {
        setError(err.message || "Lỗi trong quá trình đổi và kiểm tra IP.");
      }
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
    if (!token) {
      setError("Bạn chưa đăng nhập. Vui lòng đăng nhập để tiếp tục.");
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
    // Không xóa danh sách IP tạm khi bắt đầu quá trình mới
    isAutoRotatingRef.current = true; // Cập nhật ref trước
    setAutoRotating(true);
    setLoading(true);
    attemptCountRef.current = 0;

    // Gọi performAutoRotation trực tiếp
    console.log("Gọi trực tiếp performAutoRotation");
    performAutoRotation();
  };

  const performAutoRotation = async () => {
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
      setIpCheckResult(null); // Reset kết quả kiểm tra cũ

      // Đổi IP trước
      console.log("Gọi API đổi IP với token");
      const rotateResult = await rotateProxyIp(token);
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
            const ipResult = await checkIpAddress(formattedProxy, token);
            console.log("Kết quả kiểm tra IP:", ipResult);

            // Kiểm tra lại trạng thái sau khi kiểm tra IP
            if (!isAutoRotatingRef.current) {
              console.log("Đã dừng quá trình tự động sau khi kiểm tra IP");
              setLoading(false);
              return;
            }

            if (ipResult.ip) {
              // Lưu IP hiện tại
              setCurrentIp(ipResult.ip);

              const newEntry = {
                proxy: proxyString,
                ip: ipResult.ip,
                timestamp: new Date().toISOString(),
                attemptCount: attemptCountRef.current,
                isTemp: true,
              };

              // Kiểm tra IP trong CSDL trước khi thực hiện các bước tiếp theo
              const dbCheckResult = await checkIpInDatabaseFn(ipResult.ip);

              // Kiểm tra lại trạng thái sau khi kiểm tra CSDL
              if (!isAutoRotatingRef.current) {
                console.log("Đã dừng quá trình tự động sau khi kiểm tra CSDL");
                setLoading(false);
                return;
              }

              // Nếu IP đã tồn tại trong CSDL, tiếp tục đổi IP
              if (dbCheckResult && dbCheckResult.status === "exists") {
                setMessage(
                  `IP ${ipResult.ip} đã tồn tại trong CSDL. Tiếp tục đổi IP...`
                );

                // Thêm vào danh sách tạm thời nếu chưa có
                const duplicateIndex = tempProxyIPs.findIndex(
                  (item) => item.ip === ipResult.ip
                );
                if (duplicateIndex === -1) {
                  setTempProxyIPs((prev) => [
                    {
                      ...newEntry,
                      existsInDb: true,
                      dateAddedToDb: dbCheckResult.date_added,
                    },
                    ...prev,
                  ]);
                }

                // Tiếp tục đổi IP sau 3 giây
                autoRotateRef.current = setTimeout(() => {
                  if (isAutoRotatingRef.current) {
                    performAutoRotation();
                  }
                }, 3000);

                return;
              }

              // Kiểm tra xem IP có khớp với tiền tố mong muốn không
              if (ipResult.ip.startsWith(targetIpPrefix)) {
                console.log(`Tìm thấy IP phù hợp: ${ipResult.ip}`);

                // Nếu IP chưa tồn tại trong CSDL, hiển thị nút thêm vào CSDL
                if (dbCheckResult && dbCheckResult.status === "not_exists") {
                  setMessage(
                    `Tìm thấy IP phù hợp sau ${attemptCountRef.current} lần thử: ${ipResult.ip} - IP không tồn tại trong CSDL`
                  );
                }

                // Nếu tìm thấy IP mong muốn, thêm vào danh sách chính và dừng lại
                setProxyIPs((prev) => [
                  {
                    ...newEntry,
                    isTemp: false,
                    existsInDb: dbCheckResult
                      ? dbCheckResult.status === "exists"
                      : false,
                    dateAddedToDb: dbCheckResult?.date_added,
                  },
                  ...prev,
                ]);

                // Dừng tự động đổi IP
                isAutoRotatingRef.current = false;
                setAutoRotating(false);
                setLoading(false);
              } else {
                console.log(`IP không khớp: ${ipResult.ip}, tiếp tục tìm kiếm`);

                // Kiểm tra xem IP này đã tồn tại trong danh sách tạm chưa
                const duplicateIndex = tempProxyIPs.findIndex(
                  (item) => item.ip === ipResult.ip
                );

                if (duplicateIndex === -1) {
                  // Thêm vào danh sách tạm với thông tin CSDL
                  setTempProxyIPs((prev) => [
                    {
                      ...newEntry,
                      existsInDb: dbCheckResult
                        ? dbCheckResult.status === "exists"
                        : false,
                      dateAddedToDb: dbCheckResult?.date_added,
                    },
                    ...prev,
                  ]);
                } else {
                  console.log(
                    `IP ${ipResult.ip} đã tồn tại trong danh sách tạm, không thêm lại`
                  );
                }

                // Nếu IP chưa tồn tại trong CSDL và chế độ tự động, tiếp tục đổi
                if (dbCheckResult && dbCheckResult.status === "not_exists") {
                  setMessage(
                    `IP hiện tại (${ipResult.ip}) không khớp với tiền tố ${targetIpPrefix} và chưa tồn tại trong CSDL. Tiếp tục đổi IP...`
                  );
                } else {
                  setMessage(
                    `IP hiện tại (${ipResult.ip}) không khớp với tiền tố ${targetIpPrefix}. Tiếp tục đổi IP...`
                  );
                }

                // Đợi trước khi thử lại
                autoRotateRef.current = setTimeout(() => {
                  if (isAutoRotatingRef.current) {
                    performAutoRotation();
                  }
                }, 10000);
              }
            } else {
              console.log("Không lấy được IP, thử lại sau 10 giây");
              setError("Không thể lấy được địa chỉ IP. Đang thử lại...");
              autoRotateRef.current = setTimeout(() => {
                if (isAutoRotatingRef.current) {
                  performAutoRotation();
                }
              }, 10000);
            }
          } catch (checkError) {
            console.error("Lỗi khi kiểm tra IP:", checkError);

            // Kiểm tra lỗi xác thực
            if (
              checkError.message &&
              (checkError.message.includes("token") ||
                checkError.message.includes("authorized") ||
                checkError.message.includes("activated"))
            ) {
              setError("Lỗi xác thực: " + checkError.message);
              // Dừng quá trình tự động nếu có lỗi xác thực
              isAutoRotatingRef.current = false;
              setAutoRotating(false);
              setLoading(false);
            } else {
              setError(
                `Lỗi khi kiểm tra IP: ${checkError.message}. Thử lại sau 10 giây...`
              );
              autoRotateRef.current = setTimeout(() => {
                if (isAutoRotatingRef.current) {
                  performAutoRotation();
                }
              }, 10000);
            }
          }
        }, 5000);

        // Lưu reference vào autoRotateRef để có thể hủy nếu cần
        autoRotateRef.current = waitForStableIp;
      } else {
        console.log("Đổi IP thất bại, thử lại sau 30 giây");
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

      // Kiểm tra lỗi xác thực
      if (
        error.message &&
        (error.message.includes("token") ||
          error.message.includes("authorized") ||
          error.message.includes("activated"))
      ) {
        setError("Lỗi xác thực: " + error.message);
        // Dừng quá trình tự động nếu có lỗi xác thực
        isAutoRotatingRef.current = false;
        setAutoRotating(false);
        setLoading(false);
      } else {
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

    // Thêm các state và function mới
    currentIp,
    ipCheckResult,
    checkingDatabase,
    addingToDatabase,
    checkIpInDatabase: checkIpInDatabaseFn,
    addIpToDatabase: addIpToDatabaseFn,
  };
}
