import { useState } from "react";
import { Outlet, useNavigate, useLocation } from "react-router-dom";
import { supabase } from "../lib/supabase";

import {
  LayoutDashboard,
  Package,
  ClipboardList,
  Undo2,
  Wrench,
  FileBarChart2,
  LogOut,
  UserCircle,
  Menu,
  X,
} from "lucide-react";

export default function MainLayout() {
  const navigate = useNavigate();
  const location = useLocation();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const storedUser = localStorage.getItem("user");
  const currentUser = storedUser ? JSON.parse(storedUser) : null;

  const today = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  });

  // Shorter date for narrow screens so the top bar never wraps awkwardly.
  const todayShort = new Date().toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

  const menu = [
    {
      name: "Dashboard",
      path: "/dashboard",
      icon: <LayoutDashboard size={20} />,
      roles: ["Admin", "Laboratory Technician", "Faculty", "Student"],
    },
    {
      name: "Equipment",
      path: "/equipment",
      icon: <Package size={20} />,
      roles: ["Admin", "Laboratory Technician", "Faculty", "Student"],
    },
    {
      name: "Borrowing",
      path: "/borrowing",
      icon: <ClipboardList size={20} />,
      roles: ["Admin", "Laboratory Technician", "Faculty", "Student"],
    },
    {
      name: "Returns",
      path: "/returns",
      icon: <Undo2 size={20} />,
      roles: ["Admin", "Laboratory Technician", "Faculty", "Student"],
    },
    {
      name: "Maintenance",
      path: "/maintenance",
      icon: <Wrench size={20} />,
      roles: ["Admin", "Laboratory Technician"],
    },
    {
      name: "Reports",
      path: "/reports",
      icon: <FileBarChart2 size={20} />,
      roles: ["Admin", "Laboratory Technician"],
    },
  ];

  const visibleMenu = menu.filter((item) =>
    item.roles.includes(currentUser?.role)
  );

  const isDashboard = location.pathname === "/dashboard";

  const currentPage = menu.find(
    (item) => item.path === location.pathname
  );

  function goTo(path: string) {
    navigate(path);
    setMobileMenuOpen(false);
  }

  async function handleLogout() {
    await supabase.auth.signOut();
    localStorage.removeItem("user");
    navigate("/");
  }

  return (
    <div className="flex min-h-screen bg-slate-100">

      {/* Mobile backdrop, closes the drawer on tap */}
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar — fixed off-canvas drawer on mobile, sticky column on desktop */}
      <aside
        className={`w-72 flex-shrink-0 bg-white shadow-xl flex flex-col fixed lg:sticky top-0 h-screen overflow-y-auto z-50
          transition-transform duration-300 ease-in-out
          ${mobileMenuOpen ? "translate-x-0" : "-translate-x-full"} lg:translate-x-0`}
      >

        <div className="p-6 border-b flex items-start justify-between gap-2">

          <div className="min-w-0">
            <h1 className="text-3xl font-bold text-emerald-600">
              E-quip
            </h1>

            <p className="text-sm text-gray-500 mt-2 leading-5">
              Campus Laboratory Equipment Monitoring System
            </p>
          </div>

          <button
            onClick={() => setMobileMenuOpen(false)}
            className="lg:hidden flex-shrink-0 -mr-2 -mt-1 p-2 text-slate-400 hover:text-slate-600"
            aria-label="Close menu"
          >
            <X size={22} />
          </button>

        </div>

        <div className="px-6 pt-4 border-b pb-4">
          <div className="flex items-center gap-3">

            <UserCircle
              size={32}
              className="text-emerald-600 flex-shrink-0"
            />

            <div className="min-w-0">
              <p className="font-semibold text-slate-800 leading-tight truncate">
                {currentUser?.full_name || "User"}
              </p>

              <p className="text-xs text-gray-500">
                {currentUser?.role || ""}
              </p>
            </div>

          </div>
        </div>

        <nav className="flex-1 p-4">

          {visibleMenu.map((item) => (

            <button
              key={item.path}
              onClick={() => goTo(item.path)}
              className={`flex items-center gap-3 w-full p-3 rounded-xl mb-2 transition-all duration-200
                ${
                  location.pathname === item.path
                    ? "bg-gradient-to-r from-emerald-500 to-emerald-600 text-white shadow-md shadow-emerald-900/10"
                    : "hover:bg-slate-100 text-slate-700"
                }`}
            >
              {item.icon}

              <span>{item.name}</span>

            </button>

          ))}

        </nav>

        <div className="p-4 border-t">

          <button
            onClick={handleLogout}
            className="flex items-center justify-center gap-2 w-full bg-gradient-to-r from-rose-500 to-rose-600 hover:from-rose-600 hover:to-rose-700 text-white p-3 rounded-xl transition shadow-md shadow-rose-900/10"
          >
            <LogOut size={18} />
            Logout
          </button>

        </div>

      </aside>

      {/* Main Content */}
      <main className="flex-1 min-w-0 p-4 sm:p-6 lg:p-8">

        {/* Top Navbar */}
        <div className="bg-white rounded-xl shadow p-4 sm:p-5 mb-6 flex items-center gap-3">

          <button
            onClick={() => setMobileMenuOpen(true)}
            className="lg:hidden flex-shrink-0 p-2 -ml-2 rounded-lg text-slate-500 hover:text-slate-700 hover:bg-slate-100"
            aria-label="Open menu"
          >
            <Menu size={22} />
          </button>

          <div className="min-w-0">
            <h2 className="text-lg sm:text-2xl font-bold text-slate-800 truncate">
              {isDashboard
                ? `Welcome, ${currentUser?.full_name || "User"} 👋`
                : currentPage?.name || ""}
            </h2>

            <p className="text-gray-500 text-xs sm:text-sm">
              <span className="hidden sm:inline">{today}</span>
              <span className="sm:hidden">{todayShort}</span>
            </p>
          </div>

        </div>

        {/* Page Content */}
        <Outlet />

      </main>

    </div>
  );
}