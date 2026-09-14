import { Bell, LogOut, Menu, UserRound } from "lucide-react";
import { Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

export default function Topbar({ onMenu }) {
  const { user, logout } = useAuth();
  return (
    <header className="sticky top-0 z-30 flex h-20 items-center justify-between border-b border-slate-200/80 bg-white/90 px-4 backdrop-blur-xl sm:px-6 lg:px-8">
      <div className="flex items-center gap-3">
        <button onClick={onMenu} className="grid h-11 w-11 place-items-center rounded-2xl border border-slate-200 bg-white text-slate-700 shadow-sm lg:hidden"><Menu size={20} /></button>
        <div><div className="text-xs font-bold uppercase tracking-[0.18em] text-slate-400">Vela Spinners Pvt Ltd</div><div className="mt-1 text-sm font-semibold text-slate-800">{user?.unit ? `${user.unit.unit_code} · ${user.unit.unit_name}` : "Corporate Console"}</div></div>
      </div>
      <div className="flex items-center gap-2">
        <button className="relative grid h-11 w-11 place-items-center rounded-2xl border border-slate-200 bg-white text-slate-500 transition hover:text-slate-900"><Bell size={19} /><span className="absolute right-2.5 top-2.5 h-2 w-2 rounded-full bg-indigo-500 ring-2 ring-white" /></button>
        <Link to="/profile" className="hidden items-center gap-2 rounded-2xl border border-slate-200 bg-white px-3 py-2.5 text-sm font-semibold text-slate-700 sm:flex"><UserRound size={17} />{user?.name?.split(" ")[0] || "Profile"}</Link>
        <button onClick={logout} className="grid h-11 w-11 place-items-center rounded-2xl border border-slate-200 bg-white text-slate-500 transition hover:border-rose-200 hover:bg-rose-50 hover:text-rose-600" title="Sign out"><LogOut size={18} /></button>
      </div>
    </header>
  );
}
