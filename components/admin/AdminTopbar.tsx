'use client';

import { usePathname, useRouter } from 'next/navigation';
import { LogOut, Menu, UserCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { getSupabaseBrowserClient, isSupabaseConfigured } from '@/lib/supabase/client';
import { pageTitles } from '@/lib/admin/constants';

interface AdminTopbarProps {
  email?: string;
  onOpenMenu: () => void;
}

export default function AdminTopbar({ email, onOpenMenu }: AdminTopbarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const title = pageTitles[pathname] || pageTitles['/admin/dashboard'];

  const logout = async () => {
    if (isSupabaseConfigured()) {
      await getSupabaseBrowserClient()?.auth.signOut();
    }
    window.localStorage.removeItem('kuhelika-demo-admin');
    router.replace('/admin/login');
  };

  return (
    <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/90 backdrop-blur">
      <div className="flex min-h-[72px] items-center gap-3 px-4 sm:px-6">
        <button
          type="button"
          onClick={onOpenMenu}
          className="rounded-lg border border-slate-200 p-2 text-slate-600 hover:bg-slate-50 lg:hidden"
          aria-label="Open menu"
        >
          <Menu className="h-5 w-5" />
        </button>

        <div className="min-w-0 flex-1">
          <h1 className="truncate text-lg font-bold text-slate-900 sm:text-2xl">{title.title}</h1>
          <p className="mt-0.5 hidden text-sm text-slate-500 sm:block">{title.subtitle}</p>
        </div>

        <div className="hidden items-center gap-2 rounded-full border border-slate-200 px-3 py-2 text-sm text-slate-600 md:flex">
          <UserCircle className="h-4 w-4 text-slate-400" />
          <span className="max-w-[180px] truncate">{email || 'Admin'}</span>
        </div>

        <Button variant="outline" onClick={logout} className="gap-2">
          <LogOut className="h-4 w-4" />
          <span className="hidden sm:inline">Logout</span>
        </Button>
      </div>
    </header>
  );
}
