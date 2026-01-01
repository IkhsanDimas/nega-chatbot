import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';

export default function JoinGroup() {
  const { inviteCode } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [status, setStatus] = useState('Memproses undangan...');

  useEffect(() => {
    const joinGroup = async () => {
      if (!user || !inviteCode) {
         if (!user) navigate('/auth'); // Jika belum login, suruh login dulu
         return;
      }

      try {
        // 1. Cari Grup berdasarkan Kode
        const { data: group, error: groupError } = await supabase
          .from('groups').select('id, name').eq('invite_code', inviteCode).single();

        if (groupError || !group) throw new Error('Kode undangan tidak valid.');

        // 2. Cek apakah sudah member?
        const { data: existing } = await supabase
          .from('group_members').select('id').eq('group_id', group.id).eq('user_id', user.id).single();

        if (existing) {
          navigate(`/groups/${group.id}`); // Sudah member? Langsung masuk
          return;
        }

        // 3. Masukkan ke Grup
        const { error: joinError } = await supabase
          .from('group_members').insert({ group_id: group.id, user_id: user.id, role: 'member' });

        if (joinError) throw joinError;

        // 4. Kirim Notif ke Grup
        await supabase.from('group_messages').insert({
          group_id: group.id, user_id: user.id, content: 'telah bergabung melalui link! 🚀'
        });

        toast.success(`Berhasil bergabung ke ${group.name}`);
        navigate(`/groups/${group.id}`);

      } catch (error: any) {
        console.error(error);
        toast.error('Gagal bergabung: ' + error.message);
        navigate('/');
      }
    };

    joinGroup();
  }, [inviteCode, user, navigate]);

  return (
    <div className="h-screen w-screen flex flex-col items-center justify-center bg-[#020617] text-white gap-4">
      <Loader2 className="w-10 h-10 animate-spin text-cyan-500" />
      <p className="text-sm text-slate-400 font-mono animate-pulse">{status}</p>
    </div>
  );
}