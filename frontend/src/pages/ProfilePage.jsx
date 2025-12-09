import { useUser } from "@clerk/clerk-react";
import { useNavigate } from "react-router";
import { useMyRecentSessions } from "../hooks/useSessions";
import Navbar from "../components/Navbar";
import {
    TrophyIcon,
    FlameIcon,
    CodeIcon,
    ClockIcon,
    StarIcon,
    CalendarIcon,
    ArrowLeftIcon,
    AwardIcon,
    TargetIcon,
    ZapIcon,
} from "lucide-react";
import { useMemo } from "react";
import { format } from "date-fns";

function ProfilePage() {
    const { user } = useUser();
    const navigate = useNavigate();
    const { data: recentSessionsData, isLoading } = useMyRecentSessions();

    const sessions = recentSessionsData?.sessions || [];

    // Calculate user stats
    const stats = useMemo(() => {
        const difficultyCount = { easy: 0, medium: 0, hard: 0 };
        const problemsSolved = new Set();
        let streak = 0;
        let totalSessions = sessions.length;

        // Sort sessions by date for streak calculation
        const sortedSessions = [...sessions].sort(
            (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
        );

        sessions.forEach((session) => {
            if (session.difficulty) {
                difficultyCount[session.difficulty.toLowerCase()] =
                    (difficultyCount[session.difficulty.toLowerCase()] || 0) + 1;
            }
            if (session.problem) {
                problemsSolved.add(session.problem);
            }
        });

        // Calculate streak (consecutive days with sessions)
        if (sortedSessions.length > 0) {
            let lastDate = new Date(sortedSessions[0].createdAt);
            streak = 1;
            for (let i = 1; i < sortedSessions.length; i++) {
                const currentDate = new Date(sortedSessions[i].createdAt);
                const daysDiff = Math.floor(
                    (lastDate - currentDate) / (1000 * 60 * 60 * 24)
                );
                if (daysDiff <= 1) {
                    streak++;
                    lastDate = currentDate;
                } else {
                    break;
                }
            }
        }

        return {
            totalSessions,
            uniqueProblems: problemsSolved.size,
            difficultyCount,
            streak,
            hardPercentage: totalSessions > 0
                ? Math.round((difficultyCount.hard / totalSessions) * 100)
                : 0,
        };
    }, [sessions]);

    // Calculate badges
    const badges = useMemo(() => {
        const earned = [];

        if (stats.totalSessions >= 1) {
            earned.push({ id: "first-session", name: "First Steps", icon: StarIcon, color: "text-yellow-400" });
        }
        if (stats.totalSessions >= 10) {
            earned.push({ id: "10-sessions", name: "Dedicated", icon: FlameIcon, color: "text-orange-500" });
        }
        if (stats.uniqueProblems >= 5) {
            earned.push({ id: "5-problems", name: "Problem Solver", icon: TargetIcon, color: "text-green-500" });
        }
        if (stats.difficultyCount.hard >= 3) {
            earned.push({ id: "3-hard", name: "Challenge Seeker", icon: ZapIcon, color: "text-purple-500" });
        }
        if (stats.streak >= 3) {
            earned.push({ id: "streak-3", name: "On Fire", icon: FlameIcon, color: "text-red-500" });
        }
        if (stats.totalSessions >= 25) {
            earned.push({ id: "25-sessions", name: "Veteran", icon: TrophyIcon, color: "text-amber-500" });
        }

        return earned;
    }, [stats]);

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
                {/* Back Button */}
                <button
                    onClick={() => navigate(-1)}
                    className="btn btn-ghost btn-sm gap-2 mb-6"
                >
                    <ArrowLeftIcon className="w-4 h-4" />
                    Back
                </button>

                {/* Profile Header */}
                <div className="card bg-gradient-to-r from-primary/20 via-secondary/20 to-accent/20 border border-base-300 mb-8">
                    <div className="card-body flex-row items-center gap-6">
                        <div className="avatar">
                            <div className="w-24 rounded-full ring ring-primary ring-offset-base-100 ring-offset-2">
                                <img src={user?.imageUrl} alt={user?.fullName} />
                            </div>
                        </div>
                        <div className="flex-1">
                            <h1 className="text-3xl font-bold">{user?.fullName}</h1>
                            <p className="text-base-content/60">{user?.primaryEmailAddress?.emailAddress}</p>
                            <p className="text-sm text-base-content/50 mt-1">
                                <CalendarIcon className="inline w-4 h-4 mr-1" />
                                Member since {user?.createdAt ? format(new Date(user.createdAt), "MMMM yyyy") : "N/A"}
                            </p>
                        </div>
                        <div className="text-right">
                            <div className="flex items-center gap-2 text-3xl font-bold text-primary">
                                <FlameIcon className="w-8 h-8 text-orange-500" />
                                {stats.streak} day streak
                            </div>
                        </div>
                    </div>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                    <div className="card bg-base-100 border border-base-300">
                        <div className="card-body p-4 items-center text-center">
                            <CodeIcon className="w-8 h-8 text-primary mb-2" />
                            <div className="text-3xl font-bold">{stats.totalSessions}</div>
                            <div className="text-sm opacity-60">Total Sessions</div>
                        </div>
                    </div>
                    <div className="card bg-base-100 border border-base-300">
                        <div className="card-body p-4 items-center text-center">
                            <TargetIcon className="w-8 h-8 text-secondary mb-2" />
                            <div className="text-3xl font-bold">{stats.uniqueProblems}</div>
                            <div className="text-sm opacity-60">Problems Solved</div>
                        </div>
                    </div>
                    <div className="card bg-base-100 border border-base-300">
                        <div className="card-body p-4 items-center text-center">
                            <ZapIcon className="w-8 h-8 text-warning mb-2" />
                            <div className="text-3xl font-bold">{stats.difficultyCount.hard}</div>
                            <div className="text-sm opacity-60">Hard Problems</div>
                        </div>
                    </div>
                    <div className="card bg-base-100 border border-base-300">
                        <div className="card-body p-4 items-center text-center">
                            <AwardIcon className="w-8 h-8 text-success mb-2" />
                            <div className="text-3xl font-bold">{badges.length}</div>
                            <div className="text-sm opacity-60">Badges Earned</div>
                        </div>
                    </div>
                </div>

                {/* Difficulty Breakdown */}
                <div className="card bg-base-100 border border-base-300 mb-8">
                    <div className="card-body">
                        <h2 className="card-title mb-4">Difficulty Breakdown</h2>
                        <div className="flex gap-4">
                            <div className="flex-1">
                                <div className="flex justify-between mb-1">
                                    <span className="text-sm font-medium">Easy</span>
                                    <span className="text-sm text-success">{stats.difficultyCount.easy}</span>
                                </div>
                                <progress
                                    className="progress progress-success"
                                    value={stats.difficultyCount.easy}
                                    max={stats.totalSessions || 1}
                                ></progress>
                            </div>
                            <div className="flex-1">
                                <div className="flex justify-between mb-1">
                                    <span className="text-sm font-medium">Medium</span>
                                    <span className="text-sm text-warning">{stats.difficultyCount.medium}</span>
                                </div>
                                <progress
                                    className="progress progress-warning"
                                    value={stats.difficultyCount.medium}
                                    max={stats.totalSessions || 1}
                                ></progress>
                            </div>
                            <div className="flex-1">
                                <div className="flex justify-between mb-1">
                                    <span className="text-sm font-medium">Hard</span>
                                    <span className="text-sm text-error">{stats.difficultyCount.hard}</span>
                                </div>
                                <progress
                                    className="progress progress-error"
                                    value={stats.difficultyCount.hard}
                                    max={stats.totalSessions || 1}
                                ></progress>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Badges */}
                <div className="card bg-base-100 border border-base-300">
                    <div className="card-body">
                        <h2 className="card-title mb-4">
                            <TrophyIcon className="w-5 h-5 text-warning" />
                            Badges ({badges.length})
                        </h2>
                        {badges.length > 0 ? (
                            <div className="flex flex-wrap gap-4">
                                {badges.map((badge) => (
                                    <div
                                        key={badge.id}
                                        className="flex flex-col items-center gap-2 p-4 bg-base-200 rounded-xl"
                                    >
                                        <div className="p-3 bg-base-300 rounded-full">
                                            <badge.icon className={`w-8 h-8 ${badge.color}`} />
                                        </div>
                                        <span className="text-sm font-medium">{badge.name}</span>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-8 text-base-content/50">
                                <TrophyIcon className="w-12 h-12 mx-auto mb-2 opacity-30" />
                                <p>Complete sessions to earn badges!</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

export default ProfilePage;
