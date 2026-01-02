import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { X, Users, Crown, UserMinus, UserPlus } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

interface GroupMembersDialogProps {
  groupId: string;
  groupName: string;
  isOpen: boolean;
  onClose: () => void;
}

interface Member {
  id: string;
  user_id: string;
  role: string;
  joined_at: string;
  profiles: {
    display_name: string | null;
    email: string;
  };
}

const GroupMembersDialog: React.FC<GroupMembersDialogProps> = ({ 
  groupId, 
  groupName, 
  isOpen, 
  onClose 
}) => {
  const { profile } = useAuth();
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(false);
  const [groupCreator, setGroupCreator] = useState<string | null>(null);

  // Fetch group members
  const fetchMembers = async () => {
    if (!groupId) return;
    
    setLoading(true);
    try {
      // Get group creator
      const { data: groupData } = await supabase
        .from('groups')
        .select('created_by')
        .eq('id', groupId)
        .single();
      
      if (groupData) {
        setGroupCreator(groupData.created_by);
      }

      // Get group members with profiles
      const { data, error } = await supabase
        .from('group_members')
        .select(`
          *,
          profiles!group_members_user_id_fkey (
            display_name,
            email
          )
        `)
        .eq('group_id', groupId)
        .order('joined_at', { ascending: true });

      if (error) throw error;
      setMembers(data || []);
    } catch (error) {
      console.error('Error fetching members:', error);
      toast.error('Gagal memuat daftar member');
    } finally {
      setLoading(false);
    }
  };

  // Remove member from group
  const removeMember = async (memberId: string, memberUserId: string) => {
    if (!profile || profile.id !== groupCreator) {
      toast.error('Hanya admin yang bisa mengeluarkan member');
      return;
    }

    if (memberUserId === groupCreator) {
      toast.error('Tidak bisa mengeluarkan admin grup');
      return;
    }

    try {
      const { error } = await supabase
        .from('group_members')
        .delete()
        .eq('id', memberId);

      if (error) throw error;
      
      setMembers(prev => prev.filter(m => m.id !== memberId));
      toast.success('Member berhasil dikeluarkan');
    } catch (error) {
      console.error('Error removing member:', error);
      toast.error('Gagal mengeluarkan member');
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchMembers();
    }
  }, [isOpen, groupId]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100000] flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-zinc-900 border border-cyan-500/30 rounded-xl shadow-2xl w-full max-w-md mx-4 max-h-[80vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-zinc-700">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-cyan-500/20 rounded-lg">
              <Users className="w-5 h-5 text-cyan-400" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">Member Grup</h3>
              <p className="text-sm text-slate-400">{groupName}</p>
            </div>
          </div>
          <Button onClick={onClose} variant="ghost" size="icon" className="text-slate-400 hover:text-white">
            <X className="w-5 h-5" />
          </Button>
        </div>

        {/* Content */}
        <div className="p-4">
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-cyan-500"></div>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="flex items-center justify-between text-sm text-slate-400 mb-4">
                <span>{members.length} member</span>
                <span>Bergabung</span>
              </div>

              {members.map((member) => {
                const isCreator = member.user_id === groupCreator;
                const isMe = member.user_id === profile?.id;
                const canRemove = profile?.id === groupCreator && !isCreator && !isMe;
                
                return (
                  <div key={member.id} className="flex items-center justify-between p-3 bg-zinc-800/50 rounded-lg hover:bg-zinc-800 transition-colors">
                    <div className="flex items-center gap-3">
                      {/* Avatar */}
                      <div className="w-10 h-10 bg-gradient-to-br from-cyan-400 to-blue-500 rounded-full flex items-center justify-center text-white font-bold text-sm">
                        {(member.profiles.display_name || member.profiles.email)[0].toUpperCase()}
                      </div>
                      
                      {/* Info */}
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className="text-white font-medium">
                            {member.profiles.display_name || member.profiles.email.split('@')[0]}
                            {isMe && <span className="text-cyan-400 text-xs ml-1">(Anda)</span>}
                          </span>
                          {isCreator && (
                            <div className="flex items-center gap-1 px-2 py-0.5 bg-yellow-500/20 text-yellow-400 rounded-full text-xs">
                              <Crown className="w-3 h-3" />
                              Admin
                            </div>
                          )}
                        </div>
                        <p className="text-xs text-slate-400">
                          {new Date(member.joined_at).toLocaleDateString('id-ID', {
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric'
                          })}
                        </p>
                      </div>
                    </div>

                    {/* Actions */}
                    {canRemove && (
                      <Button
                        onClick={() => removeMember(member.id, member.user_id)}
                        size="sm"
                        variant="ghost"
                        className="text-red-400 hover:text-red-300 hover:bg-red-500/20"
                      >
                        <UserMinus className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                );
              })}

              {members.length === 0 && (
                <div className="text-center py-8 text-slate-400">
                  <Users className="w-12 h-12 mx-auto mb-3 opacity-50" />
                  <p>Belum ada member di grup ini</p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-zinc-700 bg-zinc-800/30">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Total: {members.length} member</span>
            {profile?.id === groupCreator && (
              <span className="flex items-center gap-1 text-yellow-400">
                <Crown className="w-3 h-3" />
                Anda adalah admin
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default GroupMembersDialog;