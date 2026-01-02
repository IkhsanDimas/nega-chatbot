import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

export function TestGroupShare() {
  const [testResult, setTestResult] = useState<string>('');

  const testGroupSharing = async () => {
    try {
      // Test 1: Ambil group pertama yang ada
      const { data: groups, error: groupsError } = await supabase
        .from('groups')
        .select('id, name, invite_code')
        .limit(1);

      if (groupsError) throw groupsError;

      if (!groups || groups.length === 0) {
        setTestResult('❌ Tidak ada group untuk ditest. Buat group dulu.');
        return;
      }

      const group = groups[0];
      console.log('Test group:', group);

      // Test 2: Cek apakah invite_code ada
      if (!group.invite_code) {
        setTestResult('❌ Group tidak memiliki invite_code');
        return;
      }

      // Test 3: Generate link
      const link = `${window.location.origin}/join/${group.invite_code}`;
      
      setTestResult(`✅ Test berhasil!
Group: ${group.name}
Invite Code: ${group.invite_code}
Link: ${link}`);

      toast.success('Test sharing berhasil!');

    } catch (error: any) {
      console.error('Test error:', error);
      setTestResult(`❌ Test gagal: ${error.message}`);
      toast.error('Test gagal');
    }
  };

  return (
    <div className="p-4 bg-slate-900 rounded-lg border border-white/10">
      <h3 className="text-white font-bold mb-2">Test Group Sharing</h3>
      <Button onClick={testGroupSharing} className="mb-4">
        Test Sharing
      </Button>
      {testResult && (
        <pre className="text-xs text-slate-300 bg-slate-800 p-2 rounded whitespace-pre-wrap">
          {testResult}
        </pre>
      )}
    </div>
  );
}