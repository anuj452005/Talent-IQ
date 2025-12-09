import { useState } from "react";
import { useNavigate } from "react-router";
import { useMyRecentSessions } from "../hooks/useSessions";
import Navbar from "../components/Navbar";
import {
    VideoIcon,
    CalendarIcon,
    ClockIcon,
    StarIcon,
    PlayCircleIcon,
    FileTextIcon,
    ChevronRightIcon,
    ArchiveIcon,
    BotIcon,
} from "lucide-react";
import { format } from "date-fns";
import { getDifficultyBadgeClass } from "../lib/utils";

function SessionArchivePage() {
    const navigate = useNavigate();
    const { data: sessionsData, isLoading } = useMyRecentSessions();
    const [filter, setFilter] = useState("all"); // all, completed, rated

    const sessions = sessionsData?.sessions || [];

    const filteredSessions = sessions.filter((session) => {
        if (filter === "completed") return session.status === "completed";
        if (filter === "rated") return session.rating > 0;
        return true;
    });

    const completedCount = sessions.filter((s) => s.status === "completed").length;
    const ratedCount = sessions.filter((s) => s.rating > 0).length;

    if (isLoading) {
        return (
            <div className="min-h-screen bg-base-300 flex items-center justify-center">
                <span className="loading loading-spinner loading-lg text-primary"></span>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-base-300">
            <Navbar />

            <div className="container mx-auto px-6 py-8">
                {/* Header */}
                <div className="flex items-center gap-4 mb-8">
                    <div className="p-3 bg-primary/10 rounded-xl">
                        <ArchiveIcon className="w-8 h-8 text-primary" />
                    </div>
                    <div>
                        <h1 className="text-3xl font-bold">Session Archive</h1>
                        <p className="text-base-content/60">Review past interview sessions</p>
                    </div>
                </div>

                {/* Stats */}
                <div className="stats stats-horizontal bg-base-100 w-full mb-6">
                    <div className="stat">
                        <div className="stat-title">Total Sessions</div>
                        <div className="stat-value text-primary">{sessions.length}</div>
                    </div>
                    <div className="stat">
                        <div className="stat-title">Completed</div>
                        <div className="stat-value text-success">{completedCount}</div>
                    </div>
                    <div className="stat">
                        <div className="stat-title">Rated</div>
                        <div className="stat-value text-warning">{ratedCount}</div>
                    </div>
                </div>

                {/* Filter Tabs */}
                <div className="tabs tabs-boxed mb-6 bg-base-100 p-1">
                    <button
                        className={`tab ${filter === "all" ? "tab-active" : ""}`}
                        onClick={() => setFilter("all")}
                    >
                        All ({sessions.length})
                    </button>
                    <button
                        className={`tab ${filter === "completed" ? "tab-active" : ""}`}
                        onClick={() => setFilter("completed")}
                    >
                        Completed ({completedCount})
                    </button>
                    <button
                        className={`tab ${filter === "rated" ? "tab-active" : ""}`}
                        onClick={() => setFilter("rated")}
                    >
                        Rated ({ratedCount})
                    </button>
                </div>

                {/* Sessions List */}
                <div className="space-y-4">
                    {filteredSessions.length === 0 ? (
                        <div className="card bg-base-100 p-12 text-center">
                            <VideoIcon className="w-12 h-12 mx-auto text-base-content/30 mb-4" />
                            <h3 className="text-lg font-semibold mb-2">No sessions found</h3>
                            <p className="text-base-content/60">
                                {filter === "all"
                                    ? "Start an interview session to see it here"
                                    : "No sessions match this filter"}
                            </p>
                        </div>
                    ) : (
                        filteredSessions.map((session) => (
                            <div
                                key={session._id}
                                className="card bg-base-100 hover:shadow-lg transition-shadow cursor-pointer"
                                onClick={() => {
                                    // For completed sessions, go to detail view
                                    // For active AI sessions, go to AI session page
                                    // For active human sessions, go to session page
                                    if (session.status === "completed") {
                                        navigate(`/session-detail/${session._id}`);
                                    } else if (session.sessionType === "ai") {
                                        navigate(`/ai-session/${session._id}`);
                                    } else {
                                        navigate(`/session/${session._id}`);
                                    }
                                }}
                            >
                                <div className="card-body">
                                    <div className="flex items-center justify-between">
                                        <div className="flex-1">
                                            <div className="flex items-center gap-3 mb-2">
                                                <div className={`p-2 rounded-lg ${session.sessionType === 'ai' ? 'bg-secondary/10' : 'bg-primary/10'}`}>
                                                    {session.sessionType === 'ai' ? (
                                                        <BotIcon className="w-5 h-5 text-secondary" />
                                                    ) : (
                                                        <VideoIcon className="w-5 h-5 text-primary" />
                                                    )}
                                                </div>
                                                <div>
                                                    <h3 className="font-bold text-lg">{session.problem}</h3>
                                                    <div className="flex items-center gap-2 text-sm text-base-content/60">
                                                        <CalendarIcon className="w-4 h-4" />
                                                        {session.createdAt
                                                            ? format(new Date(session.createdAt), "MMM dd, yyyy • HH:mm")
                                                            : "N/A"}
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="flex items-center gap-3">
                                                <span
                                                    className={`badge ${getDifficultyBadgeClass(session.difficulty)}`}
                                                >
                                                    {session.difficulty}
                                                </span>
                                                <span
                                                    className={`badge ${session.status === "completed"
                                                        ? "badge-success"
                                                        : "badge-info"
                                                        }`}
                                                >
                                                    {session.status}
                                                </span>

                                                {/* Rating */}
                                                {session.rating > 0 && (
                                                    <div className="flex items-center gap-1">
                                                        {[1, 2, 3, 4, 5].map((star) => (
                                                            <StarIcon
                                                                key={star}
                                                                className={`w-4 h-4 ${star <= session.rating
                                                                    ? "text-yellow-400 fill-yellow-400"
                                                                    : "text-base-content/20"
                                                                    }`}
                                                            />
                                                        ))}
                                                    </div>
                                                )}

                                                {/* Has Notes Indicator */}
                                                {session.interviewerNotes && (
                                                    <div className="flex items-center gap-1 text-sm text-base-content/60">
                                                        <FileTextIcon className="w-4 h-4" />
                                                        Has notes
                                                    </div>
                                                )}

                                                {/* Participants */}
                                                {session.participant && (
                                                    <span className="text-sm text-base-content/60">
                                                        with {session.participant.name}
                                                    </span>
                                                )}
                                            </div>
                                        </div>

                                        <ChevronRightIcon className="w-5 h-5 text-base-content/40" />
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
}

export default SessionArchivePage;
