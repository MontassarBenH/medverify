import axios from "axios";

const baseURL =
  import.meta.env.VITE_API_BASE_URL?.replace(/\/$/, "") || "http://localhost:4000";

export const api = axios.create({ baseURL });

export function setToken(t: string) {
  api.defaults.headers.common.Authorization = `Bearer ${t}`;
}

export function clearToken() {
  delete api.defaults.headers.common.Authorization;
}
