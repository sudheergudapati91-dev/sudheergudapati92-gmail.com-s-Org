/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo } from "react";
import { WarehouseStock, DispatchRecord, FarmerDistribution, SupplierBill, VillageStockStatus, ModificationRequest, PaymentRequest, RateChangeRequest, FarmerChangeRequest, AdvanceChangeRequest, SalaryUnlockRequest } from "../types";
import { ShieldCheck, Landmark, CheckCircle, XCircle, Pause, Compass, BarChart3, HelpCircle, Layers, TrendingUp, AlertTriangle, RefreshCw, Check, X, ClipboardList, Coins, Sprout, FlaskConical, UserCheck, CalendarDays, Eye, Clock, Square, CheckSquare, Key, Lock, Unlock, Search, Filter, Briefcase, User, Percent, Package, ShoppingCart, MapPin, FileText, Plus, Trash, ChevronRight, ArrowRight } from "lucide-react";

interface OwnerViewProps {
  stocks: WarehouseStock[];
  dispatches: DispatchRecord[];
  farmerDistributions: FarmerDistribution[];
  supplierBills: SupplierBill[];
  villageStocks: VillageStockStatus[];
  modificationRequests: ModificationRequest[];
  paymentRequests?: PaymentRequest[];
  onUpdatePaymentRequests?: (updated: PaymentRequest[]) => void;
  onApproveBill: (id: string) => void;
  onRejectBill: (id: string) => void;
  onHoldBill: (id: string) => void;
  onApproveModification: (id: string) => void;
  onRejectModification: (id: string) => void;
  onLogout: () => void;
  globalYear?: string;
  onYearChange?: (year: string) => void;
  rateChangeRequests?: RateChangeRequest[];
  onApproveRateChange?: (id: string) => void;
  onRejectRateChange?: (id: string) => void;
  farmerChangeRequests?: FarmerChangeRequest[];
  onApproveFarmerChange?: (id: string) => void;
  onRejectFarmerChange?: (id: string) => void;
  advanceChangeRequests?: AdvanceChangeRequest[];
  onApproveAdvanceChange?: (id: string) => void;
  onRejectAdvanceChange?: (id: string) => void;
  salaryUnlockRequests?: SalaryUnlockRequest[];
  onApproveSalaryUnlock?: (id: string) => void;
  onRejectSalaryUnlock?: (id: string) => void;
  onBulkApproveBills?: (ids: string[]) => void;
  onBulkRejectBills?: (ids: string[]) => void;
  onBulkApproveModifications?: (ids: string[]) => void;
  onBulkRejectModifications?: (ids: string[]) => void;
  onBulkApproveRateChanges?: (ids: string[]) => void;
  onBulkRejectRateChanges?: (ids: string[]) => void;
  onBulkApproveFarmerChanges?: (ids: string[]) => void;
  onBulkRejectFarmerChanges?: (ids: string[]) => void;
  onBulkApproveAdvanceChanges?: (ids: string[]) => void;
  onBulkRejectAdvanceChanges?: (ids: string[]) => void;
  onBulkApproveSalaryUnlocks?: (ids: string[]) => void;
  onBulkRejectSalaryUnlocks?: (ids: string[]) => void;
}

const DEFAULT_ASSISTANT_USERS: any[] = [];

const DEFAULT_ENROLLED_FARMERS: any[] = [];

const DEFAULT_FARMER_PAYMENTS: any[] = [];

export const OwnerView: React.FC<OwnerViewProps> = ({
  stocks,
  dispatches,
  farmerDistributions,
  supplierBills,
  villageStocks,
  modificationRequests,
  paymentRequests = [],
  onUpdatePaymentRequests,
  onApproveBill,
  onRejectBill,
  onHoldBill,
  onApproveModification,
  onRejectModification,
  onLogout,
  globalYear,
  onYearChange,
  rateChangeRequests = [],
  onApproveRateChange,
  onRejectRateChange,
  farmerChangeRequests = [],
  onApproveFarmerChange,
  onRejectFarmerChange,
  advanceChangeRequests = [],
  onApproveAdvanceChange,
  onRejectAdvanceChange,
  salaryUnlockRequests = [],
  onApproveSalaryUnlock,
  onRejectSalaryUnlock,
  onBulkApproveBills,
  onBulkRejectBills,
  onBulkApproveModifications,
  onBulkRejectModifications,
  onBulkApproveRateChanges,
  onBulkRejectRateChanges,
  onBulkApproveFarmerChanges,
  onBulkRejectFarmerChanges,
  onBulkApproveAdvanceChanges,
  onBulkRejectAdvanceChanges,
  onBulkApproveSalaryUnlocks,
  onBulkRejectSalaryUnlocks,
}) => {
  const [activeTab, setActiveTab] = useState<"dashboard" | "approvals" | "fertilizer" | "farmers_info" | "assistant_info" | "outstanding">("dashboard");

  // Load enrolled farmers and assistant users directly from localStorage to keep state fully in sync
  const enrolledFarmers = useMemo(() => {
    try {
      const saved = localStorage.getItem("enrolled_farmers");
      const parsed = saved ? JSON.parse(saved) : [];
      if (parsed && parsed.length > 0) return parsed;
    } catch {}

    // Fallback and seed to localStorage
    localStorage.setItem("enrolled_farmers", JSON.stringify(DEFAULT_ENROLLED_FARMERS));
    return DEFAULT_ENROLLED_FARMERS;
  }, []);

  const assistantUsers = useMemo(() => {
    try {
      const saved = localStorage.getItem("ks_assistant_users");
      const parsed = saved ? JSON.parse(saved) : [];
      if (parsed && parsed.length > 0) return parsed;
    } catch {}

    // Fallback and seed to localStorage
    localStorage.setItem("ks_assistant_users", JSON.stringify(DEFAULT_ASSISTANT_USERS));
    return DEFAULT_ASSISTANT_USERS;
  }, []);

  // Search and Filter States for Fertilizer Info
  const [fertilizerSearch, setFertilizerSearch] = useState("");
  const [fertilizerTypeFilter, setFertilizerTypeFilter] = useState("all");
  const [fertilizerSubTab, setFertilizerSubTab] = useState<"inventory" | "invoices" | "distributions" | "dispatches">("inventory");

  // Search and Filter States for Farmers Info
  const [farmerSearch, setFarmerSearch] = useState("");
  const [farmerVillageFilter, setFarmerVillageFilter] = useState("all");
  const [farmerStatusFilter, setFarmerStatusFilter] = useState("all");
  const [farmerSubTab, setFarmerSubTab] = useState<"harvest" | "search">("harvest");

  // Search and Filter States for Assistant Info
  const [assistantSearch, setAssistantSearch] = useState("");
  const [assistantVillageFilter, setAssistantVillageFilter] = useState("all");
  const [assistantSubTab, setAssistantSubTab] = useState<"directory" | "performance">("directory");

  // Clickable Detail Modal States
  const [selectedFertilizerProduct, setSelectedFertilizerProduct] = useState<any | null>(null);
  const [selectedSupplierInvoice, setSelectedSupplierInvoice] = useState<any | null>(null);
  const [selectedFarmer, setSelectedFarmer] = useState<any | null>(null);
  const [selectedVillageDetail, setSelectedVillageDetail] = useState<any | null>(null);
  const [selectedEmployee, setSelectedEmployee] = useState<any | null>(null);

  const [toast, setToast] = useState<{ message: string; type: "success" | "error" | "info" } | null>(null);

  const showToastMsg = (message: string, type: "success" | "error" | "info" = "success") => {
    setToast({ message, type });
    setTimeout(() => {
      setToast(null);
    }, 4000);
  };

  const [activeSubTab, setActiveSubTab] = useState<string>("crop_settlement");
  const [approvalSearchQuery, setApprovalSearchQuery] = useState("");
  const [selectedVillageFilter, setSelectedVillageFilter] = useState("");
  const [selectedItemIds, setSelectedItemIds] = useState<string[]>([]);
  const [previewMode, setPreviewMode] = useState<"approve" | "reject" | null>(null);

  // Interactive Analysis Simulation States
  const [maizeMarkupRate, setMaizeMarkupRate] = useState<number>(25); // default 25% markup on Maize wholesale sales
  const [fertilizerMarkupRate, setFertilizerMarkupRate] = useState<number>(18); // default 18% fertilizer markup
  const [commissionRate, setCommissionRate] = useState<number>(() => {
    try {
      const saved = localStorage.getItem("ks_owner_commission_rate");
      return saved !== null ? parseFloat(saved) : 2.0;
    } catch {
      return 2.0;
    }
  });

  const [companyCommissionRates, setCompanyCommissionRates] = useState<Record<string, number>>(() => {
    try {
      const saved = localStorage.getItem("ks_owner_company_commission_rates");
      if (saved) {
        return JSON.parse(saved);
      }
    } catch {}
    return {
      "Syngenta India": 2.0,
      "Monsanto India": 1.5,
      "Asha Bio-Seeds": 1.0,
      "Nuziveedu Seeds (Newzweed)": 2.0,
      "Standard": 2.0
    };
  });

  useEffect(() => {
    try {
      localStorage.setItem("ks_owner_commission_rate", commissionRate.toString());
    } catch {}
  }, [commissionRate]);

  useEffect(() => {
    try {
      localStorage.setItem("ks_owner_company_commission_rates", JSON.stringify(companyCommissionRates));
    } catch {}
  }, [companyCommissionRates]);
  const [analysisVillageFilter, setAnalysisVillageFilter] = useState<string>("all");
  const [analysisSubView, setAnalysisSubView] = useState<"overview" | "villages" | "farmers" | "p_and_l">("overview");
  const [analysisFarmerSearch, setAnalysisFarmerSearch] = useState<string>("");
  const [analysisVillageSearch, setAnalysisVillageSearch] = useState<string>("");

  const [todoText, setTodoText] = useState("");
  const [todos, setTodos] = useState<{ id: string; text: string; done: boolean; category: string }[]>(() => {
    try {
      const saved = localStorage.getItem("ks_owner_todos");
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed && parsed.length > 0) return parsed;
      }
    } catch {}
    return [
      { id: "t1", text: "Approve pending crop settlements for Dhamnod Village", done: false, category: "Crop Settlements" },
      { id: "t2", text: "Sanction seasonal advance requests for wheat cultivators", done: false, category: "Farmer Advances" },
      { id: "t3", text: "Verify supplier fertilizer dispatch invoice for GreenAgro", done: false, category: "Supplier Invoices" },
      { id: "t4", text: "Unlock monthly salary scaling for assistant Sanjay Singh", done: true, category: "Salary Unlocks" },
      { id: "t5", text: "Reconcile main warehouse buffer safety stock tally", done: false, category: "Logistics" }
    ];
  });

  useEffect(() => {
    localStorage.setItem("ks_owner_todos", JSON.stringify(todos));
  }, [todos]);

  const addTodo = (e: React.FormEvent) => {
    e.preventDefault();
    if (!todoText.trim()) return;
    const newTodo = {
      id: "t_" + Date.now(),
      text: todoText.trim(),
      done: false,
      category: "Proprietor Core"
    };
    setTodos([newTodo, ...todos]);
    setTodoText("");
    showToastMsg("Added new action item successfully!", "success");
  };

  const toggleTodo = (id: string) => {
    setTodos(todos.map(t => t.id === id ? { ...t, done: !t.done } : t));
  };

  const deleteTodo = (id: string) => {
    setTodos(todos.filter(t => t.id !== id));
  };

  // Close preview mode if selection becomes empty
  useEffect(() => {
    if (selectedItemIds.length === 0) {
      setPreviewMode(null);
    }
  }, [selectedItemIds]);

  // Reset filters and selection on sub-tab switch
  useEffect(() => {
    setApprovalSearchQuery("");
    setSelectedVillageFilter("");
    setSelectedItemIds([]);
    setPreviewMode(null);
  }, [activeSubTab]);

  const handleSubmitBulkAction = () => {
    if (selectedItemIds.length === 0) return;

    if (activeSubTab === "crop_settlement") {
      if (previewMode === "approve") {
        handleBulkApproveCropSettlements(selectedItemIds);
      } else {
        handleBulkRejectCropSettlements(selectedItemIds);
      }
    } else if (activeSubTab === "supplier_invoices") {
      if (previewMode === "approve") {
        if (onBulkApproveBills) onBulkApproveBills(selectedItemIds);
        else showToastMsg(`Bulk approved ${selectedItemIds.length} supplier invoices!`, "success");
      } else {
        if (onBulkRejectBills) onBulkRejectBills(selectedItemIds);
        else showToastMsg(`Bulk rejected ${selectedItemIds.length} supplier invoices!`, "info");
      }
    } else if (activeSubTab === "farmer_advances") {
      if (previewMode === "approve") {
        handleBulkApproveFarmerAdvances(selectedItemIds);
      } else {
        handleBulkRejectFarmerAdvances(selectedItemIds);
      }
    } else if (activeSubTab === "ledger_corrections") {
      if (previewMode === "approve") {
        if (onBulkApproveModifications) onBulkApproveModifications(selectedItemIds);
        else showToastMsg(`Bulk approved ${selectedItemIds.length} corrections!`, "success");
      } else {
        if (onBulkRejectModifications) onBulkRejectModifications(selectedItemIds);
        else showToastMsg(`Bulk rejected ${selectedItemIds.length} corrections!`, "info");
      }
    } else if (activeSubTab === "rate_registry") {
      if (previewMode === "approve") {
        if (onBulkApproveRateChanges) onBulkApproveRateChanges(selectedItemIds);
        else showToastMsg(`Bulk approved ${selectedItemIds.length} rate registry changes!`, "success");
      } else {
        if (onBulkRejectRateChanges) onBulkRejectRateChanges(selectedItemIds);
        else showToastMsg(`Bulk rejected ${selectedItemIds.length} rate registry changes!`, "info");
      }
    } else if (activeSubTab === "farmer_profile") {
      if (previewMode === "approve") {
        if (onBulkApproveFarmerChanges) onBulkApproveFarmerChanges(selectedItemIds);
        else showToastMsg(`Bulk approved ${selectedItemIds.length} farmer profile updates!`, "success");
      } else {
        if (onBulkRejectFarmerChanges) onBulkRejectFarmerChanges(selectedItemIds);
        else showToastMsg(`Bulk rejected ${selectedItemIds.length} farmer profile updates!`, "info");
      }
    } else if (activeSubTab === "advance_corrections") {
      if (previewMode === "approve") {
        if (onBulkApproveAdvanceChanges) onBulkApproveAdvanceChanges(selectedItemIds);
        else showToastMsg(`Bulk approved ${selectedItemIds.length} advance corrections!`, "success");
      } else {
        if (onBulkRejectAdvanceChanges) onBulkRejectAdvanceChanges(selectedItemIds);
        else showToastMsg(`Bulk rejected ${selectedItemIds.length} advance corrections!`, "info");
      }
    } else if (activeSubTab === "salary_unlocks") {
      if (previewMode === "approve") {
        if (onBulkApproveSalaryUnlocks) onBulkApproveSalaryUnlocks(selectedItemIds);
        else showToastMsg(`Bulk approved ${selectedItemIds.length} salary unlocks!`, "success");
      } else {
        if (onBulkRejectSalaryUnlocks) onBulkRejectSalaryUnlocks(selectedItemIds);
        else showToastMsg(`Bulk rejected ${selectedItemIds.length} salary unlocks!`, "info");
      }
    }

    setSelectedItemIds([]);
    setPreviewMode(null);
  };

  const [localFarmerPayments, setLocalFarmerPayments] = useState<any[]>(() => {
    try {
      const cached = localStorage.getItem("ks_farmer_final_payments");
      const parsed = cached ? JSON.parse(cached) : [];
      if (parsed && parsed.length > 0) return parsed;
    } catch (e) {
      console.error(e);
    }
    
    // Seed and return defaults
    localStorage.setItem("ks_farmer_final_payments", JSON.stringify(DEFAULT_FARMER_PAYMENTS));
    return DEFAULT_FARMER_PAYMENTS;
  });

  // Keep localFarmerPayments synchronized with localStorage
  useEffect(() => {
    const handleStorageSync = () => {
      try {
        const cached = localStorage.getItem("ks_farmer_final_payments");
        if (cached) {
          const parsed = JSON.parse(cached);
          if (parsed && parsed.length > 0) {
            setLocalFarmerPayments(parsed);
          }
        }
      } catch (e) {
        console.error(e);
      }
    };
    
    // Poll every 1.5 seconds to sync dynamically across role views
    const interval = setInterval(handleStorageSync, 1500);
    return () => clearInterval(interval);
  }, []);

  const handleApproveFarmerPayment = (id: string) => {
    const updated = localFarmerPayments.map(p => p && p.id === id ? { ...p, status: "Approved" } : p);
    setLocalFarmerPayments(updated);
    localStorage.setItem("ks_farmer_final_payments", JSON.stringify(updated));
    showToastMsg("Approved farmer final crop settlement successfully! Ready for disbursement.", "success");
  };

  const handleRejectFarmerPayment = (id: string) => {
    const updated = localFarmerPayments.map(p => p && p.id === id ? { ...p, status: "Unpaid" } : p);
    setLocalFarmerPayments(updated);
    localStorage.setItem("ks_farmer_final_payments", JSON.stringify(updated));
    showToastMsg("Rejected farmer final crop settlement. Status reset to draft.", "info");
  };

  // Filtered bills looking for active requests
  const approvalRequests = (supplierBills || []).filter(sb => sb && sb.approvalStatus === "Pending Approval");

  // Filtered advance requests looking for proprietor sign-off
  const pendingAdvances = (paymentRequests || []).filter(pr => pr && (pr as any).ownerApprovalRequested === true);

  const handleApproveAdvance = (requestId: string) => {
    if (!onUpdatePaymentRequests) return;
    const updated = (paymentRequests || []).map(pr => {
      if (pr && pr.id === requestId) {
        return {
          ...pr,
          ownerApprovalRequested: false,
          ownerApproved: true,
          ownerRejected: false,
        };
      }
      return pr;
    });
    onUpdatePaymentRequests(updated);
    showToastMsg("Approved farmer advance successfully!", "success");
  };

  const handleRejectAdvance = (requestId: string) => {
    if (!onUpdatePaymentRequests) return;
    const updated = (paymentRequests || []).map(pr => {
      if (pr && pr.id === requestId) {
        return {
          ...pr,
          ownerApprovalRequested: false,
          ownerApproved: false,
          ownerRejected: true,
        };
      }
      return pr;
    });
    onUpdatePaymentRequests(updated);
    showToastMsg("Rejected farmer advance request.", "info");
  };

  const handleBulkApproveCropSettlements = (ids: string[]) => {
    setLocalFarmerPayments(prev => {
      const updated = prev.map(p => p && ids.includes(p.id) ? { ...p, status: "Approved" } : p);
      localStorage.setItem("ks_farmer_final_payments", JSON.stringify(updated));
      return updated;
    });
    showToastMsg(`Approved ${ids.length} farmer final crop settlements successfully!`, "success");
    setSelectedItemIds([]);
  };

  const handleBulkRejectCropSettlements = (ids: string[]) => {
    setLocalFarmerPayments(prev => {
      const updated = prev.map(p => p && ids.includes(p.id) ? { ...p, status: "Unpaid" } : p);
      localStorage.setItem("ks_farmer_final_payments", JSON.stringify(updated));
      return updated;
    });
    showToastMsg(`Rejected ${ids.length} farmer final crop settlements.`, "info");
    setSelectedItemIds([]);
  };

  const handleBulkApproveFarmerAdvances = (ids: string[]) => {
    if (!onUpdatePaymentRequests) return;
    const updated = (paymentRequests || []).map(pr => {
      if (pr && ids.includes(pr.id)) {
        return {
          ...pr,
          ownerApprovalRequested: false,
          ownerApproved: true,
          ownerRejected: false,
        };
      }
      return pr;
    });
    onUpdatePaymentRequests(updated);
    showToastMsg(`Approved ${ids.length} farmer advances successfully!`, "success");
    setSelectedItemIds([]);
  };

  const handleBulkRejectFarmerAdvances = (ids: string[]) => {
    if (!onUpdatePaymentRequests) return;
    const updated = (paymentRequests || []).map(pr => {
      if (pr && ids.includes(pr.id)) {
        return {
          ...pr,
          ownerApprovalRequested: false,
          ownerApproved: false,
          ownerRejected: true,
        };
      }
      return pr;
    });
    onUpdatePaymentRequests(updated);
    showToastMsg(`Rejected ${ids.length} farmer advances.`, "info");
    setSelectedItemIds([]);
  };

  // --- SUB-TAB ITEMS & FILTERS ---
  const currentSubTabItems = useMemo(() => {
    let rawItems: any[] = [];
    switch (activeSubTab) {
      case "crop_settlement":
        rawItems = (localFarmerPayments || []).filter(p => p && p.status === "Awaiting Approval");
        break;
      case "supplier_invoices":
        rawItems = (supplierBills || []).filter(sb => sb && sb.approvalStatus === "Pending Approval");
        break;
      case "farmer_advances":
        rawItems = (paymentRequests || []).filter(pr => pr && (pr as any).ownerApprovalRequested === true);
        break;
      case "ledger_corrections":
        rawItems = (modificationRequests || []).filter(m => m && m.status === "Pending");
        break;
      case "rate_registry":
        rawItems = (rateChangeRequests || []).filter(r => r && r.status === "Pending");
        break;
      case "farmer_profile":
        rawItems = (farmerChangeRequests || []).filter(r => r && r.status === "Pending");
        break;
      case "advance_corrections":
        rawItems = (advanceChangeRequests || []).filter(r => r && r.status === "Pending");
        break;
      case "salary_unlocks":
        rawItems = (salaryUnlockRequests || []).filter(r => r && r.status === "Pending");
        break;
      default:
        rawItems = [];
    }

    // Apply Village filter if selected
    if (selectedVillageFilter) {
      rawItems = rawItems.filter(item => {
        if (!item) return false;
        const vName = (item.village || item.villageName || "").toLowerCase();
        return vName === selectedVillageFilter.toLowerCase();
      });
    }

    // Apply Search Query if entered
    if (approvalSearchQuery.trim()) {
      const q = approvalSearchQuery.toLowerCase();
      rawItems = rawItems.filter(item => {
        if (!item) return false;
        
        const farmerName = (item.farmerName || item.supplierName || item.staffName || "").toLowerCase();
        const billNo = (item.billNumber || item.id || "").toLowerCase();
        const assistant = (item.assistantName || "").toLowerCase();
        const village = (item.village || item.villageName || "").toLowerCase();
        const product = (item.cropOrProductName || item.designation || "").toLowerCase();

        return farmerName.includes(q) || 
               billNo.includes(q) || 
               assistant.includes(q) || 
               village.includes(q) ||
               product.includes(q);
      });
    }

    return rawItems;
  }, [
    activeSubTab,
    localFarmerPayments,
    supplierBills,
    paymentRequests,
    modificationRequests,
    rateChangeRequests,
    farmerChangeRequests,
    advanceChangeRequests,
    salaryUnlockRequests,
    selectedVillageFilter,
    approvalSearchQuery
  ]);

  const calculateSelectedTotal = () => {
    let sum = 0;
    currentSubTabItems.forEach(item => {
      if (item && selectedItemIds.includes(item.id)) {
        if (activeSubTab === "crop_settlement") {
          const weightKg = Number(item.weightKg) || 0;
          const pricePerKg = Number(item.pricePerKg) || 0;
          const advanceAmount = Number(item.advanceAmount) || 0;
          const interest = Number(item.interest) || 0;
          const pesticideDues = Number(item.pesticideDues) || 0;
          const loadingCharges = Math.round((weightKg / 1000) * 400);
          const grossAmount = weightKg * pricePerKg;
          const netPayable = grossAmount - (advanceAmount + interest + pesticideDues + loadingCharges);
          sum += Math.max(0, netPayable);
        } else if (activeSubTab === "supplier_invoices") {
          sum += Number(item.totalAmount) || 0;
        } else if (activeSubTab === "farmer_advances") {
          sum += Number(item.amountProposed) || 0;
        }
      }
    });
    return sum;
  };

  const selectedItems = useMemo(() => {
    return currentSubTabItems.filter(item => item && selectedItemIds.includes(item.id));
  }, [currentSubTabItems, selectedItemIds]);

  const activeTabVillages = useMemo(() => {
    let rawItems: any[] = [];
    switch (activeSubTab) {
      case "crop_settlement":
        rawItems = (localFarmerPayments || []).filter(p => p && p.status === "Awaiting Approval");
        break;
      case "farmer_advances":
        rawItems = (paymentRequests || []).filter(pr => pr && (pr as any).ownerApprovalRequested === true);
        break;
      case "ledger_corrections":
        rawItems = (modificationRequests || []).filter(m => m && m.status === "Pending");
        break;
      case "farmer_profile":
        rawItems = (farmerChangeRequests || []).filter(r => r && r.status === "Pending");
        break;
      case "advance_corrections":
        rawItems = (advanceChangeRequests || []).filter(r => r && r.status === "Pending");
        break;
      default:
        return [];
    }
    const villages = rawItems
      .map(item => item ? (item.village || item.villageName || "") : "")
      .filter(Boolean);
    return Array.from(new Set(villages)).sort();
  }, [activeSubTab, localFarmerPayments, paymentRequests, modificationRequests, farmerChangeRequests, advanceChangeRequests]);

  // Calculations for owner dashboard
  const totalBagsInward = (stocks || []).reduce((sum, s) => sum + (s?.bagCount || 0), 0);
  const totalBagsDispatched = (dispatches || []).reduce((sum, d) => sum + (d?.bagCount || 0), 0);
  const totalCollectionCash = (farmerDistributions || []).reduce((sum, f) => sum + (f?.amountCollected || 0), 0);
  const outstandingFarmerReceivables = (farmerDistributions || []).reduce((sum, f) => sum + (f?.balanceAmount || 0), 0);
  const outstandingSupplierDues = (supplierBills || [])
    .filter(b => b && b.paymentStatus !== "Paid")
    .reduce((sum, b) => sum + (b?.totalAmount || 0), 0);

  // Village performance maps
  const villagePerformance = villageStocks.reduce((acc, curr) => {
    const existing = acc.find(item => item.villageName === curr.villageName);
    if (existing) {
      existing.received += curr.totalReceived;
      existing.distributed += curr.totalDistributed;
    } else {
      acc.push({
        villageName: curr.villageName,
        received: curr.totalReceived,
        distributed: curr.totalDistributed,
        assistantName: curr.assistantName
      });
    }
    return acc;
  }, [] as { villageName: string; received: number; distributed: number; assistantName: string }[]);

  // 1. Fertilizer Product Summaries (Main Warehouse + Village-level)
  const fertilizerProductSummaries = useMemo(() => {
    const productsMap: Record<string, {
      productName: string;
      totalPurchased: number;
      totalCost: number;
      totalDispatched: number;
      totalDistributed: number;
      availableMain: number;
      availableVillage: number;
    }> = {};

    // Inward purchases from suppliers
    (stocks || []).forEach(s => {
      if (!s) return;
      const name = s.productName || "Unknown Product";
      if (!productsMap[name]) {
        productsMap[name] = { productName: name, totalPurchased: 0, totalCost: 0, totalDispatched: 0, totalDistributed: 0, availableMain: 0, availableVillage: 0 };
      }
      productsMap[name].totalPurchased += s.bagCount || 0;
      productsMap[name].totalCost += s.totalAmount || 0;
    });

    // Dispatches to village hubs
    (dispatches || []).forEach(d => {
      if (!d) return;
      const name = d.productName;
      if (!productsMap[name]) {
        productsMap[name] = { productName: name, totalPurchased: 0, totalCost: 0, totalDispatched: 0, totalDistributed: 0, availableMain: 0, availableVillage: 0 };
      }
      productsMap[name].totalDispatched += d.bagCount || 0;
    });

    // Distributed to farmers
    (farmerDistributions || []).forEach(f => {
      if (!f) return;
      const name = f.productName;
      if (!productsMap[name]) {
        productsMap[name] = { productName: name, totalPurchased: 0, totalCost: 0, totalDispatched: 0, totalDistributed: 0, availableMain: 0, availableVillage: 0 };
      }
      productsMap[name].totalDistributed += f.bagCount || 0;
    });

    // Village level remaining stocks
    (villageStocks || []).forEach(vs => {
      if (!vs) return;
      const name = vs.productName;
      if (!productsMap[name]) {
        productsMap[name] = { productName: name, totalPurchased: 0, totalCost: 0, totalDispatched: 0, totalDistributed: 0, availableMain: 0, availableVillage: 0 };
      }
      productsMap[name].availableVillage += vs.availableStock || 0;
    });

    // Available at main warehouse: Total Purchased - Total Dispatched
    Object.keys(productsMap).forEach(key => {
      const p = productsMap[key];
      p.availableMain = Math.max(0, p.totalPurchased - p.totalDispatched);
    });

    return Object.values(productsMap);
  }, [stocks, dispatches, farmerDistributions, villageStocks]);

  // 2. Village-wise Harvest Breakdown
  const villageHarvestBreakdown = useMemo(() => {
    const breakdown: Record<string, {
      villageName: string;
      farmerCount: number;
      totalAcres: number;
      totalYieldKg: number;
      settledAmount: number;
    }> = {};

    // Populate from enrolled farmers
    (enrolledFarmers || []).forEach(f => {
      if (!f) return;
      const vil = f.villageName || "Unknown Village";
      if (!breakdown[vil]) {
        breakdown[vil] = { villageName: vil, farmerCount: 0, totalAcres: 0, totalYieldKg: 0, settledAmount: 0 };
      }
      breakdown[vil].farmerCount += 1;
      breakdown[vil].totalAcres += Number(f.acres) || 0;
    });

    // Sourced crop payments (actual harvest yields)
    (localFarmerPayments || []).forEach(p => {
      if (!p) return;
      const vil = p.villageName || "Unknown Village";
      if (!breakdown[vil]) {
        breakdown[vil] = { villageName: vil, farmerCount: 0, totalAcres: 0, totalYieldKg: 0, settledAmount: 0 };
      }
      breakdown[vil].totalYieldKg += Number(p.weightKg) || 0;
      
      const weight = Number(p.weightKg) || 0;
      const price = Number(p.pricePerKg) || 0;
      const advance = Number(p.advanceAmount) || 0;
      const interest = Number(p.interest) || 0;
      const pesticide = Number(p.pesticideDues) || 0;
      const loading = Math.round((weight / 1000) * 400);
      const net = (weight * price) - (advance + interest + pesticide + loading);
      breakdown[vil].settledAmount += Math.max(0, net);
    });

    return Object.values(breakdown);
  }, [enrolledFarmers, localFarmerPayments]);

  // 3. Assistant & Employee Operations & Compensations
  const assistantPerformanceList = useMemo(() => {
    return (assistantUsers || []).map(u => {
      if (!u) return null;
      const village = u.villageName || "";
      
      const vilFarmers = enrolledFarmers.filter(f => f && f.villageName?.toLowerCase() === village.toLowerCase());
      const managedFarmersCount = vilFarmers.length;
      const managedAcres = vilFarmers.reduce((sum, f) => sum + (Number(f.acres) || 0), 0);

      const vilPayments = (localFarmerPayments || []).filter(p => p && p.villageName?.toLowerCase() === village.toLowerCase());
      const tonnageReceivedKg = vilPayments.reduce((sum, p) => sum + (Number(p.weightKg) || 0), 0);

      const vilDispatches = (dispatches || []).filter(d => d && d.villageName?.toLowerCase() === village.toLowerCase());
      const dispatchesBags = vilDispatches.reduce((sum, d) => sum + (d.bagCount || 0), 0);

      const vilDistributions = (farmerDistributions || []).filter(fd => fd && fd.villageName?.toLowerCase() === village.toLowerCase());
      const distributionsBags = vilDistributions.reduce((sum, fd) => sum + (fd.bagCount || 0), 0);

      return {
        ...u,
        managedFarmersCount,
        managedAcres,
        tonnageReceivedKg,
        dispatchesBags,
        distributionsBags
      };
    }).filter(Boolean);
  }, [assistantUsers, enrolledFarmers, localFarmerPayments, dispatches, farmerDistributions]);

  return (
    <div className="flex-1 flex flex-col justify-start">
      {/* Proprietor Premium Header */}
      <div className="bg-gradient-to-r from-brand-900 via-brand-800 to-brand-900 text-white px-5 py-4 flex items-center justify-between sticky top-0 z-10 shadow-md border-b border-brand-950/30">
        <div className="flex flex-col">
          <span className="text-[11px] font-semibold text-white/80 uppercase tracking-wider">
            Owner Dashboard
          </span>
          <h2 className="text-sm font-bold font-display text-white">
            Executive Overview
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
      <div className="flex-1 px-4 py-4 space-y-4">
        
        {/* Navigation Tabs (Scrollable & Responsive) */}
        <div className="flex items-center gap-1.5 border-b border-slate-200 text-xs pb-1.5 overflow-x-auto no-scrollbar scroll-smooth">
          <button
            onClick={() => setActiveTab("dashboard")}
            className={`px-3 py-2 text-center rounded-lg font-bold transition shrink-0 ${
              activeTab === "dashboard" ? "bg-brand-800 text-white shadow-sm" : "text-slate-500 hover:text-slate-900 hover:bg-slate-100"
            }`}
          >
            Summary
          </button>
          <button
            onClick={() => setActiveTab("approvals")}
            className={`px-3 py-2 text-center rounded-lg font-bold transition shrink-0 relative ${
              activeTab === "approvals" ? "bg-brand-800 text-white shadow-sm" : "text-slate-500 hover:text-slate-900 hover:bg-slate-100"
            }`}
          >
            Approvals
            {approvalRequests.length > 0 && (
              <span className="ml-1 px-1.5 py-0.5 bg-rose-500 text-white text-[9px] font-bold rounded-full">
                {approvalRequests.length}
              </span>
            )}
          </button>
          <button
            onClick={() => setActiveTab("fertilizer")}
            className={`px-3 py-2 text-center rounded-lg font-bold transition shrink-0 ${
              activeTab === "fertilizer" ? "bg-brand-800 text-white shadow-sm" : "text-slate-500 hover:text-slate-900 hover:bg-slate-100"
            }`}
          >
            Fertilizer Info
          </button>
          <button
            onClick={() => setActiveTab("farmers_info")}
            className={`px-3 py-2 text-center rounded-lg font-bold transition shrink-0 ${
              activeTab === "farmers_info" ? "bg-brand-800 text-white shadow-sm" : "text-slate-500 hover:text-slate-900 hover:bg-slate-100"
            }`}
          >
            Farmer &amp; Harvest
          </button>
          <button
            onClick={() => setActiveTab("assistant_info")}
            className={`px-3 py-2 text-center rounded-lg font-bold transition shrink-0 ${
              activeTab === "assistant_info" ? "bg-brand-800 text-white shadow-sm" : "text-slate-500 hover:text-slate-900 hover:bg-slate-100"
            }`}
          >
            Assistant Info
          </button>
          <button
            onClick={() => setActiveTab("outstanding")}
            className={`px-3 py-2 text-center rounded-lg font-bold transition shrink-0 ${
              activeTab === "outstanding" ? "bg-brand-800 text-white shadow-sm" : "text-slate-500 hover:text-slate-900 hover:bg-slate-100"
            }`}
          >
            Analysis
          </button>
        </div>

        {/* TAB 1: SUMMARY DASHBOARD */}
        {activeTab === "dashboard" && (
          <div className="space-y-5 text-left animate-in fade-in duration-200">
            
            {/* Header Greetings Bar */}
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-3xs flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
              <div>
                <h3 className="text-sm font-black text-slate-800 tracking-tight flex items-center gap-1.5 uppercase font-display">
                  <ShieldCheck size={16} className="text-brand-800" />
                  Executive Command Centre
                </h3>
                <p className="text-[10.5px] text-slate-500 font-medium">
                  Operational cockpit & real-time analytics summary for the Hub Proprietor.
                </p>
              </div>
              <div className="text-right text-[10px] text-slate-400 font-semibold bg-slate-50 border border-slate-150 px-2.5 py-1 rounded-md shrink-0 flex items-center gap-1.5">
                <Clock size={12} className="text-slate-400" />
                Live Hub Status: <span className="text-emerald-600 font-bold uppercase tracking-wider">● Online</span>
              </div>
            </div>

            {/* Total Pending approvals alert if any */}
            {(() => {
              const pendingCropCount = (localFarmerPayments || []).filter(p => p && p.status === "Awaiting Approval").length;
              const pendingBillCount = (supplierBills || []).filter(sb => sb && sb.approvalStatus === "Pending Approval").length;
              const pendingAdvanceCount = (paymentRequests || []).filter(pr => pr && (pr as any).ownerApprovalRequested === true).length;
              const pendingModCount = (modificationRequests || []).filter(m => m && m.status === "Pending").length;
              const pendingSalaryCount = (salaryUnlockRequests || []).filter(r => r && r.status === "Pending").length;
              const totalPendingApprovals = pendingCropCount + pendingBillCount + pendingAdvanceCount + pendingModCount + pendingSalaryCount;

              if (totalPendingApprovals > 0) {
                return (
                  <div className="bg-rose-50/70 border border-rose-200/80 p-3.5 rounded-xl flex items-center justify-between text-xs transition hover:bg-rose-50 shadow-3xs">
                    <div className="flex items-center gap-3">
                      <span className="text-rose-600 animate-bounce p-1 bg-white border border-rose-200 rounded-full shadow-3xs">
                        <AlertTriangle size={15} />
                      </span>
                      <div>
                        <span className="font-extrabold text-rose-950 block text-[11px] uppercase tracking-wide">
                          Authorization Pending: {totalPendingApprovals} Action Items
                        </span>
                        <span className="text-[10px] text-rose-800 font-medium mt-0.5 block leading-relaxed">
                          Your approval is required on {pendingCropCount} crop settlements, {pendingBillCount} supplier invoices, and {pendingAdvanceCount} advances.
                        </span>
                      </div>
                    </div>
                    <button
                      onClick={() => {
                        setActiveTab("approvals");
                        if (pendingCropCount > 0) setActiveSubTab("crop_settlement");
                        else if (pendingBillCount > 0) setActiveSubTab("supplier_invoices");
                        else if (pendingAdvanceCount > 0) setActiveSubTab("farmer_advances");
                      }}
                      className="bg-rose-800 hover:bg-rose-900 text-white font-extrabold px-3 py-1.5 rounded-lg text-[10px] tracking-wider uppercase transition cursor-pointer shadow-3xs whitespace-nowrap"
                    >
                      Process Pending
                    </button>
                  </div>
                );
              }
              return (
                <div className="bg-emerald-50 border border-emerald-150 p-3.5 rounded-xl flex items-center justify-between text-xs shadow-3xs">
                  <div className="flex items-center gap-2.5">
                    <span className="text-emerald-600 bg-white border border-emerald-200 p-1 rounded-full shadow-3xs">
                      <CheckCircle size={14} />
                    </span>
                    <div>
                      <span className="font-extrabold text-emerald-950 block text-[11px] uppercase tracking-wide">All Approvals Clear</span>
                      <span className="text-[10px] text-emerald-700 font-semibold mt-0.5 block">
                        All farmer settlements, supplier bills, and salary scales are fully authorized.
                      </span>
                    </div>
                  </div>
                </div>
              );
            })()}

            {/* STACKED EXECUTIVE HERO CARDS */}
            <div className="grid grid-cols-1 gap-4">
              
              {/* CARD 1: CROP & CULTIVATION COCKPIT */}
              <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden flex flex-col justify-between">
                <div className="p-4 border-b border-slate-100 bg-slate-50/50">
                  <div className="flex justify-between items-center">
                    <span className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400 font-display flex items-center gap-1.5">
                      <Sprout size={13} className="text-emerald-600" />
                      Crop & Harvest Cockpit
                    </span>
                    <span className="text-[9.5px] bg-emerald-100 text-emerald-800 px-1.5 py-0.5 rounded-md font-bold border border-emerald-200 font-mono">
                      Active Season
                    </span>
                  </div>
                  <div className="mt-3.5 grid grid-cols-2 gap-2 text-xs">
                    <div>
                      <span className="block text-[9.5px] text-slate-500 font-bold uppercase tracking-wider">Cropland Sown</span>
                      <span className="text-base font-black text-slate-900 block font-mono mt-0.5">
                        {enrolledFarmers.reduce((sum, f) => sum + (Number(f.acres) || 0), 0).toLocaleString()} <span className="text-[10px] text-slate-500 font-bold uppercase font-sans">Acres</span>
                      </span>
                    </div>
                    <div>
                      <span className="block text-[9.5px] text-slate-500 font-bold uppercase tracking-wider">Procured Yield</span>
                      <span className="text-base font-black text-emerald-700 block font-mono mt-0.5">
                        {(localFarmerPayments.reduce((sum, p) => sum + (Number(p.weightKg) || 0), 0) / 1000).toLocaleString(undefined, {minimumFractionDigits: 1, maximumFractionDigits: 1})} <span className="text-[10px] text-slate-500 font-bold uppercase font-sans">MT</span>
                      </span>
                    </div>
                  </div>
                </div>

                <div className="p-3 bg-white flex-1 flex flex-col justify-between">
                  <div className="space-y-1.5">
                    <span className="text-[9px] uppercase font-bold tracking-wider text-slate-400 block px-1">
                      Village Harvest Yields & Cultivators
                    </span>
                    <div className="space-y-1.5 max-h-[145px] overflow-y-auto pr-0.5">
                      {villageHarvestBreakdown.length === 0 ? (
                        <div className="py-6 text-center text-slate-400 text-[10px]">No crop harvest data available.</div>
                      ) : (
                        villageHarvestBreakdown.map((vb) => (
                          <div key={vb.villageName} className="flex justify-between items-center text-[10px] p-2 bg-slate-50 hover:bg-slate-100 rounded-lg border border-slate-100/70 transition">
                            <div className="flex items-center gap-1.5">
                              <MapPin size={11} className="text-brand-800" />
                              <span className="font-bold text-slate-800">{vb.villageName}</span>
                            </div>
                            <div className="text-right font-mono text-[9.5px]">
                              <span className="font-extrabold text-slate-900 block">{(vb.totalYieldKg / 1000).toFixed(1)} MT Procured</span>
                              <span className="text-[8px] text-slate-500 font-semibold block">{vb.totalAcres} Acres • {vb.farmerCount} Farmers</span>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      setActiveTab("farmers_info");
                      setFarmerSubTab("harvest");
                    }}
                    className="w-full mt-3 py-1.5 bg-slate-50 hover:bg-slate-100 text-slate-700 text-[9.5px] font-bold rounded-lg border border-slate-200 flex items-center justify-center gap-1 uppercase tracking-wide cursor-pointer transition"
                  >
                    View Crop Sourcing Ledger <ArrowRight size={10} />
                  </button>
                </div>
              </div>

              {/* CARD 2: FERTILIZER LOGISTICS & SUPPLY STATUS */}
              <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden flex flex-col justify-between">
                <div className="p-4 border-b border-slate-100 bg-slate-50/50">
                  <div className="flex justify-between items-center">
                    <span className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400 font-display flex items-center gap-1.5">
                      <Package size={13} className="text-blue-600" />
                      Fertilizer Supply Chain
                    </span>
                    <span className="text-[9.5px] bg-blue-100 text-blue-800 px-1.5 py-0.5 rounded-md font-bold border border-blue-200 font-mono">
                      Logistics Tally
                    </span>
                  </div>
                  <div className="mt-3.5 grid grid-cols-2 gap-2 text-xs">
                    <div>
                      <span className="block text-[9.5px] text-slate-500 font-bold uppercase tracking-wider">Main Warehouse Stock</span>
                      <span className="text-base font-black text-slate-900 block font-mono mt-0.5">
                        {Math.max(0, totalBagsInward - totalBagsDispatched).toLocaleString()} <span className="text-[10px] text-slate-500 font-bold uppercase font-sans">Bags</span>
                      </span>
                    </div>
                    <div>
                      <span className="block text-[9.5px] text-slate-500 font-bold uppercase tracking-wider">Dispatched to Villages</span>
                      <span className="text-base font-black text-blue-700 block font-mono mt-0.5">
                        {totalBagsDispatched.toLocaleString()} <span className="text-[10px] text-slate-500 font-bold uppercase font-sans">Bags</span>
                      </span>
                    </div>
                  </div>
                </div>

                <div className="p-3 bg-white flex-1 flex flex-col justify-between">
                  <div className="space-y-1.5">
                    <span className="text-[9px] uppercase font-bold tracking-wider text-slate-400 block px-1">
                      Product Tally: Main Warehouse vs Village
                    </span>
                    <div className="space-y-1.5 max-h-[145px] overflow-y-auto pr-0.5">
                      {fertilizerProductSummaries.length === 0 ? (
                        <div className="py-6 text-center text-slate-400 text-[10px]">No fertilizer inventory found.</div>
                      ) : (
                        fertilizerProductSummaries.map((p) => {
                          const mainStock = p.availableMain;
                          const villageStock = p.availableVillage;
                          const totalLocalStock = mainStock + villageStock;
                          const percentMain = totalLocalStock > 0 ? Math.round((mainStock / totalLocalStock) * 100) : 0;
                          return (
                            <div key={p.productName} className="p-2 bg-slate-50 hover:bg-slate-100 rounded-lg border border-slate-100/70 transition space-y-1 text-[10px]">
                              <div className="flex justify-between font-bold text-slate-800">
                                <span>{p.productName}</span>
                                <span className="font-mono text-slate-900">{totalLocalStock.toLocaleString()} Bags Total</span>
                              </div>
                              <div className="w-full bg-slate-200 rounded-full h-1.5 flex overflow-hidden">
                                <div style={{ width: `${percentMain}%` }} className="bg-slate-700 h-1.5 rounded-l" title={`Main: ${mainStock}`}></div>
                                <div style={{ width: `${100 - percentMain}%` }} className="bg-blue-600 h-1.5 rounded-r" title={`Villages: ${villageStock}`}></div>
                              </div>
                              <div className="flex justify-between text-[8px] text-slate-400 font-bold font-mono">
                                <span>Main Stock: {mainStock.toLocaleString()} Bags ({percentMain}%)</span>
                                <span>Village Stock: {villageStock.toLocaleString()} Bags</span>
                              </div>
                            </div>
                          );
                        })
                      )}
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      setActiveTab("fertilizer");
                      setFertilizerSubTab("inventory");
                    }}
                    className="w-full mt-3 py-1.5 bg-slate-50 hover:bg-slate-100 text-slate-700 text-[9.5px] font-bold rounded-lg border border-slate-200 flex items-center justify-center gap-1 uppercase tracking-wide cursor-pointer transition"
                  >
                    View Logistics Dashboard <ArrowRight size={10} />
                  </button>
                </div>
              </div>

              {/* CARD 3: HUB FINANCIAL STATEMENT */}
              <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden flex flex-col justify-between">
                <div className="p-4 border-b border-slate-100 bg-slate-50/50">
                  <div className="flex justify-between items-center">
                    <span className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400 font-display flex items-center gap-1.5">
                      <Coins size={13} className="text-emerald-600" />
                      Hub Capital & Balances
                    </span>
                    <span className="text-[9.5px] bg-slate-200 text-slate-700 px-1.5 py-0.5 rounded-md font-bold border border-slate-200 font-mono">
                      FY-2026 Tally
                    </span>
                  </div>
                  <div className="mt-3.5 space-y-1">
                    <span className="block text-[9.5px] text-slate-500 font-bold uppercase tracking-wider">Total Cash Collected</span>
                    <span className="text-xl font-black text-emerald-800 font-mono mt-0.5 block">
                      ₹ {totalCollectionCash.toLocaleString()}
                    </span>
                  </div>
                </div>

                <div className="p-3 bg-white flex-1 flex flex-col justify-between">
                  <div className="space-y-1.5">
                    <span className="text-[9px] uppercase font-bold tracking-wider text-slate-400 block px-1">
                      Outstanding Balances
                    </span>
                    <div className="space-y-1.5">
                      {/* Accounts Payable */}
                      <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-100/70 flex justify-between items-center text-[10px]">
                        <div>
                          <strong className="block text-slate-800">Supplier Accounts Payable</strong>
                          <span className="text-[8px] text-slate-400 mt-0.5 block font-semibold">Owed for fertilizer supply manufacturing</span>
                        </div>
                        <span className="font-extrabold font-mono text-rose-600 text-[11px] bg-rose-50 px-2 py-1 border border-rose-100 rounded-md">
                          ₹ {outstandingSupplierDues.toLocaleString()}
                        </span>
                      </div>

                      {/* Farmer Receivables */}
                      <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-100/70 flex justify-between items-center text-[10px]">
                        <div>
                          <strong className="block text-slate-800">Farmer Outstanding Balances</strong>
                          <span className="text-[8px] text-slate-400 mt-0.5 block font-semibold">Uncollected fertilizer dues from cultivators</span>
                        </div>
                        <span className="font-extrabold font-mono text-amber-600 text-[11px] bg-amber-50 px-2 py-1 border border-amber-100 rounded-md">
                          ₹ {outstandingFarmerReceivables.toLocaleString()}
                        </span>
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => setActiveTab("outstanding")}
                    className="w-full mt-3 py-1.5 bg-slate-50 hover:bg-slate-100 text-slate-700 text-[9.5px] font-bold rounded-lg border border-slate-200 flex items-center justify-center gap-1 uppercase tracking-wide cursor-pointer transition"
                  >
                    Open P&L Analysis <ArrowRight size={10} />
                  </button>
                </div>
              </div>

            </div>

            {/* LOWER REGION: 1. CORE PIPELINE APPROVALS OVERVIEW  2. INTERACTIVE TO-DO MANAGER */}
            <div className="space-y-5">
              
              {/* CORE PIPELINE APPROVALS MATRIX */}
              <div className="bg-white p-4.5 rounded-xl border border-slate-200 shadow-3xs space-y-3.5">
                <div>
                  <h4 className="text-xs font-extrabold text-slate-800 uppercase tracking-wide flex items-center gap-1.5">
                    <CheckSquare size={14} className="text-brand-800" />
                    Proprietor Approval & Sign-Off Matrix
                  </h4>
                  <p className="text-[10px] text-slate-500 font-medium mt-0.5 leading-relaxed">
                    Quickly view pending authorizations across all departments. Click any row to view, audit, and finalize payment settlements.
                  </p>
                </div>

                <div className="grid grid-cols-1 gap-2.5 text-xs">
                  
                  {/* Crop Settlements */}
                  {(() => {
                    const count = (localFarmerPayments || []).filter(p => p && p.status === "Awaiting Approval").length;
                    return (
                      <button
                        onClick={() => {
                          setActiveTab("approvals");
                          setActiveSubTab("crop_settlement");
                        }}
                        className={`p-3 rounded-xl border text-left flex flex-col justify-between gap-1.5 transition cursor-pointer select-none ${
                          count > 0 ? "bg-amber-50/50 hover:bg-amber-50 border-amber-200/80 shadow-3xs" : "bg-slate-50/50 hover:bg-slate-50 border-slate-150"
                        }`}
                      >
                        <div className="flex justify-between items-start">
                          <span className="font-extrabold text-slate-800 block text-[10.5px]">Crop Settlements</span>
                          <span className={`px-2 py-0.5 rounded-full text-[9px] font-black font-mono ${
                            count > 0 ? "bg-amber-100 text-amber-800 border border-amber-200" : "bg-slate-200 text-slate-500"
                          }`}>
                            {count} Pending
                          </span>
                        </div>
                        <span className="text-[9.5px] text-slate-500 font-semibold leading-relaxed">
                          Authorize final crop pay-outs to harvesting farmers.
                        </span>
                      </button>
                    );
                  })()}

                  {/* Supplier Invoices */}
                  {(() => {
                    const count = (supplierBills || []).filter(sb => sb && sb.approvalStatus === "Pending Approval").length;
                    return (
                      <button
                        onClick={() => {
                          setActiveTab("approvals");
                          setActiveSubTab("supplier_invoices");
                        }}
                        className={`p-3 rounded-xl border text-left flex flex-col justify-between gap-1.5 transition cursor-pointer select-none ${
                          count > 0 ? "bg-indigo-50/50 hover:bg-indigo-50 border-indigo-200/80 shadow-3xs" : "bg-slate-50/50 hover:bg-slate-50 border-slate-150"
                        }`}
                      >
                        <div className="flex justify-between items-start">
                          <span className="font-extrabold text-slate-800 block text-[10.5px]">Supplier Invoices</span>
                          <span className={`px-2 py-0.5 rounded-full text-[9px] font-black font-mono ${
                            count > 0 ? "bg-indigo-100 text-indigo-800 border border-indigo-200" : "bg-slate-200 text-slate-500"
                          }`}>
                            {count} Pending
                          </span>
                        </div>
                        <span className="text-[9.5px] text-slate-500 font-semibold leading-relaxed">
                          Verify and clear manufacturing fertilizer purchase bills.
                        </span>
                      </button>
                    );
                  })()}

                  {/* Farmer Sowing Advances */}
                  {(() => {
                    const count = (paymentRequests || []).filter(pr => pr && (pr as any).ownerApprovalRequested === true).length;
                    return (
                      <button
                        onClick={() => {
                          setActiveTab("approvals");
                          setActiveSubTab("farmer_advances");
                        }}
                        className={`p-3 rounded-xl border text-left flex flex-col justify-between gap-1.5 transition cursor-pointer select-none ${
                          count > 0 ? "bg-rose-50/50 hover:bg-rose-50 border-rose-200/80 shadow-3xs" : "bg-slate-50/50 hover:bg-slate-50 border-slate-150"
                        }`}
                      >
                        <div className="flex justify-between items-start">
                          <span className="font-extrabold text-slate-800 block text-[10.5px]">Farmer Sowing Advances</span>
                          <span className={`px-2 py-0.5 rounded-full text-[9px] font-black font-mono ${
                            count > 0 ? "bg-rose-100 text-rose-800 border border-rose-200" : "bg-slate-200 text-slate-500"
                          }`}>
                            {count} Pending
                          </span>
                        </div>
                        <span className="text-[9.5px] text-slate-500 font-semibold leading-relaxed">
                          Sanction credit line requests for seeds and tilling.
                        </span>
                      </button>
                    );
                  })()}

                  {/* Field Tally Corrections */}
                  {(() => {
                    const count = (modificationRequests || []).filter(m => m && m.status === "Pending").length;
                    return (
                      <button
                        onClick={() => {
                          setActiveTab("approvals");
                          setActiveSubTab("ledger_corrections");
                        }}
                        className={`p-3 rounded-xl border text-left flex flex-col justify-between gap-1.5 transition cursor-pointer select-none ${
                          count > 0 ? "bg-violet-50/50 hover:bg-violet-50 border-violet-200/80 shadow-3xs" : "bg-slate-50/50 hover:bg-slate-50 border-slate-150"
                        }`}
                      >
                        <div className="flex justify-between items-start">
                          <span className="font-extrabold text-slate-800 block text-[10.5px]">Ledger & Tally Corrections</span>
                          <span className={`px-2 py-0.5 rounded-full text-[9px] font-black font-mono ${
                            count > 0 ? "bg-violet-100 text-violet-800 border border-violet-200" : "bg-slate-200 text-slate-500"
                          }`}>
                            {count} Pending
                          </span>
                        </div>
                        <span className="text-[9.5px] text-slate-500 font-semibold leading-relaxed">
                          Audit and authorize changes to historical stock/ledger entries.
                        </span>
                      </button>
                    );
                  })()}

                  {/* Restrict Salary Unlock scale */}
                  {(() => {
                    const count = (salaryUnlockRequests || []).filter(r => r && r.status === "Pending").length;
                    return (
                      <button
                        onClick={() => {
                          setActiveTab("approvals");
                          setActiveSubTab("salary_unlocks");
                        }}
                        className={`p-3 rounded-xl border text-left flex flex-col justify-between gap-1.5 transition cursor-pointer select-none ${
                          count > 0 ? "bg-emerald-50/50 hover:bg-emerald-50 border-emerald-200/80 shadow-3xs" : "bg-slate-50/50 hover:bg-slate-50 border-slate-150"
                        }`}
                      >
                        <div className="flex justify-between items-start">
                          <span className="font-extrabold text-slate-800 block text-[10.5px]">Staff Salary Scales</span>
                          <span className={`px-2 py-0.5 rounded-full text-[9px] font-black font-mono ${
                            count > 0 ? "bg-emerald-100 text-emerald-800 border border-emerald-200" : "bg-slate-200 text-slate-500"
                          }`}>
                            {count} Pending
                          </span>
                        </div>
                        <span className="text-[9.5px] text-slate-500 font-semibold leading-relaxed">
                          Approve field officer monthly payout unlocks & scales.
                        </span>
                      </button>
                    );
                  })()}

                  {/* Sowing Sourcing Rates & Profile Registry */}
                  {(() => {
                    const count = ((rateChangeRequests || []).filter(r => r && r.status === "Pending").length) + 
                                  ((farmerChangeRequests || []).filter(r => r && r.status === "Pending").length);
                    return (
                      <button
                        onClick={() => {
                          setActiveTab("approvals");
                          setActiveSubTab("rate_registry");
                        }}
                        className={`p-3 rounded-xl border text-left flex flex-col justify-between gap-1.5 transition cursor-pointer select-none ${
                          count > 0 ? "bg-sky-50/50 hover:bg-sky-50 border-sky-200/80 shadow-3xs" : "bg-slate-50/50 hover:bg-slate-50 border-slate-150"
                        }`}
                      >
                        <div className="flex justify-between items-start">
                          <span className="font-extrabold text-slate-800 block text-[10.5px]">Rates & Profiles Registry</span>
                          <span className={`px-2 py-0.5 rounded-full text-[9px] font-black font-mono ${
                            count > 0 ? "bg-sky-100 text-sky-800 border border-sky-200" : "bg-slate-200 text-slate-500"
                          }`}>
                            {count} Pending
                          </span>
                        </div>
                        <span className="text-[9.5px] text-slate-500 font-semibold leading-relaxed">
                          Verify crop baseline procurement rates & profiles.
                        </span>
                      </button>
                    );
                  })()}

                </div>
              </div>

              {/* PROPRIETOR INTERACTIVE TO-DO MANAGER */}
              <div className="bg-white p-4.5 rounded-xl border border-slate-200 shadow-3xs flex flex-col justify-between space-y-3.5">
                <div>
                  <h4 className="text-xs font-extrabold text-slate-800 uppercase tracking-wide flex items-center gap-1.5">
                    <ClipboardList size={14} className="text-brand-800" />
                    Proprietor Tasks & To-Dos
                  </h4>
                  <p className="text-[10px] text-slate-500 font-medium mt-0.5 leading-relaxed">
                    Interactive workspace planner. Manage daily core tasks, checklists, and direct hub operations.
                  </p>
                </div>

                {/* Task Checklist list */}
                <div className="space-y-2 max-h-[220px] overflow-y-auto pr-0.5">
                  {todos.length === 0 ? (
                    <div className="py-10 text-center text-slate-400 text-[10px] border border-dashed border-slate-150 rounded-xl">
                      No active task items found! Create a task below.
                    </div>
                  ) : (
                    todos.map((todo) => (
                      <div
                        key={todo.id}
                        className={`p-2.5 rounded-xl border flex items-center justify-between gap-2.5 transition text-[10.5px] group ${
                          todo.done 
                            ? "bg-slate-50/80 border-slate-100 text-slate-400 line-through" 
                            : "bg-white border-slate-200 hover:border-slate-300 text-slate-800 shadow-3xs"
                        }`}
                      >
                        <div className="flex items-center gap-2.5 flex-1 min-w-0">
                          <button
                            type="button"
                            onClick={() => toggleTodo(todo.id)}
                            className="text-slate-400 hover:text-brand-800 shrink-0 cursor-pointer transition"
                          >
                            {todo.done ? (
                              <CheckSquare size={15} className="text-emerald-600 font-bold" />
                            ) : (
                              <Square size={15} className="text-slate-300 hover:text-slate-500" />
                            )}
                          </button>
                          <div className="min-w-0 flex-1">
                            <span className="font-bold block text-[10.5px] truncate">{todo.text}</span>
                            <span className="text-[8px] bg-slate-100 text-slate-500 border border-slate-200 font-extrabold px-1.5 py-0.2 rounded mt-0.5 inline-block uppercase tracking-wider font-mono">
                              {todo.category}
                            </span>
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => deleteTodo(todo.id)}
                          className="text-slate-400 hover:text-rose-600 transition p-1 cursor-pointer shrink-0"
                          title="Delete Action Item"
                        >
                          <Trash size={13} />
                        </button>
                      </div>
                    ))
                  )}
                </div>

                {/* Add task form */}
                <form onSubmit={addTodo} className="pt-2 border-t border-slate-100">
                  <div className="flex gap-1.5">
                    <input
                      type="text"
                      required
                      placeholder="Add custom task..."
                      value={todoText}
                      onChange={(e) => setTodoText(e.target.value)}
                      className="flex-1 p-2 border border-slate-200 rounded-lg text-xs bg-white text-slate-800 font-semibold shadow-2xs focus:ring-1 focus:ring-brand-500 focus:outline-none placeholder:text-slate-400"
                    />
                    <button
                      type="submit"
                      className="px-3.5 py-2 bg-brand-800 hover:bg-brand-900 text-white font-bold rounded-lg transition text-xs shadow-3xs cursor-pointer flex items-center justify-center gap-1 shrink-0"
                    >
                      <Plus size={13} /> Add
                    </button>
                  </div>
                </form>

              </div>

            </div>

          </div>
        )}

        {/* TAB 2: APPROVAL CENTER */}
        {activeTab === "approvals" && (
          <div className="space-y-6 text-left animate-in fade-in duration-200">
            {/* Page Header */}
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h2 className="text-sm font-bold text-slate-800 uppercase tracking-wide">Owner Approval & Authorization Center</h2>
                <p className="text-[11px] text-slate-500 mt-0.5 leading-normal">
                  Review and sign-off on manufacturing invoices, farmer advances, field tally corrections, rate updates, and restricted salary scale unlocks.
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-[9.5px] bg-slate-100 text-slate-600 px-2 py-0.8 rounded-lg font-bold border border-slate-200">
                  Pending Actions: {
                    (approvalRequests || []).length + 
                    (pendingAdvances || []).length + 
                    (modificationRequests || []).filter(m => m && m.status === "Pending").length +
                    (rateChangeRequests || []).filter(r => r && r.status === "Pending").length +
                    (farmerChangeRequests || []).filter(r => r && r.status === "Pending").length +
                    (advanceChangeRequests || []).filter(r => r && r.status === "Pending").length +
                    (salaryUnlockRequests || []).filter(r => r && r.status === "Pending").length +
                    (localFarmerPayments || []).filter(p => p && p.status === "Awaiting Approval").length
                  }
                </span>
              </div>
            </div>

            {/* SUBTAB CONTROL & FILTERS PANEL */}
            {(() => {
              const subTabsList = [
                { id: "crop_settlement", label: "Crop Settlements", badgeCount: (localFarmerPayments || []).filter(p => p && p.status === "Awaiting Approval").length },
                { id: "supplier_invoices", label: "Supplier Invoices", badgeCount: (supplierBills || []).filter(sb => sb && sb.approvalStatus === "Pending Approval").length },
                { id: "farmer_advances", label: "Farmer Advances", badgeCount: (paymentRequests || []).filter(pr => pr && (pr as any).ownerApprovalRequested === true).length },
                { id: "ledger_corrections", label: "Ledger Corrections", badgeCount: (modificationRequests || []).filter(m => m && m.status === "Pending").length },
                { id: "rate_registry", label: "Rate Registry", badgeCount: (rateChangeRequests || []).filter(r => r && r.status === "Pending").length },
                { id: "farmer_profile", label: "Farmer Profile", badgeCount: (farmerChangeRequests || []).filter(r => r && r.status === "Pending").length },
                { id: "advance_corrections", label: "Advance Corrections", badgeCount: (advanceChangeRequests || []).filter(r => r && r.status === "Pending").length },
                { id: "salary_unlocks", label: "Salary Unlocks", badgeCount: (salaryUnlockRequests || []).filter(r => r && r.status === "Pending").length },
              ];

              return (
                <div className="space-y-4">
                  {/* Horizontal Scrollable Sub-tabs Row */}
                  <div className="flex items-center gap-2 overflow-x-auto pb-2 no-scrollbar border-b border-slate-200">
                    {subTabsList.map((st) => {
                      const isActive = activeSubTab === st.id;
                      return (
                        <button
                          key={st.id}
                          onClick={() => setActiveSubTab(st.id)}
                          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition cursor-pointer shrink-0 ${
                            isActive
                              ? "bg-brand-800 text-white shadow-sm"
                              : "bg-slate-50 text-slate-600 hover:bg-slate-100 border border-slate-200"
                          }`}
                        >
                          <span>{st.label}</span>
                          {st.badgeCount > 0 && (
                            <span className={`px-1.5 py-0.2 text-[9px] font-black rounded-full ${
                              isActive ? "bg-white text-brand-950" : "bg-rose-500 text-white"
                            }`}>
                              {st.badgeCount}
                            </span>
                          )}
                        </button>
                      );
                    })}
                  </div>

                  {/* Filter controls */}
                  <div className="grid grid-cols-1 gap-2 bg-slate-50 p-2.5 rounded-xl border border-slate-150">
                    <div className="relative">
                      <span className="absolute inset-y-0 left-3 flex items-center text-slate-400">
                        <Search size={14} />
                      </span>
                      <input
                        type="text"
                        placeholder="Search approvals (farmer, bill, ID, route, product)..."
                        value={approvalSearchQuery}
                        onChange={(e) => setApprovalSearchQuery(e.target.value)}
                        className="w-full bg-white border border-slate-200 rounded-lg pl-9 pr-3 py-1.5 text-xs focus:outline-none focus:border-brand-500 text-slate-800 font-medium placeholder-slate-400"
                      />
                    </div>

                    {activeTabVillages.length > 0 && (
                      <div>
                        <select
                          value={selectedVillageFilter}
                          onChange={(e) => setSelectedVillageFilter(e.target.value)}
                          className="w-full bg-white border border-slate-200 rounded-lg px-3 py-1.5 text-xs focus:outline-none focus:border-brand-500 text-slate-700 font-semibold cursor-pointer"
                        >
                          <option value="">All Village Routes ({activeTabVillages.length})</option>
                          {activeTabVillages.map((v) => (
                            <option key={v} value={v}>
                              📍 {v}
                            </option>
                          ))}
                        </select>
                      </div>
                    )}
                  </div>

                  {selectedItemIds.length > 0 && (
                    <div className="flex flex-col gap-3 bg-amber-50 border border-amber-200 rounded-xl p-3 shadow-2xs animate-in fade-in slide-in-from-top-1 duration-200">
                      <div className="flex items-start gap-2.5">
                        <div className="bg-amber-100 p-1.5 rounded-lg text-amber-800 shrink-0">
                          <ClipboardList size={16} />
                        </div>
                        <div>
                          <p className="text-xs font-bold text-amber-900">
                            Bulk Action selection: {selectedItemIds.length} items
                          </p>
                          <p className="text-[10px] text-amber-700 font-medium leading-normal">
                            {activeSubTab === "crop_settlement" || activeSubTab === "supplier_invoices" || activeSubTab === "farmer_advances" ? (
                              <>
                                Selected value: <span className="font-bold">₹ {calculateSelectedTotal().toLocaleString()}</span>
                              </>
                            ) : (
                              "Perform bulk authorization on the selected registries"
                            )}
                          </p>
                        </div>
                      </div>
                      <div className="flex flex-wrap items-center gap-1.5 pt-2.5 border-t border-amber-200/60 w-full">
                        <button
                          onClick={() => setPreviewMode("approve")}
                          className="flex-1 min-w-[125px] px-2.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-[10.5px] font-bold shadow-xs flex items-center justify-center gap-1 cursor-pointer transition whitespace-nowrap"
                        >
                          <CheckCircle size={13} />
                          Preview &amp; Approve
                        </button>
                        <button
                          onClick={() => setPreviewMode("reject")}
                          className="flex-1 min-w-[125px] px-2.5 py-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-[10.5px] font-bold shadow-xs flex items-center justify-center gap-1 cursor-pointer transition whitespace-nowrap"
                        >
                          <XCircle size={13} />
                          Preview &amp; Reject
                        </button>
                        <button
                          onClick={() => setSelectedItemIds([])}
                          className="px-2.5 py-1.5 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-lg text-[10.5px] font-semibold cursor-pointer transition whitespace-nowrap"
                        >
                          Clear
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              );
            })()}

            {/* SECTION 1: Salary Scale Unlock Requests */}
            {activeSubTab === "salary_unlocks" && (
              <div className="space-y-2">
              <div className="flex items-center gap-2 px-1">
                <Lock size={15} className="text-rose-500 shrink-0" />
                <span className="text-[10.5px] font-bold text-slate-400 uppercase tracking-wider block">
                  Salary Scale Unlock Authorization Queue
                </span>
                <span className="text-[9px] bg-rose-50 text-rose-600 px-1.5 py-0.2 rounded-full font-bold ml-1">
                  {salaryUnlockRequests.filter(r => r.status === "Pending").length} Pending
                </span>
              </div>
              
              <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 text-[10px] font-bold uppercase tracking-wider">
                        <th className="py-2.5 px-3 w-10 text-center">
                          <input
                            type="checkbox"
                            checked={currentSubTabItems.length > 0 && currentSubTabItems.every(item => selectedItemIds.includes(item.id))}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setSelectedItemIds(currentSubTabItems.map(item => item.id));
                              } else {
                                setSelectedItemIds([]);
                              }
                            }}
                            className="w-3.5 h-3.5 text-brand-600 border-slate-300 rounded focus:ring-brand-500 cursor-pointer"
                          />
                        </th>
                        <th className="py-2.5 px-3">Staff Name</th>
                        <th className="py-2.5 px-3">Designation</th>
                        <th className="py-2.5 px-3 font-mono">Mobile</th>
                        <th className="py-2.5 px-3 text-right">Locked Salary</th>
                        <th className="py-2.5 px-3">Reason for Unlock Request</th>
                        <th className="py-2.5 px-3 font-mono">Date Requested</th>
                        <th className="py-2.5 px-3 text-center">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-slate-700">
                      {currentSubTabItems.length === 0 ? (
                        <tr>
                          <td colSpan={8} className="py-6 text-center text-slate-400 font-medium italic">
                            No active salary scale unlock requests pending matching filters.
                          </td>
                        </tr>
                      ) : (
                        currentSubTabItems.map((req) => (
                          <tr key={req.id} className="hover:bg-slate-50/40">
                            <td className="py-2.5 px-3 w-10 text-center">
                              <input
                                type="checkbox"
                                checked={selectedItemIds.includes(req.id)}
                                onChange={(e) => {
                                  if (e.target.checked) {
                                    setSelectedItemIds([...selectedItemIds, req.id]);
                                  } else {
                                    setSelectedItemIds(selectedItemIds.filter(id => id !== req.id));
                                  }
                                }}
                                className="w-3.5 h-3.5 text-brand-600 border-slate-300 rounded focus:ring-brand-500 cursor-pointer"
                              />
                            </td>
                            <td className="py-2.5 px-3 font-bold text-slate-900">{req.staffName}</td>
                            <td className="py-2.5 px-3">
                              <span className="px-1.5 py-0.5 rounded bg-slate-100 text-slate-700 font-semibold text-[10px]">
                                {req.designation}
                              </span>
                            </td>
                            <td className="py-2.5 px-3 font-mono text-slate-500">{req.staffMobile}</td>
                            <td className="py-2.5 px-3 text-right font-bold text-slate-900">₹ {(req.currentSalary ?? 0).toLocaleString()}</td>
                            <td className="py-2.5 px-3 text-slate-600 italic">"{req.reason}"</td>
                            <td className="py-2.5 px-3 font-mono text-slate-400">{req.dateRequested}</td>
                            <td className="py-2.5 px-3 text-center">
                              <div className="flex items-center justify-center gap-1.5">
                                <button
                                  onClick={() => onApproveSalaryUnlock && onApproveSalaryUnlock(req.id)}
                                  className="p-1.5 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200 rounded transition cursor-pointer"
                                  title="Approve Unlock"
                                >
                                  <Unlock size={14} />
                                </button>
                                <button
                                  onClick={() => onRejectSalaryUnlock && onRejectSalaryUnlock(req.id)}
                                  className="p-1.5 bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200 rounded transition cursor-pointer"
                                  title="Reject Unlock"
                                >
                                  <XCircle size={14} />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
            )}

            {/* SECTION 1.5: Farmer Crop Settlement Approvals */}
            {activeSubTab === "crop_settlement" && (
              <div className="space-y-2">
              <div className="flex items-center gap-2 px-1">
                <Sprout size={15} className="text-emerald-600 shrink-0" />
                <span className="text-[10.5px] font-bold text-slate-400 uppercase tracking-wider block">
                  Farmer Final Crop Settlement Approval Queue
                </span>
                <span className="text-[9px] bg-emerald-50 text-emerald-600 px-1.5 py-0.2 rounded-full font-bold ml-1">
                  {localFarmerPayments.filter(p => p && p.status === "Awaiting Approval").length} Pending
                </span>
              </div>
              
              <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 text-[10px] font-bold uppercase tracking-wider">
                        <th className="py-2.5 px-3 w-10 text-center">
                          <input
                            type="checkbox"
                            checked={currentSubTabItems.length > 0 && currentSubTabItems.every(item => selectedItemIds.includes(item.id))}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setSelectedItemIds(currentSubTabItems.map(item => item.id));
                              } else {
                                setSelectedItemIds([]);
                              }
                            }}
                            className="w-3.5 h-3.5 text-brand-600 border-slate-300 rounded focus:ring-brand-500 cursor-pointer"
                          />
                        </th>
                        <th className="py-2.5 px-3">Farmer &amp; Route</th>
                        <th className="py-2.5 px-3 text-right">Yield Yield</th>
                        <th className="py-2.5 px-3 text-right">Bags</th>
                        <th className="py-2.5 px-3 text-right">Price/KG</th>
                        <th className="py-2.5 px-3 text-right">Gross Total</th>
                        <th className="py-2.5 px-3 text-right">Deductions Worksheet</th>
                        <th className="py-2.5 px-3 text-right">Net Payable</th>
                        <th className="py-2.5 px-3 text-center">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-slate-700 font-medium">
                      {currentSubTabItems.length === 0 ? (
                        <tr>
                          <td colSpan={9} className="py-6 text-center text-slate-400 font-medium italic">
                            No farmer final crop settlement approvals pending matching filters.
                          </td>
                        </tr>
                      ) : (
                        currentSubTabItems.map((p) => {
                          const weightKg = Number(p.weightKg) || 0;
                          const pricePerKg = Number(p.pricePerKg) || 0;
                          const advanceAmount = Number(p.advanceAmount) || 0;
                          const interest = Number(p.interest) || 0;
                          const pesticideDues = Number(p.pesticideDues) || 0;
                          const bagCount = Number(p.bagCount) || 0;

                          const gross = weightKg * pricePerKg;
                          const loading = Math.round((weightKg / 1000) * 400);
                          const totalDeductions = advanceAmount + interest + pesticideDues + loading;
                          const net = Math.round(gross - totalDeductions);

                          return (
                            <tr key={p.id} className="hover:bg-slate-50/40">
                              <td className="py-3 px-3 w-10 text-center">
                                <input
                                  type="checkbox"
                                  checked={selectedItemIds.includes(p.id)}
                                  onChange={(e) => {
                                    if (e.target.checked) {
                                      setSelectedItemIds([...selectedItemIds, p.id]);
                                    } else {
                                      setSelectedItemIds(selectedItemIds.filter(id => id !== p.id));
                                    }
                                  }}
                                  className="w-3.5 h-3.5 text-brand-600 border-slate-300 rounded focus:ring-brand-500 cursor-pointer"
                                />
                              </td>
                              <td className="py-3 px-3">
                                <div className="font-extrabold text-slate-900 leading-tight">{p.farmerName}</div>
                                <div className="text-[9.5px] text-slate-400 uppercase tracking-wide font-bold">{p.villageName}</div>
                              </td>
                              <td className="py-3 px-3 text-right font-mono text-slate-900 font-semibold">{weightKg.toLocaleString()} KG</td>
                              <td className="py-3 px-3 text-right font-mono text-slate-500">{bagCount}</td>
                              <td className="py-3 px-3 text-right font-mono text-emerald-700 font-bold">₹{pricePerKg}</td>
                              <td className="py-3 px-3 text-right font-mono font-bold text-slate-900">₹{gross.toLocaleString()}</td>
                              <td className="py-3 px-3 text-right text-rose-700 font-mono text-[10.5px]">
                                ₹{totalDeductions.toLocaleString()}
                                <span className="block text-[8px] text-slate-400 font-normal">
                                  Adv: {advanceAmount} | Pesticides: {pesticideDues} | Loading: {loading}
                                </span>
                              </td>
                              <td className="py-3 px-3 text-right font-mono font-black text-emerald-800 bg-emerald-50/20">
                                ₹{net.toLocaleString()}
                              </td>
                              <td className="py-3 px-3 text-center">
                                <div className="flex items-center justify-center gap-1.5">
                                  <button
                                    onClick={() => handleApproveFarmerPayment(p.id)}
                                    className="p-1.5 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200 rounded transition cursor-pointer"
                                    title="Approve Settlement"
                                  >
                                    <Check size={14} />
                                  </button>
                                  <button
                                    onClick={() => handleRejectFarmerPayment(p.id)}
                                    className="p-1.5 bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200 rounded transition cursor-pointer"
                                    title="Reject &amp; Send to Draft"
                                  >
                                    <X size={14} />
                                  </button>
                                </div>
                              </td>
                            </tr>
                          );
                        })
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
            )}

            {/* SECTION 2: Supplier Invoices Approvals */}
            {activeSubTab === "supplier_invoices" && (
              <div className="space-y-2">
              <div className="flex items-center gap-2 px-1">
                <ShieldCheck size={15} className="text-brand-600 shrink-0" />
                <span className="text-[10.5px] font-bold text-slate-400 uppercase tracking-wider block">
                  Supplier Invoice Verification Queue
                </span>
                <span className="text-[9px] bg-brand-50 text-brand-600 px-1.5 py-0.2 rounded-full font-bold ml-1">
                  {(approvalRequests || []).length} Pending
                </span>
              </div>
              
              <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 text-[10px] font-bold uppercase tracking-wider">
                        <th className="py-2.5 px-3 w-10 text-center">
                          <input
                            type="checkbox"
                            checked={currentSubTabItems.length > 0 && currentSubTabItems.every(item => selectedItemIds.includes(item.id))}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setSelectedItemIds(currentSubTabItems.map(item => item.id));
                              } else {
                                setSelectedItemIds([]);
                              }
                            }}
                            className="w-3.5 h-3.5 text-brand-600 border-slate-300 rounded focus:ring-brand-500 cursor-pointer"
                          />
                        </th>
                        <th className="py-2.5 px-3">Invoice No</th>
                        <th className="py-2.5 px-3">Supplier Name</th>
                        <th className="py-2.5 px-3">Product Name (Qty)</th>
                        <th className="py-2.5 px-3">Accounting Note</th>
                        <th className="py-2.5 px-3 text-right">Total Payable</th>
                        <th className="py-2.5 px-3 text-center">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-slate-700">
                      {currentSubTabItems.length === 0 ? (
                        <tr>
                          <td colSpan={7} className="py-6 text-center text-slate-400 font-medium italic">
                            No manufacturing invoices pending matching filters.
                          </td>
                        </tr>
                      ) : (
                        currentSubTabItems.map((bill) => (
                          <tr key={bill.id} className="hover:bg-slate-50/40">
                            <td className="py-2.5 px-3 w-10 text-center">
                              <input
                                type="checkbox"
                                checked={selectedItemIds.includes(bill.id)}
                                onChange={(e) => {
                                  if (e.target.checked) {
                                    setSelectedItemIds([...selectedItemIds, bill.id]);
                                  } else {
                                    setSelectedItemIds(selectedItemIds.filter(id => id !== bill.id));
                                  }
                                }}
                                className="w-3.5 h-3.5 text-brand-600 border-slate-300 rounded focus:ring-brand-500 cursor-pointer"
                              />
                            </td>
                            <td className="py-2.5 px-3 font-mono text-slate-900 font-bold">{bill.billNumber}</td>
                            <td className="py-2.5 px-3 font-bold">{bill.supplierName}</td>
                            <td className="py-2.5 px-3">
                              {bill.productName} <span className="font-semibold text-slate-500">({bill.bagCount} Bags)</span>
                            </td>
                            <td className="py-2.5 px-3 italic text-slate-500 max-w-xs truncate" title={bill.notes}>
                              {bill.notes || "-"}
                            </td>
                            <td className="py-2.5 px-3 text-right font-bold text-slate-900">₹ {(bill.totalAmount ?? 0).toLocaleString()}</td>
                            <td className="py-2.5 px-3 text-center">
                              <div className="flex items-center justify-center gap-1.5">
                                <button
                                  onClick={() => onApproveBill && onApproveBill(bill.id)}
                                  className="p-1 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200 rounded transition cursor-pointer"
                                  title="Approve Bill"
                                >
                                  <CheckCircle size={14} />
                                </button>
                                <button
                                  onClick={() => onHoldBill && onHoldBill(bill.id)}
                                  className="p-1 bg-amber-50 text-amber-700 hover:bg-amber-100 border border-amber-200 rounded transition cursor-pointer"
                                  title="Put on Hold"
                                >
                                  <Pause size={14} />
                                </button>
                                <button
                                  onClick={() => onRejectBill && onRejectBill(bill.id)}
                                  className="p-1 bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200 rounded transition cursor-pointer"
                                  title="Reject Bill"
                                >
                                  <XCircle size={14} />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
            )}

            {/* SECTION 3: Farmer Advances Authorization */}
            {activeSubTab === "farmer_advances" && (
              <div className="space-y-2">
              <div className="flex items-center gap-2 px-1">
                <Landmark size={15} className="text-emerald-600 shrink-0" />
                <span className="text-[10.5px] font-bold text-slate-400 uppercase tracking-wider block">
                  Farmer Advances Authorization Queue
                </span>
                <span className="text-[9px] bg-emerald-50 text-emerald-600 px-1.5 py-0.2 rounded-full font-bold ml-1">
                  {(pendingAdvances || []).length} Pending
                </span>
              </div>
              
              <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 text-[10px] font-bold uppercase tracking-wider">
                        <th className="py-2.5 px-3 w-10 text-center">
                          <input
                            type="checkbox"
                            checked={currentSubTabItems.length > 0 && currentSubTabItems.every(item => selectedItemIds.includes(item.id))}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setSelectedItemIds(currentSubTabItems.map(item => item.id));
                              } else {
                                setSelectedItemIds([]);
                              }
                            }}
                            className="w-3.5 h-3.5 text-brand-600 border-slate-300 rounded focus:ring-brand-500 cursor-pointer"
                          />
                        </th>
                        <th className="py-2.5 px-3">Request ID</th>
                        <th className="py-2.5 px-3">Farmer Name</th>
                        <th className="py-2.5 px-3">Village Route</th>
                        <th className="py-2.5 px-3">Assistant</th>
                        <th className="py-2.5 px-3">Notes / Purpose</th>
                        <th className="py-2.5 px-3 text-right">Proposed Amount</th>
                        <th className="py-2.5 px-3 text-center">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-slate-700">
                      {currentSubTabItems.length === 0 ? (
                        <tr>
                          <td colSpan={8} className="py-6 text-center text-slate-400 font-medium italic">
                            No farmer advances pending matching filters.
                          </td>
                        </tr>
                      ) : (
                        currentSubTabItems.map((adv) => (
                          <tr key={adv.id} className="hover:bg-slate-50/40">
                            <td className="py-2.5 px-3 w-10 text-center">
                              <input
                                type="checkbox"
                                checked={selectedItemIds.includes(adv.id)}
                                onChange={(e) => {
                                  if (e.target.checked) {
                                    setSelectedItemIds([...selectedItemIds, adv.id]);
                                  } else {
                                    setSelectedItemIds(selectedItemIds.filter(id => id !== adv.id));
                                  }
                                }}
                                className="w-3.5 h-3.5 text-brand-600 border-slate-300 rounded focus:ring-brand-500 cursor-pointer"
                              />
                            </td>
                            <td className="py-2.5 px-3 font-mono text-slate-500">{adv.id}</td>
                            <td className="py-2.5 px-3 font-bold text-slate-900">{adv.farmerName}</td>
                            <td className="py-2.5 px-3 font-semibold text-slate-750">{adv.villageName}</td>
                            <td className="py-2.5 px-3 text-slate-500">{adv.assistantName}</td>
                            <td className="py-2.5 px-3 italic text-slate-500 max-w-xs truncate" title={adv.notes}>
                              {adv.notes || "-"}
                            </td>
                            <td className="py-2.5 px-3 text-right font-bold text-emerald-800 font-mono">₹ {(adv.amountProposed ?? 0).toLocaleString()}</td>
                            <td className="py-2.5 px-3 text-center">
                              <div className="flex items-center justify-center gap-1.5">
                                <button
                                  onClick={() => handleApproveAdvance(adv.id)}
                                  className="p-1 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200 rounded transition cursor-pointer"
                                  title="Approve Advance"
                                >
                                  <CheckCircle size={14} />
                                </button>
                                <button
                                  onClick={() => handleRejectAdvance(adv.id)}
                                  className="p-1 bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200 rounded transition cursor-pointer"
                                  title="Reject Advance"
                                >
                                  <XCircle size={14} />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
            )}

            {/* SECTION 4: Village Correction Approvals */}
            {activeSubTab === "ledger_corrections" && (
              <div className="space-y-2">
              <div className="flex items-center gap-2 px-1">
                <ClipboardList size={15} className="text-amber-500 shrink-0" />
                <span className="text-[10.5px] font-bold text-slate-400 uppercase tracking-wider block">
                  Village Ledger Tally Correction Audits
                </span>
                <span className="text-[9px] bg-amber-50 text-amber-700 px-1.5 py-0.2 rounded-full font-bold ml-1">
                  {(modificationRequests || []).filter(m => m && m.status === "Pending").length} Pending
                </span>
              </div>

              {(() => {
                const pendingMods = (modificationRequests || []).filter((m) => m && m.status === "Pending");
                return (
                  <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                    <div className="overflow-x-auto">
                      <table className="w-full text-left border-collapse text-xs">
                        <thead>
                          <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 text-[10px] font-bold uppercase tracking-wider">
                            <th className="py-2.5 px-3 w-10 text-center">
                              <input
                                type="checkbox"
                                checked={currentSubTabItems.length > 0 && currentSubTabItems.every(item => selectedItemIds.includes(item.id))}
                                onChange={(e) => {
                                  if (e.target.checked) {
                                    setSelectedItemIds(currentSubTabItems.map(item => item.id));
                                  } else {
                                    setSelectedItemIds([]);
                                  }
                                }}
                                className="w-3.5 h-3.5 text-brand-600 border-slate-300 rounded focus:ring-brand-500 cursor-pointer"
                              />
                            </th>
                            <th className="py-2.5 px-3">Tally ID</th>
                            <th className="py-2.5 px-3">Farmer & Village Route</th>
                            <th className="py-2.5 px-3">Live Active Ledger</th>
                            <th className="py-2.5 px-3">Proposed Correction</th>
                            <th className="py-2.5 px-3">Filer Justification</th>
                            <th className="py-2.5 px-3 text-center">Actions</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 text-slate-700">
                          {currentSubTabItems.length === 0 ? (
                            <tr>
                              <td colSpan={7} className="py-6 text-center text-slate-400 font-medium italic">
                                No assistant tally correction logs pending matching filters.
                              </td>
                            </tr>
                          ) : (
                            currentSubTabItems.map((mod) => (
                              <tr key={mod.id} className="hover:bg-slate-50/40">
                                <td className="py-2.5 px-3 w-10 text-center">
                                  <input
                                    type="checkbox"
                                    checked={selectedItemIds.includes(mod.id)}
                                    onChange={(e) => {
                                      if (e.target.checked) {
                                        setSelectedItemIds([...selectedItemIds, mod.id]);
                                      } else {
                                        setSelectedItemIds(selectedItemIds.filter(id => id !== mod.id));
                                      }
                                    }}
                                    className="w-3.5 h-3.5 text-brand-600 border-slate-300 rounded focus:ring-brand-500 cursor-pointer"
                                  />
                                </td>
                                <td className="py-2.5 px-3 font-mono font-bold text-amber-800">{mod.id}</td>
                                <td className="py-2.5 px-3">
                                  <strong className="block text-slate-900 font-bold">{mod.farmerName}</strong>
                                  <span className="text-[10px] text-slate-450 block">{mod.villageName} &bull; Assistant: {mod.assistantName}</span>
                                </td>
                                <td className="py-2.5 px-3 font-mono text-[10.5px] text-slate-500">
                                  Bags: <strong className="font-semibold">{mod.originalData?.bagCount}</strong> | Rate: ₹{mod.originalData?.ratePerBag} | Total: ₹{(mod.originalData?.totalAmount ?? 0).toLocaleString()}
                                </td>
                                <td className="py-2.5 px-3 font-mono text-[10.5px] text-amber-800 bg-amber-50/40 font-bold">
                                  Bags: <strong>{mod.requestedChanges?.bagCount}</strong> | Rate: ₹{mod.requestedChanges?.ratePerBag} | Total: ₹{(mod.requestedChanges?.totalAmount ?? 0).toLocaleString()}
                                </td>
                                <td className="py-2.5 px-3 italic text-slate-650 max-w-xs truncate" title={mod.justification}>
                                  "{mod.justification}"
                                </td>
                                <td className="py-2.5 px-3 text-center">
                                  <div className="flex items-center justify-center gap-1.5">
                                    <button
                                      onClick={() => onApproveModification && onApproveModification(mod.id)}
                                      className="p-1 bg-amber-100 text-amber-850 hover:bg-amber-200 border border-amber-300 rounded transition cursor-pointer"
                                      title="Approve Tally"
                                    >
                                      <Check size={14} />
                                    </button>
                                    <button
                                      onClick={() => onRejectModification && onRejectModification(mod.id)}
                                      className="p-1 bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200 rounded transition cursor-pointer"
                                      title="Reject Tally"
                                    >
                                      <X size={14} />
                                    </button>
                                  </div>
                                </td>
                              </tr>
                            ))
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                );
              })()}
            </div>
            )}

            {/* SECTION 5: Pricing & Sourcing Rate Registry Audits */}
            {activeSubTab === "rate_registry" && (
              <div className="space-y-2">
              <div className="flex items-center gap-2 px-1">
                <Coins size={15} className="text-indigo-600 shrink-0" />
                <span className="text-[10.5px] font-bold text-slate-400 uppercase tracking-wider block">
                  Pricing & Sourcing Rate Registry Audits
                </span>
                <span className="text-[9px] bg-indigo-50 text-indigo-600 px-1.5 py-0.2 rounded-full font-bold ml-1">
                  {(rateChangeRequests || []).filter(r => r && r.status === "Pending").length} Pending
                </span>
              </div>

              {(() => {
                const pendingRates = (rateChangeRequests || []).filter(r => r && r.status === "Pending");
                return (
                  <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                    <div className="overflow-x-auto">
                      <table className="w-full text-left border-collapse text-xs">
                        <thead>
                          <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 text-[10px] font-bold uppercase tracking-wider">
                            <th className="py-2.5 px-3 w-10 text-center">
                              <input
                                type="checkbox"
                                checked={currentSubTabItems.length > 0 && currentSubTabItems.every(item => selectedItemIds.includes(item.id))}
                                onChange={(e) => {
                                  if (e.target.checked) {
                                    setSelectedItemIds(currentSubTabItems.map(item => item.id));
                                  } else {
                                    setSelectedItemIds([]);
                                  }
                                }}
                                className="w-3.5 h-3.5 text-brand-600 border-slate-300 rounded focus:ring-brand-500 cursor-pointer"
                              />
                            </th>
                            <th className="py-2.5 px-3">Item Type & Variety</th>
                            <th className="py-2.5 px-3">Company / Year</th>
                            <th className="py-2.5 px-3 text-slate-400">Active Live Rate</th>
                            <th className="py-2.5 px-3 text-indigo-800">Proposed Tally</th>
                            <th className="py-2.5 px-3">Audit Comment</th>
                            <th className="py-2.5 px-3 text-center">Actions</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 text-slate-700">
                          {currentSubTabItems.length === 0 ? (
                            <tr>
                              <td colSpan={7} className="py-6 text-center text-slate-400 font-medium italic">
                                Sourcing rate cards pending matching filters.
                              </td>
                            </tr>
                          ) : (
                            currentSubTabItems.map((req) => (
                              <tr key={req.id} className="hover:bg-slate-50/40">
                                <td className="py-2.5 px-3 w-10 text-center">
                                  <input
                                    type="checkbox"
                                    checked={selectedItemIds.includes(req.id)}
                                    onChange={(e) => {
                                      if (e.target.checked) {
                                        setSelectedItemIds([...selectedItemIds, req.id]);
                                      } else {
                                        setSelectedItemIds(selectedItemIds.filter(id => id !== req.id));
                                      }
                                    }}
                                    className="w-3.5 h-3.5 text-brand-600 border-slate-300 rounded focus:ring-brand-500 cursor-pointer"
                                  />
                                </td>
                                <td className="py-2.5 px-3">
                                  <div className="flex items-center gap-1.5 font-bold text-slate-900">
                                    <span>{req.type === "seed" ? "🌾" : "🧪"}</span>
                                    <span>{req.cropOrProductName}</span>
                                  </div>
                                </td>
                                <td className="py-2.5 px-3 font-medium text-slate-600">{req.companyOrMfrName} ({req.year})</td>
                                <td className="py-2.5 px-3 font-mono text-slate-500">₹ {(req.currentRate ?? 0).toLocaleString()}</td>
                                <td className="py-2.5 px-3 font-mono font-bold">
                                  {req.action === "delete" ? (
                                    <span className="text-rose-650 bg-rose-50 px-1.5 py-0.5 rounded border border-rose-100 line-through">Proposed Deletion</span>
                                  ) : (
                                    <span className="text-emerald-700 font-bold">₹ {(req.requestedRate ?? 0).toLocaleString()}</span>
                                  )}
                                </td>
                                <td className="py-2.5 px-3 italic text-slate-500 max-w-xs truncate" title={req.requestNotes}>
                                  "{req.requestNotes || "No notes"}"
                                </td>
                                <td className="py-2.5 px-3 text-center">
                                  <div className="flex items-center justify-center gap-1.5">
                                    <button
                                      onClick={() => onApproveRateChange && onApproveRateChange(req.id)}
                                      className="p-1 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200 rounded transition cursor-pointer"
                                      title="Approve Rate"
                                    >
                                      <Check size={14} />
                                    </button>
                                    <button
                                      onClick={() => onRejectRateChange && onRejectRateChange(req.id)}
                                      className="p-1 bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200 rounded transition cursor-pointer"
                                      title="Reject Rate"
                                    >
                                      <X size={14} />
                                    </button>
                                  </div>
                                </td>
                              </tr>
                            ))
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                );
              })()}
            </div>
            )}

            {/* SECTION 6: Farmer Registry Correction Audits */}
            {activeSubTab === "farmer_profile" && (
              <div className="space-y-2">
              <div className="flex items-center gap-2 px-1">
                <UserCheck size={15} className="text-indigo-600 shrink-0" />
                <span className="text-[10.5px] font-bold text-slate-400 uppercase tracking-wider block">
                  Farmer Profile Registry Audits
                </span>
                <span className="text-[9px] bg-indigo-50 text-indigo-700 px-1.5 py-0.2 rounded-full font-bold ml-1">
                  {(farmerChangeRequests || []).filter(r => r && r.status === "Pending").length} Pending
                </span>
              </div>

              {(() => {
                const pendingFarmers = (farmerChangeRequests || []).filter(r => r && r.status === "Pending");
                return (
                  <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                    <div className="overflow-x-auto">
                      <table className="w-full text-left border-collapse text-xs">
                        <thead>
                          <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 text-[10px] font-bold uppercase tracking-wider">
                            <th className="py-2.5 px-3 w-10 text-center">
                              <input
                                type="checkbox"
                                checked={currentSubTabItems.length > 0 && currentSubTabItems.every(item => selectedItemIds.includes(item.id))}
                                onChange={(e) => {
                                  if (e.target.checked) {
                                    setSelectedItemIds(currentSubTabItems.map(item => item.id));
                                  } else {
                                    setSelectedItemIds([]);
                                  }
                                }}
                                className="w-3.5 h-3.5 text-brand-600 border-slate-300 rounded focus:ring-brand-500 cursor-pointer"
                              />
                            </th>
                            <th className="py-2.5 px-3">Farmer & Route Center</th>
                            <th className="py-2.5 px-3">Revision Type</th>
                            <th className="py-2.5 px-3">Live Enrolled Profile</th>
                            <th className="py-2.5 px-3">Proposed Update</th>
                            <th className="py-2.5 px-3">VA Explanation</th>
                            <th className="py-2.5 px-3 text-center">Actions</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 text-slate-700">
                          {currentSubTabItems.length === 0 ? (
                            <tr>
                              <td colSpan={7} className="py-6 text-center text-slate-400 font-medium italic">
                                Master farmer registries pending matching filters.
                              </td>
                            </tr>
                          ) : (
                            currentSubTabItems.map((req) => (
                              <tr key={req.id} className="hover:bg-slate-50/40">
                                <td className="py-2.5 px-3 w-10 text-center">
                                  <input
                                    type="checkbox"
                                    checked={selectedItemIds.includes(req.id)}
                                    onChange={(e) => {
                                      if (e.target.checked) {
                                        setSelectedItemIds([...selectedItemIds, req.id]);
                                      } else {
                                        setSelectedItemIds(selectedItemIds.filter(id => id !== req.id));
                                      }
                                    }}
                                    className="w-3.5 h-3.5 text-brand-600 border-slate-300 rounded focus:ring-brand-500 cursor-pointer"
                                  />
                                </td>
                                <td className="py-2.5 px-3">
                                  <strong className="block text-slate-900 font-bold">{req.farmerName}</strong>
                                  <span className="text-[10px] text-slate-450 block">{req.villageName} &bull; Assistant: {req.assistantName}</span>
                                </td>
                                <td className="py-2.5 px-3">
                                  <span className={`text-[9.5px] px-1.5 py-0.5 rounded font-bold uppercase ${
                                    req.action === "delete" ? "bg-rose-50 text-rose-700" : "bg-indigo-50 text-indigo-700"
                                  }`}>
                                    {req.action === "delete" ? "Deletion" : "Revision"}
                                  </span>
                                </td>
                                <td className="py-2.5 px-3 text-[10px] font-mono text-slate-500">
                                  {req.originalData ? (
                                    <span>Acres: {req.originalData.acres} | Mobile: {req.originalData.mobileNumber} | Aadhaar: {req.originalData.aadhaarNumber || "N/A"}</span>
                                  ) : "-"}
                                </td>
                                <td className="py-2.5 px-3 text-[10px] font-mono text-indigo-900 bg-indigo-50/40 font-bold">
                                  {req.action === "delete" ? (
                                    <span className="text-rose-600 line-through">Remove from Master Index</span>
                                  ) : req.requestedChanges ? (
                                    <span>Acres: {req.requestedChanges.acres} | Mobile: {req.requestedChanges.mobileNumber} | Aadhaar: {req.requestedChanges.aadhaarNumber || "N/A"}</span>
                                  ) : "-"}
                                </td>
                                <td className="py-2.5 px-3 italic text-slate-500 max-w-xs truncate" title={req.justification}>
                                  "{req.justification || "No notes"}"
                                </td>
                                <td className="py-2.5 px-3 text-center">
                                  <div className="flex items-center justify-center gap-1.5">
                                    <button
                                      onClick={() => onApproveFarmerChange && onApproveFarmerChange(req.id)}
                                      className="p-1 bg-indigo-50 text-indigo-700 hover:bg-indigo-100 border border-indigo-200 rounded transition cursor-pointer"
                                      title="Approve Registry Update"
                                    >
                                      <Check size={14} />
                                    </button>
                                    <button
                                      onClick={() => onRejectFarmerChange && onRejectFarmerChange(req.id)}
                                      className="p-1 bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200 rounded transition cursor-pointer"
                                      title="Reject Registry Update"
                                    >
                                      <X size={14} />
                                    </button>
                                  </div>
                                </td>
                              </tr>
                            ))
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                );
              })()}
            </div>
            )}

            {/* SECTION 7: Farmer Advance Correction Audits */}
            {activeSubTab === "advance_corrections" && (
              <div className="space-y-2">
              <div className="flex items-center gap-2 px-1">
                <Coins size={15} className="text-brand-600 shrink-0" />
                <span className="text-[10.5px] font-bold text-slate-400 uppercase tracking-wider block">
                  Advance Request Registry Audits
                </span>
                <span className="text-[9px] bg-brand-50 text-brand-700 px-1.5 py-0.2 rounded-full font-bold ml-1">
                  {(advanceChangeRequests || []).filter(r => r && r.status === "Pending").length} Pending
                </span>
              </div>

              {(() => {
                const pendingAdvancesChanges = (advanceChangeRequests || []).filter(r => r && r.status === "Pending");
                return (
                  <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                    <div className="overflow-x-auto">
                      <table className="w-full text-left border-collapse text-xs">
                        <thead>
                          <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 text-[10px] font-bold uppercase tracking-wider">
                            <th className="py-2.5 px-3 w-10 text-center">
                              <input
                                type="checkbox"
                                checked={currentSubTabItems.length > 0 && currentSubTabItems.every(item => selectedItemIds.includes(item.id))}
                                onChange={(e) => {
                                  if (e.target.checked) {
                                    setSelectedItemIds(currentSubTabItems.map(item => item.id));
                                  } else {
                                    setSelectedItemIds([]);
                                  }
                                }}
                                className="w-3.5 h-3.5 text-brand-600 border-slate-300 rounded focus:ring-brand-500 cursor-pointer"
                              />
                            </th>
                            <th className="py-2.5 px-3">Farmer & Route Center</th>
                            <th className="py-2.5 px-3">Update Type</th>
                            <th className="py-2.5 px-3">Live Active Advance log</th>
                            <th className="py-2.5 px-3">Proposed Correction</th>
                            <th className="py-2.5 px-3">Assistant Reason</th>
                            <th className="py-2.5 px-3 text-center">Actions</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 text-slate-700">
                          {currentSubTabItems.length === 0 ? (
                            <tr>
                              <td colSpan={7} className="py-6 text-center text-slate-400 font-medium italic">
                                Active advances logs pending matching filters.
                              </td>
                            </tr>
                          ) : (
                            currentSubTabItems.map((req) => (
                              <tr key={req.id} className="hover:bg-slate-50/40">
                                <td className="py-2.5 px-3 w-10 text-center">
                                  <input
                                    type="checkbox"
                                    checked={selectedItemIds.includes(req.id)}
                                    onChange={(e) => {
                                      if (e.target.checked) {
                                        setSelectedItemIds([...selectedItemIds, req.id]);
                                      } else {
                                        setSelectedItemIds(selectedItemIds.filter(id => id !== req.id));
                                      }
                                    }}
                                    className="w-3.5 h-3.5 text-brand-600 border-slate-300 rounded focus:ring-brand-500 cursor-pointer"
                                  />
                                </td>
                                <td className="py-2.5 px-3">
                                  <strong className="block text-slate-900 font-bold">{req.farmerName}</strong>
                                  <span className="text-[10px] text-slate-450 block">{req.villageName} &bull; Assistant: {req.assistantName}</span>
                                </td>
                                <td className="py-2.5 px-3">
                                  <span className={`text-[9.5px] px-1.5 py-0.5 rounded font-bold uppercase ${
                                    req.action === "delete" ? "bg-rose-50 text-rose-700" : "bg-amber-50 text-amber-700"
                                  }`}>
                                    {req.action === "delete" ? "Cancellation" : "Adjustment"}
                                  </span>
                                </td>
                                <td className="py-2.5 px-3 text-[10px] font-mono text-slate-500">
                                  {req.action !== "delete" ? (
                                    <span>₹{(req.originalAmount ?? 0).toLocaleString()} ({req.originalMode}) - {req.originalNotes}</span>
                                  ) : (
                                    <span>ID: {req.requestId} | ₹{(req.originalAmount ?? 0).toLocaleString()}</span>
                                  )}
                                </td>
                                <td className="py-2.5 px-3 text-[10px] font-mono text-amber-800 bg-amber-50/40 font-bold">
                                  {req.action === "delete" ? (
                                    <span className="text-rose-600 line-through">Cancel & Annul Advance</span>
                                  ) : (
                                    <span>₹{(req.requestedAmount ?? 0).toLocaleString()} ({req.requestedMode}) - {req.requestedNotes}</span>
                                  )}
                                </td>
                                <td className="py-2.5 px-3 italic text-slate-500 max-w-xs truncate" title={req.justification}>
                                  "{req.justification || "No notes"}"
                                </td>
                                <td className="py-2.5 px-3 text-center">
                                  <div className="flex items-center justify-center gap-1.5">
                                    <button
                                      onClick={() => onApproveAdvanceChange && onApproveAdvanceChange(req.id)}
                                      className="p-1 bg-amber-100 text-amber-850 hover:bg-amber-200 border border-amber-300 rounded transition cursor-pointer"
                                      title="Approve Change"
                                    >
                                      <Check size={14} />
                                    </button>
                                    <button
                                      onClick={() => onRejectAdvanceChange && onRejectAdvanceChange(req.id)}
                                      className="p-1 bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200 rounded transition cursor-pointer"
                                      title="Reject Change"
                                    >
                                      <X size={14} />
                                    </button>
                                  </div>
                                </td>
                              </tr>
                            ))
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                );
              })()}
            </div>
            )}
          </div>
        )}

        {/* TAB 3: FERTILIZER INFO */}
        {activeTab === "fertilizer" && (() => {
          // Calculations
          const totalSpentAmount = (supplierBills || []).reduce((sum, b) => sum + (b?.totalAmount || 0), 0);
          const paidBillsAmount = (supplierBills || []).filter(b => b?.paymentStatus === "Paid").reduce((sum, b) => sum + (b?.totalAmount || 0), 0);
          const unpaidBillsAmount = (supplierBills || []).filter(b => b?.paymentStatus !== "Paid").reduce((sum, b) => sum + (b?.totalAmount || 0), 0);

          const receivedBags = (stocks || []).reduce((sum, s) => sum + (s?.bagCount || 0), 0);
          const dispatchedBags = (dispatches || []).reduce((sum, d) => sum + (d?.bagCount || 0), 0);
          const distributedBags = (farmerDistributions || []).reduce((sum, f) => sum + (f?.bagCount || 0), 0);

          const filteredFertilizerSummaries = (fertilizerProductSummaries || []).filter(p => {
            return p.productName.toLowerCase().includes(fertilizerSearch.toLowerCase());
          });

          const filteredFertilizerBills = (supplierBills || []).filter(b => {
            if (!b) return false;
            return b.productName.toLowerCase().includes(fertilizerSearch.toLowerCase()) ||
                   b.supplierName.toLowerCase().includes(fertilizerSearch.toLowerCase());
          });

          const filteredFertilizerDispatches = (dispatches || []).filter(d => {
            if (!d) return false;
            return d.productName.toLowerCase().includes(fertilizerSearch.toLowerCase()) ||
                   d.villageName.toLowerCase().includes(fertilizerSearch.toLowerCase()) ||
                   d.assistantName.toLowerCase().includes(fertilizerSearch.toLowerCase());
          });

          const filteredFertilizerDistributions = (farmerDistributions || []).filter(fd => {
            if (!fd) return false;
            return fd.productName.toLowerCase().includes(fertilizerSearch.toLowerCase()) ||
                   fd.farmerName.toLowerCase().includes(fertilizerSearch.toLowerCase()) ||
                   fd.villageName.toLowerCase().includes(fertilizerSearch.toLowerCase());
          });

          return (
            <div className="space-y-4">
              {/* Quick Stats Header Grid */}
              <div className="grid grid-cols-2 gap-2">
                <div className="bg-white p-3.5 rounded-xl border border-slate-150 text-xs shadow-xs w-full">
                  <div className="flex items-center gap-1.5 text-slate-400 font-bold uppercase text-[9px] tracking-wider mb-1">
                    <Coins size={12} className="text-emerald-500 shrink-0" />
                    <span className="truncate">Spent on Fertilizers</span>
                  </div>
                  <div className="font-extrabold text-slate-900 text-sm">₹ {totalSpentAmount.toLocaleString()}</div>
                  <div className="text-[9.5px] text-slate-450 mt-1 flex justify-between font-medium">
                    <span>Paid: ₹{paidBillsAmount.toLocaleString()}</span>
                    <span>Due: ₹{unpaidBillsAmount.toLocaleString()}</span>
                  </div>
                </div>
                <div className="bg-white p-3.5 rounded-xl border border-slate-150 text-xs shadow-xs w-full">
                  <div className="flex items-center gap-1.5 text-slate-400 font-bold uppercase text-[9px] tracking-wider mb-1">
                    <Package size={12} className="text-blue-500 shrink-0" />
                    <span className="truncate">Total Main Stock</span>
                  </div>
                  <div className="font-extrabold text-slate-900 text-sm">{receivedBags.toLocaleString()} Bags</div>
                  <div className="text-[9.5px] text-slate-450 mt-1 font-medium">Inward supplier receipts</div>
                </div>
                <div className="bg-white p-3.5 rounded-xl border border-slate-150 text-xs shadow-xs w-full">
                  <div className="flex items-center gap-1.5 text-slate-400 font-bold uppercase text-[9px] tracking-wider mb-1">
                    <MapPin size={12} className="text-amber-500 shrink-0" />
                    <span className="truncate">Dispatched Vol.</span>
                  </div>
                  <div className="font-extrabold text-slate-900 text-sm">{dispatchedBags.toLocaleString()} Bags</div>
                  <div className="text-[9.5px] text-slate-450 mt-1 font-medium">Sent to Village Hubs</div>
                </div>
                <div className="bg-white p-3.5 rounded-xl border border-slate-150 text-xs shadow-xs w-full">
                  <div className="flex items-center gap-1.5 text-slate-400 font-bold uppercase text-[9px] tracking-wider mb-1">
                    <ShoppingCart size={12} className="text-violet-500 shrink-0" />
                    <span className="truncate">Sold to Farmers</span>
                  </div>
                  <div className="font-extrabold text-slate-900 text-sm">{distributedBags.toLocaleString()} Bags</div>
                  <div className="text-[9.5px] text-slate-450 mt-1 font-medium">Final local distributions</div>
                </div>
              </div>

              {/* Navigation tabs inside fertilizer info */}
              <div className="bg-white p-3 rounded-xl border border-slate-200 space-y-3 shadow-xs">
                <div className="flex flex-col gap-2">
                  <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">
                    Fertilizers &amp; Pesticides Information Engine
                  </span>
                  
                  {/* Dynamic Search Box */}
                  <div className="relative">
                    <Search size={14} className="absolute left-3 top-2.5 text-slate-400" />
                    <input
                      type="text"
                      placeholder="Search items, suppliers, villages, or staff..."
                      value={fertilizerSearch}
                      onChange={(e) => setFertilizerSearch(e.target.value)}
                      className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-xl text-xs outline-none focus:border-brand-500 font-medium"
                    />
                  </div>

                  {/* Horizontal Toggles */}
                  <div className="flex gap-1 overflow-x-auto pb-1 no-scrollbar text-[11px] pt-1">
                    <button
                      onClick={() => setFertilizerSubTab("inventory")}
                      className={`px-3 py-1.5 rounded-lg font-bold shrink-0 transition ${
                        fertilizerSubTab === "inventory" ? "bg-slate-900 text-white shadow-sm" : "bg-slate-100 text-slate-600 hover:bg-slate-150"
                      }`}
                    >
                      Inventory Summaries ({filteredFertilizerSummaries.length})
                    </button>
                    <button
                      onClick={() => setFertilizerSubTab("invoices")}
                      className={`px-3 py-1.5 rounded-lg font-bold shrink-0 transition ${
                        fertilizerSubTab === "invoices" ? "bg-slate-900 text-white shadow-sm" : "bg-slate-100 text-slate-600 hover:bg-slate-150"
                      }`}
                    >
                      Supplier Invoices ({filteredFertilizerBills.length})
                    </button>
                    <button
                      onClick={() => setFertilizerSubTab("dispatches")}
                      className={`px-3 py-1.5 rounded-lg font-bold shrink-0 transition ${
                        fertilizerSubTab === "dispatches" ? "bg-slate-900 text-white shadow-sm" : "bg-slate-100 text-slate-600 hover:bg-slate-150"
                      }`}
                    >
                      Village Dispatches ({filteredFertilizerDispatches.length})
                    </button>
                    <button
                      onClick={() => setFertilizerSubTab("distributions")}
                      className={`px-3 py-1.5 rounded-lg font-bold shrink-0 transition ${
                        fertilizerSubTab === "distributions" ? "bg-slate-900 text-white shadow-sm" : "bg-slate-100 text-slate-600 hover:bg-slate-150"
                      }`}
                    >
                      Farmer Sales ({filteredFertilizerDistributions.length})
                    </button>
                  </div>
                </div>
              </div>

              {/* LISTING ACCORDING TO SUB-TAB */}
              {fertilizerSubTab === "inventory" && (
                <div className="space-y-2">
                  {filteredFertilizerSummaries.length === 0 ? (
                    <div className="bg-white p-6 rounded-xl border border-slate-200 text-center text-slate-400 text-xs">
                      No fertilizer or pesticide stocks found.
                    </div>
                  ) : (
                    filteredFertilizerSummaries.map((p, idx) => (
                      <div
                        key={idx}
                        onClick={() => setSelectedFertilizerProduct(p)}
                        className="bg-white p-4 rounded-xl border border-slate-150 hover:border-brand-500 shadow-xs space-y-3 cursor-pointer hover:shadow-md transition-all group"
                      >
                        <div className="flex justify-between items-start">
                          <div>
                            <span className="font-extrabold text-slate-900 text-sm block group-hover:text-brand-600 transition-colors">
                              {p.productName}
                            </span>
                            <span className="text-[10px] text-slate-450 block font-medium mt-0.5">
                              Cumulative spent on item: <strong className="text-slate-800 font-bold">₹ {p.totalCost.toLocaleString()}</strong>
                            </span>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <span className="text-[10px] font-bold text-brand-500 opacity-0 group-hover:opacity-100 transition-opacity">Click to view &rarr;</span>
                            <span className={`text-[10px] font-black px-2.5 py-1 rounded-lg ${
                              (p.totalPurchased - p.totalDistributed) > 0 ? "bg-emerald-50 text-emerald-700 border border-emerald-100" : "bg-rose-50 text-rose-700 border border-rose-100"
                            }`}>
                              {(p.totalPurchased - p.totalDistributed) > 0 ? "In Stock" : "Sold Out"}
                            </span>
                          </div>
                        </div>

                        {/* Inventory split */}
                        <div className="grid grid-cols-2 gap-2 bg-slate-50 p-2.5 rounded-xl border border-slate-100 text-[11px]">
                          <div>
                            <span className="text-[9px] text-slate-400 font-bold uppercase block tracking-wider">Main Warehouse Stock</span>
                            <span className="font-bold text-slate-800 font-mono text-xs">{p.availableMain} Bags available</span>
                          </div>
                          <div>
                            <span className="text-[9px] text-slate-400 font-bold uppercase block tracking-wider">Village Hubs Stock</span>
                            <span className="font-bold text-slate-800 font-mono text-xs">{p.availableVillage} Bags available</span>
                          </div>
                        </div>

                        {/* Progress Bar (Distributed vs Purchased) */}
                        <div className="space-y-1 text-[10px]">
                          <div className="flex justify-between font-semibold text-slate-450">
                            <span>Sold to Farmers: {p.totalDistributed} Bags</span>
                            <span>Total Purchased: {p.totalPurchased} Bags</span>
                          </div>
                          <div className="w-full bg-slate-150 rounded-full h-1.5 overflow-hidden">
                            <div
                              className="bg-brand-500 h-1.5 rounded-full"
                              style={{ width: `${p.totalPurchased > 0 ? Math.min(100, Math.round((p.totalDistributed / p.totalPurchased) * 100)) : 0}%` }}
                            ></div>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}

              {fertilizerSubTab === "invoices" && (
                <div className="space-y-2">
                  {filteredFertilizerBills.length === 0 ? (
                    <div className="bg-white p-6 rounded-xl border border-slate-200 text-center text-slate-400 text-xs">
                      No invoices match the search query.
                    </div>
                  ) : (
                    filteredFertilizerBills.map((b, idx) => (
                      <div
                        key={idx}
                        onClick={() => setSelectedSupplierInvoice(b)}
                        className="bg-white p-3 rounded-lg border border-slate-150 hover:border-brand-500 flex justify-between items-center text-xs shadow-xs cursor-pointer hover:shadow-md transition-all group"
                      >
                        <div>
                          <strong className="block text-slate-900 font-extrabold text-sm group-hover:text-brand-600 transition-colors">
                            {b.supplierName}
                          </strong>
                          <span className="text-[10px] text-slate-400 block mt-0.5">
                            Product: <strong className="text-slate-700 font-semibold">{b.productName}</strong> &bull; Inv No: {b.billNumber}
                          </span>
                          <span className="text-[10px] text-slate-450 block">
                            Qty: {b.bagCount} Bags &bull; Rate: ₹{b.ratePerBag}/bag &bull; Date: {b.billDate}
                          </span>
                        </div>
                        <div className="text-right shrink-0 flex flex-col items-end">
                          <span className="font-mono font-bold text-slate-800 block">₹ {b.totalAmount.toLocaleString()}</span>
                          <span className={`inline-block text-[9px] font-bold px-1.5 py-0.5 rounded-md mt-1 ${
                            b.paymentStatus === "Paid" ? "bg-emerald-50 text-emerald-700 border border-emerald-200" :
                            b.paymentStatus === "Partial" ? "bg-amber-50 text-amber-700 border border-amber-200" :
                            "bg-rose-50 text-rose-700 border border-rose-200"
                          }`}>
                            {b.paymentStatus}
                          </span>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}

              {fertilizerSubTab === "dispatches" && (
                <div className="space-y-2">
                  {filteredFertilizerDispatches.length === 0 ? (
                    <div className="bg-white p-6 rounded-xl border border-slate-200 text-center text-slate-400 text-xs">
                      No dispatches found.
                    </div>
                  ) : (
                    filteredFertilizerDispatches.map((d, idx) => (
                      <div key={idx} className="bg-white p-3 rounded-lg border border-slate-150 flex justify-between items-center text-xs shadow-xs">
                        <div>
                          <strong className="block text-slate-900 font-extrabold">{d.productName}</strong>
                          <span className="text-[10px] text-slate-450 block mt-0.5">
                            📍 Village Center: {d.villageName} &bull; Lead: {d.assistantName}
                          </span>
                          <span className="text-[9.5px] text-slate-400 font-mono block">
                            Bags Sent: {d.bagCount} Bags &bull; Date: {d.dispatchDate}
                          </span>
                        </div>
                        <div className="text-right">
                          <span className={`inline-block text-[9px] font-bold px-1.5 py-0.5 rounded-md ${
                            d.status === "Acknowledged" ? "bg-emerald-50 text-emerald-700 border border-emerald-200" : "bg-amber-50 text-amber-700 border border-amber-200"
                          }`}>
                            {d.status}
                          </span>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}

              {fertilizerSubTab === "distributions" && (
                <div className="space-y-2">
                  {filteredFertilizerDistributions.length === 0 ? (
                    <div className="bg-white p-6 rounded-xl border border-slate-200 text-center text-slate-400 text-xs">
                      No farmer sales found.
                    </div>
                  ) : (
                    filteredFertilizerDistributions.map((fd, idx) => (
                      <div key={idx} className="bg-white p-3 rounded-lg border border-slate-150 flex justify-between items-center text-xs shadow-xs">
                        <div>
                          <strong className="block text-slate-900 font-extrabold">{fd.productName}</strong>
                          <span className="text-[10.5px] text-slate-800 font-semibold block mt-0.5">
                            Farmer: {fd.farmerName} (📍 {fd.villageName})
                          </span>
                          <span className="text-[9.5px] text-slate-400 block font-medium">
                            {fd.bagCount} Bags &bull; Rate: ₹{fd.ratePerBag}/Bag &bull; Lead: {fd.assistantName}
                          </span>
                        </div>
                        <div className="text-right">
                          <span className="font-mono font-bold text-slate-900 block">₹ {fd.totalAmount.toLocaleString()}</span>
                          <span className="text-[10px] text-slate-450 block font-mono">Date: {fd.date}</span>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>
          );
        })()}

        {/* TAB 4: FARMER & HARVEST INFO */}
        {activeTab === "farmers_info" && (() => {
          // Calculate overall stats
          const totalSownAcres = enrolledFarmers.reduce((sum, f) => sum + (Number(f.acres) || 0), 0);
          const totalTonnageKg = (localFarmerPayments || []).reduce((sum, p) => sum + (Number(p.weightKg) || 0), 0);
          const approvedSettlements = (localFarmerPayments || []).filter(p => p && p.status === "Approved");

          const uniqueFarmerVillages = Array.from(new Set((enrolledFarmers || []).map(f => f.villageName).filter(Boolean)));

          const filteredFarmers = enrolledFarmers.filter(f => {
            if (!f) return false;
            const matchesSearch = f.farmerName.toLowerCase().includes(farmerSearch.toLowerCase()) ||
                                  (f.mobileNumber && f.mobileNumber.includes(farmerSearch)) ||
                                  (f.seedVariety && f.seedVariety.toLowerCase().includes(farmerSearch.toLowerCase()));
            const matchesVillage = farmerVillageFilter === "all" || f.villageName === farmerVillageFilter;
            return matchesSearch && matchesVillage;
          });

          return (
            <div className="space-y-4">
              {/* Quick Stats Grid */}
              <div className="grid grid-cols-2 gap-2">
                <div className="bg-white p-3.5 rounded-xl border border-slate-150 text-xs shadow-xs w-full">
                  <div className="flex items-center gap-1.5 text-slate-400 font-bold uppercase text-[9px] tracking-wider mb-1">
                    <User size={12} className="text-blue-500 shrink-0" />
                    <span className="truncate">Enrolled Farmers</span>
                  </div>
                  <div className="font-extrabold text-slate-900 text-sm">{enrolledFarmers.length} Farmers</div>
                  <div className="text-[9.5px] text-slate-450 mt-1 font-medium">Active enrolled register</div>
                </div>
                <div className="bg-white p-3.5 rounded-xl border border-slate-150 text-xs shadow-xs w-full">
                  <div className="flex items-center gap-1.5 text-slate-400 font-bold uppercase text-[9px] tracking-wider mb-1">
                    <Sprout size={12} className="text-emerald-500 shrink-0" />
                    <span className="truncate">Total Sown Area</span>
                  </div>
                  <div className="font-extrabold text-slate-900 text-sm">{totalSownAcres.toLocaleString()} Acres</div>
                  <div className="text-[9.5px] text-slate-450 mt-1 font-medium">Plantation lands under crop</div>
                </div>
                <div className="bg-white p-3.5 rounded-xl border border-slate-150 text-xs shadow-xs w-full">
                  <div className="flex items-center gap-1.5 text-slate-400 font-bold uppercase text-[9px] tracking-wider mb-1">
                    <TrendingUp size={12} className="text-amber-500 shrink-0" />
                    <span className="truncate">Harvest Yield</span>
                  </div>
                  <div className="font-extrabold text-slate-900 text-sm">{(totalTonnageKg / 1000).toFixed(1)} Tons</div>
                  <div className="text-[9.5px] text-slate-450 mt-1 font-medium">{totalTonnageKg.toLocaleString()} KG received</div>
                </div>
                <div className="bg-white p-3.5 rounded-xl border border-slate-150 text-xs shadow-xs w-full">
                  <div className="flex items-center gap-1.5 text-slate-400 font-bold uppercase text-[9px] tracking-wider mb-1">
                    <CheckSquare size={12} className="text-violet-500 shrink-0" />
                    <span className="truncate">Settlements Done</span>
                  </div>
                  <div className="font-extrabold text-slate-900 text-sm">{approvedSettlements.length} Farmers</div>
                  <div className="text-[9.5px] text-slate-450 mt-1 font-medium">Payout approved ledgers</div>
                </div>
              </div>

              {/* Subtabs Bar inside Farmers info */}
              <div className="bg-white p-3 rounded-xl border border-slate-200 space-y-3 shadow-xs">
                <div className="flex flex-col gap-2">
                  <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">
                    Farmers Database &amp; Harvest Analytics
                  </span>
                  <div className="flex gap-2 border-b border-slate-100 pb-2">
                    <button
                      onClick={() => setFarmerSubTab("harvest")}
                      className={`px-4 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
                        farmerSubTab === "harvest" ? "bg-slate-900 text-white shadow-sm" : "bg-slate-100 text-slate-600 hover:bg-slate-150"
                      }`}
                    >
                      <MapPin size={12} />
                      Village Wise Harvest ({villageHarvestBreakdown.length})
                    </button>
                    <button
                      onClick={() => setFarmerSubTab("search")}
                      className={`px-4 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
                        farmerSubTab === "search" ? "bg-slate-900 text-white shadow-sm" : "bg-slate-100 text-slate-600 hover:bg-slate-150"
                      }`}
                    >
                      <Search size={12} />
                      Farmers Search ({filteredFarmers.length})
                    </button>
                  </div>
                </div>

                {farmerSubTab === "harvest" && (
                  <div className="space-y-3 pt-1">
                    <div>
                      <span className="text-[10px] text-slate-400 font-bold uppercase block tracking-wider">
                        Geographical Yield &amp; Land Summary
                      </span>
                      <p className="text-[10px] text-slate-450 mt-0.5 font-medium">Click on any village name to view its complete farmer roster, harvest logs, and active seed profiles.</p>
                    </div>

                    <div className="border border-slate-150 rounded-xl overflow-hidden bg-white max-h-[300px] overflow-y-auto divide-y divide-slate-100 text-xs">
                      {villageHarvestBreakdown.length === 0 ? (
                        <div className="p-4 text-center text-slate-400 font-medium">No village records found.</div>
                      ) : (
                        villageHarvestBreakdown.map((vb, idx) => {
                          const avgYieldPerAcre = vb.totalAcres > 0 ? (vb.totalYieldKg / vb.totalAcres).toFixed(1) : "0";
                          
                          // Calculate total advance taken for this specific village
                          const vFarmers = (enrolledFarmers || []).filter(f => f && f.villageName?.toLowerCase() === vb.villageName?.toLowerCase());
                          let vTotalAdvance = 0;
                          vFarmers.forEach(vf => {
                            const payment = (localFarmerPayments || []).find(p => p && p.farmerName?.toLowerCase() === vf.farmerName?.toLowerCase());
                            const advPayment = payment ? (Number(payment.advanceAmount) || 0) : 0;
                            
                            const advReqs = (paymentRequests || []).filter(
                              pr => pr && pr.farmerName?.toLowerCase() === vf.farmerName?.toLowerCase() && 
                              (pr.status === "Approved" || pr.paid)
                            );
                            const advReq = advReqs.reduce((sum, pr) => sum + (Number(pr.amountProposed) || 0), 0);
                            
                            vTotalAdvance += Math.max(advPayment, advReq);
                          });

                          return (
                            <div
                              key={idx}
                              onClick={() => setSelectedVillageDetail(vb)}
                              className="p-3 hover:bg-slate-50 flex justify-between items-center transition cursor-pointer group"
                            >
                              <div className="space-y-0.5">
                                <strong className="text-slate-800 font-extrabold block text-xs group-hover:text-brand-600 transition-colors">
                                  {vb.villageName}
                                </strong>
                                <span className="text-[10px] text-slate-400 block font-medium">
                                  {vb.farmerCount} Farmers Enrolled &bull; {vb.totalAcres} Acres plantation
                                </span>
                                <span className="text-[10px] text-slate-500 block font-bold mt-0.5 flex items-center gap-1">
                                  <span className="text-blue-600">Advance Taken:</span>
                                  <span className="font-mono text-blue-700">₹{vTotalAdvance.toLocaleString()}</span>
                                </span>
                              </div>
                              <div className="text-right flex items-center gap-3">
                                <div className="space-y-0.5">
                                  <span className="font-bold text-brand-700 block font-mono">{(vb.totalYieldKg / 1000).toFixed(1)} Tons</span>
                                  <span className="text-[10px] text-slate-400 block font-medium font-mono">Avg Yield: {avgYieldPerAcre} KG / Acre</span>
                                </div>
                                <span className="text-slate-300 group-hover:text-slate-500 font-bold transition">&rarr;</span>
                              </div>
                            </div>
                          );
                        })
                      )}
                    </div>
                  </div>
                )}

                {farmerSubTab === "search" && (
                  <div className="space-y-3 pt-1">
                    <div className="grid grid-cols-1 gap-1.5">
                      {/* Search Field */}
                      <div className="relative">
                        <Search size={14} className="absolute left-3 top-2.5 text-slate-400" />
                        <input
                          type="text"
                          placeholder="Search farmer name, phone, seed..."
                          value={farmerSearch}
                          onChange={(e) => setFarmerSearch(e.target.value)}
                          className="w-full pl-9 pr-3 py-2 border border-slate-200 rounded-xl outline-none text-xs focus:border-brand-500 font-medium"
                        />
                      </div>
                      {/* Village Dropdown */}
                      <div className="relative">
                        <Filter size={14} className="absolute left-3 top-2.5 text-slate-400" />
                        <select
                          value={farmerVillageFilter}
                          onChange={(e) => setFarmerVillageFilter(e.target.value)}
                          className="w-full pl-9 pr-3 py-2 border border-slate-200 rounded-xl outline-none text-xs bg-white focus:border-brand-500 font-medium appearance-none"
                        >
                          <option value="all">All Villages ({uniqueFarmerVillages.length})</option>
                          {uniqueFarmerVillages.map((v, i) => (
                            <option key={i} value={v}>{v}</option>
                          ))}
                        </select>
                      </div>
                    </div>

                    {/* Farmer Cards List */}
                    <div className="space-y-2 max-h-[300px] overflow-y-auto no-scrollbar">
                      {filteredFarmers.length === 0 ? (
                        <div className="p-6 text-center text-slate-400 font-medium border border-dashed border-slate-200 rounded-xl bg-slate-50/50">
                          No matching farmer profiles found.
                        </div>
                      ) : (
                        filteredFarmers.map((f, idx) => {
                          // Check for their actual sourcing record in localFarmerPayments
                          const settlement = (localFarmerPayments || []).find(p => p && p.farmerName?.toLowerCase() === f.farmerName?.toLowerCase());
                          const hasSettlement = !!settlement;

                          return (
                            <div
                              key={idx}
                              onClick={() => setSelectedFarmer(f)}
                              className="bg-slate-50/70 border border-slate-150 hover:border-brand-500 p-3 rounded-xl flex flex-col gap-2 hover:bg-slate-50 cursor-pointer transition group"
                            >
                              <div className="flex justify-between items-start">
                                <div>
                                  <span className="text-[10px] text-slate-450 font-bold font-mono tracking-wider bg-slate-200/80 px-1.5 py-0.5 rounded">
                                    {f.id || `ENR-${100 + idx}`}
                                  </span>
                                  <strong className="block text-slate-800 font-extrabold text-sm mt-1 group-hover:text-brand-600 transition-colors">
                                    {f.farmerName}
                                  </strong>
                                  <span className="text-[10px] text-slate-450 font-medium block">📍 Village Route: {f.villageName} &bull; Mob: {f.mobileNumber}</span>
                                </div>
                                <div className="flex items-center gap-1.5">
                                  <span className="text-[10px] font-bold text-brand-500 opacity-0 group-hover:opacity-100 transition-opacity">Click to view &rarr;</span>
                                  <span className={`text-[9.5px] font-black px-2 py-0.5 rounded-lg border ${
                                    hasSettlement ? "bg-emerald-50 text-emerald-700 border-emerald-200" : "bg-blue-50 text-blue-700 border-blue-200"
                                  }`}>
                                    {hasSettlement ? "Harvest Logged" : "Sowing Sown"}
                                  </span>
                                </div>
                              </div>

                              <div className="grid grid-cols-2 gap-2 text-[10px] bg-white p-2 rounded-lg border border-slate-100 font-semibold text-slate-500">
                                <div>
                                  <span className="text-[9px] text-slate-400 uppercase font-bold block">Plantation Lands</span>
                                  <span className="text-slate-800">{f.acres || 3} Acres</span>
                                </div>
                                <div>
                                  <span className="text-[9px] text-slate-400 uppercase font-bold block">Seed Variety Sown</span>
                                  <span className="text-slate-800 truncate block max-w-[130px]">{f.seedVariety || "Premium Sowing"}</span>
                                </div>
                              </div>

                              {/* Sourcing details if harvested */}
                              {hasSettlement && (
                                <div className="border-t border-slate-200/65 pt-2 flex justify-between items-center text-[10.5px]">
                                  <div>
                                    <span className="text-[9px] text-slate-450 font-bold uppercase block">Crop Yield Harvested</span>
                                    <span className="font-bold text-slate-700 font-mono">{(Number(settlement.weightKg) || 0).toLocaleString()} KG</span>
                                  </div>
                                  <div className="text-right">
                                    <span className="text-[9px] text-slate-450 font-bold uppercase block">Sourcing Rate / Payout</span>
                                    <span className="font-extrabold text-emerald-700 font-mono">₹ {settlement.pricePerKg}/KG &bull; ₹ {(Number(settlement.weightKg || 0) * Number(settlement.pricePerKg || 0)).toLocaleString()}</span>
                                  </div>
                                </div>
                              )}
                            </div>
                          );
                        })
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          );
        })()}

        {/* TAB 5: ASSISTANT & EMPLOYEE INFO */}
        {activeTab === "assistant_info" && (() => {
          const totalSownAcres = enrolledFarmers.reduce((sum, f) => sum + (Number(f.acres) || 0), 0);
          const totalTonnageKg = (localFarmerPayments || []).reduce((sum, p) => sum + (Number(p.weightKg) || 0), 0);
          const totalMonthlyPayroll = (assistantUsers || []).reduce((sum, u) => sum + (u.salaryAmount || 25000), 0);

          const uniqueStaffVillages = Array.from(new Set((assistantUsers || []).map(u => u.villageName).filter(Boolean)));

          const filteredStaff = (assistantPerformanceList || []).filter((u: any) => {
            if (!u) return false;
            const matchesSearch = u.name.toLowerCase().includes(assistantSearch.toLowerCase()) ||
                                  (u.designation && u.designation.toLowerCase().includes(assistantSearch.toLowerCase())) ||
                                  (u.mobileNumber && u.mobileNumber.includes(assistantSearch));
            const matchesVillage = assistantVillageFilter === "all" || u.villageName === assistantVillageFilter;
            return matchesSearch && matchesVillage;
          });

          return (
            <div className="space-y-4">
              {/* Quick Stats Grid */}
              <div className="grid grid-cols-2 gap-2">
                <div className="bg-white p-3.5 rounded-xl border border-slate-150 text-xs shadow-xs w-full">
                  <div className="flex items-center gap-1.5 text-slate-400 font-bold uppercase text-[9px] tracking-wider mb-1">
                    <UserCheck size={12} className="text-blue-500 shrink-0" />
                    <span className="truncate">Active Staff</span>
                  </div>
                  <div className="font-extrabold text-slate-900 text-sm">{assistantUsers.length} Employees</div>
                  <div className="text-[9.5px] text-slate-450 mt-1 font-medium">Assistants &amp; Workers</div>
                </div>
                <div className="bg-white p-3.5 rounded-xl border border-slate-150 text-xs shadow-xs w-full">
                  <div className="flex items-center gap-1.5 text-slate-400 font-bold uppercase text-[9px] tracking-wider mb-1">
                    <Sprout size={12} className="text-emerald-500 shrink-0" />
                    <span className="truncate">Managed Area</span>
                  </div>
                  <div className="font-extrabold text-slate-900 text-sm">{totalSownAcres} Acres</div>
                  <div className="text-[9.5px] text-slate-450 mt-1 font-medium">Total land under staff</div>
                </div>
                <div className="bg-white p-3.5 rounded-xl border border-slate-150 text-xs shadow-xs w-full">
                  <div className="flex items-center gap-1.5 text-slate-400 font-bold uppercase text-[9px] tracking-wider mb-1">
                    <TrendingUp size={12} className="text-amber-500 shrink-0" />
                    <span className="truncate">Yield Sourced</span>
                  </div>
                  <div className="font-extrabold text-slate-900 text-sm">{(totalTonnageKg / 1000).toFixed(1)} Tons</div>
                  <div className="text-[9.5px] text-slate-450 mt-1 font-medium">{totalTonnageKg.toLocaleString()} KG sourced</div>
                </div>
                <div className="bg-white p-3.5 rounded-xl border border-slate-150 text-xs shadow-xs w-full">
                  <div className="flex items-center gap-1.5 text-slate-400 font-bold uppercase text-[9px] tracking-wider mb-1">
                    <Coins size={12} className="text-violet-500 shrink-0" />
                    <span className="truncate">Payroll Outlay</span>
                  </div>
                  <div className="font-extrabold text-slate-900 text-sm">₹ {totalMonthlyPayroll.toLocaleString()}</div>
                  <div className="text-[9.5px] text-slate-450 mt-1 font-medium">Monthly staff base salary</div>
                </div>
              </div>

              {/* Internal tabs for Assistant info */}
              <div className="bg-white p-3 rounded-xl border border-slate-200 space-y-3 shadow-xs">
                <div className="flex flex-col gap-2">
                  <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">
                    Staff Database &amp; Performance scorecards
                  </span>
                  <div className="flex gap-2 border-b border-slate-100 pb-2">
                    <button
                      onClick={() => setAssistantSubTab("directory")}
                      className={`px-4 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
                        assistantSubTab === "directory" ? "bg-slate-900 text-white shadow-sm" : "bg-slate-100 text-slate-600 hover:bg-slate-150"
                      }`}
                    >
                      <UserCheck size={12} />
                      Staff Directory ({filteredStaff.length})
                    </button>
                    <button
                      onClick={() => setAssistantSubTab("performance")}
                      className={`px-4 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
                        assistantSubTab === "performance" ? "bg-slate-900 text-white shadow-sm" : "bg-slate-100 text-slate-600 hover:bg-slate-150"
                      }`}
                    >
                      <TrendingUp size={12} />
                      Performance Scorecard ({assistantPerformanceList.length})
                    </button>
                  </div>
                </div>

                {assistantSubTab === "directory" && (
                  <div className="space-y-3 pt-1">
                    <div className="grid grid-cols-1 gap-1.5">
                      {/* Search Field */}
                      <div className="relative">
                        <Search size={14} className="absolute left-3 top-2.5 text-slate-400" />
                        <input
                          type="text"
                          placeholder="Search employee name, designation..."
                          value={assistantSearch}
                          onChange={(e) => setAssistantSearch(e.target.value)}
                          className="w-full pl-9 pr-3 py-2 border border-slate-200 rounded-xl outline-none text-xs focus:border-brand-500 font-medium"
                        />
                      </div>
                      {/* Village Dropdown */}
                      <div className="relative">
                        <Filter size={14} className="absolute left-3 top-2.5 text-slate-400" />
                        <select
                          value={assistantVillageFilter}
                          onChange={(e) => setAssistantVillageFilter(e.target.value)}
                          className="w-full pl-9 pr-3 py-2 border border-slate-200 rounded-xl outline-none text-xs bg-white focus:border-brand-500 font-medium appearance-none"
                        >
                          <option value="all">All Villages ({uniqueStaffVillages.length})</option>
                          {uniqueStaffVillages.map((v, i) => (
                            <option key={i} value={v}>{v}</option>
                          ))}
                        </select>
                      </div>
                    </div>

                    {/* Staff Cards Grid list */}
                    <div className="space-y-3 max-h-[380px] overflow-y-auto no-scrollbar">
                      {filteredStaff.length === 0 ? (
                        <div className="p-6 text-center text-slate-400 font-medium border border-dashed border-slate-200 rounded-xl bg-slate-50/50">
                          No matching staff profiles found.
                        </div>
                      ) : (
                        filteredStaff.map((u: any, idx: number) => {
                          return (
                            <div
                              key={idx}
                              onClick={() => setSelectedEmployee(u)}
                              className="bg-slate-50/70 border border-slate-150 hover:border-brand-500 p-3.5 rounded-xl flex flex-col gap-3 hover:bg-slate-50 cursor-pointer transition group"
                            >
                              {/* Header profile info */}
                              <div className="flex justify-between items-start">
                                <div>
                                  <strong className="block text-slate-900 font-extrabold text-sm group-hover:text-brand-600 transition-colors">
                                    {u.name}
                                  </strong>
                                  <span className="text-[10px] font-bold text-slate-450 uppercase block mt-0.5 tracking-wider">
                                    💼 {u.designation || "Village Assistant"} &bull; Route: {u.villageName || "Not Assigned"}
                                  </span>
                                  <span className="text-[10px] text-slate-400 font-medium block">Contact: {u.mobileNumber}</span>
                                </div>

                                <div className="flex items-center gap-1.5 shrink-0">
                                  <span className="text-[10px] font-bold text-brand-500 opacity-0 group-hover:opacity-100 transition-opacity">Click to view &rarr;</span>
                                  <span className={`text-[9.5px] font-black px-2 py-0.5 rounded-lg flex items-center gap-1 border ${
                                    u.salaryLocked ? "bg-rose-50 text-rose-700 border-rose-200" : "bg-emerald-50 text-emerald-700 border-emerald-200"
                                  }`}>
                                    {u.salaryLocked ? <Lock size={10} /> : <Unlock size={10} />}
                                    {u.salaryLocked ? "Salary Blocked" : "Active Salary"}
                                  </span>
                                </div>
                              </div>

                              {/* Managed Territory & Operational Performance stats */}
                              <div className="grid grid-cols-2 gap-2 bg-white p-3 rounded-xl border border-slate-100 text-[10.5px]">
                                <div>
                                  <span className="text-[9px] text-slate-450 uppercase font-bold block mb-0.5">Assigned Land</span>
                                  <span className="font-extrabold text-slate-800 block font-mono">{u.managedAcres} Acres</span>
                                  <span className="text-[9px] text-slate-400 font-medium">{u.managedFarmersCount} Farmers</span>
                                </div>
                                <div>
                                  <span className="text-[9px] text-slate-450 uppercase font-bold block mb-0.5">Yield Tonnage Sourced</span>
                                  <span className="font-extrabold text-slate-800 block font-mono">{(u.tonnageReceivedKg / 1000).toFixed(1)} Tons</span>
                                  <span className="text-[9px] text-slate-450 font-medium">{u.tonnageReceivedKg.toLocaleString()} KG total</span>
                                </div>
                                <div>
                                  <span className="text-[9px] text-slate-450 uppercase font-bold block mb-0.5">Inward Dispatches</span>
                                  <span className="font-extrabold text-slate-800 block font-mono">{u.dispatchesBags} Bags</span>
                                  <span className="text-[9px] text-slate-450 font-medium">Warehouse stock received</span>
                                </div>
                                <div>
                                  <span className="text-[9px] text-slate-450 uppercase font-bold block mb-0.5">Distributions Handled</span>
                                  <span className="font-extrabold text-slate-800 block font-mono">{u.distributionsBags} Bags</span>
                                  <span className="text-[9px] text-slate-450 font-medium">Direct-to-farmer sales</span>
                                </div>
                              </div>

                              {/* Salary and Bank details */}
                              <div className="border-t border-slate-200/65 pt-2 flex flex-col md:flex-row md:justify-between md:items-center gap-1 text-[10.5px] text-slate-500">
                                <div className="flex items-center gap-1">
                                  <span className="font-bold text-slate-700">Salary scale:</span>
                                  <strong className="text-slate-900 font-extrabold text-xs">₹ {(u.salaryAmount || 25000).toLocaleString()} / month</strong>
                                </div>
                                {u.bankName && (
                                  <div className="text-left md:text-right text-[10px] text-slate-450">
                                    <span>🏦 {u.bankName} (Acc: {u.bankAccountNo ? `****${u.bankAccountNo.slice(-4)}` : "XXXX"}) &bull; IFSC: {u.bankIfscCode || "N/A"}</span>
                                  </div>
                                )}
                              </div>
                            </div>
                          );
                        })
                      )}
                    </div>
                  </div>
                )}

                {assistantSubTab === "performance" && (
                  <div className="space-y-4 pt-1">
                    <div>
                      <span className="text-[10px] text-slate-400 font-bold uppercase block tracking-wider">
                        Operational Leaderboard &amp; Capacity Tracker
                      </span>
                      <p className="text-[10px] text-slate-450 mt-0.5 font-medium">
                        Compare employee capacity and harvest yields received against key performance indexes.
                      </p>
                    </div>

                    <div className="space-y-3.5 max-h-[380px] overflow-y-auto no-scrollbar">
                      {assistantPerformanceList.map((u: any, idx: number) => {
                        // Let's compute percentages for nice visual progress bars!
                        // Say, target tonnage is 50 Tons (50,000 KG), target acres is 400
                        const targetTonnageKg = 50000;
                        const targetAcres = 400;
                        const tonnagePct = Math.min(100, Math.round((u.tonnageReceivedKg / targetTonnageKg) * 100));
                        const acresPct = Math.min(100, Math.round((u.managedAcres / targetAcres) * 100));

                        // Determine star rating based on performance
                        let stars = 3;
                        if (tonnagePct >= 80 && acresPct >= 80) stars = 5;
                        else if (tonnagePct >= 50 || acresPct >= 50) stars = 4;

                        return (
                          <div
                            key={idx}
                            onClick={() => setSelectedEmployee(u)}
                            className="bg-slate-50/70 border border-slate-150 p-4 rounded-xl flex flex-col gap-3 hover:bg-slate-150 cursor-pointer transition group"
                          >
                            <div className="flex justify-between items-center">
                              <div className="flex items-center gap-2">
                                <span className="font-bold text-xs bg-slate-900 text-white w-5 h-5 rounded-full flex items-center justify-center font-mono">
                                  {idx + 1}
                                </span>
                                <div>
                                  <strong className="block text-slate-900 font-extrabold text-sm group-hover:text-brand-600 transition-colors">
                                    {u.name}
                                  </strong>
                                  <span className="text-[10px] text-slate-450 font-bold block uppercase tracking-wider">
                                    📍 Route: {u.villageName || "Not Assigned"}
                                  </span>
                                </div>
                              </div>
                              <div className="flex flex-col items-end">
                                <div className="flex text-amber-500 text-xs">
                                  {"★".repeat(stars)}{"☆".repeat(5 - stars)}
                                </div>
                                <span className="text-[9.5px] font-bold text-slate-400 mt-0.5">Rating Score</span>
                              </div>
                            </div>

                            <div className="space-y-2">
                              {/* Tonnage Sourced Progress */}
                              <div className="space-y-0.5">
                                <div className="flex justify-between text-[10px] font-bold">
                                  <span className="text-slate-500">Yield Tonnage Sourced</span>
                                  <span className="text-slate-900">{(u.tonnageReceivedKg / 1000).toFixed(1)} / 50.0 Tons ({tonnagePct}%)</span>
                                </div>
                                <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                                  <div
                                    className="bg-emerald-500 h-2 rounded-full transition-all duration-500"
                                    style={{ width: `${tonnagePct}%` }}
                                  ></div>
                                </div>
                              </div>

                              {/* Managed Acres Progress */}
                              <div className="space-y-0.5">
                                <div className="flex justify-between text-[10px] font-bold">
                                  <span className="text-slate-500">Plantation Area Managed</span>
                                  <span className="text-slate-900">{u.managedAcres} / 400 Acres ({acresPct}%)</span>
                                </div>
                                <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                                  <div
                                    className="bg-blue-500 h-2 rounded-full transition-all duration-500"
                                    style={{ width: `${acresPct}%` }}
                                  ></div>
                                </div>
                              </div>
                            </div>

                            <div className="grid grid-cols-3 gap-1 pt-1.5 border-t border-slate-150 text-[10px] text-center font-bold text-slate-500">
                              <div className="border-r border-slate-150">
                                <span className="text-[8.5px] text-slate-400 uppercase block">Enrolled Farmers</span>
                                <span className="text-slate-800 font-mono">{u.managedFarmersCount}</span>
                              </div>
                              <div className="border-r border-slate-150">
                                <span className="text-[8.5px] text-slate-400 uppercase block">Distributions</span>
                                <span className="text-slate-800 font-mono">{u.distributionsBags} Bags</span>
                              </div>
                              <div>
                                <span className="text-[8.5px] text-slate-400 uppercase block">Inwards</span>
                                <span className="text-slate-800 font-mono">{u.dispatchesBags} Bags</span>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            </div>
          );
        })()}

        {/* TAB 4: REDESIGNED EXECUTIVE ANALYSIS SUITE */}
        {activeTab === "outstanding" && (() => {
          // 1. Core Analytics State-driven Data Calculations
          const uniqueVillages = Array.from(new Set([
            ...(enrolledFarmers || []).map(f => f.villageName).filter(Boolean),
            ...(localFarmerPayments || []).map(p => p.villageName).filter(Boolean),
            ...(farmerDistributions || []).map(d => d.villageName).filter(Boolean)
          ])).sort();

          // Apply village filter
          const fFarmers = analysisVillageFilter === "all" 
            ? (enrolledFarmers || []) 
            : (enrolledFarmers || []).filter(f => f.villageName === analysisVillageFilter);

          const fPayments = analysisVillageFilter === "all" 
            ? (localFarmerPayments || []) 
            : (localFarmerPayments || []).filter(p => p.villageName === analysisVillageFilter);

          const filteredFPayments = fPayments.filter(p => {
            if (!analysisFarmerSearch) return true;
            const q = analysisFarmerSearch.toLowerCase().trim();
            return (p.farmerName || "").toLowerCase().includes(q) ||
                   (p.id || "").toLowerCase().includes(q) ||
                   (p.villageName || "").toLowerCase().includes(q);
          });

          const fDistributions = analysisVillageFilter === "all" 
            ? (farmerDistributions || []) 
            : (farmerDistributions || []).filter(d => d.villageName === analysisVillageFilter);

          // Volume Metrics
          const totalSownAcres = fFarmers.reduce((sum, f) => sum + (Number(f.acres) || 0), 0);
          const totalHarvestedKg = fPayments.reduce((sum, p) => sum + (Number(p.weightKg) || 0), 0);
          const totalHarvestedTons = totalHarvestedKg / 1000;
          const avgYieldTonsPerAcre = totalSownAcres > 0 ? (totalHarvestedTons / totalSownAcres) : 0;
          const avgYieldKgPerAcre = totalSownAcres > 0 ? (totalHarvestedKg / totalSownAcres) : 0;

          // Outlays & Investments
          const totalSalaries = Math.round((assistantUsers || [])
            .filter(u => analysisVillageFilter === "all" || u.villageName === analysisVillageFilter)
            .reduce((sum, u) => sum + (Number(u.salaryAmount) || 0), 0));

          const totalAdvancesIssued = Math.round(fPayments.reduce((sum, p) => sum + (Number(p.advanceAmount) || 0), 0));
          const totalPesticideDues = Math.round(fPayments.reduce((sum, p) => sum + (Number(p.pesticideDues) || 0), 0));

          // Fertilizer Supplier Purchase Costs Proportion (Weighted by distributed volume in that village)
          const totalSupplierBillsCost = (supplierBills || []).reduce((sum, b) => sum + (Number(b.totalAmount) || 0), 0);
          const totalSupplierBagsCount = (supplierBills || []).reduce((sum, b) => sum + (Number(b.bagCount) || 0), 0);
          const avgSupplierPricePerBag = totalSupplierBagsCount > 0 ? (totalSupplierBillsCost / totalSupplierBagsCount) : 400; // default average
          const totalDistributedBagsInVillage = fDistributions.reduce((sum, d) => sum + (Number(d.bagCount) || 0), 0);
          const fertilizerPurchaseCost = Math.round(analysisVillageFilter === "all" 
            ? totalSupplierBillsCost 
            : (totalDistributedBagsInVillage * avgSupplierPricePerBag));

          // Crop purchase payout from farmers
          const cropSourcingCost = Math.round(fPayments.reduce((sum, p) => sum + ((Number(p.weightKg) || 0) * (Number(p.pricePerKg) || 0)), 0));

          // Net Sourcing Outlay (Gross Sourcing Cost minus advances, pesticide dues, interest)
          const totalInterestCharged = Math.round(fPayments.reduce((sum, p) => sum + (Number(p.interest) || 0), 0));
          const loadingChargesDeducted = Math.round(fPayments.reduce((sum, p) => {
            const wt = Number(p.weightKg) || 0;
            return sum + Math.round((wt / 1000) * 400); // 400 Rs per ton loading charges
          }, 0));

          // Fertilizer Sales Revenue (Actual from distributions)
          const fertilizerActualSalesRevenue = Math.round(fDistributions.reduce((sum, d) => sum + (Number(d.amountCollected) || 0) + (Number(d.balanceAmount) || 0), 0));
          const fertilizerCollectedSalesRevenue = Math.round(fDistributions.reduce((sum, d) => sum + (Number(d.amountCollected) || 0), 0));
          const fertilizerOutstandingReceivable = Math.round(fDistributions.reduce((sum, d) => sum + (Number(d.balanceAmount) || 0), 0));

          const totalDeductions = totalAdvancesIssued + totalInterestCharged + totalPesticideDues + loadingChargesDeducted + fertilizerOutstandingReceivable;
          const netSourcingPayoutCost = Math.round(Math.max(0, cropSourcingCost - totalDeductions));

          // Total Capital Outlay/Investment (Actual cash sowed: salaries + advances sowed + fertilizer purchase cost)
          const totalCapitalInvested = Math.round(totalSalaries + totalAdvancesIssued + fertilizerPurchaseCost);

          // REVENUES & RETURN SIMULATION
          // Maize Wholesale Market Sale with simulated custom premium markup
          const maizeWholesaleRevenue = Math.round(cropSourcingCost * (1 + maizeMarkupRate / 100));

          // Owner Kept Margin / Commission on crop sourced (calculated per-company)
          let totalCommissionMargin = 0;
          const companyCommissionBreakdown: Record<string, { weightKg: number; rate: number; commission: number }> = {};
          
          fPayments.forEach(p => {
            const weight = Number(p.weightKg) || 0;
            const matchingEnroll = (enrolledFarmers || []).find(e => e.farmerName?.trim().toLowerCase() === p.farmerName?.trim().toLowerCase());
            const company = matchingEnroll?.plantationCompany || "Standard";
            const rate = companyCommissionRates[company] !== undefined ? companyCommissionRates[company] : commissionRate;
            
            if (!companyCommissionBreakdown[company]) {
              companyCommissionBreakdown[company] = { weightKg: 0, rate, commission: 0 };
            }
            companyCommissionBreakdown[company].weightKg += weight;
            companyCommissionBreakdown[company].commission += weight * rate;
            
            totalCommissionMargin += weight * rate;
          });
          totalCommissionMargin = Math.round(totalCommissionMargin);

          // Combined Simulated Business Revenue (Maize Wholesale + Fertilizer Actual Sales + Interest + Loading + Owner Kept Margin)
          const totalBusinessRevenue = Math.round(maizeWholesaleRevenue + fertilizerActualSalesRevenue + totalInterestCharged + loadingChargesDeducted + totalCommissionMargin);
          const consolidatedNetProfit = Math.round(totalBusinessRevenue - (totalSalaries + fertilizerPurchaseCost + cropSourcingCost));
          const returnOnInvestmentPct = totalCapitalInvested > 0 ? (consolidatedNetProfit / totalCapitalInvested) * 100 : 0;

          // Group village-by-village stats for the performance comparison view
          const villageBreakdownStats = uniqueVillages.map(v => {
            const vFarmers = (enrolledFarmers || []).filter(f => f.villageName === v);
            const vPayments = (localFarmerPayments || []).filter(p => p.villageName === v);
            const vDists = (farmerDistributions || []).filter(d => d.villageName === v);

            const sAcres = vFarmers.reduce((sum, f) => sum + (Number(f.acres) || 0), 0);
            const hKg = vPayments.reduce((sum, p) => sum + (Number(p.weightKg) || 0), 0);
            const hTons = hKg / 1000;
            const yieldEff = sAcres > 0 ? (hTons / sAcres) : 0;

            const salaries = (assistantUsers || []).filter(u => u.villageName === v).reduce((sum, u) => sum + (Number(u.salaryAmount) || 0), 0);
            const advances = vPayments.reduce((sum, p) => sum + (Number(p.advanceAmount) || 0), 0);
            const sourcingCost = vPayments.reduce((sum, p) => sum + ((Number(p.weightKg) || 0) * (Number(p.pricePerKg) || 0)), 0);
            const distributedBags = vDists.reduce((sum, d) => sum + (Number(d.bagCount) || 0), 0);
            const estFertCost = distributedBags * avgSupplierPricePerBag;

            const fRevenue = vDists.reduce((sum, d) => sum + (Number(d.amountCollected) || 0) + (Number(d.balanceAmount) || 0), 0);
            const outstanding = vDists.reduce((sum, d) => sum + (Number(d.balanceAmount) || 0), 0);

            return {
              village: v,
              acres: sAcres,
              tons: hTons,
              yieldEff,
              farmersCount: vFarmers.length,
              totalOutlay: salaries + advances + estFertCost + sourcingCost,
              fertilizerRevenue: fRevenue,
              outstandingDues: outstanding
            };
          });

          const filteredVillageBreakdownStats = villageBreakdownStats.filter(v => {
            if (!analysisVillageSearch) return true;
            return v.village.toLowerCase().includes(analysisVillageSearch.toLowerCase().trim());
          });

          return (
            <div className="space-y-4">
              {/* Top Operational Controller Panel */}
              <div className="bg-gradient-to-r from-slate-900 to-slate-800 text-white p-4 rounded-xl border border-slate-700 shadow-md">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                  <div>
                    <h2 className="text-sm font-bold tracking-tight uppercase flex items-center gap-1.5 text-emerald-400">
                      <BarChart3 size={15} /> Executive Analytics Suite
                    </h2>
                    <p className="text-[10px] text-slate-350 font-medium">
                      Operational profitability, crop acreage, and harvest yields with real-time profit simulation modeling.
                    </p>
                  </div>
                  
                  {/* Village Select Filter */}
                  <div className="flex items-center gap-2 self-stretch sm:self-auto justify-between sm:justify-start">
                    <span className="text-[10px] uppercase font-bold text-slate-400 flex items-center gap-1 shrink-0">
                      <Filter size={11} /> Route:
                    </span>
                    <select
                      value={analysisVillageFilter}
                      onChange={(e) => setAnalysisVillageFilter(e.target.value)}
                      className="bg-slate-800 border border-slate-700 text-[11px] text-slate-200 rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-brand-500 font-bold max-w-full sm:max-w-[180px] cursor-pointer truncate flex-1 sm:flex-initial"
                    >
                      <option value="all">All Villages</option>
                      {uniqueVillages.map(v => (
                        <option key={v} value={v}>{v}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Sub Tab Navigation inside Analysis - Robust 2x2 Grid Layout */}
                <div className="grid grid-cols-2 gap-2 mt-4 border-t border-slate-700/60 pt-3">
                  <button
                    onClick={() => setAnalysisSubView("overview")}
                    className={`w-full py-2.5 px-2 rounded-lg text-[10.5px] font-bold transition uppercase tracking-wide cursor-pointer text-center ${
                      analysisSubView === "overview" 
                        ? "bg-brand-800 text-white border border-brand-700" 
                        : "bg-slate-800/40 text-slate-400 hover:text-white border border-transparent"
                    }`}
                  >
                    Summary Hub
                  </button>
                  <button
                    onClick={() => setAnalysisSubView("villages")}
                    className={`w-full py-2.5 px-2 rounded-lg text-[10.5px] font-bold transition uppercase tracking-wide cursor-pointer text-center ${
                      analysisSubView === "villages" 
                        ? "bg-brand-800 text-white border border-brand-700" 
                        : "bg-slate-800/40 text-slate-400 hover:text-white border border-transparent"
                    }`}
                  >
                    Village Performance
                  </button>
                  <button
                    onClick={() => setAnalysisSubView("farmers")}
                    className={`w-full py-2.5 px-2 rounded-lg text-[10.5px] font-bold transition uppercase tracking-wide cursor-pointer text-center ${
                      analysisSubView === "farmers" 
                        ? "bg-brand-800 text-white border border-brand-700" 
                        : "bg-slate-800/40 text-slate-400 hover:text-white border border-transparent"
                    }`}
                  >
                    Farmer Registry
                  </button>
                  <button
                    onClick={() => setAnalysisSubView("p_and_l")}
                    className={`w-full py-2.5 px-2 rounded-lg text-[10.5px] font-bold transition uppercase tracking-wide cursor-pointer text-center ${
                      analysisSubView === "p_and_l" 
                        ? "bg-brand-800 text-white border border-brand-700" 
                        : "bg-slate-800/40 text-slate-400 hover:text-white border border-transparent"
                    }`}
                  >
                    P&amp;L Statement
                  </button>
                </div>
              </div>

              {/* SECTION 1: SUMMARY HUB OVERVIEW */}
              {analysisSubView === "overview" && (
                <div className="space-y-4">
                  {/* Profit Simulation Sliders Panel */}
                  <div className="bg-emerald-50/70 border border-emerald-150 p-4 rounded-xl">
                    <div className="flex items-center gap-1.5 text-emerald-800 font-bold text-xs uppercase tracking-wider mb-3">
                      <TrendingUp size={14} className="text-emerald-600 animate-pulse" />
                      Interactive Market Profit Simulation Modeler
                    </div>
                    <div className="grid grid-cols-1 gap-4">
                      {/* Slider 1: Maize Wholesale Markup */}
                      <div className="space-y-1.5 bg-white p-3 rounded-lg border border-emerald-100 shadow-3xs">
                        <div className="flex justify-between items-center text-xs font-bold text-slate-700">
                          <span>Wholesale Maize Selling Markup:</span>
                          <span className="text-emerald-700 font-mono text-xs bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-100 font-extrabold">{maizeMarkupRate}%</span>
                        </div>
                        <input
                          type="range"
                          min="5"
                          max="50"
                          step="1"
                          value={maizeMarkupRate}
                          onChange={(e) => setMaizeMarkupRate(Number(e.target.value))}
                          className="w-full accent-emerald-600 h-1.5 rounded-lg cursor-pointer bg-slate-200"
                        />
                        <div className="flex justify-between text-[9px] text-slate-400 font-bold uppercase">
                          <span>5% Margin</span>
                          <span>Conservative (20-25%)</span>
                          <span>50% Max</span>
                        </div>
                        <p className="text-[9.5px] text-slate-450 leading-relaxed font-medium">
                          Simulates wholesale crop disposal premium on standard sourcing rates (₹ {cropSourcingCost > 0 ? (cropSourcingCost / (totalHarvestedKg || 1)).toFixed(1) : "0"}/KG) to external agribusiness firms.
                        </p>
                      </div>

                      {/* Slider 2: Fertilizer Retail Margin */}
                      <div className="space-y-1.5 bg-white p-3 rounded-lg border border-emerald-100 shadow-3xs">
                        <div className="flex justify-between items-center text-xs font-bold text-slate-700">
                          <span>Fertilizer Distribution Margin:</span>
                          <span className="text-emerald-700 font-mono text-xs bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-100 font-extrabold">{fertilizerMarkupRate}%</span>
                        </div>
                        <input
                          type="range"
                          min="0"
                          max="30"
                          step="1"
                          value={fertilizerMarkupRate}
                          onChange={(e) => setFertilizerMarkupRate(Number(e.target.value))}
                          className="w-full accent-emerald-600 h-1.5 rounded-lg cursor-pointer bg-slate-200"
                        />
                        <div className="flex justify-between text-[9px] text-slate-400 font-bold uppercase">
                          <span>0% Cost Basis</span>
                          <span>Standard (15%)</span>
                          <span>30% Target</span>
                        </div>
                        <p className="text-[9.5px] text-slate-450 leading-relaxed font-medium">
                          Simulates fertilizer inventory margin above supplier cost. Realized retail margins directly influence overall seasonal net profits.
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Core KPI Bento Grid */}
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    {/* Bento 1: Acreage & Land Yield */}
                    <div className="bg-white p-4 rounded-xl border border-slate-150 shadow-3xs hover:border-slate-300 transition space-y-2 min-w-0">
                      <div className="flex items-center justify-between gap-1">
                        <span className="text-[9px] text-slate-400 font-extrabold uppercase tracking-wider truncate">Acreage &amp; Sourcing</span>
                        <div className="p-1 rounded-lg bg-indigo-50 text-indigo-600 shrink-0"><Sprout size={12} /></div>
                      </div>
                      <div>
                        <span className="text-base sm:text-lg md:text-xl font-black text-slate-900 block font-sans truncate">
                          {totalHarvestedTons.toFixed(1)} <span className="text-xs font-medium text-slate-500">Tons</span>
                        </span>
                        <span className="text-[10px] text-slate-450 font-bold block mt-0.5 truncate">
                          From {totalSownAcres.toFixed(1)} Sown Acres
                        </span>
                      </div>
                      {/* Yield Progress Meter */}
                      <div className="space-y-1 pt-1 min-w-0">
                        <div className="flex justify-between text-[9px] text-slate-400 font-extrabold uppercase gap-1">
                          <span className="truncate">Yield Ratio</span>
                          <span className="text-indigo-600 font-mono shrink-0">{avgYieldTonsPerAcre.toFixed(2)} Tons/Ac</span>
                        </div>
                        <div className="w-full bg-slate-100 h-1 rounded-full overflow-hidden">
                          <div 
                            style={{ width: `${Math.min(100, (avgYieldTonsPerAcre / 4) * 100)}%` }} 
                            className="bg-indigo-600 h-full rounded-full"
                          ></div>
                        </div>
                        <div className="text-[8.5px] text-slate-450 font-semibold uppercase text-right truncate">
                          {avgYieldKgPerAcre.toFixed(0)} KG / Acre Sown
                        </div>
                      </div>
                    </div>

                    {/* Bento 2: Direct Capital Outlay */}
                    <div className="bg-white p-4 rounded-xl border border-slate-150 shadow-3xs hover:border-slate-300 transition space-y-2 min-w-0">
                      <div className="flex items-center justify-between gap-1">
                        <span className="text-[9px] text-slate-400 font-extrabold uppercase tracking-wider truncate">Direct Investment</span>
                        <div className="p-1 rounded-lg bg-rose-50 text-rose-600 shrink-0"><Coins size={12} /></div>
                      </div>
                      <div>
                        <span className="text-base sm:text-lg md:text-xl font-black text-slate-900 block font-mono tracking-tight truncate">
                          ₹ {totalCapitalInvested.toLocaleString()}
                        </span>
                        <span className="text-[10px] text-slate-450 font-bold block mt-0.5 truncate">
                          Consolidated Capital Sown
                        </span>
                      </div>
                      {/* Mini cost split progress */}
                      <div className="space-y-1 pt-1 text-[9px] min-w-0">
                        <span className="text-slate-400 font-extrabold uppercase block truncate">Outlay Split Summary</span>
                        <div className="flex w-full h-1.5 rounded-full overflow-hidden">
                          <div style={{ width: `${(cropSourcingCost / (totalCapitalInvested || 1)) * 100}%` }} className="bg-amber-500" title="Sourcing Payout"></div>
                          <div style={{ width: `${(fertilizerPurchaseCost / (totalCapitalInvested || 1)) * 100}%` }} className="bg-emerald-500" title="Fertilizer"></div>
                          <div style={{ width: `${(totalAdvancesIssued / (totalCapitalInvested || 1)) * 100}%` }} className="bg-blue-500" title="Advances"></div>
                          <div style={{ width: `${(totalSalaries / (totalCapitalInvested || 1)) * 100}%` }} className="bg-indigo-500" title="Salaries"></div>
                        </div>
                        <div className="flex justify-between text-[8px] font-semibold text-slate-450 gap-1">
                          <span className="text-amber-600 truncate">Sourcing: {Math.round((cropSourcingCost / (totalCapitalInvested || 1)) * 100)}%</span>
                          <span className="text-emerald-600 truncate">Fert: {Math.round((fertilizerPurchaseCost / (totalCapitalInvested || 1)) * 100)}%</span>
                        </div>
                      </div>
                    </div>

                    {/* Bento 3: Consolidated Revenues */}
                    <div className="bg-white p-4 rounded-xl border border-slate-150 shadow-3xs hover:border-slate-300 transition space-y-2 min-w-0">
                      <div className="flex items-center justify-between gap-1">
                        <span className="text-[9px] text-slate-400 font-extrabold uppercase tracking-wider truncate">Projected Inflows</span>
                        <div className="p-1 rounded-lg bg-blue-50 text-blue-600 shrink-0"><ShoppingCart size={12} /></div>
                      </div>
                      <div>
                        <span className="text-base sm:text-lg md:text-xl font-black text-slate-900 block font-mono tracking-tight truncate">
                          ₹ {totalBusinessRevenue.toLocaleString()}
                        </span>
                        <span className="text-[10px] text-slate-450 font-bold block mt-0.5 truncate">
                          Simulated Crop + Fert Sales
                        </span>
                      </div>
                      {/* Revenue split status */}
                      <div className="space-y-1.5 text-[9.5px] min-w-0">
                        <div className="flex justify-between font-medium gap-1.5">
                          <span className="text-slate-400 truncate">Crop Sales:</span>
                          <span className="font-bold text-slate-700 font-mono truncate text-right">₹{maizeWholesaleRevenue.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between font-medium gap-1.5">
                          <span className="text-slate-400 truncate">Fert Sales:</span>
                          <span className="font-bold text-slate-700 font-mono truncate text-right">₹{fertilizerActualSalesRevenue.toLocaleString()}</span>
                        </div>
                      </div>
                    </div>

                    {/* Bento 4: Net Returns & ROI */}
                    <div className="bg-white p-4 rounded-xl border border-slate-150 shadow-3xs hover:border-slate-300 transition space-y-2 min-w-0">
                      <div className="flex items-center justify-between gap-1">
                        <span className="text-[9px] text-slate-400 font-extrabold uppercase tracking-wider truncate">Net Return Metrics</span>
                        <div className={`p-1 rounded-lg shrink-0 ${consolidatedNetProfit >= 0 ? "bg-emerald-50 text-emerald-600" : "bg-rose-50 text-rose-600"}`}><TrendingUp size={12} /></div>
                      </div>
                      <div>
                        <span className={`text-base sm:text-lg md:text-xl font-black block font-mono tracking-tight truncate ${consolidatedNetProfit >= 0 ? "text-emerald-600" : "text-rose-600"}`}>
                          ₹ {consolidatedNetProfit.toLocaleString()}
                        </span>
                        <span className="text-[10px] text-slate-450 font-bold block mt-0.5 truncate">
                          Returns after Sowing Expenses
                        </span>
                      </div>
                      {/* ROI Status Gauge */}
                      <div className="space-y-1 pt-1 min-w-0">
                        <div className="flex justify-between text-[9px] text-slate-400 font-extrabold uppercase gap-1">
                          <span className="truncate">ROI Index</span>
                          <span className={`font-mono shrink-0 ${consolidatedNetProfit >= 0 ? "text-emerald-600" : "text-rose-600"}`}>{returnOnInvestmentPct.toFixed(1)}%</span>
                        </div>
                        <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                          <div 
                            style={{ width: `${Math.min(100, Math.max(0, returnOnInvestmentPct))}%` }} 
                            className={`h-full rounded-full ${consolidatedNetProfit >= 0 ? "bg-emerald-500" : "bg-rose-500"}`}
                          ></div>
                        </div>
                        <div className="text-[8.5px] font-semibold text-slate-450 uppercase flex justify-between gap-1">
                          <span className="truncate">Capital Ratio</span>
                          <span className="font-mono shrink-0">1:{((totalBusinessRevenue) / (totalCapitalInvested || 1)).toFixed(2)}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Profitability Meter / Executive Graph Card */}
                  <div className="bg-white p-4.5 rounded-xl border border-slate-150 shadow-xs space-y-4">
                    <div className="flex justify-between items-center border-b border-slate-100 pb-3">
                      <div>
                        <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wide">Investment Outflow vs Revenue Inflow Balance</h3>
                        <p className="text-[10px] text-slate-400 mt-0.5">Visualizing break-even efficiency based on simulation configurations.</p>
                      </div>
                      <span className={`text-[10px] uppercase font-extrabold px-2 py-0.5 rounded-md border ${
                        consolidatedNetProfit >= 0 
                          ? "bg-emerald-50 border-emerald-150 text-emerald-700" 
                          : "bg-rose-50 border-rose-150 text-rose-700"
                      }`}>
                        {consolidatedNetProfit >= 0 ? "Net Profit Positive" : "Operating Deficit"}
                      </span>
                    </div>

                    <div className="space-y-4.5">
                      {/* Custom Horizontal Visual Bar Balance */}
                      <div className="space-y-2">
                        <div className="flex justify-between text-xs font-bold">
                          <span className="text-slate-500 uppercase text-[10px]">Total Investment (Outflow)</span>
                          <span className="text-slate-700 uppercase text-[10px]">Total Business Value (Inflow)</span>
                        </div>
                        <div className="flex justify-between text-sm font-black font-mono">
                          <span className="text-rose-600">₹ {totalCapitalInvested.toLocaleString()}</span>
                          <span className="text-blue-600">₹ {totalBusinessRevenue.toLocaleString()}</span>
                        </div>
                        
                        {/* Visual alignment bar meter */}
                        <div className="w-full bg-slate-100 h-4.5 rounded-lg overflow-hidden flex shadow-3xs p-0.5 border border-slate-150">
                          {/* Investment block */}
                          <div 
                            style={{ width: `${(totalCapitalInvested / (totalCapitalInvested + totalBusinessRevenue || 1)) * 100}%` }}
                            className="bg-gradient-to-r from-rose-500 to-rose-400 h-full rounded-l-md transition-all duration-300 flex items-center justify-center text-[8.5px] text-white font-bold font-sans"
                          >
                            OUTLAY ({Math.round((totalCapitalInvested / (totalCapitalInvested + totalBusinessRevenue || 1)) * 100)}%)
                          </div>
                          {/* Revenue block */}
                          <div 
                            style={{ width: `${(totalBusinessRevenue / (totalCapitalInvested + totalBusinessRevenue || 1)) * 100}%` }}
                            className="bg-gradient-to-r from-emerald-400 to-emerald-500 h-full rounded-r-md transition-all duration-300 flex items-center justify-center text-[8.5px] text-white font-bold font-sans"
                          >
                            RETURNS ({Math.round((totalBusinessRevenue / (totalCapitalInvested + totalBusinessRevenue || 1)) * 100)}%)
                          </div>
                        </div>
                      </div>

                      {/* Cash Breakdown list - Fully Responsive Non-overlapping & vertical stacking */}
                      <div className="grid grid-cols-1 gap-3.5 text-xs pt-2">
                        <div className="bg-slate-50 rounded-xl p-3.5 border border-slate-150 space-y-3">
                          <h4 className="font-bold text-slate-700 uppercase text-[9.5px] tracking-wider flex items-center gap-1.5 border-b border-slate-200 pb-1.5">
                            <span className="w-2 h-2 rounded-full bg-rose-500"></span> Breakdown of Capital Invested
                          </h4>
                          <div className="space-y-2 text-slate-600 font-medium">
                            <div className="flex flex-col gap-1 border-b border-slate-100 pb-2 last:border-0 last:pb-0">
                              <span className="text-[10.5px] text-slate-500">Crop Sourcing Purchases (Standard payouts):</span>
                              <span className="font-mono font-bold text-slate-800 text-[11px] self-start bg-white/60 px-1.5 py-0.5 rounded border border-slate-200 mt-0.5">₹{cropSourcingCost.toLocaleString()}</span>
                            </div>
                            <div className="flex flex-col gap-1 border-b border-slate-100 pb-2 last:border-0 last:pb-0">
                              <span className="text-[10.5px] text-slate-500">Fertilizer Inventory Cost Basis (Supplier Bills):</span>
                              <span className="font-mono font-bold text-slate-800 text-[11px] self-start bg-white/60 px-1.5 py-0.5 rounded border border-slate-200 mt-0.5">₹{fertilizerPurchaseCost.toLocaleString()}</span>
                            </div>
                            <div className="flex flex-col gap-1 border-b border-slate-100 pb-2 last:border-0 last:pb-0">
                              <span className="text-[10.5px] text-slate-500">Active Village Staff &amp; supervisor Payroll:</span>
                              <span className="font-mono font-bold text-slate-800 text-[11px] self-start bg-white/60 px-1.5 py-0.5 rounded border border-slate-200 mt-0.5">₹{totalSalaries.toLocaleString()}</span>
                            </div>
                            <div className="flex flex-col gap-1 border-b border-slate-100 pb-2 last:border-0 last:pb-0">
                              <span className="text-[10.5px] text-slate-500">Seasonal Crop Cash Advances Sowed:</span>
                              <span className="font-mono font-bold text-slate-800 text-[11px] self-start bg-white/60 px-1.5 py-0.5 rounded border border-slate-200 mt-0.5">₹{totalAdvancesIssued.toLocaleString()}</span>
                            </div>
                          </div>
                        </div>

                        <div className="bg-slate-50 rounded-xl p-3.5 border border-slate-150 space-y-3">
                          <h4 className="font-bold text-slate-700 uppercase text-[9.5px] tracking-wider flex items-center gap-1.5 border-b border-slate-200 pb-1.5">
                            <span className="w-2 h-2 rounded-full bg-emerald-500"></span> Breakdown of Simulated Inflows
                          </h4>
                          <div className="space-y-2 text-slate-600 font-medium">
                            <div className="flex flex-col gap-1 border-b border-slate-100 pb-2 last:border-0 last:pb-0">
                              <span className="text-[10.5px] text-slate-500">Wholesale Crop Disposals Value (With Markup):</span>
                              <span className="font-mono font-bold text-slate-800 text-[11px] self-start bg-white/60 px-1.5 py-0.5 rounded border border-slate-200 mt-0.5">₹{maizeWholesaleRevenue.toLocaleString()}</span>
                            </div>
                            <div className="flex flex-col gap-1 border-b border-slate-100 pb-2 last:border-0 last:pb-0">
                              <span className="text-[10.5px] text-slate-500">Fertilizer Retail Distribution Value (Total):</span>
                              <span className="font-mono font-bold text-slate-800 text-[11px] self-start bg-white/60 px-1.5 py-0.5 rounded border border-slate-200 mt-0.5">₹{fertilizerActualSalesRevenue.toLocaleString()}</span>
                            </div>
                            <p className="text-[9px] text-slate-400 italic leading-snug pt-1">
                              * All fertilizer distributions are provided on credit and automatically deducted from the farmers' final harvest payouts.
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* SECTION 2: VILLAGE PERFORMANCE & CHART */}
              {analysisSubView === "villages" && (
                <div className="space-y-4">
                  {/* Village Search Bar */}
                  <div className="bg-white p-4 rounded-xl border border-slate-150 shadow-xs space-y-3">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                      <div>
                        <h4 className="text-[11px] font-extrabold text-slate-800 uppercase tracking-wide">Interactive Village Route Filter</h4>
                        <p className="text-[10px] text-slate-400 mt-0.5 font-medium">Instantly search and narrow down comparison charts and performance rankings.</p>
                      </div>
                    </div>
                    <div className="relative">
                      <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                      <input
                        type="text"
                        placeholder="Search village name or route..."
                        value={analysisVillageSearch}
                        onChange={(e) => setAnalysisVillageSearch(e.target.value)}
                        className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium focus:outline-none focus:border-brand-500 focus:bg-white transition"
                      />
                      {analysisVillageSearch && (
                        <button
                          onClick={() => setAnalysisVillageSearch("")}
                          className="absolute right-3 top-2 text-slate-400 hover:text-slate-600 font-bold text-xs bg-slate-100 hover:bg-slate-200 px-2 py-0.5 rounded transition cursor-pointer"
                        >
                          Clear
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Custom CSS Side-by-Side Bar Chart */}
                  <div className="bg-white p-4.5 rounded-xl border border-slate-150 shadow-xs">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-slate-100 pb-3 mb-4 gap-2">
                      <div>
                        <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wide">Route Comparison: Land vs Harvest</h3>
                        <p className="text-[10px] text-slate-400 mt-0.5 font-semibold">Sown Area (Acres) compared with Harvest Sourced Yield (Tons) per village.</p>
                      </div>
                      {/* Legend */}
                      <div className="flex gap-4 text-[9.5px] font-bold uppercase">
                        <div className="flex items-center gap-1.5 text-slate-600">
                          <span className="w-2.5 h-2.5 bg-brand-200 border border-brand-300 rounded-sm inline-block"></span>
                          <span>Acres Sown</span>
                        </div>
                        <div className="flex items-center gap-1.5 text-emerald-600">
                          <span className="w-2.5 h-2.5 bg-emerald-500 rounded-sm inline-block"></span>
                          <span>Yield (Tons)</span>
                        </div>
                      </div>
                    </div>

                    {/* Chart Columns */}
                    {filteredVillageBreakdownStats.length === 0 ? (
                      <div className="h-44 flex items-center justify-center text-slate-400 text-xs font-semibold">
                        No active village metrics found matching search query "{analysisVillageSearch}".
                      </div>
                    ) : (
                      <div className="h-48 flex items-end justify-between gap-6 pt-4 border-b border-slate-200 overflow-x-auto pb-1 no-scrollbar">
                        {(() => {
                          const maxAcresVal = Math.max(...filteredVillageBreakdownStats.map(item => item.acres), 1);
                          const maxTonsVal = Math.max(...filteredVillageBreakdownStats.map(item => item.tons), 1);
                          const peakValue = Math.max(maxAcresVal, maxTonsVal);

                          return filteredVillageBreakdownStats.map((d) => {
                            const acresPercent = (d.acres / peakValue) * 100;
                            const tonsPercent = (d.tons / peakValue) * 100;
                            
                            return (
                              <div key={d.village} className="flex-1 flex flex-col items-center group min-w-[55px] max-w-[120px]">
                                <div className="w-full flex justify-center gap-1.5 h-38 items-end relative">
                                  {/* Floating Hover Indicator Box */}
                                  <div className="absolute bottom-full mb-1.5 bg-slate-900 text-white text-[9px] px-2 py-1 rounded-md opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-20 shadow-md border border-slate-700 leading-normal font-sans text-center">
                                    <span className="font-bold text-white block">{d.village} Route</span>
                                    <span className="block text-slate-350">Acreage: {d.acres.toFixed(1)} Ac</span>
                                    <span className="block text-emerald-400">Harvest: {d.tons.toFixed(1)} Tons</span>
                                    <span className="block text-brand-400">Ratio: {d.yieldEff.toFixed(2)} T/Ac</span>
                                  </div>

                                  {/* Sown Acres Bar */}
                                  <div 
                                    style={{ height: `${acresPercent}%` }}
                                    className="w-4 sm:w-5 bg-gradient-to-t from-brand-300 to-brand-200 hover:to-brand-300 border-t border-brand-400 rounded-t-sm transition-all duration-300 relative shadow-2xs"
                                  >
                                    <span className="hidden sm:block absolute -top-4 left-1/2 -translate-x-1/2 text-[8px] font-bold text-slate-500">{d.acres.toFixed(0)}</span>
                                  </div>

                                  {/* Harvest Tons Bar */}
                                  <div 
                                    style={{ height: `${tonsPercent}%` }}
                                    className="w-4 sm:w-5 bg-gradient-to-t from-emerald-600 to-emerald-500 hover:to-emerald-400 rounded-t-sm transition-all duration-300 relative shadow-2xs"
                                  >
                                    <span className="hidden sm:block absolute -top-4 left-1/2 -translate-x-1/2 text-[8px] font-bold text-emerald-600">{d.tons.toFixed(0)}t</span>
                                  </div>
                                </div>
                                <span className="text-[10px] font-bold text-slate-600 mt-2.5 truncate w-full text-center tracking-tight">{d.village}</span>
                              </div>
                            );
                          });
                        })()}
                      </div>
                    )}
                  </div>

                  {/* Leaderboard & Breakdown Matrix Table */}
                  <div className="bg-white rounded-xl border border-slate-150 shadow-xs overflow-hidden">
                    <div className="bg-slate-50 p-3.5 border-b border-slate-150 flex justify-between items-center">
                      <h3 className="text-xs font-extrabold text-slate-800 uppercase tracking-wide">Route Yield &amp; Revenue Leaderboard</h3>
                      <span className="text-[9.5px] font-bold text-slate-450 uppercase">Sorted by Yield Efficiency (Tons/Ac)</span>
                    </div>

                    <div className="overflow-x-auto">
                      <table className="w-full text-left border-collapse text-xs">
                        <thead>
                          <tr className="bg-slate-50/50 text-[9.5px] text-slate-400 font-extrabold uppercase border-b border-slate-150">
                            <th className="p-3">Village Route</th>
                            <th className="p-3 text-center">Farmers Count</th>
                            <th className="p-3 text-center">Sown Area</th>
                            <th className="p-3 text-center">Sourced Tonnage</th>
                            <th className="p-3 text-center">Efficiency Rate</th>
                            <th className="p-3 text-right">Fertilizer Distributed</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 font-medium">
                          {[...filteredVillageBreakdownStats].sort((a,b) => b.yieldEff - a.yieldEff).map((v) => (
                            <tr key={v.village} className="hover:bg-slate-50/50 transition">
                              <td className="p-3 font-bold text-slate-800">
                                <div className="flex items-center gap-1.5">
                                  <span className="w-2 h-2 rounded-full bg-brand-500"></span>
                                  {v.village}
                                </div>
                              </td>
                              <td className="p-3 text-center text-slate-600">{v.farmersCount} Farmers</td>
                              <td className="p-3 text-center text-slate-600 font-mono">{v.acres.toFixed(1)} Acres</td>
                              <td className="p-3 text-center font-bold text-slate-700 font-mono">{v.tons.toFixed(1)} Tons</td>
                              <td className="p-3 text-center">
                                <span className={`inline-block px-2 py-0.5 rounded-full text-[9px] font-extrabold font-mono border ${
                                  v.yieldEff >= 3.5 
                                    ? "bg-emerald-50 border-emerald-150 text-emerald-700" 
                                    : v.yieldEff >= 2.5 
                                    ? "bg-blue-50 border-blue-150 text-blue-700" 
                                    : "bg-amber-50 border-amber-150 text-amber-700"
                                }`}>
                                  {v.yieldEff.toFixed(2)} Tons/Ac
                                </span>
                              </td>
                              <td className="p-3 text-right font-mono text-slate-600 font-bold">₹ {v.fertilizerRevenue.toLocaleString()}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}

              {/* SECTION 3: FARMER REGISTRY YIELDS & SETTLEMENT */}
              {analysisSubView === "farmers" && (
                <div className="space-y-4">
                  {/* Registry search filters */}
                  <div className="bg-white p-4.5 rounded-xl border border-slate-150 shadow-xs space-y-3">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                      <div>
                        <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wide">Farmer Yield &amp; Sourcing Registry</h3>
                        <p className="text-[10px] text-slate-400 mt-0.5">Trace complete harvest metrics, advances, and settle balances per farmer.</p>
                      </div>
                    </div>
                    {/* Interactive Search Bar */}
                    <div className="relative">
                      <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                      <input
                        type="text"
                        placeholder="Search farmer name, payment ID, or village route..."
                        value={analysisFarmerSearch}
                        onChange={(e) => setAnalysisFarmerSearch(e.target.value)}
                        className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium focus:outline-none focus:border-brand-500 focus:bg-white transition"
                      />
                      {analysisFarmerSearch && (
                        <button
                          onClick={() => setAnalysisFarmerSearch("")}
                          className="absolute right-3 top-2 text-slate-400 hover:text-slate-600 font-bold text-xs bg-slate-100 hover:bg-slate-200 px-2 py-0.5 rounded transition cursor-pointer"
                        >
                          Clear
                        </button>
                      )}
                    </div>
                  </div>

                  <div className="space-y-2">
                    {filteredFPayments.length === 0 ? (
                      <div className="bg-white p-8 text-center rounded-xl border border-slate-150 text-slate-400 font-semibold text-xs">
                        No farmer records found matching "{analysisFarmerSearch || "the selection"}".
                      </div>
                    ) : (
                      filteredFPayments.map((p) => {
                        const wt = Number(p.weightKg) || 0;
                        const rate = Number(p.pricePerKg) || 0;
                        const adv = Number(p.advanceAmount) || 0;
                        const interest = Number(p.interest) || 0;
                        const pesticide = Number(p.pesticideDues) || 0;
                        const loadingCost = Math.round((wt / 1000) * 400);

                        const grossCropVal = wt * rate;
                        const deductions = adv + interest + pesticide + loadingCost;
                        const netSettlementVal = Math.max(0, grossCropVal - deductions);

                        // Find sown acres for this specific farmer
                        const matchingEnroll = (enrolledFarmers || []).find(e => e.farmerName?.trim().toLowerCase() === p.farmerName?.trim().toLowerCase());
                        const farmAcres = matchingEnroll ? Number(matchingEnroll.acres) || 0 : 0;
                        const specificYieldEff = farmAcres > 0 ? ((wt / 1000) / farmAcres) : 0;

                        return (
                          <div key={p.id} className="bg-white p-4 rounded-xl border border-slate-150 shadow-3xs hover:border-slate-300 transition space-y-3.5 text-xs">
                            <div className="flex justify-between items-start border-b border-slate-100 pb-2.5">
                              <div>
                                <span className="font-extrabold text-slate-900 text-sm block">{p.farmerName}</span>
                                <span className="text-[10px] text-slate-450 font-bold block mt-0.5 uppercase tracking-wider">
                                  📍 Village: <strong className="text-slate-700">{p.villageName}</strong> | Sown Area: <strong className="text-slate-700">{farmAcres > 0 ? `${farmAcres} Acres` : "Not Registered"}</strong>
                                </span>
                              </div>
                              <div className="text-right">
                                <span className={`inline-block px-2.5 py-0.5 rounded-full text-[9px] font-extrabold uppercase border ${
                                  p.status === "Paid" 
                                    ? "bg-emerald-50 border-emerald-150 text-emerald-700" 
                                    : p.status === "Approved"
                                    ? "bg-blue-50 border-blue-150 text-blue-700"
                                    : "bg-amber-50 border-amber-150 text-amber-700"
                                }`}>
                                  {p.status}
                                </span>
                                <span className="text-[9px] font-mono text-slate-400 block mt-1">ID: {p.id}</span>
                              </div>
                            </div>

                            {/* Sourcing Crop & Yield specs */}
                            <div className="grid grid-cols-2 gap-3 bg-slate-50/60 p-3 rounded-lg border border-slate-100">
                              <div>
                                <span className="text-[9px] text-slate-400 font-extrabold uppercase block tracking-wider">Total Yield Sourced</span>
                                <span className="font-bold text-slate-800 text-xs font-mono">{wt.toLocaleString()} KG</span>
                                <span className="text-[9px] text-slate-450 block mt-0.5">({(wt/1000).toFixed(2)} Metric Tons)</span>
                              </div>
                              <div>
                                <span className="text-[9px] text-slate-400 font-extrabold uppercase block tracking-wider">Yield Efficiency</span>
                                <span className="font-bold text-slate-800 text-xs font-mono">
                                  {specificYieldEff > 0 ? `${specificYieldEff.toFixed(2)} Tons/Ac` : "N/A"}
                                </span>
                                <span className="text-[9px] text-slate-450 block mt-0.5">Tons harvested per acre</span>
                              </div>
                              <div>
                                <span className="text-[9px] text-slate-400 font-extrabold uppercase block tracking-wider">Gross Maize Value</span>
                                <span className="font-bold text-slate-800 text-xs font-mono">₹ {grossCropVal.toLocaleString()}</span>
                                <span className="text-[9.5px] text-slate-450 block mt-0.5">At ₹ {rate.toFixed(1)} / KG</span>
                              </div>
                              <div>
                                <span className="text-[9px] text-slate-400 font-extrabold uppercase block tracking-wider">Net Settlement Payout</span>
                                <span className="font-extrabold text-emerald-600 text-sm font-mono">₹ {netSettlementVal.toLocaleString()}</span>
                                <span className="text-[9px] text-slate-450 block mt-0.5">After all deductions</span>
                              </div>
                            </div>

                            {/* Outlay / Sowing Deductions Ledger */}
                            <div className="space-y-1.5 border-t border-slate-100 pt-3">
                              <span className="text-[9px] text-slate-400 font-extrabold uppercase block tracking-wider">Settlement &amp; Deduction Outlays</span>
                              <div className="grid grid-cols-2 gap-2">
                                <div className="bg-slate-50 p-2 text-left rounded-lg border border-slate-150 shadow-3xs hover:border-slate-300 transition flex flex-col justify-between">
                                  <span className="text-[8.5px] text-slate-400 font-extrabold uppercase block tracking-wider leading-normal">Advance Outstanding</span>
                                  <span className="font-mono font-bold text-slate-700 text-[10.5px] mt-1 block">₹ {adv.toLocaleString()}</span>
                                </div>
                                <div className="bg-slate-50 p-2 text-left rounded-lg border border-slate-150 shadow-3xs hover:border-slate-300 transition flex flex-col justify-between">
                                  <span className="text-[8.5px] text-slate-400 font-extrabold uppercase block tracking-wider leading-normal">Pesticide Dues</span>
                                  <span className="font-mono font-bold text-slate-700 text-[10.5px] mt-1 block">₹ {pesticide.toLocaleString()}</span>
                                </div>
                                <div className="bg-slate-50 p-2 text-left rounded-lg border border-slate-150 shadow-3xs hover:border-slate-300 transition flex flex-col justify-between">
                                  <span className="text-[8.5px] text-slate-400 font-extrabold uppercase block tracking-wider leading-normal">Interest Accrued</span>
                                  <span className="font-mono font-bold text-slate-700 text-[10.5px] mt-1 block">₹ {interest.toLocaleString()}</span>
                                </div>
                                <div className="bg-slate-50 p-2 text-left rounded-lg border border-slate-150 shadow-3xs hover:border-slate-300 transition flex flex-col justify-between">
                                  <span className="text-[8.5px] text-slate-400 font-extrabold uppercase block tracking-wider leading-normal">Loading (₹400/Ton)</span>
                                  <span className="font-mono font-bold text-slate-700 text-[10.5px] mt-1 block">₹ {loadingCost.toLocaleString()}</span>
                                </div>
                              </div>
                              <div className="text-[9.5px] text-slate-450 text-right font-medium">
                                Total Deductions: <strong className="text-slate-700 font-extrabold">₹ {deductions.toLocaleString()}</strong> ({Math.round((deductions / (grossCropVal || 1)) * 100)}% of crop value sowed)
                              </div>
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>
              )}

              {/* SECTION 4: EXECUTIVE P&L FINANCIAL STATEMENT */}
              {analysisSubView === "p_and_l" && (
                <div className="bg-white rounded-xl border border-slate-150 shadow-xs overflow-hidden">
                  <div className="bg-slate-50 p-4 border-b border-slate-150">
                    <h3 className="text-xs font-black text-slate-800 uppercase tracking-wide">Executive Profit &amp; Loss Financial Statement</h3>
                    <p className="text-[10px] text-slate-400 mt-0.5">Formally structured corporate ledger view for fiscal evaluations.</p>
                  </div>

                  {/* Commission/Margin Configuration Section inside P&L Statement */}
                  {(() => {
                    const uniqueCompanies = [
                      "Standard",
                      "Syngenta India",
                      "Monsanto India",
                      "Asha Bio-Seeds",
                      "Nuziveedu Seeds (Newzweed)"
                    ];

                    return (
                      <div className="bg-emerald-50/50 p-4 border-b border-slate-150 flex flex-col gap-4 text-xs">
                        <div className="space-y-0.5">
                          <h4 className="font-extrabold text-slate-800 flex items-center gap-1.5 text-xs">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                            Company-wise Commission Margins (Owner's Keep)
                          </h4>
                          <p className="text-[10px] text-slate-450 font-medium">
                            Configure the custom margin or commission rate (₹ per KG) kept by the owner for each seed company to evaluate exact net profits.
                          </p>
                        </div>

                        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2.5 mt-1">
                          {uniqueCompanies.map((company) => {
                            const rate = companyCommissionRates[company] !== undefined ? companyCommissionRates[company] : commissionRate;
                            return (
                              <div key={company} className="bg-white p-2.5 rounded-xl border border-slate-200 flex flex-col justify-between gap-2 shadow-3xs hover:shadow-2xs transition duration-200">
                                <div className="min-h-[2.25rem] flex items-center">
                                  <span className="font-bold text-slate-700 text-[10.5px] leading-tight break-words" title={company}>
                                    {company === "Standard" ? "Standard (Others)" : company}
                                  </span>
                                </div>
                                <div className="flex items-center justify-between gap-1.5 border-t border-slate-100 pt-1.5">
                                  <span className="text-[9.5px] text-slate-450 font-bold shrink-0">₹ / KG</span>
                                  <div className="flex items-center border border-slate-200 rounded-lg overflow-hidden bg-slate-50 shrink-0">
                                    <button
                                      type="button"
                                      onClick={() => {
                                        setCompanyCommissionRates(prev => ({
                                          ...prev,
                                          [company]: Math.max(0, (prev[company] !== undefined ? prev[company] : commissionRate) - 0.5)
                                        }));
                                      }}
                                      className="w-5 h-5 flex items-center justify-center hover:bg-slate-200 font-extrabold text-slate-600 transition cursor-pointer select-none text-[10px]"
                                    >
                                      -
                                    </button>
                                    <input
                                      type="number"
                                      step="0.5"
                                      min="0"
                                      max="20"
                                      value={rate}
                                      onChange={(e) => {
                                        const val = Math.max(0, parseFloat(e.target.value) || 0);
                                        setCompanyCommissionRates(prev => ({
                                          ...prev,
                                          [company]: val
                                        }));
                                      }}
                                      className="w-6 text-center font-extrabold text-slate-800 outline-none text-[10px] bg-transparent border-none p-0 focus:ring-0"
                                    />
                                    <button
                                      type="button"
                                      onClick={() => {
                                        setCompanyCommissionRates(prev => ({
                                          ...prev,
                                          [company]: Math.min(20, (prev[company] !== undefined ? prev[company] : commissionRate) + 0.5)
                                        }));
                                      }}
                                      className="w-5 h-5 flex items-center justify-center hover:bg-slate-200 font-extrabold text-slate-600 transition cursor-pointer select-none text-[10px]"
                                    >
                                      +
                                    </button>
                                  </div>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })()}

                  <div className="p-4 space-y-4">
                    <div className="border border-slate-200 rounded-xl overflow-hidden divide-y divide-slate-150">
                      
                      {/* Section 1: Revenue */}
                      <div className="p-3 bg-slate-50/50">
                        <div className="flex justify-between items-center font-bold text-slate-800 uppercase tracking-wide text-xs">
                          <span>1. OPERATING REVENUES (INFLOWS)</span>
                          <span className="font-mono text-emerald-600">₹ {totalBusinessRevenue.toLocaleString()}</span>
                        </div>
                        <div className="mt-2 pl-4 space-y-1.5 text-slate-600 text-xs font-medium">
                          {totalCommissionMargin > 0 && (
                            <div className="text-emerald-700 bg-emerald-50/80 p-2.5 rounded-xl border border-emerald-150 my-2 shadow-3xs space-y-1">
                              <div className="flex justify-between font-extrabold text-xs">
                                <span>Owner Kept Margin &amp; Commission (Custom Company-wise):</span>
                                <span className="font-mono text-emerald-800 font-black">₹ {totalCommissionMargin.toLocaleString()}</span>
                              </div>
                              <div className="border-t border-emerald-200/50 pt-1.5 mt-1.5 space-y-1 text-[10.5px] font-medium text-emerald-600 pl-2">
                                {Object.entries(companyCommissionBreakdown).map(([company, data]) => {
                                  if (data.weightKg === 0) return null;
                                  return (
                                    <div key={company} className="flex justify-between">
                                      <span>&bull; {company === "Standard" ? "Standard (Others)" : company} ({data.weightKg.toLocaleString()} KG @ ₹{data.rate}/KG):</span>
                                      <span className="font-mono font-bold text-emerald-700">₹ {Math.round(data.commission).toLocaleString()}</span>
                                    </div>
                                  );
                                })}
                              </div>
                            </div>
                          )}
                          <div className="flex justify-between">
                            <span>Maize Crop Disposal Market Value (Simulated Wholesale with {maizeMarkupRate}% Premium):</span>
                            <span className="font-mono font-semibold">₹ {maizeWholesaleRevenue.toLocaleString()}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Fertilizer Retail Distribution Value (Total Farmer Sales):</span>
                            <span className="font-mono font-semibold">₹ {fertilizerActualSalesRevenue.toLocaleString()}</span>
                          </div>
                          <div className="flex justify-between text-slate-450 text-[10.5px] pl-4">
                            <span>&bull; Received Cash Collections from farmers:</span>
                            <span className="font-mono">₹ {fertilizerCollectedSalesRevenue.toLocaleString()}</span>
                          </div>
                          <div className="flex justify-between text-slate-450 text-[10.5px] pl-4">
                            <span>&bull; Fertilizer Invoice Dues (Outstanding credit recovered at harvest):</span>
                            <span className="font-mono text-brand-600 font-bold">₹ {fertilizerOutstandingReceivable.toLocaleString()}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Financial Earnings (Sowing Advances Interest Accrued):</span>
                            <span className="font-mono font-semibold">₹ {totalInterestCharged.toLocaleString()}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Logistics Collections (Harvest Loading &amp; Transportation offset):</span>
                            <span className="font-mono font-semibold">₹ {loadingChargesDeducted.toLocaleString()}</span>
                          </div>
                        </div>
                      </div>

                      {/* Section 2: COGS */}
                      <div className="p-3">
                        <div className="flex justify-between items-center font-bold text-slate-800 uppercase tracking-wide text-xs">
                          <span>2. COST OF GOODS SOLD (DIRECT SOWING ACQUISITION COGS)</span>
                          <span className="font-mono text-rose-600">- ₹ {(cropSourcingCost + fertilizerPurchaseCost).toLocaleString()}</span>
                        </div>
                        <div className="mt-2 pl-4 space-y-1.5 text-slate-600 text-xs font-medium">
                          <div className="flex justify-between font-bold">
                            <span>Direct Sourcing Maize Payments (Gross payout value due farmers):</span>
                            <span className="font-mono">₹ {cropSourcingCost.toLocaleString()}</span>
                          </div>
                          {/* Sourcing Deductions Breakdown inside P&L */}
                          <div className="bg-slate-50/80 p-2.5 rounded-lg border border-slate-200 text-[11px] space-y-1 text-slate-500 font-semibold my-1.5 pl-3">
                            <span className="text-[9.5px] uppercase tracking-wider font-extrabold text-slate-400 block mb-1">Involved Deductions Recovered at Harvest Payouts:</span>
                            <div className="flex justify-between text-emerald-600">
                              <span>(-) Sowed Seasonal Cash Advances:</span>
                              <span className="font-mono">- ₹ {totalAdvancesIssued.toLocaleString()}</span>
                            </div>
                            <div className="flex justify-between text-emerald-600">
                              <span>(-) Sowing Advance Interest (Accrued):</span>
                              <span className="font-mono">- ₹ {totalInterestCharged.toLocaleString()}</span>
                            </div>
                            <div className="flex justify-between text-emerald-600">
                              <span>(-) Pesticide &amp; Agricultural Input Dues:</span>
                              <span className="font-mono">- ₹ {totalPesticideDues.toLocaleString()}</span>
                            </div>
                            <div className="flex justify-between text-emerald-600">
                              <span>(-) Fertilizer Invoice Dues (Outstanding balance bills):</span>
                              <span className="font-mono font-bold">- ₹ {fertilizerOutstandingReceivable.toLocaleString()}</span>
                            </div>
                            <div className="flex justify-between text-emerald-600 border-b pb-1 border-dashed mb-1">
                              <span>(-) Loading &amp; Logistics Deductions (₹400/Ton):</span>
                              <span className="font-mono">- ₹ {loadingChargesDeducted.toLocaleString()}</span>
                            </div>
                            <div className="flex justify-between text-slate-700 font-extrabold">
                              <span>Actual Net Cash Sourcing Sowed Payout:</span>
                              <span className="font-mono text-brand-700">₹ {netSourcingPayoutCost.toLocaleString()}</span>
                            </div>
                          </div>
                          <div className="flex justify-between">
                            <span>Fertilizer Inventory Purchases (Supplier Inward Bills cost basis):</span>
                            <span className="font-mono font-semibold">₹ {fertilizerPurchaseCost.toLocaleString()}</span>
                          </div>
                        </div>
                      </div>

                      {/* Section 3: Gross Margin */}
                      <div className="p-3 bg-slate-100/50 flex justify-between items-center font-extrabold text-slate-900 text-xs uppercase tracking-wide">
                        <span>3. GROSS OPERATING PROFIT MARGIN</span>
                        <div className="font-mono text-right">
                          <span className="block">₹ {(totalBusinessRevenue - (cropSourcingCost + fertilizerPurchaseCost)).toLocaleString()}</span>
                          <span className="text-[9.5px] text-emerald-600 font-extrabold block normal-case font-sans mt-0.5">
                            Gross Margin: {(((totalBusinessRevenue - (cropSourcingCost + fertilizerPurchaseCost)) / (totalBusinessRevenue || 1)) * 100).toFixed(1)}%
                          </span>
                        </div>
                      </div>

                      {/* Section 4: Operating Expenses */}
                      <div className="p-3">
                        <div className="flex justify-between items-center font-bold text-slate-800 uppercase tracking-wide text-xs">
                          <span>4. OPERATING OVERHEAD EXPENSES (OPEX)</span>
                          <span className="font-mono text-rose-600">- ₹ {totalSalaries.toLocaleString()}</span>
                        </div>
                        <div className="mt-2 pl-4 space-y-1.5 text-slate-600 text-xs font-medium">
                          <div className="flex justify-between">
                            <span>Village Supervisors &amp; Operators base Payroll outlay:</span>
                            <span className="font-mono font-semibold">₹ {totalSalaries.toLocaleString()}</span>
                          </div>
                        </div>
                      </div>

                      {/* Section 5: Consolidated Net EBITDA Profit */}
                      <div className="p-3 bg-slate-900 text-white flex justify-between items-center font-black text-xs uppercase tracking-wide rounded-b-xl shadow-xs">
                        <span>5. CONSOLIDATED NET OPERATING PROFIT (EBITDA)</span>
                        <div className="font-mono text-right">
                          <span className={`block text-sm ${consolidatedNetProfit >= 0 ? "text-emerald-400" : "text-rose-400"}`}>
                            ₹ {consolidatedNetProfit.toLocaleString()}
                          </span>
                          <span className={`text-[9.5px] block font-extrabold font-sans mt-0.5 normal-case ${consolidatedNetProfit >= 0 ? "text-emerald-400" : "text-rose-400"}`}>
                            Net Profit Margin: {((consolidatedNetProfit / (totalBusinessRevenue || 1)) * 100).toFixed(1)}% | Return on Invested Capital: {returnOnInvestmentPct.toFixed(1)}%
                          </span>
                        </div>
                      </div>

                    </div>

                    <div className="bg-slate-50 border border-slate-150 p-3 rounded-lg text-[10px] text-slate-500 font-medium leading-relaxed">
                      * <strong>P&amp;L Ledger Disclaimer &amp; Accounting Model</strong>: The figures above reflect recorded fertilizer sales distributions, registered supervisor payroll, and actual crop sourcing metrics. Crop values and fertilizer sales margins are dynamically adjusted using market markup simulators to model seasonal business performance accurately.
                    </div>
                  </div>
                </div>
              )}

            </div>
          );
        })()}

        {previewMode && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-2xl w-full flex flex-col max-h-[90vh] overflow-hidden animate-in fade-in zoom-in-95 duration-200">
              {/* Header */}
              <div className={`p-4 border-b flex items-center justify-between ${
                previewMode === "approve" ? "bg-emerald-50 border-emerald-100" : "bg-rose-50 border-rose-100"
              }`}>
                <div className="flex items-center gap-2">
                  <div className={`p-2 rounded-xl ${
                    previewMode === "approve" ? "bg-emerald-100 text-emerald-800" : "bg-rose-100 text-rose-800"
                  }`}>
                    {previewMode === "approve" ? <CheckCircle size={20} /> : <XCircle size={20} />}
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wide">
                      Bulk {previewMode === "approve" ? "Approval" : "Rejection"} Preview
                    </h3>
                    <p className="text-[10px] text-slate-500 font-semibold uppercase">
                      Category: {activeSubTab.replace("_", " ")}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setPreviewMode(null)}
                  className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-400 hover:text-slate-700 transition cursor-pointer"
                >
                  <X size={16} />
                </button>
              </div>

              {/* Body */}
              <div className="p-5 overflow-y-auto space-y-4 flex-1 text-xs">
                <div className="bg-slate-50 border border-slate-150 rounded-xl p-3.5 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] text-slate-400 font-bold uppercase block tracking-wider">
                      Selected Items
                    </span>
                    <span className="text-lg font-extrabold text-slate-900">
                      {selectedItems.length} Records
                    </span>
                  </div>
                  {(activeSubTab === "crop_settlement" || activeSubTab === "supplier_invoices" || activeSubTab === "farmer_advances") && (
                    <div className="text-right">
                      <span className="text-[10px] text-slate-400 font-bold uppercase block tracking-wider">
                        Total Amount
                      </span>
                      <span className={`text-lg font-black ${
                        previewMode === "approve" ? "text-emerald-700" : "text-rose-700"
                      }`}>
                        ₹ {calculateSelectedTotal().toLocaleString()}
                      </span>
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  <span className="text-[10px] text-slate-400 font-bold uppercase block tracking-wider px-1">
                    Itemized Summary ({selectedItems.length} items)
                  </span>
                  
                  <div className="border border-slate-150 rounded-xl overflow-hidden bg-white max-h-52 overflow-y-auto divide-y divide-slate-100">
                    {selectedItems.map((item, idx) => {
                      if (!item) return null;
                      
                      let title = "";
                      let detail = "";
                      let figure = "";

                      if (activeSubTab === "crop_settlement") {
                        const weightKg = Number(item.weightKg) || 0;
                        const pricePerKg = Number(item.pricePerKg) || 0;
                        const advanceAmount = Number(item.advanceAmount) || 0;
                        const interest = Number(item.interest) || 0;
                        const pesticideDues = Number(item.pesticideDues) || 0;
                        const gross = weightKg * pricePerKg;
                        const loading = Math.round((weightKg / 1000) * 400);
                        const totalDeductions = advanceAmount + interest + pesticideDues + loading;
                        const net = Math.round(gross - totalDeductions);

                        title = item.farmerName;
                        detail = `📍 ${item.villageName || "Unknown Route"} | Yield: ${weightKg.toLocaleString()} KG`;
                        figure = `₹ ${net.toLocaleString()}`;
                      } else if (activeSubTab === "supplier_invoices") {
                        title = item.supplierName;
                        detail = `📄 Inv: ${item.billNumber} | Product: ${item.productName} (${item.bagCount} Bags)`;
                        figure = `₹ ${(item.totalAmount ?? 0).toLocaleString()}`;
                      } else if (activeSubTab === "farmer_advances") {
                        title = item.farmerName;
                        detail = `📍 ${item.villageName} | Assistant: ${item.assistantName}`;
                        figure = `₹ ${(item.amountProposed ?? 0).toLocaleString()}`;
                      } else if (activeSubTab === "ledger_corrections") {
                        title = item.farmerName;
                        detail = `📍 ${item.villageName} | Live: ₹${item.originalData?.totalAmount?.toLocaleString()} -> Proposed: ₹${item.requestedChanges?.totalAmount?.toLocaleString()}`;
                        figure = `Reason: "${item.justification}"`;
                      } else if (activeSubTab === "rate_registry") {
                        title = item.cropOrProductName;
                        detail = `${item.companyOrMfrName} (${item.year}) | Live rate: ₹${item.currentRate}`;
                        figure = item.action === "delete" ? "Delete Registry Entry" : `New rate: ₹${item.requestedRate}`;
                      } else if (activeSubTab === "farmer_profile") {
                        title = item.farmerName;
                        detail = `📍 ${item.villageName} | Type: ${item.action === "delete" ? "Deletion" : "Revision"}`;
                        figure = item.action === "delete" ? "Remove from Index" : `Acres: ${item.originalData?.acres} -> ${item.requestedChanges?.acres}`;
                      } else if (activeSubTab === "advance_corrections") {
                        title = item.farmerName;
                        detail = `Type: ${item.action === "delete" ? "Cancel Advance" : "Adjust Advance"} | Current: ₹${item.originalAmount}`;
                        figure = item.action === "delete" ? "Cancellation" : `Proposed: ₹${item.requestedAmount}`;
                      } else if (activeSubTab === "salary_unlocks") {
                        title = item.staffName;
                        detail = `💼 ${item.designation} | Reason: "${item.reason}"`;
                        figure = `Salary Scale: ₹${(item.currentSalary ?? 0).toLocaleString()}`;
                      }

                      return (
                        <div key={item.id || idx} className="p-3 hover:bg-slate-50 flex items-start justify-between gap-4 font-medium">
                          <div className="space-y-0.5 text-left">
                            <span className="font-extrabold text-slate-900 block">{title}</span>
                            <span className="text-[10px] text-slate-400 block">{detail}</span>
                          </div>
                          <div className="text-right shrink-0">
                            <span className="font-bold text-slate-800 block font-mono">{figure}</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div className="bg-amber-50/65 border border-amber-150 rounded-xl p-3 flex gap-2 text-amber-800 text-[10.5px] text-left">
                  <AlertTriangle size={15} className="shrink-0 text-amber-600 mt-0.5" />
                  <div>
                    <span className="font-bold block text-amber-900">Irreversible Action Notice</span>
                    <span>
                      Proceeding will execute the bulk action of <strong className="font-bold">{previewMode === "approve" ? "APPROVING" : "REJECTING"}</strong> these {selectedItems.length} records. Live accounts, ledgers, and registry tables will update instantly.
                    </span>
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div className="p-4 border-t bg-slate-50 flex items-center justify-end gap-2 shrink-0">
                <button
                  onClick={() => setPreviewMode(null)}
                  className="px-4 py-2 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-xl font-bold cursor-pointer transition text-xs"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSubmitBulkAction}
                  className={`px-4 py-2 text-white rounded-xl font-black shadow-sm flex items-center gap-1.5 cursor-pointer transition text-xs ${
                    previewMode === "approve" ? "bg-emerald-600 hover:bg-emerald-700" : "bg-rose-600 hover:bg-rose-700"
                  }`}
                >
                  {previewMode === "approve" ? <Check size={14} /> : <X size={14} />}
                  Confirm & Execute Bulk {previewMode === "approve" ? "Approval" : "Rejection"}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* MODAL 1: FERTILIZER PRODUCT DETAILED LEDGER */}
        {selectedFertilizerProduct && (() => {
          const matchedStocks = (stocks || []).filter(s => s && s.productName === selectedFertilizerProduct.productName);
          const totalBagsCost = matchedStocks.reduce((sum, s) => sum + (s.totalAmount || 0), 0);
          
          return (
            <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
              <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-xl w-full flex flex-col max-h-[90vh] overflow-hidden animate-in fade-in zoom-in-95 duration-200 text-xs">
                {/* Header */}
                <div className="p-4 border-b flex items-center justify-between bg-slate-50">
                  <div className="flex items-center gap-2">
                    <div className="p-2 bg-brand-100 text-brand-800 rounded-xl">
                      <Sprout size={18} />
                    </div>
                    <div>
                      <h3 className="text-sm font-black text-slate-900">
                        {selectedFertilizerProduct.productName}
                      </h3>
                      <p className="text-[10px] text-slate-450 uppercase font-bold tracking-wider">
                        Fertilizer &amp; Pesticide Inventory Ledger
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => setSelectedFertilizerProduct(null)}
                    className="p-1.5 hover:bg-slate-150 rounded-lg text-slate-400 hover:text-slate-700 transition cursor-pointer"
                  >
                    <X size={16} />
                  </button>
                </div>

                {/* Body */}
                <div className="p-5 overflow-y-auto space-y-4 flex-1">
                  {/* Stocks Overview */}
                  <div className="grid grid-cols-3 gap-2 bg-slate-50/70 border border-slate-150 rounded-xl p-3 text-center">
                    <div>
                      <span className="text-[9px] text-slate-400 uppercase font-bold block">Purchased</span>
                      <strong className="text-slate-800 font-extrabold text-sm font-mono">{selectedFertilizerProduct.totalPurchased} Bags</strong>
                    </div>
                    <div>
                      <span className="text-[9px] text-slate-400 uppercase font-bold block">Main stock</span>
                      <strong className="text-brand-700 font-extrabold text-sm font-mono">{selectedFertilizerProduct.availableMain} Bags</strong>
                    </div>
                    <div>
                      <span className="text-[9px] text-slate-400 uppercase font-bold block">Village stock</span>
                      <strong className="text-emerald-700 font-extrabold text-sm font-mono">{selectedFertilizerProduct.availableVillage} Bags</strong>
                    </div>
                  </div>

                  {/* Supplier Directory List */}
                  <div className="space-y-2">
                    <span className="text-[10px] text-slate-400 font-bold uppercase block tracking-wider px-1">
                      Suppliers and Purchases History ({matchedStocks.length})
                    </span>

                    <div className="border border-slate-150 rounded-xl overflow-hidden bg-white max-h-52 overflow-y-auto divide-y divide-slate-100">
                      {matchedStocks.length === 0 ? (
                        <div className="p-4 text-center text-slate-400 font-medium">No supplier invoice records.</div>
                      ) : (
                        matchedStocks.map((s, idx) => (
                          <div key={idx} className="p-3 hover:bg-slate-50 flex justify-between items-center transition">
                            <div>
                              <strong className="text-slate-800 font-extrabold block text-xs">{s.supplierName}</strong>
                              <span className="text-[10px] text-slate-400 block font-medium">
                                Invoice: {s.billNumber || "Direct"} &bull; {s.date}
                              </span>
                            </div>
                            <div className="text-right">
                              <span className="font-bold text-slate-900 block font-mono">₹ {s.totalAmount.toLocaleString()}</span>
                              <span className="text-[9.5px] text-slate-450 block font-medium">
                                {s.bagCount} Bags @ ₹{s.ratePerBag}/Bag
                              </span>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>

                  {/* Expense Summary Footer */}
                  <div className="bg-brand-50 border border-brand-100 rounded-xl p-3.5 flex justify-between items-center">
                    <div>
                      <span className="text-[10px] text-brand-800 font-bold uppercase tracking-wider block">Total Capital Spent</span>
                      <span className="text-xs text-slate-500 font-medium">Sum of all supplier bills</span>
                    </div>
                    <span className="text-sm font-black text-brand-900 font-mono">₹ {totalBagsCost.toLocaleString()}</span>
                  </div>
                </div>

                {/* Footer */}
                <div className="p-4 border-t bg-slate-50 flex items-center justify-end shrink-0">
                  <button
                    onClick={() => setSelectedFertilizerProduct(null)}
                    className="px-4 py-2 bg-slate-900 text-white rounded-xl font-bold cursor-pointer hover:bg-slate-800 transition text-xs"
                  >
                    Close Ledger
                  </button>
                </div>
              </div>
            </div>
          );
        })()}

        {/* MODAL 2: DETAILED SUPPLIER INVOICE */}
        {selectedSupplierInvoice && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-md w-full flex flex-col max-h-[90vh] overflow-hidden animate-in fade-in zoom-in-95 duration-200 text-xs">
              {/* Header */}
              <div className="p-4 border-b flex items-center justify-between bg-slate-50">
                <div className="flex items-center gap-2">
                  <div className="p-2 bg-amber-100 text-amber-800 rounded-xl">
                    <FileText size={18} />
                  </div>
                  <div>
                    <h3 className="text-sm font-black text-slate-900">
                      Invoice #{selectedSupplierInvoice.billNumber || "N/A"}
                    </h3>
                    <p className="text-[10px] text-slate-450 uppercase font-bold tracking-wider">
                      Supplier Inward Ledger
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedSupplierInvoice(null)}
                  className="p-1.5 hover:bg-slate-150 rounded-lg text-slate-400 hover:text-slate-700 transition cursor-pointer"
                >
                  <X size={16} />
                </button>
              </div>

              {/* Body */}
              <div className="p-5 overflow-y-auto space-y-4">
                <div className="space-y-2 border border-slate-150 bg-slate-50/70 rounded-xl p-4">
                  <div className="flex justify-between">
                    <span className="text-slate-400 font-bold">Supplier Partner:</span>
                    <strong className="text-slate-800 font-extrabold">{selectedSupplierInvoice.supplierName}</strong>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400 font-bold">Product Item:</span>
                    <strong className="text-slate-800 font-extrabold">{selectedSupplierInvoice.productName}</strong>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400 font-bold">Bags Sourced:</span>
                    <strong className="text-slate-800 font-bold font-mono">{selectedSupplierInvoice.bagCount} Bags</strong>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400 font-bold">Sourcing Rate:</span>
                    <strong className="text-slate-800 font-bold font-mono">₹ {selectedSupplierInvoice.ratePerBag}/Bag</strong>
                  </div>
                  <div className="flex justify-between border-t border-slate-200 pt-2 text-slate-900">
                    <span className="font-extrabold text-xs">Invoice Net Total:</span>
                    <strong className="text-xs font-black font-mono">₹ {(selectedSupplierInvoice.totalAmount ?? 0).toLocaleString()}</strong>
                  </div>
                </div>

                <div className="flex justify-between p-3 border border-slate-150 rounded-xl bg-white text-[10px] font-semibold text-slate-500">
                  <div>
                    <span className="text-[8.5px] text-slate-400 uppercase block">Submission Date</span>
                    <span>{selectedSupplierInvoice.date || "N/A"}</span>
                  </div>
                  <div className="text-right">
                    <span className="text-[8.5px] text-slate-400 uppercase block">Ledger Status</span>
                    <span className={`px-2 py-0.5 rounded font-black ${
                      selectedSupplierInvoice.approvalStatus === "Approved" ? "bg-emerald-50 text-emerald-700" : "bg-amber-50 text-amber-700"
                    }`}>{selectedSupplierInvoice.approvalStatus || "Pending Owner Action"}</span>
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div className="p-4 border-t bg-slate-50 flex items-center justify-end shrink-0">
                <button
                  onClick={() => setSelectedSupplierInvoice(null)}
                  className="px-4 py-2 bg-slate-900 text-white rounded-xl font-bold cursor-pointer hover:bg-slate-800 transition text-xs"
                >
                  Close Bill
                </button>
              </div>
            </div>
          </div>
        )}

        {/* MODAL 3: FARMER DETAILED LEDGER & SETTLEMENTS */}
        {selectedFarmer && (() => {
          const payment = (localFarmerPayments || []).find(p => p && p.farmerName?.toLowerCase() === selectedFarmer.farmerName?.toLowerCase());
          
          return (
            <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
              <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-lg w-full flex flex-col max-h-[90vh] overflow-hidden animate-in fade-in zoom-in-95 duration-200 text-xs">
                {/* Header */}
                <div className="p-4 border-b flex items-center justify-between bg-slate-50">
                  <div className="flex items-center gap-2">
                    <div className="p-2 bg-blue-100 text-blue-800 rounded-xl">
                      <User size={18} />
                    </div>
                    <div>
                      <h3 className="text-sm font-black text-slate-900">
                        {selectedFarmer.farmerName}
                      </h3>
                      <p className="text-[10px] text-slate-450 uppercase font-bold tracking-wider">
                        Sowing &amp; Sourcing Settlement Card
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => setSelectedFarmer(null)}
                    className="p-1.5 hover:bg-slate-150 rounded-lg text-slate-400 hover:text-slate-700 transition cursor-pointer"
                  >
                    <X size={16} />
                  </button>
                </div>

                {/* Body */}
                <div className="p-5 overflow-y-auto space-y-4 flex-1">
                  {/* Farmer profile stats */}
                  <div className="grid grid-cols-2 gap-2 bg-slate-50 border border-slate-150 rounded-xl p-3.5">
                    <div>
                      <span className="text-[9px] text-slate-400 uppercase font-bold block">Contact Number</span>
                      <strong className="text-slate-800 font-extrabold">{selectedFarmer.mobileNumber || "N/A"}</strong>
                    </div>
                    <div>
                      <span className="text-[9px] text-slate-400 uppercase font-bold block">Village Route</span>
                      <strong className="text-slate-800 font-extrabold">{selectedFarmer.villageName}</strong>
                    </div>
                    <div>
                      <span className="text-[9px] text-slate-400 uppercase font-bold block">Sown Plantation</span>
                      <strong className="text-slate-800 font-extrabold">{selectedFarmer.acres || 3} Acres</strong>
                    </div>
                    <div>
                      <span className="text-[9px] text-slate-400 uppercase font-bold block">Seed Variety Sown</span>
                      <strong className="text-slate-800 font-extrabold">{selectedFarmer.seedVariety || "Premium Variety"}</strong>
                    </div>
                  </div>

                  {/* Harvest Settlement Calculations */}
                  {payment ? (
                    <div className="space-y-2 border border-slate-150 rounded-xl p-4 bg-white">
                      <span className="text-[10px] text-slate-400 font-bold uppercase block tracking-wider mb-2">
                        Harvest Sourcing Net Payout Calculations
                      </span>
                      
                      <div className="flex justify-between">
                        <span className="text-slate-500 font-semibold">Total Sourced Weight:</span>
                        <strong className="text-slate-800 font-bold font-mono">{(Number(payment.weightKg) || 0).toLocaleString()} KG</strong>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500 font-semibold">Sourcing Rate per KG:</span>
                        <strong className="text-slate-800 font-bold font-mono">₹ {payment.pricePerKg}/KG</strong>
                      </div>
                      <div className="flex justify-between border-b pb-1.5 border-dashed">
                        <span className="text-slate-500 font-bold">Gross Sourcing Crop Cost:</span>
                        <strong className="text-slate-800 font-extrabold font-mono">₹ {(Number(payment.weightKg || 0) * Number(payment.pricePerKg || 0)).toLocaleString()}</strong>
                      </div>

                      <div className="flex justify-between text-rose-600">
                        <span>(-) Sowing Cash Advance:</span>
                        <span className="font-mono font-bold">- ₹ {(payment.advanceAmount || 0).toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between text-rose-600">
                        <span>(-) Sowing Advance Interest:</span>
                        <span className="font-mono font-bold">- ₹ {(payment.interest || 0).toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between text-rose-600">
                        <span>(-) Pesticide/Fertilizer outstanding:</span>
                        <span className="font-mono font-bold">- ₹ {(payment.pesticideDues || 0).toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between text-rose-600 border-b pb-1.5 border-dashed">
                        <span>(-) Loading &amp; Transportation (₹400/Ton):</span>
                        <span className="font-mono font-bold">- ₹ {Math.round(((Number(payment.weightKg) || 0) / 1000) * 400).toLocaleString()}</span>
                      </div>

                      <div className="flex justify-between pt-1 text-slate-900">
                        <span className="font-black text-xs uppercase text-brand-800">Net Payable Approved Payout:</span>
                        <strong className="text-sm font-black font-mono text-brand-700">
                          ₹ {(Math.round((Number(payment.weightKg || 0) * Number(payment.pricePerKg || 0)) - 
                            ((payment.advanceAmount || 0) + (payment.interest || 0) + (payment.pesticideDues || 0) + Math.round(((Number(payment.weightKg) || 0) / 1000) * 400)))).toLocaleString()}
                        </strong>
                      </div>
                    </div>
                  ) : (
                    <div className="p-4 text-center text-slate-400 font-semibold border border-dashed rounded-xl bg-slate-50">
                      No harvest crop yield has been logged for this farmer profile yet in active period.
                    </div>
                  )}
                </div>

                {/* Footer */}
                <div className="p-4 border-t bg-slate-50 flex items-center justify-end shrink-0">
                  <button
                    onClick={() => setSelectedFarmer(null)}
                    className="px-4 py-2 bg-slate-900 text-white rounded-xl font-bold cursor-pointer hover:bg-slate-800 transition text-xs"
                  >
                    Close Ledger
                  </button>
                </div>
              </div>
            </div>
          );
        })()}

        {/* MODAL 4: VILLAGE DETAILED PERFORMANCE ROSTER */}
        {selectedVillageDetail && (() => {
          const villageFarmers = enrolledFarmers.filter(f => f && f.villageName?.toLowerCase() === selectedVillageDetail.villageName?.toLowerCase());
          
          return (
            <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
              <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-xl w-full flex flex-col max-h-[90vh] overflow-hidden animate-in fade-in zoom-in-95 duration-200 text-xs">
                {/* Header */}
                <div className="p-4 border-b flex items-center justify-between bg-slate-50">
                  <div className="flex items-center gap-2">
                    <div className="p-2 bg-emerald-100 text-emerald-800 rounded-xl">
                      <MapPin size={18} />
                    </div>
                    <div>
                      <h3 className="text-sm font-black text-slate-900">
                        {selectedVillageDetail.villageName} Route
                      </h3>
                      <p className="text-[10px] text-slate-450 uppercase font-bold tracking-wider">
                        Geographical Territory &amp; Harvest Sourcing Performance
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => setSelectedVillageDetail(null)}
                    className="p-1.5 hover:bg-slate-150 rounded-lg text-slate-400 hover:text-slate-700 transition cursor-pointer"
                  >
                    <X size={16} />
                  </button>
                </div>

                {/* Body */}
                <div className="p-5 overflow-y-auto space-y-4 flex-1">
                  {/* Village stats overview */}
                  <div className="grid grid-cols-4 gap-2 bg-slate-50 border border-slate-150 rounded-xl p-3 text-center">
                    <div>
                      <span className="text-[9px] text-slate-400 uppercase font-bold block">Enrolled</span>
                      <strong className="text-slate-800 font-extrabold text-[11px] md:text-xs">{selectedVillageDetail.farmerCount} Farmers</strong>
                    </div>
                    <div>
                      <span className="text-[9px] text-slate-400 uppercase font-bold block">Plantation</span>
                      <strong className="text-slate-800 font-extrabold text-[11px] md:text-xs font-mono">{selectedVillageDetail.totalAcres} Acres</strong>
                    </div>
                    <div>
                      <span className="text-[9px] text-slate-400 uppercase font-bold block">Yield Tonnage</span>
                      <strong className="text-emerald-700 font-extrabold text-[11px] md:text-xs font-mono">{(selectedVillageDetail.totalYieldKg / 1000).toFixed(1)} Tons</strong>
                    </div>
                    <div>
                      <span className="text-[9px] text-blue-600 uppercase font-bold block">Total Advance</span>
                      <strong className="text-blue-700 font-extrabold text-[11px] md:text-xs font-mono">
                        ₹{(() => {
                          let totalAdv = 0;
                          villageFarmers.forEach(vf => {
                            const payment = (localFarmerPayments || []).find(p => p && p.farmerName?.toLowerCase() === vf.farmerName?.toLowerCase());
                            const advPayment = payment ? (Number(payment.advanceAmount) || 0) : 0;
                            const advReqs = (paymentRequests || []).filter(
                              pr => pr && pr.farmerName?.toLowerCase() === vf.farmerName?.toLowerCase() && 
                              (pr.status === "Approved" || pr.paid)
                            );
                            const advReq = advReqs.reduce((sum, pr) => sum + (Number(pr.amountProposed) || 0), 0);
                            totalAdv += Math.max(advPayment, advReq);
                          });
                          return totalAdv.toLocaleString();
                        })()}
                      </strong>
                    </div>
                  </div>

                  {/* Active Farmers List inside this Village */}
                  <div className="space-y-2">
                    <span className="text-[10px] text-slate-400 font-bold uppercase block tracking-wider px-1">
                      Active Route Farmer roster ({villageFarmers.length})
                    </span>

                    <div className="border border-slate-150 rounded-xl overflow-hidden bg-white max-h-52 overflow-y-auto divide-y divide-slate-100">
                      {villageFarmers.length === 0 ? (
                        <div className="p-4 text-center text-slate-400 font-medium">No enrolled farmers in this village.</div>
                      ) : (
                        villageFarmers.map((vf, idx) => {
                          const payment = (localFarmerPayments || []).find(p => p && p.farmerName?.toLowerCase() === vf.farmerName?.toLowerCase());
                          const advPayment = payment ? (Number(payment.advanceAmount) || 0) : 0;
                          
                          const advReqs = (paymentRequests || []).filter(
                            pr => pr && pr.farmerName?.toLowerCase() === vf.farmerName?.toLowerCase() && 
                            (pr.status === "Approved" || pr.paid)
                          );
                          const advReq = advReqs.reduce((sum, pr) => sum + (Number(pr.amountProposed) || 0), 0);
                          const farmerAdvance = Math.max(advPayment, advReq);

                          return (
                            <div key={idx} className="p-3 hover:bg-slate-50 flex justify-between items-center transition">
                              <div>
                                <strong className="text-slate-800 font-extrabold block text-xs">{vf.farmerName}</strong>
                                <span className="text-[10px] text-slate-450 block font-medium">
                                  Seed Sown: {vf.seedVariety || "Standard Sowing"} &bull; {vf.acres} Acres
                                </span>
                                {farmerAdvance > 0 && (
                                  <span className="inline-flex items-center gap-1 bg-blue-50 text-blue-700 text-[9.5px] font-extrabold px-1.5 py-0.5 rounded border border-blue-150 mt-1">
                                    Advance Taken: ₹{farmerAdvance.toLocaleString()}
                                  </span>
                                )}
                              </div>
                              <div className="text-right">
                                {payment ? (
                                  <span className="font-bold text-brand-700 block font-mono">{(Number(payment.weightKg) / 1000).toFixed(1)} Tons</span>
                                ) : (
                                  <span className="text-[9.5px] font-black text-blue-600 block bg-blue-50 px-1.5 py-0.5 rounded border border-blue-100">Sown Sowing</span>
                                )}
                              </div>
                            </div>
                          );
                        })
                      )}
                    </div>
                  </div>
                </div>

                {/* Footer */}
                <div className="p-4 border-t bg-slate-50 flex items-center justify-end shrink-0">
                  <button
                    onClick={() => setSelectedVillageDetail(null)}
                    className="px-4 py-2 bg-slate-900 text-white rounded-xl font-bold cursor-pointer hover:bg-slate-800 transition text-xs"
                  >
                    Close Roster
                  </button>
                </div>
              </div>
            </div>
          );
        })()}

        {/* MODAL 5: DETAILED EMPLOYEE PROFILE & scorecard */}
        {selectedEmployee && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-lg w-full flex flex-col max-h-[90vh] overflow-hidden animate-in fade-in zoom-in-95 duration-200 text-xs">
              {/* Header */}
              <div className="p-4 border-b flex items-center justify-between bg-slate-50">
                <div className="flex items-center gap-2">
                  <div className="p-2 bg-violet-100 text-violet-800 rounded-xl">
                    <UserCheck size={18} />
                  </div>
                  <div>
                    <h3 className="text-sm font-black text-slate-900">
                      {selectedEmployee.name}
                    </h3>
                    <p className="text-[10px] text-slate-450 uppercase font-bold tracking-wider">
                      Employee File &amp; Performance Ledger
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedEmployee(null)}
                  className="p-1.5 hover:bg-slate-150 rounded-lg text-slate-400 hover:text-slate-700 transition cursor-pointer"
                >
                  <X size={16} />
                </button>
              </div>

              {/* Body */}
              <div className="p-5 overflow-y-auto space-y-4 flex-1">
                {/* Employee Info Card */}
                <div className="grid grid-cols-2 gap-2 bg-slate-50 border border-slate-150 rounded-xl p-3.5">
                  <div>
                    <span className="text-[9px] text-slate-450 uppercase font-bold block mb-0.5">Designation Role</span>
                    <strong className="text-slate-800 font-extrabold">{selectedEmployee.designation || "Village Assistant"}</strong>
                  </div>
                  <div>
                    <span className="text-[9px] text-slate-450 uppercase font-bold block mb-0.5">Assigned Route</span>
                    <strong className="text-slate-800 font-extrabold">{selectedEmployee.villageName || "Not Assigned"}</strong>
                  </div>
                  <div>
                    <span className="text-[9px] text-slate-450 uppercase font-bold block mb-0.5">Contact Number</span>
                    <strong className="text-slate-800 font-extrabold">{selectedEmployee.mobileNumber || "N/A"}</strong>
                  </div>
                  <div>
                    <span className="text-[9px] text-slate-450 uppercase font-bold block mb-0.5">Salary Scale</span>
                    <strong className="text-slate-800 font-extrabold">₹ {(selectedEmployee.salaryAmount || 25000).toLocaleString()} / Month</strong>
                  </div>
                </div>

                {/* Operations scorecard details */}
                <div className="border border-slate-150 rounded-xl p-4 bg-white space-y-2.5">
                  <span className="text-[10px] text-slate-450 font-bold uppercase block tracking-wider">
                    Territory Operational Output Metrics
                  </span>
                  
                  <div className="flex justify-between">
                    <span className="text-slate-500 font-semibold">Managed Farmers:</span>
                    <strong className="text-slate-800 font-bold">{selectedEmployee.managedFarmersCount} enrolled farmers</strong>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500 font-semibold">Managed Plantation Area:</span>
                    <strong className="text-slate-800 font-bold font-mono">{selectedEmployee.managedAcres} Acres</strong>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500 font-semibold">Harvest Sourced:</span>
                    <strong className="text-emerald-700 font-bold font-mono">{(selectedEmployee.tonnageReceivedKg / 1000).toFixed(1)} Tons ({selectedEmployee.tonnageReceivedKg.toLocaleString()} KG)</strong>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500 font-semibold">Fertilizer dispatches handled:</span>
                    <strong className="text-slate-800 font-bold font-mono">{selectedEmployee.dispatchesBags} Bags inward</strong>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500 font-semibold">Direct-to-farmer distributions:</span>
                    <strong className="text-slate-800 font-bold font-mono">{selectedEmployee.distributionsBags} Bags outward</strong>
                  </div>
                </div>

                {/* Bank ledger info */}
                {selectedEmployee.bankName && (
                  <div className="bg-slate-50/70 border border-slate-150 rounded-xl p-3 text-[10px] text-slate-500 font-semibold space-y-1">
                    <span className="text-[9px] text-slate-400 uppercase font-bold block">🏦 Bank Account &amp; Payout Coordinates</span>
                    <div>Bank Name: <span className="text-slate-800">{selectedEmployee.bankName}</span></div>
                    <div>Account Number: <span className="text-slate-800">{selectedEmployee.bankAccountNo}</span></div>
                    <div>IFSC Code: <span className="text-slate-800">{selectedEmployee.bankIfscCode}</span></div>
                  </div>
                )}
              </div>

              {/* Footer */}
              <div className="p-4 border-t bg-slate-50 flex items-center justify-end shrink-0">
                <button
                  onClick={() => setSelectedEmployee(null)}
                  className="px-4 py-2 bg-slate-900 text-white rounded-xl font-bold cursor-pointer hover:bg-slate-800 transition text-xs"
                >
                  Close Profile
                </button>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
