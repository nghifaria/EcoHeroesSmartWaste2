// src/components/CreateChallengeModal.tsx

import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface CreateChallengeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onChallengeCreated: () => void;
}

export const CreateChallengeModal: React.FC<CreateChallengeModalProps> = ({ isOpen, onClose, onChallengeCreated }) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [points, setPoints] = useState(50);
  const [type, setType] = useState('reporting_streak');
  const [goal, setGoal] = useState(3);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      toast({ title: "Error", description: "Anda harus login untuk membuat tantangan.", variant: "destructive" });
      setLoading(false);
      return;
    }

    const { error } = await supabase.from('challenges').insert({
      title,
      description,
      points,
      type,
      goal,
      created_by: user.id,
      is_active: true // Semua tantangan buatan user langsung aktif
    });

    setLoading(false);

    if (error) {
      toast({ title: "Gagal Membuat Tantangan", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Sukses!", description: "Tantangan baru berhasil dibuat." });
      onChallengeCreated(); // Memberi tahu parent component untuk refresh
      onClose(); // Menutup modal
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Buat Tantangan Baru</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Judul Tantangan</Label>
            <Input id="title" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Contoh: Seminggu Tanpa Sedotan Plastik" required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="description">Deskripsi</Label>
            <Textarea id="description" value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Jelaskan aturan dan tujuan dari tantangan ini" required />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
                <Label htmlFor="points">Poin Hadiah</Label>
                <Input id="points" type="number" value={points} onChange={(e) => setPoints(parseInt(e.target.value, 10))} required />
            </div>
            <div className="space-y-2">
                <Label htmlFor="goal">Target/Goal</Label>
                <Input id="goal" type="number" value={goal} onChange={(e) => setGoal(parseInt(e.target.value, 10))} required />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="type">Tipe Tantangan</Label>
             <Select value={type} onValueChange={setType}>
                <SelectTrigger id="type">
                    <SelectValue placeholder="Pilih Tipe" />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="reporting_streak">Laporan Beruntun</SelectItem>
                    <SelectItem value="category_target">Target Kategori Sampah</SelectItem>
                    {/* Tambahkan tipe lain jika ada */}
                </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">Tipe ini akan menentukan bagaimana progres dihitung.</p>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>Batal</Button>
            <Button type="submit" className="btn-hero" disabled={loading}>
              {loading ? 'Menyimpan...' : 'Simpan Tantangan'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};