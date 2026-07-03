export default function Dashboard() {
  const stats = [
    { label: "Total Equipment", value: 120 },
    { label: "Available", value: 95 },
    { label: "Borrowed", value: 18 },
    { label: "Maintenance", value: 7 },
  ];

  return (
    <div>
      <h1 className="text-3xl font-bold text-emerald-600">
        Dashboard
      </h1>

      <p className="text-gray-500 mt-1">
        Campus Laboratory Equipment Overview
      </p>

      <div className="grid grid-cols-4 gap-4 mt-6">
        {stats.map((item) => (
          <div
            key={item.label}
            className="bg-white p-4 rounded shadow"
          >
            <p className="text-gray-500 text-sm">{item.label}</p>
            <p className="text-2xl font-bold text-emerald-600">
              {item.value}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}