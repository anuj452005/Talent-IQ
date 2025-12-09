import mongoose from "mongoose";

const sessionSchema = new mongoose.Schema(
  {
    problem: {
      type: String,
      required: true,
    },
    difficulty: {
      type: String,
      enum: ["easy", "medium", "hard"],
      required: true,
    },
    host: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    participant: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    status: {
      type: String,
      enum: ["active", "completed"],
      default: "active",
    },
    // Session type: 'human' for video call, 'ai' for AI interview
    sessionType: {
      type: String,
      enum: ["human", "ai"],
      default: "human",
    },
    // stream video call ID (only for human sessions)
    callId: {
      type: String,
      default: "",
    },
    // Collaboration Features
    interviewerNotes: {
      type: String,
      default: "",
    },
    rating: {
      type: Number,
      min: 0,
      max: 5,
      default: 0,
    },
    recordingUrl: {
      type: String,
      default: "",
    },
    // Code snapshot at end of session
    codeSnapshot: {
      type: String,
      default: "",
    },
    language: {
      type: String,
      default: "javascript",
    },
    // AI Session specific fields
    aiConversation: [{
      role: { type: String, enum: ["user", "ai"] },
      content: { type: String },
      timestamp: { type: Date, default: Date.now },
    }],
    aiFeedback: {
      overallScore: { type: Number, min: 0, max: 10 },
      technicalScore: { type: Number, min: 0, max: 10 },
      communicationScore: { type: Number, min: 0, max: 10 },
      problemSolvingScore: { type: Number, min: 0, max: 10 },
      improvements: [{ type: String }],
      summary: { type: String },
    },
  },
  { timestamps: true }
);

const Session = mongoose.model("Session", sessionSchema);

export default Session;
