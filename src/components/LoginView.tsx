/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { ActiveRole, AssistantUser } from "../types";
import { Server, Users, ShieldAlert, Landmark, Sparkles, Phone, Lock, Eye, EyeOff } from "lucide-react";

interface LoginViewProps {
  onLogin: (role: ActiveRole, loggedInAssistant?: AssistantUser) => void;
  assistantUsers: AssistantUser[];
}

export const LoginView: React.FC<LoginViewProps> = ({ onLogin, assistantUsers }) => {
  const [selected, setSelected] = useState<ActiveRole>("Owner");
  const [mobile, setMobile] = useState("");
  const [password, setPassword] = useState("password");
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const rolesList = [
    {
      id: "Owner" as ActiveRole,
      title: "Owner / Proprietor",
      desc: "Full command over stock, collections, warehouse balance, and supplier payment approvals.",
      icon: ShieldAlert,
      color: "border-emerald-250 bg-emerald-50/40 text-emerald-700"
    },
    {
      id: "Warehouse Manager" as ActiveRole,
      title: "Warehouse Manager",
      desc: "Inward stock entries, dispatches to villages, and tracking general logistics.",
      icon: Server,
      color: "border-blue-250 bg-blue-50/40 text-blue-700"
    },
    {
      id: "Village Assistant" as ActiveRole,
      title: "Village Assistant (Portal)",
      desc: "Secure login using mobile number & password mapped to your village center hub.",
      icon: Users,
      color: "border-amber-250 bg-amber-50/40 text-amber-700 font-medium"
    },
    {
      id: "Accountant" as ActiveRole,
      title: "Accountant / Finance",
      desc: "Manage supplier accounts, record partial bills, and issue owner payment approvals.",
      icon: Landmark,
      color: "border-indigo-250 bg-indigo-50/40 text-indigo-700"
    }
  ];

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (selected === "Village Assistant") {
      if (!mobile) {
        setErrorMessage("Please enter your registered mobile number");
        return;
      }
      
      const cleanInput = mobile.trim().replace(/\s+/g, "");
      // Match raw numbers or formatted
      const found = assistantUsers.find(
        (u) =>
          u.mobileNumber.trim().replace(/\D/g, "").endsWith(cleanInput.replace(/\D/g, "")) ||
          u.mobileNumber.trim() === cleanInput
      );

      if (!found) {
        setErrorMessage("Mobile number is not registered for any village center. Please contact the Warehouse Manager to create your account.");
        return;
      }

      if (found.isActive === false) {
        setErrorMessage("Your supervisor account has been inactivated by the Warehouse Manager.");
        return;
      }

      const expectedPass = found.password || "password";
      if (password !== expectedPass) {
        setErrorMessage("Incorrect password. Please try again.");
        return;
      }

      setErrorMessage("");
      onLogin(selected, found);
    } else {
      onLogin(selected);
    }
  };

  const handleDemoFill = (assist: AssistantUser) => {
    setMobile(assist.mobileNumber);
    setPassword(assist.password || "password");
    setErrorMessage("");
  };

  return (
    <div className="flex-1 flex flex-col justify-start px-5 py-6 bg-slate-50 min-h-full">
      {/* Brand Header */}
      <div className="text-center mt-3 mb-5">
        <div className="inline-flex items-center justify-center w-11 h-11 rounded-2xl bg-brand-600 text-white shadow-md shadow-brand-600/30 mb-2.5">
          <Sparkles size={22} />
        </div>
        <h2 className="font-display font-extrabold text-xl text-slate-800 tracking-tight">
          KrishiSetu
        </h2>
        <p className="text-[10px] text-slate-400 font-medium px-4 mt-0.5">
          Premium Fertilizer Supply Chain &amp; Distribution Portal
        </p>
      </div>

      <form onSubmit={handleLoginSubmit} className="space-y-4 flex-1 flex flex-col justify-start">
        <div className="space-y-2">
          <div className="flex items-center justify-between px-1">
            <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400">
              Select Workspace Portal
            </span>
            <span className="text-[9px] text-brand-600 font-bold font-mono bg-brand-50 px-2 py-0.5 rounded-full">
              Live App State
            </span>
          </div>

          <div className="grid grid-cols-2 gap-2">
            {rolesList.map((role) => {
              const Icon = role.icon;
              const isSelected = selected === role.id;
              return (
                <button
                  type="button"
                  id={`login-role-${role.id.toLowerCase().replace(/\s+/g, '-')}`}
                  key={role.id}
                  onClick={() => {
                    setSelected(role.id);
                    setErrorMessage("");
                  }}
                  className={`flex flex-col items-start p-3 rounded-xl border text-left transition-all duration-150 ${
                    isSelected
                      ? "bg-white border-brand-650 shadow-sm ring-1 ring-brand-500/10 scale-[1.01]"
                      : "bg-white/95 border-slate-200 hover:bg-slate-50"
                  }`}
                >
                  <span className={`p-1.5 rounded-lg mb-1.5 flex-shrink-0 ${isSelected ? "bg-brand-600 text-white" : "bg-slate-100 text-slate-500"}`}>
                    <Icon size={14} />
                  </span>
                  <div>
                    <span className={`block font-bold text-[11px] leading-tight ${isSelected ? "text-slate-900" : "text-slate-700"}`}>
                      {role.title}
                    </span>
                    <span className="block mt-0.5 text-[9px] leading-relaxed text-slate-400 line-clamp-2">
                      {role.desc}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Dynamic Mobile and Password fields only for Assistant */}
        {selected === "Village Assistant" ? (
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs space-y-3 animate-in slide-in-from-bottom-2 duration-200 text-left">
            <h3 className="text-xs font-bold text-slate-700 flex items-center gap-1">
              <Users size={14} className="text-amber-600" />
              Village Assistant Sign In
            </h3>

            {errorMessage && (
              <div className="p-2 border border-rose-200 bg-rose-50 rounded-lg text-[10px] text-rose-700 font-medium leading-relaxed">
                {errorMessage}
              </div>
            )}

            <div className="space-y-2.5">
              <div>
                <label className="block text-[9px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                  Registered Mobile Number
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-3 flex items-center text-slate-400">
                    <Phone size={13} />
                  </span>
                  <input
                    type="tel"
                    required
                    placeholder="e.g. 9876543210"
                    value={mobile}
                    onChange={(e) => setMobile(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold focus:bg-white transition"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-[9px] font-bold text-slate-400 uppercase tracking-wider">
                    Password
                  </label>
                  <span className="text-[8px] text-slate-400 italic">Default: password</span>
                </div>
                <div className="relative">
                  <span className="absolute inset-y-0 left-3 flex items-center text-slate-400">
                    <Lock size={13} />
                  </span>
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    placeholder="Enter password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-9 pr-9 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-mono focus:bg-white transition"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-3 flex items-center text-slate-400 hover:text-slate-600 cursor-pointer"
                  >
                    {showPassword ? <EyeOff size={13} /> : <Eye size={13} />}
                  </button>
                </div>
              </div>
            </div>

            {/* Demo Accounts Quick Fill Buttons Area */}
            <div className="border-t border-slate-100 pt-2.5 mt-2">
              <span className="text-[8.5px] uppercase font-bold text-slate-400 block mb-1">
                Select Assistant for Quick Demo Setup:
              </span>
              <div className="flex flex-wrap gap-1">
                {assistantUsers.map((u) => {
                  const isInactive = u.isActive === false;
                  return (
                    <button
                      key={u.mobileNumber}
                      type="button"
                      onClick={() => handleDemoFill(u)}
                      disabled={isInactive}
                      className={`px-2 py-1 border rounded-lg text-[9px] font-medium transition cursor-pointer flex flex-col items-start gap-px text-left ${
                        isInactive
                          ? "opacity-50 bg-slate-100 hover:bg-slate-100 text-slate-400 border-slate-200 cursor-not-allowed"
                          : "bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-200"
                      }`}
                    >
                      <span className="font-bold">
                        {u.name} ({u.villageName}) {isInactive && <span className="text-[7.5px] uppercase text-rose-500 font-extrabold bg-rose-50 px-1 rounded border border-rose-100">(Inactive)</span>}
                      </span>
                      <span className={`text-[8px] font-mono ${isInactive ? "text-slate-400" : "text-amber-700/80"}`}>{u.mobileNumber}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-white/80 p-4 border border-dashed border-slate-200 rounded-xl text-center py-6 text-slate-500 animate-in fade-in duration-150">
            <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center mx-auto mb-2 text-slate-400">
              <ShieldAlert size={18} />
            </div>
            <strong className="block text-xs text-slate-700 font-semibold">Ready for Simulated Access</strong>
            <p className="text-[10px] text-slate-400 mt-1 px-4 leading-normal">
              No authorization required. Click the button below to instantly launch the mock dashboard.
            </p>
          </div>
        )}

        {/* Primary Action Button */}
        <div className="mt-auto pt-4 border-t border-slate-200/60 w-full">
          <button
            type="submit"
            id="btn-login"
            className="w-full py-3 px-6 rounded-2xl bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-lg shadow-brand-500/10 active:scale-[0.99] transition"
          >
            Enter Workspace as {selected === "Village Assistant" ? "Assistant" : selected}
          </button>
          <p className="text-center text-[9px] text-slate-400 mt-2 select-none">
            KrishiSetu Distribution Network Platform
          </p>
        </div>
      </form>
    </div>
  );
};
