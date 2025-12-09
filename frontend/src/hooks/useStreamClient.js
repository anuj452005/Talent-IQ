import { useState, useEffect, useRef } from "react";
import { StreamChat } from "stream-chat";
import toast from "react-hot-toast";
import { initializeStreamClient, disconnectStreamClient } from "../lib/stream";
import { sessionApi } from "../api/sessions";

function useStreamClient(session, loadingSession, isHost, isParticipant) {
  const [streamClient, setStreamClient] = useState(null);
  const [call, setCall] = useState(null);
  const [chatClient, setChatClient] = useState(null);
  const [channel, setChannel] = useState(null);
  const [isInitializingCall, setIsInitializingCall] = useState(true);

  // Use refs to track instances for cleanup
  const videoCallRef = useRef(null);
  const chatClientRef = useRef(null);
  const isCleaningUp = useRef(false);

  useEffect(() => {
    const initCall = async () => {
      if (!session?.callId) {
        setIsInitializingCall(false);
        return;
      }
      if (!isHost && !isParticipant) {
        setIsInitializingCall(false);
        return;
      }
      if (session.status === "completed") {
        setIsInitializingCall(false);
        return;
      }

      // If we're still cleaning up, wait a bit
      if (isCleaningUp.current) {
        await new Promise(resolve => setTimeout(resolve, 500));
      }

      try {
        setIsInitializingCall(true);

        // Force disconnect any existing connections first (for rejoin)
        if (videoCallRef.current) {
          try {
            await videoCallRef.current.leave();
          } catch (e) {
            console.log("Previous call leave error (non-fatal):", e.message);
          }
          videoCallRef.current = null;
        }
        
        if (chatClientRef.current) {
          try {
            await chatClientRef.current.disconnectUser();
          } catch (e) {
            console.log("Previous chat disconnect error (non-fatal):", e.message);
          }
          chatClientRef.current = null;
        }

        await disconnectStreamClient();

        const { token, userId, userName, userImage } = await sessionApi.getStreamToken();

        const client = await initializeStreamClient(
          {
            id: userId,
            name: userName,
            image: userImage,
          },
          token
        );

        setStreamClient(client);

        // Join video call
        const videoCall = client.call("default", session.callId);
        await videoCall.join({ create: true });
        videoCallRef.current = videoCall;
        setCall(videoCall);

        // Initialize chat
        const apiKey = import.meta.env.VITE_STREAM_API_KEY;
        const chatClientInstance = StreamChat.getInstance(apiKey);

        await chatClientInstance.connectUser(
          {
            id: userId,
            name: userName,
            image: userImage,
          },
          token
        );
        chatClientRef.current = chatClientInstance;
        setChatClient(chatClientInstance);

        const chatChannel = chatClientInstance.channel("messaging", session.callId);
        await chatChannel.watch();
        setChannel(chatChannel);
      } catch (error) {
        toast.error("Failed to join video call");
        console.error("Error init call", error);
      } finally {
        setIsInitializingCall(false);
      }
    };

    if (session && !loadingSession) {
      initCall();
    }

    // Cleanup function
    return () => {
      isCleaningUp.current = true;
      
      (async () => {
        try {
          // Leave video call
          if (videoCallRef.current) {
            await videoCallRef.current.leave();
            videoCallRef.current = null;
          }
          
          // Disconnect chat
          if (chatClientRef.current) {
            await chatClientRef.current.disconnectUser();
            chatClientRef.current = null;
          }
          
          // Disconnect stream client
          await disconnectStreamClient();
          
          // Reset state
          setCall(null);
          setChatClient(null);
          setChannel(null);
          setStreamClient(null);
        } catch (error) {
          console.error("Cleanup error:", error);
        } finally {
          isCleaningUp.current = false;
        }
      })();
    };
  }, [session?.callId, session?.status, loadingSession, isHost, isParticipant]);

  return {
    streamClient,
    call,
    chatClient,
    channel,
    isInitializingCall,
  };
}

export default useStreamClient;
