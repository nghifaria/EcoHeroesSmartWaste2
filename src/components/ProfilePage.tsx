import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { 
  Star, 
  FileCheck, 
  Trophy, 
  CalendarDays, 
  Settings,
  ChevronRight,
  Crown,
  Leaf,
  Target,
  Flame,
  Award,
  Mail,
  HelpCircle // Menggunakan HelpCircle sebagai ikon default
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import type { Database } from '@/integrations/supabase/types';

type Report = Database['public']['Tables']['reports']['Row'];

interface ProfilePageProps {
  onNavigate: (page: string) => void;
  userName?: string;
  userEmail?: string;
}

// Map nama ikon ke komponen ikon yang sebenarnya
const iconMap: { [key: string]: React.FC<any> } = {
  FileCheck, Leaf, Target, Flame, Crown, Trophy, Default: HelpCircle
};

export const ProfilePage: React.FC<ProfilePageProps> = ({ 
  onNavigate, 
  userName = "EcoHero",
  userEmail = "email@contoh.com"
}) => {
  const [stats, setStats] = useState({ totalPoints: 0, totalReports: 0, challengesCompleted: 0 });
  const [recentReports, setRecentReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { setLoading(false); return; }

      // Fetch recent reports
      const { data: reportsData } = await supabase
        .from('reports')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(3);
      setRecentReports(reportsData || []);

      // Fetch aggregated stats (total points and reports)
      const { data: pointsData } = await supabase
        .from('reports')
        .select('points_awarded')
        .eq('user_id', user.id);
        
      const totalPoints = (pointsData || []).reduce((sum, report) => sum + report.points_awarded, 0);
      setStats(prev => ({ ...prev, totalPoints, totalReports: (pointsData || []).length }));

      setLoading(false);
    };

    fetchData();
  }, []);
  
  const userInitials = userName.split(' ').map(n => n[0]).join('').toUpperCase();
  const rtName = "RT 03 / RW 05"; // Data ini bisa ditambahkan ke user metadata nanti

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' });
  };

  if (loading) {
    return <div className="p-4">Memuat profil...</div>;
  }

  return (
    <div className="p-4 space-y-6 max-w-4xl mx-auto pb-20">
      {/* Profile Header */}
      <Card className="card-elegant bg-gradient-subtle">
        <CardContent className="p-6">
          <div className="flex items-center gap-4">
            <Avatar className="h-20 w-20 border-4 border-primary/20">
              <AvatarFallback className="bg-primary text-primary-foreground text-2xl font-bold">{userInitials}</AvatarFallback>
            </Avatar>
            <div className="flex-1 space-y-1">
              <h2 className="text-2xl font-bold text-foreground">{userName}</h2>
              <p className="text-muted-foreground">Warga {rtName}</p>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Mail className="w-4 h-4" />
                <span>{userEmail}</span>
              </div>
            </div>
            <Button variant="outline" size="sm" onClick={() => onNavigate('settings')} className="flex items-center gap-2">
              <Settings className="w-4 h-4" />
              Pengaturan
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Lifetime Statistics */}
      <Card className="card-elegant">
        <CardHeader><CardTitle className="flex items-center gap-2"><Star className="w-5 h-5 text-accent" />Statistik Aksi Hijau</CardTitle></CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center space-y-2">
              <div className="w-12 h-12 bg-accent/20 rounded-full flex items-center justify-center mx-auto"><Star className="w-6 h-6 text-accent" /></div>
              <div>
                <div className="text-2xl font-bold text-foreground">{stats.totalPoints.toLocaleString()}</div>
                <div className="text-sm text-muted-foreground">Total Poin</div>
              </div>
            </div>
            <div className="text-center space-y-2">
              <div className="w-12 h-12 bg-primary/20 rounded-full flex items-center justify-center mx-auto"><FileCheck className="w-6 h-6 text-primary" /></div>
              <div>
                <div className="text-2xl font-bold text-foreground">{stats.totalReports}</div>
                <div className="text-sm text-muted-foreground">Laporan Terkirim</div>
              </div>
            </div>
             <div className="text-center space-y-2">
              <div className="w-12 h-12 bg-success/20 rounded-full flex items-center justify-center mx-auto"><Trophy className="w-6 h-6 text-success" /></div>
              <div>
                <div className="text-2xl font-bold text-foreground">0</div>
                <div className="text-sm text-muted-foreground">Tantangan Selesai</div>
              </div>
            </div>
             <div className="text-center space-y-2">
              <div className="w-12 h-12 bg-info/20 rounded-full flex items-center justify-center mx-auto"><CalendarDays className="w-6 h-6 text-info" /></div>
              <div>
                <div className="text-2xl font-bold text-foreground">-</div>
                <div className="text-sm text-muted-foreground">Hari Teraktif</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Recent Reports */}
      <Card className="card-elegant">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="flex items-center gap-2"><FileCheck className="w-5 h-5 text-primary" />Aktivitas Terbaru</CardTitle>
          <Button variant="ghost" size="sm" onClick={() => onNavigate('history')} className="text-primary hover:text-primary/80">
            Lihat Semua Riwayat
            <ChevronRight className="w-4 h-4 ml-1" />
          </Button>
        </CardHeader>
        <CardContent>
          {recentReports.length > 0 ? (
            <div className="space-y-3">
              {recentReports.map((report) => (
                <div key={report.id} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-primary/20 rounded-full flex items-center justify-center"><FileCheck className="w-5 h-5 text-primary" /></div>
                    <div>
                      <div className="font-medium text-foreground">{formatDate(report.created_at)}</div>
                      <div className="text-sm text-muted-foreground">Laporan sampah</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold text-accent">+{report.points_awarded} poin</span>
                    <Badge className="bg-success/10 text-success border-success/20">Disetujui</Badge>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-center text-muted-foreground py-4">Belum ada laporan yang dibuat.</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
};