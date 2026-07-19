import { createBrowserRouter, Navigate } from "react-router-dom";
import AppLayout from "../layouts/AppLayout";
import ProtectedRoute from "./ProtectedRoute";
import PublicRoute from "./PublicRoute";
import Login from "../pages/Login";
import Dashboard from "../pages/admin/Dashboard";
import Tanks from "../pages/admin/Tanks";
import Machines from "../pages/admin/Machines";
import MachineDetails from "../pages/admin/MachineDetails";
import Employees from "../pages/admin/Employees";
import FuelPrices from "../pages/admin/FuelPrices";
import Shifts from "../pages/admin/Shifts";
import Refills from "../pages/admin/Refills";
import Reports from "../pages/admin/Reports";
import EmployeeShifts from "../pages/employee/EmployeeShifts";
import ChangePassword from "../pages/employee/ChangePassword";
import Profile from "../pages/employee/Profile";
import Settings from "../pages/admin/Settings";
import Chat from "../pages/admin/Chat";


const router = createBrowserRouter([
  { path: "/", element: <Navigate to="/login" replace /> },
  {
    element: <PublicRoute />,
    children: [
      { path: "/login", element: <Login /> },
    ],
  },
  {
    element: <ProtectedRoute role="admin" />,
    children: [
      {
        path: "/admin",
        element: <AppLayout role="admin" />,
        children: [
          { index: true, element: <Navigate to="/admin/dashboard" replace /> },
          { path: "dashboard", element: <Dashboard /> },
          { path: "tanks", element: <Tanks /> },
          { path: "machines", element: <Machines /> },
          { path: "machines/:id", element: <MachineDetails /> },
          { path: "employees", element: <Employees /> },
          { path: "fuel-prices", element: <FuelPrices /> },
          { path: "shifts", element: <Shifts /> },
          { path: "refills", element: <Refills /> },
          { path: "reports", element: <Reports /> },
          { path: "chat", element: <Chat /> },
          { path: "settings", element: <Settings /> },
        ],
      },
    ],
  },
  {
    element: <ProtectedRoute role="employee" />,
    children: [
      {
        path: "/employee",
        element: <AppLayout role="employee" />,
        children: [
          {
            index: true,
            element: <Navigate to="/employee/my-shifts" replace />,
          },
          { path: "my-shifts", element: <EmployeeShifts /> },
          { path: "profile", element: <Profile /> },
          { path: "change-password", element: <ChangePassword /> },
        ],
      },
    ],
  },
]);

export default router;
