import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Bot, Mail, Key, ArrowLeft, Loader2, Phone, Github } from 'lucide-react';
import { PhoneInput } from '@/components/PhoneInput';
import { z } from 'zod';

const emailSchema = z.string().email('Email tidak valid');

const Auth = () => {
  const navigate = useNavigate();
  const { user, loading } = useAuth();
  const { toast } = useToast();
  
  const [loginMethod, setLoginMethod] = useState<'email' | 'phone' | 'github'>('email');
  const [step, setStep] = useState<'input' | 'otp'>('input');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
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
    if (loginMethod === 'email') {
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
    }

    if (loginMethod === 'phone' && phone.length < 10) {
      toast({
        title: 'Nomor HP tidak valid',
        description: 'Silakan masukkan nomor HP yang benar.',
        variant: 'destructive',
      });
      return;
    }

    setIsLoading(true);
    try {
      if (loginMethod === 'email') {
        const { error } = await supabase.auth.signInWithOtp({
          email: email,
          options: {
            shouldCreateUser: true,
          },
        });
        if (error) throw error;
        
        toast({
          title: 'OTP Terkirim!',
          description: 'Silakan cek email Anda untuk kode verifikasi 6 digit.',
        });
      } else if (loginMethod === 'phone') {
        // Phone OTP - Note: Requires Twilio setup in Supabase
        const fullPhone = `+62${phone}`;
        const { error } = await supabase.auth.signInWithOtp({
          phone: fullPhone,
          options: {
            shouldCreateUser: true,
          },
        });
        if (error) throw error;
        
        toast({
          title: 'SMS OTP Terkirim!',
          description: `Kode verifikasi telah dikirim ke +62${phone}`,
        });
      }

      setStep('otp');
      setCountdown(60);
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

  const handleGitHubLogin = async () => {
    setIsLoading(true);
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'github',
        options: {
          redirectTo: `${window.location.origin}/chat`,
        },
      });

      if (error) throw error;

      toast({
        title: 'Mengarahkan ke GitHub...',
        description: 'Anda akan diarahkan ke halaman login GitHub.',
      });
    } catch (error: any) {
      console.error('GitHub login error:', error);
      toast({
        title: 'Gagal login dengan GitHub',
        description: error.message || 'Terjadi kesalahan. Coba lagi.',
        variant: 'destructive',
      });
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
      let error;
      
      if (loginMethod === 'email') {
        const result = await supabase.auth.verifyOtp({
          email: email,
          token: otp,
          type: 'email',
        });
        error = result.error;
      } else if (loginMethod === 'phone') {
        const fullPhone = `+62${phone}`;
        const result = await supabase.auth.verifyOtp({
          phone: fullPhone,
          token: otp,
          type: 'sms',
        });
        error = result.error;
      }

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

          {step === 'input' ? (
            <>
              <h2 className="text-xl font-semibold text-center mb-2">Masuk ke Nega</h2>
              <p className="text-sm text-muted-foreground text-center mb-8">
                Pilih metode login yang Anda inginkan
              </p>

              {/* Login Method Tabs */}
              <div className="flex rounded-lg bg-muted p-1 mb-6">
                <button
                  onClick={() => setLoginMethod('email')}
                  className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-md text-sm font-medium transition-colors ${
                    loginMethod === 'email' 
                      ? 'bg-background text-foreground shadow-sm' 
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  <Mail className="w-4 h-4" />
                  Email
                </button>
                <button
                  onClick={() => setLoginMethod('phone')}
                  className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-md text-sm font-medium transition-colors ${
                    loginMethod === 'phone' 
                      ? 'bg-background text-foreground shadow-sm' 
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  <Phone className="w-4 h-4" />
                  HP
                </button>
                <button
                  onClick={() => handleGitHubLogin()}
                  disabled={isLoading}
                  className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-md text-sm font-medium transition-colors text-muted-foreground hover:text-foreground`}
                >
                  <Github className="w-4 h-4" />
                  GitHub
                </button>
              </div>

              <div className="space-y-4">
                {loginMethod === 'email' ? (
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
                ) : (
                  <PhoneInput
                    value={phone}
                    onChange={setPhone}
                    disabled={isLoading}
                  />
                )}

                <Button
                  onClick={handleSendOtp}
                  disabled={isLoading || (loginMethod === 'email' ? !email : !phone)}
                  className="w-full h-12 gradient-primary text-primary-foreground hover:opacity-90"
                >
                  {isLoading ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    `Kirim Kode ${loginMethod === 'email' ? 'Email' : 'SMS'}`
                  )}
                </Button>
              </div>
            </>
          ) : (
            <>
              <h2 className="text-xl font-semibold text-center mb-2">Verifikasi OTP</h2>
              <p className="text-sm text-muted-foreground text-center mb-8">
                Masukkan 6 digit kode yang dikirim ke<br />
                <span className="text-foreground font-medium">
                  {loginMethod === 'email' ? email : `+62${phone}`}
                </span>
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
                  onClick={() => setStep('input')}
                  className="w-full text-muted-foreground"
                >
                  Ganti metode login
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