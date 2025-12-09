import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router";
import { useUser } from "@clerk/clerk-react";
import { Panel, PanelGroup, PanelResizeHandle } from "react-resizable-panels";
import {
    Loader2Icon,
    LogOutIcon,
    PlayIcon,
    BotIcon,
    CodeIcon
} from "lucide-react";

import Navbar from "../components/Navbar";
import CodeEditorPanel from "../components/CodeEditorPanel";
import OutputPanel from "../components/OutputPanel";
import AIChat from "../components/AIChat";
import AIFeedbackModal from "../components/AIFeedbackModal";

import { useAISessionById, useSendAIMessage, useEndAISession } from "../hooks/useAISession";
import { PROBLEMS } from "../data/problems";
import { executeCode } from "../lib/piston";
import { getDifficultyBadgeClass } from "../lib/utils";

function AISessionPage() {
    const navigate = useNavigate();
    const { id } = useParams();
    const { user } = useUser();

    const [selectedLanguage, setSelectedLanguage] = useState("javascript");
    const [code, setCode] = useState("");
    const [output, setOutput] = useState(null);
    const [isRunning, setIsRunning] = useState(false);
    const [showFeedback, setShowFeedback] = useState(false);

    const { data: sessionData, isLoading: loadingSession, refetch } = useAISessionById(id);
    const sendMessageMutation = useSendAIMessage();
    const endSessionMutation = useEndAISession();

    const session = sessionData?.session;

    // Find problem data
    const problemData = session?.problem
        ? Object.values(PROBLEMS).find((p) => p.title === session.problem)
        : null;

    // Set initial code when problem loads
    useEffect(() => {
        if (problemData?.starterCode?.[selectedLanguage]) {
            setCode(problemData.starterCode[selectedLanguage]);
        }
    }, [problemData, selectedLanguage]);

    const handleLanguageChange = (e) => {
        const newLang = e.target.value;
        setSelectedLanguage(newLang);
        const starterCode = problemData?.starterCode?.[newLang] || "";
        setCode(starterCode);
        setOutput(null);
    };

    const handleRunCode = async () => {
        setIsRunning(true);
        setOutput(null);
        const result = await executeCode(selectedLanguage, code);
        setOutput(result);
        setIsRunning(false);
    };

    const handleSendMessage = async (message) => {
        if (!session) return;

        await sendMessageMutation.mutateAsync({
            sessionId: session._id,
            message,
            currentCode: code,
        });

        refetch();
    };

    const handleEndInterview = async () => {
        if (!confirm("Are you sure you want to end the interview? You'll receive your feedback after.")) {
            return;
        }

        const result = await endSessionMutation.mutateAsync({
            sessionId: session._id,
            finalCode: code,
        });

        if (result.feedback) {
            setShowFeedback(true);
        }
        refetch();
    };

    const handleFeedbackClose = () => {
        setShowFeedback(false);
        navigate("/dashboard");
    };

    if (loadingSession) {
        return (
            <div className="h-screen bg-base-100 flex flex-col">
                <Navbar />
                <div className="flex-1 flex items-center justify-center">
                    <div className="text-center">
                        <Loader2Icon className="w-12 h-12 mx-auto animate-spin text-primary mb-4" />
                        <p className="text-lg">Loading AI Interview...</p>
                    </div>
                </div>
            </div>
        );
    }

    if (!session) {
        return (
            <div className="h-screen bg-base-100 flex flex-col">
                <Navbar />
                <div className="flex-1 flex items-center justify-center">
                    <div className="text-center">
                        <BotIcon className="w-16 h-16 mx-auto mb-4 text-error opacity-50" />
                        <h2 className="text-2xl font-bold mb-2">Session Not Found</h2>
                        <p className="text-base-content/60 mb-4">This AI interview session doesn't exist.</p>
                        <button onClick={() => navigate("/dashboard")} className="btn btn-primary">
                            Back to Dashboard
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    const isCompleted = session.status === "completed";

    return (
        <div className="h-screen bg-base-100 flex flex-col">
            <Navbar />

            <div className="flex-1">
                <PanelGroup direction="horizontal">
                    {/* LEFT PANEL - CODE EDITOR & PROBLEM */}
                    <Panel defaultSize={55} minSize={30}>
                        <PanelGroup direction="vertical">
                            {/* Problem Description */}
                            <Panel defaultSize={40} minSize={20}>
                                <div className="h-full overflow-y-auto bg-base-200">
                                    {/* Header */}
                                    <div className="p-6 bg-base-100 border-b border-base-300">
                                        <div className="flex items-start justify-between mb-3">
                                            <div>
                                                <div className="flex items-center gap-2 mb-1">
                                                    <BotIcon className="w-5 h-5 text-primary" />
                                                    <span className="text-sm text-primary font-medium">AI Interview</span>
                                                </div>
                                                <h1 className="text-2xl font-bold text-base-content">
                                                    {session.problem}
                                                </h1>
                                                {problemData?.category && (
                                                    <p className="text-base-content/60 mt-1">{problemData.category}</p>
                                                )}
                                            </div>

                                            <div className="flex items-center gap-3">
                                                <span className={`badge badge-lg ${getDifficultyBadgeClass(session.difficulty)}`}>
                                                    {session.difficulty.charAt(0).toUpperCase() + session.difficulty.slice(1)}
                                                </span>

                                                {isCompleted ? (
                                                    <span className="badge badge-ghost badge-lg">Completed</span>
                                                ) : (
                                                    <button
                                                        onClick={handleEndInterview}
                                                        disabled={endSessionMutation.isPending}
                                                        className="btn btn-error btn-sm gap-2"
                                                    >
                                                        {endSessionMutation.isPending ? (
                                                            <Loader2Icon className="w-4 h-4 animate-spin" />
                                                        ) : (
                                                            <LogOutIcon className="w-4 h-4" />
                                                        )}
                                                        End Interview
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    <div className="p-6 space-y-6">
                                        {/* Problem Description */}
                                        {problemData?.description && (
                                            <div className="bg-base-100 rounded-xl shadow-sm p-5 border border-base-300">
                                                <h2 className="text-xl font-bold mb-4 text-base-content">Description</h2>
                                                <div className="space-y-3 text-base leading-relaxed">
                                                    <p className="text-base-content/90">{problemData.description.text}</p>
                                                    {problemData.description.notes?.map((note, idx) => (
                                                        <p key={idx} className="text-base-content/90">{note}</p>
                                                    ))}
                                                </div>
                                            </div>
                                        )}

                                        {/* Examples */}
                                        {problemData?.examples && problemData.examples.length > 0 && (
                                            <div className="bg-base-100 rounded-xl shadow-sm p-5 border border-base-300">
                                                <h2 className="text-xl font-bold mb-4 text-base-content">Examples</h2>
                                                <div className="space-y-4">
                                                    {problemData.examples.map((example, idx) => (
                                                        <div key={idx}>
                                                            <div className="flex items-center gap-2 mb-2">
                                                                <span className="badge badge-sm">{idx + 1}</span>
                                                                <p className="font-semibold text-base-content">Example {idx + 1}</p>
                                                            </div>
                                                            <div className="bg-base-200 rounded-lg p-4 font-mono text-sm space-y-1.5">
                                                                <div className="flex gap-2">
                                                                    <span className="text-primary font-bold min-w-[70px]">Input:</span>
                                                                    <span>{example.input}</span>
                                                                </div>
                                                                <div className="flex gap-2">
                                                                    <span className="text-secondary font-bold min-w-[70px]">Output:</span>
                                                                    <span>{example.output}</span>
                                                                </div>
                                                                {example.explanation && (
                                                                    <div className="pt-2 border-t border-base-300 mt-2">
                                                                        <span className="text-base-content/60 font-sans text-xs">
                                                                            <span className="font-semibold">Explanation:</span> {example.explanation}
                                                                        </span>
                                                                    </div>
                                                                )}
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        )}

                                        {/* Constraints */}
                                        {problemData?.constraints && problemData.constraints.length > 0 && (
                                            <div className="bg-base-100 rounded-xl shadow-sm p-5 border border-base-300">
                                                <h2 className="text-xl font-bold mb-4 text-base-content">Constraints</h2>
                                                <ul className="space-y-2 text-base-content/90">
                                                    {problemData.constraints.map((constraint, idx) => (
                                                        <li key={idx} className="flex gap-2">
                                                            <span className="text-primary">•</span>
                                                            <code className="text-sm">{constraint}</code>
                                                        </li>
                                                    ))}
                                                </ul>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </Panel>

                            <PanelResizeHandle className="h-2 bg-base-300 hover:bg-primary transition-colors cursor-row-resize" />

                            {/* Code Editor */}
                            <Panel defaultSize={40} minSize={20}>
                                <PanelGroup direction="vertical">
                                    <Panel defaultSize={70} minSize={30}>
                                        <CodeEditorPanel
                                            selectedLanguage={selectedLanguage}
                                            code={code}
                                            isRunning={isRunning}
                                            onLanguageChange={handleLanguageChange}
                                            onCodeChange={(value) => setCode(value)}
                                            onRunCode={handleRunCode}
                                            onAIClick={() => { }} // Disable AI panel in AI session
                                        />
                                    </Panel>

                                    <PanelResizeHandle className="h-2 bg-base-300 hover:bg-primary transition-colors cursor-row-resize" />

                                    <Panel defaultSize={30} minSize={15}>
                                        <OutputPanel output={output} />
                                    </Panel>
                                </PanelGroup>
                            </Panel>
                        </PanelGroup>
                    </Panel>

                    <PanelResizeHandle className="w-2 bg-base-300 hover:bg-primary transition-colors cursor-col-resize" />

                    {/* RIGHT PANEL - AI CHAT */}
                    <Panel defaultSize={45} minSize={25}>
                        <div className="h-full p-4 bg-base-200">
                            <AIChat
                                conversation={session.aiConversation || []}
                                onSendMessage={handleSendMessage}
                                isLoading={sendMessageMutation.isPending}
                                disabled={isCompleted}
                                autoStartVoiceMode={true}
                            />
                        </div>
                    </Panel>
                </PanelGroup>
            </div>

            {/* Feedback Modal */}
            <AIFeedbackModal
                isOpen={showFeedback || (isCompleted && session.aiFeedback)}
                onClose={handleFeedbackClose}
                feedback={session.aiFeedback}
                problem={session.problem}
            />
        </div>
    );
}

export default AISessionPage;
