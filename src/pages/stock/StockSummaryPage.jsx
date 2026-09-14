import { useEffect, useState } from "react";
import { PackageCheck, RefreshCcw, Scale, Warehouse } from "lucide-react";
import toast from "react-hot-toast";
import { api, apiMessage, unwrap } from "../../api/client";
import { CATEGORY_META } from "../../lib/constants";
import { formatNumber } from "../../lib/format";
import { FilterBar, LoadingBlock, PageHeader, SecondaryButton, Select, StatCard, TableShell } from "../../components/common/UI";
import { useAuth } from "../../context/AuthContext";

export default function StockSummaryPage(){
 const {user,isSuperAdmin}=useAuth(); const [rows,setRows]=useState([]),[units,setUnits]=useState([]),[unitId,setUnitId]=useState(user?.unit_id?String(user.unit_id):""),[loading,setLoading]=useState(true);
 const loadUnits=async()=>{if(!isSuperAdmin)return;try{const u=unwrap(await api.get("/units"))||[];setUnits(u);if(!unitId&&u.length)setUnitId(String(u[0].id));}catch(e){toast.error(apiMessage(e))}}; useEffect(()=>{loadUnits()},[]);
 const load=async()=>{if(!unitId&&!user?.unit_id)return;setLoading(true);try{setRows(unwrap(await api.get("/items/stock-summary",{params:{unitId:unitId||user.unit_id}}))||[]);}catch(e){toast.error(apiMessage(e));}finally{setLoading(false)}}; useEffect(()=>{if(unitId||user?.unit_id)load()},[unitId,user?.unit_id]);
 const totalQty=rows.reduce((s,x)=>s+Number(x.current_qty||0),0), totalPackages=rows.reduce((s,x)=>s+Number(x.current_bags||0),0);
 return <div className="space-y-6"><PageHeader eyebrow="Inventory" title="Stock Summary" description="Current stock by unit, item and tracking profile." actions={<SecondaryButton icon={RefreshCcw} onClick={load}>Refresh</SecondaryButton>}/>{isSuperAdmin&&<FilterBar><div className="w-full sm:w-72"><Select value={unitId} onChange={e=>setUnitId(e.target.value)} placeholder="Choose unit" options={units.map(x=>({value:String(x.id),label:`${x.unit_code} · ${x.unit_name}`}))}/></div></FilterBar>}<div className="grid gap-4 sm:grid-cols-3"><StatCard label="Stock Items" value={rows.length} icon={PackageCheck}/><StatCard label="Current Quantity" value={`${formatNumber(totalQty,3)} kg`} icon={Scale} accent="emerald"/><StatCard label="Packages / Bales" value={formatNumber(totalPackages,2)} icon={Warehouse} accent="cyan"/></div>{loading?<LoadingBlock/>:<TableShell><table className="table-base"><thead><tr><th>Item</th><th>Type</th><th>HSN</th><th>Tracking</th><th>In</th><th>Out</th><th>Current Packages</th><th>Current Qty</th></tr></thead><tbody>{rows.map((x,i)=><tr key={x.item_id||i}><td><div className="font-semibold text-slate-900">{x.item_code?`${x.item_code} · `:""}{x.description}</div></td><td>{CATEGORY_META[x.item_category]?.label||x.item_category}</td><td>{x.hsn_code||"—"}</td><td>{x.package_label||x.stock_tracking_type}{x.standard_weight_kg?` · ${x.standard_weight_kg} kg`:""}</td><td>{formatNumber(x.in_qty,3)} kg</td><td>{formatNumber(x.out_qty,3)} kg</td><td className="font-semibold">{formatNumber(x.current_bags,2)} {x.package_label||""}</td><td className="font-bold text-slate-950">{formatNumber(x.current_qty,3)} kg</td></tr>)}</tbody></table></TableShell>}</div>;
}
