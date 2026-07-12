'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { LockKeyhole, Mail } from 'lucide-react';
import Logo from '@/components/Logo';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { getSupabaseBrowserClient, isSupabaseConfigured } from '@/lib/supabase/client';
import { verifyAdminAccess } from '@/lib/admin/verifyAdmin';
import { setCachedAdminRole } from '@/lib/admin/permissions';

export default function LoginForm() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const submit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);
    setError('');

    try {
      if (!email || !password) {
        throw new Error('Provide email and password');
      }

      if (!isSupabaseConfigured()) {
        window.localStorage.setItem('floatboat-demo-admin', email);
        setCachedAdminRole('admin');
        router.replace('/admin/dashboard');
        return;
      }

      const supabase = getSupabaseBrowserClient()!;
      const { data, error: loginError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (loginError) throw loginError;
      const adminCheck = await verifyAdminAccess(data.session?.access_token);
      if (!adminCheck.isAdmin) {
        await supabase.auth.signOut();
        setCachedAdminRole(null);
        throw new Error(adminCheck.error || 'This user is not added as an admin in the admin_profiles table');
      }
      setCachedAdminRole(adminCheck.profile?.role || null);
      router.replace('/admin/dashboard');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[hsl(195,100%,97%)] px-4 py-10">
      <div className="mx-auto flex min-h-[calc(100vh-5rem)] max-w-md items-center">
        <div className="w-full rounded-lg border border-slate-200 bg-white p-6 shadow-xl sm:p-8">
          <div className="mb-8 text-center">
            <Logo className="mx-auto mb-4 w-64" imageClassName="drop-shadow-sm" priority />
            <h1 className="text-2xl font-bold text-slate-900">Admin Login</h1>
            <p className="mt-2 text-sm text-slate-500">Floatbase Houseboat Management Panel</p>
          </div>

          <form onSubmit={submit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  placeholder="admin@example.com"
                  className="pl-9"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <LockKeyhole className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  placeholder="••••••••"
                  className="pl-9"
                />
              </div>
            </div>

            {error && <p className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}

            {!isSupabaseConfigured() && (
              <p className="rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-700">
                Supabase env is not set. Running in demo mode, you can log in with any email/password.
              </p>
            )}

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? 'Logging in...' : 'Login'}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}
