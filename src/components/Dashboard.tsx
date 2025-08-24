import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Star, Flame, BarChart3, Plus, TreePine, Droplets, Zap, ChevronRight } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface DashboardProps {
  onReportClick: () => void;
  onNavigate: (page: string) => void;
  userName?: string;
}

interface DashboardStats {
  total_points: number;
  reporting_streak: number;
  user_rank: number;
  co2_reduced: number;
  trees_saved: number;
  water_saved: number;
}

export const Dashboard: React.FC<DashboardProps> = ({ 
  onReportClick, 
  onNavigate,
  userName = "EcoHero" 
}) => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      setLoading(true);
      const { data, error } = await supabase.rpc('get_dashboard_stats');
      
      if (error) {
        console.error("Gagal mengambil data dashboard:", error);
      } else if (data && data.length > 0) {
        setStats(data[0]);
      }
      setLoading(false);
    };

    fetchDashboardData();
  }, []);

  const getGreeting = () => {
    const currentHour = new Date().getHours();
    if (currentHour < 12) return 'Selamat pagi';
    if (currentHour < 17) return 'Selamat siang';
    return 'Selamat malam';
  };

  if (loading) {
    return <div className="p-4">Memuat data dashboard...</div>;
  }

  return (
    <div className="p-4 space-y-6 max-w-4xl mx-auto">
      <Card className="card-elegant bg-gradient-subtle">
        <CardContent className="p-6">
          <div className="space-y-4">
            <div>
              <h2 className="text-2xl font-bold text-foreground">
                {getGreeting()}, {userName}!
              </h2>
              <p className="text-muted-foreground mt-1">
                Aksi kecilmu berdampak besar!
              </p>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div className="text-center">
                <div className="flex items-center justify-center gap-2 mb-1">
                  <Star className="w-5 h-5 text-accent" />
                  <span className="text-2xl font-bold text-foreground">{stats?.total_points.toLocaleString() || 0}</span>
                </div>
                <span className="text-sm text-muted-foreground">Poin Saya</span>
              </div>
              <div className="text-center">
                <div className="flex items-center justify-center gap-2 mb-1">
                  <Flame className="w-5 h-5 text-red-500" />
                  <span className="text-2xl font-bold text-foreground">{stats?.reporting_streak || 0}</span>
                </div>
                <span className="text-sm text-muted-foreground">Hari Beruntun</span>
              </div>
              <div className="text-center">
                <div className="flex items-center justify-center gap-2 mb-1">
                  <BarChart3 className="w-5 h-5 text-primary" />
                  <span className="text-2xl font-bold text-foreground">#{stats?.user_rank || '-'}</span>
                </div>
                <span className="text-sm text-muted-foreground">Peringkat RT</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="card-elegant border-primary/20 bg-primary/5">
        <CardContent className="p-6 text-center">
            <h3 className="text-xl font-semibold text-foreground mb-2">
                Sudah siap melapor hari ini?
            </h3>
            <p className="text-muted-foreground mb-4">
                Catat sampah harianmu dan raih poin untuk lingkungan yang lebih bersih.
            </p>
            <Button 
                onClick={onReportClick}
                className="btn-hero text-lg px-8 py-3 h-auto"
            >
                <Plus className="w-5 h-5 mr-2" />
                Lapor Sampah Sekarang
            </Button>
        </CardContent>
      </Card>

      <Card className="card-elegant">
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-success">Dampak Positif Anda</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-4 text-center">
            <div className="space-y-2">
              <div className="w-12 h-12 bg-success/20 rounded-full flex items-center justify-center mx-auto">
                <Zap className="w-6 h-6 text-success" />
              </div>
              <div>
                <div className="text-xl font-bold text-foreground">{stats?.co2_reduced.toFixed(1) || 0} kg</div>
                <div className="text-sm text-muted-foreground">CO₂ Tereduksi</div>
              </div>
            </div>
            <div className="space-y-2">
              <div className="w-12 h-12 bg-success/20 rounded-full flex items-center justify-center mx-auto">
                <TreePine className="w-6 h-6 text-success" />
              </div>
              <div>
                <div className="text-xl font-bold text-foreground">{stats?.trees_saved.toFixed(2) || 0}</div>
                <div className="text-sm text-muted-foreground">Pohon Diselamatkan</div>
              </div>
            </div>
            <div className="space-y-2">
              <div className="w-12 h-12 bg-success/20 rounded-full flex items-center justify-center mx-auto">
                <Droplets className="w-6 h-6 text-success" />
              </div>
              <div>
                <div className="text-xl font-bold text-foreground">{stats?.water_saved.toLocaleString() || 0}L</div>
                <div className="text-sm text-muted-foreground">Air Dihemat</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};