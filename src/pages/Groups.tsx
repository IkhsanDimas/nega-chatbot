import { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom'; // Import wajib untuk Portal
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ArrowLeft, Send, Loader2, Users } from 'lucide-react';

const Groups = () => {
  const { groupId } = useParams();
  const navigate = useNavigate();
  const { profile } = useAuth();
  
  const [messages, setMessages] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [groupName, setGroupName] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);

  // --- BAGIAN LOGIKA (FETCH DATA) TETAP SAMA ---
  const fetchMessages = async () => {
    if (!groupId) return;
    const { data, error } = await supabase
      .from('group_messages')
      .select('*')
      .eq('group_id', groupId)
      .order('created_at', { ascending: true });
    
    if (!error && data) setMessages(data);
  };

  useEffect(() => {
    if (!groupId) {
      setLoading(false);
      return;
    }

    const fetchData = async () => {
      setLoading(true);
      const { data: groupData } = await supabase
        .from('groups')
        .select('name')
        .eq('id', groupId)
        .single();
      if (groupData) setGroupName(groupData.name);

      await fetchMessages();
      setLoading(false);
    };

    fetchData();

    const channel = supabase
      .channel(`room-${groupId}`)
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'group_messages', filter: `group_id=eq.${groupId}` },
        (payload) => {
          setMessages((current) => {
            const isExist = current.find(m => m.id === payload.new.id);
            if (isExist) return current;
            return [...current, payload.new];
          });
        }
      )
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [groupId]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !profile || !groupId) return;

    const content = newMessage;
    const tempId = crypto.randomUUID();
    setNewMessage('');

    const optimisticMessage = {
      id: tempId, content: content, user_id: profile.id, group_id: groupId, created_at: new Date().toISOString()
    };
    
    setMessages(prev => [...prev, optimisticMessage]);

    const { error } = await supabase.from('group_messages').insert({
      group_id: groupId, user_id: profile.id, content: content,
    });

    if (error) setMessages(prev => prev.filter(m => m.id !== tempId));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-black">
        <Loader2 className="w-8 h-8 animate-spin text-cyan-500" />
      </div>
    );
  }

  // --- BAGIAN RENDER MENGGUNAKAN PORTAL ---
  // Kita melempar UI ini langsung ke document.body, melewati semua layout induk
  return createPortal(
    <div className="fixed inset-0 z-[99999] flex flex-col bg-[#020617] w-screen h-screen">
      
      {/* Header */}
      <div className="flex-none px-4 py-3 border-b border-white/10 bg-[#020617] flex items-center gap-3">
        <Button onClick={() => navigate(-1)} variant="ghost" size="icon" className="text-white hover:bg-white/10">
          <ArrowLeft className="w-6 h-6" />
        </Button>
        <div className="w-10 h-10 rounded-full bg-cyan-500/10 flex items-center justify-center text-cyan-400 border border-cyan-500/20">
          <Users className="w-5 h-5" />
        </div>
        <h1 className="text-lg font-bold text-white">{groupName}</h1>
      </div>

      {/* Area Chat - FULL WIDTH */}
      <div className="flex-1 overflow-y-auto w-full">
        {/* Padding-x-0 memastikan tidak ada jarak samping */}
        <div className="flex flex-col space-y-4 p-4 min-h-full justify-end w-full">
          {messages.map((msg) => {
            const isMe = msg.user_id === profile?.id;

            return (
              <div
                key={msg.id}
                // JUSTIFY-END + W-FULL: Memaksa elemen ke ujung kanan layar
                className={`flex w-full ${isMe ? 'justify-end' : 'justify-start'}`}
              >
                {/* ITEMS-END: Agar profil dan chat sejajar di bawah */}
                <div className={`flex max-w-[85%] items-end gap-2 ${isMe ? 'flex-row-reverse' : 'flex-row'}`}>
                  
                  {/* Logo Profil */}
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-[10px] shrink-0 border shadow-lg ${
                    isMe 
                      ? 'bg-cyan-500 text-black border-cyan-400 font-bold' 
                      : 'bg-zinc-800 text-zinc-400 border-white/5'
                  }`}>
                    {isMe ? (profile?.email?.[0].toUpperCase() || 'P') : 'U'}
                  </div>

                  {/* Gelembung Pesan */}
                  <div className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
                    <div className={`px-4 py-2 text-sm shadow-md break-words ${
                      isMe 
                        ? 'bg-cyan-500 text-black rounded-2xl rounded-br-none font-medium' 
                        : 'bg-zinc-800 text-white rounded-2xl rounded-bl-none border border-white/5'
                    }`}>
                      {msg.content}
                    </div>
                    {/* Jam Pesan */}
                    <span className="text-[10px] text-zinc-500 mt-1 px-1">
                      {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>

                </div>
              </div>
            );
          })}
          <div ref={scrollRef} />
        </div>
      </div>

      {/* Input Box */}
      <div className="flex-none p-4 bg-[#020617] border-t border-white/10 w-full">
        <form onSubmit={handleSendMessage} className="flex gap-2 w-full">
          <Input
            placeholder="Ketik pesan..."
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            className="flex-1 bg-zinc-900 border-white/5 text-white h-12 rounded-xl focus-visible:ring-cyan-500/50"
          />
          <Button type="submit" size="icon" className="bg-cyan-500 hover:bg-cyan-400 text-black h-12 w-12 rounded-xl shrink-0">
            <Send className="w-5 h-5" />
          </Button>
        </form>
      </div>
    </div>,
    document.body // Target Portal: Body Browser Langsung
  );
};

export default Groups;