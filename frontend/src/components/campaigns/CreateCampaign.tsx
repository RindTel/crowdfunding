import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronRight, ChevronLeft, Plus, Trash2, Info, Check, Rocket } from 'lucide-react';
import { useCreateCampaign, useCategories } from '../../hooks/useApi';
import { Input, Textarea, Select, Button, Card } from '../../components/ui';
import toast from 'react-hot-toast';

interface RewardDraft {
  title: string; description: string; minimumAmount: string;
  maxClaims: string; estimatedDelivery: string;
}

const STEPS = ['Basics', 'Story', 'Rewards', 'Settings', 'Review'];

export function CreateCampaignPage() {
  const [step, setStep] = useState(0);
  const navigate = useNavigate();
  const createCampaign = useCreateCampaign();
  const { data: categoriesData } = useCategories();
  const categories = (categoriesData?.data as { id: string; name: string }[] | undefined) ?? [];

  const [form, setForm] = useState({
    title: '', categoryId: '', description: '',
    story: '', goalAmount: '', currency: 'USD',
    coverImageUrl: '', videoUrl: '', startDate: '',
    endDate: '', allowAnonymous: true, minDonation: '', maxDonation: '',
  });
  const [rewards, setRewards] = useState<RewardDraft[]>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const set = (k: string, v: unknown) => setForm(f => ({ ...f, [k]: v }));

  const validateStep = () => {
    const e: Record<string, string> = {};
    if (step === 0) {
      if (!form.title || form.title.length < 5) e.title = 'Title must be at least 5 characters';
      if (!form.categoryId) e.categoryId = 'Please select a category';
      if (!form.description || form.description.length < 20) e.description = 'Description must be at least 20 characters';
      if (!form.goalAmount || parseFloat(form.goalAmount) <= 0) e.goalAmount = 'Goal must be a positive number';
    }
    if (step === 1) {
      if (!form.story || form.story.length < 100) e.story = 'Story must be at least 100 characters';
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const nextStep = () => { if (validateStep()) setStep(s => Math.min(s + 1, STEPS.length - 1)); };
  const prevStep = () => setStep(s => Math.max(s - 1, 0));

  const addReward = () => setRewards(r => [...r, { title: '', description: '', minimumAmount: '', maxClaims: '', estimatedDelivery: '' }]);
  const removeReward = (i: number) => setRewards(r => r.filter((_, idx) => idx !== i));
  const setReward = (i: number, k: keyof RewardDraft, v: string) =>
    setRewards(r => r.map((rr, idx) => idx === i ? { ...rr, [k]: v } : rr));

  const handleSubmit = async () => {
    try {
      const payload = {
        title: form.title,
        categoryId: form.categoryId,
        description: form.description,
        story: form.story,
        goalAmount: parseFloat(form.goalAmount),
        currency: form.currency,
        coverImageUrl: form.coverImageUrl || undefined,
        videoUrl: form.videoUrl || undefined,
        startDate: form.startDate ? new Date(form.startDate).toISOString() : undefined,
        endDate: form.endDate ? new Date(form.endDate).toISOString() : undefined,
        allowAnonymous: form.allowAnonymous,
        minDonation: form.minDonation ? parseFloat(form.minDonation) : undefined,
        maxDonation: form.maxDonation ? parseFloat(form.maxDonation) : undefined,
      };
      const res = await createCampaign.mutateAsync(payload);
      toast.success('Campaign created successfully!');
      navigate(`/campaigns/${(res.data as { slug: string }).slug}`);
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message ?? 'Failed to create campaign';
      toast.error(msg);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-8">
        <p className="eyebrow eyebrow-rule mb-3"><Rocket size={12} /> New campaign</p>
        <h1 className="font-display text-display-sm font-extrabold text-navy-900 dark:text-slate-100 mb-2 tracking-tight">
          Set your campaign in type
        </h1>
        <p className="text-slate-600 dark:text-slate-300 text-[15px] leading-relaxed">
          Five short steps: the basics, your story, rewards, settings, then a review before it goes to press.
        </p>
      </div>

      {/* Stepper */}
      <div className="flex items-center gap-1 mb-8 overflow-x-auto pb-1">
        {STEPS.map((s, i) => (
          <div key={s} className="flex items-center gap-1 flex-shrink-0">
            <div className={`flex items-center gap-2 px-3.5 py-1.5 rounded-full font-display text-xs font-semibold transition-all duration-200 ${i === step ? 'bg-brand-600 text-white shadow-glow-sm' : i < step ? 'bg-brand-50 text-brand-700 border border-brand-200 dark:bg-brand-500/15 dark:text-brand-300 dark:border-brand-500/25' : 'bg-slate-100 dark:bg-white/10 text-slate-500 dark:text-slate-400'}`}>
              {i < step
                ? <span className="w-4 h-4 rounded-full bg-brand-600 text-white flex items-center justify-center"><Check size={10} strokeWidth={3} /></span>
                : <span className={`w-4 h-4 rounded-full border-2 flex items-center justify-center text-[10px] tnum ${i === step ? 'border-white/70' : 'border-slate-300 dark:border-white/15'}`}>{i + 1}</span>}
              {s}
            </div>
            {i < STEPS.length - 1 && <ChevronRight size={12} className="text-slate-300 dark:text-white/20" />}
          </div>
        ))}
      </div>

      <Card className="p-6">
        {/* Step 0: Basics */}
        {step === 0 && (
          <div className="space-y-4">
            <h2 className="font-display text-lg font-semibold text-navy-900 dark:text-slate-100 mb-4">The basics</h2>
            <Input
              label="Campaign title" required placeholder="Name the thing you are making"
              value={form.title} onChange={e => set('title', e.target.value)}
              error={errors.title}
            />
            <Select
              label="Category" required
              value={form.categoryId} onChange={e => set('categoryId', e.target.value)}
              error={errors.categoryId}
              options={[{ value: '', label: 'Select a category' }, ...categories.map(c => ({ value: c.id, label: c.name }))]}
            />
            <Textarea
              label="Short description" required rows={3}
              placeholder="One or two sentences a stranger would understand"
              value={form.description} onChange={e => set('description', e.target.value)}
              error={errors.description}
              hint={`${form.description.length}/500`}
            />
            <div className="grid grid-cols-2 gap-4">
              <Input
                label="Funding goal (USD)" required type="number" min="1"
                placeholder="10000"
                value={form.goalAmount} onChange={e => set('goalAmount', e.target.value)}
                error={errors.goalAmount}
                className="tnum"
              />
              <div>
                <label className="block font-display text-[13px] font-semibold text-navy-800 dark:text-slate-200 mb-1.5">Currency</label>
                <select
                  value={form.currency} onChange={e => set('currency', e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-white dark:bg-navy-950/60 border border-slate-200 dark:border-white/10 rounded-xl text-sm text-navy-900 dark:text-slate-100 shadow-inner-soft cursor-pointer focus:outline-none focus:ring-4 focus:ring-brand-100 focus:border-brand-400 dark:focus:ring-brand-500/20 dark:focus:border-brand-500 transition-all"
                >
                  {['USD', 'EUR', 'GBP', 'CAD', 'AUD'].map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
            </div>
            <Input
              label="Cover image URL" type="url" placeholder="https://"
              value={form.coverImageUrl} onChange={e => set('coverImageUrl', e.target.value)}
              hint="A real photo of your work reads as a poster, not a placeholder."
            />
          </div>
        )}

        {/* Step 1: Story */}
        {step === 1 && (
          <div className="space-y-4">
            <h2 className="font-display text-lg font-semibold text-navy-900 dark:text-slate-100 mb-4">Your story</h2>
            <div className="flex items-start gap-2.5 p-3.5 bg-brand-50 dark:bg-brand-500/10 rounded-xl border border-brand-100 dark:border-brand-500/20 text-sm text-brand-800 dark:text-brand-200">
              <Info size={16} className="flex-shrink-0 mt-0.5 text-brand-600 dark:text-brand-400" />
              <p className="leading-relaxed">Backers fund people, not pitches. Say why this matters to you, what the money buys, and what backers get for showing up early.</p>
            </div>
            <Textarea
              label="Full story" required rows={14}
              placeholder="Write it the way you would explain it to a friend: why this matters, where the funds go, and what backing it makes possible."
              value={form.story} onChange={e => set('story', e.target.value)}
              error={errors.story}
              hint={`${form.story.length} characters (100 minimum)`}
            />
            <Input
              label="Video URL (optional)" type="url" placeholder="https://youtube.com/watch?v="
              value={form.videoUrl} onChange={e => set('videoUrl', e.target.value)}
              hint="A short YouTube or Vimeo clip lets backers hear you in your own voice."
            />
          </div>
        )}

        {/* Step 2: Rewards */}
        {step === 2 && (
          <div className="space-y-4">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-display text-lg font-semibold text-navy-900 dark:text-slate-100">Backer rewards</h2>
              <Button variant="outline" size="sm" leftIcon={<Plus size={13} />} onClick={addReward}>
                Add reward
              </Button>
            </div>
            <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">Rewards are optional, but a clear tier gives backers a concrete reason to pledge more.</p>

            {rewards.length === 0 ? (
              <div className="border-2 border-dashed border-slate-200 dark:border-white/10 rounded-2xl p-8 text-center">
                <p className="text-slate-600 dark:text-slate-300 text-sm mb-3">No rewards yet.</p>
                <Button variant="secondary" size="sm" leftIcon={<Plus size={13} />} onClick={addReward}>
                  Add your first reward
                </Button>
              </div>
            ) : rewards.map((r, i) => (
              <div key={i} className="border border-slate-200 dark:border-white/10 rounded-2xl p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-display text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-500 dark:text-slate-400 tnum">Reward {i + 1}</span>
                  <button onClick={() => removeReward(i)} aria-label="Remove reward" className="p-1 text-slate-400 hover:text-rose-500 transition-colors">
                    <Trash2 size={14} />
                  </button>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <Input label="Title" placeholder="Early bird" value={r.title} onChange={e => setReward(i, 'title', e.target.value)} />
                  <Input label="Minimum pledge ($)" type="number" placeholder="25" value={r.minimumAmount} onChange={e => setReward(i, 'minimumAmount', e.target.value)} className="tnum" />
                </div>
                <Textarea label="Description" rows={2} placeholder="What does the backer receive?" value={r.description} onChange={e => setReward(i, 'description', e.target.value)} />
                <div className="grid grid-cols-2 gap-3">
                  <Input label="Max claims (optional)" type="number" placeholder="Unlimited" value={r.maxClaims} onChange={e => setReward(i, 'maxClaims', e.target.value)} className="tnum" />
                  <Input label="Est. delivery" type="month" value={r.estimatedDelivery} onChange={e => setReward(i, 'estimatedDelivery', e.target.value)} />
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Step 3: Settings */}
        {step === 3 && (
          <div className="space-y-4">
            <h2 className="font-display text-lg font-semibold text-navy-900 dark:text-slate-100 mb-4">Settings</h2>
            <div className="grid grid-cols-2 gap-4">
              <Input label="Start date" type="date" value={form.startDate} onChange={e => set('startDate', e.target.value)} />
              <Input label="End date" type="date" value={form.endDate} onChange={e => set('endDate', e.target.value)} hint="Leave blank for no deadline" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <Input label="Minimum donation ($)" type="number" placeholder="No minimum" value={form.minDonation} onChange={e => set('minDonation', e.target.value)} className="tnum" />
              <Input label="Maximum donation ($)" type="number" placeholder="No maximum" value={form.maxDonation} onChange={e => set('maxDonation', e.target.value)} className="tnum" />
            </div>
            <label className="flex items-center gap-3 cursor-pointer p-4 border border-slate-200 dark:border-white/10 rounded-xl hover:bg-slate-50 dark:hover:bg-white/5 transition-colors select-none">
              <div
                onClick={() => set('allowAnonymous', !form.allowAnonymous)}
                className={`w-10 h-[22px] rounded-full transition-colors flex items-center px-0.5 flex-shrink-0 ${form.allowAnonymous ? 'bg-brand-600' : 'bg-slate-300 dark:bg-white/15'}`}
              >
                <div className={`w-4 h-4 rounded-full bg-white shadow transition-transform duration-200 ${form.allowAnonymous ? 'translate-x-[18px]' : ''}`} />
              </div>
              <div>
                <p className="font-display text-sm font-medium text-navy-900 dark:text-slate-100">Allow anonymous donations</p>
                <p className="text-xs text-slate-600 dark:text-slate-400">Backers can choose to keep their name off the page.</p>
              </div>
            </label>
          </div>
        )}

        {/* Step 4: Review */}
        {step === 4 && (
          <div className="space-y-4">
            <h2 className="font-display text-lg font-semibold text-navy-900 dark:text-slate-100 mb-4">Review and send to press</h2>
            <div className="space-y-3 text-sm">
              {([
                ['Title', form.title || '—', false],
                ['Category', categories.find(c => c.id === form.categoryId)?.name ?? '—', false],
                ['Goal', `$${parseFloat(form.goalAmount || '0').toLocaleString()} ${form.currency}`, true],
                ['Rewards', `${rewards.length} reward(s)`, false],
                ['Anonymous donations', form.allowAnonymous ? 'Allowed' : 'Not allowed', false],
              ] as [string, string, boolean][]).map(([label, value, isMoney]) => (
                <div key={label} className="flex justify-between gap-4 py-2.5 border-b border-slate-100 dark:border-white/10">
                  <span className="text-slate-600 dark:text-slate-400">{label}</span>
                  <span className={`font-display font-semibold text-right ${isMoney ? 'text-brand-700 dark:text-brand-400 tnum' : 'text-navy-900 dark:text-slate-100'}`}>{value}</span>
                </div>
              ))}
            </div>
            <div className="flex items-start gap-2 p-3 bg-amber-50 dark:bg-amber-500/10 rounded-xl border border-amber-100 dark:border-amber-500/20 text-sm text-amber-800 dark:text-amber-200">
              <Info size={15} className="flex-shrink-0 mt-0.5 text-amber-600 dark:text-amber-400" />
              <p className="leading-relaxed">We review every campaign before it goes live. You will hear back once it is approved.</p>
            </div>
          </div>
        )}

        {/* Navigation */}
        <div className="flex items-center justify-between mt-8 pt-6 border-t border-slate-200/70 dark:border-white/10">
          <Button variant="ghost" onClick={prevStep} disabled={step === 0} leftIcon={<ChevronLeft size={15} />}>Back</Button>
          {step < STEPS.length - 1 ? (
            <Button onClick={nextStep} rightIcon={<ChevronRight size={15} />}>Continue</Button>
          ) : (
            <Button onClick={handleSubmit} loading={createCampaign.isPending} leftIcon={<Rocket size={15} />}>
              Publish campaign
            </Button>
          )}
        </div>
      </Card>
    </div>
  );
}
