import { useEffect, useState } from "react";
import { Eye, Plus, Printer } from "lucide-react";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";
import { api, apiMessage, unwrap } from "../../api/client";
import { DC_STATUSES } from "../../lib/constants";
import { formatDate } from "../../lib/format";
import { printDc } from "../../lib/print";
import { FilterBar, LoadingBlock, PageHeader, PrimaryButton, SearchBox, Select, StatusBadge, TableShell } from "../../components/common/UI";
import { useAuth } from "../../context/AuthContext";

export default function DCListPage(){
 const {hasPermission}=useAuth(); const canCreate=hasPermission("dc.create"), canPrint=hasPermission("dc.print");
 const [rows,setRows]=useState([]),[loading,setLoading]=useState(true),[search,setSearch]=useState(""),[status,setStatus]=useState("");
 const load=async()=>{setLoading(true);try{const params={};if(search)params.search=search;if(status)params.status=status;setRows(unwrap(await api.get("/dc",{params}))||[]);}catch(e){toast.error(apiMessage(e));}finally{setLoading(false)}}; useEffect(()=>{const t=setTimeout(load,250);return()=>clearTimeout(t)},[search,status]);
 return <div className="space-y-6"><PageHeader eyebrow="Operations" title="Outward Delivery Challans" description="DC numbers are generated unit-wise and financial-year-wise. No price or total is printed on the DC." actions={canCreate?<Link to="/dc/new"><PrimaryButton icon={Plus}>Create DC</PrimaryButton></Link>:null}/><FilterBar><SearchBox value={search} onChange={setSearch} placeholder="Search DC No, customer, vehicle, invoice..."/><div className="w-full sm:w-44"><Select value={status} onChange={e=>setStatus(e.target.value)} placeholder="All status" options={DC_STATUSES}/></div></FilterBar>{loading?<LoadingBlock/>:<TableShell><table className="table-base"><thead><tr><th>DC No</th><th>Date</th><th>Customer</th><th>Vehicle</th><th>Qty</th><th>Status</th><th>Invoice Ref</th><th className="text-right">Actions</th></tr></thead><tbody>{rows.map(x=><tr key={x.id}><td className="font-bold text-indigo-700">{x.dc_no}</td><td>{formatDate(x.dc_date)}</td><td><div className="font-semibold text-slate-900">{x.customer_name}</div><div className="text-xs text-slate-400">{x.gstin||x.mobile||""}</div></td><td>{x.vehicle_no||"—"}</td><td>{Number(x.total_qty||0).toLocaleString("en-IN")} kg</td><td><StatusBadge value={x.status}/></td><td>{x.invoice_no||x.tally_invoice?.invoice_no||"—"}</td><td><div className="flex justify-end gap-2"><Link to={`/dc/${x.id}`} className="rounded-xl p-2 hover:bg-slate-100"><Eye size={17}/></Link>{canPrint&&<button onClick={()=>printDc(x)} className="rounded-xl p-2 hover:bg-indigo-50 hover:text-indigo-700"><Printer size={17}/></button>}</div></td></tr>)}</tbody></table></TableShell>}</div>;
}
