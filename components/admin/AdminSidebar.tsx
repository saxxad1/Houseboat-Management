'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { X } from 'lucide-react';
import Logo from '@/components/Logo';
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
        'fixed inset-y-0 left-0 z-50 w-72 border-r border-slate-200 bg-white transition-transform duration-200 lg:translate-x-0',
        open ? 'translate-x-0' : '-translate-x-full'
      )}
    >
      <div className="flex h-full flex-col">
        <div className="flex h-20 items-center justify-between border-b border-slate-100 px-5">
          <Link href="/admin/dashboard" className="flex items-center" onClick={onClose}>
            <Logo className="w-28" imageClassName="drop-shadow-sm" />
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
                  'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
                  active
                    ? 'bg-[hsl(197,80%,30%)] text-white shadow-sm'
                    : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                )}
              >
                <Icon className="h-4 w-4 flex-shrink-0" />
                <span>{item.labelBn}</span>
                <span className={cn('ml-auto text-[10px]', active ? 'text-white/65' : 'text-slate-400')}>
                  {item.label}
                </span>
              </Link>
            );
          })}
        </nav>

        <div className="border-t border-slate-100 p-4 text-xs text-slate-500">
          <div className="rounded-lg bg-slate-50 p-3">
            Single houseboat admin
            <div className="mt-1 font-semibold text-slate-700">কুহেলিকা</div>
          </div>
        </div>
      </div>
    </aside>
  );
}
