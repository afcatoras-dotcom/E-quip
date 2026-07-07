import { Bell, Search, UserCircle } from "lucide-react";

export default function TopNavbar() {
  const today = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  });

  return (
    <header className="bg-white shadow rounded-xl p-5 mb-6 flex justify-between items-center">
      <div>
        <h2 className="text-2xl font-bold text-slate-800">
          Welcome, Administrator 👋
        </h2>

        <p className="text-gray-500">{today}</p>
      </div>

      <div className="flex items-center gap-4">

        <div className="relative">

          <Search
            className="absolute left-3 top-3 text-gray-400"
            size={18}
          />

          <input
            type="text"
            placeholder="Search..."
            className="border rounded-lg pl-10 pr-4 py-2 w-72"
          />

        </div>

        <button className="relative">

          <Bell size={24} />

          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full px-1">
            3
          </span>

        </button>

        <UserCircle size={38} className="text-emerald-600" />

      </div>
    </header>
  );
}