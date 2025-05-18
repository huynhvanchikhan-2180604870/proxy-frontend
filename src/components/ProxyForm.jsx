import { useEffect, useRef, useState } from "react";

const ProxyForm = ({
  proxyString,
  setProxyString,
  apiKey,
  setApiKey,
  onRotateAndCheckIp,
  onAutoRotateIp,
  onCheckIpOnly, // Đây là hàm checkIp từ useProxyManagement
  loading,
  autoRotating,
  targetIpPrefix,
  setTargetIpPrefix,
  user,
}) => {
  const rotateButtonRef = useRef(null);
  const autoRotateButtonRef = useRef(null);
  const checkIpButtonRef = useRef(null);
  const [customApiKey, setCustomApiKey] = useState(false);

  // Đảm bảo nút auto rotate phản ánh đúng trạng thái
  useEffect(() => {
    console.log("Cập nhật trạng thái tự động:", autoRotating);
  }, [autoRotating]);

  // Khi user thay đổi hoặc component mount, cập nhật API key từ user nếu không dùng custom key
  useEffect(() => {
    if (user && user.proxyApiKey && !customApiKey) {
      setApiKey(user.proxyApiKey);
    }
  }, [user, customApiKey, setApiKey]);

  // Reset customApiKey khi đăng nhập/đăng xuất
  useEffect(() => {
    setCustomApiKey(false);
  }, [user]);

  const toggleCustomApiKey = () => {
    if (customApiKey) {
      // Khi chuyển từ tùy chỉnh về mặc định
      if (user && user.proxyApiKey) {
        setApiKey(user.proxyApiKey); // Khôi phục API key từ user
      }
    }
    setCustomApiKey(!customApiKey);
  };

  const handleRotateAndCheckIp = (e) => {
    // Thêm hiệu ứng ripple khi nhấn nút
    if (rotateButtonRef.current) {
      try {
        const button = rotateButtonRef.current;
        const circle = document.createElement("span");
        const diameter = Math.max(button.clientWidth, button.clientHeight);
        const radius = diameter / 2;

        circle.style.width = circle.style.height = `${diameter}px`;
        circle.style.left = `${e.clientX - button.offsetLeft - radius}px`;
        circle.style.top = `${e.clientY - button.offsetTop - radius}px`;
        circle.classList.add("ripple");

        const ripple = button.getElementsByClassName("ripple")[0];
        if (ripple) {
          ripple.remove();
        }

        button.appendChild(circle);

        circle.animate(
          [
            { transform: "scale(0)", opacity: 1 },
            { transform: "scale(4)", opacity: 0 },
          ],
          {
            duration: 600,
            easing: "ease-out",
          }
        ).onfinish = () => {
          circle.remove();
        };
      } catch (err) {
        console.error("Lỗi hiệu ứng ripple:", err);
      }
    }

    console.log("Nhấn nút đổi IP");
    onRotateAndCheckIp();
  };

  const handleAutoRotateIp = (e) => {
    // Thêm hiệu ứng ripple khi nhấn nút
    if (autoRotateButtonRef.current) {
      try {
        const button = autoRotateButtonRef.current;
        const circle = document.createElement("span");
        const diameter = Math.max(button.clientWidth, button.clientHeight);
        const radius = diameter / 2;

        circle.style.width = circle.style.height = `${diameter}px`;
        circle.style.left = `${e.clientX - button.offsetLeft - radius}px`;
        circle.style.top = `${e.clientY - button.offsetTop - radius}px`;
        circle.classList.add("ripple");

        const ripple = button.getElementsByClassName("ripple")[0];
        if (ripple) {
          ripple.remove();
        }

        button.appendChild(circle);

        circle.animate(
          [
            { transform: "scale(0)", opacity: 1 },
            { transform: "scale(4)", opacity: 0 },
          ],
          {
            duration: 600,
            easing: "ease-out",
          }
        ).onfinish = () => {
          circle.remove();
        };
      } catch (err) {
        console.error("Lỗi hiệu ứng ripple:", err);
      }
    }

    console.log("Nhấn nút tự động đổi IP, trạng thái hiện tại:", autoRotating);
    onAutoRotateIp();
  };

  // Hàm kiểm tra IP mà không đổi, chỉ gọi đến hàm checkIp đã có sẵn
  const handleCheckIpOnly = (e) => {
    // Thêm hiệu ứng ripple khi nhấn nút
    if (checkIpButtonRef.current) {
      try {
        const button = checkIpButtonRef.current;
        const circle = document.createElement("span");
        const diameter = Math.max(button.clientWidth, button.clientHeight);
        const radius = diameter / 2;

        circle.style.width = circle.style.height = `${diameter}px`;
        circle.style.left = `${e.clientX - button.offsetLeft - radius}px`;
        circle.style.top = `${e.clientY - button.offsetTop - radius}px`;
        circle.classList.add("ripple");

        const ripple = button.getElementsByClassName("ripple")[0];
        if (ripple) {
          ripple.remove();
        }

        button.appendChild(circle);

        circle.animate(
          [
            { transform: "scale(0)", opacity: 1 },
            { transform: "scale(4)", opacity: 0 },
          ],
          {
            duration: 600,
            easing: "ease-out",
          }
        ).onfinish = () => {
          circle.remove();
        };
      } catch (err) {
        console.error("Lỗi hiệu ứng ripple:", err);
      }
    }

    console.log("Nhấn nút kiểm tra IP");
    // Gọi trực tiếp hàm đã được truyền từ useProxyManagement
    onCheckIpOnly();
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
      <div className="transition-all duration-300 hover:translate-y-[-2px]">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Proxy (định dạng: username:password@domain:port)
        </label>
        <div className="mt-1 mb-3 md:mb-4">
          <input
            type="text"
            value={proxyString}
            onChange={(e) => setProxyString(e.target.value)}
            placeholder="ví dụ: huyen:huyen@hnadc1.proxyno1.com:46357"
            className="w-full px-3 py-2 md:px-4 md:py-3 text-sm md:text-base border border-indigo-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200"
          />
          <p className="text-xs text-gray-500 mt-1">
            Nhập proxy theo định dạng: username:password@domain:port
          </p>
        </div>

        <div className="mb-3 md:mb-4">
          <div className="flex justify-between items-center mb-2">
            <label className="block text-sm font-medium text-gray-700">
              API Key
            </label>
            <button
              type="button"
              onClick={toggleCustomApiKey}
              className={`px-2 py-1 text-xs rounded-md transition-colors ${
                customApiKey
                  ? "bg-amber-100 text-amber-700 hover:bg-amber-200"
                  : "bg-blue-100 text-blue-700 hover:bg-blue-200"
              }`}
            >
              {customApiKey ? "Dùng API key mặc định" : "Dùng API key khác"}
            </button>
          </div>
          <div className="relative">
            <input
              type="text"
              value={apiKey}
              onChange={(e) => customApiKey && setApiKey(e.target.value)}
              placeholder={
                customApiKey
                  ? "Nhập API key của bạn"
                  : "API key từ tài khoản đăng nhập"
              }
              readOnly={!customApiKey}
              className={`w-full px-3 py-2 md:px-4 md:py-3 text-sm md:text-base border rounded-lg shadow-sm focus:outline-none transition-all duration-200 ${
                customApiKey
                  ? "border-amber-300 focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                  : "border-blue-300 bg-gray-50"
              }`}
            />
            {!customApiKey && (
              <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                <svg
                  className="h-4 w-4 text-gray-400"
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
            )}
          </div>
          <p className="text-xs text-gray-500 mt-1">
            {customApiKey
              ? "API key có thể xem tại trang Dashboard https://app.proxyno1.com/user"
              : "Đang sử dụng API key từ tài khoản đăng nhập của bạn"}
          </p>
        </div>
      </div>

      <div className="transition-all duration-300 hover:translate-y-[-2px]">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Đổi IP tự động đến khi có tiền tố IP mong muốn
        </label>
        <div className="mt-1 mb-3 md:mb-4">
          <input
            type="text"
            value={targetIpPrefix}
            onChange={(e) => setTargetIpPrefix(e.target.value)}
            placeholder="Ví dụ: 117.7"
            className="w-full px-3 py-2 md:px-4 md:py-3 text-sm md:text-base border border-indigo-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200"
          />
          <p className="text-xs text-gray-500 mt-1">
            Nhập tiền tố IP mong muốn, hệ thống sẽ tự động đổi IP đến khi tìm
            được IP phù hợp
          </p>
        </div>

        <div className="grid grid-cols-3 gap-2">
          {/* Nút Kiểm tra IP */}
          <button
            ref={checkIpButtonRef}
            onClick={handleCheckIpOnly}
            disabled={loading || !apiKey || !proxyString}
            className={`relative overflow-hidden w-full py-2 md:py-3 px-4 rounded-lg text-white text-sm md:text-base font-medium transition-all duration-200 ${
              loading || !apiKey || !proxyString
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700 hover:shadow-md transform hover:scale-105"
            }`}
          >
            {loading && !autoRotating ? (
              <span className="flex items-center justify-center">
                <svg
                  className="animate-spin -ml-1 mr-2 h-4 w-4 md:h-5 md:w-5 text-white"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
                Đang xử lý...
              </span>
            ) : (
              <span className="flex items-center justify-center">
                <svg
                  className="mr-2 h-4 w-4 md:h-5 md:w-5"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>
                Kiểm tra IP
              </span>
            )}
          </button>

          {/* Nút Đổi IP */}
          <button
            ref={rotateButtonRef}
            onClick={handleRotateAndCheckIp}
            disabled={loading || !apiKey || !proxyString}
            className={`relative overflow-hidden w-full py-2 md:py-3 px-4 rounded-lg text-white text-sm md:text-base font-medium transition-all duration-200 ${
              loading || !apiKey || !proxyString
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 hover:shadow-md transform hover:scale-105"
            }`}
          >
            {loading && !autoRotating ? (
              <span className="flex items-center justify-center">
                <svg
                  className="animate-spin -ml-1 mr-2 h-4 w-4 md:h-5 md:w-5 text-white"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
                Đang xử lý...
              </span>
            ) : (
              <span className="flex items-center justify-center">
                <svg
                  className="mr-2 h-4 w-4 md:h-5 md:w-5"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                  />
                </svg>
                Đổi IP
              </span>
            )}
          </button>

          {/* Nút Tự động đổi */}
          <button
            ref={autoRotateButtonRef}
            onClick={handleAutoRotateIp}
            disabled={
              (loading && !autoRotating) ||
              !apiKey ||
              !proxyString ||
              !targetIpPrefix
            }
            className={`relative overflow-hidden w-full py-2 md:py-3 px-4 rounded-lg text-white text-sm md:text-base font-medium transition-all duration-200 ${
              (loading && !autoRotating) ||
              !apiKey ||
              !proxyString ||
              !targetIpPrefix
                ? "bg-gray-400 cursor-not-allowed"
                : autoRotating
                ? "bg-gradient-to-r from-red-600 to-pink-600 hover:from-red-700 hover:to-pink-700 hover:shadow-md"
                : "bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 hover:shadow-md transform hover:scale-105"
            }`}
          >
            {autoRotating ? (
              <span className="flex items-center justify-center">
                <svg
                  className="animate-spin -ml-1 mr-2 h-4 w-4 md:h-5 md:w-5 text-white"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
                Dừng lại
              </span>
            ) : (
              <span className="flex items-center justify-center">
                <svg
                  className="mr-2 h-4 w-4 md:h-5 md:w-5"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13 10V3L4 14h7v7l9-11h-7z"
                  />
                </svg>
                Tự động đổi
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Thêm CSS cho hiệu ứng ripple */}
      <style jsx="true">{`
        .ripple {
          position: absolute;
          background: rgba(255, 255, 255, 0.3);
          border-radius: 50%;
          transform: scale(0);
          pointer-events: none;
        }
      `}</style>
    </div>
  );
};

export default ProxyForm;
