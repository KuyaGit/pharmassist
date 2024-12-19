export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: "/auth/token",
    LOGOUT: "/auth/logout",
    PROFILE: "/auth/profile",
    HAS_PROFILE: "/auth/has-profile",
    CREATE_USER: "/auth",
    UPDATE_PASSWORD: "/auth/password",
    GET_INITIAL_PASSWORD: (id: number) => `/auth/initial-password/${id}`,
    RESET_PASSWORD: (id: number) => `/auth/reset-password/${id}`,
    LIST_USERS: "/auth/users",
    UPDATE_INITIAL_CREDENTIALS: "/auth/initial-credentials",
  },
  BRANCHES: {
    LIST: "/branches",
    CREATE: "/branches",
    GET: (id: number) => `/branches/${id}`,
    UPDATE: (id: number) => `/branches/${id}`,
    DELETE: (id: number) => `/branches/${id}`,
    DETAIL: (id: number) => `/branches/${id}`,
  },
  PRODUCTS: {
    LIST: "/products/products",
    CREATE: "/products",
    GET: (id: number) => `/products?product_id=${id}`,
    UPDATE: (id: number) => `/products/${id}`,
    DELETE: (id: number) => `/products/${id}`,
  },
  BRANCH_PRODUCTS: {
    LIST: "/branch-products",
    CREATE: "/branch-products",
    GET: (id: number) => `/branch-products/${id}`,
    UPDATE: (id: number) => `/branch-products/${id}`,
    DELETE: (id: number) => `/branch-products/${id}`,
  },
  INVENTORY: {
    LIST: "/inventory-reports",
    CREATE: "/inventory-reports",
    GET: (id: number) => `/inventory-reports/${id}`,
    UPDATE: (id: number) => `/inventory-reports/${id}`,
    DELETE: (id: number) => `/inventory-reports/${id}`,
    BRANCH: (id: number) => `/inventory-reports/branch/${id}`,
    MARK_VIEWED: (id: number) => `/inventory-reports/${id}/mark-viewed`,
  },
  CLIENTS: {
    LIST: "/clients",
    CREATE: "/clients",
    GET: (id: number) => `/clients/${id}`,
    UPDATE: (id: number) => `/clients/${id}`,
    DELETE: (id: number) => `/clients/${id}`,
  },
  TRANSACTIONS: {
    LIST: "/transactions",
    CREATE: "/transactions",
    GET: (id: number) => `/transactions/${id}`,
    UPDATE: (id: number) => `/transactions/${id}`,
    DELETE: (id: number) => `/transactions/${id}`,
  },
  EXPENSES: {
    LIST: "/expenses",
    CREATE: "/expenses",
    GET: (id: number) => `/expenses/${id}`,
    UPDATE: (id: number) => `/expenses/${id}`,
    DELETE: (id: number) => `/expenses/${id}`,
    ANALYTICS: "/expenses/analytics",
  },
  SUPPLIERS: {
    LIST: "/suppliers",
    CREATE: "/suppliers",
    GET: (id: number) => `/suppliers/${id}`,
    UPDATE: (id: number) => `/suppliers/${id}`,
    DELETE: (id: number) => `/suppliers/${id}`,
  },
  ANALYTICS: {
    OVERVIEW: "/analytics/overview",
    BRANCH: "/analytics/branch",
    PRODUCT: "/analytics/product",
  },
  APP_MANAGEMENT: {
    LIST: "/app-management/versions",
    UPLOAD: "/app-management/upload",
    ACTIVE_VERSION: "/app-management/active-version",
    SET_ACTIVE: (id: number) => `/app-management/versions/${id}/set-active`,
    DELETE: (id: number) => `/app-management/versions/${id}`,
  },
} as const;

// Helper function to get full API URL
export const getApiUrl = (
  endpoint: string,
  params?: Record<string, string>
) => {
  let url = `${API_BASE_URL}${endpoint}`;

  if (params) {
    const queryString = new URLSearchParams(params).toString();
    url += `?${queryString}`;
  }

  return url;
};
