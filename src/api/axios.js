import axios from "axios";

const instance = axios.create({
  baseURL: "http://localhost:8080",
  headers: {
    "Content-Type": "application/json"
  }
});

/* 🔐 Attach JWT Automatically (Except Auth Routes) */
instance.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");

  if (
    token &&
    !config.url.includes("/api/auth/login") &&
    !config.url.includes("/api/auth/register")
  ) {
    config.headers.Authorization = "Bearer " + token;
  }

  return config;
});

/* 🚨 Auto Logout On 401 */
instance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      localStorage.removeItem("token");
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

export default instance;