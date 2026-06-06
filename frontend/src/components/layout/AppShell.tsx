import React, { useState } from 'react';
import { Link, NavLink, useNavigate, Outlet } from 'react-router-dom';
import {
  Flame, LayoutDashboard, Target, DollarSign, Users,
  BarChart2, Settings, LogOut, Search, Menu,
  ChevronRight, X, Layers, Globe, Heart, Flag, Plus, Sun, Moon
} from 'lucide-react';
import { useAuthStore } from '../../store/auth.store';
import { useThemeStore } from '../../store/theme.store';
import { Avatar } from '../../components/ui';
import { NotificationBell } from './NotificationBell';
import toast from 'react-hot-toast';

// ── Theme toggle ──────────────────────────────
function ThemeToggle() {
  const { isDark, toggle } = useThemeStore();
  return (
    <button
      onClick={toggle}
      className="p-2.5 text-slate-500 hover:text-navy-700 hover:bg-slate-100 rounded-xl transition-colors dark:text-slate-400 dark:hover:text-white dark:hover:bg-white/10"
      title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
      aria-label="Toggle theme"
    >
      {isDark ? <Sun size={17} /> : <Moon size={17} />}
    </button>
  );
}

// ── Nav config ────────────────────────────────
interface NavItem { to: string; label: string; icon: React.ElementType; roles?: string[] }

const adminNav: NavItem[] = [
  { to: '/dashboard', label: 'Overview', icon: LayoutDashboard },
  { to: '/dashboard/campaigns', label: 'Campaigns', icon: Target },
  { to: '/dashboard/donations', label: 'Donations', icon: DollarSign },
  { to: '/dashboard/users', label: 'Users', icon: Users },
  { to: '/dashboard/reports', label: 'Reports', icon: Flag },
  { to: '/dashboard/analytics', label: 'Analytics', icon: BarChart2 },
  { to: '/dashboard/settings', label: 'Settings', icon: Settings },
];

const creatorNav: NavItem[] = [
  { to: '/dashboard', label: 'Overview', icon: LayoutDashboard },
  { to: '/dashboard/campaigns', label: 'My Campaigns', icon: Target },
  { to: '/dashboard/analytics', label: 'Analytics', icon: BarChart2 },
  { to: '/dashboard/settings', label: 'Settings', icon: Settings },
];

const donorNav: NavItem[] = [
  { to: '/dashboard', label: 'Overview', icon: LayoutDashboard },
  { to: '/dashboard/donations', label: 'My Donations', icon: Heart },
  { to: '/dashboard/settings', label: 'Settings', icon: Settings },
];

// ── Brand mark ────────────────────────────────
function BrandMark({ size = 32 }: { size?: number }) {
  return (
    <div
      className="rounded-lg bg-gradient-to-br from-brand-400 to-brand-600 flex items-center justify-center flex-shrink-0 ring-1 ring-brand-300/40"
      style={{ width: size, height: size }}
    >
      <Flame size={size * 0.46} className="text-white" strokeWidth={2.4} />
    </div>
  );
}

// Wordmark — "FundForge" with the press subtitle
function Wordmark({ subtitle = 'The Campaign Press', dark = false }: { subtitle?: string; dark?: boolean }) {
  return (
    <div className="leading-none">
      <span className={`font-display font-extrabold text-[15px] tracking-tight ${dark ? 'text-white' : 'text-navy-900 dark:text-slate-100'}`}>
        Fund<span className="text-brand-500">Forge</span>
      </span>
      {subtitle && (
        <div className="text-[9.5px] mt-1 uppercase tracking-[0.2em] text-brand-500/80 dark:text-brand-400/80 font-display font-semibold">{subtitle}</div>
      )}
    </div>
  );
}

// ── Sidebar ───────────────────────────────────
function SidebarContent({ collapsed, onClose }: { collapsed: boolean; onClose?: () => void }) {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();

  const navItems = user?.roles.includes('ADMIN')
    ? adminNav
    : user?.roles.includes('CREATOR')
      ? creatorNav
      : donorNav;

  const handleLogout = async () => {
    await logout();
    navigate('/login');
    toast.success('Logged out successfully');
  };

  return (
    <div className="flex flex-col h-full bg-navy-950 bg-gradient-to-b from-navy-900 to-navy-950">
      {/* Logo */}
      <div className={`flex items-center gap-3 px-4 h-16 border-b border-white/5 flex-shrink-0 ${collapsed ? 'justify-center' : ''}`}>
        <BrandMark size={32} />
        {!collapsed && (
          <div className="leading-none">
            <span className="text-white font-display font-extrabold text-[15px] tracking-tight">Fund<span className="text-brand-400">Forge</span></span>
            <div className="text-[9.5px] mt-1 uppercase tracking-[0.2em] text-brand-400/80 font-display font-semibold">The Campaign Press</div>
          </div>
        )}
        {onClose && (
          <button onClick={onClose} className="ml-auto text-slate-400 hover:text-white lg:hidden">
            <X size={16} />
          </button>
        )}
      </div>

      {/* Role pill */}
      {!collapsed && user && (
        <div className="px-4 pt-4 pb-2">
          <span className="inline-flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-[0.14em] text-brand-300 bg-brand-500/10 px-2.5 py-1 rounded-full border border-brand-500/20">
            <Layers size={9} />
            {user.roles.includes('ADMIN') ? 'Admin' : user.roles.includes('CREATOR') ? 'Creator' : 'Donor'}
          </span>
        </div>
      )}

      {/* Nav */}
      <nav className="flex-1 px-2.5 py-2 space-y-0.5 overflow-y-auto">
        {navItems.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/dashboard'}
            onClick={onClose}
            className={({ isActive }) => [
              'group relative flex items-center gap-3 px-3 py-2.5 rounded-xl text-[13px] font-display font-medium transition-all duration-200',
              collapsed ? 'justify-center' : '',
              isActive
                ? 'bg-brand-500/12 text-white'
                : 'text-slate-400 hover:text-white hover:bg-white/5',
            ].join(' ')}
            title={collapsed ? label : undefined}
          >
            {({ isActive }) => (
              <>
                {isActive && (
                  <span className={`absolute left-0 top-1/2 -translate-y-1/2 h-5 w-1 rounded-r-full bg-brand-400 ${collapsed ? 'left-0' : '-left-0.5'}`} />
                )}
                <Icon size={16} className={`flex-shrink-0 ${isActive ? 'text-brand-300' : ''}`} strokeWidth={isActive ? 2.4 : 2} />
                {!collapsed && <span>{label}</span>}
              </>
            )}
          </NavLink>
        ))}

        {/* Explore campaigns link */}
        <div className={`pt-4 mt-2 border-t border-white/5 ${collapsed ? '' : 'px-1'}`}>
          {!collapsed && <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-500 px-2 mb-1.5">Explore</p>}
          <Link
            to="/campaigns"
            onClick={onClose}
            className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-[13px] font-medium text-slate-400 hover:text-white hover:bg-white/5 transition-all ${collapsed ? 'justify-center' : ''}`}
          >
            <Globe size={16} className="flex-shrink-0" />
            {!collapsed && 'Browse Campaigns'}
          </Link>
        </div>
      </nav>

      {/* User footer */}
      <div className={`px-3 py-4 border-t border-white/5 flex-shrink-0 ${collapsed ? 'flex justify-center' : ''}`}>
        {collapsed ? (
          <Avatar name={`${user?.firstName} ${user?.lastName}`} src={user?.avatarUrl} size="sm" />
        ) : (
          <div className="flex items-center gap-3">
            <Avatar name={`${user?.firstName} ${user?.lastName}`} src={user?.avatarUrl} />
            <div className="flex-1 min-w-0">
              <p className="text-[13px] font-semibold text-white truncate">{user?.firstName} {user?.lastName}</p>
              <p className="text-[11px] text-slate-500 truncate">{user?.email}</p>
            </div>
            <button onClick={handleLogout} className="text-slate-500 hover:text-rose-400 transition-colors" title="Log out">
              <LogOut size={15} />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

// ── App Shell ─────────────────────────────────
export function AppShell() {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const { user } = useAuthStore();

  return (
    <div className="flex h-[100dvh] overflow-hidden">
      {/* Desktop sidebar */}
      <aside className={`hidden lg:flex flex-col flex-shrink-0 transition-all duration-300 ease-premium ${collapsed ? 'w-[68px]' : 'w-[232px]'} relative`}>
        <SidebarContent collapsed={collapsed} />
        {/* Collapse toggle */}
        <button
          onClick={() => setCollapsed(c => !c)}
          className="absolute -right-3 top-[72px] w-6 h-6 bg-navy-700 hover:bg-brand-600 rounded-full flex items-center justify-center text-white shadow-md transition-colors z-10 ring-2 ring-slate-50 dark:ring-navy-950"
        >
          <ChevronRight size={11} className={`transition-transform duration-300 ${collapsed ? '' : 'rotate-180'}`} />
        </button>
      </aside>

      {/* Mobile drawer */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-navy-950/60 backdrop-blur-sm animate-fade-in" onClick={() => setMobileOpen(false)} />
          <aside className="relative w-[232px] h-full animate-fade-in">
            <SidebarContent collapsed={false} onClose={() => setMobileOpen(false)} />
          </aside>
        </div>
      )}

      {/* Main */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Topbar */}
        <header className="h-16 flex items-center justify-between px-5 flex-shrink-0 border-b border-slate-200/70 bg-white/70 backdrop-blur-xl z-20 dark:bg-navy-900/70 dark:border-white/10">
          <div className="flex items-center gap-3">
            <button className="lg:hidden p-2 text-slate-500 hover:text-navy-700 hover:bg-slate-100 rounded-xl transition-colors dark:text-slate-400 dark:hover:text-white dark:hover:bg-white/10" onClick={() => setMobileOpen(true)}>
              <Menu size={18} />
            </button>
            <div className="relative hidden sm:block">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                className="bg-slate-100/70 border border-transparent focus:border-brand-300 focus:bg-white text-navy-900 placeholder:text-slate-400 rounded-xl text-sm pl-9 pr-4 py-2 w-56 focus:outline-none focus:ring-4 focus:ring-brand-100 transition-all dark:bg-white/5 dark:text-slate-100 dark:placeholder:text-slate-500 dark:focus:bg-white/10 dark:focus:ring-brand-500/20"
                placeholder="Search campaigns…"
              />
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            <Link
              to="/dashboard/campaigns/new"
              className="hidden sm:inline-flex items-center gap-1.5 px-3.5 py-2 bg-brand-600 hover:bg-brand-500 text-white rounded-xl text-[13px] font-display font-semibold shadow-[0_6px_18px_-8px_rgba(13,148,136,0.65)] hover:shadow-glow-sm active:scale-[0.98] transition-all"
            >
              <Plus size={15} strokeWidth={2.5} /> New campaign
            </Link>
            <ThemeToggle />
            <NotificationBell />
            <div className="h-6 w-px bg-slate-200 dark:bg-white/10" />
            <Link to="/dashboard/settings" className="hover:opacity-80 transition-opacity">
              <Avatar name={`${user?.firstName} ${user?.lastName}`} src={user?.avatarUrl} size="sm" />
            </Link>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 overflow-y-auto bg-slate-50/40 dark:bg-navy-950 dark:text-slate-200 transition-colors">
          <div className="p-6 lg:p-8 max-w-[1400px] mx-auto animate-fade-in">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}

// ── Public layout (campaigns browse, landing) ─
export function PublicLayout() {
  const { isAuthenticated } = useAuthStore();
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex flex-col">
      <header className="h-16 flex-shrink-0 sticky top-0 z-40 bg-white/80 backdrop-blur-xl border-b border-slate-200/70 dark:bg-navy-900/70 dark:border-white/10">
        <div className="max-w-7xl mx-auto px-5 h-full flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2.5">
            <BrandMark size={32} />
            <Wordmark subtitle="" />
          </Link>
          <nav className="hidden md:flex items-center gap-7">
            <Link to="/campaigns" className="text-sm text-slate-600 hover:text-navy-900 dark:text-slate-300 dark:hover:text-white transition-colors font-display font-medium">Explore</Link>
            <Link to="/how-it-works" className="text-sm text-slate-600 hover:text-navy-900 dark:text-slate-300 dark:hover:text-white transition-colors font-display font-medium">How it works</Link>
          </nav>
          <div className="flex items-center gap-3">
            <ThemeToggle />
            {isAuthenticated ? (
              <button onClick={() => navigate('/dashboard')} className="flex items-center gap-2 px-4 py-2 bg-brand-600 text-white rounded-xl text-sm font-display font-semibold hover:bg-brand-500 shadow-[0_6px_18px_-8px_rgba(13,148,136,0.65)] hover:shadow-glow-sm active:scale-[0.98] transition-all">
                Dashboard
              </button>
            ) : (
              <>
                <Link to="/login" className="text-sm text-slate-600 hover:text-navy-900 dark:text-slate-300 dark:hover:text-white font-display font-medium transition-colors">Sign in</Link>
                <Link to="/register" className="px-4 py-2 bg-brand-600 text-white rounded-xl text-sm font-display font-semibold hover:bg-brand-500 shadow-[0_6px_18px_-8px_rgba(13,148,136,0.65)] hover:shadow-glow-sm active:scale-[0.98] transition-all">Start a campaign</Link>
              </>
            )}
          </div>
        </div>
      </header>
      <main className="flex-1">
        <Outlet />
      </main>
      <footer className="border-t border-slate-200/70 py-10 bg-white/40 dark:bg-navy-900/40 dark:border-white/10">
        <div className="max-w-7xl mx-auto px-5 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <BrandMark size={26} />
            <Wordmark subtitle="" />
          </div>
          <p className="text-sm text-slate-500 dark:text-slate-400 font-display">
            Printed and pledged since {new Date().getFullYear()}. Every campaign here was made by a person.
          </p>
        </div>
      </footer>
    </div>
  );
}

// ── Protected route ───────────────────────────
export function ProtectedRoute({ roles }: { roles?: string[] }) {
  const { isAuthenticated, user } = useAuthStore();
  const navigate = useNavigate();

  React.useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login', { replace: true });
      return;
    }
    if (roles && !roles.some(r => user?.roles.includes(r))) {
      navigate('/dashboard', { replace: true });
    }
  }, [isAuthenticated, user, roles, navigate]);

  if (!isAuthenticated) return null;
  return <Outlet />;
}
