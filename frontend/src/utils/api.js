import axios from "axios";

const API = axios.create({
  baseURL: "https://wine-chain-backend.onrender.com/api",
});

export const getBottles = (params) => API.get("/bottles", { params });
export const getBottle = (id) => API.get(`/bottles/${id}`);
export const addBottle = (data) => API.post("/bottles", data, {
  headers: { "Content-Type": "multipart/form-data" }
});
export const transferBottle = (id, data) => API.put(`/bottles/${id}/transfer`, data);
export const verifyBottle = (id) => API.get(`/bottles/${id}/verify`);
export const deleteBottle = (id) => API.delete(`/bottles/${id}`);

export const getChain = (params) => API.get("/chain", { params });
export const validateChain = () => API.get("/chain/validate");
export const getBlock = (hash) => API.get(`/chain/${hash}`);

export const getStats = () => API.get("/stats");