import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  ArrowLeft, Heart, Users, Clock, DollarSign,
  CheckCircle, Award, ChevronRight, Loader2, Lock, ShieldCheck, BadgeCheck, Star, Zap
} from 'lucide-react';
import { useCampaignBySlug, useCreateDonation, useRecentDonations } from '../../hooks/useApi';
import type { Reward } from '../../types';
import { Badge, PageLoader, Button, Avatar } from '../../components/ui';
import { CommentsSection } from './CommentsSection';
import toast from 'react-hot-toast';
import { formatDistanceToNow } from 'date-fns';

// ── Reward Card ───────────────────────────────
function RewardCard({ reward, selected, onSelect, donationAmount }: {
  reward: Reward; selected: boolean; onSelect: () => void; donationAmount: number;
}) {
  const isMet = donationAmount >= reward.minimumAmount;
  const isFull = reward.maxClaims !== null && reward.claimsCount >= reward.maxClaims;

  return (
    <div
      onClick={() => !isFull && onSelect()}
      className={`p-4 rounded-xl border cursor-pointer transition-all duration-200 ${
        isFull ? 'opacity-50 cursor-not-allowed border-slate-200 dark:border-white/10' :
        selected ? 'border-brand-500 ring-1 ring-brand-500 bg-brand-50/60 dark:bg-brand-500/10' :
        'border-slate-200 dark:border-white/10 hover:border-brand-300 hover:bg-slate-50 dark:hover:bg-white/5'
      }`}
    >
      <div className="flex items-start justify-between gap-2 mb-2">
        <h4 className="font-display font-bold text-sm text-navy-900 dark:text-slate-100">{reward.title}</h4>
        <div className={`w-4 h-4 rounded-full border-2 flex-shrink-0 mt-0.5 flex items-center justify-center transition-colors ${selected ? 'border-brand-500 bg-brand-500' : 'border-slate-300 dark:border-white/15'}`}>
          {selected && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
        </div>
      </div>
      <p className="font-display text-brand-700 dark:text-brand-400 font-bold text-sm mb-1.5 tnum">Pledge ${reward.minimumAmount.toLocaleString()}+</p>
      <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed mb-3">{reward.description}</p>

      <div className="flex items-center justify-between text-[11px] text-slate-400">
        {reward.estimatedDelivery && (
          <span>Ships {new Date(reward.estimatedDelivery).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}</span>
        )}
        {reward.maxClaims && (
          <span className={isFull ? 'text-rose-500 font-semibold' : 'font-semibold text-slate-500 dark:text-slate-400 tnum'}>
            {isFull ? 'Fully claimed' : `${reward.maxClaims - reward.claimsCount} left`}
          </span>
        )}
      </div>
      {!isMet && !isFull && (
        <p className="inline-flex items-center gap-1 text-[11px] text-amber-600 dark:text-amber-400 mt-2 font-semibold">
          <Zap size={11} className="fill-current" /> Add ${(reward.minimumAmount - donationAmount).toFixed(0)} to unlock
        </p>
      )}
    </div>
  );
}

// ── Donation Panel ────────────────────────────
// The signature surface: a navy "press-black" header over a paper body.
// Expressive frame, unambiguous ledger numbers, one loud teal CTA.
function DonationPanel({ campaign }: { campaign: NonNullable<ReturnType<typeof useCampaignBySlug>['data']>['data'] }) {
  const [amount, setAmount] = useState(25);
  const [customAmount, setCustomAmount] = useState('');
  const [selectedReward, setSelectedReward] = useState<string | null>(null);
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [message, setMessage] = useState('');
  const [step, setStep] = useState<'amount' | 'details' | 'done'>('amount');
  const createDonation = useCreateDonation();

  const presets = [10, 25, 50, 100, 250];
  const finalAmount = customAmount ? parseFloat(customAmount) : amount;

  const handleDonate = async () => {
    if (!finalAmount || finalAmount <= 0) return toast.error('Please enter a valid amount');
    if (campaign.minDonation && finalAmount < campaign.minDonation) {
      return toast.error(`Minimum donation is $${campaign.minDonation}`);
    }

    try {
      await createDonation.mutateAsync({
        campaignId: campaign.id,
        amount: finalAmount,
        currency: campaign.currency,
        isAnonymous,
        message: message || undefined,
        rewardId: selectedReward || undefined,
        paymentProvider: 'stripe',
      });
      setStep('done');
      toast.success('Thank you for backing this campaign.');
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message ?? 'Donation failed';
      toast.error(msg);
    }
  };

  if (step === 'done') {
    return (
      <div className="surface p-7 text-center sticky top-24 animate-scale-in">
        <div className="w-16 h-16 bg-emerald-100 dark:bg-emerald-500/15 rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse-ring">
          <CheckCircle size={32} className="text-emerald-600 dark:text-emerald-400" />
        </div>
        <h3 className="font-display text-xl font-bold text-navy-900 dark:text-slate-100 mb-2">You're in.</h3>
        <p className="text-sm text-slate-500 dark:text-slate-400 mb-5 leading-relaxed">
          Your pledge of <strong className="font-display text-brand-700 dark:text-brand-400 tnum">${finalAmount.toLocaleString()}</strong> just moved this campaign forward.
        </p>
        <Button variant="secondary" fullWidth onClick={() => setStep('amount')}>
          Back it again
        </Button>
      </div>
    );
  }

  const daysLeft = campaign.endDate
    ? Math.max(0, Math.ceil((new Date(campaign.endDate).getTime() - Date.now()) / 86400000))
    : null;

  return (
    <div className="surface overflow-hidden sticky top-24">
      {/* Progress summary — navy press-black headline block */}
      <div className="p-6 bg-gradient-to-br from-navy-900 to-navy-950 text-white">
        <div className="flex items-end justify-between mb-3">
          <div>
            <p className="font-display text-[30px] font-extrabold tnum leading-none text-white">${campaign.raisedAmount.toLocaleString()}</p>
            <p className="text-[13px] text-slate-400 mt-2">pledged of <span className="tnum">${campaign.goalAmount.toLocaleString()}</span> goal</p>
          </div>
          <p className="font-display text-2xl font-bold text-brand-400 tnum leading-none">{campaign.progressPercent}%</p>
        </div>
        <div className="h-2.5 w-full bg-white/10 rounded-full overflow-hidden">
          <div
            className="h-full rounded-full bg-gradient-to-r from-brand-500 to-brand-400 shadow-[0_0_14px_rgba(45,212,191,0.6)] transition-[width] duration-[1100ms] ease-premium"
            style={{ width: `${Math.min(campaign.progressPercent, 100)}%` }}
          />
        </div>
        <div className="flex items-center justify-between mt-4 text-[13px] text-slate-300">
          <div className="flex items-center gap-1.5"><Users size={14} className="text-brand-400" /> <span className="tnum font-semibold">{campaign.donorsCount.toLocaleString()}</span> backers</div>
          {daysLeft !== null && (
            <div className="flex items-center gap-1.5"><Clock size={14} className="text-brand-400" /> <span className="tnum font-semibold">{daysLeft}</span> days left</div>
          )}
        </div>
      </div>

      <div className="p-5 space-y-5">
        {/* Amount presets */}
        <div>
          <p className="font-display text-[13px] font-semibold text-navy-800 dark:text-slate-200 mb-2.5">Choose an amount</p>
          <div className="grid grid-cols-5 gap-1.5 mb-2.5">
            {presets.map(p => (
              <button
                key={p}
                onClick={() => { setAmount(p); setCustomAmount(''); }}
                className={`py-2.5 rounded-xl font-display text-sm font-bold tnum transition-all ${!customAmount && amount === p ? 'bg-brand-600 text-white scale-[1.04]' : 'bg-slate-100 dark:bg-white/10 text-navy-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-white/15'}`}
              >
                ${p}
              </button>
            ))}
          </div>
          <div className="relative">
            <DollarSign size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="number"
              placeholder="Custom amount"
              value={customAmount}
              onChange={e => setCustomAmount(e.target.value)}
              className="w-full pl-8 pr-3 py-2.5 bg-white dark:bg-navy-950/60 border border-slate-200 dark:border-white/10 rounded-xl text-sm text-navy-900 dark:text-slate-100 tnum shadow-inner-soft focus:outline-none focus:ring-4 focus:ring-brand-100 focus:border-brand-400 dark:focus:ring-brand-500/20 transition-all"
            />
          </div>
        </div>

        {/* Rewards */}
        {campaign.rewards && campaign.rewards.length > 0 && (
          <div>
            <p className="font-display text-[13px] font-semibold text-navy-800 dark:text-slate-200 mb-2.5">Pick a reward</p>
            <div className="space-y-2.5 max-h-64 overflow-y-auto pr-1 -mr-1">
              <div
                onClick={() => setSelectedReward(null)}
                className={`p-3 rounded-xl border cursor-pointer transition-all text-sm ${!selectedReward ? 'border-brand-500 ring-1 ring-brand-500 bg-brand-50/60 dark:bg-brand-500/10' : 'border-slate-200 dark:border-white/10 hover:border-brand-300'}`}
              >
                <div className="flex items-center gap-2">
                  <div className={`w-4 h-4 rounded-full border-2 flex-shrink-0 flex items-center justify-center ${!selectedReward ? 'border-brand-500 bg-brand-500' : 'border-slate-300 dark:border-white/15'}`}>
                    {!selectedReward && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                  </div>
                  <span className="font-display font-medium text-navy-800 dark:text-slate-200">No reward, just back it</span>
                </div>
              </div>
              {campaign.rewards.map(r => (
                <RewardCard
                  key={r.id}
                  reward={r}
                  selected={selectedReward === r.id}
                  onSelect={() => setSelectedReward(r.id)}
                  donationAmount={finalAmount}
                />
              ))}
            </div>
          </div>
        )}

        {/* Message & anonymous */}
        <div className="space-y-3">
          <textarea
            placeholder="Leave a word for the creator (optional)"
            value={message}
            onChange={e => setMessage(e.target.value)}
            maxLength={500}
            rows={2}
            className="w-full px-3.5 py-2.5 bg-white dark:bg-navy-950/60 border border-slate-200 dark:border-white/10 rounded-xl text-sm text-navy-900 dark:text-slate-100 resize-none shadow-inner-soft focus:outline-none focus:ring-4 focus:ring-brand-100 focus:border-brand-400 dark:focus:ring-brand-500/20 placeholder:text-slate-400 transition-all"
          />
          {campaign.allowAnonymous && (
            <label className="flex items-center gap-2.5 cursor-pointer select-none">
              <div
                onClick={() => setIsAnonymous(v => !v)}
                className={`w-9 h-5 rounded-full transition-colors flex items-center px-0.5 ${isAnonymous ? 'bg-brand-600' : 'bg-slate-300 dark:bg-white/15'}`}
              >
                <div className={`w-4 h-4 rounded-full bg-white shadow transition-transform duration-200 ${isAnonymous ? 'translate-x-4' : ''}`} />
              </div>
              <span className="text-sm text-slate-600 dark:text-slate-300">Back anonymously</span>
            </label>
          )}
        </div>

        {/* CTA — the one money action, the one allowed glow + shine sweep */}
        <button
          onClick={handleDonate}
          disabled={createDonation.isPending || !finalAmount}
          className="group/donate relative w-full flex items-center justify-center gap-2 py-3.5 bg-gradient-to-r from-brand-700 to-brand-600 hover:from-brand-600 hover:to-brand-500 text-white rounded-xl font-display font-bold text-[15px] shadow-glow hover:shadow-[0_16px_40px_-8px_rgba(13,148,136,0.6)] transition-all duration-200 ease-premium active:scale-[0.98] disabled:opacity-60 disabled:active:scale-100 overflow-hidden"
        >
          {/* shine sweep */}
          <span className="absolute inset-0 -translate-x-full group-hover/donate:translate-x-full transition-transform duration-700 ease-premium bg-gradient-to-r from-transparent via-white/25 to-transparent" />
          {createDonation.isPending
            ? <Loader2 size={17} className="animate-spin" />
            : <Heart size={17} className="transition-transform duration-200 group-hover/donate:scale-110 group-active/donate:scale-90" fill="currentColor" />}
          Back this campaign · <span className="tnum">${(finalAmount || 0).toLocaleString()}</span>
        </button>

        <div className="flex items-center justify-center gap-1.5 text-xs text-slate-400">
          <Lock size={11} /> Secure, encrypted payments
        </div>
      </div>
    </div>
  );
}

// ── Campaign Detail Page ──────────────────────
export function CampaignDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const { data, isLoading } = useCampaignBySlug(slug!);
  const { data: recentData } = useRecentDonations(data?.data?.id ?? '');
  const [activeTab, setActiveTab] = useState<'story' | 'updates' | 'comments'>('story');

  if (isLoading) return <PageLoader />;
  if (!data?.data) return (
    <div className="text-center py-20">
      <p className="text-slate-500 dark:text-slate-400">Campaign not found</p>
      <Link to="/campaigns" className="text-brand-700 dark:text-brand-400 font-display font-semibold text-sm mt-2 inline-block hover:text-brand-800">Back to campaigns</Link>
    </div>
  );

  const c = data.data;
  const recentDonations = (recentData?.data as unknown[]) ?? [];
  const creatorName = `${c.creator.user.firstName} ${c.creator.user.lastName}`;
  const updates = (c as typeof c & { updates?: { id: string; title: string; content: string; createdAt: string }[] }).updates ?? [];

  return (
    <div className="max-w-6xl mx-auto px-5 py-10">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm mb-6 text-slate-400">
        <Link to="/campaigns" className="hover:text-navy-700 dark:hover:text-slate-200 flex items-center gap-1.5 transition-colors font-display font-medium">
          <ArrowLeft size={14} /> All campaigns
        </Link>
        <ChevronRight size={12} />
        <span className="text-slate-500 dark:text-slate-400 truncate max-w-xs">{c.title}</span>
      </div>

      {/* Title block — story first: category, headline, byline above the fold */}
      <header className="mb-6 max-w-3xl">
        <div className="flex items-center gap-2 mb-4">
          <Badge variant={c.status === 'ACTIVE' ? 'success' : c.status === 'COMPLETED' ? 'info' : 'default'}>{c.status}</Badge>
          <Badge variant="default">{c.category.name}</Badge>
          {c.isFeatured && <Badge variant="warning"><Star size={10} className="fill-current" /> Featured</Badge>}
        </div>
        <h1 className="font-display text-3xl sm:text-4xl font-extrabold text-navy-900 dark:text-slate-100 mb-4 leading-[1.05] tracking-tight text-balance">{c.title}</h1>
        <p className="text-slate-600 dark:text-slate-300 leading-relaxed text-[17px] mb-5">{c.description}</p>
        <div className="flex items-center gap-3">
          <Avatar name={creatorName} src={c.creator.user.avatarUrl} size="md" />
          <p className="text-sm text-slate-600 dark:text-slate-300">
            by <span className="font-display font-semibold text-navy-900 dark:text-slate-100">{creatorName}</span>
            {c.creator.isVerified && <BadgeCheck size={14} className="inline-block ml-1 -mt-0.5 text-brand-500" />}
          </p>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_372px] gap-8">
        {/* Left */}
        <div>
          {/* Cover */}
          <div className="rounded-2xl overflow-hidden aspect-video bg-gradient-to-br from-navy-700 to-navy-950 mb-8 shadow-card ring-1 ring-navy-900/5">
            {c.coverImageUrl ? (
              <img src={c.coverImageUrl} alt={c.title} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-brand-300/60">
                <Award size={48} strokeWidth={1.5} />
              </div>
            )}
          </div>

          {/* Creator bio block */}
          {c.creator.bio && (
            <div className="flex items-start gap-4 mb-8 p-5 rounded-2xl bg-white dark:bg-navy-900 border border-slate-200/70 dark:border-white/10 shadow-soft">
              <Avatar name={creatorName} src={c.creator.user.avatarUrl} size="lg" />
              <div>
                <p className="font-display text-sm font-bold text-navy-900 dark:text-slate-100 flex items-center gap-1.5">
                  {creatorName}
                  {c.creator.isVerified && <BadgeCheck size={15} className="text-brand-500" />}
                </p>
                <p className="text-xs text-slate-500 dark:text-slate-400 mb-2">{c.creator.isVerified ? 'Verified creator' : 'Campaign creator'}</p>
                <p className="voice text-[15px] leading-snug">{c.creator.bio}</p>
              </div>
            </div>
          )}

          {/* Tabs */}
          <div className="flex items-center gap-1 border-b border-slate-200 dark:border-white/10 mb-6">
            {([['story', 'Story'], ['updates', `Updates (${updates.length})`], ['comments', 'Comments']] as [string, string][]).map(([t, label]) => (
              <button
                key={t}
                onClick={() => setActiveTab(t as typeof activeTab)}
                className={`px-4 py-3 font-display text-sm font-semibold border-b-2 -mb-px transition-colors ${activeTab === t ? 'border-brand-500 text-brand-700 dark:text-brand-400' : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-navy-700 dark:hover:text-slate-200'}`}
              >
                {label}
              </button>
            ))}
          </div>

          {/* Tab content */}
          {activeTab === 'story' && (
            <div className="prose prose-slate max-w-none leading-relaxed text-[16px]">
              {c.story.split('\n').map((p, i) => p ? <p key={i}>{p}</p> : <br key={i} />)}
            </div>
          )}

          {activeTab === 'updates' && (
            <div className="space-y-4">
              {updates.length === 0 ? (
                <p className="text-slate-500 dark:text-slate-400 text-sm py-8 text-center">No updates yet. The creator hasn't posted news.</p>
              ) : updates.map(u => (
                <div key={u.id} className="p-5 bg-white dark:bg-navy-900 border border-slate-200/70 dark:border-white/10 rounded-2xl shadow-soft">
                  <p className="text-xs text-slate-400 mb-1">{new Date(u.createdAt).toLocaleDateString()}</p>
                  <h4 className="font-display font-bold text-navy-900 dark:text-slate-100 mb-2">{u.title}</h4>
                  <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">{u.content}</p>
                </div>
              ))}
            </div>
          )}

          {activeTab === 'comments' && (
            <CommentsSection campaignId={c.id} />
          )}
        </div>

        {/* Right — donation panel */}
        <div>
          <DonationPanel campaign={c} />

          {/* Trust strip */}
          <div className="mt-4 flex items-center justify-center gap-2 text-xs text-slate-400">
            <ShieldCheck size={13} className="text-emerald-500" /> Protected by the FundForge Backer Guarantee
          </div>

          {/* Recent donors */}
          {recentDonations.length > 0 && (
            <div className="mt-5 surface overflow-hidden">
              <div className="px-5 py-4 border-b border-slate-100 dark:border-white/10 flex items-center justify-between">
                <h3 className="font-display text-sm font-bold text-navy-900 dark:text-slate-100">Recent backers</h3>
                <span className="flex items-center gap-1.5 text-xs text-emerald-600 dark:text-emerald-400 font-semibold">
                  <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" /> Live
                </span>
              </div>
              <div className="divide-y divide-slate-100 dark:divide-white/10">
                {recentDonations.slice(0, 6).map((d: unknown, i) => {
                  const donation = d as { id: string; isAnonymous: boolean; donor?: { user?: { firstName?: string; lastName?: string } }; amount: number; createdAt: string; message?: string };
                  return (
                    <div key={i} className="flex items-center gap-3 px-5 py-3.5 hover:bg-slate-50/60 dark:hover:bg-white/5 transition-colors">
                      <Avatar
                        name={donation.isAnonymous ? 'Anonymous' : `${donation.donor?.user?.firstName ?? 'User'} ${donation.donor?.user?.lastName ?? ''}`}
                        size="sm"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="font-display text-xs font-semibold text-navy-800 dark:text-slate-200 truncate">
                          {donation.isAnonymous ? 'Anonymous' : `${donation.donor?.user?.firstName} ${donation.donor?.user?.lastName}`}
                        </p>
                        {donation.message && <p className="voice text-[11px] text-slate-400 truncate">"{donation.message}"</p>}
                      </div>
                      <div className="text-right">
                        <p className="font-display text-xs font-bold text-brand-700 dark:text-brand-400 tnum">${Number(donation.amount).toLocaleString()}</p>
                        <p className="text-[10px] text-slate-400">{formatDistanceToNow(new Date(donation.createdAt), { addSuffix: true })}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
