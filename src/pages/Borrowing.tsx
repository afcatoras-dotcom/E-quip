import { useState } from "react";

export default function Borrowing() {
  const [requests, setRequests] = useState([
    {
      id: 1,
      name: "John Doe",
      item: "Oscilloscope",
      status: "Pending",
    },
    {
      id: 2,
      name: "Jane Smith",
      item: "Multimeter",
      status: "Approved",
    },
  ]);

  const updateStatus = (id: number, status: string) => {
    setRequests((prev) =>
      prev.map((req) =>
        req.id === id ? { ...req, status } : req
      )
    );
  };

  return (
    <div>
      <h1 className="text-3xl font-bold text-emerald-600">
        Borrowing Requests
      </h1>

      <div className="mt-6 space-y-3">
        {requests.map((req) => (
          <div
            key={req.id}
            className="bg-white p-4 rounded shadow flex justify-between items-center"
          >
            <div>
              <p className="font-semibold">{req.name}</p>
              <p className="text-sm text-gray-500">
                {req.item}
              </p>
            </div>

            <div className="flex gap-2 items-center">
              <span
                className={`text-sm px-2 py-1 rounded ${
                  req.status === "Approved"
                    ? "bg-green-100 text-green-700"
                    : req.status === "Pending"
                    ? "bg-yellow-100 text-yellow-700"
                    : "bg-gray-100 text-gray-600"
                }`}
              >
                {req.status}
              </span>

              <button
                onClick={() => updateStatus(req.id, "Approved")}
                className="text-sm bg-green-500 text-white px-2 py-1 rounded"
              >
                Approve
              </button>

              <button
                onClick={() => updateStatus(req.id, "Returned")}
                className="text-sm bg-gray-500 text-white px-2 py-1 rounded"
              >
                Return
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}