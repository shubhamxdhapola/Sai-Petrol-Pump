import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { FiEye, FiEyeOff, FiLock, FiUser } from "react-icons/fi";
import { clearAuthError, loginUser } from "../redux/slices/auth.slice";
import { showErrorToast } from "../utils/helper";
import Logo from "../components/Logo";
import toast from "react-hot-toast";

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
    <div className="relative min-h-screen overflow-hidden bg-white">

      <div className="absolute inset-y-0 left-0 hidden w-[42%] bg-blue-50 lg:block">
        <div className="absolute left-[-80px] top-44 h-[360px] w-[560px] rounded-[48px] border-[28px] border-blue-200/50 opacity-70" />
        <div className="absolute left-12 top-80 h-52 w-72 rounded-lg bg-blue-200/35" />
        <div className="absolute bottom-[-160px] right-[-240px] h-[420px] w-[760px] rounded-[50%] bg-blue-100" />
      </div>
      <div className="relative z-10 flex min-h-screen items-center justify-center p-5">
        <form
          onSubmit={submit}
          className="soft-card w-full max-w-[700px] px-8 py-12 sm:px-16"
        >
          <div className="flex justify-center">
            <Logo />
          </div>
          <h1 className="mt-10 text-center text-4xl font-extrabold text-ink">
            Welcome Back
          </h1>
          <p className="mt-3 text-center text-lg text-muted">
            Sign in to continue to your account
          </p>
          <div className="mt-10 space-y-7">
            <label className="block">
              <span className="mb-2 block text-sm font-bold">Phone</span>
              <div className="relative">
                <FiUser className="absolute left-5 top-1/2 -translate-y-1/2 text-xl text-muted" />
                <input
                  className="field py-5 !pl-14"
                  placeholder="Enter your phone number"
                  value={form.phone}
                  onChange={(e) => updateField("phone", e.target.value)}
                  required
                />
              </div>
            </label>
            <label className="block">
              <span className="mb-2 block text-sm font-bold">Password</span>
              <div className="relative">
                <FiLock className="absolute left-5 top-1/2 -translate-y-1/2 text-xl text-muted" />
                <input
                  className="field py-5 !pl-14 pr-14"
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your password"
                  value={form.password}
                  onChange={(e) => updateField("password", e.target.value)}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  className="absolute right-5 top-1/2 -translate-y-1/2 text-xl text-muted hover:text-ink"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <FiEyeOff /> : <FiEye />}
                </button>
              </div>
            </label>
            <button
              className="btn-primary w-full py-5 text-base"
              disabled={loading}
            >
              {loading ? "Logging in..." : "Login"}
            </button>
          </div>
          {/* <div className="my-10 flex items-center gap-7 text-muted">
            <span className="h-px flex-1 bg-slate-200" />
            or
            <span className="h-px flex-1 bg-slate-200" />
          </div>
          <p className="text-center text-sm text-muted">
            Forgot your password?{" "}
            <span className="font-semibold text-brand">Reset Password</span>
          </p> */}
        </form>
      </div>
    </div>
  );
}
