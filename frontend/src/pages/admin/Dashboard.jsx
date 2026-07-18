import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { FiCalendar, FiClock, FiChevronDown } from "react-icons/fi";
import { MdCurrencyRupee, MdOutlineLocalGasStation } from "react-icons/md";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Area,
  AreaChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import PageHeader from "../../components/PageHeader";
import StatCard from "../../components/StatCard";
import Badge from "../../components/Badge";
import ProgressBar from "../../components/ProgressBar";
import { apiErrorMessage, dashboardApi } from "../../utils/api";
import { dateTime, number, rupee } from "../../utils/formatters";
import { motion } from "framer-motion";

const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 15 },
  show: {
    opacity: 1,
    y: 0,
    transition: { type: "spring", stiffness: 100, damping: 15 },
  },
};
import {
  CardSkeleton,
  ChartSkeleton,
  TableSkeleton,
} from "../../components/Skeletons";
import Pagination from "../../components/Pagination";

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="rounded-xl border border-slate-100 bg-white/95 p-4 shadow-xl backdrop-blur-md min-w-[160px]">
        <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
          {label}
        </p>
        <div className="space-y-2">
          {payload.map((entry, idx) => (
            <div
              key={idx}
              className="flex items-center justify-between gap-4 text-sm font-semibold"
            >
              <div className="flex items-center gap-2">
                <span
                  className="h-2.5 w-2.5 rounded-full"
                  style={{
                    backgroundColor: entry.color || entry.fill || "#000",
                  }}
                />
                <span className="text-slate-600">{entry.name}</span>
              </div>
              <span className="text-slate-800">{number(entry.value, 2)} L</span>
            </div>
          ))}
        </div>
      </div>
    );
  }
  return null;
};

const RevenueTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="rounded-xl border border-slate-100 bg-white/95 p-4 shadow-xl backdrop-blur-md min-w-[140px]">
        <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">
          {label}
        </p>
        <div className="flex items-center gap-2 text-sm font-semibold">
          <span className="h-2.5 w-2.5 rounded-full bg-brand" />
          <span className="text-slate-600">Revenue:</span>
          <span className="text-slate-800 font-extrabold">
            {rupee(payload[0].value)}
          </span>
        </div>
      </div>
    );
  }
  return null;
};

const periods = [
  { value: "today", label: "Today" },
  { value: "7", label: "Last 7 Days" },
  { value: "15", label: "Last 15 Days" },
  { value: "30", label: "Last 30 Days" },
];

export default function Dashboard() {
  const [period, setPeriod] = useState("today");
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [tankPage, setTankPage] = useState(1);
  const itemsPerPage = 10;
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    setLoading(true);
    dashboardApi
      .get(period)
      .then((payload) => {
        if (!active) return;
        setData(payload);
        setError("");
      })
      .catch(
        (err) =>
          active && setError(apiErrorMessage(err, "Unable to load dashboard")),
      )
      .finally(() => active && setLoading(false));
    return () => {
      active = false;
    };
  }, [period]);

  const overview = data?.overview || {};
  const summary = data?.fuelSoldSummary || {
    petrol: {},
    diesel: {},
    premium: {},
    totalSold: 0,
    totalRevenue: 0,
  };
  const fuelPie = useMemo(
    () => [
      {
        name: "Petrol",
        value: Number(summary.petrol?.sold || 0),
        color: "#10b981",
      },
      {
        name: "Diesel",
        value: Number(summary.diesel?.sold || 0),
        color: "#0068ff",
      },
      {
        name: "Premium Petrol",
        value: Number(summary.premium?.sold || 0),
        color: "#8b5cf6",
      },
    ],
    [summary],
  );

  return (
    <>
      <PageHeader
        title="Dashboard"
        subtitle="Overview of your petrol pump operations"
        action={
          <div className="relative">
            <select
              value={period}
              onChange={(event) => setPeriod(event.target.value)}
              className="field !appearance-none !pr-10 w-full sm:w-48"
            >
              {periods.map((item) => (
                <option key={item.value} value={item.value}>
                  {item.label}
                </option>
              ))}
            </select>
            <div className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-lg text-muted">
              <FiChevronDown />
            </div>
          </div>
        }
      />
      {error && (
        <div className="mb-5 rounded-md border border-red-200 bg-red-50 p-4 text-sm font-semibold text-red-600">
          {error}
        </div>
      )}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="show"
        className="grid gap-5 md:grid-cols-2 xl:grid-cols-4"
      >
        {loading ? (
          <CardSkeleton count={4} />
        ) : (
          <>
            <motion.div variants={itemVariants}>
              <StatCard
                icon={<MdCurrencyRupee />}
                label="Total Revenue"
                value={rupee(overview.totalRevenue || 0)}
              />
            </motion.div>
            <motion.div variants={itemVariants}>
              <StatCard
                icon={<MdOutlineLocalGasStation />}
                label="Total Fuel Sold"
                value={`${number(overview.totalFuelSold || 0, 2)} L`}
                accent="green"
              />
            </motion.div>
            <motion.div variants={itemVariants}>
              <StatCard
                icon={<FiCalendar />}
                label="Completed Shifts"
                value={overview.completedShifts || 0}
                accent="purple"
              />
            </motion.div>
            <motion.div variants={itemVariants}>
              <StatCard
                icon={<FiClock />}
                label="Ongoing Shifts"
                value={overview.ongoingShifts || 0}
                accent="orange"
              />
            </motion.div>
          </>
        )}
      </motion.div>
      <div className="mt-7">
        <section className="soft-card p-6">
          <h2 className="mb-5 text-xl font-bold">Revenue Trend</h2>
          {loading ? (
            <ChartSkeleton />
          ) : (
            <motion.div
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3 }}
              className="h-[290px] min-w-0"
            >
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart
                  data={data?.revenueChart || []}
                  margin={{ left: 8, right: 16, top: 10, bottom: 0 }}
                >
                  <defs>
                    <linearGradient
                      id="colorRevenue"
                      x1="0"
                      y1="0"
                      x2="0"
                      y2="1"
                    >
                      <stop offset="5%" stopColor="#0068ff" stopOpacity={0.2} />
                      <stop offset="95%" stopColor="#0068ff" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid
                    strokeDasharray="4 4"
                    vertical={false}
                    stroke="#f1f5f9"
                  />
                  <XAxis
                    dataKey="label"
                    tick={{ fontSize: 11, fill: "#64748b" }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis
                    tickFormatter={(value) => `₹${Math.round(value / 1000)}K`}
                    width={62}
                    tick={{ fontSize: 11, fill: "#64748b" }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <Tooltip content={<RevenueTooltip />} />
                  <Area
                    type="monotone"
                    dataKey="revenue"
                    stroke="#0068ff"
                    strokeWidth={3}
                    fillOpacity={1}
                    fill="url(#colorRevenue)"
                    activeDot={{ r: 5, strokeWidth: 0, fill: "#0068ff" }}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </motion.div>
          )}
        </section>
      </div>
      <section className="soft-card mt-7 p-6">
        <h2 className="mb-5 text-xl font-bold">Fuel Sold Trend</h2>
        {loading ? (
          <ChartSkeleton />
        ) : (
          <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3 }}
            className="h-[280px] min-w-0"
          >
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={data?.fuelSoldChart || []}
                margin={{ left: 8, right: 16, top: 10, bottom: 0 }}
                barSize={22}
                barGap={4}
              >
                <defs>
                  <linearGradient id="barPetrol" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#10b981" />
                    <stop offset="100%" stopColor="#059669" />
                  </linearGradient>
                  <linearGradient id="barDiesel" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#60a5fa" />
                    <stop offset="100%" stopColor="#2563eb" />
                  </linearGradient>
                  <linearGradient id="barPremium" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#c084fc" />
                    <stop offset="100%" stopColor="#7e22ce" />
                  </linearGradient>
                </defs>
                <CartesianGrid
                  strokeDasharray="4 4"
                  vertical={false}
                  stroke="#f1f5f9"
                />
                <XAxis
                  dataKey="label"
                  tick={{ fontSize: 11, fill: "#64748b" }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  width={58}
                  tick={{ fontSize: 11, fill: "#64748b" }}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip
                  content={<CustomTooltip />}
                  cursor={{ fill: "#f8fafc", opacity: 0.6 }}
                />
                <Legend wrapperStyle={{ paddingTop: "20px" }} />
                <Bar
                  dataKey="petrol"
                  name="Petrol"
                  fill="url(#barPetrol)"
                  radius={[4, 4, 0, 0]}
                />
                <Bar
                  dataKey="diesel"
                  name="Diesel"
                  fill="url(#barDiesel)"
                  radius={[4, 4, 0, 0]}
                />
                <Bar
                  dataKey="premium"
                  name="Premium Petrol"
                  fill="url(#barPremium)"
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </motion.div>
        )}
      </section>
      <div className="mt-7 grid gap-7 xl:grid-cols-2">
        {loading ? (
          <>
            <section className="soft-card p-6">
              <h2 className="mb-5 text-xl font-bold">Tank Status</h2>
              <TableSkeleton rows={4} cols={2} />
            </section>
            <section className="soft-card p-6">
              <h2 className="text-xl font-bold">Fuel Sold Summary</h2>
              <div className="flex h-60 items-center justify-center">
                <CardSkeleton count={1} />
              </div>
            </section>
          </>
        ) : (
          <>
            <section className="soft-card p-6">
              <div className="mb-5 flex items-center justify-between">
                <h2 className="text-xl font-bold">Tank Status</h2>
                <Link
                  to="/admin/tanks"
                  className="text-sm font-semibold text-brand hover:underline"
                >
                  View All
                </Link>
              </div>
              <div className="space-y-6">
                {(data?.tankStatus || [])
                  .slice((tankPage - 1) * itemsPerPage, tankPage * itemsPerPage)
                  .map((tank) => {
                    const pct = Number(tank.percentage || 0);
                    const textClass =
                      pct < 30
                        ? "text-red-500"
                        : pct < 60
                          ? "text-orange-500"
                          : "text-emerald-600";
                    const theme =
                      pct < 30
                        ? {
                            bg: "bg-red-50",
                            text: "text-red-500",
                            bar: "bg-red-500",
                          }
                        : pct < 60
                          ? {
                              bg: "bg-orange-50",
                              text: "text-orange-500",
                              bar: "bg-orange-500",
                            }
                          : tank.fuelType === "DIESEL"
                            ? {
                                bg: "bg-blue-50",
                                text: "text-brand",
                                bar: "bg-brand",
                              }
                            : tank.fuelType === "PETROL"
                              ? {
                                  bg: "bg-emerald-50",
                                  text: "text-emerald-500",
                                  bar: "bg-emerald-500",
                                }
                              : {
                                  bg: "bg-violet-50",
                                  text: "text-violet-500",
                                  bar: "bg-violet-500",
                                };
                    return (
                      <div key={tank.tankId} className="flex gap-4">
                        <div
                          className={`grid h-12 w-12 shrink-0 place-items-center rounded-full ${theme.bg} ${theme.text} text-2xl`}
                        >
                          <MdOutlineLocalGasStation />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="mb-2 flex items-center justify-between gap-3">
                            <div>
                              <p className="font-bold text-slate-800 leading-snug">
                                {tank.name}
                              </p>
                              <p className="text-sm text-muted">
                                {tank.fuelType.charAt(0).toUpperCase() +
                                  tank.fuelType.slice(1).toLowerCase()}
                              </p>
                            </div>
                            <strong
                              className={`text-lg font-bold ${textClass}`}
                            >
                              {pct}%
                            </strong>
                          </div>
                          <ProgressBar value={pct} color={theme.bar} />
                          <p className="mt-1.5 text-right text-sm text-muted">
                            {number(tank.remaining)} / {number(tank.capacity)} L
                          </p>
                        </div>
                      </div>
                    );
                  })}
                {!(data?.tankStatus || []).length && (
                  <p className="text-center text-muted">
                    No tank data available.
                  </p>
                )}
              </div>
              <Pagination
                currentPage={tankPage}
                totalPages={Math.ceil(
                  (data?.tankStatus || []).length / itemsPerPage,
                )}
                onPageChange={setTankPage}
                totalEntries={(data?.tankStatus || []).length}
                entriesPerPage={itemsPerPage}
              />
            </section>

            <section className="soft-card p-6">
              <h2 className="text-xl font-bold">Fuel Sold Summary</h2>
              <div className="mt-5 grid gap-5 md:grid-cols-[220px_1fr] xl:grid-cols-1 2xl:grid-cols-[220px_1fr]">
                <div className="relative h-56 min-w-0">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={fuelPie}
                        innerRadius={75}
                        outerRadius={105}
                        dataKey="value"
                      >
                        {fuelPie.map((entry) => (
                          <Cell key={entry.name} fill={entry.color} />
                        ))}
                      </Pie>
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="pointer-events-none absolute inset-0 grid place-items-center text-center">
                    <div>
                      <p className="text-xl font-bold">
                        {number(summary.totalSold || 0, 2)} L
                      </p>
                      <p className="text-sm text-muted">Total</p>
                    </div>
                  </div>
                </div>
                <div className="flex flex-col justify-center gap-4">
                  {fuelPie.map((item) => (
                    <div
                      key={item.name}
                      className="flex items-center justify-between gap-4"
                    >
                      <span className="flex items-center gap-3">
                        <span
                          className="h-3 w-3 rounded-full"
                          style={{ background: item.color }}
                        />
                        {item.name}
                      </span>
                      <strong>{number(item.value, 2)} L</strong>
                    </div>
                  ))}
                  <div className="rounded-lg bg-blue-50 p-4 text-center">
                    <span>Total Amount</span>
                    <strong className="ml-4 text-xl">
                      {rupee(summary.totalRevenue || 0)}
                    </strong>
                  </div>
                </div>
              </div>
            </section>
          </>
        )}
      </div>
    </>
  );
}
