import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import { Cpu, Zap, ArrowLeft } from "lucide-react";

type EquipmentItem = {
  id: string; // This maps to asset_id in Supabase
  dbId: number; // This maps to the primary key id
  name: string;
  category: string;
  laboratory: string;
  condition: string;
  status: string;
};

export default function Equipment() {
  const [equipment, setEquipment] = useState<EquipmentItem[]>([]);

  // Access Control Layer
  const storedUser = localStorage.getItem("user");
  const currentUser = storedUser ? JSON.parse(storedUser) : null;
  const canManageEquipment =
    currentUser?.role === "Admin" || currentUser?.role === "Laboratory Technician";

  const canReport =
    currentUser?.role === "Student" || currentUser?.role === "Faculty";

  const emptyEquipment: EquipmentItem = {
    id: "",
    dbId: 0,
    name: "",
    category: "",
    laboratory: "CPE",
    condition: "Good",
    status: "Available",
  };

  const [search, setSearch] = useState("");
  const [selectedLab, setSelectedLab] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [formData, setFormData] = useState<EquipmentItem>(emptyEquipment);

  const [showReportModal, setShowReportModal] = useState(false);
  const [reportTarget, setReportTarget] = useState<EquipmentItem | null>(null);
  const [concern, setConcern] = useState("");
  const [submittingReport, setSubmittingReport] = useState(false);

  async function fetchEquipment() {
    const { data, error } = await supabase
      .from("equipment")
      .select("*")
      .order("id", { ascending: true });

    if (error) {
      console.error(error);
      return;
    }

    const formatted = data.map((item) => ({
      id: item.asset_id,
      dbId: item.id,
      name: item.name,
      category: item.category,
      laboratory: item.laboratory,
      condition: item.equipment_condition,
      status: item.status,
    }));

    setEquipment(formatted);
  }

  useEffect(() => {
    fetchEquipment();
  }, []);

  const filtered = equipment.filter((item) => {
    const matchSearch =
      item.name.toLowerCase().includes(search.toLowerCase()) ||
      item.id.toLowerCase().includes(search.toLowerCase());

    const matchLab = item.laboratory === selectedLab;
    return matchSearch && matchLab;
  });

  const cpeCount = equipment.filter((e) => e.laboratory === "CPE").length;
  const cpeAvailable = equipment.filter(
    (e) => e.laboratory === "CPE" && e.status === "Available"
  ).length;

  const eeCount = equipment.filter((e) => e.laboratory === "EE/ECE").length;
  const eeAvailable = equipment.filter(
    (e) => e.laboratory === "EE/ECE" && e.status === "Available"
  ).length;

  function openAdd() {
    setEditingIndex(null);
    // Automatically pre-fill the laboratory based on the lab section the user is currently viewing
    setFormData({
      ...emptyEquipment,
      laboratory: selectedLab || "CPE"
    });
    setShowForm(true);
  }

  function openEdit(index: number) {
    setEditingIndex(index);
    setFormData(equipment[index]);
    setShowForm(true);
  }

  async function deleteEquipment(index: number) {
    if (!confirm("Delete this equipment?")) return;

    const item = equipment[index];
    const { error } = await supabase
      .from("equipment")
      .delete()
      .eq("id", item.dbId);

    if (error) {
      alert(error.message);
      console.error(error);
      return;
    }

    await fetchEquipment();
  }

  function openReport(item: EquipmentItem) {
    setReportTarget(item);
    setConcern("");
    setShowReportModal(true);
  }

  async function submitReport() {
    if (!concern.trim()) {
      alert("Please describe the issue before submitting.");
      return;
    }

    if (!reportTarget || !currentUser) {
      alert("Missing equipment or user information.");
      return;
    }

    setSubmittingReport(true);

    const { error } = await supabase.from("damage_reports").insert([
      {
        equipment_id: reportTarget.dbId,
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
    setReportTarget(null);
    setConcern("");
    alert("Thanks — your report has been submitted for review.");
  }

  async function saveEquipment() {
    if (!formData.id || !formData.name || !formData.category) {
      alert("Please complete all fields.");
      return;
    }

    const payload = {
      asset_id: formData.id,
      name: formData.name,
      category: formData.category,
      laboratory: formData.laboratory, // Kept in background payload context
      equipment_condition: formData.condition,
      status: formData.status,
    };

    if (editingIndex !== null) {
      const item = equipment[editingIndex];
      const { error } = await supabase
        .from("equipment")
        .update(payload)
        .eq("id", item.dbId);

      if (error) {
        alert(error.message);
        return;
      }
    } else {
      const { error } = await supabase
        .from("equipment")
        .insert([payload]);

      if (error) {
        alert(error.message);
        return;
      }
    }

    await fetchEquipment();
    setShowForm(false);
    setFormData(emptyEquipment);
  }

  function badge(status: string) {
    switch (status) {
      case "Available":
        return "bg-green-100 text-green-700";
      case "Borrowed":
        return "bg-yellow-100 text-yellow-700";
      case "Maintenance":
        return "bg-red-100 text-red-700";
      default:
        return "bg-gray-100";
    }
  }

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6 sm:mb-8">
        <div>
          <h1 className="text-2xl sm:text-4xl font-bold">Equipment Management</h1>
          <p className="text-gray-500 mt-2 text-sm sm:text-base">Laboratory</p>
        </div>
        {canManageEquipment && selectedLab && (
          <button
            onClick={openAdd}
            className="bg-gradient-to-r from-emerald-500 to-emerald-600 text-white px-5 py-3 rounded-lg hover:from-emerald-600 hover:to-emerald-700 shadow-md transition self-start sm:self-auto"
          >
            + Add Equipment
          </button>
        )}
      </div>

      {selectedLab === null ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <button
            onClick={() => setSelectedLab("CPE")}
            className="bg-white rounded-2xl shadow p-6 sm:p-8 text-left hover:shadow-lg hover:-translate-y-0.5 transition-all"
          >
            <div className="bg-emerald-100 text-emerald-600 w-14 h-14 rounded-xl flex items-center justify-center mb-5">
              <Cpu size={28} />
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-slate-800">CpE Laboratory</h2>
            <p className="text-gray-500 mt-2">Computer Engineering</p>
            <div className="flex gap-6 mt-6">
              <div>
                <p className="text-2xl sm:text-3xl font-bold">{cpeCount}</p>
                <p className="text-gray-500 text-sm">Total Items</p>
              </div>
              <div>
                <p className="text-2xl sm:text-3xl font-bold text-green-600">{cpeAvailable}</p>
                <p className="text-gray-500 text-sm">Available</p>
              </div>
            </div>
          </button>

          <button
            onClick={() => setSelectedLab("EE/ECE")}
            className="bg-white rounded-2xl shadow p-6 sm:p-8 text-left hover:shadow-lg hover:-translate-y-0.5 transition-all"
          >
            <div className="bg-blue-100 text-blue-600 w-14 h-14 rounded-xl flex items-center justify-center mb-5">
              <Zap size={28} />
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-slate-800">EE / ECE Laboratory</h2>
            <p className="text-gray-500 mt-2">Electrical / Electronics Engineering</p>
            <div className="flex gap-6 mt-6">
              <div>
                <p className="text-2xl sm:text-3xl font-bold">{eeCount}</p>
                <p className="text-gray-500 text-sm">Total Items</p>
              </div>
              <div>
                <p className="text-2xl sm:text-3xl font-bold text-green-600">{eeAvailable}</p>
                <p className="text-gray-500 text-sm">Available</p>
              </div>
            </div>
          </button>
        </div>
      ) : (
        <>
          <button
            onClick={() => {
              setSelectedLab(null);
              setSearch("");
            }}
            className="flex items-center gap-2 text-slate-600 hover:text-slate-900 mb-4"
          >
            <ArrowLeft size={18} />
            Back to Labs
          </button>

          <div className="bg-white rounded-xl shadow p-4 sm:p-5 mb-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <h2 className="text-lg sm:text-xl font-bold text-slate-800">
                {selectedLab === "CPE" ? "CpE Laboratory" : "EE / ECE Laboratory"}
              </h2>
              <input
                className="border rounded-lg px-4 py-2 w-full sm:w-80"
                placeholder="Search Equipment..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>

          <div className="bg-white rounded-xl shadow overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[720px]">
                <thead className="bg-slate-100">
                  <tr>
                    <th className="p-4 text-left">Asset ID</th>
                    <th className="p-4 text-left">Equipment</th>
                    <th className="p-4 text-left">Category</th>
                    <th className="p-4 text-left">Laboratory</th>
                    <th className="p-4 text-left">Condition</th>
                    <th className="p-4 text-left">Status</th>
                    {(canManageEquipment || canReport) && (
                      <th className="p-4 text-center">Action</th>
                    )}
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((item) => {
                    const originalIndex = equipment.findIndex((e) => e.id === item.id);
                    return (
                      <tr key={item.id} className="border-t hover:bg-slate-50">
                        <td className="p-4">{item.id}</td>
                        <td className="p-4 font-medium">{item.name}</td>
                        <td className="p-4">{item.category}</td>
                        <td className="p-4">{item.laboratory}</td>
                        <td className="p-4">{item.condition}</td>
                        <td className="p-4">
                          <span className={`px-3 py-1 rounded-full text-sm ${badge(item.status)}`}>
                            {item.status}
                          </span>
                        </td>
                        {canManageEquipment && (
                          <td className="p-4 text-center space-x-2 whitespace-nowrap">
                            <button
                              onClick={() => openEdit(originalIndex)}
                              className="bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700 transition"
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => deleteEquipment(originalIndex)}
                              className="bg-red-600 text-white px-3 py-1 rounded hover:bg-red-700 transition"
                            >
                              Delete
                            </button>
                          </td>
                        )}
                        {canReport && (
                          <td className="p-4 text-center whitespace-nowrap">
                            <button
                              onClick={() => openReport(item)}
                              className="bg-amber-500 hover:bg-amber-600 text-white px-3 py-1 rounded transition"
                            >
                              Report Damage
                            </button>
                          </td>
                        )}
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      {/* Add/Edit Equipment Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-lg p-5 sm:p-6 max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl sm:text-2xl font-bold mb-6">
              {editingIndex === null ? "Add Equipment" : "Edit Equipment"}
            </h2>

            <div className="space-y-4">
              <input
                type="text"
                placeholder="Asset ID"
                value={formData.id}
                onChange={(e) => setFormData({ ...formData, id: e.target.value })}
                className="w-full border rounded-lg p-3"
              />
              <input
                type="text"
                placeholder="Equipment Name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full border rounded-lg p-3"
              />
              <input
                type="text"
                placeholder="Category"
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full border rounded-lg p-3"
              />

              {/* LABORATORY SELECT DROPDOWN REMOVED FROM VIEW */}

              <select
                value={formData.condition}
                onChange={(e) => setFormData({ ...formData, condition: e.target.value })}
                className="w-full border rounded-lg p-3"
              >
                <option>Good</option>
                <option>Needs Repair</option>
              </select>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                className="w-full border rounded-lg p-3"
              >
                <option>Available</option>
                <option>Borrowed</option>
                <option>Maintenance</option>
              </select>
            </div>

            <div className="flex flex-col-reverse sm:flex-row justify-end gap-3 mt-6">
              <button
                onClick={() => setShowForm(false)}
                className="px-5 py-2 border rounded-lg hover:bg-gray-100"
              >
                Cancel
              </button>
              <button
                onClick={saveEquipment}
                className="px-5 py-2 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white rounded-lg hover:from-emerald-600 hover:to-emerald-700 shadow-md"
              >
                {editingIndex === null ? "Add Equipment" : "Save Changes"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Report Damage Modal */}
      {showReportModal && reportTarget && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-lg p-5 sm:p-6 max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl sm:text-2xl font-bold mb-2">Report Damage</h2>
            <p className="text-gray-500 mb-6 text-sm sm:text-base">
              {reportTarget.id} - {reportTarget.name}
            </p>

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

            <div className="flex flex-col-reverse sm:flex-row justify-end gap-3 mt-6">
              <button
                onClick={() => {
                  setShowReportModal(false);
                  setReportTarget(null);
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
                className="px-5 py-2 bg-gradient-to-r from-amber-500 to-orange-600 text-white rounded-lg hover:from-amber-600 hover:to-orange-700 disabled:opacity-50 shadow-md"
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