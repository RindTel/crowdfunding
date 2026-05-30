import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  ArrowLeft, Heart, Users, Clock, DollarSign,
  CheckCircle, Award, ChevronRight, Loader2, Lock, ShieldCheck, BadgeCheck
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
      className={`p-4 rounded-xl border-2 cursor-pointer transition-all duration-200 ${
        isFull ? 'opacity-50 cursor-not-allowed border-slate-200 dark:border-white/10' :
        selected ? 'border-brand-500 bg-brand-50/60 dark:bg-brand-500/10 shadow-glow-sm' :
        'border-slate-200 dark:border-white/10 hover:border-brand-300 hover:bg-slate-50 dark:hover:bg-white/5'
      }`}
    >
      <div className="flex items-start justify-between gap-2 mb-2">
        <h4 className="font-semibold text-sm text-navy-900 dark:text-slate-100">{reward.title}</h4>
        <div className={`w-4 h-4 rounded-full border-2 flex-shrink-0 mt-0.5 flex items-center justify-center transition-colors ${selected ? 'border-brand-500 bg-brand-500' : 'border-slate-300 dark:border-white/15'}`}>
          {selected && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
        </div>
      </div>
      <p className="text-brand-600 font-bold text-sm mb-1.5 tnum">Pledge ${reward.minimumAmount.toLocaleString()}+</p>
      <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed mb-3">{reward.description}</p>

      <div className="flex items-center justify-between text-[11px] text-slate-400">
        {reward.estimatedDelivery && (
          <span>Est. {new Date(reward.estimatedDelivery).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}</span>
        )}
        {reward.maxClaims && (
          <span className={isFull ? 'text-rose-500 font-medium' : 'font-medium text-slate-500 dark:text-slate-400'}>
            {isFull ? 'Fully claimed' : `${reward.maxClaims - reward.claimsCount} left`}
          </span>
        )}
      </div>
      {!isMet && !isFull && (
        <p className="text-[11px] text-amber-600 mt-2 font-medium">⚡ Pledge ${(reward.minimumAmount - donationAmount).toFixed(0)} more to unlock</p>
      )}
    </div>
  );
}

// ── Donation Panel ────────────────────────────
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
      toast.success('Thank you for your donation! 🎉');
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message ?? 'Donation failed';
      toast.error(msg);
    }
  };

  if (step === 'done') {
    return (
      <div className="surface p-6 text-center sticky top-24 animate-scale-in">
        <div className="w-16 h-16 bg-emerald-100 dark:bg-emerald-500/15 rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse-ring">
          <CheckCircle size={32} className="text-emerald-600" />
        </div>
        <h3 className="text-lg font-bold text-navy-900 dark:text-slate-100 mb-2">Thank you!</h3>
        <p className="text-sm text-slate-500 dark:text-slate-400 mb-5">Your donation of <strong className="text-navy-900 dark:text-slate-100">${finalAmount.toLocaleString()}</strong> is making a difference.</p>
        <Button variant="secondary" fullWidth onClick={() => setStep('amount')}>
          Donate again
        </Button>
      </div>
    );
  }

  const daysLeft = campaign.endDate
    ? Math.max(0, Math.ceil((new Date(campaign.endDate).getTime() - Date.now()) / 86400000))
    : null;

  return (
    <div className="surface overflow-hidden sticky top-24">
      {/* Progress summary — navy headline block */}
      <div className="p-5 bg-gradient-to-br from-navy-900 to-navy-950 text-white">
        <div className="flex items-end justify-between mb-3">
          <div>
            <p className="text-[28px] font-display font-extrabold tnum leading-none">${campaign.raisedAmount.toLocaleString()}</p>
            <p className="text-[13px] text-slate-400 mt-1.5">pledged of ${campaign.goalAmount.toLocaleString()} goal</p>
          </div>
          <p className="text-2xl font-display font-bold text-brand-400 tnum">{campaign.progressPercent}%</p>
        </div>
        <div className="h-2.5 w-full bg-white/10 rounded-full overflow-hidden">
          <div
            className="h-full rounded-full bg-gradient-to-r from-brand-500 to-brand-400 shadow-[0_0_14px_rgba(45,212,191,0.6)] transition-[width] duration-[1100ms] ease-premium"
            style={{ width: `${Math.min(campaign.progressPercent, 100)}%` }}
          />
        </div>
        <div className="flex items-center justify-between mt-3.5 text-[13px] text-slate-300">
          <div className="flex items-center gap-1.5"><Users size={14} className="text-brand-400" /> {campaign.donorsCount.toLocaleString()} backers</div>
          {daysLeft !== null && (
            <div className="flex items-center gap-1.5"><Clock size={14} className="text-brand-400" /> {daysLeft} days left</div>
          )}
        </div>
      </div>

      <div className="p-5 space-y-5">
        {/* Amount presets */}
        <div>
          <p className="text-[13px] font-semibold text-navy-800 dark:text-slate-200 mb-2.5">Choose an amount</p>
          <div className="grid grid-cols-5 gap-1.5 mb-2.5">
            {presets.map(p => (
              <button
                key={p}
                onClick={() => { setAmount(p); setCustomAmount(''); }}
                className={`py-2.5 rounded-xl text-sm font-semibold tnum transition-all ${!customAmount && amount === p ? 'bg-brand-600 text-white shadow-glow-sm scale-[1.03]' : 'bg-slate-100 dark:bg-white/10 text-navy-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-white/15'}`}
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
              className="w-full pl-8 pr-3 py-2.5 bg-white dark:bg-navy-950/60 border border-slate-200 dark:border-white/10 rounded-xl text-sm text-navy-900 dark:text-slate-100 shadow-inner-soft focus:outline-none focus:ring-4 focus:ring-brand-100 focus:border-brand-400 transition-all"
            />
          </div>
        </div>

        {/* Rewards */}
        {campaign.rewards && campaign.rewards.length > 0 && (
          <div>
            <p className="text-[13px] font-semibold text-navy-800 dark:text-slate-200 mb-2.5">Select a reward</p>
            <div className="space-y-2.5 max-h-64 overflow-y-auto pr-1 -mr-1">
              <div
                onClick={() => setSelectedReward(null)}
                className={`p-3 rounded-xl border-2 cursor-pointer transition-all text-sm ${!selectedReward ? 'border-brand-500 bg-brand-50/60 dark:bg-brand-500/10' : 'border-slate-200 dark:border-white/10 hover:border-brand-300'}`}
              >
                <div className="flex items-center gap-2">
                  <div className={`w-4 h-4 rounded-full border-2 flex-shrink-0 flex items-center justify-center ${!selectedReward ? 'border-brand-500 bg-brand-500' : 'border-slate-300 dark:border-white/15'}`}>
                    {!selectedReward && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                  </div>
                  <span className="font-medium text-navy-800 dark:text-slate-200">No reward — just support</span>
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
            placeholder="Leave a message of support (optional)"
            value={message}
            onChange={e => setMessage(e.target.value)}
            maxLength={500}
            rows={2}
            className="w-full px-3.5 py-2.5 bg-white dark:bg-navy-950/60 border border-slate-200 dark:border-white/10 rounded-xl text-sm text-navy-900 dark:text-slate-100 resize-none shadow-inner-soft focus:outline-none focus:ring-4 focus:ring-brand-100 focus:border-brand-400 placeholder:text-slate-400 transition-all"
          />
          {campaign.allowAnonymous && (
            <label className="flex items-center gap-2.5 cursor-pointer select-none">
              <div
                onClick={() => setIsAnonymous(v => !v)}
                className={`w-9 h-5 rounded-full transition-colors flex items-center px-0.5 ${isAnonymous ? 'bg-brand-600' : 'bg-slate-300'}`}
              >
                <div className={`w-4 h-4 rounded-full bg-white shadow transition-transform duration-200 ${isAnonymous ? 'translate-x-4' : ''}`} />
              </div>
              <span className="text-sm text-slate-600 dark:text-slate-300">Donate anonymously</span>
            </label>
          )}
        </div>

        {/* CTA — the money action, with micro-interaction */}
        <button
          onClick={handleDonate}
          disabled={createDonation.isPending || !finalAmount}
          className="group/donate relative w-full flex items-center justify-center gap-2 py-3.5 bg-gradient-to-r from-brand-700 to-brand-600 hover:from-brand-600 hover:to-brand-500 text-white rounded-xl font-semibold text-[15px] shadow-glow hover:shadow-[0_16px_40px_-8px_rgba(13,148,136,0.6)] transition-all duration-200 ease-premium active:scale-[0.98] disabled:opacity-60 disabled:active:scale-100 overflow-hidden"
        >
          {/* shine sweep */}
          <span className="absolute inset-0 -translate-x-full group-hover/donate:translate-x-full transition-transform duration-700 ease-premium bg-gradient-to-r from-transparent via-white/25 to-transparent" />
          {createDonation.isPending
            ? <Loader2 size={17} className="animate-spin" />
            : <Heart size={17} className="transition-transform duration-200 group-hover/donate:scale-110 group-active/donate:scale-90" fill="currentColor" />}
          Back this project · <span className="tnum">${(finalAmount || 0).toLocaleString()}</span>
        </button>

        <div className="flex items-center justify-center gap-1.5 text-xs text-slate-400">
          <Lock size={11} /> Secure & encrypted payments
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
      <Link to="/campaigns" className="text-brand-600 font-medium text-sm mt-2 inline-block hover:text-brand-700">← Back to campaigns</Link>
    </div>
  );

  const c = data.data;
  const recentDonations = (recentData?.data as unknown[]) ?? [];

  return (
    <div className="max-w-6xl mx-auto px-5 py-10">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm mb-6 text-slate-400">
        <Link to="/campaigns" className="hover:text-navy-700 dark:text-slate-300 flex items-center gap-1.5 transition-colors font-medium">
          <ArrowLeft size={14} /> All campaigns
        </Link>
        <ChevronRight size={12} />
        <span className="text-slate-500 dark:text-slate-400 truncate max-w-xs">{c.title}</span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_372px] gap-8">
        {/* Left */}
        <div>
          {/* Cover */}
          <div className="rounded-2xl overflow-hidden aspect-video bg-gradient-to-br from-navy-100 to-navy-200 dark:from-navy-800 dark:to-navy-900 mb-6 shadow-card ring-1 ring-navy-900/5">
            {c.coverImageUrl ? (
              <img src={c.coverImageUrl} alt={c.title} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-navy-300">
                <Award size={48} />
              </div>
            )}
          </div>

          {/* Title + meta */}
          <div className="mb-6">
            <div className="flex items-center gap-2 mb-3">
              <Badge variant={c.status === 'ACTIVE' ? 'success' : c.status === 'COMPLETED' ? 'info' : 'default'}>
                {c.status}
              </Badge>
              <Badge variant="default">{c.category.name}</Badge>
              {c.isFeatured && <Badge variant="warning">⭐ Featured</Badge>}
            </div>
            <h1 className="text-3xl font-display font-extrabold text-navy-900 dark:text-slate-100 mb-3 leading-tight tracking-tight">{c.title}</h1>
            <p className="text-slate-600 dark:text-slate-300 leading-relaxed text-[15px]">{c.description}</p>
          </div>

          {/* Creator */}
          <div className="flex items-center gap-3 mb-8 p-4 rounded-2xl bg-white dark:bg-navy-900 border border-slate-200/70 dark:border-white/10 shadow-soft">
            <Avatar
              name={`${c.creator.user.firstName} ${c.creator.user.lastName}`}
              src={c.creator.user.avatarUrl}
              size="lg"
            />
            <div>
              <p className="text-sm font-semibold text-navy-900 dark:text-slate-100 flex items-center gap-1.5">
                {c.creator.user.firstName} {c.creator.user.lastName}
                {c.creator.isVerified && <BadgeCheck size={15} className="text-brand-500" />}
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-400">{c.creator.isVerified ? 'Verified creator' : 'Campaign creator'}</p>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex items-center gap-1 border-b border-slate-200 dark:border-white/10 mb-6">
            {([['story', 'Story'], ['updates', `Updates (${c.updates?.length ?? 0})`], ['comments', 'Comments']] as [string, string][]).map(([t, label]) => (
              <button
                key={t}
                onClick={() => setActiveTab(t as typeof activeTab)}
                className={`px-4 py-3 text-sm font-semibold border-b-2 -mb-px transition-colors ${activeTab === t ? 'border-brand-500 text-brand-700' : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-navy-700 dark:text-slate-300'}`}
              >
                {label}
              </button>
            ))}
          </div>

          {/* Tab content */}
          {activeTab === 'story' && (
            <div className="prose prose-slate max-w-none leading-relaxed text-[15px]">
              {c.story.split('\n').map((p, i) => p ? <p key={i}>{p}</p> : <br key={i} />)}
            </div>
          )}

          {activeTab === 'updates' && (
            <div className="space-y-4">
              {(c.updates ?? []).length === 0 ? (
                <p className="text-slate-500 dark:text-slate-400 text-sm py-8 text-center">No updates yet</p>
              ) : (c.updates ?? []).map(u => (
                <div key={u.id} className="p-5 bg-white dark:bg-navy-900 border border-slate-200/70 dark:border-white/10 rounded-2xl shadow-soft">
                  <p className="text-xs text-slate-400 mb-1">{new Date(u.createdAt).toLocaleDateString()}</p>
                  <h4 className="font-semibold text-navy-900 dark:text-slate-100 mb-2">{u.title}</h4>
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
            <ShieldCheck size={13} className="text-emerald-500" /> Protected by FundForge Backer Guarantee
          </div>

          {/* Recent donors */}
          {recentDonations.length > 0 && (
            <div className="mt-5 surface overflow-hidden">
              <div className="px-5 py-4 border-b border-slate-100 dark:border-white/10 flex items-center justify-between">
                <h3 className="text-sm font-semibold text-navy-900 dark:text-slate-100">Recent supporters</h3>
                <span className="flex items-center gap-1.5 text-xs text-emerald-600 font-medium">
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
                        <p className="text-xs font-semibold text-navy-800 dark:text-slate-200 truncate">
                          {donation.isAnonymous ? 'Anonymous' : `${donation.donor?.user?.firstName} ${donation.donor?.user?.lastName}`}
                        </p>
                        {donation.message && <p className="text-[11px] text-slate-400 truncate italic">"{donation.message}"</p>}
                      </div>
                      <div className="text-right">
                        <p className="text-xs font-bold text-brand-600 tnum">${Number(donation.amount).toLocaleString()}</p>
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
