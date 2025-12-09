import dotenv from "dotenv";

dotenv.config({ quiet: true });

export const ENV = {
  PORT: process.env.PORT,
  DB_URL: process.env.DB_URL,
  NODE_ENV: process.env.NODE_ENV,
  CLIENT_URL: process.env.CLIENT_URL,
  INNGEST_EVENT_KEY: process.env.INNGEST_EVENT_KEY,
  INNGEST_SIGNING_KEY: process.env.INNGEST_SIGNING_KEY,
  STREAM_API_KEY: process.env.STREAM_API_KEY,
  STREAM_API_SECRET: process.env.STREAM_API_SECRET,
  GEMINI_API_KEY: process.env.GEMINI_API_KEY, // Free AI API from Google
};

/**
 * Check and log the status of all environment variables
 * Call this during server startup to see what's configured
 */
export const checkEnvConfig = () => {
  console.log("\n🔧 ═══════════════════════════════════════════════════════");
  console.log("   ENVIRONMENT CONFIGURATION STATUS");
  console.log("═══════════════════════════════════════════════════════════\n");

  // Server config
  console.log("📡 SERVER:");
  console.log(`   • PORT: ${ENV.PORT ? `✅ ${ENV.PORT}` : "❌ Not set"}`);
  console.log(`   • NODE_ENV: ${ENV.NODE_ENV ? `✅ ${ENV.NODE_ENV}` : "❌ Not set"}`);
  console.log(`   • CLIENT_URL: ${ENV.CLIENT_URL ? `✅ ${ENV.CLIENT_URL}` : "❌ Not set"}`);

  // Database
  console.log("\n🗄️  DATABASE:");
  console.log(`   • MongoDB: ${ENV.DB_URL ? "✅ Configured" : "❌ DB_URL not set"}`);

  // Inngest
  console.log("\n⚡ INNGEST (Event Processing):");
  console.log(`   • Event Key: ${ENV.INNGEST_EVENT_KEY ? "✅ Configured" : "❌ Not set"}`);
  console.log(`   • Signing Key: ${ENV.INNGEST_SIGNING_KEY ? "✅ Configured" : "❌ Not set"}`);

  // Stream
  console.log("\n📹 STREAM (Chat & Video):");
  console.log(`   • API Key: ${ENV.STREAM_API_KEY ? "✅ Configured" : "❌ Not set"}`);
  console.log(`   • API Secret: ${ENV.STREAM_API_SECRET ? "✅ Configured" : "❌ Not set"}`);

  // Gemini AI
  console.log("\n🤖 GEMINI AI (Code Review):");
  console.log(`   • API Key: ${ENV.GEMINI_API_KEY ? "✅ Configured" : "❌ Not set"}`);

  // Clerk (from process.env directly as these are used by Clerk middleware)
  console.log("\n🔐 CLERK (Authentication):");
  console.log(`   • Publishable Key: ${process.env.CLERK_PUBLISHABLE_KEY ? "✅ Configured" : "❌ Not set"}`);
  console.log(`   • Secret Key: ${process.env.CLERK_SECRET_KEY ? "✅ Configured" : "❌ Not set"}`);

  console.log("\n═══════════════════════════════════════════════════════════\n");
};
