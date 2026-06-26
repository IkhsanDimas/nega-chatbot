import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Bot, Mail, Key, ArrowLeft, Loader2, Sparkles } from 'lucide-react';
import { z } from 'zod';

const emailSchema = z.string().email('Email tidak valid');

const GoogleIcon = () => (
  <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" fill="#FBBC05"/>
    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
  </svg>
);

const Auth = () => {
  const navigate = useNavigate();
  const { user, loading } = useAuth();
  const { toast } = useToast();
  
  const [step, setStep] = useState<'email' | 'otp'>('email');
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [countdown, setCountdown] = useState(0);

  const handleGoogleLogin = async () => {
    setIsLoading(true);
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/chat`,
        },
      });
      if (error) throw error;
    } catch (error: any) {
      console.error('Google Login Error:', error);
      toast({
        title: 'Gagal masuk dengan Google',
        description: error.message || 'Terjadi kesalahan. Coba lagi.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (user && !loading) {
      navigate('/chat');
    }
  }, [user, loading, navigate]);

  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  const handleSendOtp = async () => {
    try {
      emailSchema.parse(email);
    } catch {
      toast({
        title: 'Email tidak valid',
        description: 'Silakan masukkan alamat email yang benar.',
        variant: 'destructive',
      });
      return;
    }

    setIsLoading(true);
    try {
      const { error } = await supabase.auth.signInWithOtp({
        email: email,
        options: {
          shouldCreateUser: true,
        },
      });

      if (error) throw error;

      setStep('otp');
      setCountdown(60);
      toast({
        title: 'OTP Terkirim!',
        description: 'Silakan cek email Anda untuk kode verifikasi 6 digit.',
      });
    } catch (error: any) {
      console.error('OTP error:', error);
      toast({
        title: 'Gagal mengirim OTP',
        description: error.message || 'Terjadi kesalahan. Coba lagi.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyOtp = async () => {
    if (otp.length !== 6) {
      toast({
        title: 'Kode OTP tidak valid',
        description: 'Masukkan 6 digit kode OTP.',
        variant: 'destructive',
      });
      return;
    }

    setIsLoading(true);
    try {
      const { error } = await supabase.auth.verifyOtp({
        email: email,
        token: otp,
        type: 'email',
      });

      if (error) throw error;

      toast({
        title: 'Berhasil masuk!',
        description: 'Selamat datang di Nega.',
      });
      navigate('/chat');
    } catch (error: any) {
      console.error('Verify OTP error:', error);
      toast({
        title: 'Verifikasi gagal',
        description: error.message || 'Kode OTP salah atau sudah kadaluarsa.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-spin w-8 h-8 border-2 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#030712] flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background Glowing Ambient Orbs */}
      <div className="absolute inset-0 pointer-events-none z-0">
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-primary/10 rounded-full blur-[120px] animate-pulse-slow" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-accent/10 rounded-full blur-[120px] animate-pulse-slow" style={{ animationDelay: '2s' }} />
      </div>

      <div className="relative z-10 w-full max-w-[420px]">
        {/* Back Button with subtle style */}
        <Button
          variant="ghost"
          className="mb-6 text-zinc-400 hover:text-white hover:bg-white/5 rounded-2xl transition-all duration-200"
          onClick={() => navigate('/')}
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Kembali ke Beranda
        </Button>

        {/* Premium Auth Card Container */}
        <div className="relative rounded-3xl border border-white/5 bg-slate-950/40 backdrop-blur-2xl p-8 shadow-2xl shadow-black/50 overflow-hidden">
          {/* Card Top Border Glow Effect */}
          <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-primary/30 to-transparent" />

          {/* Logo & Header */}
          <div className="flex flex-col items-center mb-8">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary to-accent flex items-center justify-center shadow-lg shadow-primary/20 relative group mb-4">
              <Bot className="w-8 h-8 text-white relative z-10" />
              <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-primary to-accent opacity-0 group-hover:opacity-100 transition-opacity blur duration-500" />
            </div>
            <h1 className="text-2xl font-bold text-white tracking-tight">Selamat Datang di Nega</h1>
            <p className="text-sm text-zinc-400 mt-1">AI Chatbot & Asisten Cerdas Indonesia</p>
          </div>

          {step === 'email' ? (
            <div className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-zinc-300 font-medium text-xs uppercase tracking-wider">Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-zinc-400" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="name@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-10.5 h-12 bg-white/[0.03] border-white/10 hover:border-white/20 focus-visible:ring-1 focus-visible:ring-primary/50 focus-visible:border-primary/50 text-white rounded-xl placeholder:text-zinc-500 transition-all"
                    onKeyDown={(e) => e.key === 'Enter' && handleSendOtp()}
                  />
                </div>
              </div>

              <Button
                onClick={handleSendOtp}
                disabled={isLoading || !email}
                className="w-full h-12 gradient-primary text-primary-foreground hover:opacity-95 rounded-xl font-semibold shadow-lg shadow-primary/10 transition-all active:scale-[0.98]"
              >
                {isLoading ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <span className="flex items-center gap-2">
                    Lanjutkan dengan Email
                    <Sparkles className="w-4 h-4" />
                  </span>
                )}
              </Button>

              {/* Separator */}
              <div className="relative py-2">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t border-white/[0.06]" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-transparent px-3 text-zinc-500 font-medium tracking-widest text-[10px]">atau</span>
                </div>
              </div>

              {/* Elegant Premium Google Button */}
              <Button
                type="button"
                variant="outline"
                onClick={handleGoogleLogin}
                disabled={isLoading}
                className="w-full h-12 border-white/10 bg-white/[0.02] text-zinc-200 hover:bg-white/5 hover:text-white hover:border-white/20 hover:scale-[1.01] active:scale-[0.99] transition-all duration-300 rounded-xl gap-3 font-medium"
              >
                <GoogleIcon />
                Masuk dengan Google
              </Button>
            </div>
          ) : (
            <div className="space-y-5">
              <div className="text-center mb-6">
                <p className="text-sm text-zinc-400">
                  Masukkan 6 digit kode OTP yang kami kirimkan ke email:<br />
                  <span className="text-white font-semibold mt-1 inline-block border-b border-primary/20 pb-0.5">{email}</span>
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="otp" className="text-zinc-300 font-medium text-xs uppercase tracking-wider">Kode OTP</Label>
                <div className="relative">
                  <Key className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-zinc-400" />
                  <Input
                    id="otp"
                    type="text"
                    placeholder="000000"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                    className="pl-10.5 h-12 bg-white/[0.03] border-white/10 hover:border-white/20 focus-visible:ring-1 focus-visible:ring-primary/50 focus-visible:border-primary/50 text-white text-center text-xl tracking-[0.4em] font-mono rounded-xl placeholder:text-zinc-600 transition-all"
                    maxLength={6}
                    onKeyDown={(e) => e.key === 'Enter' && handleVerifyOtp()}
                  />
                </div>
              </div>

              <Button
                onClick={handleVerifyOtp}
                disabled={isLoading || otp.length !== 6}
                className="w-full h-12 gradient-primary text-primary-foreground hover:opacity-95 rounded-xl font-semibold shadow-lg shadow-primary/10 transition-all active:scale-[0.98]"
              >
                {isLoading ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  'Verifikasi & Masuk'
                )}
              </Button>

              <div className="flex flex-col items-center gap-2 pt-2">
                <Button
                  variant="ghost"
                  onClick={() => countdown === 0 && handleSendOtp()}
                  disabled={countdown > 0}
                  className="text-xs text-zinc-400 hover:text-white hover:bg-white/5 transition-all h-9 rounded-lg"
                >
                  {countdown > 0 ? (
                    `Kirim ulang kode dalam ${countdown}s`
                  ) : (
                    'Kirim ulang kode OTP'
                  )}
                </Button>

                <Button
                  variant="ghost"
                  onClick={() => setStep('email')}
                  className="text-xs text-zinc-500 hover:text-zinc-300 hover:bg-white/5 transition-all h-9 rounded-lg"
                >
                  Ganti email tujuan
                </Button>
              </div>
            </div>
          )}
        </div>

        <p className="text-center text-[10px] text-zinc-500 mt-6 tracking-wide">
          Dengan melanjutkan, Anda menyetujui Ketentuan Layanan. Hanya untuk pengguna di Indonesia.
        </p>
      </div>
    </div>
  );
};

export default Auth;