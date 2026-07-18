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
      <section className="soft-card mx-auto max-w-4xl p-8 md:p-16">
        <div className="mx-auto grid h-24 w-24 place-items-center rounded-full bg-blue-100 text-4xl text-brand">
          <FiLock />
        </div>
        <h2 className="mt-8 text-center text-3xl font-bold">Change Password</h2>
        <p className="mt-3 text-center text-muted">
          Enter your current password and new password
        </p>
        {error && (
          <div className="mt-6 rounded-md border border-red-200 bg-red-50 p-4 text-sm font-semibold text-red-600">
            {error}
          </div>
        )}
        {message && (
          <div className="mt-6 rounded-md border border-emerald-200 bg-emerald-50 p-4 text-sm font-semibold text-emerald-700">
            {message}
          </div>
        )}
        <form onSubmit={submit} className="mt-10 space-y-6">
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
          <div className="rounded-lg border border-blue-200 bg-blue-50 p-5 text-sm">
            <strong>Password must contain:</strong>
            <ul className="mt-3 list-disc space-y-2 pl-6">
              <li>At least 4 characters</li>
              <li>Maximum 20 characters</li>
            </ul>
          </div>
          <button className="btn-primary w-full" disabled={saving}>
            {saving ? "Updating..." : "Update Password"}
          </button>
        </form>
      </section>
    </>
  );
}
