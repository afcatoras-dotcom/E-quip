export default function Equipment() {
  const equipment = [
    { name: "Oscilloscope", status: "Available" },
    { name: "Multimeter", status: "Borrowed" },
    { name: "Arduino Kit", status: "Maintenance" },
  ];

  return (
    <div>
      <h1 className="text-3xl font-bold text-emerald-600">
        Equipment
      </h1>

      <div className="mt-6 space-y-3">
        {equipment.map((item, i) => (
          <div key={i} className="bg-white p-4 rounded shadow flex justify-between">
            <span>{item.name}</span>
            <span className="text-sm text-gray-500">
              {item.status}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}