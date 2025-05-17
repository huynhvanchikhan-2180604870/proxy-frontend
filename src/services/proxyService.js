import axios from "axios";


// Base URL for your API server
const API_BASE_URL =
  "https://proxy-manager-backend-086932fc1a1d.herokuapp.com";

export const checkIpAddress = async (formattedProxy) => {
  try {
    const response = await axios.get(`${API_BASE_URL}/get-ip`, {
      params: { proxy: formattedProxy },
    });
    return response.data;
  } catch (error) {
    throw new Error(
      error.response?.data?.message || "Failed to check IP address"
    );
  }
};

export const rotateProxyIp = async (apiKey) => {
  try {
    const response = await axios.get(`${API_BASE_URL}/change-ip`, {
      params: { key: apiKey },
    });
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || "Failed to rotate IP");
  }
};
