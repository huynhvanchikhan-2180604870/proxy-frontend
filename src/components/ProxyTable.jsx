// filepath: c:\Users\huynh\OneDrive\Máy tính\RollProxy\app\src\components\ProxyTable.jsx
import { useRef } from "react";

const ProxyTable = ({ proxyIPs, onDelete }) => {
  const tableRef = useRef(null);

  const handleDelete = (index) => {
    onDelete(index);
  };

  if (!proxyIPs || proxyIPs.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-md p-8 text-center text-gray-500 transition-all duration-300 hover:shadow-lg border border-indigo-100">
        <svg
          className="mx-auto h-12 w-12 text-gray-400 mb-4"
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
        <p className="text-lg font-medium mb-2">Chưa có dữ liệu IP</p>
        <p>Nhập thông tin proxy và nhấn "Đổi IP Và Kiểm Tra" để bắt đầu.</p>
      </div>
    );
  }

  return (
    <div
      className="bg-white rounded-xl shadow-md overflow-hidden transition-all duration-300 hover:shadow-lg border border-indigo-100"
      ref={tableRef}
    >
      <div className="p-4 border-b border-indigo-100 bg-gradient-to-r from-indigo-50 to-purple-50">
        <h2 className="text-lg font-medium text-indigo-800">
          Lịch Sử IP Proxy
        </h2>
        <p className="text-sm text-indigo-600">
          Danh sách các IP đã được kiểm tra
        </p>
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-indigo-100">
          <thead className="bg-indigo-50">
            <tr>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-indigo-800 uppercase tracking-wider"
              >
                Proxy
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-indigo-800 uppercase tracking-wider"
              >
                Địa Chỉ IP
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-indigo-800 uppercase tracking-wider"
              >
                Thời Gian Kiểm Tra
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-indigo-800 uppercase tracking-wider"
              >
                Thao Tác
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-indigo-100">
            {proxyIPs.map((entry, index) => (
              <tr
                key={index}
                className="hover:bg-indigo-50 transition-all duration-200 animate-fadeIn"
              >
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  {entry.proxy}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-indigo-700 font-semibold">
                  {entry.ip}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {new Date(entry.timestamp).toLocaleString("vi-VN")}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <button
                    onClick={() => handleDelete(index)}
                    className="text-red-600 hover:text-red-900 transition-colors duration-150 flex items-center"
                  >
                    <svg
                      className="h-4 w-4 mr-1"
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
    </div>
  );
};

export default ProxyTable;
