import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";

type ReturnRecord = {
  id: number;
  student_name: string;
  student_id: string;
  quantity: number;
  borrow_date: string;
  return_date: string;
  status: string;
  equipment: {
    asset_id: string;
    name: string;
    laboratory: string;
  };
};

export default function Returns() {
  const [records, setRecords] = useState<ReturnRecord[]>([]);
  const [search, setSearch] = useState("");

  async function loadReturns() {
    const { data, error } = await supabase
      .from("borrowings")
      .select(`
        *,
        equipment(
          asset_id,
          name,
          laboratory
        )
      `)
      .eq("status", "Returned")
      .order("return_date", { ascending: false });

    if (error) {
      console.error(error);
      return;
    }

    setRecords((data ?? []) as ReturnRecord[]);
  }

  useEffect(() => {
    loadReturns();
  }, []);

  const filtered = records.filter((item) =>
    item.student_name.toLowerCase().includes(search.toLowerCase()) ||
    item.student_id.toLowerCase().includes(search.toLowerCase()) ||
    item.equipment?.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div>

      <div className="mb-8">

        <h1 className="text-4xl font-bold">
          Returned Equipment
        </h1>

        <p className="text-gray-500 mt-2">
          View all completed equipment returns.
        </p>

      </div>

      <input
        type="text"
        placeholder="Search student or equipment..."
        className="border rounded-lg p-3 w-full mb-6"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />

      <div className="bg-white rounded-xl shadow overflow-hidden">

        <table className="w-full">

          <thead className="bg-slate-100">

            <tr>

              <th className="p-4 text-left">Student</th>
              <th className="p-4 text-left">Student ID</th>
              <th className="p-4 text-left">Equipment</th>
              <th className="p-4 text-left">Laboratory</th>
              <th className="p-4 text-left">Quantity</th>
              <th className="p-4 text-left">Borrow Date</th>
              <th className="p-4 text-left">Return Date</th>
              <th className="p-4 text-left">Status</th>

            </tr>

          </thead>

          <tbody>

            {filtered.length === 0 ? (

              <tr>

                <td
                  colSpan={8}
                  className="text-center py-8 text-gray-500"
                >
                  No returned equipment found.
                </td>

              </tr>

            ) : (

              filtered.map((item) => (

                <tr
                  key={item.id}
                  className="border-t hover:bg-slate-50"
                >

                  <td className="p-4">
                    {item.student_name}
                  </td>

                  <td className="p-4">
                    {item.student_id}
                  </td>

                  <td className="p-4">
                    {item.equipment?.asset_id} - {item.equipment?.name}
                  </td>

                  <td className="p-4">
                    {item.equipment?.laboratory}
                  </td>

                  <td className="p-4">
                    {item.quantity}
                  </td>

                  <td className="p-4">
                    {item.borrow_date}
                  </td>

                  <td className="p-4">
                    {item.return_date}
                  </td>

                  <td className="p-4">
                    <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-sm font-semibold">
                      Returned
                    </span>
                  </td>

                </tr>

              ))

            )}

          </tbody>

        </table>

      </div>

    </div>
  );
}