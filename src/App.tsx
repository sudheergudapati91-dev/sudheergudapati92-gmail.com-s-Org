/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo } from "react";
import { ActiveRole, WarehouseStock, DispatchRecord, FarmerDistribution, SupplierBill, VillageStockStatus, AppNotification, TimelineEvent, ModificationRequest, PaymentRequest, AssistantUser, FertilizerOrderRequest, RateChangeRequest, FarmerChangeRequest, AdvanceChangeRequest, SalaryUnlockRequest } from "./types";
import {
  INITIAL_WAREHOUSE_STOCK,
  INITIAL_DISPATCH_RECORDS,
  INITIAL_FARMER_DISTRIBUTIONS,
  INITIAL_SUPPLIER_BILLS,
  INITIAL_VILLAGE_STOCK,
  INITIAL_NOTIFICATIONS,
  INITIAL_TIMELINE_EVENTS,
  INITIAL_MODIFICATION_REQUESTS,
  INITIAL_PAYMENT_REQUESTS,
  INITIAL_FERTILIZER_REQUESTS
} from "./data";
import { PhoneFrame } from "./components/PhoneFrame";
import { LoginView } from "./components/LoginView";
import { WarehouseManagerView } from "./components/WarehouseManagerView";
import { VillageAssistantView } from "./components/VillageAssistantView";
import { OwnerView } from "./components/OwnerView";
import { AccountantView } from "./components/AccountantView";
import { Bell, X, CheckSquare, ShieldCheck, Sparkles } from "lucide-react";

const DEFAULT_ASSISTANT_USERS: AssistantUser[] = [];

export default function App() {
  const [activeRole, setActiveRole] = useState<ActiveRole>("Login");
  const [loggedInAssistant, setLoggedInAssistant] = useState<AssistantUser | null>(null);
  const [assistantUsers, setAssistantUsers] = useState<AssistantUser[]>([]);

  // Local storage synchronized states
  const [stocks, setStocks] = useState<WarehouseStock[]>([]);
  const [dispatches, setDispatches] = useState<DispatchRecord[]>([]);
  const [farmerDistributions, setFarmerDistributions] = useState<FarmerDistribution[]>([]);
  const [supplierBills, setSupplierBills] = useState<SupplierBill[]>([]);
  const [villageStocks, setVillageStocks] = useState<VillageStockStatus[]>([]);
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [timelineEvents, setTimelineEvents] = useState<TimelineEvent[]>([]);
  const [modificationRequests, setModificationRequests] = useState<ModificationRequest[]>([]);
  const [paymentRequests, setPaymentRequests] = useState<PaymentRequest[]>([]);
  const [fertilizerRequests, setFertilizerRequests] = useState<FertilizerOrderRequest[]>([]);
  const [showNotificationDrawer, setShowNotificationDrawer] = useState(false);
  const [globalYear, setGlobalYear] = useState<string>(() => {
    return localStorage.getItem("ks_global_year") || "2026";
  });
  const [academicYears, setAcademicYears] = useState<string[]>(() => {
    const saved = localStorage.getItem("ks_academic_years");
    return saved ? JSON.parse(saved) : ["2026", "2025", "2024"];
  });
  const handleAddAcademicYear = (year: string) => {
    if (!academicYears.includes(year)) {
      const updated = [year, ...academicYears].sort((a, b) => Number(b) - Number(a));
      setAcademicYears(updated);
      localStorage.setItem("ks_academic_years", JSON.stringify(updated));
    }
  };
  const [fertilizerRates, setFertilizerRates] = useState<Record<string, number>>({
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
  });
  const [cropSourcingRates, setCropSourcingRates] = useState<Record<string, number>>({
    "Maize/Corn_Syngenta India_2026": 24.50,
    "Maize/Corn_Monsanto India_2026": 26.00,
    "Maize/Corn_Asha Bio-Seeds_2026": 23.50,
    "Maize/Corn_Syngenta India_2025": 22.00,
    "Maize/Corn_Monsanto India_2025": 23.50,
    "Maize/Corn_Asha Bio-Seeds_2025": 21.00,
    "Maize/Corn_Syngenta India_2024": 20.00,
    "Maize/Corn_Monsanto India_2024": 21.50,
    "Maize/Corn_Asha Bio-Seeds_2024": 19.50,
  });

  const [rateChangeRequests, setRateChangeRequests] = useState<RateChangeRequest[]>([]);
  const [farmerChangeRequests, setFarmerChangeRequests] = useState<FarmerChangeRequest[]>([]);
  const [advanceChangeRequests, setAdvanceChangeRequests] = useState<AdvanceChangeRequest[]>([]);
  const [salaryUnlockRequests, setSalaryUnlockRequests] = useState<SalaryUnlockRequest[]>([]);

  // Load state on mount
  useEffect(() => {
    // One-time automatic cleanup to wipe yesterday's presentation data so client starts completely fresh!
    const isWiped = localStorage.getItem("ks_fresh_client_db_clean_v11");
    if (!isWiped) {
      localStorage.clear();
      localStorage.setItem("ks_fresh_client_db_clean_v11", "true");
      window.location.reload();
      return;
    }

    const cachedStocks = localStorage.getItem("ks_stocks");
    const cachedDispatches = localStorage.getItem("ks_dispatches");
    const cachedFarmers = localStorage.getItem("ks_farmers");
    const cachedBills = localStorage.getItem("ks_bills");
    const cachedVillageStocks = localStorage.getItem("ks_village_stocks");
    const cachedNotifications = localStorage.getItem("ks_notifications");
    const cachedTimeline = localStorage.getItem("ks_timeline");
    const cachedMods = localStorage.getItem("ks_mods");
    const cachedPayRequests = localStorage.getItem("ks_pay_requests");
    const cachedAssistants = localStorage.getItem("ks_assistant_users");
    const cachedFertilizerRequests = localStorage.getItem("ks_fertilizer_requests");
    const cachedRates = localStorage.getItem("ks_fertilizer_rates");

    if (cachedStocks) setStocks(JSON.parse(cachedStocks));
    else setStocks(INITIAL_WAREHOUSE_STOCK);

    if (cachedDispatches) setDispatches(JSON.parse(cachedDispatches));
    else setDispatches(INITIAL_DISPATCH_RECORDS);

    if (cachedFarmers) setFarmerDistributions(JSON.parse(cachedFarmers));
    else setFarmerDistributions(INITIAL_FARMER_DISTRIBUTIONS);

    if (cachedBills) setSupplierBills(JSON.parse(cachedBills));
    else setSupplierBills(INITIAL_SUPPLIER_BILLS);

    if (cachedVillageStocks) setVillageStocks(JSON.parse(cachedVillageStocks));
    else setVillageStocks(INITIAL_VILLAGE_STOCK);

    if (cachedNotifications) setNotifications(JSON.parse(cachedNotifications));
    else setNotifications(INITIAL_NOTIFICATIONS);

    if (cachedTimeline) setTimelineEvents(JSON.parse(cachedTimeline));
    else setTimelineEvents(INITIAL_TIMELINE_EVENTS);

    if (cachedMods) setModificationRequests(JSON.parse(cachedMods));
    else setModificationRequests(INITIAL_MODIFICATION_REQUESTS);

    if (cachedPayRequests) setPaymentRequests(JSON.parse(cachedPayRequests));
    else setPaymentRequests(INITIAL_PAYMENT_REQUESTS);

    if (cachedAssistants) setAssistantUsers(JSON.parse(cachedAssistants));
    else setAssistantUsers(DEFAULT_ASSISTANT_USERS);

    if (cachedFertilizerRequests) setFertilizerRequests(JSON.parse(cachedFertilizerRequests));
    else setFertilizerRequests(INITIAL_FERTILIZER_REQUESTS);

    if (cachedRates) {
      setFertilizerRates(JSON.parse(cachedRates));
    }

    const cachedCropRates = localStorage.getItem("ks_crop_sourcing_rates");
    if (cachedCropRates) {
      try {
        setCropSourcingRates(JSON.parse(cachedCropRates));
      } catch (e) {
        console.error("Error parsing crop sourcing rates", e);
      }
    }

    const cachedRateRequests = localStorage.getItem("ks_rate_change_requests");
    if (cachedRateRequests) {
      try {
        setRateChangeRequests(JSON.parse(cachedRateRequests));
      } catch (e) {
        console.error("Error parsing rate change requests", e);
      }
    }

    const cachedFarmerRequests = localStorage.getItem("ks_farmer_change_requests");
    if (cachedFarmerRequests) {
      try {
        setFarmerChangeRequests(JSON.parse(cachedFarmerRequests));
      } catch (e) {
        console.error("Error parsing farmer change requests", e);
      }
    }

    const cachedAdvanceRequests = localStorage.getItem("ks_advance_change_requests");
    if (cachedAdvanceRequests) {
      try {
        setAdvanceChangeRequests(JSON.parse(cachedAdvanceRequests));
      } catch (e) {
        console.error("Error parsing advance change requests", e);
      }
    }

    const cachedSalaryRequests = localStorage.getItem("ks_salary_unlock_requests");
    if (cachedSalaryRequests) {
      try {
        setSalaryUnlockRequests(JSON.parse(cachedSalaryRequests));
      } catch (e) {
        console.error("Error parsing salary unlock requests", e);
      }
    }
  }, []);

  // Save changes to localStorage helper
  const saveState = (
    updatedStocks: WarehouseStock[],
    updatedDispatches: DispatchRecord[],
    updatedFarmers: FarmerDistribution[],
    updatedBills: SupplierBill[],
    updatedVillage: VillageStockStatus[],
    updatedNotifs: AppNotification[],
    updatedTimeline?: TimelineEvent[],
    updatedMods?: ModificationRequest[],
    updatedPayRequests?: PaymentRequest[]
  ) => {
    localStorage.setItem("ks_stocks", JSON.stringify(updatedStocks));
    localStorage.setItem("ks_dispatches", JSON.stringify(updatedDispatches));
    localStorage.setItem("ks_farmers", JSON.stringify(updatedFarmers));
    localStorage.setItem("ks_bills", JSON.stringify(updatedBills));
    localStorage.setItem("ks_village_stocks", JSON.stringify(updatedVillage));
    localStorage.setItem("ks_notifications", JSON.stringify(updatedNotifs));
    if (updatedTimeline) localStorage.setItem("ks_timeline", JSON.stringify(updatedTimeline));
    if (updatedMods) localStorage.setItem("ks_mods", JSON.stringify(updatedMods));
    if (updatedPayRequests) localStorage.setItem("ks_pay_requests", JSON.stringify(updatedPayRequests));
  };

  // State state-safe wrappers
  const updateStateSetters = (
    newStocks: WarehouseStock[],
    newDispatches: DispatchRecord[],
    newFarmers: FarmerDistribution[],
    newBills: SupplierBill[],
    newVillage: VillageStockStatus[],
    newNotifs: AppNotification[],
    newTimeline?: TimelineEvent[],
    newMods?: ModificationRequest[],
    newPayRequests?: PaymentRequest[]
  ) => {
    setStocks(newStocks);
    setDispatches(newDispatches);
    setFarmerDistributions(newFarmers);
    setSupplierBills(newBills);
    setVillageStocks(newVillage);
    setNotifications(newNotifs);
    
    let nextTimeline = newTimeline;
    if (newTimeline) {
      setTimelineEvents(newTimeline);
    } else {
      nextTimeline = timelineEvents;
    }

    let nextMods = newMods;
    if (newMods) {
      setModificationRequests(newMods);
    } else {
      nextMods = modificationRequests;
    }

    let nextPayRequests = newPayRequests;
    if (newPayRequests) {
      setPaymentRequests(newPayRequests);
    } else {
      nextPayRequests = paymentRequests;
    }

    saveState(newStocks, newDispatches, newFarmers, newBills, newVillage, newNotifs, nextTimeline, nextMods, nextPayRequests);
  };

  // CALLBACKS FOR INTERACTIVE WORKFLOWS

  // 1. Warehouse Stock Inward: update stocks & automatically create pending supplier bill
  const handleAddInwardStock = (stockOrStocks: Omit<WarehouseStock, "id"> | Omit<WarehouseStock, "id">[]) => {
    const stockItems = Array.isArray(stockOrStocks) ? stockOrStocks : [stockOrStocks];
    
    let currentStocks = [...stocks];
    let currentBills = [...supplierBills];
    let currentNotifs = [...notifications];
    
    stockItems.forEach((newStock, idx) => {
      const newStockId = `WS-${100 + currentStocks.length + 1}`;
      const formattedStock: WarehouseStock = {
        ...newStock,
        id: newStockId,
      };
      
      const newBillId = `B-${200 + currentBills.length + 1}`;
      const correspondingBill: SupplierBill = {
        id: newBillId,
        billNumber: newStock.invoiceNumber || `BILL/INW/${3000 + currentBills.length + 1}`,
        supplierName: newStock.supplierName,
        productName: newStock.productName,
        bagCount: newStock.bagCount,
        ratePerBag: newStock.ratePerBag,
        totalAmount: newStock.totalAmount,
        billDate: newStock.receivedDate,
        paymentStatus: "Pending",
        approvalStatus: "Pending Approval",
        notes: `Auto-generated upon inward stock delivery at main depot. Invoice No: ${newStock.invoiceNumber || "N/A"}.`,
      };
      
      const newNotif: AppNotification = {
        id: `N-${Date.now()}-${idx}-${Math.random().toString(36).substring(2, 6)}`,
        title: "Inward Shipment Received",
        message: `${newStock.bagCount} bags of ${newStock.productName} by ${newStock.supplierName} arrived at Main Depot.`,
        type: "stock",
        time: "Just now",
        isRead: false,
        role: "Accountant",
      };
      
      currentStocks.push(formattedStock);
      currentBills.push(correspondingBill);
      currentNotifs.unshift(newNotif);
    });
    
    updateStateSetters(
      currentStocks,
      dispatches,
      farmerDistributions,
      currentBills,
      villageStocks,
      currentNotifs
    );
  };

  // 2. Main Warehouse Dispatches stock to Village Assistant
  const handleAddDispatch = (newDispatchOrDispatches: Omit<DispatchRecord, "id" | "sourceWarehouse" | "status"> | Omit<DispatchRecord, "id" | "sourceWarehouse" | "status">[]) => {
    const dispatchItems = Array.isArray(newDispatchOrDispatches) ? newDispatchOrDispatches : [newDispatchOrDispatches];
    
    let currentDispatches = [...dispatches];
    let currentNotifs = [...notifications];
    
    dispatchItems.forEach((newDispatch, idx) => {
      const newDispatchId = `DIS-${100 + currentDispatches.length + 1}`;
      const formattedDispatch: DispatchRecord = {
        ...newDispatch,
        id: newDispatchId,
        sourceWarehouse: "Main Hub, Indore",
        status: "In-Transit",
      };
      
      const newNotif: AppNotification = {
        id: `N-${Date.now()}-${idx}-${Math.random().toString(36).substring(2, 6)}`,
        title: "New Dispatch Lot Sent",
        message: `${newDispatch.bagCount} bags of ${newDispatch.productName} sent to ${newDispatch.villageName}.`,
        type: "stock",
        time: "Just now",
        isRead: false,
        role: "Village Assistant",
      };
      
      currentDispatches.push(formattedDispatch);
      currentNotifs.unshift(newNotif);
    });

    updateStateSetters(
      stocks,
      currentDispatches,
      farmerDistributions,
      supplierBills,
      villageStocks,
      currentNotifs
    );
  };

  // 3. Village Assistant Acknowledges arriving Dispatch -> increases actual village stocks
  const handleAcknowledgeDispatch = (dispatchId: string, acknowledgedBy?: string) => {
    const now = new Date();
    const timeStr = now.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", hour12: true });
    const dateStr = now.toISOString().split("T")[0];

    const updatedDispatches = dispatches.map((d) => {
      if (d.id === dispatchId) {
        return { 
          ...d, 
          status: "Acknowledged" as const,
          acknowledgedBy: acknowledgedBy || d.assistantName || "Village Assistant",
          acknowledgedTime: timeStr,
          acknowledgedDate: dateStr
        };
      }
      return d;
    });

    const targetDispatch = dispatches.find((d) => d.id === dispatchId);
    let updatedVillage = [...villageStocks];

    if (targetDispatch) {
      const matchIdx = villageStocks.findIndex(
        (vs) =>
          vs.villageName === targetDispatch.villageName &&
          vs.productName === targetDispatch.productName
      );

      if (matchIdx !== -1) {
        updatedVillage = villageStocks.map((vs, idx) => {
          if (idx === matchIdx) {
            return {
              ...vs,
              totalReceived: vs.totalReceived + targetDispatch.bagCount,
              availableStock: vs.availableStock + targetDispatch.bagCount,
            };
          }
          return vs;
        });
      } else {
        // Add new record for that village & product
        updatedVillage.push({
          villageName: targetDispatch.villageName,
          assistantName: targetDispatch.assistantName,
          productName: targetDispatch.productName,
          totalReceived: targetDispatch.bagCount,
          totalDistributed: 0,
          availableStock: targetDispatch.bagCount,
        });
      }
    }

    const newNotif: AppNotification = {
      id: `N-${Date.now()}`,
      title: "Dispatch Accepted",
      message: `${acknowledgedBy || targetDispatch?.assistantName || "Assistant"} acknowledged receipt of ${targetDispatch?.bagCount} bags at ${targetDispatch?.villageName} on ${dateStr} at ${timeStr}.`,
      type: "stock",
      time: "Just now",
      isRead: false,
      role: "Warehouse Manager",
    };

    const timelineEntry: TimelineEvent = {
      id: `TL-ACK-${Date.now()}`,
      assistantName: acknowledgedBy || targetDispatch?.assistantName || "Village Assistant",
      villageName: targetDispatch?.villageName || "Local Center",
      actionType: "acknowledge",
      title: "Stock Lot Received",
      description: `Acknowledged and added ${targetDispatch?.bagCount} bags of ${targetDispatch?.productName} to physical stock.`,
      timestamp: timeStr,
      date: dateStr
    };

    updateStateSetters(
      stocks,
      updatedDispatches,
      farmerDistributions,
      supplierBills,
      updatedVillage,
      [newNotif, ...notifications],
      [timelineEntry, ...timelineEvents]
    );
  };

  // 4. Village Assistant issues to farmer -> decreases available village stocks
  const handleAddDistribution = (newDistInput: Omit<FarmerDistribution, "id" | "date"> | Omit<FarmerDistribution, "id" | "date">[]) => {
    const now = new Date();
    const timeStr = now.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", hour12: true });
    const dateStr = now.toISOString().split("T")[0];

    const distributionsToAdd: Omit<FarmerDistribution, "id" | "date">[] = Array.isArray(newDistInput) ? newDistInput : [newDistInput];

    if (distributionsToAdd.length === 0) return;

    let tempVillageStocks = [...villageStocks];
    let tempNotifications = [...notifications];
    let tempTimelineEvents = [...timelineEvents];
    let tempFarmerDistributions = [...farmerDistributions];

    distributionsToAdd.forEach((newDist, idx) => {
      const newDistId = `FD-${500 + tempFarmerDistributions.length + 1}`;
      const formattedDist: FarmerDistribution = {
        ...newDist,
        id: newDistId,
        date: dateStr,
      };

      // Decrease Village Stock
      tempVillageStocks = tempVillageStocks.map((v) => {
        if (
          v.villageName === newDist.villageName &&
          v.productName === newDist.productName
        ) {
          return {
            ...v,
            totalDistributed: v.totalDistributed + newDist.bagCount,
            availableStock: Math.max(0, v.availableStock - newDist.bagCount),
          };
        }
        return v;
      });

      const newNotif: AppNotification = {
        id: `N-${Date.now()}-${idx}`,
        title: "Farmer Sale Logged",
        message: `Issued ${newDist.bagCount} bags of ${newDist.productName} to farmer ${newDist.farmerName} in ${newDist.villageName}.`,
        type: "payment",
        time: "Just now",
        isRead: false,
        role: "Owner",
      };

      const timelineEntry: TimelineEvent = {
        id: `TL-DIST-${Date.now()}-${idx}`,
        assistantName: newDist.assistantName,
        villageName: newDist.villageName,
        actionType: "sale",
        title: "Distribution Invoice Logged",
        description: `Issued ${newDist.bagCount} bags of ${newDist.productName} to farmer ${newDist.farmerName} (Collected ₹${newDist.amountCollected.toLocaleString()}).`,
        timestamp: timeStr,
        date: dateStr
      };

      tempFarmerDistributions.push(formattedDist);
      tempNotifications.unshift(newNotif);
      tempTimelineEvents.unshift(timelineEntry);
    });

    updateStateSetters(
      stocks,
      dispatches,
      tempFarmerDistributions,
      supplierBills,
      tempVillageStocks,
      tempNotifications,
      tempTimelineEvents
    );
  };

  // 5. Village Assistant updates farmer dues
  const handleUpdateFarmerPayment = (id: string, addedAmountCollected: number) => {
    const now = new Date();
    const timeStr = now.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", hour12: true });
    const dateStr = now.toISOString().split("T")[0];

    const updatedFarmers = farmerDistributions.map((f) => {
      if (f.id === id) {
        const totalCollected = f.amountCollected + addedAmountCollected;
        const newBalance = Math.max(0, f.totalAmount - totalCollected);
        const newStatus =
          newBalance <= 0 ? "Paid" : totalCollected > 0 ? "Partial" : "Pending";
        return {
          ...f,
          amountCollected: totalCollected,
          balanceAmount: newBalance,
          paymentStatus: newStatus as typeof f.paymentStatus,
        };
      }
      return f;
    });

    const farmer = farmerDistributions.find((f) => f.id === id);
    const newNotif: AppNotification = {
      id: `N-${Date.now()}`,
      title: "Farmer Cash Deposited",
      message: `Received additional ₹${addedAmountCollected} from ${farmer?.farmerName || "Farmer"}.`,
      type: "payment",
      time: "Just now",
      isRead: false,
      role: "all",
    };

    const timelineEntry: TimelineEvent = {
      id: `TL-PAY-${Date.now()}`,
      assistantName: farmer?.assistantName || "Village Assistant",
      villageName: farmer?.villageName || "Local Center",
      actionType: "payment_update",
      title: "Farmer Cash Collected",
      description: `Farmer ${farmer?.farmerName} paid additional ₹${addedAmountCollected.toLocaleString()}. Balance is now ₹${Math.max(0, (farmer?.balanceAmount || 0) - addedAmountCollected).toLocaleString()}.`,
      timestamp: timeStr,
      date: dateStr
    };

    updateStateSetters(
      stocks,
      dispatches,
      updatedFarmers,
      supplierBills,
      villageStocks,
      [newNotif, ...notifications],
      [timelineEntry, ...timelineEvents]
    );
  };

  const handleSubmitPaymentRequest = (distributionId: string, amount: number, mode: "Cash" | "Online", notes: string) => {
    const now = new Date();
    const timeStr = now.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", hour12: true });
    const dateStr = now.toISOString().split("T")[0];

    const farmer = farmerDistributions.find(f => f.id === distributionId);
    if (!farmer) return;

    const newReq: PaymentRequest = {
      id: `PAY-${500 + paymentRequests.length + 1}`,
      distributionId,
      farmerName: farmer.farmerName,
      assistantName: farmer.assistantName,
      villageName: farmer.villageName,
      amountProposed: amount,
      paymentMode: mode,
      status: "Pending",
      dateRequested: dateStr,
      timeRequested: timeStr,
      notes: notes || `Direct ${mode} collection submitted by assistant.`
    };

    const newNotif: AppNotification = {
      id: `N-PAY-SUB-${Date.now()}`,
      title: "New Payment Slip Awaiting Acknowledgment",
      message: `Acknowledgment request created: ₹${amount} (${mode}) from ${farmer.farmerName} pending verification by accountant.`,
      type: "payment",
      time: "Just now",
      isRead: false,
      role: "Accountant"
    };

    const timelineEntry: TimelineEvent = {
      id: `TL-PAYSUB-${Date.now()}`,
      assistantName: farmer.assistantName,
      villageName: farmer.villageName,
      actionType: "payment_request",
      title: "Payment Slip Submitted to Accountant",
      description: `Assistant ${farmer.assistantName} logged ₹${amount.toLocaleString()} ${mode} collection for farmer ${farmer.farmerName}. Held in validation queue.`,
      timestamp: timeStr,
      date: dateStr
    };

    updateStateSetters(
      stocks,
      dispatches,
      farmerDistributions,
      supplierBills,
      villageStocks,
      [newNotif, ...notifications],
      [timelineEntry, ...timelineEvents],
      modificationRequests,
      [...paymentRequests, newReq]
    );
  };

  const handleApprovePaymentRequest = (id: string, accountantName: string) => {
    const now = new Date();
    const timeStr = now.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", hour12: true });
    const dateStr = now.toISOString().split("T")[0];

    const targetRequest = paymentRequests.find((r) => r.id === id);
    if (!targetRequest) return;

    const nextPayRequests = paymentRequests.map((r) => {
      if (r.id === id) {
        return {
          ...r,
          status: "Approved" as const,
          approvedBy: accountantName,
          approvedDate: dateStr
        };
      }
      return r;
    });

    const nextFarmers = farmerDistributions.map((f) => {
      if (f.id === targetRequest.distributionId) {
        const updatedCollected = f.amountCollected + targetRequest.amountProposed;
        const nextBalance = Math.max(0, f.totalAmount - updatedCollected);
        const nextStatus = updatedCollected >= f.totalAmount ? "Paid" : "Partial";
        return {
          ...f,
          amountCollected: updatedCollected,
          balanceAmount: nextBalance,
          paymentStatus: nextStatus as "Paid" | "Partial"
        };
      }
      return f;
    });

    const newNotif: AppNotification = {
      id: `N-PAY-APP-${Date.now()}`,
      title: "Field Payment Verified",
      message: `Verified and posted ₹${targetRequest.amountProposed} collection from farmer ${targetRequest.farmerName} in ${targetRequest.villageName}.`,
      type: "payment",
      time: "Just now",
      isRead: false,
      role: "all",
    };

    const timelineEntry: TimelineEvent = {
      id: `TL-PAYAPP-${Date.now()}`,
      assistantName: targetRequest.assistantName,
      villageName: targetRequest.villageName,
      actionType: "payment_approved",
      title: "Payment Slip Approved & Cleared",
      description: `Accountant approved payment ${targetRequest.id} for farmer ${targetRequest.farmerName} (Verified: ₹${targetRequest.amountProposed.toLocaleString()} via ${targetRequest.paymentMode}). Cash book posted.`,
      timestamp: timeStr,
      date: dateStr
    };

    updateStateSetters(
      stocks,
      dispatches,
      nextFarmers,
      supplierBills,
      villageStocks,
      [newNotif, ...notifications],
      [timelineEntry, ...timelineEvents],
      modificationRequests,
      nextPayRequests
    );
  };

  const handleRejectPaymentRequest = (id: string, accountantName: string) => {
    const now = new Date();
    const timeStr = now.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", hour12: true });
    const dateStr = now.toISOString().split("T")[0];

    const targetRequest = paymentRequests.find((r) => r.id === id);
    if (!targetRequest) return;

    const nextPayRequests = paymentRequests.map((r) => {
      if (r.id === id) {
        return {
          ...r,
          status: "Rejected" as const,
        };
      }
      return r;
    });

    const newNotif: AppNotification = {
      id: `N-PAY-REJ-${Date.now()}`,
      title: "Field Payment Audited & Flagged",
      message: `Accountant returned/flagged ₹${targetRequest.amountProposed} slip requested for farmer ${targetRequest.farmerName} at ${targetRequest.villageName}.`,
      type: "payment",
      time: "Just now",
      isRead: false,
      role: "Village Assistant",
    };

    const timelineEntry: TimelineEvent = {
      id: `TL-PAYREJ-${Date.now()}`,
      assistantName: targetRequest.assistantName,
      villageName: targetRequest.villageName,
      actionType: "payment_rejected",
      title: "Payment Slip Rejected/Flagged",
      description: `Accountant rejected/flagged payment ${targetRequest.id} for farmer ${targetRequest.farmerName} (₹${targetRequest.amountProposed.toLocaleString()} ${targetRequest.paymentMode} claim failed verification).`,
      timestamp: timeStr,
      date: dateStr
    };

    updateStateSetters(
      stocks,
      dispatches,
      farmerDistributions,
      supplierBills,
      villageStocks,
      [newNotif, ...notifications],
      [timelineEntry, ...timelineEvents],
      modificationRequests,
      nextPayRequests
    );
  };

  const handleSubmitModificationRequest = (newRequest: Omit<ModificationRequest, "id" | "status" | "dateRequested">) => {
    const newId = `MR-${300 + modificationRequests.length + 1}`;
    const formattedMod: ModificationRequest = {
      ...newRequest,
      id: newId,
      status: "Pending",
      dateRequested: new Date().toISOString().split("T")[0]
    };

    const newNotif: AppNotification = {
      id: `N-MOD-${Date.now()}`,
      title: "Data Correction Submitted",
      message: `${newRequest.assistantName} (${newRequest.villageName}) requested modification approval for farmer ${newRequest.farmerName}.`,
      type: "approval",
      time: "Just now",
      isRead: false,
      role: "Owner"
    };

    const now = new Date();
    const timeStr = now.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", hour12: true });
    const dateStr = now.toISOString().split("T")[0];
    const newTimelineEvent: TimelineEvent = {
      id: `TL-MOD-${Date.now()}`,
      assistantName: newRequest.assistantName,
      villageName: newRequest.villageName,
      actionType: "modification_request",
      title: "Correction Ticket Submitted",
      description: `Requested verification to modify ${newRequest.farmerName}'s ledger details. Justification: "${newRequest.justification}"`,
      timestamp: timeStr,
      date: dateStr
    };

    updateStateSetters(
      stocks,
      dispatches,
      farmerDistributions,
      supplierBills,
      villageStocks,
      [newNotif, ...notifications],
      [newTimelineEvent, ...timelineEvents],
      [...modificationRequests, formattedMod]
    );
  };

  const handleApproveModificationRequest = (reqId: string) => {
    const req = modificationRequests.find(m => m.id === reqId);
    if (!req) return;

    const updatedMods = modificationRequests.map(m => {
      if (m.id === reqId) {
        return { ...m, status: "Approved" as const };
      }
      return m;
    });

    let diffBags = 0;
    const updatedFarmers = farmerDistributions.map(fd => {
      if (fd.id === req.distributionId) {
        diffBags = req.requestedChanges.bagCount - fd.bagCount;
        return {
          ...fd,
          ...req.requestedChanges
        };
      }
      return fd;
    });

    const updatedVillage = villageStocks.map(vs => {
      if (vs.villageName === req.villageName && vs.productName === req.requestedChanges.productName) {
        return {
          ...vs,
          totalDistributed: vs.totalDistributed + diffBags,
          availableStock: Math.max(0, vs.availableStock - diffBags)
        };
      }
      return vs;
    });

    const newNotif: AppNotification = {
      id: `N-MODAPP-${Date.now()}`,
      title: "Correction Approved",
      message: `Owner approved modification MR-${reqId.split("-")[1] || reqId} for farmer ${req.farmerName}.`,
      type: "approval",
      time: "Just now",
      isRead: false,
      role: "all"
    };

    const now = new Date();
    const timeStr = now.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", hour12: true });
    const dateStr = now.toISOString().split("T")[0];
    const newTimelineEvent: TimelineEvent = {
      id: `TL-APP-${Date.now()}`,
      assistantName: req.assistantName,
      villageName: req.villageName,
      actionType: "modification_approved",
      title: "Correction Ticket Approved",
      description: `Owner approved ledger correction for ${req.farmerName}. Database synced successfully.`,
      timestamp: timeStr,
      date: dateStr
    };

    updateStateSetters(
      stocks,
      dispatches,
      updatedFarmers,
      supplierBills,
      updatedVillage,
      [newNotif, ...notifications],
      [newTimelineEvent, ...timelineEvents],
      updatedMods
    );
  };

  const handleRejectModificationRequest = (reqId: string) => {
    const req = modificationRequests.find(m => m.id === reqId);
    if (!req) return;

    const updatedMods = modificationRequests.map(m => {
      if (m.id === reqId) {
        return { ...m, status: "Rejected" as const };
      }
      return m;
    });

    const newNotif: AppNotification = {
      id: `N-MODREJ-${Date.now()}`,
      title: "Correction Rejected",
      message: `Owner rejected modification MR-${reqId.split("-")[1] || reqId} for farmer ${req.farmerName}.`,
      type: "approval",
      time: "Just now",
      isRead: false,
      role: "all"
    };

    const now = new Date();
    const timeStr = now.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", hour12: true });
    const dateStr = now.toISOString().split("T")[0];
    const newTimelineEvent: TimelineEvent = {
      id: `TL-REJ-${Date.now()}`,
      assistantName: req.assistantName,
      villageName: req.villageName,
      actionType: "modification_rejected",
      title: "Correction Ticket Declined",
      description: `Owner reviewed and decline the ledger update request for ${req.farmerName}.`,
      timestamp: timeStr,
      date: dateStr
    };

    updateStateSetters(
      stocks,
      dispatches,
      farmerDistributions,
      supplierBills,
      villageStocks,
      [newNotif, ...notifications],
      [newTimelineEvent, ...timelineEvents],
      updatedMods
    );
  };

  // 6. Owner Approves a Supplier invoice clearance request
  const handleApproveBill = (id: string) => {
    const updatedBills = supplierBills.map((b) => {
      if (b.id === id) {
        return { ...b, approvalStatus: "Approved" as const };
      }
      return b;
    });

    const bill = supplierBills.find((b) => b.id === id);
    const newNotif: AppNotification = {
      id: `N-${Date.now()}`,
      title: "Supplier Bill Approved",
      message: `Proprietor approved invoice clearance for ${bill?.supplierName} (₹${(bill?.totalAmount ?? 0).toLocaleString()}).`,
      type: "approval",
      time: "Just now",
      isRead: false,
      role: "Accountant",
    };

    updateStateSetters(
      stocks,
      dispatches,
      farmerDistributions,
      updatedBills,
      villageStocks,
      [newNotif, ...notifications]
    );
  };

  // 7. Owner templates for hold / reject
  const handleRejectBill = (id: string) => {
    const updatedBills = supplierBills.map((b) => {
      if (b.id === id) {
        return { ...b, approvalStatus: "Rejected" as const };
      }
      return b;
    });
    updateStateSetters(
      stocks,
      dispatches,
      farmerDistributions,
      updatedBills,
      villageStocks,
      notifications
    );
  };

  const handleHoldBill = (id: string) => {
    const updatedBills = supplierBills.map((b) => {
      if (b.id === id) {
        return { ...b, approvalStatus: "Hold" as const };
      }
      return b;
    });
    updateStateSetters(
      stocks,
      dispatches,
      farmerDistributions,
      updatedBills,
      villageStocks,
      notifications
    );
  };

  // 8. Accountant sends bill to Owner approval queue
  const handleResumeApprovalRequest = (billId: string, notes: string) => {
    const updatedBills = supplierBills.map((b) => {
      if (b.id === billId) {
        return {
          ...b,
          approvalStatus: "Pending Approval" as const,
          notes,
          requestedAt: new Date().toISOString().split("T")[0],
        };
      }
      return b;
    });

    const bill = supplierBills.find((b) => b.id === billId);
    const newNotif: AppNotification = {
      id: `N-${Date.now()}`,
      title: "Approval Request Submitted",
      message: `Accountant requested authorization on ${bill?.supplierName} invoice for ₹${(bill?.totalAmount ?? 0).toLocaleString()}.`,
      type: "approval",
      time: "Just now",
      isRead: false,
      role: "Owner",
    };

    updateStateSetters(
      stocks,
      dispatches,
      farmerDistributions,
      updatedBills,
      villageStocks,
      [newNotif, ...notifications]
    );
  };

  // 9. Accountant records actual payment disbursement after owner approval
  const handleUpdateSupplierPayment = (billId: string, amountPaid: number, markFull: boolean) => {
    const updatedBills = supplierBills.map((b) => {
      if (b.id === billId) {
        const newPaymentStatus = markFull ? ("Paid" as const) : ("Partial" as const);
        const newApprovalStatus = markFull ? ("Approved" as const) : b.approvalStatus;
        return {
          ...b,
          paymentStatus: newPaymentStatus,
          approvalStatus: newApprovalStatus,
          notes: markFull
            ? "Fully cleared."
            : `Paid installment of ₹${amountPaid.toLocaleString()}.`,
        };
      }
      return b;
    });

    const bill = supplierBills.find((b) => b.id === billId);
    const newNotif: AppNotification = {
      id: `N-${Date.now()}`,
      title: "Bank Outward Settled",
      message: `Disbursement of ₹${amountPaid.toLocaleString()} paid out to ${bill?.supplierName}.`,
      type: "payment",
      time: "Just now",
      isRead: false,
      role: "Owner",
    };

    updateStateSetters(
      stocks,
      dispatches,
      farmerDistributions,
      updatedBills,
      villageStocks,
      [newNotif, ...notifications]
    );
  };

  // Central updates for Accountant/Owner synchronized workflows
  const handleUpdatePaymentRequests = (updatedPayRequests: PaymentRequest[]) => {
    updateStateSetters(
      stocks,
      dispatches,
      farmerDistributions,
      supplierBills,
      villageStocks,
      notifications,
      timelineEvents,
      modificationRequests,
      updatedPayRequests
    );
  };

  const handleUpdateSupplierBills = (updatedBills: SupplierBill[]) => {
    updateStateSetters(
      stocks,
      dispatches,
      farmerDistributions,
      updatedBills,
      villageStocks,
      notifications,
      timelineEvents,
      modificationRequests,
      paymentRequests
    );
  };

  // 9.5 Fertilizer order requests
  const handleCreateFertilizerRequest = (newReq: Omit<FertilizerOrderRequest, "id" | "status" | "dateRequested">) => {
    const newId = `REQ-${300 + fertilizerRequests.length + 1}`;
    const dateStr = new Date().toISOString().split("T")[0];
    const created: FertilizerOrderRequest = {
      ...newReq,
      id: newId,
      status: "Pending",
      dateRequested: dateStr
    };
    const updated = [...fertilizerRequests, created];
    setFertilizerRequests(updated);
    localStorage.setItem("ks_fertilizer_requests", JSON.stringify(updated));

    // Also create a notification for the Warehouse Manager
    const newNotif: AppNotification = {
      id: `N-${Date.now()}`,
      title: "New Fertilizer Indent Request",
      message: `${newReq.assistantName} (${newReq.villageName}) requested ${newReq.bagCount} bags of ${newReq.productName}.`,
      type: "stock",
      time: "Just now",
      isRead: false,
      role: "Warehouse Manager"
    };
    const updatedNotifs = [newNotif, ...notifications];
    setNotifications(updatedNotifs);
    localStorage.setItem("ks_notifications", JSON.stringify(updatedNotifs));

    const timelineEntry: TimelineEvent = {
      id: `TL-REQ-${Date.now()}`,
      assistantName: newReq.assistantName,
      villageName: newReq.villageName,
      actionType: "modification_request",
      title: "Fertilizer Indent Raised",
      description: `Raised indent request for ${newReq.bagCount} bags of ${newReq.productName} from central warehouse.`,
      timestamp: new Date().toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", hour12: true }),
      date: dateStr
    };
    setTimelineEvents([timelineEntry, ...timelineEvents]);
    localStorage.setItem("ks_timeline", JSON.stringify([timelineEntry, ...timelineEvents]));
  };

  const handleUpdateFertilizerRequestStatus = (reqId: string, status: "Dispatched" | "Cancelled") => {
    const updated = fertilizerRequests.map(r => {
      if (r.id === reqId) {
        return { ...r, status };
      }
      return r;
    });
    setFertilizerRequests(updated);
    localStorage.setItem("ks_fertilizer_requests", JSON.stringify(updated));

    // Also update notification
    const req = fertilizerRequests.find(r => r.id === reqId);
    if (req) {
      const nowStr = new Date().toISOString().split("T")[0];
      const timeStr = new Date().toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", hour12: true });

      const newNotif: AppNotification = {
        id: `N-${Date.now()}`,
        title: status === "Dispatched" ? "Fertilizer Indent Dispatched" : "Indent Request Cancelled",
        message: status === "Dispatched"
          ? `Your indent for ${req.bagCount} bags of ${req.productName} has been dispatched to ${req.villageName} center.`
          : `Your indent for ${req.bagCount} bags of ${req.productName} was cancelled by warehouse manager.`,
        type: "stock",
        time: "Just now",
        isRead: false,
        role: "Village Assistant"
      };
      const updatedNotifs = [newNotif, ...notifications];
      setNotifications(updatedNotifs);
      localStorage.setItem("ks_notifications", JSON.stringify(updatedNotifs));

      const timelineEntry: TimelineEvent = {
        id: `TL-REQU-${Date.now()}`,
        assistantName: req.assistantName,
        villageName: req.villageName,
        actionType: status === "Dispatched" ? "modification_approved" : "modification_rejected",
        title: status === "Dispatched" ? "Indent Dispatched" : "Indent Cancelled",
        description: status === "Dispatched"
          ? `Central depot dispatched ${req.bagCount} bags of ${req.productName}.`
          : `Indent request for ${req.bagCount} bags of ${req.productName} was cancelled by central manager.`,
        timestamp: timeStr,
        date: nowStr
      };
      setTimelineEvents([timelineEntry, ...timelineEvents]);
      localStorage.setItem("ks_timeline", JSON.stringify([timelineEntry, ...timelineEvents]));
    }
  };

  // 10. Clear localStorage & reload default prototype sandbox parameters
  const handleResetData = () => {
    localStorage.clear();
    localStorage.setItem("ks_fresh_client_db_clean_v11", "true");
    window.location.reload();
  };

  // Notification badge logic
  const activeUnreadNotifs = notifications.filter(
    (n) => (n.role === activeRole || n.role === "all") && !n.isRead
  );

  // Derived village stocks dynamically calculated from dispatches and distributions of the selected year
  const derivedVillageStocks = useMemo(() => {
    const villageProducts: Record<string, { villageName: string; assistantName: string; productName: string; initialReceived: number; initialDistributed: number }> = {};

    // 1. Initialize from INITIAL_VILLAGE_STOCK
    INITIAL_VILLAGE_STOCK.forEach(vs => {
      const key = `${vs.villageName.toLowerCase()}_${vs.productName.toLowerCase()}`;
      villageProducts[key] = {
        villageName: vs.villageName,
        assistantName: vs.assistantName,
        productName: vs.productName,
        initialReceived: globalYear === "2026" ? vs.totalReceived : 0,
        initialDistributed: globalYear === "2026" ? vs.totalDistributed : 0,
      };
    });

    // 2. Add combinations from current dispatches and distributions
    dispatches.forEach(d => {
      const key = `${d.villageName.toLowerCase()}_${d.productName.toLowerCase()}`;
      if (!villageProducts[key]) {
        villageProducts[key] = {
          villageName: d.villageName,
          assistantName: d.assistantName,
          productName: d.productName,
          initialReceived: 0,
          initialDistributed: 0,
        };
      }
    });

    farmerDistributions.forEach(fd => {
      const key = `${fd.villageName.toLowerCase()}_${fd.productName.toLowerCase()}`;
      if (!villageProducts[key]) {
        villageProducts[key] = {
          villageName: fd.villageName,
          assistantName: fd.assistantName,
          productName: fd.productName,
          initialReceived: 0,
          initialDistributed: 0,
        };
      }
    });

    // 3. Compute dynamic sums for globalYear
    return Object.values(villageProducts).map(item => {
      const yearDispatches = dispatches.filter(d => 
        d.villageName.toLowerCase() === item.villageName.toLowerCase() &&
        d.productName.toLowerCase() === item.productName.toLowerCase() &&
        d.status === "Acknowledged" &&
        (!d.acknowledgedDate ? d.dispatchDate.startsWith(globalYear) : d.acknowledgedDate.startsWith(globalYear))
      );
      const yearDistributions = farmerDistributions.filter(fd => 
        fd.villageName.toLowerCase() === item.villageName.toLowerCase() &&
        fd.productName.toLowerCase() === item.productName.toLowerCase() &&
        fd.date.startsWith(globalYear)
      );

      const received = item.initialReceived + yearDispatches.reduce((sum, d) => sum + d.bagCount, 0);
      const distributed = item.initialDistributed + yearDistributions.reduce((sum, fd) => sum + fd.bagCount, 0);
      const available = Math.max(0, received - distributed);

      return {
        villageName: item.villageName,
        assistantName: item.assistantName,
        productName: item.productName,
        totalReceived: received,
        totalDistributed: distributed,
        availableStock: available
      };
    });
  }, [globalYear, dispatches, farmerDistributions]);

  const handleSubmitRateChangeRequest = (request: Omit<RateChangeRequest, "id" | "status" | "dateRequested">) => {
    const newRequest: RateChangeRequest = {
      ...request,
      id: `RC-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      status: "Pending",
      dateRequested: new Date().toISOString().split("T")[0]
    };
    const updated = [newRequest, ...rateChangeRequests];
    setRateChangeRequests(updated);
    localStorage.setItem("ks_rate_change_requests", JSON.stringify(updated));

    // Also send a notification to the Owner
    const newNotif: AppNotification = {
      id: `N-RC-${Date.now()}`,
      title: "Rate Change Request Sent",
      message: `Accountant requested rate update for ${request.cropOrProductName} (${request.companyOrMfrName}) to ₹${request.requestedRate}.`,
      type: "approval",
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      isRead: false,
      role: "Owner"
    };
    const updatedNotifs = [newNotif, ...notifications];
    setNotifications(updatedNotifs);
    localStorage.setItem("ks_notifications", JSON.stringify(updatedNotifs));
  };

  const handleApproveRateChangeRequest = (id: string) => {
    let target: RateChangeRequest | undefined;
    const updated = rateChangeRequests.map((r) => {
      if (r.id === id) {
        target = r;
        return { ...r, status: "Approved" as const };
      }
      return r;
    });

    if (target) {
      setRateChangeRequests(updated);
      localStorage.setItem("ks_rate_change_requests", JSON.stringify(updated));

      // Apply the change
      if (target.type === "seed") {
        const key = `${target.cropOrProductName}_${target.companyOrMfrName}_${target.year}`;
        if (target.action === "delete") {
          const newCropRates = { ...cropSourcingRates };
          delete newCropRates[key];
          setCropSourcingRates(newCropRates);
          localStorage.setItem("ks_crop_sourcing_rates", JSON.stringify(newCropRates));

          const cachedSeeds = localStorage.getItem("ks_seeds_registry_list");
          if (cachedSeeds) {
            try {
              const seeds = JSON.parse(cachedSeeds);
              const updatedSeeds = seeds.filter((s: any) => s.id !== target?.itemId && `${s.cropName}_${s.companyName}_${s.year}` !== key);
              localStorage.setItem("ks_seeds_registry_list", JSON.stringify(updatedSeeds));
            } catch (e) {
              console.error(e);
            }
          }
        } else {
          // Update
          const newCropRates = { ...cropSourcingRates, [key]: target.requestedRate };
          setCropSourcingRates(newCropRates);
          localStorage.setItem("ks_crop_sourcing_rates", JSON.stringify(newCropRates));

          const cachedSeeds = localStorage.getItem("ks_seeds_registry_list");
          if (cachedSeeds) {
            try {
              const seeds = JSON.parse(cachedSeeds);
              const updatedSeeds = seeds.map((s: any) => {
                if (s.id === target?.itemId || `${s.cropName}_${s.companyName}_${s.year}` === key) {
                  return { ...s, baseRatePerUnit: target?.requestedRate };
                }
                return s;
              });
              localStorage.setItem("ks_seeds_registry_list", JSON.stringify(updatedSeeds));
            } catch (e) {
              console.error(e);
            }
          }
        }
      } else {
        // Fertilizer
        if (target.action === "delete") {
          const newFertRates = { ...fertilizerRates };
          delete newFertRates[target.cropOrProductName];
          setFertilizerRates(newFertRates);
          localStorage.setItem("ks_fertilizer_rates", JSON.stringify(newFertRates));

          const cachedFerts = localStorage.getItem("ks_fertilizers_registry_list");
          if (cachedFerts) {
            try {
              const ferts = JSON.parse(cachedFerts);
              const updatedFerts = ferts.filter((f: any) => f.id !== target?.itemId && f.productName !== target?.cropOrProductName);
              localStorage.setItem("ks_fertilizers_registry_list", JSON.stringify(updatedFerts));
            } catch (e) {
              console.error(e);
            }
          }
        } else {
          // Update
          const newFertRates = { ...fertilizerRates, [target.cropOrProductName]: target.requestedRate };
          setFertilizerRates(newFertRates);
          localStorage.setItem("ks_fertilizer_rates", JSON.stringify(newFertRates));

          const cachedFerts = localStorage.getItem("ks_fertilizers_registry_list");
          if (cachedFerts) {
            try {
              const ferts = JSON.parse(cachedFerts);
              const updatedFerts = ferts.map((f: any) => {
                if (f.id === target?.itemId || f.productName === target?.cropOrProductName) {
                  return { ...f, ratePerUnit: target?.requestedRate };
                }
                return f;
              });
              localStorage.setItem("ks_fertilizers_registry_list", JSON.stringify(updatedFerts));
            } catch (e) {
              console.error(e);
            }
          }
        }
      }

      // Notification
      const newNotif: AppNotification = {
        id: `N-RC-A-${Date.now()}`,
        title: "Rate Request Approved",
        message: `Owner approved rate ${target.action === "delete" ? "deletion" : "update"} for ${target.cropOrProductName} to ₹${target.requestedRate}.`,
        type: "approval",
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        isRead: false,
        role: "Accountant"
      };
      const updatedNotifs = [newNotif, ...notifications];
      setNotifications(updatedNotifs);
      localStorage.setItem("ks_notifications", JSON.stringify(updatedNotifs));

      // Timeline event
      const newEvent: TimelineEvent = {
        id: `T-RC-A-${Date.now()}`,
        assistantName: "Owner",
        villageName: "Headquarters",
        actionType: "payment_approved",
        title: "Rate Registry Audit Update",
        description: `Proprietor authorized ${target.action === "delete" ? "removal of" : "new rate for"} ${target.cropOrProductName} (${target.companyOrMfrName}): ₹${target.requestedRate}.`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        date: new Date().toISOString().split("T")[0]
      };
      setTimelineEvents(prev => [newEvent, ...prev]);
    }
  };

  const handleRejectRateChangeRequest = (id: string) => {
    let target: RateChangeRequest | undefined;
    const updated = rateChangeRequests.map((r) => {
      if (r.id === id) {
        target = r;
        return { ...r, status: "Rejected" as const };
      }
      return r;
    });
    setRateChangeRequests(updated);
    localStorage.setItem("ks_rate_change_requests", JSON.stringify(updated));

    if (target) {
      // Notification
      const newNotif: AppNotification = {
        id: `N-RC-R-${Date.now()}`,
        title: "Rate Request Rejected",
        message: `Owner declined rate change for ${target.cropOrProductName}.`,
        type: "approval",
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        isRead: false,
        role: "Accountant"
      };
      const updatedNotifs = [newNotif, ...notifications];
      setNotifications(updatedNotifs);
      localStorage.setItem("ks_notifications", JSON.stringify(updatedNotifs));
    }
  };

  const handleSubmitFarmerChangeRequest = (request: Omit<FarmerChangeRequest, "id" | "status" | "dateRequested">) => {
    const newRequest: FarmerChangeRequest = {
      ...request,
      id: `FC-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      status: "Pending",
      dateRequested: new Date().toISOString().split("T")[0]
    };
    const updated = [newRequest, ...farmerChangeRequests];
    setFarmerChangeRequests(updated);
    localStorage.setItem("ks_farmer_change_requests", JSON.stringify(updated));

    // Send a notification to the Owner
    const newNotif: AppNotification = {
      id: `N-FC-${Date.now()}`,
      title: "Farmer Registry Correction Sent",
      message: `${request.assistantName} (${request.villageName}) requested ${request.action} approval for enrolled farmer ${request.farmerName}.`,
      type: "approval",
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      isRead: false,
      role: "Owner"
    };
    const updatedNotifs = [newNotif, ...notifications];
    setNotifications(updatedNotifs);
    localStorage.setItem("ks_notifications", JSON.stringify(updatedNotifs));
  };

  const handleApproveFarmerChangeRequest = (id: string) => {
    let target: FarmerChangeRequest | undefined;
    const updatedRequests = farmerChangeRequests.map((r) => {
      if (r.id === id) {
        target = r;
        return { ...r, status: "Approved" as const };
      }
      return r;
    });

    if (target) {
      setFarmerChangeRequests(updatedRequests);
      localStorage.setItem("ks_farmer_change_requests", JSON.stringify(updatedRequests));

      // Apply the change to enrolled farmers list
      const cachedFarmers = localStorage.getItem("enrolled_farmers");
      if (cachedFarmers) {
        try {
          const farmers = JSON.parse(cachedFarmers);
          let updatedFarmers;
          if (target.action === "delete") {
            updatedFarmers = farmers.filter((f: any) => f.id !== target?.farmerId);
          } else {
            updatedFarmers = farmers.map((f: any) => {
              if (f.id === target?.farmerId) {
                return { ...f, ...target?.requestedChanges };
              }
              return f;
            });
          }
          localStorage.setItem("enrolled_farmers", JSON.stringify(updatedFarmers));
        } catch (e) {
          console.error(e);
        }
      }

      // Notification
      const newNotif: AppNotification = {
        id: `N-FC-APP-${Date.now()}`,
        title: "Farmer Registry Correction Approved",
        message: `Proprietor approved registry ${target.action} request for ${target.farmerName}.`,
        type: "approval",
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        isRead: false,
        role: "all"
      };
      setNotifications([newNotif, ...notifications]);
    }
  };

  const handleRejectFarmerChangeRequest = (id: string) => {
    const updatedRequests = farmerChangeRequests.map((r) => {
      if (r.id === id) {
        return { ...r, status: "Rejected" as const };
      }
      return r;
    });
    setFarmerChangeRequests(updatedRequests);
    localStorage.setItem("ks_farmer_change_requests", JSON.stringify(updatedRequests));
  };

  const handleSubmitAdvanceChangeRequest = (request: Omit<AdvanceChangeRequest, "id" | "status" | "dateRequested">) => {
    const newRequest: AdvanceChangeRequest = {
      ...request,
      id: `AC-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      status: "Pending",
      dateRequested: new Date().toISOString().split("T")[0]
    };
    const updated = [newRequest, ...advanceChangeRequests];
    setAdvanceChangeRequests(updated);
    localStorage.setItem("ks_advance_change_requests", JSON.stringify(updated));

    // Send a notification to the Owner
    const newNotif: AppNotification = {
      id: `N-AC-${Date.now()}`,
      title: "Advance Request Correction Sent",
      message: `${request.assistantName} (${request.villageName}) requested ${request.action} for advance request ${request.requestId} (Farmer: ${request.farmerName}).`,
      type: "approval",
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      isRead: false,
      role: "Owner"
    };
    const updatedNotifs = [newNotif, ...notifications];
    setNotifications(updatedNotifs);
    localStorage.setItem("ks_notifications", JSON.stringify(updatedNotifs));
  };

  const handleApproveAdvanceChangeRequest = (id: string) => {
    let target: AdvanceChangeRequest | undefined;
    const updatedRequests = advanceChangeRequests.map((r) => {
      if (r.id === id) {
        target = r;
        return { ...r, status: "Approved" as const };
      }
      return r;
    });

    if (target) {
      setAdvanceChangeRequests(updatedRequests);
      localStorage.setItem("ks_advance_change_requests", JSON.stringify(updatedRequests));

      // Apply the change to paymentRequests (Advances) list
      const nextPayRequests = paymentRequests.map((pr) => {
        if (pr.id === target?.requestId) {
          if (target.action === "delete") {
            return { ...pr, status: "Rejected" as const, notes: "Request Deleted by Owner Sign-off" };
          } else {
            return {
              ...pr,
              amountProposed: target.requestedAmount ?? pr.amountProposed,
              paymentMode: target.requestedMode ?? pr.paymentMode,
              notes: target.requestedNotes ?? pr.notes,
            };
          }
        }
        return pr;
      });

      const finalPayRequests = target.action === "delete"
        ? paymentRequests.filter(pr => pr.id !== target?.requestId)
        : nextPayRequests;

      setPaymentRequests(finalPayRequests);
      localStorage.setItem("ks_pay_requests", JSON.stringify(finalPayRequests));

      // Notification
      const newNotif: AppNotification = {
        id: `N-AC-APP-${Date.now()}`,
        title: "Advance Request Correction Approved",
        message: `Proprietor approved advance correction (${target.action}) for ${target.farmerName}.`,
        type: "approval",
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        isRead: false,
        role: "all"
      };
      setNotifications([newNotif, ...notifications]);
    }
  };

  const handleRejectAdvanceChangeRequest = (id: string) => {
    const updatedRequests = advanceChangeRequests.map((r) => {
      if (r.id === id) {
        return { ...r, status: "Rejected" as const };
      }
      return r;
    });
    setAdvanceChangeRequests(updatedRequests);
    localStorage.setItem("ks_advance_change_requests", JSON.stringify(updatedRequests));
  };

  const handleSubmitSalaryUnlockRequest = (request: Omit<SalaryUnlockRequest, "id" | "status" | "dateRequested">) => {
    const newRequest: SalaryUnlockRequest = {
      ...request,
      id: `SU-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      status: "Pending",
      dateRequested: new Date().toISOString().split("T")[0]
    };
    const updated = [newRequest, ...salaryUnlockRequests];
    setSalaryUnlockRequests(updated);
    localStorage.setItem("ks_salary_unlock_requests", JSON.stringify(updated));

    const newNotif: AppNotification = {
      id: `NOTIF-SU-${Date.now()}`,
      title: "Salary Unlock Requested",
      message: `Accountant requested salary scale unlock for ${request.staffName} (${request.designation}).`,
      type: "approval",
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      isRead: false,
      role: "Owner"
    };
    setNotifications([newNotif, ...notifications]);
    localStorage.setItem("ks_notifications", JSON.stringify([newNotif, ...notifications]));
  };

  const handleApproveSalaryUnlockRequest = (id: string) => {
    let target: SalaryUnlockRequest | undefined;
    const updatedRequests = salaryUnlockRequests.map((r) => {
      if (r.id === id) {
        target = r;
        return { ...r, status: "Approved" as const };
      }
      return r;
    });
    setSalaryUnlockRequests(updatedRequests);
    localStorage.setItem("ks_salary_unlock_requests", JSON.stringify(updatedRequests));

    if (target) {
      const updatedAssistants = assistantUsers.map((u) => {
        if (u.mobileNumber === target?.staffMobile) {
          return { ...u, salaryLocked: false };
        }
        return u;
      });
      setAssistantUsers(updatedAssistants);
      localStorage.setItem("ks_assistant_users", JSON.stringify(updatedAssistants));

      const newNotif: AppNotification = {
        id: `NOTIF-SU-APP-${Date.now()}`,
        title: "Salary Unlock Approved",
        message: `Proprietor approved salary scale unlock for ${target.staffName}.`,
        type: "approval",
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        isRead: false,
        role: "Accountant"
      };
      setNotifications([newNotif, ...notifications]);
      localStorage.setItem("ks_notifications", JSON.stringify([newNotif, ...notifications]));
    }
  };

  const handleRejectSalaryUnlockRequest = (id: string) => {
    let target: SalaryUnlockRequest | undefined;
    const updatedRequests = salaryUnlockRequests.map((r) => {
      if (r.id === id) {
        target = r;
        return { ...r, status: "Rejected" as const };
      }
      return r;
    });
    setSalaryUnlockRequests(updatedRequests);
    localStorage.setItem("ks_salary_unlock_requests", JSON.stringify(updatedRequests));

    if (target) {
      const newNotif: AppNotification = {
        id: `NOTIF-SU-REJ-${Date.now()}`,
        title: "Salary Unlock Rejected",
        message: `Proprietor rejected salary scale unlock for ${target.staffName}.`,
        type: "approval",
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        isRead: false,
        role: "Accountant"
      };
      setNotifications([newNotif, ...notifications]);
      localStorage.setItem("ks_notifications", JSON.stringify([newNotif, ...notifications]));
    }
  };

  // --- BULK ACTION HANDLERS ---
  const handleBulkApproveBills = (ids: string[]) => {
    const updatedBills = supplierBills.map((b) => {
      if (ids.includes(b.id)) {
        return { ...b, approvalStatus: "Approved" as const };
      }
      return b;
    });

    const approvedBills = supplierBills.filter(b => ids.includes(b.id));
    const newNotifs = approvedBills.map(bill => ({
      id: `N-BULKAPP-${bill.id}-${Date.now()}`,
      title: "Supplier Bill Approved",
      message: `Proprietor approved invoice clearance for ${bill.supplierName} (₹${(bill.totalAmount ?? 0).toLocaleString()}).`,
      type: "approval" as const,
      time: "Just now",
      isRead: false,
      role: "Accountant" as const,
    }));

    updateStateSetters(
      stocks,
      dispatches,
      farmerDistributions,
      updatedBills,
      villageStocks,
      [...newNotifs, ...notifications]
    );
  };

  const handleBulkRejectBills = (ids: string[]) => {
    const updatedBills = supplierBills.map((b) => {
      if (ids.includes(b.id)) {
        return { ...b, approvalStatus: "Rejected" as const };
      }
      return b;
    });

    const rejectedBills = supplierBills.filter(b => ids.includes(b.id));
    const newNotifs = rejectedBills.map(bill => ({
      id: `N-BULKREJ-${bill.id}-${Date.now()}`,
      title: "Supplier Bill Rejected",
      message: `Proprietor rejected/flagged invoice clearance for ${bill.supplierName} (₹${(bill.totalAmount ?? 0).toLocaleString()}).`,
      type: "approval" as const,
      time: "Just now",
      isRead: false,
      role: "Accountant" as const,
    }));

    updateStateSetters(
      stocks,
      dispatches,
      farmerDistributions,
      updatedBills,
      villageStocks,
      [...newNotifs, ...notifications]
    );
  };

  const handleBulkApproveModifications = (ids: string[]) => {
    let tempFarmers = [...farmerDistributions];
    let tempVillage = [...villageStocks];
    let tempNotifs = [...notifications];
    let tempTimeline = [...timelineEvents];

    const updatedMods = modificationRequests.map(m => {
      if (ids.includes(m.id) && m.status === "Pending") {
        let diffBags = 0;
        tempFarmers = tempFarmers.map(fd => {
          if (fd.id === m.distributionId) {
            diffBags = m.requestedChanges.bagCount - fd.bagCount;
            return {
              ...fd,
              ...m.requestedChanges
            };
          }
          return fd;
        });

        if (diffBags !== 0) {
          tempVillage = tempVillage.map(vs => {
            if (vs.villageName === m.villageName && vs.productName === m.requestedChanges.productName) {
              return {
                ...vs,
                totalDistributed: vs.totalDistributed + diffBags,
                availableStock: Math.max(0, vs.availableStock - diffBags)
              };
            }
            return vs;
          });
        }

        const newNotif = {
          id: `N-MODAPP-${m.id}-${Date.now()}`,
          title: "Correction Approved",
          message: `Owner approved modification MR-${m.id.split("-")[1] || m.id} for farmer ${m.farmerName}.`,
          type: "approval" as const,
          time: "Just now",
          isRead: false,
          role: "all" as const
        };
        tempNotifs.unshift(newNotif);

        const now = new Date();
        const timeStr = now.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", hour12: true });
        const dateStr = now.toISOString().split("T")[0];
        const newTimelineEvent = {
          id: `TL-APP-${m.id}-${Date.now()}`,
          assistantName: m.assistantName,
          villageName: m.villageName,
          actionType: "modification_approved" as const,
          title: "Correction Ticket Approved",
          description: `Owner approved ledger correction for ${m.farmerName}. Database synced successfully.`,
          timestamp: timeStr,
          date: dateStr
        };
        tempTimeline.unshift(newTimelineEvent);

        return { ...m, status: "Approved" as const };
      }
      return m;
    });

    updateStateSetters(
      stocks,
      dispatches,
      tempFarmers,
      supplierBills,
      tempVillage,
      tempNotifs,
      tempTimeline,
      updatedMods
    );
  };

  const handleBulkRejectModifications = (ids: string[]) => {
    let tempNotifs = [...notifications];
    let tempTimeline = [...timelineEvents];

    const updatedMods = modificationRequests.map(m => {
      if (ids.includes(m.id) && m.status === "Pending") {
        const newNotif = {
          id: `N-MODREJ-${m.id}-${Date.now()}`,
          title: "Correction Rejected",
          message: `Owner rejected modification MR-${m.id.split("-")[1] || m.id} for farmer ${m.farmerName}.`,
          type: "approval" as const,
          time: "Just now",
          isRead: false,
          role: "all" as const
        };
        tempNotifs.unshift(newNotif);

        const now = new Date();
        const timeStr = now.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", hour12: true });
        const dateStr = now.toISOString().split("T")[0];
        const newTimelineEvent = {
          id: `TL-REJ-${m.id}-${Date.now()}`,
          assistantName: m.assistantName,
          villageName: m.villageName,
          actionType: "modification_rejected" as const,
          title: "Correction Ticket Declined",
          description: `Owner reviewed and decline the ledger update request for ${m.farmerName}.`,
          timestamp: timeStr,
          date: dateStr
        };
        tempTimeline.unshift(newTimelineEvent);

        return { ...m, status: "Rejected" as const };
      }
      return m;
    });

    updateStateSetters(
      stocks,
      dispatches,
      farmerDistributions,
      supplierBills,
      villageStocks,
      tempNotifs,
      tempTimeline,
      updatedMods
    );
  };

  const handleBulkApproveRateChanges = (ids: string[]) => {
    let tempRateRequests = [...rateChangeRequests];
    let tempCropRates = { ...cropSourcingRates };
    let tempFertRates = { ...fertilizerRates };
    let tempNotifs = [...notifications];
    let tempTimeline = [...timelineEvents];

    let seedsListUpdated = false;
    let fertsListUpdated = false;
    let cachedSeeds = localStorage.getItem("ks_seeds_registry_list");
    let cachedFerts = localStorage.getItem("ks_fertilizers_registry_list");
    let seeds = cachedSeeds ? JSON.parse(cachedSeeds) : [];
    let ferts = cachedFerts ? JSON.parse(cachedFerts) : [];

    const updated = rateChangeRequests.map((r) => {
      if (ids.includes(r.id) && r.status === "Pending") {
        const target = r;
        
        if (target.type === "seed") {
          const key = `${target.cropOrProductName}_${target.companyOrMfrName}_${target.year}`;
          if (target.action === "delete") {
            delete tempCropRates[key];
            seeds = seeds.filter((s: any) => s.id !== target.itemId && `${s.cropName}_${s.companyName}_${s.year}` !== key);
            seedsListUpdated = true;
          } else {
            tempCropRates[key] = target.requestedRate;
            seeds = seeds.map((s: any) => {
              if (s.id === target.itemId || `${s.cropName}_${s.companyName}_${s.year}` === key) {
                return { ...s, baseRatePerUnit: target.requestedRate };
              }
              return s;
            });
            seedsListUpdated = true;
          }
        } else {
          // Fertilizer
          if (target.action === "delete") {
            delete tempFertRates[target.cropOrProductName];
            ferts = ferts.filter((f: any) => f.id !== target.itemId && f.productName !== target.cropOrProductName);
            fertsListUpdated = true;
          } else {
            tempFertRates[target.cropOrProductName] = target.requestedRate;
            ferts = ferts.map((f: any) => {
              if (f.id === target.itemId || f.productName === target.cropOrProductName) {
                return { ...f, ratePerUnit: target.requestedRate };
              }
              return f;
            });
            fertsListUpdated = true;
          }
        }

        // Add Notification
        const newNotif = {
          id: `N-RC-A-${r.id}-${Date.now()}`,
          title: "Rate Request Approved",
          message: `Owner approved rate ${target.action === "delete" ? "deletion" : "update"} for ${target.cropOrProductName} to ₹${target.requestedRate}.`,
          type: "approval" as const,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          isRead: false,
          role: "Accountant" as const
        };
        tempNotifs.unshift(newNotif);

        // Add Timeline event
        const newEvent = {
          id: `T-RC-A-${r.id}-${Date.now()}`,
          assistantName: "Owner",
          villageName: "Headquarters",
          actionType: "payment_approved" as const,
          title: "Rate Registry Audit Update",
          description: `Proprietor authorized ${target.action === "delete" ? "removal of" : "new rate for"} ${target.cropOrProductName} (${target.companyOrMfrName}): ₹${target.requestedRate}.`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          date: new Date().toISOString().split("T")[0]
        };
        tempTimeline.unshift(newEvent);

        return { ...r, status: "Approved" as const };
      }
      return r;
    });

    setRateChangeRequests(updated);
    localStorage.setItem("ks_rate_change_requests", JSON.stringify(updated));

    setCropSourcingRates(tempCropRates);
    localStorage.setItem("ks_crop_sourcing_rates", JSON.stringify(tempCropRates));

    setFertilizerRates(tempFertRates);
    localStorage.setItem("ks_fertilizer_rates", JSON.stringify(tempFertRates));

    if (seedsListUpdated) {
      localStorage.setItem("ks_seeds_registry_list", JSON.stringify(seeds));
    }
    if (fertsListUpdated) {
      localStorage.setItem("ks_fertilizers_registry_list", JSON.stringify(ferts));
    }

    setNotifications(tempNotifs);
    localStorage.setItem("ks_notifications", JSON.stringify(tempNotifs));
    setTimelineEvents(tempTimeline);
  };

  const handleBulkRejectRateChanges = (ids: string[]) => {
    let tempNotifs = [...notifications];
    const updated = rateChangeRequests.map((r) => {
      if (ids.includes(r.id) && r.status === "Pending") {
        const newNotif = {
          id: `N-RC-R-${r.id}-${Date.now()}`,
          title: "Rate Request Rejected",
          message: `Owner declined rate change for ${r.cropOrProductName}.`,
          type: "approval" as const,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          isRead: false,
          role: "Accountant" as const
        };
        tempNotifs.unshift(newNotif);
        return { ...r, status: "Rejected" as const };
      }
      return r;
    });
    setRateChangeRequests(updated);
    localStorage.setItem("ks_rate_change_requests", JSON.stringify(updated));
    setNotifications(tempNotifs);
    localStorage.setItem("ks_notifications", JSON.stringify(tempNotifs));
  };

  const handleBulkApproveFarmerChanges = (ids: string[]) => {
    let tempNotifs = [...notifications];
    const updated = farmerChangeRequests.map((r) => {
      if (ids.includes(r.id) && r.status === "Pending") {
        const target = r;
        
        // Apply the farmer registry changes to local storage list
        const cachedFarmersList = localStorage.getItem("ks_farmers_list");
        if (cachedFarmersList) {
          try {
            const list = JSON.parse(cachedFarmersList);
            if (target.action === "add") {
              const newFarmerObj = {
                id: target.farmerId || `FARMER-${Date.now()}`,
                name: target.farmerName,
                village: target.villageName,
                acres: target.acres,
                mobile: target.mobileNumber,
                accountNumber: target.accountNumber || "—",
                bankName: "State Bank of India",
                ifscCode: "SBIN0001234"
              };
              list.push(newFarmerObj);
            } else if (target.action === "edit") {
              const idx = list.findIndex((f: any) => f.id === target.farmerId);
              if (idx !== -1) {
                list[idx] = {
                  ...list[idx],
                  name: target.farmerName,
                  village: target.villageName,
                  acres: target.acres,
                  mobile: target.mobileNumber,
                  accountNumber: target.accountNumber || list[idx].accountNumber
                };
              }
            } else if (target.action === "delete") {
              const updatedList = list.filter((f: any) => f.id !== target.farmerId);
              localStorage.setItem("ks_farmers_list", JSON.stringify(updatedList));
            }
            if (target.action !== "delete") {
              localStorage.setItem("ks_farmers_list", JSON.stringify(list));
            }
          } catch (e) {
            console.error(e);
          }
        }

        const newNotif = {
          id: `N-FC-A-${r.id}-${Date.now()}`,
          title: "Farmer Profile Approved",
          message: `Owner approved farmer registry ${target.action} for ${target.farmerName}.`,
          type: "approval" as const,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          isRead: false,
          role: "all" as const
        };
        tempNotifs.unshift(newNotif);

        return { ...r, status: "Approved" as const };
      }
      return r;
    });

    setFarmerChangeRequests(updated);
    localStorage.setItem("ks_farmer_change_requests", JSON.stringify(updated));
    setNotifications(tempNotifs);
    localStorage.setItem("ks_notifications", JSON.stringify(tempNotifs));
  };

  const handleBulkRejectFarmerChanges = (ids: string[]) => {
    let tempNotifs = [...notifications];
    const updated = farmerChangeRequests.map((r) => {
      if (ids.includes(r.id) && r.status === "Pending") {
        const newNotif = {
          id: `N-FC-R-${r.id}-${Date.now()}`,
          title: "Farmer Profile Request Declined",
          message: `Owner declined farmer registry ${r.action} request for ${r.farmerName}.`,
          type: "approval" as const,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          isRead: false,
          role: "all" as const
        };
        tempNotifs.unshift(newNotif);
        return { ...r, status: "Rejected" as const };
      }
      return r;
    });
    setFarmerChangeRequests(updated);
    localStorage.setItem("ks_farmer_change_requests", JSON.stringify(updated));
    setNotifications(tempNotifs);
    localStorage.setItem("ks_notifications", JSON.stringify(tempNotifs));
  };

  const handleBulkApproveAdvanceChanges = (ids: string[]) => {
    let tempNotifs = [...notifications];
    let tempPayRequests = [...paymentRequests];

    const updated = advanceChangeRequests.map((r) => {
      if (ids.includes(r.id) && r.status === "Pending") {
        const target = r;

        if (target.action === "delete") {
          tempPayRequests = tempPayRequests.filter((pr) => pr.id !== target.requestId);
        } else if (target.action === "edit") {
          tempPayRequests = tempPayRequests.map((pr) => {
            if (pr.id === target.requestId) {
              return {
                ...pr,
                amount: target.requestedAmount ?? pr.amount,
                paymentMode: target.requestedMode ?? pr.paymentMode,
                notes: target.requestedNotes ?? pr.notes
              };
            }
            return pr;
          });
        }

        const newNotif = {
          id: `N-AC-A-${r.id}-${Date.now()}`,
          title: "Advance Edit Request Approved",
          message: `Owner approved advance request modification for farmer ${target.farmerName}.`,
          type: "approval" as const,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          isRead: false,
          role: "all" as const
        };
        tempNotifs.unshift(newNotif);

        return { ...r, status: "Approved" as const };
      }
      return r;
    });

    setAdvanceChangeRequests(updated);
    localStorage.setItem("ks_advance_change_requests", JSON.stringify(updated));
    setPaymentRequests(tempPayRequests);
    localStorage.setItem("ks_pay_requests", JSON.stringify(tempPayRequests));
    setNotifications(tempNotifs);
    localStorage.setItem("ks_notifications", JSON.stringify(tempNotifs));
  };

  const handleBulkRejectAdvanceChanges = (ids: string[]) => {
    let tempNotifs = [...notifications];
    const updated = advanceChangeRequests.map((r) => {
      if (ids.includes(r.id) && r.status === "Pending") {
        const newNotif = {
          id: `N-AC-R-${r.id}-${Date.now()}`,
          title: "Advance Edit Request Rejected",
          message: `Owner declined advance modification for farmer ${r.farmerName}.`,
          type: "approval" as const,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          isRead: false,
          role: "all" as const
        };
        tempNotifs.unshift(newNotif);
        return { ...r, status: "Rejected" as const };
      }
      return r;
    });
    setAdvanceChangeRequests(updated);
    localStorage.setItem("ks_advance_change_requests", JSON.stringify(updated));
    setNotifications(tempNotifs);
    localStorage.setItem("ks_notifications", JSON.stringify(tempNotifs));
  };

  const handleBulkApproveSalaryUnlocks = (ids: string[]) => {
    let tempNotifs = [...notifications];
    const updated = salaryUnlockRequests.map((r) => {
      if (ids.includes(r.id) && r.status === "Pending") {
        const target = r;
        
        const updatedAssistants = assistantUsers.map(user => {
          if (user.mobileNumber === target.staffMobile) {
            return {
              ...user,
              salaryUnlocked: true,
              salaryAmount: target.requestedSalary
            };
          }
          return user;
        });
        setAssistantUsers(updatedAssistants);
        localStorage.setItem("ks_assistant_users", JSON.stringify(updatedAssistants));

        const newNotif = {
          id: `N-SU-A-${r.id}-${Date.now()}`,
          title: "Salary Unlock Approved",
          message: `Proprietor approved salary scale unlock for ${target.staffName}.`,
          type: "approval" as const,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          isRead: false,
          role: "Accountant" as const
        };
        tempNotifs.unshift(newNotif);

        return { ...r, status: "Approved" as const };
      }
      return r;
    });

    setSalaryUnlockRequests(updated);
    localStorage.setItem("ks_salary_unlock_requests", JSON.stringify(updated));
    setNotifications(tempNotifs);
    localStorage.setItem("ks_notifications", JSON.stringify(tempNotifs));
  };

  const handleBulkRejectSalaryUnlocks = (ids: string[]) => {
    let tempNotifs = [...notifications];
    const updated = salaryUnlockRequests.map((r) => {
      if (ids.includes(r.id) && r.status === "Pending") {
        const newNotif = {
          id: `N-SU-R-${r.id}-${Date.now()}`,
          title: "Salary Unlock Rejected",
          message: `Proprietor rejected salary scale unlock for ${r.staffName}.`,
          type: "approval" as const,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          isRead: false,
          role: "Accountant" as const
        };
        tempNotifs.unshift(newNotif);
        return { ...r, status: "Rejected" as const };
      }
      return r;
    });
    setSalaryUnlockRequests(updated);
    localStorage.setItem("ks_salary_unlock_requests", JSON.stringify(updated));
    setNotifications(tempNotifs);
    localStorage.setItem("ks_notifications", JSON.stringify(tempNotifs));
  };

  // Year filtered data passed down to dashboards
  const filteredStocks = useMemo(() => stocks.filter(s => !s.receivedDate || s.receivedDate.startsWith(globalYear)), [stocks, globalYear]);
  const filteredDispatches = useMemo(() => dispatches.filter(d => !d.dispatchDate || d.dispatchDate.startsWith(globalYear)), [dispatches, globalYear]);
  const filteredSupplierBills = useMemo(() => supplierBills.filter(sb => !sb.billDate || sb.billDate.startsWith(globalYear)), [supplierBills, globalYear]);
  const filteredFarmerDistributions = useMemo(() => farmerDistributions.filter(fd => !fd.date || fd.date.startsWith(globalYear)), [farmerDistributions, globalYear]);
  const filteredPaymentRequests = useMemo(() => paymentRequests.filter(pr => !pr.dateRequested || pr.dateRequested.startsWith(globalYear)), [paymentRequests, globalYear]);
  const filteredModificationRequests = useMemo(() => modificationRequests.filter(mr => !mr.dateRequested || mr.dateRequested.startsWith(globalYear)), [modificationRequests, globalYear]);
  const filteredTimelineEvents = useMemo(() => timelineEvents.filter(te => !te.date || te.date.startsWith(globalYear)), [timelineEvents, globalYear]);
  const filteredFertilizerRequests = useMemo(() => (fertilizerRequests || []).filter(fr => !fr.requestedAt || fr.requestedAt.startsWith(globalYear)), [fertilizerRequests, globalYear]);

  return (
    <PhoneFrame
      activeRole={activeRole}
      onRoleChange={(role) => {
        setActiveRole(role);
        setShowNotificationDrawer(false);
      }}
      onResetData={handleResetData}
      notificationCount={activeUnreadNotifs.length}
      onOpenNotifications={() => setShowNotificationDrawer(true)}
    >
      {/* Dynamic top notifications bar within the phone workspace frame */}
      <div className="sticky top-0 z-30 bg-brand-50 border-b border-brand-100/60 py-2.5 px-4 flex items-center justify-between text-xs text-brand-900 select-none shadow-xs">
        <div className="flex items-center gap-1.5 font-medium">
          <span className="w-2 h-2 bg-brand-600 rounded-full animate-ping"></span>
          <span>Core Hub</span>
        </div>
        
        {/* Global Year Selector - Present on every page/dashboard */}
        <div className="flex items-center gap-1.5 bg-white border border-brand-200/80 px-2 py-0.5 rounded-lg shadow-2xs">
          <span className="text-[9.5px] uppercase font-bold text-slate-450">Year:</span>
          <select
            value={globalYear}
            onChange={(e) => {
              setGlobalYear(e.target.value);
              localStorage.setItem("ks_global_year", e.target.value);
            }}
            className="bg-transparent text-slate-800 text-xs font-bold outline-none cursor-pointer pr-1"
          >
            {academicYears.map((yr) => (
              <option key={yr} value={yr}>{yr}</option>
            ))}
          </select>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowNotificationDrawer(!showNotificationDrawer)}
            className="relative p-1 hover:bg-white rounded-full transition text-slate-600"
          >
            <Bell size={16} />
            {activeUnreadNotifs.length > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-rose-500 text-white font-bold text-[8px] rounded-full flex items-center justify-center">
                {activeUnreadNotifs.length}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Main Screen Views Routing */}
      <div className="flex-1 flex flex-col relative">
        {showNotificationDrawer && (
          <div className="absolute inset-0 bg-white z-40 flex flex-col animate-in fade-in duration-200">
            <div className="p-4 border-b border-slate-200 flex items-center justify-between sticky top-0 bg-white">
              <span className="font-bold text-sm text-slate-800">Alert Notification Logs</span>
              <button
                onClick={() => setShowNotificationDrawer(false)}
                className="p-1 hover:bg-slate-100 rounded-full"
              >
                <X size={18} />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-4 space-y-3.5">
              {notifications.filter((n) => n.role === activeRole || n.role === "all" || activeRole === "Owner").length === 0 ? (
                <div className="text-center py-12 text-xs text-slate-400">
                  No active logs at this time. Use other views to generate alerts.
                </div>
              ) : (
                notifications
                  .filter((n) => n.role === activeRole || n.role === "all" || activeRole === "Owner")
                  .map((notif) => (
                    <div
                      key={notif.id}
                      className="p-3 bg-slate-50 border border-slate-100 rounded-xl space-y-1 text-xs"
                    >
                      <div className="flex justify-between items-center">
                        <strong className="text-slate-800 font-semibold">{notif.title}</strong>
                        <span className="text-[9px] text-slate-400 font-mono">{notif.time}</span>
                      </div>
                      <p className="text-slate-500 text-[11px] leading-relaxed">{notif.message}</p>
                    </div>
                  ))
              )}
            </div>
            <div className="p-3 bg-slate-100 text-center text-[10px] text-slate-400">
              Filtered specifically for current role workspace.
            </div>
          </div>
        )}

        {/* View Selection Switcher */}
        {(() => {
          const handleLogin = (role: ActiveRole, assist?: AssistantUser) => {
            if (role === "Village Assistant" && assist) {
              setLoggedInAssistant(assist);
            } else {
              setLoggedInAssistant(null);
            }
            setActiveRole(role);
          };

          const handleLogout = () => {
            setLoggedInAssistant(null);
            setActiveRole("Login");
          };

          const handleUpdateFertilizerRates = (newRates: Record<string, number>) => {
            setFertilizerRates(newRates);
            localStorage.setItem("ks_fertilizer_rates", JSON.stringify(newRates));
          };

          switch (activeRole) {
            case "Login":
              return <LoginView onLogin={handleLogin} assistantUsers={assistantUsers} />;
            case "Warehouse Manager":
              return (
                <WarehouseManagerView
                  stocks={filteredStocks}
                  dispatches={filteredDispatches}
                  villageStocks={derivedVillageStocks}
                  supplierBills={filteredSupplierBills}
                  farmerDistributions={filteredFarmerDistributions}
                  assistantUsers={assistantUsers}
                  fertilizerRates={fertilizerRates}
                  onUpdateFertilizerRates={handleUpdateFertilizerRates}
                  fertilizerRequests={filteredFertilizerRequests}
                  onUpdateFertilizerStatus={handleUpdateFertilizerRequestStatus}
                  onAddAssistantUser={(newU) => {
                    const updated = [...assistantUsers, newU];
                    setAssistantUsers(updated);
                    localStorage.setItem("ks_assistant_users", JSON.stringify(updated));
                  }}
                  onUpdateAssistantUser={(oldMobileNumber, updatedUser) => {
                    const updated = assistantUsers.map(u => u.mobileNumber === oldMobileNumber ? updatedUser : u);
                    setAssistantUsers(updated);
                    localStorage.setItem("ks_assistant_users", JSON.stringify(updated));
                  }}
                  onAddInwardStock={handleAddInwardStock}
                  onAddDispatch={handleAddDispatch}
                  onLogout={handleLogout}
                  globalYear={globalYear}
                  onYearChange={(year) => {
                    setGlobalYear(year);
                    localStorage.setItem("ks_global_year", year);
                  }}
                />
              );
            case "Village Assistant":
              return (
                <VillageAssistantView
                  dispatches={filteredDispatches}
                  farmerDistributions={filteredFarmerDistributions}
                  villageStocks={derivedVillageStocks}
                  timelineEvents={filteredTimelineEvents}
                  modificationRequests={filteredModificationRequests}
                  paymentRequests={filteredPaymentRequests}
                  loggedInAssistant={loggedInAssistant}
                  fertilizerRequests={filteredFertilizerRequests}
                  onCreateFertilizerRequest={handleCreateFertilizerRequest}
                  onAcknowledgeDispatch={handleAcknowledgeDispatch}
                  onAddDistribution={handleAddDistribution}
                  onSubmitPaymentRequest={handleSubmitPaymentRequest}
                  onSubmitModificationRequest={handleSubmitModificationRequest}
                  onLogout={handleLogout}
                  fertilizerRates={fertilizerRates}
                  cropSourcingRates={cropSourcingRates}
                  globalYear={globalYear}
                  onYearChange={(year) => {
                    setGlobalYear(year);
                    localStorage.setItem("ks_global_year", year);
                  }}
                  farmerChangeRequests={farmerChangeRequests}
                  onSubmitFarmerChangeRequest={handleSubmitFarmerChangeRequest}
                  advanceChangeRequests={advanceChangeRequests}
                  onSubmitAdvanceChangeRequest={handleSubmitAdvanceChangeRequest}
                  academicYears={academicYears}
                />
              );
            case "Owner":
              return (
                <OwnerView
                  stocks={filteredStocks}
                  dispatches={filteredDispatches}
                  farmerDistributions={filteredFarmerDistributions}
                  supplierBills={filteredSupplierBills}
                  villageStocks={derivedVillageStocks}
                  modificationRequests={filteredModificationRequests}
                  paymentRequests={filteredPaymentRequests}
                  onUpdatePaymentRequests={handleUpdatePaymentRequests}
                  onApproveBill={handleApproveBill}
                  onRejectBill={handleRejectBill}
                  onHoldBill={handleHoldBill}
                  onApproveModification={handleApproveModificationRequest}
                  onRejectModification={handleRejectModificationRequest}
                  onLogout={handleLogout}
                  globalYear={globalYear}
                  onYearChange={(year) => {
                    setGlobalYear(year);
                    localStorage.setItem("ks_global_year", year);
                  }}
                  rateChangeRequests={rateChangeRequests}
                  onApproveRateChange={handleApproveRateChangeRequest}
                  onRejectRateChange={handleRejectRateChangeRequest}
                  farmerChangeRequests={farmerChangeRequests}
                  onApproveFarmerChange={handleApproveFarmerChangeRequest}
                  onRejectFarmerChange={handleRejectFarmerChangeRequest}
                  advanceChangeRequests={advanceChangeRequests}
                  onApproveAdvanceChange={handleApproveAdvanceChangeRequest}
                  onRejectAdvanceChange={handleRejectAdvanceChangeRequest}
                  salaryUnlockRequests={salaryUnlockRequests}
                  onApproveSalaryUnlock={handleApproveSalaryUnlockRequest}
                  onRejectSalaryUnlock={handleRejectSalaryUnlockRequest}
                  onBulkApproveBills={handleBulkApproveBills}
                  onBulkRejectBills={handleBulkRejectBills}
                  onBulkApproveModifications={handleBulkApproveModifications}
                  onBulkRejectModifications={handleBulkRejectModifications}
                  onBulkApproveRateChanges={handleBulkApproveRateChanges}
                  onBulkRejectRateChanges={handleBulkRejectRateChanges}
                  onBulkApproveFarmerChanges={handleBulkApproveFarmerChanges}
                  onBulkRejectFarmerChanges={handleBulkRejectFarmerChanges}
                  onBulkApproveAdvanceChanges={handleBulkApproveAdvanceChanges}
                  onBulkRejectAdvanceChanges={handleBulkRejectAdvanceChanges}
                  onBulkApproveSalaryUnlocks={handleBulkApproveSalaryUnlocks}
                  onBulkRejectSalaryUnlocks={handleBulkRejectSalaryUnlocks}
                  academicYears={academicYears}
                />
              );
            case "Accountant":
              return (
                <AccountantView
                  supplierBills={filteredSupplierBills}
                  paymentRequests={filteredPaymentRequests}
                  onResumeApprovalRequest={handleResumeApprovalRequest}
                  onUpdateSupplierPayment={handleUpdateSupplierPayment}
                  onApprovePaymentRequest={handleApprovePaymentRequest}
                  onRejectPaymentRequest={handleRejectPaymentRequest}
                  onLogout={handleLogout}
                  fertilizerRates={fertilizerRates}
                  onUpdateFertilizerRates={handleUpdateFertilizerRates}
                  cropSourcingRates={cropSourcingRates}
                  onUpdateCropSourcingRates={(updated) => {
                    setCropSourcingRates(updated);
                    localStorage.setItem("ks_crop_sourcing_rates", JSON.stringify(updated));
                  }}
                  assistantUsers={assistantUsers}
                  onAddAssistantUser={(newU) => {
                    const updated = [...assistantUsers, newU];
                    setAssistantUsers(updated);
                    localStorage.setItem("ks_assistant_users", JSON.stringify(updated));
                  }}
                  onUpdateAssistantUser={(oldMobileNumber, updatedUser) => {
                    const updated = assistantUsers.map(u => u.mobileNumber === oldMobileNumber ? updatedUser : u);
                    setAssistantUsers(updated);
                    localStorage.setItem("ks_assistant_users", JSON.stringify(updated));
                  }}
                  globalYear={globalYear}
                  onYearChange={(year) => {
                    setGlobalYear(year);
                    localStorage.setItem("ks_global_year", year);
                  }}
                  rateChangeRequests={rateChangeRequests}
                  onSubmitRateChangeRequest={handleSubmitRateChangeRequest}
                  farmerDistributions={filteredFarmerDistributions}
                  onUpdatePaymentRequests={handleUpdatePaymentRequests}
                  onUpdateSupplierBills={handleUpdateSupplierBills}
                  salaryUnlockRequests={salaryUnlockRequests}
                  onSubmitSalaryUnlockRequest={handleSubmitSalaryUnlockRequest}
                  academicYears={academicYears}
                  onAddAcademicYear={handleAddAcademicYear}
                />
              );
            default:
              return <LoginView onLogin={handleLogin} assistantUsers={assistantUsers} />;
          }
        })()}
      </div>
    </PhoneFrame>
  );
}
