import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Send, Paperclip, X, FileText, Loader2, Mic, MicOff, Sparkles } from 'lucide-react';
import { toast } from 'sonner';

declare global {
  interface Window {
    webkitSpeechRecognition: any;
    SpeechRecognition: any;
  }
}

interface ChatInputProps {
  onSend: (message: string, file?: File) => void;
  isLoading: boolean;
  disabled: boolean;
}

const ChatInput = ({ onSend, isLoading, disabled }: ChatInputProps) => {
  const [message, setMessage] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  
  const [isListening, setIsListening] = useState(false);
  const recognitionRef = useRef<any>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'inherit';
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [message]);

  useEffect(() => {
    if (selectedFile) {
      const url = URL.createObjectURL(selectedFile);
      setPreviewUrl(url);
      return () => URL.revokeObjectURL(url); 
    } else {
      setPreviewUrl(null);
    }
  }, [selectedFile]);

  const toggleListening = () => {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      toast.error("Browser Anda tidak mendukung fitur Voice Typing.");
      return;
    }

    if (isListening) {
      stopListening();
    } else {
      startListening();
    }
  };

  const startListening = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    recognitionRef.current = new SpeechRecognition();
    
    recognitionRef.current.lang = 'id-ID'; 
    recognitionRef.current.continuous = true; 
    recognitionRef.current.interimResults = true; 

    recognitionRef.current.onstart = () => {
      setIsListening(true);
      toast.info("Mendengarkan... Silakan bicara.");
    };

    recognitionRef.current.onresult = (event: any) => {
      let finalTranscript = '';
      
      for (let i = event.resultIndex; i < event.results.length; ++i) {
        if (event.results[i].isFinal) {
          finalTranscript += event.results[i][0].transcript;
        }
      }

      if (finalTranscript) {
        setMessage((prev) => prev + (prev ? ' ' : '') + finalTranscript);
      }
    };

    recognitionRef.current.onerror = (event: any) => {
      console.error("Speech error:", event.error);
      setIsListening(false);
      
      if(event.error === 'not-allowed') {
        toast.error("Izinkan akses mikrofon untuk menggunakan fitur ini.");
      }
    };

    recognitionRef.current.onend = () => {
      if (isListening) {
        setIsListening(false); 
      }
    };

    recognitionRef.current.start();
  };

  const stopListening = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      setIsListening(false);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (file.size > 10 * 1024 * 1024) { 
        toast.error("Ukuran file maksimal 10MB");
        return;
      }
      setSelectedFile(file);
    }
  };

  const handleRemoveFile = () => {
    setSelectedFile(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleSend = () => {
    if ((!message.trim() && !selectedFile) || disabled || isLoading) return;
    
    if (isListening) stopListening();

    onSend(message, selectedFile || undefined);
    
    setMessage('');
    setSelectedFile(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
    if (textareaRef.current) textareaRef.current.style.height = 'inherit';
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="p-4 md:pb-6 md:pt-2 bg-transparent relative z-10">
      <div className="max-w-4xl mx-auto">
        
        {/* FILE PREVIEW */}
        {selectedFile && previewUrl && (
          <div className="mb-3 animate-in slide-in-from-bottom-3 fade-in duration-200">
            <div className="relative inline-flex items-center gap-3 p-2.5 pr-10 bg-slate-950/80 backdrop-blur-xl border border-white/10 rounded-xl group shadow-lg">
              <a href={previewUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 cursor-pointer hover:opacity-85 transition-opacity">
                {selectedFile.type.startsWith('image/') ? (
                  <div className="w-10 h-10 rounded-lg overflow-hidden border border-white/5 bg-black/50 shrink-0">
                    <img src={previewUrl} alt="Preview" className="w-full h-full object-cover" />
                  </div>
                ) : (
                  <div className="w-10 h-10 rounded-lg bg-cyan-500/10 flex items-center justify-center text-cyan-400 shrink-0">
                    <FileText className="w-5 h-5" />
                  </div>
                )}
                <div className="flex flex-col max-w-[200px] text-left">
                  <span className="text-xs font-semibold text-white truncate">{selectedFile.name}</span>
                  <span className="text-[10px] text-zinc-500 mt-0.5 font-semibold">{(selectedFile.size / 1024).toFixed(1)} KB</span>
                </div>
              </a>
              <button 
                onClick={handleRemoveFile} 
                className="absolute top-2 right-2 bg-red-500 hover:bg-red-600 text-white rounded-full p-1 shadow-md hover:scale-110 transition-all"
                title="Hapus file"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          </div>
        )}

        {/* INPUT WRAPPER */}
        <div className={`flex gap-2.5 items-end bg-slate-900/40 backdrop-blur-xl border p-2.5 rounded-2xl transition-all duration-300 shadow-[0_10px_30px_rgba(0,0,0,0.5)] ${
          isListening 
            ? 'border-emerald-500/45 ring-1 ring-emerald-500/20 bg-emerald-500/[0.02] shadow-[0_10px_35px_rgba(16,185,129,0.05)]' 
            : 'border-white/5 focus-within:border-cyan-500/35 focus-within:ring-1 focus-within:ring-cyan-500/15 focus-within:bg-slate-900/60 focus-within:shadow-[0_10px_35px_rgba(6,182,212,0.06)]'
        }`}>
          <input 
            type="file" 
            ref={fileInputRef} 
            onChange={handleFileSelect} 
            className="hidden" 
            accept="image/*,.pdf,.doc,.docx,.txt" 
          />
          
          <Button 
            variant="ghost" 
            size="icon" 
            className={`shrink-0 text-zinc-400 hover:text-cyan-400 hover:bg-cyan-500/10 rounded-xl h-10 w-10 transition-all duration-200 ${
              selectedFile ? 'text-cyan-400 bg-cyan-500/10' : ''
            }`} 
            onClick={() => fileInputRef.current?.click()} 
            disabled={disabled || isLoading}
            title="Unggah berkas"
          >
            <Paperclip className="w-5 h-5" />
          </Button>

          <Textarea 
            ref={textareaRef} 
            value={message} 
            onChange={(e) => setMessage(e.target.value)} 
            onKeyDown={handleKeyDown} 
            placeholder={isListening ? "Mendengarkan ucapan Anda... silakan bicara" : "Tulis pesan ke Nega..."} 
            className="flex-1 min-h-[40px] max-h-[140px] bg-transparent border-0 focus-visible:ring-0 text-white resize-none py-2 px-1 placeholder:text-zinc-600 leading-relaxed text-sm scrollbar-thin" 
            disabled={disabled || isLoading} 
            rows={1} 
          />

          {/* VOICE TYPING MIC BUTTON */}
          {!isLoading && (
            <Button 
              onClick={toggleListening} 
              disabled={disabled} 
              className={`shrink-0 h-10 w-10 rounded-xl transition-all duration-300 ${
                isListening 
                  ? 'bg-emerald-500 hover:bg-emerald-600 text-white shadow-lg shadow-emerald-500/20' 
                  : 'bg-slate-950/60 text-zinc-400 hover:text-white hover:bg-zinc-800 border border-white/5'
              }`} 
              size="icon"
              title={isListening ? "Berhenti mendengarkan" : "Dikte Suara (Voice Typing)"}
            >
              {isListening ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
            </Button>
          )}

          {/* SEND BUTTON */}
          {(message.trim() || selectedFile) && (
            <Button 
              onClick={handleSend} 
              disabled={disabled || isLoading} 
              className="shrink-0 h-10 w-10 rounded-xl bg-gradient-to-r from-cyan-500 to-indigo-600 hover:opacity-90 text-white shadow-lg shadow-cyan-500/10 active:scale-95 transition-all duration-200 border border-cyan-400/20" 
              size="icon"
              title="Kirim pesan"
            >
              {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5 ml-0.5" />}
            </Button>
          )}
        </div>
        
        {/* INPUT SUBTEXT STATUS */}
        <div className="flex justify-between items-center mt-2.5 px-2 select-none">
          <div className="flex items-center gap-1 text-[10px] text-zinc-500 font-medium">
            <Sparkles className="w-3 h-3 text-cyan-500" />
            <span>Nega AI Asisten</span>
          </div>
          {isListening && (
            <p className="text-[10px] text-emerald-500 animate-pulse font-bold tracking-wider uppercase">
              ● Sedang Mendengarkan
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default ChatInput;