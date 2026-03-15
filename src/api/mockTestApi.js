import mockAxios from "./mockAxios";

export const startMockTest = async (payload) => {
  const { data } = await mockAxios.post("/api/mocktest/start", payload);
  return data;
};

export const submitMockTest = async (payload) => {
  const { data } = await mockAxios.post("/api/mocktest/submit", payload);
  return data;
};