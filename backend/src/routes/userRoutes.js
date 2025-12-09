import express from "express";
import { requireAuth, getAuth } from "@clerk/express";
import User from "../models/User.js";
import { upsertStreamUser } from "../lib/stream.js";

const router = express.Router();

/**
 * Sync user from Clerk to MongoDB and Stream
 * This is a fallback for when Inngest webhooks can't reach localhost
 * Call this after login to ensure user exists in the database
 */
router.post("/sync", requireAuth(), async (req, res) => {
  try {
    const auth = getAuth(req);
    const clerkId = auth.userId;

    if (!clerkId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    // Check if user already exists
    let user = await User.findOne({ clerkId });

    if (user) {
      console.log("✅ User already synced:", user.email);
      return res.status(200).json({ message: "User already synced", user });
    }

    // Get user details from the request body (sent from frontend)
    const { email, name, profileImage } = req.body;

    if (!email || !name) {
      return res.status(400).json({ 
        message: "Missing user data. Please provide email and name." 
      });
    }

    // Create user in MongoDB
    user = await User.create({
      clerkId,
      email,
      name,
      profileImage: profileImage || "",
    });

    console.log("✅ User synced to MongoDB:", user.email);

    // Create user in Stream
    await upsertStreamUser({
      id: clerkId.toString(),
      name: user.name,
      image: user.profileImage,
    });

    console.log("✅ User synced to Stream");

    res.status(201).json({ message: "User synced successfully", user });
  } catch (error) {
    console.error("❌ Error syncing user:", error);
    res.status(500).json({ message: "Error syncing user", error: error.message });
  }
});

/**
 * Get current user profile
 */
router.get("/me", requireAuth(), async (req, res) => {
  try {
    const auth = getAuth(req);
    const clerkId = auth.userId;

    const user = await User.findOne({ clerkId });

    if (!user) {
      return res.status(404).json({ message: "User not found. Please sync first." });
    }

    res.status(200).json({ user });
  } catch (error) {
    console.error("Error getting user:", error);
    res.status(500).json({ message: "Error getting user" });
  }
});

export default router;
