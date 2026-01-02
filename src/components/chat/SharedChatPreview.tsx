import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Bot, ExternalLink, MessageSquare, Clock } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface SharedChatPreviewProps {
  shareLink: string;
  className?: string;
}

interface ConversationPreview {
  id: string;
  title: string;
  created_at: string;
  messageCount: number;
  lastMessage?: string;
}

export function SharedChatPreview({ shareLink, className = '' }: SharedChatPreviewProps) {
  const [preview, setPreview] = useState<ConversationPreview | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPreview = async () => {
      try {
        // Extract conversation ID from share link
        const conversationId = shareLink.split('/shared/')[1];
        if (!conversationId) return;

        // Fetch conversation details
        const { data: conversation, error: convError } = await supabase
          .from('conversations')
          .select('id, title, created_at')
          .eq('id', conversationId)
          .eq('is_shared', true)
          .single();

        if (convError || !conversation) return;

        // Fetch message count and last message
        const { data: messages, error: msgError } = await supabase
          .from('messages')
          .select('content, role, created_at')
          .eq('conversation_id', conversationId)
          .order('created_at', { ascending: false })
          .limit(1);

        if (msgError) return;

        setPreview({
          id: conversation.id,
          title: conversation.title,
          created_at: conversation.created_at,
          messageCount: messages?.length || 0,
          lastMessage: messages?.[0]?.content?.slice(0, 100) + '...' || ''
        });
      } catch (error) {
        console.error('Error fetching preview:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchPreview();
  }, [shareLink]);

  if (loading) {
    return (
      <div className={`animate-pulse bg-muted rounded-lg p-4 ${className}`}>
        <div className="h-4 bg-muted-foreground/20 rounded w-3/4 mb-2"></div>
        <div className="h-3 bg-muted-foreground/20 rounded w-1/2"></div>
      </div>
    );
  }

  if (!preview) {
    return (
      <div className={`border border-border rounded-lg p-4 ${className}`}>
        <div className="flex items-center gap-3">
          <Bot className="w-8 h-8 text-muted-foreground" />
          <div className="flex-1">
            <p className="font-medium text-foreground">Chat dengan AI</p>
            <p className="text-sm text-muted-foreground">Klik untuk melihat percakapan</p>
          </div>
          <Button size="sm" variant="outline" asChild>
            <a href={shareLink} target="_blank" rel="noopener noreferrer">
              <ExternalLink className="w-4 h-4" />
            </a>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className={`border border-border rounded-lg overflow-hidden hover:border-primary/50 transition-colors ${className}`}>
      {/* Header */}
      <div className="bg-gradient-to-r from-primary/10 to-accent/10 p-3 border-b border-border">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center">
            <Bot className="w-5 h-5 text-primary" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-medium text-foreground truncate">{preview.title}</h3>
            <div className="flex items-center gap-3 text-xs text-muted-foreground">
              <div className="flex items-center gap-1">
                <MessageSquare className="w-3 h-3" />
                <span>Chat dengan AI</span>
              </div>
              <div className="flex items-center gap-1">
                <Clock className="w-3 h-3" />
                <span>{new Date(preview.created_at).toLocaleDateString('id-ID')}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Preview Content */}
      {preview.lastMessage && (
        <div className="p-3 bg-muted/30">
          <p className="text-sm text-muted-foreground line-clamp-2">
            {preview.lastMessage}
          </p>
        </div>
      )}

      {/* Action */}
      <div className="p-3 bg-background">
        <Button asChild className="w-full" size="sm">
          <a href={shareLink} target="_blank" rel="noopener noreferrer">
            <ExternalLink className="w-4 h-4 mr-2" />
            Lihat Percakapan Lengkap
          </a>
        </Button>
      </div>
    </div>
  );
}