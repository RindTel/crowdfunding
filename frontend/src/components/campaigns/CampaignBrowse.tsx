import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Users, Clock, Star, Search, SlidersHorizontal, Target, Loader2, Flame } from 'lucide-react';
import { useCampaigns, useCategories } from '../../hooks/useApi';
import type { Campaign } from '../../types';
import { ProgressBar, EmptyState } from '../../components/ui';

// ── Campaign Card ─────────────────────────────
export function CampaignCard({ campaign }: { campaign: Campaign }) {
  const daysLeft = campaign.endDate
    ? Math.max(0, Math.ceil((new Date(campaign.endDate).getTime() - Date.now()) / 86400000))
    : null;

  const funded = campaign.status === 'COMPLETED' || campaign.progressPercent >= 100;

  return (
    <Link to={`/campaigns/${campaign.slug}`} className="group block focus-visible:outline-none">
      <div className="bg-white dark:bg-navy-900 rounded-2xl border border-slate-200/70 dark:border-white/10 overflow-hidden shadow-card transition-all duration-300 ease-premium group-hover:-translate-y-1.5 group-hover:shadow-lift group-hover:border-brand-200 group-focus-visible:ring-2 group-focus-visible:ring-brand-400 group-focus-visible:ring-offset-2">
        {/* Cover */}
        <div className="relative aspect-[16/10] bg-gradient-to-br from-navy-100 to-navy-200 dark:from-navy-800 dark:to-navy-900 overflow-hidden">
          {campaign.coverImageUrl ? (
            <img
              src={campaign.coverImageUrl}
              alt={campaign.title}
              className="w-full h-full object-cover transition-transform duration-[600ms] ease-premium group-hover:scale-[1.06]"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-navy-300">
              <Target size={36} />
            </div>
          )}
          {/* legibility scrim */}
          <div className="absolute inset-0 bg-gradient-to-t from-navy-950/30 via-transparent to-transparent opacity-60" />

          {campaign.isFeatured && (
            <div className="absolute top-3 left-3">
              <span className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider bg-amber-400 text-amber-950 px-2.5 py-1 rounded-full shadow-sm">
                <Star size={9} className="fill-amber-950" /> Featured
              </span>
            </div>
          )}
          {funded && (
            <div className="absolute top-3 left-3">
              <span className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider bg-emerald-500 text-white px-2.5 py-1 rounded-full shadow-sm">
                <Flame size={9} /> Funded
              </span>
            </div>
          )}
          <div className="absolute top-3 right-3">
            <span className="text-[10px] font-semibold text-white bg-navy-950/45 backdrop-blur-md px-2.5 py-1 rounded-full border border-white/10">
              {campaign.category.name}
            </span>
          </div>
        </div>

        {/* Content */}
        <div className="p-5">
          <h3 className="font-display font-semibold text-[15px] leading-snug mb-1.5 line-clamp-2 text-navy-900 dark:text-slate-100 group-hover:text-brand-700 transition-colors">
            {campaign.title}
          </h3>
          <p className="text-[13px] text-slate-500 dark:text-slate-400 line-clamp-2 mb-4 leading-relaxed">{campaign.description}</p>

          <ProgressBar value={campaign.progressPercent} size="sm" color={funded ? 'emerald' : 'brand'} />

          <div className="flex items-end justify-between mt-3.5">
            <div>
              <p className="text-[17px] font-display font-bold text-navy-900 dark:text-slate-100 tnum leading-none">
                ${campaign.raisedAmount.toLocaleString()}
              </p>
              <p className="text-[11px] text-slate-400 mt-1">raised of ${campaign.goalAmount.toLocaleString()}</p>
            </div>
            <div className="text-right">
              <p className={`text-[17px] font-display font-bold tnum leading-none ${funded ? 'text-emerald-600' : 'text-brand-600'}`}>{campaign.progressPercent}%</p>
              <p className="text-[11px] text-slate-400 mt-1">funded</p>
            </div>
          </div>

          {/* Footer meta */}
          <div className="flex items-center justify-between mt-4 pt-4 border-t border-slate-100 dark:border-white/10">
            <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
              <Users size={12} className="text-slate-400" />
              <span className="font-medium text-slate-600 dark:text-slate-300">{campaign.donorsCount.toLocaleString()}</span> backers
            </div>
            {daysLeft !== null && daysLeft > 0 && (
              <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
                <Clock size={12} className="text-slate-400" />
                <span className="font-medium text-slate-600 dark:text-slate-300">{daysLeft}</span> days left
              </div>
            )}
            {(!daysLeft || daysLeft === 0) && !funded && (
              <span className="text-[11px] text-amber-600 font-semibold">Ending soon</span>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
}

// ── Browse Campaigns page ─────────────────────
const STATUS_OPTIONS = [
  { value: '', label: 'All statuses' },
  { value: 'ACTIVE', label: 'Active' },
  { value: 'COMPLETED', label: 'Completed' },
];

const SORT_OPTIONS = [
  { value: 'createdAt', label: 'Newest' },
  { value: 'raisedAmount', label: 'Most funded' },
  { value: 'donorsCount', label: 'Most backers' },
  { value: 'endDate', label: 'Ending soon' },
];

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
    <div className="max-w-7xl mx-auto px-5 py-12">
      {/* Header */}
      <div className="mb-10">
        <p className="eyebrow mb-2"><Flame size={12} /> Discover</p>
        <h1 className="text-display-sm sm:text-display font-display font-extrabold text-navy-900 dark:text-slate-100">Explore campaigns</h1>
        <p className="text-slate-500 dark:text-slate-400 mt-2 text-[15px]">Back the ideas building tomorrow — every contribution moves the needle.</p>
      </div>

      {/* Search + filters row */}
      <div className="flex flex-col gap-4 mb-8">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1 max-w-md">
            <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              value={search}
              onChange={e => { setSearch(e.target.value); setPage(1); }}
              placeholder="Search campaigns…"
              className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-navy-950/60 border border-slate-200 dark:border-white/10 rounded-xl text-sm text-navy-900 dark:text-slate-100 placeholder:text-slate-400 shadow-inner-soft focus:outline-none focus:ring-4 focus:ring-brand-100 focus:border-brand-400 transition-all"
            />
          </div>

          <div className="flex items-center gap-2.5">
            <div className="relative">
              <select
                value={sortBy}
                onChange={e => setSortBy(e.target.value)}
                className="appearance-none pl-3.5 pr-9 py-2.5 bg-white dark:bg-navy-950/60 border border-slate-200 dark:border-white/10 rounded-xl text-sm text-navy-800 dark:text-slate-200 font-medium shadow-inner-soft cursor-pointer focus:outline-none focus:ring-4 focus:ring-brand-100 focus:border-brand-400 transition-all"
              >
                {SORT_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>
            </div>

            <button
              onClick={() => setShowFilters(f => !f)}
              className={`flex items-center gap-2 px-3.5 py-2.5 border rounded-xl text-sm font-medium transition-all ${showFilters ? 'bg-brand-600 border-brand-600 text-white shadow-glow-sm' : 'bg-white dark:bg-white/5 border-slate-200 dark:border-white/10 text-navy-700 dark:text-slate-300 hover:border-slate-300 dark:hover:border-white/15 hover:bg-slate-50 dark:hover:bg-white/5'}`}
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
              <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2.5">Status</p>
              <div className="flex gap-2">
                {STATUS_OPTIONS.map(o => (
                  <button
                    key={o.value}
                    onClick={() => { setStatus(o.value); setPage(1); }}
                    className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${status === o.value ? 'bg-navy-900 dark:bg-brand-600 text-white' : 'bg-slate-100 dark:bg-white/10 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-white/15'}`}
                  >
                    {o.label}
                  </button>
                ))}
              </div>
            </div>

            {categories.length > 0 && (
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2.5">Category</p>
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => { setCategoryId(''); setPage(1); }}
                    className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${!categoryId ? 'bg-navy-900 dark:bg-brand-600 text-white' : 'bg-slate-100 dark:bg-white/10 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-white/15'}`}
                  >
                    All
                  </button>
                  {categories.map((c) => (
                    <button
                      key={c.id}
                      onClick={() => { setCategoryId(c.id); setPage(1); }}
                      className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${categoryId === c.id ? 'bg-navy-900 dark:bg-brand-600 text-white' : 'bg-slate-100 dark:bg-white/10 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-white/15'}`}
                    >
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
          <span className="font-semibold text-navy-800 dark:text-slate-200">{meta.total}</span> campaign{meta.total !== 1 ? 's' : ''} found
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
          title="No campaigns found"
          description="Try adjusting your filters or search terms"
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
            className="px-4 py-2 bg-white dark:bg-navy-950/60 border border-slate-200 dark:border-white/10 rounded-xl text-sm font-medium text-navy-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-white/5 hover:border-slate-300 dark:hover:border-white/15 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
          >
            Previous
          </button>
          {Array.from({ length: Math.min(meta.totalPages, 7) }, (_, i) => i + 1).map(p => (
            <button
              key={p}
              onClick={() => setPage(p)}
              className={`w-9 h-9 rounded-xl text-sm font-semibold transition-all ${p === page ? 'bg-brand-600 text-white shadow-glow-sm' : 'bg-white border border-slate-200 dark:border-white/10 text-navy-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-white/5'}`}
            >
              {p}
            </button>
          ))}
          <button
            disabled={!meta.hasNext}
            onClick={() => setPage(p => p + 1)}
            className="px-4 py-2 bg-white dark:bg-navy-950/60 border border-slate-200 dark:border-white/10 rounded-xl text-sm font-medium text-navy-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-white/5 hover:border-slate-300 dark:hover:border-white/15 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}
