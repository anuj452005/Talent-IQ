import axiosInstance from "../lib/axios";

export const aiApi = {
  /**
   * Get AI code review
   * @param {string} code - The code to review
   * @param {string} language - Programming language
   * @param {string} problemTitle - Optional problem title
   */
  reviewCode: async (code, language, problemTitle = "") => {
    const response = await axiosInstance.post("/ai/review", {
      code,
      language,
      problemTitle,
    });
    return response.data;
  },

  /**
   * Get a hint for the current problem
   * @param {string} code - Current code
   * @param {string} language - Programming language
   * @param {string} problemTitle - Problem title
   * @param {string} problemDescription - Problem description
   */
  getHint: async (code, language, problemTitle, problemDescription = "") => {
    const response = await axiosInstance.post("/ai/hint", {
      code,
      language,
      problemTitle,
      problemDescription,
    });
    return response.data;
  },

  /**
   * Explain what the code does
   * @param {string} code - Code to explain
   * @param {string} language - Programming language
   */
  explainCode: async (code, language) => {
    const response = await axiosInstance.post("/ai/explain", {
      code,
      language,
    });
    return response.data;
  },
};
