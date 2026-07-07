import { useState } from "react";

type User = {
  id: number;
  name: string;
  email: string;
  role: string;
  laboratory: string;
};

export default function Users() {
  const [users] = useState<User[]>([
    {
      id: 1,
      name: "Admin",
      email: "admin@feutech.edu.ph",
      role: "Administrator",
      laboratory: "All",
    },
    {
      id: 2,
      name: "Juan Dela Cruz",
      email: "juan@feutech.edu.ph",
      role: "Laboratory Custodian",
      laboratory: "CPE",
    },
    {
      id: 3,
      name: "Maria Santos",
      email: "maria@feutech.edu.ph",
      role: "Laboratory Custodian",
      laboratory: "EE/ECE",
    },
  ]);

  return (
    <div>

      <div className="flex justify-between items-center mb-8">

        <div>
          <h1 className="text-4xl font-bold">
            Users
          </h1>

          <p className="text-gray-500 mt-2">
            Manage administrator and laboratory staff accounts.
          </p>
        </div>

        <button className="bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-3 rounded-lg">
          + Add User
        </button>

      </div>

      <div className="bg-white rounded-xl shadow overflow-hidden">

        <table className="w-full">

          <thead className="bg-slate-100">
            <tr>
              <th className="p-4 text-left">Name</th>
              <th className="p-4 text-left">Email</th>
              <th className="p-4 text-left">Role</th>
              <th className="p-4 text-left">Laboratory</th>
              <th className="p-4 text-center">Action</th>
            </tr>
          </thead>

          <tbody>

            {users.map((user) => (

              <tr
                key={user.id}
                className="border-t hover:bg-slate-50"
              >

                <td className="p-4">{user.name}</td>

                <td className="p-4">{user.email}</td>

                <td className="p-4">{user.role}</td>

                <td className="p-4">{user.laboratory}</td>

                <td className="p-4 text-center space-x-2">

                  <button className="bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700">
                    Edit
                  </button>

                  <button className="bg-red-600 text-white px-3 py-1 rounded hover:bg-red-700">
                    Delete
                  </button>

                </td>

              </tr>

            ))}

          </tbody>

        </table>

      </div>

    </div>
  );
}