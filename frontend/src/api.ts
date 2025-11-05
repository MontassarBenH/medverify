import axios from "axios";

export const api = axios.create({ baseURL: "http://localhost:4000" });

export function setToken(t: string) {
  api.defaults.headers.common.Authorization = `Bearer ${t}`;
}

export function clearToken() {
  delete api.defaults.headers.common.Authorization;
}
