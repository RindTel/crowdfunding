import { Link, useNavigate } from 'react-router-dom';
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis,
  CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell
} from 'recharts';
import {
  Users, DollarSign, Target,
  Plus, Eye, Edit3, Star, Heart, Activity,
  CheckCircle, Clock, AlertCircle, ArrowUpRight, Trash2
} from 'lucide-react';
import { useAdminStats, useCreatorStats, useDonorStats, useCampaigns, useDeleteCampaign } from '../hooks/useApi';
import { useAuthStore } from '../store/auth.store';
import { Badge, PageLoader, EmptyState, Button, Card, ProgressBar, Avatar } from '../components/ui';
import type { Campaign, Donation, AdminStats, CreatorStats, DonorStats } from '../types';
import toast from 'react-hot-toast';

// ── Stat strip ────────────────────────────────
// A ledger-style strip, not the hero-metric template. Hairline dividers
// separate figures; money is teal + tabular, labels are quiet slate.
// `money` marks a figure as a currency amount (gets the teal ink).
type Stat = {
  icon: React.ElementType; label: string; value: string;
  money?: boolean; delta?: string; deltaUp?: boolean;
};

function StatStrip({ stats }: { stats: Stat[] }) {
  return (
    <Card className="p-0 overflow-hidden">
      <dl className="grid grid-cols-2 lg:grid-cols-4 divide-x divide-y lg:divide-y-0 divide-slate-100 dark:divide-white/10">
        {stats.map(({ icon: Icon, label, value, money, delta, deltaUp }) => (
          <div key={label} className="p-5">
            <dt className="flex items-center gap-2 text-[11px] font-display font-semibold uppercase tracking-[0.12em] text-slate-500 dark:text-slate-400">
              <Icon size={13} className="text-slate-400 dark:text-slate-500" />
              {label}
            </dt>
            <dd className="mt-2.5 flex items-baseline gap-2">
              <span className={`font-display text-2xl font-bold tnum leading-none ${money ? 'text-brand-700 dark:text-brand-400' : 'text-navy-900 dark:text-slate-100'}`}>
                {value}
              </span>
              {delta && (
                <span className={`inline-flex items-center gap-0.5 text-[11px] font-display font-semibold tnum ${deltaUp ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}`}>
                  <ArrowUpRight size={11} className={!deltaUp ? 'rotate-90' : ''} />
                  {delta}
                </span>
              )}
            </dd>
          </div>
        ))}
      </dl>
    </Card>
  );
}

// ── Campaign row ──────────────────────────────
function CampaignRow({ campaign, onDelete }: { campaign: Campaign; onDelete?: (id: string) => void }) {
  const statusVariant: Record<string, 'success' | 'info' | 'default' | 'warning' | 'danger' | 'purple'> = {
    ACTIVE: 'success', COMPLETED: 'info', DRAFT: 'default',
    PAUSED: 'warning', CANCELLED: 'danger', PENDING_REVIEW: 'purple',
  };
  const statusLabel: Record<string, string> = {
    ACTIVE: 'Active', COMPLETED: 'Funded', DRAFT: 'Draft',
    PAUSED: 'Paused', CANCELLED: 'Cancelled', PENDING_REVIEW: 'In review',
  };
  return (
    <tr className="hover:bg-slate-50/70 dark:hover:bg-white/5 transition-colors">
      <td className="px-5 py-3.5">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-slate-100 dark:bg-white/5 flex-shrink-0 overflow-hidden ring-1 ring-slate-200/70 dark:ring-white/10">
            {campaign.coverImageUrl ? (
              <img src={campaign.coverImageUrl} alt={campaign.title} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-slate-400 dark:text-slate-500"><Target size={14} /></div>
            )}
          </div>
          <div>
            <p className="font-display text-sm font-semibold text-navy-900 dark:text-slate-100 flex items-center gap-1.5">
              {campaign.title.length > 32 ? campaign.title.slice(0, 32) + '…' : campaign.title}
              {campaign.isFeatured && <Star size={11} className="text-amber-400 fill-amber-400" />}
            </p>
            <p className="text-xs text-slate-500 dark:text-slate-400">{campaign.category.name}</p>
          </div>
        </div>
      </td>
      <td className="px-5 py-3.5">
        <div className="w-28">
          <div className="flex justify-between text-xs mb-1.5">
            <span className="font-display font-semibold text-brand-700 dark:text-brand-400 tnum">{campaign.progressPercent}%</span>
          </div>
          <ProgressBar value={campaign.progressPercent} size="sm" color={campaign.status === 'COMPLETED' ? 'emerald' : 'brand'} />
        </div>
      </td>
      <td className="px-5 py-3.5">
        <p className="font-display text-sm font-bold text-brand-700 dark:text-brand-400 tnum">${campaign.raisedAmount.toLocaleString()}</p>
        <p className="text-xs text-slate-500 dark:text-slate-400 tnum">of ${campaign.goalAmount.toLocaleString()}</p>
      </td>
      <td className="px-5 py-3.5">
        <span className="font-display text-sm font-semibold text-slate-700 dark:text-slate-300 tnum">{campaign.donorsCount}</span>
      </td>
      <td className="px-5 py-3.5">
        <Badge variant={statusVariant[campaign.status] ?? 'default'}>{statusLabel[campaign.status] ?? campaign.status}</Badge>
      </td>
      <td className="px-5 py-3.5">
        <div className="flex items-center gap-1">
          <Link to={`/campaigns/${campaign.slug}`} aria-label="View campaign" className="p-1.5 text-slate-500 dark:text-slate-400 hover:text-brand-600 hover:bg-brand-50 dark:hover:bg-brand-500/10 rounded-lg transition-colors"><Eye size={14} /></Link>
          <Link to={`/dashboard/campaigns/${campaign.id}/edit`} aria-label="Edit campaign" className="p-1.5 text-slate-500 dark:text-slate-400 hover:text-navy-900 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-white/10 rounded-lg transition-colors"><Edit3 size={14} /></Link>
          {onDelete && (
            <button onClick={() => onDelete(campaign.id)} aria-label="Delete campaign" className="p-1.5 text-slate-500 dark:text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-500/15 rounded-lg transition-colors">
              <Trash2 size={14} />
            </button>
          )}
        </div>
      </td>
    </tr>
  );
}

// ── Admin Dashboard ───────────────────────────
function AdminDashboard() {
  const { data, isLoading } = useAdminStats();
  if (isLoading) return <PageLoader />;
  const stats = data?.data as AdminStats | undefined;
  if (!stats) return null;

  const categoryColors = ['#14b8a6', '#f59e0b', '#10b981', '#ef4444', '#2b4e80'];

  return (
    <div className="space-y-6">
      <StatStrip stats={[
        { icon: DollarSign, label: 'Total revenue', value: `$${Number(stats.totalRevenue).toLocaleString()}`, money: true },
        { icon: Target, label: 'Active campaigns', value: String(stats.activeCampaigns) },
        { icon: Users, label: 'Total users', value: stats.totalUsers.toLocaleString() },
        { icon: Heart, label: 'Donations', value: stats.totalDonations.toLocaleString() },
      ]} />

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-5">
        <Card className="xl:col-span-2 p-5">
          <h3 className="font-display text-sm font-bold text-navy-900 dark:text-slate-100 mb-4">Revenue (12 months)</h3>
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={stats.topCampaigns.map((c) => ({ name: c.title?.slice(0, 12), value: Number(c.raisedAmount) }))}>
              <defs>
                <linearGradient id="g1" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#14b8a6" stopOpacity={0.18} />
                  <stop offset="95%" stopColor="#14b8a6" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#94a3b81f" />
              <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ borderRadius: 10, border: '1px solid #e2e8f0', fontSize: 12 }} />
              <Area type="monotone" dataKey="value" stroke="#14b8a6" strokeWidth={2} fill="url(#g1)" dot={false} />
            </AreaChart>
          </ResponsiveContainer>
        </Card>

        <Card className="p-5">
          <h3 className="font-display text-sm font-bold text-navy-900 dark:text-slate-100 mb-4">By Status</h3>
          <ResponsiveContainer width="100%" height={140}>
            <PieChart>
              <Pie data={stats.campaignsByStatus} cx="50%" cy="50%" innerRadius={40} outerRadius={65} paddingAngle={3} dataKey="_count.id" nameKey="status">
                {stats.campaignsByStatus.map((_: unknown, i: number) => <Cell key={i} fill={categoryColors[i % 5]} />)}
              </Pie>
              <Tooltip formatter={(v: number) => v} contentStyle={{ borderRadius: 8, border: '1px solid #e2e8f0', fontSize: 11 }} />
            </PieChart>
          </ResponsiveContainer>
          <div className="space-y-1.5 mt-2">
            {stats.campaignsByStatus.map((s: { status: string; _count: { id: number } }, i: number) => (
              <div key={s.status} className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-1.5">
                  <div className="w-2 h-2 rounded-full" style={{ background: categoryColors[i % 5] }} />
                  <span className="text-slate-500 dark:text-slate-400">{s.status}</span>
                </div>
                <span className="font-semibold text-navy-800 dark:text-slate-200 tnum">{s._count.id}</span>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Recent donations */}
      <Card className="overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-50 dark:border-white/10">
          <h3 className="font-display text-sm font-bold text-navy-900 dark:text-slate-100">Recent Donations</h3>
          <span className="flex items-center gap-1 text-xs text-emerald-600">
            <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" /> Live
          </span>
        </div>
        <div className="divide-y divide-slate-100 dark:divide-white/10">
          {stats.recentDonations.slice(0, 8).map((d: Donation) => (
            <div key={d.id} className="flex items-center gap-3 px-5 py-3">
              <Avatar name={d.isAnonymous ? 'Anon' : `${(d as unknown as { donor?: { user?: { firstName?: string; lastName?: string } } }).donor?.user?.firstName ?? 'User'} ${(d as unknown as { donor?: { user?: { firstName?: string; lastName?: string } } }).donor?.user?.lastName ?? ''}`} size="sm" />
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold text-navy-800 dark:text-slate-200">{d.isAnonymous ? 'Anonymous' : 'Donor'}</p>
                <p className="text-[11px] text-slate-400 truncate">{d.campaign?.title}</p>
              </div>
              <span className="text-sm font-bold text-brand-600 tnum">${Number(d.amount).toLocaleString()}</span>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}

// ── Creator Dashboard ─────────────────────────
function CreatorDashboard() {
  const { data, isLoading } = useCreatorStats();
  if (isLoading) return <PageLoader />;
  const stats = data?.data as CreatorStats | undefined;
  if (!stats) return null;

  return (
    <div className="space-y-6">
      <StatStrip stats={[
        { icon: DollarSign, label: 'Total raised', value: `$${Number(stats.totalRaised).toLocaleString()}`, money: true },
        { icon: Heart, label: 'Donations', value: stats.totalDonations.toLocaleString() },
        { icon: Target, label: 'Campaigns', value: String(stats.campaigns.length) },
        { icon: Activity, label: 'Active', value: String(stats.campaigns.filter((c: Campaign) => c.status === 'ACTIVE').length) },
      ]} />

      {stats.monthlyRevenue.length > 0 && (
        <Card className="p-5">
          <h3 className="font-display text-sm font-bold text-navy-900 dark:text-slate-100 mb-4">Monthly Revenue</h3>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={stats.monthlyRevenue}>
              <CartesianGrid strokeDasharray="3 3" stroke="#94a3b81f" />
              <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ borderRadius: 10, border: '1px solid #e2e8f0', fontSize: 12 }} />
              <Bar dataKey="revenue" fill="#14b8a6" radius={[5, 5, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </Card>
      )}

      <Card className="overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-50 dark:border-white/10">
          <h3 className="font-display text-sm font-bold text-navy-900 dark:text-slate-100">My Campaigns</h3>
          <Link to="/dashboard/campaigns/new">
            <Button size="sm" leftIcon={<Plus size={13} />}>New Campaign</Button>
          </Link>
        </div>
        {stats.campaigns.length === 0 ? (
          <EmptyState icon={<Target size={36} />} title="No campaigns yet" description="Create your first campaign to start raising funds" action={<Link to="/dashboard/campaigns/new"><Button size="sm">Create Campaign</Button></Link>} />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead><tr className="bg-slate-50/70 dark:bg-white/5 border-b border-slate-100 dark:border-white/10">
                {['Campaign', 'Progress', 'Raised', 'Donors', 'Status', ''].map(h => (
                  <th key={h} className="text-left text-[11px] font-semibold uppercase tracking-wider text-slate-400 px-5 py-3">{h}</th>
                ))}
              </tr></thead>
              <tbody className="divide-y divide-slate-100 dark:divide-white/10">
                {stats.campaigns.map((c: Campaign) => <CampaignRow key={c.id} campaign={c} />)}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
}

// ── Donor Dashboard ───────────────────────────
function DonorDashboard() {
  const { data, isLoading } = useDonorStats();
  if (isLoading) return <PageLoader />;
  const stats = data?.data as DonorStats | undefined;
  if (!stats) return null;

  return (
    <div className="space-y-6">
      <StatStrip stats={[
        { icon: DollarSign, label: 'Total backed', value: `$${Number(stats.totalDonated).toLocaleString()}`, money: true },
        { icon: Heart, label: 'Pledges made', value: String(stats.totalDonations) },
        { icon: Target, label: 'Campaigns backed', value: String(stats.supportedCampaigns) },
      ]} />

      <Card className="overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-50 dark:border-white/10">
          <h3 className="font-display text-sm font-bold text-navy-900 dark:text-slate-100">Donation History</h3>
        </div>
        {stats.donations.length === 0 ? (
          <EmptyState icon={<Heart size={36} />} title="No donations yet" description="Explore campaigns and make your first contribution" action={<Link to="/campaigns"><Button size="sm" variant="secondary">Browse campaigns</Button></Link>} />
        ) : (
          <div className="divide-y divide-slate-100 dark:divide-white/10">
            {stats.donations.map((d: Donation) => {
              const statusIcon = d.status === 'COMPLETED' ? <CheckCircle size={14} className="text-emerald-500" /> :
                d.status === 'PENDING' ? <Clock size={14} className="text-amber-500" /> :
                <AlertCircle size={14} className="text-rose-500" />;
              return (
                <div key={d.id} className="flex items-center gap-4 px-5 py-4">
                  <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-navy-700 to-navy-950 flex-shrink-0 overflow-hidden ring-1 ring-navy-900/5 dark:ring-white/10">
                    {d.campaign?.coverImageUrl ? (
                      <img src={d.campaign.coverImageUrl} alt="" className="w-full h-full object-cover" />
                    ) : <div className="w-full h-full flex items-center justify-center text-brand-300/70"><Target size={14} /></div>}
                  </div>
                  <div className="flex-1 min-w-0">
                    <Link to={`/campaigns/${d.campaign?.slug}`} className="text-sm font-semibold text-navy-900 dark:text-slate-100 hover:text-brand-600 transition-colors truncate block">
                      {d.campaign?.title}
                    </Link>
                    {d.reward && <p className="text-xs text-brand-600 mt-0.5">Reward: {d.reward.title}</p>}
                    {d.message && <p className="text-xs text-slate-400 italic mt-0.5 truncate">"{d.message}"</p>}
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="text-sm font-bold text-navy-900 dark:text-slate-100 tnum">${Number(d.amount).toLocaleString()}</p>
                    <div className="flex items-center gap-1 justify-end mt-0.5">
                      {statusIcon}
                      <span className="text-xs text-slate-400">{new Date(d.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </Card>

      <div className="text-center">
        <Link to="/campaigns">
          <Button variant="secondary" leftIcon={<Target size={14} />}>Explore more campaigns</Button>
        </Link>
      </div>
    </div>
  );
}

// ── Dashboard Router ──────────────────────────
export function DashboardOverviewPage() {
  const { user } = useAuthStore();
  const name = user?.firstName ?? 'there';
  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening';

  return (
    <div>
      <div className="mb-7">
        <h1 className="text-display-sm font-display font-extrabold text-navy-900 dark:text-slate-100">{greeting}, {name}.</h1>
        <p className="text-[15px] text-slate-500 dark:text-slate-400 mt-1">A quick read on what is moving today.</p>
      </div>
      {user?.roles.includes('ADMIN') && <AdminDashboard />}
      {!user?.roles.includes('ADMIN') && user?.roles.includes('CREATOR') && <CreatorDashboard />}
      {!user?.roles.includes('ADMIN') && !user?.roles.includes('CREATOR') && <DonorDashboard />}
    </div>
  );
}

// ── Campaigns management page ─────────────────
export function DashboardCampaignsPage() {
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const deleteCampaign = useDeleteCampaign();
  const { data, isLoading } = useCampaigns(
    user?.roles.includes('ADMIN') ? {} : { creatorId: user?.id }
  );
  const campaigns = (data?.data ?? []) as Campaign[];

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this campaign?')) return;
    try {
      await deleteCampaign.mutateAsync(id);
      toast.success('Campaign deleted');
    } catch { toast.error('Failed to delete'); }
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-display font-extrabold text-navy-900 dark:text-slate-100">Campaigns</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">{campaigns.length} total</p>
        </div>
        {user?.roles.includes('CREATOR') && (
          <Button leftIcon={<Plus size={14} />} onClick={() => navigate('/dashboard/campaigns/new')}>
            New Campaign
          </Button>
        )}
      </div>

      <Card className="overflow-hidden">
        {isLoading ? <PageLoader /> : campaigns.length === 0 ? (
          <EmptyState icon={<Target size={40} />} title="No campaigns yet" action={
            user?.roles.includes('CREATOR') ? (
              <Button size="sm" onClick={() => navigate('/dashboard/campaigns/new')} leftIcon={<Plus size={13} />}>Create Campaign</Button>
            ) : undefined
          } />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead><tr className="bg-slate-50/70 dark:bg-white/5 border-b border-slate-100 dark:border-white/10">
                {['Campaign', 'Progress', 'Raised', 'Donors', 'Status', ''].map(h => (
                  <th key={h} className="text-left text-[11px] font-semibold uppercase tracking-wider text-slate-400 px-5 py-3">{h}</th>
                ))}
              </tr></thead>
              <tbody className="divide-y divide-slate-100 dark:divide-white/10">
                {campaigns.map(c => <CampaignRow key={c.id} campaign={c} onDelete={handleDelete} />)}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
}

// ── Settings page ─────────────────────────────
export function DashboardSettingsPage() {
  const { user } = useAuthStore();
  return (
    <div className="max-w-lg space-y-6">
      <div>
        <h2 className="text-2xl font-display font-extrabold text-navy-900 dark:text-slate-100">Settings</h2>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Manage your account preferences</p>
      </div>
      <Card className="p-6">
        <h3 className="font-display text-sm font-bold text-navy-900 dark:text-slate-100 mb-4">Profile</h3>
        <div className="flex items-center gap-4 mb-5">
          <Avatar name={`${user?.firstName} ${user?.lastName}`} size="lg" />
          <Button variant="outline" size="sm">Change avatar</Button>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-[13px] font-semibold text-navy-800 dark:text-slate-200 mb-1.5">First name</label>
            <input defaultValue={user?.firstName} className="w-full px-3.5 py-2.5 bg-white dark:bg-navy-950/60 border border-slate-200 dark:border-white/10 rounded-xl text-sm text-navy-900 dark:text-slate-100 shadow-inner-soft focus:outline-none focus:ring-4 focus:ring-brand-100 focus:border-brand-400 transition-all" />
          </div>
          <div>
            <label className="block text-[13px] font-semibold text-navy-800 dark:text-slate-200 mb-1.5">Last name</label>
            <input defaultValue={user?.lastName} className="w-full px-3.5 py-2.5 bg-white dark:bg-navy-950/60 border border-slate-200 dark:border-white/10 rounded-xl text-sm text-navy-900 dark:text-slate-100 shadow-inner-soft focus:outline-none focus:ring-4 focus:ring-brand-100 focus:border-brand-400 transition-all" />
          </div>
        </div>
        <div className="mt-3">
          <label className="block text-[13px] font-semibold text-navy-800 dark:text-slate-200 mb-1.5">Email</label>
          <input defaultValue={user?.email} disabled className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl text-sm text-slate-500 dark:text-slate-400 cursor-not-allowed" />
        </div>
        <Button className="mt-5" size="sm">Save changes</Button>
      </Card>

      <Card className="p-5">
        <h3 className="font-display text-sm font-bold text-navy-900 dark:text-slate-100 mb-4">Roles</h3>
        <div className="flex flex-wrap gap-2">
          {user?.roles.map(r => <Badge key={r} variant={r === 'ADMIN' ? 'danger' : r === 'CREATOR' ? 'purple' : 'info'}>{r}</Badge>)}
        </div>
      </Card>
    </div>
  );
}
