// src/api/roadmapApi.js
import axios from "./axios";

/* Generate Roadmap */
export const generateRoadmap = async (data) => {
  const response = await axios.post("/api/roadmap/generate", data);
  return response.data;
};

/* Get All User Roadmaps */
export const getUserRoadmaps = async () => {
  const response = await axios.get("/api/roadmap/user");
  return response.data;
};

/* Get Roadmap By ID */
export const getRoadmapById = async (id) => {
  const response = await axios.get(`/api/roadmap/${id}`);
  return response.data;
};

/* Save Progress */
export const saveProgress = async (roadmapId, progress) => {
  const response = await axios.post(
    `/api/roadmap/progress/${roadmapId}`,
    JSON.stringify(progress),
    { headers: { "Content-Type": "application/json" } }
  );
  return response.data;
};

/* Get Progress */
export const getProgress = async (roadmapId) => {
  const response = await axios.get(`/api/roadmap/progress/${roadmapId}`);
  const data = response.data;
  // Backend stores progress as a raw JSON string — parse it so callers always get an object
  if (typeof data === "string") {
    try { return JSON.parse(data); } catch { return {}; }
  }
  return data ?? {};
};