import React, { forwardRef } from 'react';
import { Loader2, X } from 'lucide-react';

// ── Button ────────────────────────────────────
// Labels are set in Sora (font-display) for a pressed, poster feel.
// The teal "glow" is restrained and reserved for primary (the action ink);
// it is a soft tinted shadow, never a neon ring on every button.
type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger' | 'outline';
type ButtonSize = 'sm' | 'md' | 'lg';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  fullWidth?: boolean;
}

const variantStyles: Record<ButtonVariant, string> = {
  primary:   'bg-brand-600 text-white hover:bg-brand-500 shadow-[0_6px_18px_-8px_rgba(13,148,136,0.65)] hover:shadow-glow-sm active:scale-[0.98]',
  secondary: 'bg-navy-900 text-white hover:bg-navy-800 active:scale-[0.98] dark:bg-white/10 dark:text-slate-100 dark:hover:bg-white/15 dark:border dark:border-white/10',
  ghost:     'text-slate-600 hover:bg-slate-100 hover:text-navy-900 active:bg-slate-200 dark:text-slate-300 dark:hover:bg-white/5 dark:hover:text-white',
  danger:    'bg-rose-600 text-white hover:bg-rose-500 shadow-[0_6px_18px_-8px_rgba(225,29,72,0.6)] active:scale-[0.98]',
  outline:   'border border-slate-300 text-navy-800 bg-white hover:bg-slate-50 hover:border-navy-300 active:bg-slate-100 dark:bg-transparent dark:border-white/15 dark:text-slate-200 dark:hover:bg-white/5',
};
const sizeStyles: Record<ButtonSize, string> = {
  sm: 'px-3 py-1.5 text-xs gap-1.5 rounded-lg',
  md: 'px-4 py-2 text-sm gap-2 rounded-xl',
  lg: 'px-6 py-3 text-[15px] gap-2.5 rounded-xl',
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(({
  variant = 'primary', size = 'md', loading, leftIcon, rightIcon,
  fullWidth, className = '', children, disabled, ...props
}, ref) => (
  <button
    ref={ref}
    disabled={disabled || loading}
    className={[
      'inline-flex items-center justify-center font-display font-semibold transition-all duration-200 ease-premium',
      'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-400 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-navy-950',
      'disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none disabled:active:scale-100 select-none',
      variantStyles[variant],
      sizeStyles[size],
      fullWidth ? 'w-full' : '',
      className,
    ].join(' ')}
    {...props}
  >
    {loading ? <Loader2 size={14} className="animate-spin" /> : leftIcon}
    {children}
    {!loading && rightIcon}
  </button>
));
Button.displayName = 'Button';

// ── Shared field styling ──────────────────────
const fieldBase = [
  'block w-full rounded-xl border border-slate-200 bg-white text-sm text-navy-900 transition-all duration-150',
  'placeholder:text-slate-400 shadow-inner-soft',
  'focus:outline-none focus:ring-4 focus:ring-brand-100 focus:border-brand-400',
  'dark:bg-navy-950/60 dark:border-white/10 dark:text-slate-100 dark:placeholder:text-slate-500',
  'dark:focus:ring-brand-500/20 dark:focus:border-brand-500',
].join(' ');

const labelBase = 'block font-display text-[13px] font-semibold text-navy-800 dark:text-slate-200 mb-1.5';

// ── Input ─────────────────────────────────────
interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: string;
  leftAddon?: React.ReactNode;
  rightAddon?: React.ReactNode;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(({
  label, error, hint, leftAddon, rightAddon, className = '', ...props
}, ref) => (
  <div className="w-full">
    {label && (
      <label className={labelBase}>
        {label}
        {props.required && <span className="text-brand-600 dark:text-brand-400 ml-0.5">*</span>}
      </label>
    )}
    <div className="relative">
      {leftAddon && (
        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
          {leftAddon}
        </div>
      )}
      <input
        ref={ref}
        className={[
          fieldBase,
          error ? 'border-rose-300 focus:border-rose-400 focus:ring-rose-100 dark:border-rose-500/40' : '',
          leftAddon ? 'pl-10' : 'pl-3.5',
          rightAddon ? 'pr-10' : 'pr-3.5',
          'py-2.5',
          className,
        ].join(' ')}
        {...props}
      />
      {rightAddon && (
        <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
          {rightAddon}
        </div>
      )}
    </div>
    {error && <p className="mt-1.5 text-xs font-medium text-rose-600 dark:text-rose-400">{error}</p>}
    {hint && !error && <p className="mt-1.5 text-xs text-slate-500 dark:text-slate-400">{hint}</p>}
  </div>
));
Input.displayName = 'Input';

// ── Textarea ──────────────────────────────────
interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  hint?: string;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(({
  label, error, hint, className = '', ...props
}, ref) => (
  <div className="w-full">
    {label && (
      <label className={labelBase}>
        {label}
        {props.required && <span className="text-brand-600 dark:text-brand-400 ml-0.5">*</span>}
      </label>
    )}
    <textarea
      ref={ref}
      className={[
        fieldBase, 'resize-none px-3.5 py-2.5 leading-relaxed',
        error ? 'border-rose-300 focus:border-rose-400 focus:ring-rose-100 dark:border-rose-500/40' : '',
        className,
      ].join(' ')}
      {...props}
    />
    {error && <p className="mt-1.5 text-xs font-medium text-rose-600 dark:text-rose-400">{error}</p>}
    {hint && !error && <p className="mt-1.5 text-xs text-slate-500 dark:text-slate-400">{hint}</p>}
  </div>
));
Textarea.displayName = 'Textarea';

// ── Select ────────────────────────────────────
interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  options: { value: string; label: string }[];
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(({
  label, error, options, className = '', ...props
}, ref) => (
  <div className="w-full">
    {label && (
      <label className={labelBase}>
        {label}
        {props.required && <span className="text-brand-600 dark:text-brand-400 ml-0.5">*</span>}
      </label>
    )}
    <select
      ref={ref}
      className={[
        fieldBase, 'px-3.5 py-2.5 cursor-pointer appearance-none bg-no-repeat',
        error ? 'border-rose-300 focus:border-rose-400 focus:ring-rose-100 dark:border-rose-500/40' : '',
        className,
      ].join(' ')}
      style={{
        backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='%2394a3b8' stroke-width='2.5' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'/%3E%3C/svg%3E")`,
        backgroundPosition: 'right 0.85rem center',
        paddingRight: '2.25rem',
      }}
      {...props}
    >
      {options.map(opt => (
        <option key={opt.value} value={opt.value}>{opt.label}</option>
      ))}
    </select>
    {error && <p className="mt-1.5 text-xs font-medium text-rose-600 dark:text-rose-400">{error}</p>}
  </div>
));
Select.displayName = 'Select';

// ── Badge ─────────────────────────────────────
// Status always pairs hue with text/icon, never hue alone.
type BadgeVariant = 'default' | 'success' | 'warning' | 'danger' | 'info' | 'purple';

const badgeVariants: Record<BadgeVariant, string> = {
  default: 'bg-slate-100 text-slate-600 border-slate-200 dark:bg-white/10 dark:text-slate-300 dark:border-white/10',
  success: 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-500/15 dark:text-emerald-300 dark:border-emerald-500/25',
  warning: 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-500/15 dark:text-amber-300 dark:border-amber-500/25',
  danger:  'bg-rose-50 text-rose-600 border-rose-200 dark:bg-rose-500/15 dark:text-rose-300 dark:border-rose-500/25',
  info:    'bg-brand-50 text-brand-700 border-brand-200 dark:bg-brand-500/15 dark:text-brand-300 dark:border-brand-500/25',
  purple:  'bg-navy-50 text-navy-700 border-navy-200 dark:bg-brand-500/10 dark:text-brand-200 dark:border-brand-500/20',
};

export function Badge({ children, variant = 'default', className = '' }: {
  children: React.ReactNode; variant?: BadgeVariant; className?: string;
}) {
  return (
    <span className={`inline-flex items-center gap-1 font-display text-[11px] font-semibold px-2.5 py-1 rounded-full border ${badgeVariants[variant]} ${className}`}>
      {children}
    </span>
  );
}

// ── Spinner ───────────────────────────────────
export function Spinner({ size = 20, className = '' }: { size?: number; className?: string }) {
  return <Loader2 size={size} className={`animate-spin text-brand-600 ${className}`} />;
}

// ── Card ──────────────────────────────────────
export function Card({ children, className = '', hover = false }: {
  children: React.ReactNode; className?: string; hover?: boolean;
}) {
  return (
    <div className={`bg-white rounded-2xl border border-slate-200/70 shadow-card dark:bg-navy-900 dark:border-white/10 ${hover ? 'lift hover:border-brand-200 dark:hover:border-brand-500/40' : ''} ${className}`}>
      {children}
    </div>
  );
}

// ── Modal ─────────────────────────────────────
interface ModalProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

const modalSizes = { sm: 'max-w-sm', md: 'max-w-md', lg: 'max-w-lg', xl: 'max-w-2xl' };

export function Modal({ open, onClose, title, children, size = 'md' }: ModalProps) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-navy-950/60 backdrop-blur-md animate-fade-in" onClick={onClose} />
      <div className={`relative bg-white dark:bg-navy-900 rounded-2xl shadow-2xl w-full ${modalSizes[size]} overflow-hidden animate-scale-in ring-1 ring-navy-900/5 dark:ring-white/10`}>
        {title && (
          <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-white/10">
            <h2 className="font-display text-base font-bold text-navy-900 dark:text-slate-100">{title}</h2>
            <button onClick={onClose} aria-label="Close" className="p-1.5 text-slate-400 hover:text-navy-700 hover:bg-slate-100 dark:hover:text-white dark:hover:bg-white/10 rounded-lg transition-colors">
              <X size={16} />
            </button>
          </div>
        )}
        {children}
      </div>
    </div>
  );
}

// ── Avatar ────────────────────────────────────
export function Avatar({ name, src, size = 'md' }: {
  name: string; src?: string | null; size?: 'sm' | 'md' | 'lg';
}) {
  const sizeMap = { sm: 'w-7 h-7 text-xs', md: 'w-9 h-9 text-sm', lg: 'w-12 h-12 text-base' };
  const initials = name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  if (src) return <img src={src} alt={name} className={`${sizeMap[size]} rounded-full object-cover ring-2 ring-white dark:ring-navy-900 shadow-sm`} />;
  return (
    <div className={`${sizeMap[size]} rounded-full bg-gradient-to-br from-brand-400 to-navy-700 flex items-center justify-center text-white font-display font-bold flex-shrink-0 shadow-sm ring-2 ring-white dark:ring-navy-900`}>
      {initials}
    </div>
  );
}

// ── ProgressBar ───────────────────────────────
// The momentum signal. Teal fill + restrained leading-edge glow.
// Width animates so funding reads as movement, not decoration.
export function ProgressBar({ value, showLabel = false, color = 'brand', size = 'md' }: {
  value: number; showLabel?: boolean; color?: 'brand' | 'indigo' | 'emerald' | 'amber' | 'rose';
  size?: 'sm' | 'md' | 'lg';
}) {
  const colorMap: Record<string, string> = {
    brand:   'from-brand-600 to-brand-400',
    indigo:  'from-brand-600 to-brand-400', // legacy alias → brand
    emerald: 'from-emerald-500 to-emerald-400',
    amber:   'from-amber-500 to-amber-400',
    rose:    'from-rose-500 to-rose-400',
  };
  const glowMap: Record<string, string> = {
    brand: 'shadow-[0_0_12px_rgba(20,184,166,0.45)]',
    indigo: 'shadow-[0_0_12px_rgba(20,184,166,0.45)]',
    emerald: 'shadow-[0_0_12px_rgba(16,185,129,0.4)]',
    amber: 'shadow-[0_0_12px_rgba(245,158,11,0.4)]',
    rose: 'shadow-[0_0_12px_rgba(244,63,94,0.4)]',
  };
  const sizeMap = { sm: 'h-1.5', md: 'h-2', lg: 'h-3' };
  const pct = Math.min(Math.max(value, 0), 100);
  return (
    <div className="w-full">
      {showLabel && (
        <div className="flex justify-between text-xs mb-1.5">
          <span className="font-display font-semibold text-brand-700 dark:text-brand-400 tnum">{pct}% funded</span>
        </div>
      )}
      <div className={`w-full bg-slate-100 dark:bg-white/10 rounded-full overflow-hidden ${sizeMap[size]}`}>
        <div
          className={`h-full rounded-full bg-gradient-to-r ${colorMap[color]} ${glowMap[color]} transition-[width] duration-[900ms] ease-premium`}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}

// ── Empty state ───────────────────────────────
export function EmptyState({ icon, title, description, action }: {
  icon: React.ReactNode; title: string; description?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
      <div className="w-16 h-16 rounded-2xl bg-brand-50 text-brand-600 flex items-center justify-center mb-4 ring-1 ring-brand-100 dark:bg-brand-500/10 dark:text-brand-300 dark:ring-brand-500/20">{icon}</div>
      <h3 className="font-display text-lg font-bold text-navy-900 dark:text-slate-100 mb-1">{title}</h3>
      {description && <p className="text-sm text-slate-500 dark:text-slate-400 max-w-xs mb-5 leading-relaxed">{description}</p>}
      {action}
    </div>
  );
}

// ── PageLoader ────────────────────────────────
export function PageLoader() {
  return (
    <div className="flex items-center justify-center h-64">
      <Spinner size={28} />
    </div>
  );
}
