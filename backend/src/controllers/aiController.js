import { reviewCode, getCodeHint, explainCode } from "../lib/geminiAI.js";

/**
 * POST /api/ai/review
 * Review code using AI
 */
export async function aiReviewCode(req, res) {
  try {
    const { code, language, problemTitle } = req.body;

    if (!code || !language) {
      return res.status(400).json({
        success: false,
        error: "Code and language are required",
      });
    }

    const result = await reviewCode(code, language, problemTitle);
    
    if (!result.success) {
      return res.status(400).json(result);
    }

    res.status(200).json(result);
  } catch (error) {
    console.error("Error in aiReviewCode:", error.message);
    res.status(500).json({ success: false, error: "Internal server error" });
  }
}

/**
 * POST /api/ai/hint
 * Get a hint for the current problem
 */
export async function aiGetHint(req, res) {
  try {
    const { code, language, problemTitle, problemDescription } = req.body;

    if (!code || !language || !problemTitle) {
      return res.status(400).json({
        success: false,
        error: "Code, language, and problem title are required",
      });
    }

    const result = await getCodeHint(code, language, problemTitle, problemDescription || "");

    if (!result.success) {
      return res.status(400).json(result);
    }

    res.status(200).json(result);
  } catch (error) {
    console.error("Error in aiGetHint:", error.message);
    res.status(500).json({ success: false, error: "Internal server error" });
  }
}

/**
 * POST /api/ai/explain
 * Explain what the code does
 */
export async function aiExplainCode(req, res) {
  try {
    const { code, language } = req.body;

    if (!code || !language) {
      return res.status(400).json({
        success: false,
        error: "Code and language are required",
      });
    }

    const result = await explainCode(code, language);

    if (!result.success) {
      return res.status(400).json(result);
    }

    res.status(200).json(result);
  } catch (error) {
    console.error("Error in aiExplainCode:", error.message);
    res.status(500).json({ success: false, error: "Internal server error" });
  }
}
