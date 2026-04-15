import axios from "axios";

const API = axios.create({
  baseURL: "/api",
});

API.interceptors.request.use((config) => {
  const token = localStorage.getItem("winechain_token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export const getBottles = (params) => API.get("/bottles", { params });
export const getBottle = (id) => API.get(`/bottles/${id}`);
export const addBottle = (data) => API.post("/bottles", data, {
  headers: { "Content-Type": "multipart/form-data" }
});
export const verifyBottle = (id) => API.get(`/bottles/${id}/verify`);
export const deleteBottle = (id) => API.delete(`/bottles/${id}`);

export const getChain = (params) => API.get("/chain", { params });
export const validateChain = () => API.get("/chain/validate");
export const getBlock = (hash) => API.get(`/chain/${hash}`);

export const getStats = () => API.get("/stats");
export const getAnalytics = () => API.get("/stats/analytics");

export const getMe = () => API.get("/auth/me");
export const updateProfile = (data) => API.put("/auth/profile", data);

export const getListings = (params) => API.get("/marketplace", { params });
export const createListing = (data) => API.post("/marketplace", data);
export const unlistBottle = (id) => API.delete(`/marketplace/${id}`);
export const submitBuyNow = (id, data) => API.post(`/marketplace/${id}/buy`, data);
export const confirmBuyNow = (id) => API.post(`/marketplace/${id}/buy/confirm`);
export const makeOffer = (id, data) => API.post(`/marketplace/${id}/offers`, data);
export const getOffers = (id) => API.get(`/marketplace/${id}/offers`);
export const acceptOffer = (id, offerId) => API.post(`/marketplace/${id}/offers/${offerId}/accept`);
export const rejectOffer = (id, offerId) => API.post(`/marketplace/${id}/offers/${offerId}/reject`);