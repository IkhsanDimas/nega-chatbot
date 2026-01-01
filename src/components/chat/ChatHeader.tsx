import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Menu, Crown, Sparkles } from 'lucide-react';

interface ChatHeaderProps {
  isSidebarOpen: boolean;
  onToggleSidebar: () => void;
  conversationTitle?: string;
  remainingPrompts: number;
  isPro: boolean;
}

const ChatHeader = ({
  isSidebarOpen,
  onToggleSidebar,
  conversationTitle,
  remainingPrompts,
  isPro,
}: ChatHeaderProps) => {
  const navigate = useNavigate();

  return (
    <header className="h-16 border-b border-border flex items-center justify-between px-4 bg-card/50 backdrop-blur-sm">
      <div className="flex items-center gap-3">
        {!isSidebarOpen && (
          <Button
            variant="ghost"
            size="icon"
            onClick={onToggleSidebar}
            className="text-muted-foreground hover:text-foreground"
          >
            <Menu className="w-5 h-5" />
          </Button>
        )}
        
        <div className="flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-primary" />
          <h1 className="font-medium text-foreground">
            {conversationTitle || 'Nega'}
          </h1>
        </div>
      </div>

      <div className="flex items-center gap-4">
        {/* Quota Display */}
        {isPro ? (
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-accent/10 text-accent text-sm">
            <Crown className="w-4 h-4" />
            <span className="font-medium">PRO</span>
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <div className="text-sm text-muted-foreground">
              <span className="font-medium text-foreground">{remainingPrompts}</span>
              <span>/12 prompt</span>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate('/upgrade')}
              className="text-accent border-accent/50 hover:bg-accent/10"
            >
              <Crown className="w-3.5 h-3.5 mr-1" />
              Upgrade
            </Button>
          </div>
        )}
      </div>
    </header>
  );
};

export default ChatHeader;
