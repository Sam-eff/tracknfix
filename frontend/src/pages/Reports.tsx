import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import api from "../api/axios";
import {
  AreaChart, Area, XAxis, YAxis, Tooltip as RechartsTooltip, ResponsiveContainer,
  BarChart, Bar, PieChart, Pie, Cell, Legend
} from "recharts";
import ProFeatureOverlay from "../components/ProFeatureOverlay";
import Pagination from "../components/Pagination";
import { useAuth } from "../context/AuthContext";

// ── Helpers ───────────────────────────────────────────────────────────────────
const fmt = (n: number | string) =>
  `₦${Number(n).toLocaleString("en-NG", { minimumFractionDigits: 2 })}`;

const inputStyle = {
  backgroundColor: "var(--color-bg)",
  border: "1px solid var(--color-border)",
  color: "var(--color-text)",
};

function Card({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`rounded-3xl p-6 shadow-sm transition-all hover:shadow-md ${className}`}
      style={{ backgroundColor: "var(--color-surface)", border: "1px solid var(--color-border)" }}>
      {children}
    </div>
  );
}

function SectionTitle({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <div className="mb-6 relative z-10">
      <h2 className="font-display font-extrabold text-xl text-app">{title}</h2>
      {subtitle && <p className="text-sm font-medium text-muted mt-1">{subtitle}</p>}
    </div>
  );
}

// ── Types ─────────────────────────────────────────────────────────────────────
interface SalesReportItem {
  period: string;
  revenue: number;
  profit: number;
  count: number;
}

interface BestSeller {
  product_name: string;
  total_qty: number;
  total_revenue: number;
}

interface TechnicianStat {
  technician_id: number;
  name: string;
  total_assigned: number;
  total_completed: number;
  total_revenue: number;
}

interface LowStockItem {
  id: number;
  name: string;
  quantity: number;
  low_stock_threshold: number;
  category_name: string | null;
}

interface CreditCustomer {
  customer_id: number;
  customer_name: string;
  phone: string;
  email: string;
  credit_sales_count: number;
  total_credit_amount: number;
  total_paid: number;
  total_owed: number;
  last_credit_sale_at: string;
}

interface CreditSummary {
  customers_with_balance: number;
  total_credit_sales: number;
  total_outstanding: number;
}

// ── Colors ────────────────────────────────────────────────────────────────────
const COLORS = ["var(--color-primary)", "#16a34a", "#f59e0b", "#d946ef", "#8b5cf6", "#06b6d4"];

// ── Sub-component: Stock Movements ─────────────────────────────────────────────
function StockMovementsTab() {
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [count, setCount] = useState(0);

  useEffect(() => {
    setLoading(true);
    api.get(`/inventory/stock-logs/?page=${page}`)
      .then((res) => {
        if (res.data.results) {
          setLogs(res.data.results);
          setCount(res.data.count);
        } else {
          setLogs(res.data);
          setCount(res.data.length);
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [page]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <svg className="animate-spin w-10 h-10 text-primary" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-20" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-80" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
        </svg>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-surface border border-app rounded-2xl overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-app">
            <tr>
              <th className="px-5 py-4 text-xs font-bold uppercase tracking-widest text-muted">Item</th>
              <th className="px-5 py-4 text-xs font-bold uppercase tracking-widest text-muted">Movement</th>
              <th className="px-5 py-4 text-xs font-bold uppercase tracking-widest text-muted">Reason</th>
              <th className="px-5 py-4 text-xs font-bold uppercase tracking-widest text-muted">Staff</th>
              <th className="px-5 py-4 text-xs font-bold uppercase tracking-widest text-muted">Date</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-app">
            {logs.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-5 py-10 text-center text-muted font-medium">
                  No stock movements recorded yet.
                </td>
              </tr>
            ) : (
              logs.map((log) => (
                <tr key={log.id} className="hover:bg-app/50 transition-colors">
                  <td className="px-5 py-4">
                    <p className="font-bold text-sm text-app">{log.product_name}</p>
                    <p className="text-xs text-muted mt-0.5">{log.quantity_after} units left</p>
                  </td>
                  <td className="px-5 py-4">
                    <span className="text-xs font-black px-2.5 py-1 rounded-lg"
                      style={{
                        backgroundColor: log.change_amount > 0 ? "#dcfce7" : "#fef2f2",
                        color: log.change_amount > 0 ? "#166534" : "#dc2626",
                      }}>
                      {log.change_amount > 0 ? `+${log.change_amount}` : log.change_amount}
                    </span>
                  </td>
                  <td className="px-5 py-4">
                    <span className="text-sm font-medium text-app">{log.reason_display || log.reason}</span>
                    {log.note && <p className="text-xs text-muted mt-0.5">{log.note}</p>}
                  </td>
                  <td className="px-5 py-4 text-sm text-app font-medium">{log.created_by_name || "—"}</td>
                  <td className="px-5 py-4 text-sm text-muted">
                    {new Date(log.created_at).toLocaleString("en-GB", {
                      dateStyle: "short", timeStyle: "short"
                    })}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      <Pagination count={count} page={page} pageSize={20} onChange={setPage} />
    </div>
  );
}

// ── Main Component ─────────────────────────────────────────────────────────────
export default function Reports() {
  const { isPro } = useAuth();
  const [tab, setTab] = useState<"overview" | "movements">("overview");

  const [period, setPeriod] = useState<"daily" | "weekly" | "monthly">("daily");
  const [dateFrom, setDateFrom] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() - 30);
    return d.toISOString().split("T")[0];
  });
  const [dateTo, setDateTo] = useState(() => new Date().toISOString().split("T")[0]);

  const [salesReport, setSalesReport] = useState<SalesReportItem[]>([]);
  const [salesSummary, setSalesSummary] = useState<any>(null);
  const [bestSellers, setBestSellers] = useState<BestSeller[]>([]);
  const [techStats, setTechStats] = useState<TechnicianStat[]>([]);
  const [lowStock, setLowStock] = useState<LowStockItem[]>([]);
  const [creditCustomers, setCreditCustomers] = useState<CreditCustomer[]>([]);
  const [creditSummary, setCreditSummary] = useState<CreditSummary>({
    customers_with_balance: 0,
    total_credit_sales: 0,
    total_outstanding: 0,
  });
  const [repairStatuses, setRepairStatuses] = useState<{name: string, value: number}[]>([]);
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);
  const [exportOpen, setExportOpen] = useState(false);
  const exportRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (exportRef.current && !exportRef.current.contains(e.target as Node)) {
        setExportOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const fetchAll = async () => {
    if (!isPro) {
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const params = { period, from: dateFrom, to: dateTo };
      const [salesRes, bestRes, techRes, lowRes, creditRes, dashRes] = await Promise.all([
        api.get("/reports/sales/", { params }),
        api.get("/reports/products/best-selling/", { params }),
        api.get("/reports/technicians/", { params }),
        api.get("/reports/inventory/low-stock/"),
        api.get("/reports/customers/credit/", { params }),
        api.get("/reports/dashboard/"), 
      ]);
      setSalesReport(salesRes.data.breakdown || []);
      setSalesSummary(salesRes.data.summary || null);
      setBestSellers(bestRes.data.results || bestRes.data || []);
      setTechStats(techRes.data.results || techRes.data || []);
      setLowStock(lowRes.data.results || lowRes.data || []);
      setCreditCustomers(creditRes.data.results || []);
      setCreditSummary(creditRes.data.summary || {
        customers_with_balance: 0,
        total_credit_sales: 0,
        total_outstanding: 0,
      });
      
      const repairsByStatus = dashRes.data?.repairs?.by_status || {};
      setRepairStatuses(Object.entries(repairsByStatus).map(([status, count]) => ({
        name: status.replace("_", " ").toUpperCase(),
        value: Number(count)
      })).filter(s => s.value > 0));
    } catch {
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchAll(); }, [period, dateFrom, dateTo, isPro]);

  const handleExport = async (fmt: "csv" | "pdf") => {
    setExporting(true);
    setExportOpen(false);
    try {
      const response = await api.get(`/reports/export/?download_format=${fmt}`, {
        params: {
          period,
          from: dateFrom,
          to: dateTo,
        },
        responseType: "blob",
      });
      const url = URL.createObjectURL(new Blob([response.data]));
      const a = document.createElement("a");
      a.href = url;
      a.download = `analytics_report_${new Date().toISOString().split("T")[0]}.${fmt}`;
      a.click();
      URL.revokeObjectURL(url);
    } catch {
    } finally {
      setExporting(false);
    }
  };

  const handlePeriodChange = (p: "daily" | "weekly" | "monthly") => {
    setPeriod(p);
    const dTo = new Date();
    const dFrom = new Date();
    
    if (p === "daily") {
      // Last 7 days
      dFrom.setDate(dTo.getDate() - 7);
    } else if (p === "weekly") {
      // Last 3 months
      dFrom.setMonth(dTo.getMonth() - 3);
    } else if (p === "monthly") {
      // Last 12 months
      dFrom.setFullYear(dTo.getFullYear() - 1);
    }
    
    setDateFrom(dFrom.toISOString().split("T")[0]);
    setDateTo(dTo.toISOString().split("T")[0]);
  };

  const reportData = salesReport;
  
  const formatYAxis = (tickItem: any) => {
    if (tickItem >= 1000000) return `₦${(tickItem / 1000000).toFixed(1)}M`;
    if (tickItem >= 1000) return `₦${(tickItem / 1000).toFixed(1)}k`;
    return `₦${tickItem}`;
  };

  const CustomChartTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const d = new Date(label);
      const isDate = !isNaN(d.getTime());
      
      return (
        <div className="bg-surface border-app border p-5 rounded-2xl shadow-xl flex flex-col gap-3 min-w-[180px]">
          <p className="text-xs font-bold text-muted uppercase tracking-wider">
            {isDate && typeof label === 'string' && label.includes('-') 
              ? period === 'monthly' ? d.toLocaleDateString('default', { month: 'long', year: 'numeric' }) : d.toLocaleDateString('default', { weekday: 'short', month: 'short', day: 'numeric' })
              : label}
          </p>
          <div className="space-y-2">
            {payload.map((entry: any, index: number) => (
              <div key={index} className="flex flex-col">
                <span className="text-sm font-medium opacity-80" style={{ color: entry.color }}>{entry.name}</span>
                <span className="text-lg font-black" style={{ color: entry.color }}>
                  {typeof entry.value === 'number' ? fmt(entry.value) : entry.value}
                </span>
              </div>
            ))}
          </div>
        </div>
      );
    }
    return null;
  };

  const totalRevenue = salesSummary?.total_revenue || 0;
  const totalProfit = salesSummary?.total_net_profit || 0;
  const totalSales = salesSummary?.total_sales || 0;
  const margin = totalRevenue > 0 ? ((totalProfit / totalRevenue) * 100).toFixed(1) : "0";

  if (!isPro) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="rounded-3xl border border-app bg-surface p-8 md:p-10 text-center shadow-sm">
          <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 text-primary">
            <svg className="h-8 w-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>

          <h1 className="font-display text-3xl font-extrabold text-app tracking-tight">
            Reports are available on Pro
          </h1>
          <p className="mx-auto mt-3 max-w-2xl text-base font-medium text-muted">
            Basic keeps your core shop operations running. Pro unlocks advanced reports, export tools,
            product insights, technician analytics, and deeper performance breakdowns.
          </p>

          <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 text-left">
            {[
              "Revenue and profit trend reports",
              "Best-selling product analytics",
              "Technician performance dashboards",
              "Credit customer summaries and exports",
            ].map((feature) => (
              <div key={feature} className="rounded-2xl border border-app bg-app px-4 py-4 text-sm font-semibold text-app">
                {feature}
              </div>
            ))}
          </div>

          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Link
              to="/billing"
              className="rounded-xl bg-primary px-6 py-3 text-sm font-bold text-white transition-all hover:-translate-y-0.5"
            >
              Upgrade to Pro
            </Link>
            <Link
              to="/"
              className="rounded-xl border border-app bg-app px-6 py-3 text-sm font-bold text-app transition-colors hover:bg-primary/5"
            >
              Back to Dashboard
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-10">

      {/* Header & Tabs */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-app pb-4">
        <div>
          <h1 className="font-display text-3xl font-extrabold text-app tracking-tight">
            Analytics Hub
          </h1>
          <p className="text-base font-medium mt-1 text-muted">
            Deep dive into your sales, product performance, and team efficiency.
          </p>
        </div>
        <div className="flex bg-surface border border-app rounded-xl p-1 shrink-0">
          <button onClick={() => setTab("overview")}
            className={`px-6 py-2 rounded-lg text-sm font-bold transition-all ${tab === "overview" ? "bg-primary text-white shadow-sm" : "text-muted hover:text-app"}`}>
            Overview
          </button>
          <button onClick={() => setTab("movements")}
            className={`px-6 py-2 rounded-lg text-sm font-bold transition-all ${tab === "movements" ? "bg-primary text-white shadow-sm" : "text-muted hover:text-app"}`}>
            Stock Movements
          </button>
        </div>
      </div>

      {tab === "overview" ? (
        <>
          {/* Control Bar */}
          <div className="flex flex-wrap items-center justify-between gap-4 bg-surface p-2 border border-app rounded-2xl shadow-sm">
        <div className="flex gap-2 p-1 overflow-x-auto">
          {(["daily", "weekly", "monthly"] as const).map((p) => (
            <button key={p} onClick={() => handlePeriodChange(p)}
              className="px-5 py-2 rounded-xl text-sm font-bold capitalize transition-all"
              style={{
                backgroundColor: period === p ? "var(--color-primary)" : "transparent",
                color: period === p ? "white" : "var(--color-muted)",
              }}>
              {p}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-3 pr-2">
          <div className="flex items-center gap-2">
            <input type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)}
              className="px-4 py-2 flex-1 rounded-xl text-sm outline-none font-medium" style={inputStyle} />
            <span className="text-sm font-bold text-muted px-1">to</span>
            <input type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)}
              className="px-4 py-2 flex-1 rounded-xl text-sm outline-none font-medium" style={inputStyle} />
          </div>

          <div className="relative" ref={exportRef}>
            <button
              onClick={() => setExportOpen((o) => !o)}
              disabled={exporting}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold transition-all bg-primary/10 text-primary hover:bg-primary/20"
              style={{ opacity: exporting ? 0.6 : 1 }}>
              {exporting ? (
                <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
              ) : (
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
              )}
              {exporting ? "Exporting..." : "Export Report"}
            </button>

            {exportOpen && (
              <div className="absolute right-0 top-full mt-2 w-48 z-50 rounded-2xl shadow-2xl p-2 overflow-hidden bg-surface border-app border">
                {(["csv", "pdf"] as const).map((fmt) => (
                  <button key={fmt} onClick={() => handleExport(fmt)}
                    className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold text-left transition-colors hover:bg-primary/10 hover:text-primary text-app">
                    <span className="uppercase">{fmt}</span> Report
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-[50vh]">
          <svg className="animate-spin w-10 h-10 text-primary" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-20" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-80" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
        </div>
      ) : (
        <div className="space-y-8">

          {/* KPI Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">
          {[
              { label: "Total Revenue", value: fmt(totalRevenue), color: "var(--color-primary)" },
              { label: "Gross Profit", value: fmt(totalProfit), color: "#16a34a" },
              { label: "Profit Margin", value: `${margin}%`, color: "#ea580c" },
              { label: "Total Sales", value: totalSales, color: "#9333ea" },
            ].map((s) => (
              <div key={s.label} className="rounded-3xl p-6 relative overflow-hidden transition-all hover:-translate-y-1 bg-surface border border-app shadow-sm flex flex-col gap-3">
                <p className="text-xs font-bold text-muted/80 uppercase tracking-widest">{s.label}</p>
                <p className="font-display font-extrabold tracking-tight leading-tight wrap-break-word min-w-0" style={{ color: s.color, fontSize: "clamp(1.25rem, 2.5vw, 2rem)" }}>
                  {s.value}
                </p>
                <div className="absolute -bottom-4 -right-4 w-24 h-24 rounded-full opacity-10 blur-xl" style={{ backgroundColor: s.color }}></div>
              </div>
            ))}
          </div>

          <Card>
            <SectionTitle
              title="Customers Owing on Credit"
              subtitle="Outstanding balances for credit sales in the selected period"
            />

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
              {[
                {
                  label: "Customers With Balance",
                  value: creditSummary.customers_with_balance,
                  tone: "var(--color-primary)",
                },
                {
                  label: "Outstanding Credit Sales",
                  value: creditSummary.total_credit_sales,
                  tone: "#ea580c",
                },
                {
                  label: "Total Amount Owed",
                  value: fmt(creditSummary.total_outstanding),
                  tone: "#dc2626",
                },
              ].map((item) => (
                <div
                  key={item.label}
                  className="rounded-2xl border border-app bg-app p-4"
                >
                  <p className="text-[11px] font-bold uppercase tracking-widest text-muted">
                    {item.label}
                  </p>
                  <p className="mt-2 font-display text-2xl font-extrabold" style={{ color: item.tone }}>
                    {item.value}
                  </p>
                </div>
              ))}
            </div>

            {creditCustomers.length === 0 ? (
              <div className="flex items-center justify-center h-[180px] bg-app rounded-2xl border border-dashed border-app">
                <p className="font-medium text-muted">No outstanding customer credit in this date range.</p>
              </div>
            ) : (
              <div className="w-full overflow-x-auto overflow-y-hidden rounded-2xl border border-app">
                <table className="w-full min-w-[920px] text-left bg-surface">
                  <thead className="bg-app">
                    <tr>
                      {[
                        "Customer",
                        "Contact",
                        "Credit Sales",
                        "Credit Amount",
                        "Amount Paid",
                        "Amount Owed",
                        "Last Credit Sale",
                      ].map((heading) => (
                        <th key={heading} className="px-5 py-4 text-xs font-bold uppercase tracking-widest text-muted">
                          {heading}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-app">
                    {creditCustomers.map((customer) => (
                      <tr key={customer.customer_id} className="hover:bg-app/50 transition-colors">
                        <td className="px-5 py-4">
                          <div className="font-bold text-sm text-app">{customer.customer_name}</div>
                          <div className="text-xs text-muted mt-0.5">
                            ID #{customer.customer_id}
                          </div>
                        </td>
                        <td className="px-5 py-4">
                          <div className="text-sm font-medium text-app">{customer.phone || "—"}</div>
                          <div className="text-xs text-muted mt-0.5">{customer.email || "No email"}</div>
                        </td>
                        <td className="px-5 py-4 text-sm font-semibold text-app">
                          {customer.credit_sales_count}
                        </td>
                        <td className="px-5 py-4 text-sm font-semibold text-app">
                          {fmt(customer.total_credit_amount)}
                        </td>
                        <td className="px-5 py-4 text-sm font-semibold text-green-700 dark:text-green-400">
                          {fmt(customer.total_paid)}
                        </td>
                        <td className="px-5 py-4">
                          <span className="inline-flex rounded-lg bg-red-100 px-3 py-1 text-sm font-black text-red-700 dark:bg-red-900/40 dark:text-red-400">
                            {fmt(customer.total_owed)}
                          </span>
                        </td>
                        <td className="px-5 py-4 text-sm font-medium text-muted">
                          {new Date(customer.last_credit_sale_at).toLocaleDateString("en-GB", {
                            dateStyle: "medium",
                          })}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </Card>

          {/* Master Trend Chart */}
          <ProFeatureOverlay featureName="Advanced Graphical Analytics">
            <Card className="min-h-[450px]">
              <SectionTitle title="Revenue vs Profit Over Time" subtitle={`Performance breakdown by ${period}`} />
              {reportData.length === 0 ? (
                <div className="flex items-center justify-center h-[350px] bg-app rounded-2xl border border-dashed border-app">
                  <p className="font-medium text-muted">No data available for this date range.</p>
                </div>
              ) : (
                <div className="h-[380px] w-full -ml-4">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={reportData} margin={{ top: 20, right: 20, left: 0, bottom: 0 }}>
                      <defs>
                        <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="var(--color-primary)" stopOpacity={0.5}/>
                          <stop offset="95%" stopColor="var(--color-primary)" stopOpacity={0}/>
                        </linearGradient>
                        <linearGradient id="colorProf" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#16a34a" stopOpacity={0.5}/>
                          <stop offset="95%" stopColor="#16a34a" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <XAxis 
                        dataKey="period" 
                        tickFormatter={(val) => {
                          const d = new Date(val);
                          return period === 'monthly' ? d.toLocaleDateString('default', { month: 'short', year: '2-digit' }) : d.toLocaleDateString('default', { month: 'short', day: 'numeric' });
                        }}
                        stroke="var(--color-border)" 
                        tick={{ fill: 'var(--color-muted)', fontSize: 13, fontWeight: 600 }}
                        tickLine={false}
                        axisLine={false}
                        dy={15}
                      />
                      <YAxis 
                        tickFormatter={formatYAxis} 
                        stroke="var(--color-border)" 
                        tick={{ fill: 'var(--color-muted)', fontSize: 13, fontWeight: 600 }}
                        tickLine={false}
                        axisLine={false}
                        width={80}
                      />
                      <RechartsTooltip content={<CustomChartTooltip />} cursor={{ stroke: 'var(--color-border)', strokeWidth: 2, strokeDasharray: '4 4' }} />
                      <Legend iconType="circle" wrapperStyle={{ paddingTop: '20px' }} />
                      <Area type="monotone" dataKey="revenue" name="Revenue" stroke="var(--color-primary)" fillOpacity={1} fill="url(#colorRev)" strokeWidth={3} activeDot={{ r: 6, strokeWidth: 0 }} />
                      <Area type="monotone" dataKey="net_profit" name="True Net Profit" stroke="#16a34a" fillOpacity={1} fill="url(#colorProf)" strokeWidth={3} activeDot={{ r: 6, strokeWidth: 0 }} />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              )}
            </Card>
          </ProFeatureOverlay>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Top Products */}
            <ProFeatureOverlay featureName="Top Product Insights" className="h-full">
              <Card className="h-full min-h-[400px]">
                <SectionTitle title="Top Products by Revenue" subtitle="Highest generating items in selected period" />
                {bestSellers.length === 0 ? (
                  <div className="flex items-center justify-center h-[280px] bg-app rounded-2xl border border-dashed border-app">
                    <p className="font-medium text-muted">No sales data recorded.</p>
                  </div>
                ) : (
                  <div className="h-[300px] w-full mt-4 -ml-4">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart layout="vertical" data={bestSellers} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                        <XAxis type="number" tickFormatter={formatYAxis} stroke="var(--color-border)" tick={{ fill: 'var(--color-muted)', fontSize: 12 }} tickLine={false} axisLine={false} />
                        <YAxis dataKey="product_name" type="category" width={110} stroke="var(--color-border)" tick={{ fill: 'var(--color-muted)', fontSize: 12, fontWeight: 500 }} tickLine={false} axisLine={false} tickFormatter={(val) => val.length > 15 ? val.substring(0, 15) + "..." : val} />
                        <RechartsTooltip content={<CustomChartTooltip />} cursor={{ fill: 'var(--color-bg)', opacity: 0.5 }} />
                        <Bar dataKey="total_revenue" name="Total Revenue" fill="var(--color-accent)" radius={[0, 8, 8, 0]} barSize={24} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                )}
              </Card>
            </ProFeatureOverlay>

            {/* Repair Status Distribution */}
            <ProFeatureOverlay featureName="Repair Analytics Dashboard" className="h-full">
              <Card className="h-full min-h-[400px]">
                <SectionTitle title="Repair Status Overview" subtitle="Breakdown of all logged tickets" />
                {repairStatuses.length === 0 ? (
                  <div className="flex items-center justify-center h-[280px] bg-app rounded-2xl border border-dashed border-app">
                    <p className="font-medium text-muted">No repair tickets active.</p>
                  </div>
                ) : (
                  <div className="h-[320px] w-full relative -mt-4">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={repairStatuses}
                          cx="50%"
                          cy="50%"
                          innerRadius={80}
                          outerRadius={120}
                          paddingAngle={6}
                          dataKey="value"
                          stroke="none"
                        >
                          {repairStatuses.map((_entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <RechartsTooltip content={<CustomChartTooltip />} />
                        <Legend verticalAlign="bottom" height={36} iconType="circle" />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                )}
              </Card>
            </ProFeatureOverlay>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Tech Performance */}
            <Card>
              <SectionTitle title="Technician Efficiency" subtitle="Repair completions and associated revenue" />
              {techStats.length === 0 ? (
                <div className="flex items-center justify-center h-[200px] bg-app rounded-2xl border border-dashed border-app">
                  <p className="font-medium text-muted">No technician data available.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {techStats.map((tech, i) => {
                    const completionRate = tech.total_assigned > 0
                      ? ((tech.total_completed / tech.total_assigned) * 100).toFixed(0)
                      : "0";
                    const initials = tech.name.split(" ").map((n: string) => n[0]).join("").substring(0, 2);
                    return (
                      <div key={tech.technician_id ?? i} className="p-5 rounded-2xl bg-app border border-app hover:border-primary/30 transition-colors">
                        <div className="flex items-center justify-between mb-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center font-black text-sm">
                              {initials}
                            </div>
                            <p className="text-base font-bold text-app">{tech.name}</p>
                          </div>
                          <span className="text-sm font-black px-3 py-1 bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-400 rounded-xl">{completionRate}% Done</span>
                        </div>
                        <div className="grid grid-cols-3 gap-4 text-center">
                          <div className="bg-surface p-3 rounded-xl shadow-sm border border-app hover:-translate-y-0.5 transition-transform">
                            <p className="text-2xl font-display font-black text-app">{tech.total_assigned}</p>
                            <p className="text-[10px] font-bold uppercase tracking-wider text-muted mt-1">Assigned</p>
                          </div>
                          <div className="bg-surface p-3 rounded-xl shadow-sm border border-app hover:-translate-y-0.5 transition-transform">
                            <p className="text-2xl font-display font-black text-green-600">{tech.total_completed}</p>
                            <p className="text-[10px] font-bold uppercase tracking-wider text-muted mt-1">Completed</p>
                          </div>
                          <div className="bg-surface p-3 rounded-xl shadow-sm border border-app hover:-translate-y-0.5 transition-transform">
                            <p className="text-2xl font-display font-black text-primary">{fmt(tech.total_revenue)}</p>
                            <p className="text-[10px] font-bold uppercase tracking-wider text-muted mt-1">Revenue</p>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </Card>

            {/* Low Stock Warning */}
            {lowStock.length > 0 && (
              <Card>
                <SectionTitle title="⚠️ Critical Low Stock" subtitle="Items requiring immediate attention" />
                <div className="w-full overflow-x-auto overflow-y-hidden rounded-2xl border border-app">
                  <table className="w-full text-left bg-surface">
                    <thead className="bg-app">
                      <tr>
                        {["Product Details", "In Stock", "Threshold"].map((h) => (
                          <th key={h} className="px-5 py-4 text-xs font-bold uppercase tracking-widest text-muted">
                            {h}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-app">
                      {lowStock.slice(0, 10).map((item) => (
                        <tr key={item.id} className="hover:bg-app/50 transition-colors">
                          <td className="px-5 py-4">
                            <div className="font-bold text-sm text-app">{item.name}</div>
                            <div className="text-xs text-muted mt-0.5">{item.category_name || "Uncategorised"}</div>
                          </td>
                          <td className="px-5 py-4">
                            <span className="text-sm font-black px-2.5 py-1 bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-400 rounded-lg">
                              {item.quantity} units
                            </span>
                          </td>
                          <td className="px-5 py-4 text-sm font-semibold text-muted">
                            {item.low_stock_threshold} units
                          </td>
                        </tr>
                      ))}
                      {lowStock.length > 10 && (
                        <tr>
                          <td colSpan={3} className="px-5 py-3 text-center text-xs font-bold text-muted bg-app">
                            + {lowStock.length - 10} more items below threshold...
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </Card>
            )}
          </div>
        </div>
      )}
      </>
      ) : (
        <StockMovementsTab />
      )}
    </div>
  );
}
