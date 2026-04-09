import {
  Area,
  AreaChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
} from "recharts";

interface TrendData {
  period: string;
  revenue: number;
  net_profit: number;
}

function CustomTooltip({ active, payload }: { active?: boolean; payload?: Array<{ payload: TrendData }> }) {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    const d = new Date(data.period);
    const fmt = (n: number) => `₦${Number(n).toLocaleString()}`;
    return (
      <div className="bg-surface border-app border p-4 rounded-2xl shadow-xl flex flex-col gap-2 min-w-[160px]">
        <p className="text-xs font-bold text-muted uppercase tracking-wider">
          {d.toLocaleDateString("default", { weekday: "short", month: "short", day: "numeric" })}
        </p>
        <div>
          <p className="text-sm font-medium text-muted">Revenue</p>
          <p className="text-lg font-black text-primary">{fmt(data.revenue)}</p>
        </div>
      </div>
    );
  }
  return null;
}

export default function DashboardRevenueChart({
  trends,
  role,
}: {
  trends: TrendData[];
  role?: string;
}) {
  if (trends.length === 0) {
    return (
      <div className="h-[300px] flex items-center justify-center bg-app rounded-2xl border border-dashed border-app">
        <p className="font-medium text-muted">
          {role === "technician"
            ? "Revenue trends are available to admins and staff."
            : "No trend data available."}
        </p>
      </div>
    );
  }

  return (
    <div className="h-[320px] w-full -ml-4 relative z-10">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={trends} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id="colorTrend" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="var(--color-primary)" stopOpacity={0.4} />
              <stop offset="95%" stopColor="var(--color-primary)" stopOpacity={0} />
            </linearGradient>
          </defs>
          <XAxis
            dataKey="period"
            tickFormatter={(val) => new Date(val).toLocaleDateString("default", { weekday: "short" })}
            stroke="var(--color-border)"
            tick={{ fill: "var(--color-muted)", fontSize: 12, fontWeight: 600 }}
            tickLine={false}
            axisLine={false}
            dy={10}
          />
          <Tooltip
            content={<CustomTooltip />}
            cursor={{ stroke: "var(--color-primary)", strokeWidth: 2, strokeDasharray: "4 4" }}
          />
          <Area
            type="monotone"
            dataKey="revenue"
            stroke="var(--color-primary)"
            fillOpacity={1}
            fill="url(#colorTrend)"
            strokeWidth={4}
            activeDot={{ r: 8, strokeWidth: 0, fill: "var(--color-primary)" }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
