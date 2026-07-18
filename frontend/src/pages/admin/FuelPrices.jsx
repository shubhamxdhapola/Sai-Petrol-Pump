import { useEffect, useMemo, useState } from "react";
import { FiPlus, FiChevronDown } from "react-icons/fi";
import { MdOutlineLocalGasStation } from "react-icons/md";
import { useDispatch, useSelector } from "react-redux";
import {
  Area,
  AreaChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  CartesianGrid,
} from "recharts";
import Badge from "../../components/Badge";
import { Field, SelectField } from "../../components/FormControls";
import Modal from "../../components/Modal";
import PageHeader from "../../components/PageHeader";
import {
  getCurrentFuelPrices,
  getFuelPriceHistory,
  addFuelPrice,
} from "../../redux/slices/fuelPrice.slice";
import { dateTime, rupee } from "../../utils/formatters";
import { showErrorToast, showSuccessToast } from "../../utils/helper";
import { CardSkeleton, ChartSkeleton, TableSkeleton } from "../../components/Skeletons";
import Pagination from "../../components/Pagination";

const PriceTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="rounded-xl border border-slate-100 bg-white/95 p-4 shadow-xl backdrop-blur-md min-w-[160px]">
        <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
          {label}
        </p>
        <div className="space-y-2">
          {payload.map((entry, idx) => (
            <div key={idx} className="flex items-center justify-between gap-4 text-sm font-semibold">
              <div className="flex items-center gap-2">
                <span 
                  className="h-2.5 w-2.5 rounded-full" 
                  style={{ backgroundColor: entry.color || entry.stroke || "#000" }}
                />
                <span className="text-slate-600">{entry.name}</span>
              </div>
              <span className="text-slate-800 font-extrabold">
                {rupee(entry.value)}/L
              </span>
            </div>
          ))}
        </div>
      </div>
    );
  }
  return null;
};

export default function FuelPrices() {
  const dispatch = useDispatch();
  const {
    current,
    history,
    fetchingHistory,
    fetchingCurrent,
    error: reduxError,
  } = useSelector((state) => state.fuelPrice);

  const [open, setOpen] = useState(false);
  const [fuelFilter, setFuelFilter] = useState("");
  const [form, setForm] = useState({
    fuelType: "PETROL",
    price: "",
    effectiveFrom: "",
  });
  const [localError, setLocalError] = useState("");
  const [saving, setSaving] = useState(false);

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => {
    setCurrentPage(1);
  }, [fuelFilter]);

  const error =
    localError ||
    (typeof reduxError === "string" ? reduxError : reduxError?.message);

  useEffect(() => {
    dispatch(getCurrentFuelPrices());
  }, [dispatch]);

  useEffect(() => {
    dispatch(getFuelPriceHistory(fuelFilter));
  }, [dispatch, fuelFilter]);

  const chartData = useMemo(() => {
    if (!history) return [];
    const grouped = {};
    [...history].reverse()?.forEach((item) => {
      const label = new Date(item.effectiveFrom).toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
      });
      if (!grouped[label]) {
        grouped[label] = { label };
      }
      if (item.fuelType === "PETROL") {
        grouped[label].petrolPrice = item.price;
      } else if (item.fuelType === "DIESEL") {
        grouped[label].dieselPrice = item.price;
      } else if (item.fuelType === "PREMIUM") {
        grouped[label].premiumPrice = item.price;
      }
    });
    return Object.values(grouped);
  }, [history]);

  const submit = async (event) => {
    event.preventDefault();
    setSaving(true);
    setLocalError("");

    // Frontend Validation
    const fuel = (form.fuelType || "").trim().toUpperCase();
    if (fuel !== "PETROL" && fuel !== "DIESEL" && fuel !== "PREMIUM") {
      showErrorToast("Fuel type must be either PETROL, DIESEL or PREMIUM");
      setSaving(false);
      return;
    }
    const prVal = Number(form.price);
    if (isNaN(prVal) || prVal <= 0) {
      showErrorToast("Price must be greater than 0");
      setSaving(false);
      return;
    }

    try {
      await dispatch(
        addFuelPrice({
          fuelType: fuel,
          price: prVal,
          ...(form.effectiveFrom ? { effectiveFrom: form.effectiveFrom } : {}),
        }),
      ).unwrap();
      dispatch(getCurrentFuelPrices());
      dispatch(getFuelPriceHistory(fuelFilter));
      showSuccessToast("Fuel price added successfully");
      setOpen(false);
      setForm({ fuelType: "PETROL", price: "", effectiveFrom: "" });
    } catch (err) {
      showErrorToast(err || "Unable to save fuel price");
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <PageHeader
        title="Fuel Prices"
        subtitle="Manage current prices and view historical price changes"
        action={
          <button onClick={() => setOpen(true)} className="btn-primary">
            <FiPlus />
            Add New Price
          </button>
        }
      />
      {error && (
        <div className="mb-5 rounded-md border border-red-200 bg-red-50 p-4 text-sm font-semibold text-red-600">
          {error}
        </div>
      )}
      <div className="grid gap-5 lg:grid-cols-3">
        {fetchingCurrent ? (
          <CardSkeleton count={3} />
        ) : (
          ["PETROL", "DIESEL", "PREMIUM"]?.map((fuel) => {
            const price = current?.[fuel];
            const isPremium = fuel === "PREMIUM";
            const isDiesel = fuel === "DIESEL";
            const fuelLabel = isPremium ? "PREMIUM PETROL" : fuel;
            const themeColor = isPremium ? "text-purple-600" : isDiesel ? "text-blue-600" : "text-emerald-600";
            const bgColor = isPremium ? "bg-purple-50" : isDiesel ? "bg-blue-50" : "bg-emerald-50";

            return (
              <section
                key={fuel}
                className="soft-card overflow-hidden flex flex-col justify-between !p-0 border border-slate-100 hover:shadow-lg transition-all duration-300"
              >
                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4 bg-slate-50/50 border-b border-slate-100">
                  <div className="flex items-center gap-2.5">
                    <span className={`inline-block p-2 rounded-lg ${bgColor} ${themeColor}`}>
                      <MdOutlineLocalGasStation className="text-xl" />
                    </span>
                    <h2 className={`text-base font-extrabold tracking-wider ${themeColor}`}>
                      {fuelLabel}
                    </h2>
                  </div>
                  <Badge
                    tone={
                      isDiesel
                        ? "blue"
                        : isPremium
                          ? "purple"
                          : "green"
                    }
                  >
                    Active
                  </Badge>
                </div>

                {/* Body */}
                <div className="px-6 py-5 flex-1 flex flex-col justify-center">
                  <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                    Current Price
                  </span>
                  <div className="mt-1 flex items-baseline gap-1.5">
                    <span className="text-3xl font-black text-slate-800">
                      {price ? rupee(price.price) : "—"}
                    </span>
                    <span className="text-sm font-bold text-slate-500">/ Litre</span>
                  </div>
                </div>

                {/* Footer */}
                <div className="px-6 py-4 border-t border-slate-100 bg-slate-50/30 flex items-center justify-between text-xs text-slate-500">
                  <span className="font-medium text-slate-400">Effective From</span>
                  <span className="font-semibold text-slate-700">
                    {price ? dateTime(price.effectiveFrom) : "—"}
                  </span>
                </div>
              </section>
            );
          })
        )}
      </div>
      <section className="soft-card mt-6 p-6">
        <div className="mb-5 flex flex-col justify-between gap-4 border-b border-slate-200 pb-5 sm:flex-row sm:items-center">
          <h2 className="text-xl font-bold">Price Changes Trend</h2>
          <div className="w-56">
            <SelectField
              label="Filter Fuel Type"
              value={fuelFilter}
              onChange={(e) => setFuelFilter(e.target.value)}
            >
              <option value="">All Fuel Types</option>
              <option value="PETROL">Petrol</option>
              <option value="DIESEL">Diesel</option>
              <option value="PREMIUM">Premium Petrol</option>
            </SelectField>
          </div>
        </div>
        {fetchingHistory ? (
          <ChartSkeleton />
        ) : (
          <div className="h-72 min-w-0">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={chartData}
                margin={{ left: 8, right: 16, top: 10, bottom: 0 }}
              >
                <defs>
                  <linearGradient id="colorPetrol" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.15} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="colorDiesel" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#0068ff" stopOpacity={0.15} />
                    <stop offset="95%" stopColor="#0068ff" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="colorPremium" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.15} />
                    <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
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
                  tickFormatter={(val) => `₹${val}`}
                  width={56}
                  tick={{ fontSize: 11, fill: "#64748b" }}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip content={<PriceTooltip />} />
                {(!fuelFilter || fuelFilter === "PETROL") && (
                  <Area
                    type="monotone"
                    dataKey="petrolPrice"
                    stroke="#10b981"
                    strokeWidth={3}
                    fillOpacity={1}
                    fill="url(#colorPetrol)"
                    connectNulls
                    name="Petrol"
                    activeDot={{ r: 5, strokeWidth: 0, fill: "#10b981" }}
                  />
                )}
                {(!fuelFilter || fuelFilter === "DIESEL") && (
                  <Area
                    type="monotone"
                    dataKey="dieselPrice"
                    stroke="#0068ff"
                    strokeWidth={3}
                    fillOpacity={1}
                    fill="url(#colorDiesel)"
                    connectNulls
                    name="Diesel"
                    activeDot={{ r: 5, strokeWidth: 0, fill: "#0068ff" }}
                  />
                )}
                {(!fuelFilter || fuelFilter === "PREMIUM") && (
                  <Area
                    type="monotone"
                    dataKey="premiumPrice"
                    stroke="#8b5cf6"
                    strokeWidth={3}
                    fillOpacity={1}
                    fill="url(#colorPremium)"
                    connectNulls
                    name="Premium Petrol"
                    activeDot={{ r: 5, strokeWidth: 0, fill: "#8b5cf6" }}
                  />
                )}
              </AreaChart>
            </ResponsiveContainer>
          </div>
        )}
      </section>
      <section className="table-wrap mt-5">
        {fetchingHistory ? (
          <TableSkeleton rows={4} cols={3} />
        ) : (
          <>
            <table className="w-full min-w-[760px] text-left text-sm">
              <thead className="bg-slate-50 text-muted">
                <tr>
                  <th className="p-4">Fuel Type</th>
                  <th>Price</th>
                  <th>Effective From</th>
                </tr>
              </thead>
              <tbody>
                {history?.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage).map((price) => (
                  <tr key={price._id} className="border-t border-slate-200">
                    <td className="p-4">
                      <Badge
                        tone={
                          price.fuelType === "PREMIUM"
                            ? "purple"
                            : price.fuelType === "DIESEL"
                              ? "blue"
                              : "green"
                        }
                      >
                        {price.fuelType}
                      </Badge>
                    </td>
                    <td className="font-bold">{rupee(price.price)} / L</td>
                    <td>{dateTime(price.effectiveFrom)}</td>
                  </tr>
                ))}
                {!history?.length && (
                  <tr>
                    <td colSpan="3" className="p-8 text-center text-muted">
                      No fuel price history available.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
            <Pagination
              currentPage={currentPage}
              totalPages={Math.ceil((history || []).length / itemsPerPage)}
              onPageChange={setCurrentPage}
              totalEntries={(history || []).length}
              entriesPerPage={itemsPerPage}
            />
          </>
        )}
      </section>
      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title="Add New Fuel Price"
      >
        <form onSubmit={submit} className="space-y-5">
          <SelectField
            label="Fuel Type"
            value={form.fuelType}
            onChange={(e) => setForm({ ...form, fuelType: e.target.value })}
            required
          >
            <option>PETROL</option>
            <option>DIESEL</option>
            <option>PREMIUM</option>
          </SelectField>
          <Field
            label="Price (Rs / L)"
            type="number"
            step="0.01"
            value={form.price}
            onChange={(e) => setForm({ ...form, price: e.target.value })}
            required
          />
          <Field
            label="Effective From"
            type="datetime-local"
            value={form.effectiveFrom}
            onChange={(e) =>
              setForm({ ...form, effectiveFrom: e.target.value })
            }
          />
          <div className="flex flex-wrap justify-end gap-4 pt-3">
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="btn-secondary"
            >
              Cancel
            </button>
            <button className="btn-primary" disabled={saving}>
              {saving ? "Saving..." : "Save"}
            </button>
          </div>
        </form>
      </Modal>
    </>
  );
}
