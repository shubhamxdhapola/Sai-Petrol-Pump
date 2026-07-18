import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Navigate, Outlet } from "react-router-dom";
import { getUserInfo } from "../redux/slices/auth.slice";
import Loader from "../components/Loader";

export default function ProtectedRoute({ role }) {
  const dispatch = useDispatch();
  const { user, authenticating } = useSelector((state) => state.auth);

  useEffect(() => {
    if (!user && authenticating) {
      dispatch(getUserInfo());
    }
  }, [authenticating, dispatch, user]);

  if (authenticating) {
    return <Loader className="min-h-screen bg-white" size="lg" />;
  }

  if (!user) return <Navigate to="/login" replace />;
  if (role && user.role !== role)
    return (
      <Navigate
        to={user.role === "admin" ? "/admin/dashboard" : "/employee/my-shifts"}
        replace
      />
    );
  return <Outlet />;
}
