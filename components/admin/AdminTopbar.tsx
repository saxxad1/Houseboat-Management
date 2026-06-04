'use client';

import { usePathname, useRouter } from 'next/navigation';
import { LogOut, Menu, UserCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { getSupabaseBrowserClient, isSupabaseConfigured } from '@/lib/supabase/client';
import { pageTitles } from '@/lib/admin/constants';
import { getCachedAdminRole, setCachedAdminRole } from '@/lib/admin/permissions';

interface AdminTopbarProps {
  email?: string;
  onOpenMenu: () => void;
}

export default function AdminTopbar({ email, onOpenMenu }: AdminTopbarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const title = pageTitles[pathname] || pageTitles['/admin/dashboard'];
  const role = getCachedAdminRole();

  const logout = async () => {
    if (isSupabaseConfigured()) {
      await getSupabaseBrowserClient()?.auth.signOut();
    }
    window.localStorage.removeItem('kuhelika-demo-admin');
    setCachedAdminRole(null);
    router.replace('/admin/login');
  };

  return (
    <header className="sticky top-0 z-30 bg-white/60 backdrop-blur-xl border-b border-white shadow-[0_4px_24px_rgba(0,0,0,0.02)] transition-all duration-300">
      <div className="flex h-20 items-center gap-4 px-4 sm:px-8">
        <button
          type="button"
          onClick={onOpenMenu}
          className="rounded-xl bg-white border border-slate-100 shadow-sm p-2.5 text-slate-600 hover:bg-slate-50 lg:hidden transition-all duration-300 hover:scale-105 active:scale-95"
          aria-label="Open menu"
        >
          <Menu className="h-5 w-5" />
        </button>

        <div className="min-w-0 flex-1">
          <h1 className="truncate text-xl sm:text-2xl font-black text-slate-800 tracking-tight">{title.title}</h1>
          <p className="mt-0.5 hidden text-sm font-medium text-slate-500 sm:block">{title.subtitle}</p>
        </div>

        <div className="hidden items-center gap-2.5 rounded-full bg-white/80 border border-white shadow-sm px-4 py-2 text-sm font-semibold text-slate-700 md:flex backdrop-blur-md">
          <UserCircle className="h-5 w-5 text-[hsl(197,80%,40%)]" />
          <span className="max-w-[180px] truncate">{email || 'Admin'}</span>
          {role === 'viewer' && (
            <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-black uppercase tracking-wide text-amber-700">
              Read only
            </span>
          )}
          {role === 'manager' && (
            <span className="rounded-full bg-sky-100 px-2 py-0.5 text-[10px] font-black uppercase tracking-wide text-sky-700">
              Manager
            </span>
          )}
        </div>

        <Button variant="outline" onClick={logout} className="gap-2 rounded-xl bg-white/80 border-white shadow-sm hover:shadow-md transition-all duration-300 font-bold text-slate-600 hover:text-red-600 hover:bg-red-50">
          <LogOut className="h-4 w-4" />
          <span className="hidden sm:inline">Logout</span>
        </Button>
      </div>
    </header>
  );
}
