import { useEffect, useState } from "react";
import { Building2, ClipboardCheck, FileText, PackageCheck, ReceiptText, UsersRound } from "lucide-react";
import toast from "react-hot-toast";
import { api, apiMessage, unwrap } from "../api/client";
import { PageHeader, StatCard, LoadingBlock } from "../components/common/UI";
import { useAuth } from "../context/AuthContext";
import { formatCurrency } from "../lib/format";

export default function DashboardPage() {
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get("/dashboard").then((res) => setData(unwrap(res))).catch((e) => toast.error(apiMessage(e))).finally(() => setLoading(false));
  }, []);

  if (loading) return <LoadingBlock label="Loading dashboard..." />;
  const dc = data?.dc || {};
  const purchase = data?.purchase || data?.inward || {};
  const invoice = data?.invoice || {};

  return (
    <div className="space-y-6">
      <PageHeader eyebrow="Operations overview" title={`Good day, ${user?.name?.split(" ")[0] || "User"}`} description="A live operational view of Vela Spinners units, movement documents, purchase inward and Tally invoice links." />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Units" value={data?.units || 0} helper="Active scope" icon={Building2} />
        <StatCard label="Admins & Employees" value={(data?.admins || 0) + (data?.employees || 0)} helper={`${data?.admins || 0} admins · ${data?.employees || 0} employees`} icon={UsersRound} accent="cyan" />
        <StatCard label="Pending DC" value={dc.pending || 0} helper={`${dc.approved || 0} approved · ${dc.invoiced || 0} invoiced`} icon={ClipboardCheck} accent="amber" />
        <StatCard label="Purchase DC" value={purchase.count || 0} helper={`${purchase.pending || 0} pending · ${purchase.approved || 0} approved`} icon={PackageCheck} accent="emerald" />
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <div className="panel p-6 lg:col-span-2">
          <div className="flex items-center justify-between"><div><div className="text-sm font-bold text-slate-900">Workflow status</div><div className="mt-1 text-xs text-slate-500">Current document state distribution</div></div><FileText className="text-indigo-600" size={22}/></div>
          <div className="mt-6 grid gap-3 sm:grid-cols-3">
            {[
              ["DC Submitted", dc.pending || 0, "bg-amber-500"],
              ["DC Approved", dc.approved || 0, "bg-emerald-500"],
              ["DC Invoiced", dc.invoiced || 0, "bg-indigo-500"],
              ["Purchase Pending", purchase.pending || 0, "bg-amber-500"],
              ["Purchase Approved", purchase.approved || 0, "bg-emerald-500"],
              ["Purchase Rejected", purchase.rejected || 0, "bg-rose-500"]
            ].map(([label, value, color]) => <div key={label} className="rounded-2xl border border-slate-200 p-4"><div className={`h-1.5 w-10 rounded-full ${color}`}/><div className="mt-4 text-2xl font-bold text-slate-950">{value}</div><div className="mt-1 text-xs font-medium text-slate-500">{label}</div></div>)}
          </div>
        </div>
        <div className="panel p-6">
          <div className="grid h-12 w-12 place-items-center rounded-2xl bg-violet-50 text-violet-600"><ReceiptText size={22}/></div>
          <div className="mt-5 text-xs font-bold uppercase tracking-[0.16em] text-slate-400">Tally invoices</div>
          <div className="mt-2 text-4xl font-bold text-slate-950">{invoice.count || 0}</div>
          <div className="mt-5 rounded-2xl bg-slate-50 p-4"><div className="text-xs text-slate-500">Purchase value approved</div><div className="mt-1 text-xl font-bold text-slate-900">{formatCurrency(purchase.total_amount || 0)}</div></div>
          <p className="mt-4 text-xs leading-5 text-slate-500">Sales invoice value remains sourced from Tally; the app links the Tally invoice PDF and references.</p>
        </div>
      </div>
    </div>
  );
}
