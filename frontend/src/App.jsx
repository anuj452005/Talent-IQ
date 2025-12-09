import { useUser } from "@clerk/clerk-react";
import { Navigate, Route, Routes } from "react-router";
import HomePage from "./pages/HomePage";

import { Toaster } from "react-hot-toast";
import DashboardPage from "./pages/DashboardPage";
import ProblemPage from "./pages/ProblemPage";
import ProblemsPage from "./pages/ProblemsPage";
import SessionPage from "./pages/SessionPage";
import AISessionPage from "./pages/AISessionPage";
import SessionDetailPage from "./pages/SessionDetailPage";
import ProfilePage from "./pages/ProfilePage";
import SessionArchivePage from "./pages/SessionArchivePage";
import InterviewWorkspacePage from "./pages/InterviewWorkspacePage";
import WorkspacesListPage from "./pages/WorkspacesListPage";
import { useUserSync } from "./hooks/useUserSync";

function App() {
  const { isSignedIn, isLoaded } = useUser();

  // Sync user from Clerk to MongoDB (fallback for local development)
  const { isSyncing } = useUserSync();

  // this will get rid of the flickering effect
  if (!isLoaded) return null;

  // Show loading while syncing user
  if (isSignedIn && isSyncing) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="loading loading-spinner loading-lg"></div>
          <p className="mt-2 text-gray-500">Setting up your account...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <Routes>
        <Route path="/" element={!isSignedIn ? <HomePage /> : <Navigate to={"/dashboard"} />} />
        <Route path="/dashboard" element={isSignedIn ? <DashboardPage /> : <Navigate to={"/"} />} />

        <Route path="/problems" element={isSignedIn ? <ProblemsPage /> : <Navigate to={"/"} />} />
        <Route path="/problem/:id" element={isSignedIn ? <ProblemPage /> : <Navigate to={"/"} />} />
        <Route path="/session/:id" element={isSignedIn ? <SessionPage /> : <Navigate to={"/"} />} />
        <Route path="/ai-session/:id" element={isSignedIn ? <AISessionPage /> : <Navigate to={"/"} />} />
        <Route path="/session-detail/:id" element={isSignedIn ? <SessionDetailPage /> : <Navigate to={"/"} />} />
        <Route path="/profile" element={isSignedIn ? <ProfilePage /> : <Navigate to={"/"} />} />
        <Route path="/archive" element={isSignedIn ? <SessionArchivePage /> : <Navigate to={"/"} />} />
        <Route path="/workspaces" element={isSignedIn ? <WorkspacesListPage /> : <Navigate to={"/"} />} />
        <Route path="/workspace" element={isSignedIn ? <InterviewWorkspacePage /> : <Navigate to={"/"} />} />
      </Routes>

      <Toaster toastOptions={{ duration: 3000 }} />
    </>
  );
}

export default App;

