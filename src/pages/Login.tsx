export default function Login() {
  return (
    <div className="min-h-screen bg-slate-100 flex items-center justify-center">
      <div className="bg-white p-8 rounded-xl shadow-md w-96">
        <h1 className="text-2xl font-bold text-center text-emerald-600 mb-6">
          E-quip Login
        </h1>

        <input className="w-full border p-2 rounded mb-3" placeholder="Username" />
        <input className="w-full border p-2 rounded mb-4" placeholder="Password" type="password" />

        <button className="w-full bg-emerald-600 text-white p-2 rounded hover:bg-emerald-700">
          Login
        </button>
      </div>
    </div>
  );
}