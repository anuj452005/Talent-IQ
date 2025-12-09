import { Code2Icon, LoaderIcon, PlusIcon, UsersIcon, BotIcon } from "lucide-react";
import { PROBLEMS } from "../data/problems";

function CreateSessionModal({
  isOpen,
  onClose,
  roomConfig,
  setRoomConfig,
  onCreateRoom,
  isCreating,
  sessionType = "human",
  onSessionTypeChange,
}) {
  const problems = Object.values(PROBLEMS);

  if (!isOpen) return null;

  return (
    <div className="modal modal-open">
      <div className="modal-box max-w-2xl">
        <h3 className="font-bold text-2xl mb-6">Create New Session</h3>

        <div className="space-y-8">
          {/* SESSION TYPE SELECTION */}
          <div className="space-y-2">
            <label className="label">
              <span className="label-text font-semibold">Session Type</span>
            </label>
            <div className="grid grid-cols-2 gap-4">
              <button
                type="button"
                onClick={() => onSessionTypeChange?.("human")}
                className={`card bg-base-200 p-4 cursor-pointer transition-all hover:shadow-md ${sessionType === "human"
                    ? "ring-2 ring-primary bg-primary/10"
                    : "hover:bg-base-300"
                  }`}
              >
                <div className="flex flex-col items-center text-center gap-2">
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center ${sessionType === "human" ? "bg-primary/20" : "bg-base-300"
                    }`}>
                    <UsersIcon className={`w-6 h-6 ${sessionType === "human" ? "text-primary" : "text-base-content/60"
                      }`} />
                  </div>
                  <span className="font-semibold">Practice with Interviewer</span>
                  <span className="text-xs text-base-content/60">
                    Video call with another person
                  </span>
                </div>
              </button>

              <button
                type="button"
                onClick={() => onSessionTypeChange?.("ai")}
                className={`card bg-base-200 p-4 cursor-pointer transition-all hover:shadow-md ${sessionType === "ai"
                    ? "ring-2 ring-secondary bg-secondary/10"
                    : "hover:bg-base-300"
                  }`}
              >
                <div className="flex flex-col items-center text-center gap-2">
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center ${sessionType === "ai" ? "bg-secondary/20" : "bg-base-300"
                    }`}>
                    <BotIcon className={`w-6 h-6 ${sessionType === "ai" ? "text-secondary" : "text-base-content/60"
                      }`} />
                  </div>
                  <span className="font-semibold">Practice with AI Agent</span>
                  <span className="text-xs text-base-content/60">
                    AI interviewer with feedback
                  </span>
                </div>
              </button>
            </div>
          </div>

          {/* PROBLEM SELECTION */}
          <div className="space-y-2">
            <label className="label">
              <span className="label-text font-semibold">Select Problem</span>
              <span className="label-text-alt text-error">*</span>
            </label>

            <select
              className="select w-full"
              value={roomConfig.problem}
              onChange={(e) => {
                const selectedProblem = problems.find((p) => p.title === e.target.value);
                setRoomConfig({
                  difficulty: selectedProblem.difficulty,
                  problem: e.target.value,
                });
              }}
            >
              <option value="" disabled>
                Choose a coding problem...
              </option>

              {problems.map((problem) => (
                <option key={problem.id} value={problem.title}>
                  {problem.title} ({problem.difficulty})
                </option>
              ))}
            </select>
          </div>

          {/* ROOM SUMMARY */}
          {roomConfig.problem && (
            <div className={`alert ${sessionType === "ai" ? "alert-info" : "alert-success"}`}>
              <Code2Icon className="size-5" />
              <div>
                <p className="font-semibold">Session Summary:</p>
                <p>
                  Problem: <span className="font-medium">{roomConfig.problem}</span>
                </p>
                <p>
                  Type: <span className="font-medium">
                    {sessionType === "ai" ? "AI Interview (Solo Practice)" : "1-on-1 with Interviewer"}
                  </span>
                </p>
              </div>
            </div>
          )}

          {sessionType === "ai" && (
            <div className="bg-base-200 rounded-lg p-4">
              <h4 className="font-semibold mb-2 flex items-center gap-2">
                <BotIcon className="w-4 h-4 text-secondary" />
                What to expect:
              </h4>
              <ul className="text-sm text-base-content/70 space-y-1">
                <li>• AI will present the problem and ask clarifying questions</li>
                <li>• Explain your approach and the AI will give feedback</li>
                <li>• Code your solution with real-time AI guidance</li>
                <li>• Get detailed feedback on your performance</li>
              </ul>
            </div>
          )}
        </div>

        <div className="modal-action">
          <button className="btn btn-ghost" onClick={onClose}>
            Cancel
          </button>

          <button
            className={`btn gap-2 ${sessionType === "ai" ? "btn-secondary" : "btn-primary"}`}
            onClick={onCreateRoom}
            disabled={isCreating || !roomConfig.problem}
          >
            {isCreating ? (
              <LoaderIcon className="size-5 animate-spin" />
            ) : (
              <PlusIcon className="size-5" />
            )}

            {isCreating ? "Creating..." : sessionType === "ai" ? "Start AI Interview" : "Create Session"}
          </button>
        </div>
      </div>
      <div className="modal-backdrop" onClick={onClose}></div>
    </div>
  );
}
export default CreateSessionModal;
