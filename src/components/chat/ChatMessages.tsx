import { useState, useRef, useEffect } from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar } from '@/components/ui/avatar';
import { FileText, ExternalLink, Loader2, Pencil, Check, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import ReactMarkdown from 'react-markdown';

// AI Model Configuration
const AI_MODEL_NAME = "Gemini 2.5 Flash";
const AI_AVATAR_TEXT = "GM";

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  file_url?: string;
  file_type?: string;
  created_at: string;
}

interface ChatMessagesProps {
  messages: Message[];
  isLoading: boolean;
  messagesEndRef: React.RefObject<HTMLDivElement>;
  onEditMessage: (id: string, newContent: string) => void; // Prop baru
}

const ChatMessages = ({ messages, isLoading, messagesEndRef, onEditMessage }: ChatMessagesProps) => {
  
  // State untuk mode edit
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editContent, setEditContent] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-resize textarea saat mengedit
  useEffect(() => {
    if (editingId && textareaRef.current) {
      textareaRef.current.style.height = 'inherit';
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [editContent, editingId]);

  const startEditing = (msg: Message) => {
    setEditingId(msg.id);
    setEditContent(msg.content);
  };

  const cancelEditing = () => {
    setEditingId(null);
    setEditContent("");
  };

  const saveEditing = () => {
    if (editingId && editContent.trim()) {
      onEditMessage(editingId, editContent);
      setEditingId(null);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      saveEditing();
    } else if (e.key === 'Escape') {
      cancelEditing();
    }
  };

  const renderAttachment = (msg: Message) => {
    if (!msg.file_url) return null;

    const isImage = msg.file_type?.startsWith('image/');
    const isAudio = msg.file_type?.startsWith('audio/');
    
    if (isAudio) {
      return (
        <div className="mt-2 mb-2 w-full max-w-[280px]">
          <div className="bg-black/20 p-2 rounded-xl border border-white/10 flex items-center gap-2">
            <audio controls className="w-full h-8 accent-cyan-500" src={msg.file_url}>
              Browser Anda tidak mendukung elemen audio.
            </audio>
          </div>
          <p className="text-[10px] text-white/40 mt-1 ml-1 font-mono">VOICE NOTE</p>
        </div>
      );
    }

    if (isImage) {
      return (
        <div className="mt-2 mb-2">
          <a href={msg.file_url} target="_blank" rel="noopener noreferrer" className="block relative group overflow-hidden rounded-lg border border-white/10 max-w-[250px] cursor-pointer hover:opacity-90 transition-opacity">
            <img src={msg.file_url} alt="Lampiran" className="w-full h-auto object-cover" />
          </a>
        </div>
      );
    }

    return (
      <div className="mt-2 mb-3">
        <a href={msg.file_url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 p-3 rounded-xl bg-black/40 border border-white/10 hover:bg-cyan-950/30 hover:border-cyan-500/30 transition-all cursor-pointer group max-w-[300px] text-decoration-none">
          <div className="p-3 rounded-lg bg-cyan-500/20 text-cyan-400 shrink-0">
            <FileText className="w-6 h-6" />
          </div>
          <div className="flex-1 overflow-hidden text-left min-w-0">
            <p className="text-sm font-bold text-white/90 truncate group-hover:text-cyan-400 transition-colors">Buka Dokumen</p>
            <p className="text-[10px] text-white/50 uppercase font-mono tracking-wider truncate">{msg.file_type?.split('/')[1] || 'FILE'} • KLIK DISINI</p>
          </div>
          <Button variant="ghost" size="icon" className="text-white/40 group-hover:text-cyan-400 shrink-0" asChild>
            <span><ExternalLink className="w-5 h-5" /></span>
          </Button>
        </a>
      </div>
    );
  };

  return (
    <ScrollArea className="flex-1 p-4 h-full bg-[#020617]">
      <div className="flex flex-col space-y-3 pb-4">
        {messages.map((msg) => {
          const isUser = msg.role === 'user';
          const isEditing = editingId === msg.id;

          return (
            <div key={msg.id} className={`flex w-full group ${isUser ? 'justify-end' : 'justify-start'} mb-2`}>
              <div className={`flex max-w-[85%] md:max-w-[75%] gap-2 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}>
                
                {/* AVATAR - Hanya tampilkan untuk AI */}
                {!isUser && (
                  <Avatar className="w-7 h-7 mt-0.5 border border-white/10 shadow-sm shrink-0">
                    <div className="w-full h-full bg-gradient-to-br from-blue-500 to-green-500 flex items-center justify-center text-white font-bold text-xs" title={AI_MODEL_NAME}>
                      {AI_AVATAR_TEXT}
                    </div>
                  </Avatar>
                )}

                {/* AREA PESAN */}
                <div className={`flex flex-col ${isUser ? 'items-end' : 'items-start'} min-w-0 flex-1 ${isUser ? 'pr-0' : 'pl-0'}`}>
                  
                  {isEditing ? (
                    // --- MODE EDIT ---
                    <div className="w-full bg-[#1e293b] p-2 rounded-xl border border-cyan-500/50 shadow-lg animate-in fade-in zoom-in-95 duration-200">
                      <Textarea
                        ref={textareaRef}
                        value={editContent}
                        onChange={(e) => setEditContent(e.target.value)}
                        onKeyDown={handleKeyDown}
                        className="min-h-[60px] bg-transparent border-0 focus-visible:ring-0 text-white text-sm resize-none"
                      />
                      <div className="flex justify-end gap-2 mt-2 pt-2 border-t border-white/5">
                        <Button onClick={cancelEditing} size="sm" variant="ghost" className="h-7 text-xs text-slate-400 hover:text-white">
                          <X className="w-3 h-3 mr-1" /> Batal
                        </Button>
                        <Button onClick={saveEditing} size="sm" className="h-7 text-xs bg-cyan-600 hover:bg-cyan-500 text-white">
                          <Check className="w-3 h-3 mr-1" /> Simpan
                        </Button>
                      </div>
                    </div>
                  ) : (
                    // --- MODE TAMPILAN BIASA ---
                    <div className="relative group/bubble max-w-full">
                      <div className={`px-3 py-2 rounded-2xl text-sm shadow-md overflow-hidden ${isUser ? 'bg-cyan-600 text-white rounded-tr-none' : 'bg-[#1e293b] text-slate-200 border border-white/5 rounded-tl-none'}`}>
                        
                        {renderAttachment(msg)}
                        
                        {msg.content && (
                          <div className="prose prose-invert prose-sm max-w-none break-words leading-relaxed">
                            <ReactMarkdown>{msg.content}</ReactMarkdown>
                          </div>
                        )}
                      </div>

                      {/* TOMBOL EDIT (Hanya muncul saat HOVER & Hanya untuk USER) */}
                      {isUser && !msg.file_url && (
                        <button
                          onClick={() => startEditing(msg)}
                          className="absolute -left-8 top-2 p-1.5 text-slate-500 hover:text-cyan-400 opacity-0 group-hover/bubble:opacity-100 transition-all transform hover:scale-110 bg-[#020617]/80 rounded-full"
                          title="Edit pesan"
                        >
                          <Pencil className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  )}

                  <span className="text-[10px] text-slate-500 mt-0.5 px-1 select-none">
                    {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    {/* Indikator Edited (Opsional, akan muncul jika updated_at beda dengan created_at di masa depan) */}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
        
        {isLoading && (
          <div className="flex justify-start w-full animate-pulse pl-9 mb-2">
            <div className="bg-[#1e293b] px-3 py-2 rounded-2xl rounded-tl-none border border-white/5 flex items-center gap-2">
              <Loader2 className="w-4 h-4 animate-spin text-blue-500" />
              <span className="text-xs text-slate-400">{AI_MODEL_NAME} sedang berpikir...</span>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>
    </ScrollArea>
  );
};

export default ChatMessages;