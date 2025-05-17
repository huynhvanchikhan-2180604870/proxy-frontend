import { useRef } from "react";

const ProxyForm = ({
  proxyString,
  setProxyString,
  apiKey,
  setApiKey,
  onRotateAndCheckIp,
  loading,
}) => {
  const rotateButtonRef = useRef(null);

  const handleRotateAndCheckIp = () => {
    // Thêm hiệu ứng ripple khi nhấn nút
    if (rotateButtonRef.current) {
      const button = rotateButtonRef.current;
      const circle = document.createElement("span");
      const diameter = Math.max(button.clientWidth, button.clientHeight);

      circle.style.width = circle.style.height = `${diameter}px`;
      circle.style.position = "absolute";
      circle.style.borderRadius = "50%";
      circle.style.backgroundColor = "rgba(255, 255, 255, 0.3)";
      circle.style.transform = "scale(0)";

      const rect = button.getBoundingClientRect();
      circle.style.left = `${event.clientX - rect.left - diameter / 2}px`;
      circle.style.top = `${event.clientY - rect.top - diameter / 2}px`;

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
    }

    onRotateAndCheckIp();
  };

  return (
    <div className="grid md:grid-cols-2 gap-6">
      <div className="transition-all duration-300 hover:translate-y-[-2px]">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Proxy (định dạng: domain:port:username:password)
        </label>
        <div className="mt-1 mb-4">
          <input
            type="text"
            value={proxyString}
            onChange={(e) => setProxyString(e.target.value)}
            placeholder="ví dụ: hnadc1.proxyno1.com:46357:huyen:huyen"
            className="w-full px-4 py-3 border border-indigo-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200"
          />
          <p className="text-xs text-gray-500 mt-1">
            Nhập proxy theo định dạng: domain:port:username:password
          </p>
        </div>
      </div>

      <div className="transition-all duration-300 hover:translate-y-[-2px]">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          API Key (lấy từ trang Dashboard proxyno1.com)
        </label>
        <div className="mt-1 mb-4">
          <input
            type="text"
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
            placeholder="Nhập API key của bạn"
            className="w-full px-4 py-3 border border-indigo-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200"
          />
          <p className="text-xs text-gray-500 mt-1">
            API key có thể xem tại trang Dashboard https://app.proxyno1.com/user
          </p>
        </div>

        <button
          ref={rotateButtonRef}
          onClick={handleRotateAndCheckIp}
          disabled={loading || !apiKey || !proxyString}
          className={`relative overflow-hidden w-full py-3 px-4 rounded-lg text-white font-medium transition-all duration-200 ${
            loading || !apiKey || !proxyString
              ? "bg-gray-400 cursor-not-allowed"
              : "bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 hover:shadow-md transform hover:scale-105"
          }`}
        >
          {loading ? (
            <span className="flex items-center justify-center">
              <svg
                className="animate-spin -ml-1 mr-2 h-5 w-5 text-white"
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
                className="mr-2 h-5 w-5"
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
              Đổi IP Và Kiểm Tra
            </span>
          )}
        </button>
      </div>
    </div>
  );
};

export default ProxyForm;
