import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { 
  ArrowLeft, 
  Crown, 
  Check, 
  Zap, 
  MessageSquare, 
  Mic, 
  Upload,
  Shield,
  Clock
} from 'lucide-react';

const Upgrade = () => {
  const navigate = useNavigate();
  const { profile } = useAuth();

  const handlePayment = () => {
    // Open DANA payment link
    window.open(
      'https://link.dana.id/minta?full_url=https://qr.dana.id/v1/281012092025122932958522',
      '_blank'
    );
  };

  const isPro = profile?.subscription_type === 'pro';
  const endDate = profile?.subscription_end_date 
    ? new Date(profile.subscription_end_date).toLocaleDateString('id-ID', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      })
    : null;

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0 pointer-events-none z-0">
        <div className="absolute top-1/4 left-1/4 w-[400px] h-[400px] bg-accent/8 rounded-full blur-[140px] animate-pulse-slow" />
        <div className="absolute bottom-1/4 right-1/4 w-[350px] h-[350px] bg-primary/8 rounded-full blur-[140px] animate-pulse-slow" />
      </div>

      <div className="relative z-10 container mx-auto px-4 py-8 max-w-4xl animate-fade-in">
        {/* Back Button */}
        <Button
          variant="ghost"
          onClick={() => navigate('/chat')}
          className="mb-8 text-zinc-400 hover:text-white hover:bg-white/5 rounded-2xl transition-all duration-300"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Kembali ke Chat
        </Button>

        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-3xl bg-gradient-to-br from-amber-400 via-yellow-500 to-orange-500 shadow-xl shadow-amber-500/15 mb-6 animate-bounce-subtle">
            <Crown className="w-10 h-10 text-zinc-950" />
          </div>
          <h1 className="text-4xl md:text-5xl font-extrabold mb-4 text-white tracking-tight">
            {isPro ? 'Anda Sudah PRO!' : 'Upgrade ke PRO'}
          </h1>
          <p className="text-zinc-400 text-lg max-w-md mx-auto font-medium leading-relaxed">
            {isPro 
              ? `Masa aktif hingga ${endDate}`
              : 'Nikmati akses tanpa batas ke semua fitur asisten Nega'}
          </p>
        </div>

        {/* Current Status (for PRO users) */}
        {isPro && (
          <div className="relative rounded-3xl border border-amber-500/20 bg-amber-500/5 p-6 mb-8 shadow-lg shadow-amber-500/5 backdrop-blur-xl">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center shadow-md">
                <Shield className="w-6 h-6 text-zinc-950" />
              </div>
              <div>
                <h3 className="font-bold text-lg text-white">Status: PRO Aktif</h3>
                <p className="text-zinc-400 text-sm mt-0.5 font-medium">
                  Berakhir pada {endDate}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Pricing Card */}
        {!isPro && (
          <div className="relative rounded-3xl border border-amber-500/20 bg-slate-950/40 backdrop-blur-2xl p-8 md:p-10 mb-10 shadow-2xl shadow-black/80 overflow-hidden">
            {/* Glow border */}
            <div className="absolute top-0 left-0 right-0 h-[1.5px] bg-gradient-to-r from-transparent via-amber-500/40 to-transparent" />
            
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 mb-8">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-xs font-extrabold text-amber-400 uppercase tracking-widest bg-amber-500/10 px-2.5 py-1 rounded-md">
                    Paket PRO
                  </span>
                </div>
                <div className="flex items-baseline gap-2 mt-3">
                  <span className="text-5xl font-black text-white">Rp 60.000</span>
                  <span className="text-zinc-500 font-semibold text-lg">/3 bulan</span>
                </div>
                <p className="text-zinc-400 mt-3 font-medium text-sm">
                  Hanya Rp 20.000/bulan • Pembayaran instan via DANA
                </p>
              </div>
              
              <button
                onClick={handlePayment}
                className="bg-gradient-to-r from-amber-400 via-yellow-500 to-orange-500 hover:opacity-95 text-zinc-950 font-black px-8 py-4.5 text-lg rounded-xl shadow-lg shadow-amber-500/10 transition-all duration-300 w-full md:w-auto hover:scale-[1.02] active:scale-[0.98]"
              >
                Bayar Sekarang
              </button>
            </div>

            <div className="border-t border-white/5 pt-8">
              <h3 className="font-bold text-white mb-6 text-base uppercase tracking-wider">Semua yang Anda dapatkan:</h3>
              <div className="grid md:grid-cols-2 gap-5">
                <FeatureItem icon={<MessageSquare className="w-5 h-5" />} text="Chat tanpa batas prompt" />
                <FeatureItem icon={<Zap className="w-5 h-5" />} text="Respon prioritas lebih cepat" />
                <FeatureItem icon={<Upload className="w-5 h-5" />} text="Upload file tanpa batasan" />
                <FeatureItem icon={<Mic className="w-5 h-5" />} text="Voice chat dengan Ainya" />
                <FeatureItem icon={<Clock className="w-5 h-5" />} text="Akses 3 bulan penuh" />
                <FeatureItem icon={<Shield className="w-5 h-5" />} text="Fitur premium eksklusif" />
              </div>
            </div>
          </div>
        )}

        {/* Comparison */}
        <div className="grid md:grid-cols-2 gap-6">
          <div className="relative rounded-2xl bg-slate-950/20 backdrop-blur-xl p-6 border border-white/5 shadow-md">
            <h3 className="text-lg font-bold text-white mb-5">Paket Gratis</h3>
            <ul className="space-y-3.5">
              <CompareItem included={true} text="Chat AI Teks Standar" />
              <CompareItem included={true} text="Upload file dasar (PDF & Gambar)" />
              <CompareItem included={true} text="Riwayat chat tersimpan" />
              <CompareItem included={false} text="Voice chat dengan Ainya" />
              <CompareItem included={false} text="Prioritas respon AI (Lebih cepat)" />
            </ul>
          </div>

          <div className="relative rounded-2xl bg-slate-950/30 backdrop-blur-xl p-6 border border-amber-500/20 shadow-lg shadow-amber-500/5">
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-lg font-bold text-white">Paket PRO</h3>
              <span className="px-2.5 py-1 text-[9px] font-extrabold uppercase tracking-wider rounded-md bg-amber-500/10 text-amber-400">
                POPULER
              </span>
            </div>
            <ul className="space-y-3.5">
              <CompareItem included={true} text="Chat AI Teks Prioritas" highlight />
              <CompareItem included={true} text="Upload semua jenis file tanpa batasan" highlight />
              <CompareItem included={true} text="Riwayat chat tersimpan" />
              <CompareItem included={true} text="Voice chat dengan Ainya" highlight />
              <CompareItem included={true} text="Prioritas respon AI maksimal" highlight />
              <CompareItem included={true} text="Akses penuh 3 bulan (90 hari)" />
            </ul>
          </div>
        </div>

        {/* Payment Instructions */}
        {!isPro && (
          <div className="mt-14 text-center">
            <h3 className="font-bold text-white mb-5 uppercase tracking-wider text-sm">Cara Pembayaran</h3>
            <div className="relative rounded-2xl bg-slate-950/20 backdrop-blur-xl p-6 max-w-md mx-auto text-left border border-white/5 shadow-md">
              <ol className="space-y-4 text-sm text-zinc-400 font-medium">
                <li className="flex gap-3">
                  <span className="w-6 h-6 rounded-full bg-cyan-500/10 text-cyan-400 flex items-center justify-center text-xs font-bold shrink-0">1</span>
                  <span>Klik tombol "Bayar Sekarang" di atas</span>
                </li>
                <li className="flex gap-3">
                  <span className="w-6 h-6 rounded-full bg-cyan-500/10 text-cyan-400 flex items-center justify-center text-xs font-bold shrink-0">2</span>
                  <span>Selesaikan pembayaran via aplikasi DANA</span>
                </li>
                <li className="flex gap-3">
                  <span className="w-6 h-6 rounded-full bg-cyan-500/10 text-cyan-400 flex items-center justify-center text-xs font-bold shrink-0">3</span>
                  <span>Kirimkan bukti transfer & email Anda ke support@nega.id untuk diaktifkan oleh admin (maks. 10 menit)</span>
                </li>
              </ol>
            </div>
            <p className="text-xs text-zinc-600 mt-5 font-semibold">
              Butuh bantuan? Hubungi support@nega.id
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

const FeatureItem = ({ icon, text }: { icon: React.ReactNode; text: string }) => (
  <div className="flex items-center gap-3">
    <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
      {icon}
    </div>
    <span className="text-foreground">{text}</span>
  </div>
);

const CompareItem = ({ included, text, highlight }: { included: boolean; text: string; highlight?: boolean }) => (
  <li className="flex items-center gap-3">
    {included ? (
      <div className={`w-5 h-5 rounded-full flex items-center justify-center ${highlight ? 'bg-primary text-primary-foreground' : 'bg-primary/20 text-primary'}`}>
        <Check className="w-3 h-3" />
      </div>
    ) : (
      <div className="w-5 h-5 rounded-full bg-muted flex items-center justify-center">
        <span className="text-muted-foreground text-xs">✕</span>
      </div>
    )}
    <span className={included ? 'text-foreground' : 'text-muted-foreground'}>{text}</span>
  </li>
);

export default Upgrade;
