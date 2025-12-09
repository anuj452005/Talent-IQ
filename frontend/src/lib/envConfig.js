/**
 * Frontend Environment Configuration Check
 * Logs the status of all environment variables when the app starts
 */

const ENV = {
  VITE_CLERK_PUBLISHABLE_KEY: import.meta.env.VITE_CLERK_PUBLISHABLE_KEY,
  VITE_API_URL: import.meta.env.VITE_API_URL,
  VITE_STREAM_API_KEY: import.meta.env.VITE_STREAM_API_KEY,
};

/**
 * Check and log the status of all frontend environment variables
 * Call this during app initialization
 */
export const checkFrontendEnvConfig = () => {
  console.log("\n🔧 ═══════════════════════════════════════════════════════");
  console.log("   FRONTEND ENVIRONMENT CONFIGURATION STATUS");
  console.log("═══════════════════════════════════════════════════════════\n");

  // Clerk Authentication
  console.log("🔐 CLERK (Authentication):");
  console.log(
    `   • Publishable Key: ${
      ENV.VITE_CLERK_PUBLISHABLE_KEY ? "✅ Configured" : "❌ Not set"
    }`
  );

  // API URL
  console.log("\n📡 API:");
  console.log(
    `   • Backend URL: ${
      ENV.VITE_API_URL ? `✅ ${ENV.VITE_API_URL}` : "❌ Not set"
    }`
  );

  // Stream
  console.log("\n📹 STREAM (Chat & Video):");
  console.log(
    `   • API Key: ${ENV.VITE_STREAM_API_KEY ? "✅ Configured" : "❌ Not set"}`
  );

  console.log("\n═══════════════════════════════════════════════════════════\n");

  // Return status summary
  const allConfigured =
    ENV.VITE_CLERK_PUBLISHABLE_KEY &&
    ENV.VITE_API_URL &&
    ENV.VITE_STREAM_API_KEY;

  if (allConfigured) {
    console.log("✅ All frontend environment variables are configured!");
  } else {
    console.warn("⚠️ Some environment variables are missing. Check your .env file.");
  }
};

export default ENV;
