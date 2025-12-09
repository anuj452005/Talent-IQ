import { useState, useRef, useEffect, useCallback } from "react";
import {
    SendIcon,
    Loader2Icon,
    BotIcon,
    UserIcon,
    MicIcon,
    MicOffIcon,
    Volume2Icon,
    VolumeXIcon,
    PhoneIcon,
    PhoneOffIcon,
    MessageSquareIcon
} from "lucide-react";
import { useSpeechToText, useTextToSpeech } from "../hooks/useSpeech";

function AIChat({
    conversation = [],
    onSendMessage,
    isLoading = false,
    disabled = false,
    autoStartVoiceMode = false
}) {
    const [message, setMessage] = useState("");
    const [isVoiceActive, setIsVoiceActive] = useState(false);
    const [hasSpokenIntro, setHasSpokenIntro] = useState(false);
    const [showTextMode, setShowTextMode] = useState(false);
    const chatEndRef = useRef(null);
    const lastSpokenIndexRef = useRef(-1);
    const pendingMessageRef = useRef("");


    // Speech hooks
    const {
        isListening,
        transcript,
        isSupported: sttSupported,
        startListening,
        stopListening,
        resetTranscript
    } = useSpeechToText();

    const {
        isSpeaking,
        isSupported: ttsSupported,
        speak,
        stop: stopSpeaking
    } = useTextToSpeech();

    const voiceSupported = sttSupported && ttsSupported;

    // Send message after silence detection (when lisening stops)
    // DEFINED EARLY to avoid ReferenceError in useEffect
    const handleSendVoiceMessage = useCallback(() => {
        const msg = pendingMessageRef.current.trim();
        if (msg && !isLoading) {
            stopListening();
            onSendMessage(msg);
            pendingMessageRef.current = "";
            setMessage("");
            resetTranscript();
        }
    }, [isLoading, onSendMessage, resetTranscript, stopListening]);

    // Auto-scroll to bottom
    useEffect(() => {
        chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [conversation]);

    // Update pending message from transcript (no auto-send - user clicks mic to send)
    useEffect(() => {
        if (transcript) {
            pendingMessageRef.current = transcript;
            setMessage(transcript);
        }
    }, [transcript]);

    // Auto-speak AI messages
    useEffect(() => {
        if (conversation.length > 0 && isVoiceActive) {
            const lastMessage = conversation[conversation.length - 1];
            const lastIndex = conversation.length - 1;

            if (lastMessage.role === "ai" && lastIndex > lastSpokenIndexRef.current) {
                lastSpokenIndexRef.current = lastIndex;
                speak(lastMessage.content);
            }
        }
    }, [conversation, isVoiceActive, speak]);

    // When AI finishes speaking, auto-start listening
    useEffect(() => {
        if (isVoiceActive && !isSpeaking && !isListening && !isLoading && !disabled) {
            // Small delay before starting to listen
            const timer = setTimeout(() => {
                if (isVoiceActive && !isSpeaking && !isListening && !isLoading) {
                    resetTranscript();
                    setMessage("");
                    startListening();
                }
            }, 500);
            return () => clearTimeout(timer);
        }
    }, [isSpeaking, isVoiceActive, isListening, isLoading, disabled, resetTranscript, startListening]);

    // Auto-start voice mode when conversation has intro
    useEffect(() => {
        if (autoStartVoiceMode && voiceSupported && conversation.length > 0 && !hasSpokenIntro && !disabled) {
            const firstMessage = conversation[0];
            if (firstMessage.role === "ai") {
                setIsVoiceActive(true);
                setHasSpokenIntro(true);
                lastSpokenIndexRef.current = -1; // Reset to speak from beginning
            }
        }
    }, [autoStartVoiceMode, voiceSupported, conversation, hasSpokenIntro, disabled]);

    // Handle manual send
    const handleSubmit = (e) => {
        e?.preventDefault();
        const msg = message.trim();
        if (!msg || isLoading || disabled) return;

        if (isListening) stopListening();
        if (isSpeaking) stopSpeaking();

        onSendMessage(msg);
        setMessage("");
        pendingMessageRef.current = "";
        resetTranscript();
    };

    const handleKeyDown = (e) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            handleSubmit(e);
        }
    };

    // Start voice call
    const startVoiceCall = () => {
        setIsVoiceActive(true);
        setShowTextMode(false);

        // Speak the last AI message if exists
        if (conversation.length > 0) {
            const lastAI = [...conversation].reverse().find(m => m.role === "ai");
            if (lastAI) {
                speak(lastAI.content);
            }
        }
    };

    // End voice call
    const endVoiceCall = () => {
        stopListening();
        stopSpeaking();
        setIsVoiceActive(false);
        setShowTextMode(true);
    };

    // Toggle listening manually
    const toggleListening = () => {
        if (isSpeaking) {
            stopSpeaking();
            return;
        }

        if (isListening) {
            stopListening();
            // Send the accumulated message
            setTimeout(handleSendVoiceMessage, 300);
        } else {
            resetTranscript();
            setMessage("");
            startListening();
        }
    };

    // If voice is active, show the voice call UI
    if (isVoiceActive && !showTextMode) {
        return (
            <div className="flex flex-col h-full bg-gradient-to-b from-base-100 to-base-200 rounded-xl border border-base-300">
                {/* Voice Call Header */}
                <div className="p-4 text-center border-b border-base-300">
                    <div className="flex items-center justify-center gap-2 mb-2">
                        <div className={`w-3 h-3 rounded-full ${isListening ? 'bg-red-500 animate-pulse' : isSpeaking ? 'bg-green-500 animate-pulse' : 'bg-blue-500'}`} />
                        <span className="font-semibold">
                            {isListening ? 'Listening...' : isSpeaking ? 'AI Speaking...' : isLoading ? 'Processing...' : 'Your turn to speak'}
                        </span>
                    </div>
                </div>

                {/* Avatar and Status */}
                <div className="flex-1 flex flex-col items-center justify-center p-8">
                    <div className={`w-32 h-32 rounded-full flex items-center justify-center mb-6 transition-all duration-500 ${isSpeaking ? 'bg-green-500/20 scale-110 animate-pulse' :
                        isListening ? 'bg-red-500/20 scale-105' :
                            'bg-primary/20'
                        }`}>
                        <BotIcon className={`w-16 h-16 ${isSpeaking ? 'text-green-500' :
                            isListening ? 'text-red-500' :
                                'text-primary'
                            }`} />
                    </div>

                    <h2 className="text-2xl font-bold mb-2">AI Interviewer</h2>

                    <p className="text-base-content/60 text-center mb-6 max-w-xs">
                        {isSpeaking
                            ? "Listening to AI response..."
                            : isListening
                                ? "Speak your answer now..."
                                : isLoading
                                    ? "Processing your response..."
                                    : "Click the mic or wait for AI"
                        }
                    </p>

                    {/* Live Transcript */}
                    {(isListening || message) && (
                        <div className="bg-base-200 rounded-xl p-4 mb-6 w-full max-w-sm min-h-[60px]">
                            <p className="text-sm text-base-content/70 mb-1">You:</p>
                            <p className="text-base-content">{message || "..."}</p>
                        </div>
                    )}

                    {/* Mic Button */}
                    <button
                        onClick={toggleListening}
                        disabled={isLoading || disabled}
                        className={`btn btn-circle btn-lg w-20 h-20 transition-all duration-300 ${isListening
                            ? 'btn-error animate-pulse scale-110'
                            : isSpeaking
                                ? 'btn-success'
                                : 'btn-primary hover:scale-105'
                            }`}
                    >
                        {isListening ? (
                            <MicOffIcon className="w-8 h-8" />
                        ) : isSpeaking ? (
                            <Volume2Icon className="w-8 h-8" />
                        ) : (
                            <MicIcon className="w-8 h-8" />
                        )}
                    </button>

                    <p className="text-xs text-base-content/50 mt-4">
                        {isListening
                            ? "Click to finish speaking"
                            : isSpeaking
                                ? "Click to skip AI response"
                                : "Click to speak"
                        }
                    </p>
                </div>

                {/* Bottom Controls */}
                <div className="p-4 border-t border-base-300 flex justify-center gap-4">
                    <button
                        onClick={() => setShowTextMode(true)}
                        className="btn btn-ghost gap-2"
                    >
                        <MessageSquareIcon className="w-4 h-4" />
                        Switch to Text
                    </button>
                    <button
                        onClick={endVoiceCall}
                        className="btn btn-error gap-2"
                    >
                        <PhoneOffIcon className="w-4 h-4" />
                        End Call
                    </button>
                </div>
            </div>
        );
    }

    // Text mode UI
    return (
        <div className="flex flex-col h-full bg-base-100 rounded-xl border border-base-300">
            {/* Chat Header */}
            <div className="p-4 border-b border-base-300 bg-gradient-to-r from-primary/10 to-secondary/10">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
                            <BotIcon className="w-5 h-5 text-primary" />
                        </div>
                        <div>
                            <h3 className="font-semibold text-base-content">AI Interviewer</h3>
                            <p className="text-xs text-base-content/60">
                                {isLoading ? "Thinking..." : "Text Mode"}
                            </p>
                        </div>
                    </div>

                    {voiceSupported && !disabled && (
                        <button
                            onClick={startVoiceCall}
                            className="btn btn-success btn-sm gap-2"
                        >
                            <PhoneIcon className="w-4 h-4" />
                            Start Voice Call
                        </button>
                    )}
                </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {conversation.length === 0 ? (
                    <div className="text-center text-base-content/50 py-8">
                        <BotIcon className="w-12 h-12 mx-auto mb-3 opacity-50" />
                        <p>Starting your interview...</p>
                    </div>
                ) : (
                    conversation.map((msg, idx) => (
                        <div
                            key={idx}
                            className={`flex gap-3 ${msg.role === "user" ? "flex-row-reverse" : ""}`}
                        >
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${msg.role === "ai" ? "bg-primary/20" : "bg-secondary/20"
                                }`}>
                                {msg.role === "ai" ? (
                                    <BotIcon className="w-4 h-4 text-primary" />
                                ) : (
                                    <UserIcon className="w-4 h-4 text-secondary" />
                                )}
                            </div>

                            <div className={`max-w-[80%] rounded-2xl px-4 py-2.5 ${msg.role === "ai"
                                ? "bg-base-200 text-base-content rounded-tl-sm"
                                : "bg-primary text-primary-content rounded-tr-sm"
                                }`}>
                                <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                                {msg.timestamp && (
                                    <p className={`text-[10px] mt-1 ${msg.role === "ai" ? "text-base-content/40" : "text-primary-content/60"
                                        }`}>
                                        {new Date(msg.timestamp).toLocaleTimeString([], {
                                            hour: '2-digit', minute: '2-digit'
                                        })}
                                    </p>
                                )}
                            </div>
                        </div>
                    ))
                )}

                {isLoading && (
                    <div className="flex gap-3">
                        <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
                            <BotIcon className="w-4 h-4 text-primary" />
                        </div>
                        <div className="bg-base-200 rounded-2xl rounded-tl-sm px-4 py-3">
                            <div className="flex gap-1">
                                <span className="w-2 h-2 bg-base-content/40 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                                <span className="w-2 h-2 bg-base-content/40 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                                <span className="w-2 h-2 bg-base-content/40 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                            </div>
                        </div>
                    </div>
                )}

                <div ref={chatEndRef} />
            </div>

            {/* Text Input */}
            <form onSubmit={handleSubmit} className="p-4 border-t border-base-300">
                <div className="flex gap-2">
                    <textarea
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        onKeyDown={handleKeyDown}
                        placeholder={disabled ? "Interview ended" : "Type your message..."}
                        disabled={isLoading || disabled}
                        rows={2}
                        className="textarea textarea-bordered flex-1 resize-none text-sm"
                    />
                    <button
                        type="submit"
                        disabled={!message.trim() || isLoading || disabled}
                        className="btn btn-primary btn-square self-end"
                    >
                        {isLoading ? (
                            <Loader2Icon className="w-5 h-5 animate-spin" />
                        ) : (
                            <SendIcon className="w-5 h-5" />
                        )}
                    </button>
                </div>
            </form>
        </div>
    );
}

export default AIChat;
