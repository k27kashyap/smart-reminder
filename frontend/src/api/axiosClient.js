import axios from "axios";

const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:3000/api";

const axiosClient = axios.create({
  baseURL: API_BASE,
  withCredentials: true, // important: send cookies
  headers: {
    "Content-Type": "application/json"
  }
});

// simple error handling
axiosClient.interceptors.response.use(
  (res) => res,
  (err) => {
    // you can expand this: show toast, redirect if 401, etc.
    return Promise.reject(err);
  }
);

export default axiosClient;
