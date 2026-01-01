import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { UserPlus, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

export function AddMemberDialog({ groupId, groupName, inviteCode }: { groupId: string, groupName: string, inviteCode?: string }) {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);

  const handleAddMember = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    setLoading(true);

    try {
      const { data: userData, error: userError } = await supabase
        .from('profiles').select('id').eq('email', email.trim()).single();

      if (userError || !userData) throw new Error('User tidak ditemukan.');

      const { error: insertError } = await supabase
        .from('group_members').insert({ group_id: groupId, user_id: userData.id, role: 'member' });

      if (insertError) throw insertError;

      toast.success('Berhasil menambahkan anggota!');
      setEmail('');
      setOpen(false);
    } catch (error: any) {
      toast.error(error.message || 'Gagal menambahkan');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon" className="text-white hover:bg-white/10" title="Tambah Manual">
          <UserPlus className="w-5 h-5" />
        </Button>
      </DialogTrigger>
      <DialogContent className="bg-[#0f172a] border-white/10 text-white sm:max-w-md">
        <DialogHeader><DialogTitle>Tambah Anggota Manual</DialogTitle></DialogHeader>
        <form onSubmit={handleAddMember} className="space-y-3 mt-4">
          <Input placeholder="Email user..." value={email} onChange={(e) => setEmail(e.target.value)} className="bg-slate-900 border-white/10"/>
          <Button type="submit" disabled={loading} className="w-full bg-cyan-500 hover:bg-cyan-600 text-black">
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Tambahkan'}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}