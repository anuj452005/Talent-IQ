import {
  CallControls,
  CallingState,
  ParticipantView,
  SpeakerLayout,
  useCallStateHooks,
} from "@stream-io/video-react-sdk";
import { MicIcon, VideoIcon, Loader2Icon, MessageSquareIcon, UsersIcon, XIcon, SettingsIcon } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router";
import { Channel, Chat, MessageInput, MessageList, Thread, Window } from "stream-chat-react";
import RecordingControls from "./RecordingControls";

import "@stream-io/video-react-sdk/dist/css/styles.css";
import "stream-chat-react/dist/css/v2/index.css";

function VideoCallUI({ chatClient, channel, sessionName = "coding-session" }) {
  const navigate = useNavigate();
  const { useCallCallingState, useParticipantCount } = useCallStateHooks();
  const callingState = useCallCallingState();
  const participantCount = useParticipantCount();
  const [isChatOpen, setIsChatOpen] = useState(false);

  if (callingState === CallingState.JOINING) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center">
          <Loader2Icon className="w-12 h-12 mx-auto animate-spin text-primary mb-4" />
          <p className="text-lg">Joining call...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex gap-3 relative str-video">
      <div className="flex-1 flex flex-col gap-3">
        {/* Participants count badge, Recording Controls, and Chat Toggle */}
        <div className="flex items-center justify-between gap-2 bg-base-100 p-3 rounded-lg shadow">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <UsersIcon className="w-5 h-5 text-primary" />
              <span className="font-semibold">
                {participantCount} {participantCount === 1 ? "participant" : "participants"}
              </span>
            </div>

            {/* Recording Controls */}
            <RecordingControls sessionName={sessionName} />
          </div>

          <div className="flex items-center gap-2">
            <DeviceSelectorDropdown />
            {chatClient && channel && (
              <button
                onClick={() => setIsChatOpen(!isChatOpen)}
                className={`btn btn-sm gap-2 ${isChatOpen ? "btn-primary" : "btn-ghost"}`}
                title={isChatOpen ? "Hide chat" : "Show chat"}
              >
                <MessageSquareIcon className="size-4" />
                Chat
              </button>
            )}
          </div>
        </div>

        {/* Smart Mute Alert Overlay */}
        <SmartMuteDetector />

        <div className="flex-1 bg-base-300 rounded-lg overflow-hidden relative">
          <SpeakerLayout
            ParticipantViewUI={CustomParticipantViewUI}
          />
        </div>

        <div className="bg-base-100 p-3 rounded-lg shadow flex justify-center">
          <CallControls onLeave={() => navigate("/dashboard")} />
        </div>
      </div>

      {/* CHAT SECTION */}

      {chatClient && channel && (
        <div
          className={`flex flex-col rounded-lg shadow overflow-hidden bg-[#272a30] transition-all duration-300 ease-in-out ${isChatOpen ? "w-80 opacity-100" : "w-0 opacity-0"
            }`}
        >
          {isChatOpen && (
            <>
              <div className="bg-[#1c1e22] p-3 border-b border-[#3a3d44] flex items-center justify-between">
                <h3 className="font-semibold text-white">Session Chat</h3>
                <button
                  onClick={() => setIsChatOpen(false)}
                  className="text-gray-400 hover:text-white transition-colors"
                  title="Close chat"
                >
                  <XIcon className="size-5" />
                </button>
              </div>
              <div className="flex-1 overflow-hidden stream-chat-dark">
                <Chat client={chatClient} theme="str-chat__theme-dark">
                  <Channel channel={channel}>
                    <Window>
                      <MessageList />
                      <MessageInput />
                    </Window>
                    <Thread />
                  </Channel>
                </Chat>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}
function CustomParticipantViewUI() {
  const { useIsSpeaking } = useCallStateHooks();
  const isSpeaking = useIsSpeaking();

  return (
    <>
      {isSpeaking && (
        <div className="absolute inset-0 pointer-events-none rounded-lg border-4 border-primary animate-pulse z-10" />
      )}
    </>
  );
}

function SmartMuteDetector() {
  const { useMicrophoneState, useIsSpeaking } = useCallStateHooks();
  const { isMuted } = useMicrophoneState();
  const isSpeaking = useIsSpeaking();
  const [showAlert, setShowAlert] = useState(false);

  useEffect(() => {
    if (isMuted && isSpeaking) {
      setShowAlert(true);
      const timer = setTimeout(() => setShowAlert(false), 3000);
      return () => clearTimeout(timer);
    }
  }, [isMuted, isSpeaking]);

  if (!showAlert) return null;

  return (
    <div className="absolute top-20 left-1/2 -translate-x-1/2 z-50 animate-bounce">
      <div className="alert alert-warning shadow-lg py-2 px-4 flex items-center gap-2 border-2 border-warning">
        <MicIcon className="size-5" />
        <span className="font-bold">You are muted!</span>
      </div>
    </div>
  );
}

function DeviceSelectorDropdown() {
  const { useMicrophones, useCameras } = useCallStateHooks();
  const { devices: mics, selectedDevice: activeMic } = useMicrophones();
  const { devices: cams, selectedDevice: activeCam } = useCameras();
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="dropdown dropdown-end">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="btn btn-ghost btn-sm btn-square"
        title="Settings"
      >
        <SettingsIcon className="size-5" />
      </button>
      {isOpen && (
        <div className="dropdown-content z-[100] menu p-4 shadow-2xl bg-base-100 rounded-box w-72 border border-base-300 mt-2">
          <h3 className="font-bold mb-3 flex items-center gap-2">
            <MicIcon className="size-4 text-primary" /> Microphones
          </h3>
          <div className="space-y-1 mb-4 max-h-40 overflow-y-auto">
            {mics?.map(mic => (
              <button
                key={mic.deviceId}
                className={`w-full text-left text-xs p-2 rounded hover:bg-base-200 truncate ${mic.deviceId === activeMic?.deviceId ? 'bg-primary/20 text-primary font-bold' : ''}`}
                onClick={() => {
                  activeMic?.select(mic.deviceId);
                  setIsOpen(false);
                }}
              >
                {mic.label || 'Unknown Microphone'}
              </button>
            ))}
          </div>

          <h3 className="font-bold mb-3 flex items-center gap-2">
            <VideoIcon className="size-4 text-secondary" /> Cameras
          </h3>
          <div className="space-y-1 max-h-40 overflow-y-auto">
            {cams?.map(cam => (
              <button
                key={cam.deviceId}
                className={`w-full text-left text-xs p-2 rounded hover:bg-base-200 truncate ${cam.deviceId === activeCam?.deviceId ? 'bg-secondary/20 text-secondary font-bold' : ''}`}
                onClick={() => {
                  activeCam?.select(cam.deviceId);
                  setIsOpen(false);
                }}
              >
                {cam.label || 'Unknown Camera'}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default VideoCallUI;

