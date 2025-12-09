import { useState, useRef, useCallback } from "react";

/**
 * Get the best supported MIME type for MediaRecorder
 */
const getSupportedMimeType = () => {
  const types = [
    "video/webm;codecs=vp9,opus",
    "video/webm;codecs=vp8,opus",
    "video/webm;codecs=vp9",
    "video/webm;codecs=vp8",
    "video/webm",
    "video/mp4",
  ];

  for (const type of types) {
    if (MediaRecorder.isTypeSupported(type)) {
      return type;
    }
  }
  return "video/webm"; // Fallback
};

/**
 * Hook for browser-based screen recording
 * Records screen + audio and allows download as WebM file
 */
export const useScreenRecording = () => {
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [recordingBlob, setRecordingBlob] = useState(null);
  const [error, setError] = useState(null);

  const mediaRecorderRef = useRef(null);
  const chunksRef = useRef([]);
  const timerRef = useRef(null);
  const streamRef = useRef(null);

  const startRecording = useCallback(async () => {
    try {
      setError(null);
      chunksRef.current = [];

      // Request screen capture with audio
      const displayStream = await navigator.mediaDevices.getDisplayMedia({
        video: {
          cursor: "always",
        },
        audio: true, // System audio
      });

      // Try to get microphone audio
      let audioStream = null;
      try {
        audioStream = await navigator.mediaDevices.getUserMedia({
          audio: true,
          video: false,
        });
      } catch (audioErr) {
        console.warn("Microphone access denied, recording without mic audio");
      }

      // Combine streams
      const tracks = [...displayStream.getTracks()];
      if (audioStream) {
        tracks.push(...audioStream.getAudioTracks());
      }
      
      const combinedStream = new MediaStream(tracks);
      streamRef.current = combinedStream;

      // Get supported MIME type
      const mimeType = getSupportedMimeType();
      console.log("Using MIME type:", mimeType);

      // Create MediaRecorder with supported codec
      const mediaRecorder = new MediaRecorder(combinedStream, {
        mimeType: mimeType,
      });

      mediaRecorderRef.current = mediaRecorder;

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: mimeType.split(";")[0] });
        setRecordingBlob(blob);
        
        // Stop all tracks
        combinedStream.getTracks().forEach((track) => track.stop());
        
        // Clear timer
        if (timerRef.current) {
          clearInterval(timerRef.current);
          timerRef.current = null;
        }
      };

      // Handle when user stops sharing from browser UI
      displayStream.getVideoTracks()[0].onended = () => {
        if (mediaRecorderRef.current?.state === "recording") {
          stopRecording();
        }
      };

      // Start recording
      mediaRecorder.start(1000); // Collect data every second
      setIsRecording(true);
      setRecordingTime(0);

      // Start timer
      timerRef.current = setInterval(() => {
        setRecordingTime((prev) => prev + 1);
      }, 1000);

    } catch (err) {
      console.error("Error starting recording:", err);
      setError(err.message || "Failed to start recording");
      setIsRecording(false);
    }
  }, []);

  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === "recording") {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  }, []);

  const downloadRecording = useCallback((filename = "session-recording") => {
    if (!recordingBlob) return;

    const url = URL.createObjectURL(recordingBlob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${filename}-${new Date().toISOString().slice(0, 10)}.webm`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, [recordingBlob]);

  const clearRecording = useCallback(() => {
    setRecordingBlob(null);
    setRecordingTime(0);
    chunksRef.current = [];
  }, []);

  // Format time as MM:SS
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  return {
    isRecording,
    recordingTime,
    formattedTime: formatTime(recordingTime),
    recordingBlob,
    error,
    startRecording,
    stopRecording,
    downloadRecording,
    clearRecording,
  };
};
