import { CircleIcon, DownloadIcon, Square, Trash2Icon } from "lucide-react";
import { useScreenRecording } from "../hooks/useScreenRecording";

function RecordingControls({ sessionName = "session" }) {
    const {
        isRecording,
        formattedTime,
        recordingBlob,
        error,
        startRecording,
        stopRecording,
        downloadRecording,
        clearRecording,
    } = useScreenRecording();

    return (
        <div className="flex items-center gap-2">
            {/* Recording Status Indicator */}
            {isRecording && (
                <div className="flex items-center gap-2 bg-error/20 px-3 py-1.5 rounded-lg">
                    <CircleIcon className="w-3 h-3 fill-error text-error animate-pulse" />
                    <span className="text-error font-mono text-sm font-semibold">
                        {formattedTime}
                    </span>
                </div>
            )}

            {/* Record/Stop Button */}
            {!isRecording ? (
                <button
                    onClick={startRecording}
                    className="btn btn-sm btn-outline btn-error gap-2"
                    title="Start screen recording"
                >
                    <CircleIcon className="w-4 h-4 fill-error" />
                    Record
                </button>
            ) : (
                <button
                    onClick={stopRecording}
                    className="btn btn-sm btn-error gap-2"
                    title="Stop recording"
                >
                    <Square className="w-4 h-4 fill-white" />
                    Stop
                </button>
            )}

            {/* Download Button - Shows when recording is available */}
            {recordingBlob && !isRecording && (
                <div className="flex items-center gap-1">
                    <button
                        onClick={() => downloadRecording(sessionName)}
                        className="btn btn-sm btn-success gap-2"
                        title="Download recording"
                    >
                        <DownloadIcon className="w-4 h-4" />
                        Download
                    </button>
                    <button
                        onClick={clearRecording}
                        className="btn btn-sm btn-ghost btn-square"
                        title="Clear recording"
                    >
                        <Trash2Icon className="w-4 h-4" />
                    </button>
                </div>
            )}

            {/* Error Display */}
            {error && (
                <span className="text-error text-xs">{error}</span>
            )}
        </div>
    );
}

export default RecordingControls;
