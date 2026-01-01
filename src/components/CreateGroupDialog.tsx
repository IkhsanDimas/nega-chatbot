import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Plus, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

export function CreateGroupDialog() {
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const { user } = useAuth();

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !user) return;
    setLoading(true);

    try {
      // 1. Buat Kode Unik
      const code = Math.random().toString(36).substring(2, 10);

      // 2. Simpan ke Database (PERBAIKAN: Menambahkan created_by)
      const { data: group, error: groupError } = await supabase
        .from('groups')
        .insert({ 
          name: name, 
          invite_code: code,
          created_by: user.id // <--- INI YANG SEBELUMNYA KURANG
        })
        .select()
        .single();

      if (groupError) throw groupError;

      // 3. Masukkan Pembuat sebagai Admin
      const { error: memberError } = await supabase
        .from('group_members')
        .insert({ group_id: group.id, user_id: user.id, role: 'admin' });

      if (memberError) throw memberError;

      toast.success('Grup berhasil dibuat!');
      setName('');
      setOpen(false);
      
    } catch (error: any) {
      console.error(error);
      toast.error('Gagal membuat grup: ' + (error.message || 'Error tidak diketahui'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {/* Tombol Plus Kecil di Sidebar */}
        <Button variant="ghost" size="icon" className="h-6 w-6 hover:bg-white/20 text-cyan-400" title="Buat Grup Baru">
          <Plus className="w-4 h-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="bg-[#0f172a] border-white/10 text-white sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Buat Grup Baru</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleCreate} className="space-y-4 mt-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-400">Nama Grup</label>
            <Input 
              placeholder="Contoh: Tim Project A..." 
              value={name} 
              onChange={(e) => setName(e.target.value)} 
              className="bg-slate-900 border-white/10 text-white focus-visible:ring-cyan-500"
            />
          </div>
          <Button type="submit" disabled={loading} className="w-full bg-cyan-500 hover:bg-cyan-600 text-black font-bold">
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Buat Grup'}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}