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
} from "lucide-react";

export default function MainLayout() {
  const navigate = useNavigate();
  const location = useLocation();

  const storedUser = localStorage.getItem("user");
  const currentUser = storedUser ? JSON.parse(storedUser) : null;

  const today = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
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

  return (
    <div className="flex min-h-screen bg-slate-100">

      {/* Sidebar */}

      <aside className="w-72 flex-shrink-0 bg-white shadow-xl flex flex-col sticky top-0 h-screen overflow-y-auto">

        <div className="p-6 border-b">

          <h1 className="text-3xl font-bold text-emerald-600">
            E-quip
          </h1>

          <p className="text-sm text-gray-500 mt-2 leading-5">
            Campus Laboratory Equipment Monitoring System
          </p>

          <div className="mt-4 pt-4 border-t flex items-center gap-3">

            <UserCircle
              size={32}
              className="text-emerald-600 flex-shrink-0"
            />

            <div>
              <p className="font-semibold text-slate-800 leading-tight">
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
              onClick={() => navigate(item.path)}
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
            onClick={async () => {
              await supabase.auth.signOut();
              localStorage.removeItem("user");
              navigate("/");
            }}
            className="flex items-center justify-center gap-2 w-full bg-gradient-to-r from-rose-500 to-rose-600 hover:from-rose-600 hover:to-rose-700 text-white p-3 rounded-xl transition shadow-md shadow-rose-900/10"
          >
            <LogOut size={18} />
            Logout
          </button>

        </div>

      </aside>

      {/* Main Content */}

      <main className="flex-1 min-w-0 p-8">

        {/* Top Navbar */}

        <div className="bg-white rounded-xl shadow p-5 mb-6">

          <h2 className="text-2xl font-bold text-slate-800">
            {isDashboard
              ? `Welcome, ${currentUser?.full_name || "User"} 👋`
              : currentPage?.name || ""}
          </h2>

          <p className="text-gray-500">
            {today}
          </p>

        </div>

        {/* Page Content */}

        <Outlet />

      </main>

    </div>
  );
}