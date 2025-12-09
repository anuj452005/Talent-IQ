import {
    XIcon,
    TrophyIcon,
    BrainIcon,
    MessageSquareIcon,
    LightbulbIcon,
    TrendingUpIcon,
    StarIcon
} from "lucide-react";

function AIFeedbackModal({ isOpen, onClose, feedback, problem }) {
    if (!isOpen || !feedback) return null;

    const getScoreColor = (score) => {
        if (score >= 8) return "text-success";
        if (score >= 6) return "text-warning";
        return "text-error";
    };

    const getScoreBg = (score) => {
        if (score >= 8) return "bg-success/20";
        if (score >= 6) return "bg-warning/20";
        return "bg-error/20";
    };

    const scores = [
        {
            label: "Overall",
            score: feedback.overallScore,
            icon: TrophyIcon,
            description: "Overall interview performance"
        },
        {
            label: "Technical",
            score: feedback.technicalScore,
            icon: BrainIcon,
            description: "Code quality & correctness"
        },
        {
            label: "Communication",
            score: feedback.communicationScore,
            icon: MessageSquareIcon,
            description: "Explaining thought process"
        },
        {
            label: "Problem Solving",
            score: feedback.problemSolvingScore,
            icon: LightbulbIcon,
            description: "Approach & methodology"
        },
    ];

    return (
        <div className="modal modal-open">
            <div className="modal-box max-w-2xl">
                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h3 className="font-bold text-2xl flex items-center gap-2">
                            <TrophyIcon className="w-6 h-6 text-primary" />
                            Interview Feedback
                        </h3>
                        <p className="text-base-content/60 text-sm mt-1">
                            {problem} • AI Interview Results
                        </p>
                    </div>
                    <button onClick={onClose} className="btn btn-ghost btn-sm btn-circle">
                        <XIcon className="w-5 h-5" />
                    </button>
                </div>

                {/* Scores Grid */}
                <div className="grid grid-cols-2 gap-4 mb-6">
                    {scores.map((item) => (
                        <div
                            key={item.label}
                            className={`${getScoreBg(item.score)} rounded-xl p-4`}
                        >
                            <div className="flex items-center gap-2 mb-2">
                                <item.icon className={`w-5 h-5 ${getScoreColor(item.score)}`} />
                                <span className="font-semibold text-sm">{item.label}</span>
                            </div>
                            <div className="flex items-end justify-between">
                                <span className={`text-3xl font-bold ${getScoreColor(item.score)}`}>
                                    {item.score}
                                </span>
                                <span className="text-base-content/50 text-xs">/10</span>
                            </div>
                            <p className="text-xs text-base-content/60 mt-1">{item.description}</p>
                        </div>
                    ))}
                </div>

                {/* Summary */}
                <div className="bg-base-200 rounded-xl p-4 mb-6">
                    <h4 className="font-semibold mb-2 flex items-center gap-2">
                        <StarIcon className="w-4 h-4 text-primary" />
                        Summary
                    </h4>
                    <p className="text-sm text-base-content/80 leading-relaxed">
                        {feedback.summary || "Great effort! Keep practicing to improve."}
                    </p>
                </div>

                {/* Improvements */}
                {feedback.improvements && feedback.improvements.length > 0 && (
                    <div className="mb-6">
                        <h4 className="font-semibold mb-3 flex items-center gap-2">
                            <TrendingUpIcon className="w-4 h-4 text-warning" />
                            Areas to Improve
                        </h4>
                        <ul className="space-y-2">
                            {feedback.improvements.map((item, idx) => (
                                <li
                                    key={idx}
                                    className="flex items-start gap-2 text-sm text-base-content/80"
                                >
                                    <span className="text-warning mt-0.5">•</span>
                                    {item}
                                </li>
                            ))}
                        </ul>
                    </div>
                )}

                {/* Strengths */}
                {feedback.strengths && feedback.strengths.length > 0 && (
                    <div className="mb-6">
                        <h4 className="font-semibold mb-3 flex items-center gap-2">
                            <StarIcon className="w-4 h-4 text-success" />
                            Strengths
                        </h4>
                        <ul className="space-y-2">
                            {feedback.strengths.map((item, idx) => (
                                <li
                                    key={idx}
                                    className="flex items-start gap-2 text-sm text-base-content/80"
                                >
                                    <span className="text-success mt-0.5">✓</span>
                                    {item}
                                </li>
                            ))}
                        </ul>
                    </div>
                )}

                {/* Actions */}
                <div className="modal-action">
                    <button onClick={onClose} className="btn btn-primary">
                        Done
                    </button>
                </div>
            </div>
            <div className="modal-backdrop" onClick={onClose}></div>
        </div>
    );
}

export default AIFeedbackModal;
