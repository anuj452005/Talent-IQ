import { useEffect, useState } from "react";
import { useUser } from "@clerk/clerk-react";
import axiosInstance from "../lib/axios";

/**
 * Hook to sync user from Clerk to MongoDB
 * This is a fallback for when Inngest webhooks can't reach localhost
 * Call this in your App component to ensure user is synced after login
 */
export const useUserSync = () => {
  const { isSignedIn, isLoaded, user } = useUser();
  const [isSynced, setIsSynced] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const syncUser = async () => {
      if (!isLoaded || !isSignedIn || !user || isSynced || isSyncing) return;

      setIsSyncing(true);
      setError(null);

      try {
        // Try to sync user to MongoDB
        await axiosInstance.post("/users/sync", {
          email: user.primaryEmailAddress?.emailAddress,
          name: user.fullName || user.firstName || "User",
          profileImage: user.imageUrl,
        });

        console.log("✅ User synced successfully");
        setIsSynced(true);
      } catch (err) {
        // If user already exists, that's fine
        if (err.response?.status === 200 || err.response?.data?.message === "User already synced") {
          console.log("✅ User already synced");
          setIsSynced(true);
        } else {
          console.error("❌ Error syncing user:", err);
          setError(err.response?.data?.message || "Failed to sync user");
        }
      } finally {
        setIsSyncing(false);
      }
    };

    syncUser();
  }, [isLoaded, isSignedIn, user, isSynced, isSyncing]);

  return { isSynced, isSyncing, error };
};
