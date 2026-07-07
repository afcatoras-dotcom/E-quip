import {
  Package,
  CheckCircle,
  ClipboardList,
  Wrench,
  AlertTriangle,
} from "lucide-react";

import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabase";

type EquipmentOption = {
  dbId: number;
  asset_id: string;
  name: string;
};

export default function Dashboard() {
  const navigate = useNavigate();

  const storedUser = localStorage.getItem("user");
  const currentUser = storedUser ? JSON.parse(storedUser) : null;

  // Admin and Laboratory Technician manage equipment status directly.
  // Faculty and Student instead flag a problem for staff to review —
  // this is their primary reason for visiting the system, so it leads
  // the quick actions row instead of being buried on the Equipment page.
  const isStaff =
    currentUser?.role === "Admin" ||
    currentUser?.role === "Laboratory Technician";

  const [loading, setLoading] = useState(true);

  const [totalEquipment, setTotalEquipment] = useState(0);
  const [available, setAvailable] = useState(0);
  const [borrowed, setBorrowed] = useState(0);
  const [maintenance, setMaintenance] = useState(0);

  const [cpeTotal, setCpeTotal] = useState(0);
  const [cpeAvailable, setCpeAvailable] = useState(0);
  const [cpeBorrowed, setCpeBorrowed] = useState(0);
  const [cpeMaintenance, setCpeMaintenance] = useState(0);

  const [eeTotal, setEeTotal] = useState(0);
  const [eeAvailable, setEeAvailable] = useState(0);
  const [eeBorrowed, setEeBorrowed] = useState(0);
  const [eeMaintenance, setEeMaintenance] = useState(0);

  const [recentActivity, setRecentActivity] = useState<any[]>([]);
  const [recentLoading, setRecentLoading] = useState(true);

  const [equipmentOptions, setEquipmentOptions] = useState<
    EquipmentOption[]
  >([]);
  const [showReportModal, setShowReportModal] = useState(false);
  const [reportEquipmentId, setReportEquipmentId] = useState("");
  const [concern, setConcern] = useState("");
  const [submittingReport, setSubmittingReport] = useState(false);

  async function loadDashboard() {
    setLoading(true);

    const { data, error } = await supabase
      .from("equipment")
      .select("*");

    if (error) {
      console.error(error);
      setLoading(false);
      return;
    }

    setTotalEquipment(data.length);

    setAvailable(
      data.filter((item) => item.status === "Available").length
    );

    setBorrowed(
      data.filter((item) => item.status === "Borrowed").length
    );

    setMaintenance(
      data.filter((item) => item.status === "Maintenance").length
    );

    const cpe = data.filter(
      (item) => item.laboratory === "CPE"
    );

    setCpeTotal(cpe.length);

    setCpeAvailable(
      cpe.filter(
        (item) => item.status === "Available"
      ).length
    );

    setCpeBorrowed(
      cpe.filter(
        (item) => item.status === "Borrowed"
      ).length
    );

    setCpeMaintenance(
      cpe.filter(
        (item) => item.status === "Maintenance"
      ).length
    );

    const ee = data.filter(
      (item) => item.laboratory === "EE/ECE"
    );

    setEeTotal(ee.length);

    setEeAvailable(
      ee.filter(
        (item) => item.status === "Available"
      ).length
    );

    setEeBorrowed(
      ee.filter(
        (item) => item.status === "Borrowed"
      ).length
    );

    setEeMaintenance(
      ee.filter(
        (item) => item.status === "Maintenance"
      ).length
    );

    setEquipmentOptions(
      data.map((item) => ({
        dbId: item.id,
        asset_id: item.asset_id,
        name: item.name,
      }))
    );

    setLoading(false);
  }

  async function loadRecentActivity() {
    setRecentLoading(true);

    const { data, error } = await supabase
      .from("borrowings")
      .select("*, equipment(name, asset_id)")
      .order("created_at", { ascending: false })
      .limit(5);

    if (error) {
      console.error(error);
      setRecentLoading(false);
      return;
    }

    setRecentActivity(data || []);
    setRecentLoading(false);
  }

  useEffect(() => {
    loadDashboard();
    loadRecentActivity();
  }, []);

  async function submitReport() {
    if (!reportEquipmentId) {
      alert("Please select the equipment you're reporting.");
      return;
    }

    if (!concern.trim()) {
      alert("Please describe the issue before submitting.");
      return;
    }

    if (!currentUser) {
      alert("Missing user information. Please log in again.");
      return;
    }

    setSubmittingReport(true);

    const { error } = await supabase.from("damage_reports").insert([
      {
        equipment_id: Number(reportEquipmentId),
        reported_by: currentUser.id,
        reporter_name: currentUser.full_name,
        reporter_role: currentUser.role,
        concern: concern.trim(),
        status: "Pending",
      },
    ]);

    setSubmittingReport(false);

    if (error) {
      alert(error.message);
      return;
    }

    setShowReportModal(false);
    setReportEquipmentId("");
    setConcern("");
    alert("Thanks — your report has been submitted for review.");
  }

  const stats = [
    {
      title: "Total Equipment",
      value: totalEquipment,
      icon: <Package size={26} />,
      gradient: "from-blue-500 to-blue-600",
    },
    {
      title: "Available",
      value: available,
      icon: <CheckCircle size={26} />,
      gradient: "from-emerald-500 to-emerald-600",
    },
    {
      title: "Borrowed",
      value: borrowed,
      icon: <ClipboardList size={26} />,
      gradient: "from-amber-400 to-amber-500",
    },
    {
      title: "Maintenance",
      value: maintenance,
      icon: <Wrench size={26} />,
      gradient: "from-rose-500 to-rose-600",
    },
  ];

  function statusBadgeClass(status: string) {
    if (status === "Approved" || status === "Borrowed") {
      return "bg-amber-100 text-amber-700";
    }

    if (status === "Returned") {
      return "bg-emerald-100 text-emerald-700";
    }

    if (status === "Rejected") {
      return "bg-rose-100 text-rose-700";
    }

    return "bg-gray-100 text-gray-700";
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-slate-800">
          Dashboard
        </h1>

        <p className="text-gray-500 mt-2">
          Monitor laboratory equipment, borrowing activities, and maintenance records.
        </p>
      </div>

      <div
        className={`grid gap-5 mb-8 ${isStaff ? "md:grid-cols-4" : "md:grid-cols-3"}`}
      >

        {!isStaff && (
          <button
            onClick={() => setShowReportModal(true)}
            className="bg-gradient-to-br from-amber-500 to-orange-600 text-white p-5 rounded-xl hover:from-amber-600 hover:to-orange-700 transition shadow-md flex items-center justify-center gap-2"
          >
            <AlertTriangle size={18} />
            Report Damaged Equipment
          </button>
        )}

        {isStaff && (
          <button
            onClick={() => navigate("/equipment")}
            className="bg-gradient-to-br from-emerald-500 to-emerald-600 text-white p-5 rounded-xl hover:from-emerald-600 hover:to-emerald-700 transition shadow-md"
          >
            + Add Equipment
          </button>
        )}

        <button
          onClick={() => navigate("/borrowing")}
          className="bg-gradient-to-br from-blue-500 to-blue-600 text-white p-5 rounded-xl hover:from-blue-600 hover:to-blue-700 transition shadow-md"
        >
          + Borrow Equipment
        </button>

        <button
          onClick={() => navigate("/returns")}
          className="bg-gradient-to-br from-amber-400 to-amber-500 text-white p-5 rounded-xl hover:from-amber-500 hover:to-amber-600 transition shadow-md"
        >
          + Return Equipment
        </button>

        {isStaff && (
          <button
            onClick={() => navigate("/maintenance")}
            className="bg-gradient-to-br from-rose-500 to-rose-600 text-white p-5 rounded-xl hover:from-rose-600 hover:to-rose-700 transition shadow-md"
          >
            + Maintenance
          </button>
        )}

      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
        {stats.map((item) => (
          <div
            key={item.title}
            className="bg-white rounded-2xl shadow p-6 flex justify-between items-center"
          >
            <div>
              <p className="text-gray-500">
                {item.title}
              </p>

              <h2 className="text-4xl font-bold mt-3">
                {loading ? "..." : item.value}
              </h2>
            </div>

            <div
              className={`bg-gradient-to-br ${item.gradient} p-4 rounded-xl text-white shadow-md`}
            >
              {item.icon}
            </div>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-6 mt-8">

        <div className="bg-white rounded-2xl shadow p-6">

          <h2 className="text-2xl font-bold mb-4">
            Computer Engineering Laboratory
          </h2>

          <div className="space-y-3">

            <div className="flex justify-between">
              <span>Total Equipment</span>
              <span className="font-semibold">{loading ? "..." : cpeTotal}</span>
            </div>

            <div className="flex justify-between">
              <span>Available</span>
              <span className="text-emerald-600 font-semibold">
                {loading ? "..." : cpeAvailable}
              </span>
            </div>

            <div className="flex justify-between">
              <span>Borrowed</span>
              <span className="text-amber-600 font-semibold">
                {loading ? "..." : cpeBorrowed}
              </span>
            </div>

            <div className="flex justify-between">
              <span>Maintenance</span>
              <span className="text-rose-600 font-semibold">
                {loading ? "..." : cpeMaintenance}
              </span>
            </div>

          </div>

        </div>

        <div className="bg-white rounded-2xl shadow p-6">

          <h2 className="text-2xl font-bold mb-4">
            EE / ECE Laboratory
          </h2>

          <div className="space-y-3">

            <div className="flex justify-between">
              <span>Total Equipment</span>
              <span className="font-semibold">{loading ? "..." : eeTotal}</span>
            </div>

            <div className="flex justify-between">
              <span>Available</span>
              <span className="text-emerald-600 font-semibold">
                {loading ? "..." : eeAvailable}
              </span>
            </div>

            <div className="flex justify-between">
              <span>Borrowed</span>
              <span className="text-amber-600 font-semibold">
                {loading ? "..." : eeBorrowed}
              </span>
            </div>

            <div className="flex justify-between">
              <span>Maintenance</span>
              <span className="text-rose-600 font-semibold">
                {loading ? "..." : eeMaintenance}
              </span>
            </div>

          </div>

        </div>

      </div>

      <div className="bg-white rounded-2xl shadow mt-8 p-6">

        <h2 className="text-2xl font-bold mb-4">
          Recent Borrowing Activity
        </h2>

        {recentLoading ? (
          <div className="text-gray-500 text-center py-10">
            Loading recent activity...
          </div>
        ) : recentActivity.length === 0 ? (
          <div className="text-gray-500 text-center py-10">
            No borrowing records yet.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="text-gray-500 border-b">
                  <th className="pb-2 pr-4">Student</th>
                  <th className="pb-2 pr-4">Equipment</th>
                  <th className="pb-2 pr-4">Qty</th>
                  <th className="pb-2 pr-4">Borrow Date</th>
                  <th className="pb-2">Status</th>
                </tr>
              </thead>

              <tbody>
                {recentActivity.map((item) => (
                  <tr key={item.id} className="border-b last:border-0">
                    <td className="py-3 pr-4">
                      {item.student_name}
                    </td>

                    <td className="py-3 pr-4">
                      {item.equipment?.name || "Unknown Item"}
                    </td>

                    <td className="py-3 pr-4">
                      {item.quantity}
                    </td>

                    <td className="py-3 pr-4">
                      {item.borrow_date}
                    </td>

                    <td className="py-3">
                      <span
                        className={`px-3 py-1 rounded-full text-sm font-semibold ${statusBadgeClass(item.status)}`}
                      >
                        {item.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

      </div>

      {/* Report Damaged Equipment Modal */}

      {showReportModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">

          <div className="bg-white rounded-xl shadow-xl w-full max-w-lg p-6">

            <h2 className="text-2xl font-bold mb-2">
              Report Damaged Equipment
            </h2>

            <p className="text-gray-500 mb-6">
              Let lab staff know something needs attention.
            </p>

            <label className="block text-sm font-medium text-gray-600 mb-1.5">
              Equipment
            </label>

            <select
              className="w-full border rounded-lg p-3 mb-4"
              value={reportEquipmentId}
              onChange={(e) => setReportEquipmentId(e.target.value)}
              disabled={submittingReport}
            >
              <option value="">Select equipment</option>

              {equipmentOptions.map((item) => (
                <option key={item.dbId} value={item.dbId}>
                  {item.asset_id} - {item.name}
                </option>
              ))}
            </select>

            <label className="block text-sm font-medium text-gray-600 mb-1.5">
              Describe the issue
            </label>

            <textarea
              rows={4}
              placeholder="e.g. Screen doesn't turn on, missing a cable, cracked casing..."
              value={concern}
              onChange={(e) => setConcern(e.target.value)}
              className="w-full border rounded-lg p-3"
              disabled={submittingReport}
            />

            <div className="flex justify-end gap-3 mt-6">

              <button
                onClick={() => {
                  setShowReportModal(false);
                  setReportEquipmentId("");
                  setConcern("");
                }}
                disabled={submittingReport}
                className="px-5 py-2 border rounded-lg hover:bg-gray-100 disabled:opacity-50"
              >
                Cancel
              </button>

              <button
                onClick={submitReport}
                disabled={submittingReport}
                className="px-5 py-2 bg-gradient-to-r from-amber-500 to-orange-600 text-white rounded-lg hover:from-amber-600 hover:to-orange-700 disabled:opacity-50"
              >
                {submittingReport ? "Submitting..." : "Submit Report"}
              </button>

            </div>

          </div>

        </div>
      )}

    </div>
  );
}