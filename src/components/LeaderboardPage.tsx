import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Crown, Trophy, Medal, Star, Users } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface LeaderboardEntry {
  id: string;
  name: string;
  points: number;
  rank: number;
  isCurrentUser?: boolean;
}

export const LeaderboardPage: React.FC = () => {
  const [activeScope, setActiveScope] = useState<'user'>('user'); // Fokus pada user dulu
  const [leaderboardData, setLeaderboardData] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState<LeaderboardEntry | null>(null);

  useEffect(() => {
    const fetchLeaderboard = async () => {
      setLoading(true);

      const { data, error } = await supabase.rpc('get_user_leaderboard');
      
      if (error) {
        console.error("Gagal mengambil papan peringkat:", error);
        setLeaderboardData([]);
      } else {
        const { data: { user: authUser } } = await supabase.auth.getUser();

        const formattedData = data.map((entry, index) => ({
          id: entry.user_id,
          name: entry.full_name || 'Tanpa Nama',
          points: entry.total_points,
          rank: index + 1,
          isCurrentUser: authUser?.id === entry.user_id,
        }));

        setLeaderboardData(formattedData);
        setCurrentUser(formattedData.find(u => u.isCurrentUser) || null);
      }
      setLoading(false);
    };

    fetchLeaderboard();
  }, [activeScope]); // Akan fetch ulang jika scope berubah

  const getRankIcon = (rank: number) => {
    if (rank === 1) return <Crown className="w-6 h-6 text-yellow-500" />;
    if (rank === 2) return <Trophy className="w-6 h-6 text-gray-400" />;
    if (rank === 3) return <Medal className="w-6 h-6 text-amber-600" />;
    return <span className="w-6 h-6 flex items-center justify-center text-muted-foreground font-bold">#{rank}</span>;
  };

  const getRankBg = (rank: number, isCurrentUser: boolean) => {
    if (isCurrentUser) return 'bg-primary/10 border-primary/20 border-2';
    if (rank <= 3) return 'bg-gradient-to-r from-amber-50 to-yellow-50 border-amber-200';
    return 'bg-card border-border';
  };

  return (
    <div className="p-4 space-y-6 max-w-4xl mx-auto">
      <div className="text-center space-y-2">
        <h1 className="text-2xl font-bold text-foreground flex items-center justify-center gap-2">
          <Trophy className="w-6 h-6 text-accent" />
          Papan Peringkat
        </h1>
        <p className="text-muted-foreground">
          Lihat pencapaian komunitas dan raih posisi teratas!
        </p>
      </div>

      <Card className="card-elegant">
        <CardContent className="p-4">
            <p className="text-sm font-medium text-foreground mb-2">Lingkup:</p>
            <div className="flex gap-2">
                <Button variant={'default'} size="sm" className="flex items-center gap-2">
                    <Star className="w-4 h-4" />
                    Warga RT Saya
                </Button>
                <Button variant={'outline'} size="sm" disabled className="flex items-center gap-2">
                    <Users className="w-4 h-4" />
                    Antar RT (Segera)
                </Button>
            </div>
        </CardContent>
      </Card>

      <Card className="card-elegant">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Trophy className="w-5 h-5" />
            Peringkat Warga
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {loading ? (
            <p>Memuat papan peringkat...</p>
          ) : leaderboardData.map((entry) => (
            <div
              key={entry.id}
              className={`flex items-center gap-4 p-4 rounded-lg border transition-all ${getRankBg(entry.rank, entry.isCurrentUser || false)}`}
            >
              <div className="flex items-center justify-center w-12">
                {getRankIcon(entry.rank)}
              </div>
              <div className="flex items-center gap-3 flex-1">
                <Avatar className="h-10 w-10">
                  <AvatarFallback className="bg-primary/20 text-primary font-semibold">
                    {entry.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <span className={`font-semibold ${entry.isCurrentUser ? 'text-primary' : 'text-foreground'}`}>
                    {entry.name}
                  </span>
                  {entry.isCurrentUser && (
                    <Badge className="bg-primary/20 text-primary border-primary/30 ml-2">
                      Kamu
                    </Badge>
                  )}
                </div>
              </div>
              <div className="text-right">
                <div className="font-bold text-lg text-foreground">
                  {entry.points.toLocaleString()}
                </div>
                <div className="text-sm text-muted-foreground">
                  poin
                </div>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

    </div>
  );
};