import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { FiPlus, FiTrash2, FiEdit2 } from "react-icons/fi";
import { MdCurrencyRupee, MdWaterDrop } from "react-icons/md";
import { useDispatch, useSelector } from "react-redux";
import Badge from "../../components/Badge";
import { Field, SelectField, TextArea } from "../../components/FormControls";
import Modal from "../../components/Modal";
import PageHeader from "../../components/PageHeader";
import StatCard from "../../components/StatCard";
import { getAllTanks } from "../../redux/slices/tank.slice";
import { getRefills, addRefill, deleteRefill, updateRefill } from "../../redux/slices/refill.slice";
import { dateTime, number, rupee } from "../../utils/formatters";
import ConfirmModal from "../../components/ConfirmModal";
import { showErrorToast, showSuccessToast } from "../../utils/helper";
import { CardSkeleton, TableSkeleton } from "../../components/Skeletons";
import Pagination from "../../components/Pagination";

const blank = { quantity: "", pricePerLitre: "", refillDate: "", remarks: "" };

const toLocalISOString = (dateOrStr) => {
  if (!dateOrStr) return "";
  const date = new Date(dateOrStr);
  const tzOffset = date.getTimezoneOffset() * 60000;
  return new Date(date.getTime() - tzOffset).toISOString().slice(0, 16);
};

export default function Refills() {
  const dispatch = useDispatch();
  const { allTanks, error: tankError, fetchingTanks } = useSelector((state) => state.tank);
  const { allRefills, error: refillError, fetchingRefills } = useSelector((state) => state.refill);

  const [searchParams, setSearchParams] = useSearchParams();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [selectedTankId, setSelectedTankId] = useState(
    searchParams.get("tankId") || "",
  );
  const [form, setForm] = useState(blank);
  const [saving, setSaving] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [localError, setLocalError] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const tanks = allTanks || [];
  const refills = allRefills || [];
  const loading = fetchingTanks || (selectedTankId && fetchingRefills);

  useEffect(() => {
    setCurrentPage(1);
  }, [selectedTankId]);

  const error = localError || (typeof tankError === 'string' ? tankError : tankError?.message) || (typeof refillError === 'string' ? refillError : refillError?.message);

  const selectedTank = tanks.find((tank) => tank._id === selectedTankId);
  const pct = selectedTank?.capacity
    ? Math.round((selectedTank.currentQuantity / selectedTank.capacity) * 100)
    : 0;
  const totals = useMemo(
    () => ({
      quantity: refills.reduce(
        (sum, item) => sum + Number(item.quantity || 0),
        0,
      ),
      amount: refills.reduce(
        (sum, item) =>
          sum + Number(item.quantity || 0) * Number(item.pricePerLitre || 0),
        0,
      ),
    }),
    [refills],
  );

  useEffect(() => {
    dispatch(getAllTanks());
  }, [dispatch]);

  useEffect(() => {
    if (!selectedTankId && tanks.length > 0) {
      setSelectedTankId(tanks[0]._id);
    }
  }, [tanks, selectedTankId]);

  useEffect(() => {
    if (!selectedTankId) return;
    setSearchParams({ tankId: selectedTankId });
    dispatch(getRefills(selectedTankId));
  }, [selectedTankId, setSearchParams, dispatch]);

  const openCreate = () => {
    setEditing(null);
    setForm(blank);
    setOpen(true);
  };

  const openEdit = (refill) => {
    setEditing(refill);
    setForm({
      quantity: refill.quantity || "",
      pricePerLitre: refill.pricePerLitre || "",
      refillDate: toLocalISOString(refill.refillDate),
      remarks: refill.remarks || "",
    });
    setOpen(true);
  };

  const submit = async (event) => {
    event.preventDefault();
    setSaving(true);
    setLocalError("");

    // Frontend Validation
    const qtyVal = Number(form.quantity);
    const priceVal = Number(form.pricePerLitre);
    const remarksTrim = (form.remarks || "").trim();
    
    if (isNaN(qtyVal) || qtyVal < 1) {
      showErrorToast("Quantity is required and must be greater than 0");
      setSaving(false);
      return;
    }
    if (isNaN(priceVal) || priceVal <= 1) {
      showErrorToast("Price per litre must be greater than 1");
      setSaving(false);
      return;
    }
    if (remarksTrim.length > 200) {
      showErrorToast("Remarks cannot exceed 200 characters");
      setSaving(false);
      return;
    }

    try {
      if (editing) {
        await dispatch(updateRefill({
          tankId: selectedTankId,
          refillId: editing._id,
          data: {
            quantity: qtyVal,
            pricePerLitre: priceVal,
            refillDate: form.refillDate ? new Date(form.refillDate).toISOString() : new Date().toISOString(),
            remarks: remarksTrim,
          }
        })).unwrap();
      } else {
        await dispatch(addRefill({
          tankId: selectedTankId,
          data: {
            quantity: qtyVal,
            pricePerLitre: priceVal,
            refillDate: form.refillDate ? new Date(form.refillDate).toISOString() : new Date().toISOString(),
            remarks: remarksTrim,
          }
        })).unwrap();
      }
      showSuccessToast(editing ? "Refill updated successfully" : "Refill added successfully");
      setOpen(false);
      setForm(blank);
      setEditing(null);
      // Fetch latest tanks to get updated currentQuantity
      dispatch(getAllTanks());
    } catch (err) {
      showErrorToast(err || "Unable to save refill");
    } finally {
      setSaving(false);
    }
  };

  const remove = async () => {
    if (!deleteConfirm) return;
    try {
      await dispatch(deleteRefill({ tankId: selectedTankId, refillId: deleteConfirm._id })).unwrap();
      showSuccessToast("Refill deleted successfully");
      setDeleteConfirm(null);
      // Fetch latest tanks to get updated currentQuantity
      dispatch(getAllTanks());
    } catch (err) {
      showErrorToast(err || "Unable to delete refill");
    }
  };

  return (
    <>
      <PageHeader
        title="Tank Refills"
        subtitle="Create and review fuel refill entries"
        action={
          <button
            onClick={openCreate}
            disabled={!selectedTankId}
            className="btn-primary"
          >
            <FiPlus />
            Add New Refill
          </button>
        }
      />
      {error && (
        <div className="mb-5 rounded-md border border-red-200 bg-red-50 p-4 text-sm font-semibold text-red-600">
          {error}
        </div>
      )}
      <div className="mb-5 max-w-md">
        <SelectField
          label="Tank"
          value={selectedTankId}
          onChange={(e) => setSelectedTankId(e.target.value)}
        >
          {tanks.map((tank) => (
            <option key={tank._id} value={tank._id}>
              {tank.name} ({tank.tankNumber})
            </option>
          ))}
        </SelectField>
      </div>
      {selectedTank && (
        <div className="grid gap-5 lg:grid-cols-[3fr_1fr]">
          {/* Left Column: Expanded Tank detail card */}
          <section className="soft-card flex flex-col md:flex-row items-center justify-between gap-6 p-7">
            {loading ? (
              <div className="w-full h-24 animate-pulse rounded bg-slate-100" />
            ) : (
              <div className="flex flex-col sm:flex-row items-center gap-6 w-full">
                <div className="grid h-24 w-24 shrink-0 place-items-center rounded-full bg-emerald-100 text-emerald-600">
                  <MdWaterDrop className="text-5xl" />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-y-5 gap-x-6 w-full">
                  {/* Row 1 */}
                  <div>
                    <span className="text-muted text-xs">Tank Name</span>
                    <p className="font-bold text-slate-800 mt-1">{selectedTank.name}</p>
                  </div>
                  <div>
                    <span className="text-muted text-xs">Capacity</span>
                    <p className="font-bold text-slate-800 mt-1">{number(selectedTank.capacity)} L</p>
                  </div>
                  <div>
                    <span className="text-muted text-xs">Tank Number</span>
                    <p className="font-bold text-slate-800 mt-1">{selectedTank.tankNumber}</p>
                  </div>
                  {/* Row 2 */}
                  <div>
                    <span className="text-muted text-xs">Fuel Type</span>
                    <div className="mt-1">
                      <Badge tone={selectedTank.fuelType === "PREMIUM" ? "purple" : selectedTank.fuelType === "DIESEL" ? "blue" : "green"}>
                        {selectedTank.fuelType}
                      </Badge>
                    </div>
                  </div>
                  <div>
                    <span className="text-muted text-xs">Current Quantity</span>
                    <p className="font-bold text-brand mt-1">
                      {number(selectedTank.currentQuantity)} L ({pct}%)
                    </p>
                  </div>
                  <div>
                    <span className="text-muted text-xs">Status</span>
                    <div className="mt-1">
                      <Badge tone={selectedTank.isActive ? "green" : "red"}>
                        {selectedTank.isActive ? "Active" : "Inactive"}
                      </Badge>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </section>

          {/* Right Column: Stacked StatCards */}
          <div className="flex flex-col gap-5">
            {loading ? (
              <CardSkeleton count={2} />
            ) : (
              <>
                <StatCard
                  icon={<MdWaterDrop />}
                  label="Total Refilled"
                  value={`${number(totals.quantity, 2)} L`}
                />
                <StatCard
                  icon={<MdCurrencyRupee />}
                  label="Total Amount"
                  value={rupee(totals.amount)}
                  accent="purple"
                />
              </>
            )}
          </div>
        </div>
      )}
      <section className="soft-card mt-7 p-5">
        <div className="mb-5 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <h2 className="text-xl font-bold">Refill History</h2>
            <p className="text-muted">All refills for selected tank</p>
          </div>
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
                    <th>Quantity (L)</th>
                    <th>Price Per Litre</th>
                    <th>Total Amount</th>
                    <th>Remarks</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {refills.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage).map((r) => (
                    <tr key={r._id} className="border-t border-slate-200">
                      <td className="p-4">{dateTime(r.refillDate)}</td>
                      <td className="font-bold">{number(r.quantity, 2)}</td>
                      <td className="font-bold">{rupee(r.pricePerLitre)}</td>
                      <td className="font-bold">
                        {rupee(r.quantity * r.pricePerLitre)}
                      </td>
                      <td className="max-w-xs truncate" title={r.remarks}>{r.remarks || "-"}</td>
                      <td className="p-4">
                        <div className="flex gap-2">
                          <button
                            onClick={() => openEdit(r)}
                            className="btn-secondary px-3 text-brand"
                          >
                            <FiEdit2 />
                          </button>
                          <button
                            onClick={() => setDeleteConfirm(r)}
                            className="btn-secondary px-3 text-red-500 hover:bg-red-50"
                          >
                            <FiTrash2 />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {!refills.length && (
                    <tr>
                      <td colSpan="6" className="p-8 text-center text-muted">
                        No refills logged for this tank.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
              <Pagination
                currentPage={currentPage}
                totalPages={Math.ceil(refills.length / itemsPerPage)}
                onPageChange={setCurrentPage}
                totalEntries={refills.length}
                entriesPerPage={itemsPerPage}
              />
            </>
          )}
        </div>
      </section>
      <Modal open={open} onClose={() => setOpen(false)} title={editing ? "Edit Refill" : "Add New Refill"}>
        <form onSubmit={submit} className="space-y-5">
          <Field
            label="Quantity (L)"
            type="number"
            value={form.quantity}
            onChange={(e) => setForm({ ...form, quantity: e.target.value })}
            required
          />
          <Field
            label="Price Per Litre"
            type="number"
            step="0.01"
            value={form.pricePerLitre}
            onChange={(e) =>
              setForm({ ...form, pricePerLitre: e.target.value })
            }
            required
          />
          <Field
            label="Refill Date & Time"
            type="datetime-local"
            value={form.refillDate}
            onChange={(e) => setForm({ ...form, refillDate: e.target.value })}
          />
          <TextArea
            label="Remarks"
            value={form.remarks}
            onChange={(e) => setForm({ ...form, remarks: e.target.value })}
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
              {saving ? "Saving..." : editing ? "Save Changes" : "Save Refill"}
            </button>
          </div>
        </form>
      </Modal>

      <ConfirmModal
        open={!!deleteConfirm}
        onClose={() => setDeleteConfirm(null)}
        onCancel={() => setDeleteConfirm(null)}
        onConfirm={remove}
        title="Delete Refill"
        message={`Are you sure you want to delete this refill record of ${number(deleteConfirm?.quantity, 2)} L? This action cannot be undone.`}
        confirmText="Delete Refill"
      />
    </>
  );
}
