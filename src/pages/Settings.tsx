export default function Settings() {
  return (
    <div>

      <h1 className="text-4xl font-bold mb-8">
        Settings
      </h1>

      <div className="bg-white rounded-xl shadow p-8 space-y-6">

        <div>

          <label className="block font-semibold mb-2">
            System Name
          </label>

          <input
            className="border rounded-lg p-3 w-full"
            defaultValue="E-quip Laboratory Monitoring System"
          />

        </div>

        <div>

          <label className="block font-semibold mb-2">
            Administrator Email
          </label>

          <input
            className="border rounded-lg p-3 w-full"
            defaultValue="admin@feutech.edu.ph"
          />

        </div>

        <div>

          <label className="block font-semibold mb-2">
            Default Laboratory
          </label>

          <select className="border rounded-lg p-3 w-full">
            <option>All</option>
            <option>CPE</option>
            <option>EE/ECE</option>
          </select>

        </div>

        <button className="bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-3 rounded-lg">
          Save Changes
        </button>

      </div>

    </div>
  );
}