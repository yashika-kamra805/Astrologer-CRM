import { useMemo } from 'react';

const GRADIENTS = [
  'from-indigo-500 to-purple-600 text-white',
  'from-blue-500 to-cyan-600 text-white',
  'from-emerald-500 to-teal-600 text-white',
  'from-orange-500 to-rose-600 text-white',
  'from-violet-500 to-fuchsia-600 text-white',
  'from-rose-500 to-pink-600 text-white',
];

const SIZES = {
  xs: 'h-6 w-6 text-[10px] font-semibold',
  sm: 'h-8 w-8 text-xs font-semibold',
  md: 'h-10 w-10 text-sm font-semibold',
  lg: 'h-12 w-12 text-base font-bold',
  xl: 'h-16 w-16 text-xl font-bold',
};

export default function Avatar({ name = '', size = 'md', className = '' }) {
  const initials = useMemo(() => {
    if (!name || typeof name !== 'string') return '?';
    const parts = name.trim().split(/\s+/).filter(Boolean);
    if (parts.length === 0) return '?';
    if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  }, [name]);

  const gradient = useMemo(() => {
    if (!name) return GRADIENTS[0];
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
      hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }
    const index = Math.abs(hash) % GRADIENTS.length;
    return GRADIENTS[index];
  }, [name]);

  return (
    <div
      className={`inline-flex shrink-0 items-center justify-center rounded-full bg-gradient-to-br shadow-inner shadow-black/10 select-none ${SIZES[size]} ${gradient} ${className}`}
      aria-label={name}
      role="img"
    >
      {initials}
    </div>
  );
}
