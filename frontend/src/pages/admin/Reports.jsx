import { useEffect, useMemo, useState } from "react";
import { FiDownload } from "react-icons/fi";
import PageHeader from "../../components/PageHeader";
import Badge from "../../components/Badge";
import { Field, SelectField } from "../../components/FormControls";
import { apiErrorMessage, downloadBlob, reportApi } from "../../utils/api";
import { dateTime, number, rupee } from "../../utils/formatters";
import { TableSkeleton } from "../../components/Skeletons";
import Pagination from "../../components/Pagination";

export default function Reports() {
  const [tab, setTab] = useState("sales");
  const [period, setPeriod] = useState("7");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [data, setData] = useState({ report: [], totals: {} });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => {
    setCurrentPage(1);
  }, [tab, period, startDate, endDate]);

  const params = useMemo(
    () => (period === "custom" ? { period, startDate, endDate } : { period }),
    [period, startDate, endDate],
  );

  const load = async () => {
    if (period === "custom" && (!startDate || !endDate)) return;
    setLoading(true);
    try {
      const payload =
        tab === "sales"
          ? await reportApi.sales(params)
          : await reportApi.refills(params);
      setData(payload);
      setError("");
    } catch (err) {
      setError(apiErrorMessage(err, "Unable to load report"));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, [tab, params]);

  const download = async () => {
    try {
      const response =
        tab === "sales"
          ? await reportApi.downloadSales(params)
          : await reportApi.downloadRefills(params);
      downloadBlob(response, `${tab}-report.xlsx`);
    } catch (err) {
      setError(apiErrorMessage(err, "Unable to download report"));
    }
  };

  return (
    <>
      <PageHeader
        title="Reports"
        subtitle="View and download petrol pump reports"
        // action={
        //   <button onClick={download} className="btn-secondary">
        //     <FiDownload />
        //     Export Report
        //   </button>
        // }
      />
      {error && (
        <div className="mb-5 rounded-md border border-red-200 bg-red-50 p-4 text-sm font-semibold text-red-600">
          {error}
        </div>
      )}
      <div className="mb-5 flex gap-8 border-b border-slate-200 text-sm font-semibold">
        <button
          onClick={() => setTab("sales")}
          className={
            tab === "sales"
              ? "border-b-2 border-brand pb-4 text-brand"
              : "pb-4 text-muted"
          }
        >
          Sales
        </button>
        <button
          onClick={() => setTab("refills")}
          className={
            tab === "refills"
              ? "border-b-2 border-brand pb-4 text-brand"
              : "pb-4 text-muted"
          }
        >
          Tank Refills
        </button>
      </div>
      <section className="soft-card mb-6 p-5">
        <div className="grid gap-4 lg:grid-cols-4">
          <SelectField
            label="Period"
            value={period}
            onChange={(e) => setPeriod(e.target.value)}
          >
            <option value="7">Last 7 Days</option>
            <option value="15">Last 15 Days</option>
            <option value="30">Last 30 Days</option>
            <option value="custom">Custom Range</option>
          </SelectField>
          {period === "custom" && (
            <>
              <Field
                label="Start Date"
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
              <Field
                label="End Date"
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
              />
              <div className="flex items-end">
                <button
                  onClick={load}
                  className="btn-primary w-full"
                  type="button"
                >
                  Apply
                </button>
              </div>
            </>
          )}
        </div>
      </section>
      {tab === "sales" ? (
        <section className="soft-card p-5">
          <div className="mb-4 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
            <h2 className="text-xl font-bold">Sales Report</h2>
            <button onClick={download} className="btn-secondary">
              <FiDownload />
              Export
            </button>
          </div>
          <div className="table-wrap">
            {loading ? (
              <TableSkeleton rows={4} cols={8} />
            ) : (
              <>
                <table className="w-full min-w-[900px] text-left text-sm">
                  <thead className="bg-slate-50 text-muted">
                    <tr>
                      <th className="p-4">Date</th>
                      <th>Petrol Sold</th>
                      <th>Diesel Sold</th>
                      <th>Premium Sold</th>
                      <th>Petrol Revenue</th>
                      <th>Diesel Revenue</th>
                      <th>Premium Revenue</th>
                      <th>Total Revenue</th>
                    </tr>
                  </thead>
                  <tbody>
                    {!data.report.length && (
                      <tr>
                        <td colSpan="8" className="p-8 text-center text-muted">
                          No sales data available for this period.
                        </td>
                      </tr>
                    )}
                    {data.report.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage).map((row) => (
                      <tr key={row.date} className="border-t border-slate-200">
                        <td className="p-4 font-bold">{row.date}</td>
                        <td>{number(row.petrolSold, 2)} L</td>
                        <td>{number(row.dieselSold, 2)} L</td>
                        <td>{number(row.premiumSold || 0, 2)} L</td>
                        <td>{rupee(row.petrolRevenue)}</td>
                        <td>{rupee(row.dieselRevenue)}</td>
                        <td>{rupee(row.premiumRevenue || 0)}</td>
                        <td className="font-bold">{rupee(row.totalRevenue)}</td>
                      </tr>
                    ))}
                    <tr className="bg-blue-50 font-bold">
                      <td className="p-4">Total</td>
                      <td>{number(data.totals.petrolSold || 0, 2)} L</td>
                      <td>{number(data.totals.dieselSold || 0, 2)} L</td>
                      <td>{number(data.totals.premiumSold || 0, 2)} L</td>
                      <td>{rupee(data.totals.petrolRevenue || 0)}</td>
                      <td>{rupee(data.totals.dieselRevenue || 0)}</td>
                      <td>{rupee(data.totals.premiumRevenue || 0)}</td>
                      <td className="text-brand">
                        {rupee(data.totals.totalRevenue || 0)}
                      </td>
                    </tr>
                  </tbody>
                </table>
                <Pagination
                  currentPage={currentPage}
                  totalPages={Math.ceil(data.report.length / itemsPerPage)}
                  onPageChange={setCurrentPage}
                  totalEntries={data.report.length}
                  entriesPerPage={itemsPerPage}
                />
              </>
            )}
          </div>
        </section>
      ) : (
        <section className="soft-card p-5">
          <div className="mb-4 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
            <h2 className="text-xl font-bold">Tank Refills Report</h2>
            <button onClick={download} className="btn-secondary">
              <FiDownload />
              Export
            </button>
          </div>
          <div className="table-wrap">
            {loading ? (
              <TableSkeleton rows={4} cols={6} />
            ) : (
              <>
                <table className="w-full min-w-[820px] text-left text-sm">
                  <thead className="bg-slate-50 text-muted">
                    <tr>
                      <th className="p-4">Date & Time</th>
                      <th>Tank</th>
                      <th>Fuel Type</th>
                      <th>Quantity</th>
                      <th>Price/L</th>
                      <th>Amount</th>
                    </tr>
                  </thead>
                  <tbody>
                    {!data.report.length && (
                      <tr>
                        <td colSpan="6" className="p-8 text-center text-muted">
                          No refill data available for this period.
                        </td>
                      </tr>
                    )}
                    {data.report.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage).map((row, index) => (
                      <tr
                        key={`${row.date}-${row.tank}-${index}`}
                        className="border-t border-slate-200"
                      >
                        <td className="p-4">{dateTime(row.date)}</td>
                        <td>{row.tank}</td>
                        <td>
                          <Badge
                            tone={row.fuelType === "PREMIUM" ? "purple" : row.fuelType === "DIESEL" ? "blue" : "green"}
                          >
                            {row.fuelType}
                          </Badge>
                        </td>
                        <td>{number(row.quantity, 2)} L</td>
                        <td>{rupee(row.pricePerLitre || 0)}</td>
                        <td>{rupee(row.amount)}</td>
                      </tr>
                    ))}
                    <tr className="bg-blue-50 font-bold">
                      <td className="p-4">Total</td>
                      <td />
                      <td />
                      <td>{number(data.totals.quantity || 0, 2)} L</td>
                      <td />
                      <td className="text-brand">
                        {rupee(data.totals.amount || 0)}
                      </td>
                    </tr>
                  </tbody>
                </table>
                <Pagination
                  currentPage={currentPage}
                  totalPages={Math.ceil(data.report.length / itemsPerPage)}
                  onPageChange={setCurrentPage}
                  totalEntries={data.report.length}
                  entriesPerPage={itemsPerPage}
                />
              </>
            )}
          </div>
        </section>
      )}
    </>
  );
}
