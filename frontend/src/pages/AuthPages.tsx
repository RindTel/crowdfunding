import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Flame, Eye, EyeOff, Mail, Lock, User, ArrowRight, ArrowLeft,
  Megaphone, HandCoins, Quote,
} from 'lucide-react';
import { useAuthStore } from '../store/auth.store';
import { Button, Input } from '../components/ui';
import toast from 'react-hot-toast';

// ── Brand mark (matches AppShell BrandMark visual idea) ──
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

// ── Wordmark — light variant for the navy press panel ──
function Wordmark() {
  return (
    <div className="leading-none">
      <span className="font-display font-extrabold text-[15px] tracking-tight text-white">
        Fund<span className="text-brand-400">Forge</span>
      </span>
      <div className="text-[9.5px] mt-1 uppercase tracking-[0.2em] text-brand-400/80 font-display font-semibold">
        The Campaign Press
      </div>
    </div>
  );
}

// ── Press panel ───────────────────────────────
// The editorial "press-black" half of the split screen. Navy in both
// modes (one panel, not a section flipping mid-page). Poster Sora headline
// with an Instrument Serif italic accent word, a creator pull-quote, and
// a strip of honest, tabular social proof.
function PressPanel({
  eyebrow,
  headline,
  accent,
  tail,
}: {
  eyebrow: string;
  headline: string;
  accent: string;
  tail: string;
}) {
  return (
    <div className="relative hidden lg:flex flex-col justify-between w-[44%] max-w-[640px] flex-shrink-0 overflow-hidden bg-navy-950 px-12 py-12 xl:px-16">
      {/* Press-black ground wash so the navy never reads flat */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          backgroundImage:
            'radial-gradient(48rem 48rem at 115% -10%, rgba(20,184,166,0.16), transparent 60%), radial-gradient(40rem 40rem at -15% 110%, rgba(36,63,104,0.55), transparent 60%)',
        }}
      />
      {/* Faint printer's rule grid for the "press" feel */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-[0.06]"
        style={{
          backgroundImage:
            'linear-gradient(rgba(255,255,255,0.6) 1px, transparent 1px)',
          backgroundSize: '100% 2.25rem',
        }}
      />

      <div className="relative">
        <Link to="/" className="inline-flex items-center gap-3 hover:opacity-90 transition-opacity">
          <BrandMark size={34} />
          <Wordmark />
        </Link>
      </div>

      <div className="relative">
        <p className="eyebrow eyebrow-rule text-brand-400 mb-6">{eyebrow}</p>
        <h1 className="text-poster-sm font-display text-white text-balance leading-[1.02]">
          {headline}{' '}
          <span className="text-accent text-[0.92em]">{accent}</span>{' '}
          {tail}
        </h1>

        <figure className="mt-9 max-w-md border-l-2 border-brand-500/50 pl-5">
          <Quote size={18} className="text-brand-400 mb-2" />
          <blockquote className="voice text-[1.15rem] leading-relaxed text-slate-200">
            We set the type, you set the goal. Nothing here is stock. Every
            campaign on the wall was written, shot, and shipped by the person
            running it.
          </blockquote>
          <figcaption className="mt-3 font-display text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-400">
            The FundForge Press Room
          </figcaption>
        </figure>
      </div>

      {/* Honest social proof — money is teal + tabular */}
      <div className="relative">
        <div className="grid grid-cols-3 gap-3 border-t border-white/10 pt-6">
          {([
            ['$2.4M', 'pledged', true],
            ['1,842', 'creators', false],
            ['156', 'live campaigns', false],
          ] as [string, string, boolean][]).map(([val, label, money]) => (
            <div key={label}>
              <p
                className={`font-display font-extrabold text-2xl tnum ${
                  money ? 'text-brand-400' : 'text-white'
                }`}
              >
                {val}
              </p>
              <p className="mt-1 text-[12px] text-slate-400">{label}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ── Small brand header for the form side (mobile + context) ──
function FormBrand() {
  return (
    <Link to="/" className="lg:hidden inline-flex items-center gap-2.5 mb-8 hover:opacity-90 transition-opacity">
      <BrandMark size={30} />
      <span className="font-display font-extrabold text-base tracking-tight text-navy-900 dark:text-slate-100">
        Fund<span className="text-brand-500">Forge</span>
      </span>
    </Link>
  );
}

// ── Login ─────────────────────────────────────
export function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const { login, isLoading } = useAuthStore();
  const navigate = useNavigate();

  const validate = () => {
    const e: Record<string, string> = {};
    if (!email) e.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(email)) e.email = 'Invalid email address';
    if (!password) e.password = 'Password is required';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    try {
      await login(email, password);
      toast.success('Welcome back!');
      navigate('/dashboard');
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message ?? 'Login failed';
      toast.error(msg);
    }
  };

  return (
    <div className="min-h-screen flex bg-white dark:bg-navy-950">
      <PressPanel
        eyebrow="Back to the press"
        headline="The campaigns you back"
        accent="are still"
        tail="running."
      />

      {/* Form side — calm, legible, light/dark aware */}
      <div className="flex-1 flex items-center justify-center px-6 py-12 sm:px-10">
        <div className="w-full max-w-sm">
          <FormBrand />

          <h2 className="font-display text-3xl font-extrabold text-navy-900 dark:text-slate-100 tracking-tight">
            Welcome back
          </h2>
          <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
            Sign in to check on your pledges and the campaigns you run.
          </p>

          <form onSubmit={handleSubmit} className="mt-8 space-y-4">
            <Input
              label="Email"
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="you@example.com"
              error={errors.email}
              leftAddon={<Mail size={15} />}
              autoComplete="email"
            />

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block font-display text-[13px] font-semibold text-navy-800 dark:text-slate-200">Password</label>
                <Link to="/forgot-password" className="font-display text-xs font-semibold text-brand-600 hover:text-brand-500 dark:text-brand-400 dark:hover:text-brand-300 transition-colors">
                  Forgot password?
                </Link>
              </div>
              <Input
                type={showPw ? 'text' : 'password'}
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="Your password"
                error={errors.password}
                leftAddon={<Lock size={15} />}
                autoComplete="current-password"
                rightAddon={
                  <button
                    type="button"
                    onClick={() => setShowPw(v => !v)}
                    aria-label={showPw ? 'Hide password' : 'Show password'}
                    className="p-1.5 text-slate-400 hover:text-navy-700 dark:hover:text-slate-200 transition-colors"
                  >
                    {showPw ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                }
              />
            </div>

            <Button
              type="submit"
              size="lg"
              fullWidth
              loading={isLoading}
              rightIcon={!isLoading ? <ArrowRight size={16} /> : undefined}
              className="mt-2"
            >
              Sign in
            </Button>
          </form>

          <p className="mt-6 text-center text-sm text-slate-600 dark:text-slate-400">
            New to the press?{' '}
            <Link to="/register" className="font-display font-semibold text-brand-600 hover:text-brand-500 dark:text-brand-400 dark:hover:text-brand-300 transition-colors">
              Create an account
            </Link>
          </p>

          {/* Demo accounts — quick sign-in for reviewers */}
          <div className="mt-8 rounded-2xl border border-slate-200/70 bg-slate-50 p-4 dark:border-white/10 dark:bg-white/5">
            <p className="font-display text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-500 dark:text-slate-400 mb-3">
              Demo accounts
            </p>
            <div className="space-y-2">
              {[
                { role: 'Admin', email: 'admin@fundforge.io' },
                { role: 'Creator', email: 'creator@fundforge.io' },
                { role: 'Donor', email: 'donor@fundforge.io' },
              ].map(({ role, email: e }) => (
                <button
                  key={role}
                  type="button"
                  onClick={() => { setEmail(e); setPassword('Admin123!'); }}
                  className="w-full flex items-center justify-between gap-3 px-3 py-2 rounded-xl bg-white border border-slate-200/70 hover:border-brand-300 hover:bg-brand-50/50 transition-colors text-left dark:bg-white/5 dark:border-white/10 dark:hover:border-brand-500/40 dark:hover:bg-white/10"
                >
                  <span className="font-display text-xs font-semibold text-navy-800 dark:text-slate-200">{role}</span>
                  <span className="font-mono text-xs text-slate-500 dark:text-slate-400">{e}</span>
                </button>
              ))}
            </div>
          </div>

          <p className="mt-8 text-center text-xs text-slate-400 dark:text-slate-500">
            Printed and pledged since {new Date().getFullYear()}.
          </p>
        </div>
      </div>
    </div>
  );
}

// ── Register ──────────────────────────────────
type Role = 'CREATOR' | 'DONOR';

export function RegisterPage() {
  const [form, setForm] = useState({ firstName: '', lastName: '', email: '', password: '', role: 'DONOR' as Role });
  const [showPw, setShowPw] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const { register: registerUser, isLoading } = useAuthStore();
  const navigate = useNavigate();

  const set = (k: string, v: string) => setForm(f => ({ ...f, [k]: v }));

  const validate = () => {
    const e: Record<string, string> = {};
    if (!form.firstName) e.firstName = 'Required';
    if (!form.lastName) e.lastName = 'Required';
    if (!form.email) e.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(form.email)) e.email = 'Invalid email';
    if (!form.password) e.password = 'Password is required';
    else if (form.password.length < 8) e.password = 'Min 8 characters';
    else if (!/[A-Z]/.test(form.password)) e.password = 'Needs an uppercase letter';
    else if (!/[0-9]/.test(form.password)) e.password = 'Needs a number';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    try {
      await registerUser(form);
      toast.success('Account created! Welcome to FundForge.');
      navigate('/dashboard');
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message ?? 'Registration failed';
      toast.error(msg);
    }
  };

  const roles: [Role, string, string, React.ReactNode][] = [
    ['CREATOR', 'Creator', 'Run a campaign of your own', <Megaphone key="c" size={18} strokeWidth={2.2} />],
    ['DONOR', 'Backer', 'Fund work that feels authored', <HandCoins key="d" size={18} strokeWidth={2.2} />],
  ];

  return (
    <div className="min-h-screen flex bg-white dark:bg-navy-950">
      <PressPanel
        eyebrow="Set up your press"
        headline="Put your name on something"
        accent="people"
        tail="will fund."
      />

      {/* Form side */}
      <div className="flex-1 flex items-center justify-center px-6 py-12 sm:px-10">
        <div className="w-full max-w-md">
          <div className="flex items-center justify-between mb-8">
            <FormBrand />
            <Link
              to="/"
              className="hidden lg:inline-flex items-center gap-1.5 font-display text-xs font-semibold text-slate-500 hover:text-navy-800 dark:text-slate-400 dark:hover:text-slate-200 transition-colors"
            >
              <ArrowLeft size={14} /> Back to home
            </Link>
          </div>

          <h2 className="font-display text-3xl font-extrabold text-navy-900 dark:text-slate-100 tracking-tight">
            Create your account
          </h2>
          <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
            Two minutes to join. Then start backing, or start printing.
          </p>

          {/* Role selection — icons, not emoji */}
          <div className="mt-7 grid grid-cols-2 gap-3">
            {roles.map(([r, title, desc, icon]) => {
              const active = form.role === r;
              return (
                <button
                  key={r}
                  type="button"
                  onClick={() => set('role', r)}
                  aria-pressed={active}
                  className={`flex flex-col gap-2.5 p-4 rounded-2xl border text-left transition-all ${
                    active
                      ? 'border-brand-400 bg-brand-50 ring-2 ring-brand-100 dark:border-brand-500/60 dark:bg-brand-500/10 dark:ring-brand-500/20'
                      : 'border-slate-200/70 hover:border-brand-300 dark:border-white/10 dark:hover:border-brand-500/40'
                  }`}
                >
                  <span
                    className={`flex h-9 w-9 items-center justify-center rounded-xl ${
                      active
                        ? 'bg-brand-600 text-white'
                        : 'bg-slate-100 text-slate-500 dark:bg-white/10 dark:text-slate-300'
                    }`}
                  >
                    {icon}
                  </span>
                  <span className="font-display text-sm font-bold text-navy-900 dark:text-slate-100">{title}</span>
                  <span className="text-xs leading-snug text-slate-500 dark:text-slate-400">{desc}</span>
                </button>
              );
            })}
          </div>

          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <Input
                label="First name"
                value={form.firstName}
                onChange={e => set('firstName', e.target.value)}
                placeholder="Maya"
                error={errors.firstName}
                leftAddon={<User size={15} />}
                autoComplete="given-name"
              />
              <Input
                label="Last name"
                value={form.lastName}
                onChange={e => set('lastName', e.target.value)}
                placeholder="Okafor"
                error={errors.lastName}
                autoComplete="family-name"
              />
            </div>

            <Input
              label="Email"
              type="email"
              value={form.email}
              onChange={e => set('email', e.target.value)}
              placeholder="you@example.com"
              error={errors.email}
              leftAddon={<Mail size={15} />}
              autoComplete="email"
            />

            <Input
              label="Password"
              type={showPw ? 'text' : 'password'}
              value={form.password}
              onChange={e => set('password', e.target.value)}
              placeholder="Min 8 chars, 1 uppercase, 1 number"
              error={errors.password}
              hint={!errors.password ? 'At least 8 characters, one uppercase letter, one number.' : undefined}
              leftAddon={<Lock size={15} />}
              autoComplete="new-password"
              rightAddon={
                <button
                  type="button"
                  onClick={() => setShowPw(v => !v)}
                  aria-label={showPw ? 'Hide password' : 'Show password'}
                  className="p-1.5 text-slate-400 hover:text-navy-700 dark:hover:text-slate-200 transition-colors"
                >
                  {showPw ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              }
            />

            <Button
              type="submit"
              size="lg"
              fullWidth
              loading={isLoading}
              rightIcon={!isLoading ? <ArrowRight size={16} /> : undefined}
              className="mt-2"
            >
              Create account
            </Button>
          </form>

          <p className="mt-6 text-center text-sm text-slate-600 dark:text-slate-400">
            Already have an account?{' '}
            <Link to="/login" className="font-display font-semibold text-brand-600 hover:text-brand-500 dark:text-brand-400 dark:hover:text-brand-300 transition-colors">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
