import { useState } from "react";
import { FileDownIcon, Loader2Icon, StarIcon, XIcon } from "lucide-react";
import { downloadReport } from "../lib/pdfGenerator";
import toast from "react-hot-toast";

function ReportExport({ session, problem, code, output, isHost }) {
    const [showModal, setShowModal] = useState(false);
    const [isGenerating, setIsGenerating] = useState(false);
    const [rating, setRating] = useState(0);
    const [notes, setNotes] = useState("");

    // Only show for hosts and completed sessions
    if (!isHost || session?.status !== "completed") {
        return null;
    }

    const handleExport = async () => {
        setIsGenerating(true);
        try {
            downloadReport(session, problem, code, output, notes, rating);
            toast.success("Report downloaded successfully!");
            setShowModal(false);
        } catch (error) {
            toast.error("Failed to generate report");
            console.error("PDF generation error:", error);
        } finally {
            setIsGenerating(false);
        }
    };

    return (
        <>
            <button
                onClick={() => setShowModal(true)}
                className="btn btn-outline btn-sm gap-2"
                title="Export Interview Report"
            >
                <FileDownIcon className="w-4 h-4" />
                Export PDF
            </button>

            {showModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-base-100 rounded-2xl shadow-2xl w-full max-w-md">
                        {/* Header */}
                        <div className="flex items-center justify-between px-6 py-4 border-b border-base-300">
                            <h2 className="text-xl font-bold">Export Interview Report</h2>
                            <button onClick={() => setShowModal(false)} className="btn btn-ghost btn-sm btn-circle">
                                <XIcon className="w-5 h-5" />
                            </button>
                        </div>

                        {/* Content */}
                        <div className="p-6 space-y-6">
                            {/* Rating */}
                            <div>
                                <label className="label">
                                    <span className="label-text font-medium">Rate the Candidate</span>
                                </label>
                                <div className="flex gap-1">
                                    {[1, 2, 3, 4, 5].map((star) => (
                                        <button
                                            key={star}
                                            onClick={() => setRating(star)}
                                            className={`p-1 hover:scale-110 transition-transform ${star <= rating ? "text-yellow-400" : "text-base-content/30"
                                                }`}
                                        >
                                            <StarIcon className="w-8 h-8" fill={star <= rating ? "currentColor" : "none"} />
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Notes */}
                            <div>
                                <label className="label">
                                    <span className="label-text font-medium">Interviewer Notes</span>
                                </label>
                                <textarea
                                    className="textarea textarea-bordered w-full h-32"
                                    placeholder="Add your notes about the candidate's performance..."
                                    value={notes}
                                    onChange={(e) => setNotes(e.target.value)}
                                />
                            </div>

                            {/* Preview Info */}
                            <div className="bg-base-200 rounded-lg p-4">
                                <h4 className="font-medium mb-2">Report will include:</h4>
                                <ul className="text-sm text-base-content/70 space-y-1">
                                    <li>• Session details & participants</li>
                                    <li>• Problem description</li>
                                    <li>• Code solution</li>
                                    <li>• Execution results</li>
                                    <li>• Your rating & notes</li>
                                </ul>
                            </div>
                        </div>

                        {/* Footer */}
                        <div className="px-6 py-4 border-t border-base-300 flex gap-3">
                            <button
                                onClick={() => setShowModal(false)}
                                className="btn btn-ghost flex-1"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleExport}
                                disabled={isGenerating}
                                className="btn btn-primary flex-1 gap-2"
                            >
                                {isGenerating ? (
                                    <>
                                        <Loader2Icon className="w-4 h-4 animate-spin" />
                                        Generating...
                                    </>
                                ) : (
                                    <>
                                        <FileDownIcon className="w-4 h-4" />
                                        Download PDF
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}

export default ReportExport;
