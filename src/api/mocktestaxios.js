// src/api/mocktestaxios.js
import axios from "axios";

const mockAxios = axios.create({
  baseURL: "https://career-planner-agent-mocktest.onrender.com/",
  headers: { "Content-Type": "application/json" },
  timeout: 120000,
});

// Forward JWT token so AuthForwardFilter can identify the user
mockAxios.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export default mockAxios;