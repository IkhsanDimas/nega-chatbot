import { useState, useRef, useEffect } from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar } from '@/components/ui/avatar';
import { FileText, ExternalLink, Loader2, Pencil, Check, X, Bot } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import ReactMarkdown from 'react-markdown';

const AI_MODEL_NAME = "Gemini 2.5 Flash";

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
  onEditMessage: (id: string, newContent: string) => void;
}

const ChatMessages = ({ messages, isLoading, messagesEndRef, onEditMessage }: ChatMessagesProps) => {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editContent, setEditContent] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);

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
        <div className="mt-1 mb-2 w-full max-w-[280px]">
          <div className="bg-black/30 p-2.5 rounded-xl border border-white/10 flex items-center gap-2">
            <audio controls className="w-full h-8 accent-cyan-500" src={msg.file_url}>
              Browser Anda tidak mendukung elemen audio.
            </audio>
          </div>
          <p className="text-[10px] text-white/40 mt-1 ml-1.5 font-mono tracking-wider">VOICE NOTE</p>
        </div>
      );
    }

    if (isImage) {
      return (
        <div className="mt-1 mb-2">
          <a 
            href={msg.file_url} 
            target="_blank" 
            rel="noopener noreferrer" 
            className="block relative group overflow-hidden rounded-xl border border-white/10 max-w-[280px] cursor-pointer hover:opacity-90 transition-opacity"
          >
            <img src={msg.file_url} alt="Lampiran" className="w-full h-auto object-cover max-h-[300px]" />
          </a>
        </div>
      );
    }

    return (
      <div className="mt-1 mb-2">
        <a 
          href={msg.file_url} 
          target="_blank" 
          rel="noopener noreferrer" 
          className="flex items-center gap-3.5 p-3 rounded-xl bg-black/40 border border-white/10 hover:bg-cyan-950/30 hover:border-cyan-500/30 transition-all cursor-pointer group max-w-[320px] text-decoration-none"
        >
          <div className="p-3 rounded-xl bg-cyan-500/10 text-cyan-400 shrink-0">
            <FileText className="w-6 h-6" />
          </div>
          <div className="flex-1 overflow-hidden text-left min-w-0">
            <p className="text-sm font-semibold text-white/90 truncate group-hover:text-cyan-400 transition-colors">Buka Dokumen</p>
            <p className="text-[10px] text-zinc-500 uppercase font-mono tracking-wider truncate mt-0.5">{msg.file_type?.split('/')[1] || 'FILE'} • KLIK DISINI</p>
          </div>
          <Button variant="ghost" size="icon" className="text-zinc-500 group-hover:text-cyan-400 shrink-0" asChild>
            <span><ExternalLink className="w-4 h-4" /></span>
          </Button>
        </a>
      </div>
    );
  };

  return (
    <ScrollArea className="flex-1 px-4 md:px-8 py-6 h-full bg-[#030712]">
      <div className="flex flex-col space-y-6 pb-6 max-w-4xl mx-auto">
        {messages.map((msg) => {
          const isUser = msg.role === 'user';
          const isEditing = editingId === msg.id;

          return (
            <div key={msg.id} className={`flex w-full group ${isUser ? 'justify-end' : 'justify-start'} animate-fade-in`}>
              <div className={`flex max-w-[88%] md:max-w-[80%] gap-4 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}>
                
                {/* AVATAR - Hanya tampilkan untuk AI */}
                {!isUser && (
                  <Avatar className="w-8 h-8 border border-white/10 shadow-md shrink-0 ring-2 ring-white/5">
                    <div className="w-full h-full bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center text-white" title={AI_MODEL_NAME}>
                      <Bot className="w-4.5 h-4.5" />
                    </div>
                  </Avatar>
                )}

                {/* AREA PESAN */}
                <div className={`flex flex-col ${isUser ? 'items-end' : 'items-start'} min-w-0 flex-1`}>
                  
                  {isEditing ? (
                    /* --- MODE EDIT --- */
                    <div className="w-full bg-[#1e293b] p-4 rounded-2xl border border-cyan-500/30 shadow-xl animate-in fade-in zoom-in-95 duration-200">
                      <Textarea
                        ref={textareaRef}
                        value={editContent}
                        onChange={(e) => setEditContent(e.target.value)}
                        onKeyDown={handleKeyDown}
                        className="min-h-[70px] bg-transparent border-0 focus-visible:ring-0 text-white text-sm resize-none p-0 leading-relaxed"
                      />
                      <div className="flex justify-end gap-2 mt-3 pt-3 border-t border-white/5">
                        <Button onClick={cancelEditing} size="sm" variant="ghost" className="h-8 text-xs text-zinc-400 hover:text-white rounded-lg">
                          <X className="w-3.5 h-3.5 mr-1" /> Batal
                        </Button>
                        <Button onClick={saveEditing} size="sm" className="h-8 text-xs bg-cyan-600 hover:bg-cyan-500 text-white rounded-lg">
                          <Check className="w-3.5 h-3.5 mr-1" /> Simpan
                        </Button>
                      </div>
                    </div>
                  ) : (
                    /* --- MODE TAMPILAN BIASA --- */
                    <div className="relative group/bubble max-w-full">
                      <div className={`px-4 py-2.5 rounded-2xl text-sm shadow-md overflow-hidden ${
                        isUser 
                          ? 'bg-cyan-600 text-white rounded-tr-none' 
                          : 'bg-[#1e293b] text-zinc-200 border border-white/5 rounded-tl-none'
                      }`}>
                        
                        {renderAttachment(msg)}
                        
                        {msg.content && (
                          <div className="prose prose-invert prose-sm max-w-none break-words leading-relaxed text-[14px]">
                            <ReactMarkdown>{msg.content}</ReactMarkdown>
                          </div>
                        )}
                      </div>

                      {/* TOMBOL EDIT (Hanya muncul saat HOVER & Hanya untuk USER) */}
                      {isUser && !msg.file_url && (
                        <button
                          onClick={() => startEditing(msg)}
                          className="absolute -left-7 top-1.5 p-1 text-zinc-500 hover:text-cyan-400 opacity-0 group-hover/bubble:opacity-100 transition-all duration-200 transform hover:scale-110 bg-[#030712]/80 rounded-full border border-white/5"
                          title="Edit pesan"
                        >
                          <Pencil className="w-3 h-3" />
                        </button>
                      )}
                    </div>
                  )}

                  {/* Message Time stamp */}
                  <span className="text-[10px] text-zinc-600 mt-1 select-none font-medium px-1">
                    {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
        
        {/* TYPING LOADER */}
        {isLoading && (
          <div className="flex justify-start w-full pl-12 animate-fade-in">
            <div className="bg-[#1e293b] px-4 py-2.5 rounded-2xl rounded-tl-none border border-white/5 flex items-center gap-2">
              <Loader2 className="w-3.5 h-3.5 animate-spin text-cyan-400" />
              <span className="text-xs text-zinc-400">Nega sedang berpikir...</span>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>
    </ScrollArea>
  );
};

export default ChatMessages;