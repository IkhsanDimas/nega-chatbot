import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Bot, Mail, Key, ArrowLeft, Loader2 } from 'lucide-react';
import { z } from 'zod';

const emailSchema = z.string().email('Email tidak valid');

const Auth = () => {
  const navigate = useNavigate();
  const { user, loading } = useAuth();
  const { toast } = useToast();
  
  const [step, setStep] = useState<'email' | 'otp'>('email');
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [countdown, setCountdown] = useState(0);

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
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-accent/10 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 w-full max-w-md">
        <Button
          variant="ghost"
          className="mb-8 text-muted-foreground hover:text-foreground"
          onClick={() => navigate('/')}
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Kembali
        </Button>

        <div className="glass-strong rounded-3xl p-8 animate-scale-in">
          <div className="flex items-center justify-center gap-3 mb-8">
            <div className="w-14 h-14 rounded-2xl gradient-primary flex items-center justify-center glow-primary">
              <Bot className="w-8 h-8 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-foreground">Nega</h1>
              <p className="text-xs text-muted-foreground">AI Chatbot Indonesia</p>
            </div>
          </div>

          {step === 'email' ? (
            <>
              <h2 className="text-xl font-semibold text-center mb-2">Masuk ke Nega</h2>
              <p className="text-sm text-muted-foreground text-center mb-8">
                Masukkan email Anda untuk menerima kode OTP
              </p>

              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                    <Input
                      id="email"
                      type="email"
                      placeholder="nama@email.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="pl-10 h-12 bg-input border-border focus:border-primary"
                      onKeyDown={(e) => e.key === 'Enter' && handleSendOtp()}
                    />
                  </div>
                </div>

                <Button
                  onClick={handleSendOtp}
                  disabled={isLoading || !email}
                  className="w-full h-12 gradient-primary text-primary-foreground hover:opacity-90"
                >
                  {isLoading ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    'Kirim Kode OTP'
                  )}
                </Button>
              </div>
            </>
          ) : (
            <>
              <h2 className="text-xl font-semibold text-center mb-2">Verifikasi OTP</h2>
              <p className="text-sm text-muted-foreground text-center mb-8">
                Masukkan 6 digit kode yang dikirim ke<br />
                <span className="text-foreground font-medium">{email}</span>
              </p>

              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="otp">Kode OTP</Label>
                  <div className="relative">
                    <Key className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                    <Input
                      id="otp"
                      type="text"
                      placeholder="000000"
                      value={otp}
                      onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                      className="pl-10 h-12 bg-input border-border focus:border-primary text-center text-2xl tracking-widest"
                      maxLength={6}
                      onKeyDown={(e) => e.key === 'Enter' && handleVerifyOtp()}
                    />
                  </div>
                </div>

                <Button
                  onClick={handleVerifyOtp}
                  disabled={isLoading || otp.length !== 6}
                  className="w-full h-12 gradient-primary text-primary-foreground hover:opacity-90"
                >
                  {isLoading ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    'Verifikasi'
                  )}
                </Button>

                <div className="text-center">
                  <Button
                    variant="ghost"
                    onClick={() => {
                      if (countdown === 0) {
                        handleSendOtp();
                      }
                    }}
                    disabled={countdown > 0}
                    className="text-sm text-muted-foreground hover:text-foreground"
                  >
                    {countdown > 0 ? (
                      `Kirim ulang dalam ${countdown}s`
                    ) : (
                      'Kirim ulang kode'
                    )}
                  </Button>
                </div>

                <Button
                  variant="ghost"
                  onClick={() => setStep('email')}
                  className="w-full text-muted-foreground"
                >
                  Ganti email
                </Button>
              </div>
            </>
          )}
        </div>

        <p className="text-center text-xs text-muted-foreground mt-6">
          Hanya untuk pengguna di Indonesia
        </p>
      </div>
    </div>
  );
};

export default Auth;