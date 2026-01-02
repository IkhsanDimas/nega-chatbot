import { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ArrowLeft, Send, Loader2, Trash2, Edit2, X, Check, Pencil, Smile } from 'lucide-react';
import { GroupInfoDialog } from '@/components/GroupInfoDialog';
import { SharedChatPreview } from '@/components/chat/SharedChatPreview';
import EmojiPicker from '@/components/chat/EmojiPicker';
import { toast } from 'sonner';

const GroupChat = () => {
  const { groupId } = useParams();
  const navigate = useNavigate();
  const { profile } = useAuth();
  
  const [messages, setMessages] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [groupName, setGroupName] = useState('');
  const [inviteCode, setInviteCode] = useState('');
  
  // State Edit Pesan
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValue, setEditValue] = useState('');
  const [selectedMessageId, setSelectedMessageId] = useState<string | null>(null);

  // State Reply
  const [replyingTo, setReplyingTo] = useState<any | null>(null);

  // State Emoji & Sticker
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);

  // State Edit Nama Grup
  const [isEditingName, setIsEditingName] = useState(false);
  const [newGroupName, setNewGroupName] = useState('');

  const scrollRef = useRef<HTMLDivElement>(null);

  // Fungsi untuk mendeteksi shared chat link
  const detectSharedChatLink = (content: string) => {
    const regex = /https?:\/\/[^\s]+\/shared\/[a-f0-9-]+/gi;
    return content.match(regex)?.[0] || null;
  };

  // Fungsi untuk render konten pesan
  const renderMessageContent = (msg: any) => {
    const sharedLink = detectSharedChatLink(msg.content);
    
    // Check if message is a sticker (single large emoji)
    const isSticker = msg.content.length <= 2 && /^[\u{1F600}-\u{1F64F}\u{1F300}-\u{1F5FF}\u{1F680}-\u{1F6FF}\u{1F1E0}-\u{1F1FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}]+$/u.test(msg.content);
    
    if (isSticker) {
      return (
        <div className="flex items-center justify-center p-2">
          <span className="text-6xl">{msg.content}</span>
        </div>
      );
    }
    
    if (sharedLink) {
      // Jika ada shared chat link, tampilkan preview
      const textWithoutLink = msg.content.replace(sharedLink, '').trim();
      return (
        <div className="space-y-3">
          {textWithoutLink && (
            <div className="text-sm whitespace-pre-wrap">{textWithoutLink}</div>
          )}
          <SharedChatPreview shareLink={sharedLink} />
        </div>
      );
    }
    
    // Jika tidak ada shared link, tampilkan text biasa
    return <div className="text-sm whitespace-pre-wrap">{msg.content}</div>;
  };

  // Fungsi untuk render replied message preview
  const renderReplyPreview = (replyToMessage: any) => {
    if (!replyToMessage) return null;
    
    const senderName = replyToMessage.profiles?.display_name || 
                      replyToMessage.profiles?.email?.split('@')[0] || 
                      'Unknown User';
    
    return (
      <div className="mb-2 p-2 bg-black/30 border-l-3 border-cyan-400 rounded-r text-xs">
        <div className="text-cyan-400 font-medium mb-1 flex items-center gap-1">
          <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" />
          </svg>
          {senderName}
        </div>
        <div className="text-white/70 line-clamp-2">
          {replyToMessage.content && replyToMessage.content.length > 100 
            ? replyToMessage.content.substring(0, 100) + '...'
            : replyToMessage.content || 'Pesan tidak tersedia'
          }
        </div>
      </div>
    );
  };

  const fetchMessages = async () => {
    if (!groupId) return;
    
    try {
      // Try to fetch with reply_to first
      const { data, error } = await supabase
        .from('group_messages')
        .select(`
          *,
          reply_to_message:reply_to (
            id,
            content,
            user_id,
            profiles!group_messages_user_id_fkey (
              display_name,
              email
            )
          ),
          profiles!group_messages_user_id_fkey (
            display_name,
            email
          )
        `)
        .eq('group_id', groupId)
        .order('created_at', { ascending: true });
      
      if (!error && data) {
        setMessages(data);
      } else {
        // Fallback: fetch without reply_to if column doesn't exist yet
        const { data: fallbackData, error: fallbackError } = await supabase
          .from('group_messages')
          .select('*')
          .eq('group_id', groupId)
          .order('created_at', { ascending: true });
        
        if (!fallbackError && fallbackData) {
          setMessages(fallbackData);
        }
      }
    } catch (err) {
      console.error('Error fetching messages:', err);
      // Final fallback
      const { data: basicData } = await supabase
        .from('group_messages')
        .select('*')
        .eq('group_id', groupId)
        .order('created_at', { ascending: true });
      
      if (basicData) setMessages(basicData);
    }
  };

  useEffect(() => {
    if (!groupId) { setLoading(false); return; }
    const fetchData = async () => {
      setLoading(true);
      const { data: groupData } = await supabase.from('groups').select('name, invite_code').eq('id', groupId).single();
      if (groupData) {
        console.log('GroupChat - Fetched group data:', groupData);
        setGroupName(groupData.name);
        setInviteCode(groupData.invite_code);
        setNewGroupName(groupData.name); // Siapkan nama untuk diedit
      } else {
        console.error('GroupChat - No group data found for ID:', groupId);
      }
      await fetchMessages();
      setLoading(false);
    };
    fetchData();

    const channel = supabase.channel(`room-${groupId}`).on('postgres_changes', { event: '*', schema: 'public', table: 'group_messages', filter: `group_id=eq.${groupId}` }, 
      (payload) => {
        if (payload.eventType === 'INSERT') setMessages((prev) => [...prev, payload.new]);
        else if (payload.eventType === 'UPDATE') setMessages((prev) => prev.map(m => m.id === payload.new.id ? payload.new : m));
        else if (payload.eventType === 'DELETE') setMessages((prev) => prev.filter(m => m.id !== payload.old.id));
      }
    ).subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [groupId]);

  useEffect(() => { if (scrollRef.current) scrollRef.current.scrollIntoView({ behavior: 'smooth' }); }, [messages]);

  // --- FUNGSI UPDATE NAMA GRUP ---
  const handleUpdateGroupName = async () => {
    if (!newGroupName.trim()) return;
    const { error } = await supabase.from('groups').update({ name: newGroupName }).eq('id', groupId);
    
    if (error) {
      toast.error("Gagal mengubah nama grup");
    } else {
      setGroupName(newGroupName);
      setIsEditingName(false);
      toast.success("Nama grup diperbarui");
    }
  };
  // ------------------------------

  const handleDelete = async (id: string) => { /* ...Sama... */
    const { error } = await supabase.from('group_messages').delete().eq('id', id);
    if (!error) { setMessages((prev) => prev.filter(m => m.id !== id)); toast.success("Pesan dihapus"); }
  };

  const handleUpdateMessage = async () => { /* ...Sama... */
    if (!editValue.trim() || !editingId) return;
    const { error } = await supabase.from('group_messages').update({ content: editValue }).eq('id', editingId);
    if (!error) { setEditingId(null); toast.success("Pesan diperbarui"); }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !profile || !groupId) return;
    
    const content = newMessage;
    const replyToId = replyingTo?.id || null;
    
    setNewMessage('');
    setReplyingTo(null); // Clear reply state
    setShowEmojiPicker(false); // Close emoji picker
    
    try {
      // Try to insert with reply_to
      await supabase.from('group_messages').insert({ 
        group_id: groupId, 
        user_id: profile.id, 
        content,
        reply_to: replyToId
      });
    } catch (error) {
      // Fallback: insert without reply_to if column doesn't exist
      console.log('Fallback: inserting without reply_to');
      await supabase.from('group_messages').insert({ 
        group_id: groupId, 
        user_id: profile.id, 
        content
      });
    }
  };

  // Handle emoji selection
  const handleEmojiSelect = (emoji: string) => {
    setNewMessage(prev => prev + emoji);
  };

  // Handle sticker selection
  const handleStickerSelect = (sticker: string) => {
    setNewMessage(sticker); // Replace entire message with sticker
    setShowEmojiPicker(false);
  };

  if (loading) return <div className="flex items-center justify-center h-screen bg-black"><Loader2 className="w-8 h-8 animate-spin text-cyan-500" /></div>;

  return createPortal(
    <div className="fixed inset-0 z-[99999] flex flex-col bg-[#020617] w-screen h-screen">
      {/* HEADER */}
      <div className="flex-none px-4 py-3 border-b border-white/10 bg-[#020617] flex items-center justify-between">
        <div className="flex items-center gap-3 flex-1">
          <Button onClick={() => navigate('/chat')} variant="ghost" size="icon" className="text-yellow-500 hover:bg-white/10 shrink-0">
            <ArrowLeft className="w-6 h-6" />
          </Button>

          {/* AREA NAMA GRUP (BISA DIEDIT) */}
          {isEditingName ? (
            <div className="flex items-center gap-2 flex-1 max-w-xs animate-in fade-in zoom-in-95">
              <Input 
                value={newGroupName} 
                onChange={(e) => setNewGroupName(e.target.value)}
                className="h-8 bg-slate-900 border-cyan-500 text-white font-bold"
                autoFocus
              />
              <button onClick={handleUpdateGroupName} className="p-1.5 bg-green-500/20 text-green-500 rounded hover:bg-green-500 hover:text-white transition"><Check className="w-4 h-4" /></button>
              <button onClick={() => { setIsEditingName(false); setNewGroupName(groupName); }} className="p-1.5 bg-red-500/20 text-red-500 rounded hover:bg-red-500 hover:text-white transition"><X className="w-4 h-4" /></button>
            </div>
          ) : (
            <div className="flex items-center gap-2 group cursor-pointer" onClick={() => setIsEditingName(true)}>
              <h1 className="text-lg font-bold text-white truncate max-w-[200px] hover:text-cyan-400 transition-colors" title="Klik untuk edit nama">
                {groupName}
              </h1>
              <Pencil className="w-3.5 h-3.5 text-slate-500 opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
          )}
        </div>
        
        {/* Tombol Share di Kanan */}
        <GroupInfoDialog groupId={groupId!} groupName={groupName} inviteCode={inviteCode} />
      </div>

      {/* BODY CHAT */}
      <div className="flex-1 overflow-y-auto" onClick={() => setSelectedMessageId(null)}>
        <div className="flex flex-col space-y-4 p-4">
          {messages.map((msg) => {
             /* ... Logika Pesan Sama Persis ... */
             const isMe = msg.user_id === profile?.id;
             return (
               <div key={msg.id} className={`flex w-full ${isMe ? 'justify-end' : 'justify-start'} group`}>
                 <div className={`flex max-w-[85%] flex-col ${isMe ? 'items-end' : 'items-start'} relative`}>
                   {editingId === msg.id ? (
                     <div className="flex items-center gap-2 bg-zinc-900 p-2 rounded-xl border border-cyan-500">
                       <input value={editValue} onChange={(e) => setEditValue(e.target.value)} className="bg-transparent text-white outline-none w-full" autoFocus />
                       <button onClick={handleUpdateMessage} className="text-green-500 p-2"><Check /></button>
                       <button onClick={() => setEditingId(null)} className="text-red-500 p-2"><X /></button>
                     </div>
                   ) : (
                     <>
                       <div 
                         onClick={(e) => { e.stopPropagation(); isMe && setSelectedMessageId(selectedMessageId === msg.id ? null : msg.id); }}
                         className={`px-4 py-3 text-sm transition-all active:scale-95 ${
                           isMe 
                             ? 'bg-cyan-500 text-black rounded-2xl rounded-br-none' 
                             : 'bg-zinc-800 text-white rounded-2xl rounded-bl-none'
                         } ${msg.reply_to_message ? 'border-l-2 border-cyan-400/50' : ''} ${
                           // Check if message is a sticker for special styling
                           msg.content.length <= 2 && /^[\u{1F600}-\u{1F64F}\u{1F300}-\u{1F5FF}\u{1F680}-\u{1F6FF}\u{1F1E0}-\u{1F1FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}]+$/u.test(msg.content)
                             ? 'bg-transparent border-2 border-dashed border-cyan-400/30 p-2' 
                             : ''
                         }`}
                       >
                         {/* Render replied message preview */}
                         {msg.reply_to_message && renderReplyPreview(msg.reply_to_message)}
                         
                         {/* Render message content */}
                         {renderMessageContent(msg)}
                       </div>
                       
                       {/* Reply button - ALWAYS visible for ALL messages */}
                       <div className={`flex ${isMe ? 'justify-start' : 'justify-end'} mt-2`}>
                         <button
                           onClick={(e) => {
                             e.stopPropagation();
                             setReplyingTo(msg);
                             setSelectedMessageId(null);
                           }}
                           className="flex items-center gap-2 px-4 py-2 text-sm bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white rounded-full transition-all shadow-lg hover:shadow-xl transform hover:scale-105"
                         >
                           <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                             <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" />
                           </svg>
                           Balas Pesan
                         </button>
                       </div>
                       {/* Action buttons for selected messages */}
                       {selectedMessageId === msg.id && isMe && (
                         <div className="flex gap-2 mt-2 animate-in fade-in slide-in-from-top-1">
                           <Button size="sm" onClick={() => { setEditingId(msg.id); setEditValue(msg.content); setSelectedMessageId(null); }} className="bg-zinc-700 text-white gap-2 rounded-full px-3 h-8 shadow-lg border border-white/10">
                             <Edit2 className="w-3 h-3 text-cyan-400" /> Edit
                           </Button>
                           <Button size="sm" onClick={() => handleDelete(msg.id)} className="bg-red-500/20 text-red-500 gap-2 rounded-full px-3 h-8 shadow-lg border border-red-500/30 hover:bg-red-500 hover:text-white">
                             <Trash2 className="w-3 h-3" /> Hapus
                           </Button>
                         </div>
                       )}
                     </>
                   )}
                 </div>
               </div>
             );
          })}
          <div ref={scrollRef} />
        </div>
      </div>

      {/* INPUT */}
      <div className="p-4 bg-[#020617] border-t border-white/10 relative">
        {/* Reply Preview */}
        {replyingTo && (
          <div className="mb-3 p-3 bg-zinc-900 border border-cyan-500/30 rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <div className="text-cyan-400 text-sm font-medium flex items-center gap-2">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" />
                </svg>
                Membalas {replyingTo.profiles?.display_name || replyingTo.profiles?.email?.split('@')[0] || 'Unknown User'}
              </div>
              <button
                onClick={() => setReplyingTo(null)}
                className="text-slate-400 hover:text-white transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="text-white/70 text-sm line-clamp-2">
              {replyingTo.content.length > 150 
                ? replyingTo.content.substring(0, 150) + '...'
                : replyingTo.content
              }
            </div>
          </div>
        )}

        {/* Emoji Picker */}
        {showEmojiPicker && (
          <EmojiPicker
            onEmojiSelect={handleEmojiSelect}
            onStickerSelect={handleStickerSelect}
            onClose={() => setShowEmojiPicker(false)}
          />
        )}

        <form onSubmit={handleSendMessage} className="flex gap-2">
          <Input 
            placeholder={replyingTo ? "Tulis balasan..." : "Ketik pesan..."} 
            value={newMessage} 
            onChange={(e) => setNewMessage(e.target.value)} 
            className="bg-zinc-900 border-white/5 text-white h-12 rounded-xl" 
          />
          <Button 
            type="button"
            onClick={() => setShowEmojiPicker(!showEmojiPicker)}
            size="icon" 
            className="bg-yellow-500 hover:bg-yellow-600 text-black h-12 w-12 rounded-xl shrink-0"
          >
            <Smile className="w-5 h-5" />
          </Button>
          <Button type="submit" size="icon" className="bg-cyan-500 text-black h-12 w-12 rounded-xl shrink-0">
            <Send />
          </Button>
        </form>
      </div>
    </div>,
    document.body
  );
};

export default GroupChat;