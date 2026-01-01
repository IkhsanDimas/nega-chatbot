import { useState, useRef, useCallback } from 'react';

interface UseVoiceReturn {
  isRecording: boolean;
  isPlaying: boolean;
  startRecording: () => Promise<void>;
  stopRecording: () => Promise<string | null>;
  speak: (text: string) => void;
  stopSpeaking: () => void;
}

export const useVoice = (): UseVoiceReturn => {
  const [isRecording, setIsRecording] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const speechSynthesisRef = useRef<SpeechSynthesisUtterance | null>(null);

  const startRecording = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.start();
      setIsRecording(true);
    } catch (error) {
      console.error('Error starting recording:', error);
      throw error;
    }
  }, []);

  const stopRecording = useCallback(async (): Promise<string | null> => {
    return new Promise((resolve) => {
      if (!mediaRecorderRef.current) {
        resolve(null);
        return;
      }

      mediaRecorderRef.current.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        
        // Convert audio to text using Web Speech API
        const recognition = new (window.SpeechRecognition || window.webkitSpeechRecognition)();
        recognition.lang = 'id-ID';
        recognition.continuous = false;
        recognition.interimResults = false;

        recognition.onresult = (event) => {
          const transcript = event.results[0][0].transcript;
          resolve(transcript);
        };

        recognition.onerror = () => {
          resolve(null);
        };

        recognition.onend = () => {
          setIsRecording(false);
        };

        // Start recognition immediately for real-time speech-to-text
        try {
          recognition.start();
          // Play the recorded audio for recognition (workaround)
          const audioUrl = URL.createObjectURL(audioBlob);
          const audio = new Audio(audioUrl);
          audio.play();
        } catch {
          resolve(null);
        }
      };

      mediaRecorderRef.current.stop();
      mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
    });
  }, []);

  const speak = useCallback((text: string) => {
    if ('speechSynthesis' in window) {
      // Cancel any ongoing speech
      window.speechSynthesis.cancel();

      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'id-ID';
      utterance.rate = 1;
      utterance.pitch = 1;
      
      // Try to find Indonesian voice
      const voices = window.speechSynthesis.getVoices();
      const indonesianVoice = voices.find(v => v.lang.startsWith('id'));
      if (indonesianVoice) {
        utterance.voice = indonesianVoice;
      }

      utterance.onstart = () => setIsPlaying(true);
      utterance.onend = () => setIsPlaying(false);
      utterance.onerror = () => setIsPlaying(false);

      speechSynthesisRef.current = utterance;
      window.speechSynthesis.speak(utterance);
    }
  }, []);

  const stopSpeaking = useCallback(() => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      setIsPlaying(false);
    }
  }, []);

  return {
    isRecording,
    isPlaying,
    startRecording,
    stopRecording,
    speak,
    stopSpeaking,
  };
};

export default useVoice;
