import { useState } from "react";
import { Eye, EyeOff, Loader2, LockKeyhole, UserRound } from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { useAuth } from "../context/AuthContext";
import { apiMessage } from "../api/client";

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [show, setShow] = useState(false);
  const [busy, setBusy] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    if (!username.trim() || !password) return toast.error("Enter username and password");
    setBusy(true);
    try {
      await login(username.trim(), password);
      toast.success("Welcome to Vela Spinners");
      navigate(location.state?.from?.pathname || "/", { replace: true });
    } catch (error) {
      toast.error(apiMessage(error, "Login failed"));
    } finally { setBusy(false); }
  };

  return (
    <div className="min-h-screen bg-slate-950 lg:grid lg:grid-cols-[1.05fr_.95fr]">
      <div className="relative hidden overflow-hidden p-12 lg:flex lg:flex-col lg:justify-between">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(99,102,241,.35),transparent_35%),radial-gradient(circle_at_bottom_right,rgba(14,165,233,.22),transparent_32%)]" />
        <div className="relative flex items-center gap-3 text-white"><div className="grid h-12 w-12 place-items-center rounded-2xl bg-white font-black text-slate-950">VS</div><div><div className="font-bold">Vela Spinners Pvt Ltd</div><div className="text-xs text-slate-400">Unified Operations Console</div></div></div>
        <div className="relative max-w-xl"><div className="mb-5 text-xs font-bold uppercase tracking-[0.25em] text-indigo-300">Factory intelligence, simplified</div><h1 className="text-5xl font-bold leading-[1.08] tracking-tight text-white">Control every unit, DC, purchase and stock movement from one workspace.</h1><p className="mt-6 text-base leading-8 text-slate-300">Designed around Vela Spinners' unit-wise workflow with Super Admin approvals, Tally invoice linking and permission-based access.</p></div>
        <div className="relative grid grid-cols-3 gap-3 text-white"><div className="rounded-3xl border border-white/10 bg-white/5 p-4"><div className="text-2xl font-bold">U1…Un</div><div className="mt-1 text-xs text-slate-400">Unit-wise numbering</div></div><div className="rounded-3xl border border-white/10 bg-white/5 p-4"><div className="text-2xl font-bold">DC → Tally</div><div className="mt-1 text-xs text-slate-400">Controlled approvals</div></div><div className="rounded-3xl border border-white/10 bg-white/5 p-4"><div className="text-2xl font-bold">Live</div><div className="mt-1 text-xs text-slate-400">Stock ledger</div></div></div>
      </div>

      <div className="flex min-h-screen items-center justify-center bg-slate-50 p-5 sm:p-10">
        <form onSubmit={submit} className="w-full max-w-md rounded-[34px] border border-slate-200 bg-white p-7 shadow-lift sm:p-9">
          <div className="mb-8 lg:hidden"><div className="grid h-12 w-12 place-items-center rounded-2xl bg-slate-950 font-black text-white">VS</div></div>
          <div className="text-xs font-bold uppercase tracking-[0.2em] text-indigo-600">Secure sign in</div>
          <h2 className="mt-3 text-3xl font-bold tracking-tight text-slate-950">Welcome back</h2>
          <p className="mt-2 text-sm leading-6 text-slate-500">Use your Super Admin, Admin or Employee credentials.</p>

          <div className="mt-8 space-y-5">
            <label className="block"><span className="label">Username</span><div className="relative"><UserRound size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" /><input className="field pl-11" value={username} onChange={(e) => setUsername(e.target.value)} autoComplete="username" /></div></label>
            <label className="block"><span className="label">Password</span><div className="relative"><LockKeyhole size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" /><input className="field pl-11 pr-12" type={show ? "text" : "password"} value={password} onChange={(e) => setPassword(e.target.value)} autoComplete="current-password" /><button type="button" onClick={() => setShow(!show)} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700">{show ? <EyeOff size={18}/> : <Eye size={18}/>}</button></div></label>
          </div>

          <button disabled={busy} className="btn-primary mt-7 w-full py-3.5">{busy ? <Loader2 size={18} className="animate-spin"/> : <LockKeyhole size={18}/>}Sign in</button>
          <div className="mt-6 border-t border-slate-100 pt-5 text-center text-xs leading-5 text-slate-400">Access is controlled by your role, assigned unit and permissions configured by Super Admin.</div>
        </form>
      </div>
    </div>
  );
}
