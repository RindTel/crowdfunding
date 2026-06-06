import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Users, Clock, Star, Search, SlidersHorizontal, Target, Loader2, Flame, BadgeCheck } from 'lucide-react';
import { useCampaigns, useCategories } from '../../hooks/useApi';
import type { Campaign } from '../../types';
import { ProgressBar, EmptyState, Avatar } from '../../components/ui';

// ── Campaign Card ─────────────────────────────
// The hero component. A poster, never a database row: full-bleed cover
// with a navy scrim, the creator's face and name overlaid (story first),
// then teal momentum and ledger figures (numbers second).
export function CampaignCard({ campaign }: { campaign: Campaign }) {
  const daysLeft = campaign.endDate
    ? Math.max(0, Math.ceil((new Date(campaign.endDate).getTime() - Date.now()) / 86400000))
    : null;

  const funded = campaign.status === 'COMPLETED' || campaign.progressPercent >= 100;
  const creatorName = `${campaign.creator?.user.firstName ?? ''} ${campaign.creator?.user.lastName ?? ''}`.trim() || 'A creator';

  return (
    <Link to={`/campaigns/${campaign.slug}`} className="group block focus-visible:outline-none">
      <article className="bg-white dark:bg-navy-900 rounded-xl border border-slate-200/70 dark:border-white/10 overflow-hidden shadow-card transition-all duration-300 ease-premium group-hover:-translate-y-1.5 group-hover:shadow-lift group-hover:border-brand-300 dark:group-hover:border-brand-500/40 group-focus-visible:ring-2 group-focus-visible:ring-brand-400 group-focus-visible:ring-offset-2 dark:group-focus-visible:ring-offset-navy-950">
        {/* Cover — full bleed with scrim + creator overlay */}
        <div className="scrim-strong relative aspect-[16/11] bg-gradient-to-br from-navy-700 to-navy-950 overflow-hidden">
          {campaign.coverImageUrl ? (
            <img
              src={campaign.coverImageUrl}
              alt={campaign.title}
              loading="lazy"
              className="w-full h-full object-cover transition-transform duration-[600ms] ease-premium group-hover:scale-[1.06]"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-brand-300/60">
              <Flame size={40} strokeWidth={1.5} />
            </div>
          )}

          {/* top-left status / category */}
          <div className="absolute top-3 left-3 z-10 flex items-center gap-2">
            {funded ? (
              <span className="inline-flex items-center gap-1 font-display text-[10px] font-bold uppercase tracking-[0.08em] bg-emerald-500 text-white px-2.5 py-1 rounded-full shadow-sm">
                <Flame size={9} strokeWidth={2.5} /> Funded
              </span>
            ) : campaign.isFeatured ? (
              <span className="inline-flex items-center gap-1 font-display text-[10px] font-bold uppercase tracking-[0.08em] bg-amber-400 text-amber-950 px-2.5 py-1 rounded-full shadow-sm">
                <Star size={9} className="fill-amber-950" /> Featured
              </span>
            ) : null}
          </div>
          <div className="absolute top-3 right-3 z-10">
            <span className="font-display text-[10px] font-semibold uppercase tracking-[0.06em] text-white bg-navy-950/50 backdrop-blur-md px-2.5 py-1 rounded-full border border-white/15">
              {campaign.category.name}
            </span>
          </div>

          {/* creator identity, overlaid on the scrim — story first */}
          <div className="absolute bottom-3 left-3 right-3 z-10 flex items-center gap-2">
            <Avatar name={creatorName} src={campaign.creator?.user.avatarUrl} size="sm" />
            <span className="font-display text-[13px] font-semibold text-white drop-shadow-sm truncate">{creatorName}</span>
            {campaign.creator?.isVerified && <BadgeCheck size={14} className="text-brand-300 flex-shrink-0" />}
          </div>
        </div>

        {/* Content */}
        <div className="p-5">
          <h3 className="font-display font-bold text-[17px] leading-[1.2] mb-3 line-clamp-2 text-navy-900 dark:text-slate-100 group-hover:text-brand-700 dark:group-hover:text-brand-300 transition-colors">
            {campaign.title}
          </h3>

          <ProgressBar value={campaign.progressPercent} size="sm" color={funded ? 'emerald' : 'brand'} />

          <div className="flex items-baseline justify-between mt-3.5">
            <p className="font-display tnum leading-none">
              <span className={`text-[19px] font-extrabold ${funded ? 'text-emerald-600 dark:text-emerald-400' : 'text-brand-700 dark:text-brand-400'}`}>
                ${campaign.raisedAmount.toLocaleString()}
              </span>
              <span className="text-[12px] font-medium text-slate-400 dark:text-slate-500"> of ${campaign.goalAmount.toLocaleString()}</span>
            </p>
            <p className={`font-display text-[15px] font-bold tnum leading-none ${funded ? 'text-emerald-600 dark:text-emerald-400' : 'text-brand-700 dark:text-brand-400'}`}>
              {campaign.progressPercent}%
            </p>
          </div>

          {/* Footer meta */}
          <div className="flex items-center justify-between mt-4 pt-4 border-t border-slate-100 dark:border-white/10 text-xs text-slate-500 dark:text-slate-400">
            <span className="inline-flex items-center gap-1.5">
              <Users size={12} className="text-slate-400" />
              <span className="font-display font-semibold text-slate-700 dark:text-slate-300 tnum">{campaign.donorsCount.toLocaleString()}</span> backers
            </span>
            {daysLeft !== null && daysLeft > 0 ? (
              <span className="inline-flex items-center gap-1.5">
                <Clock size={12} className="text-slate-400" />
                <span className="font-display font-semibold text-slate-700 dark:text-slate-300 tnum">{daysLeft}</span> days left
              </span>
            ) : !funded ? (
              <span className="font-display text-[11px] text-amber-600 dark:text-amber-400 font-semibold">Ending soon</span>
            ) : null}
          </div>
        </div>
      </article>
    </Link>
  );
}

// ── Browse Campaigns page ─────────────────────
const STATUS_OPTIONS = [
  { value: '', label: 'All' },
  { value: 'ACTIVE', label: 'Active' },
  { value: 'COMPLETED', label: 'Completed' },
];

const SORT_OPTIONS = [
  { value: 'createdAt', label: 'Newest' },
  { value: 'raisedAmount', label: 'Most funded' },
  { value: 'donorsCount', label: 'Most backers' },
  { value: 'endDate', label: 'Ending soon' },
];

const chipBase = 'px-3.5 py-1.5 rounded-lg font-display text-xs font-semibold transition-all';
const chipActive = 'bg-navy-900 dark:bg-brand-600 text-white';
const chipIdle = 'bg-slate-100 dark:bg-white/10 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-white/15';

export function CampaignsPage() {
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('ACTIVE');
  const [categoryId, setCategoryId] = useState('');
  const [sortBy, setSortBy] = useState('createdAt');
  const [page, setPage] = useState(1);
  const [showFilters, setShowFilters] = useState(false);

  const { data: campaignsData, isLoading } = useCampaigns({
    search: search || undefined,
    status: status || undefined,
    categoryId: categoryId || undefined,
    sortBy,
    sortOrder: 'desc',
    page,
    limit: 12,
  });

  const { data: categoriesData } = useCategories();
  const campaigns = campaignsData?.data ?? [];
  const meta = campaignsData?.meta;
  const categories = (categoriesData?.data as { id: string; name: string }[]) ?? [];

  return (
    <div className="max-w-7xl mx-auto px-5 py-12 lg:py-16">
      {/* Header — one eyebrow, poster headline */}
      <header className="mb-10 max-w-3xl">
        <p className="eyebrow eyebrow-rule mb-3">Open for backing</p>
        <h1 className="text-poster-sm font-display font-extrabold text-navy-900 dark:text-slate-100 text-balance">
          Back something a person <span className="text-accent">actually made.</span>
        </h1>
        <p className="text-slate-500 dark:text-slate-400 mt-4 text-[16px] leading-relaxed max-w-xl">
          Every campaign here was written, filmed, and pitched by its creator. Find one worth your money.
        </p>
      </header>

      {/* Search + sort row */}
      <div className="flex flex-col gap-4 mb-8">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1 max-w-md">
            <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              value={search}
              onChange={e => { setSearch(e.target.value); setPage(1); }}
              placeholder="Search campaigns, creators, ideas…"
              className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-navy-950/60 border border-slate-200 dark:border-white/10 rounded-xl text-sm text-navy-900 dark:text-slate-100 placeholder:text-slate-400 shadow-inner-soft focus:outline-none focus:ring-4 focus:ring-brand-100 focus:border-brand-400 dark:focus:ring-brand-500/20 transition-all"
            />
          </div>

          <div className="flex items-center gap-2.5">
            <select
              value={sortBy}
              onChange={e => setSortBy(e.target.value)}
              className="appearance-none pl-3.5 pr-9 py-2.5 bg-white dark:bg-navy-950/60 border border-slate-200 dark:border-white/10 rounded-xl text-sm text-navy-800 dark:text-slate-200 font-display font-medium shadow-inner-soft cursor-pointer focus:outline-none focus:ring-4 focus:ring-brand-100 focus:border-brand-400 dark:focus:ring-brand-500/20 transition-all"
              style={{
                backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='%2394a3b8' stroke-width='2.5' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'/%3E%3C/svg%3E")`,
                backgroundPosition: 'right 0.85rem center',
                backgroundRepeat: 'no-repeat',
              }}
            >
              {SORT_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>

            <button
              onClick={() => setShowFilters(f => !f)}
              className={`flex items-center gap-2 px-3.5 py-2.5 border rounded-xl text-sm font-display font-medium transition-all ${showFilters ? 'bg-brand-600 border-brand-600 text-white' : 'bg-white dark:bg-white/5 border-slate-200 dark:border-white/10 text-navy-700 dark:text-slate-300 hover:border-slate-300 dark:hover:border-white/15 hover:bg-slate-50 dark:hover:bg-white/5'}`}
            >
              <SlidersHorizontal size={14} /> Filters
              {(status || categoryId) && <span className="w-1.5 h-1.5 bg-amber-400 rounded-full" />}
            </button>
          </div>
        </div>

        {/* Expandable filter panel */}
        {showFilters && (
          <div className="flex flex-wrap gap-6 p-5 rounded-2xl border border-slate-200/70 dark:border-white/10 bg-white dark:bg-navy-900 shadow-card animate-fade-up">
            <div>
              <p className="font-display text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-500 dark:text-slate-400 mb-2.5">Status</p>
              <div className="flex gap-2">
                {STATUS_OPTIONS.map(o => (
                  <button key={o.value} onClick={() => { setStatus(o.value); setPage(1); }} className={`${chipBase} ${status === o.value ? chipActive : chipIdle}`}>
                    {o.label}
                  </button>
                ))}
              </div>
            </div>

            {categories.length > 0 && (
              <div>
                <p className="font-display text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-500 dark:text-slate-400 mb-2.5">Category</p>
                <div className="flex flex-wrap gap-2">
                  <button onClick={() => { setCategoryId(''); setPage(1); }} className={`${chipBase} ${!categoryId ? chipActive : chipIdle}`}>All</button>
                  {categories.map((c) => (
                    <button key={c.id} onClick={() => { setCategoryId(c.id); setPage(1); }} className={`${chipBase} ${categoryId === c.id ? chipActive : chipIdle}`}>
                      {c.name}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Results count */}
      {meta && (
        <p className="text-sm text-slate-500 dark:text-slate-400 mb-5">
          <span className="font-display font-bold text-navy-800 dark:text-slate-200 tnum">{meta.total}</span> campaign{meta.total !== 1 ? 's' : ''} open
        </p>
      )}

      {/* Grid */}
      {isLoading ? (
        <div className="flex items-center justify-center h-64">
          <Loader2 className="animate-spin text-brand-600" size={28} />
        </div>
      ) : campaigns.length === 0 ? (
        <EmptyState
          icon={<Target size={28} />}
          title="Nothing matches yet"
          description="Try a different search or clear your filters to see every open campaign."
        />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {campaigns.map((c) => (
            <CampaignCard key={c.id} campaign={c} />
          ))}
        </div>
      )}

      {/* Pagination */}
      {meta && meta.totalPages > 1 && (
        <div className="flex items-center justify-center gap-1.5 mt-12">
          <button
            disabled={!meta.hasPrev}
            onClick={() => setPage(p => p - 1)}
            className="px-4 py-2 bg-white dark:bg-navy-950/60 border border-slate-200 dark:border-white/10 rounded-xl text-sm font-display font-medium text-navy-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-white/5 hover:border-slate-300 dark:hover:border-white/15 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
          >
            Previous
          </button>
          {Array.from({ length: Math.min(meta.totalPages, 7) }, (_, i) => i + 1).map(p => (
            <button
              key={p}
              onClick={() => setPage(p)}
              className={`w-9 h-9 rounded-xl text-sm font-display font-semibold tnum transition-all ${p === page ? 'bg-brand-600 text-white' : 'bg-white dark:bg-navy-950/60 border border-slate-200 dark:border-white/10 text-navy-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-white/5'}`}
            >
              {p}
            </button>
          ))}
          <button
            disabled={!meta.hasNext}
            onClick={() => setPage(p => p + 1)}
            className="px-4 py-2 bg-white dark:bg-navy-950/60 border border-slate-200 dark:border-white/10 rounded-xl text-sm font-display font-medium text-navy-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-white/5 hover:border-slate-300 dark:hover:border-white/15 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}
