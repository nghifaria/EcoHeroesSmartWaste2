import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Trophy, Clock, Star, CheckCircle, Target, Calendar, PlusCircle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import type { Database } from '@/integrations/supabase/types';
import { CreateChallengeModal } from './CreateChallengeModal';
import { useToast } from '@/hooks/use-toast'; // <-- 1. Import useToast

type Challenge = Database['public']['Tables']['challenges']['Row'];

interface ChallengeWithProgress extends Challenge {
  progress: number;
  status: 'active' | 'available' | 'completed';
}

export const ChallengesPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState('available');
  const [challenges, setChallenges] = useState<ChallengeWithProgress[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCreateModalOpen, setCreateModalOpen] = useState(false);
  const { toast } = useToast(); // <-- 2. Inisialisasi toast

  const fetchChallengesAndProgress = useCallback(async () => {
    setLoading(true);

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      setLoading(false);
      return;
    }

    const { data: allChallenges, error: challengesError } = await supabase
      .from('challenges')
      .select('*');

    if (challengesError) {
      console.error("Gagal mengambil tantangan:", challengesError);
      setLoading(false);
      return;
    }

    const { data: userProgress, error: progressError } = await supabase
      .from('user_challenge_progress')
      .select('*')
      .eq('user_id', user.id);
      
    if (progressError) {
      console.error("Gagal mengambil progres:", progressError);
    }

    const enrichedChallenges: ChallengeWithProgress[] = (allChallenges || []).map(challenge => {
      const progressData = (userProgress || []).find(p => p.challenge_id === challenge.id);
      
      let status: ChallengeWithProgress['status'] = 'available';
      if (progressData) {
        status = progressData.status === 'completed' ? 'completed' : 'active';
      }

      return {
        ...challenge,
        progress: progressData?.progress || 0,
        status: status,
      };
    });

    setChallenges(enrichedChallenges);
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchChallengesAndProgress();
  }, [fetchChallengesAndProgress]);

  // 3. Tambahkan fungsi ini untuk menangani klik tombol "Mulai Tantangan"
  const handleStartChallenge = async (challengeId: string) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
        toast({ title: "Gagal", description: "Anda harus login untuk memulai tantangan.", variant: "destructive"});
        return;
    }

    const { error } = await supabase
      .from('user_challenge_progress')
      .insert({
          user_id: user.id,
          challenge_id: challengeId,
          progress: 0,
          status: 'in_progress'
      });

    if (error) {
        toast({ title: "Gagal Memulai Tantangan", description: error.message, variant: "destructive"});
    } else {
        toast({ title: "Sukses!", description: "Anda telah memulai tantangan baru."});
        fetchChallengesAndProgress(); // Muat ulang data untuk memperbarui UI
    }
  };
    
  // ... (sisa fungsi helper tidak berubah) ...
  const filterChallenges = (status: 'active' | 'available' | 'completed') => {
    return challenges.filter(c => c.status === status);
  };
    
  const getDifficultyColor = (points: number) => {
    if (points <= 100) return 'bg-green-100 text-green-800 border-green-200';
    if (points <= 200) return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    return 'bg-red-100 text-red-800 border-red-200';
  };

  const getCategoryIcon = (type: string | null) => {
    switch (type) {
      case 'reporting_streak': return Calendar;
      case 'category_target': return Target;
      default: return Star;
    }
  };


  return (
    <>
      <CreateChallengeModal 
        isOpen={isCreateModalOpen}
        onClose={() => setCreateModalOpen(false)}
        onChallengeCreated={fetchChallengesAndProgress}
      />
      <div className="p-4 space-y-6 max-w-4xl mx-auto">
        <div className="text-center space-y-2">
          <h1 className="text-2xl font-bold text-foreground flex items-center justify-center gap-2">
            <Trophy className="w-6 h-6 text-accent" />
            Tantangan EcoHeroes
          </h1>
          <p className="text-muted-foreground">
            Selesaikan tantangan dan raih poin untuk jadi EcoHero terhebat!
          </p>
        </div>

        <div className="flex justify-end">
            <Button onClick={() => setCreateModalOpen(true)}>
                <PlusCircle className="w-4 h-4 mr-2" />
                Buat Tantangan Baru
            </Button>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="active">Aktif ({filterChallenges('active').length})</TabsTrigger>
            <TabsTrigger value="available">Tersedia ({filterChallenges('available').length})</TabsTrigger>
            <TabsTrigger value="completed">Selesai ({filterChallenges('completed').length})</TabsTrigger>
          </TabsList>

          <TabsContent value={activeTab} className="space-y-4 pt-4">
            {loading ? (
              <p>Memuat tantangan...</p>
            ) : filterChallenges(activeTab as any).length === 0 ? (
              <Card className="card-elegant text-center py-8">
                <CardContent>
                  <Trophy className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-foreground mb-2">
                    Tidak Ada Tantangan
                  </h3>
                  <p className="text-muted-foreground">Nantikan tantangan baru atau cek tab lainnya!</p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-4">
                {filterChallenges(activeTab as any).map((challenge) => {
                  const Icon = getCategoryIcon(challenge.type);
                  const progressPercentage = challenge.goal > 0 ? (challenge.progress / challenge.goal) * 100 : 0;
                  
                  return (
                    <Card key={challenge.id} className="card-elegant hover:shadow-lg transition-all">
                       <CardHeader className="pb-3">
                        <div className="flex items-start gap-4">
                          <div className={`w-12 h-12 rounded-full flex items-center justify-center bg-muted`}>
                            <Icon className={`w-6 h-6 text-muted-foreground`} />
                          </div>
                          <div className="flex-1 space-y-2">
                            <div className="flex items-center justify-between">
                              <CardTitle className="text-lg">{challenge.title}</CardTitle>
                              <div className="flex items-center gap-2">
                                 <Badge variant="outline" className={getDifficultyColor(challenge.points)}>
                                  {challenge.points <= 100 ? 'Mudah' : challenge.points <= 200 ? 'Sedang' : 'Sulit'}
                                </Badge>
                              </div>
                            </div>
                            <p className="text-muted-foreground text-sm">
                              {challenge.description}
                            </p>
                            <div className="flex items-center justify-between text-sm">
                                <span className="font-semibold text-accent">
                                  +{challenge.points} Poin
                                </span>
                            </div>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent className="pt-0">
                        {challenge.status === 'active' && (
                          <div className="space-y-2 mb-4">
                            <div className="flex justify-between text-sm">
                              <span className="text-muted-foreground">Progress</span>
                              <span className="font-medium">{challenge.progress}/{challenge.goal}</span>
                            </div>
                            <Progress value={progressPercentage} className="h-2" />
                          </div>
                        )}
                        <div className="flex justify-end">
                           {/* 4. Hubungkan fungsi ke tombol onClick */}
                          {challenge.status === 'available' && <Button className="btn-hero" onClick={() => handleStartChallenge(challenge.id)}>Mulai Tantangan</Button>}
                          {challenge.status === 'active' && <Button variant="outline">Lihat Progress</Button>}
                          {challenge.status === 'completed' && <Button variant="outline" disabled><CheckCircle className="w-4 h-4 mr-2" />Selesai</Button>}
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </>
  );
};