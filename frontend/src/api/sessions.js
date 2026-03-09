import axiosInstance from "../lib/axios";

export const sessionApi = {
  createSession: async (data) => {
    const response = await axiosInstance.post("/sessions", data);
    return response.data;
  },

  getActiveSessions: async () => {
    const response = await axiosInstance.get("/sessions/active");
    return response.data;
  },
  getMyRecentSessions: async () => {
    const response = await axiosInstance.get("/sessions/my-recent");
    return response.data;
  },

  getSessionById: async (id) => {
    const response = await axiosInstance.get(`/sessions/${id}`);
    return response.data;
  },

  joinSession: async (id) => {
    const response = await axiosInstance.post(`/sessions/${id}/join`);
    return response.data;
  },
  endSession: async (id) => {
    const response = await axiosInstance.post(`/sessions/${id}/end`);
    return response.data;
  },
  updateSession: async (id, data) => {
    const response = await axiosInstance.patch(`/sessions/${id}`, data);
    return response.data;
  },
  getStreamToken: async () => {
    const response = await axiosInstance.get(`/chat/token`);
    return response.data;
  },

  // AI Interview APIs
  startAISession: async (data) => {
    const response = await axiosInstance.post("/ai-interview/start", data);
    return response.data;
  },
  sendAIMessage: async (data) => {
    const response = await axiosInstance.post("/ai-interview/message", data);
    return response.data;
  },
  endAISession: async (data) => {
    const response = await axiosInstance.post("/ai-interview/end", data);
    return response.data;
  },
  sendAIMessageStream: async (data) => {
    return await fetch(`${import.meta.env.VITE_API_URL}/ai-interview/message-stream`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${data.token}`, // Since axios isn't used here, we need the token
      },
      body: JSON.stringify({
        sessionId: data.sessionId,
        message: data.message,
        currentCode: data.currentCode,
      }),
    });
  },
  getAISession: async (id) => {
    const response = await axiosInstance.get(`/ai-interview/${id}`);
    return response.data;
  },
};
