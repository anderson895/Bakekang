'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  LayoutDashboard, FileText, Users, LogOut,
  Menu, X, ChevronRight, Settings
} from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { cn } from '@/lib/utils';
import type { User } from '@supabase/supabase-js';
import type { AdminProfile } from '@/types';

interface Props {
  user: User;
  profile: AdminProfile | null;
}

const NAV_ITEMS = [
  { href: '/admin', label: 'Dashboard', icon: LayoutDashboard, exact: true },
  { href: '/admin/requests', label: 'Requests', icon: FileText },
  { href: '/admin/residents', label: 'Residents', icon: Users },
];

export default function AdminSidebar({ user, profile }: Props) {
  const pathname = usePathname();
  const router = useRouter();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  const isActive = (href: string, exact?: boolean) =>
    exact ? pathname === href : pathname.startsWith(href);

  const handleLogout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push('/login');
  };

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="p-4 border-b border-white/10">
        <div className={cn('flex items-center gap-3', collapsed && 'justify-center')}>
          <div className="w-9 h-9 rounded-full flex items-center justify-center font-display font-bold text-white shrink-0"
            style={{ background: 'rgba(244,169,0,0.25)', border: '1.5px solid rgba(244,169,0,0.4)' }}>
            B
          </div>
          {!collapsed && (
            <div>
              <p className="text-white font-semibold text-sm leading-tight">Bakakeng DMS</p>
              <p className="text-xs" style={{ color: 'rgba(255,255,255,0.5)' }}>Admin Panel</p>
            </div>
          )}
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-3 space-y-1">
        {NAV_ITEMS.map(({ href, label, icon: Icon, exact }) => {
          const active = isActive(href, exact);
          return (
            <Link key={href} href={href}
              onClick={() => setMobileOpen(false)}
              className={cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all duration-150',
                collapsed && 'justify-center px-2',
                active
                  ? 'text-white font-medium'
                  : 'text-white/60 hover:text-white hover:bg-white/10'
              )}
              style={active ? { background: 'rgba(244,169,0,0.2)', borderLeft: collapsed ? 'none' : '3px solid #F4A900' } : {}}
            >
              <Icon className="w-4.5 h-4.5 shrink-0" style={{ width: '18px', height: '18px' }} />
              {!collapsed && <span>{label}</span>}
              {!collapsed && active && <ChevronRight className="w-3.5 h-3.5 ml-auto opacity-60" />}
            </Link>
          );
        })}
      </nav>

      {/* Bottom */}
      <div className="p-3 border-t border-white/10 space-y-1">
        <Link href="/admin/settings"
          onClick={() => setMobileOpen(false)}
          className={cn('flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-white/60 hover:text-white hover:bg-white/10 transition-all', collapsed && 'justify-center')}>
          <Settings style={{ width: '18px', height: '18px' }} className="shrink-0" />
          {!collapsed && <span>Settings</span>}
        </Link>

        {/* User info */}
        <div className={cn('flex items-center gap-3 px-3 py-2.5 rounded-lg', collapsed && 'justify-center')}>
          <div className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold shrink-0"
            style={{ background: 'rgba(244,169,0,0.3)', color: '#F4A900' }}>
            {(profile?.full_name || user.email || 'A')[0].toUpperCase()}
          </div>
          {!collapsed && (
            <div className="flex-1 min-w-0">
              <p className="text-white text-xs font-medium truncate">{profile?.full_name || 'Admin'}</p>
              <p className="text-xs truncate capitalize" style={{ color: 'rgba(255,255,255,0.4)' }}>{profile?.role || 'staff'}</p>
            </div>
          )}
        </div>

        <button onClick={handleLogout}
          className={cn('w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-red-400 hover:bg-red-500/10 hover:text-red-300 transition-all', collapsed && 'justify-center')}>
          <LogOut style={{ width: '18px', height: '18px' }} className="shrink-0" />
          {!collapsed && <span>Sign Out</span>}
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop sidebar */}
      <aside
        className="hidden md:flex flex-col h-full transition-all duration-300 shrink-0 relative"
        style={{ width: collapsed ? '64px' : '220px', background: 'var(--navy)' }}
      >
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="absolute -right-3 top-6 w-6 h-6 rounded-full border border-slate-200 bg-white flex items-center justify-center z-10 shadow-sm hover:bg-slate-50 transition-colors"
        >
          {collapsed
            ? <ChevronRight className="w-3 h-3 text-slate-500" />
            : <X className="w-3 h-3 text-slate-500" />}
        </button>
        <SidebarContent />
      </aside>

      {/* Mobile hamburger */}
      <button
        className="md:hidden fixed top-4 left-4 z-50 w-10 h-10 rounded-lg flex items-center justify-center shadow-lg"
        style={{ background: 'var(--navy)' }}
        onClick={() => setMobileOpen(true)}
      >
        <Menu className="w-5 h-5 text-white" />
      </button>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div className="md:hidden fixed inset-0 z-40 flex">
          <div className="w-64 h-full shadow-xl" style={{ background: 'var(--navy)' }}>
            <SidebarContent />
          </div>
          <div className="flex-1 bg-black/40 backdrop-blur-sm" onClick={() => setMobileOpen(false)} />
        </div>
      )}
    </>
  );
}
