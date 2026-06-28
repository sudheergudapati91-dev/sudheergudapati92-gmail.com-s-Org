/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { WarehouseStock, DispatchRecord, VillageStockStatus, SupplierBill, PaymentStatus, ApprovalStatus, FarmerDistribution, AssistantUser, FertilizerOrderRequest } from "../types";
import { DEMO_SUPPLIERS, DEMO_FERTILIZERS, DEMO_VILLAGES_MAPPING } from "../data";
import { Server, Grid, Send, Plus, Inbox, ClipboardList, CheckCircle2, TrendingUp, HelpCircle, Package, ArrowRight, UserCheck, Clock, Calendar, ShieldCheck, Key, Eye, UserPlus, AlertCircle, ShoppingCart, Search, ArrowUp, ArrowDown, Trash2, MapPin, LayoutDashboard, Layers, Receipt, PlusCircle } from "lucide-react";

interface WarehouseManagerViewProps {
  stocks: WarehouseStock[];
  dispatches: DispatchRecord[];
  villageStocks: VillageStockStatus[];
  supplierBills: SupplierBill[];
  farmerDistributions: FarmerDistribution[];
  assistantUsers: AssistantUser[];
  fertilizerRequests?: FertilizerOrderRequest[];
  onUpdateFertilizerStatus?: (reqId: string, status: "Dispatched" | "Cancelled") => void;
  onAddAssistantUser: (user: AssistantUser) => void;
  onUpdateAssistantUser?: (oldMobileNumber: string, updatedUser: AssistantUser) => void;
  onAddInwardStock: (stock: Omit<WarehouseStock, "id"> | Omit<WarehouseStock, "id">[]) => void;
  onAddDispatch: (dispatch: Omit<DispatchRecord, "id" | "sourceWarehouse" | "status"> | Omit<DispatchRecord, "id" | "sourceWarehouse" | "status">[]) => void;
  onLogout: () => void;
  fertilizerRates?: Record<string, number>;
  onUpdateFertilizerRates?: (rates: Record<string, number>) => void;
  globalYear?: string;
  onYearChange?: (year: string) => void;
}

const DEFAULT_FERTILIZER_RATES: Record<string, number> = {
  "Urea (46% N)": 266,
  "DAP (18-46-0)": 1350,
  "Potash / MOP": 1700,
  "NPK 19-19-19": 1100,
  "NPK 12-32-16": 1200,
  "SSP (Single Super Phosphate)": 455,
  "Chlorpyriphos 20% EC (Pesticide)": 320,
  "Imidacloprid 17.8% SL (Pesticide)": 480,
  "Monocrotophos 36% SL (Pesticide)": 390,
  "Neem Oil 1500 PPM (Natural)": 150,
  "Glyphosate 41% SL (Herbicide)": 420,
  "Carbendazim 50% WP (Fungicide)": 350,
};

export const WarehouseManagerView: React.FC<WarehouseManagerViewProps> = ({
  stocks,
  dispatches,
  villageStocks,
  supplierBills,
  farmerDistributions,
  assistantUsers,
  fertilizerRequests = [],
  onUpdateFertilizerStatus,
  onAddAssistantUser,
  onUpdateAssistantUser,
  onAddInwardStock,
  onAddDispatch,
  onLogout,
  fertilizerRates,
  onUpdateFertilizerRates,
  globalYear,
  onYearChange,
}) => {
  const activeRates = fertilizerRates || DEFAULT_FERTILIZER_RATES;
  const [activeTab, setActiveTab] = useState<"dashboard" | "inward" | "dispatch" | "villages" | "supplier" | "inventory">("dashboard");
  const [selectedVillageLedger, setSelectedVillageLedger] = useState<VillageStockStatus | null>(null);
  const [selectedProductDetail, setSelectedProductDetail] = useState<string | null>(null);

  const [villagesTabView, setVillagesTabView] = useState<"levels" | "assistants">("levels");
  
  // New Assistant creation form states
  const [newAsstName, setNewAsstName] = useState("");
  const [newAsstMobile, setNewAsstMobile] = useState("");
  const [newAsstVillage, setNewAsstVillage] = useState("Rampur");
  const [newAsstPassword, setNewAsstPassword] = useState("password");
  const [asstSuccessAlert, setAsstSuccessAlert] = useState("");
  const [asstErrorAlert, setAsstErrorAlert] = useState("");

  // Edit Assistant states
  const [editingAssistantMobile, setEditingAssistantMobile] = useState<string | null>(null);
  const [editAsstName, setEditAsstName] = useState("");
  const [editAsstMobile, setEditAsstMobile] = useState("");
  const [editAsstVillage, setEditAsstVillage] = useState("");
  const [editAsstPassword, setEditAsstPassword] = useState("");
  const [editAsstIsActive, setEditAsstIsActive] = useState(true);

  // Timeline year/month/day tracking state
  const [timelineFilterType, setTimelineFilterType] = useState<"all" | "year" | "month" | "day">("all");
  const [selectedYear, setSelectedYear] = useState<string>("2026");
  const [selectedMonth, setSelectedMonth] = useState<string>("06"); // Defaults to June (corresponds to current date 2026-06-21)
  const [selectedDay, setSelectedDay] = useState<string>("2026-06-21");

  const MONTHS = [
    { value: "01", label: "January" },
    { value: "02", label: "February" },
    { value: "03", label: "March" },
    { value: "04", label: "April" },
    { value: "05", label: "May" },
    { value: "06", label: "June" },
    { value: "07", label: "July" },
    { value: "08", label: "August" },
    { value: "09", label: "September" },
    { value: "10", label: "October" },
    { value: "11", label: "November" },
    { value: "12", label: "December" },
  ];

  const YEARS = ["2026", "2025", "2024"];

  // Helper to filter entry records by selected timeline
  const filterByTimeline = (dateStr: string) => {
    if (timelineFilterType === "all") return true;
    if (!dateStr) return false;
    
    const parts = dateStr.split("-");
    if (parts.length < 3) return true;
    const [yr, mo, dy] = parts;

    if (timelineFilterType === "year") {
      return yr === selectedYear;
    }
    if (timelineFilterType === "month") {
      return yr === selectedYear && mo === selectedMonth;
    }
    if (timelineFilterType === "day") {
      return dateStr === selectedDay;
    }
    return true;
  };

  const renderTimelineFilter = () => {
    return (
      <div className="bg-white p-3 rounded-xl border border-slate-200/85 shadow-xs space-y-2 text-xs text-left">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
            <Clock size={12} className="text-brand-600" />
            <span>Timeline Tracking Filter</span>
          </div>
          {timelineFilterType !== "all" && (
            <span className="text-[9px] bg-brand-50 text-brand-700 px-1.5 py-0.5 rounded font-mono font-bold">
              Active: {timelineFilterType.toUpperCase()}
            </span>
          )}
        </div>
        
        {/* Filter Type Toggle */}
        <div className="grid grid-cols-4 gap-1 bg-slate-50 p-0.5 rounded-lg border border-slate-100">
          {(["all", "year", "month", "day"] as const).map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => {
                setTimelineFilterType(t);
                if (t === "day" && !selectedDay) {
                  setSelectedDay("2026-06-21");
                }
              }}
              className={`py-1 text-[10px] font-semibold rounded transition capitalize ${
                timelineFilterType === t
                  ? "bg-brand-800 text-white shadow-xs"
                  : "text-slate-500 hover:text-slate-800 hover:bg-slate-100"
              }`}
            >
              {t}
            </button>
          ))}
        </div>

        {/* Dynamic Controls based on selected type */}
        {timelineFilterType === "year" && (
          <div className="flex items-center gap-2 pt-1 animate-in slide-in-from-top-1 duration-150">
            <span className="text-slate-400 text-[10px] uppercase font-bold shrink-0">Year:</span>
            <div className="flex gap-1.5 flex-1">
              {YEARS.map(yr => (
                <button
                  key={yr}
                  onClick={() => setSelectedYear(yr)}
                  className={`flex-1 py-1 text-[10px] font-mono font-bold rounded-md border transition ${
                    selectedYear === yr
                      ? "bg-brand-50 border-brand-500 text-brand-700 font-bold"
                      : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50"
                  }`}
                >
                  {yr}
                </button>
              ))}
            </div>
          </div>
        )}

        {timelineFilterType === "month" && (
          <div className="space-y-1.5 pt-1 animate-in slide-in-from-top-1 duration-150">
            <div className="flex items-center gap-2">
              <span className="text-slate-400 text-[10px] uppercase font-bold shrink-0">Year:</span>
              <select
                value={selectedYear}
                onChange={(e) => setSelectedYear(e.target.value)}
                className="p-1 border border-slate-200 rounded text-[11px] bg-slate-150 font-mono font-bold text-slate-800"
              >
                {YEARS.map(yr => <option key={yr} value={yr}>{yr}</option>)}
              </select>
              <span className="text-slate-400 text-[10px] uppercase font-bold shrink-0 ml-1">Month:</span>
              <select
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(e.target.value)}
                className="flex-1 p-1 border border-slate-200 rounded text-[11px] bg-slate-150 font-semibold text-slate-800"
              >
                {MONTHS.map(m => <option key={m.value} value={m.value}>{m.label}</option>)}
              </select>
            </div>
          </div>
        )}

        {timelineFilterType === "day" && (
          <div className="flex items-center gap-2 pt-1 animate-in slide-in-from-top-1 duration-150">
            <span className="text-slate-400 text-[10px] uppercase font-bold shrink-0">Select Day:</span>
            <input
              type="date"
              value={selectedDay}
              onChange={(e) => {
                if (e.target.value) setSelectedDay(e.target.value);
              }}
              className="flex-1 p-1 text-[11px] font-mono text-slate-800 border border-slate-200 rounded-md bg-slate-150 font-bold focus:border-brand-500 focus:ring-1 focus:ring-brand-500"
            />
          </div>
        )}
      </div>
    );
  };

  // Local Form state for Inward Stock
  interface BulkInwardItem {
    productName: string;
    bagCount: number;
    ratePerBag: number;
  }

  const [inwardCompany, setInwardCompany] = useState(DEMO_SUPPLIERS[0]);
  const [inwardInvoiceNumber, setInwardInvoiceNumber] = useState("");
  const [inwardSuccess, setInwardSuccess] = useState(false);
  const [inwardOperatorName, setInwardOperatorName] = useState("Central Manager (Rohan Sharma)");
  const [bulkItems, setBulkItems] = useState<BulkInwardItem[]>([
    { productName: DEMO_FERTILIZERS[0], bagCount: 300, ratePerBag: activeRates[DEMO_FERTILIZERS[0]] || 266 }
  ]);

  const handleAddBulkRow = () => {
    const defaultProd = DEMO_FERTILIZERS[0];
    setBulkItems([
      ...bulkItems,
      { productName: defaultProd, bagCount: 100, ratePerBag: activeRates[defaultProd] || 266 }
    ]);
  };

  const handleRemoveBulkRow = (index: number) => {
    if (bulkItems.length <= 1) return;
    setBulkItems(bulkItems.filter((_, idx) => idx !== index));
  };

  const handleUpdateBulkRow = (index: number, field: keyof BulkInwardItem, value: any) => {
    setBulkItems(bulkItems.map((item, idx) => {
      if (idx === index) {
        const updated = { ...item, [field]: value };
        if (field === "productName") {
          updated.ratePerBag = activeRates[value as string] || 350;
        }
        return updated;
      }
      return item;
    }));
  };

  // Local Form state for Dispatches
  interface BulkDispatchItem {
    productName: string;
    bagCount: number;
  }

  const [bulkDispatchItems, setBulkDispatchItems] = useState<BulkDispatchItem[]>([
    { productName: DEMO_FERTILIZERS[0], bagCount: 80 }
  ]);

  const handleAddBulkDispatchRow = () => {
    const defaultProd = DEMO_FERTILIZERS[0];
    setBulkDispatchItems([
      ...bulkDispatchItems,
      { productName: defaultProd, bagCount: 50 }
    ]);
  };

  const handleRemoveBulkDispatchRow = (index: number) => {
    if (bulkDispatchItems.length <= 1) return;
    setBulkDispatchItems(bulkDispatchItems.filter((_, idx) => idx !== index));
  };

  const handleUpdateBulkDispatchRow = (index: number, field: keyof BulkDispatchItem, value: any) => {
    setBulkDispatchItems(bulkDispatchItems.map((item, idx) => {
      if (idx === index) {
        return { ...item, [field]: value };
      }
      return item;
    }));
  };

  const getCentralProductAvailability = (productName: string) => {
    const totalInward = stocks
      .filter((s) => s.productName === productName)
      .reduce((sum, item) => sum + item.bagCount, 0);

    const totalDispatched = dispatches
      .filter((d) => d.productName === productName)
      .reduce((sum, item) => sum + item.bagCount, 0);

    return Math.max(0, totalInward - totalDispatched);
  };

  const [dispatchSelectedVillageIdx, setDispatchSelectedVillageIdx] = useState<number>(0);
  const [dispatchSuccess, setDispatchSuccess] = useState(false);
  const [showInwardForm, setShowInwardForm] = useState(false);
  const [showDispatchForm, setShowDispatchForm] = useState(false);
  const [dispatchOperatorName, setDispatchOperatorName] = useState("Central Manager (Rohan Sharma)");
  const [linkedRequestId, setLinkedRequestId] = useState<string | null>(null);
  const [supplierBillFilter, setSupplierBillFilter] = useState<"All" | "Pending" | "Active" | "Paid">("All");
  const [villageSearch, setVillageSearch] = useState("");
  const [villageAvailabilityFilter, setVillageAvailabilityFilter] = useState<"All" | "Available" | "OutOfStock">("All");
  const [inwardFilterSearch, setInwardFilterSearch] = useState("");
  const [inwardProductFilter, setInwardProductFilter] = useState<string>("All");
  const [dispatchFilterSearch, setDispatchFilterSearch] = useState("");
  const [dispatchProductFilter, setDispatchProductFilter] = useState<string>("All");
  const [dispatchStatusFilter, setDispatchStatusFilter] = useState<"All" | "In-Transit" | "Acknowledged">("All");

  // New Search Bar states requested by the user
  const [varietySearch, setVarietySearch] = useState("");
  const [villageStockSearch, setVillageStockSearch] = useState("");
  const [supervisorSearch, setSupervisorSearch] = useState("");

  // Calculations for KPI Cards
  const totalStockBags = stocks.reduce((sum, item) => sum + item.bagCount, 0) - dispatches.reduce((sum, item) => sum + item.bagCount, 0);
  const supplierPendingCount = supplierBills.filter(b => b.paymentStatus !== "Paid").length;
  const pendingVillageAcks = dispatches.filter(d => d.status === "In-Transit").length;

  const handleInwardSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (bulkItems.length === 0) return;
    if (bulkItems.some(item => item.bagCount <= 0 || item.ratePerBag <= 0)) {
      alert("Please ensure all items have a valid quantity and rate greater than 0.");
      return;
    }
    if (!inwardInvoiceNumber.trim()) {
      alert("Please enter a valid Invoice Number.");
      return;
    }
    
    const timeStr = new Date().toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", hour12: true });
    const receivedDate = new Date().toISOString().split("T")[0];
    
    const stockEntries = bulkItems.map((item) => ({
      invoiceNumber: inwardInvoiceNumber.trim(),
      supplierName: inwardCompany,
      productName: item.productName,
      bagCount: item.bagCount,
      ratePerBag: item.ratePerBag,
      totalAmount: item.bagCount * item.ratePerBag,
      receivedDate,
      createdBy: inwardOperatorName || "Warehouse Manager",
      createdTime: timeStr
    }));
    
    onAddInwardStock(stockEntries);
    setInwardSuccess(true);
    
    // Reset form to initial row and clear invoice number
    setInwardInvoiceNumber("");
    setBulkItems([
      { productName: DEMO_FERTILIZERS[0], bagCount: 300, ratePerBag: activeRates[DEMO_FERTILIZERS[0]] || 266 }
    ]);
    
    setTimeout(() => {
      setInwardSuccess(false);
      setActiveTab("dashboard");
    }, 1500);
  };

  const handleDispatchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (bulkDispatchItems.length === 0) return;
    if (bulkDispatchItems.some(item => item.bagCount <= 0)) {
      alert("Please ensure all items have a valid quantity greater than 0.");
      return;
    }
    const selectedPlace = DEMO_VILLAGES_MAPPING[dispatchSelectedVillageIdx];

    // Check central warehouse stock availability
    for (const item of bulkDispatchItems) {
      const available = getCentralProductAvailability(item.productName);
      if (item.bagCount > available) {
        alert(`Insufficient stock for "${item.productName}". Available: ${available} Bags, Attempted to dispatch: ${item.bagCount} Bags.`);
        return;
      }
    }
    
    const timeStr = new Date().toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", hour12: true });
    const dispatchDate = new Date().toISOString().split("T")[0];
    
    const dispatchesToAdd = bulkDispatchItems.map((item) => ({
      productName: item.productName,
      bagCount: item.bagCount,
      villageName: selectedPlace.villageName,
      assistantName: selectedPlace.assistantName,
      dispatchDate,
      createdBy: dispatchOperatorName || "Warehouse Manager",
      createdTime: timeStr
    }));
    
    onAddDispatch(dispatchesToAdd);

    if (linkedRequestId && onUpdateFertilizerStatus) {
      onUpdateFertilizerStatus(linkedRequestId, "Dispatched");
      setLinkedRequestId(null);
    }

    setDispatchSuccess(true);
    // Reset form to initial single row
    setBulkDispatchItems([
      { productName: DEMO_FERTILIZERS[0], bagCount: 80 }
    ]);

    setTimeout(() => {
      setDispatchSuccess(false);
      setActiveTab("dashboard");
    }, 1500);
  };

  const handleRegisterAssistantSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAsstName || !newAsstMobile || !newAsstVillage) {
      setAsstErrorAlert("Please fill in all details.");
      return;
    }

    const cleanMobile = newAsstMobile.trim().replace(/\s+/g, "");
    const exists = assistantUsers.some(u => u.mobileNumber.trim().replace(/\D/g, "") === cleanMobile.replace(/\D/g, ""));
    if (exists) {
      setAsstErrorAlert(`An assistant with mobile number ${newAsstMobile} is already registered.`);
      setAsstSuccessAlert("");
      return;
    }

    const newObj: AssistantUser = {
      name: newAsstName.trim(),
      mobileNumber: cleanMobile,
      villageName: newAsstVillage,
      password: newAsstPassword || "password"
    };

    onAddAssistantUser(newObj);
    setAsstSuccessAlert(`Registered ${newAsstName} mapped to ${newAsstVillage}!`);
    setAsstErrorAlert("");
    
    // Reset form
    setNewAsstName("");
    setNewAsstMobile("");
    setNewAsstPassword("password");

    setTimeout(() => {
      setAsstSuccessAlert("");
    }, 3000);
  };

  const handleEditAssistantSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingAssistantMobile) return;
    if (!editAsstName || !editAsstMobile || !editAsstVillage) {
      setAsstErrorAlert("Please fill in all details for editing.");
      return;
    }

    const cleanMobile = editAsstMobile.trim().replace(/\s+/g, "");
    
    // Check if new mobile number already exists for ANOTHER assistant
    const exists = assistantUsers.some(
      u => u.mobileNumber !== editingAssistantMobile && 
           u.mobileNumber.trim().replace(/\D/g, "") === cleanMobile.replace(/\D/g, "")
    );
    if (exists) {
      setAsstErrorAlert(`An assistant with mobile number ${editAsstMobile} is already registered.`);
      return;
    }

    const updatedObj: AssistantUser = {
      name: editAsstName.trim(),
      mobileNumber: cleanMobile,
      villageName: editAsstVillage,
      password: editAsstPassword || "password",
      isActive: editAsstIsActive
    };

    if (onUpdateAssistantUser) {
      onUpdateAssistantUser(editingAssistantMobile, updatedObj);
    }

    setAsstSuccessAlert(`Updated details for supervisor ${editAsstName}!`);
    setAsstErrorAlert("");
    
    // Clear editing state
    setEditingAssistantMobile(null);

    setTimeout(() => {
      setAsstSuccessAlert("");
    }, 3000);
  };

  return (
    <div className="flex-1 flex flex-col justify-start relative">
      {/* Floating Right Scroll Buttons */}
      <div className="fixed bottom-24 right-6 z-40 flex flex-col gap-2">
        <button
          type="button"
          onClick={() => {
            document.getElementById("inner-web-screen")?.scrollBy({ top: -300, behavior: "smooth" });
          }}
          className="w-10 h-10 rounded-full bg-brand-850 hover:bg-brand-900 text-white shadow-xl border border-brand-700/30 flex items-center justify-center transition active:scale-95 cursor-pointer"
          title="Scroll Up"
        >
          <ArrowUp size={18} />
        </button>
        <button
          type="button"
          onClick={() => {
            document.getElementById("inner-web-screen")?.scrollBy({ top: 300, behavior: "smooth" });
          }}
          className="w-10 h-10 rounded-full bg-brand-850 hover:bg-brand-900 text-white shadow-xl border border-brand-700/30 flex items-center justify-center transition active:scale-95 cursor-pointer"
          title="Scroll Down"
        >
          <ArrowDown size={18} />
        </button>
      </div>

      {/* Top Header Section */}
      <div className="bg-gradient-to-r from-brand-900 via-brand-800 to-brand-900 text-white px-5 py-4 flex items-center justify-between sticky top-0 z-10 shadow-md border-b border-brand-950/30">
        <div className="flex flex-col">
          <span className="text-[11px] font-semibold text-white/80 uppercase tracking-wider">
            Warehouse Manager
          </span>
          <h2 className="text-sm font-bold font-display text-white">
            Central Hub - Indore
          </h2>
        </div>
        <div className="flex items-center gap-2">
          {onYearChange && globalYear && (
            <div className="flex items-center gap-1.5 bg-white/15 border border-white/20 px-2 py-0.5 rounded-lg shadow-2xs">
              <span className="text-[9.5px] uppercase font-bold text-white/80">Year:</span>
              <select
                value={globalYear}
                onChange={(e) => onYearChange(e.target.value)}
                className="bg-transparent text-white text-xs font-bold outline-none cursor-pointer pr-1 [&>option]:text-slate-900 [&>option]:bg-white"
              >
                <option value="2026">2026</option>
                <option value="2025">2025</option>
                <option value="2024">2024</option>
              </select>
            </div>
          )}
          <button
            onClick={onLogout}
            className="text-[10px] px-2 py-1 bg-white/10 hover:bg-white/20 text-white rounded-lg font-bold border border-white/15 transition"
          >
            Logout
          </button>
        </div>
      </div>

      {/* Main Containers */}
      <div className="flex-1 flex flex-col md:flex-row min-h-0 bg-slate-50">
        
        {/* Navigation Sidebar (Left Column) */}
        <div className="w-full md:w-60 bg-white border-b md:border-b-0 md:border-r border-slate-200/80 flex flex-col shrink-0 text-xs py-4 px-3 space-y-1 text-left select-none md:sticky md:top-[68px] md:h-[calc(100vh-68px)] md:overflow-y-auto">
          <div className="px-2 pb-2 mb-2 border-b border-slate-100 hidden md:block">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Warehouse Menu</span>
          </div>

          <button
            onClick={() => setActiveTab("dashboard")}
            className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl font-bold transition text-[11px] ${
              activeTab === "dashboard"
                ? "bg-brand-800 text-white shadow-sm"
                : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
            }`}
          >
            <div className="flex items-center gap-2">
              <LayoutDashboard size={14} className="shrink-0" />
              <span>Dashboard</span>
            </div>
          </button>

          <button
            onClick={() => {
              setActiveTab("inventory");
              setSelectedVillageLedger(null);
            }}
            className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl font-bold transition text-[11px] ${
              activeTab === "inventory"
                ? "bg-brand-800 text-white shadow-sm"
                : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
            }`}
          >
            <div className="flex items-center gap-2">
              <Layers size={14} className="shrink-0" />
              <span>Inventory</span>
            </div>
            <span className={`text-[9px] px-1.5 py-0.5 rounded-full font-bold ${activeTab === 'inventory' ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-600'}`}>
              {stocks.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab("inward")}
            className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl font-bold transition text-[11px] ${
              activeTab === "inward"
                ? "bg-brand-800 text-white shadow-sm"
                : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
            }`}
          >
            <div className="flex items-center gap-2">
              <PlusCircle size={14} className="shrink-0" />
              <span>+ Inward Stock</span>
            </div>
          </button>

          <button
            onClick={() => setActiveTab("dispatch")}
            className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl font-bold transition text-[11px] ${
              activeTab === "dispatch"
                ? "bg-brand-800 text-white shadow-sm"
                : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
            }`}
          >
            <div className="flex items-center gap-2">
              <Send size={14} className="shrink-0" />
              <span>→ Dispatch</span>
            </div>
            {pendingVillageAcks > 0 && (
              <span className="bg-amber-500 text-white text-[8px] font-extrabold px-1.5 py-0.5 rounded-full">
                {pendingVillageAcks}
              </span>
            )}
          </button>

          <button
            onClick={() => {
              setActiveTab("villages");
              setSelectedVillageLedger(null);
            }}
            className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl font-bold transition text-[11px] ${
              activeTab === "villages"
                ? "bg-brand-800 text-white shadow-sm"
                : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
            }`}
          >
            <div className="flex items-center gap-2">
              <MapPin size={14} className="shrink-0" />
              <span>Village Stock</span>
            </div>
          </button>

          <button
            onClick={() => setActiveTab("supplier")}
            className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl font-bold transition text-[11px] ${
              activeTab === "supplier"
                ? "bg-brand-800 text-white shadow-sm"
                : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
            }`}
          >
            <div className="flex items-center gap-2">
              <Receipt size={14} className="shrink-0" />
              <span>Supplier Bills</span>
            </div>
            <span className={`text-[9px] px-1.5 py-0.5 rounded-full font-bold ${activeTab === 'supplier' ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-600'}`}>
              {supplierBills.length}
            </span>
          </button>
        </div>

        {/* Right Scrollable Panel (Main Dashboard Content) */}
        <div className="flex-1 p-4 overflow-y-auto space-y-4 no-scrollbar">

        {/* TAB 1: DASHBOARD */}
        {activeTab === "dashboard" && (
          <div className="space-y-4">
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm space-y-3 text-left">
              <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
                <div>
                  <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Central Hub Storage Levels</span>
                  <span className="text-base font-extrabold text-slate-800 mt-0.5 block">Fertilizer Variety Splits</span>
                </div>
                <div className="text-right flex items-center gap-2">
                  <div className="p-2 bg-brand-50 text-brand-800 rounded-lg">
                    <Package size={16} />
                  </div>
                  <div>
                    <span className="text-base font-extrabold text-slate-850 font-mono block leading-none">{totalStockBags.toLocaleString()}</span>
                    <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wide block mt-1">Total Bags</span>
                  </div>
                </div>
              </div>

              <div className="overflow-hidden border border-slate-150 rounded-xl bg-slate-50/50">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="bg-slate-100 border-b border-slate-200 text-slate-500 text-[10px] font-bold uppercase tracking-wider">
                        <th className="py-2.5 px-3 font-semibold">Variety Name</th>
                        <th className="py-2.5 px-3 text-right font-semibold">Available Qty</th>
                        <th className="py-2.5 px-3 text-right font-semibold">Total Consigned</th>
                        <th className="py-2.5 px-3 text-right font-semibold">Status Ratio</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-150">
                      {DEMO_FERTILIZERS.map((pName) => {
                        const totalInward = stocks
                          .filter((s) => s.productName === pName)
                          .reduce((sum, item) => sum + item.bagCount, 0);

                        const totalDispatched = dispatches
                          .filter((d) => d.productName === pName)
                          .reduce((sum, item) => sum + item.bagCount, 0);

                        const available = Math.max(0, totalInward - totalDispatched);

                        return (
                          <tr key={pName} className="hover:bg-slate-100/55 font-semibold text-slate-800">
                            <td className="py-2 px-3 text-[11px] text-slate-900 font-bold">{pName}</td>
                            <td className="py-2 px-3 text-right font-mono text-brand-850 font-bold">{available.toLocaleString()} Bags</td>
                            <td className="py-2 px-3 text-right font-mono text-slate-500">{totalInward.toLocaleString()} Bags</td>
                            <td className="py-2 px-3 text-right">
                              <span className={`text-[9px] font-extrabold font-mono px-2 py-0.5 rounded border ${
                                available === 0 
                                  ? "bg-rose-50 text-rose-700 border-rose-200" 
                                  : available <= 100 
                                  ? "bg-amber-50 text-amber-700 border-amber-200 animate-pulse" 
                                  : "bg-emerald-50 text-emerald-700 border-emerald-200"
                              }`}>
                                {totalInward > 0 ? `${Math.round((available / totalInward) * 100)}% Avail` : "0% Avail"}
                              </span>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            {/* KPI grid with smaller elegant cards */}
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setActiveTab("villages")}
                className="bg-white p-2.5 text-left rounded-xl border border-slate-200 shadow-xs flex flex-col justify-between cursor-pointer hover:border-amber-300 hover:shadow-xs transition"
              >
                <span className="text-[9px] text-slate-400 font-bold uppercase block tracking-tight">
                  Pending Acks
                </span>
                <div className="flex items-baseline justify-between mt-0.5">
                  <span className="text-sm font-extrabold text-amber-600 font-mono">
                    {pendingVillageAcks} <span className="text-[9px] text-slate-400 font-medium font-sans">lots</span>
                  </span>
                </div>
                <span className="text-[8px] text-slate-400 mt-0.5 block leading-tight">In-Transit Status</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab("supplier")}
                className="bg-white p-2.5 text-left rounded-xl border border-slate-200 shadow-xs flex flex-col justify-between cursor-pointer hover:border-rose-300 hover:shadow-xs transition"
              >
                <span className="text-[9px] text-slate-400 font-bold uppercase block tracking-tight">
                  Supplier Bills
                </span>
                <div className="flex items-baseline justify-between mt-0.5">
                  <span className="text-sm font-extrabold text-rose-600 font-mono">
                    {supplierPendingCount} <span className="text-[9px] text-slate-400 font-medium font-sans">due</span>
                  </span>
                </div>
                <span className="text-[8px] text-rose-500 font-semibold mt-0.5 block leading-tight">Awaiting Payment</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab("dispatch")}
                className="bg-white p-2.5 text-left rounded-xl border border-slate-200 shadow-xs flex flex-col justify-between cursor-pointer hover:border-blue-300 hover:shadow-xs transition"
              >
                <span className="text-[9px] text-slate-400 font-bold uppercase block tracking-tight">
                  Asst. Requests
                </span>
                <div className="flex items-baseline justify-between mt-0.5">
                  <span className="text-sm font-extrabold text-blue-600 font-mono">
                    {fertilizerRequests.filter(r => r.status === "Pending").length} <span className="text-[9px] text-slate-400 font-medium font-sans">reqs</span>
                  </span>
                </div>
                <span className="text-[8px] text-blue-500 font-semibold mt-0.5 block leading-tight">Need Addressal</span>
              </button>
            </div>

            {/* Quick Actions Panel */}
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-3">
                Logistics Shortcuts
              </h3>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => setActiveTab("inward")}
                  className="flex items-center gap-2 p-2.5 bg-slate-50 hover:bg-slate-100 rounded-lg text-left"
                >
                  <span className="p-1.5 bg-emerald-100 text-emerald-700 rounded-md">
                    <Plus size={14} />
                  </span>
                  <div>
                    <span className="text-xs font-semibold text-slate-700 block">Record Inward</span>
                    <span className="text-[9px] text-slate-400 block">From manufacturer</span>
                  </div>
                </button>

                <button
                  onClick={() => setActiveTab("dispatch")}
                  className="flex items-center gap-2 p-2.5 bg-slate-50 hover:bg-slate-100 rounded-lg text-left"
                >
                  <span className="p-1.5 bg-brand-100 text-brand-700 rounded-md">
                    <Send size={14} />
                  </span>
                  <div>
                    <span className="text-xs font-semibold text-slate-700 block">Create Dispatch</span>
                    <span className="text-[9px] text-slate-400 block">Send to Assistant</span>
                  </div>
                </button>
              </div>
            </div>

            {/* Recent Shipments List */}
            <div className="space-y-2">
              <div className="flex items-center justify-between px-1">
                <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                  Recent Dispatches
                </span>
                <button
                  onClick={() => {
                    setActiveTab("villages");
                    setSelectedVillageLedger(null);
                  }}
                  className="text-[10px] text-brand-600 font-semibold"
                >
                  View All &rarr;
                </button>
              </div>

              <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden mt-1">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 text-[10px] font-bold uppercase tracking-wider">
                        <th className="py-2.5 px-3">Dispatch ID</th>
                        <th className="py-2.5 px-3">Product Name</th>
                        <th className="py-2.5 px-3">Village Depot</th>
                        <th className="py-2.5 px-3">Field Assistant</th>
                        <th className="py-2.5 px-3 text-right">Bags Qty</th>
                        <th className="py-2.5 px-3">Date Shipped</th>
                        <th className="py-2.5 px-3">Transit Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-150">
                      {(() => {
                        const items = dispatches;
                        if (items.length === 0) {
                          return (
                            <tr>
                              <td colSpan={7} className="py-6 text-center text-slate-400 italic">
                                No dispatches found.
                              </td>
                            </tr>
                          );
                        }
                        return items.slice().reverse().map((disc) => (
                          <tr key={disc.id} className="hover:bg-slate-50/60 font-semibold text-slate-800">
                            <td className="py-2.5 px-3 font-mono text-[10px] text-slate-500 bg-slate-50/50">{disc.id}</td>
                            <td className="py-2.5 px-3 text-[11px] font-bold text-slate-900">{disc.productName}</td>
                            <td className="py-2.5 px-3 text-slate-700">{disc.villageName}</td>
                            <td className="py-2.5 px-3 text-slate-500">{disc.assistantName}</td>
                            <td className="py-2.5 px-3 text-right font-mono font-extrabold text-blue-900">{disc.bagCount.toLocaleString()} Bags</td>
                            <td className="py-2.5 px-3 font-mono text-slate-450">{disc.dispatchDate}</td>
                            <td className="py-2.5 px-3">
                              <span className={`text-[9px] font-extrabold px-1.5 py-0.5 rounded ${
                                disc.status === "Acknowledged" ? "bg-emerald-50 text-emerald-700" : "bg-amber-50 text-amber-700 animate-pulse"
                              }`}>
                                {disc.status}
                              </span>
                            </td>
                          </tr>
                        ));
                      })()}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

          </div>
        )}

        {/* TAB 2: INWARD STOCK ENTRY */}
        {activeTab === "inward" && (
          <div className="space-y-5">
            {/* INWARD STOCK FORM */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b border-slate-100 pb-3">
                <div>
                  <h2 className="text-base font-bold text-slate-800">Receive Inward Stock</h2>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Record newly received fertilizer shipments at the Indore Main Warehouse directly from manufacturers.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setShowInwardForm(!showInwardForm)}
                  className="px-3.5 py-2 bg-brand-600 hover:bg-brand-700 text-white text-[11px] font-bold rounded-lg flex items-center gap-1.5 cursor-pointer transition whitespace-nowrap self-end sm:self-auto shadow-xs"
                >
                  {showInwardForm ? "✕ Hide Form" : "+ Receive Inward Stock"}
                </button>
              </div>

              {showInwardForm && (
                <div className="space-y-4 animate-in fade-in duration-200">
                  {inwardSuccess ? (
                <div className="p-6 bg-emerald-50 text-emerald-800 rounded-xl text-center space-y-2 border border-emerald-100">
                  <CheckCircle2 size={36} className="mx-auto text-emerald-600 animate-bounce" />
                  <h3 className="font-bold text-sm">Shipment Logged Successfully!</h3>
                  <p className="text-xs text-emerald-700">Stock updated automatically in the local ledger.</p>
                </div>
              ) : (
                <form onSubmit={handleInwardSubmit} className="space-y-5 text-xs">
                  {/* General Invoice Meta Info */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-slate-50/50 p-4 rounded-xl border border-slate-100">
                    <div>
                      <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                        Supplier / Manufacturer
                      </label>
                      <select
                        value={inwardCompany}
                        onChange={(e) => setInwardCompany(e.target.value)}
                        className="w-full p-2.5 border border-slate-200 rounded-lg text-xs bg-white font-semibold text-slate-800 focus:ring-2 focus:ring-brand-500 focus:border-brand-500"
                      >
                        {DEMO_SUPPLIERS.map((s) => (
                          <option key={s} value={s}>{s}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                        Invoice Number
                      </label>
                      <input
                        type="text"
                        required
                        value={inwardInvoiceNumber}
                        onChange={(e) => setInwardInvoiceNumber(e.target.value)}
                        placeholder="e.g. INV-IFFCO-2026-05"
                        className="w-full p-2.5 border border-slate-200 rounded-lg text-xs bg-white text-slate-850 font-semibold focus:ring-2 focus:ring-brand-500 focus:border-brand-500"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                        Log Entry Operator Name
                      </label>
                      <input
                        type="text"
                        required
                        value={inwardOperatorName}
                        onChange={(e) => setInwardOperatorName(e.target.value)}
                        placeholder="Enter your name"
                        className="w-full p-2.5 border border-slate-200 rounded-lg text-xs bg-white text-slate-850 font-semibold focus:ring-2 focus:ring-brand-500 focus:border-brand-500"
                      />
                    </div>
                  </div>

                  {/* Shipment Itemized Manifest */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                      <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-400">
                        Shipment Itemized Manifest (Fertilizers &amp; Pesticides)
                      </span>
                      <button
                        type="button"
                        onClick={handleAddBulkRow}
                        className="text-[11px] bg-brand-50 hover:bg-brand-100 text-brand-700 font-bold px-2.5 py-1 rounded-md transition flex items-center gap-1 border border-brand-200 cursor-pointer"
                      >
                        <Plus size={12} />
                        <span>Add Product Row</span>
                      </button>
                    </div>

                    <div className="space-y-2.5">
                      {bulkItems.map((item, idx) => (
                        <div
                          key={idx}
                          className="grid grid-cols-1 md:grid-cols-12 gap-3 bg-white p-3.5 rounded-xl border border-slate-150 shadow-xs relative items-center animate-in fade-in-50 duration-150"
                        >
                          {/* Product Selection */}
                          <div className="md:col-span-5">
                            <label className="block text-[9px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                              Product Name
                            </label>
                            <select
                              value={item.productName}
                              onChange={(e) => handleUpdateBulkRow(idx, "productName", e.target.value)}
                              className="w-full p-2 border border-slate-200 rounded-md text-[11px] font-medium text-slate-800 bg-slate-50/50"
                            >
                              {DEMO_FERTILIZERS.map((f) => (
                                <option key={f} value={f}>{f}</option>
                              ))}
                            </select>
                          </div>

                          {/* Bag Count */}
                          <div className="md:col-span-2">
                            <label className="block text-[9px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                              Quantity (Bags / Units)
                            </label>
                            <input
                              type="number"
                              required
                              min="1"
                              value={item.bagCount}
                              onChange={(e) => handleUpdateBulkRow(idx, "bagCount", Math.max(1, parseInt(e.target.value) || 0))}
                              className="w-full p-2 border border-slate-200 rounded-md text-[11px] font-semibold text-slate-800 bg-slate-50/50"
                            />
                          </div>

                          {/* Rate Per Bag */}
                          <div className="md:col-span-2">
                            <label className="block text-[9px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                              Rate per Unit (₹)
                            </label>
                            <input
                              type="number"
                              required
                              min="1"
                              value={item.ratePerBag}
                              onChange={(e) => handleUpdateBulkRow(idx, "ratePerBag", Math.max(1, parseInt(e.target.value) || 0))}
                              className="w-full p-2 border border-slate-200 rounded-md text-[11px] font-semibold text-slate-800 bg-slate-50/50"
                            />
                          </div>

                          {/* Item Total Subtotal */}
                          <div className="md:col-span-2 text-right px-2">
                            <span className="block text-[9px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                              Subtotal
                            </span>
                            <span className="font-mono font-bold text-slate-700 text-xs">
                              ₹ {(item.bagCount * item.ratePerBag).toLocaleString()}
                            </span>
                          </div>

                          {/* Actions */}
                          <div className="md:col-span-1 flex justify-end">
                            <button
                              type="button"
                              disabled={bulkItems.length <= 1}
                              onClick={() => handleRemoveBulkRow(idx)}
                              className={`p-1.5 rounded-lg border transition ${
                                bulkItems.length <= 1
                                  ? "opacity-30 cursor-not-allowed text-slate-300 border-slate-100"
                                  : "text-rose-500 border-rose-100 bg-rose-50 hover:bg-rose-100 cursor-pointer"
                              }`}
                              title="Delete Item"
                            >
                              <Trash2 size={13} />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Quick dashed add button */}
                    <button
                      type="button"
                      onClick={handleAddBulkRow}
                      className="w-full py-2.5 border border-dashed border-slate-200 hover:border-brand-300 hover:bg-brand-50/20 text-slate-500 hover:text-brand-700 font-semibold rounded-lg text-center transition flex items-center justify-center gap-1.5 cursor-pointer mt-1"
                    >
                      <Plus size={14} />
                      <span>Add Another Product to Invoice</span>
                    </button>
                  </div>

                  {/* Shipment Grand Total Summary Panel */}
                  <div className="bg-slate-50 p-4 rounded-xl border border-slate-150 space-y-3 mt-4">
                    <div className="flex justify-between items-center text-[10px] text-slate-400 uppercase font-bold tracking-wider">
                      <span>Shipment Summary</span>
                      <span className="text-brand-700 bg-brand-50 border border-brand-100 px-2 py-0.5 rounded">
                        {bulkItems.length} Products Selected
                      </span>
                    </div>

                    <div className="grid grid-cols-3 gap-2 text-center">
                      <div className="bg-white p-2 rounded-lg border border-slate-100">
                        <span className="text-[10px] text-slate-400 block font-medium">Distinct Products</span>
                        <span className="text-sm font-bold text-slate-800">{bulkItems.length}</span>
                      </div>
                      <div className="bg-white p-2 rounded-lg border border-slate-100">
                        <span className="text-[10px] text-slate-400 block font-medium">Total Volume</span>
                        <span className="text-sm font-bold text-slate-800 font-mono">
                          {bulkItems.reduce((acc, item) => acc + item.bagCount, 0).toLocaleString()} Bags
                        </span>
                      </div>
                      <div className="bg-white p-2 rounded-lg border border-slate-100">
                        <span className="text-[10px] text-slate-400 block font-medium">Total Shipment Value</span>
                        <span className="text-sm font-bold text-brand-700 font-mono">
                          ₹ {bulkItems.reduce((acc, item) => acc + (item.bagCount * item.ratePerBag), 0).toLocaleString()}
                        </span>
                      </div>
                    </div>

                    <p className="text-[10px] text-slate-400 leading-normal text-center pt-1 border-t border-slate-100/50">
                      * Generating this bulk inward entry automatically creates a pending supplier invoice bill for the Accountant per product variety, and updates central depot stock metrics instantly.
                    </p>
                  </div>

                  <button
                    type="submit"
                    className="w-full py-3 bg-brand-600 hover:bg-brand-700 text-white font-medium rounded-lg shadow-md hover:shadow-brand-600/10 transition cursor-pointer text-xs flex items-center justify-center gap-1.5"
                  >
                    <CheckCircle2 size={14} />
                    <span>Log Bulk Inward Shipment Lot ({bulkItems.length} Items)</span>
                  </button>
                </form>
              )}
                </div>
              )}
            </div>

            {/* LEDGER INWARD RECORDS DISPLAY */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4 text-left">
              <div className="border-b border-slate-100 pb-3 flex justify-between items-center flex-wrap gap-2">
                <div>
                  <h2 className="text-base font-bold text-slate-800">Inward Stock Shipment Records</h2>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Live traceability history of all incoming shipments enrolled at Indore Central depot.
                  </p>
                </div>
                <span className="bg-slate-100 border border-slate-200 font-mono text-slate-700 text-[10.5px] font-extrabold px-2.5 py-1 rounded-lg">
                  {stocks.length} Inward Lots
                </span>
              </div>

              {/* Advanced Search & Filtering Utilities */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="relative">
                  <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                  <input
                    type="text"
                    placeholder="Search supplier, variety or manager..."
                    value={inwardFilterSearch}
                    onChange={(e) => setInwardFilterSearch(e.target.value)}
                    className="w-full pl-8 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-brand-500 focus:bg-white text-slate-800"
                  />
                </div>
                <div>
                  <select
                    value={inwardProductFilter}
                    onChange={(e) => setInwardProductFilter(e.target.value)}
                    className="w-full p-2 border border-slate-200 rounded-lg text-xs bg-slate-50 text-slate-700 focus:outline-none focus:ring-1 focus:ring-brand-500 font-semibold cursor-pointer"
                  >
                    <option value="All">All Varieties (Filter)</option>
                    {DEMO_FERTILIZERS.map((f) => (
                      <option key={f} value={f}>{f}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Display Table/List of Inward Stock */}
              {(() => {
                const filteredInward = stocks.filter((stock) => {
                  const mSearch = 
                    stock.supplierName.toLowerCase().includes(inwardFilterSearch.toLowerCase()) ||
                    stock.productName.toLowerCase().includes(inwardFilterSearch.toLowerCase()) ||
                    (stock.invoiceNumber && stock.invoiceNumber.toLowerCase().includes(inwardFilterSearch.toLowerCase())) ||
                    (stock.createdBy && stock.createdBy.toLowerCase().includes(inwardFilterSearch.toLowerCase()));
                  const mProd = inwardProductFilter === "All" || stock.productName === inwardProductFilter;
                  return mSearch && mProd;
                });

                if (filteredInward.length === 0) {
                  return (
                    <div className="py-12 border-2 border-dashed border-slate-150 rounded-xl text-center space-y-2">
                      <Package size={32} className="mx-auto text-slate-300 animate-pulse" />
                      <p className="text-slate-400 text-xs font-bold">No inward shipment records match the selected options.</p>
                    </div>
                  );
                }

                return (
                  <div className="overflow-hidden border border-slate-200 rounded-xl bg-white shadow-xs">
                    <div className="overflow-x-auto">
                      <table className="w-full text-left border-collapse text-xs">
                        <thead>
                          <tr className="bg-slate-100 border-b border-slate-200 text-slate-600 text-[10px] font-bold uppercase tracking-wider">
                            <th className="py-2.5 px-3">Invoice No.</th>
                            <th className="py-2.5 px-3">Product Name</th>
                            <th className="py-2.5 px-3">Manufacturer / Supplier</th>
                            <th className="py-2.5 px-3 text-right">Inward Qty</th>
                            <th className="py-2.5 px-3 text-right">Rate/Bag</th>
                            <th className="py-2.5 px-3 text-right">Total Valuation</th>
                            <th className="py-2.5 px-3">Received Date</th>
                            <th className="py-2.5 px-3">Recorded By</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-150 font-medium">
                          {filteredInward.slice().reverse().map((stock) => {
                            const valuation = stock.totalAmount || (stock.bagCount * stock.ratePerBag);
                            return (
                              <tr key={stock.id} className="hover:bg-slate-50/50 font-semibold text-slate-800">
                                <td className="py-3 px-3 font-mono text-[10px] text-brand-700 bg-brand-50/20 font-bold rounded-md">
                                  {stock.invoiceNumber || stock.id}
                                </td>
                                <td className="py-3 px-3 text-[11px] font-bold text-slate-900">{stock.productName}</td>
                                <td className="py-3 px-3 text-slate-600">{stock.supplierName}</td>
                                <td className="py-3 px-3 text-right font-mono text-blue-900 font-extrabold">{stock.bagCount.toLocaleString()} Bags</td>
                                <td className="py-3 px-3 text-right font-mono text-slate-500">₹ {stock.ratePerBag}</td>
                                <td className="py-3 px-3 text-right font-mono text-emerald-800 font-bold">₹ {valuation.toLocaleString()}</td>
                                <td className="py-3 px-3 font-mono text-slate-500">{stock.receivedDate} {stock.createdTime ? `@ ${stock.createdTime}` : ""}</td>
                                <td className="py-3 px-3 text-slate-500 text-[10.5px]">{stock.createdBy || "System Initialized"}</td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  </div>
                );
              })()}
            </div>
          </div>
        )}

        {/* TAB 3: DISPATCH TO VILLAGE AND REQUISITIONS RECONCILIATION */}
        {activeTab === "dispatch" && (
          <div className="space-y-5">
            
            {/* LINE/PANEL: DISPATCH OPERATOR FORM */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b border-slate-100 pb-3">
                <div>
                  <h2 className="text-base font-bold text-slate-800">Issue Village Dispatch</h2>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Send stock from Indore Central Hub to local center warehouses. Mark as transit to auto-fill local stocks upon supervisor check.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setShowDispatchForm(!showDispatchForm)}
                  className="px-3.5 py-2 bg-brand-600 hover:bg-brand-700 text-white text-[11px] font-bold rounded-lg flex items-center gap-1.5 cursor-pointer transition whitespace-nowrap self-end sm:self-auto shadow-xs"
                >
                  {showDispatchForm ? "✕ Hide Form" : "+ Issue Village Dispatch"}
                </button>
              </div>

              {showDispatchForm && (
                <div className="space-y-4 animate-in fade-in duration-200">
                  {linkedRequestId && (
                <div className="bg-amber-50 text-amber-800 p-2.5 rounded-lg border border-amber-200 flex justify-between items-center text-[10.5px]">
                  <div className="flex items-center gap-1.5">
                    <AlertCircle size={14} className="text-amber-600 shrink-0" />
                    <span>Processing Village Indent: <strong className="font-mono">{linkedRequestId}</strong></span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setLinkedRequestId(null)}
                    className="text-amber-600 hover:text-amber-800 font-bold hover:underline cursor-pointer"
                  >
                    Clear Link
                  </button>
                </div>
              )}

              {dispatchSuccess ? (
                <div className="p-6 bg-emerald-50 text-emerald-800 rounded-xl text-center space-y-2 border border-emerald-100 animate-in fade-in">
                  <CheckCircle2 size={36} className="mx-auto text-emerald-600 animate-bounce" />
                  <h3 className="font-bold text-sm">Dispatch Registered!</h3>
                  <p className="text-xs text-emerald-700">Lot is marked In-Transit. Local Village assistant has been notified.</p>
                </div>
              ) : (
                <form onSubmit={handleDispatchSubmit} className="space-y-5 text-xs font-medium">
                  {/* General Dispatch Meta Info */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-slate-50/50 p-4 rounded-xl border border-slate-100">
                    <div>
                      <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                        Village Depot &amp; Assistant
                      </label>
                      <select
                        value={dispatchSelectedVillageIdx}
                        onChange={(e) => setDispatchSelectedVillageIdx(parseInt(e.target.value))}
                        className="w-full p-2.5 border border-slate-200 rounded-lg text-xs bg-white text-slate-800 font-semibold focus:ring-2 focus:ring-brand-500 focus:border-brand-500"
                      >
                        {DEMO_VILLAGES_MAPPING.map((v, idx) => (
                          <option key={idx} value={idx}>{v.villageName} ({v.assistantName})</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                        Authorized / Dispatched By (Operator Name)
                      </label>
                      <input
                        type="text"
                        required
                        value={dispatchOperatorName}
                        onChange={(e) => setDispatchOperatorName(e.target.value)}
                        placeholder="Enter operator name"
                        className="w-full p-2.5 border border-slate-200 rounded-lg text-xs bg-white text-slate-855 font-semibold focus:ring-2 focus:ring-brand-500 focus:border-brand-500"
                      />
                    </div>
                  </div>

                  {/* Dispatch Itemized Manifest */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                      <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-400">
                        Dispatch Itemized Manifest (Fertilizers &amp; Pesticides)
                      </span>
                      <button
                        type="button"
                        onClick={handleAddBulkDispatchRow}
                        className="text-[11px] bg-brand-50 hover:bg-brand-100 text-brand-700 font-bold px-2.5 py-1 rounded-md transition flex items-center gap-1 border border-brand-200 cursor-pointer"
                      >
                        <Plus size={12} />
                        <span>Add Product Row</span>
                      </button>
                    </div>

                    <div className="space-y-2.5">
                      {bulkDispatchItems.map((item, idx) => {
                        const available = getCentralProductAvailability(item.productName);
                        const isOverStock = item.bagCount > available;

                        return (
                          <div
                            key={idx}
                            className={`grid grid-cols-1 md:grid-cols-12 gap-3 p-3.5 rounded-xl border shadow-xs relative items-center animate-in fade-in-50 duration-150 ${
                              isOverStock 
                                ? "bg-rose-50/30 border-rose-200" 
                                : "bg-white border-slate-150"
                            }`}
                          >
                            {/* Product Selection */}
                            <div className="md:col-span-6">
                              <label className="block text-[9px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                                Product Name
                              </label>
                              <select
                                value={item.productName}
                                onChange={(e) => handleUpdateBulkDispatchRow(idx, "productName", e.target.value)}
                                className="w-full p-2 border border-slate-200 rounded-md text-[11px] font-medium text-slate-800 bg-slate-50/50"
                              >
                                {DEMO_FERTILIZERS.map((f) => (
                                  <option key={f} value={f}>{f}</option>
                                ))}
                              </select>
                            </div>

                            {/* Bag Count */}
                            <div className="md:col-span-3">
                              <label className="block text-[9px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                                Quantity (Bags / Units)
                              </label>
                              <input
                                type="number"
                                required
                                min="1"
                                value={item.bagCount}
                                onChange={(e) => handleUpdateBulkDispatchRow(idx, "bagCount", Math.max(1, parseInt(e.target.value) || 0))}
                                className={`w-full p-2 border rounded-md text-[11px] font-semibold text-slate-800 bg-slate-50/50 ${
                                  isOverStock ? "border-rose-300 text-rose-700" : "border-slate-200"
                                }`}
                              />
                            </div>

                            {/* Central Depot Stock Availability Status */}
                            <div className="md:col-span-2 text-right px-2">
                              <span className="block text-[9px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                                Depot Available
                              </span>
                              <span className={`font-mono font-bold text-xs ${
                                isOverStock ? "text-rose-600 animate-pulse font-extrabold" : "text-slate-500"
                              }`}>
                                {available.toLocaleString()} Bags
                              </span>
                            </div>

                            {/* Actions */}
                            <div className="md:col-span-1 flex justify-end">
                              <button
                                type="button"
                                disabled={bulkDispatchItems.length <= 1}
                                onClick={() => handleRemoveBulkDispatchRow(idx)}
                                className={`p-1.5 rounded-lg border transition ${
                                  bulkDispatchItems.length <= 1
                                    ? "opacity-30 cursor-not-allowed text-slate-300 border-slate-100"
                                    : "text-rose-500 border-rose-100 bg-rose-50 hover:bg-rose-100 cursor-pointer"
                                }`}
                                title="Delete Item"
                              >
                                <Trash2 size={13} />
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    {/* Quick dashed add button */}
                    <button
                      type="button"
                      onClick={handleAddBulkDispatchRow}
                      className="w-full py-2.5 border border-dashed border-slate-200 hover:border-brand-300 hover:bg-brand-50/20 text-slate-500 hover:text-brand-700 font-semibold rounded-lg text-center transition flex items-center justify-center gap-1.5 cursor-pointer mt-1"
                    >
                      <Plus size={14} />
                      <span>Add Another Product to Dispatch</span>
                    </button>
                  </div>

                  {/* Routing and Summary Panel */}
                  <div className="bg-slate-50 p-4 rounded-xl border border-slate-150 space-y-3 mt-4">
                    <div className="flex justify-between items-center text-[10px] text-slate-400 uppercase font-bold tracking-wider">
                      <span>Routing &amp; Summary</span>
                      <span className="text-brand-700 bg-brand-50 border border-brand-100 px-2 py-0.5 rounded">
                        {bulkDispatchItems.length} Products Selected
                      </span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                      <div className="bg-white p-3 rounded-lg border border-slate-100/80 md:col-span-2 text-[10.5px] leading-relaxed text-slate-600">
                        <span className="font-extrabold block text-[9.5px] uppercase tracking-wider text-slate-455 mb-1.5">Route Information</span>
                        Source Depot: <strong className="text-slate-800 font-bold">Main Hub, Indore Central Depot</strong> <br />
                        Village Depot: <strong className="text-slate-800 font-bold">{DEMO_VILLAGES_MAPPING[dispatchSelectedVillageIdx]?.villageName} Center</strong><br />
                        Local Assistant: <strong className="text-slate-800 font-bold">{DEMO_VILLAGES_MAPPING[dispatchSelectedVillageIdx]?.assistantName}</strong>
                      </div>

                      <div className="bg-white p-3 rounded-lg border border-slate-100/80 flex flex-col justify-center items-center">
                        <span className="text-[9px] text-slate-400 uppercase font-bold text-center">Total Volume</span>
                        <span className="text-base font-extrabold text-brand-700 font-mono mt-1">
                          {bulkDispatchItems.reduce((acc, item) => acc + item.bagCount, 0).toLocaleString()} Bags
                        </span>
                      </div>
                    </div>

                    <p className="text-[10px] text-slate-400 leading-normal text-center pt-1 border-t border-slate-100/50">
                      * Issuing this bulk dispatch marks all items as In-Transit. The Village Assistant ({DEMO_VILLAGES_MAPPING[dispatchSelectedVillageIdx]?.assistantName}) will receive a notification to verify and acknowledge the stocks.
                    </p>
                  </div>

                  <button
                    type="submit"
                    className="w-full py-3 bg-brand-600 hover:bg-brand-700 text-white font-medium rounded-lg shadow-md cursor-pointer transition text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-1.5"
                  >
                    <CheckCircle2 size={14} />
                    <span>Confirm Dispatch Shipment Lot ({bulkDispatchItems.length} Items)</span>
                  </button>
                </form>
              )}
                </div>
              )}
            </div>

            {/* PANEL: REQUISITION INDENTS LOG */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4">
              <div className="border-b border-slate-100 pb-3 flex justify-between items-center">
                <div>
                  <h2 className="text-base font-bold text-slate-800">Village Indents &amp; Requisitions</h2>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Live requisitions requested by Village Assistants due to low local stock counts.
                  </p>
                </div>
                <span className="bg-brand-50 text-brand-800 text-[10px] font-bold px-2 py-0.5 rounded-full font-mono uppercase">
                  {fertilizerRequests.filter(r => r.status === "Pending").length} Pending
                </span>
              </div>

              {fertilizerRequests.length === 0 ? (
                <div className="p-8 text-center bg-slate-50 rounded-xl border border-dashed border-slate-200 flex flex-col items-center justify-center space-y-2 text-xs text-slate-400">
                  <ShoppingCart size={28} className="text-slate-300" />
                  <div>
                    <span className="font-bold text-slate-500 block">No Indents Raised</span>
                    <p className="text-[10px] text-slate-400 mt-0.5">Village centers currently reporting sufficient local stocks.</p>
                  </div>
                </div>
              ) : (
                <div className="overflow-hidden border border-slate-200 rounded-xl bg-white shadow-xs">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse text-xs">
                      <thead>
                        <tr className="bg-slate-100 border-b border-slate-200 text-slate-600 text-[10px] font-bold uppercase tracking-wider">
                          <th className="py-2.5 px-3">Indent ID</th>
                          <th className="py-2.5 px-3">Fertilizer Name</th>
                          <th className="py-2.5 px-3">Village Depot</th>
                          <th className="py-2.5 px-3">Supervisor Assistant</th>
                          <th className="py-2.5 px-3 text-right">Indent Qty</th>
                          <th className="py-2.5 px-3">Date Raised</th>
                          <th className="py-2.5 px-3">Fulfillment Action</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-150 font-medium">
                        {fertilizerRequests.slice().reverse().map((req) => {
                          const isPending = req.status === "Pending";
                          let statusColor = "text-amber-700 bg-amber-50 border border-amber-100";
                          if (req.status === "Dispatched") statusColor = "text-emerald-700 bg-emerald-50 border border-emerald-100";
                          else if (req.status === "Cancelled") statusColor = "text-rose-700 bg-rose-50 border border-rose-100";

                          return (
                            <tr key={req.id} className={`hover:bg-slate-50/50 text-slate-800 ${!isPending ? "opacity-75" : ""}`}>
                              <td className="py-3 px-3 font-mono text-[10px] text-slate-500 bg-slate-50/30">{req.id}</td>
                              <td className="py-3 px-3">
                                <div className="font-bold text-slate-900">{req.productName}</div>
                                {req.notes && <div className="text-[9.5px] text-slate-450 italic mt-0.5">"{req.notes}"</div>}
                              </td>
                              <td className="py-3 px-3 font-semibold text-brand-850">{req.villageName}</td>
                              <td className="py-3 px-3 text-slate-600">{req.assistantName}</td>
                              <td className="py-3 px-3 text-right font-mono font-extrabold text-blue-900">{req.bagCount.toLocaleString()} Bags</td>
                              <td className="py-3 px-3 font-mono text-slate-500">{req.dateRequested}</td>
                              <td className="py-3 px-3">
                                {isPending ? (
                                  <div className="flex items-center gap-1.5">
                                    <button
                                      type="button"
                                      onClick={() => {
                                        const matchIdx = DEMO_VILLAGES_MAPPING.findIndex(
                                          v => v.villageName.toLowerCase() === req.villageName.toLowerCase()
                                        );
                                        if (matchIdx >= 0) {
                                          setDispatchSelectedVillageIdx(matchIdx);
                                        }
                                        setBulkDispatchItems([
                                          { productName: req.productName, bagCount: req.bagCount }
                                        ]);
                                        setLinkedRequestId(req.id);
                                        setActiveTab("dispatch");
                                      }}
                                      className="py-1 px-2.5 bg-brand-800 hover:bg-brand-900 text-white rounded font-bold text-[9.5px] cursor-pointer transition shadow-2xs"
                                    >
                                      Fulfill &amp; Auto-fill Form
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => {
                                        if (onUpdateFertilizerStatus) {
                                          onUpdateFertilizerStatus(req.id, "Cancelled");
                                        }
                                      }}
                                      className="py-1 px-2 border border-slate-200 hover:bg-rose-50 hover:text-rose-600 rounded font-bold text-[9.5px] text-slate-500 cursor-pointer transition"
                                    >
                                      Reject
                                    </button>
                                  </div>
                                ) : (
                                  <span className={`text-[9.5px] font-extrabold px-2 py-0.5 rounded ${statusColor}`}>
                                    {req.status}
                                  </span>
                                )}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>

            {/* LEDGER OUTWARD/DISPATCH RECORDS DISPLAY */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4 text-left">
              <div className="border-b border-slate-100 pb-3 flex justify-between items-center flex-wrap gap-2">
                <div>
                  <h2 className="text-base font-bold text-slate-800">Dispatch Shipment &amp; Transit Records</h2>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Traceability history and delivery status logs of all outgoing consignment dispatches.
                  </p>
                </div>
                <span className="bg-slate-100 border border-slate-200 font-mono text-slate-700 text-[10.5px] font-extrabold px-2.5 py-1 rounded-lg">
                  {dispatches.length} Total Dispatches
                </span>
              </div>

              {/* Filtering Controls */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="relative">
                  <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                  <input
                    type="text"
                    placeholder="Search village name, variety or manager..."
                    value={dispatchFilterSearch}
                    onChange={(e) => setDispatchFilterSearch(e.target.value)}
                    className="w-full pl-8 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-brand-500 focus:bg-white text-slate-800"
                  />
                </div>
                <div>
                  <select
                    value={dispatchProductFilter}
                    onChange={(e) => setDispatchProductFilter(e.target.value)}
                    className="w-full p-2 border border-slate-200 rounded-lg text-xs bg-slate-50 text-slate-700 focus:outline-none focus:ring-1 focus:ring-brand-500 font-semibold cursor-pointer"
                  >
                    <option value="All">All Varieties (Filter)</option>
                    {DEMO_FERTILIZERS.map((f) => (
                      <option key={f} value={f}>{f}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Status Tab-style Filters */}
              <div className="flex bg-slate-100 p-0.5 rounded-lg border border-slate-150 text-[10.5px] font-bold">
                {[
                  { key: "All", label: "All Statuses" },
                  { key: "In-Transit", label: "🚚 In-Transit Only" },
                  { key: "Acknowledged", label: "✅ Acknowledged Only" },
                ].map((item) => (
                  <button
                    key={item.key}
                    type="button"
                    onClick={() => setDispatchStatusFilter(item.key as any)}
                    className={`flex-1 py-1 px-1 rounded text-center transition cursor-pointer select-none ${
                      dispatchStatusFilter === item.key
                        ? "bg-white text-slate-900 shadow-xs border border-slate-200"
                        : "text-slate-550 hover:text-slate-800"
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>

              {/* Cards list */}
              {(() => {
                const filteredDispatches = dispatches.filter((d) => {
                  const mSearch = 
                    d.villageName.toLowerCase().includes(dispatchFilterSearch.toLowerCase()) ||
                    d.productName.toLowerCase().includes(dispatchFilterSearch.toLowerCase()) ||
                    d.assistantName.toLowerCase().includes(dispatchFilterSearch.toLowerCase()) ||
                    (d.createdBy && d.createdBy.toLowerCase().includes(dispatchFilterSearch.toLowerCase()));
                  const mProd = dispatchProductFilter === "All" || d.productName === dispatchProductFilter;
                  const mStatus = dispatchStatusFilter === "All" || d.status === dispatchStatusFilter;
                  return mSearch && mProd && mStatus;
                });

                if (filteredDispatches.length === 0) {
                  return (
                    <div className="py-12 border-2 border-dashed border-slate-150 rounded-xl text-center space-y-2">
                      <Send size={32} className="mx-auto text-slate-300 animate-pulse" />
                      <p className="text-slate-400 text-xs font-bold">No dispatch shipment records match the selected options.</p>
                    </div>
                  );
                }

                return (
                  <div className="overflow-hidden border border-slate-200 rounded-xl bg-white shadow-xs">
                    <div className="overflow-x-auto">
                      <table className="w-full text-left border-collapse text-xs">
                        <thead>
                          <tr className="bg-slate-100 border-b border-slate-200 text-slate-600 text-[10px] font-bold uppercase tracking-wider">
                            <th className="py-2.5 px-3">Dispatch ID</th>
                            <th className="py-2.5 px-3">Product Name</th>
                            <th className="py-2.5 px-3">Village Depot</th>
                            <th className="py-2.5 px-3">Transit Recipient</th>
                            <th className="py-2.5 px-3 text-right">Qty (Bags)</th>
                            <th className="py-2.5 px-3">Date Shipped</th>
                            <th className="py-2.5 px-3">Fulfillment Status</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-150 font-medium text-slate-800">
                          {filteredDispatches.slice().reverse().map((d) => {
                            return (
                              <tr key={d.id} className="hover:bg-slate-50/50">
                                <td className="py-3 px-3 font-mono text-[10px] text-slate-500 bg-slate-50/30">{d.id}</td>
                                <td className="py-3 px-3 text-[11px] font-bold text-slate-900">{d.productName}</td>
                                <td className="py-3 px-3 font-semibold text-brand-850">{d.villageName}</td>
                                <td className="py-3 px-3">
                                  <div className="font-semibold text-slate-700">{d.assistantName}</div>
                                  {d.status === "Acknowledged" ? (
                                    <div className="text-[9.5px] text-emerald-600 font-semibold mt-0.5">
                                      ✓ Acknowledged {d.acknowledgedDate || d.dispatchDate} {d.acknowledgedTime ? `@ ${d.acknowledgedTime}` : ""}
                                    </div>
                                  ) : (
                                    <div className="text-[9.5px] text-amber-600 font-semibold mt-0.5 animate-pulse">
                                      ⚠ Awaiting depot validation receipt entry
                                    </div>
                                  )}
                                </td>
                                <td className="py-3 px-3 text-right font-mono font-extrabold text-blue-900">{d.bagCount.toLocaleString()} Bags</td>
                                <td className="py-3 px-3">
                                  <div className="font-mono text-slate-500">{d.dispatchDate} {d.createdTime ? `@ ${d.createdTime}` : ""}</div>
                                  <div className="text-[9.5px] text-slate-400">Operator: {d.createdBy || "Warehouse Manager"}</div>
                                </td>
                                <td className="py-3 px-3">
                                  <span className={`text-[9px] font-extrabold px-2 py-0.5 rounded ${
                                    d.status === "In-Transit"
                                      ? "bg-amber-50 text-amber-700 border border-amber-200 animate-pulse"
                                      : "bg-emerald-50 text-emerald-700 border border-emerald-200"
                                  }`}>
                                    {d.status}
                                  </span>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  </div>
                );
              })()}
            </div>

          </div>
        )}

        {/* TAB 4: VILLAGE STOCK STATUS */}
        {activeTab === "villages" && (
          <div className="space-y-4">
            {!selectedVillageLedger ? (
              <>
                <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm text-left">
                  <h2 className="text-sm font-bold text-slate-800">Search Stocks by Product / Pesticide Name</h2>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    Search for any product variety (e.g., Urea, DAP, Pesticide) to find which village centers have it in stock and track their utilization details.
                  </p>
                </div>

                {/* Search bar for village stock levels */}
                <div className="flex flex-col gap-2">
                  <div className="relative">
                    <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                    <input
                      type="text"
                      placeholder="Search pesticide or fertilizer variety (e.g. Urea, Pesticide, NPK...)"
                      value={villageStockSearch}
                      onChange={(e) => setVillageStockSearch(e.target.value)}
                      className="w-full pl-8 pr-3 py-2 bg-white border border-slate-200 rounded-lg text-xs placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-brand-500 text-slate-800 font-medium text-left"
                    />
                  </div>
                  
                  {/* Quick Filter Tags */}
                  <div className="flex flex-wrap items-center gap-1.5 text-[10px] text-slate-500">
                    <span className="font-semibold">Quick Search:</span>
                    {["Urea", "NPK", "Pesticide", "DAP", "Potash"].map((p) => (
                      <button
                        key={p}
                        type="button"
                        onClick={() => setVillageStockSearch(p)}
                        className={`px-2 py-0.5 rounded-full border transition cursor-pointer font-bold ${
                          villageStockSearch.toLowerCase() === p.toLowerCase()
                            ? "bg-brand-50 text-brand-800 border-brand-350"
                            : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50"
                        }`}
                      >
                        {p}
                      </button>
                    ))}
                    {villageStockSearch && (
                      <button
                        type="button"
                        onClick={() => setVillageStockSearch("")}
                        className="text-rose-600 hover:underline font-bold text-[9px] ml-1"
                      >
                        Clear
                      </button>
                    )}
                  </div>
                </div>

                {/* Grouped Village Stock Breakdown by Village */}
                {(() => {
                  interface VillageProductStock {
                    productName: string;
                    totalReceived: number;
                    totalDistributed: number;
                    availableStock: number;
                    originalRecord: any;
                  }

                  interface VillageStockGroup {
                    villageName: string;
                    assistantName: string;
                    products: VillageProductStock[];
                  }

                  const villageMap: Record<string, { assistantName: string; products: VillageProductStock[] }> = {};

                  // Group village stocks by village name
                  villageStocks.forEach((vs) => {
                    const vKey = vs.villageName.toLowerCase();
                    if (!villageMap[vKey]) {
                      villageMap[vKey] = {
                        assistantName: vs.assistantName,
                        products: []
                      };
                    }
                    
                    const existingProduct = villageMap[vKey].products.find(p => p.productName.toLowerCase() === vs.productName.toLowerCase());
                    if (existingProduct) {
                      existingProduct.totalReceived += vs.totalReceived;
                      existingProduct.totalDistributed += vs.totalDistributed;
                      existingProduct.availableStock += vs.availableStock;
                    } else {
                      villageMap[vKey].products.push({
                        productName: vs.productName,
                        totalReceived: vs.totalReceived,
                        totalDistributed: vs.totalDistributed,
                        availableStock: vs.availableStock,
                        originalRecord: vs
                      });
                    }
                  });

                  const searchTerm = villageStockSearch.toLowerCase().trim();

                  // Filter villages and their products by search query
                  const filteredVillages: VillageStockGroup[] = Object.entries(villageMap)
                    .map(([vKey, data]) => {
                      const displayVillageName = data.products[0]?.originalRecord.villageName || (vKey.charAt(0).toUpperCase() + vKey.slice(1));
                      
                      const isVillageMatch = displayVillageName.toLowerCase().includes(searchTerm);
                      const isAssistantMatch = data.assistantName.toLowerCase().includes(searchTerm);
                      
                      const matchedProducts = data.products.filter(p => {
                        if (isVillageMatch || isAssistantMatch) return true;
                        return p.productName.toLowerCase().includes(searchTerm);
                      });

                      return {
                        villageName: displayVillageName,
                        assistantName: data.assistantName,
                        products: matchedProducts
                      };
                    })
                    .filter(v => v.products.length > 0);

                  if (filteredVillages.length === 0) {
                    return (
                      <div className="py-12 text-center text-slate-400 italic bg-white rounded-xl border border-slate-200">
                        No village or product matching "{villageStockSearch}" was found.
                      </div>
                    );
                  }

                  return (
                    <div className="space-y-5 text-left">
                      {filteredVillages.map((vGroup) => {
                        return (
                          <div key={vGroup.villageName} className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden text-left">
                            
                            {/* Village Header Banner */}
                            <div className="bg-slate-50 border-b border-slate-200/80 p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-left">
                              <div className="text-left space-y-1">
                                <div className="flex items-center gap-2">
                                  <span className="p-1.5 bg-brand-50 text-brand-700 rounded-lg">
                                    <MapPin size={15} />
                                  </span>
                                  <h3 className="text-sm font-extrabold text-slate-900">
                                    {vGroup.villageName} Center
                                  </h3>
                                </div>
                                <div className="text-[11px] text-slate-500 font-medium flex items-center gap-1.5 pl-1">
                                  <UserCheck size={12} className="text-slate-400 shrink-0" />
                                  <span>Allocated Assistant: <strong className="text-slate-700 font-semibold">{vGroup.assistantName}</strong></span>
                                </div>
                              </div>
                              
                              <div className="text-left sm:text-right">
                                <span className="text-[10px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full font-semibold border border-slate-200/50">
                                  {vGroup.products.length} {vGroup.products.length === 1 ? "Product" : "Products"} Assigned
                                </span>
                              </div>
                            </div>

                            {/* List of Products Assigned to This Village */}
                            <div className="divide-y divide-slate-100">
                              {vGroup.products.map((p) => {
                                const utilizationPercent = p.totalReceived > 0 
                                  ? Math.round((p.totalDistributed / p.totalReceived) * 100) 
                                  : 0;

                                return (
                                  <div key={p.productName} className="p-4 hover:bg-slate-50/30 transition flex flex-col md:flex-row md:items-center justify-between gap-4 text-xs text-left">
                                    
                                    {/* Product Name & Progress */}
                                    <div className="space-y-2 md:w-1/3 text-left">
                                      <div>
                                        <h4 className="font-bold text-slate-800 text-xs flex items-center gap-1.5">
                                          <span className="w-2 h-2 bg-brand-600 rounded-full shrink-0"></span>
                                          {p.productName}
                                        </h4>
                                      </div>
                                      
                                      {/* Utilization Progress Bar */}
                                      <div className="space-y-1">
                                        <div className="flex items-center justify-between text-[9px] font-bold text-slate-400">
                                          <span>Utilization Status</span>
                                          <span className="font-mono text-brand-700">{utilizationPercent}% Issued</span>
                                        </div>
                                        <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                                          <div 
                                            className="h-full bg-brand-600 rounded-full transition-all duration-500"
                                            style={{ width: `${utilizationPercent}%` }}
                                          ></div>
                                        </div>
                                      </div>
                                    </div>

                                    {/* Quantities (Received, Distributed, Remaining) */}
                                    <div className="grid grid-cols-3 gap-2.5 text-center font-mono text-[11px] md:w-1/2">
                                      <div className="bg-slate-50 p-2 rounded-lg border border-slate-100/80">
                                        <span className="text-slate-400 block text-[8px] uppercase font-bold text-center tracking-wider">Received</span>
                                        <span className="font-extrabold text-slate-700 mt-1 block text-center">{p.totalReceived} Bags</span>
                                      </div>
                                      
                                      <div className="bg-slate-50 p-2 rounded-lg border border-slate-100/80">
                                        <span className="text-slate-400 block text-[8px] uppercase font-bold text-center tracking-wider">Distributed</span>
                                        <span className="font-extrabold text-slate-600 mt-1 block text-center">{p.totalDistributed} Bags</span>
                                      </div>
                                      
                                      <div className={`${
                                        p.availableStock > 10 
                                          ? "bg-emerald-50 text-emerald-800 border-emerald-100/80" 
                                          : p.availableStock > 0 
                                          ? "bg-amber-50 text-amber-800 border-amber-100/80" 
                                          : "bg-rose-50 text-rose-800 border-rose-150/80"
                                      } p-2 rounded-lg border font-bold`}>
                                        <span className="text-slate-400 block text-[8px] uppercase font-bold text-center tracking-wider">Remaining</span>
                                        <span className="mt-1 block text-center font-extrabold">{p.availableStock} Bags</span>
                                      </div>
                                    </div>

                                    {/* Action Button */}
                                    <div className="flex md:justify-end shrink-0 pt-2 md:pt-0">
                                      <button
                                        onClick={() => {
                                          setSelectedVillageLedger(p.originalRecord);
                                        }}
                                        className="w-full md:w-auto px-3.5 py-1.5 text-[10px] text-brand-800 bg-brand-50 hover:bg-brand-100 border border-brand-200/70 font-bold rounded-lg transition-all duration-150 shadow-xs flex items-center justify-center gap-1 cursor-pointer"
                                      >
                                        <span>View Ledger</span>
                                        <ArrowRight size={12} className="text-brand-700" />
                                      </button>
                                    </div>

                                  </div>
                                );
                              })}
                            </div>

                          </div>
                        );
                      })}
                    </div>
                  );
                })()}
              </>
            ) : (() => {
              const v = selectedVillageLedger;
              const thisVillageFarmers = farmerDistributions.filter(
                (f) => f.villageName.toLowerCase() === v.villageName.toLowerCase()
              );

              const totalDistributedAmt = thisVillageFarmers.reduce((sum, f) => sum + f.totalAmount, 0);
              const totalCollectedAmt = thisVillageFarmers.reduce((sum, f) => sum + f.amountCollected, 0);
              const totalPendingAmt = thisVillageFarmers.reduce((sum, f) => sum + f.balanceAmount, 0);

              const uniqueVillageProducts = Array.from(new Set([
                ...dispatches.filter(d => d.villageName === v.villageName).map(d => d.productName),
                ...thisVillageFarmers.map(f => f.productName)
              ]));

              return (
                <div className="space-y-4 animate-in fade-in duration-200 text-left">
                  {/* Back Navigation Bar */}
                  <button
                    onClick={() => setSelectedVillageLedger(null)}
                    className="flex items-center gap-1.5 text-xs text-brand-700 font-bold hover:text-brand-900 transition pb-1"
                  >
                    <ArrowRight className="w-4 h-4 rotate-180" />
                    <span>&larr; Back to Villages List</span>
                  </button>

                  {/* Header Title Card */}
                  <div className="bg-gradient-to-br from-brand-900 via-brand-850 to-slate-900 text-white p-4 rounded-xl border border-brand-950">
                    <span className="text-[9px] text-brand-200 font-bold uppercase tracking-wider block">
                      Regional Assistant Ledger
                    </span>
                    <h3 className="text-lg font-bold font-display mt-0.5">{v.villageName} Hub</h3>
                    <p className="text-[11px] text-brand-100 mt-1">
                      Managed by Village Supervisor <strong className="font-semibold text-white">{v.assistantName}</strong>
                    </p>
                  </div>

                  {/* Itemized Fertilizer Availability */}
                  <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-sm space-y-3">
                    <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                      Fertilizer Inventory Breakdown
                    </span>
                    
                    {uniqueVillageProducts.length === 0 ? (
                      <p className="text-xs text-slate-400 py-3 text-center">No dispatches logged for this village area yet.</p>
                    ) : (
                      <div className="space-y-2">
                        {uniqueVillageProducts.map((pName) => {
                          const recv = dispatches
                            .filter(d => d.villageName === v.villageName && d.productName === pName && d.status === "Acknowledged")
                            .reduce((sum, d) => sum + d.bagCount, 0);
                          
                          const dist = thisVillageFarmers
                            .filter(f => f.productName === pName)
                            .reduce((sum, f) => sum + f.bagCount, 0);
                          
                          const avail = Math.max(0, recv - dist);

                          return (
                            <div key={pName} className="p-2 border border-slate-100 rounded-lg space-y-1.5 hover:bg-slate-50 transition">
                              <div className="flex justify-between items-center">
                                <span className="font-bold text-slate-800 text-[11px]">{pName}</span>
                                <span className={`text-[9px] px-2 py-0.5 rounded font-bold ${
                                  avail > 10 ? "bg-emerald-50 text-emerald-800 border border-emerald-100" : "bg-rose-50 text-rose-800 border border-rose-100 animate-pulse"
                                }`}>
                                  {avail > 0 ? `${avail} Bags Available` : "Stockout"}
                                </span>
                              </div>
                              
                              <div className="grid grid-cols-3 gap-1.5 text-center text-[10px]">
                                <div className="bg-slate-50 p-1 rounded">
                                  <span className="text-slate-400 block text-[8px] uppercase font-semibold">Total Recv</span>
                                  <span className="font-semibold text-slate-600 block mt-0.5">{recv} Bags</span>
                                </div>
                                <div className="bg-slate-50 p-1 rounded">
                                  <span className="text-slate-400 block text-[8px] uppercase font-semibold">Distributed</span>
                                  <span className="font-semibold text-slate-600 block mt-0.5">{dist} Bags</span>
                                </div>
                                <div className="bg-brand-50 p-1 rounded border border-brand-100">
                                  <span className="text-brand-700 block text-[8px] uppercase font-bold">Available</span>
                                  <span className="font-bold text-brand-800 block mt-0.5">{avail} Bags</span>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>

                  {/* Farmer Sales Ledger Details */}
                  <div className="space-y-2">
                    <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block px-1">
                      Farmer Distribution Ledger (Itemized)
                    </span>

                    {thisVillageFarmers.length === 0 ? (
                      <div className="bg-white p-6 rounded-xl border border-slate-200 text-center text-xs text-slate-400">
                        No farmer purchase profiles logged yet in this village.
                      </div>
                    ) : (
                      <div className="space-y-2">
                        {thisVillageFarmers.map((fAccount) => (
                          <div key={fAccount.id} className="bg-white p-3.5 rounded-xl border border-slate-200/70 shadow-sm space-y-2.5">
                            <div className="flex justify-between items-start">
                              <div>
                                <span className="font-bold text-slate-800 text-xs block">{fAccount.farmerName}</span>
                                <span className="text-[9px] text-slate-400 block mt-0.5 font-mono">Mobile: {fAccount.mobileNumber}</span>
                              </div>
                            </div>

                            <div className="bg-slate-50 p-2 rounded-lg flex items-center justify-between text-[11px] text-slate-700">
                              <div>
                                Product: <strong className="font-semibold">{fAccount.productName}</strong>
                              </div>
                              <div className="font-bold text-slate-700 font-mono">
                                {fAccount.bagCount} Bags
                              </div>
                            </div>

                            <div className="flex items-center justify-between text-[10px] pt-1 border-t border-slate-100">
                              <div>
                                Rate per Bag: <strong className="font-bold text-slate-700">₹{fAccount.ratePerBag}/Bag</strong>
                              </div>
                              <div>
                                Total Cost: <strong className="font-bold font-mono text-slate-900 text-xs">₹{fAccount.totalAmount.toLocaleString()}</strong>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              );
            })()}
          </div>
        )}

        {/* TAB 5: SUPPLIER BILLS */}
        {activeTab === "supplier" && (() => {
          const getBillDisbursedAmount = (bill: SupplierBill): number => {
            if (bill.paymentStatus === "Paid") return bill.totalAmount;
            if (bill.paymentStatus === "Pending") return 0;
            if (bill.notes) {
              const match = bill.notes.replace(/,/g, '').match(/(?:₹|Rs\.?\s*)(\d+)\s*(?:pending|remains|due)/i);
              if (match && match[1]) {
                const pendingVal = parseInt(match[1]);
                if (!isNaN(pendingVal) && pendingVal < bill.totalAmount) {
                  return bill.totalAmount - pendingVal;
                }
              }
              if (bill.notes.includes("500,000 pending")) {
                return bill.totalAmount - 500000;
              }
            }
            return Math.round(bill.totalAmount * 0.5); // fallback: 50%
          };

          const totalSupplierBooked = supplierBills.reduce((sum, b) => sum + b.totalAmount, 0);
          const totalSupplierDisbursed = supplierBills.reduce((sum, b) => sum + getBillDisbursedAmount(b), 0);
          const totalSupplierPending = Math.max(0, totalSupplierBooked - totalSupplierDisbursed);

          const filteredBills = supplierBills.filter((bill) => {
            if (supplierBillFilter === "All") return true;
            if (supplierBillFilter === "Pending") return bill.approvalStatus === "Pending Approval";
            if (supplierBillFilter === "Active") return bill.approvalStatus === "Approved" && bill.paymentStatus === "Partial";
            if (supplierBillFilter === "Paid") return bill.paymentStatus === "Paid";
            return true;
          });

          return (
            <div className="space-y-4 animate-in fade-in duration-200 text-left">
              <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                <h2 className="text-sm font-bold text-slate-800">Supplier Ledger Accounts</h2>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  Outstanding manufacturer dues and payment status trace. (Warehouse Manager - View Only)
                </p>
              </div>

              {/* KPI Summary Cards */}
              <div className="grid grid-cols-3 gap-2 text-center">
                <div className="bg-white p-2.5 rounded-xl border border-slate-200 shadow-xs text-left">
                  <span className="text-[8.5px] font-bold text-slate-400 uppercase tracking-wider block">Total Booked</span>
                  <span className="text-xs font-black text-slate-850 font-mono mt-0.5 block">₹{totalSupplierBooked.toLocaleString()}</span>
                  <span className="text-[8px] text-slate-400 font-mono block mt-0.5">{supplierBills.length} Invoices</span>
                </div>
                <div className="bg-emerald-50/50 p-2.5 rounded-xl border border-emerald-100 shadow-xs text-left">
                  <span className="text-[8.5px] font-bold text-emerald-600 uppercase tracking-wider block">Total Paid</span>
                  <span className="text-xs font-black text-emerald-700 font-mono mt-0.5 block">₹{totalSupplierDisbursed.toLocaleString()}</span>
                  <span className="text-[8px] text-emerald-500 font-mono block mt-0.5">
                    {totalSupplierBooked > 0 ? Math.round((totalSupplierDisbursed / totalSupplierBooked) * 100) : 0}% Paid
                  </span>
                </div>
                <div className="bg-amber-50/50 p-2.5 rounded-xl border border-amber-100 shadow-xs text-left">
                  <span className="text-[8.5px] font-bold text-amber-700 uppercase tracking-wider block">Pending</span>
                  <span className="text-xs font-black text-amber-800 font-mono mt-0.5 block">₹{totalSupplierPending.toLocaleString()}</span>
                  <span className="text-[8px] text-amber-500 font-mono block mt-0.5">
                    {totalSupplierBooked > 0 ? Math.round((totalSupplierPending / totalSupplierBooked) * 100) : 0}% Outstanding
                  </span>
                </div>
              </div>

              {/* Stage Selection Pills */}
              <div className="flex bg-slate-100 p-0.5 rounded-lg border border-slate-200 text-[10.5px] font-bold">
                {[
                  { key: "All", label: "All Bills" },
                  { key: "Pending", label: "Pending Appr." },
                  { key: "Active", label: "Active (Partial)" },
                  { key: "Paid", label: "Fully Paid" }
                ].map((item) => (
                  <button
                    key={item.key}
                    type="button"
                    onClick={() => setSupplierBillFilter(item.key as any)}
                    className={`flex-1 py-1.2 px-1 rounded text-center transition cursor-pointer select-none ${
                      supplierBillFilter === item.key
                        ? "bg-white text-brand-900 shadow-xs"
                        : "text-slate-500 hover:text-slate-800"
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>

              {/* Bills List */}
              <div className="space-y-3">
                {filteredBills.length === 0 ? (
                  <div className="p-8 text-center bg-slate-50 border border-dashed border-slate-200 rounded-xl text-xs text-slate-400">
                    No supplier bills found in this payment stage.
                  </div>
                ) : (
                  filteredBills.map((bill) => {
                    const disbursed = getBillDisbursedAmount(bill);
                    const pendingValue = Math.max(0, bill.totalAmount - disbursed);
                    const percentDisbursed = bill.totalAmount > 0 ? Math.round((disbursed / bill.totalAmount) * 100) : 0;
                    
                    return (
                      <div key={bill.id} className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs space-y-3.5">
                        {/* Header Details */}
                        <div className="flex justify-between items-start">
                          <div>
                            <span className="text-[8px] font-mono text-slate-450 uppercase tracking-wider block bg-slate-100 px-1.5 py-0.5 rounded w-max">
                              {bill.billNumber}
                            </span>
                            <h3 className="font-extrabold text-slate-850 text-xs mt-1.5">{bill.supplierName}</h3>
                            <span className="text-[10.5px] text-slate-500 block mt-0.5">
                              {bill.productName} &bull; <strong className="font-semibold text-slate-705">{bill.bagCount} Bags</strong>
                            </span>
                          </div>

                          {/* Level Badge / Processing details */}
                          <div className="text-right flex flex-col items-end gap-1 shrink-0">
                            <span className={`text-[8.5px] font-black px-1.5 py-0.5 rounded border uppercase font-mono tracking-wider ${
                              bill.paymentStatus === "Paid"
                                ? "bg-emerald-50 text-emerald-800 border-emerald-200"
                                : bill.paymentStatus === "Partial"
                                ? "bg-amber-50 text-amber-800 border-amber-200"
                                : "bg-rose-50 text-rose-800 border-rose-200"
                            }`}>
                              {bill.paymentStatus === "Paid" ? "DISBURSED" : bill.paymentStatus === "Partial" ? "ACTIVE / PARTIAL" : "PENDING DISBURSAL"}
                            </span>
                            <span className={`text-[8px] font-bold block ${
                              bill.approvalStatus === "Approved"
                                ? "text-emerald-600"
                                : bill.approvalStatus === "Pending Approval"
                                ? "text-amber-500"
                                : "text-rose-500"
                            }`}>
                              {bill.approvalStatus}
                            </span>
                          </div>
                        </div>

                        {/* Amount Disbursal Dashboard & Progress Tracker */}
                        <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-150 space-y-2 text-[10.5px]">
                          <div className="grid grid-cols-3 gap-1 px-1 py-0.5 text-center">
                            <div>
                              <span className="text-slate-400 block text-[8px] uppercase font-bold text-left">Invoice Total</span>
                              <strong className="text-slate-700 text-left block text-[11px] font-mono font-bold">₹ {bill.totalAmount.toLocaleString()}</strong>
                            </div>
                            <div>
                              <span className="text-emerald-600 block text-[8px] uppercase font-bold text-left">Disbursed</span>
                              <strong className="text-emerald-700 text-left block text-[11px] font-mono font-black">₹ {disbursed.toLocaleString()}</strong>
                            </div>
                            <div>
                              <span className="text-slate-400 block text-[8px] uppercase font-bold text-left">Outstanding</span>
                              <strong className={`block text-left text-[11px] font-mono font-black ${pendingValue > 0 ? "text-amber-700 animate-pulse" : "text-slate-500"}`}>
                                ₹ {pendingValue.toLocaleString()}
                              </strong>
                            </div>
                          </div>

                          {/* Mini Progress Bar */}
                          <div className="space-y-1">
                            <div className="flex justify-between items-center text-[9px] text-slate-400 font-mono">
                              <span>Disbursal Progress:</span>
                              <span className="font-extrabold text-emerald-700">{percentDisbursed}%</span>
                            </div>
                            <div className="h-1.5 w-full bg-slate-200 rounded-full overflow-hidden">
                              <div
                                className="h-full bg-emerald-500 rounded-full transition-all duration-300"
                                style={{ width: `${percentDisbursed}%` }}
                              />
                            </div>
                          </div>
                        </div>

                        {/* Ledger Stages Stepper */}
                        <div className="border-t border-slate-100 pt-2.5">
                          <span className="text-[8px] font-bold text-slate-400 uppercase tracking-widest block mb-1 text-left">
                            Ledger Processing Trace
                          </span>
                          <div className="flex items-center justify-between text-[9px] font-bold font-mono">
                            {/* Step 1 */}
                            <div className="flex items-center gap-1">
                              <CheckCircle2 size={10} className="text-emerald-600 shrink-0" />
                              <span className="text-slate-500 font-medium">Invoice Recv</span>
                            </div>
                            <div className="flex-1 h-[1.5px] bg-slate-200 mx-2" />

                            {/* Step 2 */}
                            <div className="flex items-center gap-1">
                              {bill.approvalStatus === "Approved" ? (
                                <CheckCircle2 size={10} className="text-emerald-600 shrink-0" />
                              ) : (
                                <Clock size={10} className="text-amber-500 shrink-0" />
                              )}
                              <span className={`font-semibold ${bill.approvalStatus === "Approved" ? "text-slate-500" : "text-amber-500"}`}>
                                Owner Approval
                              </span>
                            </div>
                            <div className="flex-1 h-[1.5px] bg-slate-200 mx-2" />

                            {/* Step 3 */}
                            <div className="flex items-center gap-1">
                              {bill.paymentStatus === "Paid" ? (
                                <CheckCircle2 size={10} className="text-emerald-600 shrink-0" />
                              ) : (
                                <Clock size={10} className="text-slate-450 shrink-0" />
                              )}
                              <span className={`font-semibold ${bill.paymentStatus === "Paid" ? "text-emerald-600" : "text-slate-500"}`}>
                                Fully Paid
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Bill notes if any */}
                        {bill.notes && (
                          <div className="p-2 bg-blue-50/50 border border-blue-100/50 text-slate-600 text-[9.5px] rounded-lg italic text-left">
                            &ldquo;{bill.notes}&rdquo;
                          </div>
                        )}
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          );
        })()}

        {/* TAB 6: NEW DEBUT - CENTRAL HUB INVENTORY LEDGER */}
        {activeTab === "inventory" && (
          <div className="space-y-4 text-left animate-in fade-in duration-200">
            {selectedProductDetail ? (
              <div className="space-y-4 text-left animate-in fade-in duration-200">
                {/* Header card with Back button */}
                <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm space-y-3">
                  <button
                    onClick={() => setSelectedProductDetail(null)}
                    className="text-[11px] font-bold text-brand-700 bg-brand-50 hover:bg-brand-100 px-3 py-1.5 rounded-lg flex items-center gap-1 transition cursor-pointer"
                  >
                    &larr; Back to Variety List
                  </button>
                  <div className="pt-1">
                    <span className="text-[10px] text-brand-650 bg-brand-50 px-2 py-0.5 rounded font-bold uppercase">Variety Drilldown</span>
                    <h2 className="text-base font-extrabold text-slate-800 mt-1">{selectedProductDetail} Ledger Overview</h2>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      Real-time granular tracing of manufacturer inward receipts, transit village dispatches, and end farmer sales.
                    </p>
                  </div>

                  {/* Calculations breakdown */}
                  {(() => {
                    const productStocks = stocks.filter(s => s.productName === selectedProductDetail);
                    const productDispatches = dispatches.filter(d => d.productName === selectedProductDetail);
                    const productSales = farmerDistributions.filter(fd => fd.productName === selectedProductDetail);

                    const totalInward = productStocks.reduce((sum, s) => sum + s.bagCount, 0);
                    const totalDispatched = productDispatches.reduce((sum, d) => sum + d.bagCount, 0);
                    const inTransit = productDispatches.filter(d => d.status === "In-Transit").reduce((sum, d) => sum + d.bagCount, 0);
                    const acknowledged = productDispatches.filter(d => d.status === "Acknowledged").reduce((sum, d) => sum + d.bagCount, 0);
                    const remainingCentWare = Math.max(0, totalInward - totalDispatched);
                    const totalSoldToFarmers = productSales.reduce((sum, s) => sum + s.bagCount, 0);

                    return (
                      <div className="grid grid-cols-2 gap-2 text-center text-xs border-t border-slate-100 pt-3">
                        <div className="bg-slate-50 p-2 rounded">
                          <span className="text-slate-400 block text-[9px] uppercase font-bold">In Main Depot</span>
                          <span className="font-extrabold text-slate-800 text-sm block mt-0.5">{remainingCentWare.toLocaleString()} Bags</span>
                        </div>
                        <div className="bg-brand-50 p-2 rounded border border-brand-100">
                          <span className="text-brand-700 block text-[9px] uppercase font-bold">Total Inward Received</span>
                          <span className="font-extrabold text-brand-800 text-sm block mt-0.5">{totalInward.toLocaleString()} Bags</span>
                        </div>
                        <div className="bg-slate-50 p-2 rounded">
                          <span className="text-slate-400 block text-[9px] uppercase font-bold">Dispatched to Villages</span>
                          <span className="font-extrabold text-slate-850 text-sm block mt-0.5">{totalDispatched.toLocaleString()} Bags</span>
                          <span className="text-[8px] text-slate-400 block mt-0.5">({acknowledged} Recv / {inTransit} Transit)</span>
                        </div>
                        <div className="bg-slate-50 p-2 rounded">
                          <span className="text-slate-400 block text-[9px] uppercase font-bold">Issued to Farmers</span>
                          <span className="font-extrabold text-slate-800 text-sm block mt-0.5">{totalSoldToFarmers.toLocaleString()} Bags</span>
                        </div>
                      </div>
                    );
                  })()}
                </div>

                {/* Village Wise Distribution Quantity List Section */}
                <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm space-y-3.5 text-left">
                  <div className="border-b border-slate-100 pb-2">
                    <div className="flex justify-between items-start">
                      <div>
                        <span className="text-[9px] uppercase font-bold text-brand-700 bg-brand-50 px-2.5 py-1 rounded">Village Status Log</span>
                        <h3 className="font-extrabold text-slate-900 mt-1.5 text-xs">Village Hub Distribution &amp; Allotments</h3>
                      </div>
                      <span className="text-[10px] text-slate-400 font-mono font-semibold">Qty Shipped</span>
                    </div>

                    {/* Integrated Search & Stage Filtering UI */}
                    <div className="mt-3.5 space-y-2">
                      <div className="relative">
                        <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                        <input
                          type="text"
                          placeholder="Search village name or assistant..."
                          value={villageSearch}
                          onChange={(e) => setVillageSearch(e.target.value)}
                          className="w-full pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-brand-500 focus:bg-white text-slate-800"
                        />
                      </div>
                      <div className="flex bg-slate-100 p-0.5 rounded-lg border border-slate-150 text-[10.5px] font-bold">
                        {[
                          { key: "All", label: "All Villages" },
                          { key: "Available", label: "Available Only" },
                          { key: "OutOfStock", label: "Out of Stock / Sold Out" }
                        ].map((item) => (
                          <button
                            key={item.key}
                            type="button"
                            onClick={() => setVillageAvailabilityFilter(item.key as any)}
                            className={`flex-1 py-1.2 px-1 rounded text-center transition cursor-pointer select-none ${
                              villageAvailabilityFilter === item.key
                                ? "bg-white text-brand-900 shadow-xs border border-slate-200"
                                : "text-slate-550 hover:text-slate-800"
                            }`}
                          >
                            {item.label}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  {(() => {
                    const productDispatches = dispatches.filter(d => d.productName === selectedProductDetail);
                    const productSales = farmerDistributions.filter(fd => fd.productName === selectedProductDetail);

                    // Filter villages based on active state criteria
                    const filteredVillages = DEMO_VILLAGES_MAPPING.filter((v) => {
                      const villageDispatches = productDispatches.filter(d => d.villageName === v.villageName);
                      const acknowledged = villageDispatches.filter(d => d.status === "Acknowledged").reduce((sum, d) => sum + d.bagCount, 0);
                      
                      const villageSales = productSales.filter(fd => fd.villageName === v.villageName);
                      const totalFarmerSales = villageSales.reduce((sum, s) => sum + s.bagCount, 0);
                      const availableInVillage = Math.max(0, acknowledged - totalFarmerSales);

                      // Match text
                      const matchesSearch = v.villageName.toLowerCase().includes(villageSearch.toLowerCase()) || 
                                            v.assistantName.toLowerCase().includes(villageSearch.toLowerCase());
                      if (!matchesSearch) return false;

                      // Match availability category
                      if (villageAvailabilityFilter === "Available") {
                        return availableInVillage > 0;
                      }
                      if (villageAvailabilityFilter === "OutOfStock") {
                        return availableInVillage <= 0;
                      }
                      return true;
                    });

                    return (
                      <div className="space-y-3.5">
                        {filteredVillages.length === 0 ? (
                          <div className="py-8 text-center text-xs text-slate-400 bg-slate-50 border border-dashed border-slate-200 rounded-xl">
                            {villageSearch ? "No matching villages found for your search query." : "No villages match this availability filter."}
                          </div>
                        ) : (
                          filteredVillages.map((v) => {
                            const villageDispatches = productDispatches.filter(d => d.villageName === v.villageName);
                            const totalBags = villageDispatches.reduce((sum, d) => sum + d.bagCount, 0);
                            const acknowledged = villageDispatches.filter(d => d.status === "Acknowledged").reduce((sum, d) => sum + d.bagCount, 0);
                            const inTransit = villageDispatches.filter(d => d.status === "In-Transit").reduce((sum, d) => sum + d.bagCount, 0);
                            
                            // Get farmer sales amount in this village
                            const villageSales = productSales.filter(fd => fd.villageName === v.villageName);
                            const totalFarmerSales = villageSales.reduce((sum, s) => sum + s.bagCount, 0);

                            const availableInVillage = Math.max(0, acknowledged - totalFarmerSales);

                            return (
                              <div key={v.villageName} className="flex justify-between items-start text-xs py-3.5 border-b border-slate-100 last:border-0 hover:bg-slate-50/50 rounded-lg px-2 transition gap-3">
                                <div className="space-y-1.5 flex-1 min-w-0">
                                  <div className="flex items-center gap-2">
                                    <strong className="text-slate-800 text-xs font-extrabold">{v.villageName}</strong>
                                    <span className="text-[9px] text-slate-500 font-bold bg-slate-100 px-1.5 py-0.5 rounded uppercase tracking-wider">
                                      {v.assistantName}
                                    </span>
                                  </div>
                                  
                                  <div className="text-[10px] text-slate-500 font-medium flex flex-wrap items-center gap-x-2 gap-y-0.5">
                                    <span>Received: <strong className="text-slate-705 font-bold">{acknowledged} Bags</strong></span>
                                    <span className="text-slate-300">&bull;</span>
                                    <span>In Transit: <strong className="text-amber-600 font-bold">{inTransit} Bags</strong></span>
                                  </div>

                                  <div className="flex flex-wrap items-center gap-1.5 pt-0.5">
                                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded border bg-emerald-50 text-emerald-800 border-emerald-150 flex items-center gap-1">
                                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                                      Distributed: <strong className="font-bold">{totalFarmerSales} Bags</strong>
                                    </span>

                                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded border flex items-center gap-1 ${
                                      availableInVillage > 0 
                                        ? "bg-brand-50 text-brand-800 border-brand-150" 
                                        : "bg-rose-50 text-rose-700 border-rose-150 animate-pulse"
                                    }`}>
                                      <span className={`w-1.5 h-1.5 rounded-full ${availableInVillage > 0 ? "bg-brand-500" : "bg-rose-500"}`} />
                                      Available: <strong className="font-extrabold">{availableInVillage} Bags</strong>
                                    </span>
                                  </div>
                                </div>

                                <div className="text-right shrink-0">
                                  <span className="font-extrabold text-blue-900 font-mono text-xs block">
                                    {totalBags} Bags
                                  </span>
                                  <span className="text-[9px] text-slate-400 block uppercase font-bold tracking-tight">Total Sent</span>
                                </div>
                              </div>
                            );
                          })
                        )}
                      </div>
                    );
                  })()}
                </div>

                {/* Section 1: Inward Lots */}
                <div className="space-y-2">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block px-1">
                    1. Inward Supplier Receipts ({selectedProductDetail})
                  </span>
                  {(() => {
                    const matchedStocks = stocks.filter(s => s.productName === selectedProductDetail);
                    if (matchedStocks.length === 0) {
                      return (
                        <div className="bg-white p-5 rounded-xl border border-slate-150 text-center text-xs text-slate-400">
                          No inward shipments registered under this fertilizer brand.
                        </div>
                      );
                    }
                    return matchedStocks.slice().reverse().map(lot => (
                      <div key={lot.id} className="bg-white p-3 rounded-xl border border-slate-200/85 shadow-xs text-xs space-y-2">
                        <div className="flex justify-between items-center text-[10px]">
                          <span className="font-mono bg-slate-100 text-slate-600 px-2 py-0.5 rounded font-bold uppercase">{lot.id}</span>
                          <span className="font-mono text-slate-400 font-semibold">{lot.receivedDate}</span>
                        </div>
                        <div className="flex justify-between items-start pt-1">
                          <div>
                            <strong className="block text-slate-800 text-xs">Supplier: {lot.supplierName}</strong>
                            <span className="text-[10px] text-slate-400 block mt-1">
                              <strong>Logged / Updated By:</strong> {lot.createdBy || "System (Initial Audit Desk)"}
                              {lot.createdTime ? ` at ${lot.createdTime}` : ""}
                            </span>
                          </div>
                          <div className="text-right font-mono self-center">
                            <span className="font-bold text-slate-800 block text-xs">{lot.bagCount} Bags</span>
                            <span className="text-[10px] text-slate-400 block">@ ₹{lot.ratePerBag}</span>
                          </div>
                        </div>
                        <div className="border-t border-slate-100/75 pt-2 flex justify-between items-center">
                          <span className="text-[9px] text-slate-400">Account Bill: Pending Approved</span>
                          <span className="text-emerald-700 font-bold font-mono">₹ {lot.totalAmount.toLocaleString()}</span>
                        </div>
                      </div>
                    ));
                  })()}
                </div>

                {/* Section 2: Village Dispatches */}
                <div className="space-y-2">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block px-1">
                    2. Dispatches and Consignment Transfers
                  </span>
                  {(() => {
                    const matchedDispatches = dispatches.filter(d => d.productName === selectedProductDetail);
                    if (matchedDispatches.length === 0) {
                      return (
                        <div className="bg-white p-5 rounded-xl border border-slate-150 text-center text-xs text-slate-400">
                          No local depot dispatches logged for this variety.
                        </div>
                      );
                    }
                    return matchedDispatches.slice().reverse().map(disc => (
                      <div key={disc.id} className="bg-white p-3 rounded-xl border border-slate-200/85 shadow-xs text-xs space-y-2">
                        <div className="flex justify-between items-center text-[10px]">
                          <strong className="font-mono bg-blue-50 text-blue-800 px-2.5 py-0.5 rounded font-bold uppercase">{disc.id}</strong>
                          <span className={`text-[9px] font-bold px-2 py-0.5 rounded ${
                            disc.status === "Acknowledged" ? "bg-emerald-50 text-emerald-800" : "bg-amber-50 text-amber-800 animate-pulse"
                          }`}>
                            {disc.status}
                          </span>
                        </div>
                        <div className="flex justify-between pt-1">
                          <div>
                            <strong className="block text-slate-800 text-xs">Village Hub: {disc.villageName}</strong>
                            <span className="text-[10px] text-slate-400 block mt-0.5">Supervisor: {disc.assistantName}</span>
                          </div>
                          <span className="font-extrabold text-slate-800 font-mono text-sm self-center">{disc.bagCount} Bags</span>
                        </div>
                        <div className="text-[9px] text-slate-450 space-y-0.5 border-t border-slate-150/40 pt-1.5">
                          <div className="flex justify-between">
                            <span>Shipped by:</span>
                            <strong className="text-slate-600">{disc.createdBy || "System (Initial Audit Desk)"} {disc.createdTime ? ` at ${disc.createdTime}` : ""}</strong>
                          </div>
                          {disc.status === "Acknowledged" && (
                            <div className="flex justify-between text-emerald-600 font-medium mt-0.5">
                              <span>Received by:</span>
                              <strong>{disc.acknowledgedBy || disc.assistantName} {disc.acknowledgedTime ? ` at ${disc.acknowledgedTime}` : ""}</strong>
                            </div>
                          )}
                          <div className="flex justify-between text-[8px] text-slate-400 mt-0.5">
                            <span>Dispatch Date:</span>
                            <span>{disc.dispatchDate}</span>
                          </div>
                        </div>
                      </div>
                    ));
                  })()}
                </div>

                {/* Section 3: Farmer Distributions */}
                <div className="space-y-2">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block px-1">
                    3. Local Farmer Sales Ledger
                  </span>
                  {(() => {
                    const matchedSales = farmerDistributions.filter(fd => fd.productName === selectedProductDetail);
                    if (matchedSales.length === 0) {
                      return (
                        <div className="bg-white p-5 rounded-xl border border-slate-150 text-center text-xs text-slate-400">
                          No direct farmer distributions logged in database yet.
                        </div>
                      );
                    }
                    return matchedSales.slice().reverse().map(fd => (
                      <div key={fd.id} className="bg-white p-3.5 rounded-xl border border-slate-200/85 shadow-xs text-xs space-y-2.5">
                        <div className="flex justify-between items-start">
                          <div>
                            <strong className="font-bold text-slate-850 text-xs block">{fd.farmerName}</strong>
                            <span className="text-[10px] text-slate-400 block font-mono mt-0.5">Mobile: {fd.mobileNumber}</span>
                          </div>
                          <span className={`text-[9px] px-2 py-0.5 font-bold rounded-full ${
                            fd.paymentStatus === "Paid" 
                              ? "bg-emerald-50 text-emerald-800 border border-emerald-100" 
                              : fd.paymentStatus === "Partial" 
                              ? "bg-amber-50 text-amber-800 border border-amber-100" 
                              : "bg-rose-50 text-rose-800 border border-rose-100"
                          }`}>
                            {fd.paymentStatus}
                          </span>
                        </div>
                        <div className="bg-slate-50 p-2 rounded-lg flex justify-between text-[11px] text-slate-750">
                          <span>Hub Area: <strong>{fd.villageName}</strong></span>
                          <span>Bags Count: <strong>{fd.bagCount} Bags</strong></span>
                        </div>
                        <div className="flex justify-between items-center text-[10px] pt-1.5 border-t border-slate-100">
                          <span className="text-slate-400 font-mono">Date: {fd.date}</span>
                          <span className="font-bold text-slate-800">₹{fd.totalAmount.toLocaleString()}</span>
                        </div>
                      </div>
                    ));
                  })()}
                </div>
              </div>
            ) : (
              <>
                <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                  <h2 className="text-sm font-bold text-slate-800">Central Storage &amp; Inventory</h2>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    Overview of total incoming fertilizer consignments received at Indore Depot, dispatches issued to village hubs, and current net warehouse availability. Click any variety to drilldown into full logs.
                  </p>
                </div>

                {/* Product Variety Breakdown cards */}
                <div className="space-y-2.5">
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block px-1">
                    Fertilizer Variety Stock Split (Click to Drilldown)
                  </span>

                  <div className="relative">
                    <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                    <input
                      type="text"
                      placeholder="Search fertilizer variety..."
                      value={varietySearch}
                      onChange={(e) => setVarietySearch(e.target.value)}
                      className="w-full pl-8 pr-3 py-2 bg-white border border-slate-200 rounded-lg text-xs placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-brand-500 text-slate-800"
                    />
                  </div>

                  <div className="overflow-hidden border border-slate-200 rounded-xl bg-white shadow-xs">
                    <div className="overflow-x-auto">
                      <table className="w-full text-left border-collapse text-xs">
                        <thead>
                          <tr className="bg-slate-100 border-b border-slate-200 text-slate-600 text-[10px] font-bold uppercase tracking-wider">
                            <th className="py-2.5 px-3">Variety Name</th>
                            <th className="py-2.5 px-3 text-right">Accountant Enrolled Rate/Bag</th>
                            <th className="py-2.5 px-3 text-right font-bold">In-Stock Available</th>
                            <th className="py-2.5 px-3 text-right">Sent to Villages</th>
                            <th className="py-2.5 px-3 text-right">Total Inward Bags</th>
                            <th className="py-2.5 px-3 text-right">Estimated Valuation</th>
                            <th className="py-2.5 px-3">Actions</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-150">
                          {(() => {
                            const filtered = DEMO_FERTILIZERS.filter((pName) =>
                              pName.toLowerCase().includes(varietySearch.toLowerCase())
                            );
                            if (filtered.length === 0) {
                              return (
                                <tr>
                                  <td colSpan={7} className="py-8 text-center text-slate-400 italic">
                                    No variety matches "{varietySearch}"
                                  </td>
                                </tr>
                              );
                            }
                            return filtered.map((pName) => {
                              // Calculate Inward Stock Sum at Central Depot
                              const totalInwardBags = stocks
                                .filter(s => s.productName === pName)
                                .reduce((sum, item) => sum + item.bagCount, 0);

                              // Calculate Outward Stock Sum to Villages
                              const totalDispatchedBags = dispatches
                                .filter(d => d.productName === pName)
                                .reduce((sum, item) => sum + item.bagCount, 0);

                              // Available stocks in central
                              const remainingBags = Math.max(0, totalInwardBags - totalDispatchedBags);

                              // Fetch active rate enrolled by accountant
                              const enrolledRate = fertilizerRates?.[pName] || DEFAULT_FERTILIZER_RATES[pName] || 350;

                              const currentValuation = remainingBags * enrolledRate;

                              return (
                                <tr 
                                  key={pName} 
                                  onClick={() => setSelectedProductDetail(pName)}
                                  className="hover:bg-slate-55/35 font-semibold text-slate-800 cursor-pointer transition border-l-2 hover:border-l-brand-600 border-l-transparent"
                                >
                                  <td className="py-3 px-3 text-[11px] font-bold text-slate-900">{pName}</td>
                                  <td className="py-3 px-3 text-right font-mono text-slate-550">
                                    <span className="bg-amber-50 text-amber-850 px-2 py-0.5 rounded border border-amber-100 text-[10.5px]">
                                      ₹ {enrolledRate}
                                    </span>
                                  </td>
                                  <td className="py-3 px-3 text-right font-mono font-extrabold text-brand-850 bg-brand-50/15">{remainingBags.toLocaleString()} Bags</td>
                                  <td className="py-3 px-3 text-right font-mono text-slate-600">{totalDispatchedBags.toLocaleString()} Bags</td>
                                  <td className="py-3 px-3 text-right font-mono text-slate-450">{totalInwardBags.toLocaleString()} Bags</td>
                                  <td className="py-3 px-3 text-right font-mono text-emerald-800 font-bold">₹ {Math.round(currentValuation).toLocaleString()}</td>
                                  <td className="py-3 px-3">
                                    <span className="text-[10px] text-brand-600 uppercase font-bold hover:underline">Drilldown &rarr;</span>
                                  </td>
                                </tr>
                              );
                            });
                          })()}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>

                {/* Inward Ledger */}
                <div className="space-y-2.5">
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block px-1">
                    Historical Inward Stock Ledger
                  </span>

                  <div className="overflow-hidden border border-slate-200 rounded-xl bg-white shadow-xs">
                    <div className="overflow-x-auto">
                      <table className="w-full text-left border-collapse text-xs">
                        <thead>
                          <tr className="bg-slate-100 border-b border-slate-200 text-slate-600 text-[10px] font-bold uppercase tracking-wider">
                            <th className="py-2.5 px-3">Invoice No.</th>
                            <th className="py-2.5 px-3">Product Name</th>
                            <th className="py-2.5 px-3">Supplier Name</th>
                            <th className="py-2.5 px-3 text-right">Inward Qty</th>
                            <th className="py-2.5 px-3 text-right">Rate/Bag</th>
                            <th className="py-2.5 px-3 text-right">Total Valuation</th>
                            <th className="py-2.5 px-3">Received Date</th>
                            <th className="py-2.5 px-3">Recorded By</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-150 font-medium">
                          {(() => {
                            const filteredInward = stocks;
                            if (filteredInward.length === 0) {
                              return (
                                <tr>
                                  <td colSpan={8} className="py-6 text-center text-slate-400 italic bg-white">
                                    No inward receipts logged.
                                  </td>
                                </tr>
                              );
                            }
                            return filteredInward.slice().reverse().map((lot) => (
                              <tr key={lot.id} className="hover:bg-slate-50/50 font-semibold text-slate-800">
                                <td className="py-3 px-3 font-mono text-[10px] text-brand-700 bg-brand-50/20 font-bold rounded-md">
                                  {lot.invoiceNumber || lot.id}
                                </td>
                                <td className="py-3 px-3 text-[11px] font-bold text-slate-900">{lot.productName}</td>
                                <td className="py-3 px-3 text-slate-600">{lot.supplierName}</td>
                                <td className="py-3 px-3 text-right font-mono text-blue-900 font-extrabold">{lot.bagCount.toLocaleString()} Bags</td>
                                <td className="py-3 px-3 text-right font-mono text-slate-500">₹ {lot.ratePerBag}</td>
                                <td className="py-3 px-3 text-right font-mono text-emerald-800 font-bold">₹ {lot.totalAmount.toLocaleString()}</td>
                                <td className="py-3 px-3 font-mono text-slate-500">{lot.receivedDate} {lot.createdTime ? `@ ${lot.createdTime}` : ""}</td>
                                <td className="py-3 px-3 text-slate-500 text-[10.5px]">{lot.createdBy || "System (Initial Audit Desk)"}</td>
                              </tr>
                            ));
                          })()}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>
        )}

      </div>
    </div>
  </div>
);
};
