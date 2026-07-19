import { useState } from "react";
import { FiLock } from "react-icons/fi";
import PageHeader from "../../components/PageHeader";
import { Field } from "../../components/FormControls";
import { apiErrorMessage, authApi } from "../../utils/api";

export default function ChangePassword() {
  const [form, setForm] = useState({ currentPassword: "", newPassword: "" });
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const submit = async (event) => {
    event.preventDefault();
    setSaving(true);
    try {
      const data = await authApi.changePassword(form);
      setMessage(data.message || "Password updated successfully");
      setError("");
      setForm({ currentPassword: "", newPassword: "" });
    } catch (err) {
      setError(apiErrorMessage(err, "Unable to update password"));
      setMessage("");
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <PageHeader
        title="Change Password"
        subtitle="Update your password to keep your account secure."
      />
      <section className="soft-card !rounded-2xl border border-slate-200 bg-white shadow-sm max-w-xl p-6 sm:p-8">
        <div className="flex items-center gap-4 border-b border-slate-100 pb-6">
          <div className="grid h-12 w-12 place-items-center rounded-xl bg-blue-50 text-xl text-brand border border-blue-100/50 shadow-xs">
            <FiLock />
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-800">Security Settings</h2>
            <p className="text-sm text-muted">Update your login password</p>
          </div>
        </div>

        {error && (
          <div className="mt-6 rounded-xl border border-red-200 bg-red-50 p-4 text-sm font-semibold text-red-600">
            {error}
          </div>
        )}
        {message && (
          <div className="mt-6 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm font-semibold text-emerald-700">
            {message}
          </div>
        )}

        <form onSubmit={submit} className="mt-7 space-y-6">
          <Field
            label="Old Password"
            type="password"
            placeholder="Enter your old password"
            icon={<FiLock />}
            value={form.currentPassword}
            onChange={(e) =>
              setForm({ ...form, currentPassword: e.target.value })
            }
            required
          />
          <Field
            label="New Password"
            type="password"
            placeholder="Enter your new password"
            icon={<FiLock />}
            value={form.newPassword}
            onChange={(e) => setForm({ ...form, newPassword: e.target.value })}
            required
          />
          
          <div className="rounded-xl border border-blue-100 bg-blue-50/20 p-5 text-sm">
            <strong className="text-slate-800 font-semibold flex items-center gap-2">
              <span className="h-1.5 w-1.5 rounded-full bg-blue-600"></span>
              Password requirements:
            </strong>
            <ul className="mt-3 space-y-2 text-muted list-inside pl-3">
              <li className="flex items-center gap-2">
                <span className="text-blue-500">•</span> At least 4 characters
              </li>
              <li className="flex items-center gap-2">
                <span className="text-blue-500">•</span> Maximum 20 characters
              </li>
            </ul>
          </div>

          <div className="flex justify-start pt-2">
            <button className="btn-primary px-8 shadow-md hover:shadow-lg transition-all duration-200 w-full sm:w-auto" disabled={saving}>
              {saving ? "Updating Password..." : "Update Password"}
            </button>
          </div>
        </form>
      </section>
    </>
  );
}
