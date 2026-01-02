import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Bot, User, ArrowLeft, MessageCircle, Play } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import ReactMarkdown from 'react-markdown';

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
}

const SharedChat = () => {
  const { conversationId } = useParams();
  const navigate = useNavigate();
  const { user, profile } = useAuth();
  const { toast } = useToast();
  const [conversation, setConversation] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showContinueDialog, setShowContinueDialog] = useState(false);
  const [isLoadingContinue, setIsLoadingContinue] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchSharedConversation = async () => {
      if (!conversationId) return;

      try {
        // Fetch conversation
        const { data: convData, error: convError } = await supabase
          .from('conversations')
          .select('*')
          .eq('id', conversationId)
          .eq('is_shared', true)
          .maybeSingle();

        if (convError) throw convError;
        
        if (!convData) {
          setError('Percakapan tidak ditemukan atau tidak dibagikan.');
          setLoading(false);
          return;
        }

        setConversation(convData);

        // Fetch messages
        const { data: msgData, error: msgError } = await supabase
          .from('messages')
          .select('*')
          .eq('conversation_id', conversationId)
          .order('created_at', { ascending: true });

        if (msgError) throw msgError;
        setMessages(msgData as Message[] || []);
      } catch (err) {
        console.error('Error fetching shared conversation:', err);
        setError('Gagal memuat percakapan.');
      } finally {
        setLoading(false);
      }
    };

    fetchSharedConversation();
  }, [conversationId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleContinueConversation = async () => {
    if (!user) {
      // Jika belum login, arahkan ke halaman auth
      navigate('/auth');
      return;
    }

    if (!conversationId) return;

    setIsLoadingContinue(true);
    try {
      // Copy conversation ke user yang sedang login
      const { data: newConv, error: convError } = await supabase
        .from('conversations')
        .insert({
          user_id: user.id,
          title: `${conversation?.title} (Lanjutan)`,
        })
        .select()
        .single();

      if (convError) throw convError;

      // Copy semua messages ke conversation baru
      const messagesToCopy = messages.map(msg => ({
        conversation_id: newConv.id,
        role: msg.role,
        content: msg.content,
        file_url: msg.file_url,
        file_type: msg.file_type,
      }));

      const { error: msgError } = await supabase
        .from('messages')
        .insert(messagesToCopy);

      if (msgError) throw msgError;

      toast({
        title: 'Berhasil!',
        description: 'Percakapan berhasil disalin ke akun Anda. Anda bisa melanjutkan chat dengan AI.',
      });

      // Redirect ke conversation baru
      navigate(`/chat/${newConv.id}`);
    } catch (error: any) {
      console.error('Error continuing conversation:', error);
      toast({
        title: 'Gagal',
        description: 'Gagal melanjutkan percakapan. Silakan coba lagi.',
        variant: 'destructive',
      });
    } finally {
      setIsLoadingContinue(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-spin w-8 h-8 border-2 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-background p-4">
        <div className="text-center max-w-md">
          <div className="w-16 h-16 rounded-2xl gradient-primary flex items-center justify-center mx-auto mb-6">
            <Bot className="w-8 h-8 text-primary-foreground" />
          </div>
          <h1 className="text-2xl font-bold mb-2">{error}</h1>
          <p className="text-muted-foreground mb-6">
            Link ini mungkin tidak valid atau percakapan tidak lagi dibagikan.
          </p>
          <Button onClick={() => navigate('/')} className="gradient-primary text-primary-foreground">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Kembali ke Beranda
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="h-16 border-b border-border flex items-center justify-between px-4 bg-card/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => navigate('/')}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg gradient-primary flex items-center justify-center">
              <Bot className="w-5 h-5 text-primary-foreground" />
            </div>
            <div>
              <h1 className="font-medium text-foreground text-sm">
                {conversation?.title || 'Percakapan'}
              </h1>
              <p className="text-xs text-muted-foreground">Dibagikan • Nega AI</p>
            </div>
          </div>
        </div>

        {/* Continue Conversation Button */}
        <Button
          onClick={() => setShowContinueDialog(true)}
          className="gap-2 bg-primary hover:bg-primary/90"
          size="sm"
        >
          <Play className="w-4 h-4" />
          Lanjutkan Chat
        </Button>
      </header>

      {/* Messages */}
      <div className="max-w-4xl mx-auto p-4 pb-20 space-y-6">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex gap-4 ${
              message.role === 'user' ? 'justify-end' : 'justify-start'
            }`}
          >
            {message.role === 'assistant' && (
              <div className="w-8 h-8 rounded-lg gradient-primary flex items-center justify-center shrink-0">
                <Bot className="w-5 h-5 text-primary-foreground" />
              </div>
            )}

            <div
              className={`max-w-[75%] rounded-2xl px-4 py-3 ${
                message.role === 'user'
                  ? 'bg-primary text-primary-foreground'
                  : 'glass'
              }`}
            >
              {message.file_url && (
                <div className="mb-3">
                  {message.file_type?.startsWith('image/') ? (
                    <img
                      src={message.file_url}
                      alt="Uploaded"
                      className="max-w-full rounded-lg max-h-64 object-cover"
                    />
                  ) : (
                    <a
                      href={message.file_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 text-sm underline"
                    >
                      📎 Lihat file
                    </a>
                  )}
                </div>
              )}
              
              {message.role === 'assistant' ? (
                <div className="prose prose-invert prose-sm max-w-none">
                  <ReactMarkdown
                    components={{
                      p: ({ children }) => <p className="mb-2 last:mb-0">{children}</p>,
                      ul: ({ children }) => <ul className="list-disc pl-4 mb-2">{children}</ul>,
                      ol: ({ children }) => <ol className="list-decimal pl-4 mb-2">{children}</ol>,
                      li: ({ children }) => <li className="mb-1">{children}</li>,
                      code: ({ children }) => (
                        <code className="bg-muted px-1.5 py-0.5 rounded text-sm">{children}</code>
                      ),
                      pre: ({ children }) => (
                        <pre className="bg-muted p-3 rounded-lg overflow-x-auto my-2">{children}</pre>
                      ),
                    }}
                  >
                    {message.content}
                  </ReactMarkdown>
                </div>
              ) : (
                <p className="text-sm whitespace-pre-wrap">{message.content}</p>
              )}
            </div>

            {message.role === 'user' && (
              <div className="w-8 h-8 rounded-lg bg-secondary flex items-center justify-center shrink-0">
                <User className="w-5 h-5 text-secondary-foreground" />
              </div>
            )}
          </div>
        ))}

        {messages.length === 0 && (
          <div className="text-center py-12 text-muted-foreground">
            Tidak ada pesan dalam percakapan ini.
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* Continue Conversation Dialog */}
      {showContinueDialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-background border border-border rounded-lg p-6 max-w-md mx-4 shadow-xl">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-lg gradient-primary flex items-center justify-center">
                <MessageCircle className="w-6 h-6 text-primary-foreground" />
              </div>
              <div>
                <h3 className="font-semibold text-foreground">Lanjutkan Percakapan</h3>
                <p className="text-sm text-muted-foreground">
                  {user ? 'Salin chat ini ke akun Anda' : 'Login untuk melanjutkan'}
                </p>
              </div>
            </div>
            
            <p className="text-sm text-muted-foreground mb-6">
              {user 
                ? 'Percakapan ini akan disalin ke akun Anda sehingga Anda bisa melanjutkan chat dengan AI dari titik ini.'
                : 'Anda perlu login terlebih dahulu untuk melanjutkan percakapan ini.'
              }
            </p>

            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={() => setShowContinueDialog(false)}
                className="flex-1"
              >
                Batal
              </Button>
              <Button
                onClick={handleContinueConversation}
                disabled={isLoadingContinue}
                className="flex-1 gap-2"
              >
                {isLoadingContinue ? (
                  <div className="w-4 h-4 animate-spin border-2 border-current border-t-transparent rounded-full" />
                ) : (
                  <Play className="w-4 h-4" />
                )}
                {user ? 'Lanjutkan' : 'Login & Lanjutkan'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SharedChat;
