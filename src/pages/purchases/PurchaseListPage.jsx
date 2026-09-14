import { useEffect, useState } from "react";
import { Eye, Plus, Printer } from "lucide-react";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";
import { api, apiMessage, unwrap } from "../../api/client";
import { ITEM_CATEGORIES, PURCHASE_STATUSES } from "../../lib/constants";
import { formatCurrency, formatDate } from "../../lib/format";
import { printPurchase } from "../../lib/print";
import { FilterBar, LoadingBlock, PageHeader, PrimaryButton, SearchBox, Select, StatusBadge, TableShell } from "../../components/common/UI";
import { useAuth } from "../../context/AuthContext";

export default function PurchaseListPage(){
 const {hasPermission}=useAuth(); const canCreate=hasPermission("purchase.create"),canPrint=hasPermission("purchase.print");
 const [rows,setRows]=useState([]),[loading,setLoading]=useState(true),[search,setSearch]=useState(""),[status,setStatus]=useState(""),[type,setType]=useState("");
 const load=async()=>{setLoading(true);try{const params={};if(search)params.search=search;if(status)params.status=status;if(type)params.purchaseType=type;setRows(unwrap(await api.get("/inwards",{params}))||[]);}catch(e){toast.error(apiMessage(e));}finally{setLoading(false)}}; useEffect(()=>{const t=setTimeout(load,250);return()=>clearTimeout(t)},[search,status,type]);
 return <div className="space-y-6"><PageHeader eyebrow="Purchase / Inward" title="Purchase DCs" description="Inward is the Purchase DC workflow. Approved Purchase DCs post stock IN; supplier invoice PDFs can be attached directly." actions={canCreate?<Link to="/purchases/new"><PrimaryButton icon={Plus}>Create Purchase DC</PrimaryButton></Link>:null}/><FilterBar><SearchBox value={search} onChange={setSearch} placeholder="Search purchase DC, supplier, invoice..."/><div className="w-full sm:w-48"><Select value={type} onChange={e=>setType(e.target.value)} placeholder="All item types" options={ITEM_CATEGORIES}/></div><div className="w-full sm:w-44"><Select value={status} onChange={e=>setStatus(e.target.value)} placeholder="All status" options={PURCHASE_STATUSES}/></div></FilterBar>{loading?<LoadingBlock/>:<TableShell><table className="table-base"><thead><tr><th>Purchase DC</th><th>Date</th><th>Supplier</th><th>Type</th><th>Quantity</th><th>Total</th><th>Status</th><th>Party Invoice</th><th className="text-right">Actions</th></tr></thead><tbody>{rows.map(x=><tr key={x.id}><td className="font-bold text-indigo-700">{x.inw_no}</td><td>{formatDate(x.inward_date)}</td><td><div className="font-semibold text-slate-900">{x.party_name}</div><div className="text-xs text-slate-400">{x.gstin||x.mobile||""}</div></td><td className="capitalize">{String(x.purchase_type).replace(/_/g," ")}</td><td>{Number(x.total_qty||0).toLocaleString("en-IN")} kg</td><td>{formatCurrency(x.total_amount)}</td><td><StatusBadge value={x.status}/></td><td>{x.invoice_attachment?<span className="text-xs font-bold text-emerald-700">Attached</span>:x.source_invoice_no||"—"}</td><td><div className="flex justify-end gap-2"><Link to={`/purchases/${x.id}`} className="rounded-xl p-2 hover:bg-slate-100"><Eye size={17}/></Link>{canPrint&&<button onClick={()=>printPurchase(x)} className="rounded-xl p-2 hover:bg-indigo-50 hover:text-indigo-700"><Printer size={17}/></button>}</div></td></tr>)}</tbody></table></TableShell>}</div>;
}
