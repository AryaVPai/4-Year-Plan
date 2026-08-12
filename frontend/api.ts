import axios from "axios";

const API = "http://localhost:8000";

// ── Base axios instance with auth header auto-attached ──
const authAxios = axios.create({ baseURL: API });

authAxios.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// ── Unprotected calls (no token needed) ──
export const checkConcentration = (college: string, location: string, major: string) =>
  axios.post(`${API}/check-concentration`, { college, location, major });

export const generatePlan = (college: string, location: string, major: string, concentration?: string) =>
  axios.post(`${API}/generate-plan`, { college, location, major, concentration });

export const loginUser = (username: string, password: string) =>
  axios.post(`${API}/login`, { username, password });

export const registerUser = (data: {
  first_name: string;
  last_name: string;
  email: string;
  username: string;
  password: string;
  confirm_password: string;
}) => axios.post(`${API}/register`, data);

// ── Protected calls (token auto-attached via authAxios) ──
export const savePlan = (data: {
  college: string;
  location: string;
  major: string;
  concentration?: string;
  plan_text: string;
}) => authAxios.post("/save-plan", data);

export const getSavedPlans = () =>
  authAxios.get("/saved-plans");

export const getSavedPlan = (planId: number) =>
  authAxios.get(`/saved-plans/${planId}`);

export const updateSavedPlan = (planId: number, plan_text: string) =>
  authAxios.put("/save-plan", { plan_id: planId, plan_text });

export const editPlan = (college: string, current_plan: string, edit_request: string) =>
  authAxios.post("/edit-plan", { college, current_plan, edit_request });