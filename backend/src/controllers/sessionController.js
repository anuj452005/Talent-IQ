import { chatClient, streamClient } from "../lib/stream.js";
import Session from "../models/Session.js";

export async function createSession(req, res) {
  try {
    const { problem, difficulty } = req.body;
    const userId = req.user._id;
    const clerkId = req.user.clerkId;

    if (!problem || !difficulty) {
      return res.status(400).json({ message: "Problem and difficulty are required" });
    }

    // generate a unique call id for stream video
    const callId = `session_${Date.now()}_${Math.random().toString(36).substring(7)}`;

    // create session in db
    const session = await Session.create({ problem, difficulty, host: userId, callId });

    // create stream video call
    await streamClient.video.call("default", callId).getOrCreate({
      data: {
        created_by_id: clerkId,
        custom: { problem, difficulty, sessionId: session._id.toString() },
      },
    });

    // chat messaging
    const channel = chatClient.channel("messaging", callId, {
      name: `${problem} Session`,
      created_by_id: clerkId,
      members: [clerkId],
    });

    await channel.create();

    res.status(201).json({ session });
  } catch (error) {
    console.log("Error in createSession controller:", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
}

export async function getActiveSessions(_, res) {
  try {
    const sessions = await Session.find({ status: "active" })
      .populate("host", "name profileImage email clerkId")
      .populate("participant", "name profileImage email clerkId")
      .sort({ createdAt: -1 })
      .limit(20);

    res.status(200).json({ sessions });
  } catch (error) {
    console.log("Error in getActiveSessions controller:", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
}

export async function getMyRecentSessions(req, res) {
  try {
    const userId = req.user._id;

    // get sessions where user is either host or participant
    const sessions = await Session.find({
      status: "completed",
      $or: [{ host: userId }, { participant: userId }],
    })
      .sort({ createdAt: -1 })
      .limit(20);

    res.status(200).json({ sessions });
  } catch (error) {
    console.log("Error in getMyRecentSessions controller:", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
}

export async function getSessionById(req, res) {
  try {
    const { id } = req.params;

    const session = await Session.findById(id)
      .populate("host", "name email profileImage clerkId")
      .populate("participant", "name email profileImage clerkId");

    if (!session) return res.status(404).json({ message: "Session not found" });

    res.status(200).json({ session });
  } catch (error) {
    console.log("Error in getSessionById controller:", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
}

export async function joinSession(req, res) {
  try {
    const { id } = req.params;
    const userId = req.user._id;
    const clerkId = req.user.clerkId;

    const session = await Session.findById(id);

    if (!session) return res.status(404).json({ message: "Session not found" });

    if (session.status !== "active") {
      return res.status(400).json({ message: "Cannot join a completed session" });
    }

    if (session.host.toString() === userId.toString()) {
      // Host is rejoining their own session - that's fine, just return the session
      return res.status(200).json({ session });
    }

    // Check if user is already the participant (rejoining)
    if (session.participant && session.participant.toString() === userId.toString()) {
      // User is rejoining - just add them back to chat channel and return session
      try {
        const channel = chatClient.channel("messaging", session.callId);
        await channel.addMembers([clerkId]);
      } catch (chatError) {
        console.log("Chat member add error (non-fatal):", chatError.message);
      }
      return res.status(200).json({ session });
    }

    // Check if session is already full - has a different participant
    if (session.participant) {
      return res.status(409).json({ message: "Session is full" });
    }

    // New participant joining
    session.participant = userId;
    await session.save();

    const channel = chatClient.channel("messaging", session.callId);
    await channel.addMembers([clerkId]);

    res.status(200).json({ session });
  } catch (error) {
    console.log("Error in joinSession controller:", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
}

export async function endSession(req, res) {
  try {
    const { id } = req.params;
    const userId = req.user._id;

    const session = await Session.findById(id);

    if (!session) return res.status(404).json({ message: "Session not found" });

    // check if user is the host
    if (session.host.toString() !== userId.toString()) {
      return res.status(403).json({ message: "Only the host can end the session" });
    }

    // check if session is already completed
    if (session.status === "completed") {
      return res.status(400).json({ message: "Session is already completed" });
    }

    // Only delete Stream resources for human sessions (AI sessions don't have video calls)
    if (session.sessionType !== "ai" && session.callId) {
      try {
        // delete stream video call
        const call = streamClient.video.call("default", session.callId);
        await call.delete({ hard: true });

        // delete stream chat channel
        const channel = chatClient.channel("messaging", session.callId);
        await channel.delete();
      } catch (streamError) {
        console.log("Stream cleanup error (non-fatal):", streamError.message);
      }
    }

    session.status = "completed";
    await session.save();

    res.status(200).json({ session, message: "Session ended successfully" });
  } catch (error) {
    console.log("Error in endSession controller:", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
}

// Update session with notes, rating, code snapshot
export async function updateSession(req, res) {
  try {
    const { id } = req.params;
    const userId = req.user._id;
    const { interviewerNotes, rating, codeSnapshot, language } = req.body;

    const session = await Session.findById(id);

    if (!session) return res.status(404).json({ message: "Session not found" });

    // check if user is the host
    if (session.host.toString() !== userId.toString()) {
      return res.status(403).json({ message: "Only the host can update session" });
    }

    // Update allowed fields
    if (interviewerNotes !== undefined) session.interviewerNotes = interviewerNotes;
    if (rating !== undefined) session.rating = Math.min(5, Math.max(0, rating));
    if (codeSnapshot !== undefined) session.codeSnapshot = codeSnapshot;
    if (language !== undefined) session.language = language;

    await session.save();

    res.status(200).json({ session, message: "Session updated successfully" });
  } catch (error) {
    console.log("Error in updateSession controller:", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
}

