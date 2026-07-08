import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";

type Equipment = {
  id: number;
  asset_id: string;
  name: string;
  category: string;
  laboratory: string;
  equipment_condition: string;
  status: string;
};

type DamageReport = {
  id: number;
  equipment_id: number;
  reporter_name: string;
  reporter_role: string;
  concern: string;
  status: string;
  created_at: string;
  equipment?: {
    asset_id: string;
    name: string;
    laboratory: string;
  };
};

export default function Maintenance() {
  const [equipment, setEquipment] = useState<Equipment[]>([]);
  const [reports, setReports] = useState<DamageReport[]>([]);
  const [search, setSearch] = useState("");

  async function loadEquipment() {
    const { data, error } = await supabase
      .from("equipment")
      .select("*")
      .order("asset_id");

    if (error) {
      console.error(error);
      return;
    }

    setEquipment(data || []);
  }

  async function loadReports() {
    const { data, error } = await supabase
      .from("damage_reports")
      .select(`
        *,
        equipment(
          asset_id,
          name,
          laboratory
        )
      `)
      .order("created_at", { ascending: false });

    if (error) {
      console.error(error);
      return;
    }

    setReports((data ?? []) as DamageReport[]);
  }

  useEffect(() => {
    loadEquipment();
    loadReports();
  }, []);

  async function setMaintenance(id: number) {
    const { error } = await supabase
      .from("equipment")
      .update({ status: "Maintenance" })
      .eq("id", id);

    if (error) {
      alert(error.message);
      return;
    }

    loadEquipment();
  }

  async function setAvailable(id: number) {
    const { error } = await supabase
      .from("equipment")
      .update({ status: "Available" })
      .eq("id", id);

    if (error) {
      alert(error.message);
      return;
    }

    loadEquipment();
  }

  async function sendReportToMaintenance(report: DamageReport) {
    const { error: equipmentError } = await supabase
      .from("equipment")
      .update({ status: "Maintenance" })
      .eq("id", report.equipment_id);

    if (equipmentError) {
      alert(equipmentError.message);
      return;
    }

    const { error: reportError } = await supabase
      .from("damage_reports")
      .update({ status: "Reviewed" })
      .eq("id", report.id);

    if (reportError) {
      alert(reportError.message);
      return;
    }

    await loadEquipment();
    await loadReports();
  }

  async function resolveReport(report: DamageReport) {
    const { error } = await supabase
      .from("damage_reports")
      .update({ status: "Resolved" })
      .eq("id", report.id);

    if (error) {
      alert(error.message);
      return;
    }

    await loadReports();
  }

  function reportBadge(status: string) {
    switch (status) {
      case "Pending":
        return "bg-yellow-100 text-yellow-700";

      case "Reviewed":
        return "bg-blue-100 text-blue-700";

      case "Resolved":
        return "bg-green-100 text-green-700";

      default:
        return "bg-gray-100 text-gray-700";
    }
  }

  const filtered = equipment.filter((item) =>
    item.name.toLowerCase().includes(search.toLowerCase()) ||
    item.asset_id.toLowerCase().includes(search.toLowerCase()) ||
    item.laboratory.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div>

      <div className="mb-6 sm:mb-8">

        <h1 className="text-2xl sm:text-4xl font-bold">
          Maintenance
        </h1>

        <p className="text-gray-500 mt-2 text-sm sm:text-base">
          Manage equipment under maintenance.
        </p>

      </div>

      <input
        type="text"
        placeholder="Search equipment..."
        className="border rounded-lg p-3 w-full mb-6"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />

      <div className="bg-white rounded-xl shadow overflow-hidden mb-8">

        <div className="p-4 sm:p-5 border-b">
          <h2 className="text-lg sm:text-xl font-bold">
            Reported Issues
          </h2>

          <p className="text-gray-500 text-sm mt-1">
            Damage reports submitted by students and faculty.
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[880px]">

            <thead className="bg-slate-100">

              <tr>

                <th className="p-4 text-left">Equipment</th>
                <th className="p-4 text-left">Reported By</th>
                <th className="p-4 text-left">Role</th>
                <th className="p-4 text-left">Concern</th>
                <th className="p-4 text-left">Date</th>
                <th className="p-4 text-left">Status</th>
                <th className="p-4 text-center">Action</th>

              </tr>

            </thead>

            <tbody>

              {reports.length === 0 ? (

                <tr>
                  <td colSpan={7} className="text-center py-8 text-gray-500">
                    No damage reports submitted yet.
                  </td>
                </tr>

              ) : (

                reports.map((report) => (

                  <tr key={report.id} className="border-t hover:bg-slate-50">

                    <td className="p-4">
                      {report.equipment?.asset_id} - {report.equipment?.name}
                    </td>

                    <td className="p-4">
                      {report.reporter_name}
                    </td>

                    <td className="p-4">
                      {report.reporter_role}
                    </td>

                    <td className="p-4 max-w-xs">
                      {report.concern}
                    </td>

                    <td className="p-4">
                      {new Date(report.created_at).toLocaleDateString()}
                    </td>

                    <td className="p-4">
                      <span
                        className={`px-3 py-1 rounded-full text-sm font-semibold ${reportBadge(report.status)}`}
                      >
                        {report.status}
                      </span>
                    </td>

                    <td className="p-4 text-center space-x-2 whitespace-nowrap">

                      {report.status === "Pending" && (
                        <button
                          onClick={() => sendReportToMaintenance(report)}
                          className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded"
                        >
                          Send to Maintenance
                        </button>
                      )}

                      {report.status !== "Resolved" && (
                        <button
                          onClick={() => resolveReport(report)}
                          className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded"
                        >
                          Mark Resolved
                        </button>
                      )}

                      {report.status === "Resolved" && (
                        <span className="text-green-600 font-semibold">
                          Resolved
                        </span>
                      )}

                    </td>

                  </tr>

                ))

              )}

            </tbody>

          </table>
        </div>

      </div>

      <div className="bg-white rounded-xl shadow overflow-hidden">

        <div className="overflow-x-auto">
          <table className="w-full min-w-[760px]">

            <thead className="bg-slate-100">

              <tr>

                <th className="p-4 text-left">Asset ID</th>
                <th className="p-4 text-left">Equipment</th>
                <th className="p-4 text-left">Laboratory</th>
                <th className="p-4 text-left">Condition</th>
                <th className="p-4 text-left">Status</th>
                <th className="p-4 text-center">Action</th>

              </tr>

            </thead>

            <tbody>

              {filtered.map((item) => (

                <tr
                  key={item.id}
                  className="border-t hover:bg-slate-50"
                >

                  <td className="p-4">{item.asset_id}</td>
                  <td className="p-4">{item.name}</td>
                  <td className="p-4">{item.laboratory}</td>
                  <td className="p-4">{item.equipment_condition}</td>

                  <td className="p-4">

                    <span
                      className={`px-3 py-1 rounded-full text-sm font-semibold ${
                        item.status === "Maintenance"
                          ? "bg-red-100 text-red-700"
                          : "bg-green-100 text-green-700"
                      }`}
                    >
                      {item.status}
                    </span>

                  </td>

                  <td className="p-4 text-center whitespace-nowrap">

                    {item.status === "Maintenance" ? (

                      <button
                        onClick={() => setAvailable(item.id)}
                        className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded"
                      >
                        Set Available
                      </button>

                    ) : (

                      <button
                        onClick={() => setMaintenance(item.id)}
                        className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded"
                      >
                        Set Maintenance
                      </button>

                    )}

                  </td>

                </tr>

              ))}

            </tbody>

          </table>
        </div>

      </div>

    </div>
  );
}