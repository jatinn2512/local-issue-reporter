import axios from "axios";

const API = axios.create({
  baseURL: "http://localhost:5000/api", // backend ka base URL
});

// ✅ Har request ke saath token bhejna
API.interceptors.request.use((req) => {
  const token = localStorage.getItem("token");
  if (token) {
    req.headers.Authorization = `Bearer ${token}`;
  }
  return req;
});

export default API;
