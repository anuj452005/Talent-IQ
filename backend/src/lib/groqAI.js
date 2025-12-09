// Groq AI Integration - FREE tier (14,400 requests/day)
// Using Llama 3 70B model for code review

import { ENV } from "./env.js";

const GROQ_API_URL = "https://api.groq.com/openai/v1/chat/completions";

/**
 * Review code using Groq's Llama 3 model
 * @param {string} code - The code to review
 * @param {string} language - The programming language
 * @param {string} problemTitle - The problem being solved
 * @returns {Promise<{success: boolean, review?: string, error?: string}>}
 */
export async function reviewCode(code, language, problemTitle = "") {
  try {
    if (!ENV.GROQ_API_KEY) {
      return {
        success: false,
        error: "GROQ_API_KEY not configured. Please add it to your .env file.",
      };
    }

    const systemPrompt = `You are an expert code reviewer and programming mentor. Analyze the provided code and give constructive feedback. Be concise but helpful.

Focus on:
1. **Correctness**: Does it solve the problem correctly?
2. **Time Complexity**: What's the Big O complexity?
3. **Space Complexity**: Memory usage analysis
4. **Code Quality**: Readability, naming, structure
5. **Improvements**: Specific suggestions to make it better

Format your response with clear sections using markdown. Be encouraging but honest.`;

    const userPrompt = `Review this ${language} code${problemTitle ? ` for the "${problemTitle}" problem` : ""}:

\`\`\`${language}
${code}
\`\`\`

Provide a brief but comprehensive code review.`;

    const response = await fetch(GROQ_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${ENV.GROQ_API_KEY}`,
      },
      body: JSON.stringify({
        model: "llama3-70b-8192",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
        temperature: 0.3,
        max_tokens: 1024,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      return {
        success: false,
        error: errorData.error?.message || `API error: ${response.status}`,
      };
    }

    const data = await response.json();
    const review = data.choices?.[0]?.message?.content;

    if (!review) {
      return { success: false, error: "No review generated" };
    }

    return { success: true, review };
  } catch (error) {
    return {
      success: false,
      error: `Failed to review code: ${error.message}`,
    };
  }
}

/**
 * Get code hints without giving away the solution
 * @param {string} code - The current code
 * @param {string} language - The programming language
 * @param {string} problemTitle - The problem title
 * @param {string} problemDescription - The problem description
 * @returns {Promise<{success: boolean, hint?: string, error?: string}>}
 */
export async function getCodeHint(code, language, problemTitle, problemDescription) {
  try {
    if (!ENV.GROQ_API_KEY) {
      return {
        success: false,
        error: "GROQ_API_KEY not configured",
      };
    }

    const systemPrompt = `You are a helpful programming tutor. Give a hint to help the student progress WITHOUT giving away the solution directly. 

Rules:
- Be encouraging and supportive
- Point them in the right direction
- Ask guiding questions
- Never write the actual solution code
- Keep hints concise (2-3 sentences max)`;

    const userPrompt = `Problem: ${problemTitle}
Description: ${problemDescription}

Current code (${language}):
\`\`\`${language}
${code}
\`\`\`

Give a helpful hint to guide them forward.`;

    const response = await fetch(GROQ_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${ENV.GROQ_API_KEY}`,
      },
      body: JSON.stringify({
        model: "llama3-8b-8192", // Faster model for hints
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
        temperature: 0.5,
        max_tokens: 256,
      }),
    });

    if (!response.ok) {
      return { success: false, error: `API error: ${response.status}` };
    }

    const data = await response.json();
    const hint = data.choices?.[0]?.message?.content;

    return hint
      ? { success: true, hint }
      : { success: false, error: "No hint generated" };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

/**
 * Explain what the code does in simple terms
 * @param {string} code - The code to explain
 * @param {string} language - The programming language
 * @returns {Promise<{success: boolean, explanation?: string, error?: string}>}
 */
export async function explainCode(code, language) {
  try {
    if (!ENV.GROQ_API_KEY) {
      return { success: false, error: "GROQ_API_KEY not configured" };
    }

    const systemPrompt = `You are a patient programming teacher. Explain code in simple terms that anyone can understand. Use analogies when helpful. Keep explanations clear and concise.`;

    const userPrompt = `Explain this ${language} code step by step:

\`\`\`${language}
${code}
\`\`\``;

    const response = await fetch(GROQ_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${ENV.GROQ_API_KEY}`,
      },
      body: JSON.stringify({
        model: "llama3-8b-8192",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
        temperature: 0.3,
        max_tokens: 512,
      }),
    });

    if (!response.ok) {
      return { success: false, error: `API error: ${response.status}` };
    }

    const data = await response.json();
    const explanation = data.choices?.[0]?.message?.content;

    return explanation
      ? { success: true, explanation }
      : { success: false, error: "No explanation generated" };
  } catch (error) {
    return { success: false, error: error.message };
  }
}
