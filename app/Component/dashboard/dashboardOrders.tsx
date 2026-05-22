'use client';
// ============================================================
// KOVA — Dashboard Orders + Earnings Chart
// ============================================================

// ── Recent Orders ─────────────────────────────────────────

const ORDERS = [
  { id: 'ORD-1091', product: 'UI Kit Pro Bundle',        buyer: 'Emeka O.',   amount: 19,  status: 'completed', time: '2 hrs ago' },
  { id: 'ORD-1090', product: 'Signature Washed Cap',     buyer: 'Priya S.',   amount: 12,  status: 'completed', time: '5 hrs ago' },
  { id: 'ORD-1089', product: 'Brand Identity Starter',   buyer: 'James K.',   amount: 29,  status: 'pending',   time: '8 hrs ago' },
  { id: 'ORD-1088', product: 'Motion Graphics Pack',     buyer: 'Fatima A.',  amount: 24,  status: 'completed', time: '1 day ago' },
  { id: 'ORD-1087', product: 'Podcast Editing Service',  buyer: 'David M.',   amount: 15,  status: 'processing',time: '1 day ago' },
];

const STATUS_STYLES: Record<string, string> = {
  completed:  'bg-[#2A5C45]/[0.08] text-[#2A5C45]',
  pending:    'bg-[#D4A843]/[0.12] text-[#A07820]',
  processing: 'bg-[#3B2F6E]/[0.08] text-[#3B2F6E]',
};

export function DashboardOrders() {
  return (
    <div className="bg-white rounded-[16px] sm:rounded-[20px] border border-black/[0.07] overflow-hidden">
      <div className="px-4 sm:px-6 py-4 sm:py-5 border-b border-black/[0.06]">
        <h2 className="font-bold text-[0.95rem] sm:text-[1rem] text-[#0D0D0D]" style={{ fontFamily: 'var(--font-display)' }}>
          Recent orders
        </h2>
        <p className="text-[0.72rem] sm:text-[0.75rem] text-black/40 mt-0.5">Last 7 days</p>
      </div>

      {/* Safe overflow for very small widths */}
      <div className="divide-y divide-black/[0.04]">
        {ORDERS.map((order) => (
          <div
            key={order.id}
            className="px-4 sm:px-6 py-3.5 sm:py-4 hover:bg-black/[0.018] transition-colors"
          >
            <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
              {/* Order info */}
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-[0.82rem] sm:text-[0.85rem] text-[#0D0D0D] truncate">
                  {order.product}
                </p>
                <p className="text-[0.68rem] sm:text-[0.72rem] text-black/40 mt-0.5 leading-relaxed">
                  {order.id} · {order.buyer} · {order.time}
                </p>
              </div>

              {/* Right side (amount + status) */}
              <div className="flex items-center justify-between sm:justify-end gap-2 sm:gap-3">
                <p className="font-bold text-[0.86rem] sm:text-[0.9rem] text-[#0D0D0D] flex-shrink-0">
                  ${order.amount}
                </p>
                <span
                  className={`text-[0.64rem] sm:text-[0.68rem] font-semibold px-2.5 py-1 rounded-full capitalize flex-shrink-0 ${STATUS_STYLES[order.status]}`}
                >
                  {order.status}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Earnings Chart (SVG-like bar chart using div bars) ────────────────────────

const WEEKLY_DATA = [
  { day: 'Mon', amount: 320 },
  { day: 'Tue', amount: 480 },
  { day: 'Wed', amount: 290 },
  { day: 'Thu', amount: 610 },
  { day: 'Fri', amount: 740 },
  { day: 'Sat', amount: 520 },
  { day: 'Sun', amount: 390 },
];

export function EarningsChart() {
  const max = Math.max(...WEEKLY_DATA.map((d) => d.amount));
  const chartH = 120;

  return (
    <div className="bg-white rounded-[16px] sm:rounded-[20px] border border-black/[0.07] p-4 sm:p-6">
      <div className="flex items-start justify-between gap-3 mb-5 sm:mb-6">
        <div>
          <h2 className="font-bold text-[0.95rem] sm:text-[1rem] text-[#0D0D0D]" style={{ fontFamily: 'var(--font-display)' }}>
            Weekly earnings
          </h2>
          <p className="text-[0.72rem] sm:text-[0.75rem] text-black/40 mt-0.5">This week</p>
        </div>

        <div className="text-right flex-shrink-0">
          <p className="font-extrabold text-[1.15rem] sm:text-[1.4rem] text-[#0D0D0D] leading-none" style={{ fontFamily: 'var(--font-display)' }}>
            $3,350
          </p>
          <p className="text-[0.66rem] sm:text-[0.72rem] text-[#2A5C45] font-medium mt-0.5">↑ 18% vs last week</p>
        </div>
      </div>

      {/* Bars */}
      <div className="flex items-end gap-1.5 sm:gap-2 h-[130px] sm:h-[140px]">
        {WEEKLY_DATA.map((d) => {
          const barH = Math.round((d.amount / max) * chartH);
          const isMax = d.amount === max;

          return (
            <div key={d.day} className="flex-1 flex flex-col items-center gap-1.5 sm:gap-2 group min-w-0">
              {/* Amount tooltip on hover */}
              <span className="text-[0.58rem] sm:text-[0.65rem] font-semibold text-[#E8622A] opacity-0 group-hover:opacity-100 transition-opacity">
                ${d.amount}
              </span>

              {/* Bar */}
              <div
                className="w-full relative rounded-t-[5px] sm:rounded-t-[6px] transition-all duration-300 group-hover:brightness-90"
                style={{
                  height: `${barH}px`,
                  background: isMax
                    ? 'linear-gradient(to top, #E8622A, #F07A48)'
                    : 'linear-gradient(to top, #EDE8DF, #D4CFC5)',
                  minHeight: 8,
                }}
              />

              {/* Day label */}
              <span className="text-[0.62rem] sm:text-[0.68rem] text-black/35 font-medium">{d.day}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}