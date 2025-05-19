import { useState, useEffect } from "react";
import { useAuth } from "../hooks/useAuth";

const AutoFillForm = () => {
  const { user } = useAuth();
  const [inputString, setInputString] = useState("");
  const [parsedData, setParsedData] = useState(null);
  const [savedProfiles, setSavedProfiles] = useState([]);
  const [activeProfile, setActiveProfile] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [showExamples, setShowExamples] = useState(false);

  // Tải các profile đã lưu
  useEffect(() => {
    if (user) {
      const storedProfiles = localStorage.getItem(`bankProfiles_${user.id}`);
      if (storedProfiles) {
        setSavedProfiles(JSON.parse(storedProfiles));
      }
    }
  }, [user]);

  // Phân tích chuỗi đầu vào
  const parseInputString = (input) => {
    try {
      const parts = input.split("|");

      if (parts.length < 9) {
        setError("Định dạng không hợp lệ. Vui lòng kiểm tra lại.");
        return null;
      }

      return {
        fullName: parts[0]?.trim(),
        accountNumber: parts[1]?.trim(),
        bankName: parts[2]?.trim(),
        branch: parts[3]?.trim(),
        username: parts[4]?.trim(),
        password: parts[5]?.trim(),
        withdrawPassword: parts[6]?.trim(),
        phone: parts[7]?.trim(),
        email: parts[8]?.trim(),
      };
    } catch (err) {
      console.error("Lỗi khi phân tích chuỗi:", err);
      setError("Định dạng không hợp lệ. Vui lòng kiểm tra lại.");
      return null;
    }
  };

  const handleParse = () => {
    setError("");
    const data = parseInputString(inputString);
    if (data) {
      setParsedData(data);
      setShowForm(true);
    }
  };

  const handleSaveProfile = () => {
    if (!parsedData || !parsedData.fullName) {
      setError("Không có dữ liệu hợp lệ để lưu");
      return;
    }

    const newProfile = {
      id: Date.now().toString(),
      ...parsedData,
      createdAt: new Date().toISOString(),
    };

    const updatedProfiles = [newProfile, ...savedProfiles];
    setSavedProfiles(updatedProfiles);
    localStorage.setItem(
      `bankProfiles_${user.id}`,
      JSON.stringify(updatedProfiles)
    );

    setSuccessMessage("Đã lưu profile thành công!");
    setTimeout(() => setSuccessMessage(""), 3000);

    setActiveProfile(newProfile);
    setInputString("");
    setShowForm(false);
  };

  const handleSelectProfile = (profile) => {
    setActiveProfile(profile);
    setParsedData(profile);
    setShowForm(false);
  };

  const handleDeleteProfile = (id, e) => {
    e.stopPropagation();
    if (window.confirm("Bạn có chắc chắn muốn xóa profile này?")) {
      const updatedProfiles = savedProfiles.filter((p) => p.id !== id);
      setSavedProfiles(updatedProfiles);
      localStorage.setItem(
        `bankProfiles_${user.id}`,
        JSON.stringify(updatedProfiles)
      );

      if (activeProfile?.id === id) {
        setActiveProfile(null);
      }
    }
  };

  // Các hàm tự động điền thông tin
  const autoFillLoginForm = () => {
    if (!activeProfile) return;

    // Tìm các trường đăng nhập trên trang
    const usernameFields = document.querySelectorAll(
      'input[type="text"][name*="user"], input[type="text"][name*="login"], input[type="email"], input[name*="username"], input[name*="account"]'
    );
    const passwordFields = document.querySelectorAll('input[type="password"]');

    // Tự động điền username
    if (usernameFields.length > 0) {
      const usernameField = usernameFields[0];
      usernameField.value = activeProfile.username;
      usernameField.dispatchEvent(new Event("input", { bubbles: true }));
      usernameField.dispatchEvent(new Event("change", { bubbles: true }));
    }

    // Tự động điền password
    if (passwordFields.length > 0) {
      const passwordField = passwordFields[0];
      passwordField.value = activeProfile.password;
      passwordField.dispatchEvent(new Event("input", { bubbles: true }));
      passwordField.dispatchEvent(new Event("change", { bubbles: true }));
    }

    showNotification("Đã điền thông tin đăng nhập!");
  };

  const autoFillWithdrawForm = () => {
    if (!activeProfile) return;

    // Tìm trường mật khẩu rút tiền
    const withdrawFields = document.querySelectorAll(
      'input[type="password"][name*="withdraw"], input[type="password"][name*="security"], input[name*="pin"], input[name*="transaction"]'
    );

    if (withdrawFields.length > 0) {
      const withdrawField = withdrawFields[0];
      withdrawField.value = activeProfile.withdrawPassword;
      withdrawField.dispatchEvent(new Event("input", { bubbles: true }));
      withdrawField.dispatchEvent(new Event("change", { bubbles: true }));
      showNotification("Đã điền mật khẩu rút tiền!");
    } else {
      // Nếu không tìm thấy trường cụ thể, thử điền vào trường password đầu tiên
      const passwordFields = document.querySelectorAll(
        'input[type="password"]'
      );
      if (passwordFields.length > 0) {
        const passwordField = passwordFields[0];
        passwordField.value = activeProfile.withdrawPassword;
        passwordField.dispatchEvent(new Event("input", { bubbles: true }));
        passwordField.dispatchEvent(new Event("change", { bubbles: true }));
        showNotification("Đã điền mật khẩu rút tiền vào trường mật khẩu!");
      } else {
        showNotification("Không tìm thấy trường mật khẩu rút tiền", "error");
      }
    }
  };

  const autoFillBankInfo = () => {
    if (!activeProfile) return;

    // Tìm các trường thông tin ngân hàng
    const bankNameFields = document.querySelectorAll(
      'select[name*="bank"], input[name*="bank"]'
    );
    const accountNumberFields = document.querySelectorAll(
      'input[name*="account"], input[name*="number"], input[name*="stk"]'
    );
    const nameFields = document.querySelectorAll(
      'input[name*="name"], input[name*="holder"], input[name*="fullname"]'
    );
    const branchFields = document.querySelectorAll(
      'input[name*="branch"], input[name*="chi_nhanh"]'
    );

    let filled = false;

    // Điền thông tin ngân hàng
    if (bankNameFields.length > 0) {
      filled = true;
      const field = bankNameFields[0];
      if (field.tagName.toLowerCase() === "select") {
        // Tìm option phù hợp
        const options = Array.from(field.options);
        const matchingOption = options.find((opt) =>
          opt.text.toLowerCase().includes(activeProfile.bankName.toLowerCase())
        );

        if (matchingOption) {
          field.value = matchingOption.value;
        } else {
          // Nếu không tìm thấy option phù hợp, thử thiết lập giá trị trực tiếp
          field.value = activeProfile.bankName;
        }
        field.dispatchEvent(new Event("change", { bubbles: true }));
      } else {
        field.value = activeProfile.bankName;
        field.dispatchEvent(new Event("input", { bubbles: true }));
        field.dispatchEvent(new Event("change", { bubbles: true }));
      }
    }

    // Số tài khoản
    if (accountNumberFields.length > 0) {
      filled = true;
      const field = accountNumberFields[0];
      field.value = activeProfile.accountNumber;
      field.dispatchEvent(new Event("input", { bubbles: true }));
      field.dispatchEvent(new Event("change", { bubbles: true }));
    }

    // Tên chủ tài khoản
    if (nameFields.length > 0) {
      filled = true;
      const field = nameFields[0];
      field.value = activeProfile.fullName;
      field.dispatchEvent(new Event("input", { bubbles: true }));
      field.dispatchEvent(new Event("change", { bubbles: true }));
    }

    // Chi nhánh
    if (branchFields.length > 0) {
      filled = true;
      const field = branchFields[0];
      field.value = activeProfile.branch;
      field.dispatchEvent(new Event("input", { bubbles: true }));
      field.dispatchEvent(new Event("change", { bubbles: true }));
    }

    if (filled) {
      showNotification("Đã điền thông tin ngân hàng!");
    } else {
      showNotification(
        "Không tìm thấy các trường thông tin ngân hàng!",
        "error"
      );
    }
  };

  // Điền thông tin cá nhân khác (sđt, email)
  const autoFillPersonalInfo = () => {
    if (!activeProfile) return;

    const phoneFields = document.querySelectorAll(
      'input[type="tel"], input[name*="phone"], input[name*="mobile"]'
    );
    const emailFields = document.querySelectorAll(
      'input[type="email"], input[name*="email"]'
    );

    let filled = false;

    // Điền số điện thoại
    if (phoneFields.length > 0) {
      filled = true;
      const phoneField = phoneFields[0];
      phoneField.value = activeProfile.phone;
      phoneField.dispatchEvent(new Event("input", { bubbles: true }));
      phoneField.dispatchEvent(new Event("change", { bubbles: true }));
    }

    // Điền email
    if (emailFields.length > 0) {
      filled = true;
      const emailField = emailFields[0];
      emailField.value = activeProfile.email;
      emailField.dispatchEvent(new Event("input", { bubbles: true }));
      emailField.dispatchEvent(new Event("change", { bubbles: true }));
    }

    if (filled) {
      showNotification("Đã điền thông tin liên hệ!");
    } else {
      showNotification(
        "Không tìm thấy các trường thông tin liên hệ!",
        "warning"
      );
    }
  };

  const showNotification = (message, type = "success") => {
    // Tạo thông báo
    const notification = document.createElement("div");
    notification.style.position = "fixed";
    notification.style.bottom = "20px";
    notification.style.right = "20px";
    notification.style.padding = "12px 20px";
    notification.style.borderRadius = "4px";
    notification.style.boxShadow = "0 3px 10px rgba(0,0,0,0.2)";
    notification.style.zIndex = "9999";
    notification.style.fontSize = "14px";
    notification.style.display = "flex";
    notification.style.alignItems = "center";
    notification.style.transition = "all 0.3s ease";
    notification.style.animation = "slideIn 0.3s ease forwards";

    // Thiết lập style dựa trên loại thông báo
    if (type === "success") {
      notification.style.backgroundColor = "#10b981";
      notification.style.color = "white";
      notification.style.borderLeft = "4px solid #047857";
    } else if (type === "error") {
      notification.style.backgroundColor = "#ef4444";
      notification.style.color = "white";
      notification.style.borderLeft = "4px solid #b91c1c";
    } else if (type === "warning") {
      notification.style.backgroundColor = "#f59e0b";
      notification.style.color = "white";
      notification.style.borderLeft = "4px solid #b45309";
    }

    // Thêm icon
    let iconSvg = "";
    if (type === "success") {
      iconSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>`;
    } else if (type === "error") {
      iconSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="15" y1="9" x2="9" y2="15"></line><line x1="9" y1="9" x2="15" y2="15"></line></svg>`;
    } else if (type === "warning") {
      iconSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path><line x1="12" y1="9" x2="12" y2="13"></line><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>`;
    }

    const iconContainer = document.createElement("span");
    iconContainer.style.marginRight = "10px";
    iconContainer.innerHTML = iconSvg;
    notification.appendChild(iconContainer);

    const textNode = document.createElement("span");
    textNode.textContent = message;
    notification.appendChild(textNode);

    // Thêm animation style
    const style = document.createElement("style");
    style.textContent = `
      @keyframes slideIn {
        from {
          transform: translateX(100%);
          opacity: 0;
        }
        to {
          transform: translateX(0);
          opacity: 1;
        }
      }
      @keyframes slideOut {
        from {
          transform: translateX(0);
          opacity: 1;
        }
        to {
          transform: translateX(100%);
          opacity: 0;
        }
      }
    `;
    document.head.appendChild(style);

    document.body.appendChild(notification);

    // Xóa thông báo sau 3 giây
    setTimeout(() => {
      notification.style.animation = "slideOut 0.3s ease forwards";
      setTimeout(() => {
        if (notification.parentNode === document.body) {
          document.body.removeChild(notification);
        }
        if (style.parentNode === document.head) {
          document.head.removeChild(style);
        }
      }, 300);
    }, 3000);
  };

  // Lọc profiles theo từ khóa tìm kiếm
  const filteredProfiles = savedProfiles.filter((profile) => {
    if (!searchTerm) return true;

    const searchLower = searchTerm.toLowerCase();
    return (
      profile.fullName.toLowerCase().includes(searchLower) ||
      profile.bankName.toLowerCase().includes(searchLower) ||
      profile.username.toLowerCase().includes(searchLower) ||
      profile.accountNumber.includes(searchLower)
    );
  });

  return (
    <div className="bg-white rounded-xl shadow-xl overflow-hidden">
      <div className="bg-gradient-to-r from-green-50 to-green-100 border-b border-green-200 px-6 py-4">
        <div className="flex justify-between items-center">
          <h2 className="text-lg font-semibold text-green-800 flex items-center">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5 mr-2"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
            </svg>
            Công Cụ Tự Điền Thông Tin
          </h2>
          <button
            className="inline-flex items-center px-3 py-1.5 border border-green-600 text-green-700 bg-green-50 rounded-lg hover:bg-green-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-colors"
            onClick={() => setShowForm(!showForm)}
          >
            {showForm ? (
              <>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5 mr-1"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                    clipRule="evenodd"
                  />
                </svg>
                Đóng
              </>
            ) : (
              <>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5 mr-1"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z"
                    clipRule="evenodd"
                  />
                </svg>
                Thêm Mới
              </>
            )}
          </button>
        </div>
      </div>

      {showForm && (
        <div className="p-6 border-b border-gray-200">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Nhập chuỗi thông tin:
            </label>
            <div className="flex items-center mb-2">
              <button
                className="text-xs text-blue-600 hover:text-blue-800 flex items-center focus:outline-none"
                onClick={() => setShowExamples(!showExamples)}
              >
                {showExamples ? "Ẩn ví dụ" : "Xem ví dụ định dạng"}
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className={`h-4 w-4 ml-1 transition-transform ${
                    showExamples ? "rotate-180" : ""
                  }`}
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              </button>
            </div>

            {showExamples && (
              <div className="mb-3 text-xs bg-gray-50 p-3 rounded-md border border-gray-200">
                <p className="font-medium mb-1">
                  Định dạng:{" "}
                  <span className="font-normal">
                    Họ Tên|Số TK|Ngân Hàng|Chi Nhánh|Tài Khoản|Mật Khẩu|MK
                    Rút|SĐT|Email
                  </span>
                </p>
                <p className="text-gray-600">
                  Ví dụ: LE VAN BAO|1056953896|ACB|hai
                  duong|hebao255|Lebao9823|112233|0389079319|lehebao@gmail.com
                </p>
              </div>
            )}

            <textarea
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              value={inputString}
              onChange={(e) => setInputString(e.target.value)}
              placeholder="Nhập chuỗi thông tin theo định dạng"
              rows={3}
            ></textarea>
          </div>

          {error && (
            <div className="mt-2 p-2 bg-red-50 border-l-4 border-red-500 text-red-700 text-sm">
              <div className="flex items-center">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5 mr-1"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                    clipRule="evenodd"
                  />
                </svg>
                {error}
              </div>
            </div>
          )}

          <div className="mt-3 flex gap-2">
            <button
              className="flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              onClick={handleParse}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5 mr-1"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path d="M7 9a2 2 0 012-2h6a2 2 0 012 2v6a2 2 0 01-2 2H9a2 2 0 01-2-2V9z" />
                <path d="M5 3a2 2 0 00-2 2v6a2 2 0 002 2V5h8a2 2 0 00-2-2H5z" />
              </svg>
              Phân Tích
            </button>

            {parsedData && (
              <button
                className="flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                onClick={handleSaveProfile}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5 mr-1"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z"
                    clipRule="evenodd"
                  />
                </svg>
                Lưu Profile
              </button>
            )}
          </div>

          {parsedData && (
            <div className="mt-4 border border-gray-200 bg-gray-50 rounded-lg shadow-inner overflow-hidden">
              <div className="bg-gray-100 border-b border-gray-200 px-4 py-2">
                <h3 className="text-sm font-medium text-gray-700">
                  Thông tin đã phân tích:
                </h3>
              </div>
              <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="flex bg-white p-2 rounded border border-gray-200">
                  <span className="w-32 text-xs font-medium text-gray-500">
                    Họ Tên:
                  </span>
                  <span className="text-sm text-gray-900">
                    {parsedData.fullName}
                  </span>
                </div>
                <div className="flex bg-white p-2 rounded border border-gray-200">
                  <span className="w-32 text-xs font-medium text-gray-500">
                    Tài khoản:
                  </span>
                  <span className="text-sm text-gray-900">
                    {parsedData.username}
                  </span>
                </div>
                <div className="flex bg-white p-2 rounded border border-gray-200">
                  <span className="w-32 text-xs font-medium text-gray-500">
                    Mật khẩu:
                  </span>
                  <span className="text-sm text-gray-900">
                    {parsedData.password}
                  </span>
                </div>
                <div className="flex bg-white p-2 rounded border border-gray-200">
                  <span className="w-32 text-xs font-medium text-gray-500">
                    Ngân hàng:
                  </span>
                  <span className="text-sm text-gray-900">
                    {parsedData.bankName}
                  </span>
                </div>
                <div className="flex bg-white p-2 rounded border border-gray-200">
                  <span className="w-32 text-xs font-medium text-gray-500">
                    Số tài khoản:
                  </span>
                  <span className="text-sm text-gray-900">
                    {parsedData.accountNumber}
                  </span>
                </div>
                <div className="flex bg-white p-2 rounded border border-gray-200">
                  <span className="w-32 text-xs font-medium text-gray-500">
                    Chi nhánh:
                  </span>
                  <span className="text-sm text-gray-900">
                    {parsedData.branch}
                  </span>
                </div>
                <div className="flex bg-white p-2 rounded border border-gray-200">
                  <span className="w-32 text-xs font-medium text-gray-500">
                    Mật khẩu rút:
                  </span>
                  <span className="text-sm text-gray-900">
                    {parsedData.withdrawPassword}
                  </span>
                </div>
                <div className="flex bg-white p-2 rounded border border-gray-200">
                  <span className="w-32 text-xs font-medium text-gray-500">
                    Số điện thoại:
                  </span>
                  <span className="text-sm text-gray-900">
                    {parsedData.phone}
                  </span>
                </div>
                <div className="flex bg-white p-2 rounded border border-gray-200 md:col-span-2">
                  <span className="w-32 text-xs font-medium text-gray-500">
                    Email:
                  </span>
                  <span className="text-sm text-gray-900">
                    {parsedData.email}
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {successMessage && (
        <div className="px-6 py-3 bg-green-50 text-green-700 border-b border-green-200 flex items-center">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5 mr-2"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path
              fillRule="evenodd"
              d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
              clipRule="evenodd"
            />
          </svg>
          {successMessage}
        </div>
      )}

      <div className="px-6 pt-4 pb-2">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-base font-medium text-gray-700">
            Danh sách profiles ({filteredProfiles.length})
          </h3>

          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5 text-gray-400"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Tìm kiếm profile..."
              className="pl-10 pr-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 text-sm"
            />
          </div>
        </div>

        {filteredProfiles.length === 0 ? (
          <div className="py-8 text-center border-2 border-dashed border-gray-200 rounded-lg bg-gray-50">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-12 w-12 mx-auto text-gray-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
              />
            </svg>
            <p className="mt-2 text-sm text-gray-500">
              Chưa có profile nào được lưu
            </p>
            <button
              className="mt-3 px-4 py-2 text-sm text-indigo-600 bg-indigo-50 rounded-md hover:bg-indigo-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              onClick={() => setShowForm(true)}
            >
              Thêm profile mới
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-h-80 overflow-y-auto py-2">
            {filteredProfiles.map((profile) => (
              <div
                key={profile.id}
                className={`border rounded-lg overflow-hidden cursor-pointer transition-all ${
                  activeProfile?.id === profile.id
                    ? "border-green-500 bg-green-50 shadow"
                    : "border-gray-200 hover:border-gray-300 hover:shadow"
                }`}
                onClick={() => handleSelectProfile(profile)}
              >
                <div className="px-4 py-3 bg-white border-b border-gray-100 flex items-center justify-between">
                  <h4 className="font-medium text-gray-800 truncate">
                    {profile.fullName}
                  </h4>
                  <button
                    className="p-1 hover:bg-red-50 rounded-full transition-colors"
                    onClick={(e) => handleDeleteProfile(profile.id, e)}
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-4 w-4 text-red-500"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path
                        fillRule="evenodd"
                        d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </button>
                </div>
                <div className="px-4 py-2 bg-gray-50">
                  <div className="grid grid-cols-3 gap-1 mb-1">
                    <div className="col-span-1 text-xs text-gray-500">
                      Ngân hàng:
                    </div>
                    <div className="col-span-2 text-xs font-medium">
                      {profile.bankName}
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-1 mb-1">
                    <div className="col-span-1 text-xs text-gray-500">
                      Số TK:
                    </div>
                    <div className="col-span-2 text-xs font-medium">
                      {profile.accountNumber}
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-1">
                    <div className="col-span-1 text-xs text-gray-500">
                      Tài khoản:
                    </div>
                    <div className="col-span-2 text-xs font-medium">
                      {profile.username}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {activeProfile && (
        <div className="px-6 pt-2 pb-6">
          <div className="border-t border-gray-200 pt-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-base font-medium text-gray-700 flex items-center">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5 mr-2 text-green-600"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2h-1.528A6 6 0 004 9.528V4z" />
                  <path
                    fillRule="evenodd"
                    d="M8 10a4 4 0 00-3.446 6.032l-1.261 1.26a1 1 0 101.414 1.415l1.261-1.261A4 4 0 108 10zm-2 4a2 2 0 114 0 2 2 0 01-4 0z"
                    clipRule="evenodd"
                  />
                </svg>
                Tự động điền thông tin
              </h3>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <button
                className="flex items-center justify-center px-3 py-2 bg-indigo-50 text-indigo-700 rounded-lg hover:bg-indigo-100 transition-colors"
                onClick={autoFillLoginForm}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5 mr-1"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-6-3a2 2 0 11-4 0 2 2 0 014 0zm-2 4a5 5 0 00-4.546 2.916A5.986 5.986 0 005 10a1 1 0 001-1v-.667a4 4 0 01.8-2.4l.001-.001a4 4 0 01.527-.534 4 4 0 011.072-.49 4 4 0 012.402 0 4 4 0 011.072.49 4 4 0 01.527.534.973.973 0 01.073.087A4 4 0 0113 8.333V9a1 1 0 001 1c.562 0 1.094.117 1.572.325a.5.5 0 00.67-.228A7.98 7.98 0 0010 2C5.032 2 1 6.032 1 11a9 9 0 009 9 9 9 0 00-9-9 1 1 0 010-2zm8 5a3 3 0 00-2.995 2.824L9 13a1 1 0 11-2 0v-1a2 2 0 012-2 1 1 0 001-1 1 1 0 112 0 1 1 0 001 1 2 2 0 012 2v1a1 1 0 11-2 0l-.005-.824A3 3 0 0016 12z"
                    clipRule="evenodd"
                  />
                </svg>
                Điền Login
              </button>

              <button
                className="flex items-center justify-center px-3 py-2 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition-colors"
                onClick={autoFillBankInfo}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5 mr-1"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path d="M4 4a2 2 0 00-2 2v1h16V6a2 2 0 00-2-2H4z" />
                  <path
                    fillRule="evenodd"
                    d="M18 9H2v5a2 2 0 002 2h12a2 2 0 002-2V9zM4 13a1 1 0 011-1h1a1 1 0 110 2H5a1 1 0 01-1-1zm5-1a1 1 0 100 2h1a1 1 0 100-2H9z"
                    clipRule="evenodd"
                  />
                </svg>
                Điền Ngân Hàng
              </button>

              <button
                className="flex items-center justify-center px-3 py-2 bg-amber-50 text-amber-700 rounded-lg hover:bg-amber-100 transition-colors"
                onClick={autoFillWithdrawForm}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5 mr-1"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z"
                    clipRule="evenodd"
                  />
                </svg>
                Điền MK Rút
              </button>

              <button
                className="flex items-center justify-center px-3 py-2 bg-purple-50 text-purple-700 rounded-lg hover:bg-purple-100 transition-colors"
                onClick={autoFillPersonalInfo}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5 mr-1"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 2a1 1 0 00-1 1v1a1 1 0 002 0V3a1 1 0 00-1-1zM4 4h3a3 3 0 006 0h3a2 2 0 012 2v9a2 2 0 01-2 2H4a2 2 0 01-2-2V6a2 2 0 012-2zm2.5 7a1.5 1.5 0 100-3 1.5 1.5 0 000 3zm2.45 4a2.5 2.5 0 10-4.9 0h4.9zM12 9a1 1 0 100 2h3a1 1 0 100-2h-3zm-1 4a1 1 0 011-1h2a1 1 0 110 2h-2a1 1 0 01-1-1z"
                    clipRule="evenodd"
                  />
                </svg>
                Điền Liên Hệ
              </button>
            </div>

            <div className="mt-4 p-4 bg-gradient-to-r from-green-50 to-blue-50 rounded-lg border border-gray-200">
              <h4 className="text-xs font-semibold text-gray-700 uppercase mb-2">
                Profile đang chọn
              </h4>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-x-4 gap-y-2">
                <div className="flex items-center">
                  <span className="text-xs font-medium text-gray-500 w-24">
                    Họ tên:
                  </span>
                  <span className="text-sm font-medium">
                    {activeProfile.fullName}
                  </span>
                </div>
                <div className="flex items-center">
                  <span className="text-xs font-medium text-gray-500 w-24">
                    Tài khoản:
                  </span>
                  <span className="text-sm font-medium">
                    {activeProfile.username}
                  </span>
                </div>
                <div className="flex items-center">
                  <span className="text-xs font-medium text-gray-500 w-24">
                    Mật khẩu:
                  </span>
                  <span className="text-sm font-medium">
                    {activeProfile.password}
                  </span>
                </div>
                <div className="flex items-center">
                  <span className="text-xs font-medium text-gray-500 w-24">
                    MK rút tiền:
                  </span>
                  <span className="text-sm font-medium">
                    {activeProfile.withdrawPassword}
                  </span>
                </div>
                <div className="flex items-center">
                  <span className="text-xs font-medium text-gray-500 w-24">
                    Ngân hàng:
                  </span>
                  <span className="text-sm font-medium">
                    {activeProfile.bankName}
                  </span>
                </div>
                <div className="flex items-center">
                  <span className="text-xs font-medium text-gray-500 w-24">
                    Số tài khoản:
                  </span>
                  <span className="text-sm font-medium">
                    {activeProfile.accountNumber}
                  </span>
                </div>
                <div className="flex items-center">
                  <span className="text-xs font-medium text-gray-500 w-24">
                    Chi nhánh:
                  </span>
                  <span className="text-sm font-medium">
                    {activeProfile.branch}
                  </span>
                </div>
                <div className="flex items-center">
                  <span className="text-xs font-medium text-gray-500 w-24">
                    SĐT:
                  </span>
                  <span className="text-sm font-medium">
                    {activeProfile.phone}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AutoFillForm;
