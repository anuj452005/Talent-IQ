import { useNavigate, useParams } from "react-router";
import { useSessionById } from "../hooks/useSessions";
import { useAISessionById } from "../hooks/useAISession";
import { PROBLEMS } from "../data/problems";
import Navbar from "../components/Navbar";
import {
    ArrowLeftIcon,
    CalendarIcon,
    ClockIcon,
    StarIcon,
    CodeIcon,
    FileTextIcon,
    BotIcon,
    UsersIcon,
    TrophyIcon,
} from "lucide-react";
import { format } from "date-fns";
import { getDifficultyBadgeClass } from "../lib/utils";
import Editor from "@monaco-editor/react";

function SessionDetailPage() {
    const navigate = useNavigate();
    const { id } = useParams();

    const { data: sessionData, isLoading } = useSessionById(id);
    const session = sessionData?.session;

    const problemData = session?.problem
        ? Object.values(PROBLEMS).find((p) => p.title === session.problem)
        : null;

    if (isLoading) {
        return (
            <div className="min-h-screen bg-base-300 flex items-center justify-center">
                <span className="loading loading-spinner loading-lg text-primary"></span>
            </div>
        );
    }

    if (!session) {
        return (
            <div className="min-h-screen bg-base-300">
                <Navbar />
                <div className="container mx-auto px-6 py-8 text-center">
                    <h2 className="text-2xl font-bold mb-4">Session Not Found</h2>
                    <button onClick={() => navigate("/archive")} className="btn btn-primary">
                        Back to Archive
                    </button>
                </div>
            </div>
        );
    }

    const isAISession = session.sessionType === "ai";

    return (
        <div className="min-h-screen bg-base-300">
            <Navbar />

            <div className="container mx-auto px-6 py-8">
                {/* Back Button */}
                <button
                    onClick={() => navigate("/archive")}
                    className="btn btn-ghost gap-2 mb-6"
                >
                    <ArrowLeftIcon className="w-4 h-4" />
                    Back to Archive
                </button>

                {/* Header Card */}
                <div className="card bg-base-100 mb-6">
                    <div className="card-body">
                        <div className="flex items-start justify-between">
                            <div>
                                <div className="flex items-center gap-2 mb-2">
                                    {isAISession ? (
                                        <BotIcon className="w-5 h-5 text-secondary" />
                                    ) : (
                                        <UsersIcon className="w-5 h-5 text-primary" />
                                    )}
                                    <span className="text-sm font-medium text-base-content/60">
                                        {isAISession ? "AI Interview" : "Peer Interview"}
                                    </span>
                                </div>
                                <h1 className="text-3xl font-bold mb-2">{session.problem}</h1>
                                {problemData?.category && (
                                    <p className="text-base-content/60">{problemData.category}</p>
                                )}
                            </div>

                            <div className="flex flex-col items-end gap-2">
                                <span className={`badge badge-lg ${getDifficultyBadgeClass(session.difficulty)}`}>
                                    {session.difficulty?.charAt(0).toUpperCase() + session.difficulty?.slice(1)}
                                </span>
                                <span className={`badge ${session.status === "completed" ? "badge-success" : "badge-info"}`}>
                                    {session.status}
                                </span>
                            </div>
                        </div>

                        <div className="divider"></div>

                        <div className="flex flex-wrap gap-6">
                            <div className="flex items-center gap-2 text-sm text-base-content/70">
                                <CalendarIcon className="w-4 h-4" />
                                {session.createdAt
                                    ? format(new Date(session.createdAt), "MMMM dd, yyyy • HH:mm")
                                    : "N/A"}
                            </div>

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
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Code Snapshot */}
                    {session.codeSnapshot && (
                        <div className="card bg-base-100">
                            <div className="card-body">
                                <h2 className="card-title flex items-center gap-2">
                                    <CodeIcon className="w-5 h-5 text-primary" />
                                    Code Snapshot
                                    {session.language && (
                                        <span className="badge badge-sm">{session.language}</span>
                                    )}
                                </h2>
                                <div className="h-80 rounded-lg overflow-hidden border border-base-300">
                                    <Editor
                                        height="100%"
                                        language={session.language || "javascript"}
                                        value={session.codeSnapshot}
                                        theme="vs-dark"
                                        options={{
                                            readOnly: true,
                                            minimap: { enabled: false },
                                            fontSize: 14,
                                            scrollBeyondLastLine: false,
                                        }}
                                    />
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Interviewer Notes */}
                    {session.interviewerNotes && (
                        <div className="card bg-base-100">
                            <div className="card-body">
                                <h2 className="card-title flex items-center gap-2">
                                    <FileTextIcon className="w-5 h-5 text-warning" />
                                    Interviewer Notes
                                </h2>
                                <div className="bg-base-200 rounded-lg p-4 whitespace-pre-wrap text-sm">
                                    {session.interviewerNotes}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* AI Feedback (for AI sessions) */}
                    {isAISession && session.aiFeedback && (
                        <div className="card bg-base-100 lg:col-span-2">
                            <div className="card-body">
                                <h2 className="card-title flex items-center gap-2">
                                    <TrophyIcon className="w-5 h-5 text-primary" />
                                    AI Interview Feedback
                                </h2>

                                {/* Scores Grid */}
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 my-4">
                                    {[
                                        { label: "Overall", score: session.aiFeedback.overallScore },
                                        { label: "Technical", score: session.aiFeedback.technicalScore },
                                        { label: "Communication", score: session.aiFeedback.communicationScore },
                                        { label: "Problem Solving", score: session.aiFeedback.problemSolvingScore },
                                    ].map((item) => (
                                        <div key={item.label} className="bg-base-200 rounded-xl p-4 text-center">
                                            <p className="text-sm text-base-content/60 mb-1">{item.label}</p>
                                            <p className={`text-2xl font-bold ${item.score >= 8 ? "text-success" :
                                                    item.score >= 6 ? "text-warning" : "text-error"
                                                }`}>
                                                {item.score || "-"}/10
                                            </p>
                                        </div>
                                    ))}
                                </div>

                                {/* Summary */}
                                {session.aiFeedback.summary && (
                                    <div className="bg-base-200 rounded-lg p-4 mb-4">
                                        <h3 className="font-semibold mb-2">Summary</h3>
                                        <p className="text-base-content/80">{session.aiFeedback.summary}</p>
                                    </div>
                                )}

                                {/* Improvements */}
                                {session.aiFeedback.improvements?.length > 0 && (
                                    <div className="mb-4">
                                        <h3 className="font-semibold mb-2">Areas to Improve</h3>
                                        <ul className="space-y-1">
                                            {session.aiFeedback.improvements.map((item, idx) => (
                                                <li key={idx} className="flex items-start gap-2 text-sm text-base-content/80">
                                                    <span className="text-warning">•</span>
                                                    {item}
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {/* AI Conversation (for AI sessions) */}
                    {isAISession && session.aiConversation?.length > 0 && (
                        <div className="card bg-base-100 lg:col-span-2">
                            <div className="card-body">
                                <h2 className="card-title flex items-center gap-2">
                                    <BotIcon className="w-5 h-5 text-secondary" />
                                    Interview Conversation
                                </h2>
                                <div className="max-h-96 overflow-y-auto space-y-3">
                                    {session.aiConversation.map((msg, idx) => (
                                        <div
                                            key={idx}
                                            className={`flex gap-3 ${msg.role === "user" ? "flex-row-reverse" : ""}`}
                                        >
                                            <div className={`
                        max-w-[80%] rounded-2xl px-4 py-2
                        ${msg.role === "ai"
                                                    ? "bg-base-200 rounded-tl-sm"
                                                    : "bg-primary text-primary-content rounded-tr-sm"
                                                }
                      `}>
                                                <p className="text-sm">{msg.content}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Problem Description */}
                    {problemData && (
                        <div className="card bg-base-100 lg:col-span-2">
                            <div className="card-body">
                                <h2 className="card-title">Problem Description</h2>
                                <p className="text-base-content/80">{problemData.description?.text}</p>

                                {problemData.examples?.length > 0 && (
                                    <div className="mt-4">
                                        <h3 className="font-semibold mb-2">Examples</h3>
                                        <div className="space-y-2">
                                            {problemData.examples.map((ex, idx) => (
                                                <div key={idx} className="bg-base-200 rounded-lg p-3 font-mono text-sm">
                                                    <div>Input: {ex.input}</div>
                                                    <div>Output: {ex.output}</div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

export default SessionDetailPage;
