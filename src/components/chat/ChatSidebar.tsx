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
        "fixed md:static inset-y-0 left-0 z-50 w-66 bg-[#070913] border-r border-white/5 flex flex-col transition-transform duration-300 ease-in-out transform",
        isOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0 md:w-0 md:hidden"
      )}>
        
        {/* Brand Header */}
        <div className="p-5 flex items-center justify-between border-b border-white/5 bg-[#070913]">
          <div className="flex items-center gap-3 font-extrabold text-white">
            <div className="w-9 h-9 bg-gradient-to-br from-cyan-400 via-blue-500 to-indigo-600 rounded-xl flex items-center justify-center text-white text-base font-black shadow-md shadow-cyan-500/25 group-hover:scale-105 transition-transform duration-300">N</div>
            <span className="tracking-tight text-base font-extrabold bg-gradient-to-r from-white to-zinc-400 bg-clip-text text-transparent">Nega Chatbot</span>
          </div>
          <Button variant="ghost" size="icon" onClick={onToggle} className="md:hidden text-zinc-400 hover:text-white hover:bg-white/5 rounded-xl">
            <X className="w-5 h-5" />
          </Button>
        </div>

        {/* New Chat Action */}
        <div className="p-4">
          <Button 
            onClick={onNewChat} 
            className="w-full bg-gradient-to-r from-cyan-500 via-blue-500 to-indigo-600 hover:opacity-90 text-white font-bold rounded-xl gap-2 shadow-lg shadow-cyan-500/10 hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 border border-cyan-400/20"
          >
            <Plus className="w-4 h-4" /> Chat Baru
          </Button>
        </div>

        <ScrollArea className="flex-1 px-3 scrollbar-thin">
          {/* Conversation History List */}
          <div className="mb-8 mt-2">
            <p className="px-3 text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-3 select-none">Riwayat Chat</p>
            <div className="space-y-1">
              {conversations.length === 0 && (
                <div className="px-4 py-8 text-center border border-dashed border-white/5 rounded-2xl select-none">
                  <p className="text-xs text-zinc-600 font-medium">Belum ada riwayat</p>
                </div>
              )}
              
              {conversations.map((chat) => {
                const isActive = currentConversationId === chat.id;

                return (
                  <div
                    key={chat.id}
                    className={cn(
                      "group flex items-center justify-between p-2.5 rounded-xl transition-all cursor-pointer border relative overflow-hidden",
                      isActive 
                        ? "bg-cyan-500/5 border-cyan-500/20 shadow-[inset_0_1px_0_0_rgba(6,182,212,0.1)] text-cyan-200" 
                        : "hover:bg-white/[0.02] border-transparent text-zinc-400"
                    )}
                    onClick={() => onNavigate(chat.id)}
                  >
                    {/* Active Left Indicator Strip */}
                    <div className={cn(
                      "absolute left-0 top-1/4 bottom-1/4 w-1 rounded-r bg-cyan-500 transition-opacity duration-300",
                      isActive ? "opacity-100" : "opacity-0"
                    )} />

                    <div className="flex items-center gap-3 min-w-0 overflow-hidden pl-1">
                      <MessageSquare className={cn("w-4 h-4 shrink-0 transition-colors", isActive ? "text-cyan-400" : "text-zinc-600 group-hover:text-zinc-400")} />
                      <span className={cn("truncate text-sm font-semibold transition-colors", isActive ? "text-cyan-200" : "text-zinc-400 group-hover:text-zinc-200")}>
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
                  <span className="truncate text-sm font-semibold">{grp.name}</span>
                </div>
              ))}
            </div>
          </div>
        </ScrollArea>

        {/* User Account / Status Footer */}
        <div className="p-4 border-t border-white/5 bg-[#070913] shrink-0">
          <div className={cn(
            "flex items-center justify-between gap-2.5 p-2.5 rounded-2xl border transition-all duration-300",
            isPro ? "bg-amber-500/5 border-amber-500/20 shadow-lg shadow-amber-500/5" : "bg-white/[0.01] border-white/5"
          )}>
            
            <div className="flex items-center gap-3 min-w-0 overflow-hidden">
              <div className={cn(
                "w-9 h-9 rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0 shadow-md",
                isPro 
                  ? "bg-gradient-to-tr from-amber-400 via-yellow-500 to-orange-500 shadow-lg text-black font-black" 
                  : "bg-gradient-to-tr from-cyan-500 to-indigo-600 font-bold"
              )}>
                {isPro ? <Crown className="w-4 h-4 text-zinc-950" /> : user?.email?.charAt(0).toUpperCase()}
              </div>
              
              <div className="flex-1 min-w-0">
                <p className="text-xs font-bold text-white truncate leading-none">{user?.email?.split('@')[0]}</p>
                <p className="text-[10px] text-zinc-500 truncate mt-1 leading-none font-medium">{user?.email}</p>
                
                <div className="flex items-center gap-1.5 mt-2">
                  <div className={cn(
                    "w-1.5 h-1.5 rounded-full animate-pulse",
                    isPro ? "bg-amber-400 shadow-[0_0_8px_rgba(245,158,11,0.6)]" : "bg-zinc-500"
                  )} />
                  <p className={cn(
                    "text-[8px] font-extrabold uppercase tracking-wider",
                    isPro ? "text-amber-400" : "text-zinc-500"
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