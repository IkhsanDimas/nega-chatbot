import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Share, Users, Send, Check } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  file_url?: string;
  file_type?: string;
  created_at: string;
}

interface Group {
  id: string;
  name: string;
  invite_code: string;
}

interface ShareToGroupDialogProps {
  messages: Message[];
  conversationTitle?: string;
  conversationId?: string;
}

export function ShareToGroupDialog({ messages, conversationTitle, conversationId }: ShareToGroupDialogProps) {
  const [open, setOpen] = useState(false);
  const [groups, setGroups] = useState<Group[]>([]);
  const [selectedGroups, setSelectedGroups] = useState<Set<string>>(new Set());
  const [isLoading, setIsLoading] = useState(false);
  const [isSharing, setIsSharing] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    if (open && user) {
      fetchUserGroups();
    }
  }, [open, user]);

  const fetchUserGroups = async () => {
    setIsLoading(true);
    try {
      // Ambil grup yang user ikuti
      const { data: memberGroups, error } = await supabase
        .from('group_members')
        .select(`
          groups!inner (
            id,
            name,
            invite_code
          )
        `)
        .eq('user_id', user?.id);

      if (error) throw error;

      const groupList = memberGroups
        ?.map(mg => mg.groups)
        .filter(Boolean) as Group[];

      setGroups(groupList || []);
    } catch (error: any) {
      console.error('Error fetching groups:', error);
      toast.error('Gagal memuat daftar grup');
    } finally {
      setIsLoading(false);
    }
  };

  const toggleGroupSelection = (groupId: string) => {
    const newSelection = new Set(selectedGroups);
    if (newSelection.has(groupId)) {
      newSelection.delete(groupId);
    } else {
      newSelection.add(groupId);
    }
    setSelectedGroups(newSelection);
  };

  const formatChatForSharing = () => {
    if (messages.length === 0) return '';

    const title = conversationTitle || 'Chat dengan AI';
    const timestamp = new Date().toLocaleString('id-ID');
    
    let formattedChat = `📋 **${title}**\n`;
    formattedChat += `🕒 Dibagikan pada: ${timestamp}\n\n`;
    formattedChat += `--- PERCAKAPAN ---\n\n`;

    messages.forEach((msg, index) => {
      const role = msg.role === 'user' ? '👤 **User**' : '🤖 **AI**';
      formattedChat += `${role}:\n${msg.content}\n\n`;
      
      // Tambahkan info file jika ada
      if (msg.file_url) {
        const fileType = msg.file_type?.split('/')[0] || 'file';
        formattedChat += `📎 *[${fileType} attachment]*\n\n`;
      }
    });

    formattedChat += `--- AKHIR PERCAKAPAN ---\n`;
    formattedChat += `💬 Ingin chat dengan AI juga? Kunjungi: https://nega-chatbot.vercel.app`;

    return formattedChat;
  };

  const shareToGroups = async () => {
    if (selectedGroups.size === 0) {
      toast.error('Pilih minimal satu grup untuk dibagikan');
      return;
    }

    setIsSharing(true);
    try {
      // 1. Buat shared link dari conversation
      if (!conversationId) {
        toast.error('Tidak ada percakapan untuk dibagikan');
        return;
      }

      // 2. Update conversation menjadi shared
      const { error: updateError } = await supabase
        .from('conversations')
        .update({ 
          is_shared: true,
          share_link: `${window.location.origin}/shared/${conversationId}`
        })
        .eq('id', conversationId);

      if (updateError) throw updateError;

      // 3. Format pesan untuk grup dengan link interaktif
      const title = conversationTitle || 'Chat dengan AI';
      const timestamp = new Date().toLocaleString('id-ID');
      const shareLink = `${window.location.origin}/shared/${conversationId}`;
      
      const shareMessage = `🤖 **${title}**\n\n` +
        `💬 Percakapan dengan AI telah dibagikan!\n` +
        `🕒 ${timestamp}\n\n` +
        `👀 **Klik link di bawah untuk melihat percakapan lengkap:**\n` +
        `🔗 ${shareLink}\n\n` +
        `✨ Anda bisa melihat seluruh chat history dan diskusi bersama!\n` +
        `💡 Ingin chat dengan AI juga? Daftar gratis di Nega Chatbot!`;

      // 4. Kirim ke semua grup yang dipilih
      const sharePromises = Array.from(selectedGroups).map(groupId =>
        supabase.from('group_messages').insert({
          group_id: groupId,
          user_id: user?.id,
          content: shareMessage,
          role: 'user'
        })
      );

      await Promise.all(sharePromises);

      toast.success(`Chat berhasil dibagikan ke ${selectedGroups.size} grup!`);
      setOpen(false);
      setSelectedGroups(new Set());
    } catch (error: any) {
      console.error('Error sharing to groups:', error);
      toast.error('Gagal membagikan chat ke grup');
    } finally {
      setIsSharing(false);
    }
  };

  if (messages.length === 0) {
    return null; // Tidak tampilkan tombol jika tidak ada pesan
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="gap-2 text-muted-foreground hover:text-foreground"
        >
          <Share className="w-4 h-4" />
          Bagikan ke Grup
        </Button>
      </DialogTrigger>
      
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Users className="w-5 h-5" />
            Bagikan Chat ke Grup
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Bagikan link percakapan ini ke grup. Member grup bisa melihat seluruh chat history dan berdiskusi bersama!
          </p>

          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin w-6 h-6 border-2 border-primary border-t-transparent rounded-full" />
            </div>
          ) : groups.length === 0 ? (
            <div className="text-center py-8">
              <Users className="w-12 h-12 mx-auto text-muted-foreground mb-2" />
              <p className="text-sm text-muted-foreground">
                Anda belum bergabung dengan grup manapun
              </p>
            </div>
          ) : (
            <div className="space-y-2 max-h-60 overflow-y-auto">
              {groups.map((group) => (
                <div
                  key={group.id}
                  onClick={() => toggleGroupSelection(group.id)}
                  className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${
                    selectedGroups.has(group.id)
                      ? 'bg-primary/10 border-primary'
                      : 'hover:bg-muted border-border'
                  }`}
                >
                  <div className={`w-5 h-5 rounded border-2 flex items-center justify-center ${
                    selectedGroups.has(group.id)
                      ? 'bg-primary border-primary'
                      : 'border-muted-foreground'
                  }`}>
                    {selectedGroups.has(group.id) && (
                      <Check className="w-3 h-3 text-primary-foreground" />
                    )}
                  </div>
                  <div className="flex-1">
                    <p className="font-medium">{group.name}</p>
                    <p className="text-xs text-muted-foreground">
                      Kode: {group.invite_code}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}

          {groups.length > 0 && (
            <div className="flex gap-2 pt-4 border-t">
              <Button
                variant="outline"
                onClick={() => setOpen(false)}
                className="flex-1"
              >
                Batal
              </Button>
              <Button
                onClick={shareToGroups}
                disabled={selectedGroups.size === 0 || isSharing}
                className="flex-1 gap-2"
              >
                {isSharing ? (
                  <div className="w-4 h-4 animate-spin border-2 border-current border-t-transparent rounded-full" />
                ) : (
                  <Send className="w-4 h-4" />
                )}
                Bagikan ({selectedGroups.size})
              </Button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}