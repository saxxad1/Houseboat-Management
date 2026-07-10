'use client';

import { useEffect, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import AdminSidebar from '@/components/admin/AdminSidebar';
import AdminTopbar from '@/components/admin/AdminTopbar';
import { getSupabaseBrowserClient, isSupabaseConfigured } from '@/lib/supabase/client';
import { verifyAdminAccess } from '@/lib/admin/verifyAdmin';
import { setCachedAdminRole } from '@/lib/admin/permissions';

interface AdminShellProps {
  children: React.ReactNode;
}

export default function AdminShell({ children }: AdminShellProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [ready, setReady] = useState(false);
  const [authed, setAuthed] = useState(false);
  const [email, setEmail] = useState('');
  const [menuOpen, setMenuOpen] = useState(false);
  const isLoginPage = pathname === '/admin/login';

  useEffect(() => {
    let mounted = true;
    const supabase = getSupabaseBrowserClient();

    const check = async () => {
      if (!isSupabaseConfigured()) {
        const demoEmail = window.localStorage.getItem('floatboat-demo-admin') || '';
        if (!mounted) return;
        setAuthed(Boolean(demoEmail));
        setEmail(demoEmail);
        setCachedAdminRole(demoEmail ? 'admin' : null);
        setReady(true);
        if (!demoEmail && !isLoginPage) router.replace('/admin/login');
        if (demoEmail && isLoginPage) router.replace('/admin/dashboard');
        return;
      }

      const { data } = await supabase!.auth.getSession();
      const sessionEmail = data.session?.user.email || '';
      const adminCheck = data.session ? await verifyAdminAccess(data.session.access_token) : { isAdmin: false, profile: null };
      const isAdmin = Boolean(data.session && adminCheck.isAdmin);
      if (!mounted) return;
      setAuthed(isAdmin);
      setEmail(sessionEmail);
      setCachedAdminRole(isAdmin ? adminCheck.profile?.role || null : null);
      setReady(true);
      if (!isAdmin && !isLoginPage) router.replace('/admin/login');
      if (isAdmin && isLoginPage) router.replace('/admin/dashboard');
    };

    check();
    const subscription = supabase?.auth.onAuthStateChange(async (_event, session) => {
      const sessionEmail = session?.user.email || '';
      const adminCheck = session ? await verifyAdminAccess(session.access_token) : { isAdmin: false, profile: null };
      const isAdmin = Boolean(session && adminCheck.isAdmin);
      setAuthed(isAdmin);
      setEmail(sessionEmail);
      setCachedAdminRole(isAdmin ? adminCheck.profile?.role || null : null);
      if (!isAdmin && !isLoginPage) router.replace('/admin/login');
    });

    return () => {
      mounted = false;
      subscription?.data.subscription.unsubscribe();
    };
  }, [isLoginPage, router]);

  if (isLoginPage) {
    return <>{children}</>;
  }

  if (!ready || !authed) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <div className="rounded-lg border border-slate-200 bg-white px-5 py-4 text-sm text-slate-600 shadow-sm">
          Verifying Admin session...
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50/50 text-slate-900 relative">
      {/* Decorative Background */}
      <div className="fixed top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
        <div className="absolute top-[-10%] right-[-5%] w-[40vw] max-w-[500px] aspect-square rounded-full bg-[hsl(197,80%,90%)]/50 blur-[120px]" />
        <div className="absolute bottom-[-10%] left-[-5%] w-[50vw] max-w-[600px] aspect-square rounded-full bg-[hsl(38,90%,90%)]/40 blur-[150px]" />
      </div>

      <div className="relative z-10 flex h-screen overflow-hidden">
        <AdminSidebar open={menuOpen} onClose={() => setMenuOpen(false)} />
        {menuOpen && (
          <button
            aria-label="Close menu overlay"
            className="fixed inset-0 z-40 bg-slate-900/40 backdrop-blur-sm lg:hidden transition-all"
            onClick={() => setMenuOpen(false)}
          />
        )}
        <div className="flex-1 flex flex-col h-screen overflow-hidden lg:pl-[280px]">
          <AdminTopbar email={email} onOpenMenu={() => setMenuOpen(true)} />
          <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 custom-scrollbar">
            {children}
          </main>
        </div>
      </div>
    </div>
  );
}
