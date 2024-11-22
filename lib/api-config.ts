export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "/api";

export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: "/auth/token",
    LOGOUT: "/auth/logout",
    REFRESH: "/auth/refresh",
  },
  USERS: {
    PROFILE: "/users/me",
  },
  // Add other endpoints as needed
} as const;
