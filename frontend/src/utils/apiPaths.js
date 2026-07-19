export const API_PATHS = {
  AUTH: {
    LOGIN: '/api/auth/login',
    LOGOUT: '/api/auth/logout',
    GET_PROFILE: '/api/auth/get-user-info',
    CHANGE_PASSWORD: '/api/auth/change-password',
  },
  USER: {
    GET_ALL: '/api/users',
    ADD: '/api/users',
    GET_ONE: (id) => `/api/users/${id}`,
    UPDATE: (id) => `/api/users/${id}`,
    DELETE: (id) => `/api/users/${id}`,
  },
  TANK: {
    GET_ALL: '/api/tanks',
    ADD: '/api/tanks',
    GET_ONE: (id) => `/api/tanks/${id}`,
    UPDATE: (id) => `/api/tanks/${id}`,
    DELETE: (id) => `/api/tanks/${id}`,
    REFILLS: (tankId) => `/api/tanks/${tankId}/refills`,
    REFILL_ONE: (tankId, refillId) => `/api/tanks/${tankId}/refills/${refillId}`,
  },
  MACHINE: {
    GET_ALL: '/api/machines',
    ADD: '/api/machines',
    GET_ONE: (id) => `/api/machines/${id}`,
    UPDATE: (id) => `/api/machines/${id}`,
    DELETE: (id) => `/api/machines/${id}`,
    NOZZLES: (machineId) => `/api/machines/${machineId}/nozzles`,
    NOZZLE_ONE: (machineId, nozzleId) => `/api/machines/${machineId}/nozzles/${nozzleId}`,
    SALES_SUMMARY: '/api/machines/sales-summary',
  },
  FUEL_PRICE: {
    CURRENT: '/api/fuel-prices',
    ADD: '/api/fuel-prices',
    HISTORY: '/api/fuel-prices/history',
  },
  SHIFT: {
    GET_ALL: '/api/shifts',
    GET_ONE: (id) => `/api/shifts/${id}`,
    START: '/api/shifts',
    END: (id) => `/api/shifts/${id}/end`,
  },
  REPORT: {
    SALES: '/api/reports/sales',
    REFILLS: '/api/reports/refills',
  },
  DASHBOARD: {
    GET: '/api/dashboard',
  },
  AI: {
    CHAT: '/api/ai/chat',
  },
};

