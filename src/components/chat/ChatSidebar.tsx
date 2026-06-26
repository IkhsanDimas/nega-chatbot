import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { MessageSquare, Plus, Trash2, Hash, X, LogOut, Crown } from 'lucide-react';
import { cn } from '@/lib/utils';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { CreateGroupDialog } from '@/components/CreateGroupDialog'; 

interface Conversation {
  id: string;
  title: string;
  created_at: string;
  updated_at: string;
}

interface ChatSidebarProps {
  conversations: Conversation[];
  currentConversationId?: string;
  isOpen: boolean;
  onToggle: () => void;
  onNewChat: () => void;
  onDeleteConversation: (id: string) => void;
  onNavigate: (id: string) => void;
}

const ChatSidebar = ({
  conversations,
  currentConversationId,
  isOpen,
  onToggle,
  onNewChat,
  onDeleteConversation,
  onNavigate,
}: ChatSidebarProps) => {
  const { user, profile } = useAuth(); 
  const navigate = useNavigate();
  const [groups, setGroups] = useState<any[]>([]);

  const isPro = profile?.subscription_type === 'pro';

  useEffect(() => {
    if (!user) return;
    const fetchGroups = async () => {
      const { data: grps } = await supabase
        .from('group_members')
        .select('groups(id, name)')
        .eq('user_id', user.id);
      
      if (grps) setGroups(grps.map(g => g.groups));
    };

    fetchGroups();
    
    const channel = supabase.channel('sidebar-groups')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'group_members' }, fetchGroups)
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [user]);

  const handleDeleteClick = (e: React.MouseEvent, id: string, title: string) => {
    e.preventDefault();
    e.stopPropagation();
    if (window.confirm(`Hapus percakapan "${title || 'Baru'}"?`)) {
      onDeleteConversation(id);
    }
  };

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      navigate('/auth');
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

  return (
    <>
      {isOpen && (
        <div className="fixed inset-0 bg-black/60 z-40 md:hidden backdrop-blur-sm transition-opacity duration-300" onClick={onToggle} />
      )}

      <div className={cn(
        "fixed md:static inset-y-0 left-0 z-50 w-64 bg-[#030712] border-r border-white/5 flex flex-col transition-transform duration-300 ease-in-out transform",
        isOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0 md:w-0 md:hidden"
      )}>
        
        {/* Brand Header */}
        <div className="p-5 flex items-center justify-between border-b border-white/5 bg-[#030712]">
          <div className="flex items-center gap-3 font-extrabold text-white">
            <div className="w-8 h-8 bg-gradient-to-br from-cyan-400 to-blue-600 rounded-lg flex items-center justify-center text-white text-sm shadow-md shadow-cyan-500/10">N</div>
            <span className="tracking-tight text-base font-bold">Nega Chatbot</span>
          </div>
          <Button variant="ghost" size="icon" onClick={onToggle} className="md:hidden text-zinc-400 hover:text-white hover:bg-white/5 rounded-xl">
            <X className="w-5 h-5" />
          </Button>
        </div>

        {/* New Chat Action */}
        <div className="p-4">
          <Button 
            onClick={onNewChat} 
            className="w-full bg-cyan-500 hover:bg-cyan-400 text-black font-semibold rounded-xl gap-2 shadow-lg shadow-cyan-500/5 hover:scale-[1.01] active:scale-[0.99] transition-all"
          >
            <Plus className="w-4 h-4" /> Chat Baru
          </Button>
        </div>

        <ScrollArea className="flex-1 px-3">
          {/* Conversation History List */}
          <div className="mb-8 mt-2">
            <p className="px-3 text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-3 select-none">Riwayat Chat</p>
            <div className="space-y-1">
              {conversations.length === 0 && (
                <div className="px-4 py-8 text-center border border-dashed border-white/5 rounded-2xl select-none">
                  <p className="text-xs text-zinc-600">Belum ada riwayat</p>
                </div>
              )}
              
              {conversations.map((chat) => {
                const isActive = currentConversationId === chat.id;

                return (
                  <div
                    key={chat.id}
                    className={cn(
                      "group flex items-center justify-between p-2.5 rounded-xl transition-all cursor-pointer border border-transparent",
                      isActive ? "bg-cyan-950/20 border-cyan-500/10" : "hover:bg-white/[0.02]"
                    )}
                    onClick={() => onNavigate(chat.id)}
                  >
                    <div className="flex items-center gap-3 min-w-0 overflow-hidden">
                      <MessageSquare className={cn("w-4 h-4 shrink-0", isActive ? "text-cyan-400" : "text-zinc-600")} />
                      <span className={cn("truncate text-sm font-medium", isActive ? "text-cyan-100" : "text-zinc-400")}>
                        {chat.title || 'Percakapan Baru'}
                      </span>
                    </div>

                    {isActive && (
                      <button
                        onClick={(e) => handleDeleteClick(e, chat.id, chat.title)}
                        className="w-7 h-7 flex items-center justify-center text-zinc-500 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors z-20"
                        title="Hapus Chat"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Group Chat List */}
          <div className="mb-6">
            <div className="flex items-center justify-between px-3 mb-3">
              <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest select-none">Grup Chat</p>
              <CreateGroupDialog />
            </div>
            <div className="space-y-1">
              {groups.map((grp: any) => (
                <div 
                  key={grp.id}
                  onClick={() => navigate(`/groups/${grp.id}`)}
                  className="flex items-center gap-3 p-2.5 rounded-xl cursor-pointer text-zinc-400 hover:bg-white/[0.02] hover:text-white transition-all border border-transparent"
                >
                  <Hash className="w-4 h-4 text-zinc-600 shrink-0" />
                  <span className="truncate text-sm font-medium">{grp.name}</span>
                </div>
              ))}
            </div>
          </div>
        </ScrollArea>

        {/* User Account / Status Footer */}
        <div className="p-4 border-t border-white/5 bg-[#030712] shrink-0">
          <div className={cn(
            "flex items-center justify-between gap-2.5 p-2.5 rounded-2xl border transition-colors",
            isPro ? "bg-cyan-950/10 border-cyan-500/10 animate-pulse-slow" : "bg-white/[0.01] border-white/5"
          )}>
            
            <div className="flex items-center gap-3 min-w-0 overflow-hidden">
              <div className={cn(
                "w-9 h-9 rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0 shadow-md",
                isPro ? "bg-gradient-to-tr from-yellow-400 to-amber-600 shadow-lg shadow-yellow-500/10 text-black" : "bg-gradient-to-tr from-cyan-500 to-blue-600"
              )}>
                {isPro ? <Crown className="w-4 h-4 text-zinc-950" /> : user?.email?.charAt(0).toUpperCase()}
              </div>
              
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold text-white truncate leading-none">{user?.email?.split('@')[0]}</p>
                <p className="text-[10px] text-zinc-500 truncate mt-0.5 leading-none">{user?.email}</p>
                
                <div className="flex items-center gap-1.5 mt-1.5">
                  <div className={cn(
                    "w-1.5 h-1.5 rounded-full animate-pulse",
                    isPro ? "bg-yellow-400 shadow-[0_0_8px_rgba(250,204,21,0.6)]" : "bg-zinc-500"
                  )} />
                  <p className={cn(
                    "text-[8px] font-extrabold uppercase tracking-wider",
                    isPro ? "text-yellow-400" : "text-zinc-500"
                  )}>
                    {isPro ? 'PRO' : 'FREE'}
                  </p>
                </div>
              </div>
            </div>

            <Button 
              onClick={handleLogout}
              variant="ghost" 
              size="icon" 
              className="text-zinc-500 hover:text-red-400 hover:bg-red-500/10 shrink-0 rounded-lg h-8 w-8"
              title="Keluar"
            >
              <LogOut className="w-4 h-4" />
            </Button>

          </div>
        </div>
      </div>
    </>
  );
};

export default ChatSidebar;