'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { Loader2, Lock, Eye, EyeOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { createClient } from '@/lib/supabase/client';
import { useToast } from '@/hooks/use-toast';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { toast } = useToast();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const supabase = createClient();
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      toast({ variant: 'destructive', title: 'Login failed', description: error.message });
      setLoading(false);
    } else {
      router.push('/admin');
      router.refresh();
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4" style={{ background: 'var(--navy)' }}>
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 rounded-full opacity-10" style={{ background: 'var(--gold)' }}></div>
        <div className="absolute -bottom-40 -left-40 w-96 h-96 rounded-full opacity-5" style={{ background: 'var(--gold)' }}></div>
      </div>

      <div className="relative w-full max-w-md animate-fade-up">
        {/* Logo area */}
        <div className="text-center mb-8">
          <div className="w-24 h-24 rounded-full overflow-hidden mx-auto mb-4 bg-white shadow-lg">
            <Image src="/logo.png" alt="Barangay Bakakeng Logo" width={96} height={96} className="object-cover w-full h-full" />
          </div>
          <h1 className="font-display text-2xl text-white mb-1">Barangay Bakakeng</h1>
          <p className="text-sm" style={{ color: 'rgba(255,255,255,0.5)' }}>Document Management System</p>
        </div>

        <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">
          <div className="p-2" style={{ background: 'var(--gold)' }}>
            <div className="flex items-center gap-2 justify-center py-1">
              <Lock className="w-3.5 h-3.5" style={{ color: 'var(--navy)' }} />
              <span className="text-xs font-semibold" style={{ color: 'var(--navy)' }}>ADMIN ACCESS ONLY</span>
            </div>
          </div>

          <form onSubmit={handleLogin} className="p-8 space-y-5">
            <div>
              <h2 className="text-xl font-semibold mb-1" style={{ color: 'var(--navy)' }}>Welcome back</h2>
              <p className="text-sm text-slate-500">Sign in to access the admin dashboard</p>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="email">Email Address</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@bakakeng.gov.ph"
                required
                autoComplete="email"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  autoComplete="current-password"
                  className="pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <Button type="submit" className="w-full" size="lg" disabled={loading}>
              {loading ? <><Loader2 className="w-4 h-4 animate-spin" />Signing in...</> : 'Sign In'}
            </Button>
          </form>
        </div>

        <p className="text-center mt-6 text-xs" style={{ color: 'rgba(255,255,255,0.4)' }}>
          © {new Date().getFullYear()} Brgy. Bakakeng — Authorized Personnel Only
        </p>
      </div>
    </div>
  );
}
