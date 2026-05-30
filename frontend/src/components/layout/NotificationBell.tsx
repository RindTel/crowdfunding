import React, { useState, useRef, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Bell, Heart, CheckCircle, Clock, AlertCircle, Check, Inbox } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { formatDistanceToNow } from 'date-fns';
import { http } from '../../services/api';
import { useAuthStore } from '../../store/auth.store';
import { useNotificationStore } from '../../store/notifications.store';
import type { Donation } from '../../types';

type Tone = 'brand' | 'emerald' | 'amber' | 'rose';
interface NotifItem {
  id: string;
  title: string;
  subtitle?: string;
  amount?: number;
  time: string;
  slug?: string;
  tone: Tone;
  icon: React.ElementType;
}

const toneClasses: Record<Tone, string> = {
  brand:   'bg-brand-50 text-brand-600 dark:bg-brand-500/15 dark:text-brand-300',
  emerald: 'bg-emerald-50 text-emerald-600 dark:bg-emerald-500/15 dark:text-emerald-300',
  amber:   'bg-amber-50 text-amber-600 dark:bg-amber-500/15 dark:text-amber-300',
  rose:    'bg-rose-50 text-rose-600 dark:bg-rose-500/15 dark:text-rose-300',
};

export function NotificationBell() {
  const { user } = useAuthStore();
  const { readIds, markRead, markAllRead } = useNotificationStore();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const role = user?.roles.includes('ADMIN')
    ? 'admin'
    : user?.roles.includes('CREATOR')
      ? 'creator'
      : 'donor';

  // Reuses the same query key as the dashboard analytics hooks → cache is shared.
  const { data } = useQuery({
    queryKey: ['analytics', role],
    queryFn: () => http.get<Record<string, unknown>>(`/analytics/${role}`),
    enabled: !!user,
    staleTime: 60_000,
    refetchInterval: 60_000,
  });

  const items: NotifItem[] = useMemo(() => {
    const stats = (data?.data ?? {}) as { recentDonations?: Donation[]; donations?: Donation[] };
    const source = (role === 'donor' ? stats.donations : stats.recentDonations) ?? [];
    return source.slice(0, 12).map((d) => {
      if (role === 'donor') {
        const tone: Tone = d.status === 'COMPLETED' ? 'emerald' : d.status === 'PENDING' ? 'amber' : 'rose';
        const icon = d.status === 'COMPLETED' ? CheckCircle : d.status === 'PENDING' ? Clock : AlertCircle;
        return {
          id: d.id,
          title: `Donation ${d.status.toLowerCase()}`,
          subtitle: d.campaign?.title,
          amount: Number(d.amount),
          time: d.createdAt,
          slug: d.campaign?.slug,
          tone, icon,
        };
      }
      const donor = d as unknown as { donor?: { user?: { firstName?: string } } };
      const who = d.isAnonymous ? 'Someone' : (donor.donor?.user?.firstName ?? 'A backer');
      return {
        id: d.id,
        title: `${who} backed ${role === 'admin' ? 'a campaign' : 'your campaign'}`,
        subtitle: d.campaign?.title,
        amount: Number(d.amount),
        time: d.createdAt,
        slug: d.campaign?.slug,
        tone: 'brand' as Tone, icon: Heart,
      };
    });
  }, [data, role]);

  const unreadCount = items.filter((i) => !readIds.includes(i.id)).length;

  // Close on outside click
  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', onDown);
    return () => document.removeEventListener('mousedown', onDown);
  }, [open]);

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen((o) => !o)}
        className={`relative p-2.5 rounded-xl transition-colors ${open ? 'text-brand-700 bg-brand-50 dark:text-brand-300 dark:bg-brand-500/15' : 'text-slate-500 hover:text-navy-700 hover:bg-slate-100 dark:text-slate-400 dark:hover:text-white dark:hover:bg-white/10'}`}
        aria-label="Notifications"
      >
        <Bell size={17} />
        {unreadCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 min-w-[16px] h-4 px-1 bg-brand-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center ring-2 ring-white tnum">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-80 origin-top-right bg-white rounded-2xl shadow-lift border border-slate-200/70 overflow-hidden z-50 animate-scale-in dark:bg-navy-900 dark:border-white/10">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100 dark:border-white/10">
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-semibold text-navy-900 dark:text-slate-100">Notifications</h3>
              {unreadCount > 0 && (
                <span className="text-[10px] font-bold text-brand-700 bg-brand-50 px-1.5 py-0.5 rounded-full dark:bg-brand-500/15 dark:text-brand-300">{unreadCount} new</span>
              )}
            </div>
            {unreadCount > 0 && (
              <button
                onClick={() => markAllRead(items.map((i) => i.id))}
                className="flex items-center gap-1 text-[11px] font-medium text-slate-500 hover:text-brand-600 transition-colors dark:text-slate-400 dark:hover:text-brand-300"
              >
                <Check size={12} /> Mark all read
              </button>
            )}
          </div>

          {/* List */}
          <div className="max-h-[360px] overflow-y-auto divide-y divide-slate-50 dark:divide-white/5">
            {items.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <div className="w-12 h-12 rounded-2xl bg-slate-100 text-slate-300 flex items-center justify-center mb-3 dark:bg-white/5 dark:text-slate-500"><Inbox size={22} /></div>
                <p className="text-sm font-medium text-navy-800 dark:text-slate-200">You're all caught up</p>
                <p className="text-xs text-slate-400 mt-0.5">New activity will show up here</p>
              </div>
            ) : items.map((n) => {
              const isUnread = !readIds.includes(n.id);
              const Icon = n.icon;
              const row = (
                <div className={`flex items-start gap-3 px-4 py-3 transition-colors hover:bg-slate-50 dark:hover:bg-white/5 ${isUnread ? 'bg-brand-50/30 dark:bg-brand-500/10' : ''}`}>
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${toneClasses[n.tone]}`}>
                    <Icon size={15} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[13px] font-medium text-navy-900 dark:text-slate-100 leading-snug">{n.title}</p>
                    {n.subtitle && <p className="text-xs text-slate-500 dark:text-slate-400 truncate">{n.subtitle}</p>}
                    <p className="text-[11px] text-slate-400 mt-0.5">{formatDistanceToNow(new Date(n.time), { addSuffix: true })}</p>
                  </div>
                  <div className="flex flex-col items-end gap-1 flex-shrink-0">
                    {n.amount != null && <span className="text-xs font-bold text-brand-600 tnum">${n.amount.toLocaleString()}</span>}
                    {isUnread && <span className="w-2 h-2 rounded-full bg-brand-500" />}
                  </div>
                </div>
              );
              return n.slug ? (
                <Link key={n.id} to={`/campaigns/${n.slug}`} onClick={() => { markRead(n.id); setOpen(false); }}>{row}</Link>
              ) : (
                <div key={n.id} onClick={() => markRead(n.id)} className="cursor-pointer">{row}</div>
              );
            })}
          </div>

          {/* Footer */}
          <Link
            to="/dashboard"
            onClick={() => setOpen(false)}
            className="block text-center text-xs font-medium text-slate-500 hover:text-brand-600 py-3 border-t border-slate-100 transition-colors dark:text-slate-400 dark:hover:text-brand-300 dark:border-white/10"
          >
            View activity in dashboard
          </Link>
        </div>
      )}
    </div>
  );
}
