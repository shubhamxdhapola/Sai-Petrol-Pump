import { useState, useEffect } from "react";
import { FiLock, FiUser, FiPhone, FiChevronRight } from "react-icons/fi";
import { useDispatch, useSelector } from "react-redux";
import PageHeader from "../../components/PageHeader";
import { Field } from "../../components/FormControls";
import { apiErrorMessage, authApi, userApi } from "../../utils/api";
import { updateCurrentUser } from "../../redux/slices/auth.slice";
import { showSuccessToast, showErrorToast } from "../../utils/helper";

export default function Settings() {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);

  // Active Tab state: "profile" or "password"
  const [activeTab, setActiveTab] = useState("profile");

  // Profile Form State
  const [profileForm, setProfileForm] = useState({ name: "", phone: "" });
  const [updatingProfile, setUpdatingProfile] = useState(false);

  // Password Form State
  const [passwordForm, setPasswordForm] = useState({ currentPassword: "", newPassword: "" });
  const [savingPassword, setSavingPassword] = useState(false);

  // Sync profileForm with logged in user details
  useEffect(() => {
    if (user) {
      setProfileForm({
        name: user.name || "",
        phone: user.phone || "",
      });
    }
  }, [user]);

  const handleUpdateProfile = async (event) => {
    event.preventDefault();
    if (!user) return;
    setUpdatingProfile(true);

    // Frontend Validation
    const nameTrim = (profileForm.name || "").trim();
    const phoneTrim = (profileForm.phone || "").trim();

    if (!nameTrim) {
      showErrorToast("Name is required");
      setUpdatingProfile(false);
      return;
    }
    if (nameTrim.length < 3) {
      showErrorToast("Name must be at least 3 characters");
      setUpdatingProfile(false);
      return;
    }
    if (nameTrim.length > 30) {
      showErrorToast("Name cannot exceed 30 characters");
      setUpdatingProfile(false);
      return;
    }
    if (!phoneTrim) {
      showErrorToast("Phone number is required");
      setUpdatingProfile(false);
      return;
    }
    const phoneRegex = /^[6-9]\d{9}$/;
    if (!phoneRegex.test(phoneTrim)) {
      showErrorToast("Enter a valid 10-digit phone number");
      setUpdatingProfile(false);
      return;
    }

    const userId = user.id || user._id;
    try {
      const response = await userApi.update(userId, {
        name: nameTrim,
        phone: phoneTrim,
      });
      const updatedUser = response.updatedUser || response.user || response;
      dispatch(updateCurrentUser(updatedUser));
      showSuccessToast(response.message || "Profile updated successfully");
    } catch (err) {
      showErrorToast(apiErrorMessage(err, "Unable to update profile"));
    } finally {
      setUpdatingProfile(false);
    }
  };

  const handleUpdatePassword = async (event) => {
    event.preventDefault();
    setSavingPassword(true);

    // Frontend Validation
    const currentPass = passwordForm.currentPassword;
    const newPass = passwordForm.newPassword;

    if (!currentPass) {
      showErrorToast("Current password is required");
      setSavingPassword(false);
      return;
    }
    if (!newPass) {
      showErrorToast("New password is required");
      setSavingPassword(false);
      return;
    }
    if (newPass.length < 4) {
      showErrorToast("New password must be at least 4 characters");
      setSavingPassword(false);
      return;
    }
    if (newPass.length > 20) {
      showErrorToast("New password cannot exceed 20 characters");
      setSavingPassword(false);
      return;
    }
    if (currentPass === newPass) {
      showErrorToast("New password must be different from old password");
      setSavingPassword(false);
      return;
    }

    try {
      const data = await authApi.changePassword(passwordForm);
      showSuccessToast(data.message || "Password updated successfully");
      setPasswordForm({ currentPassword: "", newPassword: "" });
    } catch (err) {
      showErrorToast(apiErrorMessage(err, "Unable to update password"));
    } finally {
      setSavingPassword(false);
    }
  };

  return (
    <>
      <PageHeader
        title="Settings"
        subtitle="Manage your profile details and security configurations"
      />
      <div className="grid gap-6 md:grid-cols-4">
        {/* Navigation Sidebar */}
        <section className="soft-card h-fit p-3 md:col-span-1">
          <nav className="flex flex-row gap-1.5 overflow-x-auto md:flex-col">
            <button
              onClick={() => setActiveTab("profile")}
              className={`flex w-full items-center justify-between gap-3 rounded-lg px-4 py-3.5 text-sm font-semibold transition ${
                activeTab === "profile"
                  ? "bg-brand text-white shadow-md shadow-blue-500/10"
                  : "text-muted hover:bg-slate-50 hover:text-ink"
              }`}
            >
              <div className="flex items-center gap-3">
                <FiUser className="text-base" />
                <span>Update Profile</span>
              </div>
              <FiChevronRight className={`hidden md:block text-xs ${activeTab === "profile" ? "text-white" : "text-slate-400"}`} />
            </button>

            <button
              onClick={() => setActiveTab("password")}
              className={`flex w-full items-center justify-between gap-3 rounded-lg px-4 py-3.5 text-sm font-semibold transition ${
                activeTab === "password"
                  ? "bg-brand text-white shadow-md shadow-blue-500/10"
                  : "text-muted hover:bg-slate-50 hover:text-ink"
              }`}
            >
              <div className="flex items-center gap-3">
                <FiLock className="text-base" />
                <span>Update Password</span>
              </div>
              <FiChevronRight className={`hidden md:block text-xs ${activeTab === "password" ? "text-white" : "text-slate-400"}`} />
            </button>
          </nav>
        </section>

        {/* Content Area */}
        <section className="soft-card p-6 sm:p-8 md:col-span-3">
          {activeTab === "profile" ? (
            <div className="max-w-2xl">
              <div className="flex items-center gap-4 border-b border-slate-100 pb-5">
                <div className="grid h-12 w-12 place-items-center rounded-full bg-blue-100 text-xl text-brand">
                  <FiUser />
                </div>
                <div>
                  <h2 className="text-xl font-bold">Profile Details</h2>
                  <p className="text-sm text-muted">Update your personal account information</p>
                </div>
              </div>

              <form onSubmit={handleUpdateProfile} className="mt-7 space-y-6">
                <Field
                  label="Full Name"
                  type="text"
                  placeholder="Enter your name"
                  icon={<FiUser />}
                  value={profileForm.name}
                  onChange={(e) =>
                    setProfileForm({ ...profileForm, name: e.target.value })
                  }
                  required
                />
                <Field
                  label="Phone Number"
                  type="tel"
                  placeholder="Enter your phone number"
                  icon={<FiPhone />}
                  value={profileForm.phone}
                  onChange={(e) =>
                    setProfileForm({ ...profileForm, phone: e.target.value })
                  }
                  required
                />
                <div className="flex justify-start pt-2">
                  <button className="btn-primary px-8" disabled={updatingProfile}>
                    {updatingProfile ? "Updating Profile..." : "Update Profile"}
                  </button>
                </div>
              </form>
            </div>
          ) : (
            <div className="max-w-2xl">
              <div className="flex items-center gap-4 border-b border-slate-100 pb-5">
                <div className="grid h-12 w-12 place-items-center rounded-full bg-emerald-100 text-xl text-emerald-600">
                  <FiLock />
                </div>
                <div>
                  <h2 className="text-xl font-bold">Security Settings</h2>
                  <p className="text-sm text-muted">Update your login password</p>
                </div>
              </div>

              <form onSubmit={handleUpdatePassword} className="mt-7 space-y-6">
                <Field
                  label="Old Password"
                  type="password"
                  placeholder="Enter your old password"
                  icon={<FiLock />}
                  value={passwordForm.currentPassword}
                  onChange={(e) =>
                    setPasswordForm({ ...passwordForm, currentPassword: e.target.value })
                  }
                  required
                />
                <Field
                  label="New Password"
                  type="password"
                  placeholder="Enter your new password"
                  icon={<FiLock />}
                  value={passwordForm.newPassword}
                  onChange={(e) =>
                    setPasswordForm({ ...passwordForm, newPassword: e.target.value })
                  }
                  required
                />
                <div className="rounded-lg border border-blue-200 bg-blue-50/50 p-5 text-sm">
                  <strong className="text-slate-700">Password requirements:</strong>
                  <ul className="mt-3 list-disc space-y-2 pl-5 text-muted">
                    <li>At least 4 characters</li>
                    <li>Maximum 20 characters</li>
                  </ul>
                </div>
                <div className="flex justify-start pt-2">
                  <button className="btn-primary px-8" disabled={savingPassword}>
                    {savingPassword ? "Updating Password..." : "Update Password"}
                  </button>
                </div>
              </form>
            </div>
          )}
        </section>
      </div>
    </>
  );
}
