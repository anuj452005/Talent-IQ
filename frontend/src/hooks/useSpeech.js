import { useState, useEffect, useCallback, useRef } from "react";

/**
 * Custom hook for Speech-to-Text using Web Speech API
 */
export function useSpeechToText() {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [isSupported, setIsSupported] = useState(false);
  const recognitionRef = useRef(null);

  useEffect(() => {
    // Check if browser supports speech recognition
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    
    if (SpeechRecognition) {
      setIsSupported(true);
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
    } else {
        console.warn("STT: Browser does not support SpeechRecognition");
    }

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

/**
 * Custom hook for Text-to-Speech using Web Speech API
 */
export function useTextToSpeech() {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isSupported, setIsSupported] = useState(false);
  const [voices, setVoices] = useState([]);
  const utteranceRef = useRef(null);

  useEffect(() => {
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      setIsSupported(true);

      const loadVoices = () => {
        const availableVoices = window.speechSynthesis.getVoices();
        console.log(`TTS: Loaded ${availableVoices.length} voices`);
        setVoices(availableVoices);
      };

      // Initial load
      loadVoices();
      
      // Event listener for when voices change (Chrome requires this)
      window.speechSynthesis.onvoiceschanged = loadVoices;
    } else {
      console.warn("TTS: Speech synthesis not supported in this browser");
    }

    return () => {
      if (typeof window !== "undefined" && window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  const speak = useCallback((text, options = {}) => {
    if (!isSupported || !text) {
        console.warn("TTS: Cannot speak - supported:", isSupported, "text:", !!text);
        return;
    }

    // Cancel any ongoing speech
    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    utteranceRef.current = utterance;

    // Smart voice selection
    let chosenVoice = null;
    
    // 1. Try to find a high-quality "Google" or "Neural" voice
    const preferredVoices = voices.filter(v => v.lang.startsWith("en") && (v.name.includes("Google") || v.name.includes("Natural") || v.name.includes("Premium")));
    if (preferredVoices.length > 0) {
        chosenVoice = preferredVoices[0];
    } 
    // 2. Fallback to any English voice
    else {
        chosenVoice = voices.find(v => v.lang.startsWith("en"));
    }
    
    // 3. Fallback to default (usually the first one or system default)
    if (!chosenVoice && voices.length > 0) {
        chosenVoice = voices[0];
    }

    if (chosenVoice) {
    //   console.log("TTS: Using voice:", chosenVoice.name);
      utterance.voice = chosenVoice;
    } else {
    //   console.log("TTS: Using system default voice");
    }

    utterance.rate = options.rate || 1;
    utterance.pitch = options.pitch || 1;
    utterance.volume = options.volume || 1;

    utterance.onstart = () => setIsSpeaking(true);
    
    utterance.onend = () => {
        setIsSpeaking(false);
    };
    
    utterance.onerror = (e) => {
        console.error("TTS Error:", e);
        setIsSpeaking(false);
    };

    try {
        window.speechSynthesis.speak(utterance);
    } catch (err) {
        console.error("TTS: Speak threw error", err);
        setIsSpeaking(false);
    }
  }, [isSupported, voices]);

  const stop = useCallback(() => {
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
