import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { 
  Settings, 
  User, 
  Bell, 
  Info, 
  HelpCircle, 
  Shield, 
  LogOut,
  ChevronRight,
  Eye,
  EyeOff
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import type { User as SupabaseUser } from '@supabase/supabase-js';

interface SettingsPageProps {
  user: SupabaseUser;
}

export const SettingsPage: React.FC<SettingsPageProps> = ({ user }) => {
  const [userInfo, setUserInfo] = useState({
    fullName: user?.user_metadata?.full_name || '',
    phone: user?.phone || 'Nomor tidak tersedia',
    rtRw: user?.user_metadata?.rt_rw || 'RT/RW tidak tersedia'
  });

  const [notifications, setNotifications] = useState({
    dailyReminder: true,
    newChallenges: true,
    communityUpdates: false
  });

  const [isChangePasswordOpen, setIsChangePasswordOpen] = useState(false);
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false
  });

  const { toast } = useToast();

  const handleSaveProfile = async () => {
    const { data, error } = await supabase.auth.updateUser({
      data: { full_name: userInfo.fullName }
    });

    if (error) {
      toast({
        title: "Gagal menyimpan profil",
        description: error.message,
        variant: "destructive",
      });
    } else {
      toast({
        title: "Profil tersimpan",
        description: "Perubahan profil Anda telah berhasil disimpan.",
      });
    }
  };

  const handleChangePassword = async () => {
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast({
        title: "Kata sandi tidak cocok",
        description: "Pastikan konfirmasi kata sandi sesuai dengan kata sandi baru.",
        variant: "destructive"
      });
      return;
    }
    if (passwordData.newPassword.length < 6) {
      toast({
        title: "Kata sandi terlalu pendek",
        description: "Kata sandi minimal harus 6 karakter.",
        variant: "destructive"
      });
      return;
    }

    const { error } = await supabase.auth.updateUser({
      password: passwordData.newPassword
    });

    if (error) {
       toast({
        title: "Gagal mengubah kata sandi",
        description: error.message,
        variant: "destructive",
      });
    } else {
      toast({
        title: "Kata sandi berhasil diubah",
        description: "Kata sandi Anda telah berhasil diperbarui.",
      });
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: ''});
      setIsChangePasswordOpen(false);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    toast({
      title: "Berhasil keluar",
      description: "Anda telah keluar dari EcoHeroes. Sampai jumpa!",
    });
    // App.tsx akan menangani redirect karena perubahan sesi
  };

  const settingsLinks = [
      {
        title: 'Tentang EcoHeroes',
        description: 'Pelajari lebih lanjut tentang aplikasi ini',
        icon: Info,
        action: () => toast({ title: "Coming Soon", description: "Halaman ini akan segera tersedia." })
      },
      {
        title: 'Pusat Bantuan',
        description: 'FAQ dan cara menghubungi dukungan',
        icon: HelpCircle,
        action: () => toast({ title: "Coming Soon", description: "Pusat bantuan akan segera tersedia." })
      },
      {
        title: 'Kebijakan Privasi',
        description: 'Pelajari bagaimana kami melindungi data Anda',
        icon: Shield,
        action: () => toast({ title: "Coming Soon", description: "Kebijakan privasi akan segera tersedia." })
      }
  ];

  return (
    <div className="p-4 space-y-6 max-w-2xl mx-auto pb-20">
      <div className="text-center space-y-2">
        <h1 className="text-2xl font-bold text-foreground flex items-center justify-center gap-2">
          <Settings className="w-6 h-6" />
          Pengaturan
        </h1>
      </div>

      <Card className="card-elegant">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="w-5 h-5" />
            Pengaturan Akun
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="fullName">Nama Lengkap</Label>
            <Input
              id="fullName"
              value={userInfo.fullName}
              onChange={(e) => setUserInfo({...userInfo, fullName: e.target.value})}
            />
          </div>
          {/* ... sisa JSX ... */}
        </CardContent>
      </Card>
      
      {/* ... sisa JSX untuk Notifikasi, Lainnya, dan Logout ... */}
    </div>
  );
};