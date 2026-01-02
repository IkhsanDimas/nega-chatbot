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
    <div className="min-h-screen bg-background">
      {/* Background Effects */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-accent/10 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-primary/10 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 container mx-auto px-4 py-8 max-w-4xl">
        {/* Back Button */}
        <Button
          variant="ghost"
          onClick={() => navigate('/chat')}
          className="mb-8 text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Kembali ke Chat
        </Button>

        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full gradient-accent glow-accent mb-6">
            <Crown className="w-10 h-10 text-accent-foreground" />
          </div>
          <h1 className="text-4xl font-bold mb-4">
            {isPro ? 'Anda Sudah PRO!' : 'Upgrade ke PRO'}
          </h1>
          <p className="text-muted-foreground text-lg max-w-md mx-auto">
            {isPro 
              ? `Masa aktif hingga ${endDate}`
              : 'Nikmati akses tanpa batas ke semua fitur Nega'}
          </p>
        </div>

        {/* Current Status (for PRO users) */}
        {isPro && (
          <div className="glass rounded-2xl p-6 mb-8 border-accent/30">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl gradient-accent flex items-center justify-center">
                <Shield className="w-6 h-6 text-accent-foreground" />
              </div>
              <div>
                <h3 className="font-semibold text-lg">Status: PRO Aktif</h3>
                <p className="text-muted-foreground">
                  Berakhir pada {endDate}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Pricing Card */}
        {!isPro && (
          <div className="glass-strong rounded-3xl p-8 mb-8 border-primary/30">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 mb-8">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-sm font-medium text-accent uppercase tracking-wider">
                    Paket PRO
                  </span>
                </div>
                <div className="flex items-baseline gap-2">
                  <span className="text-5xl font-bold text-foreground">Rp 60.000</span>
                  <span className="text-muted-foreground">/3 bulan</span>
                </div>
                <p className="text-muted-foreground mt-2">
                  Hanya Rp 60.000/bulan • Pembayaran via DANA
                </p>
              </div>
              
              <Button
                size="lg"
                onClick={handlePayment}
                className="gradient-primary text-primary-foreground hover:opacity-90 px-8 py-6 text-lg glow-primary w-full md:w-auto"
              >
                Bayar Sekarang
              </Button>
            </div>

            <div className="border-t border-border pt-8">
              <h3 className="font-semibold mb-6">Semua yang Anda dapatkan:</h3>
              <div className="grid md:grid-cols-2 gap-4">
                <FeatureItem icon={<MessageSquare />} text="Chat tanpa batas prompt" />
                <FeatureItem icon={<Zap />} text="Respon prioritas lebih cepat" />
                <FeatureItem icon={<Upload />} text="Upload file tanpa batasan" />
                <FeatureItem icon={<Mic />} text="Voice chat dengan Ainya" />
                <FeatureItem icon={<Clock />} text="Akses 3 bulan penuh" />
                <FeatureItem icon={<Shield />} text="Fitur premium eksklusif" />
              </div>
            </div>
          </div>
        )}

        {/* Comparison */}
        <div className="grid md:grid-cols-2 gap-6">
          <div className="glass rounded-2xl p-6">
            <h3 className="text-lg font-semibold mb-4">Paket Gratis</h3>
            <ul className="space-y-3">
              <CompareItem included={true} text="12 prompt per 24 jam" />
              <CompareItem included={true} text="Upload file dasar" />
              <CompareItem included={true} text="Riwayat chat tersimpan" />
              <CompareItem included={false} text="Chat tanpa batas" />
              <CompareItem included={false} text="Voice chat" />
              <CompareItem included={false} text="Prioritas respon" />
            </ul>
          </div>

          <div className="glass rounded-2xl p-6 border-primary/30">
            <div className="flex items-center gap-2 mb-4">
              <h3 className="text-lg font-semibold">Paket PRO</h3>
              <span className="px-2 py-0.5 text-xs font-medium rounded-full gradient-primary text-primary-foreground">
                POPULER
              </span>
            </div>
            <ul className="space-y-3">
              <CompareItem included={true} text="Chat tanpa batas prompt" highlight />
              <CompareItem included={true} text="Upload semua jenis file" highlight />
              <CompareItem included={true} text="Riwayat chat tersimpan" />
              <CompareItem included={true} text="Voice chat dengan Ainya" highlight />
              <CompareItem included={true} text="Prioritas respon" highlight />
              <CompareItem included={true} text="Akses 90 hari" />
            </ul>
          </div>
        </div>

        {/* Payment Instructions */}
        {!isPro && (
          <div className="mt-12 text-center">
            <h3 className="font-semibold mb-4">Cara Pembayaran</h3>
            <div className="glass rounded-2xl p-6 max-w-md mx-auto text-left">
              <ol className="space-y-3 text-sm text-muted-foreground">
                <li className="flex gap-3">
                  <span className="w-6 h-6 rounded-full bg-primary/20 text-primary flex items-center justify-center text-xs font-medium shrink-0">1</span>
                  <span>Klik tombol "Bayar Sekarang" di atas</span>
                </li>
                <li className="flex gap-3">
                  <span className="w-6 h-6 rounded-full bg-primary/20 text-primary flex items-center justify-center text-xs font-medium shrink-0">2</span>
                  <span>Anda akan diarahkan ke DANA untuk pembayaran</span>
                </li>
                <li className="flex gap-3">
                  <span className="w-6 h-6 rounded-full bg-primary/20 text-primary flex items-center justify-center text-xs font-medium shrink-0">3</span>
                  <span>Setelah pembayaran berhasil, akun akan langsung di-upgrade ke PRO</span>
                </li>
              </ol>
            </div>
            <p className="text-xs text-muted-foreground mt-4">
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
