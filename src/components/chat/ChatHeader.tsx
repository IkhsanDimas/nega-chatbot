import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Menu, Crown, Bot } from 'lucide-react';
import { ShareToGroupDialog } from './ShareToGroupDialog';

const AI_MODEL_NAME = "Gemini 2.5 Flash";

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  file_url?: string;
  file_type?: string;
  created_at: string;
}

interface ChatHeaderProps {
  isSidebarOpen: boolean;
  onToggleSidebar: () => void;
  conversationTitle?: string;
  remainingPrompts: number;
  isPro: boolean;
  messages?: Message[];
  conversationId?: string;
}

const ChatHeader = ({
  isSidebarOpen,
  onToggleSidebar,
  conversationTitle,
  isPro,
  messages = [],
  conversationId,
}: ChatHeaderProps) => {
  const navigate = useNavigate();

  return (
    <header className="h-16 border-b border-white/5 flex items-center justify-between px-4 md:px-6 bg-[#030712]/80 backdrop-blur-md relative z-20">
      <div className="flex items-center gap-3">
        {!isSidebarOpen && (
          <Button
            variant="ghost"
            size="icon"
            onClick={onToggleSidebar}
            className="text-zinc-400 hover:text-white hover:bg-white/5 rounded-xl mr-1"
          >
            <Menu className="w-5 h-5" />
          </Button>
        )}
        
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-xl flex items-center justify-center shadow-md shadow-cyan-500/10 shrink-0">
            <Bot className="w-5 h-5 text-white" />
          </div>
          <div className="min-w-0">
            <h1 className="font-semibold text-white text-sm md:text-base truncate max-w-[160px] sm:max-w-[280px]">
              {conversationTitle || 'Chat Baru'}
            </h1>
            <p className="text-[10px] text-zinc-500 font-medium">
              Powered by {AI_MODEL_NAME}
            </p>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-3.5">
        {/* Share to Group Button */}
        {messages.length > 0 && conversationId && (
          <ShareToGroupDialog 
            messages={messages} 
            conversationTitle={conversationTitle}
            conversationId={conversationId}
          />
        )}

        {/* Pro / Upgrade Indicator */}
        {isPro ? (
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-semibold select-none shadow-sm">
            <Crown className="w-3.5 h-3.5 shrink-0" />
            <span>PRO</span>
          </div>
        ) : (
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate('/upgrade')}
            className="text-amber-400 border-amber-500/30 bg-amber-500/[0.02] hover:bg-amber-500/10 hover:text-amber-300 hover:border-amber-500/40 rounded-xl text-xs font-medium h-9 px-3.5 transition-all duration-300"
          >
            <Crown className="w-3.5 h-3.5 mr-1.5 shrink-0" />
            Upgrade PRO
          </Button>
        )}
      </div>
    </header>
  );
};

export default ChatHeader;
