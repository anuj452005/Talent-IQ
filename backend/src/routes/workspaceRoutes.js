import express from "express";
import Workspace from "../models/Workspace.js";
import { getAuth } from "@clerk/express";
import User from "../models/User.js";

const router = express.Router();

// Middleware to get current user
const getCurrentUser = async (req, res, next) => {
  try {
    const { userId } = getAuth(req);
    if (!userId) {
      return res.status(401).json({ error: "Unauthorized" });
    }
    
    const user = await User.findOne({ clerkId: userId });
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    
    req.dbUser = user;
    next();
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// GET /api/workspaces - Get all workspaces for current user
router.get("/", getCurrentUser, async (req, res) => {
  try {
    const workspaces = await Workspace.find({
      $or: [
        { owner: req.dbUser._id },
        { collaborators: req.dbUser._id }
      ],
      isArchived: false,
    })
    .sort({ updatedAt: -1 })
    .select("title blocks zoomLevel createdAt updatedAt")
    .lean();

    res.json({ workspaces });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET /api/workspaces/:id - Get single workspace
router.get("/:id", getCurrentUser, async (req, res) => {
  try {
    const workspace = await Workspace.findOne({
      _id: req.params.id,
      $or: [
        { owner: req.dbUser._id },
        { collaborators: req.dbUser._id }
      ],
    }).lean();

    if (!workspace) {
      return res.status(404).json({ error: "Workspace not found" });
    }

    res.json({ workspace });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST /api/workspaces - Create new workspace
router.post("/", getCurrentUser, async (req, res) => {
  try {
    const { title, blocks, zoomLevel } = req.body;

    const workspace = new Workspace({
      title: title || "Untitled Workspace",
      owner: req.dbUser._id,
      blocks: blocks || [],
      zoomLevel: zoomLevel || 100,
    });

    await workspace.save();
    res.status(201).json({ workspace });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// PUT /api/workspaces/:id - Update workspace
router.put("/:id", getCurrentUser, async (req, res) => {
  try {
    const { title, blocks, zoomLevel } = req.body;

    const workspace = await Workspace.findOneAndUpdate(
      {
        _id: req.params.id,
        $or: [
          { owner: req.dbUser._id },
          { collaborators: req.dbUser._id }
        ],
      },
      {
        ...(title !== undefined && { title }),
        ...(blocks !== undefined && { blocks }),
        ...(zoomLevel !== undefined && { zoomLevel }),
      },
      { new: true }
    );

    if (!workspace) {
      return res.status(404).json({ error: "Workspace not found" });
    }

    res.json({ workspace });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// DELETE /api/workspaces/:id - Archive workspace
router.delete("/:id", getCurrentUser, async (req, res) => {
  try {
    const workspace = await Workspace.findOneAndUpdate(
      {
        _id: req.params.id,
        owner: req.dbUser._id, // Only owner can delete
      },
      { isArchived: true },
      { new: true }
    );

    if (!workspace) {
      return res.status(404).json({ error: "Workspace not found or not authorized" });
    }

    res.json({ message: "Workspace archived successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
