import { useState, useEffect } from "react";
import { StarIcon, ThumbsUpIcon, ThumbsDownIcon } from "lucide-react";
import toast from "react-hot-toast";

function SessionRating({ sessionId, initialRating = 0, isHost, onSave }) {
    const [rating, setRating] = useState(initialRating);
    const [hoverRating, setHoverRating] = useState(0);

    useEffect(() => {
        setRating(initialRating);
    }, [initialRating]);

    const handleRatingClick = async (value) => {
        if (!isHost) return;
        setRating(value);
        try {
            await onSave({ rating: value });
            toast.success(`Rated ${value} stars`);
        } catch (error) {
            toast.error("Failed to save rating");
            setRating(initialRating);
        }
    };

    if (!isHost) {
        return rating > 0 ? (
            <div className="flex items-center gap-2">
                <span className="text-sm opacity-70">Rating:</span>
                <div className="flex">
                    {[1, 2, 3, 4, 5].map((star) => (
                        <StarIcon
                            key={star}
                            className={`w-5 h-5 ${star <= rating ? "text-yellow-400 fill-yellow-400" : "text-base-content/20"
                                }`}
                        />
                    ))}
                </div>
            </div>
        ) : null;
    }

    return (
        <div className="card bg-base-100 border border-base-300">
            <div className="card-body p-4">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <StarIcon className="w-5 h-5 text-yellow-400" />
                        <h3 className="font-bold">Rate Candidate</h3>
                    </div>

                    {/* Star Rating */}
                    <div className="flex gap-1">
                        {[1, 2, 3, 4, 5].map((star) => (
                            <button
                                key={star}
                                onClick={() => handleRatingClick(star)}
                                onMouseEnter={() => setHoverRating(star)}
                                onMouseLeave={() => setHoverRating(0)}
                                className="p-1 hover:scale-110 transition-transform"
                            >
                                <StarIcon
                                    className={`w-7 h-7 ${star <= (hoverRating || rating)
                                            ? "text-yellow-400 fill-yellow-400"
                                            : "text-base-content/20"
                                        }`}
                                />
                            </button>
                        ))}
                    </div>
                </div>

                {/* Quick Feedback Buttons */}
                <div className="flex gap-2 mt-3">
                    <button
                        onClick={() => handleRatingClick(5)}
                        className={`btn btn-sm flex-1 gap-2 ${rating >= 4 ? "btn-success" : "btn-outline btn-success"
                            }`}
                    >
                        <ThumbsUpIcon className="w-4 h-4" />
                        Strong Hire
                    </button>
                    <button
                        onClick={() => handleRatingClick(3)}
                        className={`btn btn-sm flex-1 gap-2 ${rating === 3 ? "btn-warning" : "btn-outline btn-warning"
                            }`}
                    >
                        Maybe
                    </button>
                    <button
                        onClick={() => handleRatingClick(1)}
                        className={`btn btn-sm flex-1 gap-2 ${rating > 0 && rating <= 2 ? "btn-error" : "btn-outline btn-error"
                            }`}
                    >
                        <ThumbsDownIcon className="w-4 h-4" />
                        No Hire
                    </button>
                </div>
            </div>
        </div>
    );
}

export default SessionRating;
