import { useCallback, useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import { api, unwrap, apiMessage } from "../../api/client";
import { useAuth } from "../../context/AuthContext";
import { Link } from "react-router-dom";
export const today = () => new Date().toLocaleDateString("en-CA");
export const amount = (x, digits=2) => Number(x||0).toLocaleString("en-IN",{maximumFractionDigits:digits});
export const dataFor = async (path, params) => unwrap(await api.get(`/mill/${path}`, {params}));
export const postFor = async (path,payload) => unwrap(await api.post(`/mill/${path}`,payload));
export function useMill(){
 const {user,isSuperAdmin}=useAuth();
 const [data,setData]=useState(null),[busy,setBusy]=useState(true);
 const [unit,setUnit]=useState(()=>user?.unit_id ? String(user.unit_id) : "");
 const reload=useCallback(async()=>{setBusy(true);try{const result=await dataFor("bootstrap",unit?{unit_id:unit}:{});setData(result);if(!unit&&result?.units?.length)setUnit(String(result.units[0].id));}catch(e){toast.error(apiMessage(e))}finally{setBusy(false)}},[unit]);
 useEffect(()=>{reload()},[reload]);
 const choose=useCallback((items,id,first="name")=>(items||[]).find(x=>Number(x.id)===Number(id))?.[first]||"—",[]);
 return {data,busy,unit,setUnit,isSuperAdmin,user,reload,choose};
}
export function MillShell({title,description,context,children}){
 const {data,unit,setUnit,isSuperAdmin,busy}=context;
 return <div className="space-y-5 pb-12"><div className="flex flex-wrap items-end justify-between gap-3"><div><div className="text-xs font-bold uppercase tracking-[0.25em] text-indigo-600">Factory Production ERP</div><h1 className="mt-1 text-2xl font-black tracking-tight text-slate-900">{title}</h1><p className="mt-1 max-w-3xl text-sm text-slate-500">{description}</p></div><div className="w-full sm:w-56"><label className="mb-1 block text-xs font-bold text-slate-600">Factory Unit</label><select className="field" value={unit} onChange={e=>setUnit(e.target.value)} disabled={!isSuperAdmin}>{(data?.units||[]).map(u=><option key={u.id} value={u.id}>{u.unit_code} · {u.unit_name}</option>)}</select></div></div>{busy&&!data?<div className="panel p-10 text-center text-slate-500">Loading factory masters…</div>:children}</div>
}
export function Panel({title,subtitle,children,actions}){return <section className="panel overflow-hidden"><div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 px-5 py-4"><div><h2 className="font-bold text-slate-900">{title}</h2>{subtitle&&<p className="mt-1 text-xs text-slate-500">{subtitle}</p>}</div>{actions}</div><div className="p-5">{children}</div></section>}
export function Control({label,value,onChange,type="text",options,required=false,step="any",placeholder="",min,disabled=false}){
 const cls="field w-full";
 return <label className="block min-w-0 text-sm"><span className="mb-1 block font-semibold text-slate-600">{label}{required&&<span className="text-rose-600"> *</span>}</span>{options?<select className={cls} value={value??""} onChange={e=>onChange(e.target.value)} required={required} disabled={disabled}><option value="">Choose {label.toLowerCase()}</option>{options.map(x=><option key={x.value} value={x.value}>{x.label}</option>)}</select>:<input className={cls} value={value??""} onChange={e=>onChange(e.target.value)} type={type} step={type==="number"?step:undefined} min={min} placeholder={placeholder} required={required} disabled={disabled}/>}</label>
}
export const optionsOf=(items,fn=x=>x.name)=>(items||[]).map(x=>({value:String(x.id),label:fn(x)}));
export function ThreeCols({children}){return <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">{children}</div>}
export function Notice({children}){return <div className="rounded-xl border border-amber-200 bg-amber-50 p-3 text-sm text-amber-900">{children}</div>}
export function Pill({value}){const ok=["approved","received","dispatched","active","accepted"].includes(value);return <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-bold ${ok?"bg-emerald-100 text-emerald-700":value==="draft"?"bg-slate-100 text-slate-700":"bg-amber-100 text-amber-700"}`}>{value||"—"}</span>}
export function Btn({children,onClick,disabled=false,kind="primary",type="button"}){return <button type={type} disabled={disabled} onClick={onClick} className={`${kind==="primary"?"btn-primary":"btn-secondary"} disabled:opacity-40`}>{children}</button>}
export async function submitTask(fn,onDone){try{const result=await fn();toast.success("Saved successfully");await onDone?.();return result;}catch(e){toast.error(apiMessage(e));return null}}
export function MiniTable({columns,rows,empty="No records yet"}){return <div className="overflow-x-auto"><table className="table-base"><thead><tr>{columns.map(x=><th key={x.label}>{x.label}</th>)}</tr></thead><tbody>{rows?.length?rows.map((r,i)=><tr key={r.id||i}>{columns.map(c=><td key={c.label}>{c.render?c.render(r):r[c.key]??"—"}</td>)}</tr>):<tr><td colSpan={columns.length} className="py-8 text-center text-slate-400">{empty}</td></tr>}</tbody></table></div>}
export const millLinks=[
 ["/mill", "Overview"],["/mill/masters","Masters"],["/mill/recipes","Mixing Recipes"],["/mill/lots","Production Plans"],["/mill/raw","Raw Inward"],["/mill/mixing","Mixing"],["/mill/carding","Carding"],["/mill/drawing","Drawing"],["/mill/oe","OE Spinning"],["/mill/waste","Waste Recovery"],["/mill/packing","Yarn Packing"],["/mill/dispatch","Dispatch Bags"],["/mill/transfer","Inter-Unit Transfer"],["/mill/attendance","Labour"],["/mill/energy","Electricity"],["/mill/quality","Quality & Costs"],["/mill/reports","Reports"]
];
export function MillQuickNav(){return <div className="flex flex-wrap gap-2">{millLinks.map(([url,label])=><Link key={url} to={url} className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-indigo-700 hover:bg-indigo-50">{label}</Link>)}</div>}
