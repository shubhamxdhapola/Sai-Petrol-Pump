import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { FiEdit2, FiPlus, FiTrash2 } from "react-icons/fi";
import { MdOutlineLocalGasStation } from "react-icons/md";
import { useDispatch, useSelector } from "react-redux";
import Badge from "../../components/Badge";
import { Field, SelectField } from "../../components/FormControls";
import Modal from "../../components/Modal";
import PageHeader from "../../components/PageHeader";
import StatCard from "../../components/StatCard";
import Toggle from "../../components/Toggle";
import { getAllMachines, addMachine, updateMachine, deleteMachine } from "../../redux/slices/machine.slice";
import { machineApi } from "../../utils/api";
import { number } from "../../utils/formatters";
import ConfirmModal from "../../components/ConfirmModal";
import { showErrorToast, showSuccessToast } from "../../utils/helper";
import { CardSkeleton } from "../../components/Skeletons";
import Pagination from "../../components/Pagination";

const blank = { name: "", machineNumber: "" };

export default function Machines() {
  const dispatch = useDispatch();
  const { allMachines, fetchingMachines, error: reduxError } = useSelector((state) => state.machine);
  const items = allMachines || [];
  const loading = fetchingMachines;

  const [nozzlesByMachine, setNozzlesByMachine] = useState({});
  const [statusFilter, setStatusFilter] = useState("all");
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [form, setForm] = useState(blank);
  const [localError, setLocalError] = useState("");
  const [saving, setSaving] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => {
    setCurrentPage(1);
  }, [statusFilter]);

  const error = localError || (typeof reduxError === 'string' ? reduxError : reduxError?.message);

  useEffect(() => {
    dispatch(getAllMachines());
  }, [dispatch]);

  useEffect(() => {
    if (!items.length) return;
    Promise.all(
      items.map(async (machine) => [
        machine._id,
        await machineApi.nozzles(machine._id).catch(() => []),
      ])
    )
      .then((pairs) => setNozzlesByMachine(Object.fromEntries(pairs)))
      .catch(() => {});
  }, [items]);

  const filtered = items.filter(
    (machine) =>
      statusFilter === "all" || String(machine.isActive) === statusFilter,
  );
  const totalNozzles = useMemo(
    () =>
      Object.values(nozzlesByMachine).reduce(
        (sum, list) => sum + list.length,
        0,
      ),
    [nozzlesByMachine],
  );

  const openCreate = () => {
    setEditing(null);
    setForm(blank);
    setOpen(true);
  };

  const openEdit = (machine) => {
    setEditing(machine);
    setForm({
      name: machine.name || "",
      machineNumber: machine.machineNumber || "",
    });
    setOpen(true);
  };

  const submit = async (event) => {
    event.preventDefault();
    setSaving(true);
    setLocalError("");

    // Frontend Validation
    const nameTrim = (form.name || "").trim();
    const machineNumberTrim = (form.machineNumber || "").trim();

    if (!nameTrim) {
      showErrorToast("Machine name is required");
      setSaving(false);
      return;
    }
    if (nameTrim.length > 20) {
      showErrorToast("Machine name cannot exceed 20 characters");
      setSaving(false);
      return;
    }
    if (!machineNumberTrim) {
      showErrorToast("Machine number is required");
      setSaving(false);
      return;
    }
    if (machineNumberTrim.length > 20) {
      showErrorToast("Machine number cannot exceed 20 characters");
      setSaving(false);
      return;
    }

    try {
      if (editing) await dispatch(updateMachine({ id: editing._id, data: { name: nameTrim, machineNumber: machineNumberTrim } })).unwrap();
      else await dispatch(addMachine({ name: nameTrim, machineNumber: machineNumberTrim })).unwrap();
      showSuccessToast(editing ? "Machine updated successfully" : "Machine added successfully");
      setOpen(false);
    } catch (err) {
      showErrorToast(err || "Unable to save machine");
    } finally {
      setSaving(false);
    }
  };

  const toggleActive = async (machine, checked) => {
    try {
      await dispatch(updateMachine({ id: machine._id, data: { isActive: checked } })).unwrap();
      showSuccessToast(`Machine ${checked ? "activated" : "deactivated"} successfully`);
    } catch (err) {
      showErrorToast(err || "Unable to update machine status");
    }
  };

  const remove = async () => {
    if (!deleteConfirm) return;
    try {
      await dispatch(deleteMachine(deleteConfirm._id)).unwrap();
      showSuccessToast("Machine deleted successfully");
      setDeleteConfirm(null);
    } catch (err) {
      showErrorToast(err || "Unable to delete machine");
    }
  };

  return (
    <>
      <PageHeader
        title="Machines"
        subtitle="Manage fuel dispenser machines and their nozzles"
        action={
          <button onClick={openCreate} className="btn-primary">
            <FiPlus />
            Add Machine
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
            <StatCard
              icon={<MdOutlineLocalGasStation />}
              label="Total Machines"
              value={items.length}
            />
            <StatCard
              icon={<MdOutlineLocalGasStation />}
              label="Active Machines"
              value={items.filter((m) => m.isActive).length}
              accent="green"
            />
            <StatCard
              icon={<MdOutlineLocalGasStation />}
              label="Inactive Machines"
              value={items.filter((m) => !m.isActive).length}
              accent="orange"
            />
            <StatCard
              icon={<MdOutlineLocalGasStation />}
              label="Total Nozzles"
              value={totalNozzles}
              accent="purple"
            />
          </>
        )}
      </div>
      <div className="mt-7 max-w-xs border-b border-slate-200 pb-4">
        <SelectField
          label="Status"
          value={statusFilter}
          onChange={(event) => setStatusFilter(event.target.value)}
        >
          <option value="all">All Machines</option>
          <option value="true">Active</option>
          <option value="false">Inactive</option>
        </SelectField>
      </div>
      <div className="mt-5 space-y-4">
        {loading ? (
          <CardSkeleton count={2} />
        ) : (
          <>
            {filtered.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage).map((machine) => {
              const machineNozzles = nozzlesByMachine[machine._id] || [];
              return (
                <section key={machine._id} className="soft-card overflow-hidden">
                  <div className="grid gap-5 border-b border-slate-200 p-5 lg:grid-cols-[1.3fr_1fr_auto] lg:items-center">
                    <div className="flex items-center gap-5">
                      <div
                        className={`grid h-14 w-14 shrink-0 place-items-center rounded-md ${machine.isActive ? "bg-blue-100 text-brand" : "bg-red-100 text-red-500"}`}
                      >
                        <MdOutlineLocalGasStation className="text-2xl" />
                      </div>
                      <div className="min-w-0">
                        <h3 className="truncate text-lg font-bold">
                          {machine.name}
                        </h3>
                        <p className="text-sm text-muted">
                          Machine No. {machine.machineNumber}
                        </p>
                        <div className="mt-2 flex items-center gap-3">
                          <Badge tone={machine.isActive ? "green" : "red"}>
                            {machine.isActive ? "Active" : "Inactive"}
                          </Badge>
                          <Toggle
                            checked={machine.isActive}
                            onChange={(checked) => toggleActive(machine, checked)}
                          />
                        </div>
                      </div>
                    </div>
                    <div className="flex flex-col gap-1 text-sm">
                      <div className="text-muted">Connected Nozzles</div>
                      <strong>{machineNozzles.length} Nozzles</strong>
                    </div>
                    <div className="flex gap-2">
                      <Link
                        to={`/admin/machines/${machine._id}`}
                        className="btn-secondary py-2 text-brand"
                      >
                        Details
                      </Link>
                      <button
                        onClick={() => openEdit(machine)}
                        className="btn-secondary px-3 text-brand"
                      >
                        <FiEdit2 />
                      </button>
                      <button
                        onClick={() => setDeleteConfirm(machine)}
                        className="btn-secondary px-3 text-red-500 hover:bg-red-50"
                      >
                        <FiTrash2 />
                      </button>
                    </div>
                  </div>
                  <div className="grid gap-4 p-5 lg:grid-cols-[120px_1fr] lg:items-start">
                    <p className="font-semibold">
                      Nozzles ({machineNozzles.length})
                    </p>
                    <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
                      {machineNozzles.map((nozzle) => (
                        <div
                          key={nozzle._id}
                          className="rounded-lg border border-slate-200 p-4 bg-white"
                        >
                          <div className="flex items-center justify-between gap-3">
                            <strong className="text-slate-800">Nozzle {nozzle.nozzleNumber}</strong>
                            <span className="text-sm font-semibold text-muted">
                              {number(nozzle.currentReading, 2)} L
                            </span>
                          </div>
                          <div className="mt-3 flex flex-wrap gap-2">
                            <Badge
                              tone={
                                nozzle.tankId?.fuelType === "PREMIUM"
                                  ? "purple"
                                  : nozzle.tankId?.fuelType === "DIESEL"
                                    ? "blue"
                                    : "green"
                              }
                            >
                              {nozzle.tankId?.fuelType || "Tank"}
                            </Badge>
                            <Badge
                              tone={
                                nozzle.isOccupied
                                  ? "orange"
                                  : nozzle.isActive
                                    ? "green"
                                    : "red"
                              }
                            >
                              {nozzle.isOccupied
                                ? "Occupied"
                                : nozzle.isActive
                                  ? "Active"
                                  : "Inactive"}
                            </Badge>
                          </div>
                        </div>
                      ))}
                      {!machineNozzles.length && (
                        <p className="text-sm text-muted">No nozzles added yet.</p>
                      )}
                    </div>
                  </div>
                </section>
              );
            })}
            {!filtered.length && (
              <p className="p-8 text-center text-muted">No machines found.</p>
            )}
            <Pagination
              currentPage={currentPage}
              totalPages={Math.ceil(filtered.length / itemsPerPage)}
              onPageChange={setCurrentPage}
              totalEntries={filtered.length}
              entriesPerPage={itemsPerPage}
            />
          </>
        )}
      </div>
      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title={editing ? "Update Machine" : "Add New Machine"}
      >
        <form onSubmit={submit} className="space-y-6">
          <Field
            name="name"
            label="Name"
            placeholder="Enter machine name"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            required
          />
          <Field
            name="machineNumber"
            label="Machine Number"
            placeholder="Enter machine number"
            value={form.machineNumber}
            onChange={(e) =>
              setForm({ ...form, machineNumber: e.target.value })
            }
            required
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

      <ConfirmModal
        open={!!deleteConfirm}
        onClose={() => setDeleteConfirm(null)}
        onCancel={() => setDeleteConfirm(null)}
        onConfirm={remove}
        title="Delete Machine"
        message={`Are you sure you want to delete machine "${deleteConfirm?.name}"? This action cannot be undone and will affect any linked nozzles.`}
        confirmText="Delete Machine"
      />
    </>
  );
}
