import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Bot, User, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
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
  const [conversation, setConversation] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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
      </header>

      {/* Messages */}
      <div className="max-w-4xl mx-auto p-4 space-y-6">
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
      </div>

      {/* Footer */}
      <footer className="fixed bottom-0 inset-x-0 p-4 bg-card/80 backdrop-blur-sm border-t border-border">
        <div className="max-w-4xl mx-auto text-center">
          <p className="text-sm text-muted-foreground mb-3">
            Ingin mencoba Ainya? Buat akun gratis sekarang!
          </p>
          <Button onClick={() => navigate('/auth')} className="gradient-primary text-primary-foreground">
            Mulai Chat dengan Ainya
          </Button>
        </div>
      </footer>
    </div>
  );
};

export default SharedChat;
