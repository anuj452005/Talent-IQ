import { useState, useEffect } from "react";
import { StickyNoteIcon, SaveIcon, Loader2Icon } from "lucide-react";
import toast from "react-hot-toast";

function InterviewerNotes({ sessionId, initialNotes = "", isHost, onSave }) {
    const [notes, setNotes] = useState(initialNotes);
    const [isSaving, setIsSaving] = useState(false);
    const [hasChanges, setHasChanges] = useState(false);

    useEffect(() => {
        setNotes(initialNotes);
    }, [initialNotes]);

    useEffect(() => {
        setHasChanges(notes !== initialNotes);
    }, [notes, initialNotes]);

    const handleSave = async () => {
        if (!hasChanges) return;
        setIsSaving(true);
        try {
            await onSave({ interviewerNotes: notes });
            toast.success("Notes saved successfully");
            setHasChanges(false);
        } catch (error) {
            toast.error("Failed to save notes");
        } finally {
            setIsSaving(false);
        }
    };

    if (!isHost) return null;

    return (
        <div className="card bg-base-100 border border-base-300">
            <div className="card-body p-4">
                <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                        <StickyNoteIcon className="w-5 h-5 text-warning" />
                        <h3 className="font-bold">Private Notes</h3>
                        <span className="badge badge-warning badge-sm">Host Only</span>
                    </div>
                    <button
                        onClick={handleSave}
                        disabled={isSaving || !hasChanges}
                        className={`btn btn-sm gap-2 ${hasChanges ? "btn-primary" : "btn-ghost"}`}
                    >
                        {isSaving ? (
                            <>
                                <Loader2Icon className="w-4 h-4 animate-spin" />
                                Saving...
                            </>
                        ) : (
                            <>
                                <SaveIcon className="w-4 h-4" />
                                Save
                            </>
                        )}
                    </button>
                </div>
                <textarea
                    className="textarea textarea-bordered w-full h-32 text-sm"
                    placeholder="Add private notes about this interview... (only visible to you)"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                />
                {hasChanges && (
                    <p className="text-xs text-warning mt-1">Unsaved changes</p>
                )}
            </div>
        </div>
    );
}

export default InterviewerNotes;
