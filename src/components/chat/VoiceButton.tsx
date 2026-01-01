import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Mic, MicOff, Volume2, VolumeX } from 'lucide-react';
import { useSpeechRecognition } from '@/hooks/useSpeechRecognition';

interface VoiceButtonProps {
  onTranscript: (text: string) => void;
  disabled?: boolean;
}

const VoiceButton = ({ onTranscript, disabled }: VoiceButtonProps) => {
  const { isListening, transcript, startListening, stopListening, isSupported } = useSpeechRecognition();
  const [lastTranscript, setLastTranscript] = useState('');

  useEffect(() => {
    if (transcript && transcript !== lastTranscript) {
      setLastTranscript(transcript);
    }
  }, [transcript, lastTranscript]);

  const handleToggle = () => {
    if (isListening) {
      stopListening();
      if (transcript.trim()) {
        onTranscript(transcript.trim());
      }
    } else {
      startListening();
    }
  };

  if (!isSupported) {
    return null;
  }

  return (
    <Button
      type="button"
      variant="ghost"
      size="icon"
      onClick={handleToggle}
      disabled={disabled}
      className={`shrink-0 transition-all ${
        isListening 
          ? 'text-destructive bg-destructive/10 animate-pulse' 
          : 'text-muted-foreground hover:text-foreground'
      }`}
      title={isListening ? 'Stop recording' : 'Start voice input'}
    >
      {isListening ? (
        <MicOff className="w-5 h-5" />
      ) : (
        <Mic className="w-5 h-5" />
      )}
    </Button>
  );
};

interface SpeakButtonProps {
  text: string;
}

export const SpeakButton = ({ text }: SpeakButtonProps) => {
  const [isSpeaking, setIsSpeaking] = useState(false);

  const handleSpeak = () => {
    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
    } else {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'id-ID';
      utterance.rate = 1;
      
      const voices = window.speechSynthesis.getVoices();
      const indonesianVoice = voices.find(v => v.lang.startsWith('id'));
      if (indonesianVoice) {
        utterance.voice = indonesianVoice;
      }

      utterance.onend = () => setIsSpeaking(false);
      utterance.onerror = () => setIsSpeaking(false);
      
      setIsSpeaking(true);
      window.speechSynthesis.speak(utterance);
    }
  };

  return (
    <Button
      type="button"
      variant="ghost"
      size="icon"
      onClick={handleSpeak}
      className={`w-6 h-6 ${isSpeaking ? 'text-primary' : 'text-muted-foreground hover:text-foreground'}`}
      title={isSpeaking ? 'Stop speaking' : 'Listen'}
    >
      {isSpeaking ? (
        <VolumeX className="w-4 h-4" />
      ) : (
        <Volume2 className="w-4 h-4" />
      )}
    </Button>
  );
};

export default VoiceButton;
