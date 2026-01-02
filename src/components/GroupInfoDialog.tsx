import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Share2, Copy, Check, MessageCircle, MoreHorizontal } from 'lucide-react';
import { toast } from 'sonner';

export function GroupInfoDialog({ groupId, groupName, inviteCode }: { groupId: string, groupName: string, inviteCode?: string }) {
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  const link = inviteCode ? `${window.location.origin}/join/${inviteCode}` : '';
  const shareText = `Halo! Bergabunglah dengan grup "${groupName}" di Nega Chatbot: ${link}`;

  // Debug log untuk memastikan data tersedia
  console.log('GroupInfoDialog - inviteCode:', inviteCode);
  console.log('GroupInfoDialog - link:', link);

  // FUNGSI UTAMA: Mencoba Share System, jika gagal maka Salin Link
  const handleSmartShare = async () => {
    if (!link) {
      toast.error('Link tidak tersedia untuk dibagikan');
      return;
    }

    if (navigator.share) {
      try {
        await navigator.share({
          title: `Grup ${groupName}`,
          text: shareText,
          url: link,
        });
        toast.success('Menu berbagi dibuka!');
      } catch (err: any) {
        // Jika user membatalkan, jangan tampilkan error
        if (err.name !== 'AbortError') {
          console.log('Share error:', err);
          // Fallback ke copy
          copyToClipboard();
        }
      }
    } else {
      // JIKA DI LAPTOP (Fallback)
      copyToClipboard();
    }
  };

  const copyToClipboard = async () => {
    if (!link) {
      toast.error('Link tidak tersedia untuk disalin');
      return;
    }
    
    try {
      await navigator.clipboard.writeText(link);
      setCopied(true);
      toast.success('Link grup berhasil disalin ke clipboard!');
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      // Fallback untuk browser yang tidak support clipboard API
      try {
        const textArea = document.createElement('textarea');
        textArea.value = link;
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
        setCopied(true);
        toast.success('Link grup berhasil disalin!');
        setTimeout(() => setCopied(false), 2000);
      } catch (fallbackErr) {
        toast.error('Gagal menyalin link. Silakan salin manual.');
        console.error('Copy failed:', fallbackErr);
      }
    }
  };

  const shareWA = () => {
    if (!link) {
      toast.error('Link tidak tersedia untuk dibagikan');
      return;
    }
    
    try {
      const waUrl = `https://wa.me/?text=${encodeURIComponent(shareText)}`;
      window.open(waUrl, '_blank');
      toast.success('WhatsApp dibuka!');
    } catch (err) {
      toast.error('Gagal membuka WhatsApp');
      console.error('WhatsApp share failed:', err);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm" className="text-cyan-400 hover:bg-cyan-500/10 gap-2 font-bold text-[10px]">
          <Share2 className="w-4 h-4" /> BAGIKAN
        </Button>
      </DialogTrigger>
      
      <DialogContent className="bg-white text-slate-900 sm:max-w-[320px] rounded-3xl p-6 border-none shadow-2xl">
        <DialogHeader className="mb-4">
          <DialogTitle className="text-center text-slate-800 text-lg font-bold">Bagikan Grup</DialogTitle>
        </DialogHeader>
        
        {!inviteCode ? (
          <div className="text-center py-8">
            <p className="text-slate-600 text-sm">Kode undangan tidak tersedia. Silakan coba lagi nanti.</p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-3 gap-y-6 gap-x-2 justify-items-center">
              {/* Tombol WhatsApp: Berfungsi di Laptop & HP */}
              <button onClick={shareWA} className="flex flex-col items-center gap-2 group outline-none">
                <div className="w-14 h-14 rounded-full bg-[#25D366] flex items-center justify-center text-white shadow-md group-hover:scale-110 transition-transform">
                  <MessageCircle className="w-7 h-7 fill-current" />
                </div>
                <span className="text-[11px] font-medium text-slate-600">WhatsApp</span>
              </button>

              {/* Tombol Salin: Berfungsi di Laptop & HP */}
              <button onClick={copyToClipboard} className="flex flex-col items-center gap-2 group outline-none">
                <div className={`w-14 h-14 rounded-full flex items-center justify-center text-white shadow-md group-hover:scale-110 transition-transform ${copied ? 'bg-slate-800' : 'bg-blue-500'}`}>
                  {copied ? <Check className="w-7 h-7" /> : <Copy className="w-6 h-6" />}
                </div>
                <span className="text-[11px] font-medium text-slate-600">{copied ? 'Disalin' : 'Salin Link'}</span>
              </button>

              {/* Tombol System (Ini yang akan muncul seperti gambar Facebook/Android di HP) */}
              <button onClick={handleSmartShare} className="flex flex-col items-center gap-2 group outline-none">
                <div className="w-14 h-14 rounded-full bg-slate-200 flex items-center justify-center text-slate-600 shadow-md group-hover:scale-110 transition-transform border border-slate-300">
                  <MoreHorizontal className="w-7 h-7" />
                </div>
                <span className="text-[11px] font-medium text-slate-600">Lainnya</span>
              </button>
            </div>

            <div className="mt-8 p-3 bg-slate-100 rounded-2xl border border-slate-200 flex items-center gap-2 overflow-hidden">
              <p className="text-[9px] text-slate-400 truncate font-mono flex-1" title={link}>{link}</p>
              <Button 
                onClick={copyToClipboard} 
                size="sm" 
                variant="ghost" 
                className="h-6 px-2 text-[8px] text-slate-500 hover:text-slate-700"
              >
                {copied ? 'Disalin!' : 'Salin'}
              </Button>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}