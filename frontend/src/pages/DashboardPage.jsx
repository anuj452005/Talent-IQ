import { useNavigate } from "react-router";
import { useUser } from "@clerk/clerk-react";
import { useState } from "react";
import { useActiveSessions, useCreateSession, useMyRecentSessions } from "../hooks/useSessions";
import { useStartAISession } from "../hooks/useAISession";

import Navbar from "../components/Navbar";
import WelcomeSection from "../components/WelcomeSection";
import StatsCards from "../components/StatsCards";
import ActiveSessions from "../components/ActiveSessions";
import RecentSessions from "../components/RecentSessions";
import CreateSessionModal from "../components/CreateSessionModal";
import AnalyticsCharts from "../components/AnalyticsCharts";
import { PROBLEMS } from "../data/problems";

function DashboardPage() {
  const navigate = useNavigate();
  const { user } = useUser();
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [roomConfig, setRoomConfig] = useState({ problem: "", difficulty: "" });
  const [sessionType, setSessionType] = useState("human");

  const createSessionMutation = useCreateSession();
  const startAISessionMutation = useStartAISession();

  const { data: activeSessionsData, isLoading: loadingActiveSessions } = useActiveSessions();
  const { data: recentSessionsData, isLoading: loadingRecentSessions } = useMyRecentSessions();

  const handleCreateRoom = () => {
    if (!roomConfig.problem || !roomConfig.difficulty) return;

    if (sessionType === "ai") {
      // Find problem description for AI context
      const problemData = Object.values(PROBLEMS).find((p) => p.title === roomConfig.problem);

      startAISessionMutation.mutate(
        {
          problem: roomConfig.problem,
          difficulty: roomConfig.difficulty.toLowerCase(),
          problemDescription: problemData?.description?.text || roomConfig.problem,
        },
        {
          onSuccess: (data) => {
            setShowCreateModal(false);
            setRoomConfig({ problem: "", difficulty: "" });
            setSessionType("human");
            navigate(`/ai-session/${data.session._id}`);
          },
        }
      );
    } else {
      createSessionMutation.mutate(
        {
          problem: roomConfig.problem,
          difficulty: roomConfig.difficulty.toLowerCase(),
        },
        {
          onSuccess: (data) => {
            setShowCreateModal(false);
            setRoomConfig({ problem: "", difficulty: "" });
            navigate(`/session/${data.session._id}`);
          },
        }
      );
    }
  };

  const handleCloseModal = () => {
    setShowCreateModal(false);
    setRoomConfig({ problem: "", difficulty: "" });
    setSessionType("human");
  };

  const activeSessions = activeSessionsData?.sessions || [];
  const recentSessions = recentSessionsData?.sessions || [];

  const isUserInSession = (session) => {
    if (!user.id) return false;

    return session.host?.clerkId === user.id || session.participant?.clerkId === user.id;
  };

  const isCreating = createSessionMutation.isPending || startAISessionMutation.isPending;

  return (
    <>
      <div className="min-h-screen bg-base-300">
        <Navbar />
        <WelcomeSection onCreateSession={() => setShowCreateModal(true)} />

        {/* Grid layout */}
        <div className="container mx-auto px-6 pb-16">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <StatsCards
              activeSessionsCount={activeSessions.length}
              recentSessionsCount={recentSessions.length}
            />
            <ActiveSessions
              sessions={activeSessions}
              isLoading={loadingActiveSessions}
              isUserInSession={isUserInSession}
            />
          </div>

          <RecentSessions sessions={recentSessions} isLoading={loadingRecentSessions} />

          {/* Analytics Dashboard */}
          <AnalyticsCharts sessions={recentSessions} />
        </div>
      </div>

      <CreateSessionModal
        isOpen={showCreateModal}
        onClose={handleCloseModal}
        roomConfig={roomConfig}
        setRoomConfig={setRoomConfig}
        onCreateRoom={handleCreateRoom}
        isCreating={isCreating}
        sessionType={sessionType}
        onSessionTypeChange={setSessionType}
      />
    </>
  );
}

export default DashboardPage;
