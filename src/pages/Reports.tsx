import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  CartesianGrid,
  XAxis,
  YAxis,
} from "recharts";

export default function Reports() {
  const [summary, setSummary] = useState({
    total: 0,
    available: 0,
    borrowed: 0,
    maintenance: 0,
    returned: 0,
  });

  useEffect(() => {
    loadReports();
  }, []);

  async function loadReports() {
    const { data: equipment } = await supabase
      .from("equipment")
      .select("*");

    const { data: borrowings } = await supabase
      .from("borrowings")
      .select("*");

    if (!equipment || !borrowings) return;

    setSummary({
      total: equipment.length,
      available: equipment.filter(e => e.status === "Available").length,
      borrowed: equipment.filter(e => e.status === "Borrowed").length,
      maintenance: equipment.filter(e => e.status === "Maintenance").length,
      returned: borrowings.filter(b => b.status === "Returned").length,
    });
  }

  const pieData = [
    { name: "Available", value: summary.available },
    { name: "Borrowed", value: summary.borrowed },
    { name: "Maintenance", value: summary.maintenance },
  ];

  const barData = [
    { name: "Equipment", value: summary.total },
    { name: "Returned", value: summary.returned },
  ];

  const colors = ["#10B981", "#F59E0B", "#EF4444"];

  return (
    <div>

      <div className="mb-6 sm:mb-8">

        <h1 className="text-2xl sm:text-4xl font-bold">
          Reports
        </h1>

        <p className="text-gray-500 mt-2 text-sm sm:text-base">
          Equipment statistics and analytics.
        </p>

      </div>

      <div className="grid grid-cols-2 md:grid-cols-5 gap-3 sm:gap-4 mb-8">

        <div className="bg-white rounded-xl shadow p-4 sm:p-5">
          <p className="text-gray-500 text-xs sm:text-base">Total Equipment</p>
          <h2 className="text-2xl sm:text-3xl font-bold">{summary.total}</h2>
        </div>

        <div className="bg-white rounded-xl shadow p-4 sm:p-5">
          <p className="text-gray-500 text-xs sm:text-base">Available</p>
          <h2 className="text-2xl sm:text-3xl font-bold text-green-600">
            {summary.available}
          </h2>
        </div>

        <div className="bg-white rounded-xl shadow p-4 sm:p-5">
          <p className="text-gray-500 text-xs sm:text-base">Borrowed</p>
          <h2 className="text-2xl sm:text-3xl font-bold text-yellow-500">
            {summary.borrowed}
          </h2>
        </div>

        <div className="bg-white rounded-xl shadow p-4 sm:p-5">
          <p className="text-gray-500 text-xs sm:text-base">Maintenance</p>
          <h2 className="text-2xl sm:text-3xl font-bold text-red-500">
            {summary.maintenance}
          </h2>
        </div>

        <div className="bg-white rounded-xl shadow p-4 sm:p-5 col-span-2 sm:col-span-1">
          <p className="text-gray-500 text-xs sm:text-base">Returned</p>
          <h2 className="text-2xl sm:text-3xl font-bold text-blue-600">
            {summary.returned}
          </h2>
        </div>

      </div>

      <div className="grid lg:grid-cols-2 gap-6">

        <div className="bg-white rounded-xl shadow p-4 sm:p-6">

          <h2 className="text-lg sm:text-xl font-bold mb-4">
            Equipment Status
          </h2>

          <ResponsiveContainer width="100%" height={280}>
            <PieChart>

              <Pie
                data={pieData}
                dataKey="value"
                nameKey="name"
                outerRadius={90}
                label
              >
                {pieData.map((_, index) => (
                  <Cell
                    key={index}
                    fill={colors[index % colors.length]}
                  />
                ))}
              </Pie>

              <Tooltip />

            </PieChart>
          </ResponsiveContainer>

        </div>

        <div className="bg-white rounded-xl shadow p-4 sm:p-6">

          <h2 className="text-lg sm:text-xl font-bold mb-4">
            Inventory Overview
          </h2>

          <ResponsiveContainer width="100%" height={280}>

            <BarChart data={barData}>

              <CartesianGrid strokeDasharray="3 3" />

              <XAxis dataKey="name" />

              <YAxis />

              <Tooltip />

              <Bar dataKey="value" fill="#10B981" />

            </BarChart>

          </ResponsiveContainer>

        </div>

      </div>

    </div>
  );
}