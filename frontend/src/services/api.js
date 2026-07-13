import axios from "axios";

const API = axios.create({
  baseURL: "http://localhost:5000"
});

export const getCourses = () =>
  API.get("/courses");

export const getPlan = () =>
  API.get("/plan");

export const savePlan = (data) =>
  API.post("/plan", data);

export default API;