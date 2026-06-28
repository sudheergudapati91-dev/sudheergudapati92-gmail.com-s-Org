/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from "react";
import { ActiveRole } from "../types";
import { ShieldCheck, UserCheck, Settings, Server, Users, Landmark, AlertCircle, RefreshCw } from "lucide-react";

interface PhoneFrameProps {
  children: React.ReactNode;
  activeRole: ActiveRole;
  onRoleChange: (role: ActiveRole) => void;
  onResetData: () => void;
  notificationCount: number;
  onOpenNotifications: () => void;
}

export const PhoneFrame: React.FC<PhoneFrameProps> = ({
  children,
  activeRole,
  onRoleChange,
  onResetData,
  notificationCount,
  onOpenNotifications,
}) => {
  const isWebRole = activeRole === "Warehouse Manager" || activeRole === "Accountant";

  return (
    <div className={`min-h-screen bg-slate-900 py-6 px-4 flex flex-col lg:flex-row items-center lg:items-start justify-center gap-6 antialiased transition-all duration-300 ${
      isWebRole ? "max-w-[1700px] mx-auto w-full" : ""
    }`}>
      {/* Dynamic Interactive Panel (Left Side on Desktop, Top on Mobile) */}
      <div className="w-full lg:w-80 bg-slate-800 text-slate-100 rounded-3xl p-6 shadow-2xl space-y-6 flex-shrink-0 border border-slate-700">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="p-1.5 bg-brand-600 rounded-lg text-white">
              <Server size={20} />
            </span>
            <h1 className="font-display font-bold text-xl tracking-wide uppercase text-white">
              KrishiSetu
            </h1>
          </div>
          <p className="text-slate-400 text-xs">
            Fertilizer Distribution Sandbox
          </p>
        </div>

        <div className="border-t border-slate-700/60 pt-4 space-y-3">
          <h2 className="text-xs font-semibold text-slate-400 tracking-wider uppercase">
            Demo Control Panel
          </h2>
          <p className="text-slate-400 text-xs leading-relaxed">
            Click any role below to instantly shift context within KrishiSetu. The local inventory and payments sync across views immediately to showcase full system synergy.
          </p>
        </div>

        {/* Quick Swappable Roles List */}
        <div className="space-y-2">
          {([
            { id: "Owner", label: "Owner / Proprietor", icon: ShieldCheck, color: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30" },
            { id: "Warehouse Manager", label: "Warehouse Manager", icon: Server, color: "bg-blue-500/15 text-blue-400 border-blue-500/30" },
            { id: "Village Assistant", label: "Village Assistant", icon: Users, color: "bg-amber-500/15 text-amber-400 border-amber-500/30" },
            { id: "Accountant", label: "Accountant / Finance", icon: Landmark, color: "bg-indigo-500/15 text-indigo-400 border-indigo-500/30" },
            { id: "Login", label: "Login Portal", icon: UserCheck, color: "bg-slate-500/15 text-slate-400 border-slate-500/30" }
          ] as const).map((r) => {
            const Icon = r.icon;
            const isSelected = activeRole === r.id;
            return (
              <button
                key={r.id}
                onClick={() => onRoleChange(r.id)}
                className={`w-full flex items-center justify-between p-3 rounded-xl transition-all duration-200 text-left border ${
                  isSelected
                    ? "bg-brand-600 border-brand-500 text-white shadow-lg shadow-brand-600/30 font-medium scale-[1.02]"
                    : "bg-slate-800/50 hover:bg-slate-700/80 border-slate-700/70 text-slate-300"
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className={`p-1.5 rounded-lg ${isSelected ? "bg-white/20 text-white" : r.color.split(" ")[0]} ${r.color.split(" ")[1]}`}>
                    <Icon size={16} />
                  </span>
                  <div>
                    <span className="text-sm font-medium block">{r.label}</span>
                    <span className="text-[10px] text-slate-400 block">
                      {isSelected ? "Active Persona" : "Switch Role"}
                    </span>
                  </div>
                </div>
              </button>
            );
          })}
        </div>

        <div className="border-t border-slate-700/60 pt-4 space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-[11px] text-slate-400 font-medium font-mono uppercase">
              Simulated Node
            </span>
            <span className="flex items-center gap-1.5 text-xs text-emerald-400 font-medium">
              <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse"></span>
              Live Sandbox
            </span>
          </div>

          <button
            onClick={onResetData}
            className="w-full flex items-center justify-center gap-2 py-2.5 px-4 bg-slate-700/80 hover:bg-slate-600 text-slate-200 hover:text-white rounded-xl text-xs transition duration-150 border border-slate-600 font-medium"
          >
            <RefreshCw size={14} />
            Reset Prototype Data
          </button>
        </div>
      </div>

      {/* Polish Mobile phone wrapper OR Web Panel */}
      {isWebRole ? (
        <div className="flex-1 min-w-0 h-[820px] bg-slate-950 rounded-[30px] p-3 shadow-[0_25px_60px_-15px_rgba(0,0,0,0.9)] border-4 border-slate-800 flex flex-col relative animate-in fade-in duration-300">
          
          {/* Web Browser Style Top Bar */}
          <div className="w-full bg-slate-900 px-4 py-2.5 flex items-center justify-between text-xs font-bold text-slate-300 border-b border-slate-800 select-none z-10 shrink-0 rounded-t-[18px]">
            <div className="flex items-center gap-2">
              <div className="flex gap-1.5 mr-2">
                <span className="w-3 h-3 bg-rose-500 rounded-full opacity-80 hover:opacity-100 transition cursor-pointer"></span>
                <span className="w-3 h-3 bg-amber-500 rounded-full opacity-80 hover:opacity-100 transition cursor-pointer"></span>
                <span className="w-3 h-3 bg-emerald-500 rounded-full opacity-80 hover:opacity-100 transition cursor-pointer"></span>
              </div>
              <span className="px-3 py-1 bg-slate-800 rounded-md text-[11px] font-mono font-medium text-slate-400 flex items-center gap-1.5 shadow-inner">
                <span className="w-1.5 h-1.5 bg-brand-500 rounded-full animate-pulse"></span>
                https://portal.krishisetu.gov.in/{activeRole.toLowerCase().replace(" ", "-")}
              </span>
            </div>
            
            <div className="flex gap-3 items-center">
              <span className="text-[10px] bg-brand-500/10 text-brand-400 border border-brand-500/20 px-2 py-0.5 rounded-full font-semibold uppercase tracking-wider">
                💻 Web Application Console
              </span>
              <span className="text-slate-500 text-[10px] font-mono">EST: 2026</span>
            </div>
          </div>

           {/* Inner Web Screen */}
          <div className="w-full h-full bg-slate-50 rounded-b-[18px] overflow-hidden flex flex-col relative">
            {/* Active View Child Screen */}
            <div id="inner-web-screen" className="flex-1 overflow-y-auto no-scrollbar flex flex-col relative bg-slate-50">
              {children}
            </div>
          </div>

        </div>
      ) : (
        <div className="relative w-full max-w-[395px] h-[820px] bg-slate-950 rounded-[50px] p-3.5 shadow-[0_25px_60px_-15px_rgba(0,0,0,0.9)] border-4 border-slate-800 flex-shrink-0 animate-in fade-in duration-300">
          {/* Notch details */}
          <div className="absolute top-0 left-1/2 transform -translate-x-1/2 h-6 w-36 bg-slate-950 rounded-b-2xl z-50 flex items-center justify-center">
            <div className="w-12 h-1 bg-slate-800 rounded-md mb-2"></div>
            <div className="absolute top-1.5 right-6 w-1.5 h-1.5 bg-blue-900 rounded-full"></div>
          </div>

          {/* Volume & Power Button Indicators on Edge decoration */}
          <div className="absolute -left-1.5 top-28 w-1 h-12 bg-slate-700 rounded-r-sm"></div>
          <div className="absolute -left-1.5 top-44 w-1 h-12 bg-slate-700 rounded-r-sm"></div>
          <div className="absolute -right-1.5 top-36 w-1 h-16 bg-slate-700 rounded-l-sm"></div>

          {/* Inner Phone Screen */}
          <div className="w-full h-full bg-slate-50 rounded-[38px] overflow-hidden flex flex-col relative">
            {/* Status Bar */}
            <div className="w-full bg-white px-6 pt-3 pb-1 flex justify-between items-center text-[10px] font-bold text-slate-800 select-none z-10 shrink-0">
              <span>9:41</span>
              <div className="flex gap-1 items-center font-bold">
                <span>LTE</span>
                <span>100%</span>
              </div>
            </div>

            {/* Active View Child Screen */}
            <div className="flex-1 overflow-y-auto no-scrollbar flex flex-col relative bg-slate-50">
              {children}
            </div>

            {/* Home Indicator Bar */}
            <div className="w-full bg-white py-2 flex items-center justify-center border-t border-slate-100/80 z-20">
              <div className="w-32 h-1 bg-slate-300 rounded-full"></div>
            </div>
          </div>
        </div>
      )}

      {/* Guide notes right hand side for better UX and review (Only shown on non-web roles to save horizontal space) */}
      {!isWebRole && (
        <div className="hidden lg:flex flex-col gap-6 w-full lg:w-96 text-slate-300 max-h-[820px] overflow-y-auto no-scrollbar animate-in slide-in-from-right-2 duration-200">
          <div className="bg-slate-800/80 border border-slate-700/60 p-6 rounded-3xl space-y-4">
            <h3 className="font-display font-semibold text-white text-base">
              Client Review Guidelines
            </h3>
            <ul className="space-y-3.5 text-xs text-slate-300">
              <li className="flex items-start gap-2.5">
                <span className="text-brand-400 mt-0.5 font-bold">✓</span>
                <div>
                  <strong className="text-white block mb-0.5">Role Interactivity</strong>
                  Dispatches processed in Warehouse view appear as "In-Transit" arrivals for Village Assistants.
                </div>
              </li>
              <li className="flex items-start gap-2.5">
                <span className="text-brand-400 mt-0.5 font-bold">✓</span>
                <div>
                  <strong className="text-white block mb-0.5">Accountant & Owner Flow</strong>
                  Accountant submits invoice clearances to the Owner approval queue, which can be Approved/Hold/Rejected instantly.
                </div>
              </li>
              <li className="flex items-start gap-2.5">
                <span className="text-brand-400 mt-0.5 font-bold">✓</span>
                <div>
                  <strong className="text-white block mb-0.5">Stocks Ledger Dynamics</strong>
                  Selling to farmers reduces specific village inventory, triggers live cash receipts, and posts audit ledgers in Owner visibility reports.
                </div>
              </li>
              <li className="flex items-start gap-2.5">
                <span className="text-brand-400 mt-0.5 font-bold">✓</span>
                <div>
                  <strong className="text-white block mb-0.5">Premium Indian Localization</strong>
                  Displays accurate market products (Urea, DAP, NPK), Indian Rupees (₹), local regions (Indore, Rampur, Dhamnod, Pali), and professional color coding.
                </div>
              </li>
            </ul>
          </div>

          <div className="bg-gradient-to-br from-brand-950 to-slate-900 border border-brand-800/40 p-5 rounded-2xl flex flex-col gap-2">
            <div className="flex gap-2 items-center text-teal-400">
              <AlertCircle size={16} />
              <span className="text-xs font-semibold uppercase tracking-wider">Prototype Mode</span>
            </div>
            <p className="text-[11px] text-slate-300 leading-normal">
              No real system keys are mapped. Everything is persisted locally on your browser cache (localStorage). Feel free to refresh the browser at any point and your records will remain preserved!
            </p>
          </div>
        </div>
      )}
    </div>
  );
};
