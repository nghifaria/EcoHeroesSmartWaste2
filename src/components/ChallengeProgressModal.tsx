// src/components/ChallengeProgressModal.tsx

import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Progress } from '@/components/ui/progress';
import { supabase } from '@/integrations/supabase/client';
import type { Database } from '@/integrations/supabase/types';

type Challenge = Database['public']['Tables']['challenges']['Row'];
interface ChallengeWithProgress extends Challenge {
  progress: number;
  status: 'active' | 'available' | 'completed';
}

interface ChallengeProgressModalProps {
  isOpen: boolean;
  onClose: () => void;
  challenge: ChallengeWithProgress | null;
}

export const ChallengeProgressModal: React.FC<ChallengeProgressModalProps> = ({ isOpen, onClose, challenge }) => {
  const [reportDates, setReportDates] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen && challenge && challenge.type === 'reporting_streak') {
      const fetchReportHistory = async () => {
        setLoading(true);
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        const { data, error } = await supabase
          .from('reports')
          .select('report_date')
          .eq('user_id', user.id)
          .order('report_date', { ascending: false })
          .limit(challenge.goal);
        
        if (data) {
          setReportDates(data.map(r => new Date(r.report_date).toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long' })));
        }
        setLoading(false);
      };
      fetchReportHistory();
    }
  }, [isOpen, challenge]);

  if (!challenge) return null;

  const progressPercentage = challenge.goal > 0 ? (challenge.progress / challenge.goal) * 100 : 0;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{challenge.title}</DialogTitle>
          <DialogDescription>{challenge.description}</DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <div className="flex justify-between text-sm font-medium mb-1">
              <span>Progress</span>
              <span>{challenge.progress} / {challenge.goal}</span>
            </div>
            <Progress value={progressPercentage} className="h-2" />
          </div>
          
          {challenge.type === 'reporting_streak' && (
            <div>
              <h4 className="font-semibold mb-2">Laporan Terakhir:</h4>
              {loading ? <p>Memuat riwayat...</p> : (
                <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
                  {reportDates.map((date, index) => (
                    <li key={index}>{date}</li>
                  ))}
                </ul>
              )}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};