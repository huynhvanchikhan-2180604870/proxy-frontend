import { useState } from "react";
import LoginForm from "./LoginForm";
import RegisterForm from "./RegisterForm";

const AuthContainer = ({ onLogin, onRegister, loading, error }) => {
  const [activeTab, setActiveTab] = useState("login"); // login, register

  return (
    <div className="max-w-md mx-auto">
      <div className="mb-6 flex rounded-lg overflow-hidden border border-indigo-200">
        <button
          className={`flex-1 text-center py-3 font-medium transition-all duration-200 ${
            activeTab === "login"
              ? "bg-indigo-600 text-white"
              : "bg-white text-indigo-600 hover:bg-indigo-50"
          }`}
          onClick={() => setActiveTab("login")}
        >
          Đăng Nhập
        </button>
        <button
          className={`flex-1 text-center py-3 font-medium transition-all duration-200 ${
            activeTab === "register"
              ? "bg-indigo-600 text-white"
              : "bg-white text-indigo-600 hover:bg-indigo-50"
          }`}
          onClick={() => setActiveTab("register")}
        >
          Đăng Ký
        </button>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded-lg text-sm animate-pulse">
          <div className="flex items-center">
            <svg
              className="h-5 w-5 mr-2 text-red-500 flex-shrink-0"
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

      {activeTab === "login" ? (
        <LoginForm onLogin={onLogin} loading={loading} />
      ) : (
        <RegisterForm onRegister={onRegister} loading={loading} />
      )}
    </div>
  );
};

export default AuthContainer;
