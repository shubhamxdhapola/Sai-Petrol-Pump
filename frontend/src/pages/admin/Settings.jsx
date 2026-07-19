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
      {/* Horizontal Tabs Navigation */}
      <div className="mt-6 border-b border-slate-200">
        <nav className="flex gap-6 -mb-px">
          <button
            onClick={() => setActiveTab("profile")}
            className={`flex items-center gap-2 pb-4 text-sm font-semibold border-b-2 transition-all duration-200 ${
              activeTab === "profile"
                ? "border-brand text-brand"
                : "border-transparent text-muted hover:text-ink hover:border-slate-300"
            }`}
          >
            <FiUser className="text-base" />
            <span>Update Profile</span>
          </button>

          <button
            onClick={() => setActiveTab("password")}
            className={`flex items-center gap-2 pb-4 text-sm font-semibold border-b-2 transition-all duration-200 ${
              activeTab === "password"
                ? "border-brand text-brand"
                : "border-transparent text-muted hover:text-ink hover:border-slate-300"
            }`}
          >
            <FiLock className="text-base" />
            <span>Update Password</span>
          </button>
        </nav>
      </div>

      {/* Form Content Area */}
      <div className="mt-8">
        <section className="soft-card !rounded-2xl p-6 sm:p-8 border border-slate-200 bg-white shadow-sm max-w-3xl">
          {activeTab === "profile" ? (
            <div className="w-full">
              <div className="flex items-center gap-4 border-b border-slate-100 pb-6">
                <div className="grid h-12 w-12 place-items-center rounded-xl bg-blue-50 text-xl text-brand border border-blue-100/50 shadow-xs">
                  <FiUser />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-slate-800">Profile Details</h2>
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
                  <button className="btn-primary px-8 shadow-md hover:shadow-lg transition-all duration-200" disabled={updatingProfile}>
                    {updatingProfile ? "Updating Profile..." : "Update Profile"}
                  </button>
                </div>
              </form>
            </div>
          ) : (
            <div className="w-full">
              <div className="flex items-center gap-4 border-b border-slate-100 pb-6">
                <div className="grid h-12 w-12 place-items-center rounded-xl bg-emerald-50 text-xl text-emerald-600 border border-emerald-100/50 shadow-xs">
                  <FiLock />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-slate-800">Security Settings</h2>
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
                  <button className="btn-primary px-8 shadow-md hover:shadow-lg transition-all duration-200" disabled={savingPassword}>
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
