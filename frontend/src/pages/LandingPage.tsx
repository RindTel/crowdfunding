import { Link } from 'react-router-dom';
import { ArrowRight, Target, Shield, TrendingUp, Users, Flame, ChevronRight, Star } from 'lucide-react';

const FEATURES = [
  { icon: Target, title: 'Powerful Campaign Tools', desc: 'Rich story editor, reward tiers, milestone tracking, and media embedding.' },
  { icon: Shield, title: 'Secure Payments', desc: 'End-to-end encrypted transactions, PCI-compliant payment processing.' },
  { icon: TrendingUp, title: 'Real-time Analytics', desc: 'Live donation feed, conversion tracking, and detailed backer insights.' },
  { icon: Users, title: 'Community Driven', desc: 'Comments, updates, anonymous donations, and social sharing built-in.' },
];

const STATS = [
  { value: '$2.4M+', label: 'Total funded' },
  { value: '3,200+', label: 'Donations' },
  { value: '156', label: 'Campaigns' },
  { value: '1,800+', label: 'Users' },
];

const FEATURED = [
  {
    title: 'Eco Smart Water Purifier',
    category: 'Technology',
    raised: 32500, goal: 50000, pct: 65,
    img: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=240&fit=crop',
  },
  {
    title: 'Community Urban Garden',
    category: 'Environment',
    raised: 18900, goal: 25000, pct: 76,
    img: 'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=400&h=240&fit=crop',
  },
  {
    title: 'AI Tutoring for Rural Kids',
    category: 'Education',
    raised: 8100, goal: 30000, pct: 27,
    img: 'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=400&h=240&fit=crop',
  },
];

export function LandingPage() {
  return (
    <div>
      {/* Hero */}
      <section className="relative bg-gradient-to-b from-slate-950 to-[#0f1117] overflow-hidden">
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-[-20%] left-[50%] -translate-x-1/2 w-[800px] h-[800px] bg-indigo-600/10 rounded-full blur-[120px]" />
          <div className="absolute top-[20%] right-[-10%] w-[400px] h-[400px] bg-violet-600/8 rounded-full blur-[80px]" />
        </div>
        <div className="relative max-w-5xl mx-auto px-5 pt-24 pb-28 text-center">
          <div className="inline-flex items-center gap-2 text-indigo-400 text-xs font-semibold uppercase tracking-widest bg-indigo-500/10 border border-indigo-500/20 px-3.5 py-2 rounded-full mb-8">
            <Flame size={11} /> Crowdfunding, reimagined
          </div>
          <h1 className="text-5xl sm:text-6xl font-black text-white leading-[1.08] tracking-tight mb-6">
            Fund the ideas<br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-violet-400 to-purple-400">
              that change the world.
            </span>
          </h1>
          <p className="text-slate-500 text-lg max-w-xl mx-auto mb-10 leading-relaxed">
            FundForge connects visionary creators with passionate supporters.
            Launch your campaign, build your community, make it real.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link to="/register" className="flex items-center gap-2 px-7 py-3.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-semibold text-sm transition-all shadow-xl shadow-indigo-900/40">
              Start a Campaign <ArrowRight size={16} />
            </Link>
            <Link to="/campaigns" className="flex items-center gap-2 px-7 py-3.5 hover:bg-white/10 text-white border border-white/10 rounded-xl font-semibold text-sm transition-all">
              Explore Projects <ChevronRight size={16} />
            </Link>
          </div>

          {/* Stats */}
          <div className="flex flex-wrap items-center justify-center gap-8 mt-14 pt-14 border-t border-white/5">
            {STATS.map(({ value, label }) => (
              <div key={label} className="text-center">
                <p className="text-2xl font-black text-white">{value}</p>
                <p className="text-xs mt-0.5">{label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured campaigns */}
      <section className="py-20 px-5">
        <div className="max-w-5xl mx-auto">
          <div className="flex items-center justify-between mb-10">
            <div>
              <h2 className="text-2xl font-bold">Featured Campaigns</h2>
              <p className="text-slate-500 text-sm mt-1">Projects making real impact right now</p>
            </div>
            <Link to="/campaigns" className="text-sm text-indigo-600 font-medium hover:text-indigo-700 flex items-center gap-1">
              View all <ChevronRight size={14} />
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
            {FEATURED.map(c => (
              <Link to="/campaigns" key={c.title} className="group block overflow-hidden hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
                <div className="relative aspect-video overflow-hidden">
                  <img src={c.img} alt={c.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                  <div className="absolute top-2.5 left-2.5">
                    <span className="flex items-center gap-1 text-[10px] font-bold bg-amber-400 text-amber-900 px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                      <Star size={8} className="fill-amber-900" /> Featured
                    </span>
                  </div>
                </div>
                <div className="p-4">
                  <span className="text-[10px] font-semibold text-indigo-600 uppercase tracking-wider">{c.category}</span>
                  <h3 className="font-semibold text-sm mt-1 mb-3 leading-snug">{c.title}</h3>
                  <div className="w-full rounded-full h-1.5 overflow-hidden mb-2">
                    <div className="h-full bg-indigo-500 rounded-full" style={{ width: `${c.pct}%` }} />
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="font-semibold">${c.raised.toLocaleString()}</span>
                    <span className="text-indigo-600 font-semibold">{c.pct}%</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 px-5">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="text-2xl font-bold mb-2">Everything you need to succeed</h2>
            <p className="">Built for serious creators and committed backers</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            {FEATURES.map(({ icon: Icon, title, desc }) => (
              <div key={title} className="bg-white border border-slate-100 shadow-sm p-6 hover:shadow-md transition-shadow">
                <div className="w-10 h-10 bg-indigo-50 rounded-xl flex items-center justify-center mb-4">
                  <Icon size={18} className="text-indigo-600" />
                </div>
                <h3 className="font-semibold mb-1.5">{title}</h3>
                <p className="text-sm leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-5 bg-gradient-to-br from-indigo-600 to-violet-700">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-3xl font-black text-white mb-4">Ready to launch?</h2>
          <p className="text-indigo-200 mb-8">Join 1,800+ creators who've brought their projects to life.</p>
          <Link to="/register" className="inline-flex items-center gap-2 px-8 py-4 text-indigo-700 rounded-xl font-bold text-sm hover:bg-indigo-50 transition-colors shadow-xl">
            Create your free account <ArrowRight size={16} />
          </Link>
        </div>
      </section>
    </div>
  );
}
