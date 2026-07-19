import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { FiEdit2, FiPlus, FiTrash2 } from "react-icons/fi";
import { MdOutlineLocalGasStation, MdWarningAmber } from "react-icons/md";
import { Cell, Pie, PieChart, ResponsiveContainer } from "recharts";
import { useDispatch, useSelector } from "react-redux";
import Badge from "../../components/Badge";
import ConfirmModal from "../../components/ConfirmModal";
import { Field, SelectField } from "../../components/FormControls";
import Modal from "../../components/Modal";
import PageHeader from "../../components/PageHeader";
import ProgressBar from "../../components/ProgressBar";
import StatCard from "../../components/StatCard";
import Toggle from "../../components/Toggle";
import {
  getAllTanks,
  addTank,
  updateTank,
  deleteTank,
} from "../../redux/slices/tank.slice";
import { dateTime, number } from "../../utils/formatters";
import { showErrorToast, showSuccessToast } from "../../utils/helper";
import { CardSkeleton, TableSkeleton } from "../../components/Skeletons";
import Pagination from "../../components/Pagination";

const blank = {
  name: "",
  tankNumber: "",
  fuelType: "PETROL",
  capacity: "",
  currentQuantity: "",
};

export default function Tanks() {
  const dispatch = useDispatch();
  const {
    allTanks,
    fetchingTanks,
    savingTank,
    error: reduxError,
  } = useSelector((state) => state.tank);
  const items = allTanks || [];
  const loading = fetchingTanks;
  const saving = savingTank;

  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [form, setForm] = useState(blank);
  const [fuelFilter, setFuelFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [localError, setLocalError] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => {
    setCurrentPage(1);
  }, [fuelFilter, statusFilter]);

  const error =
    localError ||
    (typeof reduxError === "string" ? reduxError : reduxError?.message);

  useEffect(() => {
    dispatch(getAllTanks());
  }, [dispatch]);

  const filtered = items.filter((tank) => {
    const fuelOk = fuelFilter === "all" || tank.fuelType === fuelFilter;
    const statusOk =
      statusFilter === "all" || String(tank.isActive) === statusFilter;
    return fuelOk && statusOk;
  });

  const totalPages = Math.ceil(filtered.length / itemsPerPage);

  const totals = useMemo(
    () => ({
      capacity: items.reduce(
        (sum, tank) => sum + Number(tank.capacity || 0),
        0,
      ),
      quantity: items.reduce(
        (sum, tank) => sum + Number(tank.currentQuantity || 0),
        0,
      ),
    }),
    [items],
  );
  const avg = totals.capacity
    ? Math.round((totals.quantity / totals.capacity) * 100)
    : 0;
  const petrolCount = items.filter((tank) => tank.fuelType === "PETROL").length;
  const dieselCount = items.filter((tank) => tank.fuelType === "DIESEL").length;
  const premiumCount = items.filter((tank) => tank.fuelType === "PREMIUM").length;
  const lowTanks = items.filter(
    (tank) => tank.capacity && tank.currentQuantity / tank.capacity < 0.3,
  );

  const openCreate = () => {
    setEditing(null);
    setForm(blank);
    setOpen(true);
  };

  const openEdit = (tank) => {
    setEditing(tank);
    setForm({
      name: tank.name || "",
      tankNumber: tank.tankNumber || "",
      fuelType: tank.fuelType || "PETROL",
      capacity: tank.capacity || "",
      currentQuantity: tank.currentQuantity || "",
    });
    setOpen(true);
  };

  const submit = async (event) => {
    event.preventDefault();
    setLocalError("");

    // Frontend Validation
    const nameTrim = (form.name || "").trim();
    const tankNumberTrim = (form.tankNumber || "").trim();

    if (!nameTrim) {
      showErrorToast("Tank name is required");
      return;
    }
    if (nameTrim.length > 20) {
      showErrorToast("Tank name cannot exceed 20 characters");
      return;
    }
    if (!tankNumberTrim) {
      showErrorToast("Tank number is required");
      return;
    }
    if (tankNumberTrim.length > 20) {
      showErrorToast("Tank number cannot exceed 20 characters");
      return;
    }

    const capacityVal = Number(form.capacity);
    if (isNaN(capacityVal) || capacityVal <= 0) {
      showErrorToast("Capacity must be greater than 0");
      return;
    }

    if (!editing) {
      const quantityVal = Number(form.currentQuantity);
      if (isNaN(quantityVal) || quantityVal < 0) {
        showErrorToast("Current quantity cannot be negative");
        return;
      }
      if (quantityVal > capacityVal) {
        showErrorToast("Current quantity cannot exceed tank capacity");
        return;
      }
    }

    try {
      if (editing) {
        await dispatch(
          updateTank({
            id: editing._id,
            data: {
              name: nameTrim,
              tankNumber: tankNumberTrim,
              capacity: capacityVal,
            },
          }),
        ).unwrap();
      } else {
        await dispatch(
          addTank({
            ...form,
            name: nameTrim,
            tankNumber: tankNumberTrim,
            capacity: capacityVal,
            currentQuantity: Number(form.currentQuantity),
          }),
        ).unwrap();
      }
      showSuccessToast(editing ? "Tank updated successfully" : "Tank added successfully");
      setOpen(false);
    } catch (err) {
      showErrorToast(err || "Unable to save tank");
    }
  };

  const toggleActive = async (tank, checked) => {
    try {
      await dispatch(
        updateTank({ id: tank._id, data: { isActive: checked } }),
      ).unwrap();
      showSuccessToast(`Tank ${checked ? "activated" : "deactivated"} successfully`);
    } catch (err) {
      showErrorToast(err || "Unable to update tank status");
    }
  };

  const remove = async () => {
    if (!deleteConfirm) return;
    setDeleting(true);
    try {
      await dispatch(deleteTank(deleteConfirm._id)).unwrap();
      showSuccessToast("Tank deleted successfully");
      setDeleteConfirm(null);
    } catch (err) {
      showErrorToast(err || "Unable to delete tank");
    } finally {
      setDeleting(false);
    }
  };

  return (
    <>
      <PageHeader
        title="Tanks"
        subtitle="Manage your fuel tanks and inventory"
        action={
          <button onClick={openCreate} className="btn-primary">
            <FiPlus />
            Add Tank
          </button>
        }
      />
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
            <StatCard
              icon={<MdOutlineLocalGasStation />}
              label="Total Tanks"
              value={items.length}
            />
            <StatCard
              icon={<MdOutlineLocalGasStation />}
              label="Total Capacity"
              value={`${number(totals.capacity)} L`}
            />
            <StatCard
              icon={<MdOutlineLocalGasStation />}
              label="Total Quantity"
              value={`${number(totals.quantity)} L`}
              accent="green"
            />
          </>
        )}
      </div>
      <section className="soft-card mt-7 p-5">
        <div className="grid gap-4 border-b border-slate-200 pb-5 md:grid-cols-2 lg:max-w-2xl">
          <SelectField
            label="Fuel Type"
            value={fuelFilter}
            onChange={(event) => setFuelFilter(event.target.value)}
          >
            <option value="all">All Fuel Types</option>
            <option value="PETROL">Petrol</option>
            <option value="DIESEL">Diesel</option>
            <option value="PREMIUM">Premium Petrol</option>
          </SelectField>
          <SelectField
            label="Status"
            value={statusFilter}
            onChange={(event) => setStatusFilter(event.target.value)}
          >
            <option value="all">All Status</option>
            <option value="true">Active</option>
            <option value="false">Inactive</option>
          </SelectField>
        </div>
        <div className="table-wrap mt-5 border-0">
          {loading ? (
            <TableSkeleton rows={4} cols={8} />
          ) : (
            <>
              <table className="w-full min-w-[980px] text-left text-sm">
                <thead className="text-muted">
                  <tr>
                    <th className="p-4">Tank Details</th>
                    <th>Tank Number</th>
                    <th>Fuel Type</th>
                    <th>Capacity</th>
                    <th>Current Quantity</th>
                    <th>Level</th>
                    <th>Status</th>
                    {/* <th>Last Updated</th> */}
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage).map((tank) => {
                    const pct = tank.capacity
                      ? Math.round((tank.currentQuantity / tank.capacity) * 100)
                      : 0;
                    return (
                      <tr key={tank._id} className="border-t border-slate-200">
                        <td className="p-4">
                          <div className="flex items-center gap-4">
                            {/* <div
                              className={`grid h-12 w-12 shrink-0 place-items-center rounded-full ${tank.fuelType === "DIESEL" ? "bg-blue-100 text-brand" : pct < 30 ? "bg-red-100 text-red-500" : "bg-emerald-100 text-emerald-600"}`}
                            >
                              <MdOutlineLocalGasStation />
                            </div> */}
                            <div>
                              <p className="font-bold">{tank.name}</p>
                              <p className="text-xs text-muted">Storage Tank</p>
                            </div>
                          </div>
                        </td>
                        <td className="font-semibold">{tank.tankNumber}</td>
                        <td>
                          <Badge
                            tone={tank.fuelType === "PREMIUM" ? "purple" : tank.fuelType === "DIESEL" ? "blue" : "green"}
                          >
                            {tank.fuelType}
                          </Badge>
                        </td>
                        <td className="font-bold">{number(tank.capacity)} L</td>
                        <td className="font-bold">{number(tank.currentQuantity)} L</td>
                        <td>
                          <div className="flex items-center gap-3">
                            <span className="w-10 font-bold">{pct}%</span>
                            <div className="h-2 w-24 overflow-hidden rounded-full bg-slate-100">
                              <div
                                className={`h-full rounded-full ${pct < 30 ? "bg-red-500" : pct < 60 ? "bg-orange-500" : tank.fuelType === "PREMIUM" ? "bg-violet-500" : tank.fuelType === "DIESEL" ? "bg-brand" : "bg-emerald-500"}`}
                                style={{ width: `${pct}%` }}
                              />
                            </div>
                          </div>
                        </td>
                        <td>
                          <div className="flex items-center gap-3">
                            <Badge tone={tank.isActive ? "green" : "red"}>
                              {tank.isActive ? "Active" : "Inactive"}
                            </Badge>
                            <Toggle
                              checked={!!tank.isActive}
                              onChange={(checked) => toggleActive(tank, checked)}
                            />
                          </div>
                        </td>
                        <td className="p-4">
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => openEdit(tank)}
                              className="btn-secondary px-3 text-brand"
                            >
                              <FiEdit2 />
                            </button>
                            <button
                              onClick={() => setDeleteConfirm(tank)}
                              className="btn-secondary px-3 text-red-500 hover:bg-red-50"
                            >
                              <FiTrash2 />
                            </button>
                            {/* <Link
                              to={`/admin/refills?tankId=${tank._id}`}
                              className="btn-secondary py-2 text-brand"
                            >
                              Refills
                            </Link> */}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                  {!filtered.length && (
                    <tr>
                      <td colSpan="9" className="p-8 text-center text-muted">
                        No tanks found.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={setCurrentPage}
                totalEntries={filtered.length}
                entriesPerPage={itemsPerPage}
              />
            </>
          )}
        </div>
      </section>
      <div className="mt-7 grid gap-7 xl:grid-cols-2">
        <section className="soft-card p-6">
          <h2 className="text-xl font-bold">Tank Status Overview</h2>
          <div className="mt-6 grid gap-6 sm:grid-cols-[180px_1fr] sm:items-center">
            <div className="h-44 min-w-0">
              <ResponsiveContainer>
                <PieChart>
                  <Pie
                    data={[
                      { name: "Petrol", value: petrolCount, color: "#10b981" },
                      { name: "Diesel", value: dieselCount, color: "#0068ff" },
                      { name: "Premium Petrol", value: premiumCount, color: "#8b5cf6" },
                    ].filter(d => d.value > 0)}
                    innerRadius={55}
                    outerRadius={85}
                    dataKey="value"
                  >
                    {[
                      { name: "Petrol", value: petrolCount, color: "#10b981" },
                      { name: "Diesel", value: dieselCount, color: "#0068ff" },
                      { name: "Premium Petrol", value: premiumCount, color: "#8b5cf6" },
                    ].filter(d => d.value > 0).map((entry, idx) => (
                      <Cell key={`cell-${idx}`} fill={entry.color} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="space-y-4 text-sm">
              <p>
                <span className="mr-3 inline-block h-3 w-3 rounded-full bg-emerald-500" />
                Petrol Tanks <strong className="ml-4">{petrolCount}</strong>
              </p>
              <p>
                <span className="mr-3 inline-block h-3 w-3 rounded-full bg-brand" />
                Diesel Tanks <strong className="ml-4">{dieselCount}</strong>
              </p>
              <p>
                <span className="mr-3 inline-block h-3 w-3 rounded-full bg-purple-500" />
                Premium Petrol Tanks <strong className="ml-4">{premiumCount}</strong>
              </p>
            </div>
          </div>
        </section>
        <section className="soft-card p-6">
          <h2 className="mb-6 text-xl font-bold">Low Tank Alert</h2>
          {lowTanks.length ? (
            lowTanks.map((tank) => (
              <div
                key={tank._id}
                className="mb-3 rounded-lg border border-orange-200 bg-orange-50 p-5"
              >
                <MdWarningAmber className="mb-3 text-2xl text-orange-500" />
                <strong>{tank.name} is below 30% capacity.</strong>
                <p className="mt-2 text-muted">
                  Current Level: {number(tank.currentQuantity)} L /{" "}
                  {number(tank.capacity)} L
                </p>
              </div>
            ))
          ) : (
            <p className="text-muted">No low tank alerts.</p>
          )}
        </section>
      </div>
      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title={editing ? "Update Tank" : "Add New Tank"}
        subtitle="Enter the details for the fuel tank"
      >
        <form onSubmit={submit} className="space-y-5">
          <div className="grid gap-5 sm:grid-cols-2">
            <Field
              name="name"
              label="Tank Name"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              required
            />
            <Field
              name="tankNumber"
              label="Tank Number"
              value={form.tankNumber}
              onChange={(e) => setForm({ ...form, tankNumber: e.target.value })}
              required
            />
          </div>
          {!editing && (
            <SelectField
              name="fuelType"
              label="Fuel Type"
              value={form.fuelType}
              onChange={(e) => setForm({ ...form, fuelType: e.target.value })}
              required
            >
              <option>PETROL</option>
              <option>DIESEL</option>
              <option>PREMIUM</option>
            </SelectField>
          )}
          <div className="grid gap-5 sm:grid-cols-2">
            <Field
              name="capacity"
              type="number"
              label="Capacity (Litres)"
              value={form.capacity}
              onChange={(e) => setForm({ ...form, capacity: e.target.value })}
              required
            />
            {!editing && (
              <Field
                name="currentQuantity"
                type="number"
                label="Current Quantity (Litres)"
                value={form.currentQuantity}
                onChange={(e) =>
                  setForm({ ...form, currentQuantity: e.target.value })
                }
                required
              />
            )}
          </div>
          <div className="flex flex-wrap justify-end gap-4 pt-3">
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="btn-secondary"
            >
              Cancel
            </button>
            <button className="btn-primary" disabled={saving}>
              {saving ? "Saving..." : "Save Tank"}
            </button>
          </div>
        </form>
      </Modal>

      <ConfirmModal
        open={!!deleteConfirm}
        onClose={() => setDeleteConfirm(null)}
        onCancel={() => setDeleteConfirm(null)}
        onConfirm={remove}
        loading={deleting}
        title="Delete Tank"
        message={`Are you sure you want to delete "${deleteConfirm?.name}"? This action cannot be undone.`}
        confirmText="Delete Tank"
      />
    </>
  );
}
