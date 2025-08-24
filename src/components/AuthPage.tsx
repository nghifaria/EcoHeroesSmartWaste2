import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Eye, EyeOff, Leaf } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import heroImage from '@/assets/hero-image.jpg';
import { supabase } from '@/integrations/supabase/client'; // Pastikan import ini ada

interface AuthPageProps {
  onAuthSuccess: () => void;
}

export const AuthPage: React.FC<AuthPageProps> = ({ onAuthSuccess }) => {
  const [activeTab, setActiveTab] = useState('signin');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  // Sign In Form State
  const [signInData, setSignInData] = useState({
    phone: '', // Di Supabase, kita akan menggunakan email, tapi kita bisa sesuaikan
    email: '', // Tambahkan ini untuk login
    password: ''
  });

  // Sign Up Form State
  const [signUpData, setSignUpData] = useState({
    fullName: '',
    email: '', // Gunakan email untuk pendaftaran
    rtRw: '',
    password: '',
    confirmPassword: ''
  });

  const mockRtOptions = [
    { value: 'rt01-rw05', label: 'RT 01 / RW 05 - Kelurahan Tugu Utara' },
    { value: 'rt02-rw05', label: 'RT 02 / RW 05 - Kelurahan Tugu Utara' },
    { value: 'rt03-rw05', label: 'RT 03 / RW 05 - Kelurahan Tugu Utara' },
    { value: 'rt01-rw06', label: 'RT 01 / RW 06 - Kelurahan Tugu Utara' },
  ];

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const { error } = await supabase.auth.signInWithPassword({
      email: signInData.email,
      password: signInData.password,
    });

    setLoading(false);

    if (error) {
      toast({
        title: "Gagal Masuk",
        description: error.message || "Silakan periksa kembali email dan kata sandi Anda.",
        variant: "destructive",
      });
    } else {
      toast({
        title: "Selamat datang!",
        description: "Anda berhasil masuk ke EcoHeroes.",
      });
      onAuthSuccess();
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (signUpData.password !== signUpData.confirmPassword) {
      toast({
        title: "Kata sandi tidak cocok",
        description: "Pastikan konfirmasi kata sandi sesuai.",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);

    const { error } = await supabase.auth.signUp({
      email: signUpData.email,
      password: signUpData.password,
      options: {
        data: {
          full_name: signUpData.fullName,
          rt_rw: signUpData.rtRw,
        }
      }
    });
    
    setLoading(false);

    if (error) {
      toast({
        title: "Pendaftaran Gagal",
        description: error.message || "Terjadi kesalahan saat membuat akun.",
        variant: "destructive"
      });
    } else {
      toast({
        title: "Akun berhasil dibuat!",
        description: "Selamat bergabung dengan EcoHeroes. Silakan masuk.",
      });
      // Arahkan ke tab sign-in setelah berhasil daftar
      setActiveTab('signin');
    }
  };


  return (
    <div className="min-h-screen flex">
      {/* Left Column - Visual (Hidden on mobile) */}
      <div className="hidden md:flex md:w-1/2 bg-gradient-hero relative overflow-hidden">
        <div className="absolute inset-0">
          <img 
            src={heroImage} 
            alt="EcoHeroes Hero" 
            className="w-full h-full object-cover opacity-30"
          />
        </div>
        <div className="relative z-10 flex flex-col justify-center items-center p-12 text-white">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
              <Leaf className="w-6 h-6" />
            </div>
            <h1 className="text-3xl font-bold">EcoHeroes</h1>
          </div>
          <p className="text-xl text-center leading-relaxed opacity-90">
            "Aksi Kecil, Dampak Besar"
          </p>
          <p className="text-center mt-4 opacity-80">
            Bergabunglah dengan komunitas peduli lingkungan dan jadilah pahlawan untuk masa depan yang lebih hijau.
          </p>
        </div>
      </div>

      {/* Right Column - Form */}
      <div className="w-full md:w-1/2 flex items-center justify-center p-6 bg-background">
        <Card className="w-full max-w-md card-elegant">
          <CardHeader className="text-center pb-2">
            <div className="flex items-center justify-center gap-2 mb-4 md:hidden">
              <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
                <Leaf className="w-4 h-4 text-primary-foreground" />
              </div>
              <h1 className="text-xl font-bold text-primary">EcoHeroes</h1>
            </div>
            <CardTitle className="text-2xl">
              {activeTab === 'signin' ? 'Selamat Datang Kembali' : 'Bergabung dengan EcoHeroes'}
            </CardTitle>
          </CardHeader>
          
          <CardContent>
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid w-full grid-cols-2 mb-6">
                <TabsTrigger value="signin">Masuk</TabsTrigger>
                <TabsTrigger value="signup">Daftar</TabsTrigger>
              </TabsList>

              {/* Sign In Tab */}
              <TabsContent value="signin">
                <form onSubmit={handleSignIn} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="signin-email">Email</Label>
                    <Input
                      id="signin-email"
                      type="email"
                      placeholder="contoh@email.com"
                      value={signInData.email}
                      onChange={(e) => setSignInData({...signInData, email: e.target.value})}
                      required
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="signin-password">Kata Sandi</Label>
                    <div className="relative">
                      <Input
                        id="signin-password"
                        type={showPassword ? 'text' : 'password'}
                        value={signInData.password}
                        onChange={(e) => setSignInData({...signInData, password: e.target.value})}
                        required
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </Button>
                    </div>
                  </div>

                  <div className="text-right">
                    <Button variant="link" className="px-0 text-primary">
                      Lupa Kata Sandi?
                    </Button>
                  </div>

                  <Button type="submit" className="w-full btn-hero" disabled={loading}>
                    {loading ? 'Memproses...' : 'Masuk'}
                  </Button>
                </form>
              </TabsContent>

              {/* Sign Up Tab */}
              <TabsContent value="signup">
                <form onSubmit={handleSignUp} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="signup-name">Nama Lengkap</Label>
                    <Input
                      id="signup-name"
                      type="text"
                      placeholder="Masukkan nama lengkap"
                      value={signUpData.fullName}
                      onChange={(e) => setSignUpData({...signUpData, fullName: e.target.value})}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="signup-email">Email</Label>
                    <Input
                      id="signup-email"
                      type="email"
                      placeholder="contoh@email.com"
                      value={signUpData.email}
                      onChange={(e) => setSignUpData({...signUpData, email: e.target.value})}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="signup-rt">Pilih RT/RW</Label>
                    <Select value={signUpData.rtRw} onValueChange={(value) => setSignUpData({...signUpData, rtRw: value})}>
                      <SelectTrigger>
                        <SelectValue placeholder="Pilih RT/RW Anda" />
                      </SelectTrigger>
                      <SelectContent>
                        {mockRtOptions.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="signup-password">Kata Sandi</Label>
                    <div className="relative">
                      <Input
                        id="signup-password"
                        type={showPassword ? 'text' : 'password'}
                        value={signUpData.password}
                        onChange={(e) => setSignUpData({...signUpData, password: e.target.value})}
                        required
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </Button>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="signup-confirm">Konfirmasi Kata Sandi</Label>
                    <Input
                      id="signup-confirm"
                      type="password"
                      value={signUpData.confirmPassword}
                      onChange={(e) => setSignUpData({...signUpData, confirmPassword: e.target.value})}
                      required
                    />
                  </div>

                  <Button type="submit" className="w-full btn-hero" disabled={loading}>
                    {loading ? 'Membuat Akun...' : 'Buat Akun'}
                  </Button>
                </form>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};