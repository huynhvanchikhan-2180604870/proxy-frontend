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
    proxyIPs,
    loading,
    error,
    message,
    rotateAndCheckIp,
    deleteProxyRecord,
  } = useProxyManagement();

  const errorRef = useRef(null);
  const messageRef = useRef(null);

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-purple-50">
      <div className="max-w-6xl mx-auto px-4 py-8">
        <header className="text-center mb-8">
          <h1 className="text-3xl font-bold text-indigo-800 mb-2">
            Công Cụ Quản Lý Proxy
          </h1>
          <p className="text-indigo-600 mb-2">
            Đổi IP proxy dễ dàng và nhanh chóng
          </p>
          <p className="text-sm text-gray-500">
            Phát triển bởi: HUỲNH VĂN CHI KHANH
          </p>
        </header>

        <div className="bg-white rounded-xl shadow-xl p-6 mb-8 transition-all duration-300 hover:shadow-2xl border border-indigo-100">
          <ProxyForm
            proxyString={proxyString}
            setProxyString={setProxyString}
            apiKey={apiKey}
            setApiKey={setApiKey}
            onRotateAndCheckIp={rotateAndCheckIp}
            loading={loading}
          />

          {error && (
            <div
              className="mt-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded-lg animate-pulse"
              ref={errorRef}
            >
              <div className="flex items-center">
                <svg
                  className="h-5 w-5 mr-2 text-red-500"
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
                <span>{error}</span>
              </div>
            </div>
          )}

          {message && (
            <div
              className="mt-4 p-3 bg-green-100 border border-green-400 text-green-700 rounded-lg animate-bounce"
              ref={messageRef}
            >
              <div className="flex items-center">
                <svg
                  className="h-5 w-5 mr-2 text-green-500"
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                    clipRule="evenodd"
                  />
                </svg>
                <span>{message}</span>
              </div>
            </div>
          )}
        </div>

        <ProxyTable proxyIPs={proxyIPs} onDelete={deleteProxyRecord} />

        <footer className="mt-10 text-center text-sm text-gray-500">
          <p>© 2025 HUỲNH VĂN CHI KHAN. Mọi quyền được bảo lưu.</p>
          <p className="mt-1">Sử dụng dịch vụ từ ProxyNo1.com</p>
        </footer>
      </div>
    </div>
  );
}

export default App;
