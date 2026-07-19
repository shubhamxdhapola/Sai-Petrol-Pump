import { useState, useEffect, useRef } from "react";
import { NavLink, Outlet, useNavigate, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useDispatch, useSelector } from "react-redux";
import {
  FiCalendar,
  FiChevronDown,
  FiChevronLeft,
  FiChevronRight,
  FiClock,
  FiDroplet,
  FiHome,
  FiMenu,
  FiSettings,
  FiUser,
  FiUsers,
  FiX,
  FiLogOut,
  FiCpu,
} from "react-icons/fi";
import {
  TbGasStation,
  TbReportAnalytics,
  TbTruckDelivery,
} from "react-icons/tb";
import { GrStorage } from "react-icons/gr";
import { MdOutlineLocalGasStation } from "react-icons/md";
import { logoutUser } from "../redux/slices/auth.slice";
import Logo from "../components/Logo";
import { initials } from "../utils/formatters";

const adminNav = [
  { to: "/admin/dashboard", label: "Dashboard", icon: FiHome },
  { to: "/admin/tanks", label: "Tanks", icon: GrStorage },
  { to: "/admin/machines", label: "Machines", icon: TbGasStation },
  { to: "/admin/fuel-prices", label: "Fuel Prices", icon: FiDroplet },
  { to: "/admin/shifts", label: "Shifts", icon: FiClock },
  { to: "/admin/employees", label: "Employees", icon: FiUsers },
  { to: "/admin/refills", label: "Tank Refills", icon: TbTruckDelivery },
  { to: "/admin/reports", label: "Reports", icon: TbReportAnalytics },
  { to: "/admin/chat", label: "AI Assistant", icon: FiCpu },
  { to: "/admin/settings", label: "Settings", icon: FiSettings },
];

const employeeNav = [
  { to: "/employee/my-shifts", label: "My Shifts", icon: FiClock },
  { to: "/employee/profile", label: "Profile", icon: FiUser },
  {
    to: "/employee/change-password",
    label: "Change Password",
    icon: FiSettings,
  },
];

export default function AppLayout({ role = "admin" }) {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [desktopSidebarExpanded, setDesktopSidebarExpanded] = useState(false);
  const mobileSidebarRef = useRef(null);
  const menuBtnRef = useRef(null);

  // Automatically close mobile sidebar when the route changes
  useEffect(() => {
    setSidebarOpen(false);
  }, [location.pathname]);

  // Click outside handler to close mobile menu
  useEffect(() => {
    function handleClickOutside(event) {
      if (
        sidebarOpen &&
        mobileSidebarRef.current &&
        !mobileSidebarRef.current.contains(event.target) &&
        (!menuBtnRef.current || !menuBtnRef.current.contains(event.target))
      ) {
        setSidebarOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [sidebarOpen]);

  const nav = role === "admin" ? adminNav : employeeNav;
  const displayUser =
    user ||
    (role === "admin"
      ? { name: "Admin User", role: "admin" }
      : { name: "Employee User", role: "employee" });

  const handleLogout = async () => {
    await dispatch(logoutUser());
    navigate("/login");
  };

  const closeSidebar = () => setSidebarOpen(false);

  const renderSidebarContent = (isExpanded, isMobile = false) => (
    <>
      <div
        className={`flex h-[92px] items-center border-b border-slate-200 ${isExpanded ? "justify-between px-8" : "justify-center px-4"}`}
      >
        {isExpanded && <Logo isLogo={false} />}
        {!isMobile && (
          <button
            onClick={() => setDesktopSidebarExpanded(!desktopSidebarExpanded)}
            className="rounded-md p-2 text-2xl text-ink hover:bg-slate-100"
            aria-label="Toggle sidebar"
          >
            {desktopSidebarExpanded ? <FiChevronLeft /> : <FiChevronRight />}
          </button>
        )}
      </div>
      <nav className="flex-1 space-y-2 overflow-y-auto px-2 py-8 overflow-x-hidden">
        {nav.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            onClick={isMobile ? closeSidebar : undefined}
            title={!isExpanded ? label : undefined}
            className={({ isActive }) =>
              `relative flex items-center gap-4 rounded-md py-4 text-sm font-semibold transition ${isExpanded ? "px-8" : "justify-center px-4"} ${isActive ? "bg-blue-50 text-brand before:absolute before:left-0 before:top-0 before:h-full before:w-1 before:rounded-r before:bg-brand" : "text-ink hover:bg-slate-50"}`
            }
          >
            <Icon className="shrink-0 text-xl" />
            {isExpanded && <span className="truncate">{label}</span>}
          </NavLink>
        ))}
      </nav>
      <div
        className={`mx-6 mb-6 flex items-center border-t border-slate-200 pt-6 text-left ${isExpanded ? "gap-4" : "justify-center"}`}
      >
        <div className="grid h-12 w-12 shrink-0 place-items-center rounded-full bg-blue-100 font-bold text-ink">
          {initials(displayUser.name)}
        </div>
        {isExpanded && (
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-bold text-ink">
              {displayUser.name}
            </p>
            <p className="mt-1 text-xs font-semibold capitalize text-muted">
              {displayUser.role}
            </p>
          </div>
        )}
      </div>
    </>
  );

  return (
    <div className="min-h-screen bg-[#f8fbff] lg:flex">
      {/* Desktop sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-30 hidden border-r border-slate-200 bg-white transition-all duration-300 lg:flex lg:flex-col ${desktopSidebarExpanded ? "w-[290px]" : "w-[90px]"}`}
      >
        {renderSidebarContent(desktopSidebarExpanded, false)}
      </aside>

      {/* Mobile sidebar overlay & drawer */}
      <div
        className={`fixed inset-0 z-40 lg:hidden transition-opacity duration-300 ${sidebarOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"}`}
      >
        <div
          className="absolute inset-0 bg-slate-950/50"
          onClick={closeSidebar}
        />
        <aside
          ref={mobileSidebarRef}
          className={`relative z-50 flex h-full w-[290px] flex-col bg-white shadow-2xl transition-transform duration-300 ease-in-out ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}`}
        >
          <button
            onClick={closeSidebar}
            className="absolute right-4 top-4 z-10 rounded-md p-2 text-2xl text-ink hover:bg-slate-100"
            aria-label="Close sidebar"
          >
            <FiX />
          </button>
          {renderSidebarContent(true, true)}
        </aside>
      </div>

      <div
        className={`min-w-0 flex-1 transition-all duration-300 ${desktopSidebarExpanded ? "lg:pl-[290px]" : "lg:pl-[90px]"}`}
      >
        <header className="sticky top-0 z-20 flex h-[92px] items-center justify-between border-b border-slate-200 bg-white/95 px-5 backdrop-blur lg:px-10">
          <button
            ref={menuBtnRef}
            onClick={() => setSidebarOpen(true)}
            className="text-3xl text-ink lg:hidden"
            aria-label="Open sidebar"
          >
            <FiMenu />
          </button>
          <div className="hidden lg:block" />
          <div className="flex min-w-0 items-center gap-4">

            <button
              onClick={handleLogout}
              className="btn-secondary flex items-center gap-2 text-red-500 hover:bg-red-50 hover:text-red-600 transition px-4 py-2.5"
            >
              <FiLogOut className="text-lg" />
              <span className="font-semibold text-sm">Logout</span>
            </button>
          </div>
        </header>
        <main className={`min-w-0 overflow-x-hidden ${location.pathname === "/admin/chat" || location.pathname === "/admin/chat/" ? "p-0" : "p-5 lg:p-10"}`}>
          <AnimatePresence mode="wait">
            <motion.div
              key={location.pathname}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2 }}
            >
              <Outlet />
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
}
