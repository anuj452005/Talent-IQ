import { useState, useEffect, useCallback, useRef } from "react";

/**
 * Custom hook for Speech-to-Text using Web Speech API
 */
export function useSpeechToText() {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [isSupported] = useState(() => {
    if (typeof window === "undefined") return false;
    return !!(window.SpeechRecognition || window.webkitSpeechRecognition);
  });
  const recognitionRef = useRef(null);

  useEffect(() => {
    if (!isSupported) {
        console.warn("STT: Browser does not support SpeechRecognition or webkitSpeechRecognition");
        return;
    }

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    recognitionRef.current = new SpeechRecognition();
    recognitionRef.current.continuous = true;
    recognitionRef.current.interimResults = true;
    recognitionRef.current.lang = "en-US";

      recognitionRef.current.onstart = () => {
        console.log("STT: Speech recognition started");
        setIsListening(true);
      };

      recognitionRef.current.onresult = (event) => {
        let finalTranscript = "";
        let interimTranscript = "";

        for (let i = event.resultIndex; i < event.results.length; i++) {
          const result = event.results[i];
          if (result.isFinal) {
            finalTranscript += result[0].transcript;
          } else {
            interimTranscript += result[0].transcript;
          }
        }

        setTranscript(finalTranscript || interimTranscript);
      };

      recognitionRef.current.onerror = (event) => {
        console.error("STT Error:", event.error);
        if (event.error === "not-allowed" || event.error === "service-not-allowed") {
            console.warn("STT: Permission denied or service not allowed");
            setIsListening(false);
        }
      };

      recognitionRef.current.onend = () => {
        console.log("STT: Speech recognition ended");
        // Only restart if we think we should still be listening (and it wasn't a deliberate stop)
        // Note: Logic inside onend needs to be careful about infinite loops if errors persist
      };

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, []);

  const startListening = useCallback(() => {
    if (recognitionRef.current && !isListening) {
      console.log("STT: Requesting to start listening...");
      try {
        setTranscript("");
        recognitionRef.current.start();
        setIsListening(true);
      } catch (err) {
        console.error("STT: Failed to start recognition:", err);
        setIsListening(false);
      }
    } else {
        console.log("STT: Cannot start - ref exists:", !!recognitionRef.current, "isListening:", isListening);
    }
  }, [isListening]);

  const stopListening = useCallback(() => {
    if (recognitionRef.current) {
      console.log("STT: Stopping recognition...");
      recognitionRef.current.stop();
      setIsListening(false);
    }
  }, []);

  const resetTranscript = useCallback(() => {
    setTranscript("");
  }, []);

  return {
    isListening,
    transcript,
    isSupported,
    startListening,
    stopListening,
    resetTranscript,
  };
}

export function useTextToSpeech() {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isSupported] = useState(() => {
    return typeof window !== "undefined" && "speechSynthesis" in window;
  });
  const [voices, setVoices] = useState([]);
  const utteranceRef = useRef(null);
  const queueRef = useRef([]);
  const isProcessingQueueRef = useRef(false);

  useEffect(() => {
    if (isSupported && typeof window !== "undefined" && window.speechSynthesis) {
      const loadVoices = () => {
        const availableVoices = window.speechSynthesis.getVoices();
        setVoices(availableVoices);
        console.log("TTS: Voices loaded", availableVoices.length);
      };

      loadVoices();
      window.speechSynthesis.onvoiceschanged = loadVoices;
    }

    return () => {
      if (typeof window !== "undefined" && window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  const processQueue = useCallback((options = {}) => {
    if (queueRef.current.length === 0) {
      isProcessingQueueRef.current = false;
      setIsSpeaking(false);
      return;
    }

    isProcessingQueueRef.current = true;
    const text = queueRef.current.shift();
    
    if (!text) {
        processQueue(options);
        return;
    }

    const utterance = new SpeechSynthesisUtterance(text);
    utteranceRef.current = utterance;

    // Smart voice selection
    let chosenVoice = null;
    const preferredVoices = voices.filter(v => v.lang.startsWith("en") && (v.name.includes("Google") || v.name.includes("Natural") || v.name.includes("Premium")));
    if (preferredVoices.length > 0) chosenVoice = preferredVoices[0];
    else chosenVoice = voices.find(v => v.lang.startsWith("en"));
    if (!chosenVoice && voices.length > 0) chosenVoice = voices[0];

    if (chosenVoice) utterance.voice = chosenVoice;

    utterance.rate = options.rate || 1;
    utterance.pitch = options.pitch || 1;
    utterance.volume = options.volume || 1;

    utterance.onstart = () => setIsSpeaking(true);
    
    utterance.onend = () => {
        processQueue(options);
    };
    
    utterance.onerror = (e) => {
        console.error("TTS Error:", e);
        processQueue(options);
    };

    try {
        window.speechSynthesis.speak(utterance);
    } catch (err) {
        console.error("TTS: Speak threw error", err);
        processQueue(options);
    }
  }, [voices]);

  const speak = useCallback((text, options = {}) => {
    if (!isSupported || !text) return;

    // Add to queue
    queueRef.current.push(text);

    // If not already processing, start
    if (!isProcessingQueueRef.current) {
        processQueue(options);
    }
  }, [isSupported, processQueue]);

  const stop = useCallback(() => {
    queueRef.current = [];
    isProcessingQueueRef.current = false;
    if (typeof window !== "undefined" && window.speechSynthesis) {
        window.speechSynthesis.cancel();
    }
    setIsSpeaking(false);
  }, []);

  const pause = useCallback(() => {
    if (typeof window !== "undefined" && window.speechSynthesis) {
        window.speechSynthesis.pause();
    }
  }, []);

  const resume = useCallback(() => {
    if (typeof window !== "undefined" && window.speechSynthesis) {
        window.speechSynthesis.resume();
    }
  }, []);

  return {
    isSpeaking,
    isSupported,
    voices,
    speak,
    stop,
    pause,
    resume,
  };
}
