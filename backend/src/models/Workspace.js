import mongoose from "mongoose";

// Block schema for individual content blocks
const blockSchema = new mongoose.Schema({
  blockId: {
    type: String,
    required: true,
  },
  type: {
    type: String,
    enum: ["heading", "text", "code", "bullet", "numbered"],
    required: true,
  },
  content: {
    type: String,
    default: "",
  },
  // Heading specific
  level: {
    type: Number,
    enum: [1, 2, 3],
    default: 2,
  },
  // Code block specific
  language: {
    type: String,
    default: "javascript",
  },
  code: {
    type: String,
    default: "",
  },
  testCases: [{
    input: { type: String, default: "" },
    expectedOutput: { type: String, default: "" },
    actualOutput: { type: String, default: "" },
    passed: { type: Boolean, default: null },
  }],
});

const workspaceSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      default: "Untitled Workspace",
    },
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    // Shared collaborators (for future multi-person feature)
    collaborators: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    }],
    // All content blocks in order
    blocks: [blockSchema],
    // UI Settings
    zoomLevel: {
      type: Number,
      default: 100,
      min: 50,
      max: 200,
    },
    // Linked to a session (optional)
    session: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Session",
      default: null,
    },
    // Workspace status
    isArchived: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

// Index for faster queries
workspaceSchema.index({ owner: 1, createdAt: -1 });
workspaceSchema.index({ collaborators: 1 });

const Workspace = mongoose.model("Workspace", workspaceSchema);

export default Workspace;
