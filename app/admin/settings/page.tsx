'use client';

import { useState, useEffect } from 'react';
import { Loader2, Save, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { createClient } from '@/lib/supabase/client';
import { useToast } from '@/hooks/use-toast';
import type { AdminProfile } from '@/types';

export default function SettingsPage() {
  const [profile, setProfile] = useState<AdminProfile | null>(null);
  const [fullName, setFullName] = useState('');
  const [role, setRole] = useState('staff');
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    (async () => {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const { data } = await supabase.from('admin_profiles').select('*').eq('id', user.id).single();
      if (data) {
        setProfile(data);
        setFullName(data.full_name);
        setRole(data.role);
      }
    })();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not logged in');

      if (profile) {
        await supabase.from('admin_profiles').update({ full_name: fullName, role }).eq('id', user.id);
      } else {
        await supabase.from('admin_profiles').insert({ id: user.id, full_name: fullName, role });
      }
      toast({ title: 'Profile saved successfully' });
    } catch {
      toast({ variant: 'destructive', title: 'Failed to save profile' });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="p-6 md:p-8 max-w-2xl mx-auto animate-fade-up">
      <div className="mb-6">
        <h1 className="font-display text-2xl md:text-3xl" style={{ color: 'var(--navy)' }}>Settings</h1>
        <p className="text-slate-500 text-sm mt-1">Manage your admin profile</p>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 p-6">
        <div className="flex items-center gap-4 mb-6 pb-6 border-b border-slate-100">
          <div className="w-14 h-14 rounded-full flex items-center justify-center font-bold text-xl text-white"
            style={{ background: 'var(--navy)' }}>
            {fullName ? fullName[0].toUpperCase() : <User className="w-6 h-6" />}
          </div>
          <div>
            <p className="font-semibold text-slate-800">{fullName || 'Admin User'}</p>
            <p className="text-sm text-slate-400 capitalize">{role}</p>
          </div>
        </div>

        <form onSubmit={handleSave} className="space-y-4">
          <div className="space-y-1.5">
            <Label>Full Name</Label>
            <Input value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder="Juan Dela Cruz" required />
          </div>
          <div className="space-y-1.5">
            <Label>Role</Label>
            <Select value={role} onValueChange={setRole}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="captain">Barangay Captain</SelectItem>
                <SelectItem value="secretary">Barangay Secretary</SelectItem>
                <SelectItem value="staff">Barangay Staff</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <Button type="submit" className="w-full" disabled={saving}>
            {saving ? <><Loader2 className="w-4 h-4 animate-spin" />Saving...</> : <><Save className="w-4 h-4" />Save Profile</>}
          </Button>
        </form>
      </div>
    </div>
  );
}
