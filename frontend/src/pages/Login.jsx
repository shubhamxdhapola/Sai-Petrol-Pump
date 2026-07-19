import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { FiEye, FiEyeOff, FiLock, FiPhone } from "react-icons/fi";
import { clearAuthError, loginUser } from "../redux/slices/auth.slice";
import { showErrorToast } from "../utils/helper";
import Logo from "../components/Logo";

export default function Login() {
  const [form, setForm] = useState({ phone: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);
  const dispatch = useDispatch();
  const { loading, error } = useSelector((state) => state.auth);
  const navigate = useNavigate();

  useEffect(() => {
    dispatch(clearAuthError());
  }, [dispatch]);

  useEffect(() => {
    if (error) {
      showErrorToast(error);
    }
  }, [error]);

  const updateField = (field, value) => {
    dispatch(clearAuthError());
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const submit = async (event) => {
    event.preventDefault();

    // Frontend Validation
    const phoneTrim = (form.phone || "").trim();
    const pass = form.password;

    if (!phoneTrim) {
      showErrorToast("Phone number is required");
      return;
    }
    if (!pass) {
      showErrorToast("Password is required");
      return;
    }

    try {
      const user = await dispatch(loginUser({ phone: phoneTrim, password: pass })).unwrap();
      navigate(
        user.role === "admin" ? "/admin/dashboard" : "/employee/my-shifts",
      );
    } catch {
      // Error is stored in Redux and displayed below.
    }
  };

  return (
    <div className="grid min-h-screen grid-cols-1 lg:grid-cols-12 bg-white font-sora">
      {/* Left Panel: Form */}
      <div className="flex flex-col justify-between p-6 sm:p-8 lg:col-span-5 xl:p-12 bg-white min-h-screen w-full">
        {/* Top Section: Logo */}
        <div className="flex items-center justify-start w-full">
          <Logo />
        </div>

        {/* Middle Section: Form Container */}
        <div className="mx-auto my-auto w-full max-w-[400px] py-12 px-2">
          <h1 className="text-3xl font-extrabold tracking-tight text-ink sm:text-4xl">
            Welcome Back
          </h1>
          <p className="mt-2.5 text-sm text-muted">
            Enter your phone and password to access your account.
          </p>

          <form onSubmit={submit} className="mt-8 space-y-6">
            {/* Phone Number Input */}
            <label className="block">
              <span className="block text-xs font-bold uppercase tracking-wider text-muted mb-2">
                Phone Number
              </span>
              <div className="relative">
                <FiPhone className="absolute left-4 top-1/2 -translate-y-1/2 text-lg text-slate-400" />
                <input
                  type="text"
                  className="w-full rounded-lg border border-slate-200 bg-white py-3.5 pl-11 pr-4 text-sm text-ink outline-none transition placeholder:text-slate-400 focus:border-brand focus:ring-4 focus:ring-blue-100"
                  placeholder="Enter your phone number"
                  value={form.phone}
                  onChange={(e) => updateField("phone", e.target.value)}
                  required
                />
              </div>
            </label>

            {/* Password Input */}
            <label className="block">
              <span className="block text-xs font-bold uppercase tracking-wider text-muted mb-2">
                Password
              </span>
              <div className="relative">
                <FiLock className="absolute left-4 top-1/2 -translate-y-1/2 text-lg text-slate-400" />
                <input
                  type={showPassword ? "text" : "password"}
                  className="w-full rounded-lg border border-slate-200 bg-white py-3.5 pl-11 pr-12 text-sm text-ink outline-none transition placeholder:text-slate-400 focus:border-brand focus:ring-4 focus:ring-blue-100"
                  placeholder="Enter your password"
                  value={form.password}
                  onChange={(e) => updateField("password", e.target.value)}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-lg text-slate-400 hover:text-ink transition"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <FiEyeOff /> : <FiEye />}
                </button>
              </div>
            </label>

            {/* Log In Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-lg bg-brand py-3.5 text-sm font-semibold text-white shadow-lg shadow-blue-500/20 transition hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? "Logging in..." : "Log In"}
            </button>
          </form>
        </div>

        {/* Bottom Section */}
        <div className="text-center text-xs text-slate-400 w-full mt-6">
          <p>© {new Date().getFullYear()} Sai Petrol Pump. All rights reserved.</p>
        </div>
      </div>

      {/* Right Panel: Promotional/Illustration Card */}
      <div className="hidden lg:flex lg:col-span-7 relative overflow-hidden bg-gradient-to-br from-brand via-[#1650e6] to-[#040930] justify-center items-center p-8 xl:p-16 min-h-screen">
        {/* Glow Effects */}
        <div className="absolute top-[-10%] right-[-10%] h-[600px] w-[600px] rounded-full bg-blue-400/20 blur-[100px]" />
        <div className="absolute bottom-[-10%] left-[-10%] h-[600px] w-[600px] rounded-full bg-indigo-500/20 blur-[100px]" />

        {/* Grid Background Overlay */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff03_1px,transparent_1px),linear-gradient(to_bottom,#ffffff03_1px,transparent_1px)] bg-[size:32px_32px]" />

        {/* Content Container */}
        <div className="relative z-10 flex flex-col items-center text-center max-w-xl w-full">
          <h2 className="text-3xl font-extrabold text-white xl:text-4xl leading-tight tracking-tight">
            Effortlessly manage your daily sales and operations.
          </h2>
          <p className="mt-4 text-base text-blue-100 max-w-md font-normal leading-relaxed opacity-90">
            Log in to access your CRM dashboard, monitor real-time fuel inventory, track nozzle sales, and manage shift logs.
          </p>

          {/* Floating Dashboard Illustration */}
          <div className="relative mt-12 w-full rounded-2xl bg-white/5 p-4 backdrop-blur-md border border-white/10 shadow-2xl transition hover:scale-[1.02] duration-500">
            {/* Header circles mimicking web window */}
            <div className="flex gap-1.5 mb-3 border-b border-white/5 pb-3">
              <span className="h-3 w-3 rounded-full bg-[#ff5f56]" />
              <span className="h-3 w-3 rounded-full bg-[#ffbd2e]" />
              <span className="h-3 w-3 rounded-full bg-[#27c93f]" />
            </div>
            {/* Mock Dashboard Image */}
            <img
              src="/petrol_dashboard.png"
              alt="Petrol Pump Dashboard Mockup"
              className="rounded-lg shadow-lg border border-white/10 w-full object-cover"
            />
          </div>
        </div>
      </div>
    </div>
  );
}


