'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { X } from 'lucide-react';
import AdminLogo from '@/components/admin/AdminLogo';
import { adminNavItems } from '@/lib/admin/constants';
import { cn } from '@/lib/utils';

interface AdminSidebarProps {
  open?: boolean;
  onClose?: () => void;
}

export default function AdminSidebar({ open = true, onClose }: AdminSidebarProps) {
  const pathname = usePathname();

  return (
    <aside
      className={cn(
        'fixed inset-y-0 left-0 z-50 w-[280px] bg-white/80 backdrop-blur-xl border-r border-white shadow-[4px_0_24px_rgba(0,0,0,0.02)] transition-transform duration-300 ease-out lg:translate-x-0',
        open ? 'translate-x-0' : '-translate-x-full'
      )}
    >
      <div className="flex h-full flex-col">
        <div className="flex h-20 items-center justify-between border-b border-slate-100 px-5">
          <Link href="/admin/dashboard" className="flex items-center" onClick={onClose}>
            <AdminLogo className="w-40 lg:w-48" imageClassName="drop-shadow-sm" />
          </Link>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 lg:hidden"
            aria-label="Close menu"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-4">
          {adminNavItems.map((item) => {
            const active = pathname === item.href;
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onClose}
                className={cn(
                  'group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold transition-all duration-300 relative overflow-hidden',
                  active
                    ? 'bg-gradient-to-r from-[hsl(197,80%,30%)] to-[hsl(173,58%,35%)] text-white shadow-md shadow-[hsl(197,80%,30%)]/20'
                    : 'text-slate-600 hover:bg-slate-100/80 hover:text-slate-900'
                )}
              >
                <Icon className={cn("h-4 w-4 flex-shrink-0 transition-transform duration-300 group-hover:scale-110", active ? "text-white" : "text-slate-400 group-hover:text-[hsl(197,80%,30%)]")} />
                <span className="relative z-10">{item.label}</span>
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-white/50 bg-gradient-to-t from-slate-50/80 to-transparent">
          <div className="rounded-xl bg-white/60 backdrop-blur-md border border-white p-3 shadow-sm flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[hsl(197,80%,30%)] to-[hsl(173,58%,40%)] flex items-center justify-center shadow-inner">
              <span className="text-white font-bold text-xs">F</span>
            </div>
            <div>
              <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Houseboat Admin</div>
              <div className="font-black text-slate-800 text-sm">Floatbase</div>
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
}
