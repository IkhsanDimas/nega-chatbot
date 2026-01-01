import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Send, Paperclip, X, FileText, Loader2, Mic, MicOff } from 'lucide-react';
import { toast } from 'sonner';

// Definisi Tipe untuk Speech Recognition (agar tidak error di TypeScript)
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
  
  // State untuk Dikte Suara
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

  // --- LOGIKA SPEECH-TO-TEXT (VOICE TYPING) ---
  const toggleListening = () => {
    // Cek apakah browser mendukung
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
    
    // Konfigurasi Bahasa Indonesia
    recognitionRef.current.lang = 'id-ID'; 
    recognitionRef.current.continuous = true; // Terus mendengarkan
    recognitionRef.current.interimResults = true; // Tampilkan hasil sementara

    recognitionRef.current.onstart = () => {
      setIsListening(true);
      toast.info("Mendengarkan... Silakan bicara.");
    };

    recognitionRef.current.onresult = (event: any) => {
      let finalTranscript = '';
      
      // Ambil hasil teks
      for (let i = event.resultIndex; i < event.results.length; ++i) {
        if (event.results[i].isFinal) {
          finalTranscript += event.results[i][0].transcript;
        }
      }

      // Masukkan ke dalam input text
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
      // Jika berhenti otomatis tapi kita belum klik stop, mulai lagi (agar continuous)
      if (isListening) {
        // recognitionRef.current.start(); 
        // Opsional: Uncomment baris atas jika ingin mic nyala terus tanpa henti
        // Tapi biasanya lebih baik berhenti saat user diam lama.
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
  // ------------------------------------------

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
    
    // Stop listening jika sedang merekam saat kirim
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
    <div className="p-4 bg-[#020617] border-t border-white/10">
      
      {/* PREVIEW FILE */}
      {selectedFile && previewUrl && (
        <div className="mb-3 animate-in slide-in-from-bottom-2 fade-in">
          <div className="relative inline-flex items-center gap-3 p-2 pr-8 bg-zinc-900 rounded-xl border border-white/10 group">
            <a href={previewUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 cursor-pointer hover:opacity-80 transition-opacity">
              {selectedFile.type.startsWith('image/') ? (
                <div className="w-10 h-10 rounded-lg overflow-hidden border border-white/5 bg-black">
                  <img src={previewUrl} alt="Preview" className="w-full h-full object-cover" />
                </div>
              ) : (
                <div className="w-10 h-10 rounded-lg bg-cyan-500/20 flex items-center justify-center text-cyan-400">
                  <FileText className="w-5 h-5" />
                </div>
              )}
              <div className="flex flex-col max-w-[200px]">
                <span className="text-xs font-medium text-white truncate">{selectedFile.name}</span>
                <span className="text-[10px] text-zinc-500">{(selectedFile.size / 1024).toFixed(1)} KB</span>
              </div>
            </a>
            <button onClick={handleRemoveFile} className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 shadow-lg hover:bg-red-600 transition-colors z-10">
              <X className="w-3 h-3" />
            </button>
          </div>
        </div>
      )}

      {/* INPUT AREA */}
      <div className={`flex gap-2 items-end bg-zinc-900 p-2 rounded-xl border transition-all ${isListening ? 'border-green-500/50 ring-1 ring-green-500/20' : 'border-white/5 focus-within:ring-1 focus-within:ring-cyan-500/50'}`}>
        <input type="file" ref={fileInputRef} onChange={handleFileSelect} className="hidden" accept="image/*,.pdf,.doc,.docx,.txt" />
        
        <Button variant="ghost" size="icon" className={`shrink-0 text-zinc-400 hover:text-cyan-400 hover:bg-cyan-500/10 rounded-lg h-10 w-10 ${selectedFile ? 'text-cyan-400 bg-cyan-500/10' : ''}`} onClick={() => fileInputRef.current?.click()} disabled={disabled || isLoading}>
          <Paperclip className="w-5 h-5" />
        </Button>

        <Textarea 
          ref={textareaRef} 
          value={message} 
          onChange={(e) => setMessage(e.target.value)} 
          onKeyDown={handleKeyDown} 
          placeholder={isListening ? "Mendengarkan ucapan Anda..." : "Ketik pesan..."} 
          className="flex-1 min-h-[40px] max-h-[120px] bg-transparent border-0 focus-visible:ring-0 text-white resize-none py-2.5 px-2 placeholder:text-zinc-600 leading-relaxed" 
          disabled={disabled || isLoading} 
          rows={1} 
        />

        {/* TOMBOL MICROPHONE (VOICE TYPING) */}
        {/* Tombol ini akan selalu muncul, kecuali jika sedang loading */}
        {!isLoading && (
          <Button 
            onClick={toggleListening} 
            disabled={disabled} 
            className={`shrink-0 h-10 w-10 rounded-lg transition-all duration-300 ${isListening ? 'bg-green-500 hover:bg-green-600 text-white animate-pulse' : 'bg-zinc-800 text-zinc-400 hover:text-white hover:bg-zinc-700'}`} 
            size="icon"
            title={isListening ? "Berhenti Merekam" : "Dikte Suara (Voice Typing)"}
          >
            {isListening ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
          </Button>
        )}

        {/* TOMBOL KIRIM (Hanya muncul jika ada teks atau file) */}
        {(message.trim() || selectedFile) && (
          <Button 
            onClick={handleSend} 
            disabled={disabled || isLoading} 
            className="shrink-0 h-10 w-10 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-black shadow-lg shadow-cyan-500/20 animate-in zoom-in-50" 
            size="icon"
          >
            {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5 ml-0.5" />}
          </Button>
        )}
      </div>
      
      {/* INDIKATOR STATUS */}
      <div className="text-center mt-2 flex justify-between px-2">
        <p className="text-[10px] text-zinc-600">Ainya AI</p>
        {isListening && <p className="text-[10px] text-green-500 animate-pulse font-bold">● Mendengarkan...</p>}
      </div>
    </div>
  );
};

export default ChatInput;