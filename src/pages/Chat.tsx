import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import ChatSidebar from '@/components/chat/ChatSidebar';
import ChatHeader from '@/components/chat/ChatHeader';
import ChatMessages from '@/components/chat/ChatMessages';
import ChatInput from '@/components/chat/ChatInput';
import WelcomeScreen from '@/components/chat/WelcomeScreen';
import QuotaWarning from '@/components/chat/QuotaWarning';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  file_url?: string;
  file_type?: string;
  created_at: string;
}

interface Conversation {
  id: string;
  title: string;
  created_at: string;
  updated_at: string;
}

const Chat = () => {
  const { conversationId } = useParams();
  const navigate = useNavigate();
  const { user, profile, refreshProfile } = useAuth();
  const { toast } = useToast();
  
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [currentConversation, setCurrentConversation] = useState<Conversation | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const remainingPrompts = profile?.subscription_type === 'pro' 
    ? Infinity 
    : Math.max(0, 12 - (profile?.daily_prompt_count || 0));

  const canSendMessage = profile?.subscription_type === 'pro' || remainingPrompts > 0;

  useEffect(() => {
    if (user) {
      fetchConversations();
    }
  }, [user]);

  useEffect(() => {
    if (conversationId) {
      fetchMessages(conversationId);
      const conv = conversations.find(c => c.id === conversationId);
      setCurrentConversation(conv || null);
    } else {
      setMessages([]);
      setCurrentConversation(null);
    }
  }, [conversationId, conversations]);

  // Scroll ke bawah HANYA jika pesan bertambah (bukan saat diedit)
  useEffect(() => {
    if (!isLoading) {
      // Opsional: Anda bisa menambahkan logika agar tidak scroll jika sedang membaca pesan lama
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages.length, conversationId]); // Trigger hanya jika panjang pesan berubah atau ganti chat

  const fetchConversations = async () => {
    try {
      const { data, error } = await supabase
        .from('conversations')
        .select('*')
        .eq('user_id', user?.id)
        .order('updated_at', { ascending: false });

      if (error) throw error;
      setConversations(data || []);
    } catch (error) {
      console.error('Error fetching conversations:', error);
    }
  };

  const fetchMessages = async (convId: string) => {
    try {
      const { data, error } = await supabase
        .from('messages')
        .select('*')
        .eq('conversation_id', convId)
        .order('created_at', { ascending: true });

      if (error) throw error;
      setMessages(data as Message[] || []);
    } catch (error) {
      console.error('Error fetching messages:', error);
    }
  };

  // --- LOGIKA EDIT & RE-GENERATE AI (YANG DIPERBAIKI) ---
  const handleEditMessage = async (messageId: string, newContent: string) => {
    try {
      setIsLoading(true);

      // 1. Update Database (Pesan User)
      const { error: updateError } = await supabase
        .from('messages')
        .update({ content: newContent })
        .eq('id', messageId);

      if (updateError) throw updateError;

      // 2. Cari Posisi Pesan
      const msgIndex = messages.findIndex(m => m.id === messageId);
      if (msgIndex === -1) return;

      // 3. Update State Lokal (Agar User langsung melihat perubahannya)
      const updatedMessages = [...messages];
      updatedMessages[msgIndex] = { ...updatedMessages[msgIndex], content: newContent };
      setMessages(updatedMessages);

      // 4. Siapkan Context untuk AI
      // HANYA kirimkan pesan dari awal sampai pesan yang diedit.
      // Pesan-pesan "masa depan" (setelahnya) dipotong agar tidak membingungkan AI.
      const historyForAI = updatedMessages.slice(0, msgIndex + 1);

      // 5. Cek Pesan Setelahnya (Apakah itu jawaban AI?)
      const nextMsg = messages[msgIndex + 1];
      const isNextAssistant = nextMsg && nextMsg.role === 'assistant';

      // 6. Panggil AI
      const response = await supabase.functions.invoke('chat-with-ainya', {
        body: {
          messages: historyForAI.map(m => ({
            role: m.role,
            content: m.content,
            file_url: m.file_url,
            file_type: m.file_type,
          })),
        },
      });

      if (response.error) throw response.error;
      const assistantContent = response.data?.content || 'Maaf, terjadi kesalahan saat memproses ulang.';

      if (isNextAssistant) {
        // --- SKENARIO A: UPDATE PESAN AI YANG ADA (TIMPA) ---
        // Ini kuncinya: Kita update ID yang sama, jadi posisinya tidak berubah.
        
        // Update Database
        await supabase
          .from('messages')
          .update({ content: assistantContent })
          .eq('id', nextMsg.id);

        // Update State Lokal
        setMessages(prev => {
          const newList = [...prev];
          // Pastikan index masih valid
          if (newList[msgIndex + 1]) {
            newList[msgIndex + 1] = { 
              ...newList[msgIndex + 1], 
              content: assistantContent 
            };
          }
          return newList;
        });

      } else {
        // --- SKENARIO B: INSERT BARU (Jika sebelumnya tidak ada jawaban) ---
        // Ini jarang terjadi kecuali user mengedit pesan paling terakhir yang belum dijawab.
        
        const newAssistantMessage: Message = {
          id: crypto.randomUUID(),
          role: 'assistant',
          content: assistantContent,
          created_at: new Date().toISOString(),
        };

        // Insert Database
        await supabase.from('messages').insert({
          conversation_id: conversationId,
          role: 'assistant',
          content: assistantContent,
        });

        // Insert State (Tepat setelah pesan user)
        setMessages(prev => {
          const newList = [...prev];
          // Sisipkan di posisi index + 1
          newList.splice(msgIndex + 1, 0, newAssistantMessage);
          return newList;
        });
      }

      toast({
        title: "Berhasil",
        description: "Pesan diedit & respon diperbarui.",
      });

    } catch (error: any) {
      console.error('Error editing message:', error);
      toast({
        title: "Gagal",
        description: error.message || "Gagal mengedit pesan.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const createNewConversation = async (firstMessage: string): Promise<string | null> => {
    try {
      const title = firstMessage.slice(0, 50) + (firstMessage.length > 50 ? '...' : '');
      const { data, error } = await supabase
        .from('conversations')
        .insert({
          user_id: user?.id,
          title,
        })
        .select()
        .single();

      if (error) throw error;
      setConversations(prev => [data, ...prev]);
      return data.id;
    } catch (error) {
      console.error('Error creating conversation:', error);
      return null;
    }
  };

  const handleSendMessage = async (content: string, file?: File) => {
    if (!content.trim() && !file) return;
    if (!canSendMessage) {
      toast({
        title: 'Kuota habis',
        description: 'Upgrade ke PRO untuk chat tanpa batas.',
        variant: 'destructive',
      });
      return;
    }

    setIsLoading(true);
    let convId = conversationId;
    let fileUrl: string | undefined;
    let fileType: string | undefined;

    try {
      if (file) {
        const fileExt = file.name.split('.').pop();
        const fileName = `${user?.id}/${Date.now()}.${fileExt}`;
        const { error: uploadError } = await supabase.storage
          .from('chat-files')
          .upload(fileName, file, {
            contentType: file.type,
            upsert: false
          });

        if (uploadError) throw uploadError;
        const { data: { publicUrl } } = supabase.storage
          .from('chat-files')
          .getPublicUrl(fileName);
        
        fileUrl = publicUrl;
        fileType = file.type;
      }

      if (!convId) {
        convId = await createNewConversation(content || (file ? 'Mengirim file...' : 'Percakapan Baru'));
        if (!convId) throw new Error('Failed to create conversation');
        navigate(`/chat/${convId}`);
      }

      const userMessage: Message = {
        id: crypto.randomUUID(),
        role: 'user',
        content,
        file_url: fileUrl,
        file_type: fileType,
        created_at: new Date().toISOString(),
      };

      setMessages(prev => [...prev, userMessage]);

      await supabase.from('messages').insert({
        conversation_id: convId,
        role: 'user',
        content,
        file_url: fileUrl,
        file_type: fileType,
      });

      if (profile?.subscription_type !== 'pro') {
        await supabase
          .from('profiles')
          .update({ daily_prompt_count: (profile?.daily_prompt_count || 0) + 1 })
          .eq('id', user?.id);
        refreshProfile();
      }

      const response = await supabase.functions.invoke('chat-with-ainya', {
        body: {
          messages: [...messages, userMessage].map(m => ({
            role: m.role,
            content: m.content,
            file_url: m.file_url,
            file_type: m.file_type,
          })),
        },
      });

      if (response.error) throw response.error;
      const assistantContent = response.data?.content || 'Maaf, saya tidak dapat memproses permintaan Anda.';

      const assistantMessage: Message = {
        id: crypto.randomUUID(),
        role: 'assistant',
        content: assistantContent,
        created_at: new Date().toISOString(),
      };

      setMessages(prev => [...prev, assistantMessage]);

      await supabase.from('messages').insert({
        conversation_id: convId,
        role: 'assistant',
        content: assistantContent,
      });

      await supabase
        .from('conversations')
        .update({ updated_at: new Date().toISOString() })
        .eq('id', convId);

    } catch (error: any) {
      console.error('Error sending message:', error);
      toast({
        title: 'Gagal mengirim pesan',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteConversation = async (convId: string) => {
    try {
      await supabase.from('conversations').delete().eq('id', convId);
      setConversations(prev => prev.filter(c => c.id !== convId));
      if (convId === conversationId) navigate('/chat');
      toast({ title: 'Berhasil', description: 'Percakapan dihapus.' });
    } catch (error) {
      console.error('Error deleting conversation:', error);
    }
  };

  const handleNewChat = () => {
    navigate('/chat');
    setMessages([]);
    setCurrentConversation(null);
  };

  return (
    <div className="flex h-screen bg-background">
      <ChatSidebar
        conversations={conversations}
        currentConversationId={conversationId}
        isOpen={isSidebarOpen}
        onToggle={() => setIsSidebarOpen(!isSidebarOpen)}
        onNewChat={handleNewChat}
        onDeleteConversation={handleDeleteConversation}
        onNavigate={(id) => navigate(`/chat/${id}`)}
      />

      <div className="flex-1 flex flex-col min-w-0">
        <ChatHeader
          isSidebarOpen={isSidebarOpen}
          onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
          conversationTitle={currentConversation?.title}
          remainingPrompts={remainingPrompts}
          isPro={profile?.subscription_type === 'pro'}
        />

        <div className="flex-1 overflow-hidden">
          {messages.length === 0 && !isLoading ? (
            <WelcomeScreen onSuggestionClick={(msg) => handleSendMessage(msg)} />
          ) : (
            <ChatMessages
              messages={messages}
              isLoading={isLoading}
              messagesEndRef={messagesEndRef}
              onEditMessage={handleEditMessage} 
            />
          )}
        </div>

        {!canSendMessage && (
          <QuotaWarning onUpgrade={() => navigate('/upgrade')} />
        )}

        <ChatInput
          onSend={handleSendMessage}
          isLoading={isLoading}
          disabled={!canSendMessage}
        />
      </div>
    </div>
  );
};

export default Chat;