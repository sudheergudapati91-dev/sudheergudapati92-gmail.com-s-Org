/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from "react";
import { SupplierBill, PaymentRequest, AssistantUser, FarmerDistribution, DispatchRecord, RateChangeRequest, SalaryUnlockRequest } from "../types";
import { DEMO_SUPPLIERS, DEMO_FERTILIZERS, INITIAL_DISPATCH_RECORDS } from "../data";
import {
  Landmark,
  ClipboardList,
  PlusCircle,
  Search,
  DollarSign,
  Send,
  ArrowRight,
  CheckCircle2,
  Coins,
  Wifi,
  Check,
  X,
  Clock,
  HelpCircle,
  FolderSync,
  Edit2,
  UserPlus,
  Users,
  UserCheck,
  Key,
  ShieldCheck,
  Printer,
  Mail,
  Share2,
  ChevronRight,
  CheckSquare,
  Square,
  AlertCircle,
  Menu,
  Sparkles,
  Download,
  Sprout,
  Info,
  Eye,
  Upload,
  Lock,
  Unlock,
  ArrowUpRight,
  AlertTriangle,
  History,
  FileText,
  MapPin,
  Trash2,
  Wallet,
  Terminal,
  Settings,
  FileCheck,
  Compass,
  Calendar,
  Plus
} from "lucide-react";

interface AccountantViewProps {
  supplierBills: SupplierBill[];
  paymentRequests: PaymentRequest[];
  onResumeApprovalRequest: (billId: string, notes: string) => void;
  onUpdateSupplierPayment: (billId: string, amountPaid: number, markFull: boolean) => void;
  onApprovePaymentRequest: (paymentRequestId: string, accountantName: string) => void;
  onRejectPaymentRequest: (paymentRequestId: string, accountantName: string) => void;
  onLogout: () => void;
  fertilizerRates?: Record<string, number>;
  onUpdateFertilizerRates?: (rates: Record<string, number>) => void;
  cropSourcingRates?: Record<string, number>;
  onUpdateCropSourcingRates?: (rates: Record<string, number>) => void;
  assistantUsers: AssistantUser[];
  onAddAssistantUser: (user: AssistantUser) => void;
  onUpdateAssistantUser?: (oldMobileNumber: string, updatedUser: AssistantUser) => void;
  globalYear?: string;
  onYearChange?: (year: string) => void;
  
  // Sychronized props we introduced
  farmerDistributions?: FarmerDistribution[];
  onUpdatePaymentRequests?: (updated: PaymentRequest[]) => void;
  onUpdateSupplierBills?: (updated: SupplierBill[]) => void;

  rateChangeRequests?: RateChangeRequest[];
  onSubmitRateChangeRequest?: (req: Omit<RateChangeRequest, "id" | "status" | "dateRequested">) => void;
  salaryUnlockRequests?: SalaryUnlockRequest[];
  onSubmitSalaryUnlockRequest?: (req: Omit<SalaryUnlockRequest, "id" | "status" | "dateRequested">) => void;
  academicYears?: string[];
  onAddAcademicYear?: (year: string) => void;
}

export const AccountantView: React.FC<AccountantViewProps> = ({
  supplierBills,
  paymentRequests,
  onResumeApprovalRequest,
  onUpdateSupplierPayment,
  onApprovePaymentRequest,
  onRejectPaymentRequest,
  onLogout,
  fertilizerRates,
  onUpdateFertilizerRates,
  cropSourcingRates,
  onUpdateCropSourcingRates,
  assistantUsers,
  onAddAssistantUser,
  onUpdateAssistantUser,
  globalYear,
  onYearChange,
  farmerDistributions = [],
  onUpdatePaymentRequests,
  onUpdateSupplierBills,
  rateChangeRequests = [],
  onSubmitRateChangeRequest,
  salaryUnlockRequests = [],
  onSubmitSalaryUnlockRequest,
  academicYears = ["2026", "2025", "2024"],
  onAddAcademicYear,
}) => {
  const [activeTab, setActiveTab] = useState<"bills" | "fertilizer_bills" | "advances" | "rates" | "history" | "assistants" | "employee_salaries" | "farmer_final_payments" | "razorpayx" | "field_verifications">("bills");

  // Field verifications synchronized with Village Assistant's entries
  const [fieldVerifications, setFieldVerifications] = useState<any[]>(() => {
    const saved = localStorage.getItem("ks_field_verifications");
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error("Error parsing field verifications", e);
      }
    }
    return [];
  });

  const updateFieldVerifications = (updatedList: any[]) => {
    setFieldVerifications(updatedList);
    localStorage.setItem("ks_field_verifications", JSON.stringify(updatedList));
  };

  // Accountant Review Form/Modal States
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [reviewingVerification, setReviewingVerification] = useState<any>(null);
  const [auditRejectReason, setAuditRejectReason] = useState("");
  const [auditSuccessAlert, setAuditSuccessAlert] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [auditStatusFilter, setAuditStatusFilter] = useState<"all" | "Pending Review" | "Passed" | "Rejected">("all");
  const [auditVillageFilter, setAuditVillageFilter] = useState<string>("all");

  // Local storage states for Employee Salaries and Farmer Final Payments
  const [processedSalaries, setProcessedSalaries] = useState<any[]>(() => {
    const cached = localStorage.getItem("ks_processed_salaries");
    return cached ? JSON.parse(cached) : [];
  });

  const [farmerFinalPayments, setFarmerFinalPayments] = useState<any[]>(() => {
    const cached = localStorage.getItem("ks_farmer_final_payments");
    if (cached) {
      try {
        return JSON.parse(cached);
      } catch (e) {
        console.error(e);
      }
    }
    
    return [];
  });

  // Bulk selectors
  const [selectedSalaryMobiles, setSelectedSalaryMobiles] = useState<string[]>([]);
  const [selectedFarmerFinalPaymentIds, setSelectedFarmerFinalPaymentIds] = useState<string[]>([]);
  const [selectedDesignation, setSelectedDesignation] = useState("All");
  
  // Receipt view modal
  const [receiptModalOpen, setReceiptModalOpen] = useState(false);
  const [receiptData, setReceiptData] = useState<any>(null);

  // Individual payment modal triggers & fields
  const [showSalaryModal, setShowSalaryModal] = useState(false);
  const [selectedStaffForSalary, setSelectedStaffForSalary] = useState<AssistantUser | null>(null);
  const [salaryMonth, setSalaryMonth] = useState("June 2026");
  const [salaryPaymentMode, setSalaryPaymentMode] = useState<"Bank Transfer" | "UPI" | "Cash">("Bank Transfer");
  const [salaryTxnRef, setSalaryTxnRef] = useState("");
  const [salaryNotes, setSalaryNotes] = useState("");

  const [showFarmerPaymentModal, setShowFarmerPaymentModal] = useState(false);
  const [selectedFarmerFinalPayment, setSelectedFarmerFinalPayment] = useState<any | null>(null);
  const [farmerTransferBy, setFarmerTransferBy] = useState("NRA PNB CURRENT");
  const [farmerPaymentRemarks, setFarmerPaymentRemarks] = useState("FINAL PAYMENT");
  const [farmerPaymentPricePerKg, setFarmerPaymentPricePerKg] = useState("31");
  const [farmerPaymentInterest, setFarmerPaymentInterest] = useState("0");
  const [farmerPaymentAdvance, setFarmerPaymentAdvance] = useState("0");
  const [farmerPaymentPesticide, setFarmerPaymentPesticide] = useState("0");

  // Form state to enroll a new farmer final payment row if needed
  const [showAddFarmerPaymentModal, setShowAddFarmerPaymentModal] = useState(false);
  const [newFarmerName, setNewFarmerName] = useState("");
  const [newFarmerVillage, setNewFarmerVillage] = useState("");
  const [newFarmerAcres, setNewFarmerAcres] = useState("1.0");
  const [newFarmerBags, setNewFarmerBags] = useState("50");
  const [newFarmerWeight, setNewFarmerWeight] = useState("2000");
  const [newFarmerIfsc, setNewFarmerIfsc] = useState("SBIN0015366");
  const [newFarmerAccount, setNewFarmerAccount] = useState("");

  const [salaryFilter, setSalaryFilter] = useState<"All" | "Paid" | "Unpaid" | "Locked">("All");
  const [farmerPaymentFilter, setFarmerPaymentFilter] = useState<"All" | "Paid" | "Unpaid">("All");

  // RazorpayX State Variables
  const [rzpApiKey, setRzpApiKey] = useState(() => localStorage.getItem("ks_rzp_api_key") || "rzp_live_KrishiSetu94A");
  const [rzpApiSecret, setRzpApiSecret] = useState("••••••••••••••••••••");
  const [rzpSandbox, setRzpSandbox] = useState(true);
  const [rzpWalletBalance, setRzpWalletBalance] = useState(() => {
    const cached = localStorage.getItem("ks_rzp_balance");
    return cached ? Number(cached) : 485000;
  });
  const [rzpPayoutMode, setRzpPayoutMode] = useState<"IMPS" | "NEFT" | "UPI">("IMPS");
  const [rzpLogs, setRzpLogs] = useState<string[]>(["[SYSTEM]: Ready for secure payouts. Sandbox mode is ACTIVE."]);
  const [rzpProcessing, setRzpProcessing] = useState(false);
  const [rzpSelectedType, setRzpSelectedType] = useState<"farmers" | "staff">("farmers");
  const [rzpActivePayload, setRzpActivePayload] = useState<any>(null);

  React.useEffect(() => {
    localStorage.setItem("ks_rzp_balance", rzpWalletBalance.toString());
  }, [rzpWalletBalance]);

  React.useEffect(() => {
    localStorage.setItem("ks_rzp_api_key", rzpApiKey);
  }, [rzpApiKey]);

  // Village selectors for Farmer Bills and Advances tabs
  const [selectedVillageForFertilizer, setSelectedVillageForFertilizer] = useState("All");
  const [selectedVillageForAdvance, setSelectedVillageForAdvance] = useState("All");
  const [farmerSearchQuery, setFarmerSearchQuery] = useState("");
  const [fertilizerSearchQuery, setFertilizerSearchQuery] = useState("");
  const [selectedConsolidatedFarmer, setSelectedConsolidatedFarmer] = useState<string | null>(null);
  const [selectedConsolidatedMobile, setSelectedConsolidatedMobile] = useState<string | null>(null);
  const [showConsolidatedModal, setShowConsolidatedModal] = useState(false);
  const [copiedSuccess, setCopiedSuccess] = useState(false);

  // Drilldown popup modal states for clickable quantities
  const [drilldownInvoiceGroup, setDrilldownInvoiceGroup] = useState<any | null>(null);
  const [drilldownFarmerDist, setDrilldownFarmerDist] = useState<FarmerDistribution | null>(null);

  // Core processing functions for Employee Salaries and Farmer Final Payments
  const handleProcessSalaryConfirm = () => {
    const todayStr = new Date().toISOString().split('T')[0];
    
    if (selectedStaffForSalary) {
      // Individual payroll processing
      const newPayment = {
        id: `SAL-TXN-${Date.now().toString().slice(-6)}`,
        employeeMobile: selectedStaffForSalary.mobileNumber,
        employeeName: selectedStaffForSalary.name,
        designation: selectedStaffForSalary.designation || "Assistant",
        salaryAmount: selectedStaffForSalary.salaryAmount || 25000,
        monthYear: salaryMonth,
        paymentMode: salaryPaymentMode,
        transactionRef: salaryTxnRef || `REF-${Math.floor(Math.random() * 900000 + 100000)}`,
        datePaid: todayStr,
        status: "Paid",
        remarks: salaryNotes || "Monthly Payroll Disbursed"
      };
      
      const updated = [...processedSalaries, newPayment];
      setProcessedSalaries(updated);
      localStorage.setItem("ks_processed_salaries", JSON.stringify(updated));
      alert(`Salary has been successfully processed and disbursed for ${selectedStaffForSalary.name}!`);
    } else {
      // Bulk payroll processing
      const visibleStaffToPay = assistantUsers.filter(u => {
        const isPaid = processedSalaries.some(p => p.employeeMobile === u.mobileNumber && p.monthYear === salaryMonth);
        const isLocked = u.salaryLocked;
        return !isPaid && !isLocked && selectedSalaryMobiles.includes(u.mobileNumber);
      });

      if (visibleStaffToPay.length === 0) {
        alert("No valid, unlocked staff selected for bulk disbursal.");
        return;
      }

      const newPayments = visibleStaffToPay.map((u, idx) => ({
        id: `SAL-TXN-${(Date.now() + idx).toString().slice(-6)}`,
        employeeMobile: u.mobileNumber,
        employeeName: u.name,
        designation: u.designation || "Assistant",
        salaryAmount: u.salaryAmount || 25000,
        monthYear: salaryMonth,
        paymentMode: salaryPaymentMode,
        transactionRef: salaryTxnRef || `REF-${Math.floor(Math.random() * 900000 + 100000)}`,
        datePaid: todayStr,
        status: "Paid",
        remarks: salaryNotes || "Bulk Payroll Disbursed"
      }));

      const updated = [...processedSalaries, ...newPayments];
      setProcessedSalaries(updated);
      localStorage.setItem("ks_processed_salaries", JSON.stringify(updated));
      setSelectedSalaryMobiles([]);
      alert(`Successfully processed and disbursed monthly payroll for ${visibleStaffToPay.length} employees in bulk!`);
    }
    
    setShowSalaryModal(false);
    setSelectedStaffForSalary(null);
    setSalaryTxnRef("");
    setSalaryNotes("");
  };

  const handleProcessFarmerPaymentConfirm = () => {
    const todayStr = new Date().toISOString().split('T')[0];

    if (selectedFarmerFinalPayment) {
      // Individual farmer payment process
      const priceVal = Number(farmerPaymentPricePerKg) || 31;
      const gross = selectedFarmerFinalPayment.weightKg * priceVal;
      const loading = Math.round((selectedFarmerFinalPayment.weightKg / 1000) * 400);
      const interestVal = Number(farmerPaymentInterest) || 0;
      const advanceVal = Number(farmerPaymentAdvance) || 0;
      const pesticideVal = Number(farmerPaymentPesticide) || 0;
      const totalDeductions = advanceVal + interestVal + pesticideVal + loading;
      const net = Math.round(gross - totalDeductions);

      const updated = farmerFinalPayments.map(p => {
        if (p.id === selectedFarmerFinalPayment.id) {
          return {
            ...p,
            pricePerKg: priceVal,
            advanceAmount: advanceVal,
            interest: interestVal,
            pesticideDues: pesticideVal,
            status: "Paid" as const,
            datePaid: todayStr,
            transferBy: farmerTransferBy,
            remarks: farmerPaymentRemarks || "Final Settlement"
          };
        }
        return p;
      });

      setFarmerFinalPayments(updated);
      localStorage.setItem("ks_farmer_final_payments", JSON.stringify(updated));
      alert(`Final crop settlement of ₹${net.toLocaleString()} paid to ${selectedFarmerFinalPayment.farmerName} successfully!`);
    } else {
      // Bulk farmer payment process
      const unpaidToPay = farmerFinalPayments.filter(p => p.status !== "Paid" && selectedFarmerFinalPaymentIds.includes(p.id));
      
      if (unpaidToPay.length === 0) {
        alert("No unpaid checked farmer records found.");
        return;
      }

      const updated = farmerFinalPayments.map(p => {
        if (p.status !== "Paid" && selectedFarmerFinalPaymentIds.includes(p.id)) {
          return {
            ...p,
            status: "Paid" as const,
            datePaid: todayStr,
            transferBy: farmerTransferBy,
            remarks: farmerPaymentRemarks || "Bulk Settlement Payment"
          };
        }
        return p;
      });

      setFarmerFinalPayments(updated);
      localStorage.setItem("ks_farmer_final_payments", JSON.stringify(updated));
      setSelectedFarmerFinalPaymentIds([]);
      alert(`Bulk payments processed successfully for ${unpaidToPay.length} farmers via ${farmerTransferBy}!`);
    }

    setShowFarmerPaymentModal(false);
    setSelectedFarmerFinalPayment(null);
  };

  const handleAddNewFarmerRow = () => {
    if (!newFarmerName || !newFarmerVillage) {
      alert("Please provide the farmer name and village route.");
      return;
    }

    const newPayment = {
      id: `FFP-${Math.floor(Math.random() * 900 + 100)}`,
      farmerName: newFarmerName.toUpperCase(),
      villageName: newFarmerVillage.toUpperCase(),
      acres: Number(newFarmerAcres) || 1.0,
      bagCount: Number(newFarmerBags) || 50,
      weightKg: Number(newFarmerWeight) || 2000,
      pricePerKg: 31,
      advanceAmount: 0,
      interest: 0,
      pesticideDues: 0,
      ifscCode: newFarmerIfsc.toUpperCase() || "SBIN0015366",
      accountNumber: newFarmerAccount || "32901234567",
      remarks: "9TH PAYMENT",
      datePaid: "",
      transferBy: "",
      status: "Unpaid" as const
    };

    const updated = [newPayment, ...farmerFinalPayments];
    setFarmerFinalPayments(updated);
    localStorage.setItem("ks_farmer_final_payments", JSON.stringify(updated));
    
    // Clear form states
    setNewFarmerName("");
    setNewFarmerVillage("");
    setNewFarmerAcres("1.0");
    setNewFarmerBags("50");
    setNewFarmerWeight("2000");
    setNewFarmerAccount("");
    setShowAddFarmerPaymentModal(false);
    alert(`Successfully registered a new settlement claim row for ${newPayment.farmerName}!`);
  };

  const dispatchesList = useMemo<DispatchRecord[]>(() => {
    const cached = localStorage.getItem("ks_dispatches");
    return cached ? JSON.parse(cached) : INITIAL_DISPATCH_RECORDS;
  }, []);

  // Reviewed farmer fertilizer allocations state (persisted locally)
  const [reviewedFarmerBillIds, setReviewedFarmerBillIds] = useState<string[]>(() => {
    const cached = localStorage.getItem("ks_reviewed_farmer_bills");
    return cached ? JSON.parse(cached) : [];
  });

  // Bulk selected advance requests (all checked row IDs)
  const [bulkSelectedAdvanceIds, setBulkSelectedAdvanceIds] = useState<string[]>([]);

  // Bulk action confirmation modal states
  const [showBulkSubmitPreview, setShowBulkSubmitPreview] = useState(false);
  const [showBulkDisbursePreview, setShowBulkDisbursePreview] = useState(false);

  // Interactive Invoice Modal states
  const [selectedInvoiceNumber, setSelectedInvoiceNumber] = useState<string | null>(null);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [paymentAmount, setPaymentAmount] = useState("");
  const [paymentMode, setPaymentMode] = useState<"Bank Transfer" | "UPI" | "Cash" | "Cheque">("Bank Transfer");
  const [paymentRef, setPaymentRef] = useState("");
  const [paymentNotes, setPaymentNotes] = useState("");
  const [isSubmittingPayment, setIsSubmittingPayment] = useState(false);
  const [shareEmail, setShareEmail] = useState("");
  const [shareMobile, setShareMobile] = useState("");
  const [isSharingReceipt, setIsSharingReceipt] = useState(false);
  const [shareSuccess, setShareSuccess] = useState(false);

  // Advance request edit inline/modal states
  const [editingAdvanceId, setEditingAdvanceId] = useState<string | null>(null);
  const [editAdvanceAmount, setEditAdvanceAmount] = useState("");
  const [editAdvanceNotes, setEditAdvanceNotes] = useState("");

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
  const [supervisorSearch, setSupervisorSearch] = useState("");

  // Staff sub-tab: "assistants" (Village Supervisors), "employees" (Other Employees), "villages" (Village Enrollment), or "years" (Academic Years)
  const [staffSubTab, setStaffSubTab] = useState<"assistants" | "employees" | "villages" | "years">("assistants");

  // Dynamic Academic Years state
  const [localAcademicYears, setLocalAcademicYears] = useState<string[]>(() => {
    const saved = localStorage.getItem("ks_academic_years");
    return saved ? JSON.parse(saved) : academicYears;
  });
  const [newYearInput, setNewYearInput] = useState("");

  const handleEnrollYear = (year: string) => {
    const trimmed = year.trim();
    if (!trimmed) return;
    if (localAcademicYears.includes(trimmed)) {
      alert("This academic year is already enrolled.");
      return;
    }
    const updated = [trimmed, ...localAcademicYears].sort((a, b) => Number(b) - Number(a));
    setLocalAcademicYears(updated);
    localStorage.setItem("ks_academic_years", JSON.stringify(updated));
    if (onAddAcademicYear) {
      onAddAcademicYear(trimmed);
    }
  };

  // Farmer Advances Sub-Tabs & Settings
  const [advanceSubTab, setAdvanceSubTab] = useState<"requests" | "limits" | "funding">("requests");

  // Village advance limits per acre
  const [villageAdvanceLimits, setVillageAdvanceLimits] = useState<Record<string, number>>(() => {
    const saved = localStorage.getItem("ks_village_advance_limits");
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error(e);
      }
    }
    return {};
  });

  const updateVillageAdvanceLimit = (village: string, limit: number) => {
    const updated = { ...villageAdvanceLimits, [village]: limit };
    setVillageAdvanceLimits(updated);
    localStorage.setItem("ks_village_advance_limits", JSON.stringify(updated));
  };

  // Company funding record states
  const [companyFunds, setCompanyFunds] = useState<any[]>(() => {
    const saved = localStorage.getItem("ks_company_funds");
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error(e);
      }
    }
    return [];
  });

  const updateCompanyFunds = (updated: any[]) => {
    setCompanyFunds(updated);
    localStorage.setItem("ks_company_funds", JSON.stringify(updated));
  };

  // Enrolled Villages state with default list and localStorage backup
  const [enrolledVillages, setEnrolledVillages] = useState<any[]>(() => {
    const saved = localStorage.getItem("ks_enrolled_villages");
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error(e);
      }
    }
    return [];
  });

  const updateEnrolledVillages = (updated: any[]) => {
    setEnrolledVillages(updated);
    localStorage.setItem("ks_enrolled_villages", JSON.stringify(updated));
  };

  // New Village creation form states
  const [newVillageName, setNewVillageName] = useState("");
  const [newVillageDistrict, setNewVillageDistrict] = useState("Indore");
  const [newVillageState, setNewVillageState] = useState("Madhya Pradesh");
  const [newVillageSownArea, setNewVillageSownArea] = useState("");
  const [newVillageContactPerson, setNewVillageContactPerson] = useState("");
  const [newVillageContactMobile, setNewVillageContactMobile] = useState("");
  const [showVillageForm, setShowVillageForm] = useState(false);
  const [villageSuccessAlert, setVillageSuccessAlert] = useState("");
  const [villageErrorAlert, setVillageErrorAlert] = useState("");

  // New Staff fields
  const [newAsstRoleType, setNewAsstRoleType] = useState<"assistant" | "employee">("assistant");
  const [newAsstDesignation, setNewAsstDesignation] = useState("Village Supervisor");
  const [newAsstAadhaarNumber, setNewAsstAadhaarNumber] = useState("");
  const [newAsstBankName, setNewAsstBankName] = useState("");
  const [newAsstBankAccountNo, setNewAsstBankAccountNo] = useState("");
  const [newAsstBankIfscCode, setNewAsstBankIfscCode] = useState("");
  const [newAsstEmergencyContact, setNewAsstEmergencyContact] = useState("");
  const [newAsstSalaryAmount, setNewAsstSalaryAmount] = useState<string>("");
  const [newAsstSalaryLocked, setNewAsstSalaryLocked] = useState(true);

  // Edit Staff fields
  const [editAsstRoleType, setEditAsstRoleType] = useState<"assistant" | "employee">("assistant");
  const [editAsstDesignation, setEditAsstDesignation] = useState("");
  const [editAsstAadhaarNumber, setEditAsstAadhaarNumber] = useState("");
  const [editAsstBankName, setEditAsstBankName] = useState("");
  const [editAsstBankAccountNo, setEditAsstBankAccountNo] = useState("");
  const [editAsstBankIfscCode, setEditAsstBankIfscCode] = useState("");
  const [editAsstEmergencyContact, setEditAsstEmergencyContact] = useState("");
  const [editAsstSalaryAmount, setEditAsstSalaryAmount] = useState<string>("");
  const [editAsstSalaryLocked, setEditAsstSalaryLocked] = useState(true);

  // Salary unlock request states
  const [unlockingUser, setUnlockingUser] = useState<AssistantUser | null>(null);
  const [unlockReason, setUnlockReason] = useState("");
  const [showUnlockModal, setShowUnlockModal] = useState(false);

  // Crop rates designer form state
  const [newCropType, setNewCropType] = useState("Maize/Corn");
  const [newCropCompany, setNewCropCompany] = useState("Syngenta India");
  const [newCropYear, setNewCropYear] = useState("2026");
  const [newCropRate, setNewCropRate] = useState("24.50");
  const [cropSuccessAlert, setCropSuccessAlert] = useState("");
  const [showSeedRateForm, setShowSeedRateForm] = useState(false);
  const [showFertRateForm, setShowFertRateForm] = useState(false);
  const [showAsstUserForm, setShowAsstUserForm] = useState(false);

  // Sub-tabs for Rates Registry
  const [ratesSubTab, setRatesSubTab] = useState<"seeds" | "fertilizers">("seeds");

  // Packing options state for seeds
  const [seedWeightVolume, setSeedWeightVolume] = useState<number>(25);
  const [seedPackingUnit, setSeedPackingUnit] = useState<string>("kgs");

  // Dynamic state list for Seeds Registry
  const [seedsRegistry, setSeedsRegistry] = useState<any[]>(() => {
    const cached = localStorage.getItem("ks_seeds_registry_list");
    if (cached) {
      try {
        return JSON.parse(cached);
      } catch (e) {
        console.error(e);
      }
    }
    const initial: any[] = [];
    const baseRates = cropSourcingRates || {
      "Maize/Corn_Syngenta India_2026": 24.50,
      "Maize/Corn_Monsanto India_2026": 26.00,
      "Maize/Corn_Asha Bio-Seeds_2026": 23.50,
      "Maize/Corn_Syngenta India_2025": 22.00,
      "Maize/Corn_Monsanto India_2025": 23.50,
      "Maize/Corn_Asha Bio-Seeds_2025": 21.00,
      "Maize/Corn_Syngenta India_2024": 20.00,
      "Maize/Corn_Monsanto India_2024": 21.50,
      "Maize/Corn_Asha Bio-Seeds_2024": 19.50,
    };
    Object.entries(baseRates).forEach(([key, val]) => {
      const parts = key.split("_");
      if (parts.length >= 3) {
        const [crop, company, year] = parts;
        initial.push({
          id: `${crop}_${company}_${year}_${Math.random()}`,
          cropName: crop,
          companyName: company,
          year: year,
          weightVolume: 1,
          packingUnit: "kgs",
          baseRatePerUnit: val as number,
        });
      }
    });
    return initial;
  });

  const updateSeedsRegistry = (updated: any[]) => {
    setSeedsRegistry(updated);
    localStorage.setItem("ks_seeds_registry_list", JSON.stringify(updated));
    if (onUpdateCropSourcingRates) {
      const newRecord: Record<string, number> = {};
      updated.forEach(item => {
        const key = `${item.cropName}_${item.companyName}_${item.year}`;
        newRecord[key] = item.baseRatePerUnit;
      });
      onUpdateCropSourcingRates(newRecord);
    }
  };

  // Dynamic state list for Fertilizers / Pesticides Registry
  const [fertilizersRegistry, setFertilizersRegistry] = useState<any[]>(() => {
    const cached = localStorage.getItem("ks_fertilizers_registry_list");
    if (cached) {
      try {
        return JSON.parse(cached);
      } catch (e) {
        console.error(e);
      }
    }
    const initial: any[] = [];
    const baseRates: Record<string, number> = {
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
    Object.entries(baseRates).forEach(([name, rate]) => {
      let mfr = "IFFCO Ltd.";
      if (name.includes("DAP")) mfr = "Coromandel International";
      else if (name.includes("Potash")) mfr = "NFL India";
      else if (name.includes("SSP")) mfr = "GSFC Ltd.";
      else if (name.includes("Pesticide") || name.includes("Natural") || name.includes("Herbicide") || name.includes("Fungicide")) mfr = "Syngenta India";
      
      let unit = "Bags";
      let wt = 50;
      if (name.toLowerCase().includes("ml") || name.toLowerCase().includes("sl") || name.toLowerCase().includes("ec") || name.toLowerCase().includes("oil")) {
        unit = "liters";
        wt = 1;
      }
      initial.push({
        id: `${name}_${mfr}_2026_${Math.random()}`,
        productName: name,
        manufacturerName: mfr,
        year: "2026",
        weightVolume: wt,
        packingUnit: unit,
        ratePerUnit: rate as number,
      });
    });
    return initial;
  });

  const updateFertilizersRegistry = (updated: any[]) => {
    setFertilizersRegistry(updated);
    localStorage.setItem("ks_fertilizers_registry_list", JSON.stringify(updated));
    if (onUpdateFertilizerRates) {
      const newRecord: Record<string, number> = {};
      updated.forEach(item => {
        newRecord[item.productName] = item.ratePerUnit;
      });
      onUpdateFertilizerRates(newRecord);
    }
  };

  // Local states for sensitive master rates modification approvals and bulk actions
  const [rateChangeActionId, setRateChangeActionId] = useState<string | null>(null);
  const [rateChangeActionType, setRateChangeActionType] = useState<"edit" | "delete" | null>(null);
  const [proposedNewRate, setProposedNewRate] = useState<string>("");
  const [rateChangeJustification, setRateChangeJustification] = useState<string>("");
  const [isDragging, setIsDragging] = useState<boolean>(false);

  // Template, Export, and Import handlers for Sourcing Registries
  const downloadTemplate = (type: "seeds" | "fertilizers") => {
    let headers = "";
    let sample = "";
    let filename = "";

    if (type === "seeds") {
      headers = "Crop Name,Seed Company,Sowing Year,Weight,Measure Unit,Sourcing Rate\n";
      sample = "Maize/Corn,Syngenta India,2026,25,kgs,24.50\nSorghum,Asha Bio-Seeds,2026,10,kgs,18.00\n";
      filename = "seeds_rates_template.csv";
    } else {
      headers = "Product Name,Manufacturer,Year,Weight,Measure Unit,Rate\n";
      sample = "Urea (46% N),IFFCO Ltd.,2026,50,Bags,266.00\nDAP (18-46-0),Coromandel International,2026,50,Bags,1350.00\n";
      filename = "fertilizers_rates_template.csv";
    }

    const csvContent = "data:text/csv;charset=utf-8," + encodeURIComponent(headers + sample);
    const link = document.createElement("a");
    link.setAttribute("href", csvContent);
    link.setAttribute("download", filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const exportRegistry = (type: "seeds" | "fertilizers") => {
    let csvContent = "";
    let filename = "";

    if (type === "seeds") {
      csvContent = "Crop Name,Seed Company,Sowing Year,Weight,Measure Unit,Sourcing Rate\n" +
        seedsRegistry.map(item => `"${item.cropName}","${item.companyName}","${item.year}",${item.weightVolume},"${item.packingUnit}",${item.baseRatePerUnit}`).join("\n");
      filename = `seeds_rates_export_${globalYear}.csv`;
    } else {
      csvContent = "Product Name,Manufacturer,Year,Weight,Measure Unit,Rate\n" +
        fertilizersRegistry.map(item => `"${item.productName}","${item.manufacturerName}","${item.year}",${item.weightVolume},"${item.packingUnit}",${item.ratePerUnit}`).join("\n");
      filename = `fertilizers_rates_export_${globalYear}.csv`;
    }

    const encodedUri = "data:text/csv;charset=utf-8," + encodeURIComponent(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleBulkImport = (fileContent: string, type: "seeds" | "fertilizers") => {
    try {
      const lines = fileContent.split("\n").map(l => l.trim()).filter(Boolean);
      if (lines.length <= 1) {
        alert("The uploaded file appears to be empty or contains no records.");
        return;
      }

      const rows: string[][] = [];
      for (let i = 1; i < lines.length; i++) {
        const line = lines[i];
        const cols: string[] = [];
        let cur = "";
        let inQuotes = false;
        for (let j = 0; j < line.length; j++) {
          const char = line[j];
          if (char === '"') inQuotes = !inQuotes;
          else if (char === ',' && !inQuotes) {
            cols.push(cur.trim());
            cur = "";
          } else {
            cur += char;
          }
        }
        cols.push(cur.trim());
        rows.push(cols.map(c => c.replace(/^["']|["']$/g, "")));
      }

      let count = 0;
      if (type === "seeds") {
        const newRecords = rows.map(cols => {
          if (cols.length < 6) return null;
          const [crop, company, year, wt, unit, rate] = cols;
          return {
            id: `seed_${Date.now()}_${Math.floor(Math.random() * 100000)}`,
            cropName: crop.trim(),
            companyName: company.trim(),
            year: year.trim(),
            weightVolume: parseFloat(wt) || 1,
            packingUnit: unit.trim() || "kgs",
            baseRatePerUnit: parseFloat(rate) || 0
          };
        }).filter(Boolean) as any[];

        if (newRecords.length > 0) {
          const updated = [...newRecords, ...seedsRegistry];
          updateSeedsRegistry(updated);
          count = newRecords.length;
        }
      } else {
        const newRecords = rows.map(cols => {
          if (cols.length < 6) return null;
          const [product, mfr, year, wt, unit, rate] = cols;
          return {
            id: `fert_${Date.now()}_${Math.floor(Math.random() * 100000)}`,
            productName: product.trim(),
            manufacturerName: mfr.trim(),
            year: year.trim(),
            weightVolume: parseFloat(wt) || 1,
            packingUnit: unit.trim() || "Bags",
            ratePerUnit: parseFloat(rate) || 0
          };
        }).filter(Boolean) as any[];

        if (newRecords.length > 0) {
          const updated = [...newRecords, ...fertilizersRegistry];
          updateFertilizersRegistry(updated);
          count = newRecords.length;
        }
      }

      alert(`Successfully imported ${count} records into the registry catalog!`);
    } catch (e) {
      console.error(e);
      alert("Error parsing the CSV file. Please make sure it matches the downloaded template format.");
    }
  };

  // Staff and Village Excel/CSV Synchronization handlers
  const downloadStaffTemplate = (type: "assistants" | "employees" | "villages") => {
    let headers = "";
    let sample = "";
    let filename = "";

    if (type === "assistants") {
      headers = "Full Name,Mobile Number,Password,Aadhaar Number,Designation,Mapped Village,Bank Name,Account Number,IFSC Code,Emergency Contact,Salary\n";
      sample = "Rajesh Patel,9111222333,pass123,1234-5678-9012,Village Supervisor,Rampur,State Bank of India,1122334455,SBIN0001234,9888777666,25000\n";
      filename = "village_assistants_template.csv";
    } else if (type === "employees") {
      headers = "Full Name,Mobile Number,Password,Aadhaar Number,Designation,Bank Name,Account Number,IFSC Code,Emergency Contact,Salary\n";
      sample = "Manish Sharma,9333444555,pass456,8888-7777-6666,Hub Operator,HDFC Bank,9988776655,HDFC0000123,9777666555,22000\n";
      filename = "other_employees_template.csv";
    } else {
      headers = "Village Name,District,State,Sown Area Acres,Contact Person,Contact Mobile\n";
      sample = "Pipalia,Dhar,Madhya Pradesh,120,Rakesh Patel,9111222333\n";
      filename = "village_enrollment_template.csv";
    }

    const csvContent = "data:text/csv;charset=utf-8," + encodeURIComponent(headers + sample);
    const link = document.createElement("a");
    link.setAttribute("href", csvContent);
    link.setAttribute("download", filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const exportStaffLive = (type: "assistants" | "employees" | "villages") => {
    let csvContent = "";
    let filename = "";

    if (type === "assistants") {
      csvContent = "Full Name,Mobile Number,Password,Aadhaar Number,Designation,Mapped Village,Bank Name,Account Number,IFSC Code,Emergency Contact,Salary\n" +
        assistantUsers.filter(u => u.roleType === "assistant" || !u.roleType).map(u => 
          `"${u.name}","${u.mobileNumber}","${u.password || "password"}","${u.aadhaarNumber || ""}","${u.designation || "Village Supervisor"}","${u.villageName}","${u.bankName || ""}","${u.bankAccountNo || ""}","${u.bankIfscCode || ""}","${u.emergencyContact || ""}",${u.salaryAmount || 0}`
        ).join("\n");
      filename = `village_assistants_export_${globalYear}.csv`;
    } else if (type === "employees") {
      csvContent = "Full Name,Mobile Number,Password,Aadhaar Number,Designation,Bank Name,Account Number,IFSC Code,Emergency Contact,Salary\n" +
        assistantUsers.filter(u => u.roleType === "employee").map(u => 
          `"${u.name}","${u.mobileNumber}","${u.password || "password"}","${u.aadhaarNumber || ""}","${u.designation || "General Staff"}","${u.bankName || ""}","${u.bankAccountNo || ""}","${u.bankIfscCode || ""}","${u.emergencyContact || ""}",${u.salaryAmount || 0}`
        ).join("\n");
      filename = `other_employees_export_${globalYear}.csv`;
    } else {
      csvContent = "Village Name,District,State,Sown Area Acres,Contact Person,Contact Mobile\n" +
        enrolledVillages.map(v => 
          `"${v.villageName}","${v.district}","${v.state}",${v.sownAreaAcres || 0},"${v.contactPerson || ""}","${v.contactMobile || ""}"`
        ).join("\n");
      filename = `village_enrollment_export_${globalYear}.csv`;
    }

    const encodedUri = "data:text/csv;charset=utf-8," + encodeURIComponent(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleBulkStaffImport = (fileContent: string, type: "assistants" | "employees" | "villages") => {
    try {
      const lines = fileContent.split("\n").map(l => l.trim()).filter(Boolean);
      if (lines.length <= 1) {
        alert("The uploaded file appears to be empty or contains no records.");
        return;
      }

      const rows: string[][] = [];
      for (let i = 1; i < lines.length; i++) {
        const line = lines[i];
        const cols: string[] = [];
        let cur = "";
        let inQuotes = false;
        for (let j = 0; j < line.length; j++) {
          const char = line[j];
          if (char === '"') inQuotes = !inQuotes;
          else if (char === ',' && !inQuotes) {
            cols.push(cur.trim());
            cur = "";
          } else {
            cur += char;
          }
        }
        cols.push(cur.trim());
        rows.push(cols.map(c => c.replace(/^["']|["']$/g, "")));
      }

      let count = 0;
      if (type === "assistants") {
        rows.forEach(cols => {
          if (cols.length < 2) return;
          const [name, mobile, password, aadhaar, designation, village, bankName, accountNo, ifsc, emergency, salary] = cols;
          
          const cleanMobile = mobile ? mobile.trim().replace(/\s+/g, "") : "";
          if (!name || !cleanMobile) return;

          const exists = assistantUsers.some(u => u.mobileNumber.trim().replace(/\D/g, "") === cleanMobile.replace(/\D/g, ""));
          if (exists) return;

          const newObj: AssistantUser = {
            name: name.trim(),
            mobileNumber: cleanMobile,
            villageName: village ? village.trim() : "Rampur",
            password: password ? password.trim() : "password",
            isActive: true,
            roleType: "assistant",
            designation: designation ? designation.trim() : "Village Supervisor",
            aadhaarNumber: aadhaar ? aadhaar.trim() : "",
            bankName: bankName ? bankName.trim() : "",
            bankAccountNo: accountNo ? accountNo.trim() : "",
            bankIfscCode: ifsc ? ifsc.trim() : "",
            emergencyContact: emergency ? emergency.trim() : "",
            salaryAmount: salary ? parseFloat(salary) : 25000,
            salaryLocked: true
          };
          onAddAssistantUser(newObj);
          count++;
        });
        alert(`Successfully imported ${count} Village Assistant records!`);
      } else if (type === "employees") {
        rows.forEach(cols => {
          if (cols.length < 2) return;
          const [name, mobile, password, aadhaar, designation, bankName, accountNo, ifsc, emergency, salary] = cols;
          
          const cleanMobile = mobile ? mobile.trim().replace(/\s+/g, "") : "";
          if (!name || !cleanMobile) return;

          const exists = assistantUsers.some(u => u.mobileNumber.trim().replace(/\D/g, "") === cleanMobile.replace(/\D/g, ""));
          if (exists) return;

          const newObj: AssistantUser = {
            name: name.trim(),
            mobileNumber: cleanMobile,
            villageName: "N/A",
            password: password ? password.trim() : "password",
            isActive: true,
            roleType: "employee",
            designation: designation ? designation.trim() : "General Staff",
            aadhaarNumber: aadhaar ? aadhaar.trim() : "",
            bankName: bankName ? bankName.trim() : "",
            bankAccountNo: accountNo ? accountNo.trim() : "",
            bankIfscCode: ifsc ? ifsc.trim() : "",
            emergencyContact: emergency ? emergency.trim() : "",
            salaryAmount: salary ? parseFloat(salary) : 22000,
            salaryLocked: true
          };
          onAddAssistantUser(newObj);
          count++;
        });
        alert(`Successfully imported ${count} Other Employee records!`);
      } else {
        const newVillages = [...enrolledVillages];
        rows.forEach(cols => {
          if (cols.length < 1) return;
          const [vName, district, state, sownArea, contactName, contactPhone] = cols;
          if (!vName) return;

          const exists = newVillages.some(v => v.villageName.toLowerCase() === vName.trim().toLowerCase());
          if (exists) return;

          newVillages.push({
            id: `v_${Date.now()}_${Math.floor(Math.random() * 100000)}`,
            villageName: vName.trim(),
            district: district ? district.trim() : "Indore",
            state: state ? state.trim() : "Madhya Pradesh",
            sownAreaAcres: parseFloat(sownArea) || 100,
            contactPerson: contactName ? contactName.trim() : "",
            contactMobile: contactPhone ? contactPhone.trim() : ""
          });
          count++;
        });
        if (count > 0) {
          updateEnrolledVillages(newVillages);
        }
        alert(`Successfully imported ${count} Village records!`);
      }
    } catch (e) {
      console.error(e);
      alert("Error parsing the CSV file. Please make sure it matches the downloaded template format.");
    }
  };

  const handleRegisterVillageSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newVillageName) {
      setVillageErrorAlert("Please fill in the Village Name.");
      return;
    }

    const cleanName = newVillageName.trim();
    const exists = enrolledVillages.some(v => v.villageName.toLowerCase() === cleanName.toLowerCase());
    if (exists) {
      setVillageErrorAlert(`Village ${cleanName} is already enrolled.`);
      setVillageSuccessAlert("");
      return;
    }

    const newObj = {
      id: `v_${Date.now()}_${Math.floor(Math.random() * 100000)}`,
      villageName: cleanName,
      district: newVillageDistrict.trim() || "Indore",
      state: newVillageState.trim() || "Madhya Pradesh",
      sownAreaAcres: parseFloat(newVillageSownArea) || 0,
      contactPerson: newVillageContactPerson.trim(),
      contactMobile: newVillageContactMobile.trim()
    };

    const updated = [...enrolledVillages, newObj];
    updateEnrolledVillages(updated);
    setVillageSuccessAlert(`Successfully enrolled ${cleanName} Village!`);
    setVillageErrorAlert("");

    // Reset Form
    setNewVillageName("");
    setNewVillageDistrict("Indore");
    setNewVillageState("Madhya Pradesh");
    setNewVillageSownArea("");
    setNewVillageContactPerson("");
    setNewVillageContactMobile("");

    setTimeout(() => {
      setVillageSuccessAlert("");
    }, 3000);
  };

  const handleDeleteVillage = (id: string, name: string) => {
    if (confirm(`Are you sure you want to de-enroll ${name} Village? This will remove it from future selections.`)) {
      const updated = enrolledVillages.filter(v => v.id !== id);
      updateEnrolledVillages(updated);
    }
  };

  // States for Fertilizer/Pesticide form enrollment
  const [newFertName, setNewFertName] = useState("");
  const [newFertMfr, setNewFertMfr] = useState("");
  const [newFertYear, setNewFertYear] = useState("2026");
  const [newFertWeightVolume, setNewFertWeightVolume] = useState<number>(50);
  const [newFertPackingUnit, setNewFertPackingUnit] = useState<string>("Bags");
  const [newFertRate, setNewFertRate] = useState("");
  const [fertSuccessAlert, setFertSuccessAlert] = useState("");

  // Active unique villages in farmer distribution
  const uniqueVillages = useMemo(() => {
    const list = new Set<string>();
    farmerDistributions.forEach(fd => {
      if (fd.villageName) list.add(fd.villageName);
    });
    // Fallback defaults
    if (list.size === 0) {
      list.add("Rampur");
      list.add("Dhamnod");
      list.add("Nemawar");
    }
    return Array.from(list);
  }, [farmerDistributions]);

  // Find all distributions for the selected consolidated farmer
  const farmerCollections = useMemo(() => {
    if (!selectedConsolidatedFarmer) return [];
    return farmerDistributions.filter(fd => 
      fd.farmerName.toLowerCase() === selectedConsolidatedFarmer.toLowerCase() &&
      (!selectedConsolidatedMobile || fd.mobileNumber === selectedConsolidatedMobile)
    );
  }, [farmerDistributions, selectedConsolidatedFarmer, selectedConsolidatedMobile]);

  // Generate aggregate product summaries
  const productAggregates = useMemo(() => {
    const agg: Record<string, number> = {};
    farmerCollections.forEach(c => {
      agg[c.productName] = (agg[c.productName] || 0) + c.bagCount;
    });
    return Object.entries(agg).map(([name, bags]) => `${name} (${bags} Bags)`).join(", ");
  }, [farmerCollections]);

  // Formulate share text
  const getWhatsAppShareText = () => {
    if (farmerCollections.length === 0) return "";
    const fName = farmerCollections[0].farmerName;
    const vName = farmerCollections[0].villageName;
    const mNum = farmerCollections[0].mobileNumber;
    
    let msg = `🌾 *CONSOLIDATED FERTILIZER & PESTICIDES LEDGER* 🌾\n`;
    msg += `------------------------------------------------\n`;
    msg += `*Farmer Name:* ${fName}\n`;
    msg += `*Mobile Number:* ${mNum}\n`;
    msg += `*Village Route:* ${vName}\n`;
    msg += `------------------------------------------------\n`;
    msg += `*Date-wise Collections:*\n`;
    farmerCollections.forEach(c => {
      msg += `• ${c.date || "2026-06-22"}: ${c.productName} - ${c.bagCount} Bags @ ₹${c.ratePerBag} = ₹${c.totalAmount.toLocaleString()} (${c.paymentStatus})\n`;
    });
    msg += `------------------------------------------------\n`;
    const totBags = farmerCollections.reduce((sum, c) => sum + c.bagCount, 0);
    const totAmt = farmerCollections.reduce((sum, c) => sum + c.totalAmount, 0);
    const totPaid = farmerCollections.reduce((sum, c) => sum + c.amountCollected, 0);
    const totBal = farmerCollections.reduce((sum, c) => sum + c.balanceAmount, 0);
    
    msg += `*Total Bags Collected:* ${totBags} Bags\n`;
    msg += `*Total Ledger Amount:* ₹${totAmt.toLocaleString()}\n`;
    msg += `*Total Amount Paid:* ₹${totPaid.toLocaleString()}\n`;
    msg += `*Outstanding Balance:* ₹${totBal.toLocaleString()}\n`;
    msg += `------------------------------------------------\n`;
    msg += `Please clear any outstanding balances as soon as possible. Thank you!`;
    return msg;
  };

  const handleCopyShareText = () => {
    const text = getWhatsAppShareText();
    navigator.clipboard.writeText(text);
    setCopiedSuccess(true);
    setTimeout(() => setCopiedSuccess(false), 2000);
  };

  const handleShareWhatsApp = () => {
    const text = encodeURIComponent(getWhatsAppShareText());
    const mNum = farmerCollections[0]?.mobileNumber || "";
    const cleanNum = mNum.replace(/[^0-9]/g, "");
    const url = `https://api.whatsapp.com/send?phone=${cleanNum}&text=${text}`;
    window.open(url, "_blank");
  };

  // Group bills by billNumber to form full multi-product invoices!
  const groupedInvoices = useMemo(() => {
    const groups: Record<string, {
      billNumber: string;
      supplierName: string;
      billDate: string;
      notes: string;
      approvalStatus: string;
      paymentStatus: string;
      items: SupplierBill[];
      totalAmount: number;
    }> = {};

    supplierBills.forEach(bill => {
      const key = bill.billNumber || "UNKNOWN";
      if (!groups[key]) {
        groups[key] = {
          billNumber: key,
          supplierName: bill.supplierName,
          billDate: bill.billDate || new Date().toISOString().split("T")[0],
          notes: bill.notes || "",
          approvalStatus: bill.approvalStatus,
          paymentStatus: bill.paymentStatus,
          items: [],
          totalAmount: 0
        };
      }
      groups[key].items.push(bill);
      groups[key].totalAmount += bill.totalAmount;

      // Consolidate Group statuses:
      // If any item is not Approved, entire invoice is not yet Proprietor Approved
      if (bill.approvalStatus !== "Approved" && groups[key].approvalStatus === "Approved") {
        groups[key].approvalStatus = bill.approvalStatus;
      } else if (bill.approvalStatus === "Pending Approval" && groups[key].approvalStatus !== "Approved") {
        groups[key].approvalStatus = "Pending Approval";
      }
      
      // If any is Unpaid, entire invoice is unpaid/partial
      if (bill.paymentStatus !== "Paid" && groups[key].paymentStatus === "Paid") {
        groups[key].paymentStatus = bill.paymentStatus;
      }
    });

    return Object.values(groups);
  }, [supplierBills]);

  // Filter invoices based on searchQuery (filters by billNumber, supplierName, or productName)
  const filteredInvoices = useMemo(() => {
    return groupedInvoices.filter(inv => 
      inv.billNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      inv.supplierName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      inv.items.some(item => item.productName.toLowerCase().includes(searchQuery.toLowerCase()))
    );
  }, [groupedInvoices, searchQuery]);

  // Filter pending payment requests (advances) for the Accountant Advances queue
  const activeAdvances = useMemo(() => {
    return paymentRequests.filter(pr => pr.status === "Pending" || (pr as any).paid !== true);
  }, [paymentRequests]);

  const activeRates = useMemo(() => {
    return fertilizerRates || {
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
  }, [fertilizerRates]);

  // Active invoice being viewed/edited
  const activeInvoice = useMemo(() => {
    if (!selectedInvoiceNumber) return null;
    return groupedInvoices.find(inv => inv.billNumber === selectedInvoiceNumber) || null;
  }, [selectedInvoiceNumber, groupedInvoices]);

  // HANDLERS FOR INVOICES (SUPPLIER BILLS)
  const handleRequestOwnerApprovalForInvoice = (invNumber: string) => {
    if (!onUpdateSupplierBills) return;
    const explanation = prompt(
      `Submit multi-product Invoice ${invNumber} for Proprietor authorization. Enter explanation notes:`,
      "Reviewed inward stock invoices and products verify. Releasing for payment authorization."
    );
    if (explanation === null) return;

    const updated = supplierBills.map(bill => {
      if (bill.billNumber === invNumber) {
        return {
          ...bill,
          approvalStatus: "Pending Approval" as any,
          notes: explanation || "General invoice clearance validation request."
        };
      }
      return bill;
    });

    onUpdateSupplierBills(updated);
    alert(`Invoice ${invNumber} has been submitted to the Proprietor for sign-off.`);
  };

  const handleOpenPaymentModal = (invNumber: string) => {
    const inv = groupedInvoices.find(i => i.billNumber === invNumber);
    if (!inv) return;
    setSelectedInvoiceNumber(invNumber);
    setPaymentAmount(inv.totalAmount.toString());
    setPaymentRef(`TXN-RTGS-${Math.floor(100000 + Math.random() * 900000)}`);
    setPaymentNotes("Disbursed via central RTGS clearance.");
    setShowPaymentModal(true);
  };

  const handleProcessPaymentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedInvoiceNumber || !onUpdateSupplierBills || !activeInvoice) return;

    setIsSubmittingPayment(true);

    setTimeout(() => {
      const isFull = parseFloat(paymentAmount) >= activeInvoice.totalAmount;

      const updated = supplierBills.map(bill => {
        if (bill.billNumber === selectedInvoiceNumber) {
          return {
            ...bill,
            paymentStatus: (isFull ? "Paid" : "Partial") as any,
            notes: `${bill.notes || ""} | Paid ₹${parseFloat(paymentAmount).toLocaleString()} via ${paymentMode} (${paymentRef}) - ${paymentNotes}`
          };
        }
        return bill;
      });

      onUpdateSupplierBills(updated);
      setIsSubmittingPayment(false);
      setShowPaymentModal(false);
      setShowShareModal(true); // Open the receipt sharing window immediately after payment!
    }, 1000);
  };

  const handleShareReceiptSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSharingReceipt(true);

    setTimeout(() => {
      setIsSharingReceipt(false);
      setShareSuccess(true);
      setTimeout(() => {
        setShareSuccess(false);
        setShowShareModal(false);
        setSelectedInvoiceNumber(null);
      }, 2000);
    }, 1200);
  };

  // HANDLERS FOR FARMER FERTILIZER BILLS
  const handleToggleFarmerBillReview = (fdId: string) => {
    let updated: string[];
    if (reviewedFarmerBillIds.includes(fdId)) {
      updated = reviewedFarmerBillIds.filter(id => id !== fdId);
    } else {
      updated = [...reviewedFarmerBillIds, fdId];
    }
    setReviewedFarmerBillIds(updated);
    localStorage.setItem("ks_reviewed_farmer_bills", JSON.stringify(updated));
  };

  const handleReviewAllInVillage = (village: string) => {
    const villageBillIds = farmerDistributions
      .filter(fd => fd.villageName.toLowerCase() === village.toLowerCase())
      .map(fd => fd.id);

    const merged = Array.from(new Set([...reviewedFarmerBillIds, ...villageBillIds]));
    setReviewedFarmerBillIds(merged);
    localStorage.setItem("ks_reviewed_farmer_bills", JSON.stringify(merged));
    alert(`All fertilizer distributions in ${village} marked as Checked & Verified.`);
  };

  // HANDLERS FOR FARMER ADVANCES
  const handleOpenEditAdvance = (advId: string, currentAmount: number, currentNotes: string) => {
    setEditingAdvanceId(advId);
    setEditAdvanceAmount(currentAmount.toString());
    setEditAdvanceNotes(currentNotes);
  };

  const handleSaveModifiedAdvance = (advId: string) => {
    if (!onUpdatePaymentRequests) return;
    const newAmt = parseFloat(editAdvanceAmount);
    if (isNaN(newAmt) || newAmt <= 0) {
      alert("Please enter a valid amount.");
      return;
    }

    const updated = paymentRequests.map(pr => {
      if (pr.id === advId) {
        return {
          ...pr,
          amountModified: newAmt,
          notes: editAdvanceNotes || pr.notes
        };
      }
      return pr;
    });

    onUpdatePaymentRequests(updated);
    setEditingAdvanceId(null);
  };

  const handleSubmitAdvanceToProprietor = (advId: string) => {
    if (!onUpdatePaymentRequests) return;
    
    const updated = paymentRequests.map(pr => {
      if (pr.id === advId) {
        return {
          ...pr,
          ownerApprovalRequested: true,
          ownerApproved: false,
          ownerRejected: false,
          notes: `${pr.notes || ""} | [Accountant Submitted for Owner Sign-off]`
        };
      }
      return pr;
    });

    onUpdatePaymentRequests(updated);
    alert("Advance request submitted to proprietor approval queue.");
  };

  const handleToggleAdvanceBulkSelection = (advId: string) => {
    if (bulkSelectedAdvanceIds.includes(advId)) {
      setBulkSelectedAdvanceIds(bulkSelectedAdvanceIds.filter(id => id !== advId));
    } else {
      setBulkSelectedAdvanceIds([...bulkSelectedAdvanceIds, advId]);
    }
  };

  // Bulk Submit to Proprietor Action
  const handleBulkSubmitToProprietorConfirm = () => {
    if (!onUpdatePaymentRequests) return;

    // Filter out only those selected advances that are pending/review
    const pendingSelected = paymentRequests.filter(
      pr => bulkSelectedAdvanceIds.includes(pr.id) && pr.status === "Pending" && !pr.ownerApprovalRequested && !pr.paid
    );

    if (pendingSelected.length === 0) {
      alert("No valid pending advances selected for owner sign-off.");
      return;
    }

    const updated = paymentRequests.map(pr => {
      if (pendingSelected.some(ps => ps.id === pr.id)) {
        return {
          ...pr,
          ownerApprovalRequested: true,
          ownerApproved: false,
          ownerRejected: false,
          notes: `${pr.notes || ""} | [Accountant Bulk Submitted for Owner Sign-off]`
        };
      }
      return pr;
    });

    onUpdatePaymentRequests(updated);
    setBulkSelectedAdvanceIds([]);
    setShowBulkSubmitPreview(false);
    alert(`Successfully submitted ${pendingSelected.length} advance requests for Proprietor sign-off.`);
  };

  // Bulk Disbursement Action
  const handleBulkDisburseApprovedAdvancesConfirm = () => {
    if (!onUpdatePaymentRequests) return;

    // Filter out only those selected advances that are owner approved and unpaid
    const approvedSelected = paymentRequests.filter(
      pr => bulkSelectedAdvanceIds.includes(pr.id) && pr.ownerApproved === true && !pr.paid
    );

    if (approvedSelected.length === 0) {
      alert("No approved, unpaid advances selected for disbursal.");
      return;
    }

    const updated = paymentRequests.map(pr => {
      if (approvedSelected.some(as => as.id === pr.id)) {
        return {
          ...pr,
          status: "Approved" as any,
          paid: true,
          ownerApprovalRequested: false,
          ownerApproved: true,
          notes: `${pr.notes || ""} | Paid via bulk accountant disbursal.`
        };
      }
      return pr;
    });

    onUpdatePaymentRequests(updated);
    setBulkSelectedAdvanceIds([]);
    setShowBulkDisbursePreview(false);
    alert(`Successfully processed and disbursed bulk payments for ${approvedSelected.length} approved advances.`);
  };


  // MANAGE VILLAGE ASSISTANTS NATIVE CODE
  const handleRegisterAssistantSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAsstName || !newAsstMobile) {
      setAsstErrorAlert("Please fill in Name and Contact number.");
      return;
    }

    const cleanMobile = newAsstMobile.trim().replace(/\s+/g, "");
    const exists = assistantUsers.some(u => u.mobileNumber.trim().replace(/\D/g, "") === cleanMobile.replace(/\D/g, ""));
    if (exists) {
      setAsstErrorAlert(`A staff member with mobile number ${newAsstMobile} is already registered.`);
      setAsstSuccessAlert("");
      return;
    }

    const newObj: AssistantUser = {
      name: newAsstName.trim(),
      mobileNumber: cleanMobile,
      villageName: newAsstRoleType === "assistant" ? newAsstVillage : "N/A",
      password: newAsstPassword || "password",
      isActive: true,
      roleType: newAsstRoleType,
      designation: newAsstDesignation || (newAsstRoleType === "assistant" ? "Village Supervisor" : "General Staff"),
      aadhaarNumber: newAsstAadhaarNumber.trim(),
      bankName: newAsstBankName.trim(),
      bankAccountNo: newAsstBankAccountNo.trim(),
      bankIfscCode: newAsstBankIfscCode.trim(),
      emergencyContact: newAsstEmergencyContact.trim(),
      salaryAmount: newAsstSalaryAmount ? parseFloat(newAsstSalaryAmount) : undefined,
      salaryLocked: true // Locked automatically for security / audit trail
    };

    onAddAssistantUser(newObj);
    setAsstSuccessAlert(`Registered ${newAsstName} as ${newObj.designation}!`);
    setAsstErrorAlert("");
    
    // Reset form
    setNewAsstName("");
    setNewAsstMobile("");
    setNewAsstPassword("password");
    setNewAsstAadhaarNumber("");
    setNewAsstBankName("");
    setNewAsstBankAccountNo("");
    setNewAsstBankIfscCode("");
    setNewAsstEmergencyContact("");
    setNewAsstSalaryAmount("");
    setNewAsstSalaryLocked(true);

    setTimeout(() => {
      setAsstSuccessAlert("");
    }, 3000);
  };

  const handleEditAssistantSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingAssistantMobile) return;
    if (!editAsstName || !editAsstMobile) {
      setAsstErrorAlert("Please fill in Name and Contact number.");
      return;
    }

    const cleanMobile = editAsstMobile.trim().replace(/\s+/g, "");
    
    const exists = assistantUsers.some(
      u => u.mobileNumber !== editingAssistantMobile && 
           u.mobileNumber.trim().replace(/\D/g, "") === cleanMobile.replace(/\D/g, "")
    );
    if (exists) {
      setAsstErrorAlert(`A staff member with mobile number ${editAsstMobile} is already registered.`);
      return;
    }

    const updatedObj: AssistantUser = {
      name: editAsstName.trim(),
      mobileNumber: cleanMobile,
      villageName: editAsstRoleType === "assistant" ? editAsstVillage : "N/A",
      password: editAsstPassword || "password",
      isActive: editAsstIsActive,
      roleType: editAsstRoleType,
      designation: editAsstDesignation || (editAsstRoleType === "assistant" ? "Village Supervisor" : "General Staff"),
      aadhaarNumber: editAsstAadhaarNumber.trim(),
      bankName: editAsstBankName.trim(),
      bankAccountNo: editAsstBankAccountNo.trim(),
      bankIfscCode: editAsstBankIfscCode.trim(),
      emergencyContact: editAsstEmergencyContact.trim(),
      salaryAmount: editAsstSalaryAmount ? parseFloat(editAsstSalaryAmount) : undefined,
      salaryLocked: editAsstSalaryLocked
    };

    if (onUpdateAssistantUser) {
      onUpdateAssistantUser(editingAssistantMobile, updatedObj);
      setAsstSuccessAlert(`Profile ${editAsstName} Updated Successfully!`);
      setAsstErrorAlert("");
      setEditingAssistantMobile(null);
      setTimeout(() => setAsstSuccessAlert(""), 3000);
    }
  };

  return (
    <div id="accountant-main-view" className="flex-1 flex flex-col justify-start">
      {/* Finance Sticky Header */}
      <div className="bg-gradient-to-r from-brand-900 via-brand-800 to-brand-900 text-white px-5 py-4 flex items-center justify-between sticky top-0 z-10 shadow-md border-b border-brand-950/30">
        <div className="flex flex-col text-left">
          <span className="text-[11px] font-semibold text-white/80 uppercase tracking-wider">
            Finance &amp; Audit Dashboard
          </span>
          <h2 className="text-sm font-bold font-display text-white">
            Accounts &amp; Ledger Console
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
            id="btn-accountant-logout"
            onClick={onLogout}
            className="text-[10px] px-2.5 py-1 bg-white/10 hover:bg-white/20 text-white rounded-lg font-bold border border-white/15 transition"
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
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Accounts Menu</span>
          </div>

          <button
            id="tab-btn-bills"
            onClick={() => setActiveTab("bills")}
            className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl font-bold transition text-[11px] ${
              activeTab === "bills" 
                ? "bg-brand-800 text-white shadow-sm" 
                : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
            }`}
          >
            <div className="flex items-center gap-2">
              <ClipboardList size={14} className="shrink-0" />
              <span>Invoices</span>
            </div>
            <span className={`text-[9px] px-1.5 py-0.5 rounded-full font-bold ${activeTab === 'bills' ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-600'}`}>
              {groupedInvoices.filter(i => i.paymentStatus !== "Paid").length}
            </span>
          </button>

          <button
            id="tab-btn-fertilizer"
            onClick={() => setActiveTab("fertilizer_bills")}
            className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl font-bold transition text-[11px] ${
              activeTab === "fertilizer_bills" 
                ? "bg-brand-800 text-white shadow-sm" 
                : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
            }`}
          >
            <div className="flex items-center gap-2">
              <Sparkles size={14} className="shrink-0" />
              <span>Farmer Fertilizer Bills</span>
            </div>
          </button>
          
          <button
            id="tab-btn-advances"
            onClick={() => setActiveTab("advances")}
            className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl font-bold transition text-[11px] ${
              activeTab === "advances" 
                ? "bg-brand-800 text-white shadow-sm" 
                : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
            }`}
          >
            <div className="flex items-center gap-2">
              <Landmark size={14} className="shrink-0" />
              <span>Farmer Advances</span>
            </div>
            {activeAdvances.length > 0 && (
              <span className="bg-rose-500 text-white text-[8px] font-extrabold px-1.5 py-0.5 rounded-full animate-pulse">
                {activeAdvances.length}
              </span>
            )}
          </button>

          <button
            id="tab-btn-rates"
            onClick={() => setActiveTab("rates")}
            className={`w-full flex items-center gap-2 px-3 py-2.5 rounded-xl font-bold transition text-[11px] ${
              activeTab === "rates"
                ? "bg-brand-800 text-white shadow-sm"
                : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
            }`}
          >
            <FolderSync size={14} className="shrink-0" />
            <span>Rates Registry</span>
          </button>

          <button
            id="tab-btn-assistants"
            onClick={() => setActiveTab("assistants")}
            className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl font-bold transition text-[11px] ${
              activeTab === "assistants"
                ? "bg-brand-800 text-white shadow-sm"
                : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
            }`}
          >
            <div className="flex items-center gap-2">
              <Users size={14} className="shrink-0" />
              <span>Manage Staff &amp; Employees</span>
            </div>
            <span className={`text-[9px] px-1.5 py-0.5 rounded-full font-bold ${activeTab === 'assistants' ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-600'}`}>
              {assistantUsers.length}
            </span>
          </button>

          <button
            id="tab-btn-employee-salaries"
            onClick={() => setActiveTab("employee_salaries")}
            className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl font-bold transition text-[11px] ${
              activeTab === "employee_salaries"
                ? "bg-brand-800 text-white shadow-sm"
                : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
            }`}
          >
            <div className="flex items-center gap-2">
              <Coins size={14} className="shrink-0" />
              <span>Process Employee Salaries</span>
            </div>
            <span className={`text-[9px] px-1.5 py-0.5 rounded-full font-bold ${activeTab === 'employee_salaries' ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-600'}`}>
              {assistantUsers.length}
            </span>
          </button>

          <button
            id="tab-btn-farmer-final-payments"
            onClick={() => setActiveTab("farmer_final_payments")}
            className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl font-bold transition text-[11px] ${
              activeTab === "farmer_final_payments"
                ? "bg-brand-800 text-white shadow-sm"
                : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
            }`}
          >
            <div className="flex items-center gap-2">
              <Landmark size={14} className="shrink-0" />
              <span>Farmer Final Payments</span>
            </div>
            <span className={`text-[9px] px-1.5 py-0.5 rounded-full font-bold ${activeTab === 'farmer_final_payments' ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-600'}`}>
              {farmerFinalPayments.filter(p => p.status !== 'Paid').length}
            </span>
          </button>

          <button
            id="tab-btn-razorpayx"
            onClick={() => setActiveTab("razorpayx")}
            className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl font-bold transition text-[11px] ${
              activeTab === "razorpayx"
                ? "bg-brand-800 text-white shadow-sm"
                : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
            }`}
          >
            <div className="flex items-center gap-2">
              <Sparkles size={14} className="text-emerald-600 shrink-0" />
              <span>RazorpayX Payout Core</span>
            </div>
            <span className="bg-emerald-100 text-emerald-800 text-[8px] px-1.5 py-0.5 rounded-full font-extrabold uppercase">
              Instant
            </span>
          </button>

          <button
            id="tab-btn-field-verifications"
            onClick={() => setActiveTab("field_verifications")}
            className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl font-bold transition text-[11px] ${
              activeTab === "field_verifications"
                ? "bg-brand-800 text-white shadow-sm"
                : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
            }`}
          >
            <div className="flex items-center gap-2">
              <FileCheck size={14} className="shrink-0 text-amber-500" />
              <span>Sowing Audit Desk</span>
            </div>
            {fieldVerifications.filter(v => v.status === "Pending Review").length > 0 && (
              <span className="bg-amber-600 text-white text-[8px] px-1.5 py-0.5 rounded-full font-black animate-pulse">
                {fieldVerifications.filter(v => v.status === "Pending Review").length} PENDING
              </span>
            )}
          </button>

          <button
            id="tab-btn-history"
            onClick={() => setActiveTab("history")}
            className={`w-full flex items-center gap-2 px-3 py-2.5 rounded-xl font-bold transition text-[11px] ${
              activeTab === "history" 
                ? "bg-brand-800 text-white shadow-sm" 
                : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
            }`}
          >
            <Clock size={14} className="shrink-0" />
            <span>Paid History Archive</span>
          </button>
        </div>

        {/* Workspace Display Area (Right Column) */}
        <div className="flex-1 p-5 md:p-6 overflow-y-auto space-y-4 max-w-5xl mx-auto w-full">
          
        {/* TAB 1: INVOICES (GROUPED BY INVOICE NUMBER) */}
        {activeTab === "bills" && (
          <div className="space-y-4 text-left animate-in fade-in duration-200">
            <div className="bg-white p-4 rounded-xl border border-slate-200">
              <h2 className="text-xs font-bold text-slate-800 uppercase tracking-wide">Multi-Product Manufacturing Invoices</h2>
              <p className="text-[10px] text-slate-500 mt-0.5 leading-normal">
                Grouped and structured multi-product invoices submitted from inward stock depot entries. Submit draft invoices for Owner verification, disburse payments upon authorization, and share compliance receipts with manufacturers.
              </p>
            </div>

            {/* Quick search input */}
            <div className="bg-white p-3 rounded-xl border border-slate-200 flex items-center gap-2 shadow-2xs">
              <Search size={14} className="text-slate-400" />
              <input
                id="invoice-search"
                type="text"
                placeholder="Search invoices, manufacturers, product names..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full text-xs bg-transparent outline-none border-none placeholder-slate-400 font-semibold text-slate-700"
              />
            </div>

            {/* Invoices List */}
            {filteredInvoices.length === 0 ? (
              <div className="py-12 bg-white rounded-xl border border-dashed border-slate-200 text-center text-xs text-slate-400 font-bold">
                <ClipboardList size={36} className="mx-auto text-slate-300 mb-2" />
                <span>No inward manufacturing invoices match your filter terms.</span>
              </div>
            ) : (
              <div className="overflow-x-auto rounded-xl border border-slate-200 shadow-sm bg-white">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-extrabold uppercase tracking-wider text-[9px]">
                      <th className="py-3 px-4">Invoice No</th>
                      <th className="py-3 px-4">Manufacturer</th>
                      <th className="py-3 px-4 text-center">Inward Date</th>
                      <th className="py-3 px-4 text-center">Bags Count</th>
                      <th className="py-3 px-4 text-right">Total Payable</th>
                      <th className="py-3 px-4 text-center">Proprietor Status</th>
                      <th className="py-3 px-4 text-center">Payment Status</th>
                      <th className="py-3 px-4">Audit Notes</th>
                      <th className="py-3 px-4 text-center">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-semibold text-slate-850">
                    {filteredInvoices.map((invoice) => {
                      const isPaid = invoice.paymentStatus === "Paid";
                      const isApproved = invoice.approvalStatus === "Approved";
                      const isPendingApproval = invoice.approvalStatus === "Pending Approval";
                      const isDraft = !isApproved && !isPendingApproval;
                      const totalBagsCount = invoice.items.reduce((sum, item) => sum + item.bagCount, 0);

                      return (
                        <tr key={invoice.billNumber} className="hover:bg-slate-50/50 transition">
                          <td className="py-3.5 px-4 font-mono font-bold text-slate-900">
                            <span className="bg-slate-100 border border-slate-200 px-2 py-0.5 rounded shadow-3xs text-[11px]">
                              {invoice.billNumber}
                            </span>
                          </td>
                          <td className="py-3.5 px-4">
                            <span className="text-[12px] font-extrabold text-slate-900 block">{invoice.supplierName}</span>
                          </td>
                          <td className="py-3.5 px-4 text-center font-mono text-[11px] text-slate-500">
                            {invoice.billDate}
                          </td>
                          <td className="py-3.5 px-4 text-center">
                            <button
                              type="button"
                              onClick={() => setDrilldownInvoiceGroup(invoice)}
                              className="bg-brand-50 hover:bg-brand-100 text-brand-850 hover:text-brand-900 border border-brand-200 font-extrabold px-2.5 py-1 rounded-lg font-mono text-[10.5px] inline-flex items-center gap-1 cursor-pointer transition shadow-3xs"
                              title="Click to view all products and audit trace details under this invoice"
                            >
                              <Eye size={10} className="text-brand-850/80" />
                              {totalBagsCount} Bags
                            </button>
                          </td>
                          <td className="py-3.5 px-4 text-right font-mono font-bold text-slate-900 text-[12px]">
                            ₹{invoice.totalAmount.toLocaleString()}
                          </td>
                          <td className="py-3.5 px-4 text-center">
                            <span className={`text-[9px] font-bold px-2 py-0.5 rounded border inline-flex items-center gap-1 uppercase tracking-wider ${
                              isApproved 
                                ? "bg-emerald-50 text-emerald-800 border-emerald-150" 
                                : isPendingApproval 
                                ? "bg-amber-50 text-amber-800 border-amber-150 animate-pulse" 
                                : "bg-slate-100 text-slate-600 border-slate-200"
                            }`}>
                              {invoice.approvalStatus === "Hold" ? "On Hold" : invoice.approvalStatus}
                            </span>
                          </td>
                          <td className="py-3.5 px-4 text-center">
                            <span className={`text-[9px] font-bold px-2 py-0.5 rounded border inline-flex items-center gap-1 uppercase tracking-wider ${
                              isPaid 
                                ? "bg-emerald-100 text-emerald-900 border-emerald-200" 
                                : "bg-rose-50 text-rose-800 border-rose-150"
                            }`}>
                              {invoice.paymentStatus}
                            </span>
                          </td>
                          <td className="py-3.5 px-4 max-w-[180px] truncate text-[10.5px] text-slate-500 font-mono italic" title={invoice.notes || ""}>
                            {invoice.notes || "—"}
                          </td>
                          <td className="py-3.5 px-4 text-center">
                            <div className="flex gap-1.5 justify-center">
                              {isDraft && (
                                <button
                                  onClick={() => handleRequestOwnerApprovalForInvoice(invoice.billNumber)}
                                  className="bg-brand-50 hover:bg-brand-100 border border-brand-200 text-brand-800 font-bold px-2.5 py-1 rounded-lg text-[10px] cursor-pointer transition flex items-center gap-1"
                                >
                                  Sign-off
                                  <Send size={10} />
                                </button>
                              )}

                              {isPendingApproval && (
                                <span className="text-amber-700 bg-amber-50 border border-amber-150 font-bold px-2.5 py-1 rounded-lg text-[10px] flex items-center gap-1 select-none font-mono">
                                  <Clock size={10} className="animate-spin text-amber-500" />
                                  Pending
                                </span>
                              )}

                              {isApproved && !isPaid && (
                                <button
                                  onClick={() => handleOpenPaymentModal(invoice.billNumber)}
                                  className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-3 py-1 rounded-lg text-[10px] cursor-pointer transition flex items-center gap-1 shadow-sm"
                                >
                                  Disburse RTGS
                                  <ArrowRight size={10} />
                                </button>
                              )}

                              {isPaid && (
                                <div className="flex gap-1">
                                  <button
                                    onClick={() => {
                                      setSelectedInvoiceNumber(invoice.billNumber);
                                      setShowShareModal(true);
                                    }}
                                    className="bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 font-bold px-2 py-1 rounded-lg text-[10px] cursor-pointer transition flex items-center gap-1"
                                  >
                                    <Share2 size={10} />
                                    Receipt
                                  </button>
                                  <span className="bg-emerald-50 text-emerald-800 border border-emerald-150 font-bold px-2 py-1 rounded-lg text-[10px] flex items-center gap-1 select-none">
                                    Archive
                                  </span>
                                </div>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* TAB 2: FARMER FERTILIZER BILLS */}
        {activeTab === "fertilizer_bills" && (
          <div className="space-y-4 text-left animate-in fade-in duration-200">
            <div className="bg-white p-4 rounded-xl border border-slate-200">
              <h2 className="text-xs font-bold text-slate-800 uppercase tracking-wide">Farmer Fertilizer Bills &amp; Allocations Ledger</h2>
              <p className="text-[10px] text-slate-500 mt-0.5 leading-normal">
                Browse and search individual fertilizer and pesticide collections across different village routes and dates. View and generate itemized, consolidated farmer bills to share with beneficiaries directly.
              </p>
            </div>

            {/* Search and Dropdown Filter Row */}
            <div className="bg-white p-3.5 rounded-xl border border-slate-200 flex flex-wrap gap-3 items-center justify-between shadow-3xs">
              <div className="flex flex-wrap items-center gap-4 w-full sm:w-auto">
                {/* Village Route Dropdown Selector */}
                <div className="flex flex-col gap-1">
                  <span className="text-[9px] font-extrabold text-slate-400 uppercase tracking-wider">Filter Village Route:</span>
                  <select
                    value={selectedVillageForFertilizer}
                    onChange={(e) => setSelectedVillageForFertilizer(e.target.value)}
                    className="bg-slate-50 hover:bg-slate-100 text-slate-700 font-extrabold px-3 py-1.5 rounded-lg border border-slate-250 text-[11px] focus:outline-none focus:ring-1 focus:ring-brand-850 cursor-pointer min-w-[160px]"
                  >
                    <option value="All">🌍 All Villages (Routes)</option>
                    {uniqueVillages.map((v) => (
                      <option key={v} value={v}>📍 {v}</option>
                    ))}
                  </select>
                </div>

                {/* Farmer Search Box */}
                <div className="flex flex-col gap-1">
                  <span className="text-[9px] font-extrabold text-slate-400 uppercase tracking-wider">Search Farmer or Product:</span>
                  <div className="relative">
                    <input
                      type="text"
                      value={fertilizerSearchQuery}
                      onChange={(e) => setFertilizerSearchQuery(e.target.value)}
                      placeholder="Type name, phone, or product..."
                      className="bg-slate-50 hover:bg-slate-100 text-slate-700 font-extrabold pl-8 pr-8 py-1.5 rounded-lg border border-slate-250 text-[11px] focus:outline-none focus:ring-1 focus:ring-brand-850 w-[260px]"
                    />
                    <Search size={12} className="absolute left-2.5 top-2.5 text-slate-400" />
                    {fertilizerSearchQuery && (
                      <button
                        onClick={() => setFertilizerSearchQuery("")}
                        className="absolute right-2.5 top-2.5 text-slate-400 hover:text-slate-600 transition p-0.5 rounded"
                      >
                        <X size={12} />
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {/* Dynamic Summary Stats Pill */}
              <div className="flex gap-4 items-center bg-brand-50 border border-brand-100 rounded-xl px-4 py-2.5">
                <div className="text-right sm:text-left">
                  <span className="text-[8.5px] uppercase font-bold text-brand-850/80 tracking-wider block">Filtered Total Bags</span>
                  <span className="text-sm font-black text-brand-900 font-mono">
                    {(() => {
                      const filtered = farmerDistributions.filter(fd => {
                        const matchesVillage = selectedVillageForFertilizer === "All" || fd.villageName.toLowerCase() === selectedVillageForFertilizer.toLowerCase();
                        const matchesSearch = !fertilizerSearchQuery || 
                          fd.farmerName.toLowerCase().includes(fertilizerSearchQuery.toLowerCase()) ||
                          fd.mobileNumber.includes(fertilizerSearchQuery) ||
                          fd.productName.toLowerCase().includes(fertilizerSearchQuery.toLowerCase());
                        return matchesVillage && matchesSearch;
                      });
                      return filtered.reduce((sum, fd) => sum + fd.bagCount, 0);
                    })()} Bags
                  </span>
                </div>
              </div>
            </div>

            {/* Distributions Table */}
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-slate-100 border-b border-slate-200 text-slate-600 text-[10px] font-bold uppercase tracking-wider">
                      <th className="py-3 px-3.5">Date</th>
                      <th className="py-3 px-3.5">Farmer Name &amp; Contact</th>
                      <th className="py-3 px-3.5">Village Route</th>
                      <th className="py-3 px-3.5 text-right">Quantity</th>
                      <th className="py-3 px-3.5 text-right">Rate/Bag</th>
                      <th className="py-3 px-3.5 text-right">Total Bill</th>
                      <th className="py-3 px-3.5 text-center">Outstanding Details</th>
                      <th className="py-3 px-3.5 text-center">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-150">
                    {(() => {
                      const filteredDists = farmerDistributions.filter((fd) => {
                        const matchesVillage = selectedVillageForFertilizer === "All" || fd.villageName.toLowerCase() === selectedVillageForFertilizer.toLowerCase();
                        const matchesSearch = !fertilizerSearchQuery || 
                          fd.farmerName.toLowerCase().includes(fertilizerSearchQuery.toLowerCase()) ||
                          fd.mobileNumber.includes(fertilizerSearchQuery) ||
                          fd.productName.toLowerCase().includes(fertilizerSearchQuery.toLowerCase());
                        return matchesVillage && matchesSearch;
                      });

                      if (filteredDists.length === 0) {
                        return (
                          <tr>
                            <td colSpan={8} className="py-12 text-center text-slate-400 font-bold bg-slate-50/50">
                              No matching fertilizer distribution records found. Try adjusting filters or search string.
                            </td>
                          </tr>
                        );
                      }

                      // Calculate sums
                      const totalBillSum = filteredDists.reduce((sum, fd) => sum + fd.totalAmount, 0);
                      const totalPaidSum = filteredDists.reduce((sum, fd) => sum + fd.amountCollected, 0);
                      const totalPendingSum = filteredDists.reduce((sum, fd) => sum + fd.balanceAmount, 0);

                      return (
                        <>
                          {filteredDists.map((fd) => {
                            return (
                              <tr key={fd.id} className="hover:bg-slate-50/50 font-semibold text-slate-800 transition">
                                <td className="py-3 px-3.5 text-slate-500 font-mono text-[10px]">
                                  {fd.date || "2026-06-22"}
                                </td>
                                <td className="py-3 px-3.5 text-left">
                                  <span className="block font-bold text-slate-900">{fd.farmerName}</span>
                                  <span className="text-[10px] text-slate-400 font-mono block mt-0.5">{fd.mobileNumber}</span>
                                </td>
                                <td className="py-3 px-3.5 text-slate-600 text-[11px]">
                                  <span className="bg-slate-100 text-slate-700 px-1.5 py-0.5 rounded font-bold text-[10px]">
                                    {fd.villageName}
                                  </span>
                                </td>
                                <td className="py-3 px-3.5 text-right">
                                  <button
                                    type="button"
                                    onClick={() => setDrilldownFarmerDist(fd)}
                                    className="bg-brand-50 hover:bg-brand-100 text-brand-850 hover:text-brand-900 border border-brand-200 font-extrabold px-2.5 py-1.5 rounded-lg font-mono text-[11px] inline-flex items-center gap-1 cursor-pointer transition shadow-3xs"
                                    title="Click to audit distributed products and collection details"
                                  >
                                    <Eye size={10} className="text-brand-850/80" />
                                    {fd.bagCount} Bags
                                  </button>
                                </td>
                                <td className="py-3 px-3.5 text-right font-mono text-slate-600">₹ {fd.ratePerBag}</td>
                                <td className="py-3 px-3.5 text-right font-mono text-brand-850 font-bold">
                                  ₹ {fd.totalAmount.toLocaleString()}
                                </td>
                                <td className="py-3 px-3.5 text-center">
                                  <span className={`text-[9.5px] px-1.5 py-0.5 rounded font-extrabold font-mono uppercase tracking-wide inline-block ${
                                    fd.paymentStatus === "Paid" 
                                      ? "bg-emerald-50 text-emerald-800 border border-emerald-100" 
                                      : fd.paymentStatus === "Partial"
                                      ? "bg-amber-50 text-amber-800 border border-amber-100"
                                      : "bg-rose-50 text-rose-800 border border-rose-100"
                                  }`}>
                                    {fd.paymentStatus}
                                  </span>
                                  {fd.balanceAmount > 0 && (
                                    <span className="block text-[9px] text-rose-600 font-mono mt-0.5 font-bold">
                                      Bal: ₹{fd.balanceAmount.toLocaleString()}
                                    </span>
                                  )}
                                </td>
                                <td className="py-3 px-3.5 text-center">
                                  <button
                                    onClick={() => {
                                      setSelectedConsolidatedFarmer(fd.farmerName);
                                      setSelectedConsolidatedMobile(fd.mobileNumber);
                                      setShowConsolidatedModal(true);
                                    }}
                                    className="bg-brand-50 hover:bg-brand-100 text-brand-850 hover:text-brand-900 border border-brand-200 font-extrabold px-2.5 py-1.5 rounded-lg text-[10px] cursor-pointer transition flex items-center justify-center gap-1 mx-auto"
                                    title="View entire collection ledger for this farmer across dates and share bill"
                                  >
                                    <Share2 size={11} className="text-brand-850" />
                                    Consolidated Bill
                                  </button>
                                </td>
                              </tr>
                            );
                          })}
                          
                          {/* Aggregate Summary Row */}
                          <tr className="bg-brand-50/55 font-bold text-brand-850 border-t-2 border-brand-200">
                            <td colSpan={3} className="py-3 px-3.5 text-left text-[11px] font-extrabold">
                              {selectedVillageForFertilizer === "All" ? "All Villages" : selectedVillageForFertilizer} Route Aggregates:
                            </td>
                            <td className="py-3 px-3.5 text-right font-mono text-[10px] text-slate-500">
                              Records: {filteredDists.length}
                            </td>
                            <td colSpan={3} className="py-3 px-3.5 text-right font-mono text-[10px] text-emerald-950 pr-4">
                              <div className="flex flex-col gap-0.5 items-end">
                                <div>Total Value: <span className="text-xs font-bold font-mono text-slate-800">₹{totalBillSum.toLocaleString()}</span></div>
                                <div>Paid: <span className="text-xs font-bold font-mono text-emerald-700">₹{totalPaidSum.toLocaleString()}</span></div>
                                <div className="text-[11px] font-extrabold text-brand-900">Pending Bal: <span className="text-xs font-black font-mono">₹{totalPendingSum.toLocaleString()}</span></div>
                              </div>
                            </td>
                            <td></td>
                          </tr>
                        </>
                      );
                    })()}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: FARMER ADVANCES */}
        {activeTab === "advances" && (
          <div className="space-y-4 text-left animate-in fade-in duration-200">
            {/* Header explanation card */}
            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
              <div className="flex items-center gap-2">
                <span className="p-1.5 bg-brand-50 text-brand-850 rounded-lg">
                  <Sprout size={16} />
                </span>
                <h2 className="text-sm font-bold text-slate-800 uppercase tracking-wide">Farmer Sowing &amp; Land Advances</h2>
              </div>
              <p className="text-[11px] text-slate-600 mt-2 leading-relaxed">
                Review and process cash advances requested by Village Assistants on behalf of local farmers. The original advance request is secured as read-only. Adjust and authorize custom disbursement values under the <strong>Modify Column</strong>, submit batches to the Proprietor for sign-off, and execute secure bulk disbursals.
              </p>
            </div>

            {/* Advance Section Sub-Tabs */}
            <div className="flex bg-slate-100 p-1 rounded-xl border border-slate-200 max-w-md">
              <button
                type="button"
                onClick={() => setAdvanceSubTab("requests")}
                className={`flex-1 px-4 py-2 rounded-lg text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer whitespace-nowrap ${
                  advanceSubTab === "requests"
                    ? "bg-white text-brand-850 shadow-xs"
                    : "text-slate-600 hover:text-slate-950"
                }`}
              >
                <FileCheck size={13} />
                Advance Requests
                <span className="bg-rose-100 text-rose-700 text-[9px] px-1.5 py-0.2 rounded-full font-black">
                  {paymentRequests.filter(r => r.status === "Pending").length}
                </span>
              </button>

              <button
                type="button"
                onClick={() => setAdvanceSubTab("limits")}
                className={`flex-1 px-4 py-2 rounded-lg text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer whitespace-nowrap ${
                  advanceSubTab === "limits"
                    ? "bg-white text-brand-850 shadow-xs"
                    : "text-slate-600 hover:text-slate-950"
                }`}
              >
                <Settings size={13} />
                Acreage Limits
              </button>

              <button
                type="button"
                onClick={() => setAdvanceSubTab("funding")}
                className={`flex-1 px-4 py-2 rounded-lg text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer whitespace-nowrap ${
                  advanceSubTab === "funding"
                    ? "bg-white text-brand-850 shadow-xs"
                    : "text-slate-600 hover:text-slate-950"
                }`}
              >
                <Wallet size={13} />
                Company Funding
                <span className="bg-slate-200 text-slate-700 text-[9px] px-1.5 py-0.2 rounded-full font-black">
                  {companyFunds.length}
                </span>
              </button>
            </div>

            {advanceSubTab === "requests" && (
              <>
                {/* Village Selector, Search, & Stats Row */}
                <div className="bg-white p-4 rounded-xl border border-slate-200 flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between shadow-3xs">
              <div className="flex flex-wrap items-center gap-3">
                {/* Village Dropdown */}
                <div className="flex flex-col gap-1">
                  <label className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Route Village</label>
                  <select
                    value={selectedVillageForAdvance}
                    onChange={(e) => {
                      setSelectedVillageForAdvance(e.target.value);
                      setBulkSelectedAdvanceIds([]); // Clear selection when filter changes to prevent accidents
                    }}
                    className="bg-slate-50 hover:bg-slate-100 text-slate-700 font-semibold px-3 py-1.5 rounded-lg border border-slate-250 text-[11px] focus:outline-none focus:ring-1 focus:ring-brand-850 cursor-pointer min-w-[130px]"
                  >
                    <option value="All">All Villages (Route)</option>
                    {(() => {
                      const list = new Set<string>();
                      paymentRequests.forEach(pr => { if (pr.villageName) list.add(pr.villageName); });
                      farmerDistributions.forEach(fd => { if (fd.villageName) list.add(fd.villageName); });
                      return Array.from(list).map(village => (
                        <option key={village} value={village}>{village}</option>
                      ));
                    })()}
                  </select>
                </div>

                {/* Farmer Search Input */}
                <div className="flex flex-col gap-1">
                  <label className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Farmer Name Search</label>
                  <div className="relative">
                    <input
                      type="text"
                      value={farmerSearchQuery}
                      onChange={(e) => setFarmerSearchQuery(e.target.value)}
                      placeholder="Search farmer name or ID..."
                      className="bg-slate-50 hover:bg-slate-100 text-slate-700 font-semibold pl-8 pr-3 py-1.5 rounded-lg border border-slate-250 text-[11px] focus:outline-none focus:ring-1 focus:ring-brand-850 w-[200px]"
                    />
                    <Search size={12} className="absolute left-2.5 top-2.5 text-slate-400" />
                    {farmerSearchQuery && (
                      <button
                        onClick={() => setFarmerSearchQuery("")}
                        className="absolute right-2 top-2 text-slate-400 hover:text-slate-650 font-bold text-[10px]"
                      >
                        ✕
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {/* Financial Stats Summary */}
              <div className="flex items-center gap-4 border-l border-slate-150 pl-4 py-1 self-end md:self-auto">
                <div className="text-right">
                  <span className="text-[9px] text-slate-400 uppercase tracking-wider block">Total Pending Advances</span>
                  <span className="text-xs font-mono font-extrabold text-slate-800">
                    {paymentRequests.filter(pr => pr.status === "Pending" && !pr.paid).length} Requests
                  </span>
                </div>
                <div className="text-right border-l border-slate-150 pl-4">
                  <span className="text-[9px] text-slate-400 uppercase tracking-wider block">Total Disbursed Today</span>
                  <span className="text-xs font-mono font-extrabold text-emerald-700">
                    ₹ {paymentRequests
                      .filter(pr => pr.paid === true)
                      .reduce((sum, pr) => sum + (pr.amountModified || pr.amountProposed), 0)
                      .toLocaleString()}
                  </span>
                </div>
              </div>
            </div>

            {/* Bulk Actions Bar */}
            {bulkSelectedAdvanceIds.length > 0 && (
              <div className="bg-brand-50 border border-brand-150 p-3 rounded-xl flex flex-wrap gap-2.5 items-center justify-between shadow-3xs animate-in slide-in-from-top-2 duration-150">
                <div className="flex items-center gap-2">
                  <span className="bg-brand-850 text-white rounded-full text-[10px] w-5 h-5 flex items-center justify-center font-extrabold font-mono">
                    {bulkSelectedAdvanceIds.length}
                  </span>
                  <span className="text-[11px] text-brand-900 font-bold">
                    Farmer advances selected. Choose an action to preview and process in bulk:
                  </span>
                </div>

                <div className="flex gap-2">
                  {/* Bulk Submit Button */}
                  {(() => {
                    const pendingSelectedCount = paymentRequests.filter(
                      pr => bulkSelectedAdvanceIds.includes(pr.id) && pr.status === "Pending" && !pr.ownerApprovalRequested && !pr.paid
                    ).length;
                    return (
                      <button
                        onClick={() => setShowBulkSubmitPreview(true)}
                        disabled={pendingSelectedCount === 0}
                        className={`font-extrabold px-3 py-1.5 rounded-lg text-[10.5px] cursor-pointer transition flex items-center gap-1 shadow-2xs ${
                          pendingSelectedCount > 0
                            ? "bg-brand-800 hover:bg-brand-900 text-white"
                            : "bg-slate-100 text-slate-400 border border-slate-200 cursor-not-allowed"
                        }`}
                      >
                        <Send size={11} />
                        Bulk Submit to Owner ({pendingSelectedCount})
                      </button>
                    );
                  })()}

                  {/* Bulk Disburse Button */}
                  {(() => {
                    const approvedSelectedCount = paymentRequests.filter(
                      pr => bulkSelectedAdvanceIds.includes(pr.id) && pr.ownerApproved === true && !pr.paid
                    ).length;
                    return (
                      <button
                        onClick={() => setShowBulkDisbursePreview(true)}
                        disabled={approvedSelectedCount === 0}
                        className={`font-extrabold px-3 py-1.5 rounded-lg text-[10.5px] cursor-pointer transition flex items-center gap-1 shadow-2xs ${
                          approvedSelectedCount > 0
                            ? "bg-emerald-600 hover:bg-emerald-700 text-white animate-pulse"
                            : "bg-slate-100 text-slate-400 border border-slate-200 cursor-not-allowed"
                        }`}
                      >
                        <Coins size={11} />
                        Bulk Disburse Cash ({approvedSelectedCount})
                      </button>
                    );
                  })()}

                  <button
                    onClick={() => setBulkSelectedAdvanceIds([])}
                    className="text-slate-500 hover:text-slate-700 font-bold px-2 py-1.5 text-[10.5px] hover:underline"
                  >
                    Clear Selection
                  </button>
                </div>
              </div>
            )}

            {/* Advances Queue Table */}
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-slate-100 border-b border-slate-200 text-slate-600 text-[10px] font-bold uppercase tracking-wider">
                      {/* Master Checkbox Header */}
                      <th className="py-3 px-3 text-center w-12">
                        {(() => {
                          const visibleAdvances = activeAdvances.filter(adv => {
                            const matchesVillage = selectedVillageForAdvance === "All" || adv.villageName.toLowerCase() === selectedVillageForAdvance.toLowerCase();
                            const matchesSearch = adv.farmerName.toLowerCase().includes(farmerSearchQuery.toLowerCase()) || adv.id.toLowerCase().includes(farmerSearchQuery.toLowerCase());
                            return matchesVillage && matchesSearch;
                          });
                          const actionableVisible = visibleAdvances.filter(adv => !(adv as any).paid);
                          const isAllActionableSelected = actionableVisible.length > 0 && actionableVisible.every(adv => bulkSelectedAdvanceIds.includes(adv.id));
                          
                          return (
                            <button
                              onClick={() => {
                                if (isAllActionableSelected) {
                                  const visibleIds = actionableVisible.map(adv => adv.id);
                                  setBulkSelectedAdvanceIds(bulkSelectedAdvanceIds.filter(id => !visibleIds.includes(id)));
                                } else {
                                  const visibleIds = actionableVisible.map(adv => adv.id);
                                  setBulkSelectedAdvanceIds(Array.from(new Set([...bulkSelectedAdvanceIds, ...visibleIds])));
                                }
                              }}
                              disabled={actionableVisible.length === 0}
                              className="text-slate-400 hover:text-brand-850 disabled:opacity-30 inline-block align-middle focus:outline-none"
                              title="Toggle Select All Visible Unpaid"
                            >
                              {isAllActionableSelected ? (
                                <CheckSquare size={14} className="text-brand-850" />
                              ) : (
                                <Square size={14} />
                              )}
                            </button>
                          );
                        })()}
                      </th>
                      <th className="py-3 px-3">Transaction ID</th>
                      <th className="py-3 px-3">Farmer &amp; Land Details</th>
                      <th className="py-3 px-3 text-right">Requested Advance</th>
                      <th className="py-3 px-3 text-right">Modify Column</th>
                      <th className="py-3 px-3 text-right">Disbursed Column</th>
                      <th className="py-3 px-3">Purpose / Remarks</th>
                      <th className="py-3 px-3">Approval / Audit State</th>
                      <th className="py-3 px-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-150">
                    {(() => {
                      const visibleAdvances = activeAdvances.filter(adv => {
                        const matchesVillage = selectedVillageForAdvance === "All" || adv.villageName.toLowerCase() === selectedVillageForAdvance.toLowerCase();
                        const matchesSearch = adv.farmerName.toLowerCase().includes(farmerSearchQuery.toLowerCase()) || adv.id.toLowerCase().includes(farmerSearchQuery.toLowerCase());
                        return matchesVillage && matchesSearch;
                      });

                      if (visibleAdvances.length === 0) {
                        return (
                          <tr>
                            <td colSpan={9} className="py-12 text-center text-slate-400 font-bold bg-slate-50/50">
                              {farmerSearchQuery 
                                ? `No farmer advance requests matching "${farmerSearchQuery}" were found.`
                                : `No active farmer advance requests filed in ${selectedVillageForAdvance === "All" ? "any" : selectedVillageForAdvance} route.`}
                            </td>
                          </tr>
                        );
                      }

                      // Fetch enrolled farmers to match harvested acres
                      const enrolledList = (() => {
                        const saved = localStorage.getItem("enrolled_farmers");
                        if (saved) {
                          try { return JSON.parse(saved); } catch (e) { console.error(e); }
                        }
                        return [];
                      })();

                      return visibleAdvances.map((adv) => {
                        const isEditing = editingAdvanceId === adv.id;
                        const isOwnerApproved = (adv as any).ownerApproved === true;
                        const isOwnerRejected = (adv as any).ownerRejected === true;
                        const isAwaitingOwner = (adv as any).ownerApprovalRequested === true;
                        const isPaid = (adv as any).paid === true;

                        // Resolve harvesting acres from enrolled_farmers list
                        const matchedFarmer = enrolledList.find(
                          (f: any) => f.farmerName.toLowerCase().trim() === adv.farmerName.toLowerCase().trim()
                        );
                        const acres = matchedFarmer ? matchedFarmer.acres : 6;

                        const proposedAmt = adv.amountProposed;
                        const finalDisbursedValue = adv.amountModified !== undefined ? adv.amountModified : proposedAmt;

                        return (
                          <tr key={adv.id} className={`hover:bg-slate-50/50 font-semibold text-slate-800 ${isPaid ? "bg-slate-50/20" : ""}`}>
                            
                            {/* Individual selection checkbox */}
                            <td className="py-3 px-3 text-center">
                              {!isPaid ? (
                                <button
                                  onClick={() => handleToggleAdvanceBulkSelection(adv.id)}
                                  className="text-slate-400 hover:text-brand-850 transition inline-block align-middle focus:outline-none"
                                >
                                  {bulkSelectedAdvanceIds.includes(adv.id) ? (
                                    <CheckSquare size={14} className="text-brand-850" />
                                  ) : (
                                    <Square size={14} />
                                  )}
                                </button>
                              ) : (
                                <span className="text-[10px] text-slate-300 font-mono italic">-</span>
                              )}
                            </td>

                            {/* Transaction ID */}
                            <td className="py-3 px-3">
                              <span className="font-mono text-[10px] bg-slate-100 text-slate-650 px-1.5 py-0.5 rounded font-bold">
                                {adv.id}
                              </span>
                              <span className="text-[8px] text-slate-400 block mt-1 font-mono">{adv.dateRequested}</span>
                            </td>

                            {/* Farmer & Land Details */}
                            <td className="py-3 px-3">
                              <span className="font-bold text-slate-900 block text-[11px]">{adv.farmerName}</span>
                              <div className="flex flex-wrap items-center gap-1.5 mt-1">
                                <span className="text-[9px] text-slate-400 font-mono bg-slate-50 border border-slate-200 px-1 py-0.2 rounded">
                                  Village: {adv.villageName}
                                </span>
                                {/* Acres Sown Display */}
                                <span className="text-[9px] font-extrabold text-emerald-800 bg-emerald-50 border border-emerald-150 px-1 py-0.2 rounded flex items-center gap-0.5">
                                  <Sprout size={9} className="text-emerald-700" />
                                  {acres} Acres Harvesting
                                </span>
                              </div>
                              <span className="text-[9px] text-slate-400 block mt-1 font-medium italic">Asst: {adv.assistantName}</span>
                            </td>

                            {/* Original Requested Advance Amount (Read-Only) */}
                            <td className="py-3 px-3 text-right">
                              <span className="font-mono text-[11px] font-bold text-slate-600 bg-slate-100 border border-slate-200 px-2 py-0.5 rounded shadow-3xs" title="Requested by village assistant; not changeable.">
                                ₹ {proposedAmt.toLocaleString()}
                              </span>
                              <span className="text-[8px] text-slate-400 block mt-1">Original Request</span>
                            </td>

                            {/* Modify Column - Set modified disbursement value */}
                            <td className="py-3 px-3 text-right">
                              {isPaid ? (
                                <span className="font-mono text-[11px] text-slate-400 font-bold bg-slate-50 px-2 py-0.5 rounded">
                                  ₹ {finalDisbursedValue.toLocaleString()}
                                </span>
                              ) : isEditing ? (
                                <div className="flex flex-col gap-1 items-end">
                                  <input
                                    type="number"
                                    value={editAdvanceAmount}
                                    onChange={(e) => setEditAdvanceAmount(e.target.value)}
                                    className="w-20 p-1 border border-brand-300 rounded font-bold text-right font-mono bg-white text-xs outline-none"
                                    placeholder="Amount"
                                  />
                                  <span className="text-[8px] text-brand-700">Set approved amount</span>
                                </div>
                              ) : (
                                <div className="flex flex-col gap-0.5 items-end">
                                  <button
                                    onClick={() => handleOpenEditAdvance(adv.id, finalDisbursedValue, adv.notes || "")}
                                    className="font-mono text-[11.5px] font-extrabold text-brand-850 hover:bg-brand-50 border border-brand-200 border-dashed hover:border-solid px-2 py-0.5 rounded shadow-3xs transition inline-flex items-center gap-1 cursor-pointer focus:outline-none"
                                    title="Click to modify advance amount"
                                  >
                                    ₹ {finalDisbursedValue.toLocaleString()}
                                    <Edit2 size={9} className="text-brand-600 opacity-60 hover:opacity-100" />
                                  </button>
                                  <span className="text-[8px] text-slate-400 block mt-0.5">Click amount to modify</span>
                                </div>
                              )}
                            </td>

                            {/* Disbursed Column */}
                            <td className="py-3 px-3 text-right">
                              {isPaid ? (
                                <div className="flex flex-col items-end gap-0.5">
                                  <span className="font-mono text-xs font-black text-emerald-700 bg-emerald-50 border border-emerald-150 px-2.5 py-0.5 rounded shadow-2xs">
                                    ₹ {finalDisbursedValue.toLocaleString()}
                                  </span>
                                  <span className="text-[8px] text-emerald-600 font-bold uppercase tracking-wider">Disbursed ✓</span>
                                </div>
                              ) : (
                                <div className="flex flex-col items-end gap-0.5">
                                  <span className="font-mono text-[11px] font-bold text-slate-500 bg-slate-50 border border-slate-150 px-2 py-0.5 rounded italic">
                                    ₹ {finalDisbursedValue.toLocaleString()}
                                  </span>
                                  <span className="text-[8px] text-slate-400 uppercase tracking-wider font-semibold">
                                    {isOwnerApproved ? "Pending Cashier" : "Projection (Est.)"}
                                  </span>
                                </div>
                              )}
                            </td>

                            {/* Purpose / Remarks */}
                            <td className="py-3 px-3 text-slate-600 font-mono text-[10px] leading-relaxed max-w-[180px] truncate">
                              {isEditing ? (
                                <input
                                  type="text"
                                  value={editAdvanceNotes}
                                  onChange={(e) => setEditAdvanceNotes(e.target.value)}
                                  placeholder="purpose..."
                                  className="w-full p-1 border border-slate-200 rounded text-[10px] bg-white outline-none font-sans"
                                />
                              ) : (
                                <div className="group relative">
                                  <span className="text-slate-700 text-[10.5px] font-sans">
                                    {adv.notes || "Sowing support advance request."}
                                  </span>
                                </div>
                              )}
                            </td>

                            {/* Approval Status */}
                            <td className="py-3 px-3">
                              <div className="flex flex-col gap-0.5">
                                {isPaid ? (
                                  <span className="text-[8px] font-extrabold px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800 border border-emerald-150 w-max uppercase tracking-wider">
                                    ● Complete &amp; Paid
                                  </span>
                                ) : isOwnerApproved ? (
                                  <span className="text-[8px] font-extrabold px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-800 border border-emerald-100 w-max uppercase tracking-wider">
                                    ● Owner Approved
                                  </span>
                                ) : isOwnerRejected ? (
                                  <span className="text-[8px] font-extrabold px-1.5 py-0.5 rounded bg-rose-50 text-rose-800 border border-rose-100 w-max uppercase tracking-wider">
                                    ● Owner Rejected
                                  </span>
                                ) : isAwaitingOwner ? (
                                  <span className="text-[8px] font-extrabold px-1.5 py-0.5 rounded bg-amber-50 text-amber-800 border border-amber-100 w-max uppercase tracking-wider animate-pulse">
                                    ● Awaiting Owner
                                  </span>
                                ) : (
                                  <span className="text-[8px] font-extrabold px-1.5 py-0.5 rounded bg-slate-100 text-slate-500 border border-slate-200 w-max uppercase tracking-wider">
                                    ● Accountant Review
                                  </span>
                                )}
                              </div>
                            </td>

                            {/* Actions */}
                            <td className="py-3 px-3 text-right">
                              {isPaid ? (
                                <div className="text-[9px] text-slate-400 font-mono font-bold uppercase">
                                  Ledger Locked
                                </div>
                              ) : isEditing ? (
                                <div className="flex gap-1 justify-end">
                                  <button
                                    onClick={() => handleSaveModifiedAdvance(adv.id)}
                                    className="bg-brand-850 hover:bg-brand-900 text-white font-extrabold px-2 py-0.5 rounded text-[9px] transition cursor-pointer"
                                  >
                                    Save
                                  </button>
                                  <button
                                    onClick={() => setEditingAdvanceId(null)}
                                    className="bg-slate-200 hover:bg-slate-300 text-slate-700 font-extrabold px-2 py-0.5 rounded text-[9px] transition cursor-pointer"
                                  >
                                    Cancel
                                  </button>
                                </div>
                              ) : (
                                <div className="flex flex-col gap-1 items-end">
                                  {/* Request owner sign-off */}
                                  {!isAwaitingOwner && !isOwnerApproved && (
                                    <button
                                      onClick={() => handleSubmitAdvanceToProprietor(adv.id)}
                                      className="bg-brand-50 hover:bg-brand-100 border border-brand-200 text-brand-800 font-bold px-2 py-0.5 rounded text-[9px] transition flex items-center gap-0.5 cursor-pointer"
                                    >
                                      Send for Sign-off
                                      <Send size={8} />
                                    </button>
                                  )}

                                  {/* Individual payment disbursement option */}
                                  {isOwnerApproved && (
                                    <button
                                      onClick={() => {
                                        const finalAmt = adv.amountModified !== undefined ? adv.amountModified : adv.amountProposed;
                                        if (confirm(`Confirm physical cash disbursement of ₹ ${finalAmt.toLocaleString()} to farmer ${adv.farmerName}?`)) {
                                          if (onUpdatePaymentRequests) {
                                            const updated = paymentRequests.map(pr => {
                                              if (pr.id === adv.id) {
                                                return { ...pr, status: "Approved" as any, paid: true };
                                              }
                                              return pr;
                                            });
                                            onUpdatePaymentRequests(updated);
                                            alert("Advance cash payment disbursed successfully.");
                                          }
                                        }
                                      }}
                                      className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-2 py-0.5 rounded text-[9px] transition flex items-center gap-0.5 cursor-pointer shadow-3xs"
                                    >
                                      Disburse Cash
                                      <ArrowRight size={8} />
                                    </button>
                                  )}

                                  {isAwaitingOwner && (
                                    <span className="text-[9px] text-slate-400 font-medium italic">Pending signature</span>
                                  )}
                                </div>
                              )}
                            </td>

                          </tr>
                        );
                      });
                    })()}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Modals for Bulk Action Previews */}
            
            {/* 1. BULK SUBMIT TO OWNER MODAL PREVIEW */}
            {showBulkSubmitPreview && (
              <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in duration-150">
                <div className="bg-white rounded-xl shadow-xl border border-slate-200 max-w-2xl w-full max-h-[85vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-150">
                  <div className="bg-brand-850 p-4 text-white flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <Send size={16} />
                      <h3 className="font-bold text-sm tracking-wide">Confirm Bulk Owner Submission</h3>
                    </div>
                    <button
                      onClick={() => setShowBulkSubmitPreview(false)}
                      className="text-white/80 hover:text-white hover:bg-white/10 p-1 rounded-lg transition"
                    >
                      <X size={16} />
                    </button>
                  </div>

                  <div className="p-5 flex-1 overflow-y-auto space-y-4 font-sans text-left">
                    <p className="text-xs text-slate-600 leading-relaxed">
                      You are about to submit the following advance requests to the Proprietor for final audit sign-off. The proprietor will review these custom modified amounts:
                    </p>

                    {/* Summary Card */}
                    {(() => {
                      const pendingSelected = paymentRequests.filter(
                        pr => bulkSelectedAdvanceIds.includes(pr.id) && pr.status === "Pending" && !pr.ownerApprovalRequested && !pr.paid
                      );
                      const totalOriginal = pendingSelected.reduce((sum, pr) => sum + pr.amountProposed, 0);
                      const totalModified = pendingSelected.reduce((sum, pr) => sum + (pr.amountModified || pr.amountProposed), 0);

                      const enrolledList = (() => {
                        const saved = localStorage.getItem("enrolled_farmers");
                        return saved ? JSON.parse(saved) : [];
                      })();
                      const totalAcres = pendingSelected.reduce((sum, pr) => {
                        const f = enrolledList.find((x: any) => x.farmerName.toLowerCase().trim() === pr.farmerName.toLowerCase().trim());
                        return sum + (f ? f.acres : 6);
                      }, 0);

                      return (
                        <>
                          <div className="grid grid-cols-3 gap-3 bg-slate-50 border border-slate-200 p-3.5 rounded-xl">
                            <div className="text-left">
                              <span className="text-[9px] text-slate-400 uppercase tracking-wider block font-bold">Selected Farmers</span>
                              <span className="text-sm font-extrabold font-mono text-slate-800">{pendingSelected.length} Farmers</span>
                            </div>
                            <div className="text-left border-l border-slate-200 pl-3">
                              <span className="text-[9px] text-slate-400 uppercase tracking-wider block font-bold">Total Sown Area</span>
                              <span className="text-sm font-extrabold font-mono text-brand-850 flex items-center gap-1">
                                <Sprout size={11} /> {totalAcres} Acres
                              </span>
                            </div>
                            <div className="text-left border-l border-slate-200 pl-3">
                              <span className="text-[9px] text-slate-400 uppercase tracking-wider block font-bold">Proposed Disbursal</span>
                              <span className="text-sm font-extrabold font-mono text-slate-800">₹ {totalModified.toLocaleString()}</span>
                            </div>
                          </div>

                          {/* Selected Items Table */}
                          <div className="border border-slate-150 rounded-lg overflow-hidden">
                            <table className="w-full text-left text-[11px] border-collapse">
                              <thead>
                                <tr className="bg-slate-50 border-b border-slate-150 text-slate-500 font-bold uppercase tracking-wider text-[9px]">
                                  <th className="py-2 px-3">Farmer Name (Route)</th>
                                  <th className="py-2 px-3 text-right">Original Amount</th>
                                  <th className="py-2 px-3 text-right bg-brand-50/30 text-brand-900">Modified Amount</th>
                                </tr>
                              </thead>
                              <tbody className="divide-y divide-slate-150 font-semibold text-slate-700">
                                {pendingSelected.map((pr) => {
                                  const f = enrolledList.find((x: any) => x.farmerName.toLowerCase().trim() === pr.farmerName.toLowerCase().trim());
                                  const prAcres = f ? f.acres : 6;
                                  const modVal = pr.amountModified || pr.amountProposed;
                                  return (
                                    <tr key={pr.id} className="hover:bg-slate-50/50">
                                      <td className="py-2 px-3">
                                        <span className="font-bold text-slate-900 block">{pr.farmerName}</span>
                                        <span className="text-[9px] text-slate-400 block font-normal">{pr.villageName} • {prAcres} Acres Harvesting</span>
                                      </td>
                                      <td className="py-2 px-3 text-right font-mono text-slate-650">₹ {pr.amountProposed.toLocaleString()}</td>
                                      <td className="py-2 px-3 text-right font-mono font-extrabold text-brand-850 bg-brand-50/20">₹ {modVal.toLocaleString()}</td>
                                    </tr>
                                  );
                                })}
                              </tbody>
                            </table>
                          </div>
                        </>
                      );
                    })()}
                  </div>

                  <div className="bg-slate-50 p-4 border-t border-slate-200 flex justify-end gap-2.5">
                    <button
                      onClick={() => setShowBulkSubmitPreview(false)}
                      className="bg-white hover:bg-slate-100 border border-slate-250 text-slate-700 font-extrabold px-4 py-2 rounded-lg text-xs cursor-pointer transition"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleBulkSubmitToProprietorConfirm}
                      className="bg-brand-850 hover:bg-brand-900 text-white font-extrabold px-4 py-2 rounded-lg text-xs cursor-pointer shadow-sm transition"
                    >
                      Confirm and Submit ({
                        paymentRequests.filter(
                          pr => bulkSelectedAdvanceIds.includes(pr.id) && pr.status === "Pending" && !pr.ownerApprovalRequested && !pr.paid
                        ).length
                      })
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* 2. BULK DISBURSE CASH MODAL PREVIEW */}
            {showBulkDisbursePreview && (
              <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in duration-150">
                <div className="bg-white rounded-xl shadow-xl border border-slate-200 max-w-2xl w-full max-h-[85vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-150">
                  <div className="bg-emerald-700 p-4 text-white flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <Coins size={16} />
                      <h3 className="font-bold text-sm tracking-wide">Confirm Bulk Cash Disbursement</h3>
                    </div>
                    <button
                      onClick={() => setShowBulkDisbursePreview(false)}
                      className="text-white/80 hover:text-white hover:bg-white/10 p-1 rounded-lg transition"
                    >
                      <X size={16} />
                    </button>
                  </div>

                  <div className="p-5 flex-1 overflow-y-auto space-y-4 font-sans text-left">
                    <p className="text-xs text-slate-600 leading-relaxed">
                      You are about to disburse offline cash payments for the following approved advances. This operation will commit finalized cash values to the paid ledger archive:
                    </p>

                    {/* Summary Card */}
                    {(() => {
                      const approvedSelected = paymentRequests.filter(
                        pr => bulkSelectedAdvanceIds.includes(pr.id) && pr.ownerApproved === true && !pr.paid
                      );
                      const totalDisbursing = approvedSelected.reduce((sum, pr) => sum + (pr.amountModified || pr.amountProposed), 0);

                      const enrolledList = (() => {
                        const saved = localStorage.getItem("enrolled_farmers");
                        return saved ? JSON.parse(saved) : [];
                      })();
                      const totalAcres = approvedSelected.reduce((sum, pr) => {
                        const f = enrolledList.find((x: any) => x.farmerName.toLowerCase().trim() === pr.farmerName.toLowerCase().trim());
                        return sum + (f ? f.acres : 6);
                      }, 0);

                      return (
                        <>
                          <div className="grid grid-cols-3 gap-3 bg-emerald-50/50 border border-emerald-150 p-3.5 rounded-xl">
                            <div className="text-left">
                              <span className="text-[9px] text-emerald-800 uppercase tracking-wider block font-bold">Receiving Farmers</span>
                              <span className="text-sm font-extrabold font-mono text-slate-800">{approvedSelected.length} Farmers</span>
                            </div>
                            <div className="text-left border-l border-emerald-150 pl-3">
                              <span className="text-[9px] text-emerald-800 uppercase tracking-wider block font-bold">Total Crop Area</span>
                              <span className="text-sm font-extrabold font-mono text-emerald-900 flex items-center gap-1">
                                <Sprout size={11} /> {totalAcres} Acres
                              </span>
                            </div>
                            <div className="text-left border-l border-emerald-150 pl-3">
                              <span className="text-[9px] text-emerald-800 uppercase tracking-wider block font-bold">Total Cash Paid Out</span>
                              <span className="text-sm font-extrabold font-mono text-emerald-800">₹ {totalDisbursing.toLocaleString()}</span>
                            </div>
                          </div>

                          {/* Selected Items Table */}
                          <div className="border border-slate-150 rounded-lg overflow-hidden">
                            <table className="w-full text-left text-[11px] border-collapse">
                              <thead>
                                <tr className="bg-slate-50 border-b border-slate-150 text-slate-500 font-bold uppercase tracking-wider text-[9px]">
                                  <th className="py-2 px-3">Farmer Name (Route)</th>
                                  <th className="py-2 px-3 text-right">Authorized Advance</th>
                                  <th className="py-2 px-3 text-right bg-emerald-50/30 text-emerald-950">Disbursed Amount</th>
                                </tr>
                              </thead>
                              <tbody className="divide-y divide-slate-150 font-semibold text-slate-700">
                                {approvedSelected.map((pr) => {
                                  const f = enrolledList.find((x: any) => x.farmerName.toLowerCase().trim() === pr.farmerName.toLowerCase().trim());
                                  const prAcres = f ? f.acres : 6;
                                  const modVal = pr.amountModified || pr.amountProposed;
                                  return (
                                    <tr key={pr.id} className="hover:bg-slate-50/50">
                                      <td className="py-2 px-3">
                                        <span className="font-bold text-slate-900 block">{pr.farmerName}</span>
                                        <span className="text-[9px] text-slate-400 block font-normal">{pr.villageName} • {prAcres} Acres Harvesting</span>
                                      </td>
                                      <td className="py-2 px-3 text-right font-mono text-slate-650">₹ {pr.amountProposed.toLocaleString()}</td>
                                      <td className="py-2 px-3 text-right font-mono font-extrabold text-emerald-700 bg-emerald-50/20">₹ {modVal.toLocaleString()}</td>
                                    </tr>
                                  );
                                })}
                              </tbody>
                            </table>
                          </div>
                        </>
                      );
                    })()}
                  </div>

                  <div className="bg-slate-50 p-4 border-t border-slate-200 flex justify-end gap-2.5">
                    <button
                      onClick={() => setShowBulkDisbursePreview(false)}
                      className="bg-white hover:bg-slate-100 border border-slate-250 text-slate-700 font-extrabold px-4 py-2 rounded-lg text-xs cursor-pointer transition"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleBulkDisburseApprovedAdvancesConfirm}
                      className="bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold px-4 py-2 rounded-lg text-xs cursor-pointer shadow-sm transition"
                    >
                      Confirm and Disburse cash ({
                        paymentRequests.filter(
                          pr => bulkSelectedAdvanceIds.includes(pr.id) && pr.ownerApproved === true && !pr.paid
                        ).length
                      })
                    </button>
                  </div>
                </div>
              </div>
            )}
              </>
            )}

            {advanceSubTab === "limits" && (
              <div className="space-y-4 animate-in fade-in duration-200">
                {/* Limits Explanation */}
                <div className="bg-amber-50/50 p-4 rounded-xl border border-amber-100 flex gap-3 text-amber-900 text-xs">
                  <Info size={18} className="shrink-0 text-amber-700 mt-0.5" />
                  <div>
                    <span className="font-extrabold block mb-0.5 text-amber-950">Acreage Advance Restrictions</span>
                    Setting a per-acre limit restricts Village Assistants from requesting advances above the calculated limit (Acres × Village Limit) during dynamic farmer enrollment and assistance. Defaults to ₹10,000/acre if not defined.
                  </div>
                </div>

                {/* Village Limits Update Form & List */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* Form Card */}
                  <div className="md:col-span-1 bg-white p-4 rounded-xl border border-slate-200 shadow-2xs space-y-4">
                    <h3 className="text-xs font-extrabold text-slate-800 uppercase tracking-wide">
                      Set Village Limit
                    </h3>
                    <form onSubmit={(e) => {
                      e.preventDefault();
                      const targetVillage = (e.currentTarget.elements.namedItem("villageName") as HTMLSelectElement).value;
                      const targetLimit = Number((e.currentTarget.elements.namedItem("limitPerAcre") as HTMLInputElement).value);
                      if (!targetVillage) return;
                      updateVillageAdvanceLimit(targetVillage, targetLimit);
                      alert(`Advance limit for ${targetVillage} set to ₹${targetLimit.toLocaleString()} per acre.`);
                    }} className="space-y-3">
                      <div>
                        <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                          Select Village Route
                        </label>
                        <select
                          name="villageName"
                          required
                          className="w-full p-2 border border-slate-250 bg-slate-50 font-semibold rounded-lg text-xs"
                        >
                          <option value="">-- Choose Village --</option>
                          {(() => {
                            const list = new Set<string>();
                            enrolledVillages.forEach(v => { if (v.villageName) list.add(v.villageName); });
                            paymentRequests.forEach(pr => { if (pr.villageName) list.add(pr.villageName); });
                            farmerDistributions.forEach(fd => { if (fd.villageName) list.add(fd.villageName); });
                            // Fallbacks
                            ["Rampur", "Dhamnod", "Nemawar", "Chandanpur", "Pali", "Kharagpur"].forEach(v => list.add(v));
                            return Array.from(list).map(village => (
                              <option key={village} value={village}>{village}</option>
                            ));
                          })()}
                        </select>
                      </div>

                      <div>
                        <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                          Max Advance Limit per Acre (₹)
                        </label>
                        <input
                          name="limitPerAcre"
                          type="number"
                          required
                          min="1000"
                          max="100000"
                          defaultValue="10000"
                          className="w-full p-2 border border-slate-250 bg-slate-50 font-bold rounded-lg text-xs"
                        />
                      </div>

                      <button
                        type="submit"
                        className="w-full py-2 bg-brand-800 hover:bg-brand-900 text-white font-extrabold rounded-lg shadow-3xs cursor-pointer text-xs"
                      >
                        Apply Village Rule
                      </button>
                    </form>
                  </div>

                  {/* List Card */}
                  <div className="md:col-span-2 bg-white p-4 rounded-xl border border-slate-200 shadow-2xs space-y-3">
                    <h3 className="text-xs font-extrabold text-slate-800 uppercase tracking-wide">
                      Active Village Limits Index
                    </h3>
                    
                    <div className="overflow-x-auto rounded-lg border border-slate-200">
                      <table className="w-full text-left border-collapse text-xs">
                        <thead>
                          <tr className="bg-slate-50 border-b border-slate-200 text-slate-400 font-bold text-[9px] uppercase tracking-wider">
                            <th className="p-2.5">Village Route Name</th>
                            <th className="p-2.5">Limit Per Acre (₹)</th>
                            <th className="p-2.5">Example Max (5 Acres)</th>
                            <th className="p-2.5">Validation Rules</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-150">
                          {(() => {
                            const list = new Set<string>();
                            enrolledVillages.forEach(v => { if (v.villageName) list.add(v.villageName); });
                            paymentRequests.forEach(pr => { if (pr.villageName) list.add(pr.villageName); });
                            farmerDistributions.forEach(fd => { if (fd.villageName) list.add(fd.villageName); });
                            ["Rampur", "Dhamnod", "Nemawar", "Chandanpur", "Pali", "Kharagpur"].forEach(v => list.add(v));
                            return Array.from(list).map(village => {
                              const limit = villageAdvanceLimits[village] || 10000;
                              return (
                                <tr key={village} className="hover:bg-slate-50/50">
                                  <td className="p-2.5 font-bold text-slate-800">{village}</td>
                                  <td className="p-2.5 font-extrabold text-brand-850">₹{limit.toLocaleString()} / Acre</td>
                                  <td className="p-2.5 font-semibold text-slate-600">₹{(limit * 5).toLocaleString()}</td>
                                  <td className="p-2.5 text-[10px] text-slate-500 font-medium">Strict validation enabled</td>
                                </tr>
                              );
                            });
                          })()}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {advanceSubTab === "funding" && (
              <div className="space-y-4 animate-in fade-in duration-200">
                {/* Financial overview stats */}
                {(() => {
                  const totalBudget = companyFunds.reduce((sum, f) => sum + (Number(f.fundingAmount) || 0), 0);
                  const totalApprovedAdvances = paymentRequests
                    .filter(pr => pr.status === "Approved")
                    .reduce((sum, pr) => sum + (Number(pr.amountProposed) || 0), 0);
                  const remainingBudget = totalBudget - totalApprovedAdvances;
                  
                  return (
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div className="p-4 bg-white border border-slate-200 rounded-xl shadow-2xs">
                        <span className="text-[9px] uppercase font-bold text-slate-400 block mb-0.5">Total Enrolled Corporate Funds</span>
                        <span className="text-lg font-extrabold text-brand-850">₹{totalBudget.toLocaleString()}</span>
                        <div className="text-[9px] text-slate-400 font-semibold mt-1">From {companyFunds.length} companies</div>
                      </div>
                      <div className="p-4 bg-white border border-slate-200 rounded-xl shadow-2xs">
                        <span className="text-[9px] uppercase font-bold text-slate-400 block mb-0.5">Approved &amp; Disbursed Advances</span>
                        <span className="text-lg font-extrabold text-slate-850">₹{totalApprovedAdvances.toLocaleString()}</span>
                        <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden mt-1.5 flex">
                          <div
                            className="bg-brand-700 h-full rounded-full transition-all duration-500"
                            style={{ width: `${Math.min(100, (totalApprovedAdvances / (totalBudget || 1)) * 100)}%` }}
                          ></div>
                        </div>
                      </div>
                      <div className="p-4 bg-white border border-slate-200 rounded-xl shadow-2xs">
                        <span className="text-[9px] uppercase font-bold text-slate-400 block mb-0.5">Corporate Funding Surplus/Buffer</span>
                        <span className={`text-lg font-extrabold ${remainingBudget >= 0 ? 'text-emerald-750' : 'text-rose-700'}`}>
                          ₹{remainingBudget.toLocaleString()}
                        </span>
                        <span className="text-[9px] text-slate-400 font-semibold block mt-1">Remaining available budget</span>
                      </div>
                    </div>
                  );
                })()}

                {/* Grid container for input form and table */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                  {/* Enroll corporate funding form */}
                  <div className="lg:col-span-1 bg-white p-4 rounded-xl border border-slate-200 shadow-2xs space-y-3">
                    <h3 className="text-xs font-extrabold text-slate-800 uppercase tracking-wide flex items-center gap-1">
                      <Wallet size={14} className="text-brand-800" />
                      Enroll Corporate Grant
                    </h3>
                    
                    <form onSubmit={(e) => {
                      e.preventDefault();
                      const form = e.currentTarget;
                      const compName = (form.elements.namedItem("companyName") as HTMLInputElement).value;
                      const amount = Number((form.elements.namedItem("fundingAmount") as HTMLInputElement).value);
                      const crop = (form.elements.namedItem("cropType") as HTMLSelectElement).value;
                      const purpose = (form.elements.namedItem("purpose") as HTMLInputElement).value;
                      const year = (form.elements.namedItem("academicYear") as HTMLSelectElement).value;
                      const date = (form.elements.namedItem("dateReceived") as HTMLInputElement).value;

                      const newFund = {
                        id: `FUND-${100 + companyFunds.length + 1}`,
                        companyName: compName,
                        fundingAmount: amount,
                        cropType: crop,
                        purpose: purpose || "General distribution support",
                        dateReceived: date || new Date().toISOString().split("T")[0],
                        academicYear: year
                      };

                      updateCompanyFunds([newFund, ...companyFunds]);
                      alert(`Successfully enrolled ₹${amount.toLocaleString()} grant from ${compName} for ${year} Season!`);
                      form.reset();
                    }} className="space-y-3">
                      <div>
                        <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Corporate Sponsor Name</label>
                        <input
                          name="companyName"
                          type="text"
                          required
                          placeholder="e.g. Syngenta, Monsanto, Cargill..."
                          className="w-full p-2 border border-slate-250 bg-slate-50 font-semibold rounded-lg text-xs"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Funding Amount (₹)</label>
                          <input
                            name="fundingAmount"
                            type="number"
                            required
                            min="1000"
                            placeholder="e.g. 500000"
                            className="w-full p-2 border border-slate-250 bg-slate-50 font-bold rounded-lg text-xs"
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Academic Year</label>
                          <select
                            name="academicYear"
                            required
                            className="w-full p-2 border border-slate-250 bg-slate-50 font-bold rounded-lg text-xs"
                          >
                            {localAcademicYears.map(yr => (
                              <option key={yr} value={yr}>{yr}</option>
                            ))}
                          </select>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Target Crop</label>
                          <select
                            name="cropType"
                            required
                            className="w-full p-2 border border-slate-250 bg-slate-50 font-medium rounded-lg text-xs"
                          >
                            <option value="Maize/Corn">Maize/Corn</option>
                            <option value="Sorghum">Sorghum</option>
                            <option value="Soybean">Soybean</option>
                            <option value="Wheat">Wheat</option>
                            <option value="Rice/Paddy">Rice/Paddy</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Date Received</label>
                          <input
                            name="dateReceived"
                            type="date"
                            required
                            defaultValue={new Date().toISOString().split("T")[0]}
                            className="w-full p-1.5 border border-slate-250 bg-slate-50 font-medium rounded-lg text-xs"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Funding Purpose Details</label>
                        <input
                          name="purpose"
                          type="text"
                          placeholder="e.g. Subsidy for seeds distribution..."
                          className="w-full p-2 border border-slate-250 bg-slate-50 rounded-lg text-xs placeholder:text-slate-400"
                        />
                      </div>

                      <button
                        type="submit"
                        className="w-full py-2 bg-brand-800 hover:bg-brand-900 text-white font-extrabold rounded-lg shadow-3xs cursor-pointer text-xs"
                      >
                        Enroll Company Fund
                      </button>
                    </form>
                  </div>

                  {/* Funding list ledger */}
                  <div className="lg:col-span-2 bg-white p-4 rounded-xl border border-slate-200 shadow-2xs space-y-3">
                    <h3 className="text-xs font-extrabold text-slate-800 uppercase tracking-wide">
                      Corporate Grants Ledger Logs
                    </h3>

                    <div className="overflow-x-auto rounded-lg border border-slate-200">
                      <table className="w-full text-left border-collapse text-xs">
                        <thead>
                          <tr className="bg-slate-50 border-b border-slate-200 text-slate-400 font-bold text-[9px] uppercase tracking-wider">
                            <th className="p-2.5">Fund ID</th>
                            <th className="p-2.5">Company &amp; Crop</th>
                            <th className="p-2.5">Academic Season</th>
                            <th className="p-2.5">Total Amount</th>
                            <th className="p-2.5">Purpose / Details</th>
                            <th className="p-2.5">Date Enrolled</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-150">
                          {companyFunds.length === 0 ? (
                            <tr>
                              <td colSpan={6} className="text-center py-6 text-slate-400 font-medium">No company funding grants logged yet.</td>
                            </tr>
                          ) : (
                            companyFunds.map(fund => (
                              <tr key={fund.id} className="hover:bg-slate-50/50">
                                <td className="p-2.5 font-mono text-[10px] text-slate-500">{fund.id}</td>
                                <td className="p-2.5">
                                  <span className="font-bold text-slate-800 block">{fund.companyName}</span>
                                  <span className="text-[9px] text-brand-850 font-bold uppercase">{fund.cropType}</span>
                                </td>
                                <td className="p-2.5">
                                  <span className="px-2 py-0.5 bg-slate-100 border border-slate-200 text-slate-700 rounded text-[9px] font-bold">
                                    {fund.academicYear} Season
                                  </span>
                                </td>
                                <td className="p-2.5 font-black text-brand-850 text-sm">₹{(Number(fund.fundingAmount) || 0).toLocaleString()}</td>
                                <td className="p-2.5 text-[10px] text-slate-600 font-medium leading-relaxed">{fund.purpose}</td>
                                <td className="p-2.5 text-[10px] text-slate-400 font-semibold">{fund.dateReceived}</td>
                              </tr>
                            ))
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Tab 4: Official Fertilizer Rates Registry (Enrolled by Accountant ONLY) */}
        {activeTab === "rates" && (
          <div className="space-y-4 text-left animate-in fade-in duration-200">
            {/* Top Overview & Side-by-Side Tab Switcher */}
            <div className="bg-white p-4 rounded-xl border border-slate-200 flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h2 className="text-sm font-black text-slate-800 uppercase tracking-wide flex items-center gap-1.5">
                  <Coins className="text-brand-850" size={16} />
                  Universal Sourcing &amp; Pricing Registries
                </h2>
                <p className="text-[10px] text-slate-500 mt-0.5 leading-normal max-w-xl">
                  Configure official sourcing pricing and authorized distribution rates for seeds, fertilizers, and pesticides. This console maintains year-by-year compliance logs to prevent transaction discrepancies.
                </p>
              </div>

              {/* Side-by-Side Sub-Tab Selector */}
              <div className="flex bg-slate-100 p-1 rounded-xl border border-slate-200 shrink-0 self-start md:self-auto">
                <button
                  type="button"
                  onClick={() => setRatesSubTab("seeds")}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                    ratesSubTab === "seeds"
                      ? "bg-white text-slate-900 shadow-sm"
                      : "text-slate-500 hover:text-slate-800"
                  }`}
                >
                  <Sprout size={13} className={ratesSubTab === "seeds" ? "text-emerald-600" : ""} />
                  Seeds &amp; Crops
                </button>
                <button
                  type="button"
                  onClick={() => setRatesSubTab("fertilizers")}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                    ratesSubTab === "fertilizers"
                      ? "bg-white text-slate-900 shadow-sm"
                      : "text-slate-500 hover:text-slate-800"
                  }`}
                >
                  <Sparkles size={13} className={ratesSubTab === "fertilizers" ? "text-brand-800" : ""} />
                  Fertilizers &amp; Pesticides
                </button>
              </div>
            </div>

            {/* Bulk Master Rate Import, Export & Template Panel */}
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs space-y-3">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b border-slate-100 pb-2.5">
                <div>
                  <h3 className="text-xs font-black text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                    <FolderSync className="text-brand-850 animate-pulse" size={14} />
                    <span>Catalog Bulk Integrator ({ratesSubTab === "seeds" ? "Seeds & Crops" : "Fertilizers & Pesticides"})</span>
                  </h3>
                  <p className="text-[10px] text-slate-400 mt-0.5">
                    Streamline catalog enrollment with instant CSV spreadsheet sync, exports, and templates.
                  </p>
                </div>

                <div className="flex gap-2 shrink-0">
                  <button
                    onClick={() => downloadTemplate(ratesSubTab)}
                    className="px-2.5 py-1.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 text-[10px] font-bold rounded-lg flex items-center gap-1 transition cursor-pointer"
                  >
                    <Download size={12} />
                    Template
                  </button>
                  <button
                    onClick={() => exportRegistry(ratesSubTab)}
                    className="px-2.5 py-1.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 text-[10px] font-bold rounded-lg flex items-center gap-1 transition cursor-pointer"
                  >
                    <Download size={12} className="text-emerald-600" />
                    Export Live
                  </button>
                </div>
              </div>

              {/* Interactive Drag and Drop Uploader */}
              <div
                onDragOver={(e) => {
                  e.preventDefault();
                  setIsDragging(true);
                }}
                onDragLeave={() => setIsDragging(false)}
                onDrop={(e) => {
                  e.preventDefault();
                  setIsDragging(false);
                  const files = e.dataTransfer.files;
                  if (files && files.length > 0) {
                    const file = files[0];
                    const reader = new FileReader();
                    reader.onload = (event) => {
                      if (event.target?.result) {
                        handleBulkImport(event.target.result as string, ratesSubTab);
                      }
                    };
                    reader.readAsText(file);
                  }
                }}
                className={`border-2 border-dashed rounded-xl p-4 text-center transition flex flex-col items-center justify-center gap-2 ${
                  isDragging 
                    ? "border-emerald-500 bg-emerald-50/50" 
                    : "border-slate-200 bg-slate-50/50 hover:bg-slate-50 hover:border-slate-300"
                }`}
              >
                <div className="p-2 bg-white rounded-full shadow-3xs border border-slate-100 text-slate-400">
                  <Upload size={16} className={isDragging ? "text-emerald-500 animate-bounce" : ""} />
                </div>
                <div>
                  <label className="text-[10.5px] font-bold text-slate-700 block cursor-pointer">
                    <span className="text-brand-800 hover:underline">Drag and drop spreadsheet</span> or <span className="text-brand-800 hover:underline">click to browse</span>
                    <input
                      type="file"
                      accept=".csv"
                      className="hidden"
                      onChange={(e) => {
                        const files = e.target.files;
                        if (files && files.length > 0) {
                          const file = files[0];
                          const reader = new FileReader();
                          reader.onload = (event) => {
                            if (event.target?.result) {
                              handleBulkImport(event.target.result as string, ratesSubTab);
                            }
                          };
                          reader.readAsText(file);
                        }
                      }}
                    />
                  </label>
                  <span className="text-[9px] text-slate-400 block mt-0.5">Supports standard CSV spreadsheet uploads.</span>
                </div>
              </div>
            </div>

            {/* SUB-TAB 1: SEEDS & CROP PROCUREMENT SOURCING */}
            {ratesSubTab === "seeds" && (
              <div className="space-y-4 animate-in fade-in duration-200">
                {/* Seed Enrollment Form */}
                <div className="bg-white p-4 rounded-xl border border-slate-200 text-left h-fit space-y-3 shadow-xs">
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b border-slate-100 pb-2">
                    <div>
                      <h3 className="text-xs font-black text-slate-800 uppercase tracking-wider flex items-center gap-1">
                        <PlusCircle className="text-emerald-600" size={13} />
                        Enroll Seed Sourcing Rate
                      </h3>
                      <p className="text-[9px] text-slate-400 mt-0.5">
                        Register customized seed specifications and set authorized procurement rates.
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setShowSeedRateForm(!showSeedRateForm)}
                      className="px-2.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-[10px] font-bold rounded-md flex items-center gap-1 cursor-pointer transition whitespace-nowrap self-end sm:self-auto shadow-3xs"
                    >
                      {showSeedRateForm ? "✕ Hide Form" : "+ Enroll Seed Sourcing Rate"}
                    </button>
                  </div>

                  {showSeedRateForm && (
                    <div className="space-y-3 animate-in fade-in duration-200">
                      {cropSuccessAlert && (
                    <div className="p-2.5 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-lg text-[10px] font-bold">
                      {cropSuccessAlert}
                    </div>
                  )}

                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      if (!newCropType || !newCropCompany || !newCropYear || !newCropRate) return;
                      const rateValue = parseFloat(newCropRate) || 0;
                      if (rateValue > 0) {
                        const newRecord = {
                          id: `${newCropType.trim()}_${newCropCompany.trim()}_${newCropYear}_${Date.now()}`,
                          cropName: newCropType.trim(),
                          companyName: newCropCompany.trim(),
                          year: newCropYear,
                          weightVolume: seedWeightVolume,
                          packingUnit: seedPackingUnit,
                          baseRatePerUnit: rateValue,
                        };
                        const updated = [newRecord, ...seedsRegistry];
                        updateSeedsRegistry(updated);
                        setCropSuccessAlert(
                          `Successfully registered rate: ₹ ${rateValue}/${seedPackingUnit.replace("s", "")} for ${newCropType} (${newCropCompany}) [Pack Spec: ${seedWeightVolume} ${seedPackingUnit}]`
                        );
                        setTimeout(() => setCropSuccessAlert(""), 4000);
                        // Reset forms
                        setNewCropCompany("");
                        setNewCropRate("24.50");
                      }
                    }}
                    className="space-y-3"
                  >
                    <div>
                      <label className="block text-[9.5px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                        Crop Name / Variety
                      </label>
                      <select
                        value={newCropType}
                        onChange={(e) => setNewCropType(e.target.value)}
                        className="w-full p-2 border border-slate-200 rounded-lg text-xs bg-white font-bold cursor-pointer shadow-2xs text-slate-800"
                      >
                        <option value="Maize/Corn">Maize/Corn</option>
                        <option value="Sorghum">Sorghum</option>
                        <option value="Soybean">Soybean</option>
                        <option value="Wheat">Wheat</option>
                        <option value="Paddy/Rice">Paddy/Rice</option>
                        <option value="Cotton">Cotton</option>
                        <option value="Mustard">Mustard</option>
                      </select>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="block text-[9.5px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                          Seed Company
                        </label>
                        <input
                          type="text"
                          required
                          placeholder="e.g. Syngenta India"
                          value={newCropCompany}
                          onChange={(e) => setNewCropCompany(e.target.value)}
                          className="w-full p-2 border border-slate-200 rounded-lg text-xs bg-white font-semibold shadow-2xs text-slate-800"
                        />
                      </div>
                      <div>
                        <label className="block text-[9.5px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                          Sowing Year
                        </label>
                        <select
                          value={newCropYear}
                          onChange={(e) => setNewCropYear(e.target.value)}
                          className="w-full p-2 border border-slate-200 rounded-lg text-xs bg-white font-bold cursor-pointer shadow-2xs text-slate-800"
                        >
                          <option value="2026">2026</option>
                          <option value="2025">2025</option>
                          <option value="2024">2024</option>
                        </select>
                      </div>
                    </div>

                    {/* Flexible Packing Sizing Configurator */}
                    <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                      <span className="text-[9px] font-extrabold text-slate-450 uppercase block tracking-wider">
                        Flexible Unit / Packing Specification
                      </span>
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="block text-[8.5px] font-bold text-slate-500 uppercase mb-0.5">
                            Weight / Vol
                          </label>
                          <input
                            type="number"
                            required
                            min="0.1"
                            step="0.1"
                            value={seedWeightVolume}
                            onChange={(e) => setSeedWeightVolume(parseFloat(e.target.value) || 1)}
                            className="w-full p-1.5 border border-slate-200 rounded text-xs bg-white font-bold shadow-3xs text-slate-800"
                          />
                        </div>
                        <div>
                          <label className="block text-[8.5px] font-bold text-slate-500 uppercase mb-0.5">
                            Measure Unit
                          </label>
                          <select
                            value={seedPackingUnit}
                            onChange={(e) => setSeedPackingUnit(e.target.value)}
                            className="w-full p-1.5 border border-slate-200 rounded text-xs bg-white font-bold cursor-pointer shadow-3xs text-slate-800"
                          >
                            <option value="kgs">kgs</option>
                            <option value="grams">grams</option>
                            <option value="ml">ml</option>
                            <option value="liters">liters</option>
                            <option value="units">units</option>
                          </select>
                        </div>
                      </div>
                      <p className="text-[8.5px] text-slate-400 italic">
                        Configure exact weights or volume packs (e.g., 25 kgs seed bag, 200 ml treatment solution pack).
                      </p>
                    </div>

                    <div>
                      <label className="block text-[9.5px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                        Sourcing Base Rate (₹ per KG / Liter)
                      </label>
                      <input
                        type="number"
                        step="0.01"
                        required
                        placeholder="e.g. 24.50"
                        value={newCropRate}
                        onChange={(e) => setNewCropRate(e.target.value)}
                        className="w-full p-2 border border-slate-200 rounded-lg text-xs bg-white font-bold font-mono shadow-2xs text-slate-800"
                      />
                    </div>

                    <button
                      type="submit"
                      className="w-full py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[10.5px] rounded-lg transition uppercase tracking-wider cursor-pointer shadow-sm"
                    >
                      Register Sourcing Rate
                    </button>
                  </form>
                    </div>
                  )}
                </div>

                {/* Seed List Panel */}
                <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                  <div className="p-3 bg-slate-50 border-b border-slate-200 flex justify-between items-center">
                    <span className="text-[10px] font-extrabold text-slate-500 uppercase tracking-wider flex items-center gap-1">
                      🌱 Active Seeds &amp; Crop Sourcing Registry
                    </span>
                    <span className="bg-emerald-100 text-emerald-800 text-[9px] font-extrabold px-2 py-0.5 rounded-full font-mono">
                      {seedsRegistry.length} Varieties
                    </span>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse text-xs">
                      <thead>
                        <tr className="bg-slate-100/50 border-b border-slate-200 text-slate-500 text-[10px] font-bold uppercase tracking-wider">
                          <th className="py-3 px-4">Crop / Variety</th>
                          <th className="py-3 px-4">Seed Company</th>
                          <th className="py-3 px-4 font-mono">Year</th>
                          <th className="py-3 px-4">Spec / Pack Weight</th>
                          <th className="py-3 px-4 text-right">Procurement Sourcing Rate</th>
                          <th className="py-3 px-4 text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-150">
                        {seedsRegistry.map((item) => {
                          const pendingReq = rateChangeRequests.find(
                            (r) => r.itemId === item.id && r.status === "Pending"
                          );
                          const isBeingEdited = rateChangeActionId === item.id && rateChangeActionType === "edit";
                          const isBeingDeleted = rateChangeActionId === item.id && rateChangeActionType === "delete";

                          return (
                            <React.Fragment key={item.id}>
                              <tr className="hover:bg-slate-50/50 font-semibold text-slate-850">
                                <td className="py-3 px-4 text-[11px] text-slate-900 font-bold flex items-center gap-1.5">
                                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                                  {item.cropName}
                                </td>
                                <td className="py-3 px-4 text-slate-700 text-[11px]">{item.companyName}</td>
                                <td className="py-3 px-4 font-mono text-slate-500 text-[11px]">{item.year}</td>
                                <td className="py-3 px-4">
                                  <span className="bg-slate-100 text-slate-600 px-2 py-0.5 rounded border border-slate-200 text-[10.5px] font-medium font-mono">
                                    {item.weightVolume} {item.packingUnit || "kgs"}
                                  </span>
                                </td>
                                <td className="py-3 px-4 text-right">
                                  <span className="text-emerald-850 font-mono text-xs font-black bg-emerald-50/80 border border-emerald-100 px-2 py-0.5 rounded">
                                    ₹ {item.baseRatePerUnit.toFixed(2)} / {(item.packingUnit || "kg").replace("s", "")}
                                  </span>
                                </td>
                                <td className="py-3 px-4 text-right">
                                  <div className="flex justify-end items-center gap-1.5">
                                    {pendingReq ? (
                                      <span className="text-[9px] font-extrabold bg-amber-50 text-amber-800 px-2 py-1 rounded border border-amber-200 inline-flex items-center gap-1 shadow-3xs">
                                        <Clock size={10} className="text-amber-600 animate-pulse" />
                                        Pending Owner
                                      </span>
                                    ) : (
                                      <>
                                        <button
                                          onClick={() => {
                                            setRateChangeActionId(item.id);
                                            setRateChangeActionType("edit");
                                            setProposedNewRate(item.baseRatePerUnit.toString());
                                            setRateChangeJustification("");
                                          }}
                                          className="text-[10px] px-2 py-1 bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 rounded font-bold cursor-pointer transition inline-flex items-center gap-0.5"
                                        >
                                          <Edit2 size={9} />
                                          Request Change
                                        </button>
                                        <button
                                          onClick={() => {
                                            setRateChangeActionId(item.id);
                                            setRateChangeActionType("delete");
                                            setRateChangeJustification("");
                                          }}
                                          className="text-[10px] px-2 py-1 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-100 rounded font-bold cursor-pointer transition"
                                        >
                                          Request Deletion
                                        </button>
                                      </>
                                    )}
                                  </div>
                                </td>
                              </tr>

                              {/* Expanded form row for editing / deleting */}
                              {(isBeingEdited || isBeingDeleted) && (
                                <tr>
                                  <td colSpan={6} className="bg-slate-50/40 p-3 border-t-0">
                                    {isBeingEdited && (
                                      <div className="flex flex-col gap-2.5 p-3 bg-brand-50/50 rounded-xl border border-brand-100 text-left animate-in fade-in duration-200 max-w-xl mx-auto shadow-2xs">
                                        <div className="text-[10px] font-black text-brand-900 flex items-center gap-1 uppercase tracking-wider">
                                          <Lock size={11} className="text-brand-700" />
                                          <span>Locked: Request Rate Revision for {item.cropName} ({item.companyName})</span>
                                        </div>
                                        <div className="grid grid-cols-2 gap-2">
                                          <div>
                                            <label className="block text-[8px] font-black uppercase text-slate-450 mb-0.5">Live Rate</label>
                                            <div className="p-1.5 bg-white border border-slate-200 rounded font-mono font-bold text-slate-500 text-[11px]">
                                              ₹ {item.baseRatePerUnit}
                                            </div>
                                          </div>
                                          <div>
                                            <label className="block text-[8px] font-black uppercase text-brand-800 mb-0.5">Proposed New Rate</label>
                                            <input
                                              type="number"
                                              step="0.01"
                                              required
                                              placeholder="e.g. 26.50"
                                              value={proposedNewRate}
                                              onChange={(e) => setProposedNewRate(e.target.value)}
                                              className="w-full p-1.5 border border-brand-300 rounded font-mono font-bold text-brand-900 text-[11px] bg-white outline-none focus:ring-1 focus:ring-brand-500"
                                            />
                                          </div>
                                        </div>
                                        <div>
                                          <label className="block text-[8px] font-black uppercase text-slate-450 mb-0.5">Revision Justification Notes (Sent to Owner)</label>
                                          <input
                                            type="text"
                                            required
                                            placeholder="e.g. Supplier raised price due to transport costs"
                                            value={rateChangeJustification}
                                            onChange={(e) => setRateChangeJustification(e.target.value)}
                                            className="w-full p-1.5 border border-slate-200 rounded text-[10.5px] font-medium bg-white"
                                          />
                                        </div>
                                        <div className="flex gap-1.5 text-[10px] font-bold">
                                          <button
                                            onClick={() => {
                                              const pr = parseFloat(proposedNewRate);
                                              if (!pr || pr <= 0) {
                                                alert("Please specify a valid positive proposed rate.");
                                                return;
                                              }
                                              if (!rateChangeJustification.trim()) {
                                                alert("Please provide audit notes justifying this revision.");
                                                return;
                                              }
                                              onSubmitRateChangeRequest && onSubmitRateChangeRequest({
                                                type: "seed",
                                                itemId: item.id,
                                                cropOrProductName: item.cropName,
                                                companyOrMfrName: item.companyName,
                                                year: item.year,
                                                currentRate: item.baseRatePerUnit,
                                                requestedRate: pr,
                                                requestNotes: rateChangeJustification,
                                                action: "update"
                                              });
                                              alert("Rate update request submitted successfully for Proprietor review.");
                                              setRateChangeActionId(null);
                                              setRateChangeActionType(null);
                                              setProposedNewRate("");
                                              setRateChangeJustification("");
                                            }}
                                            className="flex-1 py-1.5 bg-brand-800 hover:bg-brand-900 text-white rounded transition cursor-pointer text-center uppercase tracking-wider text-[9px] font-black"
                                          >
                                            Submit to Owner
                                          </button>
                                          <button
                                            onClick={() => {
                                              setRateChangeActionId(null);
                                              setRateChangeActionType(null);
                                              setProposedNewRate("");
                                              setRateChangeJustification("");
                                            }}
                                            className="py-1.5 px-3 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded transition cursor-pointer font-extrabold"
                                          >
                                            Cancel
                                          </button>
                                        </div>
                                      </div>
                                    )}

                                    {isBeingDeleted && (
                                      <div className="flex flex-col gap-2.5 p-3 bg-rose-50 border border-rose-100 rounded-xl text-left animate-in fade-in duration-200 max-w-xl mx-auto shadow-2xs">
                                        <div className="text-[10px] font-black text-rose-850 flex items-center gap-1 uppercase tracking-wider">
                                          <AlertTriangle size={11} className="text-rose-500 animate-pulse" />
                                          <span>Locked: Confirm Deletion Request for {item.cropName} ({item.companyName})</span>
                                        </div>
                                        <div>
                                          <label className="block text-[8px] font-black uppercase text-rose-650 mb-0.5">Reason for Catalog Removal (Sent to Owner)</label>
                                          <input
                                            type="text"
                                            required
                                            placeholder="e.g. Variety discontinued or supply halted"
                                            value={rateChangeJustification}
                                            onChange={(e) => setRateChangeJustification(e.target.value)}
                                            className="w-full p-1.5 border border-rose-200 rounded text-[10.5px] font-medium bg-white"
                                          />
                                        </div>
                                        <div className="flex gap-1.5 text-[10px] font-bold">
                                          <button
                                            onClick={() => {
                                              if (!rateChangeJustification.trim()) {
                                                alert("Please provide justification notes for deleting this rate.");
                                                return;
                                              }
                                              onSubmitRateChangeRequest && onSubmitRateChangeRequest({
                                                type: "seed",
                                                itemId: item.id,
                                                cropOrProductName: item.cropName,
                                                companyOrMfrName: item.companyName,
                                                year: item.year,
                                                currentRate: item.baseRatePerUnit,
                                                requestedRate: 0,
                                                requestNotes: rateChangeJustification,
                                                action: "delete"
                                              });
                                              alert("Rate deletion request submitted successfully for Proprietor sign-off.");
                                              setRateChangeActionId(null);
                                              setRateChangeActionType(null);
                                              setRateChangeJustification("");
                                            }}
                                            className="flex-1 py-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded transition cursor-pointer text-center uppercase tracking-wider text-[9px] font-black"
                                          >
                                            Request Deletion
                                          </button>
                                          <button
                                            onClick={() => {
                                              setRateChangeActionId(null);
                                              setRateChangeActionType(null);
                                              setRateChangeJustification("");
                                            }}
                                            className="py-1.5 px-3 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded transition cursor-pointer font-extrabold"
                                          >
                                            Cancel
                                          </button>
                                        </div>
                                      </div>
                                    )}
                                  </td>
                                </tr>
                              )}
                            </React.Fragment>
                          );
                        })}
                        {seedsRegistry.length === 0 && (
                          <tr>
                            <td colSpan={6} className="py-8 text-center text-slate-400 text-[11px] font-semibold">
                              No seed varieties registered. Configure using the enrollment form above.
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {/* SUB-TAB 2: FERTILIZERS & PESTICIDES REGISTRY */}
            {ratesSubTab === "fertilizers" && (
              <div className="space-y-4 animate-in fade-in duration-200">
                {/* Fertilizer/Pesticide Enrollment Form */}
                <div className="bg-white p-4 rounded-xl border border-slate-200 text-left h-fit space-y-3 shadow-xs">
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b border-slate-100 pb-2">
                    <div>
                      <h3 className="text-xs font-black text-slate-800 uppercase tracking-wider flex items-center gap-1">
                        <PlusCircle className="text-brand-800" size={13} />
                        Enroll Fertilizer / Pesticide Rate
                      </h3>
                      <p className="text-[9px] text-slate-400 mt-0.5">
                        Dynamically register fertilizer or pesticide varieties along with year-by-year pricing structures.
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setShowFertRateForm(!showFertRateForm)}
                      className="px-2.5 py-1.5 bg-brand-800 hover:bg-brand-900 text-white text-[10px] font-bold rounded-md flex items-center gap-1 cursor-pointer transition whitespace-nowrap self-end sm:self-auto shadow-3xs"
                    >
                      {showFertRateForm ? "✕ Hide Form" : "+ Enroll Fertilizer Rate"}
                    </button>
                  </div>

                  {showFertRateForm && (
                    <div className="space-y-3 animate-in fade-in duration-200">
                      {fertSuccessAlert && (
                    <div className="p-2.5 bg-brand-50 text-brand-850 border border-brand-200 rounded-lg text-[10px] font-bold">
                      {fertSuccessAlert}
                    </div>
                  )}

                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      if (!newFertName || !newFertMfr || !newFertYear || !newFertRate) return;
                      const rateValue = parseFloat(newFertRate) || 0;
                      if (rateValue > 0) {
                        const newRecord = {
                          id: `${newFertName.trim()}_${newFertMfr.trim()}_${newFertYear}_${Date.now()}`,
                          productName: newFertName.trim(),
                          manufacturerName: newFertMfr.trim(),
                          year: newFertYear,
                          weightVolume: newFertWeightVolume,
                          packingUnit: newFertPackingUnit,
                          ratePerUnit: rateValue,
                        };
                        const updated = [newRecord, ...fertilizersRegistry];
                        updateFertilizersRegistry(updated);
                        setFertSuccessAlert(
                          `Successfully registered: ₹ ${rateValue} for ${newFertName} (${newFertMfr}) for Year ${newFertYear}`
                        );
                        setTimeout(() => setFertSuccessAlert(""), 4000);
                        // Reset forms
                        setNewFertName("");
                        setNewFertMfr("");
                        setNewFertRate("");
                      }
                    }}
                    className="space-y-3"
                  >
                    <div>
                      <label className="block text-[9.5px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                        Product Name (e.g. Urea, DAP, Pesticide Name)
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. Urea (46% N) Premium"
                        value={newFertName}
                        onChange={(e) => setNewFertName(e.target.value)}
                        className="w-full p-2 border border-slate-200 rounded-lg text-xs bg-white font-semibold shadow-2xs text-slate-800"
                        list="fertilizer-suggestions"
                      />
                      <datalist id="fertilizer-suggestions">
                        {DEMO_FERTILIZERS.map((f) => (
                          <option key={f} value={f} />
                        ))}
                      </datalist>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="block text-[9.5px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                          Supplier / Manufacturer
                        </label>
                        <select
                          value={newFertMfr}
                          onChange={(e) => setNewFertMfr(e.target.value)}
                          className="w-full p-2 border border-slate-200 rounded-lg text-xs bg-white font-bold cursor-pointer shadow-2xs text-slate-800"
                          required
                        >
                          <option value="">Select Manufacturer</option>
                          {DEMO_SUPPLIERS.map((s) => (
                            <option key={s} value={s}>
                              {s}
                            </option>
                          ))}
                          <option value="Syngenta India">Syngenta India</option>
                          <option value="Monsanto India">Monsanto India</option>
                          <option value="GSFC Ltd.">GSFC Ltd.</option>
                          <option value="Asha Bio-Seeds">Asha Bio-Seeds</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-[9.5px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                          Applicable Year
                        </label>
                        <select
                          value={newFertYear}
                          onChange={(e) => setNewFertYear(e.target.value)}
                          className="w-full p-2 border border-slate-200 rounded-lg text-xs bg-white font-bold cursor-pointer shadow-2xs text-slate-800"
                        >
                          <option value="2026">2026</option>
                          <option value="2025">2025</option>
                          <option value="2024">2024</option>
                        </select>
                      </div>
                    </div>

                    {/* Flexible Packing Specification */}
                    <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                      <span className="text-[9px] font-extrabold text-slate-450 uppercase block tracking-wider">
                        Flexible Unit / Packing Specification
                      </span>
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="block text-[8.5px] font-bold text-slate-500 uppercase mb-0.5">
                            Weight / Vol
                          </label>
                          <input
                            type="number"
                            required
                            min="0.1"
                            step="0.1"
                            value={newFertWeightVolume}
                            onChange={(e) => setNewFertWeightVolume(parseFloat(e.target.value) || 1)}
                            className="w-full p-1.5 border border-slate-200 rounded text-xs bg-white font-bold shadow-3xs text-slate-800"
                          />
                        </div>
                        <div>
                          <label className="block text-[8.5px] font-bold text-slate-500 uppercase mb-0.5">
                            Measure Unit
                          </label>
                          <select
                            value={newFertPackingUnit}
                            onChange={(e) => setNewFertPackingUnit(e.target.value)}
                            className="w-full p-1.5 border border-slate-200 rounded text-xs bg-white font-bold cursor-pointer shadow-3xs text-slate-800"
                          >
                            <option value="Bags">Bags</option>
                            <option value="kgs">kgs</option>
                            <option value="liters">liters</option>
                            <option value="ml">ml</option>
                            <option value="packs">packs</option>
                          </select>
                        </div>
                      </div>
                    </div>

                    <div>
                      <label className="block text-[9.5px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                        Rate (₹ per Unit Pack)
                      </label>
                      <input
                        type="number"
                        required
                        placeholder="e.g. 350"
                        value={newFertRate}
                        onChange={(e) => setNewFertRate(e.target.value)}
                        className="w-full p-2 border border-slate-200 rounded-lg text-xs bg-white font-bold font-mono shadow-2xs text-slate-800"
                      />
                    </div>

                    <button
                      type="submit"
                      className="w-full py-2 bg-brand-800 hover:bg-brand-900 text-white font-bold text-[10.5px] rounded-lg transition uppercase tracking-wider cursor-pointer shadow-sm"
                    >
                      Register Fertilizer Sourcing Rate
                    </button>
                  </form>
                    </div>
                  )}
                </div>

                {/* Fertilizer List Panel */}
                <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                  <div className="p-3 bg-slate-50 border-b border-slate-200 flex justify-between items-center">
                    <span className="text-[10px] font-extrabold text-slate-500 uppercase tracking-wider flex items-center gap-1">
                      🧪 Active Fertilizer &amp; Pesticides Sourcing Registry
                    </span>
                    <span className="bg-brand-100 text-brand-850 text-[9px] font-extrabold px-2 py-0.5 rounded-full font-mono">
                      {fertilizersRegistry.length} Registered Products
                    </span>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse text-xs">
                      <thead>
                        <tr className="bg-slate-100/50 border-b border-slate-200 text-slate-500 text-[10px] font-bold uppercase tracking-wider">
                          <th className="py-3 px-4">Variety / Product</th>
                          <th className="py-3 px-4">Supplier / Manufacturer</th>
                          <th className="py-3 px-4 font-mono">Year</th>
                          <th className="py-3 px-4">Spec / Pack Weight</th>
                          <th className="py-3 px-4 text-right">Current Rate (₹)</th>
                          <th className="py-3 px-4 text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-150">
                        {fertilizersRegistry.map((item) => {
                          const pendingReq = rateChangeRequests.find(
                            (r) => r.itemId === item.id && r.status === "Pending"
                          );
                          const isBeingEdited = rateChangeActionId === item.id && rateChangeActionType === "edit";
                          const isBeingDeleted = rateChangeActionId === item.id && rateChangeActionType === "delete";

                          return (
                            <React.Fragment key={item.id}>
                              <tr className="hover:bg-slate-50/50 font-semibold text-slate-850">
                                <td className="py-3.5 px-4 text-[11px] text-slate-900 font-bold flex items-center gap-1.5">
                                  <span className="w-1.5 h-1.5 rounded-full bg-brand-600"></span>
                                  {item.productName}
                                </td>
                                <td className="py-3.5 px-4 text-slate-700 text-[11px]">{item.manufacturerName}</td>
                                <td className="py-3.5 px-4 font-mono text-slate-500 text-[11px]">{item.year}</td>
                                <td className="py-3.5 px-4">
                                  <span className="bg-slate-100 text-slate-600 px-2 py-0.5 rounded border border-slate-200 text-[10.5px] font-medium font-mono">
                                    {item.weightVolume} {item.packingUnit}
                                  </span>
                                </td>
                                <td className="py-3.5 px-4 text-right">
                                  <span className="text-brand-850 font-mono text-xs font-black bg-brand-50/80 border border-brand-100 px-2.5 py-1 rounded">
                                    ₹ {item.ratePerUnit.toLocaleString()}
                                  </span>
                                </td>
                                <td className="py-3.5 px-4 text-right">
                                  <div className="flex justify-end items-center gap-1.5">
                                    {pendingReq ? (
                                      <span className="text-[9px] font-extrabold bg-amber-50 text-amber-800 px-2 py-1 rounded border border-amber-200 inline-flex items-center gap-1 shadow-3xs">
                                        <Clock size={10} className="text-amber-600 animate-pulse" />
                                        Pending Owner
                                      </span>
                                    ) : (
                                      <>
                                        <button
                                          onClick={() => {
                                            setRateChangeActionId(item.id);
                                            setRateChangeActionType("edit");
                                            setProposedNewRate(item.ratePerUnit.toString());
                                            setRateChangeJustification("");
                                          }}
                                          className="text-[10px] px-2 py-1 bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 rounded font-bold cursor-pointer transition inline-flex items-center gap-0.5"
                                        >
                                          <Edit2 size={9} />
                                          Request Change
                                        </button>
                                        <button
                                          onClick={() => {
                                            setRateChangeActionId(item.id);
                                            setRateChangeActionType("delete");
                                            setRateChangeJustification("");
                                          }}
                                          className="text-[10px] px-2 py-1 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-100 rounded font-bold cursor-pointer transition"
                                        >
                                          Request Deletion
                                        </button>
                                      </>
                                    )}
                                  </div>
                                </td>
                              </tr>

                              {/* Expanded form row for editing / deleting */}
                              {(isBeingEdited || isBeingDeleted) && (
                                <tr>
                                  <td colSpan={6} className="bg-slate-50/40 p-3 border-t-0">
                                    {isBeingEdited && (
                                      <div className="flex flex-col gap-2.5 p-3 bg-brand-50/50 rounded-xl border border-brand-100 text-left animate-in fade-in duration-200 max-w-xl mx-auto shadow-2xs">
                                        <div className="text-[10px] font-black text-brand-900 flex items-center gap-1 uppercase tracking-wider">
                                          <Lock size={11} className="text-brand-700" />
                                          <span>Locked: Request Rate Revision for {item.productName} ({item.manufacturerName})</span>
                                        </div>
                                        <div className="grid grid-cols-2 gap-2">
                                          <div>
                                            <label className="block text-[8px] font-black uppercase text-slate-450 mb-0.5">Live Rate</label>
                                            <div className="p-1.5 bg-white border border-slate-200 rounded font-mono font-bold text-slate-500 text-[11px]">
                                              ₹ {item.ratePerUnit}
                                            </div>
                                          </div>
                                          <div>
                                            <label className="block text-[8px] font-black uppercase text-brand-800 mb-0.5">Proposed New Rate</label>
                                            <input
                                              type="number"
                                              step="0.01"
                                              required
                                              placeholder="e.g. 1400"
                                              value={proposedNewRate}
                                              onChange={(e) => setProposedNewRate(e.target.value)}
                                              className="w-full p-1.5 border border-brand-300 rounded font-mono font-bold text-brand-900 text-[11px] bg-white outline-none focus:ring-1 focus:ring-brand-500"
                                            />
                                          </div>
                                        </div>
                                        <div>
                                          <label className="block text-[8px] font-black uppercase text-slate-450 mb-0.5">Revision Justification Notes (Sent to Owner)</label>
                                          <input
                                            type="text"
                                            required
                                            placeholder="e.g. Manufacturer price revision for sowing season"
                                            value={rateChangeJustification}
                                            onChange={(e) => setRateChangeJustification(e.target.value)}
                                            className="w-full p-1.5 border border-slate-200 rounded text-[10.5px] font-medium bg-white"
                                          />
                                        </div>
                                        <div className="flex gap-1.5 text-[10px] font-bold">
                                          <button
                                            onClick={() => {
                                              const pr = parseFloat(proposedNewRate);
                                              if (!pr || pr <= 0) {
                                                alert("Please specify a valid positive proposed rate.");
                                                return;
                                              }
                                              if (!rateChangeJustification.trim()) {
                                                alert("Please provide audit notes justifying this revision.");
                                                return;
                                              }
                                              onSubmitRateChangeRequest && onSubmitRateChangeRequest({
                                                type: "fertilizer",
                                                itemId: item.id,
                                                cropOrProductName: item.productName,
                                                companyOrMfrName: item.manufacturerName,
                                                year: item.year,
                                                currentRate: item.ratePerUnit,
                                                requestedRate: pr,
                                                requestNotes: rateChangeJustification,
                                                action: "update"
                                              });
                                              alert("Rate update request submitted successfully for Proprietor review.");
                                              setRateChangeActionId(null);
                                              setRateChangeActionType(null);
                                              setProposedNewRate("");
                                              setRateChangeJustification("");
                                            }}
                                            className="flex-1 py-1.5 bg-brand-800 hover:bg-brand-900 text-white rounded transition cursor-pointer text-center uppercase tracking-wider text-[9px] font-black"
                                          >
                                            Submit to Owner
                                          </button>
                                          <button
                                            onClick={() => {
                                              setRateChangeActionId(null);
                                              setRateChangeActionType(null);
                                              setProposedNewRate("");
                                              setRateChangeJustification("");
                                            }}
                                            className="py-1.5 px-3 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded transition cursor-pointer font-extrabold"
                                          >
                                            Cancel
                                          </button>
                                        </div>
                                      </div>
                                    )}

                                    {isBeingDeleted && (
                                      <div className="flex flex-col gap-2.5 p-3 bg-rose-50 border border-rose-100 rounded-xl text-left animate-in fade-in duration-200 max-w-xl mx-auto shadow-2xs">
                                        <div className="text-[10px] font-black text-rose-850 flex items-center gap-1 uppercase tracking-wider">
                                          <AlertTriangle size={11} className="text-rose-500 animate-pulse" />
                                          <span>Locked: Confirm Deletion Request for {item.productName} ({item.manufacturerName})</span>
                                        </div>
                                        <div>
                                          <label className="block text-[8px] font-black uppercase text-rose-650 mb-0.5">Reason for Catalog Removal (Sent to Owner)</label>
                                          <input
                                            type="text"
                                            required
                                            placeholder="e.g. Product discontinued by company"
                                            value={rateChangeJustification}
                                            onChange={(e) => setRateChangeJustification(e.target.value)}
                                            className="w-full p-1.5 border border-rose-200 rounded text-[10.5px] font-medium bg-white"
                                          />
                                        </div>
                                        <div className="flex gap-1.5 text-[10px] font-bold">
                                          <button
                                            onClick={() => {
                                              if (!rateChangeJustification.trim()) {
                                                alert("Please provide justification notes for deleting this rate.");
                                                return;
                                              }
                                              onSubmitRateChangeRequest && onSubmitRateChangeRequest({
                                                type: "fertilizer",
                                                itemId: item.id,
                                                cropOrProductName: item.productName,
                                                companyOrMfrName: item.manufacturerName,
                                                year: item.year,
                                                currentRate: item.ratePerUnit,
                                                requestedRate: 0,
                                                requestNotes: rateChangeJustification,
                                                action: "delete"
                                              });
                                              alert("Rate deletion request submitted successfully for Proprietor sign-off.");
                                              setRateChangeActionId(null);
                                              setRateChangeActionType(null);
                                              setRateChangeJustification("");
                                            }}
                                            className="flex-1 py-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded transition cursor-pointer text-center uppercase tracking-wider text-[9px] font-black"
                                          >
                                            Request Deletion
                                          </button>
                                          <button
                                            onClick={() => {
                                              setRateChangeActionId(null);
                                              setRateChangeActionType(null);
                                              setRateChangeJustification("");
                                            }}
                                            className="py-1.5 px-3 bg-slate-100 hover:bg-slate-200 text-slate-650 rounded transition cursor-pointer font-extrabold"
                                          >
                                            Cancel
                                          </button>
                                        </div>
                                      </div>
                                    )}
                                  </td>
                                </tr>
                              )}
                            </React.Fragment>
                          );
                        })}
                        {fertilizersRegistry.length === 0 && (
                          <tr>
                            <td colSpan={6} className="py-8 text-center text-slate-400 text-[11px] font-semibold">
                              No products registered yet. Configure one using the enrollment form above.
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Tab 5: Payments History Settled bills & Approved Village Collections */}
        {activeTab === "history" && (
          <div className="space-y-4 text-left animate-in fade-in duration-200">
            <div className="bg-white p-4 rounded-xl border border-slate-200">
              <h2 className="text-xs font-bold text-slate-800 uppercase tracking-wide">Cleared Accounts &amp; Audit Logs</h2>
              <p className="text-[10px] text-slate-500 mt-0.5 leading-normal">
                Historical record archive of fully paid manufacturing supplier invoices and authenticated village field collections.
              </p>
            </div>

            {/* Verified Village Receipts Table */}
            <div className="space-y-2">
              <span className="text-[10.5px] font-bold text-slate-400 uppercase tracking-wider block px-1">
                Verified Village Cash &amp; Digital Receipts
              </span>
              
              <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="bg-slate-100 border-b border-slate-200 text-slate-600 text-[10px] font-bold uppercase tracking-wider">
                        <th className="py-2 px-3">Transaction ID</th>
                        <th className="py-2 px-3">Farmer Name</th>
                        <th className="py-2 px-3">Village Center</th>
                        <th className="py-2 px-3">Date Approved</th>
                        <th className="py-2 px-3">Payment Mode</th>
                        <th className="py-2 px-3 text-right">Cleared Amount</th>
                        <th className="py-2 px-3">Verification State</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-150">
                      {paymentRequests.filter(r => r.status === "Approved" || (r as any).paid === true).length === 0 ? (
                        <tr>
                          <td colSpan={7} className="py-6 text-center text-slate-400 font-medium italic">
                            No verified village receipts available in this session.
                          </td>
                        </tr>
                      ) : (
                        paymentRequests.filter(r => r.status === "Approved" || (r as any).paid === true).map((req) => (
                          <tr key={req.id} className="hover:bg-slate-50/50 font-semibold text-slate-855">
                            <td className="py-2.5 px-3 font-mono text-[10px] text-slate-500">{req.id}</td>
                            <td className="py-2.5 px-3 text-[11px] font-bold text-slate-900">{req.farmerName}</td>
                            <td className="py-2.5 px-3 text-[11px] text-slate-700">{req.villageName}</td>
                            <td className="py-2.5 px-3 font-mono text-slate-500">{req.dateRequested}</td>
                            <td className="py-2.5 px-3 text-slate-550">{req.paymentMode}</td>
                            <td className="py-2.5 px-3 text-right font-mono text-emerald-800">₹ {req.amountProposed.toLocaleString()}</td>
                            <td className="py-2.5 px-3">
                              <span className="text-[9px] font-extrabold px-1.5 py-0.2 rounded bg-emerald-50 text-emerald-700">
                                ✓ DISBURSED
                              </span>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            {/* Settled Manufacturer Invoices Table */}
            <div className="space-y-2 pt-2">
              <span className="text-[10.5px] font-bold text-slate-400 uppercase tracking-wider block px-1">
                Settled Manufacturer Payment Archives
              </span>
              
              <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="bg-slate-100 border-b border-slate-200 text-slate-600 text-[10px] font-bold uppercase tracking-wider">
                        <th className="py-2 px-3">Invoice Number</th>
                        <th className="py-2 px-3">Manufacturer</th>
                        <th className="py-2 px-3">Product Variety</th>
                        <th className="py-2 px-3 text-right">Qty (Bags)</th>
                        <th className="py-2 px-3 text-right">Cleared Amount</th>
                        <th className="py-2 px-3">Clearing Code</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-150">
                      {(() => {
                        const paidBills = supplierBills.filter(b => b.paymentStatus === "Paid");
                        if (paidBills.length === 0) {
                          return (
                            <tr>
                              <td colSpan={6} className="py-6 text-center text-slate-400 font-medium italic">
                                No manufacturer invoices fully settled in this session.
                              </td>
                            </tr>
                          );
                        }
                        return paidBills.map((bill) => (
                          <tr key={bill.id} className="hover:bg-slate-50/50 font-semibold text-slate-850">
                            <td className="py-2.5 px-3 font-mono text-[10px] text-slate-500">{bill.billNumber}</td>
                            <td className="py-2.5 px-3 text-[11px] font-bold text-slate-900">{bill.supplierName}</td>
                            <td className="py-2.5 px-3 text-[11px] text-slate-700">{bill.productName}</td>
                            <td className="py-2.5 px-3 text-right font-mono">{bill.bagCount} Bags</td>
                            <td className="py-2.5 px-3 text-right font-mono text-brand-850">₹ {bill.totalAmount.toLocaleString()}</td>
                            <td className="py-2.5 px-3">
                              <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-emerald-50 text-emerald-800 border border-emerald-100">
                                CLEARED ✓
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

        {/* Tab: Employee Salary Processing */}
        {activeTab === "employee_salaries" && (
          <div className="space-y-4 text-left animate-in fade-in duration-200">
            {/* Header banner */}
            <div className="bg-gradient-to-r from-slate-50 to-white p-5 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <h2 className="text-sm font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2">
                  <Coins size={16} className="text-brand-800" />
                  Employee Salary Disbursal Engine
                </h2>
                <p className="text-[10.5px] text-slate-500 mt-1 leading-normal">
                  Process monthly payroll, submit proprietor unlock authorization requests, and disburse bank transfers.
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                {(() => {
                  const selectedUsers = assistantUsers.filter(u => selectedSalaryMobiles.includes(u.mobileNumber));
                  
                  const selectedLocked = selectedUsers.filter(u => {
                    const isPaid = processedSalaries.some(p => p.employeeMobile === u.mobileNumber && p.monthYear === salaryMonth);
                    if (isPaid) return false;
                    const isLocked = u.salaryLocked;
                    const hasPending = salaryUnlockRequests.some(r => r.staffMobile === u.mobileNumber && r.status === "Pending");
                    const hasApproved = salaryUnlockRequests.some(r => r.staffMobile === u.mobileNumber && r.status === "Approved");
                    return isLocked && !hasPending && !hasApproved;
                  });

                  const selectedReady = selectedUsers.filter(u => {
                    const isPaid = processedSalaries.some(p => p.employeeMobile === u.mobileNumber && p.monthYear === salaryMonth);
                    if (isPaid) return false;
                    const isLocked = u.salaryLocked;
                    const hasApproved = salaryUnlockRequests.some(r => r.staffMobile === u.mobileNumber && r.status === "Approved");
                    return !isLocked || hasApproved;
                  });

                  return (
                    <div className="flex flex-wrap gap-2">
                      {selectedLocked.length > 0 && (
                        <button
                          onClick={() => {
                            if (onSubmitSalaryUnlockRequest) {
                              selectedLocked.forEach(user => {
                                onSubmitSalaryUnlockRequest({
                                  staffMobile: user.mobileNumber,
                                  staffName: user.name,
                                  designation: user.designation || "Village Assistant",
                                  currentSalary: user.salaryAmount || 25000,
                                  reason: "Bulk monthly salary unlock request"
                                });
                              });
                              alert(`Successfully dispatched bulk unlock authorization requests to the Proprietor for ${selectedLocked.length} employees!`);
                            }
                          }}
                          className="bg-amber-500 hover:bg-amber-600 text-white font-extrabold text-[10.5px] px-3.5 py-2 rounded-xl transition shadow-sm flex items-center gap-1.5"
                        >
                          <Lock size={13} />
                          Bulk Request Approval ({selectedLocked.length} Selected)
                        </button>
                      )}

                      {selectedReady.length > 0 && (
                        <button
                          onClick={() => {
                            setSelectedStaffForSalary(null); // Bulk flag
                            setShowSalaryModal(true);
                          }}
                          className="bg-brand-800 hover:bg-brand-900 text-white font-extrabold text-[10.5px] px-3.5 py-2 rounded-xl transition shadow-sm flex items-center gap-1.5"
                        >
                          <CheckCircle2 size={13} />
                          Bulk Disburse ({selectedReady.length} Selected)
                        </button>
                      )}
                    </div>
                  );
                })()}
              </div>
            </div>

            {/* Quick stats panel */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-sm">
                <span className="text-[9.5px] text-slate-400 font-bold uppercase tracking-wider block">Total Staff</span>
                <span className="text-base font-extrabold text-slate-800">{assistantUsers.length} Employees</span>
              </div>
              <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-sm">
                <span className="text-[9.5px] text-slate-400 font-bold uppercase tracking-wider block">Paid Salaries</span>
                <span className="text-base font-extrabold text-emerald-750">
                  {assistantUsers.filter(u => processedSalaries.some(p => p.employeeMobile === u.mobileNumber && p.monthYear === salaryMonth)).length} / {assistantUsers.length}
                </span>
              </div>
              <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-sm">
                <span className="text-[9.5px] text-slate-400 font-bold uppercase tracking-wider block">Locked Accounts</span>
                <span className="text-base font-extrabold text-amber-600">
                  {assistantUsers.filter(u => u.salaryLocked && !processedSalaries.some(p => p.employeeMobile === u.mobileNumber && p.monthYear === salaryMonth)).length} Accounts
                </span>
              </div>
              <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-sm">
                <span className="text-[9.5px] text-slate-400 font-bold uppercase tracking-wider block">Monthly Total Payout</span>
                <span className="text-base font-extrabold text-brand-800">
                  ₹{assistantUsers.reduce((sum, u) => sum + (u.salaryAmount || 25000), 0).toLocaleString()}
                </span>
              </div>
            </div>

            {/* Search and Filters row */}
            <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-3">
              <div className="relative flex-1 max-w-sm">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search staff by name or designation..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-3 py-2 text-[11px] focus:outline-none focus:ring-1 focus:ring-brand-500 focus:bg-white transition"
                />
              </div>

              {/* Status Filters */}
              <div className="flex flex-wrap items-center gap-2 overflow-x-auto pb-1 md:pb-0">
                <span className="text-[10px] text-slate-400 font-extrabold uppercase tracking-wider">Designation:</span>
                <select
                  value={selectedDesignation}
                  onChange={(e) => setSelectedDesignation(e.target.value)}
                  className="bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1.5 text-[11px] font-bold focus:outline-none"
                >
                  <option value="All">All Designations</option>
                  {Array.from(new Set(assistantUsers.map(u => u.designation || "Village Assistant"))).map(d => (
                    <option key={d} value={d}>{d}</option>
                  ))}
                </select>

                <div className="h-4 w-px bg-slate-200 mx-1" />

                <span className="text-[10px] text-slate-400 font-extrabold uppercase tracking-wider">Month:</span>
                <select
                  value={salaryMonth}
                  onChange={(e) => setSalaryMonth(e.target.value)}
                  className="bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1.5 text-[11px] font-bold focus:outline-none"
                >
                  <option value="June 2026">June 2026</option>
                  <option value="May 2026">May 2026</option>
                  <option value="April 2026">April 2026</option>
                </select>

                <div className="h-4 w-px bg-slate-200 mx-1" />

                {(["All", "Paid", "Unpaid", "Locked"] as const).map((st) => (
                  <button
                    key={st}
                    onClick={() => setSalaryFilter(st)}
                    className={`px-3 py-1.5 rounded-lg text-[10.5px] font-extrabold transition whitespace-nowrap ${
                      salaryFilter === st
                        ? "bg-slate-100 text-slate-800"
                        : "text-slate-500 hover:text-slate-800 hover:bg-slate-50"
                    }`}
                  >
                    {st}
                  </button>
                ))}
              </div>
            </div>

            {/* Employee Records Table */}
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 text-[10px] font-bold uppercase tracking-wider">
                      <th className="py-3 px-4 w-10">
                        {(() => {
                          const visibleUnpaidAndUnblocked = assistantUsers.filter(u => {
                            const nameMatch = u.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                                              (u.designation || "Assistant").toLowerCase().includes(searchQuery.toLowerCase());
                            if (!nameMatch) return false;

                            if (selectedDesignation !== "All" && (u.designation || "Village Assistant") !== selectedDesignation) {
                              return false;
                            }

                            const isPaid = processedSalaries.some(p => p.employeeMobile === u.mobileNumber && p.monthYear === salaryMonth);
                            const isLocked = u.salaryLocked;

                            if (salaryFilter === "Paid") return isPaid;
                            if (salaryFilter === "Unpaid") return !isPaid;
                            if (salaryFilter === "Locked") return isLocked && !isPaid;
                            return true;
                          });

                          return (
                            <input
                              type="checkbox"
                              checked={
                                visibleUnpaidAndUnblocked.length > 0 &&
                                visibleUnpaidAndUnblocked.every(u => selectedSalaryMobiles.includes(u.mobileNumber))
                              }
                              onChange={(e) => {
                                if (e.target.checked) {
                                  setSelectedSalaryMobiles(Array.from(new Set([
                                    ...selectedSalaryMobiles,
                                    ...visibleUnpaidAndUnblocked.map(u => u.mobileNumber)
                                  ])));
                                } else {
                                  const visibleMobiles = visibleUnpaidAndUnblocked.map(u => u.mobileNumber);
                                  setSelectedSalaryMobiles(selectedSalaryMobiles.filter(mob => !visibleMobiles.includes(mob)));
                                }
                              }}
                              className="rounded border-slate-300 text-brand-800 focus:ring-brand-500"
                            />
                          );
                        })()}
                      </th>
                      <th className="py-3 px-4 w-12">S.No</th>
                      <th className="py-3 px-4">Employee Details</th>
                      <th className="py-3 px-4">Designation</th>
                      <th className="py-3 px-4">Salary Amount</th>
                      <th className="py-3 px-4">Bank &amp; IFSC Details</th>
                      <th className="py-3 px-4">Payroll Status</th>
                      <th className="py-3 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-150">
                    {(() => {
                      const filtered = assistantUsers.filter(u => {
                        const nameMatch = u.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                                          (u.designation || "Assistant").toLowerCase().includes(searchQuery.toLowerCase());
                        if (!nameMatch) return false;

                        if (selectedDesignation !== "All" && (u.designation || "Village Assistant") !== selectedDesignation) {
                          return false;
                        }

                        const isPaid = processedSalaries.some(p => p.employeeMobile === u.mobileNumber && p.monthYear === salaryMonth);
                        const isLocked = u.salaryLocked;

                        if (salaryFilter === "Paid") return isPaid;
                        if (salaryFilter === "Unpaid") return !isPaid;
                        if (salaryFilter === "Locked") return isLocked && !isPaid;
                        return true;
                      });

                      if (filtered.length === 0) {
                        return (
                          <tr>
                            <td colSpan={8} className="py-8 text-center text-slate-400 font-medium italic">
                              No employees found matching the search, designation, or status filters.
                            </td>
                          </tr>
                        );
                      }

                      return filtered.map((user, index) => {
                        const isPaid = processedSalaries.some(p => p.employeeMobile === user.mobileNumber && p.monthYear === salaryMonth);
                        const paidRecord = processedSalaries.find(p => p.employeeMobile === user.mobileNumber && p.monthYear === salaryMonth);
                        const isLocked = user.salaryLocked;
                        
                        // Check exact status matching
                        const hasRequestedUnlock = salaryUnlockRequests.some(r => r.staffMobile === user.mobileNumber && r.status === "Pending");
                        const isUnlockApproved = salaryUnlockRequests.some(r => r.staffMobile === user.mobileNumber && r.status === "Approved");
                        
                        // Current stage calculation
                        let payrollStage: "Paid" | "Awaiting" | "Approved" | "Locked" = "Locked";
                        if (isPaid) payrollStage = "Paid";
                        else if (hasRequestedUnlock) payrollStage = "Awaiting";
                        else if (isUnlockApproved || !isLocked) payrollStage = "Approved";

                        return (
                          <tr key={user.mobileNumber} className="hover:bg-slate-50/70 transition-colors font-semibold text-slate-700">
                            <td className="py-3.5 px-4">
                              <input
                                type="checkbox"
                                checked={selectedSalaryMobiles.includes(user.mobileNumber)}
                                onChange={(e) => {
                                  if (e.target.checked) {
                                    setSelectedSalaryMobiles([...selectedSalaryMobiles, user.mobileNumber]);
                                  } else {
                                    setSelectedSalaryMobiles(selectedSalaryMobiles.filter(m => m !== user.mobileNumber));
                                  }
                                }}
                                className="rounded border-slate-300 text-brand-800 focus:ring-brand-500"
                              />
                            </td>
                            <td className="py-3.5 px-4 font-mono text-slate-400 text-[10px]">{index + 1}</td>
                            <td className="py-3.5 px-4">
                              <div className="font-bold text-slate-900">{user.name}</div>
                              <div className="text-[10px] text-slate-400 font-mono">{user.mobileNumber}</div>
                            </td>
                            <td className="py-3.5 px-4">
                              <span className="text-[10.5px] px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 font-extrabold uppercase">
                                {user.designation || "Village Assistant"}
                              </span>
                            </td>
                            <td className="py-3.5 px-4 font-extrabold text-slate-800">
                              ₹{(user.salaryAmount || 25000).toLocaleString()}
                            </td>
                            <td className="py-3.5 px-4 text-[10.5px]">
                              <div className="font-semibold text-slate-800 font-mono">Acc: {user.accountNumber || "38392102192"}</div>
                              <div className="text-[9.5px] text-slate-400 font-mono">IFSC: {user.ifscCode || "SBIN0015366"} ({user.bankName || "SBI INDORE"})</div>
                            </td>
                            <td className="py-3.5 px-4">
                              {payrollStage === "Paid" ? (
                                <span className="text-[9px] font-black px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200">
                                  ✓ PAID
                                </span>
                              ) : payrollStage === "Awaiting" ? (
                                <span className="text-[9px] font-black px-2 py-0.5 rounded bg-amber-50 text-amber-750 border border-amber-250 animate-pulse">
                                  ⏳ AWAITING APPROVAL
                                </span>
                              ) : payrollStage === "Approved" ? (
                                <span className="text-[9px] font-black px-2 py-0.5 rounded bg-sky-50 text-sky-700 border border-sky-200">
                                  🔓 APPROVED &amp; READY
                                </span>
                              ) : (
                                <span className="text-[9px] font-black px-2 py-0.5 rounded bg-rose-50 text-rose-700 border border-rose-200">
                                  🔒 LOCKED (DRAFT)
                                </span>
                              )}
                            </td>
                            <td className="py-3.5 px-4 text-right">
                              {payrollStage === "Paid" ? (
                                <div className="flex flex-col items-end gap-1">
                                  <div className="text-[9.5px] text-slate-500 font-bold leading-normal">
                                    Paid via {paidRecord?.paymentMode} on {paidRecord?.datePaid}
                                  </div>
                                  <button
                                    onClick={() => {
                                      setReceiptData({ type: "salary", data: paidRecord, employee: user });
                                      setReceiptModalOpen(true);
                                    }}
                                    className="flex items-center gap-1 text-[9.5px] text-brand-800 hover:text-brand-900 font-extrabold uppercase bg-brand-50 hover:bg-brand-100 border border-brand-200 px-2 py-1 rounded-lg transition"
                                  >
                                    📄 Receipt
                                  </button>
                                </div>
                              ) : payrollStage === "Awaiting" ? (
                                <button
                                  disabled
                                  className="text-[10px] font-black px-3 py-1.5 rounded-lg border bg-slate-50 text-slate-400 border-slate-200 cursor-not-allowed"
                                >
                                  Awaiting Sign-off...
                                </button>
                              ) : payrollStage === "Approved" ? (
                                <button
                                  onClick={() => {
                                    setSelectedStaffForSalary(user);
                                    setShowSalaryModal(true);
                                  }}
                                  className="bg-brand-800 hover:bg-brand-900 text-white text-[10px] font-black px-3 py-1.5 rounded-lg transition shadow-sm cursor-pointer"
                                >
                                  Disburse Salary
                                </button>
                              ) : (
                                <button
                                  onClick={() => {
                                    if (onSubmitSalaryUnlockRequest) {
                                      onSubmitSalaryUnlockRequest({
                                        staffMobile: user.mobileNumber,
                                        staffName: user.name,
                                        designation: user.designation || "Village Assistant",
                                        currentSalary: user.salaryAmount || 25000,
                                        reason: `Processing payroll salary amount ₹${(user.salaryAmount || 25000).toLocaleString()} for ${salaryMonth}.`
                                      });
                                      alert(`Unlock authorization request has been successfully dispatched to the Proprietor for ${user.name}!`);
                                    }
                                  }}
                                  className="bg-amber-50 hover:bg-amber-100/50 text-amber-700 border border-amber-200 text-[10px] font-black px-3 py-1.5 rounded-lg transition"
                                >
                                  Request Approval
                                </button>
                              )}
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
        )}

        {/* Tab: Farmer Final Payment Settlement */}
        {activeTab === "farmer_final_payments" && (
          <div className="space-y-4 text-left animate-in fade-in duration-200">
            {/* Header banner */}
            <div className="bg-gradient-to-r from-slate-50 to-white p-5 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <h2 className="text-sm font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2">
                  <Landmark size={16} className="text-brand-800" />
                  Farmer Final Settlement Desk
                </h2>
                <p className="text-[10.5px] text-slate-500 mt-1 leading-normal">
                  Review harvest logs, compute price metrics, subtract advances or pesticide debits, calculate loading tolls, and disburse final crop payouts.
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => setShowAddFarmerPaymentModal(true)}
                  className="bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 font-extrabold text-[10.5px] px-3.5 py-2 rounded-xl transition flex items-center gap-1 cursor-pointer"
                >
                  <PlusCircle size={13} />
                  Add New Row
                </button>
                {(() => {
                  const selectedRows = farmerFinalPayments.filter(p => selectedFarmerFinalPaymentIds.includes(p.id));
                  const selectedDraftCount = selectedRows.filter(p => p.status === "Unpaid" || !p.status || p.status === "Draft").length;
                  const selectedReadyCount = selectedRows.filter(p => p.status === "Approved").length;

                  return (
                    <div className="flex flex-wrap gap-2">
                      {selectedDraftCount > 0 && (
                        <button
                          onClick={() => {
                            const updated = farmerFinalPayments.map(p => {
                              if ((p.status === "Unpaid" || !p.status || p.status === "Draft") && selectedFarmerFinalPaymentIds.includes(p.id)) {
                                return { ...p, status: "Awaiting Approval" };
                              }
                              return p;
                            });
                            setFarmerFinalPayments(updated);
                            localStorage.setItem("ks_farmer_final_payments", JSON.stringify(updated));
                            alert(`Dispatched final settlement approval requests for ${selectedDraftCount} farmers to Proprietor!`);
                          }}
                          className="bg-amber-500 hover:bg-amber-600 text-white font-extrabold text-[10.5px] px-3.5 py-2 rounded-xl transition shadow-sm flex items-center gap-1.5"
                        >
                          <Lock size={13} />
                          Bulk Request Approval ({selectedDraftCount} Selected)
                        </button>
                      )}

                      {selectedReadyCount > 0 && (
                        <button
                          onClick={() => {
                            setSelectedFarmerFinalPayment(null); // Bulk flag
                            setShowFarmerPaymentModal(true);
                          }}
                          className="bg-brand-800 hover:bg-brand-900 text-white font-extrabold text-[10.5px] px-3.5 py-2 rounded-xl transition shadow-sm flex items-center gap-1.5"
                        >
                          <CheckCircle2 size={13} />
                          Bulk Disburse ({selectedReadyCount} Selected)
                        </button>
                      )}
                    </div>
                  );
                })()}
              </div>
            </div>

            {/* Quick stats cards */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-sm">
                <span className="text-[9.5px] text-slate-400 font-bold uppercase tracking-wider block">Total Claims</span>
                <span className="text-base font-extrabold text-slate-800">{farmerFinalPayments.length} Farmers</span>
              </div>
              <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-sm">
                <span className="text-[9.5px] text-slate-400 font-bold uppercase tracking-wider block">Completed Settlements</span>
                <span className="text-base font-extrabold text-emerald-750">
                  {farmerFinalPayments.filter(p => p.status === "Paid").length} Paid
                </span>
              </div>
              <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-sm">
                <span className="text-[9.5px] text-slate-400 font-bold uppercase tracking-wider block">Pending Amount</span>
                <span className="text-base font-extrabold text-amber-600">
                  ₹{farmerFinalPayments.filter(p => p.status !== "Paid").reduce((sum, p) => {
                    const gross = p.weightKg * p.pricePerKg;
                    const loading = Math.round((p.weightKg / 1000) * 400);
                    const deductions = p.advanceAmount + p.interest + p.pesticideDues + loading;
                    return sum + Math.max(0, gross - deductions);
                  }, 0).toLocaleString()}
                </span>
              </div>
              <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-sm">
                <span className="text-[9.5px] text-slate-400 font-bold uppercase tracking-wider block">Total Disbursed</span>
                <span className="text-base font-extrabold text-brand-800">
                  ₹{farmerFinalPayments.filter(p => p.status === "Paid").reduce((sum, p) => {
                    const gross = p.weightKg * p.pricePerKg;
                    const loading = Math.round((p.weightKg / 1000) * 400);
                    const deductions = p.advanceAmount + p.interest + p.pesticideDues + loading;
                    return sum + Math.max(0, gross - deductions);
                  }, 0).toLocaleString()}
                </span>
              </div>
            </div>

            {/* Filters Row */}
            <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-sm flex flex-col lg:flex-row lg:items-center justify-between gap-3">
              <div className="relative flex-1 max-w-sm">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search by farmer name, village, account number, or IFSC..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-3 py-2 text-[11px] focus:outline-none focus:ring-1 focus:ring-brand-500 focus:bg-white transition"
                />
              </div>

              {/* Status & Village filter combo */}
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-[10px] text-slate-400 font-extrabold uppercase tracking-wider">Village Route:</span>
                <select
                  value={selectedVillageForAdvance}
                  onChange={(e) => setSelectedVillageForAdvance(e.target.value)}
                  className="bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1.5 text-[11px] font-bold focus:outline-none"
                >
                  <option value="All">All Villages</option>
                  <option value="IG PETA">IG PETA</option>
                  <option value="MUNIKUDALI">MUNIKUDALI</option>
                  <option value="MUGGULLA">MUGGULLA</option>
                  <option value="Rampur">Rampur</option>
                  <option value="Dhamnod">Dhamnod</option>
                </select>

                <div className="h-4 w-px bg-slate-200 mx-1 hidden sm:block" />

                {(["All", "Paid", "Unpaid"] as const).map((st) => (
                  <button
                    key={st}
                    onClick={() => setFarmerPaymentFilter(st)}
                    className={`px-3 py-1.5 rounded-lg text-[10.5px] font-extrabold transition whitespace-nowrap ${
                      farmerPaymentFilter === st
                        ? "bg-slate-100 text-slate-800"
                        : "text-slate-500 hover:text-slate-800 hover:bg-slate-50"
                    }`}
                  >
                    {st}
                  </button>
                ))}
              </div>
            </div>

            {/* Farmer Payments Table */}
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 text-[10px] font-bold uppercase tracking-wider">
                      <th className="py-3 px-3 w-10">
                        {(() => {
                          const visibleFarmers = farmerFinalPayments.filter(p => {
                            const searchMatch = p.farmerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                                                p.villageName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                                                p.ifscCode.toLowerCase().includes(searchQuery.toLowerCase()) ||
                                                p.accountNumber.toLowerCase().includes(searchQuery.toLowerCase());
                            if (!searchMatch) return false;

                            const villageMatch = selectedVillageForAdvance === "All" || p.villageName === selectedVillageForAdvance;
                            if (!villageMatch) return false;

                            if (farmerPaymentFilter === "Paid") return p.status === "Paid";
                            if (farmerPaymentFilter === "Unpaid") return p.status !== "Paid";
                            return true;
                          });

                          return (
                            <input
                              type="checkbox"
                              checked={
                                visibleFarmers.length > 0 &&
                                visibleFarmers.every(p => selectedFarmerFinalPaymentIds.includes(p.id))
                              }
                              onChange={(e) => {
                                if (e.target.checked) {
                                  setSelectedFarmerFinalPaymentIds(Array.from(new Set([
                                    ...selectedFarmerFinalPaymentIds,
                                    ...visibleFarmers.map(p => p.id)
                                  ])));
                                } else {
                                  const visibleIds = visibleFarmers.map(p => p.id);
                                  setSelectedFarmerFinalPaymentIds(selectedFarmerFinalPaymentIds.filter(id => !visibleIds.includes(id)));
                                }
                              }}
                              className="rounded border-slate-300 text-brand-800 focus:ring-brand-500"
                            />
                          );
                        })()}
                      </th>
                      <th className="py-3 px-3 w-12">S.No</th>
                      <th className="py-3 px-3">Farmer &amp; Village Details</th>
                      <th className="py-3 px-3 text-right">Acres</th>
                      <th className="py-3 px-3 text-right">Bags</th>
                      <th className="py-3 px-3 text-right">Weight (KG)</th>
                      <th className="py-3 px-3 text-right">Price/KG</th>
                      <th className="py-3 px-3 text-right">Gross Total</th>
                      <th className="py-3 px-3 text-right">Total Deductions</th>
                      <th className="py-3 px-3 text-right">Net Payable</th>
                      <th className="py-3 px-3 font-mono">Transfer Details</th>
                      <th className="py-3 px-3">Status</th>
                      <th className="py-3 px-3 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-150">
                    {(() => {
                      const filtered = farmerFinalPayments.filter(p => {
                        const searchMatch = p.farmerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                                            p.villageName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                                            p.ifscCode.toLowerCase().includes(searchQuery.toLowerCase()) ||
                                            p.accountNumber.toLowerCase().includes(searchQuery.toLowerCase());
                        if (!searchMatch) return false;

                        const villageMatch = selectedVillageForAdvance === "All" || p.villageName === selectedVillageForAdvance;
                        if (!villageMatch) return false;

                        if (farmerPaymentFilter === "Paid") return p.status === "Paid";
                        if (farmerPaymentFilter === "Unpaid") return p.status !== "Paid";
                        return true;
                      });

                      if (filtered.length === 0) {
                        return (
                          <tr>
                            <td colSpan={13} className="py-8 text-center text-slate-400 font-medium italic">
                              No farmer final settlement records found matching your filters.
                            </td>
                          </tr>
                        );
                      }

                      return filtered.map((row, index) => {
                        const gross = row.weightKg * row.pricePerKg;
                        const loadingCharges = Math.round((row.weightKg / 1000) * 400);
                        const totalDeductions = row.advanceAmount + row.interest + row.pesticideDues + loadingCharges;
                        const netPayable = Math.round(gross - totalDeductions);

                        return (
                          <tr key={row.id} className="hover:bg-slate-50/70 transition-colors font-semibold text-slate-700">
                            <td className="py-3 px-3">
                              <input
                                type="checkbox"
                                checked={selectedFarmerFinalPaymentIds.includes(row.id)}
                                onChange={(e) => {
                                  if (e.target.checked) {
                                    setSelectedFarmerFinalPaymentIds([...selectedFarmerFinalPaymentIds, row.id]);
                                  } else {
                                    setSelectedFarmerFinalPaymentIds(selectedFarmerFinalPaymentIds.filter(id => id !== row.id));
                                  }
                                }}
                                className="rounded border-slate-300 text-brand-800 focus:ring-brand-500"
                              />
                            </td>
                            <td className="py-3 px-3 font-mono text-slate-400 text-[10px]">{row.id.replace("FFP-", "")}</td>
                            <td className="py-3 px-3">
                              <div className="font-extrabold text-slate-900 leading-tight text-[11px]">{row.farmerName}</div>
                              <div className="text-[9.5px] text-slate-400 uppercase tracking-wide">{row.villageName}</div>
                            </td>
                            <td className="py-3 px-3 text-right font-mono text-slate-500">{row.acres} Ac</td>
                            <td className="py-3 px-3 text-right font-mono text-slate-850">{row.bagCount} Bags</td>
                            <td className="py-3 px-3 text-right font-mono text-slate-900 font-bold">{row.weightKg.toLocaleString()} KG</td>
                            <td className="py-3 px-3 text-right font-mono text-brand-700 font-extrabold">₹{row.pricePerKg}</td>
                            <td className="py-3 px-3 text-right font-mono font-bold text-slate-900">₹{gross.toLocaleString()}</td>
                            <td className="py-3 px-3 text-right text-red-700 font-mono text-[10.5px]">
                              ₹{totalDeductions.toLocaleString()}
                              <span className="block text-[8px] text-slate-400 font-normal">
                                Adv: {row.advanceAmount} | Pesticides: {row.pesticideDues} | Loading: {loadingCharges}
                              </span>
                            </td>
                            <td className="py-3 px-3 text-right font-mono font-black text-brand-900 bg-brand-50/30">
                              ₹{netPayable.toLocaleString()}
                            </td>
                            <td className="py-3 px-3 text-[10.5px]">
                              <div className="font-bold text-slate-800 font-mono">{row.accountNumber}</div>
                              <div className="text-[9.5px] text-slate-400 font-mono">IFSC: {row.ifscCode}</div>
                            </td>
                            <td className="py-3 px-3">
                              {row.status === "Paid" ? (
                                <span className="text-[9px] font-black px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200">
                                  ✓ PAID
                                </span>
                              ) : row.status === "Awaiting Approval" ? (
                                <span className="text-[9px] font-black px-2 py-0.5 rounded bg-amber-50 text-amber-750 border border-amber-250 animate-pulse">
                                  ⏳ AWAITING APPROVAL
                                </span>
                              ) : row.status === "Approved" ? (
                                <span className="text-[9px] font-black px-2 py-0.5 rounded bg-sky-50 text-sky-700 border border-sky-200">
                                  🔓 APPROVED &amp; READY
                                </span>
                              ) : (
                                <span className="text-[9px] font-black px-2 py-0.5 rounded bg-rose-50 text-rose-700 border border-rose-200">
                                  🔒 LOCKED (DRAFT)
                                </span>
                              )}
                            </td>
                            <td className="py-3 px-3 text-right">
                              {row.status === "Paid" ? (
                                <div className="flex flex-col items-end gap-1">
                                  <div className="text-[9.5px] text-slate-500 font-bold leading-normal">
                                    <span className="font-extrabold block text-slate-600">{row.transferBy}</span>
                                    <span>Paid: {row.datePaid}</span>
                                  </div>
                                  <button
                                    onClick={() => {
                                      setReceiptData({ type: "farmer", data: row });
                                      setReceiptModalOpen(true);
                                    }}
                                    className="flex items-center gap-1 text-[9.5px] text-brand-800 hover:text-brand-900 font-extrabold uppercase bg-brand-50 hover:bg-brand-100 border border-brand-200 px-2 py-1 rounded-lg transition cursor-pointer"
                                  >
                                    📄 Receipt
                                  </button>
                                </div>
                              ) : row.status === "Awaiting Approval" ? (
                                <button
                                  disabled
                                  className="text-[10px] font-black px-3 py-1.5 rounded-lg border bg-slate-50 text-slate-400 border-slate-200 cursor-not-allowed"
                                >
                                  Awaiting Owner...
                                </button>
                              ) : row.status === "Approved" ? (
                                <button
                                  onClick={() => {
                                    setSelectedFarmerFinalPayment(row);
                                    setFarmerPaymentPricePerKg(row.pricePerKg.toString());
                                    setFarmerPaymentInterest(row.interest.toString());
                                    setFarmerPaymentAdvance(row.advanceAmount.toString());
                                    setFarmerPaymentPesticide(row.pesticideDues.toString());
                                    setShowFarmerPaymentModal(true);
                                  }}
                                  className="bg-brand-800 hover:bg-brand-900 text-white text-[10px] font-black px-2.5 py-1.5 rounded-lg transition shadow-sm whitespace-nowrap cursor-pointer"
                                >
                                  Disburse Payment
                                </button>
                              ) : (
                                <button
                                  onClick={() => {
                                    const updated = farmerFinalPayments.map(p => p.id === row.id ? { ...p, status: "Awaiting Approval" } : p);
                                    setFarmerFinalPayments(updated);
                                    localStorage.setItem("ks_farmer_final_payments", JSON.stringify(updated));
                                    alert(`Dispatched final settlement approval request for ${row.farmerName} to Proprietor!`);
                                  }}
                                  className="bg-amber-50 hover:bg-amber-100/50 text-amber-700 border border-amber-200 text-[10px] font-black px-3 py-1.5 rounded-lg transition"
                                >
                                  Send Approval
                                </button>
                              )}
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
        )}

        {/* Tab: RazorpayX Automated Instant & Bulk Payout Core */}
        {activeTab === "razorpayx" && (() => {
          const unpaidFarmersForRzp = farmerFinalPayments.filter(p => p.status === "Approved");
          const unpaidStaffForRzp = assistantUsers.filter(u => {
            const isPaid = processedSalaries.some(p => p.employeeMobile === u.mobileNumber && p.monthYear === salaryMonth);
            return !isPaid && !u.salaryLocked;
          });

          const triggerRzpPayout = (itemsToPay: any[], payType: "farmers" | "staff") => {
            if (itemsToPay.length === 0) {
              alert("Please select at least one record to disburse.");
              return;
            }

            let totalAmountToDisburse = 0;
            if (payType === "farmers") {
              itemsToPay.forEach(item => {
                const priceVal = Number(item.pricePerKg) || 31;
                const gross = item.weightKg * priceVal;
                const loading = Math.round((item.weightKg / 1000) * 400);
                const interestVal = Number(item.interest) || 0;
                const advanceVal = Number(item.advanceAmount) || 0;
                const pesticideVal = Number(item.pesticideDues) || 0;
                const totalDeductions = advanceVal + interestVal + pesticideVal + loading;
                totalAmountToDisburse += Math.round(gross - totalDeductions);
              });
            } else {
              itemsToPay.forEach(item => {
                totalAmountToDisburse += (item.salaryAmount || 25000);
              });
            }

            if (rzpWalletBalance < totalAmountToDisburse) {
              alert(`Insufficient Sandbox balance! Total needed: ₹${totalAmountToDisburse.toLocaleString()} but wallet only has ₹${rzpWalletBalance.toLocaleString()}. Please click top up to add sandbox funds!`);
              return;
            }

            setRzpProcessing(true);
            const stamp = new Date().toLocaleTimeString();
            setRzpLogs([
              `[${stamp}] 🚀 Initializing RazorpayX automated Payout flow...`,
              `[${stamp}] 🔑 Authed with API Key: ${rzpApiKey.slice(0, 15)}... (Sandbox Mode: ${rzpSandbox ? "ACTIVE" : "LIVE_PROD"})`,
              `[${stamp}] 💰 Total payout batch size: ${itemsToPay.length} account(s), Total: ₹${totalAmountToDisburse.toLocaleString()}`
            ]);

            setTimeout(() => {
              const stamp2 = new Date().toLocaleTimeString();
              const contactLogs = itemsToPay.map(item => {
                const name = payType === "farmers" ? item.farmerName : item.name;
                const phone = item.mobileNumber || "9988776655";
                const contId = `cont_${Math.random().toString(36).substring(2, 9)}`;
                return `[${stamp2}] 👤 Contact Verified/Created in Razorpay directory: Name="${name}", Mobile=${phone} -> ID: ${contId}`;
              });

              setRzpActivePayload({
                endpoint: "POST /v1/contacts",
                description: "Registers user details in Razorpay global directory",
                payload: {
                  name: payType === "farmers" ? itemsToPay[0].farmerName : itemsToPay[0].name,
                  email: payType === "farmers" ? `${itemsToPay[0].farmerName.toLowerCase().replace(/\s+/g, "")}@example.com` : `${itemsToPay[0].name.toLowerCase().replace(/\s+/g, "")}@example.com`,
                  contact: payType === "farmers" ? "9988776655" : itemsToPay[0].mobileNumber,
                  type: payType === "farmers" ? "vendor" : "employee",
                  reference_id: payType === "farmers" ? itemsToPay[0].id : `EMP-${itemsToPay[0].mobileNumber}`
                },
                response: {
                  id: "cont_f8d39asj912k",
                  entity: "contact",
                  name: payType === "farmers" ? itemsToPay[0].farmerName : itemsToPay[0].name,
                  type: payType === "farmers" ? "vendor" : "employee",
                  active: true,
                  created_at: Math.floor(Date.now() / 1000)
                }
              });

              setRzpLogs(prev => [...prev, ...contactLogs]);
            }, 600);

            setTimeout(() => {
              const stamp3 = new Date().toLocaleTimeString();
              const fundLogs = itemsToPay.map(item => {
                const accountNo = payType === "farmers" ? (item.accountNumber || "50100234123") : (item.bankAccountNo || "11532984849");
                const ifsc = payType === "farmers" ? (item.ifscCode || "SBIN0015366") : (item.bankIfscCode || "SBIN0015366");
                const faId = `fa_${Math.random().toString(36).substring(2, 9)}`;
                return `[${stamp3}] 💳 Fund Account Associated dynamically: A/C **${accountNo.slice(-4)}, IFSC ${ifsc} -> Linked ID: ${faId}`;
              });

              setRzpActivePayload({
                endpoint: "POST /v1/fund_accounts",
                description: "Associates banking details with contact ID without net banking cooldown",
                payload: {
                  contact_id: "cont_f8d39asj912k",
                  account_type: "bank_account",
                  bank_account: {
                    name: payType === "farmers" ? itemsToPay[0].farmerName : itemsToPay[0].name,
                    ifsc: payType === "farmers" ? (itemsToPay[0].ifscCode || "SBIN0015366") : (itemsToPay[0].bankIfscCode || "SBIN0015366"),
                    account_number: payType === "farmers" ? (itemsToPay[0].accountNumber || "50100234123") : (itemsToPay[0].bankAccountNo || "11532984849")
                  }
                },
                response: {
                  id: "fa_kd982nsad83a",
                  entity: "fund_account",
                  contact_id: "cont_f8d39asj912k",
                  account_type: "bank_account",
                  active: true,
                  created_at: Math.floor(Date.now() / 1000)
                }
              });

              setRzpLogs(prev => [...prev, ...fundLogs]);
            }, 1200);

            setTimeout(() => {
              const stamp4 = new Date().toLocaleTimeString();
              setRzpLogs(prev => [...prev, `[${stamp4}] 💸 Sending Instant Batch Disbursal Requests to Razorpay gateway via ${rzpPayoutMode}...`]);

              setRzpActivePayload({
                endpoint: "POST /v1/payouts",
                description: "Triggers instant secure disbursal via IMPS/NEFT/UPI",
                payload: {
                  account_number: "2223330044556677",
                  fund_account_id: "fa_kd982nsad83a",
                  amount: payType === "farmers" ? 234500 : 2500000,
                  currency: "INR",
                  mode: rzpPayoutMode,
                  purpose: payType === "farmers" ? "crop_payout" : "payroll",
                  queue_if_low_balance: true,
                  reference_id: `TXN-${Date.now().toString().slice(-6)}`
                },
                response: {
                  id: `pout_Rzp${Math.random().toString(36).substring(2, 8).toUpperCase()}`,
                  entity: "payout",
                  fund_account_id: "fa_kd982nsad83a",
                  amount: payType === "farmers" ? 234500 : 2500000,
                  currency: "INR",
                  mode: rzpPayoutMode,
                  status: "processed",
                  utr: `UTR${Math.floor(100000000000 + Math.random() * 900000000000)}`,
                  created_at: Math.floor(Date.now() / 1000)
                }
              });
            }, 2000);

            setTimeout(() => {
              const stamp5 = new Date().toLocaleTimeString();
              const payoutLogs: string[] = [];
              const todayStr = new Date().toISOString().split("T")[0];

              if (payType === "farmers") {
                const rzpIds = itemsToPay.map(it => it.id);
                const updated = farmerFinalPayments.map(p => {
                  if (rzpIds.includes(p.id)) {
                    const payoutId = `pout_RzpF_${Math.random().toString(36).substring(2, 7).toUpperCase()}`;
                    payoutLogs.push(`[${stamp5}] ✅ Disbursed final settlement for ${p.farmerName}: Status PROCESSED (Payout ID: ${payoutId})`);
                    return {
                      ...p,
                      status: "Paid" as const,
                      datePaid: todayStr,
                      transferBy: `RAZORPAYX (${rzpPayoutMode})`,
                      remarks: `Auto RazorpayX Disbursal - ID ${payoutId}`
                    };
                  }
                  return p;
                });
                setFarmerFinalPayments(updated);
                localStorage.setItem("ks_farmer_final_payments", JSON.stringify(updated));
              } else {
                const newPayments = itemsToPay.map((u, idx) => {
                  const payoutId = `pout_RzpS_${(Date.now() + idx).toString().slice(-5).toUpperCase()}`;
                  payoutLogs.push(`[${stamp5}] ✅ Disbursed payroll for ${u.name}: Status PROCESSED (Payout ID: ${payoutId})`);
                  return {
                    id: `SAL-TXN-${(Date.now() + idx).toString().slice(-6)}`,
                    employeeMobile: u.mobileNumber,
                    employeeName: u.name,
                    designation: u.designation || "Assistant",
                    salaryAmount: u.salaryAmount || 25000,
                    monthYear: salaryMonth,
                    paymentMode: "Bank Transfer",
                    transactionRef: payoutId,
                    datePaid: todayStr,
                    status: "Paid",
                    remarks: `Auto RazorpayX Payroll Disbursal`
                  };
                });
                const updated = [...processedSalaries, ...newPayments];
                setProcessedSalaries(updated);
                localStorage.setItem("ks_processed_salaries", JSON.stringify(updated));
              }

              setRzpWalletBalance(prev => Math.max(0, prev - totalAmountToDisburse));
              setRzpLogs(prev => [
                ...prev,
                ...payoutLogs,
                `[${stamp5}] 🛡️ Razorpay Ledger successfully synchronised. Company sandbox wallet debited by ₹${totalAmountToDisburse.toLocaleString()}`,
                `[${stamp5}] ✨ Batch payment execution completed with 100% success rate!`
              ]);
              setRzpProcessing(false);
              alert(`Successfully processed RazorpayX automatic payout of ₹${totalAmountToDisburse.toLocaleString()}! Ledger is fully synced.`);
            }, 2700);
          };

          return (
            <div className="space-y-4 text-left animate-in fade-in duration-200">
              {/* Header Banner */}
              <div className="bg-gradient-to-r from-brand-900 via-brand-800 to-brand-900 p-5 rounded-2xl text-white shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="bg-emerald-500 text-white text-[8px] font-black tracking-widest uppercase px-2 py-0.5 rounded-md">
                      API Integrated
                    </span>
                    <span className="text-white/60 font-mono text-[9px]">v1.4.0-stable</span>
                  </div>
                  <h2 className="text-base font-black tracking-tight">RazorpayX Live Payouts &amp; Disbursal Core</h2>
                  <p className="text-[10px] text-brand-100 leading-normal max-w-xl">
                    Automate vendor crop settlements and monthly staff payroll. Direct-to-bank IMPS/UPI routing handles dynamic beneficiary creation on the fly, eliminating cooling-off delays or manual net banking additions.
                  </p>
                </div>

                <div className="flex items-center gap-2 bg-white/10 p-2.5 rounded-xl border border-white/10 shrink-0">
                  <Wallet size={18} className="text-emerald-300" />
                  <div className="text-right">
                    <span className="text-[8px] text-white/75 font-bold uppercase tracking-wider block">Sandbox Balance</span>
                    <span className="font-mono text-xs font-extrabold text-emerald-300">
                      ₹ {rzpWalletBalance.toLocaleString()}
                    </span>
                  </div>
                  <button
                    onClick={() => {
                      setRzpWalletBalance(prev => prev + 50000);
                      setRzpLogs(prev => [...prev, `[${new Date().toLocaleTimeString()}] 📥 Admin topped up sandbox account by ₹50,000.`]);
                    }}
                    className="ml-2 bg-white/25 hover:bg-white/40 text-white font-extrabold text-[9px] px-2 py-1 rounded transition"
                  >
                    + Top Up
                  </button>
                </div>
              </div>

              {/* FAQ/Explainer Section */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-emerald-50/50 p-4 rounded-xl border border-emerald-100 space-y-1">
                  <span className="text-[9px] text-emerald-700 font-extrabold uppercase tracking-wider">01. Dynamic Registration</span>
                  <h4 className="text-[11px] font-bold text-slate-800">No Manual Net Banking</h4>
                  <p className="text-[9.5px] text-slate-500 leading-relaxed">
                    Beneficiaries do not need to be manually registered in net banking. KrishiSetu sends names and mobile numbers dynamically to create a Contact ID on Razorpay instantly.
                  </p>
                </div>

                <div className="bg-emerald-50/50 p-4 rounded-xl border border-emerald-100 space-y-1">
                  <span className="text-[9px] text-emerald-700 font-extrabold uppercase tracking-wider">02. Auto Fund Accounts</span>
                  <h4 className="text-[11px] font-bold text-slate-800">0-Second Cooling-Off</h4>
                  <p className="text-[9.5px] text-slate-500 leading-relaxed">
                    RazorpayX dynamically associates the farmer's bank account number and IFSC or UPI ID to the Contact ID. Disbursals are permitted immediately with zero thermal/security waiting.
                  </p>
                </div>

                <div className="bg-emerald-50/50 p-4 rounded-xl border border-emerald-100 space-y-1">
                  <span className="text-[9px] text-emerald-700 font-extrabold uppercase tracking-wider">03. Automated Callback Ledger</span>
                  <h4 className="text-[11px] font-bold text-slate-800">Instant Reconciliation</h4>
                  <p className="text-[9.5px] text-slate-500 leading-relaxed">
                    Upon payout confirmation, Razorpay reports a success callback with the UTR code. KrishiSetu instantly updates the ledger status to "Paid" and locks the transaction.
                  </p>
                </div>
              </div>

              {/* Main Workspace split */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
                
                {/* Left Column: API credentials and Payee Directory Selection */}
                <div className="lg:col-span-7 space-y-4">
                  
                  {/* Configuration card */}
                  <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-3xs space-y-3">
                    <div className="flex justify-between items-center pb-2 border-b border-slate-100">
                      <h3 className="text-xs font-bold text-slate-800 flex items-center gap-1.5 uppercase tracking-wide">
                        <Settings size={13} className="text-slate-500" />
                        RazorpayX Integration Credentials
                      </h3>
                      <span className="text-[9px] text-slate-400 font-mono">Status: Connected</span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                      <div className="space-y-1">
                        <label className="block text-[9px] font-bold text-slate-400 uppercase tracking-wider">Razorpay API Key ID</label>
                        <input
                          type="text"
                          value={rzpApiKey}
                          onChange={(e) => setRzpApiKey(e.target.value)}
                          className="w-full p-2 border border-slate-200 rounded-lg font-mono text-slate-800 focus:ring-1 focus:ring-brand-500 outline-none text-[10.5px]"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="block text-[9px] font-bold text-slate-400 uppercase tracking-wider">API Secret / Token</label>
                        <input
                          type="password"
                          value={rzpApiSecret}
                          onChange={(e) => setRzpApiSecret(e.target.value)}
                          className="w-full p-2 border border-slate-200 rounded-lg font-mono text-slate-800 focus:ring-1 focus:ring-brand-500 outline-none text-[10.5px]"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3 text-xs pt-1">
                      <div className="space-y-1">
                        <label className="block text-[9px] font-bold text-slate-400 uppercase tracking-wider">Disbursal Mode</label>
                        <select
                          value={rzpPayoutMode}
                          onChange={(e: any) => setRzpPayoutMode(e.target.value)}
                          className="w-full p-2 border border-slate-200 rounded-lg bg-slate-50 text-[10.5px] font-bold focus:outline-none"
                        >
                          <option value="IMPS">IMPS (Instant Direct Account Transfer)</option>
                          <option value="NEFT">NEFT (Batch settlement cycle)</option>
                          <option value="UPI">UPI (Digital Direct Address)</option>
                        </select>
                      </div>

                      <div className="space-y-1">
                        <label className="block text-[9px] font-bold text-slate-400 uppercase tracking-wider">Environment sandbox</label>
                        <div className="flex items-center gap-2 h-9">
                          <input
                            type="checkbox"
                            checked={rzpSandbox}
                            onChange={(e) => setRzpSandbox(e.target.checked)}
                            className="w-4 h-4 text-emerald-600 border-slate-300 rounded focus:ring-emerald-500"
                          />
                          <span className="text-[10.5px] font-bold text-slate-700">Enable Sandbox (Test Mode)</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Disbursal List Directory */}
                  <div className="bg-white rounded-xl border border-slate-200 shadow-3xs overflow-hidden">
                    <div className="bg-slate-50 px-4 py-3 border-b border-slate-200 flex justify-between items-center">
                      <div className="flex gap-2">
                        <button
                          onClick={() => setRzpSelectedType("farmers")}
                          className={`px-3 py-1 text-[10px] font-bold rounded-lg transition ${
                            rzpSelectedType === "farmers"
                              ? "bg-brand-800 text-white shadow-3xs"
                              : "bg-slate-200 hover:bg-slate-300 text-slate-600"
                          }`}
                        >
                          Farmers Settlements ({unpaidFarmersForRzp.length})
                        </button>
                        <button
                          onClick={() => setRzpSelectedType("staff")}
                          className={`px-3 py-1 text-[10px] font-bold rounded-lg transition ${
                            rzpSelectedType === "staff"
                              ? "bg-brand-800 text-white shadow-3xs"
                              : "bg-slate-200 hover:bg-slate-300 text-slate-600"
                          }`}
                        >
                          Employee Salaries ({unpaidStaffForRzp.length})
                        </button>
                      </div>

                      <span className="text-[9.5px] text-slate-400 font-mono uppercase">
                        Select Pending Records Below
                      </span>
                    </div>

                    <div className="p-4">
                      {rzpSelectedType === "farmers" ? (
                        unpaidFarmersForRzp.length === 0 ? (
                          <div className="p-6 text-center text-slate-400 bg-slate-50/50 rounded-xl border border-dashed">
                            No farmer final payments are currently approved by the proprietor for settlement disbursal.
                          </div>
                        ) : (
                          <div className="space-y-2 max-h-80 overflow-y-auto pr-1">
                            {unpaidFarmersForRzp.map(item => {
                              const priceVal = Number(item.pricePerKg) || 31;
                              const gross = item.weightKg * priceVal;
                              const loading = Math.round((item.weightKg / 1000) * 400);
                              const interestVal = Number(item.interest) || 0;
                              const advanceVal = Number(item.advanceAmount) || 0;
                              const pesticideVal = Number(item.pesticideDues) || 0;
                              const totalDeductions = advanceVal + interestVal + pesticideVal + loading;
                              const net = Math.round(gross - totalDeductions);

                              return (
                                <div
                                  key={item.id}
                                  className="flex items-center justify-between p-3 bg-slate-50/60 rounded-xl border border-slate-150 hover:bg-slate-100/50 transition"
                                >
                                  <div className="space-y-0.5">
                                    <div className="flex items-center gap-1.5">
                                      <span className="font-black text-slate-850 text-xs">{item.farmerName}</span>
                                      <span className="text-[8px] bg-slate-200/80 px-1.5 py-0.2 rounded text-slate-600 font-mono">
                                        {item.id}
                                      </span>
                                    </div>
                                    <div className="text-[9.5px] text-slate-500 flex items-center gap-2">
                                      <span>A/C: **{item.accountNumber ? item.accountNumber.slice(-4) : "1234"}</span>
                                      <span>•</span>
                                      <span>IFSC: {item.ifscCode || "SBIN0015366"}</span>
                                      <span>•</span>
                                      <span>{item.villageName}</span>
                                    </div>
                                  </div>

                                  <div className="flex items-center gap-3">
                                    <div className="text-right">
                                      <span className="text-[9px] text-slate-400 block font-bold">NET SETTLEMENT</span>
                                      <span className="font-mono text-xs font-extrabold text-slate-800">
                                        ₹ {net.toLocaleString()}
                                      </span>
                                    </div>

                                    <button
                                      onClick={() => triggerRzpPayout([item], "farmers")}
                                      disabled={rzpProcessing}
                                      className="bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-[10px] px-3 py-1.5 rounded-lg transition shadow-3xs"
                                    >
                                      Instant Pay
                                    </button>
                                  </div>
                                </div>
                              );
                            })}

                            <div className="pt-2">
                              <button
                                onClick={() => triggerRzpPayout(unpaidFarmersForRzp, "farmers")}
                                disabled={rzpProcessing}
                                className="w-full py-2 bg-brand-800 hover:bg-brand-900 text-white text-xs font-extrabold rounded-xl transition shadow-xs text-center block cursor-pointer"
                              >
                                Disburse ALL Pending settlements via RazorpayX (Bulk {unpaidFarmersForRzp.length} Farmers)
                              </button>
                            </div>
                          </div>
                        )
                      ) : (
                        unpaidStaffForRzp.length === 0 ? (
                          <div className="p-6 text-center text-slate-400 bg-slate-50/50 rounded-xl border border-dashed">
                            No employee payroll is currently outstanding for the cycle {salaryMonth}. All have been settled!
                          </div>
                        ) : (
                          <div className="space-y-2 max-h-80 overflow-y-auto pr-1">
                            {unpaidStaffForRzp.map(item => {
                              const salary = item.salaryAmount || 25000;
                              return (
                                <div
                                  key={item.mobileNumber}
                                  className="flex items-center justify-between p-3 bg-slate-50/60 rounded-xl border border-slate-150 hover:bg-slate-100/50 transition"
                                >
                                  <div className="space-y-0.5">
                                    <div className="flex items-center gap-1.5">
                                      <span className="font-black text-slate-850 text-xs">{item.name}</span>
                                      <span className="text-[8.5px] bg-brand-50 border border-brand-100 px-1.5 py-0.2 rounded text-brand-700 font-bold">
                                        {item.designation || "Village Assistant"}
                                      </span>
                                    </div>
                                    <div className="text-[9.5px] text-slate-500 flex items-center gap-2">
                                      <span>A/C: **{item.bankAccountNo ? item.bankAccountNo.slice(-4) : "8916"}</span>
                                      <span>•</span>
                                      <span>IFSC: {item.bankIfscCode || "SBIN0015366"}</span>
                                      <span>•</span>
                                      <span>{item.mobileNumber}</span>
                                    </div>
                                  </div>

                                  <div className="flex items-center gap-3">
                                    <div className="text-right">
                                      <span className="text-[9px] text-slate-400 block font-bold">MONTHLY PAYROLL</span>
                                      <span className="font-mono text-xs font-extrabold text-slate-800">
                                        ₹ {salary.toLocaleString()}
                                      </span>
                                    </div>

                                    <button
                                      onClick={() => triggerRzpPayout([item], "staff")}
                                      disabled={rzpProcessing}
                                      className="bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-[10px] px-3 py-1.5 rounded-lg transition shadow-3xs"
                                    >
                                      Instant Pay
                                    </button>
                                  </div>
                                </div>
                              );
                            })}

                            <div className="pt-2">
                              <button
                                onClick={() => triggerRzpPayout(unpaidStaffForRzp, "staff")}
                                disabled={rzpProcessing}
                                className="w-full py-2 bg-brand-800 hover:bg-brand-900 text-white text-xs font-extrabold rounded-xl transition shadow-xs text-center block cursor-pointer"
                              >
                                Disburse ALL Staff Payroll via RazorpayX (Bulk {unpaidStaffForRzp.length} Employees)
                              </button>
                            </div>
                          </div>
                        )
                      )}
                    </div>
                  </div>

                </div>

                {/* Right Column: Real-time Live API Logging console & JSON request viewer */}
                <div className="lg:col-span-5 space-y-4">
                  
                  {/* Console logs */}
                  <div className="bg-slate-900 rounded-xl shadow-md border border-slate-800 overflow-hidden text-left flex flex-col h-64">
                    <div className="bg-slate-950 px-3.5 py-2.5 border-b border-slate-800/80 flex justify-between items-center shrink-0">
                      <div className="flex items-center gap-2 text-slate-300 font-mono text-[10px]">
                        <Terminal size={12} className="text-emerald-400 animate-pulse" />
                        <span>RAZORPAYX GATEWAY RESPONSE LOGS</span>
                      </div>
                      <button
                        onClick={() => setRzpLogs([`[${new Date().toLocaleTimeString()}] [SYSTEM]: Cleared trace log.`])}
                        className="text-[9px] text-slate-500 hover:text-slate-300 transition font-mono uppercase font-bold"
                      >
                        Clear
                      </button>
                    </div>

                    <div className="p-3 font-mono text-[9.5px] text-emerald-400 space-y-1 overflow-y-auto flex-1 bg-slate-950/40">
                      {rzpLogs.map((log, idx) => (
                        <div key={idx} className="leading-relaxed break-all">
                          {log}
                        </div>
                      ))}
                      {rzpProcessing && (
                        <div className="flex items-center gap-1.5 text-slate-400 animate-pulse italic pt-0.5">
                          <span className="inline-block w-1.5 h-1.5 bg-brand-500 rounded-full animate-ping"></span>
                          <span>Executing API payload request to api.razorpay.com/v1 ...</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* REST API Active JSON payload viewer */}
                  <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-3xs space-y-3">
                    <div className="flex justify-between items-center pb-2 border-b border-slate-100">
                      <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wide">
                        API Request/Response Schema
                      </h3>
                      <span className="text-[8px] bg-slate-150 px-2 py-0.5 rounded text-slate-600 font-bold uppercase tracking-wider font-mono">
                        Direct REST Payload
                      </span>
                    </div>

                    {rzpActivePayload ? (
                      <div className="space-y-2 text-left">
                        <div className="flex items-center justify-between text-[10px]">
                          <span className="font-mono font-extrabold text-brand-700 bg-brand-50 px-2 py-0.5 rounded">
                            {rzpActivePayload.endpoint}
                          </span>
                          <span className="text-slate-500 italic">{rzpActivePayload.description}</span>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 font-mono text-[8.5px]">
                          <div>
                            <span className="text-[8px] text-slate-400 font-bold uppercase block mb-0.5">Client Request JSON</span>
                            <pre className="bg-slate-950 text-slate-300 p-2 rounded-lg max-h-36 overflow-y-auto">
                              {JSON.stringify(rzpActivePayload.payload, null, 2)}
                            </pre>
                          </div>
                          <div>
                            <span className="text-[8px] text-slate-400 font-bold uppercase block mb-0.5">Gateway Response JSON</span>
                            <pre className="bg-slate-950 text-emerald-400 p-2 rounded-lg max-h-36 overflow-y-auto">
                              {JSON.stringify(rzpActivePayload.response, null, 2)}
                            </pre>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="p-6 text-center text-slate-400 text-[10px] italic leading-normal bg-slate-50 rounded-xl">
                        No transactions captured during this session. Disburse any payment to analyze live API headers, REST endpoints, and payload structures.
                      </div>
                    )}
                  </div>

                </div>

              </div>
            </div>
          );
        })()}

        {/* Tab: Sowing Audit Desk (Field Verification Review) */}
        {activeTab === "field_verifications" && (() => {
          const totalInspections = fieldVerifications.length;
          const pendingCount = fieldVerifications.filter(v => v.status === "Pending Review").length;
          const passedCount = fieldVerifications.filter(v => v.status === "Passed").length;
          const rejectedCount = fieldVerifications.filter(v => v.status === "Rejected").length;

          // Calculate total verified acres
          const totalVerifiedAcres = fieldVerifications
            .filter(v => v.status === "Passed")
            .reduce((sum, v) => sum + (Number(v.verifiedAcres) || 0), 0);

          const filteredVerifications = fieldVerifications.filter(v => {
            const matchesSearch = 
              (v.farmerName || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
              (v.farmerId || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
              (v.villageName || "").toLowerCase().includes(searchQuery.toLowerCase());
            
            const matchesStatus = auditStatusFilter === "all" || v.status === auditStatusFilter;
            const matchesVillage = auditVillageFilter === "all" || (v.villageName || "").toLowerCase() === auditVillageFilter.toLowerCase();
            
            return matchesSearch && matchesStatus && matchesVillage;
          });

          const uniqueVillages = Array.from(new Set(fieldVerifications.map(v => v.villageName).filter(Boolean))) as string[];

          // Check if coordinates already exist in other passed/pending verifications (to alert duplicates)
          const findGpsDuplicates = (currentId: string, lat: number, lng: number) => {
            if (!lat || !lng) return [];
            return fieldVerifications.filter(v => 
              v.id !== currentId && 
              v.status !== "Rejected" &&
              Math.abs(v.latitude - lat) < 0.0001 && 
              Math.abs(v.longitude - lng) < 0.0001
            );
          };

          const handleAuditApprove = (verificationId: string) => {
            const updated = fieldVerifications.map(v => {
              if (v.id === verificationId) {
                return {
                  ...v,
                  status: "Passed",
                  auditedBy: "Lead Accountant",
                  auditDate: new Date().toLocaleDateString("en-IN") + " " + new Date().toLocaleTimeString("en-IN", { hour: '2-digit', minute: '2-digit' }),
                  rejectionReason: ""
                };
              }
              return v;
            });
            updateFieldVerifications(updated);
            setAuditSuccessAlert("Inspection approved successfully! The verification record has been passed.");
            setReviewingVerification(null);
            setTimeout(() => setAuditSuccessAlert(null), 4000);
          };

          const handleAuditRejectInit = (verification: any) => {
            setReviewingVerification(verification);
            setAuditRejectReason("");
            setShowRejectModal(true);
          };

          const handleAuditRejectConfirm = () => {
            if (!auditRejectReason.trim()) {
              alert("Please provide a rejection reason so the Village Assistant knows what to correct.");
              return;
            }

            const updated = fieldVerifications.map(v => {
              if (v.id === reviewingVerification.id) {
                return {
                  ...v,
                  status: "Rejected",
                  auditedBy: "Lead Accountant",
                  auditDate: new Date().toLocaleDateString("en-IN") + " " + new Date().toLocaleTimeString("en-IN", { hour: '2-digit', minute: '2-digit' }),
                  rejectionReason: auditRejectReason.trim()
                };
              }
              return v;
            });

            updateFieldVerifications(updated);
            setAuditSuccessAlert(`Verification for ${reviewingVerification.farmerName} rejected and returned to ${reviewingVerification.villageAssistant || "Village Assistant"}.`);
            setShowRejectModal(false);
            setReviewingVerification(null);
            setTimeout(() => setAuditSuccessAlert(null), 4000);
          };

          return (
            <div className="space-y-4 text-left animate-in fade-in duration-200">
              {/* Header Banner */}
              <div className="bg-gradient-to-r from-slate-900 to-slate-800 p-6 rounded-2xl border border-slate-700 shadow-lg text-white">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="bg-amber-500/20 text-amber-400 text-[9px] uppercase font-black px-2.5 py-1 rounded-full border border-amber-500/30">
                        Geo-Inspection Desk
                      </span>
                      <span className="bg-emerald-500/20 text-emerald-400 text-[9px] uppercase font-black px-2.5 py-1 rounded-full border border-emerald-500/30">
                        Zero Duplicates
                      </span>
                    </div>
                    <h2 className="text-lg font-bold mt-2">Sowing Audit &amp; Area Verification Desk</h2>
                    <p className="text-[11px] text-slate-300 mt-1 max-w-2xl leading-relaxed">
                      Cross-verify Village Assistant field logs, dynamic GPS locations, and photo records. Prevent duplicate farm claims, flag high-variance acreage estimates, and disburse advances only to authenticated farmers.
                    </p>
                  </div>
                  <div className="bg-white/5 backdrop-blur-md p-4 rounded-xl border border-white/10 min-w-[200px]">
                    <div className="text-[10px] text-slate-400 uppercase font-bold">Total Area Verified</div>
                    <div className="text-2xl font-black text-amber-400 mt-0.5">{totalVerifiedAcres.toFixed(1)} <span className="text-xs font-normal text-slate-300">Acres</span></div>
                    <div className="text-[9px] text-slate-400 mt-1 flex justify-between">
                      <span>Inspected logs: {totalInspections}</span>
                      <span className="text-emerald-400 font-bold">Passed: {passedCount}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Alert Message Banner */}
              {auditSuccessAlert && (
                <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 p-3 rounded-xl text-xs flex items-center gap-2 shadow-sm animate-in fade-in slide-in-from-top-2">
                  <span className="bg-emerald-100 text-emerald-800 p-1 rounded-full text-xs font-bold">✓</span>
                  <div>{auditSuccessAlert}</div>
                </div>
              )}

              {/* Grid of Key Stats */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-sm">
                  <div className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">Total Field Inspections</div>
                  <div className="text-xl font-extrabold text-slate-800 mt-1">{totalInspections}</div>
                  <div className="text-[9px] text-slate-500 mt-0.5">Logs captured from assistants</div>
                </div>
                <div className="bg-amber-50 p-3.5 rounded-xl border border-amber-200 shadow-sm">
                  <div className="text-[9px] text-amber-600 font-bold uppercase tracking-wider">Pending Review</div>
                  <div className="text-xl font-extrabold text-amber-700 mt-1 flex items-center gap-2">
                    {pendingCount}
                    {pendingCount > 0 && (
                      <span className="h-2 w-2 rounded-full bg-amber-500 animate-ping" />
                    )}
                  </div>
                  <div className="text-[9px] text-amber-600 mt-0.5 font-bold animate-pulse">Requires Auditing</div>
                </div>
                <div className="bg-emerald-50 p-3.5 rounded-xl border border-emerald-200 shadow-sm">
                  <div className="text-[9px] text-emerald-600 font-bold uppercase tracking-wider">Approved &amp; Passed</div>
                  <div className="text-xl font-extrabold text-emerald-700 mt-1">{passedCount}</div>
                  <div className="text-[9px] text-emerald-600 mt-0.5">Advances approved for payment</div>
                </div>
                <div className="bg-red-50 p-3.5 rounded-xl border border-red-200 shadow-sm">
                  <div className="text-[9px] text-red-600 font-bold uppercase tracking-wider">Returned &amp; Rejected</div>
                  <div className="text-xl font-extrabold text-red-700 mt-1">{rejectedCount}</div>
                  <div className="text-[9px] text-red-600 mt-0.5">Sent back to assistants</div>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                {/* Inspections List Table (Left 2 columns) */}
                <div className="lg:col-span-2 space-y-3">
                  <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                    <div className="p-4 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-50/50">
                      <div>
                        <h3 className="text-xs font-extrabold text-slate-800 uppercase tracking-wider">Inspection Submissions</h3>
                        <p className="text-[10px] text-slate-500 mt-0.5">List of verified sowed fields from village assistants</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <input
                          type="text"
                          placeholder="Search farmer name or village..."
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          className="text-[11px] px-3 py-1.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-brand-500 bg-white min-w-[180px]"
                        />
                      </div>
                    </div>

                    {/* Integrated Action and Village Filters */}
                    <div className="px-4 py-3 bg-slate-50/30 border-b border-slate-100 flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
                      <div className="flex flex-wrap gap-1.5 items-center">
                        <span className="text-[9px] uppercase tracking-wider text-slate-400 font-black mr-1">Audit Status:</span>
                        {[
                          { id: "all", label: "All Logs" },
                          { id: "Pending Review", label: "Pending" },
                          { id: "Passed", label: "Passed" },
                          { id: "Rejected", label: "Rejected" }
                        ].map((f) => (
                          <button
                            key={f.id}
                            type="button"
                            onClick={() => setAuditStatusFilter(f.id as any)}
                            className={`px-2.5 py-1 rounded-lg text-[10px] font-bold border transition cursor-pointer ${
                              auditStatusFilter === f.id
                                ? "bg-brand-800 text-white border-brand-900 shadow-xs"
                                : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50"
                            }`}
                          >
                            {f.label}
                          </button>
                        ))}
                      </div>
                      <div className="flex items-center gap-1.5 w-full sm:w-auto">
                        <span className="text-[9px] uppercase tracking-wider text-slate-400 font-black whitespace-nowrap">Village Boundary:</span>
                        <select
                          value={auditVillageFilter}
                          onChange={(e) => setAuditVillageFilter(e.target.value)}
                          className="text-[10px] px-2 py-1 border border-slate-200 rounded-lg bg-white font-bold text-slate-700 outline-none focus:ring-1 focus:ring-brand-500 cursor-pointer w-full sm:w-auto"
                        >
                          <option value="all">All Villages</option>
                          {uniqueVillages.map((village) => (
                            <option key={village} value={village}>{village}</option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <div className="overflow-x-auto">
                      <table className="min-w-[750px] w-full text-[11px]">
                        <thead>
                          <tr className="bg-slate-100 border-b border-slate-200 text-slate-600 font-bold text-left">
                            <th className="p-3">Farmer &amp; Location</th>
                            <th className="p-3">Sowing Area</th>
                            <th className="p-3">Inspected By</th>
                            <th className="p-3">GPS Location</th>
                            <th className="p-3">Status</th>
                            <th className="p-3 text-right">Action</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {filteredVerifications.length === 0 ? (
                            <tr>
                              <td colSpan={6} className="p-8 text-center text-slate-400">
                                No field verifications found matching the search criteria.
                              </td>
                            </tr>
                          ) : (
                            filteredVerifications.map((v) => {
                              const gpsDuplicates = findGpsDuplicates(v.id, v.latitude, v.longitude);
                              const isAcreageAnomaly = Math.abs(Number(v.verifiedAcres) - Number(v.enrolledAcres)) > 1.5;

                              return (
                                <tr 
                                  key={v.id} 
                                  className={`hover:bg-slate-50/70 transition cursor-pointer ${
                                    reviewingVerification?.id === v.id ? "bg-brand-50/40" : ""
                                  }`}
                                  onClick={() => {
                                    setReviewingVerification(v);
                                    setAuditRejectReason("");
                                  }}
                                >
                                  <td className="p-3">
                                    <div className="font-extrabold text-slate-800">{v.farmerName}</div>
                                    <div className="text-[9px] text-slate-400 font-mono mt-0.5">{v.farmerId} • {v.villageName}</div>
                                  </td>
                                  <td className="p-3">
                                    <div className="flex items-center gap-1">
                                      <span className="font-bold text-slate-800">{v.verifiedAcres} Acres</span>
                                      <span className="text-[9px] text-slate-400 font-normal">(of {v.enrolledAcres} target)</span>
                                    </div>
                                    <div className="text-[9px] mt-0.5">
                                      {isAcreageAnomaly ? (
                                        <span className="text-rose-600 font-bold bg-rose-50 px-1 rounded">High Variance ({Math.abs(v.verifiedAcres - v.enrolledAcres).toFixed(1)} Ac)</span>
                                      ) : (
                                        <span className="text-slate-400 font-medium">Valid area matches</span>
                                      )}
                                    </div>
                                  </td>
                                  <td className="p-3">
                                    <div className="font-medium text-slate-700">{v.villageAssistant || "Village Assistant"}</div>
                                    <div className="text-[9px] text-slate-400 mt-0.5">{v.verificationDate}</div>
                                  </td>
                                  <td className="p-3">
                                    <div className="text-[10px] font-mono font-medium text-slate-600">
                                      {v.latitude.toFixed(5)}, {v.longitude.toFixed(5)}
                                    </div>
                                    <div className="text-[9px] mt-0.5">
                                      {gpsDuplicates.length > 0 ? (
                                        <span className="text-amber-600 font-bold bg-amber-50 px-1 rounded animate-pulse">⚠️ Coords Match Other Farmer</span>
                                      ) : (
                                        <span className="text-emerald-600 font-medium">✓ Unique Geolocation</span>
                                      )}
                                    </div>
                                  </td>
                                  <td className="p-3">
                                    {v.status === "Pending Review" && (
                                      <span className="bg-amber-100 text-amber-800 text-[9px] px-2 py-0.5 rounded-full font-bold">
                                        Pending Review
                                      </span>
                                    )}
                                    {v.status === "Passed" && (
                                      <span className="bg-emerald-100 text-emerald-800 text-[9px] px-2 py-0.5 rounded-full font-bold block w-fit">
                                        Passed ✓
                                      </span>
                                    )}
                                    {v.status === "Rejected" && (
                                      <div className="space-y-0.5">
                                        <span className="bg-rose-100 text-rose-800 text-[9px] px-2 py-0.5 rounded-full font-bold block w-fit">
                                          Rejected ✗
                                        </span>
                                        <div className="text-[8.5px] text-rose-600 font-medium max-w-[120px] truncate" title={v.rejectionReason}>
                                          {v.rejectionReason}
                                        </div>
                                      </div>
                                    )}
                                  </td>
                                  <td className="p-3 text-right" onClick={(e) => e.stopPropagation()}>
                                    <div className="flex items-center justify-end gap-1.5">
                                      <button
                                        onClick={() => {
                                          setReviewingVerification(v);
                                          setAuditRejectReason("");
                                        }}
                                        className="text-slate-500 hover:text-brand-700 bg-slate-50 hover:bg-slate-100 p-1 rounded-lg border border-slate-200 transition"
                                        title="View full audit panel"
                                      >
                                        <Eye size={12} />
                                      </button>
                                      {v.status === "Pending Review" && (
                                        <>
                                          <button
                                            onClick={() => handleAuditApprove(v.id)}
                                            className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-2 py-1 rounded text-[9.5px] shadow-sm transition"
                                          >
                                            Pass
                                          </button>
                                          <button
                                            onClick={() => handleAuditRejectInit(v)}
                                            className="bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 font-bold px-2 py-1 rounded text-[9.5px] transition"
                                          >
                                            Reject
                                          </button>
                                        </>
                                      )}
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

                {/* Audit Inspector Panel (Right 1 column) */}
                <div className="space-y-3">
                  {reviewingVerification ? (
                    <div className="bg-white rounded-xl border border-slate-200 shadow-md p-4 space-y-4 text-left animate-in fade-in slide-in-from-right-3 duration-200 sticky top-4">
                      <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                        <div>
                          <span className="text-[9px] text-slate-400 font-mono font-bold block uppercase">Review Panel</span>
                          <h4 className="text-xs font-extrabold text-slate-800 uppercase tracking-wide">Inspection Audit</h4>
                        </div>
                        <span className={`text-[9px] px-2 py-0.5 rounded-full font-bold ${
                          reviewingVerification.status === "Passed" ? "bg-emerald-100 text-emerald-800" :
                          reviewingVerification.status === "Rejected" ? "bg-rose-100 text-rose-800" :
                          "bg-amber-100 text-amber-800"
                        }`}>
                          {reviewingVerification.status}
                        </span>
                      </div>

                      {/* Photo Thumbnail Visualizer */}
                      <div className="space-y-1.5">
                        <span className="text-[9px] text-slate-400 uppercase font-black tracking-wider block">Field Photography Proof</span>
                        <div className="relative aspect-video rounded-xl overflow-hidden border border-slate-200 bg-slate-900 flex items-center justify-center group shadow-inner">
                          {reviewingVerification.photoUrl ? (
                            <>
                              <img 
                                src={reviewingVerification.photoUrl} 
                                alt="Farmer's field sowing proof" 
                                className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                                referrerPolicy="no-referrer"
                              />
                              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-90 p-2 flex flex-col justify-end">
                                <span className="text-[8.5px] text-emerald-300 font-bold flex items-center gap-1">
                                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" /> Verified Sowing Proof
                                </span>
                                <span className="text-[8px] text-white/80 font-mono">{reviewingVerification.farmerName} • ID: {reviewingVerification.farmerId}</span>
                              </div>
                            </>
                          ) : (
                            <div className="text-center p-3">
                              <span className="text-[10px] text-slate-400 block">No snapshot attachment available</span>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Farmer info card */}
                      <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 space-y-2">
                        <div className="flex justify-between text-[10px]">
                          <span className="text-slate-400">Farmer:</span>
                          <span className="font-extrabold text-slate-800">{reviewingVerification.farmerName} ({reviewingVerification.farmerId})</span>
                        </div>
                        <div className="flex justify-between text-[10px]">
                          <span className="text-slate-400">Village Location:</span>
                          <span className="font-bold text-slate-800">{reviewingVerification.villageName}</span>
                        </div>
                        <div className="flex justify-between text-[10px]">
                          <span className="text-slate-400">Target Enrolled:</span>
                          <span className="font-bold text-slate-800">{reviewingVerification.enrolledAcres} Acres</span>
                        </div>
                        <div className="flex justify-between text-[10px] border-t border-slate-200 pt-1.5">
                          <span className="text-slate-500 font-bold">Inspected Area:</span>
                          <span className="font-black text-brand-900">{reviewingVerification.verifiedAcres} Acres</span>
                        </div>
                        
                        {/* Area discrepancy calculation */}
                        {(() => {
                          const enrolled = Number(reviewingVerification.enrolledAcres) || 0;
                          const inspected = Number(reviewingVerification.verifiedAcres) || 0;
                          const variance = inspected - enrolled;
                          const percent = enrolled > 0 ? (variance / enrolled) * 100 : 0;

                          return (
                            <div className={`text-[9px] p-2 rounded-lg ${variance > 0 ? "bg-amber-50 text-amber-800 border border-amber-200" : "bg-slate-100 text-slate-600"}`}>
                              <div className="font-bold flex justify-between">
                                <span>Area Variance:</span>
                                <span>{variance >= 0 ? "+" : ""}{variance.toFixed(1)} Acres ({percent >= 0 ? "+" : ""}{percent.toFixed(0)}%)</span>
                              </div>
                              <p className="text-[8.5px] mt-0.5 leading-tight opacity-90">
                                {variance > 1 ? "⚠️ Verified area exceeds enrollment target by more than 1 acre. Verify carefully." :
                                 variance < -1 ? "✓ Verified area is less than target. Only paying advance on actual verified sowed land." :
                                 "✓ Variance is within normal limits."}
                              </p>
                            </div>
                          );
                        })()}
                      </div>

                      {/* GPS Verification Box with MapPin & Compass */}
                      <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-[9px] text-slate-400 uppercase font-black">GPS Telemetry Check</span>
                          <span className="text-[9px] font-mono text-brand-600 bg-brand-50 border border-brand-200 px-1.5 rounded-md font-bold flex items-center gap-1">
                            <Compass size={10} className="animate-spin duration-1000" /> Lat/Lng
                          </span>
                        </div>
                        <div className="font-mono text-[10.5px] bg-white p-2 rounded-lg border border-slate-200 text-slate-700 flex justify-between items-center">
                          <div>
                            <div>LAT: <span className="font-bold text-slate-900">{reviewingVerification.latitude.toFixed(6)}</span></div>
                            <div>LNG: <span className="font-bold text-slate-900">{reviewingVerification.longitude.toFixed(6)}</span></div>
                          </div>
                          <MapPin size={16} className="text-rose-500 animate-bounce" />
                        </div>

                        {/* GPS Duplicate Check Output */}
                        {(() => {
                          const duplicates = findGpsDuplicates(reviewingVerification.id, reviewingVerification.latitude, reviewingVerification.longitude);
                          if (duplicates.length > 0) {
                            return (
                              <div className="bg-red-50 border border-red-200 p-2.5 rounded-lg text-[9px] text-red-800 space-y-1 animate-pulse">
                                <div className="font-extrabold flex items-center gap-1 text-red-900">
                                  <span>⚠️ DUP DETECTED:</span>
                                  <span>Co-location Collision!</span>
                                </div>
                                <p className="leading-tight">
                                  This exact sowed coordinate was already submitted for <strong>{duplicates[0].farmerName}</strong> ({duplicates[0].farmerId}). Do NOT pass this verification!
                                </p>
                              </div>
                            );
                          }
                          return (
                            <div className="text-[9px] text-emerald-700 bg-emerald-50 border border-emerald-200 p-2 rounded-lg">
                              <strong>✓ Location Security Passed:</strong> Coordinates are completely unique. No duplicate farm logs detected.
                            </div>
                          );
                        })()}
                      </div>

                      {/* Comments section */}
                      <div className="space-y-1">
                        <span className="text-[9px] text-slate-400 uppercase font-black block">Assistant Field Notes</span>
                        <div className="bg-slate-50 p-2.5 rounded-lg text-[10px] text-slate-700 border border-slate-200 italic leading-snug">
                          "{reviewingVerification.comments || "No comments entered by the assistant."}"
                        </div>
                      </div>

                      {/* Reject comment if present */}
                      {reviewingVerification.status === "Rejected" && (
                        <div className="bg-rose-50 border border-rose-200 text-rose-800 p-2.5 rounded-lg text-[10px] space-y-1">
                          <div className="font-bold text-rose-900 uppercase text-[8.5px] tracking-wider">Rejection Audit Reason:</div>
                          <p className="italic font-medium">"{reviewingVerification.rejectionReason}"</p>
                          <div className="text-[8.5px] text-slate-400 mt-1">Returned on {reviewingVerification.auditDate}</div>
                        </div>
                      )}

                      {/* Passed auditor info if present */}
                      {reviewingVerification.status === "Passed" && (
                        <div className="bg-emerald-50 border border-emerald-100 text-emerald-800 p-2.5 rounded-lg text-[10px] space-y-0.5">
                          <div className="font-bold text-emerald-900 uppercase text-[8.5px] tracking-wider">Audit Log Approved:</div>
                          <p className="font-medium">Passed by {reviewingVerification.auditedBy || "Lead Accountant"}</p>
                          <div className="text-[8.5px] text-slate-400 mt-1">Cleared on {reviewingVerification.auditDate}</div>
                        </div>
                      )}

                      {/* Review Actions */}
                      {reviewingVerification.status === "Pending Review" && (
                        <div className="pt-2 border-t border-slate-100 space-y-2">
                          <button
                            onClick={() => handleAuditApprove(reviewingVerification.id)}
                            className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold py-2 rounded-xl text-[11px] shadow-md transition flex items-center justify-center gap-1.5"
                          >
                            <span>Pass &amp; Approve Verification</span>
                          </button>
                          <button
                            onClick={() => handleAuditRejectInit(reviewingVerification)}
                            className="w-full bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 font-extrabold py-2 rounded-xl text-[11px] transition flex items-center justify-center gap-1.5"
                          >
                            <span>Reject &amp; Send Back to Assistant</span>
                          </button>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="bg-white rounded-xl border border-slate-200 p-8 text-center text-slate-400 flex flex-col items-center justify-center min-h-[300px]">
                      <Compass size={28} className="text-slate-300 animate-spin duration-3000 mb-2" />
                      <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">Select an Inspection</h4>
                      <p className="text-[10px] text-slate-400 max-w-[200px] mx-auto mt-1 leading-normal">
                        Click on any inspection row in the table to display full geo-verification analysis, map telemetry, and photographs.
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Rejection comments modal */}
              {showRejectModal && reviewingVerification && (
                <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
                  <div className="bg-white rounded-2xl max-w-md w-full border border-slate-200 shadow-2xl p-5 text-left animate-in zoom-in-95 duration-200">
                    <h3 className="text-sm font-black text-slate-800 uppercase tracking-wider">Reject Field Verification</h3>
                    <p className="text-[10.5px] text-slate-500 mt-1">
                      Explain why you are rejecting the verification for <strong>{reviewingVerification.farmerName}</strong>. This feedback is sent directly back to <strong>{reviewingVerification.villageAssistant}</strong>.
                    </p>

                    <div className="my-4 space-y-1.5">
                      <label className="text-[9.5px] font-black uppercase text-slate-400">Rejection Reason Comment</label>
                      <textarea
                        className="w-full border border-slate-200 rounded-xl p-3 text-[11px] h-24 focus:ring-1 focus:ring-rose-500 focus:outline-none placeholder:text-slate-400 bg-slate-50"
                        placeholder="e.g. Photograph upload is blurry and coordinate shows duplicate collision with another nearby plot. Please re-visit and re-verify coordinates."
                        value={auditRejectReason}
                        onChange={(e) => setAuditRejectReason(e.target.value)}
                      />
                    </div>

                    <div className="flex justify-end gap-2">
                      <button
                        onClick={() => setShowRejectModal(false)}
                        className="px-3.5 py-2 rounded-xl text-[11px] font-bold text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={handleAuditRejectConfirm}
                        className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-[11px] font-black shadow-lg shadow-rose-600/25 transition"
                      >
                        Reject &amp; Return
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })()}

        {/* Tab 6: Manage Staff & Employees (Formerly Manage Assistants) */}
        {activeTab === "assistants" && (
          <div className="space-y-4 text-left animate-in fade-in duration-200">
            {/* Header and Sub-Tabs */}
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm text-left">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                  <h2 className="text-sm font-bold text-slate-800 uppercase tracking-wide">Staff &amp; Employee Registry</h2>
                  <p className="text-[10px] text-slate-500 mt-0.5 leading-normal">
                    Register, audit, and manage all human resources. Track contact details, Aadhaar identity, salary scales, and banking credentials for seamless payroll processing.
                  </p>
                </div>

                {/* Sub-Tabs Selector */}
                <div className="flex bg-slate-100 p-1 rounded-lg border border-slate-200 self-stretch md:self-auto">
                  <button
                    type="button"
                    onClick={() => {
                      setStaffSubTab("assistants");
                      setNewAsstRoleType("assistant");
                      setNewAsstDesignation("Village Supervisor");
                    }}
                    className={`flex-1 md:flex-none px-3.5 py-1.5 rounded-md text-[10px] font-bold transition flex items-center justify-center gap-1.5 cursor-pointer whitespace-nowrap ${
                      staffSubTab === "assistants"
                        ? "bg-white text-brand-850 shadow-xs"
                        : "text-slate-600 hover:text-slate-950"
                    }`}
                  >
                    <Users size={12} />
                    Village Assistants
                    <span className="bg-slate-200 text-slate-700 text-[8px] px-1.5 py-0.2 rounded font-black">
                      {assistantUsers.filter(u => u.roleType === "assistant" || !u.roleType).length}
                    </span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setStaffSubTab("employees");
                      setNewAsstRoleType("employee");
                      setNewAsstDesignation("Hub Operator");
                    }}
                    className={`flex-1 md:flex-none px-3.5 py-1.5 rounded-md text-[10px] font-bold transition flex items-center justify-center gap-1.5 cursor-pointer whitespace-nowrap ${
                      staffSubTab === "employees"
                        ? "bg-white text-brand-850 shadow-xs"
                        : "text-slate-600 hover:text-slate-950"
                    }`}
                  >
                    <UserCheck size={12} />
                    Other Employees
                    <span className="bg-slate-200 text-slate-700 text-[8px] px-1.5 py-0.2 rounded font-black">
                      {assistantUsers.filter(u => u.roleType === "employee").length}
                    </span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setStaffSubTab("villages");
                    }}
                    className={`flex-1 md:flex-none px-3.5 py-1.5 rounded-md text-[10px] font-bold transition flex items-center justify-center gap-1.5 cursor-pointer whitespace-nowrap ${
                      staffSubTab === "villages"
                        ? "bg-white text-brand-850 shadow-xs"
                        : "text-slate-600 hover:text-slate-950"
                    }`}
                  >
                    <MapPin size={12} />
                    Village Enrollment
                    <span className="bg-slate-200 text-slate-700 text-[8px] px-1.5 py-0.2 rounded font-black">
                      {enrolledVillages.length}
                    </span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setStaffSubTab("years");
                    }}
                    className={`flex-1 md:flex-none px-3.5 py-1.5 rounded-md text-[10px] font-bold transition flex items-center justify-center gap-1.5 cursor-pointer whitespace-nowrap ${
                      staffSubTab === "years"
                        ? "bg-white text-brand-850 shadow-xs"
                        : "text-slate-600 hover:text-slate-950"
                    }`}
                  >
                    <Calendar size={12} />
                    Academic Years
                    <span className="bg-slate-200 text-slate-700 text-[8px] px-1.5 py-0.2 rounded font-black">
                      {localAcademicYears.length}
                    </span>
                  </button>
                </div>
              </div>
            </div>

            {/* Add Staff / Enrollment Form */}
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm space-y-3">
              {staffSubTab === "villages" ? (
                /* Village Enrollment Form */
                <div>
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b border-slate-100 pb-2">
                    <div>
                      <h3 className="text-xs font-extrabold text-slate-800 flex items-center gap-1.5 uppercase tracking-wide">
                        <MapPin size={15} className="text-brand-800" />
                        Enroll New Village Route
                      </h3>
                      <p className="text-[10px] text-slate-500 mt-0.5">
                        Establish new village collection centers, trace geographical route mappings, and set baseline sown acreage.
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setShowVillageForm(!showVillageForm)}
                      className="px-2.5 py-1.5 bg-brand-800 hover:bg-brand-900 text-white text-[10px] font-bold rounded-md flex items-center gap-1 cursor-pointer transition whitespace-nowrap self-end sm:self-auto shadow-3xs"
                    >
                      {showVillageForm ? "✕ Hide Form" : "+ Enroll New Village Route"}
                    </button>
                  </div>

                  {showVillageForm && (
                    <div className="space-y-3 animate-in fade-in duration-200 mt-3">
                      {villageSuccessAlert && (
                        <div className="p-2 border border-emerald-200 bg-emerald-50 text-emerald-800 font-bold rounded-lg text-[10px]">
                          {villageSuccessAlert}
                        </div>
                      )}

                      {villageErrorAlert && (
                        <div className="p-2 border border-rose-200 bg-rose-50 text-rose-800 font-bold rounded-lg text-[10px]">
                          {villageErrorAlert}
                        </div>
                      )}

                      <form onSubmit={handleRegisterVillageSubmit} className="space-y-3.5 text-xs bg-slate-50/50 p-3 rounded-lg border border-slate-150">
                        <div className="space-y-2">
                          <span className="text-[8px] font-bold text-slate-400 uppercase tracking-widest block">Village Center Details</span>
                          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                            <div>
                              <label className="block text-[9px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                                Village Name <span className="text-rose-500 font-black">*</span>
                              </label>
                              <input
                                type="text"
                                required
                                placeholder="e.g. Rampur"
                                value={newVillageName}
                                onChange={(e) => setNewVillageName(e.target.value)}
                                className="w-full p-2 py-2 border border-slate-200 rounded-lg text-xs bg-white text-slate-800 font-semibold shadow-2xs focus:ring-1 focus:ring-brand-500 focus:outline-none"
                              />
                            </div>
                            <div>
                              <label className="block text-[9px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                                District
                              </label>
                              <input
                                type="text"
                                placeholder="e.g. Indore"
                                value={newVillageDistrict}
                                onChange={(e) => setNewVillageDistrict(e.target.value)}
                                className="w-full p-2 py-2 border border-slate-200 rounded-lg text-xs bg-white text-slate-800 font-semibold shadow-2xs focus:ring-1 focus:ring-brand-500 focus:outline-none"
                              />
                            </div>
                            <div>
                              <label className="block text-[9px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                                State
                              </label>
                              <input
                                type="text"
                                placeholder="e.g. Madhya Pradesh"
                                value={newVillageState}
                                onChange={(e) => setNewVillageState(e.target.value)}
                                className="w-full p-2 py-2 border border-slate-200 rounded-lg text-xs bg-white text-slate-800 font-semibold shadow-2xs focus:ring-1 focus:ring-brand-500 focus:outline-none"
                              />
                            </div>
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                            <div>
                              <label className="block text-[9px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                                Sown Area (Acres)
                              </label>
                              <input
                                type="number"
                                placeholder="e.g. 120"
                                value={newVillageSownArea}
                                onChange={(e) => setNewVillageSownArea(e.target.value)}
                                className="w-full p-2 py-2 border border-slate-200 rounded-lg text-xs bg-white text-slate-800 font-semibold shadow-2xs focus:ring-1 focus:ring-brand-500 focus:outline-none"
                              />
                            </div>
                            <div>
                              <label className="block text-[9px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                                Lead / Contact Person
                              </label>
                              <input
                                type="text"
                                placeholder="e.g. Ramesh Kumar"
                                value={newVillageContactPerson}
                                onChange={(e) => setNewVillageContactPerson(e.target.value)}
                                className="w-full p-2 py-2 border border-slate-200 rounded-lg text-xs bg-white text-slate-800 font-semibold shadow-2xs focus:ring-1 focus:ring-brand-500 focus:outline-none"
                              />
                            </div>
                            <div>
                              <label className="block text-[9px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                                Contact Mobile No.
                              </label>
                              <input
                                type="tel"
                                placeholder="10-digit mobile"
                                value={newVillageContactMobile}
                                onChange={(e) => setNewVillageContactMobile(e.target.value)}
                                className="w-full p-2 py-2 border border-slate-200 rounded-lg text-xs bg-white text-slate-800 font-semibold shadow-2xs focus:ring-1 focus:ring-brand-500 focus:outline-none"
                              />
                            </div>
                          </div>
                        </div>

                        <button
                          type="submit"
                          className="w-full mt-2.5 py-2.5 bg-brand-800 hover:bg-brand-900 text-white font-bold rounded-lg transition text-xs cursor-pointer shadow-sm flex items-center justify-center gap-1.5"
                        >
                          <MapPin size={14} />
                          Enroll Village Center
                        </button>
                      </form>
                    </div>
                  )}
                </div>
              ) : staffSubTab === "years" ? (
                /* Academic Year Enrollment Form */
                <div>
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b border-slate-100 pb-2">
                    <div>
                      <h3 className="text-xs font-extrabold text-slate-800 flex items-center gap-1.5 uppercase tracking-wide">
                        <Calendar size={15} className="text-brand-800" />
                        Enroll Academic Year
                      </h3>
                      <p className="text-[10px] text-slate-500 mt-0.5">
                        Add and configure academic/financial tracking seasons for crop distribution and ledger logs.
                      </p>
                    </div>
                  </div>

                  <form onSubmit={(e) => {
                    e.preventDefault();
                    if (!newYearInput.trim()) return;
                    handleEnrollYear(newYearInput);
                    setNewYearInput("");
                  }} className="mt-3 flex gap-3 items-end max-w-md">
                    <div className="flex-1">
                      <label className="block text-[9px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                        Academic Year (e.g. 2027)
                      </label>
                      <input
                        type="number"
                        required
                        min="2020"
                        max="2100"
                        value={newYearInput}
                        onChange={(e) => setNewYearInput(e.target.value)}
                        placeholder="Enter year..."
                        className="w-full p-2 border border-slate-250 bg-slate-50 font-bold rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-brand-800"
                      />
                    </div>
                    <button
                      type="submit"
                      className="px-4 py-2 bg-brand-800 hover:bg-brand-900 text-white text-[10.5px] font-bold rounded-lg cursor-pointer transition shadow-3xs whitespace-nowrap h-[34px] flex items-center gap-1.5"
                    >
                      <Plus size={12} />
                      Enroll Year
                    </button>
                  </form>
                </div>
              ) : (
                /* Add Staff / Enrollment Form */
                <div>
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b border-slate-100 pb-2">
                    <div>
                      <h3 className="text-xs font-extrabold text-slate-800 flex items-center gap-1.5 uppercase tracking-wide">
                        <UserPlus size={15} className="text-brand-800" />
                        {staffSubTab === "assistants" ? "Register Village Assistant User" : "Register Normal Other Employee"}
                      </h3>
                      <p className="text-[10px] text-slate-500 mt-0.5">
                        {staffSubTab === "assistants"
                          ? "Enroll a field-level assistant mapped to village routes for dispatching and collection tracking."
                          : "Enroll general business staff like drivers, loaders, security, operators, or accountants."}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setShowAsstUserForm(!showAsstUserForm)}
                      className="px-2.5 py-1.5 bg-brand-800 hover:bg-brand-900 text-white text-[10px] font-bold rounded-md flex items-center gap-1 cursor-pointer transition whitespace-nowrap self-end sm:self-auto shadow-3xs"
                    >
                      {showAsstUserForm ? "✕ Hide Enrollment" : `+ New Enrollment (${staffSubTab === "assistants" ? "Assistant" : "Employee"})`}
                    </button>
                  </div>

                  {showAsstUserForm && (
                    <div className="space-y-3 animate-in fade-in duration-200">
                  {asstSuccessAlert && (
                    <div className="p-2 border border-emerald-200 bg-emerald-50 text-emerald-800 font-bold rounded-lg text-[10px]">
                      {asstSuccessAlert}
                    </div>
                  )}

                  {asstErrorAlert && (
                    <div className="p-2 border border-rose-200 bg-rose-50 text-rose-800 font-bold rounded-lg text-[10px]">
                      {asstErrorAlert}
                    </div>
                  )}

                  <form onSubmit={handleRegisterAssistantSubmit} className="space-y-3.5 text-xs bg-slate-50/50 p-3 rounded-lg border border-slate-150">
                    
                    {/* Primary Details Block */}
                    <div className="space-y-2">
                      <span className="text-[8px] font-bold text-slate-400 uppercase tracking-widest block">1. Personal &amp; Login Details</span>
                      <div className="grid grid-cols-1 sm:grid-cols-4 gap-2.5">
                        <div className="sm:col-span-2">
                          <label className="block text-[9px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                            Full Name <span className="text-rose-500 font-black">*</span>
                          </label>
                          <input
                            type="text"
                            required
                            placeholder="e.g. Ramesh Kumar"
                            value={newAsstName}
                            onChange={(e) => setNewAsstName(e.target.value)}
                            className="w-full p-2 py-2 border border-slate-200 rounded-lg text-xs bg-white text-slate-800 font-semibold shadow-2xs focus:ring-1 focus:ring-brand-500 focus:outline-none"
                          />
                        </div>

                        <div>
                          <label className="block text-[9px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                            Mobile (Login Username) <span className="text-rose-500 font-black">*</span>
                          </label>
                          <input
                            type="tel"
                            required
                            placeholder="10-digit phone"
                            value={newAsstMobile}
                            onChange={(e) => setNewAsstMobile(e.target.value)}
                            className="w-full p-2 py-2 border border-slate-200 rounded-lg text-xs bg-white text-slate-800 font-semibold shadow-2xs focus:ring-1 focus:ring-brand-500 focus:outline-none"
                          />
                        </div>

                        <div>
                          <label className="block text-[9px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                            Login Password <span className="text-rose-500 font-black">*</span>
                          </label>
                          <input
                            type="text"
                            required
                            placeholder="password"
                            value={newAsstPassword}
                            onChange={(e) => setNewAsstPassword(e.target.value)}
                            className="w-full p-2 py-2 border border-slate-200 rounded-lg text-xs bg-white font-mono text-slate-800 shadow-2xs focus:ring-1 focus:ring-brand-500 focus:outline-none"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                        <div>
                          <label className="block text-[9px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                            Designation <span className="text-rose-500 font-black">*</span>
                          </label>
                          <input
                            type="text"
                            required
                            placeholder={staffSubTab === "assistants" ? "e.g. Village Supervisor" : "e.g. Warehouse Loader"}
                            value={newAsstDesignation}
                            onChange={(e) => setNewAsstDesignation(e.target.value)}
                            className="w-full p-2 py-2 border border-slate-200 rounded-lg text-xs bg-white text-slate-800 font-semibold shadow-2xs focus:ring-1 focus:ring-brand-500 focus:outline-none"
                          />
                        </div>

                        {staffSubTab === "assistants" ? (
                          <div>
                            <label className="block text-[9px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                              Mapped Village Center <span className="text-rose-500 font-black">*</span>
                            </label>
                            <select
                              value={newAsstVillage}
                              onChange={(e) => setNewAsstVillage(e.target.value)}
                              className="w-full p-2 py-2 border border-slate-200 rounded-lg text-xs bg-white text-slate-800 font-semibold cursor-pointer shadow-2xs focus:ring-1 focus:ring-brand-500 focus:outline-none"
                            >
                              <option value="">-- Select Enrolled Village --</option>
                              {enrolledVillages.map((v: any) => (
                                <option key={v.id} value={v.villageName}>{v.villageName} Village</option>
                              ))}
                            </select>
                          </div>
                        ) : (
                          <div>
                            <label className="block text-[9px] font-bold text-slate-500 uppercase tracking-wider mb-1 text-slate-400">
                              Center Mapping (Not Required)
                            </label>
                            <input
                              type="text"
                              disabled
                              value="N/A (Central Hub/General)"
                              className="w-full p-2 py-2 border border-slate-200 rounded-lg text-xs bg-slate-100 text-slate-400 font-semibold"
                            />
                          </div>
                        )}

                        <div>
                          <label className="block text-[9px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                            Emergency Contact Mobile
                          </label>
                          <input
                            type="tel"
                            placeholder="Emergency contact no."
                            value={newAsstEmergencyContact}
                            onChange={(e) => setNewAsstEmergencyContact(e.target.value)}
                            className="w-full p-2 py-2 border border-slate-200 rounded-lg text-xs bg-white text-slate-800 font-semibold shadow-2xs focus:ring-1 focus:ring-brand-500 focus:outline-none"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Government & Banking credentials Block */}
                    <div className="space-y-2 pt-1.5 border-t border-slate-200">
                      <span className="text-[8px] font-bold text-slate-400 uppercase tracking-widest block">2. Aadhaar, Banking &amp; Salary (Locked Details)</span>
                      <div className="grid grid-cols-1 sm:grid-cols-4 gap-2.5">
                        <div>
                          <label className="block text-[9px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                            Aadhaar Number
                          </label>
                          <input
                            type="text"
                            placeholder="e.g. 1234-5678-9012"
                            value={newAsstAadhaarNumber}
                            onChange={(e) => setNewAsstAadhaarNumber(e.target.value)}
                            className="w-full p-2 py-2 border border-slate-200 rounded-lg text-xs bg-white font-mono text-slate-800 shadow-2xs focus:ring-1 focus:ring-brand-500 focus:outline-none"
                          />
                        </div>

                        <div>
                          <label className="block text-[9px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                            Bank Name
                          </label>
                          <input
                            type="text"
                            placeholder="e.g. State Bank of India"
                            value={newAsstBankName}
                            onChange={(e) => setNewAsstBankName(e.target.value)}
                            className="w-full p-2 py-2 border border-slate-200 rounded-lg text-xs bg-white text-slate-800 font-semibold shadow-2xs focus:ring-1 focus:ring-brand-500 focus:outline-none"
                          />
                        </div>

                        <div>
                          <label className="block text-[9px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                            Bank Account Number
                          </label>
                          <input
                            type="text"
                            placeholder="A/C Number"
                            value={newAsstBankAccountNo}
                            onChange={(e) => setNewAsstBankAccountNo(e.target.value)}
                            className="w-full p-2 py-2 border border-slate-200 rounded-lg text-xs bg-white font-mono text-slate-800 shadow-2xs focus:ring-1 focus:ring-brand-500 focus:outline-none"
                          />
                        </div>

                        <div>
                          <label className="block text-[9px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                            IFSC Code
                          </label>
                          <input
                            type="text"
                            placeholder="e.g. SBIN0001234"
                            value={newAsstBankIfscCode}
                            onChange={(e) => setNewAsstBankIfscCode(e.target.value.toUpperCase())}
                            className="w-full p-2 py-2 border border-slate-200 rounded-lg text-xs bg-white font-mono text-slate-800 shadow-2xs focus:ring-1 focus:ring-brand-500 focus:outline-none"
                          />
                        </div>
                      </div>

                      {/* Salary (Optional but Locked once saved) */}
                      <div className="p-3 bg-brand-50/50 rounded-xl border border-brand-100/50 mt-1 flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
                        <div className="space-y-1 max-w-md text-left">
                          <label className="text-[10px] font-extrabold text-brand-900 uppercase tracking-wider flex items-center gap-1">
                            <Lock size={12} className="text-brand-850" />
                            Monthly Salary Amount (Optional)
                          </label>
                          <p className="text-[9.5px] text-brand-700 leading-normal">
                            This field establishes the salary scale for the employee. Once submitted, it is protected against unauthorized tampering. The Accountant uses this locked scale for automatic payroll processing.
                          </p>
                        </div>

                        <div className="relative w-full sm:w-48 shrink-0">
                          <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-500 font-bold text-xs">₹</span>
                          <input
                            type="number"
                            placeholder="Enter Amount"
                            value={newAsstSalaryAmount}
                            onChange={(e) => setNewAsstSalaryAmount(e.target.value)}
                            className="w-full pl-6 pr-8 py-2 bg-white border border-brand-200 rounded-lg text-xs text-brand-950 font-bold focus:ring-1 focus:ring-brand-500 focus:outline-none text-right placeholder:text-slate-300"
                          />
                          <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400">
                            <Lock size={12} />
                          </span>
                        </div>
                      </div>
                    </div>

                    <button
                      type="submit"
                      className="w-full mt-2.5 py-2.5 bg-brand-800 hover:bg-brand-900 text-white font-bold rounded-lg transition text-xs cursor-pointer shadow-sm flex items-center justify-center gap-1.5"
                    >
                      <UserPlus size={14} />
                      Submit and Complete Staff Enrollment
                    </button>
                  </form>
                </div>
              )}
              </div>
              )}
            </div>

            {/* Spreadsheet Synchronization actions */}
            <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
              <div>
                <h4 className="text-[10px] font-bold text-slate-700 uppercase tracking-wide">Spreadsheet Synchronization ({staffSubTab === "assistants" ? "Village Assistants" : staffSubTab === "employees" ? "Other Employees" : "Villages"})</h4>
                <p className="text-[9.5px] text-slate-500 font-medium">Bulk sync, download templates, or export live data for offline audit logs.</p>
              </div>
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => downloadStaffTemplate(staffSubTab)}
                  className="px-2.5 py-1.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 text-[9.5px] font-bold rounded-lg flex items-center gap-1.5 shadow-3xs cursor-pointer transition"
                >
                  <Download size={11} className="text-slate-500" />
                  Template
                </button>
                <button
                  type="button"
                  onClick={() => exportStaffLive(staffSubTab)}
                  className="px-2.5 py-1.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 text-[9.5px] font-bold rounded-lg flex items-center gap-1.5 shadow-3xs cursor-pointer transition"
                >
                  <Download size={11} className="text-emerald-600" />
                  Export CSV
                </button>
                <label className="px-2.5 py-1.5 bg-brand-800 hover:bg-brand-900 text-white text-[9.5px] font-bold rounded-lg flex items-center gap-1.5 shadow-3xs cursor-pointer transition">
                  <Upload size={11} />
                  Import CSV
                  <input
                    type="file"
                    accept=".csv"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (!file) return;
                      const reader = new FileReader();
                      reader.onload = (event) => {
                        if (event.target?.result) {
                          handleBulkStaffImport(event.target.result as string, staffSubTab);
                        }
                      };
                      reader.readAsText(file);
                      e.target.value = ""; // Reset file input
                    }}
                    className="hidden"
                  />
                </label>
              </div>
            </div>

            {staffSubTab === "villages" ? (
              /* Village List - Tabular Record format */
              <div className="space-y-2">
                <div className="flex justify-between items-center px-1">
                  <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 font-display">
                    Enrolled Village Center Records
                  </span>
                  <span className="text-[10px] text-slate-400 font-semibold">
                    {enrolledVillages.length} enrolled villages
                  </span>
                </div>

                {/* Search bar */}
                <div className="relative">
                  <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                  <input
                    type="text"
                    placeholder="Search by village name, district, or contact..."
                    value={supervisorSearch}
                    onChange={(e) => setSupervisorSearch(e.target.value)}
                    className="w-full pl-8 pr-3 py-2 bg-white border border-slate-200 rounded-lg text-xs placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-brand-500 text-slate-800 shadow-2xs"
                  />
                </div>

                {(() => {
                  const query = supervisorSearch.toLowerCase();
                  const filtered = enrolledVillages.filter(v => 
                    v.villageName.toLowerCase().includes(query) ||
                    (v.district || "").toLowerCase().includes(query) ||
                    (v.contactPerson || "").toLowerCase().includes(query) ||
                    (v.contactMobile || "").includes(query)
                  );

                  if (filtered.length === 0) {
                    return (
                      <div className="py-12 border border-dashed border-slate-200 rounded-xl text-center space-y-2 bg-white">
                        <Search size={28} className="mx-auto text-slate-300" />
                        <p className="text-slate-400 text-xs font-bold">No villages matched your search filter.</p>
                      </div>
                    );
                  }

                  return (
                    <div className="overflow-x-auto rounded-xl border border-slate-200 shadow-xs bg-white text-left">
                      <table className="w-full text-left border-collapse text-xs">
                        <thead>
                          <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-extrabold uppercase tracking-wider text-[9px]">
                            <th className="py-3 px-4">Village Route / Center</th>
                            <th className="py-3 px-4">District & State</th>
                            <th className="py-3 px-4 text-right">Sown Area (Acres)</th>
                            <th className="py-3 px-4">Primary Lead Person</th>
                            <th className="py-3 px-4">Contact Phone</th>
                            <th className="py-3 px-4 text-center">Actions</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {filtered.map((v) => (
                            <tr key={v.id} className="hover:bg-slate-50 transition border-b border-slate-100 bg-white">
                              <td className="py-3 px-4 font-extrabold text-slate-900 text-left">
                                <div className="flex items-center gap-1.5 text-[12px]">
                                  <MapPin size={13} className="text-brand-750" />
                                  {v.villageName}
                                </div>
                              </td>
                              <td className="py-3 px-4 text-left">
                                <div className="font-bold text-slate-800">{v.district || "—"}</div>
                                <div className="text-[9.5px] text-slate-500 mt-0.5">{v.state || "—"}</div>
                              </td>
                              <td className="py-3 px-4 text-right font-mono font-bold text-slate-800">
                                {v.sownArea ? `${Number(v.sownArea).toLocaleString()} Acres` : "—"}
                              </td>
                              <td className="py-3 px-4 font-semibold text-slate-800">
                                {v.contactPerson || "—"}
                              </td>
                              <td className="py-3 px-4 font-mono font-semibold text-slate-700">
                                {v.contactMobile || "—"}
                              </td>
                              <td className="py-3 px-4 text-center">
                                <button
                                  type="button"
                                  onClick={() => {
                                    if (confirm(`Are you sure you want to remove the village enrollment route for "${v.villageName}"?`)) {
                                      const updated = enrolledVillages.filter(item => item.id !== v.id);
                                      updateEnrolledVillages(updated);
                                      setVillageSuccessAlert(`Removed village route ${v.villageName} successfully.`);
                                      setTimeout(() => setVillageSuccessAlert(""), 3000);
                                    }
                                  }}
                                  className="px-2 py-1 bg-rose-50 hover:bg-rose-100 text-rose-800 border border-rose-200 rounded font-bold text-[10px] transition cursor-pointer flex items-center gap-1 mx-auto"
                                >
                                  <Trash2 size={11} /> Remove
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  );
                })()}
              </div>
            ) : staffSubTab === "years" ? (
              /* Academic Year List */
              <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm space-y-3">
                <div className="flex justify-between items-center pb-2 border-b border-slate-100">
                  <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400">
                    Enrolled Seasons & Academic Years
                  </span>
                  <span className="text-[10px] text-slate-400 font-semibold">
                    {localAcademicYears.length} total seasons
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                  {localAcademicYears.map((year) => {
                    const isCurrent = year === globalYear;
                    return (
                      <div
                        key={year}
                        onClick={() => {
                          if (onYearChange) onYearChange(year);
                        }}
                        className={`p-3.5 rounded-xl border transition cursor-pointer flex items-center justify-between group ${
                          isCurrent
                            ? "bg-brand-50/50 border-brand-200 shadow-2xs"
                            : "bg-slate-50/40 border-slate-200 hover:bg-slate-50 hover:border-slate-300"
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <span className={`p-2 rounded-lg ${isCurrent ? 'bg-brand-800 text-white' : 'bg-slate-200 text-slate-600 group-hover:bg-slate-300'}`}>
                            <Calendar size={14} />
                          </span>
                          <div>
                            <span className="text-sm font-extrabold text-slate-800 block">{year} Season</span>
                            <span className="text-[9px] text-slate-400 font-semibold">
                              {isCurrent ? "Active Global Filter" : "Available Season"}
                            </span>
                          </div>
                        </div>
                        {isCurrent ? (
                          <span className="bg-brand-800 text-white text-[8px] font-black uppercase px-2 py-0.5 rounded-full tracking-wider">
                            Active
                          </span>
                        ) : (
                          <span className="text-slate-400 group-hover:text-slate-600 text-[10px] font-bold">
                            Switch →
                          </span>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            ) : (
            /* Staff list - Tabular Record format */
            <div className="space-y-2">
              <div className="flex justify-between items-center px-1">
                <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 font-display">
                  {staffSubTab === "assistants" ? "Active Village Assistant Records" : "Active Employee Staff Records"}
                </span>
                <span className="text-[10px] text-slate-400 font-semibold">
                  {assistantUsers.filter(u => staffSubTab === "assistants" ? (u.roleType === "assistant" || !u.roleType) : (u.roleType === "employee")).length} registered
                </span>
              </div>

              {/* Search bar */}
              <div className="relative">
                <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                <input
                  type="text"
                  placeholder={`Search by name, designation, mobile, or Aadhaar...`}
                  value={supervisorSearch}
                  onChange={(e) => setSupervisorSearch(e.target.value)}
                  className="w-full pl-8 pr-3 py-2 bg-white border border-slate-200 rounded-lg text-xs placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-brand-500 text-slate-800 shadow-2xs"
                />
              </div>
              {(() => {
                const targetRole = staffSubTab === "assistants" ? "assistant" : "employee";
                const filtered = assistantUsers.filter((u) => {
                  // check role
                  const matchesRole = targetRole === "assistant" 
                    ? (u.roleType === "assistant" || !u.roleType)
                    : (u.roleType === "employee");
                  
                  if (!matchesRole) return false;

                  // check search query
                  const query = supervisorSearch.toLowerCase();
                  return (
                    u.name.toLowerCase().includes(query) ||
                    (u.designation || "").toLowerCase().includes(query) ||
                    u.mobileNumber.includes(query) ||
                    (u.aadhaarNumber || "").includes(query) ||
                    u.villageName.toLowerCase().includes(query)
                  );
                });

                if (filtered.length === 0) {
                  return (
                    <div className="py-12 border border-dashed border-slate-200 rounded-xl text-center space-y-2 bg-white">
                      <Search size={28} className="mx-auto text-slate-300" />
                      <p className="text-slate-400 text-xs font-bold">No records matched your search filter.</p>
                    </div>
                  );
                }

                return (
                  <div className="overflow-x-auto rounded-xl border border-slate-200 shadow-xs bg-white text-left">
                    <table className="w-full text-left border-collapse text-xs">
                      <thead>
                        <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-extrabold uppercase tracking-wider text-[9px]">
                          <th className="py-3 px-4">Staff Member</th>
                          <th className="py-3 px-4">Role & Designation</th>
                          <th className="py-3 px-4">Contact Info</th>
                          <th className="py-3 px-4">Aadhaar Identity</th>
                          <th className="py-3 px-4">Settlement Bank</th>
                          <th className="py-3 px-4 text-right">Monthly Salary</th>
                          <th className="py-3 px-4 text-center">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {filtered.map((u) => {
                          const isEditingThis = editingAssistantMobile === u.mobileNumber;
                          const isUserInactive = u.isActive === false;

                          if (isEditingThis) {
                            return (
                              <tr key={u.mobileNumber} className="bg-slate-50">
                                <td colSpan={7} className="p-4">
                                  <form 
                                    onSubmit={handleEditAssistantSubmit}
                                    className="bg-white p-5 rounded-xl border-2 border-brand-800 shadow-md space-y-4 text-xs text-left"
                                  >
                                    <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                                      <span className="font-extrabold text-slate-800 flex items-center gap-1.5 uppercase text-[10.5px]">
                                        ✏️ Edit Profile: {u.name}
                                      </span>
                                      <span className="text-[9px] font-mono text-slate-400 uppercase font-bold bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                                        {u.roleType === "employee" ? "Other Employee" : "Village Assistant"}
                                      </span>
                                    </div>

                                    {/* Section 1 */}
                                    <div className="grid grid-cols-1 sm:grid-cols-4 gap-2.5">
                                      <div className="sm:col-span-2 space-y-1">
                                        <label className="block text-[9px] font-bold text-slate-400 uppercase tracking-wider">
                                          Full Name
                                        </label>
                                        <input
                                          type="text"
                                          required
                                          value={editAsstName}
                                          onChange={(e) => setEditAsstName(e.target.value)}
                                          className="w-full p-2 border border-slate-200 rounded-lg text-xs bg-white text-slate-850 font-semibold"
                                        />
                                      </div>

                                      <div className="space-y-1">
                                        <label className="block text-[9px] font-bold text-slate-400 uppercase tracking-wider">
                                          Mobile Number (Login)
                                        </label>
                                        <input
                                          type="text"
                                          required
                                          value={editAsstMobile}
                                          onChange={(e) => setEditAsstMobile(e.target.value)}
                                          className="w-full p-2 border border-slate-200 rounded-lg text-xs bg-white text-slate-850 font-mono font-semibold"
                                        />
                                      </div>

                                      <div className="space-y-1">
                                        <label className="block text-[9px] font-bold text-slate-400 uppercase tracking-wider">
                                          Login Password
                                        </label>
                                        <input
                                          type="text"
                                          required
                                          value={editAsstPassword}
                                          onChange={(e) => setEditAsstPassword(e.target.value)}
                                          className="w-full p-2 border border-slate-200 rounded-lg text-xs bg-white text-slate-850 font-mono font-semibold"
                                        />
                                      </div>
                                    </div>

                                    {/* Section 2 */}
                                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                                      <div className="space-y-1">
                                        <label className="block text-[9px] font-bold text-slate-400 uppercase tracking-wider">
                                          Designation
                                        </label>
                                        <input
                                          type="text"
                                          required
                                          value={editAsstDesignation}
                                          onChange={(e) => setEditAsstDesignation(e.target.value)}
                                          className="w-full p-2 border border-slate-200 rounded-lg text-xs bg-white text-slate-850 font-semibold"
                                        />
                                      </div>

                                      {u.roleType === "employee" ? (
                                        <div className="space-y-1">
                                          <label className="block text-[9px] font-bold text-slate-300 uppercase tracking-wider">
                                            Village Center (Not Applicable)
                                          </label>
                                          <input
                                            type="text"
                                            disabled
                                            value="N/A"
                                            className="w-full p-2 border border-slate-100 rounded-lg text-xs bg-slate-100 text-slate-400 font-semibold"
                                          />
                                        </div>
                                      ) : (
                                        <div className="space-y-1">
                                          <label className="block text-[9px] font-bold text-slate-400 uppercase tracking-wider">
                                            Village Center Allocation
                                          </label>
                                          <select
                                            value={editAsstVillage}
                                            onChange={(e) => setEditAsstVillage(e.target.value)}
                                            className="w-full p-2 border border-slate-200 rounded-lg text-xs bg-white text-slate-850 font-semibold cursor-pointer"
                                          >
                                            <option value="Rampur">Rampur Village</option>
                                            <option value="Dhamnod">Dhamnod Village</option>
                                            <option value="Nemawar">Nemawar Village</option>
                                            <option value="Chandanpur">Chandanpur Village</option>
                                            <option value="Pali">Pali Village</option>
                                            <option value="Kharagpur">Kharagpur Village</option>
                                          </select>
                                        </div>
                                      )}

                                      <div className="space-y-1">
                                        <label className="block text-[9px] font-bold text-slate-400 uppercase tracking-wider">
                                          Emergency Contact
                                        </label>
                                        <input
                                          type="text"
                                          value={editAsstEmergencyContact}
                                          onChange={(e) => setEditAsstEmergencyContact(e.target.value)}
                                          className="w-full p-2 border border-slate-200 rounded-lg text-xs bg-white text-slate-850 font-semibold"
                                        />
                                      </div>
                                    </div>

                                    {/* Section 3: Aadhaar and Banking info */}
                                    <div className="grid grid-cols-1 sm:grid-cols-4 gap-2.5 pt-1.5 border-t border-slate-200/50">
                                      <div className="space-y-1">
                                        <label className="block text-[9px] font-bold text-slate-400 uppercase tracking-wider">
                                          Aadhaar Number
                                        </label>
                                        <input
                                          type="text"
                                          value={editAsstAadhaarNumber}
                                          onChange={(e) => setEditAsstAadhaarNumber(e.target.value)}
                                          className="w-full p-2 border border-slate-200 rounded-lg text-xs bg-white font-mono text-slate-850"
                                        />
                                      </div>

                                      <div className="space-y-1">
                                        <label className="block text-[9px] font-bold text-slate-400 uppercase tracking-wider">
                                          Bank Name
                                        </label>
                                        <input
                                          type="text"
                                          value={editAsstBankName}
                                          onChange={(e) => setEditAsstBankName(e.target.value)}
                                          className="w-full p-2 border border-slate-200 rounded-lg text-xs bg-white text-slate-850 font-semibold"
                                        />
                                      </div>

                                      <div className="sm:col-span-1 space-y-1">
                                        <label className="block text-[9px] font-bold text-slate-400 uppercase tracking-wider">
                                          Bank A/C Number
                                        </label>
                                        <input
                                          type="text"
                                          value={editAsstBankAccountNo}
                                          onChange={(e) => setEditAsstBankAccountNo(e.target.value)}
                                          className="w-full p-2 border border-slate-200 rounded-lg text-xs bg-white font-mono text-slate-850"
                                        />
                                      </div>

                                      <div className="space-y-1">
                                        <label className="block text-[9px] font-bold text-slate-400 uppercase tracking-wider">
                                          Bank IFSC Code
                                        </label>
                                        <input
                                          type="text"
                                          value={editAsstBankIfscCode}
                                          onChange={(e) => setEditAsstBankIfscCode(e.target.toUpperCase())}
                                          className="w-full p-2 border border-slate-200 rounded-lg text-xs bg-white font-mono text-slate-850"
                                        />
                                      </div>
                                    </div>

                                    {/* Section 4: Salary modification (restricted) */}
                                    <div className="p-3 bg-brand-50 rounded-xl border border-brand-200 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                                      <div className="space-y-0.5 text-left">
                                        <label className="text-[10px] font-extrabold text-brand-900 uppercase tracking-wider flex items-center gap-1">
                                          <Lock size={12} className="text-brand-850" />
                                          Monthly Salary Scale (Locked)
                                        </label>
                                        <p className="text-[9px] text-brand-700">
                                          {editAsstSalaryLocked 
                                            ? "Salary scale is locked. Require Proprietor approval to unlock."
                                            : "Salary has been unlocked. Update and save details below."}
                                        </p>
                                      </div>
                                      <div className="flex items-center gap-2">
                                        <div className="relative w-32">
                                          <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-500 font-bold">₹</span>
                                          <input
                                            type="number"
                                            value={editAsstSalaryAmount}
                                            disabled={editAsstSalaryLocked}
                                            onChange={(e) => setEditAsstSalaryAmount(e.target.value)}
                                            className={`w-full pl-6 pr-2 py-1.5 bg-white border border-brand-300 rounded-lg text-xs text-slate-850 font-bold text-right ${editAsstSalaryLocked ? 'opacity-60 bg-slate-100 cursor-not-allowed' : ''}`}
                                          />
                                        </div>
                                        {editAsstSalaryLocked ? (
                                          <button
                                            type="button"
                                            onClick={() => {
                                              setUnlockingUser(u);
                                              setUnlockReason("");
                                              setShowUnlockModal(true);
                                            }}
                                            className="px-2.5 py-1.5 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-lg text-[10px] shadow-xs cursor-pointer flex items-center gap-1"
                                          >
                                            🔑 Request Unlock
                                          </button>
                                        ) : (
                                          <div className="flex items-center gap-1 bg-white/60 px-2 py-1.5 rounded-lg border border-brand-200">
                                            <input
                                              type="checkbox"
                                              id="edit-salary-locked"
                                              checked={editAsstSalaryLocked}
                                              onChange={(e) => setEditAsstSalaryLocked(e.target.checked)}
                                              className="h-3.5 w-3.5 text-brand-800 rounded border-brand-300 cursor-pointer"
                                            />
                                            <label htmlFor="edit-salary-locked" className="text-[9px] font-bold text-brand-900 select-none cursor-pointer">
                                              Lock Again 🔒
                                            </label>
                                          </div>
                                        )}
                                      </div>
                                    </div>

                                    {/* Status and Action Buttons */}
                                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 pt-2 border-t border-slate-200">
                                      <div className="flex items-center gap-2">
                                        <input
                                          type="checkbox"
                                          id={`edit-asst-active-${u.mobileNumber}`}
                                          checked={editAsstIsActive}
                                          onChange={(e) => setEditAsstIsActive(e.target.checked)}
                                          className="rounded text-brand-800 focus:ring-brand-500 h-4 w-4 cursor-pointer"
                                        />
                                        <label htmlFor={`edit-asst-active-${u.mobileNumber}`} className="font-extrabold text-slate-700 select-none cursor-pointer">
                                          User Account is Active (Uncheck to Deactivate profile)
                                        </label>
                                      </div>

                                      <div className="flex gap-2 w-full sm:w-auto self-stretch">
                                        <button
                                          type="submit"
                                          className="flex-1 sm:flex-none px-5 py-2 bg-brand-800 hover:bg-brand-900 text-white font-bold rounded-lg transition text-xs shadow-xs cursor-pointer"
                                        >
                                          Save Changes
                                        </button>
                                        <button
                                          type="button"
                                          onClick={() => setEditingAssistantMobile(null)}
                                          className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-lg transition text-xs cursor-pointer"
                                        >
                                          Cancel
                                        </button>
                                      </div>
                                    </div>
                                  </form>
                                </td>
                              </tr>
                            );
                          }

                          return (
                            <tr key={u.mobileNumber} className={`hover:bg-slate-50 transition border-b border-slate-100 ${isUserInactive ? 'bg-slate-50/70 opacity-80' : 'bg-white'}`}>
                              {/* Column 1: Staff Member */}
                              <td className="py-3 px-4 font-semibold text-slate-900 text-left">
                                <div className="font-extrabold text-slate-950 text-[13px] flex items-center gap-1.5">
                                  {u.name}
                                </div>
                                <div className="mt-1 flex items-center gap-1">
                                  {isUserInactive ? (
                                    <span className="text-[8px] bg-rose-50 text-rose-700 border border-rose-150 rounded font-bold uppercase tracking-wider px-1.5 py-0.5">Inactive</span>
                                  ) : (
                                    <span className="text-[8px] bg-emerald-50 text-emerald-700 border border-emerald-150 rounded font-bold uppercase tracking-wider px-1.5 py-0.5">Active</span>
                                  )}
                                </div>
                              </td>

                              {/* Column 2: Role & Designation */}
                              <td className="py-3 px-4 text-left">
                                <div className="font-bold text-slate-800 text-[11px]">
                                  <span className="bg-slate-100 border border-slate-200 px-1.5 py-0.5 rounded text-slate-800 font-bold text-[10px]">
                                    {u.designation || (u.roleType === "employee" ? "General Staff" : "Village Supervisor")}
                                  </span>
                                </div>
                                {u.roleType !== "employee" && (
                                  <div className="text-[9.5px] text-slate-500 mt-1">
                                    Village: <strong className="text-slate-800">{u.villageName}</strong>
                                  </div>
                                )}
                              </td>

                              {/* Column 3: Contact Info */}
                              <td className="py-3 px-4 text-left">
                                <div className="font-mono text-[11px] text-slate-800 font-semibold">Ph: {u.mobileNumber}</div>
                                <div className="text-[9.5px] text-slate-500 mt-0.5">Emerg: {u.emergencyContact || "—"}</div>
                              </td>

                              {/* Column 4: Aadhaar Identity */}
                              <td className="py-3 px-4 text-left">
                                <div className="font-mono text-[11px] font-bold text-slate-800">{u.aadhaarNumber ? u.aadhaarNumber : "—"}</div>
                                <div className="text-[9px] text-emerald-600 font-semibold mt-0.5 flex items-center gap-0.5">
                                  {u.aadhaarNumber ? "✓ Verified Gov-ID" : "—"}
                                </div>
                              </td>

                              {/* Column 5: Settlement Bank */}
                              <td className="py-3 px-4 text-left">
                                {u.bankAccountNo ? (
                                  <div className="text-[10px] space-y-0.5">
                                    <div className="font-bold text-slate-850 truncate max-w-[120px]">{u.bankName}</div>
                                    <div className="font-mono text-[9px] text-slate-600">A/C: {u.bankAccountNo}</div>
                                    <div className="font-mono text-[8.5px] text-slate-500">IFSC: {u.bankIfscCode}</div>
                                  </div>
                                ) : (
                                  <span className="text-slate-400 italic text-[10px]">No bank registered</span>
                                )}
                              </td>

                              {/* Column 6: Monthly Salary */}
                              <td className="py-3 px-4 text-right">
                                <div className="font-mono font-extrabold text-slate-900 text-xs">
                                  {u.salaryAmount ? `₹ ${u.salaryAmount.toLocaleString()}` : "—"}
                                </div>
                                <div className="mt-1 flex justify-end">
                                  {u.salaryLocked !== false ? (
                                    <span className="text-[8px] bg-amber-50 text-amber-800 border border-amber-200/60 rounded font-extrabold uppercase tracking-wider px-1 py-0.5 flex items-center gap-0.5">
                                      <Lock size={8} /> Locked
                                    </span>
                                  ) : (
                                    <span className="text-[8px] bg-emerald-50 text-emerald-800 border border-emerald-200/60 rounded font-extrabold uppercase tracking-wider px-1 py-0.5 flex items-center gap-0.5">
                                      <Unlock size={8} /> Unlocked
                                    </span>
                                  )}
                                </div>
                                {/* Show request status if pending */}
                                {(() => {
                                  const pendingReq = salaryUnlockRequests.find(r => r.staffMobile === u.mobileNumber && r.status === "Pending");
                                  if (pendingReq) {
                                    return (
                                      <div className="text-[8px] text-amber-600 font-bold mt-1 uppercase tracking-wider">
                                        ⌛ Pending Unlock
                                      </div>
                                    );
                                  }
                                  return null;
                                })()}
                              </td>

                              {/* Column 7: Actions */}
                              <td className="py-3 px-4 text-center">
                                <div className="flex items-center justify-center gap-1.5">
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setEditingAssistantMobile(u.mobileNumber);
                                      setEditAsstName(u.name);
                                      setEditAsstMobile(u.mobileNumber);
                                      setEditAsstVillage(u.villageName);
                                      setEditAsstPassword(u.password || "password");
                                      setEditAsstIsActive(!isUserInactive);
                                      
                                      setEditAsstRoleType(u.roleType || (u.villageName === "N/A" ? "employee" : "assistant"));
                                      setEditAsstDesignation(u.designation || (u.villageName === "N/A" ? "General Staff" : "Village Supervisor"));
                                      setEditAsstAadhaarNumber(u.aadhaarNumber || "");
                                      setEditAsstBankName(u.bankName || "");
                                      setEditAsstBankAccountNo(u.bankAccountNo || "");
                                      setEditAsstBankIfscCode(u.bankIfscCode || "");
                                      setEditAsstEmergencyContact(u.emergencyContact || "");
                                      setEditAsstSalaryAmount(u.salaryAmount !== undefined ? String(u.salaryAmount) : "");
                                      setEditAsstSalaryLocked(u.salaryLocked !== false);
                                    }}
                                    className="px-2 py-1 bg-brand-50 hover:bg-brand-100 text-brand-800 border border-brand-200 rounded font-bold text-[10px] transition cursor-pointer"
                                  >
                                    Edit
                                  </button>

                                  {u.salaryLocked !== false && !salaryUnlockRequests.some(r => r.staffMobile === u.mobileNumber && r.status === "Pending") && (
                                    <button
                                      type="button"
                                      onClick={() => {
                                        setUnlockingUser(u);
                                        setUnlockReason("");
                                        setShowUnlockModal(true);
                                      }}
                                      className="px-1.5 py-1 bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200 rounded font-extrabold text-[10px] transition cursor-pointer"
                                      title="Request Owner Approval to Unlock Salary Scale"
                                    >
                                      🔑 Unlock
                                    </button>
                                  )}

                                  {isUserInactive ? (
                                    <button
                                      type="button"
                                      onClick={() => {
                                        if (confirm(`Do you want to RE-ACTIVATE / RE-HIRE ${u.name}?`)) {
                                          if (onUpdateAssistantUser) {
                                            onUpdateAssistantUser(u.mobileNumber, { ...u, isActive: true });
                                            setAsstSuccessAlert(`Re-activated ${u.name}!`);
                                            setTimeout(() => setAsstSuccessAlert(""), 3000);
                                          }
                                        }
                                      }}
                                      className="px-2 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 rounded font-bold text-[10px] transition cursor-pointer"
                                    >
                                      Activate
                                    </button>
                                  ) : (
                                    <button
                                      type="button"
                                      onClick={() => {
                                        if (confirm(`Are you sure you want to DEACTIVATE ${u.name} as they have left the company? This locks their login.`)) {
                                          if (onUpdateAssistantUser) {
                                            onUpdateAssistantUser(u.mobileNumber, { ...u, isActive: false });
                                            setAsstSuccessAlert(`Deactivated ${u.name} successfully.`);
                                            setTimeout(() => setAsstSuccessAlert(""), 3000);
                                          }
                                        }
                                      }}
                                      className="px-2 py-1 bg-rose-50 hover:bg-rose-100 text-rose-800 border border-rose-200 rounded font-bold text-[10px] transition cursor-pointer"
                                    >
                                      Deactivate
                                    </button>
                                  )}
                                </div>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                );
              })()}
            </div>
            )}
          </div>
        )}

        </div>
      </div>

      {/* OVERLAY MODAL: RECORD INVOICE PAYMENT */}
      {showPaymentModal && activeInvoice && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl max-w-md w-full border border-slate-200 shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 text-left">
            
            <div className="bg-brand-800 text-white px-5 py-4 flex justify-between items-center">
              <div>
                <span className="text-[9px] uppercase tracking-wider font-extrabold text-white/70 block">RTGS &amp; Ledger Settlement</span>
                <h3 className="text-sm font-bold">Process Invoice: {activeInvoice.billNumber}</h3>
              </div>
              <button
                onClick={() => { setShowPaymentModal(false); setSelectedInvoiceNumber(null); }}
                className="text-white/80 hover:text-white bg-white/10 hover:bg-white/20 p-1.5 rounded-lg transition"
              >
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleProcessPaymentSubmit} className="p-5 space-y-4 text-xs text-left">
              <div className="p-3 bg-brand-50 border border-brand-100 rounded-xl space-y-1">
                <span className="text-[10px] text-brand-850 uppercase font-bold tracking-wider block">Authorized Supplier</span>
                <span className="text-xs font-bold text-slate-800 block">{activeInvoice.supplierName}</span>
                <span className="text-[11px] text-slate-500 font-mono block">Pending Total Balance: ₹{(activeInvoice.totalAmount ?? 0).toLocaleString()}</span>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                    Disbursement Amount
                  </label>
                  <input
                    type="number"
                    required
                    value={paymentAmount}
                    onChange={(e) => setPaymentAmount(e.target.value)}
                    className="w-full p-2 border border-slate-200 rounded-lg text-xs font-bold font-mono text-slate-800"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                    Disbursement Mode
                  </label>
                  <select
                    value={paymentMode}
                    onChange={(e) => setPaymentMode(e.target.value as any)}
                    className="w-full p-2 border border-slate-200 rounded-lg text-xs font-bold text-slate-800 bg-white cursor-pointer"
                  >
                    <option value="Bank Transfer">Bank RTGS / NEFT</option>
                    <option value="UPI">Digital UPI</option>
                    <option value="Cash">Cash Ledger</option>
                    <option value="Cheque">Physical Cheque</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                  Transaction Reference Code
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. TXN18290028"
                  value={paymentRef}
                  onChange={(e) => setPaymentRef(e.target.value)}
                  className="w-full p-2 border border-slate-200 rounded-lg text-xs font-bold font-mono text-slate-800 uppercase"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                  Compliance / Transaction Notes
                </label>
                <textarea
                  value={paymentNotes}
                  onChange={(e) => setPaymentNotes(e.target.value)}
                  placeholder="e.g. Payment authorized and checked by Accountant..."
                  className="w-full p-2 border border-slate-200 rounded-lg text-xs font-semibold text-slate-850 bg-slate-50 min-h-12"
                />
              </div>

              <button
                type="submit"
                disabled={isSubmittingPayment}
                className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-300 text-white rounded-lg transition font-bold uppercase tracking-wider text-[10.5px] cursor-pointer flex justify-center items-center gap-1.5 shadow"
              >
                {isSubmittingPayment ? (
                  <>
                    <Clock size={14} className="animate-spin" />
                    Processing Payment...
                  </>
                ) : (
                  <>
                    <CheckCircle2 size={14} />
                    Confirm &amp; Disburse Payment
                  </>
                )}
              </button>
            </form>

          </div>
        </div>
      )}

      {/* OVERLAY MODAL: SHARE COMPLIANCE PAYMENT RECEIPT */}
      {showShareModal && activeInvoice && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl max-w-md w-full border border-slate-200 shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
            
            <div className="bg-emerald-800 text-white px-5 py-4 flex justify-between items-center">
              <div>
                <span className="text-[9px] uppercase tracking-wider font-extrabold text-white/70 block">Compliance Cleared</span>
                <h3 className="text-sm font-bold">Transaction Receipt: {activeInvoice.billNumber}</h3>
              </div>
              <button
                onClick={() => { setShowShareModal(false); setSelectedInvoiceNumber(null); }}
                className="text-white/80 hover:text-white bg-white/10 hover:bg-white/20 p-1.5 rounded-lg transition"
              >
                <X size={16} />
              </button>
            </div>

            {/* Simulated Receipt Design Card */}
            <div className="p-5 space-y-4">
              
              <div className="border border-dashed border-emerald-250 bg-emerald-50/50 p-4 rounded-xl space-y-3 text-[11px] text-slate-800 text-left">
                <div className="flex justify-between font-bold border-b border-dashed border-emerald-200 pb-2">
                  <span>M/s {activeInvoice.supplierName}</span>
                  <span className="text-emerald-850">TRANSACTION PAID</span>
                </div>

                <div className="space-y-1 font-mono text-[10px]">
                  <div>Invoice Number: <strong>{activeInvoice.billNumber}</strong></div>
                  <div>Settlement Date: <strong>{new Date().toISOString().split("T")[0]}</strong></div>
                  <div>Settled via: <strong>{paymentMode} (Ref: {paymentRef})</strong></div>
                  <div>Payment Amount: <strong className="text-emerald-850">₹ {parseFloat(paymentAmount).toLocaleString()}</strong></div>
                </div>

                <p className="text-[10px] text-slate-500 font-semibold italic border-t border-dashed border-emerald-200 pt-2 leading-relaxed">
                  Compliance cleared. Disbursed RTGS transaction completed. System receipt generated for auditing ledger.
                </p>
              </div>

              {/* Share forms */}
              <form onSubmit={handleShareReceiptSubmit} className="space-y-3.5 text-left text-xs">
                
                {shareSuccess ? (
                  <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl font-bold flex items-center justify-center gap-2 text-center animate-bounce">
                    <CheckCircle2 className="text-emerald-600" size={18} />
                    <span>Receipt shared successfully via Email &amp; WhatsApp!</span>
                  </div>
                ) : (
                  <>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                          Share Vendor Email
                        </label>
                        <input
                          type="email"
                          required
                          placeholder="vendor@company.com"
                          value={shareEmail}
                          onChange={(e) => setShareEmail(e.target.value)}
                          className="w-full p-2 border border-slate-200 rounded-lg text-xs bg-slate-50 text-slate-800"
                        />
                      </div>

                      <div>
                        <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                          Share Vendor Mobile
                        </label>
                        <input
                          type="tel"
                          required
                          placeholder="e.g. +91 90000 00000"
                          value={shareMobile}
                          onChange={(e) => setShareMobile(e.target.value)}
                          className="w-full p-2 border border-slate-200 rounded-lg text-xs bg-slate-50 text-slate-800"
                        />
                      </div>
                    </div>

                    <div className="flex gap-2 font-semibold">
                      <button
                        type="submit"
                        disabled={isSharingReceipt}
                        className="flex-1 py-2 bg-emerald-700 hover:bg-emerald-800 disabled:bg-slate-200 text-white rounded-lg transition text-[10.5px] cursor-pointer flex justify-center items-center gap-1.5"
                      >
                        {isSharingReceipt ? (
                          <>
                            <Clock size={12} className="animate-spin" />
                            Sharing...
                          </>
                        ) : (
                          <>
                            <Share2 size={12} />
                            Share Receipt Securely
                          </>
                        )}
                      </button>
                      <button
                        type="button"
                        onClick={() => window.print()}
                        className="px-3 py-2 bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-700 rounded-lg transition text-[10.5px] cursor-pointer inline-flex items-center gap-1"
                      >
                        <Printer size={12} />
                        Print
                      </button>
                    </div>
                  </>
                )}

              </form>

            </div>

          </div>
        </div>
      )}

      {/* OVERLAY MODAL: CONSOLIDATED FARMER BILL & SHARE */}
      {showConsolidatedModal && selectedConsolidatedFarmer && farmerCollections.length > 0 && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl max-w-2xl w-full border border-slate-200 shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 text-left flex flex-col max-h-[90vh]">
            
            {/* Modal Header */}
            <div className="bg-brand-800 text-white px-5 py-4 flex justify-between items-center shrink-0">
              <div className="flex items-center gap-2">
                <Sprout size={18} className="text-emerald-300" />
                <div>
                  <span className="text-[9px] uppercase tracking-wider font-extrabold text-white/70 block">Beneficiary Ledger Report</span>
                  <h3 className="text-sm font-bold">Consolidated Fertilizer &amp; Pesticides Bill</h3>
                </div>
              </div>
              <button
                onClick={() => { setShowConsolidatedModal(false); setSelectedConsolidatedFarmer(null); setSelectedConsolidatedMobile(null); }}
                className="text-white/80 hover:text-white bg-white/10 hover:bg-white/20 p-1.5 rounded-lg transition"
              >
                <X size={16} />
              </button>
            </div>

            <div className="overflow-y-auto p-5 space-y-4 text-xs text-left">
              {/* Farmer and Route Info Header */}
              <div className="p-4 bg-slate-50 border border-slate-150 rounded-xl grid grid-cols-1 md:grid-cols-3 gap-3">
                <div>
                  <span className="text-[10px] text-slate-400 uppercase font-extrabold block">Farmer Name</span>
                  <span className="text-xs font-bold text-slate-800">{farmerCollections[0].farmerName}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 uppercase font-extrabold block">Mobile / Contact</span>
                  <span className="text-xs font-bold text-slate-800 font-mono">{farmerCollections[0].mobileNumber}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 uppercase font-extrabold block">Village Route</span>
                  <span className="text-xs font-bold text-brand-850">📍 {farmerCollections[0].villageName}</span>
                </div>
              </div>

              {/* Collections over time */}
              <div className="space-y-2">
                <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider font-sans">Itemized Collection Log (By Date/Day):</h4>
                <div className="border border-slate-200 rounded-xl overflow-hidden">
                  <table className="w-full text-left border-collapse text-[11px]">
                    <thead>
                      <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold text-[9.5px] uppercase tracking-wider">
                        <th className="py-2 px-3">Date</th>
                        <th className="py-2 px-3">Product Name</th>
                        <th className="py-2 px-3 text-right">Quantity</th>
                        <th className="py-2 px-3 text-right">Rate/Bag</th>
                        <th className="py-2 px-3 text-right">Total Bill</th>
                        <th className="py-2 px-3 text-center">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-150 bg-white font-medium text-slate-700">
                      {farmerCollections.map((c) => (
                        <tr key={c.id} className="hover:bg-slate-50/50">
                          <td className="py-2 px-3 font-mono text-[10px] text-slate-500">{c.date || "2026-06-22"}</td>
                          <td className="py-2 px-3 font-bold text-slate-900">{c.productName}</td>
                          <td className="py-2 px-3 text-right font-mono font-bold">{c.bagCount} Bags</td>
                          <td className="py-2 px-3 text-right font-mono">₹{c.ratePerBag}</td>
                          <td className="py-2 px-3 text-right font-mono text-brand-850 font-bold">₹{c.totalAmount.toLocaleString()}</td>
                          <td className="py-2 px-3 text-center">
                            <span className={`text-[8.5px] px-1.5 py-0.5 rounded font-bold font-mono uppercase tracking-wide inline-block ${
                              c.paymentStatus === "Paid" 
                                ? "bg-emerald-50 text-emerald-800" 
                                : c.paymentStatus === "Partial"
                                ? "bg-amber-50 text-amber-800"
                                : "bg-rose-50 text-rose-800"
                            }`}>
                              {c.paymentStatus}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Bill aggregates/summary */}
              <div className="p-4 bg-brand-50/70 border border-brand-100 rounded-xl">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-left font-sans">
                  <div>
                    <span className="text-[9px] text-brand-850/80 uppercase font-extrabold block">Total Bags collected</span>
                    <span className="text-sm font-black text-slate-800 font-mono">
                      {farmerCollections.reduce((sum, c) => sum + c.bagCount, 0)} Bags
                    </span>
                  </div>
                  <div>
                    <span className="text-[9px] text-brand-850/80 uppercase font-extrabold block">Total Bill value</span>
                    <span className="text-sm font-black text-slate-800 font-mono">
                      ₹{farmerCollections.reduce((sum, c) => sum + c.totalAmount, 0).toLocaleString()}
                    </span>
                  </div>
                  <div>
                    <span className="text-[9px] text-brand-850/80 uppercase font-extrabold block">Total Amount Paid</span>
                    <span className="text-sm font-black text-emerald-800 font-mono">
                      ₹{farmerCollections.reduce((sum, c) => sum + c.amountCollected, 0).toLocaleString()}
                    </span>
                  </div>
                  <div>
                    <span className="text-[9px] text-brand-850/80 uppercase font-extrabold block text-rose-800">Outstanding Balance</span>
                    <span className="text-sm font-black text-rose-800 font-mono">
                      ₹{farmerCollections.reduce((sum, c) => sum + c.balanceAmount, 0).toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>

              {/* WhatsApp Share Preview */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">SMS / WhatsApp Share Template Preview:</h4>
                  <span className="text-[9px] bg-emerald-100 text-emerald-800 font-bold px-1.5 py-0.5 rounded font-mono">Pre-formatted Text</span>
                </div>
                <div className="bg-slate-900 text-slate-100 p-4 rounded-xl font-mono text-[10.5px] whitespace-pre-line leading-relaxed border border-slate-850 relative text-left">
                  {getWhatsAppShareText()}
                </div>
              </div>

            </div>

            {/* Modal Actions */}
            <div className="bg-slate-50 border-t border-slate-150 px-5 py-3.5 flex justify-between items-center shrink-0">
              <span className="text-[10px] text-slate-400 font-semibold font-mono">
                Will be shared with {farmerCollections[0].mobileNumber}
              </span>
              <div className="flex gap-2 font-semibold">
                <button
                  type="button"
                  onClick={handleCopyShareText}
                  className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 border border-slate-250 text-slate-700 rounded-lg transition text-[10.5px] cursor-pointer inline-flex items-center gap-1.5 font-bold"
                >
                  <ClipboardList size={12} />
                  {copiedSuccess ? "✓ Copied!" : "Copy Text"}
                </button>
                <button
                  type="button"
                  onClick={handleShareWhatsApp}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition text-[10.5px] cursor-pointer inline-flex items-center gap-1.5 font-bold shadow-sm"
                >
                  <Share2 size={12} />
                  Share via WhatsApp
                </button>
              </div>
            </div>

          </div>
        </div>
      )}

      {/* MODAL 1: INVOICE QUANTITY DRILLDOWN */}
      {drilldownInvoiceGroup && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in duration-200 text-left">
          <div className="bg-white rounded-2xl max-w-3xl w-full border border-slate-200 shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 text-left flex flex-col max-h-[90vh]">
            
            {/* Modal Header */}
            <div className="bg-brand-800 text-white px-5 py-4 flex justify-between items-center shrink-0">
              <div className="flex items-center gap-2">
                <Info size={18} className="text-emerald-300" />
                <div>
                  <span className="text-[9px] uppercase tracking-wider font-extrabold text-white/70 block">Inward Inventory Trace</span>
                  <h3 className="text-sm font-bold">Supply &amp; Distribution Ledger</h3>
                </div>
              </div>
              <button
                onClick={() => setDrilldownInvoiceGroup(null)}
                className="text-white/80 hover:text-white bg-white/10 hover:bg-white/20 p-1.5 rounded-lg transition cursor-pointer"
              >
                <X size={16} />
              </button>
            </div>

            <div className="overflow-y-auto p-5 space-y-4 text-xs text-left">
              
              {/* Invoice Core details */}
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <span className="text-[10px] text-slate-400 uppercase font-extrabold block">Supplier / Manufacturer</span>
                  <span className="text-xs font-bold text-slate-800">{drilldownInvoiceGroup.supplierName}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 uppercase font-extrabold block">Invoice Number &amp; Date</span>
                  <span className="text-xs font-mono font-bold text-slate-800">
                    📄 {drilldownInvoiceGroup.billNumber} ({drilldownInvoiceGroup.billDate})
                  </span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 uppercase font-extrabold block">Total Bags Count</span>
                  <span className="text-xs font-mono font-bold text-slate-800">
                    {drilldownInvoiceGroup.items.reduce((sum: number, item: any) => sum + item.bagCount, 0)} Bags
                  </span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 uppercase font-extrabold block">Total Invoice Value</span>
                  <span className="text-xs font-mono font-bold text-brand-850">
                    ₹{drilldownInvoiceGroup.totalAmount.toLocaleString()}
                  </span>
                </div>
              </div>

              {/* Products under this Invoice */}
              <div className="space-y-2 text-left">
                <h4 className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">Products Under This Invoice</h4>
                <div className="border border-slate-150 rounded-xl overflow-hidden shadow-3xs">
                  <table className="w-full text-left border-collapse text-[11px]">
                    <thead>
                      <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold text-[9.5px] uppercase tracking-wider">
                        <th className="py-2 px-4">Variety / Product</th>
                        <th className="py-2 px-4 text-right">Quantity</th>
                        <th className="py-2 px-4 text-right">Rate / Bag</th>
                        <th className="py-2 px-4 text-right">Sub-Payable</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-150 bg-white font-medium text-slate-700">
                      {drilldownInvoiceGroup.items.map((item: any) => (
                        <tr key={item.id} className="hover:bg-slate-50/50">
                          <td className="py-2.5 px-4 font-bold text-slate-900">{item.productName}</td>
                          <td className="py-2.5 px-4 text-right font-mono text-slate-800">{item.bagCount} Bags</td>
                          <td className="py-2.5 px-4 text-right font-mono text-slate-500">₹{item.ratePerBag}</td>
                          <td className="py-2.5 px-4 text-right font-mono font-bold text-brand-850">₹{item.totalAmount.toLocaleString()}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Stock Ledger Tracking & Dispatches */}
              {(() => {
                const itemNames = drilldownInvoiceGroup.items.map((i: any) => i.productName.toLowerCase());
                const groupDispatches = dispatchesList.filter((d) =>
                  itemNames.includes(d.productName.toLowerCase())
                );
                const groupSales = farmerDistributions.filter((fd) =>
                  itemNames.includes(fd.productName.toLowerCase())
                );

                const totalInward = drilldownInvoiceGroup.items.reduce((sum: number, item: any) => sum + item.bagCount, 0);
                const totalDispatched = groupDispatches.reduce((sum, d) => sum + d.bagCount, 0);
                const totalSold = groupSales.reduce((sum, s) => sum + s.bagCount, 0);
                const remainingDepot = Math.max(0, totalInward - totalDispatched);

                return (
                  <>
                    <div className="p-4 bg-brand-50 border border-brand-100 rounded-xl grid grid-cols-2 md:grid-cols-4 gap-3 text-left font-sans">
                      <div>
                        <span className="text-[9px] text-brand-850/80 uppercase font-extrabold block font-sans">Total Inward Stock</span>
                        <span className="text-sm font-black text-slate-800 font-mono">
                          {totalInward.toLocaleString()} Bags
                        </span>
                      </div>
                      <div>
                        <span className="text-[9px] text-brand-850/80 uppercase font-extrabold block font-sans">Dispatched to Villages</span>
                        <span className="text-sm font-black text-slate-800 font-mono">
                          {totalDispatched.toLocaleString()} Bags
                        </span>
                      </div>
                      <div>
                        <span className="text-[9px] text-brand-850/80 uppercase font-extrabold block font-sans">Sold to Farmers</span>
                        <span className="text-sm font-black text-emerald-800 font-mono">
                          {totalSold.toLocaleString()} Bags
                        </span>
                      </div>
                      <div>
                        <span className="text-[9px] text-rose-800 uppercase font-extrabold block font-sans">In Central Warehouse</span>
                        <span className="text-sm font-black text-rose-800 font-mono">
                          {remainingDepot.toLocaleString()} Bags
                        </span>
                      </div>
                    </div>

                    {/* Group Village Dispatches */}
                    <div className="space-y-2 pt-1 text-left">
                      <h4 className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider font-sans">Village Stock Dispatches:</h4>
                      {groupDispatches.length === 0 ? (
                        <div className="p-3 bg-slate-50 rounded-xl text-center text-slate-400 font-semibold border border-dashed border-slate-200">
                          No active dispatch records have been processed for these inward stock products yet.
                        </div>
                      ) : (
                        <div className="border border-slate-150 rounded-xl overflow-hidden">
                          <table className="w-full text-left border-collapse text-[11px]">
                            <thead>
                              <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold text-[9.5px] uppercase tracking-wider">
                                <th className="py-2 px-3">Date</th>
                                <th className="py-2 px-3">Variety / Product</th>
                                <th className="py-2 px-3">Village Route</th>
                                <th className="py-2 px-3">Assistant</th>
                                <th className="py-2 px-3 text-right">Quantity</th>
                                <th className="py-2 px-3 text-center">Status</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-150 bg-white font-medium text-slate-700">
                              {groupDispatches.map((d) => (
                                <tr key={d.id} className="hover:bg-slate-50/50">
                                  <td className="py-2 px-3 font-mono text-slate-500">{d.dispatchDate || "N/A"}</td>
                                  <td className="py-2 px-3 font-semibold text-slate-850">{d.productName}</td>
                                  <td className="py-2 px-3 font-bold text-slate-900">{d.villageName}</td>
                                  <td className="py-2 px-3 text-slate-600">{d.assistantName}</td>
                                  <td className="py-2 px-3 text-right font-mono text-brand-850 font-bold">{d.bagCount} Bags</td>
                                  <td className="py-2 px-3 text-center">
                                    <span className={`text-[8.5px] px-1.5 py-0.5 rounded font-bold font-mono uppercase tracking-wide inline-block ${
                                      d.status === "Acknowledged" 
                                        ? "bg-emerald-50 text-emerald-800 border border-emerald-100" 
                                        : "bg-amber-50 text-amber-800 border border-amber-100"
                                    }`}>
                                      {d.status}
                                    </span>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      )}
                    </div>

                    {/* Group Sales */}
                    <div className="space-y-2 pt-1 text-left">
                      <h4 className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider font-sans">Direct Sales to Beneficiary Farmers:</h4>
                      {groupSales.length === 0 ? (
                        <div className="p-3 bg-slate-50 rounded-xl text-center text-slate-400 font-semibold border border-dashed border-slate-200">
                          No beneficiary distributions logged for these products in the current cycle.
                        </div>
                      ) : (
                        <div className="border border-slate-150 rounded-xl overflow-hidden">
                          <table className="w-full text-left border-collapse text-[11px]">
                            <thead>
                              <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold text-[9.5px] uppercase tracking-wider">
                                <th className="py-2 px-3">Date</th>
                                <th className="py-2 px-3">Variety / Product</th>
                                <th className="py-2 px-3">Farmer Name</th>
                                <th className="py-2 px-3">Village Route</th>
                                <th className="py-2 px-3 text-right">Quantity</th>
                                <th className="py-2 px-3 text-right">Total Bill</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-150 bg-white font-medium text-slate-700">
                              {groupSales.slice(0, 15).map((s) => (
                                <tr key={s.id} className="hover:bg-slate-50/50">
                                  <td className="py-2 px-3 font-mono text-slate-500">{s.date || "N/A"}</td>
                                  <td className="py-2 px-3 font-semibold text-slate-800">{s.productName}</td>
                                  <td className="py-2 px-3 font-bold text-slate-900">
                                    <div>{s.farmerName}</div>
                                    <div className="text-[9.5px] text-slate-400 font-mono mt-0.5">{s.mobileNumber}</div>
                                  </td>
                                  <td className="py-2 px-3 text-slate-600">{s.villageName}</td>
                                  <td className="py-2 px-3 text-right font-mono font-bold">{s.bagCount} Bags</td>
                                  <td className="py-2 px-3 text-right font-mono text-emerald-800 font-bold">₹{s.totalAmount.toLocaleString()}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                          {groupSales.length > 15 && (
                            <div className="bg-slate-50 px-3 py-1.5 text-center text-[10px] text-slate-400 font-semibold border-t border-slate-150">
                              Showing first 15 of {groupSales.length} total direct sales records...
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </>
                );
              })()}

            </div>

            {/* Modal Footer */}
            <div className="bg-slate-50 border-t border-slate-150 px-5 py-3 flex justify-end shrink-0">
              <button
                type="button"
                onClick={() => setDrilldownInvoiceGroup(null)}
                className="px-4 py-2 bg-slate-700 hover:bg-slate-800 text-white font-bold rounded-lg transition text-[10.5px] cursor-pointer"
              >
                Close Audit View
              </button>
            </div>

          </div>
        </div>
      )}

      {/* MODAL 2: FARMER DISTRIBUTION QUANTITY DRILLDOWN */}
      {drilldownFarmerDist && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in duration-200 text-left">
          <div className="bg-white rounded-2xl max-w-2xl w-full border border-slate-200 shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 text-left flex flex-col max-h-[90vh]">
            
            {/* Modal Header */}
            <div className="bg-brand-800 text-white px-5 py-4 flex justify-between items-center shrink-0">
              <div className="flex items-center gap-2">
                <Sprout size={18} className="text-emerald-300" />
                <div>
                  <span className="text-[9px] uppercase tracking-wider font-extrabold text-white/70 block">Beneficiary Ledger Detail</span>
                  <h3 className="text-sm font-bold">Fertilizer Collection Receipt</h3>
                </div>
              </div>
              <button
                onClick={() => setDrilldownFarmerDist(null)}
                className="text-white/80 hover:text-white bg-white/10 hover:bg-white/20 p-1.5 rounded-lg transition cursor-pointer"
              >
                <X size={16} />
              </button>
            </div>

            <div className="overflow-y-auto p-5 space-y-4 text-xs text-left">
              
              {/* Beneficiary Profiler and Route */}
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <span className="text-[10px] text-slate-400 uppercase font-extrabold block font-sans">Farmer Name</span>
                  <span className="text-xs font-black text-slate-900">{drilldownFarmerDist.farmerName}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 uppercase font-extrabold block font-sans">Contact Number</span>
                  <span className="text-xs font-mono font-bold text-slate-800">{drilldownFarmerDist.mobileNumber}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 uppercase font-extrabold block font-sans">Village Route</span>
                  <span className="text-xs font-bold text-brand-850">📍 {drilldownFarmerDist.villageName} Route</span>
                </div>
              </div>

              {/* Core collection financial breakdown */}
              <div className="border border-slate-200 rounded-xl overflow-hidden">
                <div className="bg-slate-50 px-4 py-2 border-b border-slate-150 font-bold text-slate-500 uppercase tracking-wider text-[9.5px]">
                  Sale &amp; Collection Details
                </div>
                <div className="p-4 space-y-3">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div>
                      <span className="text-[9.5px] text-slate-400 uppercase font-extrabold block font-sans">Product / Material</span>
                      <span className="text-xs font-bold text-slate-800">{drilldownFarmerDist.productName}</span>
                    </div>
                    <div>
                      <span className="text-[9.5px] text-slate-400 uppercase font-extrabold block font-sans">Bags Collected</span>
                      <span className="text-xs font-black text-brand-850 font-mono">{drilldownFarmerDist.bagCount} Bags</span>
                    </div>
                    <div>
                      <span className="text-[9.5px] text-slate-400 uppercase font-extrabold block font-sans font-mono">Rate/Bag (Retail)</span>
                      <span className="text-xs font-bold text-slate-800 font-mono">₹{drilldownFarmerDist.ratePerBag}</span>
                    </div>
                    <div>
                      <span className="text-[9.5px] text-slate-400 uppercase font-extrabold block font-sans">Total Invoice Bill</span>
                      <span className="text-xs font-black text-slate-900 font-mono">₹{drilldownFarmerDist.totalAmount.toLocaleString()}</span>
                    </div>
                  </div>

                  <hr className="border-slate-150" />

                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    <div>
                      <span className="text-[9.5px] text-slate-400 uppercase font-extrabold block font-sans">Amount Collected</span>
                      <span className="text-xs font-black text-emerald-800 font-mono">₹{drilldownFarmerDist.amountCollected.toLocaleString()}</span>
                    </div>
                    <div>
                      <span className="text-[9.5px] text-slate-400 uppercase font-extrabold block font-sans text-rose-800">Outstanding Balance</span>
                      <span className="text-xs font-black text-rose-800 font-mono">₹{drilldownFarmerDist.balanceAmount.toLocaleString()}</span>
                    </div>
                    <div>
                      <span className="text-[9.5px] text-slate-400 uppercase font-extrabold block font-sans">Status</span>
                      <span className={`text-[9px] px-1.5 py-0.5 rounded font-extrabold font-mono uppercase tracking-wide inline-block mt-0.5 ${
                        drilldownFarmerDist.paymentStatus === "Paid" 
                          ? "bg-emerald-50 text-emerald-800 border border-emerald-100" 
                          : drilldownFarmerDist.paymentStatus === "Partial"
                          ? "bg-amber-50 text-amber-800 border border-amber-100"
                          : "bg-rose-50 text-rose-800 border border-rose-100"
                      }`}>
                        {drilldownFarmerDist.paymentStatus}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Logistics & metadata info */}
              <div className="p-3.5 bg-slate-50 border border-slate-150 rounded-xl grid grid-cols-2 gap-4">
                <div>
                  <span className="text-[9.5px] text-slate-400 uppercase font-extrabold block font-sans">Allocated / Processed By</span>
                  <span className="text-xs font-bold text-slate-800">👨‍🌾 {drilldownFarmerDist.assistantName || "Village Assistant"}</span>
                </div>
                <div>
                  <span className="text-[9.5px] text-slate-400 uppercase font-extrabold block font-sans font-mono">Collection Timestamp</span>
                  <span className="text-xs font-mono font-bold text-slate-800">📅 {drilldownFarmerDist.date || "2026-06-22"}</span>
                </div>
              </div>

              {/* Farmer History Logs (other allocations) */}
              {(() => {
                const farmerHistory = farmerDistributions.filter(
                  (fd) => fd.farmerName.toLowerCase() === drilldownFarmerDist.farmerName.toLowerCase() && fd.id !== drilldownFarmerDist.id
                );

                return (
                  <div className="space-y-2 pt-1 text-left">
                    <h4 className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider font-sans">Other Collections by this Farmer:</h4>
                    {farmerHistory.length === 0 ? (
                      <div className="p-3 bg-slate-50 rounded-xl text-center text-slate-400 font-semibold border border-dashed border-slate-200">
                        No secondary collection records found for this farmer in the current cycle.
                      </div>
                    ) : (
                      <div className="border border-slate-150 rounded-xl overflow-hidden">
                        <table className="w-full text-left border-collapse text-[11px]">
                          <thead>
                            <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold text-[9.5px] uppercase tracking-wider">
                              <th className="py-2 px-3">Date</th>
                              <th className="py-2 px-3">Product Name</th>
                              <th className="py-2 px-3 text-right">Quantity</th>
                              <th className="py-2 px-3 text-right">Total Bill</th>
                              <th className="py-2 px-3 text-center">Status</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-150 bg-white font-medium text-slate-700">
                            {farmerHistory.map((fh) => (
                              <tr key={fh.id} className="hover:bg-slate-50/50">
                                <td className="py-2 px-3 font-mono text-slate-500">{fh.date || "N/A"}</td>
                                <td className="py-2 px-3 font-bold text-slate-900">{fh.productName}</td>
                                <td className="py-2 px-3 text-right font-mono font-bold">{fh.bagCount} Bags</td>
                                <td className="py-2 px-3 text-right font-mono text-brand-850 font-bold">₹{fh.totalAmount.toLocaleString()}</td>
                                <td className="py-2 px-3 text-center">
                                  <span className={`text-[8px] px-1.5 py-0.5 rounded font-extrabold font-mono uppercase tracking-wide inline-block ${
                                    fh.paymentStatus === "Paid" 
                                      ? "bg-emerald-50 text-emerald-800 border border-emerald-100" 
                                      : fh.paymentStatus === "Partial"
                                      ? "bg-amber-50 text-amber-800 border border-amber-100"
                                      : "bg-rose-50 text-rose-800 border border-rose-100"
                                  }`}>
                                    {fh.paymentStatus}
                                  </span>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                );
              })()}

            </div>

            {/* Modal Footer */}
            <div className="bg-slate-50 border-t border-slate-150 px-5 py-3 flex justify-end shrink-0">
              <button
                type="button"
                onClick={() => setDrilldownFarmerDist(null)}
                className="px-4 py-2 bg-slate-700 hover:bg-slate-800 text-white font-bold rounded-lg transition text-[10.5px] cursor-pointer"
              >
                Close Receipt Details
              </button>
            </div>

          </div>
        </div>
      )}

      {/* 1. Employee Salary Disbursal Modal */}
      {showSalaryModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-[2px] flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
          <div className="bg-white w-full max-w-md rounded-2xl border border-slate-200 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            {/* Modal Header */}
            <div className="bg-brand-800 text-white px-5 py-4 flex justify-between items-center shrink-0">
              <div className="flex items-center gap-2">
                <Coins size={18} className="text-emerald-300" />
                <div>
                  <span className="text-[9px] uppercase tracking-wider font-extrabold text-white/70 block">Payroll Center</span>
                  <h3 className="text-sm font-bold">Disburse Employee Salary</h3>
                </div>
              </div>
              <button
                onClick={() => {
                  setShowSalaryModal(false);
                  setSelectedStaffForSalary(null);
                }}
                className="text-white/80 hover:text-white bg-white/10 hover:bg-white/20 p-1.5 rounded-lg transition"
              >
                <X size={16} />
              </button>
            </div>

            {/* Modal Content */}
            <div className="overflow-y-auto p-5 space-y-4 text-xs text-left">
              {selectedStaffForSalary ? (
                /* Individual Mode */
                <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
                  <div className="flex justify-between items-start">
                    <div>
                      <span className="text-[9px] text-slate-400 uppercase font-black tracking-wider block">Employee Details</span>
                      <span className="text-xs font-black text-slate-900">{selectedStaffForSalary.name}</span>
                      <span className="block text-[10px] text-slate-500 font-mono mt-0.5">{selectedStaffForSalary.mobileNumber}</span>
                    </div>
                    <span className="text-[10px] font-black px-2 py-0.5 rounded bg-slate-100 text-slate-700 uppercase">
                      {selectedStaffForSalary.designation || "Assistant"}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-4 pt-2 border-t border-slate-200/60 text-[11px]">
                    <div>
                      <span className="text-[9px] text-slate-400 font-bold block">BANK NAME</span>
                      <span className="font-extrabold text-slate-800">{selectedStaffForSalary.bankName || "STATE BANK OF INDIA"}</span>
                    </div>
                    <div>
                      <span className="text-[9px] text-slate-400 font-bold block">ACCOUNT NUMBER</span>
                      <span className="font-mono font-extrabold text-slate-800">{selectedStaffForSalary.accountNumber || "38290123916"}</span>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-slate-200/60 flex justify-between items-center">
                    <span className="font-extrabold text-slate-600">Base Salary:</span>
                    <span className="text-base font-black text-brand-900 font-mono">₹{(selectedStaffForSalary.salaryAmount || 25000).toLocaleString()}</span>
                  </div>
                </div>
              ) : (
                /* Bulk Mode */
                <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
                  <span className="text-[9px] text-slate-400 uppercase font-black tracking-wider block">Bulk Payout Summary</span>
                  <div className="max-h-24 overflow-y-auto divide-y divide-slate-150">
                    {assistantUsers
                      .filter(u => {
                        const isPaid = processedSalaries.some(p => p.employeeMobile === u.mobileNumber && p.monthYear === salaryMonth);
                        const isLocked = u.salaryLocked;
                        return !isPaid && !isLocked && selectedSalaryMobiles.includes(u.mobileNumber);
                      })
                      .map(u => (
                        <div key={u.mobileNumber} className="py-1.5 flex justify-between items-center text-[10.5px]">
                          <div>
                            <span className="font-bold text-slate-900">{u.name}</span>
                            <span className="text-[9.5px] text-slate-400 ml-1 font-semibold">({u.designation || "Assistant"})</span>
                          </div>
                          <span className="font-extrabold text-slate-800">₹{(u.salaryAmount || 25000).toLocaleString()}</span>
                        </div>
                      ))}
                  </div>
                  <div className="pt-2 border-t border-slate-200 flex justify-between items-center">
                    <span className="font-black text-slate-700">Total Bulk Payout:</span>
                    <span className="text-base font-black text-emerald-800 font-mono">
                      ₹{assistantUsers
                        .filter(u => {
                          const isPaid = processedSalaries.some(p => p.employeeMobile === u.mobileNumber && p.monthYear === salaryMonth);
                          const isLocked = u.salaryLocked;
                          return !isPaid && !isLocked && selectedSalaryMobiles.includes(u.mobileNumber);
                        })
                        .reduce((sum, u) => sum + (u.salaryAmount || 25000), 0)
                        .toLocaleString()}
                    </span>
                  </div>
                </div>
              )}

              {/* Form fields */}
              <div className="space-y-3 pt-1">
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="block text-[9px] font-bold text-slate-400 uppercase tracking-wider">
                      Salary Cycle Month
                    </label>
                    <select
                      value={salaryMonth}
                      onChange={(e) => setSalaryMonth(e.target.value)}
                      className="w-full p-2 border border-slate-200 rounded-lg text-xs bg-slate-50 font-bold focus:outline-none"
                    >
                      <option value="June 2026">June 2026</option>
                      <option value="May 2026">May 2026</option>
                      <option value="April 2026">April 2026</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="block text-[9px] font-bold text-slate-400 uppercase tracking-wider">
                      Payment Disbursal Mode
                    </label>
                    <select
                      value={salaryPaymentMode}
                      onChange={(e: any) => setSalaryPaymentMode(e.target.value)}
                      className="w-full p-2 border border-slate-200 rounded-lg text-xs bg-slate-50 font-bold focus:outline-none"
                    >
                      <option value="Bank Transfer">Bank Transfer (NEFT)</option>
                      <option value="UPI">UPI Digital Payout</option>
                      <option value="Cash">Cash Handout</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="block text-[9px] font-bold text-slate-400 uppercase tracking-wider">
                    UTR / Bank Transaction Code Reference
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. UTR3091283120"
                    value={salaryTxnRef}
                    onChange={(e) => setSalaryTxnRef(e.target.value)}
                    className="w-full p-2 border border-slate-200 rounded-lg text-xs bg-white font-mono text-slate-850 font-bold focus:ring-1 focus:ring-brand-500 outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="block text-[9px] font-bold text-slate-400 uppercase tracking-wider">
                    Audit Remarks / Notes
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. June month salary processed & cleared"
                    value={salaryNotes}
                    onChange={(e) => setSalaryNotes(e.target.value)}
                    className="w-full p-2 border border-slate-200 rounded-lg text-xs bg-white text-slate-850 font-semibold focus:ring-1 focus:ring-brand-500 outline-none"
                  />
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="bg-slate-50 border-t border-slate-150 px-5 py-3.5 flex justify-end gap-2 shrink-0">
              <button
                type="button"
                onClick={() => {
                  setShowSalaryModal(false);
                  setSelectedStaffForSalary(null);
                }}
                className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold rounded-xl transition text-[10.5px]"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleProcessSalaryConfirm}
                className="px-5 py-2 bg-brand-800 hover:bg-brand-900 text-white font-extrabold rounded-xl transition text-[10.5px] shadow-sm flex items-center gap-1.5"
              >
                <CheckCircle2 size={13} />
                Authorize &amp; Disburse
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 2. Farmer Final Settlement Modal */}
      {showFarmerPaymentModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-[2px] flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
          <div className="bg-white w-full max-w-lg rounded-2xl border border-slate-200 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            {/* Modal Header */}
            <div className="bg-brand-800 text-white px-5 py-4 flex justify-between items-center shrink-0">
              <div className="flex items-center gap-2">
                <Landmark size={18} className="text-emerald-300" />
                <div>
                  <span className="text-[9px] uppercase tracking-wider font-extrabold text-white/70 block">Yield Clearing Desk</span>
                  <h3 className="text-sm font-bold">Process Crop Final Settlement</h3>
                </div>
              </div>
              <button
                onClick={() => {
                  setShowFarmerPaymentModal(false);
                  setSelectedFarmerFinalPayment(null);
                }}
                className="text-white/80 hover:text-white bg-white/10 hover:bg-white/20 p-1.5 rounded-lg transition"
              >
                <X size={16} />
              </button>
            </div>

            {/* Modal Content */}
            <div className="overflow-y-auto p-5 space-y-4 text-xs text-left">
              {selectedFarmerFinalPayment ? (
                /* Individual Settlement Sheet */
                <div className="space-y-3">
                  <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div>
                      <span className="text-[9px] text-slate-400 uppercase font-black block">Farmer Name</span>
                      <span className="text-xs font-black text-slate-900">{selectedFarmerFinalPayment.farmerName}</span>
                      <span className="block text-[9.5px] text-slate-400 uppercase font-semibold mt-0.5">📍 Route: {selectedFarmerFinalPayment.villageName}</span>
                    </div>
                    <div className="text-right">
                      <span className="text-[9px] text-slate-400 uppercase font-black block">Total Yield Volume</span>
                      <span className="text-xs font-black text-brand-900">{selectedFarmerFinalPayment.bagCount} Bags</span>
                      <span className="block text-[10.5px] font-mono font-bold text-slate-700 mt-0.5">{selectedFarmerFinalPayment.weightKg.toLocaleString()} KG Gross</span>
                    </div>
                  </div>

                  {/* Calculated Matrix */}
                  <div className="border border-slate-200 rounded-xl overflow-hidden">
                    <div className="bg-slate-50 px-4 py-2 border-b border-slate-150 font-bold text-slate-500 uppercase tracking-wider text-[9.5px]">
                      Itemized Settlement Matrix
                    </div>
                    <div className="p-4 space-y-3">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1">
                          <label className="block text-[9px] font-bold text-slate-400 uppercase tracking-wider">
                            Settlement Price/KG (₹)
                          </label>
                          <input
                            type="number"
                            value={farmerPaymentPricePerKg}
                            onChange={(e) => setFarmerPaymentPricePerKg(e.target.value)}
                            className="w-full p-2 border border-slate-200 rounded-lg text-xs bg-white font-bold font-mono text-slate-800"
                          />
                        </div>
                        <div>
                          <span className="text-[9px] text-slate-400 uppercase font-bold block pt-1">Gross Yield Total</span>
                          <span className="text-sm font-black text-slate-900 font-mono block pt-1">
                            ₹{(selectedFarmerFinalPayment.weightKg * (Number(farmerPaymentPricePerKg) || 0)).toLocaleString()}
                          </span>
                        </div>
                      </div>

                      <hr className="border-slate-150" />

                      <div className="text-[9.5px] font-extrabold text-slate-400 uppercase tracking-wide">Deductions Worksheet</div>
                      
                      <div className="grid grid-cols-3 gap-3">
                        <div className="space-y-1">
                          <label className="block text-[8.5px] font-bold text-slate-400 uppercase">
                            Advance Paid (₹)
                          </label>
                          <input
                            type="number"
                            value={farmerPaymentAdvance}
                            onChange={(e) => setFarmerPaymentAdvance(e.target.value)}
                            className="w-full p-1.5 border border-slate-200 rounded-lg text-xs font-mono font-bold"
                          />
                        </div>

                        <div className="space-y-1">
                          <label className="block text-[8.5px] font-bold text-slate-400 uppercase">
                            Interest (₹)
                          </label>
                          <input
                            type="number"
                            value={farmerPaymentInterest}
                            onChange={(e) => setFarmerPaymentInterest(e.target.value)}
                            className="w-full p-1.5 border border-slate-200 rounded-lg text-xs font-mono font-bold"
                          />
                        </div>

                        <div className="space-y-1">
                          <label className="block text-[8.5px] font-bold text-slate-400 uppercase">
                            Pesticide Debits (₹)
                          </label>
                          <input
                            type="number"
                            value={farmerPaymentPesticide}
                            onChange={(e) => setFarmerPaymentPesticide(e.target.value)}
                            className="w-full p-1.5 border border-slate-200 rounded-lg text-xs font-mono font-bold"
                          />
                        </div>
                      </div>

                      <div className="p-3 bg-slate-50 border border-slate-150 rounded-xl grid grid-cols-2 gap-4 text-[10.5px]">
                        <div>
                          <span className="font-extrabold block text-slate-500 text-[8.5px] uppercase">Loading @400/Ton:</span>
                          <span className="font-bold text-slate-800 font-mono">
                            ₹{Math.round((selectedFarmerFinalPayment.weightKg / 1000) * 400).toLocaleString()}
                          </span>
                        </div>
                        <div className="text-right">
                          <span className="font-extrabold block text-slate-500 text-[8.5px] uppercase">Total Deductions:</span>
                          <span className="font-black text-rose-700 font-mono">
                            ₹{(
                              (Number(farmerPaymentAdvance) || 0) + 
                              (Number(farmerPaymentInterest) || 0) + 
                              (Number(farmerPaymentPesticide) || 0) + 
                              Math.round((selectedFarmerFinalPayment.weightKg / 1000) * 400)
                            ).toLocaleString()}
                          </span>
                        </div>
                      </div>

                      {/* Net Payable Highlight */}
                      <div className="p-3.5 bg-emerald-50 rounded-xl border border-emerald-200 flex justify-between items-center">
                        <span className="text-[10.5px] font-black text-emerald-900 uppercase">Net Payable Payout:</span>
                        <span className="text-base font-black text-emerald-850 font-mono">
                          ₹{(
                            (selectedFarmerFinalPayment.weightKg * (Number(farmerPaymentPricePerKg) || 0)) - 
                            ((Number(farmerPaymentAdvance) || 0) + 
                             (Number(farmerPaymentInterest) || 0) + 
                             (Number(farmerPaymentPesticide) || 0) + 
                             Math.round((selectedFarmerFinalPayment.weightKg / 1000) * 400))
                          ).toLocaleString()}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Bank Details check */}
                  <div className="p-3 bg-slate-50 border border-slate-150 rounded-xl text-[10.5px]">
                    <span className="text-[8.5px] text-slate-400 font-extrabold uppercase block tracking-wider">Settlement Destination Account</span>
                    <div className="flex justify-between items-center mt-1">
                      <div>
                        <span className="font-extrabold text-slate-800">Acc: {selectedFarmerFinalPayment.accountNumber}</span>
                        <span className="block text-[9.5px] text-slate-400 font-mono">IFSC: {selectedFarmerFinalPayment.ifscCode}</span>
                      </div>
                      <span className="text-[9px] font-black bg-emerald-50 text-emerald-700 border border-emerald-200 rounded px-1.5 py-0.2 uppercase">✓ KYC VERIFIED</span>
                    </div>
                  </div>
                </div>
              ) : (
                /* Bulk Settlement */
                <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
                  <span className="text-[9px] text-slate-400 uppercase font-black tracking-wider block">Bulk Payments Sheet</span>
                  <div className="max-h-36 overflow-y-auto divide-y divide-slate-150">
                    {farmerFinalPayments
                      .filter(p => p.status !== "Paid" && selectedFarmerFinalPaymentIds.includes(p.id))
                      .map(p => {
                        const gross = p.weightKg * p.pricePerKg;
                        const loading = Math.round((p.weightKg / 1000) * 400);
                        const deductions = p.advanceAmount + p.interest + p.pesticideDues + loading;
                        const net = Math.round(gross - deductions);

                        return (
                          <div key={p.id} className="py-2 flex justify-between items-center text-[10.5px]">
                            <div>
                              <span className="font-extrabold text-slate-900">{p.farmerName}</span>
                              <span className="text-[9.5px] text-slate-400 block uppercase">📍 Route: {p.villageName} | {p.weightKg.toLocaleString()} KG</span>
                            </div>
                              <span className="font-black text-slate-850 font-mono">₹{net.toLocaleString()}</span>
                          </div>
                        );
                      })}
                  </div>
                  <div className="pt-2 border-t border-slate-200 flex justify-between items-center">
                    <span className="font-black text-slate-700">Total Bulk Settlement:</span>
                    <span className="text-base font-black text-emerald-800 font-mono">
                      ₹{farmerFinalPayments
                        .filter(p => p.status !== "Paid" && selectedFarmerFinalPaymentIds.includes(p.id))
                        .reduce((sum, p) => {
                          const gross = p.weightKg * p.pricePerKg;
                          const loading = Math.round((p.weightKg / 1000) * 400);
                          const deductions = p.advanceAmount + p.interest + p.pesticideDues + loading;
                          return sum + Math.round(gross - deductions);
                        }, 0)
                        .toLocaleString()}
                    </span>
                  </div>
                </div>
              )}

              {/* Common Inputs */}
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="block text-[9px] font-bold text-slate-400 uppercase tracking-wider">
                      Settlement Disbursal Account
                    </label>
                    <select
                      value={farmerTransferBy}
                      onChange={(e) => setFarmerTransferBy(e.target.value)}
                      className="w-full p-2 border border-slate-200 rounded-lg text-xs bg-slate-50 font-bold focus:outline-none"
                    >
                      <option value="NRA PNB CURRENT">NRA PNB CURRENT (MAIN)</option>
                      <option value="GSC AXIS CURRENTT">GSC AXIS CURRENTT (SUB)</option>
                      <option value="SBI INDUSTRIAL ESCROW">SBI INDUSTRIAL ESCROW</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="block text-[9px] font-bold text-slate-400 uppercase tracking-wider">
                      Settlement Remarks / Stamp
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. FINAL SETTLEMENT CLEARING"
                      value={farmerPaymentRemarks}
                      onChange={(e) => setFarmerPaymentRemarks(e.target.value)}
                      className="w-full p-2 border border-slate-200 rounded-lg text-xs bg-white text-slate-850 font-bold focus:ring-1 focus:ring-brand-500 outline-none"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="bg-slate-50 border-t border-slate-150 px-5 py-3.5 flex justify-end gap-2 shrink-0">
              <button
                type="button"
                onClick={() => {
                  setShowFarmerPaymentModal(false);
                  setSelectedFarmerFinalPayment(null);
                }}
                className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold rounded-xl transition text-[10.5px]"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleProcessFarmerPaymentConfirm}
                className="px-5 py-2 bg-brand-800 hover:bg-brand-900 text-white font-extrabold rounded-xl transition text-[10.5px] shadow-sm flex items-center gap-1.5"
              >
                <CheckCircle2 size={13} />
                Approve &amp; Clear Settlement
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 4. Receipt Visualizer Modal */}
      {receiptModalOpen && receiptData && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-[2px] flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
          <div className="bg-white w-full max-w-lg rounded-2xl border border-slate-200 shadow-2xl overflow-hidden flex flex-col max-h-[95vh] print:max-h-full print:shadow-none print:border-none print:fixed print:inset-0 print:bg-white print:z-50 print:p-8">
            {/* Modal Header */}
            <div className="bg-brand-800 text-white px-5 py-4 flex justify-between items-center shrink-0 print:hidden">
              <div className="flex items-center gap-2">
                <FileText size={18} className="text-emerald-300" />
                <div>
                  <span className="text-[9px] uppercase tracking-wider font-extrabold text-white/70 block">Digital Receipt Desk</span>
                  <h3 className="text-sm font-bold">Transaction Disbursal Voucher</h3>
                </div>
              </div>
              <button
                onClick={() => {
                  setReceiptModalOpen(false);
                  setReceiptData(null);
                }}
                className="text-white/80 hover:text-white bg-white/10 hover:bg-white/20 p-1.5 rounded-lg transition"
              >
                <X size={16} />
              </button>
            </div>

            {/* Modal Content - Styled like an Official Voucher */}
            <div id="print-receipt-area" className="overflow-y-auto p-8 space-y-6 text-xs text-left bg-stone-50 font-sans print:overflow-visible print:bg-white print:p-0">
              {/* Official Letterhead Header */}
              <div className="text-center border-b-2 border-slate-200 pb-5 relative">
                <div className="absolute right-0 top-0 border-2 border-emerald-500 text-emerald-600 font-black text-[9px] tracking-widest uppercase rounded px-2 py-1 rotate-12 print:rotate-0">
                  ✓ PAID &amp; SETTLED
                </div>
                <h1 className="text-base font-black text-slate-900 tracking-wide">NEELADRI RICE ASSOCIATES</h1>
                <p className="text-[9.5px] text-slate-500 font-medium">Licensed Crop Wholesalers &amp; Paddy Processing Industry</p>
                <p className="text-[9px] text-slate-400 font-mono mt-0.5">Regd No: AP/NRA/2024-89 • East Godavari District, AP</p>
                <span className="inline-block mt-3 bg-slate-900 text-white font-extrabold text-[8px] uppercase tracking-widest px-3 py-1 rounded">
                  OFFICIAL DISBURSAL ADVICE
                </span>
              </div>

              {/* Core Details */}
              <div className="grid grid-cols-2 gap-y-3 text-slate-700 leading-relaxed">
                <div>
                  <span className="text-[9px] text-slate-400 uppercase font-bold block">Voucher Reference</span>
                  <span className="font-mono font-black text-slate-900 text-xs">
                    {receiptData.type === "salary" 
                      ? `SAL-${receiptData.data?.employeeMobile?.slice(-4)}-${receiptData.data?.monthYear?.replace(/\s+/g, "").toUpperCase()}`
                      : `FFP-SETTLE-${receiptData.data?.id?.replace("FFP-", "")}`}
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-[9px] text-slate-400 uppercase font-bold block">Disbursal Date</span>
                  <span className="font-mono font-bold text-slate-900">
                    {receiptData.type === "salary" ? receiptData.data?.datePaid : receiptData.data?.datePaid}
                  </span>
                </div>

                <div>
                  <span className="text-[9px] text-slate-400 uppercase font-bold block">Beneficiary Name</span>
                  <span className="font-black text-slate-900 text-sm">
                    {receiptData.type === "salary" ? receiptData.employee?.name : receiptData.data?.farmerName}
                  </span>
                  <span className="block text-[10px] text-slate-500 font-mono">
                    Mob: {receiptData.type === "salary" ? receiptData.employee?.mobileNumber : receiptData.data?.id}
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-[9px] text-slate-400 uppercase font-bold block">Disbursal Mode</span>
                  <span className="font-black text-brand-900">
                    {receiptData.type === "salary" ? receiptData.data?.paymentMode : "Direct Bank Transfer"}
                  </span>
                  <span className="block text-[9.5px] text-slate-500 font-mono">
                    via {receiptData.type === "salary" ? "NRA CURRENT (MAIN)" : receiptData.data?.transferBy}
                  </span>
                </div>
              </div>

              <div className="border-t border-dashed border-slate-300 my-4"></div>

              {/* Specific Itemized Table */}
              {receiptData.type === "salary" ? (
                /* Salary Details */
                <div className="space-y-3 bg-white p-4 border border-slate-200 rounded-xl">
                  <div className="flex justify-between text-slate-600">
                    <span>Designation:</span>
                    <span className="font-bold text-slate-800">{receiptData.employee?.designation || "Village Assistant"}</span>
                  </div>
                  <div className="flex justify-between text-slate-600">
                    <span>Payroll Period:</span>
                    <span className="font-bold text-slate-800">{receiptData.data?.monthYear}</span>
                  </div>
                  <div className="flex justify-between text-slate-600">
                    <span>Gross Base Salary Scale:</span>
                    <span className="font-bold text-slate-800 font-mono">₹{(receiptData.employee?.salaryAmount || 25000).toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-slate-600 pt-2 border-t border-slate-100">
                    <span>Total Allowances:</span>
                    <span className="font-bold text-slate-800 font-mono">₹0</span>
                  </div>
                  <div className="flex justify-between text-slate-600">
                    <span>Tax &amp; EPF Deductions:</span>
                    <span className="font-bold text-slate-800 font-mono">₹0</span>
                  </div>
                </div>
              ) : (
                /* Farmer Crop Settlement Worksheet */
                <div className="space-y-3">
                  <div className="bg-white p-4 border border-slate-200 rounded-xl space-y-2">
                    <div className="text-[10px] font-black text-slate-800 uppercase tracking-wide border-b border-slate-100 pb-1.5">
                      Yield Log Assessment
                    </div>
                    <div className="grid grid-cols-2 gap-x-4 gap-y-1.5 text-slate-600">
                      <div>Cultivated Area:</div>
                      <div className="text-right font-bold text-slate-800">{receiptData.data?.acres} Acres</div>
                      <div>Yield Weight (KG Gross):</div>
                      <div className="text-right font-bold text-slate-800 font-mono">{receiptData.data?.weightKg?.toLocaleString()} KG</div>
                      <div>Crop Packaging Count:</div>
                      <div className="text-right font-bold text-slate-800 font-mono">{receiptData.data?.bagCount} Bags</div>
                      <div>Computed Settlement Price:</div>
                      <div className="text-right font-black text-brand-800 font-mono">₹{receiptData.data?.pricePerKg}/KG</div>
                      <div className="pt-1.5 border-t border-slate-100 font-bold text-slate-700">Gross Settlement:</div>
                      <div className="pt-1.5 border-t border-slate-100 text-right font-black text-slate-950 font-mono">
                        ₹{(receiptData.data?.weightKg * receiptData.data?.pricePerKg).toLocaleString()}
                      </div>
                    </div>
                  </div>

                  <div className="bg-rose-50/50 p-4 border border-rose-100 rounded-xl space-y-2">
                    <div className="text-[10px] font-black text-rose-800 uppercase tracking-wide border-b border-rose-100 pb-1.5">
                      Deductions Worksheet
                    </div>
                    <div className="grid grid-cols-2 gap-x-4 gap-y-1.5 text-slate-600">
                      <div>Paddy Advance Loan Recovered:</div>
                      <div className="text-right font-bold text-rose-800 font-mono">₹{receiptData.data?.advanceAmount?.toLocaleString()}</div>
                      <div>Accrued Loan Interest:</div>
                      <div className="text-right font-bold text-rose-800 font-mono">₹{receiptData.data?.interest?.toLocaleString()}</div>
                      <div>Pesticide Debit Ledger dues:</div>
                      <div className="text-right font-bold text-rose-800 font-mono">₹{receiptData.data?.pesticideDues?.toLocaleString()}</div>
                      <div>Loading Charges (@400/Ton):</div>
                      <div className="text-right font-bold text-rose-800 font-mono">₹{Math.round((receiptData.data?.weightKg / 1000) * 400).toLocaleString()}</div>
                      <div className="pt-1.5 border-t border-rose-200 font-bold text-rose-900">Total Deductions Subtract:</div>
                      <div className="pt-1.5 border-t border-rose-200 text-right font-black text-rose-900 font-mono">
                        ₹{(
                          receiptData.data?.advanceAmount + 
                          receiptData.data?.interest + 
                          receiptData.data?.pesticideDues + 
                          Math.round((receiptData.data?.weightKg / 1000) * 400)
                        ).toLocaleString()}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Net Payout Prominent Highlight */}
              <div className="bg-emerald-50 border-2 border-emerald-200 p-4 rounded-xl flex justify-between items-center relative">
                <div>
                  <span className="text-[8.5px] text-emerald-800 font-black uppercase tracking-wider block">Total Net Amount Transferred</span>
                  <span className="text-[9.5px] text-slate-400 font-mono">Account No: {receiptData.type === "salary" ? (receiptData.employee?.accountNumber || "38392102192") : receiptData.data?.accountNumber}</span>
                </div>
                <div className="text-right">
                  <span className="text-lg font-black text-emerald-900 font-mono">
                    ₹{(() => {
                      if (receiptData.type === "salary") {
                        return (receiptData.employee?.salaryAmount || 25000).toLocaleString();
                      } else {
                        const gross = receiptData.data?.weightKg * receiptData.data?.pricePerKg;
                        const loading = Math.round((receiptData.data?.weightKg / 1000) * 400);
                        const deductions = receiptData.data?.advanceAmount + receiptData.data?.interest + receiptData.data?.pesticideDues + loading;
                        return Math.round(gross - deductions).toLocaleString();
                      }
                    })()}
                  </span>
                  <span className="block text-[8px] text-emerald-700 font-bold uppercase tracking-wider">KYC Disbursed OK</span>
                </div>
              </div>

              {/* Audit Verification Stamp and Signatures */}
              <div className="pt-5 border-t border-slate-200 flex justify-between items-center text-[9px] text-slate-400">
                <div>
                  <span className="block font-bold">System Generated ERP Voucher</span>
                  <span>IP Address Logged • Non-repudiation Guaranteed</span>
                  <span className="block font-mono mt-0.5 text-[8.5px]">Timestamp: {new Date().toLocaleString()}</span>
                </div>
                <div className="text-right">
                  <div className="w-24 border-b border-slate-400 h-8 mb-1"></div>
                  <span className="font-extrabold uppercase text-slate-500">Authorized Signatory</span>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="bg-slate-50 border-t border-slate-150 px-5 py-3.5 flex justify-end gap-2 shrink-0 print:hidden">
              <button
                type="button"
                onClick={() => {
                  setReceiptModalOpen(false);
                  setReceiptData(null);
                }}
                className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold rounded-xl transition text-[10.5px] cursor-pointer"
              >
                Close Advice
              </button>
              <button
                type="button"
                onClick={() => {
                  window.print();
                }}
                className="px-5 py-2 bg-slate-900 hover:bg-slate-800 text-white font-extrabold rounded-xl transition text-[10.5px] shadow-sm flex items-center gap-1.5 cursor-pointer"
              >
                <Printer size={13} />
                Print Voucher
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 3. Enroll New Settlement Claim Modal */}
      {showAddFarmerPaymentModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-[2px] flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
          <div className="bg-white w-full max-w-md rounded-2xl border border-slate-200 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            {/* Modal Header */}
            <div className="bg-brand-800 text-white px-5 py-4 flex justify-between items-center shrink-0">
              <div className="flex items-center gap-2">
                <PlusCircle size={18} className="text-emerald-300" />
                <div>
                  <span className="text-[9px] uppercase tracking-wider font-extrabold text-white/70 block">Settlement Register</span>
                  <h3 className="text-sm font-bold">Enroll New Crop Claim Row</h3>
                </div>
              </div>
              <button
                onClick={() => setShowAddFarmerPaymentModal(false)}
                className="text-white/80 hover:text-white bg-white/10 hover:bg-white/20 p-1.5 rounded-lg transition"
              >
                <X size={16} />
              </button>
            </div>

            {/* Modal Content */}
            <div className="overflow-y-auto p-5 space-y-4 text-xs text-left">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1 col-span-2">
                  <label className="block text-[9px] font-bold text-slate-400 uppercase tracking-wider">
                    Farmer Full Name
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. KOPPULA CHITTI BABU"
                    value={newFarmerName}
                    onChange={(e) => setNewFarmerName(e.target.value)}
                    className="w-full p-2 border border-slate-200 rounded-lg text-xs focus:ring-1 focus:ring-brand-500 outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="block text-[9px] font-bold text-slate-400 uppercase tracking-wider">
                    Village Route
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. IG PETA"
                    value={newFarmerVillage}
                    onChange={(e) => setNewFarmerVillage(e.target.value)}
                    className="w-full p-2 border border-slate-200 rounded-lg text-xs focus:ring-1 focus:ring-brand-500 outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="block text-[9px] font-bold text-slate-400 uppercase tracking-wider">
                    Cultivated Acres
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    placeholder="e.g. 2.5"
                    value={newFarmerAcres}
                    onChange={(e) => setNewFarmerAcres(e.target.value)}
                    className="w-full p-2 border border-slate-200 rounded-lg text-xs focus:ring-1 focus:ring-brand-500 outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="block text-[9px] font-bold text-slate-400 uppercase tracking-wider">
                    Number of Bags
                  </label>
                  <input
                    type="number"
                    placeholder="e.g. 150"
                    value={newFarmerBags}
                    onChange={(e) => setNewFarmerBags(e.target.value)}
                    className="w-full p-2 border border-slate-200 rounded-lg text-xs focus:ring-1 focus:ring-brand-500 outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="block text-[9px] font-bold text-slate-400 uppercase tracking-wider">
                    Total Weight (KG)
                    </label>
                  <input
                    type="number"
                    placeholder="e.g. 6800"
                    value={newFarmerWeight}
                    onChange={(e) => setNewFarmerWeight(e.target.value)}
                    className="w-full p-2 border border-slate-200 rounded-lg text-xs focus:ring-1 focus:ring-brand-500 outline-none"
                  />
                </div>

                <div className="space-y-1 col-span-2">
                  <label className="block text-[9px] font-bold text-slate-400 uppercase tracking-wider">
                    Bank Destination Account Number
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. 39010526512"
                    value={newFarmerAccount}
                    onChange={(e) => setNewFarmerAccount(e.target.value)}
                    className="w-full p-2 border border-slate-200 rounded-lg text-xs font-mono focus:ring-1 focus:ring-brand-500 outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="block text-[9px] font-bold text-slate-400 uppercase tracking-wider">
                    Bank IFSC Code
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. SBIN0015366"
                    value={newFarmerIfsc}
                    onChange={(e) => setNewFarmerIfsc(e.target.value)}
                    className="w-full p-2 border border-slate-200 rounded-lg text-xs font-mono focus:ring-1 focus:ring-brand-500 outline-none"
                  />
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="bg-slate-50 border-t border-slate-150 px-5 py-3.5 flex justify-end gap-2 shrink-0">
              <button
                type="button"
                onClick={() => setShowAddFarmerPaymentModal(false)}
                className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold rounded-xl transition text-[10.5px]"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleAddNewFarmerRow}
                className="px-5 py-2 bg-brand-800 hover:bg-brand-900 text-white font-extrabold rounded-xl transition text-[10.5px] shadow-sm flex items-center gap-1.5"
              >
                <PlusCircle size={13} />
                Add Row Entry
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
