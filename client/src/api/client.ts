import axios from "axios";

import { API_URL } from "@lib/env";

export const apiClient = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 20_000,
  withCredentials: true,
});

apiClient.interceptors.request.use(
  (config) => config,
  (error: unknown) => Promise.reject(error),
);

apiClient.interceptors.response.use(
  (response) => response,
  (error: unknown) => {
    if (axios.isAxiosError(error) && error.response?.status === 401) {
      // Room/member auth handling will be wired here once protected routes exist.
    }

    return Promise.reject(error);
  },
);

