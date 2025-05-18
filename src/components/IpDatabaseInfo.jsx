const IpDatabaseInfo = ({
  currentIp,
  ipCheckResult,
  checkingDatabase,
  addingToDatabase,
  onAddToDatabase,
}) => {
  if (!currentIp) return null;

  return (
    <div className="mt-4 p-4 border rounded-lg bg-gray-50">
      <div className="mb-2 text-lg font-medium text-gray-800 flex items-center">
        <svg
          className="w-5 h-5 mr-2 text-gray-600"
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 20 20"
          fill="currentColor"
        >
          <path
            fillRule="evenodd"
            d="M2 5a2 2 0 012-2h12a2 2 0 012 2v10a2 2 0 01-2 2H4a2 2 0 01-2-2V5zm3.293 1.293a1 1 0 011.414 0l3 3a1 1 0 010 1.414l-3 3a1 1 0 01-1.414-1.414L7.586 10 5.293 7.707a1 1 0 010-1.414zM11 12a1 1 0 100 2h3a1 1 0 100-2h-3z"
            clipRule="evenodd"
          />
        </svg>
        Thông tin CSDL IP
      </div>

      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center">
        <div className="mb-3 sm:mb-0">
          <p className="text-sm mb-1">
            <span className="font-semibold">IP hiện tại:</span> {currentIp}
          </p>
          {checkingDatabase ? (
            <div className="flex items-center text-sm text-blue-600">
              <svg
                className="animate-spin -ml-1 mr-2 h-4 w-4"
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
              Đang kiểm tra IP trong CSDL...
            </div>
          ) : ipCheckResult ? (
            <>
              <p className="text-sm mb-1">
                <span className="font-semibold">Trạng thái:</span>{" "}
                {ipCheckResult.status === "exists" ? (
                  <span className="text-blue-600">Đã tồn tại trong CSDL</span>
                ) : (
                  <span className="text-amber-600">
                    Chưa tồn tại trong CSDL
                  </span>
                )}
              </p>
              {ipCheckResult.status === "exists" &&
                ipCheckResult.date_added && (
                  <p className="text-sm mb-1">
                    <span className="font-semibold">Ngày thêm:</span>{" "}
                    {ipCheckResult.date_added}
                  </p>
                )}
              {ipCheckResult.total_ip && (
                <p className="text-sm">
                  <span className="font-semibold">Tổng IP trong CSDL:</span>{" "}
                  {ipCheckResult.total_ip}
                </p>
              )}
            </>
          ) : (
            <p className="text-sm text-gray-500">
              Chưa có thông tin kiểm tra CSDL
            </p>
          )}
        </div>

        {ipCheckResult && ipCheckResult.status === "not_exists" && (
          <button
            onClick={() => onAddToDatabase(currentIp)}
            disabled={addingToDatabase || checkingDatabase}
            className={`px-4 py-2 rounded-lg text-white text-sm font-medium transition-all duration-200 ${
              addingToDatabase || checkingDatabase
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 hover:shadow-md"
            }`}
          >
            {addingToDatabase ? (
              <span className="flex items-center">
                <svg
                  className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
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
                Đang thêm...
              </span>
            ) : (
              <span className="flex items-center">
                <svg
                  className="mr-2 h-4 w-4"
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v2H7a1 1 0 100 2h2v2a1 1 0 102 0v-2h2a1 1 0 100-2h-2V7z"
                    clipRule="evenodd"
                  />
                </svg>
                Thêm vào CSDL
              </span>
            )}
          </button>
        )}
      </div>
    </div>
  );
};

export default IpDatabaseInfo;
