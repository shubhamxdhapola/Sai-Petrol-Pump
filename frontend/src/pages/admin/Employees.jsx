import { useEffect, useMemo, useState } from "react";
import {
  FiEdit2,
  FiLock,
  FiPhone,
  FiPlus,
  FiTrash2,
  FiUser,
  FiUsers,
} from "react-icons/fi";
import { useDispatch, useSelector } from "react-redux";
import Badge from "../../components/Badge";
import { Field, SelectField } from "../../components/FormControls";
import Modal from "../../components/Modal";
import PageHeader from "../../components/PageHeader";
import StatCard from "../../components/StatCard";
import Toggle from "../../components/Toggle";
import ConfirmModal from "../../components/ConfirmModal";
import {
  getAllEmployees,
  addEmployee,
  updateEmployee,
  deleteEmployee,
} from "../../redux/slices/employee.slice";
import { shiftApi } from "../../utils/api";
import { initials } from "../../utils/formatters";
import { showErrorToast, showSuccessToast } from "../../utils/helper";
import { CardSkeleton, TableSkeleton } from "../../components/Skeletons";
import Pagination from "../../components/Pagination";

const emptyForm = { name: "", phone: "", password: "" };

export default function Employees() {
  const dispatch = useDispatch();
  const {
    allEmployees,
    fetchingEmployees,
    error: reduxError,
  } = useSelector((state) => state.employee);
  const items = allEmployees || [];
  const loading = fetchingEmployees;

  const [ongoingShifts, setOngoingShifts] = useState([]);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [status, setStatus] = useState("all");
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [localError, setLocalError] = useState("");
  const [saving, setSaving] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => {
    setCurrentPage(1);
  }, [status]);

  const error =
    localError ||
    (typeof reduxError === "string" ? reduxError : reduxError?.message);

  useEffect(() => {
    dispatch(getAllEmployees());
  }, [dispatch]);

  useEffect(() => {
    shiftApi
      .list({ status: "ONGOING" })
      .then(setOngoingShifts)
      .catch(() => {});
  }, []);

  const onShiftIds = useMemo(
    () =>
      new Set(
        ongoingShifts.map(
          (shift) =>
            shift.employeeId?._id || shift.employeeId?.id || shift.employeeId,
        ),
      ),
    [ongoingShifts],
  );
  const filtered = items.filter(
    (employee) => status === "all" || String(employee.isActive) === status,
  );

  const openCreate = () => {
    setEditing(null);
    setForm(emptyForm);
    setOpen(true);
  };

  const openEdit = (employee) => {
    setEditing(employee);
    setForm({
      name: employee.name || "",
      phone: employee.phone || "",
      password: "",
    });
    setOpen(true);
  };

  const submit = async (event) => {
    event.preventDefault();
    setSaving(true);
    setLocalError("");

    // Frontend Validation
    const nameTrim = (form.name || "").trim();
    const phoneTrim = (form.phone || "").trim();

    if (!nameTrim) {
      showErrorToast("Name is required");
      setSaving(false);
      return;
    }
    if (nameTrim.length < 3) {
      showErrorToast("Name must be at least 3 characters");
      setSaving(false);
      return;
    }
    if (nameTrim.length > 30) {
      showErrorToast("Name cannot exceed 30 characters");
      setSaving(false);
      return;
    }

    if (!phoneTrim) {
      showErrorToast("Phone number is required");
      setSaving(false);
      return;
    }
    const phoneRegex = /^[6-9]\d{9}$/;
    if (!phoneRegex.test(phoneTrim)) {
      showErrorToast("Enter a valid 10-digit phone number");
      setSaving(false);
      return;
    }

    if (!editing) {
      const pass = form.password;
      if (!pass) {
        showErrorToast("Password is required");
        setSaving(false);
        return;
      }
      if (pass.length < 4) {
        showErrorToast("Password must be at least 4 characters");
        setSaving(false);
        return;
      }
      if (pass.length > 20) {
        showErrorToast("Password cannot exceed 20 characters");
        setSaving(false);
        return;
      }
    }

    try {
      if (editing) {
        await dispatch(
          updateEmployee({
            id: editing._id,
            data: { name: nameTrim, phone: phoneTrim },
          }),
        ).unwrap();
      } else {
        await dispatch(
          addEmployee({
            name: nameTrim,
            phone: phoneTrim,
            password: form.password,
          }),
        ).unwrap();
      }
      showSuccessToast(editing ? "Employee updated successfully" : "Employee added successfully");
      setOpen(false);
    } catch (err) {
      showErrorToast(err || "Unable to save employee");
    } finally {
      setSaving(false);
    }
  };

  const toggleActive = async (employee, checked) => {
    try {
      await dispatch(
        updateEmployee({ id: employee._id, data: { isActive: checked } }),
      ).unwrap();
      showSuccessToast(`Employee ${checked ? "activated" : "deactivated"} successfully`);
    } catch (err) {
      showErrorToast(err || "Unable to update employee status");
    }
  };

  const remove = async () => {
    if (!deleteConfirm) return;
    setDeleting(true);
    try {
      await dispatch(deleteEmployee(deleteConfirm._id)).unwrap();
      showSuccessToast("Employee deleted successfully");
      setDeleteConfirm(null);
    } catch (err) {
      showErrorToast(err || "Unable to delete employee");
    } finally {
      setDeleting(false);
    }
  };

  return (
    <>
      <PageHeader
        title="Employees"
        subtitle="Manage your petrol pump employees"
        action={
          <button onClick={openCreate} className="btn-primary">
            <FiPlus />
            Add Employee
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
              icon={<FiUsers />}
              label="Total Employees"
              value={items.length}
            />
            <StatCard
              icon={<FiUser />}
              label="Active Employees"
              value={items.filter((e) => e.isActive).length}
              accent="green"
            />
            <StatCard
              icon={<FiUser />}
              label="Inactive Employees"
              value={items.filter((e) => !e.isActive).length}
              accent="orange"
            />
            <StatCard
              icon={<FiUsers />}
              label="Ongoing"
              value={onShiftIds.size}
              accent="purple"
            />
          </>
        )}
      </div>
      <div className="mt-7 flex flex-col gap-4 lg:w-72">
        <SelectField
          label="Status"
          value={status}
          onChange={(event) => setStatus(event.target.value)}
        >
          <option value="all">All Status</option>
          <option value="true">Active</option>
          <option value="false">Inactive</option>
        </SelectField>
      </div>
      <section className="table-wrap mt-5">
        {loading ? (
          <TableSkeleton rows={4} cols={5} />
        ) : (
          <>
            <table className="w-full min-w-[880px] text-left text-sm">
              <thead className="bg-slate-50 text-muted">
                <tr>
                  <th className="p-5">Employee</th>
                  <th>Phone</th>
                  <th>Shift Status</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage).map((employee, index) => {
                  const onShift = onShiftIds.has(employee._id);
                  return (
                    <tr key={employee._id} className="border-t border-slate-200">
                      <td className="p-5">
                        <div className="flex items-center gap-4">
                          <div
                            className={`grid h-12 w-12 shrink-0 place-items-center rounded-full font-bold ${["bg-blue-100 text-brand", "bg-emerald-100 text-emerald-600", "bg-violet-100 text-violet-600", "bg-orange-100 text-orange-500"][index % 4]}`}
                          >
                            {initials(employee.name)}
                          </div>
                          <div className="min-w-0">
                            <p className="truncate font-bold">{employee.name}</p>
                            <p className="text-xs text-muted">EMP-{employee._id.slice(-4)}</p>
                          </div>
                        </div>
                      </td>
                      <td>+91 {employee.phone}</td>
                      <td>
                        <div className="flex items-start gap-2">
                          <span
                            className={`mt-1 h-2 w-2 rounded-full ${onShift ? "bg-emerald-500" : "bg-slate-400"}`}
                          />
                          <div>{onShift ? "On Shift" : "Off Shift"}</div>
                        </div>
                      </td>
                      <td>
                        <div className="flex items-center gap-3">
                          <Badge tone={employee.isActive ? "green" : "red"}>
                            {employee.isActive ? "Active" : "Inactive"}
                          </Badge>
                          <Toggle
                            checked={employee.isActive}
                            onChange={(checked) => toggleActive(employee, checked)}
                          />
                        </div>
                      </td>
                      <td>
                        <div className="flex gap-3">
                          <button
                            onClick={() => openEdit(employee)}
                            className="btn-secondary px-3 text-brand"
                          >
                            <FiEdit2 />
                          </button>
                          <button
                            onClick={() => setDeleteConfirm(employee)}
                            className="btn-secondary px-3 text-red-500 hover:bg-red-50"
                          >
                            <FiTrash2 />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
                {!filtered.length && (
                  <tr>
                    <td colSpan="5" className="p-8 text-center text-muted">
                      No employees found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
            <Pagination
              currentPage={currentPage}
              totalPages={Math.ceil(filtered.length / itemsPerPage)}
              onPageChange={setCurrentPage}
              totalEntries={filtered.length}
              entriesPerPage={itemsPerPage}
            />
          </>
        )}
      </section>
      {/* <p className="mt-5 text-sm font-semibold text-muted">
        Showing {filtered.length} of {items.length} employees
      </p> */}
      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title={editing ? "Update Employee" : "Add Employee"}
        subtitle="Employee credentials are used to log into the system."
      >
        <form onSubmit={submit} className="space-y-6">
          <Field
            name="name"
            label="Name"
            placeholder="Enter employee name"
            icon={<FiUser />}
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            required
          />
          <Field
            name="phone"
            label="Number"
            placeholder="Enter phone number"
            icon={<FiPhone />}
            value={form.phone}
            onChange={(e) => setForm({ ...form, phone: e.target.value })}
            required
          />
          {!editing && (
            <Field
              name="password"
              type="password"
              label="Password"
              placeholder="Enter password"
              icon={<FiLock />}
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              required
            />
          )}
          <div className="flex flex-wrap justify-end gap-4 pt-3">
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="btn-secondary"
            >
              Cancel
            </button>
            <button className="btn-primary" disabled={saving}>
              {saving ? "Saving..." : "Save Employee"}
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
        title="Delete Employee"
        message={`Are you sure you want to delete "${deleteConfirm?.name}"? This action cannot be undone.`}
        confirmText="Delete Employee"
      />
    </>
  );
}
