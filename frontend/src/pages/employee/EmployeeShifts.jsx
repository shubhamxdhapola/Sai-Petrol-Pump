import { useEffect, useMemo, useState } from "react";
import { FiEye, FiInfo, FiPlay, FiSquare, FiClock, FiActivity, FiCheckCircle } from "react-icons/fi";
import { MdOutlineLocalGasStation } from "react-icons/md";
import Badge from "../../components/Badge";
import { Field, SelectField } from "../../components/FormControls";
import Modal from "../../components/Modal";
import PageHeader from "../../components/PageHeader";
import StatCard from "../../components/StatCard";
import { apiErrorMessage, machineApi, shiftApi } from "../../utils/api";
import { dateTime, number } from "../../utils/formatters";
import { showErrorToast, showSuccessToast } from "../../utils/helper";
import { CardSkeleton, TableSkeleton } from "../../components/Skeletons";
import Pagination from "../../components/Pagination";

export default function EmployeeShifts() {
  const [shifts, setShifts] = useState([]);
  const [machines, setMachines] = useState([]);
  const [machineId, setMachineId] = useState("");
  const [machineNozzles, setMachineNozzles] = useState([]);
  const [selectedNozzles, setSelectedNozzles] = useState([]);
  const [startOpen, setStartOpen] = useState(false);
  const [endOpen, setEndOpen] = useState(false);
  const [detailOpen, setDetailOpen] = useState(null);
  const [readings, setReadings] = useState({});
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const load = async () => {
    setLoading(true);
    try {
      const [shiftData, machineData] = await Promise.all([
        shiftApi.list(),
        machineApi.list(),
      ]);
      setShifts(shiftData);
      setMachines(machineData.filter((machine) => machine.isActive));
      setError("");
    } catch (err) {
      setError(apiErrorMessage(err, "Unable to load shifts"));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  useEffect(() => {
    if (!machineId) {
      setMachineNozzles([]);
      return;
    }
    machineApi
      .nozzles(machineId)
      .then((data) => setMachineNozzles(data))
      .catch((err) => setError(apiErrorMessage(err, "Unable to load nozzles")));
  }, [machineId]);

  const active = shifts.find((shift) => shift.status === "ONGOING");
  const history = shifts.filter((shift) => shift.status === "COMPLETED");
  const stats = useMemo(
    () => ({
      total: shifts.length,
      completed: history.length,
      fuel: history.reduce(
        (sum, shift) => sum + Number(shift.totalFuelSold || 0),
        0,
      ),
    }),
    [shifts, history],
  );

  const openStart = () => {
    setMachineId(machines[0]?._id || "");
    setSelectedNozzles([]);
    setStartOpen(true);
  };

  const startShift = async () => {
    setSaving(true);
    try {
      await shiftApi.start({ machineId, nozzleIds: selectedNozzles });
      showSuccessToast("Shift started successfully");
      setStartOpen(false);
      await load();
    } catch (err) {
      showErrorToast(apiErrorMessage(err, "Unable to start shift"));
    } finally {
      setSaving(false);
    }
  };

  const openEnd = async (shift) => {
    try {
      const detail = await shiftApi.get(shift._id);
      setDetailOpen(detail);
      setEndOpen(true);
      setReadings(
        Object.fromEntries(
          (detail.nozzles || []).map((item) => [
            item.nozzleId?._id || item.nozzleId,
            item.closingReading || "",
          ]),
        ),
      );
    } catch (err) {
      setError(apiErrorMessage(err, "Unable to load shift"));
    }
  };

  const endShift = async (event) => {
    event.preventDefault();
    setSaving(true);
    try {
      const payload = {
        readings: detailOpen.nozzles.map((item) => ({
          nozzleId: item.nozzleId?._id || item.nozzleId,
          closingReading: Number(readings[item.nozzleId?._id || item.nozzleId]),
        })),
      };
      await shiftApi.end(detailOpen._id, payload);
      showSuccessToast("Shift ended successfully");
      setEndOpen(false);
      setDetailOpen(null);
      await load();
    } catch (err) {
      showErrorToast(apiErrorMessage(err, "Unable to end shift"));
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <PageHeader
        title="My Shifts"
        subtitle="View your shift history and start a new shift"
        action={
          <button
            onClick={openStart}
            disabled={!!active}
            className="btn-primary"
          >
            <FiPlay />
            Start New Shift
          </button>
        }
      />
      {error && (
        <div className="mb-5 rounded-md border border-red-200 bg-red-50 p-4 text-sm font-semibold text-red-600">
          {error}
        </div>
      )}
      <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
        {loading ? (
          <CardSkeleton count={4} />
        ) : (
          <>
            <StatCard label="Total Shifts" value={stats.total} icon={<FiClock />} />
            <StatCard
              label="Completed Shifts"
              value={stats.completed}
              accent="green"
              icon={<FiCheckCircle />}
            />
            <StatCard
              label="Shift Status"
              value={active ? "Occupied" : "Available"}
              accent={active ? "orange" : "green"}
              icon={<FiActivity />}
            />
            <StatCard
              icon={<MdOutlineLocalGasStation />}
              label="Total Fuel Dispensed"
              value={`${number(stats.fuel, 2)} L`}
              accent="purple"
            />
          </>
        )}
      </div>
      {!active ? (
        <div className="mt-6 flex gap-4 rounded-lg border border-blue-200 bg-blue-50 p-6 text-brand">
          <FiInfo className="text-2xl" />
          <div>
            <strong>You do not have any active shift.</strong>
            <p className="mt-2 text-ink">
              Start a shift by selecting a machine and available nozzles.
            </p>
          </div>
        </div>
      ) : (
        <section className="mt-6 overflow-hidden rounded-lg border border-emerald-200 bg-white">
          <div className="flex flex-col justify-between gap-4 bg-emerald-50 p-6 sm:flex-row sm:items-center">
            <div className="flex gap-4 text-emerald-700">
              <FiInfo className="text-2xl" />
              <div>
                <strong className="text-xl">Shift is Ongoing</strong>
                <p className="text-ink">
                  You have an active shift in progress.
                </p>
              </div>
            </div>
            <button
              onClick={() => openEnd(active)}
              className="btn-secondary border-red-300 text-red-500"
            >
              <FiSquare />
              End Shift
            </button>
          </div>
          <div className="grid gap-5 p-6 md:grid-cols-3">
            <p>
              <span className="text-muted">Machine</span>
              <br />
              <strong>{active.machineId?.name}</strong>
            </p>
            <p>
              <span className="text-muted">Nozzle(s)</span>
              <br />
              <strong>
                {active.nozzles
                  ?.map((item) => {
                    const num = (item.nozzleId?.nozzleNumber || item.nozzleId || "").replace(/^NZ-/, "");
                    const fuel = item.nozzleId?.tankId?.fuelType || item.fuelType;
                    return fuel ? `${num} (${fuel.toUpperCase()})` : num;
                  })
                  .join(", ")}
              </strong>
            </p>
            <p>
              <span className="text-muted">Started At</span>
              <br />
              <strong>{dateTime(active.startTime)}</strong>
            </p>
          </div>
        </section>
      )}
      <section className="table-wrap mt-6">
        <div className="border-b border-slate-200 p-5 text-xl font-bold">
          Shift History
        </div>
        {loading ? (
          <TableSkeleton rows={4} cols={6} />
        ) : (
          <>
            <table className="w-full min-w-[900px] text-left text-sm">
              <thead className="bg-slate-50 text-muted">
                <tr>
                  <th className="p-4">Date & Time</th>
                  <th>Machine</th>
                  <th>Nozzle Readings (Start → End)</th>
                  <th>Fuel Dispensed</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {history.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage).map((shift) => (
                  <tr key={shift._id} className="border-t border-slate-200">
                    <td className="p-4">
                      <div className="text-xs space-y-1">
                        <div className="flex items-center gap-1.5 text-slate-700">
                          <span className="font-semibold text-slate-500 w-10">Start:</span>
                          <span>{dateTime(shift.startTime)}</span>
                        </div>
                        {shift.endTime && (
                          <div className="flex items-center gap-1.5 text-slate-600">
                            <span className="font-semibold text-slate-400 w-10">End:</span>
                            <span>{dateTime(shift.endTime)}</span>
                          </div>
                        )}
                      </div>
                    </td>
                    <td>
                      <strong>{shift.machineId?.name}</strong>
                      <p className="text-xs text-muted">
                        Machine No. {shift.machineId?.machineNumber}
                      </p>
                    </td>
                    <td>
                      <div className="flex flex-col gap-2 py-1">
                        {shift.nozzles?.map((n, idx) => (
                          <div
                            key={idx}
                            className="flex items-center gap-2 whitespace-nowrap text-xs"
                          >
                            <span className="font-bold text-slate-500 min-w-[36px]">
                              {(n.nozzleId?.nozzleNumber || `Nozzle ${idx + 1}`).replace(/^NZ-/, "")}
                              {(() => {
                                const fuel = n.fuelType || n.nozzleId?.tankId?.fuelType;
                                return fuel ? ` (${fuel.toUpperCase()})` : "";
                              })()}:
                            </span>
                            <span className="text-slate-700 font-medium">
                              {number(n.openingReading, 2)}
                            </span>
                            <span className="text-slate-400">→</span>
                            <span className="text-slate-800 font-semibold">
                              {n.closingReading ? number(n.closingReading, 2) : "—"}
                            </span>
                          </div>
                        ))}
                      </div>
                    </td>
                    <td>
                      <div className="flex flex-col gap-2 py-1">
                        {shift.nozzles?.map((n, idx) => {
                          const sold = n.closingReading
                            ? n.closingReading - n.openingReading
                            : null;
                          return (
                            <div
                              key={idx}
                              className="text-xs text-slate-700 font-semibold h-[18px] flex items-center"
                            >
                              {sold !== null ? `${number(sold, 2)} L` : "—"}
                            </div>
                          );
                        })}
                      </div>
                    </td>
                    <td>
                      <Badge tone="green">{shift.status}</Badge>
                    </td>
                    <td>
                      <button
                        onClick={() => openEnd(shift)}
                        className="btn-secondary px-3"
                        title="View Details"
                      >
                        <FiEye />
                      </button>
                    </td>
                  </tr>
                ))}
                {!history.length && (
                  <tr>
                    <td colSpan="6" className="p-8 text-center text-muted">
                      No shift history found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
            <Pagination
              currentPage={currentPage}
              totalPages={Math.ceil(history.length / itemsPerPage)}
              onPageChange={setCurrentPage}
              totalEntries={history.length}
              entriesPerPage={itemsPerPage}
            />
          </>
        )}
      </section>
      <Modal
        open={startOpen}
        onClose={() => setStartOpen(false)}
        title="Start New Shift"
      >
        <div className="space-y-5">
          <SelectField
            label="Select Machine"
            value={machineId}
            onChange={(e) => {
              setMachineId(e.target.value);
              setSelectedNozzles([]);
            }}
            required
          >
            <option value="">Select machine</option>
            {machines.map((machine) => (
              <option key={machine._id} value={machine._id}>
                {machine.name} ({machine.machineNumber})
              </option>
            ))}
          </SelectField>
          <label className="block">
            <span className="mb-2 block font-semibold">
              Select Nozzle(s) <span className="text-red-500">*</span>
            </span>
            <div className="max-h-72 overflow-auto rounded-lg border border-slate-200">
              {machineNozzles.map((n) => {
                const disabled =
                  n.isOccupied || !n.isActive || !n.tankId?.isActive;
                return (
                  <label
                    key={n._id}
                    className={`flex items-center gap-4 border-b border-slate-200 p-4 last:border-0 ${disabled ? "bg-slate-50 text-muted" : ""}`}
                  >
                    <input
                      type="checkbox"
                      disabled={disabled}
                      checked={selectedNozzles.includes(n._id)}
                      onChange={(e) =>
                        setSelectedNozzles((prev) =>
                          e.target.checked
                            ? [...prev, n._id]
                            : prev.filter((id) => id !== n._id),
                        )
                      }
                    />
                    <strong>{n.nozzleNumber}</strong>
                    <Badge
                      tone={n.tankId?.fuelType === "PREMIUM" ? "purple" : n.tankId?.fuelType === "DIESEL" ? "blue" : "green"}
                    >
                      {n.tankId?.fuelType || "Fuel"}
                    </Badge>
                    {n.isOccupied && (
                      <Badge tone="orange">Occupied</Badge>
                    )}
                    <span className="ml-auto text-sm">
                      Reading: {number(n.currentReading, 2)} L
                    </span>
                  </label>
                );
              })}
              {!machineNozzles.length && (
                <p className="p-4 text-sm text-muted">
                  Select a machine to load nozzles.
                </p>
              )}
            </div>
          </label>
          <div className="flex flex-wrap justify-end gap-4">
            <button
              onClick={() => setStartOpen(false)}
              className="btn-secondary"
            >
              Cancel
            </button>
            <button
              type="submit"
              onClick={startShift}
              disabled={!machineId || !selectedNozzles.length || saving || !!active}
              className="btn-primary"
            >
              {saving ? "Starting..." : "Start Shift"}
            </button>
          </div>
        </div>
      </Modal>
      <Modal
        open={endOpen}
        onClose={() => setEndOpen(false)}
        title={detailOpen?.status === "ONGOING" ? "End Shift" : "Shift Details"}
        subtitle={
          detailOpen ? `Started on ${dateTime(detailOpen.startTime)}` : ""
        }
      >
        {detailOpen && (
          <form onSubmit={endShift} className="space-y-5">
            <div className="rounded-md border border-blue-200 bg-blue-50 p-4 text-sm font-semibold text-brand">
              Enter the closing reading for each selected nozzle.
            </div>
            {detailOpen.nozzles?.map((item) => {
              const nozzleId = item.nozzleId?._id || item.nozzleId;
              return (
                <Field
                  key={nozzleId}
                  label={`${item.nozzleId?.nozzleNumber || "Nozzle"} Closing Reading (Opening ${number(item.openingReading, 2)} L)`}
                  type="number"
                  step="0.01"
                  value={readings[nozzleId] || ""}
                  onChange={(e) =>
                    setReadings({ ...readings, [nozzleId]: e.target.value })
                  }
                  disabled={detailOpen.status !== "ONGOING"}
                  required
                />
              );
            })}
            <div className="flex flex-wrap justify-end gap-4">
              <button
                type="button"
                onClick={() => setEndOpen(false)}
                className="btn-secondary"
              >
                Close
              </button>
              {detailOpen.status === "ONGOING" && (
                <button className="btn-primary" disabled={saving}>
                  {saving ? "Ending..." : "End Shift"}
                </button>
              )}
            </div>
          </form>
        )}
      </Modal>
    </>
  );
}
