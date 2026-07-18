import { useEffect, useMemo, useState } from "react";
import { FiEye, FiSquare, FiClock, FiActivity, FiCheckCircle } from "react-icons/fi";
import { useDispatch, useSelector } from "react-redux";
import Badge from "../../components/Badge";
import { Field, SelectField } from "../../components/FormControls";
import Modal from "../../components/Modal";
import PageHeader from "../../components/PageHeader";
import StatCard from "../../components/StatCard";
import {
  getAllShifts,
  endShift as endShiftThunk,
} from "../../redux/slices/shift.slice";
import { getAllMachines } from "../../redux/slices/machine.slice";
import { getAllEmployees } from "../../redux/slices/employee.slice";
import { shiftApi } from "../../utils/api";
import { dateTime, initials, number, rupee } from "../../utils/formatters";
import { CardSkeleton, TableSkeleton } from "../../components/Skeletons";
import Pagination from "../../components/Pagination";

export default function Shifts() {
  const dispatch = useDispatch();
  const { allShifts, error: shiftError, fetchingShifts } = useSelector((state) => state.shift);
  const { allMachines } = useSelector((state) => state.machine);
  const { allEmployees } = useSelector((state) => state.employee);
  const loading = fetchingShifts;

  const [filters, setFilters] = useState({
    status: "",
    machineId: "",
    employeeId: "",
  });
  const [ending, setEnding] = useState(null);
  const [readings, setReadings] = useState({});
  const [localError, setLocalError] = useState("");
  const [saving, setSaving] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => {
    setCurrentPage(1);
  }, [filters]);

  useEffect(() => {
    dispatch(getAllShifts());
    dispatch(getAllMachines());
    dispatch(getAllEmployees());
  }, [dispatch]);

  const shifts = useMemo(() => {
    if (!allShifts) return [];
    return allShifts.filter((shift) => {
      const matchStatus = filters.status
        ? shift.status === filters.status
        : true;
      const matchMachine = filters.machineId
        ? (shift.machineId?._id || shift.machineId) === filters.machineId
        : true;
      const matchEmployee = filters.employeeId
        ? (shift.employeeId?._id || shift.employeeId) === filters.employeeId
        : true;
      return matchStatus && matchMachine && matchEmployee;
    });
  }, [allShifts, filters]);

  const machines = allMachines || [];
  const employees = allEmployees || [];
  const error =
    localError ||
    (typeof shiftError === "string" ? shiftError : shiftError?.message);

  const stats = useMemo(
    () => ({
      total: shifts.length,
      ongoing: shifts.filter((shift) => shift.status === "ONGOING").length,
      completed: shifts.filter((shift) => shift.status === "COMPLETED").length,
      fuel: shifts.reduce(
        (sum, shift) => sum + Number(shift.totalFuelSold || 0),
        0,
      ),
      revenue: shifts.reduce(
        (sum, shift) => sum + Number(shift.totalAmount || 0),
        0,
      ),
    }),
    [shifts],
  );

  const openEnd = async (shift) => {
    try {
      const detail = await shiftApi.get(shift._id);
      setEnding(detail);
      setReadings(
        Object.fromEntries(
          (detail.nozzles || []).map((item) => [
            item.nozzleId?._id || item.nozzleId,
            item.closingReading || "",
          ]),
        ),
      );
    } catch (err) {
      setLocalError(err?.message || "Unable to load shift details");
    }
  };

  const endShift = async (event) => {
    event.preventDefault();
    setSaving(true);
    setLocalError("");
    try {
      const payload = {
        readings: ending.nozzles.map((item) => ({
          nozzleId: item.nozzleId?._id || item.nozzleId,
          closingReading: Number(readings[item.nozzleId?._id || item.nozzleId]),
        })),
      };
      await dispatch(endShiftThunk({ id: ending._id, data: payload })).unwrap();
      setEnding(null);
    } catch (err) {
      setLocalError(err || "Unable to end shift");
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <PageHeader title="Shifts" subtitle="Manage all pump shifts" />
      {error && (
        <div className="mb-5 rounded-md border border-red-200 bg-red-50 p-4 text-sm font-semibold text-red-600">
          {error}
        </div>
      )}
      <div className="grid gap-5 md:grid-cols-3 xl:grid-cols-3">
        {loading ? (
          <CardSkeleton count={3} />
        ) : (
          <>
            <StatCard label="Total Shifts" value={stats.total} icon={<FiClock />} />
            <StatCard label="Active Shifts" value={stats.ongoing} accent="green" icon={<FiActivity />} />
            <StatCard label="Completed Shifts" value={stats.completed} icon={<FiCheckCircle />} />
          </>
        )}
      </div>
      <div className="mt-7 grid gap-4 lg:grid-cols-3">
        <SelectField
          label="Status"
          value={filters.status}
          onChange={(e) => setFilters({ ...filters, status: e.target.value })}
        >
          <option value="">All Status</option>
          <option value="ONGOING">Ongoing</option>
          <option value="COMPLETED">Completed</option>
        </SelectField>
        <SelectField
          label="Machine"
          value={filters.machineId}
          onChange={(e) =>
            setFilters({ ...filters, machineId: e.target.value })
          }
        >
          <option value="">All Machines</option>
          {machines.map((machine) => (
            <option key={machine._id} value={machine._id}>
              {machine.name}
            </option>
          ))}
        </SelectField>
        <SelectField
          label="Employee"
          value={filters.employeeId}
          onChange={(e) =>
            setFilters({ ...filters, employeeId: e.target.value })
          }
        >
          <option value="">All Employees</option>
          {employees.map((employee) => (
            <option key={employee._id} value={employee._id}>
              {employee.name}
            </option>
          ))}
        </SelectField>
      </div>
      <section className="table-wrap mt-6">
        {loading ? (
          <TableSkeleton rows={4} cols={8} />
        ) : (
          <>
            <table className="w-full min-w-[1000px] text-left text-sm">
              <thead className="bg-slate-50 text-muted">
                <tr>
                  <th className="p-4">Employee</th>
                  <th>Machine</th>
                  <th>Timing</th>
                  <th>Status</th>
                  <th>Nozzle Readings (Start → End)</th>
                  <th>Fuel Dispensed</th>
                  <th>Amount</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {shifts.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage).map((shift) => (
                  <tr key={shift._id} className="border-t border-slate-200">
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-blue-100 font-bold text-brand">
                          {initials(shift.employeeId?.name)}
                        </span>
                        <div>
                          <strong className="text-slate-800">
                            {shift.employeeId?.name || "-"}
                          </strong>
                          <p className="text-xs text-muted">
                            {shift.employeeId?.phone}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td>
                      <strong className="text-slate-800">
                        {shift.machineId?.machineNumber}
                      </strong>
                      <p className="text-xs text-muted">{shift.machineId?.name}</p>
                    </td>
                    <td>
                      <div className="text-xs space-y-1">
                        <div className="flex items-center gap-1.5 text-slate-700">
                          <span className="font-semibold text-slate-500 w-10">
                            Start:
                          </span>
                          <span className="font-semibold text-slate-800">
                            {dateTime(shift.startTime)}
                          </span>
                        </div>
                        <div className="flex items-center gap-1.5 text-slate-700">
                          <span className="font-semibold text-slate-500 w-10">
                            End:
                          </span>
                          <span className="font-semibold text-slate-800">
                            {shift.endTime ? dateTime(shift.endTime) : "—"}
                          </span>
                        </div>
                      </div>
                    </td>
                    <td>
                      <Badge tone={shift.status === "ONGOING" ? "blue" : "green"}>
                        {shift.status}
                      </Badge>
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
                    <td className="font-bold text-slate-800">
                      {shift.totalAmount ? rupee(shift.totalAmount) : "—"}
                    </td>
                    <td>
                      <div className="flex gap-2">
                        <button
                          onClick={() => openEnd(shift)}
                          className="btn-secondary px-3"
                          title="View Details"
                        >
                          <FiEye />
                        </button>
                        {shift.status === "ONGOING" && (
                          <button
                            onClick={() => openEnd(shift)}
                            className="btn-secondary text-red-500 hover:bg-red-50"
                            title="End Shift"
                          >
                            <FiSquare />
                            End
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
                {!shifts.length && (
                  <tr>
                    <td colSpan="8" className="p-8 text-center text-muted">
                      No shifts found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
            <Pagination
              currentPage={currentPage}
              totalPages={Math.ceil(shifts.length / itemsPerPage)}
              onPageChange={setCurrentPage}
              totalEntries={shifts.length}
              entriesPerPage={itemsPerPage}
            />
          </>
        )}
      </section>
      <Modal
        open={!!ending}
        onClose={() => setEnding(null)}
        title={ending?.status === "ONGOING" ? "End Shift" : "Shift Details"}
        subtitle={ending ? `Started ${dateTime(ending.startTime)}` : ""}
      >
        {ending && (
          <form onSubmit={endShift} className="space-y-5">
            <div className="rounded-md border border-blue-200 bg-blue-50 p-4 text-sm font-semibold text-brand">
              Machine: {ending.machineId?.name} | Employee:{" "}
              {ending.employeeId?.name}
            </div>
            {ending.nozzles?.map((item) => {
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
                  disabled={ending.status !== "ONGOING"}
                  required
                />
              );
            })}
            <div className="flex flex-wrap justify-end gap-4">
              <button
                type="button"
                onClick={() => setEnding(null)}
                className="btn-secondary"
              >
                Close
              </button>
              {ending.status === "ONGOING" && (
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
