import { useRef, useState } from "react";

const ProxyTable = ({
  proxyIPs,
  tempProxyIPs,
  targetIpPrefix,
  onDelete,
  onClearTemp,
  onClearAll, // Thêm prop mới
  autoRotating,
  onAddToDatabase,
}) => {
  const tableRef = useRef(null);
  const tempTableRef = useRef(null);
  const [copiedIndex, setCopiedIndex] = useState(null);

  const handleDelete = (index, isTemp = false) => {
    onDelete(index, isTemp);
  };

  const handleAddToDatabase = (ip) => {
    if (onAddToDatabase) {
      onAddToDatabase(ip);
    }
  };

  // Hàm mới để copy proxy
  const copyProxy = (proxy, index, isTemp = false) => {
    if (!proxy) return;

    // Tách proxy để lấy domain:port:username:password
    const parts = proxy.split("@");
    if (parts.length !== 2) return;

    const [auth, server] = parts;
    const [username, password] = auth.split(":");
    const [domain, port] = server.split(":");

    // Tạo định dạng mới domain:port:username:password
    const formattedProxy = `${domain}:${port}:${username}:${password}`;

    // Copy vào clipboard
    navigator.clipboard
      .writeText(formattedProxy)
      .then(() => {
        // Ghi nhớ item đã copy để hiển thị hiệu ứng
        setCopiedIndex(isTemp ? `temp-${index}` : `main-${index}`);

        // Xóa hiệu ứng sau 2 giây
        setTimeout(() => {
          setCopiedIndex(null);
        }, 2000);
      })
      .catch((err) => {
        console.error("Không thể copy proxy: ", err);
      });
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
                    <td className="px-4 sm:px-6 py-2 sm:py-4 whitespace-nowrap text-xs sm:text-sm font-medium text-gray-900 flex items-center">
                      {entry.proxy}
                      <button
                        onClick={() => copyProxy(entry.proxy, index, true)}
                        className="ml-2 text-orange-500 hover:text-orange-700"
                        title="Copy proxy"
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-4 w-4"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
                          />
                        </svg>
                      </button>
                      {copiedIndex === `temp-${index}` && (
                        <span className="ml-2 text-xs text-green-600 animate-fadeIn">
                          Đã copy!
                        </span>
                      )}
                    </td>
                    <td className="px-4 sm:px-6 py-2 sm:py-4 whitespace-nowrap text-xs sm:text-sm font-semibold text-orange-700">
                      {entry.ip}
                      {entry.existsInDb && (
                        <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                          Đã có CSDL
                        </span>
                      )}
                      {!entry.existsInDb && onAddToDatabase && (
                        <button
                          onClick={() => handleAddToDatabase(entry.ip)}
                          className="ml-2 inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 hover:bg-green-200 transition-colors"
                        >
                          <svg
                            className="w-3 h-3 mr-1"
                            xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 0 20 20"
                            fill="currentColor"
                          >
                            <path
                              fillRule="evenodd"
                              d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z"
                              clipRule="evenodd"
                            />
                          </svg>
                          Thêm vào CSDL
                        </button>
                      )}
                    </td>
                    <td className="px-4 sm:px-6 py-2 sm:py-4 whitespace-nowrap text-xs sm:text-sm text-gray-500">
                      {new Date(entry.timestamp).toLocaleString("vi-VN")}
                      {entry.existsInDb && entry.dateAddedToDb && (
                        <div className="text-xs text-blue-600">
                          Thêm vào CSDL: {entry.dateAddedToDb}
                        </div>
                      )}
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
                    {entry.existsInDb && (
                      <span className="ml-2 inline-flex items-center px-1.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        Đã có CSDL
                      </span>
                    )}
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
                <div className="text-xs text-gray-600 mb-1 flex items-center">
                  <span className="font-medium">Proxy:</span> {entry.proxy}
                  <button
                    onClick={() => copyProxy(entry.proxy, index, true)}
                    className="ml-2 text-orange-500 hover:text-orange-700"
                    title="Copy proxy"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-3 w-3"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
                      />
                    </svg>
                  </button>
                  {copiedIndex === `temp-${index}` && (
                    <span className="ml-2 text-xs text-green-600 animate-fadeIn">
                      Đã copy!
                    </span>
                  )}
                </div>
                <div className="text-xs text-gray-500">
                  <span className="font-medium">Thời gian:</span>{" "}
                  {new Date(entry.timestamp).toLocaleString("vi-VN")}
                </div>
                {entry.existsInDb && entry.dateAddedToDb && (
                  <div className="text-xs text-blue-600 mt-1">
                    <span className="font-medium">Thêm vào CSDL:</span>{" "}
                    {entry.dateAddedToDb}
                  </div>
                )}
                {!entry.existsInDb && onAddToDatabase && (
                  <div className="mt-2">
                    <button
                      onClick={() => handleAddToDatabase(entry.ip)}
                      className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-green-100 text-green-800 hover:bg-green-200 transition-colors"
                    >
                      <svg
                        className="w-3 h-3 mr-1"
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <path
                          fillRule="evenodd"
                          d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z"
                          clipRule="evenodd"
                        />
                      </svg>
                      Thêm vào CSDL
                    </button>
                  </div>
                )}
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
          <div className="p-3 sm:p-4 border-b border-indigo-100 bg-gradient-to-r from-indigo-50 to-purple-50 flex justify-between items-center">
            <div>
              <h2 className="text-base sm:text-lg font-medium text-indigo-800">
                Lịch Sử IP Proxy ({proxyIPs.length})
              </h2>
              <p className="text-xs sm:text-sm text-indigo-600">
                Danh sách các IP đã được kiểm tra
              </p>
            </div>
            {/* Thêm nút xóa tất cả */}
            <button
              onClick={onClearAll}
              disabled={autoRotating}
              className={`px-3 py-1 sm:px-4 sm:py-2 rounded-lg text-xs sm:text-sm font-medium transition-all duration-200 ${
                autoRotating
                  ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                  : "bg-indigo-600 text-white hover:bg-indigo-700"
              }`}
            >
              Xóa Tất Cả
            </button>
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
                    <td className="px-4 sm:px-6 py-2 sm:py-4 whitespace-nowrap text-xs sm:text-sm font-medium text-gray-900 flex items-center">
                      {entry.proxy}
                      <button
                        onClick={() => copyProxy(entry.proxy, index, false)}
                        className="ml-2 text-indigo-500 hover:text-indigo-700"
                        title="Copy proxy"
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-4 w-4"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
                          />
                        </svg>
                      </button>
                      {copiedIndex === `main-${index}` && (
                        <span className="ml-2 text-xs text-green-600 animate-fadeIn">
                          Đã copy!
                        </span>
                      )}
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
                      {entry.existsInDb && (
                        <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                          Đã có CSDL
                        </span>
                      )}
                      {!entry.existsInDb && onAddToDatabase && (
                        <button
                          onClick={() => handleAddToDatabase(entry.ip)}
                          className="ml-2 inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 hover:bg-green-200 transition-colors"
                        >
                          <svg
                            className="w-3 h-3 mr-1"
                            xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 0 20 20"
                            fill="currentColor"
                          >
                            <path
                              fillRule="evenodd"
                              d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z"
                              clipRule="evenodd"
                            />
                          </svg>
                          Thêm vào CSDL
                        </button>
                      )}
                    </td>
                    <td className="px-4 sm:px-6 py-2 sm:py-4 whitespace-nowrap text-xs sm:text-sm text-gray-500">
                      {new Date(entry.timestamp).toLocaleString("vi-VN")}
                      {entry.existsInDb && entry.dateAddedToDb && (
                        <div className="text-xs text-blue-600">
                          Thêm vào CSDL: {entry.dateAddedToDb}
                        </div>
                      )}
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
                    {entry.existsInDb && (
                      <span className="ml-2 inline-flex items-center px-1.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        Đã có CSDL
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
                <div className="text-xs text-gray-600 mb-1 flex items-center">
                  <span className="font-medium">Proxy:</span> {entry.proxy}
                  <button
                    onClick={() => copyProxy(entry.proxy, index, false)}
                    className="ml-2 text-indigo-500 hover:text-indigo-700"
                    title="Copy proxy"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-3 w-3"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
                      />
                    </svg>
                  </button>
                  {copiedIndex === `main-${index}` && (
                    <span className="ml-2 text-xs text-green-600 animate-fadeIn">
                      Đã copy!
                    </span>
                  )}
                </div>
                <div className="text-xs text-gray-500">
                  <span className="font-medium">Thời gian:</span>{" "}
                  {new Date(entry.timestamp).toLocaleString("vi-VN")}
                </div>
                {entry.existsInDb && entry.dateAddedToDb && (
                  <div className="text-xs text-blue-600 mt-1">
                    <span className="font-medium">Thêm vào CSDL:</span>{" "}
                    {entry.dateAddedToDb}
                  </div>
                )}
                {!entry.existsInDb && onAddToDatabase && (
                  <div className="mt-2">
                    <button
                      onClick={() => handleAddToDatabase(entry.ip)}
                      className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-green-100 text-green-800 hover:bg-green-200 transition-colors"
                    >
                      <svg
                        className="w-3 h-3 mr-1"
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <path
                          fillRule="evenodd"
                          d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z"
                          clipRule="evenodd"
                        />
                      </svg>
                      Thêm vào CSDL
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ProxyTable;
