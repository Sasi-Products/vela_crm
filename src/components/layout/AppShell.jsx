import { useState } from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar";
import Topbar from "./Topbar";

export default function AppShell() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  return (
    <div className="min-h-screen bg-slate-50">
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="lg:pl-[286px]">
        <Topbar onMenu={() => setSidebarOpen(true)} />
        <main className="mx-auto w-full max-w-[1700px] p-4 sm:p-6 lg:p-8"><Outlet /></main>
      </div>
    </div>
  );
}
