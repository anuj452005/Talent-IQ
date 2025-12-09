import Session from "../models/Session.js";
import { 
  generateInterviewResponse, 
  generateInterviewIntro, 
  generateInterviewFeedback 
} from "../lib/geminiAI.js";

/**
 * POST /api/ai-interview/start
 * Start a new AI interview session
 */
export async function startAISession(req, res) {
  try {
    const { problem, difficulty, problemDescription } = req.body;
    const userId = req.user._id;

    if (!problem || !difficulty) {
      return res.status(400).json({ message: "Problem and difficulty are required" });
    }

    // Create AI session in DB
    const session = await Session.create({
      problem,
      difficulty,
      host: userId,
      sessionType: "ai",
      callId: "", // No video call for AI sessions
    });

    // Generate AI interviewer introduction
    const introResult = await generateInterviewIntro({
      title: problem,
      difficulty,
      description: problemDescription || problem,
    });

    if (!introResult.success) {
      // Still create session, just with a default intro
      session.aiConversation.push({
        role: "ai",
        content: `Welcome to your DSA interview! Today we'll be working on the "${problem}" problem. Take your time to read the problem description, and let me know when you're ready to discuss your approach.`,
        timestamp: new Date(),
      });
    } else {
      session.aiConversation.push({
        role: "ai",
        content: introResult.response,
        timestamp: new Date(),
      });
    }

    await session.save();

    res.status(201).json({ 
      session,
      message: "AI interview session started successfully" 
    });
  } catch (error) {
    console.log("Error in startAISession controller:", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
}

/**
 * POST /api/ai-interview/message
 * Send a message to the AI interviewer and get response
 */
export async function sendMessage(req, res) {
  try {
    const { sessionId, message, currentCode } = req.body;
    const userId = req.user._id;

    if (!sessionId || !message) {
      return res.status(400).json({ message: "Session ID and message are required" });
    }

    const session = await Session.findById(sessionId);

    if (!session) {
      return res.status(404).json({ message: "Session not found" });
    }

    if (session.host.toString() !== userId.toString()) {
      return res.status(403).json({ message: "Unauthorized" });
    }

    if (session.sessionType !== "ai") {
      return res.status(400).json({ message: "This is not an AI session" });
    }

    if (session.status !== "active") {
      return res.status(400).json({ message: "Session is not active" });
    }

    // Add user message to conversation
    session.aiConversation.push({
      role: "user",
      content: message,
      timestamp: new Date(),
    });

    // Generate AI response
    const aiResult = await generateInterviewResponse(
      session.aiConversation.map(m => ({ role: m.role, content: m.content })),
      currentCode || "",
      {
        title: session.problem,
        difficulty: session.difficulty,
        description: session.problem, // Will be enhanced with actual problem description from client
      },
      message
    );

    let aiResponse;
    if (!aiResult.success) {
      console.error("AI generation failed:", aiResult.error);
      // Acknowledge the user's input even if AI fails
      aiResponse = `I heard you say "${message}". Let me think about that... Can you tell me more about your approach to this problem?`;
    } else {
      aiResponse = aiResult.response;
    }

    // Add AI response to conversation
    session.aiConversation.push({
      role: "ai",
      content: aiResponse,
      timestamp: new Date(),
    });

    // Update code snapshot if provided
    if (currentCode) {
      session.codeSnapshot = currentCode;
    }

    await session.save();

    res.status(200).json({ 
      response: aiResponse,
      conversation: session.aiConversation,
    });
  } catch (error) {
    console.log("Error in sendMessage controller:", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
}

/**
 * POST /api/ai-interview/end
 * End the AI interview session and get final feedback
 */
export async function endAISession(req, res) {
  try {
    const { sessionId, finalCode } = req.body;
    const userId = req.user._id;

    if (!sessionId) {
      return res.status(400).json({ message: "Session ID is required" });
    }

    const session = await Session.findById(sessionId);

    if (!session) {
      return res.status(404).json({ message: "Session not found" });
    }

    if (session.host.toString() !== userId.toString()) {
      return res.status(403).json({ message: "Unauthorized" });
    }

    if (session.sessionType !== "ai") {
      return res.status(400).json({ message: "This is not an AI session" });
    }

    // Generate comprehensive feedback
    const feedbackResult = await generateInterviewFeedback(
      session.aiConversation.map(m => ({ role: m.role, content: m.content })),
      finalCode || session.codeSnapshot || "",
      {
        title: session.problem,
        difficulty: session.difficulty,
      }
    );

    if (feedbackResult.success && feedbackResult.feedback) {
      session.aiFeedback = {
        overallScore: feedbackResult.feedback.overallScore || 5,
        technicalScore: feedbackResult.feedback.technicalScore || 5,
        communicationScore: feedbackResult.feedback.communicationScore || 5,
        problemSolvingScore: feedbackResult.feedback.problemSolvingScore || 5,
        improvements: feedbackResult.feedback.improvements || [],
        summary: feedbackResult.feedback.summary || "Interview completed.",
      };
      session.rating = Math.round(feedbackResult.feedback.overallScore / 2); // Convert 10-scale to 5-scale
    }

    // Save final code
    if (finalCode) {
      session.codeSnapshot = finalCode;
    }

    session.status = "completed";
    await session.save();

    res.status(200).json({ 
      session,
      feedback: session.aiFeedback,
      message: "AI interview completed successfully" 
    });
  } catch (error) {
    console.log("Error in endAISession controller:", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
}

/**
 * GET /api/ai-interview/:id
 * Get AI session details
 */
export async function getAISession(req, res) {
  try {
    const { id } = req.params;

    const session = await Session.findById(id)
      .populate("host", "name email profileImage clerkId");

    if (!session) {
      return res.status(404).json({ message: "Session not found" });
    }

    if (session.sessionType !== "ai") {
      return res.status(400).json({ message: "This is not an AI session" });
    }

    res.status(200).json({ session });
  } catch (error) {
    console.log("Error in getAISession controller:", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
}
