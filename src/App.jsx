import { useRef } from "react";
import ProxyForm from "./components/ProxyForm";
import ProxyTable from "./components/ProxyTable";
import { useProxyManagement } from "./hooks/useProxyManagement";

function App() {
  const {
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
    rotateAndCheckIp,
    autoRotateIp,
    deleteProxyRecord,
    clearTempProxyIPs,
  } = useProxyManagement();

  const errorRef = useRef(null);
  const messageRef = useRef(null);

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-purple-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-4 sm:py-8">
        <header className="text-center mb-4 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-indigo-800 mb-2">
            Công Cụ Quản Lý Proxy
          </h1>
          <p className="text-sm sm:text-base text-indigo-600 mb-2">
            Đổi IP proxy dễ dàng và nhanh chóng
          </p>
          <p className="text-sm text-gray-500">
            Phát triển bởi: HUỲNH VĂN CHÍ KHAN
          </p>
        </header>

        <div className="bg-white rounded-xl shadow-xl p-4 sm:p-6 mb-6 sm:mb-8 transition-all duration-300 hover:shadow-2xl border border-indigo-100">
          <ProxyForm
            proxyString={proxyString}
            setProxyString={setProxyString}
            apiKey={apiKey}
            setApiKey={setApiKey}
            targetIpPrefix={targetIpPrefix}
            setTargetIpPrefix={setTargetIpPrefix}
            onRotateAndCheckIp={rotateAndCheckIp}
            onAutoRotateIp={autoRotateIp}
            loading={loading}
            autoRotating={autoRotating}
          />

          {error && (
            <div
              className="mt-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded-lg animate-pulse text-sm sm:text-base"
              ref={errorRef}
            >
              <div className="flex items-center">
                <svg
                  className="h-4 w-4 sm:h-5 sm:w-5 mr-2 text-red-500 flex-shrink-0"
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                    clipRule="evenodd"
                  />
                </svg>
                <span className="break-words">{error}</span>
              </div>
            </div>
          )}

          {message && (
            <div
              className={`mt-4 p-3 border rounded-lg text-sm sm:text-base ${
                autoRotating
                  ? "bg-blue-100 border-blue-400 text-blue-700"
                  : "bg-green-100 border-green-400 text-green-700 animate-bounce"
              }`}
              ref={messageRef}
            >
              <div className="flex items-center">
                <svg
                  className={`h-4 w-4 sm:h-5 sm:w-5 mr-2 flex-shrink-0 ${
                    autoRotating ? "text-blue-500" : "text-green-500"
                  }`}
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  {autoRotating ? (
                    <path
                      fillRule="evenodd"
                      d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z"
                      clipRule="evenodd"
                    />
                  ) : (
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                      clipRule="evenodd"
                    />
                  )}
                </svg>
                <span className="break-words">{message}</span>
              </div>
            </div>
          )}
        </div>

        <ProxyTable
          proxyIPs={proxyIPs}
          tempProxyIPs={tempProxyIPs}
          targetIpPrefix={targetIpPrefix}
          onDelete={deleteProxyRecord}
          onClearTemp={clearTempProxyIPs}
          autoRotating={autoRotating}
        />

        <footer className="mt-10 text-center text-sm text-gray-500">
          <p>© 2025 HUỲNH VĂN CHÍ KHAN. Mọi quyền được bảo lưu.</p>
          <p className="mt-1">Sử dụng dịch vụ từ ProxyNo1.com</p>
        </footer>
      </div>
    </div>
  );
}

export default App;
