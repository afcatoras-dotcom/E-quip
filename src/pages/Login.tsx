import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabase";
import { Mail, Lock, Eye, EyeOff, AlertCircle, Cpu } from "lucide-react";

export default function Login() {
  const navigate = useNavigate();

  const passwordRef = useRef<HTMLInputElement>(null);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  // These are real seeded accounts, not throwaway demo logins — clicking
  // one only autofills the email so the password still has to be typed.
  const demoAccounts = [
    { email: "afcatoras@fit.edu.ph", role: "Admin" },
    { email: "djbancoro@fit.edu.ph", role: "Laboratory Technician" },
    { email: "mjesquivel@fit.edu.ph", role: "Faculty" },
    { email: "dmsoria@fit.edu.ph", role: "Student" },
  ];

  function fillDemoAccount(demoEmail: string) {
    setEmail(demoEmail);
    setErrorMessage("");
    passwordRef.current?.focus();
  }

  async function handleLogin() {
    setErrorMessage("");

    if (!email || !password) {
      setErrorMessage("Please enter both email and password.");
      return;
    }

    setLoading(true);

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setLoading(false);
      setErrorMessage(error.message);
      return;
    }

    // Role, full name, department, and student/employee ID live in the
    // "profiles" table, keyed by the Supabase Auth user id.
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("full_name, role, department, student_employee_id")
      .eq("id", data.user?.id)
      .single();

    setLoading(false);

    if (profileError || !profile) {
      console.error("Profile lookup failed:", profileError);

      setErrorMessage(
        profileError
          ? `Profile lookup error: ${profileError.message}`
          : "Login succeeded but no profile row was returned for this account."
      );
      return;
    }

    localStorage.setItem(
      "user",
      JSON.stringify({
        id: data.user?.id,
        email: data.user?.email,
        full_name: profile.full_name,
        role: profile.role,
        department: profile.department,
        student_employee_id: profile.student_employee_id,
      })
    );

    navigate("/dashboard");
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter") {
      handleLogin();
    }
  }

  return (
    <div className="min-h-screen flex bg-white">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@500;600;700&display=swap');

        .equip-display {
          font-family: 'Space Grotesk', ui-sans-serif, system-ui, sans-serif;
        }

        @keyframes equip-fade-up {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }

        .equip-card {
          animation: equip-fade-up 0.5s ease-out;
        }

        @media (prefers-reduced-motion: reduce) {
          .equip-card {
            animation: none;
          }
        }
      `}</style>

      {/* Left panel — brand + value proposition */}
      <div className="hidden lg:flex lg:w-1/2 relative bg-gradient-to-br from-slate-950 via-slate-900 to-emerald-950 flex-col justify-between p-14 overflow-hidden">

        {/* Ambient gradient glow */}
        <div className="absolute -top-32 -left-20 w-[28rem] h-[28rem] bg-emerald-500 rounded-full blur-[100px] opacity-25" />
        <div className="absolute bottom-0 right-0 w-72 h-72 bg-emerald-400 rounded-full blur-[110px] opacity-10" />

        <div className="relative z-10">

          <div className="flex items-center gap-3 mb-8">
            <div className="bg-gradient-to-br from-emerald-400 to-emerald-600 w-11 h-11 rounded-xl flex items-center justify-center shadow-lg shadow-emerald-900/40">
              <Cpu size={22} className="text-white" />
            </div>

            <p className="text-emerald-400 text-[11px] font-semibold tracking-[0.2em]">
              MONITOR &middot; MANAGE &middot; MAINTAIN
            </p>
          </div>

          <h1 className="equip-display text-white text-6xl font-bold leading-none">
            E-quip
          </h1>

          <h2 className="equip-display text-slate-200 text-3xl font-semibold leading-snug max-w-lg mt-6">
            Smart Equipment Management for{" "}
            <span className="bg-gradient-to-r from-emerald-400 to-emerald-300 bg-clip-text text-transparent">
              Engineering Labs.
            </span>
          </h2>

          <p className="text-slate-400 mt-6 max-w-md leading-relaxed">
            The all-in-one platform for tracking, borrowing, and
            maintaining laboratory equipment in the Computer Engineering
            and EE / ECE laboratories.
          </p>

        </div>

        <p className="relative z-10 text-slate-600 text-xs">
          &copy; 2026 E-quip &middot; Computer Engineering &amp; EE/ECE Laboratory
        </p>

      </div>

      {/* Right panel — sign in form */}
      <div className="flex-1 flex items-center justify-center p-6 bg-slate-50">

        <div className="equip-card w-full max-w-sm">

          <div className="lg:hidden flex items-center gap-3 justify-center mb-8">
            <div className="bg-gradient-to-br from-emerald-400 to-emerald-600 w-10 h-10 rounded-xl flex items-center justify-center">
              <Cpu size={20} className="text-white" />
            </div>
            <p className="equip-display text-emerald-700 text-2xl font-semibold">
              E-quip
            </p>
          </div>

          <div className="mb-8">
            <h2 className="text-2xl font-semibold text-slate-800">
              Welcome back
            </h2>

            <p className="text-slate-500 text-sm mt-1">
              Sign in to your E-quip account to continue.
            </p>
          </div>

          {errorMessage && (
            <div className="flex items-start gap-2 bg-rose-50 border border-rose-200 text-rose-700 text-sm rounded-lg p-3 mb-5">
              <AlertCircle size={16} className="mt-0.5 flex-shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          <div className="space-y-4">

            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5">
                Email Address
              </label>

              <div className="relative">
                <Mail
                  size={18}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                />

                <input
                  type="email"
                  placeholder="your.email@fit.edu.ph"
                  className="w-full border border-slate-200 rounded-lg pl-10 pr-3 py-2.5 bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 disabled:bg-slate-50 disabled:text-slate-400"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  onKeyDown={handleKeyDown}
                  disabled={loading}
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5">
                Password
              </label>

              <div className="relative">
                <Lock
                  size={18}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                />

                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  ref={passwordRef}
                  className="w-full border border-slate-200 rounded-lg pl-10 pr-10 py-2.5 bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 disabled:bg-slate-50 disabled:text-slate-400"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onKeyDown={handleKeyDown}
                  disabled={loading}
                />

                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

          </div>

          <button
            onClick={handleLogin}
            disabled={loading}
            className="w-full mt-6 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white font-medium p-2.5 rounded-lg hover:from-emerald-600 hover:to-emerald-700 transition disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-md shadow-emerald-900/10"
          >
            {loading && (
              <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
            )}
            {loading ? "Signing in..." : "Sign In"}
          </button>

          <p className="text-center text-xs text-slate-400 mt-8 mb-6">
            Campus Laboratory Equipment Monitoring System
          </p>

          <div className="bg-slate-50 border border-slate-200 rounded-xl p-4">

            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1">
              Quick Sign-In
            </p>

            <p className="text-xs text-slate-400 mb-3">
              Tap an account to autofill the email, then enter its password.
            </p>

            <div className="space-y-1">
              {demoAccounts.map((acc) => (
                <button
                  key={acc.email}
                  type="button"
                  onClick={() => fillDemoAccount(acc.email)}
                  className="w-full flex items-center justify-between px-3 py-2 rounded-lg hover:bg-white hover:shadow-sm transition text-left"
                >
                  <span className="text-sm text-slate-700">
                    {acc.email}
                  </span>

                  <span className="text-xs font-medium text-emerald-600">
                    {acc.role}
                  </span>
                </button>
              ))}
            </div>

          </div>

        </div>

      </div>

    </div>
  );
}