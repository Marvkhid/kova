'use client';
// ============================================================
// KOVA — Dashboard Stat Cards
// ============================================================

interface Stat {
  label:   string;
  value:   string;
  change:  string;
  up:      boolean;
  icon:    string;
  color:   string;
}

const STATS: Stat[] = [
  { label: 'Total Revenue',   value: '$4,280',  change: '+18% this month', up: true,  icon: '💰', color: '#E8622A' },
  { label: 'Orders',          value: '143',     change: '+9 this week',    up: true,  icon: '📦', color: '#2A5C45' },
  { label: 'Product Views',   value: '12,430',  change: '+34% this month', up: true,  icon: '👁',  color: '#3B2F6E' },
  { label: 'Avg. Rating',     value: '4.9★',    change: '97 reviews',      up: true,  icon: '⭐', color: '#D4A843' },
];

export function DashboardStats() {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {STATS.map(stat => (
        <div
          key={stat.label}
          className="bg-white rounded-[20px] p-5 border border-black/[0.07] hover:-translate-y-1 hover:shadow-lg transition-all duration-300 group"
        >
          {/* Icon */}
          <div
            className="w-10 h-10 rounded-full flex items-center justify-center text-lg mb-4"
            style={{ background: `${stat.color}15` }}
          >
            {stat.icon}
          </div>

          {/* Value */}
          <p
            className="font-extrabold text-[1.8rem] text-[#0D0D0D] leading-none mb-1"
            style={{ fontFamily: 'var(--font-display)' }}
          >
            {stat.value}
          </p>

          {/* Label */}
          <p className="text-[0.78rem] text-black/45 mb-2">{stat.label}</p>

          {/* Change */}
          <p className={`text-[0.72rem] font-medium flex items-center gap-1 ${stat.up ? 'text-[#2A5C45]' : 'text-red-500'}`}>
            <span>{stat.up ? '↑' : '↓'}</span>
            {stat.change}
          </p>
        </div>
      ))}
    </div>
  );
}