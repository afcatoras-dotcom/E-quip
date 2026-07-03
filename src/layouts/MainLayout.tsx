import { Outlet, useNavigate, useLocation } from "react-router-dom";

export default function MainLayout() {
  const navigate = useNavigate();
  const location = useLocation();

  const menu = [
  { name: "Dashboard", path: "/dashboard" },
  { name: "Equipment", path: "/equipment" },
  { name: "Borrowing", path: "/borrowing" },
];

  return (
    <div className="flex min-h-screen bg-slate-100">

      {/* Sidebar */}
      <div className="w-64 bg-white shadow-md p-4">
        <h1 className="text-2xl font-bold text-emerald-600 mb-6">
          E-quip
        </h1>

        {menu.map((item) => (
          <button
            key={item.path}
            onClick={() => navigate(item.path)}
            className={`block w-full text-left p-2 rounded mb-1 transition
              ${
                location.pathname === item.path
                  ? "bg-emerald-100 text-emerald-700 font-semibold"
                  : "hover:bg-slate-100"
              }
            `}
          >
            {item.name}
          </button>
        ))}

        <button
          onClick={() => navigate("/")}
          className="block w-full text-left p-2 rounded mt-6 text-red-500 hover:bg-red-50"
        >
          Logout
        </button>
      </div>

      {/* Main Content */}
      <div className="flex-1 p-6">
        <Outlet />
      </div>
    </div>
  );
}