import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { FiArrowLeft, FiEdit2, FiPlus, FiTrash2 } from "react-icons/fi";
import { MdBlock, MdOutlineLocalGasStation } from "react-icons/md";
import Badge from "../../components/Badge";
import { Field, SelectField } from "../../components/FormControls";
import Modal from "../../components/Modal";
import Toggle from "../../components/Toggle";
import ConfirmModal from "../../components/ConfirmModal";
import { apiErrorMessage, machineApi, tankApi } from "../../utils/api";
import { dateTime, number } from "../../utils/formatters";
import { showErrorToast, showSuccessToast } from "../../utils/helper";
import Loader from "../../components/Loader";
import Pagination from "../../components/Pagination";

const blankNozzle = { nozzleNumber: "", tankId: "", currentReading: "" };
const blankMachine = { name: "", machineNumber: "" };

export default function MachineDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [machine, setMachine] = useState(null);
  const [nozzles, setNozzles] = useState([]);
  const [tanks, setTanks] = useState([]);
  const [nozzleOpen, setNozzleOpen] = useState(false);
  const [machineOpen, setMachineOpen] = useState(false);
  const [deleteMachineConfirm, setDeleteMachineConfirm] = useState(false);
  const [deleteNozzleConfirm, setDeleteNozzleConfirm] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [editingNozzle, setEditingNozzle] = useState(null);
  const [nozzleForm, setNozzleForm] = useState(blankNozzle);
  const [machineForm, setMachineForm] = useState(blankMachine);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const load = async () => {
    setLoading(true);
    try {
      const [machineData, nozzleData, tankData] = await Promise.all([
        machineApi.get(id),
        machineApi.nozzles(id),
        tankApi.list(),
      ]);
      setMachine(machineData);
      setNozzles(nozzleData);
      setTanks(tankData.filter((tank) => tank.isActive));
      setMachineForm({
        name: machineData.name || "",
        machineNumber: machineData.machineNumber || "",
      });
      setError("");
    } catch (err) {
      setError(apiErrorMessage(err, "Unable to load machine details"));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, [id]);

  const openNozzleCreate = () => {
    setEditingNozzle(null);
    setNozzleForm({ ...blankNozzle, tankId: tanks[0]?._id || "" });
    setNozzleOpen(true);
  };

  const openNozzleEdit = (nozzle) => {
    setEditingNozzle(nozzle);
    setNozzleForm({
      nozzleNumber: nozzle.nozzleNumber || "",
      tankId: nozzle.tankId?._id || nozzle.tankId || "",
      currentReading: nozzle.currentReading || "",
    });
    setNozzleOpen(true);
  };

  const submitNozzle = async (event) => {
    event.preventDefault();
    setSaving(true);

    // Frontend Validation
    const nozzleNum = (nozzleForm.nozzleNumber || "").trim();
    if (!nozzleNum) {
      showErrorToast("Nozzle number is required");
      setSaving(false);
      return;
    }
    if (nozzleNum.length > 20) {
      showErrorToast("Nozzle number cannot exceed 20 characters");
      setSaving(false);
      return;
    }
    if (!nozzleForm.tankId) {
      showErrorToast("Tank is required");
      setSaving(false);
      return;
    }
    if (!editingNozzle) {
      const curReading = Number(nozzleForm.currentReading);
      if (isNaN(curReading) || curReading < 0) {
        showErrorToast("Current reading cannot be negative");
        setSaving(false);
        return;
      }
    }

    try {
      const selectedTank = tanks.find((t) => t._id === nozzleForm.tankId);
      if (editingNozzle) {
        const response = await machineApi.updateNozzle(id, editingNozzle._id, {
          nozzleNumber: nozzleNum,
          tankId: nozzleForm.tankId,
        });
        const updatedNozzleObj = response.updatedNozzle || response;
        const fullyPopulated = {
          ...editingNozzle,
          ...updatedNozzleObj,
          tankId: selectedTank || updatedNozzleObj.tankId || editingNozzle.tankId,
        };
        setNozzles((prev) =>
          prev.map((item) =>
            item._id === editingNozzle._id ? fullyPopulated : item,
          ),
        );
      } else {
        const response = await machineApi.createNozzle(id, {
          nozzleNumber: nozzleNum,
          tankId: nozzleForm.tankId,
          currentReading: Number(nozzleForm.currentReading),
        });
        const newNozzle = response.nozzle || response;
        const fullyPopulated = {
          ...newNozzle,
          tankId: selectedTank || newNozzle.tankId,
        };
        setNozzles((prev) => [...prev, fullyPopulated]);
      }
      showSuccessToast(editingNozzle ? "Nozzle updated successfully" : "Nozzle added successfully");
      setNozzleOpen(false);
    } catch (err) {
      showErrorToast(apiErrorMessage(err, "Unable to save nozzle"));
    } finally {
      setSaving(false);
    }
  };

  const toggleMachine = async (checked) => {
    try {
      await machineApi.update(id, { isActive: checked });
      setMachine((prev) => ({ ...prev, isActive: checked }));
      showSuccessToast(`Machine ${checked ? "activated" : "deactivated"} successfully`);
    } catch (err) {
      showErrorToast(apiErrorMessage(err, "Unable to update machine status"));
    }
  };

  const submitMachine = async (event) => {
    event.preventDefault();
    setSaving(true);

    // Frontend Validation
    const mName = (machineForm.name || "").trim();
    const mNum = (machineForm.machineNumber || "").trim();
    if (!mName) {
      showErrorToast("Machine name is required");
      setSaving(false);
      return;
    }
    if (mName.length > 20) {
      showErrorToast("Machine name cannot exceed 20 characters");
      setSaving(false);
      return;
    }
    if (!mNum) {
      showErrorToast("Machine number is required");
      setSaving(false);
      return;
    }
    if (mNum.length > 20) {
      showErrorToast("Machine number cannot exceed 20 characters");
      setSaving(false);
      return;
    }

    try {
      const response = await machineApi.update(id, { name: mName, machineNumber: mNum });
      const updatedMachine = response.updatedMachine || response;
      setMachine((prev) => ({
        ...prev,
        ...updatedMachine,
        name: mName,
        machineNumber: mNum,
      }));
      showSuccessToast("Machine details updated successfully");
      setMachineOpen(false);
    } catch (err) {
      showErrorToast(apiErrorMessage(err, "Unable to update machine"));
    } finally {
      setSaving(false);
    }
  };

  const deleteMachine = async () => {
    setDeleting(true);
    try {
      await machineApi.remove(id);
      showSuccessToast("Machine deleted successfully");
      setDeleteMachineConfirm(false);
      navigate("/admin/machines");
    } catch (err) {
      showErrorToast(apiErrorMessage(err, "Unable to delete machine"));
    } finally {
      setDeleting(false);
    }
  };

  const toggleNozzle = async (nozzle, checked) => {
    try {
      await machineApi.updateNozzle(id, nozzle._id, { isActive: checked });
      setNozzles((prev) =>
        prev.map((item) =>
          item._id === nozzle._id ? { ...item, isActive: checked } : item,
        ),
      );
      showSuccessToast(`Nozzle ${checked ? "activated" : "deactivated"} successfully`);
    } catch (err) {
      showErrorToast(apiErrorMessage(err, "Unable to update nozzle status"));
    }
  };

  const deleteNozzle = async () => {
    if (!deleteNozzleConfirm) return;
    setDeleting(true);
    try {
      await machineApi.removeNozzle(id, deleteNozzleConfirm._id);
      setNozzles((prev) => prev.filter((item) => item._id !== deleteNozzleConfirm._id));
      showSuccessToast("Nozzle deleted successfully");
      setDeleteNozzleConfirm(null);
    } catch (err) {
      showErrorToast(err || "Unable to delete nozzle");
    } finally {
      setDeleting(false);
    }
  };

  if (loading)
    return <Loader className="min-h-[420px]" size="lg" />;

  return (
    <>
      <div className="mb-8 flex flex-col justify-between gap-4 border-b border-slate-200 pb-8 lg:flex-row lg:items-center">
        <div className="flex items-center gap-5">
          <Link to="/admin/machines" className="btn-secondary px-3">
            <FiArrowLeft />
          </Link>
          <div>
            <h1 className="text-3xl font-bold">Machine Details</h1>
            <p className="mt-2 text-muted">
              View and manage machine information and nozzles
            </p>
          </div>
        </div>
        <div className="flex flex-wrap gap-3">
          <button
            onClick={() => setMachineOpen(true)}
            className="btn-secondary text-brand"
          >
            <FiEdit2 />
            Edit Machine
          </button>
          <button
            onClick={() => setDeleteMachineConfirm(true)}
            className="btn-secondary text-red-500 hover:bg-red-50"
          >
            <FiTrash2 />
            Delete Machine
          </button>
          <div className="flex items-center gap-3 font-semibold">
            Active{" "}
            <Toggle checked={!!machine?.isActive} onChange={toggleMachine} />
          </div>
        </div>
      </div>
      {error && (
        <div className="mb-5 rounded-md border border-red-200 bg-red-50 p-4 text-sm font-semibold text-red-600">
          {error}
        </div>
      )}
      <section className="soft-card p-7">
        <div className="grid gap-6 lg:grid-cols-[2fr_1fr_1fr_1fr] lg:items-center">
          <div className="flex items-center gap-6">
            <div className="grid h-20 w-20 shrink-0 place-items-center rounded-full bg-blue-100 text-brand">
              <MdOutlineLocalGasStation className="text-4xl" />
            </div>
            <div className="min-w-0">
              <h2 className="break-words text-3xl font-bold">
                {machine?.name}{" "}
                <Badge tone={machine?.isActive ? "green" : "red"}>
                  {machine?.isActive ? "Active" : "Inactive"}
                </Badge>
              </h2>
              <p className="mt-3 text-muted">
                Machine No. {machine?.machineNumber}
              </p>
            </div>
          </div>
          <div>
            <p className="text-sm text-muted">Total Nozzles</p>
            <strong className="text-xl">{nozzles.length}</strong>
          </div>
          <div>
            <p className="text-sm text-muted">Occupied</p>
            <strong className="text-xl">
              {nozzles.filter((n) => n.isOccupied).length}
            </strong>
          </div>
          <div>
            <p className="text-sm text-muted">Last Updated</p>
            <strong>{dateTime(machine?.updatedAt)}</strong>
          </div>
        </div>
      </section>
      <section className="soft-card mt-7 overflow-hidden">
        <div className="flex flex-col justify-between gap-4 border-b border-slate-200 p-5 sm:flex-row sm:items-center">
          <h2 className="text-xl font-bold">Nozzles ({nozzles.length})</h2>
          <button onClick={openNozzleCreate} className="btn-primary py-2">
            <FiPlus />
            Add Nozzle
          </button>
        </div>
        <div className="table-wrap border-0">
          <table className="w-full min-w-[920px] text-left text-sm">
            <thead className="bg-slate-50 text-muted">
              <tr>
                <th className="p-4">Nozzle</th>
                <th>Tank</th>
                <th>Fuel Type</th>
                <th>Current Reading</th>
                <th>Occupancy</th>
                <th>Status</th>
                {/* <th>Last Updated</th> */}
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {nozzles.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage).map((nozzle) => (
                <tr key={nozzle._id} className="border-t border-slate-200">
                  <td className="p-4 font-bold">{nozzle.nozzleNumber}</td>
                  <td>{nozzle.tankId?.name || "-"}</td>
                  <td>
                    <Badge
                      tone={
                        nozzle.tankId?.fuelType === "PREMIUM"
                          ? "purple"
                          : nozzle.tankId?.fuelType === "DIESEL"
                            ? "blue"
                            : "green"
                      }
                    >
                      {nozzle.tankId?.fuelType || "-"}
                    </Badge>
                  </td>
                  <td className="font-bold">{number(nozzle.currentReading, 2)} L</td>
                  <td>
                    <Badge tone={nozzle.isOccupied ? "orange" : "green"}>
                      {nozzle.isOccupied ? "Occupied" : "Available"}
                    </Badge>
                  </td>
                  <td>
                    <div className="flex items-center gap-3">
                      <Badge tone={nozzle.isActive ? "green" : "red"}>
                        {nozzle.isActive ? "Active" : "Inactive"}
                      </Badge>
                      <Toggle
                        checked={nozzle.isActive}
                        onChange={(checked) => toggleNozzle(nozzle, checked)}
                      />
                    </div>
                  </td>
                  {/* <td>{dateTime(nozzle.updatedAt)}</td> */}
                  <td className="p-4">
                    <div className="flex gap-2">
                      <button
                        onClick={() => openNozzleEdit(nozzle)}
                        className="btn-secondary px-3 text-brand"
                      >
                        <FiEdit2 />
                      </button>
                      <button
                        onClick={() => setDeleteNozzleConfirm(nozzle)}
                        className="btn-secondary px-3 text-red-500 hover:bg-red-50"
                      >
                        <FiTrash2 />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {!nozzles.length && (
                <tr>
                  <td colSpan="8" className="p-8 text-center text-muted">
                    No nozzles found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
          <Pagination
            currentPage={currentPage}
            totalPages={Math.ceil(nozzles.length / itemsPerPage)}
            onPageChange={setCurrentPage}
            totalEntries={nozzles.length}
            entriesPerPage={itemsPerPage}
          />
        </div>
      </section>
      <Modal
        open={machineOpen}
        onClose={() => setMachineOpen(false)}
        title="Update Machine"
      >
        <form onSubmit={submitMachine} className="space-y-5">
          <Field
            label="Name"
            value={machineForm.name}
            onChange={(e) =>
              setMachineForm({ ...machineForm, name: e.target.value })
            }
            required
          />
          <Field
            label="Machine Number"
            value={machineForm.machineNumber}
            onChange={(e) =>
              setMachineForm({ ...machineForm, machineNumber: e.target.value })
            }
            required
          />
          <div className="flex flex-wrap justify-end gap-4">
            <button
              type="button"
              onClick={() => setMachineOpen(false)}
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
      <Modal
        open={nozzleOpen}
        onClose={() => setNozzleOpen(false)}
        title={editingNozzle ? "Update Nozzle" : "Add Nozzle"}
      >
        <form onSubmit={submitNozzle} className="space-y-5">
          <Field
            label="Nozzle Number"
            value={nozzleForm.nozzleNumber}
            onChange={(e) =>
              setNozzleForm({ ...nozzleForm, nozzleNumber: e.target.value })
            }
            required
          />
          <SelectField
            label="Tank"
            value={nozzleForm.tankId}
            onChange={(e) =>
              setNozzleForm({ ...nozzleForm, tankId: e.target.value })
            }
            required
          >
            <option value="">Select tank</option>
            {tanks.map((tank) => (
              <option key={tank._id} value={tank._id}>
                {tank.name} ({tank.fuelType})
              </option>
            ))}
          </SelectField>
          {!editingNozzle && (
            <Field
              label="Current Reading"
              type="number"
              value={nozzleForm.currentReading}
              onChange={(e) =>
                setNozzleForm({ ...nozzleForm, currentReading: e.target.value })
              }
              required
            />
          )}
          <div className="flex flex-wrap justify-end gap-4">
            <button
              type="button"
              onClick={() => setNozzleOpen(false)}
              className="btn-secondary"
            >
              Cancel
            </button>
            <button className="btn-primary" disabled={saving}>
              {saving ? "Saving..." : "Save Nozzle"}
            </button>
          </div>
        </form>
      </Modal>

      <ConfirmModal
        open={deleteMachineConfirm}
        onClose={() => setDeleteMachineConfirm(false)}
        onCancel={() => setDeleteMachineConfirm(false)}
        onConfirm={deleteMachine}
        loading={deleting}
        title="Delete Machine"
        message="Are you sure you want to delete this machine? This action cannot be undone."
        confirmText="Delete Machine"
      />

      <ConfirmModal
        open={!!deleteNozzleConfirm}
        onClose={() => setDeleteNozzleConfirm(null)}
        onCancel={() => setDeleteNozzleConfirm(null)}
        onConfirm={deleteNozzle}
        loading={deleting}
        title="Delete Nozzle"
        message={`Are you sure you want to delete nozzle ${deleteNozzleConfirm?.nozzleNumber}? This action cannot be undone.`}
        confirmText="Delete Nozzle"
      />
    </>
  );
}
