import { useState } from "react";
import {
    BrainCircuitIcon,
    LightbulbIcon,
    BookOpenIcon,
    Loader2Icon,
    XIcon,
    SparklesIcon,
} from "lucide-react";
import { aiApi } from "../api/ai";
import toast from "react-hot-toast";

function AIReviewPanel({ code, language, problemTitle, problemDescription, isOpen, onClose }) {
    const [activeTab, setActiveTab] = useState("review");
    const [isLoading, setIsLoading] = useState(false);
    const [reviewResult, setReviewResult] = useState(null);
    const [hintResult, setHintResult] = useState(null);
    const [explainResult, setExplainResult] = useState(null);

    const handleReview = async () => {
        if (!code.trim()) {
            toast.error("Please write some code first");
            return;
        }
        setIsLoading(true);
        try {
            const result = await aiApi.reviewCode(code, language, problemTitle);
            if (result.success) {
                setReviewResult(result.review);
            } else {
                toast.error(result.error || "Failed to get review");
            }
        } catch (error) {
            toast.error(error.response?.data?.error || "Failed to get review");
        } finally {
            setIsLoading(false);
        }
    };

    const handleHint = async () => {
        if (!code.trim()) {
            toast.error("Please write some code first");
            return;
        }
        setIsLoading(true);
        try {
            const result = await aiApi.getHint(code, language, problemTitle, problemDescription);
            if (result.success) {
                setHintResult(result.hint);
            } else {
                toast.error(result.error || "Failed to get hint");
            }
        } catch (error) {
            toast.error(error.response?.data?.error || "Failed to get hint");
        } finally {
            setIsLoading(false);
        }
    };

    const handleExplain = async () => {
        if (!code.trim()) {
            toast.error("Please write some code first");
            return;
        }
        setIsLoading(true);
        try {
            const result = await aiApi.explainCode(code, language);
            if (result.success) {
                setExplainResult(result.explanation);
            } else {
                toast.error(result.error || "Failed to explain code");
            }
        } catch (error) {
            toast.error(error.response?.data?.error || "Failed to explain code");
        } finally {
            setIsLoading(false);
        }
    };

    if (!isOpen) return null;

    const tabs = [
        { id: "review", label: "Review", icon: BrainCircuitIcon, action: handleReview, result: reviewResult },
        { id: "hint", label: "Hint", icon: LightbulbIcon, action: handleHint, result: hintResult },
        { id: "explain", label: "Explain", icon: BookOpenIcon, action: handleExplain, result: explainResult },
    ];

    const currentTab = tabs.find((t) => t.id === activeTab);

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-base-100 rounded-2xl shadow-2xl w-full max-w-2xl max-h-[80vh] overflow-hidden flex flex-col">
                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-base-300 bg-gradient-to-r from-primary/10 to-secondary/10">
                    <div className="flex items-center gap-3">
                        <SparklesIcon className="w-6 h-6 text-primary" />
                        <h2 className="text-xl font-bold">AI Assistant</h2>
                        <span className="badge badge-sm badge-primary">Powered by Gemini</span>
                    </div>
                    <button onClick={onClose} className="btn btn-ghost btn-sm btn-circle">
                        <XIcon className="w-5 h-5" />
                    </button>
                </div>

                {/* Tabs */}
                <div className="flex border-b border-base-300">
                    {tabs.map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 font-medium transition-all ${activeTab === tab.id
                                ? "bg-primary/10 text-primary border-b-2 border-primary"
                                : "text-base-content/60 hover:bg-base-200"
                                }`}
                        >
                            <tab.icon className="w-4 h-4" />
                            {tab.label}
                        </button>
                    ))}
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-6">
                    {currentTab?.result ? (
                        <div className="prose prose-sm max-w-none">
                            <div className="whitespace-pre-wrap text-base-content/90 leading-relaxed">
                                {currentTab.result}
                            </div>
                        </div>
                    ) : (
                        <div className="text-center py-12">
                            <currentTab.icon className="w-16 h-16 mx-auto text-primary/30 mb-4" />
                            <h3 className="text-lg font-semibold mb-2">
                                {activeTab === "review" && "Get AI Code Review"}
                                {activeTab === "hint" && "Need a Hint?"}
                                {activeTab === "explain" && "Explain My Code"}
                            </h3>
                            <p className="text-base-content/60 mb-6 max-w-md mx-auto">
                                {activeTab === "review" &&
                                    "Get feedback on correctness, time/space complexity, and code quality."}
                                {activeTab === "hint" &&
                                    "Get a helpful nudge in the right direction without spoilers."}
                                {activeTab === "explain" &&
                                    "Understand what your code does step by step."}
                            </p>
                        </div>
                    )}
                </div>

                {/* Action Button */}
                <div className="px-6 py-4 border-t border-base-300 bg-base-200/50">
                    <button
                        onClick={currentTab?.action}
                        disabled={isLoading}
                        className="btn btn-primary w-full gap-2"
                    >
                        {isLoading ? (
                            <>
                                <Loader2Icon className="w-4 h-4 animate-spin" />
                                Analyzing...
                            </>
                        ) : (
                            <>
                                <currentTab.icon className="w-4 h-4" />
                                {activeTab === "review" && "Analyze My Code"}
                                {activeTab === "hint" && "Get a Hint"}
                                {activeTab === "explain" && "Explain Code"}
                            </>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
}

export default AIReviewPanel;
