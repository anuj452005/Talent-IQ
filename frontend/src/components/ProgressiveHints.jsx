import { useState } from "react";
import { LightbulbIcon, ChevronDownIcon, ChevronUpIcon, LockIcon } from "lucide-react";

function ProgressiveHints({ hints = [], problem }) {
    const [revealedCount, setRevealedCount] = useState(0);
    const [isExpanded, setIsExpanded] = useState(false);

    // Use problem hints or AI-generated placeholders
    const availableHints = hints.length > 0 ? hints : [
        "Think about the data structures that would help here.",
        "Consider the time complexity requirements.",
        "Try breaking the problem into smaller sub-problems.",
    ];

    const revealNextHint = () => {
        if (revealedCount < availableHints.length) {
            setRevealedCount((prev) => prev + 1);
        }
    };

    const totalHints = availableHints.length;
    const hasMoreHints = revealedCount < totalHints;

    return (
        <div className="card bg-base-100 border border-base-300">
            <div
                className="card-body p-4 cursor-pointer"
                onClick={() => setIsExpanded(!isExpanded)}
            >
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <LightbulbIcon className="w-5 h-5 text-yellow-500" />
                        <h3 className="font-bold">Hints</h3>
                        <span className="badge badge-sm">
                            {revealedCount}/{totalHints} revealed
                        </span>
                    </div>
                    {isExpanded ? (
                        <ChevronUpIcon className="w-5 h-5" />
                    ) : (
                        <ChevronDownIcon className="w-5 h-5" />
                    )}
                </div>

                {isExpanded && (
                    <div className="mt-4 space-y-3" onClick={(e) => e.stopPropagation()}>
                        {/* Revealed Hints */}
                        {availableHints.slice(0, revealedCount).map((hint, index) => (
                            <div
                                key={index}
                                className={`p-3 rounded-lg ${index === 0
                                        ? "bg-green-500/10 border border-green-500/20"
                                        : index === 1
                                            ? "bg-yellow-500/10 border border-yellow-500/20"
                                            : "bg-red-500/10 border border-red-500/20"
                                    }`}
                            >
                                <div className="flex items-start gap-2">
                                    <span
                                        className={`badge badge-sm ${index === 0
                                                ? "badge-success"
                                                : index === 1
                                                    ? "badge-warning"
                                                    : "badge-error"
                                            }`}
                                    >
                                        Hint {index + 1}
                                    </span>
                                    <p className="text-sm text-base-content/80">{hint}</p>
                                </div>
                            </div>
                        ))}

                        {/* Locked Hints */}
                        {Array.from({ length: totalHints - revealedCount }).map((_, index) => (
                            <div
                                key={`locked-${index}`}
                                className="p-3 rounded-lg bg-base-200/50 border border-base-300"
                            >
                                <div className="flex items-center gap-2 text-base-content/40">
                                    <LockIcon className="w-4 h-4" />
                                    <span className="text-sm">
                                        Hint {revealedCount + index + 1} - Click below to reveal
                                    </span>
                                </div>
                            </div>
                        ))}

                        {/* Reveal Button */}
                        {hasMoreHints && (
                            <button
                                onClick={revealNextHint}
                                className="btn btn-outline btn-sm w-full gap-2"
                            >
                                <LightbulbIcon className="w-4 h-4" />
                                Reveal Hint {revealedCount + 1}
                                {revealedCount === 0 && (
                                    <span className="badge badge-success badge-sm">Free</span>
                                )}
                            </button>
                        )}

                        {!hasMoreHints && revealedCount > 0 && (
                            <p className="text-center text-sm text-base-content/50">
                                All hints revealed! Good luck solving the problem.
                            </p>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}

export default ProgressiveHints;
