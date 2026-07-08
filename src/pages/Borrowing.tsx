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

type Borrowing = {
  id: number;
  student_id: string;
  student_name: string;
  course: string;
  equipment_id: number;
  quantity: number;
  borrow_date: string;
  return_date: string;
  status: string;
  equipment?: Equipment;
};

type CurrentUser = {
  id: string;
  email: string;
  full_name: string;
  role: string;
  department: string;
  student_employee_id: string;
};

export default function Borrowing() {
  const [records, setRecords] = useState<Borrowing[]>([]);
  const [equipment, setEquipment] = useState<Equipment[]>([]);
  const [showModal, setShowModal] = useState(false);

  // Student and Faculty accounts can only file a borrowing under their
  // own name/ID/department. Admin and Laboratory Technician still enter
  // these manually since they're often filing on behalf of someone else.
  const storedUser = localStorage.getItem("user");
  const currentUser: CurrentUser | null = storedUser
    ? JSON.parse(storedUser)
    : null;

  const lockIdentityFields =
    currentUser?.role === "Student" || currentUser?.role === "Faculty";

  const emptyForm = {
    student_id: "",
    student_name: "",
    course: "",
    equipment_id: "",
    quantity: 1,
    borrow_date: "",
    return_date: "",
  };

  const [formData, setFormData] = useState(emptyForm);

  async function loadEquipment() {
    const { data, error } = await supabase
      .from("equipment")
      .select("*")
      .eq("status", "Available")
      .order("asset_id");

    if (error) {
      console.error(error);
      return;
    }

    setEquipment(data || []);
  }

  async function loadBorrowings() {
    const { data, error } = await supabase
      .from("borrowings")
      .select(`
        *,
        equipment(
          id,
          asset_id,
          name,
          category,
          laboratory,
          equipment_condition,
          status
        )
      `)
      .order("created_at", { ascending: false });

    if (error) {
      console.error(error);
      return;
    }

    setRecords((data ?? []) as Borrowing[]);
  }

  useEffect(() => {
    loadEquipment();
    loadBorrowings();
  }, []);

  function badge(status: string) {
    switch (status) {
      case "Borrowed":
        return "bg-yellow-100 text-yellow-700";

      case "Returned":
        return "bg-green-100 text-green-700";

      default:
        return "bg-blue-100 text-blue-700";
    }
  }

  function openNewBorrowingModal() {
    if (lockIdentityFields && currentUser) {
      setFormData({
        ...emptyForm,
        student_id: currentUser.student_employee_id || "",
        student_name: currentUser.full_name || "",
        course: currentUser.department || "",
      });
    } else {
      setFormData(emptyForm);
    }

    setShowModal(true);
  }

  function handleBorrowDateChange(value: string) {
    // If a return date was already picked and it is now earlier
    // than the new borrow date, clear it so we never hold an
    // invalid combination in state.
    const returnIsNowInvalid =
      formData.return_date !== "" &&
      value !== "" &&
      new Date(formData.return_date) < new Date(value);

    setFormData({
      ...formData,
      borrow_date: value,
      return_date: returnIsNowInvalid ? "" : formData.return_date,
    });
  }

  async function saveBorrowing() {
    if (
      !formData.student_id ||
      !formData.student_name ||
      !formData.course ||
      !formData.equipment_id ||
      !formData.borrow_date ||
      !formData.return_date
    ) {
      alert("Please complete all fields.");
      return;
    }

    if (new Date(formData.return_date) < new Date(formData.borrow_date)) {
      alert("Return date cannot be before the borrow date.");
      return;
    }

    const { error } = await supabase
      .from("borrowings")
      .insert([
        {
          student_id: formData.student_id,
          student_name: formData.student_name,
          course: formData.course,
          equipment_id: Number(formData.equipment_id),
          quantity: formData.quantity,
          borrow_date: formData.borrow_date,
          return_date: formData.return_date,
          status: "Borrowed",
        },
      ]);

    if (error) {
      alert(error.message);
      return;
    }

    const { error: equipmentError } = await supabase
      .from("equipment")
      .update({
        status: "Borrowed",
      })
      .eq("id", Number(formData.equipment_id));

    if (equipmentError) {
      alert(equipmentError.message);
      return;
    }

    setShowModal(false);
    setFormData(emptyForm);

    await loadEquipment();
    await loadBorrowings();
  }

  async function returnEquipment(record: Borrowing) {
    const { error } = await supabase
      .from("borrowings")
      .update({
        status: "Returned",
      })
      .eq("id", record.id);

    if (error) {
      alert(error.message);
      return;
    }

    const { error: equipmentError } = await supabase
      .from("equipment")
      .update({
        status: "Available",
      })
      .eq("id", record.equipment_id);

    if (equipmentError) {
      alert(equipmentError.message);
      return;
    }

    await loadEquipment();
    await loadBorrowings();
  }

  return (
    <div>

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6 sm:mb-8">

        <div>

          <h1 className="text-2xl sm:text-4xl font-bold">
            Borrowing
          </h1>

          <p className="text-gray-500 mt-2 text-sm sm:text-base">
            Manage laboratory borrowing requests.
          </p>

        </div>

        <button
          onClick={openNewBorrowingModal}
          className="bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white px-5 py-3 rounded-lg shadow-md transition self-start sm:self-auto"
        >
          + New Borrowing
        </button>

      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">

          <div className="bg-white rounded-xl w-full max-w-2xl p-5 sm:p-6 max-h-[90vh] overflow-y-auto">

            <h2 className="text-xl sm:text-2xl font-bold mb-6">
              New Borrowing
            </h2>

            <div className="grid md:grid-cols-2 gap-4">

              <input
                type="text"
                placeholder="Student ID"
                className="border rounded-lg p-3 disabled:bg-gray-100 disabled:text-gray-500"
                value={formData.student_id}
                disabled={lockIdentityFields}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    student_id: e.target.value,
                  })
                }
              />

              <input
                type="text"
                placeholder="Student Name"
                className="border rounded-lg p-3 disabled:bg-gray-100 disabled:text-gray-500"
                value={formData.student_name}
                disabled={lockIdentityFields}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    student_name: e.target.value,
                  })
                }
              />

              <input
                type="text"
                placeholder="Course"
                className="border rounded-lg p-3 disabled:bg-gray-100 disabled:text-gray-500"
                value={formData.course}
                disabled={lockIdentityFields}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    course: e.target.value,
                  })
                }
              />

              <select
                className="border rounded-lg p-3"
                value={formData.equipment_id}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    equipment_id: e.target.value,
                  })
                }
              >
                <option value="">
                  Select Equipment
                </option>

                {equipment.map((item) => (
                  <option
                    key={item.id}
                    value={item.id}
                  >
                    {item.asset_id} - {item.name}
                  </option>
                ))}
              </select>

              <input
                type="number"
                min={1}
                className="border rounded-lg p-3"
                value={formData.quantity}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    quantity: Number(e.target.value),
                  })
                }
              />

              <input
                type="date"
                className="border rounded-lg p-3"
                value={formData.borrow_date}
                onChange={(e) =>
                  handleBorrowDateChange(e.target.value)
                }
              />

              <div className="md:col-span-2">

                <input
                  type="date"
                  className="border rounded-lg p-3 w-full disabled:bg-gray-100 disabled:cursor-not-allowed"
                  value={formData.return_date}
                  min={formData.borrow_date || undefined}
                  disabled={!formData.borrow_date}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      return_date: e.target.value,
                    })
                  }
                />

                {!formData.borrow_date && (
                  <p className="text-sm text-gray-400 mt-1">
                    Select a borrow date first.
                  </p>
                )}

              </div>

            </div>

            <div className="flex flex-col-reverse sm:flex-row justify-end gap-3 mt-6">

              <button
                onClick={() => {
                  setShowModal(false);
                  setFormData(emptyForm);
                }}
                className="px-5 py-2 rounded-lg bg-gray-200 hover:bg-gray-300"
              >
                Cancel
              </button>

              <button
                onClick={saveBorrowing}
                className="px-5 py-2 rounded-lg bg-gradient-to-r from-emerald-500 to-emerald-600 text-white hover:from-emerald-600 hover:to-emerald-700 shadow-md"
              >
                Save Borrowing
              </button>

            </div>

          </div>

        </div>
      )}

      <div className="bg-white rounded-xl shadow overflow-hidden">

        <div className="overflow-x-auto">
          <table className="w-full min-w-[880px]">

            <thead className="bg-slate-100">

              <tr>

                <th className="p-4 text-left">
                  Student
                </th>

                <th className="p-4 text-left">
                  Student ID
                </th>

                <th className="p-4 text-left">
                  Equipment
                </th>

                <th className="p-4 text-left">
                  Laboratory
                </th>

                <th className="p-4 text-left">
                  Quantity
                </th>

                <th className="p-4 text-left">
                  Borrow Date
                </th>

                <th className="p-4 text-left">
                  Return Date
                </th>

                <th className="p-4 text-left">
                  Status
                </th>

                <th className="p-4 text-center">
                  Action
                </th>

              </tr>

            </thead>

            <tbody>


              {records.length === 0 ? (

                <tr>

                  <td
                    colSpan={9}
                    className="text-center py-10 text-gray-500"
                  >
                    No borrowing records found.
                  </td>

                </tr>

              ) : (

                records.map((record) => (

                  <tr
                    key={record.id}
                    className="border-t hover:bg-slate-50"
                  >

                    <td className="p-4">
                      {record.student_name}
                    </td>

                    <td className="p-4">
                      {record.student_id}
                    </td>

                    <td className="p-4">
                      {record.equipment?.asset_id} - {record.equipment?.name}
                    </td>

                    <td className="p-4">
                      {record.equipment?.laboratory}
                    </td>

                    <td className="p-4">
                      {record.quantity}
                    </td>

                    <td className="p-4">
                      {record.borrow_date}
                    </td>

                    <td className="p-4">
                      {record.return_date}
                    </td>

                    <td className="p-4">

                      <span
                        className={`px-3 py-1 rounded-full text-sm font-semibold ${badge(record.status)}`}
                      >
                        {record.status}
                      </span>

                    </td>

                    <td className="p-4 text-center whitespace-nowrap">

                      {record.status === "Borrowed" ? (

                        <button
                          onClick={() => returnEquipment(record)}
                          className="bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white px-4 py-2 rounded-lg shadow-md"
                        >
                          Return
                        </button>

                      ) : (

                        <span className="text-green-600 font-semibold">
                          Completed
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
    </div>
  );
}