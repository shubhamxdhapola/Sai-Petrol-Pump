import axiosInstance from './axiosInstance';
import { API_PATHS } from './apiPaths';

const extractData = (response) => response.data;

export const apiErrorMessage = (error, fallback = 'Something went wrong') => {
  const data = error?.response?.data;
  if (typeof data === 'string') return data;
  if (data?.message) return data.message;
  if (Array.isArray(data?.errors)) return data.errors.map((item) => item.message || item).join(', ');
  return error?.message || fallback;
};

export const dashboardApi = {
  get: (period = 'today') => axiosInstance.get(API_PATHS.DASHBOARD.GET, { params: { period } }).then(extractData),
};

export const userApi = {
  list: () => axiosInstance.get(API_PATHS.USER.GET_ALL).then(extractData),
  create: (payload) => axiosInstance.post(API_PATHS.USER.ADD, payload).then(extractData),
  update: (id, payload) => axiosInstance.patch(API_PATHS.USER.UPDATE(id), payload).then(extractData),
  remove: (id) => axiosInstance.delete(API_PATHS.USER.DELETE(id)).then(extractData),
};

export const tankApi = {
  list: () => axiosInstance.get(API_PATHS.TANK.GET_ALL).then(extractData),
  create: (payload) => axiosInstance.post(API_PATHS.TANK.ADD, payload).then(extractData),
  update: (id, payload) => axiosInstance.patch(API_PATHS.TANK.UPDATE(id), payload).then(extractData),
  remove: (id) => axiosInstance.delete(API_PATHS.TANK.DELETE(id)).then(extractData),
  refills: (tankId) => axiosInstance.get(API_PATHS.TANK.REFILLS(tankId)).then(extractData),
  createRefill: (tankId, payload) => axiosInstance.post(API_PATHS.TANK.REFILLS(tankId), payload).then(extractData),
  updateRefill: (tankId, refillId, payload) => axiosInstance.patch(API_PATHS.TANK.REFILL_ONE(tankId, refillId), payload).then(extractData),
  removeRefill: (tankId, refillId) => axiosInstance.delete(API_PATHS.TANK.REFILL_ONE(tankId, refillId)).then(extractData),
};

export const machineApi = {
  list: () => axiosInstance.get(API_PATHS.MACHINE.GET_ALL).then(extractData),
  get: (id) => axiosInstance.get(API_PATHS.MACHINE.GET_ONE(id)).then(extractData),
  create: (payload) => axiosInstance.post(API_PATHS.MACHINE.ADD, payload).then(extractData),
  update: (id, payload) => axiosInstance.patch(API_PATHS.MACHINE.UPDATE(id), payload).then(extractData),
  remove: (id) => axiosInstance.delete(API_PATHS.MACHINE.DELETE(id)).then(extractData),
  nozzles: (machineId) => axiosInstance.get(API_PATHS.MACHINE.NOZZLES(machineId)).then(extractData),
  createNozzle: (machineId, payload) => axiosInstance.post(API_PATHS.MACHINE.NOZZLES(machineId), payload).then(extractData),
  updateNozzle: (machineId, nozzleId, payload) => axiosInstance.patch(API_PATHS.MACHINE.NOZZLE_ONE(machineId, nozzleId), payload).then(extractData),
  removeNozzle: (machineId, nozzleId) => axiosInstance.delete(API_PATHS.MACHINE.NOZZLE_ONE(machineId, nozzleId)).then(extractData),
  salesSummary: () => axiosInstance.get(API_PATHS.MACHINE.SALES_SUMMARY).then(extractData),
};

export const fuelPriceApi = {
  current: () => axiosInstance.get(API_PATHS.FUEL_PRICE.CURRENT).then(extractData),
  history: (fuelType) => axiosInstance.get(API_PATHS.FUEL_PRICE.HISTORY, { params: fuelType ? { fuelType } : {} }).then(extractData),
  create: (payload) => axiosInstance.post(API_PATHS.FUEL_PRICE.ADD, payload).then(extractData),
};

export const shiftApi = {
  list: (params = {}) => axiosInstance.get(API_PATHS.SHIFT.GET_ALL, { params }).then(extractData),
  get: (id) => axiosInstance.get(API_PATHS.SHIFT.GET_ONE(id)).then(extractData),
  start: (payload) => axiosInstance.post(API_PATHS.SHIFT.START, payload).then(extractData),
  end: (id, payload) => axiosInstance.post(API_PATHS.SHIFT.END(id), payload).then(extractData),
};

export const reportApi = {
  sales: (params = {}) => axiosInstance.get(API_PATHS.REPORT.SALES, { params }).then(extractData),
  refills: (params = {}) => axiosInstance.get(API_PATHS.REPORT.REFILLS, { params }).then(extractData),
  downloadSales: (params = {}) => axiosInstance.get(API_PATHS.REPORT.SALES, { params: { ...params, download: true }, responseType: 'blob' }),
  downloadRefills: (params = {}) => axiosInstance.get(API_PATHS.REPORT.REFILLS, { params: { ...params, download: true }, responseType: 'blob' }),
};

export const authApi = {
  changePassword: (payload) => axiosInstance.patch(API_PATHS.AUTH.CHANGE_PASSWORD, payload).then(extractData),
};

export const aiApi = {
  chat: (message) => axiosInstance.post(API_PATHS.AI.CHAT, { message }).then(extractData),
};

export const downloadBlob = (response, fileName) => {
  const url = window.URL.createObjectURL(new Blob([response.data]));
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', fileName);
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.URL.revokeObjectURL(url);
};
