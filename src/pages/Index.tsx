import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Bot, MessageSquare, Zap, Shield, ArrowRight, Sparkles } from 'lucide-react';

const Index = () => {
  const navigate = useNavigate();
  const { user, loading } = useAuth();

  useEffect(() => {
    if (user && !loading) {
      navigate('/chat');
    }
  }, [user, loading, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-spin w-8 h-8 border-2 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background overflow-hidden">
      {/* Background Effects */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl animate-pulse-slow" />
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-accent/10 rounded-full blur-3xl animate-pulse-slow" style={{ animationDelay: '2s' }} />
      </div>

      {/* Header */}
      <header className="relative z-10 container mx-auto px-4 py-6">
        <nav className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-xl gradient-primary flex items-center justify-center glow-primary">
              <Bot className="w-6 h-6 text-primary-foreground" />
            </div>
            <span className="text-xl font-bold text-foreground">Nega</span>
          </div>
          <Button
            onClick={() => navigate('/auth')}
            className="gradient-primary text-primary-foreground hover:opacity-90 transition-opacity"
          >
            Masuk
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </nav>
      </header>

      {/* Hero Section */}
      <main className="relative z-10 container mx-auto px-4 pt-20 pb-32">
        <div className="text-center max-w-4xl mx-auto">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass mb-8 animate-fade-in">
            <Sparkles className="w-4 h-4 text-accent" />
            <span className="text-sm text-muted-foreground">AI Chatbot Terbaik untuk Indonesia</span>
          </div>
          
          <h1 className="text-5xl md:text-7xl font-bold mb-6 animate-fade-in-up">
            <span className="text-foreground">Kenalkan </span>
            <span className="text-gradient">Ainya</span>
            <span className="text-foreground">,</span>
            <br />
            <span className="text-foreground">AI Asisten Anda</span>
          </h1>
          
          <p className="text-lg md:text-xl text-muted-foreground mb-12 max-w-2xl mx-auto animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
            Nega adalah platform AI chatbot yang cerdas, responsif, dan siap membantu Anda 
            dalam berbagai tugas dengan kemampuan multimodal yang canggih.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-fade-in-up" style={{ animationDelay: '0.4s' }}>
            <Button
              size="lg"
              onClick={() => navigate('/auth')}
              className="gradient-primary text-primary-foreground hover:opacity-90 transition-all text-lg px-8 py-6 glow-primary"
            >
              Mulai Gratis
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
            <Button
              size="lg"
              variant="outline"
              onClick={() => navigate('/auth')}
              className="border-border hover:bg-secondary text-lg px-8 py-6"
            >
              Pelajari Lebih Lanjut
            </Button>
          </div>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-3 gap-6 mt-32 max-w-5xl mx-auto">
          <FeatureCard
            icon={<MessageSquare className="w-6 h-6" />}
            title="Chat Cerdas"
            description="Percakapan natural dengan AI yang memahami konteks dan memberikan jawaban detail."
            delay="0.1s"
          />
          <FeatureCard
            icon={<Zap className="w-6 h-6" />}
            title="Multimodal"
            description="Upload gambar, PDF, atau dokumen untuk dianalisis oleh Ainya dengan cepat."
            delay="0.2s"
          />
          <FeatureCard
            icon={<Shield className="w-6 h-6" />}
            title="Aman & Privat"
            description="Data Anda terlindungi dengan enkripsi dan tidak dibagikan ke pihak manapun."
            delay="0.3s"
          />
        </div>

        {/* Pricing Preview */}
        <div className="mt-32 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Pilih Paket yang Sesuai
          </h2>
          <p className="text-muted-foreground mb-12 max-w-xl mx-auto">
            Mulai gratis dengan 12 prompt per hari, atau upgrade ke PRO untuk akses tanpa batas.
          </p>
          
          <div className="grid md:grid-cols-2 gap-6 max-w-3xl mx-auto">
            <PricingCard
              title="Gratis"
              price="Rp 0"
              features={['12 prompt per 24 jam', 'Chat dengan AI Ainya', 'Akses dasar']}
              isPopular={false}
            />
            <PricingCard
              title="PRO"
              price="Rp 60.000"
              period="/3 bulan"
              features={['Prompt tanpa batas', 'Voice chat', 'Upload semua jenis file', 'Prioritas respon']}
              isPopular={true}
            />
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 border-t border-border py-8">
        <div className="container mx-auto px-4 text-center text-muted-foreground text-sm">
          <p>© 2024 Nega. Hanya untuk pengguna di Indonesia.</p>
        </div>
      </footer>
    </div>
  );
};

const FeatureCard = ({ icon, title, description, delay }: { icon: React.ReactNode; title: string; description: string; delay: string }) => (
  <div 
    className="glass rounded-2xl p-6 animate-fade-in-up hover:border-primary/30 transition-colors"
    style={{ animationDelay: delay }}
  >
    <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary mb-4">
      {icon}
    </div>
    <h3 className="text-lg font-semibold mb-2">{title}</h3>
    <p className="text-muted-foreground text-sm">{description}</p>
  </div>
);

const PricingCard = ({ title, price, period, features, isPopular }: { title: string; price: string; period?: string; features: string[]; isPopular: boolean }) => (
  <div className={`rounded-2xl p-6 ${isPopular ? 'gradient-primary glow-primary' : 'glass'}`}>
    {isPopular && (
      <div className="text-xs font-medium uppercase tracking-wider mb-4 text-primary-foreground/80">
        Paling Populer
      </div>
    )}
    <h3 className={`text-xl font-bold mb-2 ${isPopular ? 'text-primary-foreground' : 'text-foreground'}`}>
      {title}
    </h3>
    <div className={`text-3xl font-bold mb-6 ${isPopular ? 'text-primary-foreground' : 'text-foreground'}`}>
      {price}
      {period && <span className="text-base font-normal opacity-80">{period}</span>}
    </div>
    <ul className="space-y-3">
      {features.map((feature, i) => (
        <li key={i} className={`flex items-center gap-2 text-sm ${isPopular ? 'text-primary-foreground/90' : 'text-muted-foreground'}`}>
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
          {feature}
        </li>
      ))}
    </ul>
  </div>
);

export default Index;
