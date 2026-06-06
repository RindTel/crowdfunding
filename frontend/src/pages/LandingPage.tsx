import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowRight, ArrowUpRight, Users, Clock, BadgeCheck,
  Target, ShieldCheck, TrendingUp, MessagesSquare, Flame,
} from 'lucide-react';

/* ──────────────────────────────────────────────
   "The Campaign Press" landing — a dark broadsheet.
   Type has two jobs and never switches mid-line:
     · Sora (font-display)  = the poster shout. Hero only.
     · Instrument Serif (font-serif) = the editorial voice.
       Every section head + pull-quote. Emphasis by COLOR,
       never by swapping the typeface inside a line.
   No floating glass widgets, no live-toast theatre,
   no squiggle underlines, no dot-grid masks.
   ────────────────────────────────────────────── */

const STATS = [
  { end: 2.4,  prefix: '$', suffix: 'M', decimals: 1, label: 'pledged' },
  { end: 3214, prefix: '',  suffix: '',  decimals: 0, label: 'campaigns funded' },
  { end: 156,  prefix: '',  suffix: '',  decimals: 0, label: 'open now' },
  { end: 1842, prefix: '',  suffix: '',  decimals: 0, label: 'creators' },
];

interface LandingCampaign {
  title: string; category: string; creator: string; initials: string;
  raised: number; goal: number; pct: number; backers: number; days: number;
  blurb: string; img: string;
}

const FEATURED: LandingCampaign = {
  title: 'Wellspring: clean water, off the grid',
  category: 'Technology', creator: 'Priya Nair', initials: 'PN',
  raised: 32500, goal: 50000, pct: 65, backers: 412, days: 18,
  blurb: 'A solar still the size of a suitcase that pulls drinking water out of humid air. Built for villages the grid never reached.',
  img: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=960&h=720&fit=crop&q=80',
};

const CAMPAIGNS: LandingCampaign[] = [
  {
    title: 'The Commons: a garden the block runs',
    category: 'Environment', creator: 'Marcus Hale', initials: 'MH',
    raised: 18900, goal: 25000, pct: 76, backers: 287, days: 9,
    blurb: 'Vacant lot to working garden, deeded to the neighbors who tend it.',
    img: 'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=720&h=460&fit=crop&q=80',
  },
  {
    title: 'Chalkbox: tutoring for rural classrooms',
    category: 'Education', creator: 'Lena Ortiz', initials: 'LO',
    raised: 8100, goal: 30000, pct: 27, backers: 103, days: 34,
    blurb: 'Offline-first lesson kits for schools an hour past the last cell tower.',
    img: 'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=720&h=460&fit=crop&q=80',
  },
  {
    title: 'Press Run: a risograph studio for zines',
    category: 'Art', creator: 'Theo Salk', initials: 'TS',
    raised: 14200, goal: 20000, pct: 71, backers: 198, days: 12,
    blurb: 'A members’ print shop so small presses can run short, weird, and cheap.',
    img: 'https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?w=720&h=460&fit=crop&q=80',
  },
];

const STEPS = [
  { n: '01', icon: Target,         title: 'Write the pitch', desc: 'Set reward tiers, drop in video, tell the story. The page reads like you made it, because you did.' },
  { n: '02', icon: TrendingUp,     title: 'Rally your people', desc: 'A live pledge feed and a meter that climbs as money lands. Backers fund what is clearly moving.' },
  { n: '03', icon: MessagesSquare, title: 'Keep them in the room', desc: 'Updates, replies, and anonymous backing built in. Your people stay close, not just notified.' },
  { n: '04', icon: ShieldCheck,    title: 'Get paid cleanly', desc: 'Encrypted, PCI-compliant payouts and a backer guarantee. The numbers never lie or jitter.' },
];

const TESTIMONIALS = [
  { name: 'Sofia Marchetti', role: 'Documentary filmmaker', initials: 'SM', text: 'I raised $48k in 30 days. The tools feel built by someone who has actually run a campaign at 2am.' },
  { name: 'Darnell Price',   role: 'Backed 31 campaigns',   initials: 'DP', text: 'I back things across every platform. Nothing else makes a stranger’s project feel this worth funding.' },
  { name: 'Priya Kapoor',    role: 'Director, Maya Collective', initials: 'PK', text: 'We hit 200% of goal. The updates and replies did the work, not a glossy pitch.' },
];

function useInView<T extends HTMLElement = HTMLDivElement>(threshold = 0.15) {
  const ref = useRef<T>(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) setVisible(true); },
      { threshold },
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [threshold]);
  return { ref, visible };
}

function Counter({ end, prefix, suffix, decimals, active }: {
  end: number; prefix: string; suffix: string; decimals: number; active: boolean;
}) {
  const [val, setVal] = useState(0);
  useEffect(() => {
    if (!active) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) { setVal(end); return; }
    const duration = 1400;
    const t0 = performance.now();
    let raf = 0;
    const tick = (now: number) => {
      const p = Math.min((now - t0) / duration, 1);
      const e = 1 - Math.pow(1 - p, 3);
      setVal(e * end);
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [active, end]);
  const disp = decimals > 0 ? val.toFixed(decimals) : Math.round(val).toLocaleString();
  return <span className="tnum">{prefix}{disp}{suffix}</span>;
}

// Initials mark — fixed dark ring (page is locked dark)
function Mark({ initials, className = '' }: { initials: string; className?: string }) {
  return (
    <span className={`inline-flex items-center justify-center rounded-full bg-brand-500/15 ring-1 ring-brand-400/30 font-display font-bold text-brand-200 ${className}`}>
      {initials}
    </span>
  );
}

function Meter({ pct, fill }: { pct: number; fill: boolean }) {
  return (
    <div className="h-1 w-full bg-white/10 overflow-hidden rounded-full">
      <div
        className="h-full rounded-full bg-brand-400 transition-[width] duration-[1100ms] ease-premium"
        style={{ width: fill ? `${pct}%` : '0%' }}
      />
    </div>
  );
}

function CampaignCard({ c }: { c: LandingCampaign }) {
  const { ref, visible } = useInView<HTMLAnchorElement>(0.1);
  return (
    <Link
      ref={ref}
      to="/campaigns"
      className={`group block transition-all duration-700 ease-premium ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`}
    >
      <div className="scrim relative aspect-[5/4] overflow-hidden mb-4">
        <img src={c.img} alt={c.title} loading="lazy" className="w-full h-full object-cover transition-transform duration-[700ms] ease-premium group-hover:scale-[1.05]" />
        <span className="absolute top-3 left-3 z-10 font-display text-[10px] font-semibold uppercase tracking-[0.14em] text-white/90">{c.category}</span>
        <div className="absolute bottom-3 left-3 right-3 z-10 flex items-center gap-2">
          <Mark initials={c.initials} className="w-6 h-6 text-[10px]" />
          <span className="font-display text-[12px] font-semibold text-white">{c.creator}</span>
        </div>
      </div>
      <h3 className="font-serif text-[1.5rem] leading-[1.1] text-white mb-2 group-hover:text-brand-200 transition-colors">{c.title}</h3>
      <p className="text-[13.5px] leading-relaxed text-slate-400 mb-4 line-clamp-2">{c.blurb}</p>
      <Meter pct={c.pct} fill={visible} />
      <div className="flex items-baseline justify-between mt-3 font-display tnum">
        <span className="text-[15px] font-bold text-brand-400">${c.raised.toLocaleString()}</span>
        <span className="text-[12px] text-slate-500">{c.pct}% &middot; {c.days} days left</span>
      </div>
    </Link>
  );
}

export function LandingPage() {
  const { ref: dateRef, visible: dateVis } = useInView(0.4);
  const { ref: coverRef, visible: coverVis } = useInView(0.25);
  const { ref: stepRef, visible: stepVis } = useInView(0.12);
  const { ref: ctaRef, visible: ctaVis } = useInView(0.25);

  // The landing draws its own dark masthead + colophon; hide PublicLayout chrome.
  useEffect(() => {
    const style = document.createElement('style');
    style.id = 'ff-lp-hide';
    style.textContent = `.ff-public-hide{display:none !important}`;
    document.head.appendChild(style);
    const header = document.querySelector('header');
    const footer = document.querySelector('footer');
    header?.classList.add('ff-public-hide');
    footer?.classList.add('ff-public-hide');
    return () => {
      document.getElementById('ff-lp-hide')?.remove();
      header?.classList.remove('ff-public-hide');
      footer?.classList.remove('ff-public-hide');
    };
  }, []);

  return (
    <div className="bg-navy-950 text-slate-300 font-sans">

      {/* MASTHEAD */}
      <nav className="fixed top-0 inset-x-0 z-[200] bg-navy-950/85 backdrop-blur-xl border-b border-white/[0.07]">
        <div className="max-w-[1180px] mx-auto h-16 px-5 sm:px-8 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2.5">
            <span className="w-8 h-8 rounded-lg bg-brand-500 flex items-center justify-center ring-1 ring-brand-300/40">
              <Flame size={16} className="text-white" strokeWidth={2.4} />
            </span>
            <span className="font-display font-extrabold text-[17px] tracking-tight text-white">Fund<span className="text-brand-400">Forge</span></span>
          </Link>
          <div className="flex items-center gap-7">
            <Link to="/campaigns" className="hidden sm:inline text-[13px] font-display font-medium text-slate-400 hover:text-white transition-colors">Explore</Link>
            <a href="#how" className="hidden sm:inline text-[13px] font-display font-medium text-slate-400 hover:text-white transition-colors">How it works</a>
            <Link to="/login" className="text-[13px] font-display font-medium text-slate-400 hover:text-white transition-colors">Sign in</Link>
            <Link to="/register" className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-brand-600 hover:bg-brand-500 text-white text-[13px] font-display font-semibold transition-colors">
              Start a campaign
            </Link>
          </div>
        </div>
      </nav>

      {/* FRONT PAGE — the poster shout. Sora, single voice, color emphasis. */}
      <header className="relative px-5 sm:px-8 pt-32 sm:pt-40 pb-16">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(48rem_36rem_at_18%_8%,rgba(20,184,166,0.14),transparent_64%)]" />
        <div className="relative max-w-[1180px] mx-auto">
          <p className="eyebrow eyebrow-rule mb-7 text-brand-400">The Campaign Press &middot; Independent crowdfunding</p>
          <h1 className="font-display font-extrabold text-white tracking-[-0.04em] leading-[0.9] text-[clamp(2.75rem,9vw,6.5rem)] max-w-[16ch]">
            Great ideas don&rsquo;t need permission.{' '}
            <span className="text-brand-400">They need backers.</span>
          </h1>
          <div className="mt-9 flex flex-col sm:flex-row sm:items-center gap-x-10 gap-y-6">
            <p className="max-w-md text-[16.5px] leading-relaxed text-slate-400">
              Launch in minutes, rally your people, and watch the meter climb as the money lands. No gatekeepers, no pitch decks.
            </p>
            <div className="flex flex-wrap items-center gap-3">
              <Link to="/register" className="inline-flex items-center gap-2 px-6 py-3.5 rounded-lg bg-brand-600 hover:bg-brand-500 text-white font-display font-bold text-[15px] shadow-glow-sm active:scale-[0.98] transition-all">
                Start your campaign <ArrowRight size={16} />
              </Link>
              <Link to="/campaigns" className="inline-flex items-center gap-2 px-5 py-3.5 rounded-lg border border-white/15 hover:border-white/35 text-slate-200 font-display font-medium text-[15px] transition-colors">
                Browse what is open
              </Link>
            </div>
          </div>

          {/* DATELINE — running figures as a colophon rule, not a stat-card grid */}
          <div ref={dateRef} className="mt-14 pt-6 border-t border-white/[0.08] flex flex-wrap items-center gap-x-8 gap-y-5">
            {STATS.map((s, i) => (
              <div key={s.label} className="flex items-baseline gap-2">
                {i > 0 && <span className="hidden sm:inline-block w-px h-4 bg-white/10 -ml-4 mr-2 self-center" />}
                <span className="font-display text-[22px] font-extrabold text-white tracking-[-0.02em]">
                  <Counter {...s} active={dateVis} />
                </span>
                <span className="text-[12.5px] text-slate-500">{s.label}</span>
              </div>
            ))}
          </div>
        </div>
      </header>

      {/* COVER STORY — the real product, grounded in the layout (no floating widget) */}
      <section ref={coverRef} className="px-5 sm:px-8 py-16 border-t border-white/[0.06]">
        <div className="max-w-[1180px] mx-auto">
          <div className={`grid lg:grid-cols-[1.05fr_0.95fr] gap-x-12 gap-y-8 items-center transition-all duration-700 ease-premium ${coverVis ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`}>
            <Link to="/campaigns" className="group scrim relative block aspect-[4/3] sm:aspect-[16/11] overflow-hidden">
              <img src={FEATURED.img} alt={FEATURED.title} className="w-full h-full object-cover transition-transform duration-[800ms] ease-premium group-hover:scale-[1.04]" />
              <span className="absolute top-4 left-4 z-10 inline-flex items-center gap-1.5 font-display text-[10px] font-bold uppercase tracking-[0.14em] text-white">
                <TrendingUp size={11} className="text-brand-300" /> Cover story
              </span>
            </Link>
            <div>
              <div className="flex items-center gap-2.5 mb-5">
                <Mark initials={FEATURED.initials} className="w-8 h-8 text-[12px]" />
                <span className="font-display text-[13.5px] font-semibold text-white">{FEATURED.creator}</span>
                <BadgeCheck size={15} className="text-brand-300" />
                <span className="text-[12px] text-slate-500">&middot; {FEATURED.category}</span>
              </div>
              <h2 className="font-serif text-[clamp(2rem,4.5vw,3.25rem)] leading-[1.02] text-white">
                {FEATURED.title}
              </h2>
              <p className="mt-4 max-w-md text-[15px] leading-relaxed text-slate-400">{FEATURED.blurb}</p>

              <div className="mt-7 max-w-md">
                <Meter pct={FEATURED.pct} fill={coverVis} />
                <div className="flex items-baseline justify-between mt-3 font-display tnum">
                  <span><span className="text-[24px] font-extrabold text-brand-400">${FEATURED.raised.toLocaleString()}</span><span className="text-[13px] text-slate-500"> raised of ${FEATURED.goal.toLocaleString()}</span></span>
                  <span className="text-[16px] font-bold text-white">{FEATURED.pct}%</span>
                </div>
                <div className="flex items-center gap-6 mt-4 text-[12.5px] text-slate-400">
                  <span className="inline-flex items-center gap-1.5"><Users size={13} className="text-brand-400" /> <span className="tnum font-semibold text-slate-200">{FEATURED.backers}</span> backers</span>
                  <span className="inline-flex items-center gap-1.5"><Clock size={13} className="text-brand-400" /> <span className="tnum font-semibold text-slate-200">{FEATURED.days}</span> days left</span>
                </div>
              </div>

              <Link to="/campaigns" className="mt-7 inline-flex items-center gap-1.5 font-display text-[14px] font-semibold text-brand-400 hover:text-brand-300 transition-colors">
                Read the campaign <ArrowUpRight size={15} />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* OPEN NOW — editorial index */}
      <section className="px-5 sm:px-8 py-20 border-t border-white/[0.06]">
        <div className="max-w-[1180px] mx-auto">
          <div className="flex flex-wrap items-end justify-between gap-4 mb-12">
            <h2 className="font-serif text-[clamp(2rem,4.5vw,3.25rem)] leading-[1.02] text-white">
              Open right now, and <span className="text-brand-300">moving fast</span>
            </h2>
            <Link to="/campaigns" className="inline-flex items-center gap-1.5 text-[14px] font-display font-semibold text-brand-400 hover:text-brand-300 transition-colors">
              The full index <ArrowUpRight size={15} />
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-12">
            {CAMPAIGNS.map((c) => <CampaignCard key={c.title} c={c} />)}
          </div>
        </div>
      </section>

      {/* HOW IT WORKS — numbered broadsheet columns */}
      <section id="how" className="px-5 sm:px-8 py-20 border-t border-white/[0.06] bg-[#070f1f]">
        <div className="max-w-[1180px] mx-auto">
          <h2 className="font-serif text-[clamp(2rem,4.5vw,3.25rem)] leading-[1.02] text-white max-w-[18ch] mb-14">
            Everything a campaign needs to feel <span className="text-brand-300">made, not generated</span>
          </h2>
          <div ref={stepRef} className="grid sm:grid-cols-2 lg:grid-cols-4 gap-x-8 gap-y-12">
            {STEPS.map(({ n, icon: Icon, title, desc }, i) => (
              <div
                key={title}
                className={`pt-5 border-t border-white/15 transition-all duration-700 ease-premium ${stepVis ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`}
                style={{ transitionDelay: `${i * 80}ms` }}
              >
                <div className="flex items-center justify-between mb-5">
                  <span className="font-display text-[13px] font-bold tracking-[0.1em] text-brand-400 tnum">{n}</span>
                  <Icon size={18} className="text-slate-500" />
                </div>
                <h3 className="font-display font-bold text-[16px] text-white mb-2">{title}</h3>
                <p className="text-[13.5px] leading-relaxed text-slate-400">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* VOICES — one featured pull-quote + two supporting */}
      <section className="px-5 sm:px-8 py-20 border-t border-white/[0.06]">
        <div className="max-w-[1180px] mx-auto">
          <p className="eyebrow eyebrow-rule mb-10 text-brand-400">From the people who used it</p>
          <div className="grid lg:grid-cols-[1.25fr_1fr] gap-x-12 gap-y-10">
            <figure className="flex flex-col">
              <blockquote className="voice text-white text-[clamp(1.5rem,3vw,2.4rem)] leading-[1.18]">
                &ldquo;{TESTIMONIALS[0].text}&rdquo;
              </blockquote>
              <figcaption className="flex items-center gap-3 mt-8">
                <Mark initials={TESTIMONIALS[0].initials} className="w-11 h-11 text-sm" />
                <div>
                  <div className="font-display font-bold text-[14px] text-white">{TESTIMONIALS[0].name}</div>
                  <div className="text-[12px] text-slate-400">{TESTIMONIALS[0].role}</div>
                </div>
              </figcaption>
            </figure>
            <div className="grid gap-8 lg:border-l lg:border-white/[0.08] lg:pl-12">
              {TESTIMONIALS.slice(1).map((t) => (
                <figure key={t.name}>
                  <blockquote className="voice text-slate-200 text-[16px] leading-relaxed">&ldquo;{t.text}&rdquo;</blockquote>
                  <figcaption className="flex items-center gap-3 mt-4">
                    <Mark initials={t.initials} className="w-9 h-9 text-[11px]" />
                    <div>
                      <div className="font-display font-bold text-[13px] text-white">{t.name}</div>
                      <div className="text-[11px] text-slate-400">{t.role}</div>
                    </div>
                  </figcaption>
                </figure>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA — closing manifesto */}
      <section className="relative px-5 sm:px-8 py-28 text-center overflow-hidden border-t border-white/[0.06]">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(44rem_24rem_at_50%_40%,rgba(20,184,166,0.14),transparent_70%)]" />
        <div ref={ctaRef} className={`relative max-w-2xl mx-auto transition-all duration-700 ease-premium ${ctaVis ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`}>
          <h2 className="font-serif text-white text-[clamp(2.25rem,6vw,4rem)] leading-[1.02]">
            Your idea is ready. <span className="text-brand-300">Print it.</span>
          </h2>
          <p className="mt-5 text-[16px] leading-relaxed text-slate-400 max-w-lg mx-auto">
            Starting is free. Set up a page, share it with your people, and let the meter do the talking.
          </p>
          <div className="mt-9 flex flex-wrap gap-3 justify-center">
            <Link to="/register" className="inline-flex items-center gap-2 px-7 py-4 rounded-lg bg-brand-600 hover:bg-brand-500 text-white font-display font-bold text-[15px] shadow-glow-sm active:scale-[0.98] transition-all">
              Start your campaign <ArrowRight size={16} />
            </Link>
            <Link to="/campaigns" className="inline-flex items-center gap-2 px-6 py-4 rounded-lg border border-white/15 hover:border-white/35 text-slate-200 font-display font-medium text-[15px] transition-colors">
              Browse campaigns
            </Link>
          </div>
          <p className="mt-6 text-[12.5px] text-slate-500">No card required. Free forever for backers.</p>
        </div>
      </section>

      {/* COLOPHON */}
      <footer className="px-5 sm:px-8 py-10 border-t border-white/[0.07] bg-[#050b14]">
        <div className="max-w-[1180px] mx-auto flex flex-wrap items-center justify-between gap-5">
          <div className="flex items-center gap-2.5">
            <span className="w-7 h-7 rounded-lg bg-brand-500 flex items-center justify-center ring-1 ring-brand-300/40">
              <Flame size={14} className="text-white" strokeWidth={2.4} />
            </span>
            <span className="font-display font-extrabold text-[16px] text-white tracking-tight">Fund<span className="text-brand-400">Forge</span></span>
          </div>
          <div className="flex gap-6">
            {['Privacy', 'Terms', 'Contact', 'Blog'].map((l) => (
              <Link key={l} to="/" className="text-[13px] font-display text-slate-400 hover:text-white transition-colors">{l}</Link>
            ))}
          </div>
          <p className="text-[12.5px] text-slate-500">Printed and pledged since {new Date().getFullYear()}.</p>
        </div>
      </footer>
    </div>
  );
}
