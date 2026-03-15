// src/api/axios.js
import axios from "axios";

const instance = axios.create({
  baseURL: "https://career-planner-agent-2.onrender.com",
  headers: {
    "Content-Type": "application/json",
  },
});
instance.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Auto logout on 401
instance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("token");
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

export default instance;