import { useRef } from "react";

const ProxyTable = ({
  proxyIPs,
  tempProxyIPs,
  targetIpPrefix,
  onDelete,
  onClearTemp,
  autoRotating,
}) => {
  const tableRef = useRef(null);
  const tempTableRef = useRef(null);

  const handleDelete = (index, isTemp = false) => {
    onDelete(index, isTemp);
  };

  // Kiểm tra xem một IP có phù hợp với tiền tố yêu cầu không
  const isMatchingIp = (ip) => {
    if (!targetIpPrefix) return false;
    return ip && ip.startsWith(targetIpPrefix);
  };

  // Hiển thị khi không có IP nào
  if (
    (!proxyIPs || proxyIPs.length === 0) &&
    (!tempProxyIPs || tempProxyIPs.length === 0)
  ) {
    return (
      <div className="bg-white rounded-xl shadow-md p-6 text-center text-gray-500 transition-all duration-300 hover:shadow-lg border border-indigo-100">
        <svg
          className="mx-auto h-10 w-10 sm:h-12 sm:w-12 text-gray-400 mb-3 sm:mb-4"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
        <p className="text-base sm:text-lg font-medium mb-1 sm:mb-2">
          Chưa có dữ liệu IP
        </p>
        <p className="text-sm">
          Nhập thông tin proxy và nhấn "Đổi IP" hoặc "Tự động đổi" để bắt đầu.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Bảng IP Tạm Thời */}
      {tempProxyIPs && tempProxyIPs.length > 0 && (
        <div
          className="bg-white rounded-xl shadow-md overflow-hidden transition-all duration-300 hover:shadow-lg border border-orange-200"
          ref={tempTableRef}
        >
          <div className="p-3 sm:p-4 border-b border-orange-200 bg-gradient-to-r from-orange-50 to-amber-50 flex justify-between items-center">
            <div>
              <h2 className="text-base sm:text-lg font-medium text-orange-800">
                IP Tạm Thời ({tempProxyIPs.length})
              </h2>
              <p className="text-xs sm:text-sm text-orange-600">
                IP không khớp với tiền tố "{targetIpPrefix}" trong quá trình tìm
                kiếm
              </p>
            </div>
            <button
              onClick={onClearTemp}
              disabled={autoRotating}
              className={`px-3 py-1 sm:px-4 sm:py-2 rounded-lg text-xs sm:text-sm font-medium transition-all duration-200 ${
                autoRotating
                  ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                  : "bg-orange-600 text-white hover:bg-orange-700"
              }`}
            >
              Xóa Tất Cả
            </button>
          </div>

          {/* Bảng IP tạm cho desktop */}
          <div className="hidden sm:block overflow-x-auto">
            <table className="min-w-full divide-y divide-orange-100">
              <thead className="bg-orange-50">
                <tr>
                  <th
                    scope="col"
                    className="px-4 sm:px-6 py-2 sm:py-3 text-left text-xs font-medium text-orange-800 uppercase tracking-wider"
                  >
                    Proxy
                  </th>
                  <th
                    scope="col"
                    className="px-4 sm:px-6 py-2 sm:py-3 text-left text-xs font-medium text-orange-800 uppercase tracking-wider"
                  >
                    Địa Chỉ IP
                  </th>
                  <th
                    scope="col"
                    className="px-4 sm:px-6 py-2 sm:py-3 text-left text-xs font-medium text-orange-800 uppercase tracking-wider"
                  >
                    Thời Gian
                  </th>
                  <th
                    scope="col"
                    className="px-4 sm:px-6 py-2 sm:py-3 text-left text-xs font-medium text-orange-800 uppercase tracking-wider"
                  >
                    Thao Tác
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-orange-100">
                {tempProxyIPs.map((entry, index) => (
                  <tr
                    key={index}
                    className="hover:bg-orange-50 transition-all duration-200 animate-fadeIn"
                  >
                    <td className="px-4 sm:px-6 py-2 sm:py-4 whitespace-nowrap text-xs sm:text-sm font-medium text-gray-900">
                      {entry.proxy}
                    </td>
                    <td className="px-4 sm:px-6 py-2 sm:py-4 whitespace-nowrap text-xs sm:text-sm font-semibold text-orange-700">
                      {entry.ip}
                    </td>
                    <td className="px-4 sm:px-6 py-2 sm:py-4 whitespace-nowrap text-xs sm:text-sm text-gray-500">
                      {new Date(entry.timestamp).toLocaleString("vi-VN")}
                    </td>
                    <td className="px-4 sm:px-6 py-2 sm:py-4 whitespace-nowrap text-right text-xs sm:text-sm font-medium">
                      <button
                        onClick={() => handleDelete(index, true)}
                        className="text-red-600 hover:text-red-900 transition-colors duration-150 flex items-center"
                        disabled={autoRotating}
                      >
                        <svg
                          className="h-3 w-3 sm:h-4 sm:w-4 mr-1"
                          xmlns="http://www.w3.org/2000/svg"
                          viewBox="0 0 20 20"
                          fill="currentColor"
                        >
                          <path
                            fillRule="evenodd"
                            d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z"
                            clipRule="evenodd"
                          />
                        </svg>
                        Xóa
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Card layout cho mobile */}
          <div className="sm:hidden">
            {tempProxyIPs.map((entry, index) => (
              <div
                key={index}
                className="p-4 border-b border-orange-100 animate-fadeIn"
              >
                <div className="flex justify-between items-start mb-2">
                  <div className="text-xs font-semibold text-orange-700">
                    IP: {entry.ip}
                  </div>
                  <button
                    onClick={() => handleDelete(index, true)}
                    className="text-red-600 hover:text-red-900 transition-colors duration-150 flex items-center text-xs"
                    disabled={autoRotating}
                  >
                    <svg
                      className="h-3 w-3 mr-1"
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path
                        fillRule="evenodd"
                        d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z"
                        clipRule="evenodd"
                      />
                    </svg>
                    Xóa
                  </button>
                </div>
                <div className="text-xs text-gray-600 mb-1">
                  <span className="font-medium">Proxy:</span> {entry.proxy}
                </div>
                <div className="text-xs text-gray-500">
                  <span className="font-medium">Thời gian:</span>{" "}
                  {new Date(entry.timestamp).toLocaleString("vi-VN")}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Bảng IP Chính */}
      {proxyIPs && proxyIPs.length > 0 && (
        <div
          className="bg-white rounded-xl shadow-md overflow-hidden transition-all duration-300 hover:shadow-lg border border-indigo-100"
          ref={tableRef}
        >
          <div className="p-3 sm:p-4 border-b border-indigo-100 bg-gradient-to-r from-indigo-50 to-purple-50">
            <h2 className="text-base sm:text-lg font-medium text-indigo-800">
              Lịch Sử IP Proxy
            </h2>
            <p className="text-xs sm:text-sm text-indigo-600">
              Danh sách các IP đã được kiểm tra
            </p>
          </div>

          {/* Bảng IP chính cho desktop */}
          <div className="hidden sm:block overflow-x-auto">
            <table className="min-w-full divide-y divide-indigo-100">
              <thead className="bg-indigo-50">
                <tr>
                  <th
                    scope="col"
                    className="px-4 sm:px-6 py-2 sm:py-3 text-left text-xs font-medium text-indigo-800 uppercase tracking-wider"
                  >
                    Proxy
                  </th>
                  <th
                    scope="col"
                    className="px-4 sm:px-6 py-2 sm:py-3 text-left text-xs font-medium text-indigo-800 uppercase tracking-wider"
                  >
                    Địa Chỉ IP
                  </th>
                  <th
                    scope="col"
                    className="px-4 sm:px-6 py-2 sm:py-3 text-left text-xs font-medium text-indigo-800 uppercase tracking-wider"
                  >
                    Thời Gian Kiểm Tra
                  </th>
                  <th
                    scope="col"
                    className="px-4 sm:px-6 py-2 sm:py-3 text-left text-xs font-medium text-indigo-800 uppercase tracking-wider"
                  >
                    Thao Tác
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-indigo-100">
                {proxyIPs.map((entry, index) => (
                  <tr
                    key={index}
                    className={`hover:bg-indigo-50 transition-all duration-200 animate-fadeIn ${
                      isMatchingIp(entry.ip) ? "bg-green-50" : ""
                    }`}
                  >
                    <td className="px-4 sm:px-6 py-2 sm:py-4 whitespace-nowrap text-xs sm:text-sm font-medium text-gray-900">
                      {entry.proxy}
                    </td>
                    <td
                      className={`px-4 sm:px-6 py-2 sm:py-4 whitespace-nowrap text-xs sm:text-sm font-semibold ${
                        isMatchingIp(entry.ip)
                          ? "text-green-700"
                          : "text-indigo-700"
                      }`}
                    >
                      {entry.ip}
                      {isMatchingIp(entry.ip) && (
                        <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          Phù hợp
                        </span>
                      )}
                    </td>
                    <td className="px-4 sm:px-6 py-2 sm:py-4 whitespace-nowrap text-xs sm:text-sm text-gray-500">
                      {new Date(entry.timestamp).toLocaleString("vi-VN")}
                    </td>
                    <td className="px-4 sm:px-6 py-2 sm:py-4 whitespace-nowrap text-right text-xs sm:text-sm font-medium">
                      <button
                        onClick={() => handleDelete(index, false)}
                        className="text-red-600 hover:text-red-900 transition-colors duration-150 flex items-center"
                      >
                        <svg
                          className="h-3 w-3 sm:h-4 sm:w-4 mr-1"
                          xmlns="http://www.w3.org/2000/svg"
                          viewBox="0 0 20 20"
                          fill="currentColor"
                        >
                          <path
                            fillRule="evenodd"
                            d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z"
                            clipRule="evenodd"
                          />
                        </svg>
                        Xóa
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Card layout cho mobile */}
          <div className="sm:hidden">
            {proxyIPs.map((entry, index) => (
              <div
                key={index}
                className={`p-4 border-b border-indigo-100 animate-fadeIn ${
                  isMatchingIp(entry.ip) ? "bg-green-50" : ""
                }`}
              >
                <div className="flex justify-between items-start mb-2">
                  <div
                    className={`text-xs font-semibold ${
                      isMatchingIp(entry.ip)
                        ? "text-green-700"
                        : "text-indigo-700"
                    }`}
                  >
                    IP: {entry.ip}
                    {isMatchingIp(entry.ip) && (
                      <span className="ml-2 inline-flex items-center px-1.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        Phù hợp
                      </span>
                    )}
                  </div>
                  <button
                    onClick={() => handleDelete(index, false)}
                    className="text-red-600 hover:text-red-900 transition-colors duration-150 flex items-center text-xs"
                  >
                    <svg
                      className="h-3 w-3 mr-1"
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path
                        fillRule="evenodd"
                        d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z"
                        clipRule="evenodd"
                      />
                    </svg>
                    Xóa
                  </button>
                </div>
                <div className="text-xs text-gray-600 mb-1">
                  <span className="font-medium">Proxy:</span> {entry.proxy}
                </div>
                <div className="text-xs text-gray-500">
                  <span className="font-medium">Thời gian:</span>{" "}
                  {new Date(entry.timestamp).toLocaleString("vi-VN")}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ProxyTable;
