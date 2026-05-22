'use client';

import { useEffect, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import AdminSidebar from '@/components/admin/AdminSidebar';
import AdminTopbar from '@/components/admin/AdminTopbar';
import { getSupabaseBrowserClient, isSupabaseConfigured } from '@/lib/supabase/client';
import { verifyAdminAccess } from '@/lib/admin/verifyAdmin';

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
        const demoEmail = window.localStorage.getItem('kuhelika-demo-admin') || '';
        if (!mounted) return;
        setAuthed(Boolean(demoEmail));
        setEmail(demoEmail);
        setReady(true);
        if (!demoEmail && !isLoginPage) router.replace('/admin/login');
        if (demoEmail && isLoginPage) router.replace('/admin/dashboard');
        return;
      }

      const { data } = await supabase!.auth.getSession();
      const sessionEmail = data.session?.user.email || '';
      const adminCheck = data.session ? await verifyAdminAccess(data.session.access_token) : { isAdmin: false };
      const isAdmin = Boolean(data.session && adminCheck.isAdmin);
      if (!mounted) return;
      setAuthed(isAdmin);
      setEmail(sessionEmail);
      setReady(true);
      if (!isAdmin && !isLoginPage) router.replace('/admin/login');
      if (isAdmin && isLoginPage) router.replace('/admin/dashboard');
    };

    check();
    const subscription = supabase?.auth.onAuthStateChange(async (_event, session) => {
      const sessionEmail = session?.user.email || '';
      const adminCheck = session ? await verifyAdminAccess(session.access_token) : { isAdmin: false };
      const isAdmin = Boolean(session && adminCheck.isAdmin);
      setAuthed(isAdmin);
      setEmail(sessionEmail);
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
          Admin session যাচাই হচ্ছে...
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <AdminSidebar open={menuOpen} onClose={() => setMenuOpen(false)} />
      {menuOpen && (
        <button
          aria-label="Close menu overlay"
          className="fixed inset-0 z-40 bg-black/30 lg:hidden"
          onClick={() => setMenuOpen(false)}
        />
      )}
      <div className="lg:pl-72">
        <AdminTopbar email={email} onOpenMenu={() => setMenuOpen(true)} />
        <main className="p-4 sm:p-6 lg:p-8">{children}</main>
      </div>
    </div>
  );
}
