import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { MessageSquare, Plus, Trash2, Hash, X, LogOut, Crown } from 'lucide-react'; // Saya tambah icon Crown (Mahkota) untuk Pro
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
  // AMBIL DATA PROFILE DI SINI
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
        <div className="fixed inset-0 bg-black/80 z-40 md:hidden" onClick={onToggle} />
      )}

      <div className={cn(
        "fixed md:static inset-y-0 left-0 z-50 w-64 bg-[#020617] border-r border-white/10 flex flex-col transition-transform duration-300 ease-in-out transform",
        isOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0 md:w-0 md:hidden"
      )}>
        
        {/* Header */}
        <div className="p-4 flex items-center justify-between border-b border-white/10 bg-[#020617]">
          <div className="flex items-center gap-2 font-bold text-white">
            <div className="w-8 h-8 bg-cyan-500 rounded-lg flex items-center justify-center text-black">AI</div>
            <span className="tracking-tight">Nega Chatbot</span>
          </div>
          <Button variant="ghost" size="icon" onClick={onToggle} className="md:hidden text-white hover:bg-white/10">
            <X className="w-5 h-5" />
          </Button>
        </div>

        {/* Tombol Chat Baru */}
        <div className="p-4">
          <Button onClick={onNewChat} className="w-full bg-cyan-500 hover:bg-cyan-600 text-black font-bold gap-2 shadow-lg shadow-cyan-500/20">
            <Plus className="w-4 h-4" /> Chat Baru
          </Button>
        </div>

        <ScrollArea className="flex-1 px-3">
          
          {/* Riwayat Chat */}
          <div className="mb-8 mt-2">
            <p className="px-3 text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-3">Riwayat Chat</p>
            <div className="space-y-2">
              {conversations.length === 0 && (
                <div className="px-4 py-8 text-center border border-dashed border-white/10 rounded-xl">
                  <p className="text-xs text-slate-500">Belum ada riwayat</p>
                </div>
              )}
              
              {conversations.map((chat) => {
                const isActive = currentConversationId === chat.id;

                return (
                  <div
                    key={chat.id}
                    className={cn(
                      "grid gap-2 items-center p-2 rounded-xl border transition-all cursor-pointer",
                      isActive ? "grid-cols-[1fr_auto] bg-cyan-950/40 border-cyan-500/30" : "grid-cols-[1fr] hover:bg-white/5 border-transparent"
                    )}
                    onClick={() => onNavigate(chat.id)}
                  >
                    <div className="flex items-center gap-2 min-w-0 overflow-hidden">
                      <MessageSquare className={cn("w-4 h-4 shrink-0", isActive ? "text-cyan-400" : "text-slate-600")} />
                      <span className={cn("truncate text-sm font-medium", isActive ? "text-cyan-100" : "text-slate-400")}>
                        {chat.title || 'Percakapan Baru'}
                      </span>
                    </div>

                    {isActive && (
                      <button
                        onClick={(e) => handleDeleteClick(e, chat.id, chat.title)}
                        className="w-8 h-8 flex items-center justify-center bg-red-500/20 text-red-500 hover:bg-red-600 hover:text-white rounded-lg transition-colors z-20 animate-in fade-in zoom-in duration-300"
                        title="Hapus Chat Ini"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Grup Chat */}
          <div className="mb-6">
            <div className="flex items-center justify-between px-2 mb-2">
              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Grup Chat</p>
              <CreateGroupDialog />
            </div>
            <div className="space-y-1">
              {groups.map((grp: any) => (
                <div 
                  key={grp.id}
                  onClick={() => navigate(`/groups/${grp.id}`)}
                  className="flex items-center gap-3 p-3 rounded-xl cursor-pointer text-slate-400 hover:bg-white/5 hover:text-white transition-all"
                >
                  <Hash className="w-4 h-4 text-slate-600 shrink-0" />
                  <span className="truncate text-sm font-medium">{grp.name}</span>
                </div>
              ))}
            </div>
          </div>
        </ScrollArea>

        {/* Footer User & Status */}
        <div className="p-4 border-t border-white/10 bg-[#020617] shrink-0">
          <div className={cn(
            "flex items-center justify-between gap-2 p-2 rounded-xl border transition-colors",
            isPro ? "bg-cyan-950/20 border-cyan-500/20" : "bg-white/5 border-white/5"
          )}>
            
            <div className="flex items-center gap-3 min-w-0 overflow-hidden">
              <div className={cn(
                "w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0",
                isPro ? "bg-gradient-to-tr from-yellow-400 to-orange-500 shadow-lg shadow-orange-500/20" : "bg-gradient-to-tr from-cyan-500 to-blue-600"
              )}>
                {isPro ? <Crown className="w-4 h-4 text-black" /> : user?.email?.charAt(0).toUpperCase()}
              </div>
              
              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium text-white truncate">{user?.email}</p>
                
                {/* --- BAGIAN STATUS DI SINI --- */}
                <div className="flex items-center gap-1.5 mt-0.5">
                  <div className={cn(
                    "w-2 h-2 rounded-full animate-pulse",
                    isPro ? "bg-yellow-400 shadow-[0_0_8px_rgba(250,204,21,0.6)]" : "bg-slate-500"
                  )} />
                  <p className={cn(
                    "text-[10px] font-bold uppercase tracking-wider",
                    isPro ? "text-yellow-400" : "text-slate-500"
                  )}>
                    {isPro ? 'PRO' : 'FREE'}
                  </p>
                </div>
                {/* ----------------------------- */}

              </div>
            </div>

            <Button 
              onClick={handleLogout}
              variant="ghost" 
              size="icon" 
              className="text-slate-500 hover:text-red-400 hover:bg-red-500/10 shrink-0"
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