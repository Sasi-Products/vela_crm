import { Link } from "react-router-dom";
export default function NotFoundPage() { return <div className="grid min-h-screen place-items-center bg-slate-50 p-6"><div className="text-center"><div className="text-7xl font-black text-slate-200">404</div><h1 className="mt-3 text-2xl font-bold">Page not found</h1><Link to="/" className="btn-primary mt-6">Go home</Link></div></div>; }
