import axios from "axios";

// Base URL for your API server
const API_BASE_URL = "http://localhost:5000";

export const checkIpAddress = async (formattedProxy, token) => {
  try {
    const response = await axios.get(`${API_BASE_URL}/api/proxy/get-ip`, {
      params: { proxy: formattedProxy },
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  } catch (error) {
    throw new Error(
      error.response?.data?.message || "Failed to check IP address"
    );
  }
};

export const rotateProxyIp = async (token) => {
  try {
    const response = await axios.get(`${API_BASE_URL}/api/proxy/change-ip`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || "Failed to rotate IP");
  }
};
