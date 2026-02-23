import axios from "axios";

const instance = axios.create({
  baseURL: "https://career-planner-agent-2.onrender.com",
  headers: {
    "Content-Type": "application/json",
  },
});

/* 🔐 Attach token automatically + check expiry before request */
instance.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");

  if (token) {
    try {
      // Decode JWT payload and check expiry client-side
      const payload = JSON.parse(atob(token.split(".")[1]));
      if (payload.exp * 1000 < Date.now()) {
        localStorage.removeItem("token");
        window.location.href = "/login";
        return Promise.reject(new Error("Token expired"));
      }
    } catch {
      // Malformed token — clear it
      localStorage.removeItem("token");
      window.location.href = "/login";
      return Promise.reject(new Error("Invalid token"));
    }

    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

/* 🚨 Auto logout if server returns 401 or 403 */
instance.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status;
    if (status === 401 || status === 403) {
      localStorage.removeItem("token");
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

export default instance;