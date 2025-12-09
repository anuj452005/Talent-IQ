// Google Gemini AI Integration - FREE tier (1,500 requests/day)
// Using Gemini 1.5 Flash model for code review

import { ENV } from "./env.js";

const GEMINI_API_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent";

/**
 * Call Gemini API
 */
async function callGemini(prompt, systemPrompt = "") {
  const response = await fetch(`${GEMINI_API_URL}?key=${ENV.GEMINI_API_KEY}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      contents: [
        {
          parts: [
            { text: systemPrompt ? `${systemPrompt}\n\n${prompt}` : prompt }
          ]
        }
      ],
      generationConfig: {
        temperature: 0.3,
        maxOutputTokens: 1024,
      },
    }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error?.message || `API error: ${response.status}`);
  }

  const data = await response.json();
  return data.candidates?.[0]?.content?.parts?.[0]?.text || null;
}

/**
 * Review code using Google Gemini
 * @param {string} code - The code to review
 * @param {string} language - The programming language
 * @param {string} problemTitle - The problem being solved
 * @returns {Promise<{success: boolean, review?: string, error?: string}>}
 */
export async function reviewCode(code, language, problemTitle = "") {
  try {
    if (!ENV.GEMINI_API_KEY) {
      return {
        success: false,
        error: "GEMINI_API_KEY not configured. Please add it to your .env file.",
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

    const review = await callGemini(userPrompt, systemPrompt);

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
    if (!ENV.GEMINI_API_KEY) {
      return {
        success: false,
        error: "GEMINI_API_KEY not configured",
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

    const hint = await callGemini(userPrompt, systemPrompt);

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
    if (!ENV.GEMINI_API_KEY) {
      return { success: false, error: "GEMINI_API_KEY not configured" };
    }

    const systemPrompt = `You are a patient programming teacher. Explain code in simple terms that anyone can understand. Use analogies when helpful. Keep explanations clear and concise.`;

    const userPrompt = `Explain this ${language} code step by step:

\`\`\`${language}
${code}
\`\`\``;

    const explanation = await callGemini(userPrompt, systemPrompt);

    return explanation
      ? { success: true, explanation }
      : { success: false, error: "No explanation generated" };
  } catch (error) {
    return { success: false, error: error.message };
  }
}


/**
 * AI Interviewer: Generate response to user's message/code
 * Behaves like a real DSA interviewer - asks follow-up questions, provides hints
 * @param {Array} conversationHistory - Previous messages [{role: 'user'|'ai', content: string}]
 * @param {string} currentCode - Current code from the editor
 * @param {object} problem - Problem details {title, description, difficulty}
 * @param {string} userMessage - User's latest message
 * @returns {Promise<{success: boolean, response?: string, error?: string}>}
 */
export async function generateInterviewResponse(conversationHistory, currentCode, problem, userMessage) {
  try {
    if (!ENV.GEMINI_API_KEY) {
      return { success: false, error: "GEMINI_API_KEY not configured" };
    }

    const systemPrompt = `You are an experienced and friendly DSA interviewer conducting a technical interview. Your goal is to help the candidate demonstrate their problem-solving skills while making them feel comfortable.

CRITICAL RULES:
1. ALWAYS respond to what the user says - NEVER say you can't process something
2. If they greet you (hi, hello, etc), respond warmly and ask if they're ready to start
3. If they give short answers, ask follow-up questions to understand their thinking
4. Acknowledge their input before asking the next question
5. Be conversational and natural - this is a voice/chat interview

INTERVIEW FLOW:
- Start: Greet warmly, present problem, ask if they have clarifying questions
- During: Listen to their approach, provide feedback, ask about edge cases/complexity
- Coding: Observe their code, point out potential issues via questions
- Cross-question: "What if X?", "How would you optimize?", "What's the time complexity?"
- Never give direct solutions - guide with hints and questions

PROBLEM:
Title: ${problem.title}
Difficulty: ${problem.difficulty}
Description: ${problem.description}

CONVERSATION HISTORY:
${conversationHistory.map(m => `${m.role.toUpperCase()}: ${m.content}`).join('\n')}

USER'S CODE:
\`\`\`
${currentCode || 'No code written yet'}
\`\`\`

USER JUST SAID: "${userMessage}"

RESPOND AS THE INTERVIEWER:
- Be warm and encouraging
- Acknowledge what they said
- Give quick feedback if applicable
- Ask a follow-up question to keep the interview flowing
- Keep it conversational (2-3 sentences)
- Speak naturally like you're on a phone call`;

    const response = await callGemini(userMessage, systemPrompt);

    return response 
      ? { success: true, response }
      : { success: false, error: "No response generated" };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

/**
 * Generate the initial greeting and problem introduction from the AI interviewer
 * @param {object} problem - Problem details
 * @returns {Promise<{success: boolean, response?: string, error?: string}>}
 */
export async function generateInterviewIntro(problem) {
  try {
    if (!ENV.GEMINI_API_KEY) {
      return { success: false, error: "GEMINI_API_KEY not configured" };
    }

    const prompt = `You are a friendly technical interviewer starting a DSA interview session. 

TASK: Introduce yourself and present the problem naturally, as if you're on a phone call.

PROBLEM:
- Title: "${problem.title}"
- Difficulty: ${problem.difficulty}
- Description: ${problem.description}

YOUR INTRODUCTION SHOULD:
1. Greet warmly (like "Hi! Thanks for joining me today")
2. Briefly introduce yourself as an AI technical interviewer
3. Mention the problem name and difficulty
4. Explain the problem clearly in simple terms
5. Ask if they have any clarifying questions before starting

Keep it conversational and friendly - speak like you're having a real conversation. About 3-4 sentences total.`;

    const response = await callGemini(prompt);

    return response 
      ? { success: true, response }
      : { success: false, error: "No intro generated" };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

/**
 * Generate comprehensive feedback at the end of the interview
 * @param {Array} conversationHistory - Full conversation history
 * @param {string} finalCode - Final code submitted
 * @param {object} problem - Problem details
 * @returns {Promise<{success: boolean, feedback?: object, error?: string}>}
 */
export async function generateInterviewFeedback(conversationHistory, finalCode, problem) {
  try {
    if (!ENV.GEMINI_API_KEY) {
      return { success: false, error: "GEMINI_API_KEY not configured" };
    }

    const systemPrompt = `You are evaluating a completed DSA interview for the "${problem.title}" problem.

FULL INTERVIEW TRANSCRIPT:
${conversationHistory.map(m => `${m.role.toUpperCase()}: ${m.content}`).join('\n')}

FINAL CODE:
\`\`\`
${finalCode || 'No code submitted'}
\`\`\`

Evaluate the candidate and respond in EXACTLY this JSON format (no markdown, just raw JSON):
{
  "overallScore": <number 1-10>,
  "technicalScore": <number 1-10>,
  "communicationScore": <number 1-10>,
  "problemSolvingScore": <number 1-10>,
  "summary": "<2-3 sentence overall assessment>",
  "improvements": ["<improvement 1>", "<improvement 2>", "<improvement 3>"],
  "strengths": ["<strength 1>", "<strength 2>"]
}

SCORING GUIDE:
- 9-10: Exceptional, would get a strong hire
- 7-8: Good performance, minor areas to improve
- 5-6: Average, needs improvement
- 3-4: Below expectations, significant gaps
- 1-2: Did not demonstrate competency`;

    const response = await callGemini(systemPrompt);

    if (!response) {
      return { success: false, error: "No feedback generated" };
    }

    try {
      // Clean up the response in case it has markdown code blocks
      const cleanJson = response.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      const feedback = JSON.parse(cleanJson);
      return { success: true, feedback };
    } catch (parseError) {
      // If JSON parsing fails, create a basic feedback structure
      return { 
        success: true, 
        feedback: {
          overallScore: 5,
          technicalScore: 5,
          communicationScore: 5,
          problemSolvingScore: 5,
          summary: response,
          improvements: ["Unable to parse detailed feedback"],
          strengths: []
        }
      };
    }
  } catch (error) {
    return { success: false, error: error.message };
  }
}
