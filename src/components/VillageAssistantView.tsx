/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { DispatchRecord, FarmerDistribution, VillageStockStatus, TimelineEvent, ModificationRequest, PaymentRequest, AssistantUser, FertilizerOrderRequest, PaymentStatus, FarmerChangeRequest, AdvanceChangeRequest } from "../types";
import { DEMO_FERTILIZERS } from "../data";
import { 
  Users, 
  ClipboardList, 
  PlusCircle, 
  CheckSquare, 
  Search, 
  Phone, 
  IndianRupee, 
  MapPin, 
  Tag, 
  CheckCircle2, 
  Clock, 
  Edit3, 
  AlertTriangle, 
  ArrowRight, 
  Lock, 
  Check, 
  X, 
  Receipt, 
  Smartphone, 
  Printer, 
  FileText, 
  Coins, 
  Wifi,
  Calendar,
  MessageSquare,
  ShieldCheck,
  RefreshCw,
  Send,
  Plus,
  Circle,
  ShoppingBag,
  Landmark,
  ArrowUpRight,
  Share,
  Download,
  Upload,
  UserX,
  Trash2,
  Camera,
  Compass,
  Eye,
  Map,
  FileCheck
} from "lucide-react";

export interface EnrolledFarmer {
  id: string;
  farmerName: string;
  mobileNumber: string;
  villageName: string;
  acres: number;
  bankName: string;
  accountNumber: string;
  ifscCode: string;
  aadhaarNumber: string;
  seedVariety: string;
  seedUnits: number;
  dateEnrolled: string;
  cropType?: string;
  year?: string;
  plantationCompany?: string;
  fields?: string;
}

export interface HarvestCollection {
  id: string;
  farmerId: string;
  farmerName: string;
  mobileNumber: string;
  villageName: string;
  cropName: string;
  weightKg: number;
  ratePerKg: number;
  totalAmount: number;
  dateCollected: string;
  cropType?: string;
  year?: string;
  plantationCompany?: string;
  fields?: string;
}

interface VillageAssistantViewProps {
  dispatches: DispatchRecord[];
  farmerDistributions: FarmerDistribution[];
  villageStocks: VillageStockStatus[];
  timelineEvents: TimelineEvent[];
  modificationRequests: ModificationRequest[];
  paymentRequests: PaymentRequest[];
  loggedInAssistant?: AssistantUser | null;
  fertilizerRequests: FertilizerOrderRequest[];
  onCreateFertilizerRequest: (req: Omit<FertilizerOrderRequest, "id" | "status" | "dateRequested">) => void;
  onAcknowledgeDispatch: (dispatchId: string, acknowledgedBy?: string) => void;
  onAddDistribution: (distribution: Omit<FarmerDistribution, "id" | "date"> | Omit<FarmerDistribution, "id" | "date">[]) => void;
  onSubmitPaymentRequest: (distributionId: string, amount: number, mode: "Cash" | "Online", notes: string) => void;
  onSubmitModificationRequest: (newRequest: Omit<ModificationRequest, "id" | "status" | "dateRequested">) => void;
  onLogout: () => void;
  fertilizerRates?: Record<string, number>;
  cropSourcingRates?: Record<string, number>;
  globalYear: string;
  onYearChange?: (year: string) => void;
  farmerChangeRequests?: FarmerChangeRequest[];
  onSubmitFarmerChangeRequest?: (req: Omit<FarmerChangeRequest, "id" | "status" | "dateRequested">) => void;
  advanceChangeRequests?: AdvanceChangeRequest[];
  onSubmitAdvanceChangeRequest?: (req: Omit<AdvanceChangeRequest, "id" | "status" | "dateRequested">) => void;
  academicYears?: string[];
}

export const VillageAssistantView: React.FC<VillageAssistantViewProps> = ({
  dispatches,
  farmerDistributions,
  villageStocks,
  timelineEvents,
  modificationRequests,
  paymentRequests,
  loggedInAssistant,
  fertilizerRequests,
  onCreateFertilizerRequest,
  onAcknowledgeDispatch,
  onAddDistribution,
  onSubmitPaymentRequest,
  onSubmitModificationRequest,
  onLogout,
  fertilizerRates,
  cropSourcingRates,
  globalYear,
  onYearChange,
  farmerChangeRequests = [],
  onSubmitFarmerChangeRequest,
  advanceChangeRequests = [],
  onSubmitAdvanceChangeRequest,
  academicYears = ["2026", "2025", "2024"],
}) => {
  // Use loggedInAssistant if provided, otherwise fallback to Rampur lead Ramesh Kumar
  const currentAssistantName = loggedInAssistant ? loggedInAssistant.name : "Ramesh Kumar";
  const currentAssistantVillage = loggedInAssistant ? loggedInAssistant.villageName : "Rampur";

  const [activeTab, setActiveTab] = useState<"dashboard" | "requests" | "enrollment" | "issue" | "farmers" | "harvest" | "verification">("dashboard");

  // Field verifications state with pre-seeded demo records for the current village
  const [fieldVerifications, setFieldVerifications] = useState<any[]>(() => {
    const saved = localStorage.getItem("ks_field_verifications");
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error("Error parsing field verifications", e);
      }
    }
    const initial: any[] = [];
    localStorage.setItem("ks_field_verifications", JSON.stringify(initial));
    return initial;
  });

  const updateFieldVerifications = (updatedList: any[]) => {
    setFieldVerifications(updatedList);
    localStorage.setItem("ks_field_verifications", JSON.stringify(updatedList));
  };

  // Field Verification Form States
  const [showVerificationForm, setShowVerificationForm] = useState(false);
  const [inspectingFarmer, setInspectingFarmer] = useState<any>(null);
  const [verifiedAcres, setVerifiedAcres] = useState<number>(0);
  const [gpsCoords, setGpsCoords] = useState<{ lat: number; lng: number; accuracy: number } | null>(null);
  const [gpsLoading, setGpsLoading] = useState(false);
  const [selectedPhoto, setSelectedPhoto] = useState<string>("https://images.unsplash.com/photo-1551893086-c02450bd01d6?w=400&auto=format&fit=crop&q=60");
  const [selectedPhotoLabel, setSelectedPhotoLabel] = useState<string>("Healthy Maize Crop - Tassel Stage");
  const [cameraLoading, setCameraLoading] = useState(false);
  const [inspectionComments, setInspectionComments] = useState<string>("");
  const [verificationSuccessAlert, setVerificationSuccessAlert] = useState<string | null>(null);
  const [selectedProductDetails, setSelectedProductDetails] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [rosterFilter, setRosterFilter] = useState<"all" | "not_audited" | "pending" | "passed" | "rejected">("all");
  const [enrollSearch, setEnrollSearch] = useState("");
  const [showEnrollForm, setShowEnrollForm] = useState(false);
  const [distSearch, setDistSearch] = useState("");
  const [harvestSearch, setHarvestSearch] = useState("");
  const [expandedFarmerId, setExpandedFarmerId] = useState<string | null>(null);

  // Enrolled Farmers list state with pre-seeded demo farmers in current village
  const [enrolledFarmers, setEnrolledFarmers] = useState<EnrolledFarmer[]>(() => {
    const saved = localStorage.getItem("enrolled_farmers");
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error("Error parsing enrolled farmers", e);
      }
    }
    const initial: EnrolledFarmer[] = [];
    localStorage.setItem("enrolled_farmers", JSON.stringify(initial));
    return initial;
  });

  // Harvest collections state
  const [harvestCollections, setHarvestCollections] = useState<HarvestCollection[]>(() => {
    const saved = localStorage.getItem("harvest_collections");
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error("Error parsing harvest collections", e);
      }
    }
    return [];
  });

  // Form states
  const [selectedEnrolledFarmerId, setSelectedEnrolledFarmerId] = useState<string>("");
  const [farmerName, setFarmerName] = useState("");
  const [farmerPhone, setFarmerPhone] = useState("");
  const [farmerProduct, setFarmerProduct] = useState(DEMO_FERTILIZERS[0]);
  const [farmerBags, setFarmerBags] = useState<number>(5);
  const [farmerCollected, setFarmerCollected] = useState<number>(0);
  const [farmerRate, setFarmerRate] = useState<number>(300);
  const [issueSuccess, setIssueSuccess] = useState(false);

  // Sensitive correction states
  const [correctionFarmer, setCorrectionFarmer] = useState<EnrolledFarmer | null>(null);
  const [correctionFarmerJustification, setCorrectionFarmerJustification] = useState("");
  const [farmerEditAcres, setFarmerEditAcres] = useState(0);
  const [farmerEditMobile, setFarmerEditMobile] = useState("");
  const [farmerEditAadhaar, setFarmerEditAadhaar] = useState("");
  const [farmerEditSeedUnits, setFarmerEditSeedUnits] = useState(0);
  const [farmerEditBank, setFarmerEditBank] = useState("");
  const [farmerEditAccount, setFarmerEditAccount] = useState("");
  const [farmerEditIfsc, setFarmerEditIfsc] = useState("");

  const [deletingFarmer, setDeletingFarmer] = useState<EnrolledFarmer | null>(null);
  const [deletingFarmerJustification, setDeletingFarmerJustification] = useState("");

  const [correctionAdvance, setCorrectionAdvance] = useState<PaymentRequest | null>(null);
  const [correctionAdvanceJustification, setCorrectionAdvanceJustification] = useState("");
  const [advanceEditAmount, setAdvanceEditAmount] = useState(0);
  const [advanceEditMode, setAdvanceEditMode] = useState<"Cash" | "Online">("Online");
  const [advanceEditNotes, setAdvanceEditNotes] = useState("");

  const [deletingAdvance, setDeletingAdvance] = useState<PaymentRequest | null>(null);
  const [deletingAdvanceJustification, setDeletingAdvanceJustification] = useState("");

  // BULK IMPORT / EXPORT FOR ENROLLED FARMERS
  const handleFarmerImport = (fileContent: string) => {
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

      const newRecords = rows.map((cols, idx) => {
        if (cols.length < 5) return null;
        const [
          name,
          mobile,
          acres,
          aadhaar,
          bankName,
          accountNo,
          ifsc,
          seedVariety,
          seedUnits,
          cropType,
          year,
          mfr,
          fields
        ] = cols;

        if (!name) return null;

        return {
          id: `ENR-${100 + enrolledFarmers.length + idx + 1}`,
          farmerName: name.trim(),
          mobileNumber: mobile ? mobile.trim() : "",
          villageName: currentAssistantVillage,
          acres: parseInt(acres) || 3,
          aadhaarNumber: aadhaar ? aadhaar.trim() : "",
          bankName: bankName ? bankName.trim() : "State Bank of India",
          accountNumber: accountNo ? accountNo.trim() : "",
          ifscCode: ifsc ? ifsc.trim() : "",
          seedVariety: seedVariety ? seedVariety.trim() : "Pioneer Premium Hybrid Maize (3396)",
          seedUnits: parseInt(seedUnits) || 3,
          dateEnrolled: new Date().toISOString().split("T")[0],
          cropType: cropType ? cropType.trim() : "Maize/Corn",
          year: year ? year.trim() : globalYear,
          plantationCompany: mfr ? mfr.trim() : "Syngenta India",
          fields: fields ? fields.trim() : "North Canal Plot 1"
        };
      }).filter(Boolean) as EnrolledFarmer[];

      if (newRecords.length > 0) {
        const updated = [...enrolledFarmers, ...newRecords];
        setEnrolledFarmers(updated);
        localStorage.setItem("enrolled_farmers", JSON.stringify(updated));
        alert(`Successfully enrolled ${newRecords.length} farmers via bulk spreadsheet!`);
      } else {
        alert("No valid records found to import.");
      }
    } catch (e) {
      console.error(e);
      alert("Error parsing CSV format. Please make sure the headers match the template.");
    }
  };

  const downloadFarmerTemplate = () => {
    const csvContent = "Farmer Name,Mobile Number,Plantation Area (Acres),Aadhaar Number,Bank Name,Account Number,IFSC Code,Seed Variety,Seed Units,Crop Type,Sowing Year,Plantation Company,Fields Description\n" +
      "Baldev Ram,9848012345,8,9876-5432-1098,Punjab National Bank,1029384756,PUNB0005678,DKC 9108 Golden Maize Special,8,Maize/Corn,2026,Monsanto India,West Sector B\n" +
      "Harbhajan Singh,9441234567,5,1234-5678-9012,State Bank of India,30512345678,SBIN0001234,Pioneer Premium Hybrid Maize (3396),5,Maize/Corn,2026,Syngenta India,North Canal Plot 1";
    const encodedUri = "data:text/csv;charset=utf-8," + encodeURIComponent(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "farmer_enrollment_template.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const exportFarmers = () => {
    const filtered = enrolledFarmers.filter(f => f.villageName.toLowerCase() === currentAssistantVillage.toLowerCase() && (!f.year || f.year === globalYear));
    const csvContent = "Farmer ID,Farmer Name,Mobile Number,Village Name,Plantation Area (Acres),Aadhaar Number,Bank Name,Account Number,IFSC Code,Seed Variety,Seed Units,Date Enrolled,Crop Type,Sowing Year,Plantation Company,Fields Description\n" +
      filtered.map(f => `"${f.id}","${f.farmerName}","${f.mobileNumber}","${f.villageName}",${f.acres},"${f.aadhaarNumber}","${f.bankName}","${f.accountNumber}","${f.ifscCode}","${f.seedVariety}",${f.seedUnits},"${f.dateEnrolled}","${f.cropType || "Maize/Corn"}","${f.year || "2026"}","${f.plantationCompany || "N/A"}","${f.fields || "N/A"}"`).join("\n");
    const encodedUri = "data:text/csv;charset=utf-8," + encodeURIComponent(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `enrolled_farmers_export_${globalYear}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // BULK IMPORT / EXPORT FOR ADVANCES
  const handleAdvanceImport = (fileContent: string) => {
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
      rows.forEach(cols => {
        if (cols.length < 2) return;
        const [farmerId, amountStr, mode, notes] = cols;
        const amount = parseFloat(amountStr) || 0;
        if (amount <= 0 || !farmerId) return;

        const farmer = enrolledFarmers.find(f => f.id.toLowerCase() === farmerId.trim().toLowerCase());
        if (farmer) {
          const payMode = (mode && mode.trim().toLowerCase() === "cash") ? "Cash" : "Online";
          onSubmitPaymentRequest(
            farmer.id,
            amount,
            payMode,
            notes ? notes.trim() : `Bulk imported advance request for ${farmer.farmerName}`
          );
          count++;
        }
      });

      if (count > 0) {
        alert(`Successfully submitted ${count} advance requests to Accountant review!`);
      } else {
        alert("No matching enrolled farmers found or invalid data. Make sure Farmer IDs exist.");
      }
    } catch (e) {
      console.error(e);
      alert("Error parsing CSV format. Please make sure the headers match the template.");
    }
  };

  const downloadAdvanceTemplate = () => {
    const activeFarmers = enrolledFarmers.filter(f => f.villageName.toLowerCase() === currentAssistantVillage.toLowerCase()).slice(0, 2);
    const f1 = activeFarmers[0]?.id || "ENR-001";
    const f2 = activeFarmers[1]?.id || "ENR-002";
    
    const csvContent = "Farmer ID,Amount Proposed,Disbursement Mode,Remarks/Purpose\n" +
      `${f1},5000,Online,Sowing support cash\n` +
      `${f2},7500,Cash,Land preparation tilling`;
    const encodedUri = "data:text/csv;charset=utf-8," + encodeURIComponent(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "farmer_advances_template.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const exportAdvances = () => {
    const filtered = paymentRequests.filter(pr => pr.villageName.toLowerCase() === currentAssistantVillage.toLowerCase());
    const csvContent = "Request ID,Farmer ID,Farmer Name,Amount Proposed,Disbursement Mode,Status,Date Requested,Remarks/Purpose\n" +
      filtered.map(pr => `"${pr.id}","${pr.distributionId}","${pr.farmerName}",${pr.amountProposed},"${pr.paymentMode}","${pr.status}","${pr.dateRequested}","${pr.notes || ""}"`).join("\n");
    const encodedUri = "data:text/csv;charset=utf-8," + encodeURIComponent(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `farmer_advances_export_${globalYear}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Multi-select fertilizer / pesticide distribution state
  const [distributionItems, setDistributionItems] = useState<{
    productName: string;
    bagCount: number;
    ratePerBag: number;
    totalAmount: number;
  }[]>([]);

  const getProductRate = (prodName: string): number => {
    return (fertilizerRates && fertilizerRates[prodName] !== undefined) ? fertilizerRates[prodName] : 300;
  };

  const addDistributionItem = (prodName: string, count: number, rate: number) => {
    if (!prodName || count <= 0) return;
    const existsIndex = distributionItems.findIndex(item => item.productName === prodName);
    if (existsIndex >= 0) {
      const updated = [...distributionItems];
      updated[existsIndex].bagCount += count;
      updated[existsIndex].totalAmount = updated[existsIndex].bagCount * updated[existsIndex].ratePerBag;
      setDistributionItems(updated);
    } else {
      setDistributionItems([...distributionItems, {
        productName: prodName,
        bagCount: count,
        ratePerBag: rate,
        totalAmount: count * rate
      }]);
    }
  };

  const removeDistributionItem = (index: number) => {
    setDistributionItems(distributionItems.filter((_, i) => i !== index));
  };

  // Sync rate of product automatically as specified by Accountant
  React.useEffect(() => {
    if (fertilizerRates && fertilizerRates[farmerProduct] !== undefined) {
      setFarmerRate(fertilizerRates[farmerProduct]);
    }
  }, [farmerProduct, fertilizerRates]);

  // Synchronize farmer details when an enrolled farmer is selected in distribution
  React.useEffect(() => {
    if (selectedEnrolledFarmerId) {
      const selectedFarmer = enrolledFarmers.find(ef => ef.id === selectedEnrolledFarmerId);
      if (selectedFarmer) {
        setFarmerName(selectedFarmer.farmerName);
        setFarmerPhone(selectedFarmer.mobileNumber);
      }
    } else {
      setFarmerName("");
      setFarmerPhone("");
    }
  }, [selectedEnrolledFarmerId, enrolledFarmers]);

  // Farmer Seed Enrollment form states
  const [enrollName, setEnrollName] = useState("");
  const [enrollMobile, setEnrollMobile] = useState("");
  const [enrollAcres, setEnrollAcres] = useState<number>(3);
  const [enrollAadhaar, setEnrollAadhaar] = useState("");
  const [enrollBankName, setEnrollBankName] = useState("");
  const [enrollAccountNumber, setEnrollAccountNumber] = useState("");
  const [enrollIfsc, setEnrollIfsc] = useState("");
  const [enrollSeedVariety, setEnrollSeedVariety] = useState("Pioneer Premium Hybrid Maize (3396)");
  const [enrollSeedUnits, setEnrollSeedUnits] = useState<number>(3);
  const [enrollCropType, setEnrollCropType] = useState("Maize/Corn");
  const [enrollYear, setEnrollYear] = useState(globalYear || "2026");
  const [enrollPlantationCompany, setEnrollPlantationCompany] = useState("Syngenta India");
  const [enrollFields, setEnrollFields] = useState("North Canal Plot 1");
  const [enrollSuccess, setEnrollSuccess] = useState(false);

  // Dynamic drop down lists syncing with Accountant enrolled data
  const { cropTypes, plantationCompanies } = React.useMemo(() => {
    const crops = new Set<string>();
    const companies = new Set<string>();

    // 1. Extract from cropSourcingRates prop
    if (cropSourcingRates) {
      Object.keys(cropSourcingRates).forEach(key => {
        const parts = key.split("_");
        if (parts.length >= 2) {
          if (parts[0]) crops.add(parts[0]);
          if (parts[1]) companies.add(parts[1]);
        }
      });
    }

    // 2. Extract from local storage seeds registry just in case
    try {
      const cached = localStorage.getItem("ks_seeds_registry_list");
      if (cached) {
        const parsed = JSON.parse(cached);
        if (Array.isArray(parsed)) {
          parsed.forEach((item: any) => {
            if (item.cropName) crops.add(item.cropName);
            if (item.companyName) companies.add(item.companyName);
          });
        }
      }
    } catch (e) {
      console.error("Error loading ks_seeds_registry_list in VillageAssistantView:", e);
    }

    // 3. Fallbacks if sets are empty
    if (crops.size === 0) {
      crops.add("Maize/Corn");
      crops.add("Wheat");
      crops.add("Soybean");
    }
    if (companies.size === 0) {
      companies.add("Syngenta India");
      companies.add("Monsanto India");
      companies.add("Asha Bio-Seeds");
    }

    return {
      cropTypes: Array.from(crops),
      plantationCompanies: Array.from(companies)
    };
  }, [cropSourcingRates]);

  // Sync year fields when globalYear changes
  React.useEffect(() => {
    if (globalYear) {
      setEnrollYear(globalYear);
      setHarvestYear(globalYear);
    }
  }, [globalYear]);

  // Dynamic syncing of selected crop type and plantation company if current choice is not in list
  React.useEffect(() => {
    if (cropTypes.length > 0 && !cropTypes.includes(enrollCropType)) {
      setEnrollCropType(cropTypes[0]);
    }
  }, [cropTypes, enrollCropType]);

  React.useEffect(() => {
    if (plantationCompanies.length > 0 && !plantationCompanies.includes(enrollPlantationCompany)) {
      setEnrollPlantationCompany(plantationCompanies[0]);
    }
  }, [plantationCompanies, enrollPlantationCompany]);

  // Advance request form states
  const [advanceFarmerId, setAdvanceFarmerId] = useState("");
  const [advanceAmount, setAdvanceAmount] = useState<number>(5000);
  const [advanceMode, setAdvanceMode] = useState<"Cash" | "Online">("Online");
  const [advanceNotes, setAdvanceNotes] = useState("");
  const [advanceSuccess, setAdvanceSuccess] = useState(false);

  // Harvest Collection form states
  const [selectedHarvestFarmerId, setSelectedHarvestFarmerId] = useState<string>("");
  const [harvestWeight, setHarvestWeight] = useState<number>(500);
  const [harvestCrop, setHarvestCrop] = useState<string>("Maize/Corn");
  const [harvestYear, setHarvestYear] = useState(globalYear || "2026");
  const [harvestPlantationCompany, setHarvestPlantationCompany] = useState("");
  const [harvestFields, setHarvestFields] = useState("");
  const [cropRatePerKg, setCropRatePerKg] = useState<number>(24.50); // Set by Accountant
  const [harvestSuccess, setHarvestSuccess] = useState(false);
  const [selectedHarvestReceipt, setSelectedHarvestReceipt] = useState<HarvestCollection | null>(null);

  // Auto-populate crop details from farmer enrollment for selected year and farmer on harvest collection page
  React.useEffect(() => {
    if (selectedHarvestFarmerId) {
      const selectedFarmer = enrolledFarmers.find(
        ef => ef.id === selectedHarvestFarmerId && ef.year === harvestYear
      );
      // Fallback to finding by ID only if no exact match for ID + year
      const targetFarmer = selectedFarmer || enrolledFarmers.find(ef => ef.id === selectedHarvestFarmerId);
      
      if (targetFarmer) {
        const crop = targetFarmer.cropType || "Maize/Corn";
        const company = targetFarmer.plantationCompany || "Syngenta India";
        setHarvestCrop(crop);
        setHarvestPlantationCompany(company);
        setHarvestFields(targetFarmer.fields || "N/A");

        // Lookup designed rate by accountant
        const rateKey = `${crop}_${company}_${harvestYear}`;
        if (cropSourcingRates && cropSourcingRates[rateKey] !== undefined) {
          setCropRatePerKg(cropSourcingRates[rateKey]);
        } else {
          setCropRatePerKg(24.50); // fallback default
        }
      } else {
        setHarvestCrop("Maize/Corn");
        setHarvestPlantationCompany("");
        setHarvestFields("N/A");
        setCropRatePerKg(24.50);
      }
    } else {
      setHarvestPlantationCompany("");
      setHarvestFields("");
      setCropRatePerKg(24.50);
    }
  }, [selectedHarvestFarmerId, harvestYear, enrolledFarmers, cropSourcingRates]);

  // Collection modal states
  const [collectingFarmer, setCollectingFarmer] = useState<FarmerDistribution | null>(null);
  const [collectAmount, setCollectAmount] = useState<string>("");
  const [collectMode, setCollectMode] = useState<"Cash" | "Online">("Cash");
  const [collectNotes, setCollectNotes] = useState<string>("");
  const [collectSuccessMsg, setCollectSuccessMsg] = useState<string | null>(null);

  // Receipt & Bill modal states
  const [viewingReceipt, setViewingReceipt] = useState<PaymentRequest | null>(null);
  const [viewingBill, setViewingBill] = useState<FarmerDistribution | null>(null);
  const [receiptToast, setReceiptToast] = useState<string | null>(null);

  // Modification request modal states
  const [selectedFarmerForMod, setSelectedFarmerForMod] = useState<FarmerDistribution | null>(null);
  const [modFarmerName, setModFarmerName] = useState("");
  const [modPhone, setModPhone] = useState("");
  const [modBags, setModBags] = useState<number>(0);
  const [modRate, setModRate] = useState<number>(0);
  const [modCollected, setModCollected] = useState<number>(0);
  const [modJustification, setModJustification] = useState("");
  const [modSuccess, setModSuccess] = useState(false);

  // Acknowledge review modal states
  const [reviewingLot, setReviewingLot] = useState<DispatchRecord | null>(null);
  const [reviewChecklistWeight, setReviewChecklistWeight] = useState<boolean>(true);
  const [reviewChecklistSeals, setReviewChecklistSeals] = useState<boolean>(true);
  const [reviewNotes, setReviewNotes] = useState<string>("");

  // Requisition indent states
  const [showOrderModal, setShowOrderModal] = useState<boolean>(false);
  const [orderProduct, setOrderProduct] = useState<string>("Urea (46% N)");
  const [orderBags, setOrderBags] = useState<number>(50);
  const [orderNotes, setOrderNotes] = useState<string>("");
  const [orderSuccess, setOrderSuccess] = useState<boolean>(false);

  // Filtered lists for active assistant
  const assistantDispatches = dispatches.filter(d => d.assistantName === currentAssistantName || d.villageName.toLowerCase() === currentAssistantVillage.toLowerCase());
  const incomingLots = assistantDispatches.filter(d => d.status === "In-Transit");
  const acknowledgedLots = assistantDispatches.filter(d => d.status === "Acknowledged");
  const myFertilizerRequests = fertilizerRequests.filter(r => r.villageName.toLowerCase() === currentAssistantVillage.toLowerCase());
  const assistantFarmers = farmerDistributions.filter(fd => fd.assistantName === currentAssistantName || fd.villageName.toLowerCase() === currentAssistantVillage.toLowerCase());
  const assistantStockStats = villageStocks.filter(vs => vs.assistantName === currentAssistantName || vs.villageName.toLowerCase() === currentAssistantVillage.toLowerCase());

  // Calculations
  const stockReceivedCount = assistantStockStats.reduce((sum, s) => sum + s.totalReceived, 0);
  const stockAvailableCount = assistantStockStats.reduce((sum, s) => sum + s.availableStock, 0);
  const stockIssuedCount = assistantStockStats.reduce((sum, s) => sum + s.totalDistributed, 0);
  const farmersServedCount = assistantFarmers.length;
  const cashCollectedAmount = assistantFarmers.reduce((sum, f) => sum + f.amountCollected, 0);
  const pendingFarmerPaymentsAmt = assistantFarmers.reduce((sum, f) => sum + f.balanceAmount, 0);

  const handleIssueSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!farmerName) return;
    if (distributionItems.length === 0) {
      alert("Please add at least one product to the distribution list first.");
      return;
    }

    const dists = distributionItems.map(item => ({
      farmerName,
      mobileNumber: farmerPhone || "+91 9000000000",
      villageName: currentAssistantVillage,
      assistantName: currentAssistantName,
      productName: item.productName,
      bagCount: item.bagCount,
      ratePerBag: item.ratePerBag,
      totalAmount: item.totalAmount,
      amountCollected: 0,
      balanceAmount: item.totalAmount,
      paymentStatus: "Pending" as PaymentStatus
    }));

    onAddDistribution(dists);

    setIssueSuccess(true);
    setTimeout(() => {
      setIssueSuccess(false);
      setFarmerName("");
      setFarmerPhone("");
      setFarmerBags(5);
      setFarmerCollected(0);
      setDistributionItems([]);
      setSelectedEnrolledFarmerId("");
      // Keep on same tab so they can see recent records under that!
      setActiveTab("issue");
    }, 1500);
  };

  const handleEnrollSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!enrollName || !enrollMobile || !enrollPlantationCompany.trim()) return;

    const newFarmer: EnrolledFarmer = {
      id: `ENR-${100 + enrolledFarmers.length + 1}`,
      farmerName: enrollName,
      mobileNumber: enrollMobile,
      villageName: currentAssistantVillage,
      acres: enrollAcres,
      bankName: enrollBankName || "State Bank of India",
      accountNumber: enrollAccountNumber || "XXXXXXXXXX",
      ifscCode: enrollIfsc || "SBIN0000000",
      aadhaarNumber: enrollAadhaar || "XXXX-XXXX-XXXX",
      seedVariety: enrollSeedVariety,
      seedUnits: enrollSeedUnits,
      dateEnrolled: new Date().toISOString().split("T")[0],
      cropType: enrollCropType,
      year: enrollYear,
      plantationCompany: enrollPlantationCompany,
      fields: enrollFields
    };

    const updated = [...enrolledFarmers, newFarmer];
    setEnrolledFarmers(updated);
    localStorage.setItem("enrolled_farmers", JSON.stringify(updated));

    setEnrollSuccess(true);
    setTimeout(() => {
      setEnrollSuccess(false);
      setEnrollName("");
      setEnrollMobile("");
      setEnrollAcres(3);
      setEnrollAadhaar("");
      setEnrollBankName("");
      setEnrollAccountNumber("");
      setEnrollIfsc("");
      setEnrollSeedUnits(3);
      setEnrollCropType("Maize/Corn");
      setEnrollPlantationCompany("Syngenta India");
      setEnrollFields("North Canal Plot 1");
    }, 1500);
  };

  const handleAdvanceRequestSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!advanceFarmerId || advanceAmount <= 0) return;

    const selectedFarmer = enrolledFarmers.find(ef => ef.id === advanceFarmerId);
    if (!selectedFarmer) return;

    // Load limits dynamically from localStorage
    const savedLimits = localStorage.getItem("ks_village_advance_limits");
    let villageLimits: Record<string, number> = {};
    if (savedLimits) {
      try {
        villageLimits = JSON.parse(savedLimits);
      } catch (err) {
        console.error(err);
      }
    }
    const farmerVillage = selectedFarmer.villageName || currentAssistantVillage;
    const limitPerAcre = villageLimits[farmerVillage] !== undefined ? villageLimits[farmerVillage] : 10000;
    const maxAllowed = selectedFarmer.acres * limitPerAcre;

    if (advanceAmount > maxAllowed) {
      alert(`Submission Blocked! Requested advance amount of ₹${advanceAmount.toLocaleString()} exceeds the maximum allowed limit of ₹${maxAllowed.toLocaleString()} (Calculated at ₹${limitPerAcre.toLocaleString()} per acre for ${farmerVillage} across ${selectedFarmer.acres} acres). Please reduce the amount.`);
      return;
    }

    // Use onSubmitPaymentRequest from props to request advance from accountant
    // Accountant will review and approve/reject under his portal
    onSubmitPaymentRequest(
      advanceFarmerId,
      advanceAmount,
      advanceMode,
      advanceNotes || `Advance request for plantation support - ${selectedFarmer.acres} acres.`
    );

    setAdvanceSuccess(true);
    setTimeout(() => {
      setAdvanceSuccess(false);
      setAdvanceFarmerId("");
      setAdvanceAmount(5000);
      setAdvanceNotes("");
    }, 1800);
  };

  const handleHarvestSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedHarvestFarmerId || harvestWeight <= 0) return;

    const selectedFarmer = enrolledFarmers.find(ef => ef.id === selectedHarvestFarmerId);
    if (!selectedFarmer) return;

    const payout = harvestWeight * cropRatePerKg;
    const newCollection: HarvestCollection = {
      id: `HRV-${200 + harvestCollections.length + 1}`,
      farmerId: selectedHarvestFarmerId,
      farmerName: selectedFarmer.farmerName,
      mobileNumber: selectedFarmer.mobileNumber,
      villageName: currentAssistantVillage,
      cropName: harvestCrop,
      weightKg: harvestWeight,
      ratePerKg: cropRatePerKg,
      totalAmount: payout,
      dateCollected: new Date().toISOString().split("T")[0],
      cropType: harvestCrop,
      year: harvestYear,
      plantationCompany: harvestPlantationCompany,
      fields: harvestFields
    };

    const updated = [newCollection, ...harvestCollections];
    setHarvestCollections(updated);
    localStorage.setItem("harvest_collections", JSON.stringify(updated));

    // Show the harvest collection receipt modal
    setSelectedHarvestReceipt(newCollection);

    setHarvestSuccess(true);
    setTimeout(() => {
      setHarvestSuccess(false);
      setSelectedHarvestFarmerId("");
      setHarvestWeight(500);
    }, 1500);
  };

  const handleAcknowledge = (id: string) => {
    onAcknowledgeDispatch(id, currentAssistantName);
  };

  const handleAcknowledgeClick = (lot: DispatchRecord) => {
    setReviewingLot(lot);
    setReviewChecklistWeight(true);
    setReviewChecklistSeals(true);
    setReviewNotes("");
  };

  const handleReviewAcknowledgeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reviewingLot) return;
    onAcknowledgeDispatch(reviewingLot.id, currentAssistantName);
    setReviewingLot(null);
  };

  const handleRequisitionSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onCreateFertilizerRequest({
      villageName: currentAssistantVillage,
      assistantName: currentAssistantName,
      productName: orderProduct,
      bagCount: orderBags,
      notes: orderNotes
    });
    setOrderSuccess(true);
    setTimeout(() => {
      setOrderSuccess(false);
      setShowOrderModal(false);
      setOrderNotes("");
      setOrderBags(50);
    }, 1800);
  };

  const handleViewReceipt = (req: PaymentRequest) => {
    setViewingReceipt(req);
  };

  const handleTriggerReceiptAction = (type: "whatsapp" | "print", req: PaymentRequest) => {
    const farmer = farmerDistributions.find(f => f.id === req.distributionId);
    if (type === "whatsapp") {
      setReceiptToast(`💬 Opening WhatsApp... Receipt ${req.id} sent successfully to ${req.farmerName} (+91 ${farmer?.mobileNumber || "9000000000"})!`);
    } else {
      setReceiptToast(`🖨️ Connecting Bluetooth... Receipt ${req.id} sent to physical RAM-01 Micro-thermal printer!`);
    }
    setTimeout(() => {
      setReceiptToast(null);
    }, 3500);
  };

  const handleModClick = (farmer: FarmerDistribution) => {
    setSelectedFarmerForMod(farmer);
    setModFarmerName(farmer.farmerName);
    setModPhone(farmer.mobileNumber);
    setModBags(farmer.bagCount);
    setModRate(farmer.ratePerBag);
    setModCollected(farmer.amountCollected);
    setModJustification("");
  };

  const handleModSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFarmerForMod || !modFarmerName || !modJustification) return;

    const totalProposedCost = modBags * modRate;
    const proposedBalance = totalProposedCost - modCollected;
    const proposedPaymentStatus = proposedBalance <= 0 ? "Paid" : (modCollected > 0 ? "Partial" : "Pending");

    onSubmitModificationRequest({
      distributionId: selectedFarmerForMod.id,
      assistantName: currentAssistantName,
      villageName: currentAssistantVillage,
      farmerName: selectedFarmerForMod.farmerName,
      originalData: {
        farmerName: selectedFarmerForMod.farmerName,
        mobileNumber: selectedFarmerForMod.mobileNumber,
        productName: selectedFarmerForMod.productName,
        bagCount: selectedFarmerForMod.bagCount,
        ratePerBag: selectedFarmerForMod.ratePerBag,
        totalAmount: selectedFarmerForMod.totalAmount,
        amountCollected: selectedFarmerForMod.amountCollected,
        balanceAmount: selectedFarmerForMod.balanceAmount,
        paymentStatus: selectedFarmerForMod.paymentStatus,
      },
      requestedChanges: {
        farmerName: modFarmerName,
        mobileNumber: modPhone || "+91 9000000000",
        productName: selectedFarmerForMod.productName,
        bagCount: modBags,
        ratePerBag: modRate,
        totalAmount: totalProposedCost,
        amountCollected: modCollected,
        balanceAmount: proposedBalance,
        paymentStatus: proposedPaymentStatus,
      },
      justification: modJustification,
    });

    setModSuccess(true);
    setTimeout(() => {
      setModSuccess(false);
      setSelectedFarmerForMod(null);
    }, 2000);
  };

  return (
    <div className="flex-1 flex flex-col justify-start">
      {/* Assistant Sticky Header */}
      <div className="bg-gradient-to-r from-brand-900 via-brand-800 to-brand-900 text-white px-5 pt-4 pb-2.5 flex flex-col gap-3 sticky top-[41px] z-20 shadow-md border-b border-brand-950/30">
        <div className="flex items-center justify-between">
          <div className="flex flex-col">
            <span className="text-[11px] font-semibold text-white/80 uppercase tracking-wider">
              Village Assistant
            </span>
            <h2 className="text-sm font-bold font-display text-white">
              {currentAssistantVillage} Center
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
                  {academicYears.map((yr) => (
                    <option key={yr} value={yr}>{yr}</option>
                  ))}
                </select>
              </div>
            )}
            <button
              onClick={onLogout}
              className="text-[10px] px-2.5 py-1 bg-white/10 hover:bg-white/20 text-white rounded-lg font-bold border border-white/15 transition"
            >
              Logout
            </button>
          </div>
        </div>

        {/* Navigation Tabs (Sticky) */}
        <div className="flex gap-1 overflow-x-auto pt-1 pb-1 scrollbar-none scroll-smooth border-t border-white/10">
          <button
            onClick={() => setActiveTab("dashboard")}
            className={`px-3 py-1.5 text-center rounded-lg font-bold text-[11px] whitespace-nowrap transition shrink-0 ${
              activeTab === "dashboard" ? "bg-white text-brand-900 shadow-xs" : "text-white/85 hover:bg-white/10"
            }`}
          >
            Stats
          </button>
          <button
            onClick={() => setActiveTab("requests")}
            className={`px-3 py-1.5 text-center rounded-lg font-bold text-[11px] whitespace-nowrap transition shrink-0 relative ${
              activeTab === "requests" ? "bg-white text-brand-900 shadow-xs" : "text-white/85 hover:bg-white/10"
            }`}
          >
            Requests
            {incomingLots.length > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-rose-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center animate-bounce">
                {incomingLots.length}
              </span>
            )}
          </button>
          <button
            onClick={() => setActiveTab("enrollment")}
            className={`px-3 py-1.5 text-center rounded-lg font-bold text-[11px] whitespace-nowrap transition shrink-0 ${
              activeTab === "enrollment" ? "bg-white text-brand-900 shadow-xs" : "text-white/85 hover:bg-white/10"
            }`}
          >
            + Enroll Seed
          </button>
          <button
            onClick={() => setActiveTab("issue")}
            className={`px-3 py-1.5 text-center rounded-lg font-bold text-[11px] whitespace-nowrap transition shrink-0 ${
              activeTab === "issue" ? "bg-white text-brand-900 shadow-xs" : "text-white/85 hover:bg-white/10"
            }`}
          >
            + Distribute
          </button>
          <button
            onClick={() => setActiveTab("harvest")}
            className={`px-3 py-1.5 text-center rounded-lg font-bold text-[11px] whitespace-nowrap transition shrink-0 ${
              activeTab === "harvest" ? "bg-white text-brand-900 shadow-xs" : "text-white/85 hover:bg-white/10"
            }`}
          >
            Harvest (Maize)
          </button>
          <button
            onClick={() => setActiveTab("farmers")}
            className={`px-3 py-1.5 text-center rounded-lg font-bold text-[11px] whitespace-nowrap transition shrink-0 ${
              activeTab === "farmers" ? "bg-white text-brand-900 shadow-xs" : "text-white/85 hover:bg-white/10"
            }`}
          >
            Get Details
          </button>
          <button
            onClick={() => setActiveTab("verification")}
            className={`px-3 py-1.5 text-center rounded-lg font-bold text-[11px] whitespace-nowrap transition shrink-0 relative ${
              activeTab === "verification" ? "bg-white text-brand-900 shadow-xs" : "text-white/85 hover:bg-white/10"
            }`}
          >
            🔍 Field Inspection
            {fieldVerifications.filter(v => (v.villageName || "").toLowerCase() === (currentAssistantVillage || "").toLowerCase() && (v.status === "Rejected" || v.status === "Rejected / Flagged")).length > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-rose-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center animate-bounce">
                {fieldVerifications.filter(v => (v.villageName || "").toLowerCase() === (currentAssistantVillage || "").toLowerCase() && (v.status === "Rejected" || v.status === "Rejected / Flagged")).length}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Main Container */}
      <div className="flex-1 px-4 py-4 space-y-4">

        {/* Tab 1: Dashboard stats */}
        {activeTab === "dashboard" && (
          <div className="space-y-4">
            
            {/* Warehouse localization card */}
            <div className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-xs flex items-center gap-3">
              <span className="p-2.5 bg-amber-50 rounded-xl text-amber-600">
                <MapPin size={20} />
              </span>
              <div>
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Authorized Depot</span>
                <span className="text-sm font-bold text-slate-800 block mt-0.5">{currentAssistantVillage} Village Warehouse</span>
                <span className="text-[10px] text-slate-400 block mt-0.5">Under supervisor {currentAssistantName}</span>
              </div>
            </div>

            {/* Inventory Count Box */}
            <div className="bg-gradient-to-br from-brand-900 to-slate-900 text-white p-4 rounded-2xl shadow-sm space-y-3">
              <span className="text-[10px] uppercase font-bold text-brand-200 tracking-wider block">
                Warehouse Distribution Stock (Click Variety to Audit)
              </span>
              
              <div className="flex items-baseline justify-between">
                <div>
                  <span className="text-2xl font-bold font-display">{stockAvailableCount}</span>
                  <span className="text-xs text-slate-300 ml-1">Bags Available</span>
                </div>
                <div className="text-right text-[10px] text-slate-400 font-medium">
                  <span>Gross Received: {stockReceivedCount} Bags</span>
                </div>
              </div>

              {/* Individual Product stock representation */}
              <div className="border-t border-white/10 pt-2.5 space-y-1.5 text-xs text-slate-200 font-mono">
                {assistantStockStats.length > 0 ? (
                  assistantStockStats.map((item, id) => (
                    <div 
                      key={id} 
                      onClick={() => setSelectedProductDetails(item.productName)}
                      className="flex justify-between items-center cursor-pointer hover:bg-white/15 p-1.5 rounded-lg transition active:scale-[0.98]"
                      title="Click to view distribution and payment ledger"
                    >
                      <span>{item.productName}:</span>
                      <div className="flex items-center gap-1.5">
                        <span className={`font-bold ${selectedProductDetails === item.productName ? 'text-amber-300' : 'text-brand-200'}`}>
                          {item.availableStock} Bags
                        </span>
                        <span className="text-[9px] text-white/50 bg-white/10 hover:bg-white/20 px-1.5 py-0.5 rounded font-bold uppercase">&rarr; AUDIT</span>
                      </div>
                    </div>
                  ))
                ) : (
                  <span className="text-[10px] text-slate-450 block py-1">No stock levels reported. Click 'Incoming' to acknowledge shipments.</span>
                )}
              </div>
            </div>

            {/* Clickable Variety Audit Information */}
            {selectedProductDetails && (
              <div className="bg-white p-4 rounded-2xl border border-blue-100 shadow-sm space-y-3.5 animate-in slide-in-from-top-3 duration-200 text-slate-800 text-xs text-left">
                <div className="flex justify-between items-center border-b border-slate-100 pb-2">
                  <div>
                    <span className="text-[9px] uppercase font-bold text-brand-700 bg-brand-50 px-2.5 py-1 rounded">Granular Audit Trace</span>
                    <h3 className="font-extrabold text-slate-900 mt-1.5 text-xs">{selectedProductDetails}</h3>
                  </div>
                  <button
                    onClick={() => setSelectedProductDetails(null)}
                    className="text-[10px] font-bold text-slate-500 bg-slate-100 hover:bg-slate-250 px-2.5 py-1 rounded-lg transition cursor-pointer"
                  >
                    Close &times;
                  </button>
                </div>

                {(() => {
                  const productSales = assistantFarmers.filter(fd => fd.productName === selectedProductDetails);
                  const totalBagsDistributed = productSales.reduce((sum, s) => sum + s.bagCount, 0);
                  const totalPaidCollected = productSales.reduce((sum, s) => sum + s.amountCollected, 0);
                  const totalPendingDues = productSales.reduce((sum, s) => sum + s.balanceAmount, 0);
                  const matchedStockStatus = assistantStockStats.find(vs => vs.productName === selectedProductDetails);

                  return (
                    <div className="space-y-3">
                      {/* Financial and Quantity stats */}
                      <div className="grid grid-cols-2 gap-2 text-center text-[10px] bg-slate-50 p-2.5 rounded-xl border border-slate-100 font-mono">
                        <div>
                          <span className="text-slate-400 block font-semibold uppercase text-[8px] tracking-wide">Available Stock</span>
                          <span className="font-extrabold text-slate-800 text-xs mt-0.5 block">{matchedStockStatus?.availableStock || 0} Bags</span>
                        </div>
                        <div>
                          <span className="text-slate-400 block font-semibold uppercase text-[8px] tracking-wide">Farmer Issue</span>
                          <span className="font-extrabold text-slate-800 text-xs mt-0.5 block">{totalBagsDistributed} Bags</span>
                        </div>
                        <div className="bg-emerald-50/50 p-1 rounded">
                          <span className="text-slate-400 block font-semibold uppercase text-[8px] tracking-wide">Payment Received</span>
                          <span className="font-extrabold text-emerald-700 text-xs mt-0.5 block">₹ {totalPaidCollected.toLocaleString()}</span>
                        </div>
                        <div className="bg-rose-50/50 p-1 rounded">
                          <span className="text-slate-400 block font-semibold uppercase text-[8px] tracking-wide">Dues Outstanding</span>
                          <span className="font-extrabold text-rose-600 text-xs mt-0.5 block">₹ {totalPendingDues.toLocaleString()}</span>
                        </div>
                      </div>

                      {/* List of custom distributions */}
                      <div className="space-y-1.5">
                        <span className="text-[10px] text-slate-400 font-bold block uppercase tracking-wider">Beneficiary Farmer Sales Log:</span>
                        {productSales.length === 0 ? (
                          <p className="text-[10px] text-slate-400/80 text-center py-3 italic">No distribution records logged for this fertilizer.</p>
                        ) : (
                          <div className="max-h-48 overflow-y-auto space-y-1.5 pr-1">
                            {productSales.map((sale) => (
                              <div key={sale.id} className="p-2.5 border border-slate-100 bg-slate-50/50 hover:bg-slate-50 rounded-xl flex justify-between items-center text-[11px] transition">
                                <div>
                                  <span className="font-bold text-slate-800 block">{sale.farmerName}</span>
                                  <span className="block text-[9px] text-slate-400 font-mono mt-0.5">{sale.date} &bull; {sale.mobileNumber}</span>
                                </div>
                                <div className="text-right">
                                  <span className="font-bold text-slate-700 block font-mono">{sale.bagCount} Bags</span>
                                  <span className={`text-[8px] font-bold px-1.5 py-0.5 rounded ${
                                    sale.paymentStatus === 'Paid' ? 'text-emerald-700 bg-emerald-50' : 'text-rose-700 bg-rose-50'
                                  }`}>
                                    {sale.paymentStatus} (₹{sale.balanceAmount} due)
                                  </span>
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

            {/* Stock tracking tiles */}
            <div className="grid grid-cols-2 gap-3 text-xs text-left">
              <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-xs flex flex-col justify-between">
                <span className="text-[10px] text-slate-400 font-semibold uppercase block">Total Bags Issued</span>
                <span className="text-lg font-bold text-brand-700 font-display mt-1 font-mono">{stockIssuedCount} Bags</span>
                <span className="text-[9px] text-slate-400 mt-1 block">To local farmers</span>
              </div>

              <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-xs flex flex-col justify-between">
                <span className="text-[10px] text-slate-400 font-semibold uppercase block">Available Bags</span>
                <span className="text-lg font-bold text-emerald-600 font-display mt-1 font-mono">{stockAvailableCount} Bags</span>
                <span className="text-[9px] text-emerald-500 font-medium mt-1 block">Ready for distribution</span>
              </div>
            </div>

            {/* General helper text for demo */}
            <div className="bg-slate-100 p-3.5 rounded-xl border border-slate-200/50 text-left">
              <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider block">Distribution guidelines</span>
              <p className="text-[11px] text-slate-600 leading-relaxed mt-1">
                Verify farmer Aadhaar card / land record matches before logging issue counts. Limit distributions to 15 bags of Urea per farmer daily.
              </p>
            </div>

            {/* Real-time Audit Timeline & Action Ledger */}
            <div className="bg-white p-4 rounded-2xl border border-slate-200/85 shadow-xs space-y-4 text-left">
              <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
                <div className="flex items-center gap-2">
                  <span className="p-1.5 bg-brand-50 rounded-lg text-brand-700">
                    <Clock size={16} />
                  </span>
                  <span className="text-sm font-bold text-slate-800">Center Activity Timeline</span>
                </div>
                <span className="text-[9px] uppercase font-bold text-slate-400 font-mono tracking-wider">Live Audit Logs</span>
              </div>

              {(() => {
                const assistantTimeline = timelineEvents.filter(
                  (te) => te.assistantName === currentAssistantName || te.villageName === currentAssistantVillage
                );

                if (assistantTimeline.length === 0) {
                  return (
                    <div className="text-center py-6 text-[11.5px] text-slate-400 italic">
                      No activity logged at this center yet.
                    </div>
                  );
                }

                return (
                  <div className="relative border-l border-slate-200/80 ml-3 pl-4 space-y-5 py-1 text-xs">
                    {assistantTimeline.map((item) => {
                      let dotColor = "bg-brand-600 ring-brand-100";
                      if (item.actionType === "sale") dotColor = "bg-brand-600 ring-brand-100";
                      else if (item.actionType === "acknowledge") dotColor = "bg-teal-600 ring-teal-100";
                      else if (item.actionType === "payment_update") dotColor = "bg-emerald-600 ring-emerald-100";
                      else if (item.actionType === "modification_request") dotColor = "bg-amber-500 ring-amber-100";
                      else if (item.actionType === "modification_approved") dotColor = "bg-indigo-600 ring-indigo-100";
                      else if (item.actionType === "modification_rejected") dotColor = "bg-rose-500 ring-rose-100";

                      return (
                        <div key={item.id} className="relative group text-slate-700 space-y-1">
                          {/* Timeline Connector Dot */}
                          <span className={`absolute -left-[21.5px] top-1.5 w-2 h-2 rounded-full ring-4 ${dotColor} transition duration-300`}></span>
                          <div className="flex justify-between items-baseline gap-2">
                            <strong className="font-bold text-slate-800 text-[11.5px]">{item.title}</strong>
                            <span className="text-[9px] text-slate-400 font-mono flex-shrink-0">{item.timestamp}</span>
                          </div>
                          <p className="text-slate-500 text-[11px] leading-relaxed">{item.description}</p>
                          <div className="text-[8px] font-mono text-slate-400/80 uppercase">
                            ID: {item.id.split("-").slice(1).join("-") || item.id} &bull; Assistant: {item.assistantName}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                );
              })()}
            </div>

          </div>
        )}

        {/* Tab 2: Requests (Fertilizer Indents & Farmer Advances) */}
        {activeTab === "requests" && (
          <div className="space-y-4">
            
            {/* Sub-tab Toggle */}
            <div className="bg-slate-100/80 p-1 rounded-xl flex gap-1 border border-slate-200/40">
              <button
                type="button"
                onClick={() => {
                  // We can toggle sub-tabs easily using local state
                  const el = document.getElementById("sub-tab-adv");
                  const elFert = document.getElementById("sub-tab-fert");
                  const formAdv = document.getElementById("form-adv-content");
                  const formFert = document.getElementById("form-fert-content");
                  if (el && elFert && formAdv && formFert) {
                    el.className = "flex-1 py-1.5 text-center text-[11px] font-bold rounded-lg bg-white text-slate-800 shadow-xs transition";
                    elFert.className = "flex-1 py-1.5 text-center text-[11px] font-medium rounded-lg text-slate-500 hover:text-slate-800 transition";
                    formAdv.classList.remove("hidden");
                    formFert.classList.add("hidden");
                  }
                }}
                id="sub-tab-adv"
                className="flex-1 py-1.5 text-center text-[11px] font-bold rounded-lg bg-white text-slate-800 shadow-xs transition"
              >
                💸 Farmer Advances
              </button>
              <button
                type="button"
                onClick={() => {
                  const el = document.getElementById("sub-tab-adv");
                  const elFert = document.getElementById("sub-tab-fert");
                  const formAdv = document.getElementById("form-adv-content");
                  const formFert = document.getElementById("form-fert-content");
                  if (el && elFert && formAdv && formFert) {
                    el.className = "flex-1 py-1.5 text-center text-[11px] font-medium rounded-lg text-slate-500 hover:text-slate-800 transition";
                    elFert.className = "flex-1 py-1.5 text-center text-[11px] font-bold rounded-lg bg-white text-slate-800 shadow-xs transition";
                    formAdv.classList.add("hidden");
                    formFert.classList.remove("hidden");
                  }
                }}
                id="sub-tab-fert"
                className="flex-1 py-1.5 text-center text-[11px] font-medium rounded-lg text-slate-500 hover:text-slate-800 transition"
              >
                📦 Fertilizer Indents
              </button>
            </div>

            {/* SUB-TAB 1: FARMER ADVANCES CONTENT */}
            <div id="form-adv-content" className="space-y-4">
              {/* ADVANCES BULK ACTION BAR */}
              <div className="bg-gradient-to-r from-slate-800 to-slate-900 text-white p-4 rounded-xl border border-slate-700 shadow-sm space-y-3 text-left animate-in fade-in duration-200">
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="text-xs font-bold uppercase tracking-wider text-amber-400">Advances Bulk Administration</h3>
                    <p className="text-[10px] text-slate-350">Download templates, export active advance logs, or import bulk requests via CSV sheet.</p>
                  </div>
                  <div className="flex gap-2 shrink-0">
                    <button 
                      onClick={downloadAdvanceTemplate}
                      className="p-1.5 bg-slate-700 hover:bg-slate-650 rounded-lg text-[10px] font-bold flex items-center gap-1 cursor-pointer transition text-white border-none"
                    >
                      <Download size={11} /> Template
                    </button>
                    <button 
                      onClick={exportAdvances}
                      className="p-1.5 bg-amber-650 hover:bg-amber-600 rounded-lg text-[10px] font-bold flex items-center gap-1 cursor-pointer transition text-white border-none"
                    >
                      <Share size={11} /> Export
                    </button>
                  </div>
                </div>
                
                <div className="bg-slate-850 p-3 rounded-lg border border-slate-750 flex items-center justify-between gap-3">
                  <span className="text-[10px] text-slate-400 font-mono">Upload Filled CSV Sowing Advances Sheet:</span>
                  <label className="py-1.5 px-3 bg-amber-650 hover:bg-amber-600 rounded-lg text-[10.5px] font-bold flex items-center gap-1.5 cursor-pointer transition text-white">
                    <Upload size={12} />
                    <span>Import Advances CSV</span>
                    <input 
                      type="file" 
                      accept=".csv" 
                      className="hidden" 
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          const reader = new FileReader();
                          reader.onload = (evt) => {
                            if (evt.target?.result) {
                              handleAdvanceImport(evt.target.result as string);
                            }
                          };
                          reader.readAsText(file);
                        }
                      }}
                    />
                  </label>
                </div>
              </div>

              <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs space-y-3.5">
                <div className="border-b border-slate-100 pb-2">
                  <h2 className="text-sm font-bold text-slate-800">Request Farmer Advance</h2>
                  <p className="text-[10px] text-slate-500 mt-0.5">
                    Propose sowing and plantation cash/online advances to the central Accountant for approval.
                  </p>
                </div>

                {advanceSuccess ? (
                  <div className="p-4 bg-emerald-50 text-emerald-800 rounded-lg text-center space-y-1.5 border border-emerald-100 text-xs">
                    <CheckCircle2 size={24} className="mx-auto text-emerald-600" />
                    <strong className="block font-bold">Advance Request Submitted!</strong>
                    <span className="text-[11px] text-slate-500">Transmitted to the Accountant's verification queue.</span>
                  </div>
                ) : (
                  <form onSubmit={handleAdvanceRequestSubmit} className="space-y-3 text-xs text-left">
                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                        Select Enrolled Farmer
                      </label>
                      <select
                        required
                        value={advanceFarmerId}
                        onChange={(e) => setAdvanceFarmerId(e.target.value)}
                        className="w-full p-2.5 border border-slate-200 rounded-lg text-xs bg-slate-50 font-medium"
                      >
                        <option value="">-- Choose enrolled farmer --</option>
                        {enrolledFarmers
                          .filter(f => f.villageName.toLowerCase() === currentAssistantVillage.toLowerCase() && (!f.year || f.year === globalYear))
                          .map(f => (
                            <option key={f.id} value={f.id}>
                              {f.farmerName} (ID: {f.id}, Acres: {f.acres})
                            </option>
                          ))}
                      </select>
                    </div>

                    {(() => {
                      const selFarmer = enrolledFarmers.find(f => f.id === advanceFarmerId);
                      if (!selFarmer) return null;
                      
                      const savedLimits = localStorage.getItem("ks_village_advance_limits");
                      let villageLimits: Record<string, number> = {};
                      if (savedLimits) {
                        try {
                          villageLimits = JSON.parse(savedLimits);
                        } catch (err) {
                          console.error(err);
                        }
                      }
                      const limitPerAcre = villageLimits[selFarmer.villageName] !== undefined ? villageLimits[selFarmer.villageName] : 10000;
                      const maxAllowed = selFarmer.acres * limitPerAcre;
                      const exceeds = advanceAmount > maxAllowed;

                      return (
                        <div className={`p-2.5 rounded-lg border text-[10px] space-y-1 ${
                          exceeds 
                            ? "bg-rose-50 border-rose-200 text-rose-800" 
                            : "bg-emerald-50/50 border-emerald-100 text-emerald-800"
                        }`}>
                          <div className="flex justify-between items-center font-bold">
                            <span>Acreage Validation Status:</span>
                            <span className={exceeds ? "text-rose-600 font-extrabold uppercase" : "text-emerald-700 uppercase"}>
                              {exceeds ? "Exceeded Limit" : "Within Limit"}
                            </span>
                          </div>
                          <div className="grid grid-cols-2 gap-2 mt-1 pt-1 border-t border-dotted border-current/20">
                            <div>• Farmer Area: <strong>{selFarmer.acres} Acres</strong></div>
                            <div>• Route Limit/Acre: <strong>₹{limitPerAcre.toLocaleString()}</strong></div>
                            <div>• Max Limit: <strong>₹{maxAllowed.toLocaleString()}</strong></div>
                            <div>• Cur Input: <strong className={exceeds ? "text-rose-700 underline decoration-wavy" : "text-emerald-700"}>₹{advanceAmount.toLocaleString()}</strong></div>
                          </div>
                          {exceeds && (
                            <p className="text-[9px] font-black text-rose-700 animate-pulse mt-1">
                              ⚠️ Village Assistant is restricted from submitting requests above ₹{maxAllowed.toLocaleString()} for this farmer.
                            </p>
                          )}
                        </div>
                      );
                    })()}

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                          Advance Amount (₹)
                        </label>
                        <input
                          type="number"
                          required
                          min={500}
                          max={100000}
                          value={advanceAmount}
                          onChange={(e) => setAdvanceAmount(Math.max(0, parseInt(e.target.value) || 0))}
                          className="w-full p-2.5 border border-slate-200 rounded-lg text-xs bg-slate-50 font-semibold text-slate-850"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                          Disbursement Mode
                        </label>
                        <select
                          value={advanceMode}
                          onChange={(e) => setAdvanceMode(e.target.value as "Cash" | "Online")}
                          className="w-full p-2.5 border border-slate-200 rounded-lg text-xs bg-slate-50 font-medium"
                        >
                          <option value="Online">Online Bank Transfer</option>
                          <option value="Cash">Physical Cash</option>
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                        Purpose of Advance / Remarks
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. Sowing seeds purchase support, land preparation..."
                        value={advanceNotes}
                        onChange={(e) => setAdvanceNotes(e.target.value)}
                        className="w-full p-2.5 border border-slate-200 rounded-lg text-xs bg-slate-50 placeholder-slate-400"
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={!advanceFarmerId}
                      className="w-full py-2 bg-brand-800 hover:bg-brand-900 text-white font-bold rounded-lg shadow-xs transition disabled:opacity-50 disabled:cursor-not-allowed text-xs flex items-center justify-center gap-1.5"
                    >
                      <Send size={12} />
                      Submit Request to Accountant
                    </button>
                  </form>
                )}
              </div>

              {/* Advances Log */}
              <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs space-y-3 text-left">
                <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wide">Advance Requests Status</h3>
                
                {paymentRequests.length === 0 ? (
                  <div className="text-center py-4 text-slate-400 text-[10.5px] bg-slate-50 border border-dashed border-slate-100 rounded-lg">
                    No advance proposals submitted yet.
                  </div>
                ) : (
                  <div className="overflow-x-auto rounded-xl border border-slate-150 shadow-3xs">
                    <table className="w-full text-left border-collapse text-xs">
                      <thead>
                        <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-extrabold uppercase tracking-wider text-[9px]">
                          <th className="py-2.5 px-3">Transaction ID</th>
                          <th className="py-2.5 px-3">Farmer Name</th>
                          <th className="py-2.5 px-3 text-center">Date Requested</th>
                          <th className="py-2.5 px-3 text-center">Payment Mode</th>
                          <th className="py-2.5 px-3 text-right">Proposed Amt</th>
                          <th className="py-2.5 px-3">Purpose/Notes</th>
                          <th className="py-2.5 px-3 text-center">Status</th>
                          <th className="py-2.5 px-3 text-center">Correction State</th>
                          <th className="py-2.5 px-3 text-center">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 font-semibold text-slate-850">
                        {paymentRequests.slice().reverse().map((req) => {
                          let statusBadge = "bg-amber-50 text-amber-800 border-amber-250";
                          let statusLabel = "Awaiting Accountant";
                          if (req.status === "Approved") {
                            statusBadge = "bg-emerald-50 text-emerald-800 border-emerald-200";
                            statusLabel = "Approved";
                          } else if (req.status === "Rejected") {
                            statusBadge = "bg-rose-50 text-rose-800 border-rose-250";
                            statusLabel = "Rejected";
                          }

                          const pendingAdvReq = advanceChangeRequests.find(r => r.requestId === req.id && r.status === "Pending");

                          return (
                            <tr key={req.id} className="hover:bg-slate-50/50 transition">
                              <td className="py-3 px-3 font-mono font-bold text-slate-900">
                                <span className="bg-slate-100 border border-slate-200 px-1.5 py-0.5 rounded text-[10px]">
                                  {req.id}
                                </span>
                              </td>
                              <td className="py-3 px-3 text-slate-900 font-bold">{req.farmerName}</td>
                              <td className="py-3 px-3 text-center font-mono text-[10.5px] text-slate-500">
                                {req.dateRequested}
                              </td>
                              <td className="py-3 px-3 text-center">
                                <span className="bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded text-[10px] border border-slate-200">
                                  {req.paymentMode}
                                </span>
                              </td>
                              <td className="py-3 px-3 text-right font-mono font-bold text-slate-900">
                                ₹{req.amountProposed.toLocaleString()}
                              </td>
                              <td className="py-3 px-3 text-slate-500 max-w-[150px] truncate text-[10.5px] italic">
                                {req.notes || "Sowing support"}
                              </td>
                              <td className="py-3 px-3 text-center">
                                <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded border inline-flex items-center uppercase tracking-wider ${statusBadge}`}>
                                  {statusLabel}
                                </span>
                              </td>
                              <td className="py-3 px-3 text-center">
                                {pendingAdvReq ? (
                                  <span className="text-[9px] font-extrabold bg-amber-50 text-amber-800 px-1.5 py-0.5 rounded border border-amber-200 inline-flex items-center gap-1">
                                    <Clock size={10} className="text-amber-600 animate-pulse" />
                                    Owner Audit
                                  </span>
                                ) : (
                                  <span className="text-[9px] font-bold text-slate-400 bg-slate-50 border border-slate-150 px-1.5 py-0.5 rounded inline-flex items-center gap-0.5 select-none">
                                    <Lock size={10} className="text-slate-450" />
                                    Locked
                                  </span>
                                )}
                              </td>
                              <td className="py-3 px-3 text-center">
                                {!pendingAdvReq && (
                                  <div className="flex gap-1.5 justify-center">
                                    <button
                                      onClick={() => {
                                        setCorrectionAdvance(req);
                                        setAdvanceEditAmount(req.amountProposed);
                                        setAdvanceEditMode(req.paymentMode as any || "Online");
                                        setAdvanceEditNotes(req.notes || "");
                                        setCorrectionAdvanceJustification("");
                                      }}
                                      className="py-1 px-2 bg-white hover:bg-slate-100 text-slate-700 font-bold rounded border border-slate-200 transition flex items-center gap-1 cursor-pointer text-[10px]"
                                    >
                                      <Edit3 size={10} /> Revise
                                    </button>
                                    <button
                                      onClick={() => {
                                        setDeletingAdvance(req);
                                        setDeletingAdvanceJustification("");
                                      }}
                                      className="py-1 px-2 bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold rounded border border-rose-200 transition flex items-center gap-1 cursor-pointer text-[10px]"
                                    >
                                      <Trash2 size={10} /> Cancel
                                    </button>
                                  </div>
                                )}
                                {pendingAdvReq && (
                                  <span className="text-[10px] text-slate-400 italic font-medium">Pending Change</span>
                                )}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>

              {/* ADVANCES CORRECTION OVERLAY MODAL */}
              {correctionAdvance && (
                <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in duration-200 text-xs">
                  <div className="bg-white rounded-xl shadow-xl border border-slate-200 max-w-sm w-full p-5 space-y-4 text-left text-slate-800">
                    <div className="flex justify-between items-center border-b border-slate-100 pb-2.5">
                      <div>
                        <h4 className="font-extrabold text-sm text-slate-900 flex items-center gap-1.5">
                          <Edit3 size={16} className="text-amber-600" />
                          <span>Revise Sowing Advance</span>
                        </h4>
                        <p className="text-[10px] text-slate-500 mt-0.5">Proposed changes for Request ID: {correctionAdvance.id}</p>
                      </div>
                      <button 
                        onClick={() => setCorrectionAdvance(null)}
                        className="p-1 hover:bg-slate-100 rounded-lg text-slate-400"
                      >
                        <X size={16} />
                      </button>
                    </div>

                    <div className="space-y-3.5">
                      <div className="p-2.5 bg-amber-50 border border-amber-100 rounded-lg text-amber-950 text-[10.5px]">
                        <strong>Verification protocol active:</strong> Advance adjustments are sensitive and will await Proprietor signature.
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Proposed Amount (₹)</label>
                          <input 
                            type="number"
                            value={advanceEditAmount}
                            onChange={(e) => setAdvanceEditAmount(parseInt(e.target.value) || 0)}
                            className="w-full p-2 border border-slate-200 rounded-lg text-xs"
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Payout Mode</label>
                          <select 
                            value={advanceEditMode}
                            onChange={(e) => setAdvanceEditMode(e.target.value as any)}
                            className="w-full p-2 border border-slate-200 rounded-lg text-xs"
                          >
                            <option value="Online">Online Bank Transfer</option>
                            <option value="Cash">Physical Cash</option>
                          </select>
                        </div>
                      </div>

                      <div className="space-y-1">
                        <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider">Purpose / Remarks</label>
                        <input 
                          type="text"
                          value={advanceEditNotes}
                          onChange={(e) => setAdvanceEditNotes(e.target.value)}
                          className="w-full p-2 border border-slate-200 rounded-lg text-xs"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider">Revision Justification</label>
                        <textarea 
                          required
                          rows={2}
                          placeholder="Why is this advance request being updated?"
                          value={correctionAdvanceJustification}
                          onChange={(e) => setCorrectionAdvanceJustification(e.target.value)}
                          className="w-full p-2 border border-slate-200 rounded-lg text-xs"
                        />
                      </div>
                    </div>

                    <div className="flex gap-2.5 pt-3 border-t border-slate-100">
                      <button
                        type="button"
                        onClick={() => setCorrectionAdvance(null)}
                        className="flex-1 py-2 bg-slate-100 text-slate-600 font-bold rounded-lg transition"
                      >
                        Cancel
                      </button>
                      <button
                        type="button"
                        disabled={!correctionAdvanceJustification.trim()}
                        onClick={() => {
                          if (onSubmitAdvanceChangeRequest && correctionAdvance) {
                            onSubmitAdvanceChangeRequest({
                              requestId: correctionAdvance.id,
                              farmerName: correctionAdvance.farmerName,
                              villageName: currentAssistantVillage,
                              assistantName: currentAssistantName,
                              action: "update",
                              originalAmount: correctionAdvance.amountProposed,
                              originalMode: correctionAdvance.paymentMode as any,
                              originalNotes: correctionAdvance.notes || "",
                              requestedAmount: advanceEditAmount,
                              requestedMode: advanceEditMode,
                              requestedNotes: advanceEditNotes,
                              justification: correctionAdvanceJustification,
                            });
                            alert(`Advance adjustment request submitted for ${correctionAdvance.farmerName}!`);
                            setCorrectionAdvance(null);
                          }
                        }}
                        className="flex-1 py-2 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-lg transition"
                      >
                        Submit Revision
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* ADVANCES DELETION OVERLAY MODAL */}
              {deletingAdvance && (
                <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in duration-200 text-xs">
                  <div className="bg-white rounded-xl shadow-xl border border-rose-100 max-w-sm w-full p-5 space-y-4 text-left text-slate-800">
                    <div className="flex justify-between items-center border-b border-rose-50 pb-2.5">
                      <div>
                        <h4 className="font-extrabold text-sm text-rose-800 flex items-center gap-1.5">
                          <Trash2 size={16} className="text-rose-600" />
                          <span>Cancel Advance Proposal</span>
                        </h4>
                        <p className="text-[10px] text-slate-400 mt-0.5">Purging Request ID: {deletingAdvance.id}</p>
                      </div>
                      <button 
                        onClick={() => setDeletingAdvance(null)}
                        className="p-1 hover:bg-slate-100 rounded-lg text-slate-400"
                      >
                        <X size={16} />
                      </button>
                    </div>

                    <div className="space-y-3.5">
                      <p className="text-slate-600 leading-relaxed text-[11.5px]">
                        Are you sure you want to request cancellation/deletion of the advance of <strong className="font-bold text-slate-900">₹ {deletingAdvance.amountProposed.toLocaleString()}</strong> proposed for <strong className="font-bold text-slate-900">{deletingAdvance.farmerName}</strong>?
                      </p>

                      <div className="p-2.5 bg-rose-50 border border-rose-100 rounded-lg text-rose-950 text-[10.5px]">
                        This cancellation will await final approval from the Owner.
                      </div>

                      <div className="space-y-1">
                        <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider">Cancellation Justification</label>
                        <textarea 
                          required
                          rows={2.5}
                          placeholder="Provide the reason for cancelling this advance..."
                          value={deletingAdvanceJustification}
                          onChange={(e) => setDeletingAdvanceJustification(e.target.value)}
                          className="w-full p-2 border border-slate-200 rounded-lg text-xs"
                        />
                      </div>
                    </div>

                    <div className="flex gap-2.5 pt-3 border-t border-slate-100">
                      <button
                        type="button"
                        onClick={() => setDeletingAdvance(null)}
                        className="flex-1 py-2 bg-slate-100 text-slate-650 font-bold rounded-lg transition"
                      >
                        Cancel
                      </button>
                      <button
                        type="button"
                        disabled={!deletingAdvanceJustification.trim()}
                        onClick={() => {
                          if (onSubmitAdvanceChangeRequest && deletingAdvance) {
                            onSubmitAdvanceChangeRequest({
                              requestId: deletingAdvance.id,
                              farmerName: deletingAdvance.farmerName,
                              villageName: currentAssistantVillage,
                              assistantName: currentAssistantName,
                              action: "delete",
                              originalAmount: deletingAdvance.amountProposed,
                              originalMode: deletingAdvance.paymentMode as any,
                              originalNotes: deletingAdvance.notes || "",
                              justification: deletingAdvanceJustification,
                            });
                            alert(`Advance cancellation request submitted!`);
                            setDeletingAdvance(null);
                          }
                        }}
                        className="flex-1 py-2 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-lg transition"
                      >
                        Authorize Deletion
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* SUB-TAB 2: FERTILIZER INDENTS CONTENT (Initially Hidden) */}
            <div id="form-fert-content" className="space-y-4 hidden">
              {/* FERTILIZER INDENT SECTION */}
              <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs space-y-3">
                <div className="flex justify-between items-start">
                  <div className="text-left">
                    <h2 className="text-sm font-bold text-slate-800">Indent Fertilizer Stock</h2>
                    <p className="text-[10px] text-slate-500 mt-0.5">
                      Order additional bags directly from Indore Central Depot if local warehouse stock is dry.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setOrderSuccess(false);
                      setOrderProduct("Urea (46% N)");
                      setOrderBags(50);
                      setOrderNotes("");
                      setShowOrderModal(true);
                    }}
                    className="bg-brand-800 hover:bg-brand-900 text-white font-bold py-1.5 px-3 rounded-lg text-[10px] shadow-sm flex items-center gap-1.5 cursor-pointer text-right shrink-0"
                  >
                    <Plus size={12} />
                    Request Stock
                  </button>
                </div>

                {/* Sent Requisitions list */}
                <div className="mt-2 text-xs text-left">
                  <span className="font-semibold text-slate-500 text-[10.5px] uppercase tracking-wide block mb-1.5">
                    Indent Requisitions Log
                  </span>
                  {myFertilizerRequests.length === 0 ? (
                    <div className="text-center py-4 bg-slate-50 rounded-lg text-slate-400 text-[10.5px] border border-dashed border-slate-200/60">
                      No active indents requested. Use the button above to request stock.
                    </div>
                  ) : (
                    <div className="overflow-x-auto rounded-xl border border-slate-150 shadow-3xs mt-2">
                      <table className="w-full text-left border-collapse text-xs">
                        <thead>
                          <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-extrabold uppercase tracking-wider text-[9px]">
                            <th className="py-2 px-3">Req ID</th>
                            <th className="py-2 px-3">Fertilizer Product</th>
                            <th className="py-2 px-3 text-center">Bags Ordered</th>
                            <th className="py-2 px-3 text-center">Requested Date</th>
                            <th className="py-2 px-3">Notes / Purpose</th>
                            <th className="py-2 px-3 text-center">Status</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 font-semibold text-slate-850">
                          {myFertilizerRequests.slice().reverse().map((req) => {
                            let badgeColor = "bg-amber-50 text-amber-800 border-amber-200/50";
                            if (req.status === "Dispatched") badgeColor = "bg-emerald-50 text-emerald-800 border-emerald-200/50";
                            else if (req.status === "Cancelled") badgeColor = "bg-rose-50 text-rose-800 border-rose-200/50";
                            return (
                              <tr key={req.id} className="hover:bg-slate-50/50 transition">
                                <td className="py-2.5 px-3 font-mono font-bold text-slate-900">
                                  <span className="bg-slate-100 border border-slate-200 px-1.5 py-0.5 rounded text-[10px]">
                                    {req.id}
                                  </span>
                                </td>
                                <td className="py-2.5 px-3 font-bold text-slate-850">{req.productName}</td>
                                <td className="py-2.5 px-3 text-center font-mono font-extrabold text-slate-900">{req.bagCount} Bags</td>
                                <td className="py-2.5 px-3 text-center font-mono text-[10.5px] text-slate-500">{req.dateRequested}</td>
                                <td className="py-2.5 px-3 text-slate-500 max-w-[180px] truncate italic">{req.notes || "—"}</td>
                                <td className="py-2.5 px-3 text-center">
                                  <span className={`text-[9px] px-1.5 py-0.5 rounded border font-bold uppercase ${badgeColor}`}>
                                    {req.status}
                                  </span>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              </div>

              {/* PENDING TRANSIT SHIPMENTS */}
              <div className="space-y-2.5">
                <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs text-left">
                  <h2 className="text-sm font-bold text-slate-800">Pending Deliveries</h2>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    Shipments currently in-transit from Main Depot. Physical verification & review is required before adding to available stock.
                  </p>
                </div>

                {incomingLots.length === 0 ? (
                  <div className="bg-slate-50 p-6 rounded-xl border border-dashed border-slate-200 text-center text-xs space-y-1.5">
                    <CheckSquare size={24} className="mx-auto text-slate-350" />
                    <div>
                      <span className="font-bold text-slate-500 block">All Deliveries Acknowledged</span>
                      <p className="text-[10px] text-slate-400 mt-0.5">No in-transit shipments are currently pending.</p>
                    </div>
                  </div>
                ) : (
                  <div className="overflow-x-auto rounded-xl border border-slate-150 shadow-3xs bg-white">
                    <table className="w-full text-left border-collapse text-xs">
                      <thead>
                        <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-extrabold uppercase tracking-wider text-[9px]">
                          <th className="py-2.5 px-3">Transit ID</th>
                          <th className="py-2.5 px-3">Product Description</th>
                          <th className="py-2.5 px-3 text-center">Bags Count</th>
                          <th className="py-2.5 px-3">Source Warehouse</th>
                          <th className="py-2.5 px-3 text-center">Dispatch Date</th>
                          <th className="py-2.5 px-3 text-center">Action</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 font-semibold text-slate-850">
                        {incomingLots.map((lot) => (
                          <tr key={lot.id} className="hover:bg-slate-50/50 transition">
                            <td className="py-2.5 px-3 font-mono font-bold text-slate-900">
                              <span className="bg-brand-50 border border-brand-100 text-brand-700 px-1.5 py-0.5 rounded text-[10px] font-bold">
                                {lot.id}
                              </span>
                            </td>
                            <td className="py-2.5 px-3 font-bold text-slate-800">{lot.productName}</td>
                            <td className="py-2.5 px-3 text-center font-mono font-extrabold text-slate-900">{lot.bagCount} Bags</td>
                            <td className="py-2.5 px-3 text-slate-600 font-medium">{lot.sourceWarehouse}</td>
                            <td className="py-2.5 px-3 text-center font-mono text-[10.5px] text-slate-500">{lot.dispatchDate}</td>
                            <td className="py-2.5 px-3 text-center">
                              <button
                                onClick={() => handleAcknowledgeClick(lot)}
                                className="bg-brand-600 hover:bg-brand-700 text-white font-extrabold py-1 px-2 rounded text-[10px] shadow-3xs flex items-center gap-1 mx-auto cursor-pointer transition"
                              >
                                Review & Acknowledge
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>

              {/* ACKNOWLEDGMENT HISTORY */}
              <div className="space-y-2.5">
                <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs text-left">
                  <h2 className="text-sm font-bold text-slate-800">Acknowledgment History</h2>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    Record of recently offloaded deliveries successfully logged at this local center.
                  </p>
                </div>

                {acknowledgedLots.length === 0 ? (
                  <div className="text-center p-6 bg-slate-50/50 rounded-xl border border-slate-100 text-slate-400 text-xs">
                    No historical deliveries logged at this center.
                  </div>
                ) : (
                  <div className="overflow-x-auto rounded-xl border border-slate-150 shadow-3xs bg-white">
                    <table className="w-full text-left border-collapse text-xs">
                      <thead>
                        <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-extrabold uppercase tracking-wider text-[9px]">
                          <th className="py-2.5 px-3">Log ID</th>
                          <th className="py-2.5 px-3">Product Description</th>
                          <th className="py-2.5 px-3 text-center">Quantity Stocked</th>
                          <th className="py-2.5 px-3">Verified By</th>
                          <th className="py-2.5 px-3 text-center">Timestamp</th>
                          <th className="py-2.5 px-3 text-center">Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 font-semibold text-slate-850">
                        {acknowledgedLots.slice().reverse().map((lot) => (
                          <tr key={lot.id} className="hover:bg-slate-50/50 transition">
                            <td className="py-2.5 px-3 font-mono font-bold text-slate-900">
                              <span className="bg-slate-100 border border-slate-200 px-1.5 py-0.5 rounded text-[10px]">
                                {lot.id}
                              </span>
                            </td>
                            <td className="py-2.5 px-3 font-bold text-slate-800">{lot.productName}</td>
                            <td className="py-2.5 px-3 text-center font-mono font-extrabold text-emerald-700">+{lot.bagCount} Bags</td>
                            <td className="py-2.5 px-3 text-slate-600 font-medium">
                              {lot.acknowledgedBy || lot.assistantName || "Ramesh Kumar"}
                            </td>
                            <td className="py-2.5 px-3 text-center font-mono text-[10.5px] text-slate-500">
                              {lot.acknowledgedDate} at {lot.acknowledgedTime}
                            </td>
                            <td className="py-2.5 px-3 text-center">
                              <span className="text-[8px] px-2 py-0.5 bg-emerald-100 text-emerald-800 border border-emerald-200 font-extrabold uppercase rounded font-mono">
                                STOCKED
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>

          </div>
        )}

        {/* Tab 3: Enrolling Farmer with Seed for Plantation */}
        {activeTab === "enrollment" && (
          <div className="space-y-4">
            {/* BULK INTEGRATOR ACTION BAR */}
            <div className="bg-gradient-to-r from-slate-800 to-slate-900 text-white p-4 rounded-xl border border-slate-700 shadow-sm space-y-3 text-left">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="text-xs font-bold uppercase tracking-wider text-indigo-300">Bulk Registry Administration</h3>
                  <p className="text-[10px] text-slate-350">Download templates, export data, or bulk-import multiple farmer enrollment records via CSV spreadsheet.</p>
                </div>
                <div className="flex gap-2 shrink-0">
                  <button 
                    onClick={downloadFarmerTemplate}
                    className="p-1.5 bg-slate-700 hover:bg-slate-650 rounded-lg text-[10px] font-bold flex items-center gap-1 cursor-pointer transition text-white border-none"
                  >
                    <Download size={11} /> Template
                  </button>
                  <button 
                    onClick={exportFarmers}
                    className="p-1.5 bg-indigo-650 hover:bg-indigo-600 rounded-lg text-[10px] font-bold flex items-center gap-1 cursor-pointer transition text-white border-none"
                  >
                    <Share size={11} /> Export
                  </button>
                </div>
              </div>
              
              <div className="bg-slate-850 p-3 rounded-lg border border-slate-750 flex items-center justify-between gap-3">
                <span className="text-[10px] text-slate-400 font-mono">Upload Filled CSV Enrollment Sheet:</span>
                <label className="py-1.5 px-3 bg-indigo-600 hover:bg-indigo-500 rounded-lg text-[10.5px] font-bold flex items-center gap-1.5 cursor-pointer transition text-white">
                  <Upload size={12} />
                  <span>Import CSV File</span>
                  <input 
                    type="file" 
                    accept=".csv" 
                    className="hidden" 
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        const reader = new FileReader();
                        reader.onload = (evt) => {
                          if (evt.target?.result) {
                            handleFarmerImport(evt.target.result as string);
                          }
                        };
                        reader.readAsText(file);
                      }
                    }}
                  />
                </label>
              </div>
            </div>

            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs space-y-4 text-left">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b border-slate-100 pb-2.5">
                <div>
                  <h2 className="text-sm font-bold text-slate-800">Enroll Farmer (Maize/Corn Sowing)</h2>
                  <p className="text-[11px] text-slate-500 mt-0.5">Register a farmer, log crop plantation acreage, input bank/Aadhaar details, and record starter seed unit issuance.</p>
                </div>
                <button
                  type="button"
                  onClick={() => setShowEnrollForm(!showEnrollForm)}
                  className="px-3 py-1.5 bg-brand-800 hover:bg-brand-900 text-white text-[10.5px] font-bold rounded-lg flex items-center gap-1.5 cursor-pointer transition whitespace-nowrap self-end sm:self-auto"
                >
                  {showEnrollForm ? "✕ Hide Form" : "+ Enroll Farmer"}
                </button>
              </div>

              {showEnrollForm && (
                <div className="space-y-4 animate-in fade-in duration-200">
                  {enrollSuccess ? (
                    <div className="p-6 bg-emerald-50 text-emerald-800 rounded-xl text-center space-y-2 border border-emerald-100">
                      <CheckCircle2 size={36} className="mx-auto text-emerald-600" />
                      <h3 className="font-bold text-sm">Farmer Enrolled Successfully</h3>
                      <p className="text-xs text-slate-500">Starter maize seed allocation logged in the system.</p>
                    </div>
                  ) : (
                    <form onSubmit={handleEnrollSubmit} className="space-y-3.5 text-xs">
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                            Farmer Full Name
                          </label>
                          <input
                            type="text"
                            required
                            placeholder="e.g. Baldev Ram"
                            value={enrollName}
                            onChange={(e) => setEnrollName(e.target.value)}
                            className="w-full p-2.5 border border-slate-200 rounded-lg text-xs bg-slate-50 placeholder-slate-450 font-medium"
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                            Mobile Number
                          </label>
                          <input
                            type="text"
                            required
                            placeholder="10 digit mobile"
                            value={enrollMobile}
                            onChange={(e) => setEnrollMobile(e.target.value)}
                            className="w-full p-2.5 border border-slate-200 rounded-lg text-xs bg-slate-50 placeholder-slate-450"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                            Plantation Area (Acres)
                          </label>
                          <input
                            type="number"
                            required
                            min={1}
                            max={100}
                            value={enrollAcres}
                            onChange={(e) => setEnrollAcres(Math.max(1, parseInt(e.target.value) || 0))}
                            className="w-full p-2.5 border border-slate-200 rounded-lg text-xs bg-slate-50 font-medium"
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                            Aadhaar Card Number
                          </label>
                          <input
                            type="text"
                            placeholder="XXXX-XXXX-XXXX"
                            value={enrollAadhaar}
                            onChange={(e) => setEnrollAadhaar(e.target.value)}
                            className="w-full p-2.5 border border-slate-200 rounded-lg text-xs bg-slate-50 placeholder-slate-450"
                          />
                        </div>
                      </div>

                      {/* Bank Details section */}
                      <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/50 space-y-3">
                        <span className="text-[9.5px] uppercase font-bold text-brand-800 tracking-wider block">
                          Bank Settlement Details (For Sowing Support & Crop Payouts)
                        </span>
                        <div className="grid grid-cols-3 gap-2">
                          <div className="col-span-1">
                            <label className="block text-[9px] font-bold text-slate-450 uppercase mb-0.5">Bank Name</label>
                            <input
                              type="text"
                              placeholder="e.g. SBI"
                              value={enrollBankName}
                              onChange={(e) => setEnrollBankName(e.target.value)}
                              className="w-full p-2 border border-slate-200 rounded-md text-[11px] bg-white"
                            />
                          </div>
                          <div className="col-span-1">
                            <label className="block text-[9px] font-bold text-slate-450 uppercase mb-0.5">Account No</label>
                            <input
                              type="text"
                              placeholder="Account Number"
                              value={enrollAccountNumber}
                              onChange={(e) => setEnrollAccountNumber(e.target.value)}
                              className="w-full p-2 border border-slate-200 rounded-md text-[11px] bg-white"
                            />
                          </div>
                          <div className="col-span-1">
                            <label className="block text-[9px] font-bold text-slate-450 uppercase mb-0.5">IFSC Code</label>
                            <input
                              type="text"
                              placeholder="IFSC Code"
                              value={enrollIfsc}
                              onChange={(e) => setEnrollIfsc(e.target.value)}
                              className="w-full p-2 border border-slate-200 rounded-md text-[11px] bg-white font-mono"
                            />
                          </div>
                        </div>
                      </div>

                      {/* Crop Type, Year, Plantation Company, Fields */}
                      <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/50 space-y-3">
                        <span className="text-[9.5px] uppercase font-bold text-brand-800 tracking-wider block">
                          Crop & Sowing Details
                        </span>
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                              Crop Type
                            </label>
                            <select
                              value={enrollCropType}
                              onChange={(e) => setEnrollCropType(e.target.value)}
                              className="w-full p-2.5 border border-slate-200 rounded-lg text-xs bg-white font-medium shadow-2xs cursor-pointer"
                            >
                              {cropTypes.map(crop => (
                                <option key={crop} value={crop}>{crop}</option>
                              ))}
                            </select>
                          </div>
                          <div>
                            <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                              Sowing Year
                            </label>
                            <select
                              value={enrollYear}
                              onChange={(e) => setEnrollYear(e.target.value)}
                              className="w-full p-2.5 border border-slate-200 rounded-lg text-xs bg-white font-bold shadow-2xs cursor-pointer"
                            >
                              {academicYears.map((yr) => (
                                <option key={yr} value={yr}>{yr}</option>
                              ))}
                            </select>
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                              Plantation Company <span className="text-rose-500 font-black">*</span>
                            </label>
                            <select
                              value={enrollPlantationCompany}
                              onChange={(e) => setEnrollPlantationCompany(e.target.value)}
                              className="w-full p-2.5 border border-slate-200 rounded-lg text-xs bg-white font-medium shadow-2xs cursor-pointer"
                            >
                              {plantationCompanies.map(company => (
                                <option key={company} value={company}>{company}</option>
                              ))}
                            </select>
                          </div>
                          <div>
                            <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                              Fields / Plots Description
                            </label>
                            <input
                              type="text"
                              required
                              placeholder="e.g. North Canal Plot 1"
                              value={enrollFields}
                              onChange={(e) => setEnrollFields(e.target.value)}
                              className="w-full p-2.5 border border-slate-200 rounded-lg text-xs bg-white font-medium shadow-2xs"
                            />
                          </div>
                        </div>
                      </div>

                      {/* Seed Variety & Starter Units */}
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                            Plantation Seed Variety Issued
                          </label>
                          <select
                            value={enrollSeedVariety}
                            onChange={(e) => setEnrollSeedVariety(e.target.value)}
                            className="w-full p-2.5 border border-slate-200 rounded-lg text-xs bg-slate-50 font-medium"
                          >
                            <option value="Pioneer Premium Hybrid Maize (3396)">Pioneer Premium Hybrid Maize (3396)</option>
                            <option value="DKC 9108 Golden Maize Special">DKC 9108 Golden Maize Special</option>
                            <option value="Monsanto High-Yield Corn">Monsanto High-Yield Corn</option>
                            <option value="Syngenta Sweet Corn Seeds">Syngenta Sweet Corn Seeds</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                            Seed Units Distributed (Bags)
                          </label>
                          <input
                            type="number"
                            required
                            min={1}
                            max={50}
                            value={enrollSeedUnits}
                            onChange={(e) => setEnrollSeedUnits(Math.max(1, parseInt(e.target.value) || 0))}
                            className="w-full p-2.5 border border-slate-200 rounded-lg text-xs bg-slate-50 font-medium"
                          />
                        </div>
                      </div>

                      <button
                        type="submit"
                        className="w-full py-2.5 bg-brand-800 hover:bg-brand-900 text-white font-bold rounded-lg shadow-sm transition text-xs cursor-pointer"
                      >
                        Enroll Farmer & Issue Seeds
                      </button>
                    </form>
                  )}
                </div>
              )}
            </div>

            {/* List of Enrolled Farmers */}
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs space-y-3 text-left">
              <div className="flex flex-col gap-2">
                <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">Enrolled Farmer Directory ({currentAssistantVillage} Center)</h3>
                <div className="bg-slate-50 px-3 py-2 rounded-xl border border-slate-200 flex items-center gap-2">
                  <Search size={14} className="text-slate-400 shrink-0" />
                  <input
                    type="text"
                    placeholder="Search enrolled farmers by name or mobile..."
                    value={enrollSearch}
                    onChange={(e) => setEnrollSearch(e.target.value)}
                    className="w-full text-xs bg-transparent outline-none border-none placeholder-slate-450 text-slate-800"
                  />
                </div>
              </div>
              <div className="space-y-2 max-h-[300px] overflow-y-auto pr-1">
                {enrolledFarmers
                  .filter(f => f.villageName.toLowerCase() === currentAssistantVillage.toLowerCase())
                  .filter(f => !f.year || f.year === globalYear)
                  .filter(f => 
                    f.farmerName.toLowerCase().includes(enrollSearch.toLowerCase()) || 
                    f.mobileNumber.includes(enrollSearch)
                  )
                  .map((farmer) => (
                    <div key={farmer.id} className="p-3 border border-slate-100 bg-slate-50/50 rounded-xl text-xs space-y-2 text-left">
                      <div className="flex justify-between items-start">
                        <div>
                          <span className="text-[9px] font-mono font-bold text-brand-700 bg-brand-50 px-2 py-0.5 rounded uppercase">{farmer.id}</span>
                          <strong className="block text-sm text-slate-800 mt-1">{farmer.farmerName}</strong>
                          <span className="text-slate-450 font-mono text-[10px] block mt-0.5">Mobile: {farmer.mobileNumber} &bull; Aadhaar: {farmer.aadhaarNumber}</span>
                        </div>
                        <div className="text-right">
                          <span className="font-extrabold text-slate-700 font-mono block text-xs">{farmer.acres} Acres Sown</span>
                          <span className="text-[9px] text-slate-400 block mt-0.5">Enrolled on: {farmer.dateEnrolled}</span>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-3 gap-2 text-[10px] pt-2 border-t border-slate-100/60 text-slate-500 bg-slate-50 p-2 rounded-lg">
                        <div>
                          <strong className="text-slate-650 block uppercase text-[8px] tracking-wide">Allocated Seed Variety:</strong>
                          <span className="font-semibold text-slate-700">{farmer.seedVariety} ({farmer.seedUnits} Bags)</span>
                        </div>
                        <div>
                          <strong className="text-slate-650 block uppercase text-[8px] tracking-wide">Crop & Plantation:</strong>
                          <span className="font-semibold text-slate-700 block">Crop: {farmer.cropType || "Maize/Corn"} ({farmer.year || "2026"})</span>
                          <span className="text-[9px] text-slate-400 block">Co: {farmer.plantationCompany || "N/A"} &bull; Plots: {farmer.fields || "N/A"}</span>
                        </div>
                        <div>
                          <strong className="text-slate-650 block uppercase text-[8px] tracking-wide">Bank Account:</strong>
                          <span className="font-semibold text-slate-700 block text-ellipsis overflow-hidden">{farmer.bankName}</span>
                          <span className="text-[9px] font-mono text-slate-450 block truncate">{farmer.accountNumber} (IFSC: {farmer.ifscCode})</span>
                        </div>
                      </div>
                      
                      {/* Correction triggers */}
                      {(() => {
                        const pendingReq = farmerChangeRequests.find(r => r.farmerId === farmer.id && r.status === "Pending");
                        if (pendingReq) {
                          return (
                            <div className="mt-2.5 p-2 bg-indigo-50 border border-indigo-200 text-indigo-900 rounded-lg text-[10px] flex items-center justify-between font-medium">
                              <span className="flex items-center gap-1.5 font-bold">
                                <Clock size={12} className="text-indigo-650 animate-pulse" />
                                Pending Owner Authorization: {pendingReq.action === "delete" ? "Deletion Profile" : "Profile Modification"}
                              </span>
                              <span className="text-[9px] bg-indigo-600 text-white px-2 py-0.5 rounded-full uppercase tracking-wide font-bold">In Audit Queue</span>
                            </div>
                          );
                        }

                        return (
                          <div className="mt-2.5 pt-2.5 border-t border-slate-100/60 flex items-center justify-between text-[10px] text-slate-450 font-medium">
                            <span className="flex items-center gap-1 font-semibold text-slate-500">
                              <Lock size={11} className="text-slate-400" />
                              Registry Record Locked
                            </span>
                            <div className="flex gap-2">
                              <button
                                onClick={() => {
                                  setCorrectionFarmer(farmer);
                                  setFarmerEditAcres(farmer.acres);
                                  setFarmerEditMobile(farmer.mobileNumber);
                                  setFarmerEditAadhaar(farmer.aadhaarNumber);
                                  setFarmerEditSeedUnits(farmer.seedUnits);
                                  setFarmerEditBank(farmer.bankName);
                                  setFarmerEditAccount(farmer.accountNumber);
                                  setFarmerEditIfsc(farmer.ifscCode);
                                  setCorrectionFarmerJustification("");
                                }}
                                className="py-1 px-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-lg transition border border-slate-200 flex items-center gap-1 cursor-pointer"
                              >
                                <Edit3 size={11} /> Request Revision
                              </button>
                              <button
                                onClick={() => {
                                  setDeletingFarmer(farmer);
                                  setDeletingFarmerJustification("");
                                }}
                                className="py-1 px-2.5 bg-rose-50 hover:bg-rose-100 text-rose-700 font-semibold rounded-lg transition border border-rose-200 flex items-center gap-1 cursor-pointer"
                              >
                                <Trash2 size={11} /> Request Deletion
                              </button>
                            </div>
                          </div>
                        );
                      })()}
                    </div>
                  ))}
              </div>
            </div>

            {/* FARMER CORRECTION OVERLAY MODAL */}
            {correctionFarmer && (
              <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in duration-200 text-xs">
                <div className="bg-white rounded-xl shadow-xl border border-slate-200 max-w-md w-full p-5 space-y-4 text-left">
                  <div className="flex justify-between items-center border-b border-slate-100 pb-2.5">
                    <div>
                      <h4 className="font-extrabold text-sm text-slate-900 flex items-center gap-1.5">
                        <Edit3 size={16} className="text-indigo-650" />
                        <span>Request Profile Revision</span>
                      </h4>
                      <p className="text-[10px] text-slate-500 mt-0.5">Proposing corrections for master record ID: {correctionFarmer.id}</p>
                    </div>
                    <button 
                      onClick={() => setCorrectionFarmer(null)}
                      className="p-1 hover:bg-slate-100 rounded-lg text-slate-400"
                    >
                      <X size={16} />
                    </button>
                  </div>

                  <div className="space-y-3.5 max-h-[350px] overflow-y-auto pr-1">
                    <div className="p-2.5 bg-indigo-50 border border-indigo-100 rounded-lg text-slate-700 font-medium text-[11px] leading-relaxed">
                      <strong>Correction Protocol active:</strong> Sowing registries are certified sensitive files. Your proposed edits will await Proprietor signature.
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Acres Sown</label>
                        <input 
                          type="number"
                          value={farmerEditAcres}
                          onChange={(e) => setFarmerEditAcres(parseFloat(e.target.value) || 0)}
                          className="w-full p-2 border border-slate-200 rounded-lg"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Mobile No</label>
                        <input 
                          type="text"
                          value={farmerEditMobile}
                          onChange={(e) => setFarmerEditMobile(e.target.value)}
                          className="w-full p-2 border border-slate-200 rounded-lg"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Aadhaar ID</label>
                        <input 
                          type="text"
                          value={farmerEditAadhaar}
                          onChange={(e) => setFarmerEditAadhaar(e.target.value)}
                          className="w-full p-2 border border-slate-200 rounded-lg"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Seed Units Distributed</label>
                        <input 
                          type="number"
                          value={farmerEditSeedUnits}
                          onChange={(e) => setFarmerEditSeedUnits(parseInt(e.target.value) || 0)}
                          className="w-full p-2 border border-slate-200 rounded-lg"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Bank Name</label>
                      <input 
                        type="text"
                        value={farmerEditBank}
                        onChange={(e) => setFarmerEditBank(e.target.value)}
                        className="w-full p-2 border border-slate-200 rounded-lg font-medium text-slate-800"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Account Number</label>
                        <input 
                          type="text"
                          value={farmerEditAccount}
                          onChange={(e) => setFarmerEditAccount(e.target.value)}
                          className="w-full p-2 border border-slate-200 rounded-lg"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">IFSC Code</label>
                        <input 
                          type="text"
                          value={farmerEditIfsc}
                          onChange={(e) => setFarmerEditIfsc(e.target.value)}
                          className="w-full p-2 border border-slate-200 rounded-lg"
                        />
                      </div>
                    </div>

                    <div className="space-y-1">
                      <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider">Justification for Correction</label>
                      <textarea 
                        required
                        rows={2}
                        placeholder="Explain why this change is required (e.g. Typo in mobile, actual sowing was 8 acres...)"
                        value={correctionFarmerJustification}
                        onChange={(e) => setCorrectionFarmerJustification(e.target.value)}
                        className="w-full p-2 border border-slate-200 rounded-lg text-xs"
                      />
                    </div>
                  </div>

                  <div className="flex gap-2.5 pt-3 border-t border-slate-100">
                    <button
                      type="button"
                      onClick={() => setCorrectionFarmer(null)}
                      className="flex-1 py-2 bg-slate-100 hover:bg-slate-200 text-slate-650 font-bold rounded-lg transition"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      disabled={!correctionFarmerJustification.trim()}
                      onClick={() => {
                        if (onSubmitFarmerChangeRequest && correctionFarmer) {
                          onSubmitFarmerChangeRequest({
                            farmerId: correctionFarmer.id,
                            farmerName: correctionFarmer.farmerName,
                            villageName: currentAssistantVillage,
                            assistantName: currentAssistantName,
                            action: "update",
                            originalData: {
                              acres: correctionFarmer.acres,
                              mobileNumber: correctionFarmer.mobileNumber,
                              aadhaarNumber: correctionFarmer.aadhaarNumber,
                              seedUnits: correctionFarmer.seedUnits,
                              accountNumber: correctionFarmer.accountNumber,
                            },
                            requestedChanges: {
                              acres: farmerEditAcres,
                              mobileNumber: farmerEditMobile,
                              aadhaarNumber: farmerEditAadhaar,
                              seedUnits: farmerEditSeedUnits,
                              accountNumber: farmerEditAccount,
                            },
                            justification: correctionFarmerJustification,
                          });
                          alert(`Correction audit request submitted for ${correctionFarmer.farmerName}!`);
                          setCorrectionFarmer(null);
                        }
                      }}
                      className="flex-1 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-40 disabled:cursor-not-allowed text-white font-bold rounded-lg transition"
                    >
                      Submit Audit Proposal
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* FARMER DELETION OVERLAY MODAL */}
            {deletingFarmer && (
              <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in duration-200 text-xs">
                <div className="bg-white rounded-xl shadow-xl border border-rose-100 max-w-sm w-full p-5 space-y-4 text-left">
                  <div className="flex justify-between items-center border-b border-rose-50 pb-2.5">
                    <div>
                      <h4 className="font-extrabold text-sm text-rose-800 flex items-center gap-1.5">
                        <UserX size={16} className="text-rose-600" />
                        <span>Request Record Deletion</span>
                      </h4>
                      <p className="text-[10px] text-slate-400 mt-0.5">Purging farmer card ID: {deletingFarmer.id}</p>
                    </div>
                    <button 
                      onClick={() => setDeletingFarmer(null)}
                      className="p-1 hover:bg-slate-100 rounded-lg text-slate-400"
                    >
                      <X size={16} />
                    </button>
                  </div>

                  <div className="space-y-3.5">
                    <p className="text-slate-600 leading-relaxed text-[11.5px]">
                      You are requesting the complete deletion of <strong className="font-bold text-slate-900">{deletingFarmer.farmerName}</strong> from the enrolled center register.
                    </p>

                    <div className="p-2.5 bg-rose-50 border border-rose-100 rounded-lg text-rose-950 text-[10.5px]">
                      <strong>CRITICAL:</strong> Registry cards cannot be deleted directly. Deletion requests will lock the farmer profile and await Owner authorization.
                    </div>

                    <div className="space-y-1">
                      <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider">Reason/Justification for Deletion</label>
                      <textarea 
                        required
                        rows={3}
                        placeholder="Explain why this profile should be removed (e.g. Sowing cancelled, duplicate entry...)"
                        value={deletingFarmerJustification}
                        onChange={(e) => setDeletingFarmerJustification(e.target.value)}
                        className="w-full p-2 border border-slate-200 rounded-lg text-xs"
                      />
                    </div>
                  </div>

                  <div className="flex gap-2.5 pt-3 border-t border-slate-100">
                    <button
                      type="button"
                      onClick={() => setDeletingFarmer(null)}
                      className="flex-1 py-2 bg-slate-100 text-slate-650 font-bold rounded-lg transition"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      disabled={!deletingFarmerJustification.trim()}
                      onClick={() => {
                        if (onSubmitFarmerChangeRequest && deletingFarmer) {
                          onSubmitFarmerChangeRequest({
                            farmerId: deletingFarmer.id,
                            farmerName: deletingFarmer.farmerName,
                            villageName: currentAssistantVillage,
                            assistantName: currentAssistantName,
                            action: "delete",
                            originalData: {
                              acres: deletingFarmer.acres,
                              mobileNumber: deletingFarmer.mobileNumber,
                              aadhaarNumber: deletingFarmer.aadhaarNumber,
                              seedUnits: deletingFarmer.seedUnits,
                              accountNumber: deletingFarmer.accountNumber,
                            },
                            justification: deletingFarmerJustification,
                          });
                          alert(`Deletion audit proposal submitted for ${deletingFarmer.farmerName}!`);
                          setDeletingFarmer(null);
                        }
                      }}
                      className="flex-1 py-2 bg-rose-600 hover:bg-rose-700 disabled:opacity-40 disabled:cursor-not-allowed text-white font-bold rounded-lg transition"
                    >
                      Authorize Proposal
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Tab 4: Distribute to Farmer Form with Multi-Item Cart & Live Ledger */}
        {activeTab === "issue" && (
          <div className="space-y-4">
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs space-y-4">
              <div className="border-b border-slate-100 pb-2.5 text-left">
                <h2 className="text-sm font-bold text-slate-800">New Farmer Distribution</h2>
                <p className="text-[11px] text-slate-500 mt-0.5">Issue pesticide/fertilizer distribution bills directly to enrolled center farmers.</p>
              </div>

              {issueSuccess ? (
                <div className="p-6 bg-emerald-50 text-emerald-800 rounded-xl text-center space-y-2 border border-emerald-100">
                  <CheckSquare size={36} className="mx-auto text-emerald-600 animate-bounce" />
                  <h3 className="font-bold text-sm">Issue Recorded Successfully</h3>
                  <p className="text-xs text-slate-500">Village stock quantities adjusted automatically.</p>
                </div>
              ) : (
                <form onSubmit={handleIssueSubmit} className="space-y-3.5 text-xs text-left">
                  
                  {/* Enrolled Farmer Selector dropdown */}
                  <div>
                    <div className="flex justify-between items-center mb-1">
                      <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                        Select Enrolled Farmer
                      </label>
                      <button
                        type="button"
                        onClick={() => setActiveTab("enrollment")}
                        className="text-[10px] text-brand-700 hover:underline font-bold cursor-pointer"
                      >
                        + Enroll New Farmer First
                      </button>
                    </div>
                    <select
                      required
                      value={selectedEnrolledFarmerId}
                      onChange={(e) => setSelectedEnrolledFarmerId(e.target.value)}
                      className="w-full p-2.5 border border-slate-200 rounded-lg text-xs bg-slate-50 font-medium text-slate-800"
                    >
                      <option value="">-- Choose enrolled farmer --</option>
                      {enrolledFarmers
                        .filter(f => f.villageName.toLowerCase() === currentAssistantVillage.toLowerCase())
                        .filter(f => !f.year || f.year === globalYear)
                        .map(f => (
                          <option key={f.id} value={f.id}>
                            {f.farmerName} (ID: {f.id}, Mobile: {f.mobileNumber})
                          </option>
                        ))}
                    </select>
                  </div>

                  {/* Auto-populated details display */}
                  {selectedEnrolledFarmerId && (
                    <div className="p-2.5 bg-slate-50 rounded-lg text-[11px] border border-slate-150 flex justify-between">
                      <div>
                        <span className="text-slate-450">Contact Number:</span>
                        <strong className="text-slate-700 block mt-0.5">{farmerPhone || "Not set"}</strong>
                      </div>
                      <div className="text-right">
                        <span className="text-slate-450">Village Center:</span>
                        <strong className="text-slate-700 block mt-0.5">{currentAssistantVillage}</strong>
                      </div>
                    </div>
                  )}

                  {/* Dynamic Product Selection Widget */}
                  <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 space-y-3">
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Add Products to Bill</span>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="block text-[9.5px] text-slate-500 font-bold mb-1">Select Product</label>
                        <select
                          value={farmerProduct}
                          onChange={(e) => setFarmerProduct(e.target.value)}
                          className="w-full p-2 border border-slate-200 rounded-lg text-xs bg-white font-medium text-slate-800"
                        >
                          {DEMO_FERTILIZERS.map((f) => (
                            <option key={f} value={f}>{f}</option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="block text-[9.5px] text-slate-500 font-bold mb-1">Quantity (Bags)</label>
                        <div className="flex gap-1.5">
                          <input
                            type="number"
                            min={1}
                            value={farmerBags}
                            onChange={(e) => setFarmerBags(Math.max(1, parseInt(e.target.value) || 0))}
                            className="w-full p-2 border border-slate-200 rounded-lg text-xs bg-white text-center font-bold text-slate-800"
                          />
                          <button
                            type="button"
                            onClick={() => {
                              const rate = getProductRate(farmerProduct);
                              addDistributionItem(farmerProduct, farmerBags, rate);
                            }}
                            className="px-3 bg-brand-800 hover:bg-brand-900 text-white font-bold rounded-lg text-xs shrink-0 cursor-pointer transition flex items-center justify-center gap-1"
                          >
                            <Plus size={11} /> Add
                          </button>
                        </div>
                      </div>
                    </div>
                    
                    {/* Realtime Stock Level & Pricing indicator */}
                    {(() => {
                      const rate = getProductRate(farmerProduct);
                      const matchedStock = villageStocks.find(
                        vs => (vs.villageName.toLowerCase() === currentAssistantVillage.toLowerCase() && vs.productName === farmerProduct)
                      );
                      const available = matchedStock ? matchedStock.availableStock : 0;
                      return (
                        <div className="flex justify-between items-center text-[10px] px-0.5 text-slate-500">
                          <span>Accountant Rate: <strong className="text-slate-800">₹{rate}/Bag</strong></span>
                          <span className={available > 0 ? "text-slate-600" : "text-rose-600 font-bold"}>
                            Available Stock: <strong className="font-mono">{available} Bags</strong>
                          </span>
                        </div>
                      );
                    })()}
                  </div>

                  {/* Current Distribution Items Table */}
                  <div className="space-y-2">
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Items Added to Bill</span>
                    {distributionItems.length > 0 ? (
                      <div className="border border-slate-200 rounded-xl overflow-hidden bg-white">
                        <div className="divide-y divide-slate-100 max-h-[200px] overflow-y-auto">
                          {distributionItems.map((item, index) => (
                            <div key={index} className="p-3 flex justify-between items-center text-xs hover:bg-slate-50/50">
                              <div className="space-y-0.5">
                                <strong className="text-slate-800 block font-semibold">{item.productName}</strong>
                                <span className="text-[10px] text-slate-400 font-mono">
                                  {item.bagCount} Bags x ₹{item.ratePerBag}
                                </span>
                              </div>
                              <div className="flex items-center gap-3">
                                <strong className="text-slate-900 font-mono font-bold">₹{item.totalAmount.toLocaleString()}</strong>
                                <button
                                  type="button"
                                  onClick={() => removeDistributionItem(index)}
                                  className="p-1.5 bg-slate-50 hover:bg-rose-50 hover:text-rose-600 rounded text-slate-400 transition cursor-pointer"
                                >
                                  <X size={12} />
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                        <div className="bg-brand-50/40 p-3 border-t border-slate-150 flex justify-between items-center">
                          <span className="font-bold text-slate-600 uppercase text-[9.5px] tracking-wide">Total Bill Value:</span>
                          <strong className="text-brand-900 font-mono text-base font-black">
                            ₹ {distributionItems.reduce((sum, item) => sum + item.totalAmount, 0).toLocaleString()}
                          </strong>
                        </div>
                      </div>
                    ) : (
                      <div className="p-5 border border-dashed border-slate-200 rounded-xl bg-slate-50/30 text-center text-slate-450 text-[11px] leading-relaxed">
                        No items added to the bill yet. Select a fertilizer/pesticide product and count above, then click <strong>Add</strong> to build the order bill.
                      </div>
                    )}
                  </div>

                  <button
                    type="submit"
                    disabled={!selectedEnrolledFarmerId || distributionItems.length === 0}
                    className="w-full py-3 bg-brand-800 hover:bg-brand-900 text-white font-extrabold rounded-xl shadow-sm transition disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <CheckSquare size={14} />
                    Authorize Multi-Product Distribution
                  </button>
                </form>
              )}
            </div>

            {/* Live Ledger / Distribution Records Log right under that */}
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs space-y-3.5 text-left">
              <div className="flex justify-between items-center border-b border-slate-100 pb-2">
                <div>
                  <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">Distribution Records Ledger</h3>
                  <p className="text-[10px] text-slate-450 mt-0.5">Real-time issues log for {currentAssistantVillage} Center.</p>
                </div>
                <span className="text-[9.5px] font-bold text-brand-800 bg-brand-50 px-2.5 py-1 rounded">
                  {assistantFarmers.length} Total Sales
                </span>
              </div>

              {assistantFarmers.length > 0 && (
                <div className="bg-slate-50 px-3 py-2 rounded-xl border border-slate-200 flex items-center gap-2">
                  <Search size={14} className="text-slate-400 shrink-0" />
                  <input
                    type="text"
                    placeholder="Search distributions by farmer or product..."
                    value={distSearch}
                    onChange={(e) => setDistSearch(e.target.value)}
                    className="w-full text-xs bg-transparent outline-none border-none placeholder-slate-450 text-slate-800"
                  />
                </div>
              )}

              {assistantFarmers.length === 0 ? (
                <div className="text-center py-8 text-slate-450 text-xs bg-slate-50 border border-dashed border-slate-100 rounded-xl">
                  No distributions logged in this center yet. Issue products above to see records.
                </div>
              ) : (
                <div className="overflow-x-auto rounded-xl border border-slate-150 shadow-3xs bg-white">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-extrabold uppercase tracking-wider text-[9px]">
                        <th className="py-2.5 px-3">Transaction ID</th>
                        <th className="py-2.5 px-3">Farmer Name</th>
                        <th className="py-2.5 px-3">Mobile Contact</th>
                        <th className="py-2.5 px-3 text-center">Issue Date</th>
                        <th className="py-2.5 px-3">Issued Product</th>
                        <th className="py-2.5 px-3 text-center">Bags Issued</th>
                        <th className="py-2.5 px-3 text-right">Total Amount</th>
                        <th className="py-2.5 px-3 text-center">Dues Status</th>
                        <th className="py-2.5 px-3 text-center">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 font-semibold text-slate-850">
                      {[...assistantFarmers]
                        .reverse()
                        .filter(record => {
                          const query = distSearch.toLowerCase();
                          return (
                            record.farmerName.toLowerCase().includes(query) ||
                            record.productName.toLowerCase().includes(query) ||
                            record.id.toLowerCase().includes(query)
                          );
                        })
                        .map((record) => (
                          <tr key={record.id} className="hover:bg-slate-50/50 transition">
                            <td className="py-2.5 px-3 font-mono font-bold text-slate-900">
                              <span className="bg-brand-50 border border-brand-100 text-brand-700 px-1.5 py-0.5 rounded text-[10px] font-bold">
                                {record.id}
                              </span>
                            </td>
                            <td className="py-2.5 px-3 font-bold text-slate-800">{record.farmerName}</td>
                            <td className="py-2.5 px-3 font-mono text-[11px] text-slate-500">{record.mobileNumber}</td>
                            <td className="py-2.5 px-3 text-center font-mono text-[10.5px] text-slate-500">{record.date}</td>
                            <td className="py-2.5 px-3 font-bold text-slate-700">{record.productName}</td>
                            <td className="py-2.5 px-3 text-center font-mono font-extrabold text-slate-900">{record.bagCount} Bags</td>
                            <td className="py-2.5 px-3 text-right font-mono font-bold text-slate-900">
                              ₹ {record.totalAmount.toLocaleString()}
                            </td>
                            <td className="py-2.5 px-3 text-center">
                              <span className={`text-[8.5px] font-extrabold px-1.5 py-0.5 rounded uppercase ${
                                record.paymentStatus === "Paid"
                                  ? "bg-emerald-50 text-emerald-800 border border-emerald-100"
                                  : record.paymentStatus === "Partial"
                                  ? "bg-amber-50 text-amber-800 border border-amber-100"
                                  : "bg-rose-50 text-rose-800 border border-rose-100"
                              }`}>
                                {record.paymentStatus}
                              </span>
                            </td>
                            <td className="py-2.5 px-3 text-center">
                              <button
                                type="button"
                                onClick={() => setViewingBill(record)}
                                className="text-[10px] text-brand-800 hover:underline font-extrabold cursor-pointer"
                              >
                                View Receipt
                              </button>
                            </td>
                          </tr>
                        ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Tab 5: Crop Harvest Collection (Maize/Corn) */}
        {activeTab === "harvest" && (
          <div className="space-y-4">
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs space-y-4 text-left">
              <div className="border-b border-slate-100 pb-2.5">
                <h2 className="text-sm font-bold text-slate-800">Maize / Corn Crop Collection</h2>
                <p className="text-[11px] text-slate-500 mt-0.5 font-sans">
                  Weigh and collect Maize/Corn from enrolled farmers. The payout is calculated instantly based on the rate specified by the central Accountant (₹{cropRatePerKg.toFixed(2)}/Kg).
                </p>
              </div>

              {harvestSuccess ? (
                <div className="p-4 bg-emerald-50 text-emerald-800 rounded-xl text-center space-y-1.5 border border-emerald-100 text-xs">
                  <CheckCircle2 size={32} className="mx-auto text-emerald-600 animate-bounce" />
                  <strong className="block font-bold">Harvest Collection Logged!</strong>
                  <span className="text-[11px] text-slate-500">Receipt generated and bank settlement queued.</span>
                </div>
              ) : (
                <form onSubmit={handleHarvestSubmit} className="space-y-3.5 text-xs">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[10.5px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                        Sowing / Plantation Year
                      </label>
                      <select
                        value={harvestYear}
                        onChange={(e) => {
                          setHarvestYear(e.target.value);
                          setSelectedHarvestFarmerId(""); // Reset farmer when year changes to force selection for that year
                        }}
                        className="w-full p-2.5 border border-slate-200 rounded-lg text-xs bg-slate-50 font-bold text-slate-800 cursor-pointer"
                      >
                        {academicYears.map((yr) => (
                          <option key={yr} value={yr}>{yr}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-[10.5px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                        Select Enrolled Farmer
                      </label>
                      <select
                        required
                        value={selectedHarvestFarmerId}
                        onChange={(e) => setSelectedHarvestFarmerId(e.target.value)}
                        className="w-full p-2.5 border border-slate-200 rounded-lg text-xs bg-slate-50 font-medium text-slate-800 cursor-pointer"
                      >
                        <option value="">-- Choose enrolled farmer --</option>
                        {enrolledFarmers
                          .filter(f => f.villageName.toLowerCase() === currentAssistantVillage.toLowerCase())
                          .filter(f => !f.year || f.year === harvestYear)
                          .map(f => (
                            <option key={f.id} value={f.id}>
                              {f.farmerName} (ID: {f.id}, acres: {f.acres})
                            </option>
                          ))}
                      </select>
                    </div>
                  </div>

                  {/* Auto-Populated crop, company, and fields from farmer enrollment */}
                  {selectedHarvestFarmerId && (
                    <div className="p-3 bg-brand-50/40 rounded-xl border border-brand-100/60 space-y-2.5 animate-in fade-in duration-200">
                      <span className="text-[9.5px] uppercase font-bold text-slate-500 tracking-wider block">
                        Auto-Populated Sowing / Plantation Details (from Enrollment)
                      </span>
                      <div className="grid grid-cols-3 gap-2.5">
                        <div>
                          <label className="block text-[9px] font-bold text-slate-450 uppercase mb-0.5">Crop Type</label>
                          <input
                            type="text"
                            disabled
                            value={harvestCrop}
                            className="w-full p-2 border border-slate-200 rounded-md text-[11px] bg-slate-100/80 font-bold text-slate-700 cursor-not-allowed"
                          />
                        </div>
                        <div>
                          <label className="block text-[9px] font-bold text-slate-450 uppercase mb-0.5">Plantation Company</label>
                          <input
                            type="text"
                            disabled
                            value={harvestPlantationCompany}
                            className="w-full p-2 border border-slate-200 rounded-md text-[11px] bg-slate-100/80 font-semibold text-slate-600 cursor-not-allowed"
                          />
                        </div>
                        <div>
                          <label className="block text-[9px] font-bold text-slate-450 uppercase mb-0.5">Fields / Plots</label>
                          <input
                            type="text"
                            disabled
                            value={harvestFields}
                            className="w-full p-2 border border-slate-200 rounded-md text-[11px] bg-slate-100/80 font-semibold text-slate-600 cursor-not-allowed"
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[10.5px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                        Total Weight (KGs)
                      </label>
                      <input
                        type="number"
                        required
                        min={10}
                        max={500000}
                        value={harvestWeight}
                        onChange={(e) => setHarvestWeight(Math.max(0, parseInt(e.target.value) || 0))}
                        className="w-full p-2.5 border border-slate-200 text-slate-800 font-bold rounded-lg text-xs bg-slate-50"
                      />
                    </div>

                    <div className="grid grid-cols-1 gap-1">
                      <label className="block text-[10.5px] font-bold text-slate-500 uppercase tracking-wider">
                        Accountant Specified Sourcing Rate
                      </label>
                      <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-150 flex justify-between items-center text-[11px] font-semibold text-slate-700">
                        <span>Per Kilogram Rate:</span>
                        <span className="font-mono text-slate-900">₹ {cropRatePerKg.toFixed(2)} / Kg</span>
                      </div>
                    </div>
                  </div>

                  {/* Calculated Payout Container */}
                  <div className="p-3 bg-emerald-50/70 border border-emerald-200/60 rounded-xl space-y-1 text-center">
                    <span className="text-[9.5px] uppercase font-bold text-emerald-800 tracking-wider">Estimated Settlement Payout:</span>
                    <div className="text-xl font-black font-mono text-emerald-700">
                      ₹ {(harvestWeight * cropRatePerKg).toLocaleString()}
                    </div>
                    <span className="text-[9.5px] text-slate-500 block">
                      Direct Credit to Farmer's registered Bank Account.
                    </span>
                  </div>

                  <button
                    type="submit"
                    disabled={!selectedHarvestFarmerId || harvestWeight <= 0}
                    className="w-full py-2.5 bg-brand-800 hover:bg-brand-900 text-white font-bold rounded-lg shadow-sm transition disabled:opacity-50 disabled:cursor-not-allowed text-xs flex items-center justify-center gap-1.5"
                  >
                    <CheckCircle2 size={13} />
                    Confirm Harvest Collection & Issue Receipt
                  </button>
                </form>
              )}
            </div>

            {/* List of Harvest Records */}
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs space-y-3 text-left">
              <div className="flex justify-between items-center border-b border-slate-100 pb-2">
                <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">Harvest Sourcing Ledger ({currentAssistantVillage})</h3>
              </div>
              
              {harvestCollections.length > 0 && (
                <div className="bg-slate-50 px-3 py-2 rounded-xl border border-slate-200 flex items-center gap-2">
                  <Search size={14} className="text-slate-400 shrink-0" />
                  <input
                    type="text"
                    placeholder="Search harvests by farmer name..."
                    value={harvestSearch}
                    onChange={(e) => setHarvestSearch(e.target.value)}
                    className="w-full text-xs bg-transparent outline-none border-none placeholder-slate-450 text-slate-800"
                  />
                </div>
              )}

              {harvestCollections.length === 0 ? (
                <div className="text-center py-6 text-slate-450 text-xs bg-slate-50 border border-dashed border-slate-100 rounded-lg">
                  No crop collections logged yet. Weigh and confirm a collection above.
                </div>
              ) : (
                <div className="overflow-x-auto rounded-xl border border-slate-150 shadow-3xs bg-white">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-extrabold uppercase tracking-wider text-[9px]">
                        <th className="py-2.5 px-3">Collection ID</th>
                        <th className="py-2.5 px-3">Farmer Name</th>
                        <th className="py-2.5 px-3 text-center">Date Collected</th>
                        <th className="py-2.5 px-3 text-right">Weight (Kg)</th>
                        <th className="py-2.5 px-3 text-right">Rate / Kg</th>
                        <th className="py-2.5 px-3 text-right">Total Payout</th>
                        <th className="py-2.5 px-3 text-center">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 font-semibold text-slate-850">
                      {harvestCollections
                        .filter((col) => {
                          const query = harvestSearch.toLowerCase();
                          return (
                            col.farmerName.toLowerCase().includes(query) ||
                            col.id.toLowerCase().includes(query)
                          );
                        })
                        .map((col) => (
                          <tr key={col.id} className="hover:bg-slate-50/50 transition">
                            <td className="py-2.5 px-3 font-mono font-bold text-slate-900">
                              <span className="bg-emerald-50 border border-emerald-100 text-emerald-700 px-1.5 py-0.5 rounded text-[10px] font-bold">
                                {col.id}
                              </span>
                            </td>
                            <td className="py-2.5 px-3 font-bold text-slate-800">{col.farmerName}</td>
                            <td className="py-2.5 px-3 text-center font-mono text-[10.5px] text-slate-500">{col.dateCollected}</td>
                            <td className="py-2.5 px-3 text-right font-mono font-extrabold text-slate-900">{col.weightKg} Kg</td>
                            <td className="py-2.5 px-3 text-right font-mono text-slate-600">₹ {col.ratePerKg.toFixed(2)}</td>
                            <td className="py-2.5 px-3 text-right font-mono font-black text-emerald-700">
                              ₹ {col.totalAmount.toLocaleString()}
                            </td>
                            <td className="py-2.5 px-3 text-center">
                              <button
                                type="button"
                                onClick={() => setSelectedHarvestReceipt(col)}
                                className="text-[10px] text-brand-700 hover:underline font-extrabold cursor-pointer"
                              >
                                View Receipt
                              </button>
                            </td>
                          </tr>
                        ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Tab 4: Beneficiary Farmer Registry - Get Details */}
        {activeTab === "farmers" && (
          <div className="space-y-3">
            <div className="bg-white p-3.5 rounded-xl border border-slate-200 flex items-center gap-2">
              <Search size={16} className="text-slate-400" />
              <input
                type="text"
                placeholder="Search farmers name..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full text-xs bg-transparent outline-none border-none placeholder-slate-400 text-slate-800"
              />
            </div>

            <div className="overflow-x-auto rounded-xl border border-slate-150 shadow-3xs bg-white mt-2">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-extrabold uppercase tracking-wider text-[9px]">
                    <th className="py-2.5 px-3">Farmer ID</th>
                    <th className="py-2.5 px-3">Farmer Name</th>
                    <th className="py-2.5 px-3">Aadhaar / Contact</th>
                    <th className="py-2.5 px-3 text-center">Acres</th>
                    <th className="py-2.5 px-3 text-right">Kg Produced</th>
                    <th className="py-2.5 px-3 text-right">Harvest Value</th>
                    <th className="py-2.5 px-3 text-right">Fertilizer Bill</th>
                    <th className="py-2.5 px-3 text-right">Taken Advance</th>
                    <th className="py-2.5 px-3 text-right">Seed Amount</th>
                    <th className="py-2.5 px-3 text-center">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-semibold text-slate-850">
                  {enrolledFarmers
                    .filter(f => f.villageName.toLowerCase() === currentAssistantVillage.toLowerCase() && (!f.year || f.year === globalYear) && (
                      searchQuery === "" || f.farmerName.toLowerCase().includes(searchQuery.toLowerCase())
                    ))
                    .map((farmer) => {
                      // 1. Fertilizer Bill (all distributions for this farmer)
                      const farmerFertDistributions = farmerDistributions.filter(fd => 
                        fd.farmerName.toLowerCase() === farmer.farmerName.toLowerCase() ||
                        fd.mobileNumber === farmer.mobileNumber
                      );
                      const fertilizerBillTotal = farmerFertDistributions.reduce((sum, fd) => sum + fd.totalAmount, 0);

                      // 2. Taken Advance (approved payment requests)
                      const farmerAdvances = paymentRequests.filter(pr => 
                        (pr.farmerName.toLowerCase() === farmer.farmerName.toLowerCase() || pr.distributionId === farmer.id) && 
                        pr.status === "Approved"
                      );
                      const totalAdvancesTotal = farmerAdvances.reduce((sum, pr) => sum + pr.amountProposed, 0);

                      // 3. Harvest Produced (weight and collections)
                      const farmerHarvests = harvestCollections.filter(hc => 
                        hc.farmerId === farmer.id || 
                        hc.farmerName.toLowerCase() === farmer.farmerName.toLowerCase()
                      );
                      const totalKgProduced = farmerHarvests.reduce((sum, hc) => sum + hc.weightKg, 0);
                      const totalHarvestValue = farmerHarvests.reduce((sum, hc) => sum + hc.totalAmount, 0);

                      // 4. Seed Amount = fertilizer bill - taken advance
                      const seedAmountCalculated = fertilizerBillTotal - totalAdvancesTotal;

                      const isExpanded = expandedFarmerId === farmer.id;

                      return (
                        <React.Fragment key={farmer.id}>
                          <tr className={`hover:bg-slate-50/50 transition ${isExpanded ? 'bg-slate-50/30' : ''}`}>
                            <td className="py-2.5 px-3 font-mono font-bold text-slate-900">
                              <span className="bg-brand-50 border border-brand-100 text-brand-700 px-1.5 py-0.5 rounded text-[10px] font-bold">
                                {farmer.id}
                              </span>
                            </td>
                            <td className="py-2.5 px-3 font-bold text-slate-800">{farmer.farmerName}</td>
                            <td className="py-2.5 px-3 font-mono text-[11px] text-slate-500">
                              <div>{farmer.mobileNumber}</div>
                              <div className="text-[10px] text-slate-400">Aadhaar: {farmer.aadhaarNumber}</div>
                            </td>
                            <td className="py-2.5 px-3 text-center text-slate-700">{farmer.acres} Acres</td>
                            <td className="py-2.5 px-3 text-right font-mono text-slate-900">{totalKgProduced.toLocaleString()} Kg</td>
                            <td className="py-2.5 px-3 text-right font-mono text-slate-600">₹ {totalHarvestValue.toLocaleString()}</td>
                            <td className="py-2.5 px-3 text-right font-mono text-slate-600">₹ {fertilizerBillTotal.toLocaleString()}</td>
                            <td className="py-2.5 px-3 text-right font-mono text-slate-600">₹ {totalAdvancesTotal.toLocaleString()}</td>
                            <td className="py-2.5 px-3 text-right font-mono font-black text-brand-900">₹ {seedAmountCalculated.toLocaleString()}</td>
                            <td className="py-2.5 px-3 text-center">
                              <button
                                type="button"
                                onClick={() => setExpandedFarmerId(isExpanded ? null : farmer.id)}
                                className="text-[10px] text-brand-700 hover:text-brand-900 font-bold bg-slate-50 hover:bg-slate-100 border border-slate-200 px-2.5 py-1 rounded-lg transition shrink-0 cursor-pointer"
                              >
                                {isExpanded ? "Hide Details" : "Get Details"}
                              </button>
                            </td>
                          </tr>
                          {isExpanded && (
                            <tr className="bg-slate-50/40">
                              <td colSpan={10} className="p-4 border-t border-slate-100">
                                <div className="space-y-4 animate-in fade-in duration-200 text-left">
                                  <div className="grid grid-cols-3 gap-4">
                                    {/* 1. Fertilizer Distributions */}
                                    <div className="space-y-1.5">
                                      <span className="text-[9px] font-bold text-slate-500 uppercase tracking-wider block">Fertilizer/Pesticide Orders ({farmerFertDistributions.length})</span>
                                      {farmerFertDistributions.length === 0 ? (
                                        <p className="text-[10.5px] text-slate-450 italic pl-1">No fertilizer distributed yet.</p>
                                      ) : (
                                        <div className="bg-white border border-slate-200 rounded-xl divide-y divide-slate-100 max-h-[160px] overflow-y-auto">
                                          {farmerFertDistributions.map((fd) => (
                                            <div key={fd.id} className="p-2 flex justify-between text-[11px] items-center">
                                              <div>
                                                <strong className="text-slate-700 font-medium block">{fd.productName}</strong>
                                                <span className="text-slate-400 font-mono text-[9px]">
                                                  {fd.bagCount} Bags &bull; {fd.date}
                                                </span>
                                              </div>
                                              <div className="text-right">
                                                <strong className="text-slate-800 font-mono font-bold block">₹{fd.totalAmount.toLocaleString()}</strong>
                                                <span className={`text-[8.5px] font-bold ${fd.paymentStatus === 'Paid' ? 'text-emerald-600' : 'text-amber-600'}`}>
                                                  {fd.paymentStatus}
                                                </span>
                                              </div>
                                            </div>
                                          ))}
                                        </div>
                                      )}
                                    </div>

                                    {/* 2. Sowing & Land Advances */}
                                    <div className="space-y-1.5">
                                      <span className="text-[9px] font-bold text-slate-500 uppercase tracking-wider block">Sowing &amp; Land Advances</span>
                                      {paymentRequests.filter(pr => pr.farmerName.toLowerCase() === farmer.farmerName.toLowerCase() || pr.distributionId === farmer.id).length === 0 ? (
                                        <p className="text-[10.5px] text-slate-450 italic pl-1">No advances logged yet.</p>
                                      ) : (
                                        <div className="bg-white border border-slate-200 rounded-xl divide-y divide-slate-100 max-h-[160px] overflow-y-auto">
                                          {paymentRequests
                                            .filter(pr => pr.farmerName.toLowerCase() === farmer.farmerName.toLowerCase() || pr.distributionId === farmer.id)
                                            .map((pr) => (
                                              <div key={pr.id} className="p-2 flex justify-between text-[11px] items-center">
                                                <div>
                                                  <strong className="text-slate-700 font-medium block">{pr.notes || "Sowing Cash Advance"}</strong>
                                                  <span className="text-slate-400 font-mono text-[9px]">
                                                    {pr.id} &bull; {pr.dateRequested}
                                                  </span>
                                                </div>
                                                <div className="text-right">
                                                  <strong className="text-slate-800 font-mono font-bold block">₹{pr.amountProposed.toLocaleString()}</strong>
                                                  <span className={`text-[9px] font-semibold block ${
                                                    pr.status === "Approved" ? "text-emerald-600" : pr.status === "Rejected" ? "text-rose-500" : "text-amber-600"
                                                  }`}>
                                                    {pr.status === "Approved" ? "Approved ✓" : pr.status === "Rejected" ? "Rejected" : "Pending"}
                                                  </span>
                                                </div>
                                              </div>
                                            ))}
                                        </div>
                                      )}
                                    </div>

                                    {/* 3. Harvest Sourcing Deliveries */}
                                    <div className="space-y-1.5">
                                      <span className="text-[9px] font-bold text-slate-500 uppercase tracking-wider block">Harvest Deliveries ({farmerHarvests.length})</span>
                                      {farmerHarvests.length === 0 ? (
                                        <p className="text-[10.5px] text-slate-450 italic pl-1">No harvest crop weights logged yet.</p>
                                      ) : (
                                        <div className="bg-white border border-slate-200 rounded-xl divide-y divide-slate-100 max-h-[160px] overflow-y-auto">
                                          {farmerHarvests.map((hc) => (
                                            <div key={hc.id} className="p-2 flex justify-between text-[11px] items-center">
                                              <div>
                                                <strong className="text-slate-700 font-medium block">{hc.cropName}</strong>
                                                <span className="text-slate-400 font-mono text-[9px]">
                                                  {hc.weightKg.toLocaleString()} Kg &bull; {hc.dateCollected}
                                                </span>
                                              </div>
                                              <div className="text-right">
                                                <strong className="text-emerald-700 font-mono font-bold block">₹{hc.totalAmount.toLocaleString()}</strong>
                                                <span className="text-[8.5px] text-slate-450">Sourced</span>
                                              </div>
                                            </div>
                                          ))}
                                        </div>
                                      )}
                                    </div>
                                  </div>

                                  {/* Bank & Enrollment Information */}
                                  <div className="bg-white border border-slate-200 rounded-xl p-3 text-[10.5px] text-slate-600 grid grid-cols-2 gap-4">
                                    <div>
                                      <span className="text-slate-400 block uppercase text-[8px] font-bold tracking-wider">Bank Name</span>
                                      <strong className="text-slate-700 block mt-0.5 font-medium">{farmer.bankName}</strong>
                                      <span className="text-slate-400 block uppercase text-[8px] font-bold tracking-wider mt-2">IFSC Code</span>
                                      <strong className="text-slate-700 block mt-0.5 font-mono font-semibold">{farmer.ifscCode}</strong>
                                    </div>
                                    <div>
                                      <span className="text-slate-400 block uppercase text-[8px] font-bold tracking-wider">Account Number</span>
                                      <strong className="text-slate-700 block mt-0.5 font-mono font-semibold">{farmer.accountNumber}</strong>
                                      <span className="text-slate-400 block uppercase text-[8px] font-bold tracking-wider mt-2">Seed Variety</span>
                                      <strong className="text-slate-700 block mt-0.5 truncate font-medium">{farmer.seedVariety}</strong>
                                    </div>
                                  </div>
                                </div>
                              </td>
                            </tr>
                          )}
                        </React.Fragment>
                      );
                    })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Dynamic Slide-Over Correction Overlay Modal Panel */}
        {selectedFarmerForMod && (
          <div className="absolute inset-0 bg-slate-900/60 z-50 flex items-end justify-center animate-in fade-in duration-200">
            <div className="bg-white w-full max-w-md rounded-t-2xl p-5 space-y-4 shadow-xl border-t border-slate-200/50 animate-in slide-in-from-bottom-5 duration-300">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div>
                  <span className="text-[9px] uppercase font-bold text-amber-700 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded">Security Verification Flow</span>
                  <h3 className="font-bold text-slate-800 mt-1.5 text-sm">Request Ledger Correction</h3>
                </div>
                <button
                  onClick={() => setSelectedFarmerForMod(null)}
                  className="p-1 hover:bg-slate-100 rounded-full cursor-pointer text-slate-400"
                >
                  <X size={18} />
                </button>
              </div>

              {modSuccess ? (
                <div className="py-8 text-center space-y-2.5 bg-amber-50/50 border border-amber-200 rounded-xl">
                  <Check className="mx-auto text-amber-600 w-10 h-10 border-2 border-amber-600 p-1.5 rounded-full" />
                  <h4 className="font-bold text-slate-800 text-xs">Request Transmitted</h4>
                  <p className="text-[11px] text-slate-500 leading-relaxed px-5">
                    Correction request sent to proprietor. Distribution state will restore once reviewed.
                  </p>
                </div>
              ) : (
                <form onSubmit={handleModSubmit} className="space-y-3.5 text-xs text-left">
                  <div className="bg-slate-50 border border-slate-100 p-2.5 rounded-xl text-[11px] text-slate-550 space-y-1">
                    <span className="font-bold block text-slate-600 uppercase text-[9px] tracking-wider mb-0.5 font-sans">Original Entry Context:</span>
                    <div>Product: <strong className="text-slate-800">{selectedFarmerForMod.productName}</strong></div>
                    <div>Original Bags Count: <strong className="text-slate-800">{selectedFarmerForMod.bagCount} Bags</strong></div>
                    <div>Original Rate: <strong className="text-slate-800">₹ {selectedFarmerForMod.ratePerBag}</strong></div>
                    <div>Total Recorded Cost: <strong className="text-slate-800">₹ {selectedFarmerForMod.totalAmount.toLocaleString()}</strong></div>
                  </div>

                  <div className="space-y-3">
                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                        Corrected Farmer Name
                      </label>
                      <input
                        type="text"
                        required
                        value={modFarmerName}
                        onChange={(e) => setModFarmerName(e.target.value)}
                        className="w-full p-2 border border-slate-200 rounded-lg text-xs bg-slate-50"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                        Corrected Phone Number
                      </label>
                      <input
                        type="text"
                        required
                        value={modPhone}
                        onChange={(e) => setModPhone(e.target.value)}
                        className="w-full p-2 border border-slate-200 rounded-lg text-xs bg-slate-50"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                          Corrected Bags
                        </label>
                        <input
                          type="number"
                          required
                          value={modBags}
                          onChange={(e) => setModBags(Math.max(1, parseInt(e.target.value) || 0))}
                          className="w-full p-2 border border-slate-200 rounded-lg text-xs font-semibold bg-slate-50"
                        />
                      </div>

                      <div>
                        <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                          Rate per Bag (₹)
                        </label>
                        <input
                          type="number"
                          required
                          value={modRate}
                          onChange={(e) => setModRate(Math.max(1, parseInt(e.target.value) || 0))}
                          className="w-full p-2 border border-slate-200 rounded-lg text-xs font-semibold bg-slate-50"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2 items-center">
                      <div>
                        <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                          Proposed Bill Total
                        </label>
                        <div className="p-2 bg-slate-50 border border-slate-200 rounded-lg font-bold text-slate-800 font-mono">
                          ₹ {(modBags * modRate).toLocaleString()}
                        </div>
                      </div>

                      <div>
                        <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                          Amount Deposited (₹)
                        </label>
                        <input
                          type="number"
                          required
                          value={modCollected}
                          onChange={(e) => setModCollected(Math.max(0, parseInt(e.target.value) || 0))}
                          className="w-full p-2 border border-slate-200 rounded-lg text-xs font-semibold bg-slate-50"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">
                        Reason for Modifying Entry *
                      </label>
                      <textarea
                        required
                        value={modJustification}
                        placeholder="e.g. Typo in tally book, farmer requested 2 fewer bags..."
                        onChange={(e) => setModJustification(e.target.value)}
                        className="w-full p-2 border border-slate-200 rounded-lg text-xs h-16 resize-none bg-slate-50 block placeholder-slate-400 font-medium"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="w-full py-2.5 bg-amber-500 hover:bg-amber-600 text-white font-bold rounded-lg shadow-sm transition cursor-pointer"
                  >
                    Submit Correction Ticket
                  </button>
                </form>
              )}
            </div>
          </div>
        )}

        {/* DYNAMIC FARMER BILL VIEW & SHARE OVERLAY */}
        {viewingBill && (
          <div className="absolute inset-0 bg-slate-900/70 z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
            <div className="bg-white w-full max-w-sm rounded-2xl shadow-2xl border border-slate-100 overflow-hidden flex flex-col justify-between animate-in zoom-in-95 duration-250">
              
              {/* Bill Header */}
              <div className="bg-emerald-800 text-white p-4 text-center space-y-1 relative">
                <div className="absolute top-4 right-4">
                  <button
                    onClick={() => setViewingBill(null)}
                    className="text-white/85 hover:text-white bg-white/10 hover:bg-white/20 p-1.5 rounded-full cursor-pointer transition"
                  >
                    <X size={15} />
                  </button>
                </div>
                <Receipt className="mx-auto text-emerald-300 animate-pulse" size={24} />
                <h3 className="font-extrabold text-xs uppercase tracking-widest">Kalyan Soil Fertilisers Ltd</h3>
                <p className="text-[9px] text-white/70 italic">Farmer Delivery Invoice</p>
                <div className="text-[9px] font-mono bg-white/15 text-emerald-100 inline-block px-2 py-0.5 rounded-sm uppercase tracking-wide">
                  Pending Payment
                </div>
              </div>

              {/* Bill Body */}
              <div className="p-5 space-y-4 text-xs select-none text-left">
                <div className="border-b border-dashed border-slate-200 pb-3 flex justify-between items-center bg-slate-50 -mx-5 -mt-5 p-4 text-[10px] text-slate-550 font-medium">
                  <div>
                    <span className="block text-[8px] uppercase tracking-wider text-slate-400">Invoice ID</span>
                    <strong className="text-slate-700 font-mono font-bold text-[10.5px]">KS-INV-{viewingBill.id.toUpperCase().substring(0, 8)}</strong>
                  </div>
                  <div className="text-right">
                    <span className="block text-[8px] uppercase tracking-wider text-slate-400">Issued On</span>
                    <strong className="text-slate-700">{viewingBill.date || "Today"}</strong>
                  </div>
                </div>

                {/* Primary Ledger Metadata details */}
                <div className="space-y-2 text-slate-700 text-[11px] leading-relaxed">
                  <div className="flex justify-between">
                    <span className="text-slate-400 text-left">Farmer Name:</span>
                    <strong className="text-slate-800 text-right">{viewingBill.farmerName}</strong>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400 text-left">Mobile Number:</span>
                    <strong className="text-slate-800 text-right font-mono">{viewingBill.mobileNumber}</strong>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400 text-left">Village Hub Center:</span>
                    <strong className="text-slate-800 text-right">{viewingBill.villageName}</strong>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400 text-left">Field Officer:</span>
                    <strong className="text-slate-800 text-right">{viewingBill.assistantName}</strong>
                  </div>

                  <div className="border-t border-dashed border-slate-200 my-2 pt-2"></div>

                  {/* Product breakdown */}
                  <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-100 space-y-1.5">
                    <div className="flex justify-between font-semibold text-slate-800 text-[11.5px]">
                      <span>{viewingBill.productName}</span>
                      <span>x {viewingBill.bagCount} Bags</span>
                    </div>
                    <div className="flex justify-between text-slate-400 text-[10px]">
                      <span>Rate per bag:</span>
                      <span>₹ {viewingBill.ratePerBag}</span>
                    </div>
                  </div>
                </div>

                {/* Total Bill Value Card */}
                <div className="bg-slate-900 border border-slate-800 p-3 rounded-xl flex justify-between items-center text-white">
                  <div className="text-left">
                    <span className="text-slate-400 block text-[8px] uppercase font-bold tracking-wider">Total Bill Amount:</span>
                    <span className="text-slate-400 text-[9px] font-medium block">Awaiting payment to Accountant</span>
                  </div>
                  <strong className="text-emerald-400 text-sm font-mono font-extrabold pr-1">
                    ₹ {viewingBill.totalAmount.toLocaleString()}
                  </strong>
                </div>

                <div className="text-center text-[9px] text-slate-400 bg-amber-50 text-amber-800 p-2 rounded-lg border border-amber-200 leading-snug">
                  <strong>Notice:</strong> Field Officers do not accept payments. Please process all payments with the office Accountant to secure your stock ledger clearance.
                </div>
              </div>

              {/* Bill Footer Actions */}
              <div className="bg-slate-50 p-4 border-t border-slate-100 flex gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setReceiptToast(`💬 WhatsApp API triggered! Bill sent successfully to Suresh Kumar (${viewingBill.mobileNumber}) for ${viewingBill.bagCount} bags of ${viewingBill.productName}!`);
                    setTimeout(() => setReceiptToast(null), 3000);
                  }}
                  className="flex-1 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-bold text-[10px] flex items-center justify-center gap-1 cursor-pointer transition shadow-xs"
                >
                  <Smartphone size={11} />
                  Share WhatsApp
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setReceiptToast(`🖨️ Connecting Bluetooth... Bill printed successfully on physical RAM-01 Micro-thermal printer!`);
                    setTimeout(() => setReceiptToast(null), 3000);
                  }}
                  className="flex-1 py-1.5 bg-slate-100 hover:bg-slate-200 border border-slate-300 text-slate-700 font-bold text-[10px] flex items-center justify-center gap-1 cursor-pointer transition"
                >
                  <Printer size={11} />
                  Print Receipt
                </button>
              </div>
            </div>
          </div>
        )}

        {/* DYNAMIC RECEIPT GENERATOR MODAL (Approved collections only) */}
        {viewingReceipt && (
          <div className="absolute inset-0 bg-slate-900/70 z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
            <div className="bg-white w-full max-w-sm rounded-2xl shadow-2xl border border-slate-105 overflow-hidden flex flex-col justify-between animate-in zoom-in-95 duration-250">
              
              {/* Receipt Header */}
              <div className="bg-brand-800 text-white p-4 text-center space-y-1 relative">
                <div className="absolute top-4 right-4">
                  <button
                    onClick={() => setViewingReceipt(null)}
                    className="text-white/85 hover:text-white bg-white/10 hover:bg-white/20 p-1.5 rounded-full cursor-pointer transition"
                  >
                    <X size={15} />
                  </button>
                </div>
                <Receipt className="mx-auto text-emerald-400" size={24} />
                <h3 className="font-extrabold text-xs uppercase tracking-widest">Kalyan Soil Fertilisers Ltd</h3>
                <p className="text-[9px] text-white/70 italic">Official Village Distribution Division</p>
                <div className="text-[9px] font-mono bg-white/15 text-emerald-350 inline-block px-2 py-0.5 rounded-sm uppercase tracking-wide">
                  Receipt Verified
                </div>
              </div>

              {/* Receipt Body */}
              <div className="p-5 space-y-4 text-xs select-none">
                <div className="border-b border-dashed border-slate-200 pb-3 flex justify-between items-center bg-slate-50 -mx-5 -mt-5 p-4 text-[10px] text-slate-550 font-medium">
                  <div>
                    <span className="block text-[8px] uppercase tracking-wider text-slate-400">Slip ID</span>
                    <strong className="text-slate-700 font-mono font-bold text-[10.5px]">{viewingReceipt.id}</strong>
                  </div>
                  <div className="text-right">
                    <span className="block text-[8px] uppercase tracking-wider text-slate-400">Transaction Date</span>
                    <strong className="text-slate-700">{viewingReceipt.dateRequested}</strong>
                  </div>
                </div>

                {/* Primary Ledger Metadata details */}
                <div className="space-y-2 text-slate-700 text-[11px] leading-relaxed">
                  <div className="flex justify-between">
                    <span className="text-slate-400 text-left">Farmer Name:</span>
                    <strong className="text-slate-800 text-right">{viewingReceipt.farmerName}</strong>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400 text-left">Mobile Number:</span>
                    <strong className="text-slate-800 text-right font-mono">
                      {farmerDistributions.find(f => f.id === viewingReceipt.distributionId)?.mobileNumber || "+91 9800000000"}
                    </strong>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400 text-left">Village Hub Center:</span>
                    <strong className="text-slate-800 text-right">{viewingReceipt.villageName}</strong>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400 text-left">Field Officer / Filer:</span>
                    <strong className="text-slate-800 text-right">{viewingReceipt.assistantName}</strong>
                  </div>

                  <div className="border-t border-dashed border-slate-200 my-2 pt-2"></div>

                  <div className="flex justify-between">
                    <span className="text-slate-400 text-left">Payment Channel:</span>
                    <strong className="text-slate-800 uppercase font-mono tracking-wider text-[10px] bg-slate-100 px-1.5 py-0.5 rounded inline-block text-right">
                      {viewingReceipt.paymentMode}
                    </strong>
                  </div>
                  
                  <div className="flex justify-between">
                    <span className="text-slate-400 text-left">Accounts Cleared By:</span>
                    <strong className="text-slate-800 text-right">{viewingReceipt.approvedBy || "Auditor Certified"}</strong>
                  </div>
                </div>

                {/* Amount Settled Card Block */}
                <div className="bg-emerald-50 border border-emerald-250 p-3 rounded-xl flex justify-between items-center">
                  <div className="text-left">
                    <span className="text-emerald-800 block text-[8px] uppercase font-bold tracking-wider">Total Certified Receipt:</span>
                    <span className="text-emerald-700 text-[9px] font-medium block">Balance accounted successfully.</span>
                  </div>
                  <strong className="text-emerald-800 text-xs font-mono font-extrabold pr-1">
                    ₹ {viewingReceipt.amountProposed.toLocaleString()}
                  </strong>
                </div>

                <div className="text-center text-[9px] text-slate-400 italic">
                  This is an electronically verifiable receipt. Generated on bluetooth node.
                </div>
              </div>

              {/* Receipt Footer Action triggers */}
              <div className="bg-slate-50 p-4 border-t border-slate-100 flex gap-2">
                <button
                  type="button"
                  onClick={() => handleTriggerReceiptAction("whatsapp", viewingReceipt)}
                  className="flex-1 py-1.5 bg-brand-800 hover:bg-brand-900 text-white rounded-lg font-bold text-[10px] flex items-center justify-center gap-1 cursor-pointer transition shadow-xs"
                >
                  <Smartphone size={11} />
                  WhatsApp
                </button>
                <button
                  type="button"
                  onClick={() => handleTriggerReceiptAction("print", viewingReceipt)}
                  className="flex-1 py-1.5 bg-slate-100 hover:bg-slate-200 border border-slate-300 text-slate-700 font-bold text-[10px] flex items-center justify-center gap-1 cursor-pointer transition"
                >
                  <Printer size={11} />
                  Print Physical
                </button>
              </div>
            </div>
          </div>
        )}

        {/* NOTIFICATION TOAST OVERLAY */}
        {receiptToast && (
          <div className="absolute top-4 left-4 right-4 bg-slate-900 text-white p-3.5 rounded-xl shadow-2xl z-50 flex items-center gap-2 animate-in slide-in-from-top-3 duration-250 border border-white/10 text-xs font-semibold leading-snug">
            <CheckCircle2 size={16} className="text-emerald-400 flex-shrink-0" />
            <div className="text-left">{receiptToast}</div>
          </div>
        )}

        {/* REVIEW AND ACKNOWLEDGE MODAL */}
        {reviewingLot && (
          <div className="absolute inset-0 bg-slate-900/60 flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
            <div className="bg-white rounded-2xl w-full max-w-sm overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200 border border-slate-100 flex flex-col max-h-[90%]">
              <div className="bg-brand-900 text-white p-4 flex items-center justify-between sticky top-0 shrink-0">
                <div className="flex items-center gap-2 text-left">
                  <ShieldCheck size={18} className="text-brand-300 shrink-0" />
                  <div>
                    <span className="text-[9px] uppercase tracking-wider text-brand-300 font-bold block">Physical Review Step</span>
                    <h3 className="font-extrabold text-xs">Review & Acknowledge Arrival</h3>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setReviewingLot(null)}
                  className="p-1 hover:bg-white/15 rounded-full transition text-slate-200 cursor-pointer"
                >
                  <X size={18} />
                </button>
              </div>

              <form onSubmit={handleReviewAcknowledgeSubmit} className="flex-1 overflow-y-auto p-4 space-y-4 text-xs">
                <div className="p-3 bg-slate-50 border border-slate-100 rounded-xl space-y-2 text-left">
                  <div className="flex justify-between items-center text-[10px] text-slate-400 font-mono">
                    <span>DISPATCH ID: {reviewingLot.id}</span>
                    <span>Sent: {reviewingLot.dispatchDate}</span>
                  </div>
                  <div>
                    <strong className="text-slate-800 text-sm block font-bold">{reviewingLot.productName}</strong>
                    <span className="text-[11px] text-slate-500 block mt-0.5">Sourced: {reviewingLot.sourceWarehouse}</span>
                  </div>
                  <div className="mt-2 pt-2 border-t border-slate-200/60 flex justify-between items-center">
                    <span className="text-[11px] text-slate-500 font-semibold">Total Bags Despatched:</span>
                    <strong className="text-slate-850 text-sm font-mono font-extrabold">{reviewingLot.bagCount} Bags</strong>
                  </div>
                </div>

                <div className="space-y-3">
                  <h4 className="font-bold text-[11px] text-slate-500 uppercase tracking-wider text-left">Mandatory Checks</h4>
                  
                  <label className="flex items-start gap-2.5 p-2.5 bg-slate-50 border border-slate-150 rounded-xl cursor-pointer">
                    <input
                      type="checkbox"
                      checked={reviewChecklistSeals}
                      onChange={(e) => setReviewChecklistSeals(e.target.checked)}
                      className="mt-0.5 rounded text-brand-600 focus:ring-brand-500 h-3.5 w-3.5 border-slate-350 cursor-pointer"
                      required
                    />
                    <div className="text-left">
                      <span className="font-bold text-slate-700 block text-xs">Bags Intact & Sealed</span>
                      <span className="text-[10px] text-slate-500">Seal & stitch are verified in pristine untampered condition.</span>
                    </div>
                  </label>

                  <label className="flex items-start gap-2.5 p-2.5 bg-slate-50 border border-slate-150 rounded-xl cursor-pointer">
                    <input
                      type="checkbox"
                      checked={reviewChecklistWeight}
                      onChange={(e) => setReviewChecklistWeight(e.target.checked)}
                      className="mt-0.5 rounded text-brand-600 focus:ring-brand-500 h-3.5 w-3.5 border-slate-350 cursor-pointer"
                      required
                    />
                    <div className="text-left">
                      <span className="font-bold text-slate-700 block text-xs">Quantity Count Match</span>
                      <span className="text-[10px] text-slate-500">Physical bags tally with dry dispatch invoice count.</span>
                    </div>
                  </label>
                </div>

                <div className="space-y-1 text-left">
                  <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                    Remarks / Quality Status (Optional)
                  </label>
                  <textarea
                    rows={2}
                    placeholder="e.g. Offloaded successfully, stack conditions dry and secure."
                    value={reviewNotes}
                    onChange={(e) => setReviewNotes(e.target.value)}
                    className="w-full p-2.5 border border-slate-200 rounded-lg text-xs bg-slate-50 text-slate-800 placeholder-slate-400 font-medium"
                  />
                </div>

                <div className="p-3 bg-amber-50 text-amber-800 rounded-xl border border-amber-100 flex items-start gap-2 text-[10px] text-left">
                  <AlertTriangle size={14} className="text-amber-600 flex-shrink-0 mt-0.5" />
                  <span>
                    <strong>Register Note:</strong> This ledger entry updates physical stocking balances across farmer distribution routes immediately.
                  </span>
                </div>

                <div className="flex gap-2.5 pt-1.5 sticky bottom-0 bg-white">
                  <button
                    type="button"
                    onClick={() => setReviewingLot(null)}
                    className="flex-1 py-2 border border-slate-200 rounded-xl font-bold text-slate-500 hover:bg-slate-50 cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-2 bg-brand-600 hover:bg-brand-700 text-white rounded-xl font-bold text-xs cursor-pointer shadow-sm transition"
                  >
                    Approve Receipt
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* REQUEST FERTILIZER MODAL */}
        {showOrderModal && (
          <div className="absolute inset-0 bg-slate-900/60 flex items-center justify-center p-4 z-50 animate-in fade-in duration-200 overflow-hidden">
            <div className="bg-white rounded-2xl w-full max-w-sm overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200 border border-slate-100 flex flex-col max-h-[90%]">
              <div className="bg-brand-800 text-white p-4 flex items-center justify-between sticky top-0 shrink-0">
                <div className="flex items-center gap-2 text-left">
                  <ShoppingBag size={18} className="text-brand-300 shrink-0" />
                  <div>
                    <span className="text-[9px] uppercase tracking-wider text-brand-200 font-bold block">Store Requisition Indent</span>
                    <h3 className="font-extrabold text-xs">Request Fertilizers from Depot</h3>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setShowOrderModal(false)}
                  className="p-1 hover:bg-white/15 rounded-full transition text-slate-200 cursor-pointer"
                >
                  <X size={18} />
                </button>
              </div>

              {orderSuccess ? (
                <div className="p-8 text-center space-y-3">
                  <div className="w-14 h-14 bg-emerald-100 rounded-full flex items-center justify-center mx-auto text-emerald-600">
                    <CheckCircle2 size={32} />
                  </div>
                  <h3 className="text-sm font-bold text-slate-800">Indent Order Sent!</h3>
                  <p className="text-xs text-slate-500 max-w-xs mx-auto">
                    Central Warehouse Manager has been notified of the request.
                  </p>
                </div>
              ) : (
                <form onSubmit={handleRequisitionSubmit} className="flex-1 overflow-y-auto p-4 space-y-4 text-xs">
                  <div className="bg-brand-50 border border-brand-100 p-3 rounded-xl text-left">
                    <span className="text-[9px] text-brand-850 font-bold uppercase tracking-wide block">Requesting Center</span>
                    <strong className="text-brand-900 text-xs block mt-0.5">{currentAssistantVillage} Center</strong>
                    <span className="text-[10px] text-brand-600 block">Raised by: {currentAssistantName}</span>
                  </div>

                  <div className="text-left">
                    <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                      Fertilizer Product
                    </label>
                    <select
                      value={orderProduct}
                      onChange={(e) => setOrderProduct(e.target.value)}
                      className="w-full p-2.5 border border-slate-200 rounded-lg text-xs bg-slate-50"
                      required
                    >
                      {DEMO_FERTILIZERS.map((f) => (
                        <option key={f} value={f}>{f}</option>
                      ))}
                    </select>
                  </div>

                  <div className="text-left">
                    <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                      Bags Count Required
                    </label>
                    <input
                      type="number"
                      min={5}
                      max={500}
                      value={orderBags}
                      onChange={(e) => setOrderBags(parseInt(e.target.value) || 0)}
                      className="w-full p-2.5 border border-slate-200 rounded-lg text-xs bg-slate-50 font-mono font-bold"
                      required
                    />
                    <span className="text-[9.5px] text-slate-400 mt-1 block">Specify physical bags needed.</span>
                  </div>

                  <div className="text-left">
                    <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                      Justification Note / Special Instructions
                    </label>
                    <textarea
                      rows={3}
                      placeholder="e.g. Sowing starts soon, highly urgent stock replen."
                      value={orderNotes}
                      onChange={(e) => setOrderNotes(e.target.value)}
                      className="w-full p-2.5 border border-slate-200 rounded-lg text-xs bg-slate-50 placeholder-slate-400 font-medium"
                    />
                  </div>

                  <div className="flex gap-2.5 pt-2 sticky bottom-0 bg-white">
                    <button
                      type="button"
                      onClick={() => setShowOrderModal(false)}
                      className="flex-1 py-2 border border-slate-200 rounded-xl font-bold text-slate-500 hover:bg-slate-50 cursor-pointer"
                    >
                      Close
                    </button>
                    <button
                      type="submit"
                      className="flex-1 py-2 bg-brand-800 hover:bg-brand-900 text-white rounded-xl font-bold text-xs cursor-pointer shadow-sm transition"
                    >
                      Submit Indent Request
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        )}

        {/* HARVEST COLLECTION RECEIPT MODAL */}
        {selectedHarvestReceipt && (() => {
          const matchedFarmer = enrolledFarmers.find(f => f.id === selectedHarvestReceipt.farmerId);
          return (
            <div className="absolute inset-0 bg-slate-900/60 flex items-center justify-center p-4 z-50 animate-in fade-in duration-200 overflow-hidden">
              <div className="bg-white rounded-2xl w-full max-w-sm overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200 border border-slate-100 flex flex-col max-h-[90%]">
                <div className="bg-emerald-800 text-white p-4 flex items-center justify-between sticky top-0 shrink-0">
                  <div className="flex items-center gap-2 text-left">
                    <CheckSquare size={18} className="text-emerald-300 shrink-0" />
                    <div>
                      <span className="text-[9px] uppercase tracking-wider text-emerald-200 font-bold block">iVillage Sourcing</span>
                      <h3 className="font-extrabold text-xs">Crop Sourcing Receipt</h3>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setSelectedHarvestReceipt(null)}
                    className="p-1 hover:bg-white/15 rounded-full transition text-slate-150 cursor-pointer"
                  >
                    <X size={18} />
                  </button>
                </div>

                <div className="flex-1 overflow-y-auto p-4 space-y-4 text-xs text-left">
                  {/* Sourcing stamp */}
                  <div className="border-2 border-dashed border-emerald-200 p-3 bg-emerald-50/20 rounded-xl text-center space-y-1">
                    <span className="text-[10px] text-slate-400 font-bold uppercase block">Receipt ID</span>
                    <strong className="text-emerald-800 text-sm font-mono tracking-widest uppercase block">{selectedHarvestReceipt.id}</strong>
                    <span className="text-[9px] text-slate-400 block font-mono">Date Sourced: {selectedHarvestReceipt.dateCollected}</span>
                  </div>

                  {/* Sourcing specifics */}
                  <div className="space-y-2 border-b border-slate-100 pb-3">
                    <span className="text-[9.5px] uppercase font-bold text-slate-450 tracking-wider block">Farmer Details</span>
                    <div className="flex justify-between text-xs">
                      <span className="text-slate-500">Farmer Name:</span>
                      <strong className="text-slate-800 font-bold">{selectedHarvestReceipt.farmerName}</strong>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span className="text-slate-500">Contact Number:</span>
                      <span className="text-slate-700 font-mono">{selectedHarvestReceipt.mobileNumber}</span>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span className="text-slate-500">Village Center:</span>
                      <span className="text-slate-700 font-medium">{currentAssistantVillage}</span>
                    </div>
                  </div>

                  <div className="space-y-2 border-b border-slate-100 pb-3">
                    <span className="text-[9.5px] uppercase font-bold text-slate-450 tracking-wider block">Crop Weights & Payout</span>
                    <div className="flex justify-between text-xs">
                      <span className="text-slate-500">Crop Category:</span>
                      <strong className="text-slate-800 font-bold">{selectedHarvestReceipt.cropName}</strong>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span className="text-slate-500">Total Net Weight:</span>
                      <strong className="text-slate-900 font-bold font-mono">{selectedHarvestReceipt.weightKg} KGs</strong>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span className="text-slate-500">Accounting Sourcing Rate:</span>
                      <span className="text-slate-700 font-mono">₹ {selectedHarvestReceipt.ratePerKg.toFixed(2)} / Kg</span>
                    </div>
                    
                    <div className="flex justify-between text-xs pt-2 border-t border-slate-100/60 font-bold text-emerald-800 bg-emerald-50/50 p-2 rounded-lg">
                      <span>Direct Credit Payable:</span>
                      <span className="font-mono text-sm">₹ {selectedHarvestReceipt.totalAmount.toLocaleString()}</span>
                    </div>
                  </div>

                  {/* Bank Details */}
                  <div className="space-y-2 bg-slate-50 border border-slate-150 p-3 rounded-xl">
                    <span className="text-[9.5px] uppercase font-bold text-brand-800 tracking-wider block">Registered Bank Account</span>
                    <div className="text-[11px] text-slate-700 space-y-1">
                      <div className="flex justify-between">
                        <span className="text-slate-450">Settlement Bank:</span>
                        <span className="font-semibold">{matchedFarmer?.bankName || "State Bank of India"}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-450">Account Number:</span>
                        <span className="font-mono font-semibold">{matchedFarmer?.accountNumber || "XXXXXXXXXX"}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-450">IFSC Code:</span>
                        <span className="font-mono font-semibold">{matchedFarmer?.ifscCode || "SBIN0000000"}</span>
                      </div>
                    </div>
                  </div>

                  <div className="pt-2">
                    <button
                      type="button"
                      onClick={() => {
                        const msg = `iVillage Sourcing Receipt *${selectedHarvestReceipt.id}*\nFarmer: ${selectedHarvestReceipt.farmerName}\nCrop: ${selectedHarvestReceipt.cropName}\nWeight: ${selectedHarvestReceipt.weightKg} Kg\nNet Payout: ₹${selectedHarvestReceipt.totalAmount.toLocaleString()}\nDirect Bank Settlement Queued!`;
                        const link = `https://api.whatsapp.com/send?phone=${selectedHarvestReceipt.mobileNumber}&text=${encodeURIComponent(msg)}`;
                        // Simulate whatsapp share popup
                        alert(`Sharing Receipt via WhatsApp to ${selectedHarvestReceipt.mobileNumber}:\n\n${msg}`);
                        window.open(link, "_blank");
                      }}
                      className="w-full py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold rounded-xl shadow-xs transition text-xs flex items-center justify-center gap-2 cursor-pointer"
                    >
                      <Share size={13} />
                      Share Receipt via WhatsApp
                    </button>
                  </div>

                  <button
                    type="button"
                    onClick={() => setSelectedHarvestReceipt(null)}
                    className="w-full py-2 border border-slate-200 text-slate-500 font-bold rounded-xl hover:bg-slate-50 cursor-pointer text-center block text-xs"
                  >
                    Close & Finish
                  </button>
                </div>
              </div>
            </div>
          );
        })()}

        {activeTab === "verification" && (() => {
          const farmers = Array.isArray(enrolledFarmers) ? enrolledFarmers : [];
          const verifications = Array.isArray(fieldVerifications) ? fieldVerifications : [];
          const requests = Array.isArray(paymentRequests) ? paymentRequests : [];
          const assistantVillage = (currentAssistantVillage || "").toLowerCase();

          return (
            <div className="space-y-4 text-left">
              {/* Top alert / guide */}
              <div className="bg-gradient-to-r from-emerald-800 to-brand-900 text-white p-4 rounded-2xl shadow-md space-y-2 relative overflow-hidden">
                <div className="absolute right-0 bottom-0 translate-x-1/4 translate-y-1/4 opacity-10">
                  <Compass size={180} />
                </div>
                <div className="relative z-10 flex items-start gap-3">
                  <div className="p-2 bg-white/10 rounded-xl shrink-0 mt-0.5">
                    <FileCheck size={20} className="text-emerald-300" />
                  </div>
                  <div>
                    <h3 className="font-extrabold text-sm tracking-wide uppercase text-emerald-200">
                      Physical Crop Sowing &amp; Acreage Audit
                    </h3>
                    <p className="text-[11px] text-white/80 leading-relaxed mt-1 max-w-2xl">
                      Every beneficiary who has received a sowing/plantation advance must undergo a physical GPS coordinate-locked and photo-verified field audit. This eliminates duplicate claims and ensures total transparency before final harvest payment.
                    </p>
                  </div>
                </div>
              </div>

              {/* Verification Statistics Panel */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-3xs flex flex-col justify-between min-h-[90px] sm:min-h-[105px]">
                  <span className="text-[9px] sm:text-[10px] font-extrabold text-slate-400 uppercase tracking-wide leading-tight min-h-[28px] flex items-center" title="Local Enrolled Farmers">
                    Local Enrolled Farmers
                  </span>
                  <span className="text-xl sm:text-2xl font-black text-slate-800 font-mono mt-1">
                    {farmers.filter(f => (f.villageName || "").toLowerCase() === assistantVillage).length}
                  </span>
                </div>
                <div className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-3xs flex flex-col justify-between min-h-[90px] sm:min-h-[105px]">
                  <span className="text-[9px] sm:text-[10px] font-extrabold text-slate-400 uppercase tracking-wide leading-tight min-h-[28px] flex items-center" title="Pending Accountant Audit">
                    Pending Accountant Audit
                  </span>
                  <span className="text-xl sm:text-2xl font-black text-amber-600 font-mono mt-1 flex items-center gap-1.5">
                    {verifications.filter(v => (v.villageName || "").toLowerCase() === assistantVillage && v.status === "Pending Review").length}
                    {verifications.filter(v => (v.villageName || "").toLowerCase() === assistantVillage && v.status === "Pending Review").length > 0 && (
                      <span className="w-2 h-2 rounded-full bg-amber-500 animate-ping shrink-0" />
                    )}
                  </span>
                </div>
                <div className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-3xs flex flex-col justify-between min-h-[90px] sm:min-h-[105px]">
                  <span className="text-[9px] sm:text-[10px] font-extrabold text-slate-400 uppercase tracking-wide leading-tight min-h-[28px] flex items-center" title="Audits Verified &amp; Passed">
                    Audits Verified &amp; Passed
                  </span>
                  <span className="text-xl sm:text-2xl font-black text-emerald-600 font-mono mt-1">
                    {verifications.filter(v => (v.villageName || "").toLowerCase() === assistantVillage && (v.status === "Passed" || v.status === "Approved / Passed")).length}
                  </span>
                </div>
                <div className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-3xs flex flex-col justify-between min-h-[90px] sm:min-h-[105px]">
                  <span className="text-[9px] sm:text-[10px] font-extrabold text-slate-400 uppercase tracking-wide leading-tight min-h-[28px] flex items-center" title="Audits Flagged / Rejected">
                    Audits Flagged / Rejected
                  </span>
                  <span className="text-xl sm:text-2xl font-black text-rose-600 font-mono mt-1">
                    {verifications.filter(v => (v.villageName || "").toLowerCase() === assistantVillage && (v.status === "Rejected" || v.status === "Rejected / Flagged")).length}
                  </span>
                </div>
              </div>

              {/* Success Alert Banner */}
              {verificationSuccessAlert && (
                <div className="bg-emerald-50 border border-emerald-200 p-3.5 rounded-xl text-emerald-800 text-xs font-semibold flex items-center gap-2 animate-in fade-in duration-200">
                  <CheckCircle2 size={16} className="text-emerald-600 shrink-0" />
                  <span>{verificationSuccessAlert}</span>
                </div>
              )}

              {/* Farmer Audit Roster */}
              <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
                <div className="p-4 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-50/50">
                  <div>
                    <h3 className="font-extrabold text-xs text-slate-800">Acreage Verification Roster</h3>
                    <p className="text-[10.5px] text-slate-400">Manage, inspect, and submit audit reports for farmers in {currentAssistantVillage} village.</p>
                  </div>
                  <div className="bg-white px-3 py-1.5 rounded-xl border border-slate-200 flex items-center gap-2 w-full sm:w-64 shadow-3xs">
                    <Search size={14} className="text-slate-400 shrink-0" />
                    <input
                      type="text"
                      placeholder="Search farmer name..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full text-xs bg-transparent outline-none border-none placeholder-slate-400 text-slate-800"
                    />
                  </div>
                </div>

                {/* Status Filter Tabs */}
                <div className="px-4 py-3 bg-slate-50/30 border-b border-slate-100 flex flex-wrap gap-1.5 items-center">
                  <span className="text-[9px] sm:text-[10px] uppercase tracking-wider text-slate-400 font-black mr-2">Filter Status:</span>
                  {[
                    { id: "all", label: "All Farmers", count: farmers.filter(f => (f.villageName || "").toLowerCase() === assistantVillage).length },
                    { id: "not_audited", label: "Not Audited", count: farmers.filter(f => (f.villageName || "").toLowerCase() === assistantVillage && !verifications.some(v => v.farmerId === f.id)).length },
                    { id: "pending", label: "Pending Audit", count: verifications.filter(v => (v.villageName || "").toLowerCase() === assistantVillage && v.status === "Pending Review").length },
                    { id: "passed", label: "Passed Audit", count: verifications.filter(v => (v.villageName || "").toLowerCase() === assistantVillage && (v.status === "Passed" || v.status === "Approved / Passed")).length },
                    { id: "rejected", label: "Flagged / Rejected", count: verifications.filter(v => (v.villageName || "").toLowerCase() === assistantVillage && (v.status === "Rejected" || v.status === "Rejected / Flagged")).length }
                  ].map((filter) => (
                    <button
                      key={filter.id}
                      type="button"
                      onClick={() => setRosterFilter(filter.id as any)}
                      className={`px-3 py-1.5 rounded-xl text-[10px] sm:text-[11px] font-bold transition flex items-center gap-1.5 cursor-pointer border ${
                        rosterFilter === filter.id
                          ? "bg-brand-800 text-white border-brand-900 shadow-sm"
                          : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50 hover:text-slate-900"
                      }`}
                    >
                      <span>{filter.label}</span>
                      <span className={`px-1.5 py-0.5 rounded-full text-[8.5px] font-black ${
                        rosterFilter === filter.id ? "bg-white/20 text-white" : "bg-slate-100 text-slate-550"
                      }`}>
                        {filter.count}
                      </span>
                    </button>
                  ))}
                </div>

                <div className="overflow-x-auto">
                  <table className="min-w-[950px] w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="bg-slate-50/85 border-b border-slate-200 text-slate-550 font-black uppercase tracking-wider text-[9px]">
                        <th className="py-3 px-4 w-28 whitespace-nowrap">Farmer ID</th>
                        <th className="py-3 px-4 whitespace-nowrap">Farmer Name / Area</th>
                        <th className="py-3 px-4 w-32 whitespace-nowrap">Declared Sowing</th>
                        <th className="py-3 px-4 w-60 whitespace-nowrap">Sowing Advance Payment</th>
                        <th className="py-3 px-4 text-center w-56 whitespace-nowrap">Audit Status</th>
                        <th className="py-3 px-4 text-right w-44 whitespace-nowrap">Audit Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 font-semibold text-slate-800">
                      {farmers
                        .filter(f => (f.villageName || "").toLowerCase() === assistantVillage)
                        .filter(f => {
                          const matchedVerification = verifications.find(v => v.farmerId === f.id);
                          if (rosterFilter === "all") return true;
                          if (rosterFilter === "not_audited") return !matchedVerification;
                          if (rosterFilter === "pending") return matchedVerification && matchedVerification.status === "Pending Review";
                          if (rosterFilter === "passed") return matchedVerification && (matchedVerification.status === "Passed" || matchedVerification.status === "Approved / Passed");
                          if (rosterFilter === "rejected") return matchedVerification && (matchedVerification.status === "Rejected" || matchedVerification.status === "Rejected / Flagged");
                          return true;
                        })
                        .filter(f => searchQuery === "" || (f.farmerName || "").toLowerCase().includes(searchQuery.toLowerCase()))
                        .map((farmer) => {
                          // Find if this farmer has a logged advance payment request
                          const matchedAdvance = requests.find(
                            pr => (pr.farmerName || "").toLowerCase().trim() === (farmer.farmerName || "").toLowerCase().trim()
                          );
                          
                          const isAdvancePaid = matchedAdvance && matchedAdvance.status === "Approved";
                          const isAdvancePending = matchedAdvance && matchedAdvance.status === "Pending";

                          // Find if this farmer has a verification record
                          const matchedVerification = verifications.find(
                            v => v.farmerId === farmer.id
                          );

                          return (
                            <tr key={farmer.id} className="hover:bg-slate-50/40 transition">
                              <td className="py-3.5 px-4 font-mono text-[10.5px] text-slate-500 whitespace-nowrap">
                                {farmer.id}
                              </td>
                              <td className="py-3.5 px-4">
                                <span className="font-extrabold text-slate-800 block text-[11.5px]">{farmer.farmerName}</span>
                                <span className="text-[10px] text-slate-400 flex items-center gap-1 font-medium mt-0.5 whitespace-nowrap">
                                  <MapPin size={10} /> {farmer.fields || "Central Sector"}
                                </span>
                              </td>
                              <td className="py-3.5 px-4 whitespace-nowrap">
                                <span className="text-slate-850 block text-[11px] font-extrabold">{farmer.acres} Acres</span>
                                <span className="text-[10px] text-slate-400 font-medium font-mono block mt-0.5">
                                  {farmer.seedVariety ? farmer.seedVariety.split(" ")[0] : "Maize"} Seed
                                </span>
                              </td>
                              <td className="py-3.5 px-4">
                                {isAdvancePaid ? (
                                  <div className="space-y-0.5">
                                    <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-[9px] font-bold whitespace-nowrap">
                                      <Check size={10} /> ₹ {matchedAdvance.amountProposed.toLocaleString()} Paid
                                    </span>
                                    <span className="text-[9.5px] text-slate-400 block font-mono pl-1 whitespace-nowrap">Adv ID: {matchedAdvance.id}</span>
                                  </div>
                                ) : isAdvancePending ? (
                                  <div className="space-y-0.5">
                                    <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-amber-50 border border-amber-200 text-amber-700 text-[9px] font-bold whitespace-nowrap animate-pulse">
                                      <Clock size={10} className="animate-spin" /> ₹ {matchedAdvance.amountProposed.toLocaleString()} Pending
                                    </span>
                                    <span className="text-[9.5px] text-slate-400 block font-mono pl-1 whitespace-nowrap">Awaiting central release</span>
                                  </div>
                                ) : (
                                  <div className="space-y-0.5">
                                    <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-slate-50 border border-slate-200 text-slate-500 text-[9px] font-bold whitespace-nowrap">
                                      No Sowing Advance Logged
                                    </span>
                                    <span className="text-[9.5px] text-slate-400 block pl-1 font-mono whitespace-nowrap">Verify anyways or check accounts</span>
                                  </div>
                                )}
                              </td>
                              <td className="py-3.5 px-4 text-center">
                                {!matchedVerification ? (
                                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl bg-slate-100 border border-slate-200 text-slate-600 text-[10px] font-bold whitespace-nowrap">
                                    Not Audited
                                  </span>
                                ) : matchedVerification.status === "Pending Review" ? (
                                  <div className="inline-flex flex-col items-center gap-0.5">
                                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl bg-amber-50 border border-amber-200 text-amber-700 text-[10px] font-bold whitespace-nowrap">
                                      <Clock size={10} className="animate-pulse" /> Pending Central Audit
                                    </span>
                                    <span className="text-[9px] text-slate-400 font-mono whitespace-nowrap">Sent on {matchedVerification.verificationDate}</span>
                                  </div>
                                ) : (matchedVerification.status === "Passed" || matchedVerification.status === "Approved / Passed") ? (
                                  <div className="inline-flex flex-col items-center gap-0.5">
                                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-[10px] font-bold whitespace-nowrap">
                                      <CheckCircle2 size={10} /> PASSED AUDIT
                                    </span>
                                    <span className="text-[10px] font-mono text-emerald-800 font-extrabold whitespace-nowrap">{matchedVerification.verifiedAcres} Acres Verified</span>
                                  </div>
                                ) : (
                                  <div className="inline-flex flex-col items-center gap-1">
                                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-[10px] font-bold whitespace-nowrap">
                                      <AlertTriangle size={10} /> REJECTED / FLAGGED
                                    </span>
                                    <div className="bg-rose-50/50 p-1.5 rounded-lg border border-rose-100 text-[9.5px] text-rose-800 max-w-xs text-center font-medium mt-0.5 italic whitespace-normal leading-tight">
                                      &ldquo;{matchedVerification.rejectionReason || "Acreage details suspicious."}&rdquo;
                                    </div>
                                  </div>
                                )}
                              </td>
                              <td className="py-3.5 px-4 text-right whitespace-nowrap">
                                {!matchedVerification ? (
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setInspectingFarmer(farmer);
                                      setVerifiedAcres(farmer.acres);
                                      setShowVerificationForm(true);
                                      setGpsCoords(null);
                                    }}
                                    className="py-1.5 px-3 bg-brand-800 hover:bg-brand-900 text-white rounded-lg text-[10.5px] font-bold transition inline-flex items-center gap-1 shadow-3xs cursor-pointer"
                                  >
                                    <Compass size={11} /> Perform Tally
                                  </button>
                                ) : matchedVerification.status === "Pending Review" ? (
                                  <button
                                    type="button"
                                    onClick={() => {
                                      alert(`Inspection details submitted for ${farmer.farmerName}:\n- Verified Acres: ${matchedVerification.verifiedAcres}\n- GPS Coords: ${matchedVerification.latitude}, ${matchedVerification.longitude}\n- Photo Ref: ${matchedVerification.photoLabel}\n- Supervisor Comments: "${matchedVerification.comments}"\n\nCurrently waiting for Accountant review. Edit is disabled unless rejected.`);
                                    }}
                                    className="py-1.5 px-3 border border-slate-200 hover:bg-slate-50 text-slate-500 rounded-lg text-[10.5px] font-bold transition inline-flex items-center gap-1 cursor-pointer"
                                  >
                                    <Eye size={11} /> View Submission
                                  </button>
                                ) : (matchedVerification.status === "Passed" || matchedVerification.status === "Approved / Passed") ? (
                                  <button
                                    type="button"
                                    onClick={() => {
                                      alert(`Approved Audit details for ${farmer.farmerName}:\n- Final Approved Acres: ${matchedVerification.verifiedAcres} (Declared: ${matchedVerification.declaredAcres})\n- Coordinates: ${matchedVerification.latitude}, ${matchedVerification.longitude}\n- Audit Date: ${matchedVerification.verificationDate}\n- Supervisor Notes: "${matchedVerification.comments}"\n\nThis record is locked in the central ledger.`);
                                    }}
                                    className="py-1.5 px-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-lg text-[10.5px] font-bold transition inline-flex items-center gap-1 cursor-pointer"
                                  >
                                    <Eye size={11} /> Locked Ledger
                                  </button>
                                ) : (
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setInspectingFarmer(farmer);
                                      setVerifiedAcres(matchedVerification.verifiedAcres || farmer.acres);
                                      setGpsCoords({
                                        lat: matchedVerification.latitude,
                                        lng: matchedVerification.longitude,
                                        accuracy: 3
                                      });
                                      setSelectedPhoto(matchedVerification.photoUrl);
                                      setSelectedPhotoLabel(matchedVerification.photoLabel);
                                      setInspectionComments(matchedVerification.comments || "");
                                      setShowVerificationForm(true);
                                    }}
                                    className="py-1.5 px-3 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-[10.5px] font-bold transition inline-flex items-center gap-1 shadow-3xs cursor-pointer"
                                  >
                                    <RefreshCw size={11} /> Re-verify Field
                                  </button>
                                )}
                              </td>
                            </tr>
                          );
                        })}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          );
        })()}

        {/* FIELD INSPECTION FORM OVERLAY */}
        {showVerificationForm && inspectingFarmer && (
          <div className="absolute inset-0 bg-slate-900/60 flex items-center justify-center p-4 z-50 animate-in fade-in duration-200 overflow-y-auto">
            <div className="bg-white rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200 border border-slate-100 flex flex-col max-h-[92%] my-auto">
              <div className="bg-brand-900 text-white p-4 flex items-center justify-between sticky top-0 shrink-0 z-10">
                <div className="flex items-center gap-2.5 text-left">
                  <Compass size={18} className="text-emerald-400 shrink-0 animate-spin-slow" />
                  <div>
                    <span className="text-[9px] uppercase tracking-wider text-white/60 font-bold block">Supervisor Physical Audit</span>
                    <h3 className="font-extrabold text-xs">Field Verification &amp; Tally Form</h3>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setShowVerificationForm(false);
                    setInspectingFarmer(null);
                  }}
                  className="p-1 hover:bg-white/10 rounded-full transition text-white/70 cursor-pointer"
                >
                  <X size={18} />
                </button>
              </div>

              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  if (!inspectingFarmer) return;

                  const duplicate = fieldVerifications.find(
                    (v) =>
                      v.farmerId === inspectingFarmer.id &&
                      (v.status === "Pending Review" || v.status === "Approved / Passed")
                  );
                  if (duplicate) {
                    alert(`Accuracy Guard: A verification request is already ${duplicate.status.toLowerCase()} for ${inspectingFarmer.farmerName}. Duplicate records are prohibited.`);
                    return;
                  }

                  if (!gpsCoords) {
                    alert("Verification Rejected: GPS Coordinate lock is required for physical audit compliance. Please capture coordinates first.");
                    return;
                  }

                  const newVerification = {
                    id: `FV-${Date.now().toString().slice(-6)}`,
                    farmerId: inspectingFarmer.id,
                    farmerName: inspectingFarmer.farmerName,
                    villageName: inspectingFarmer.villageName,
                    declaredAcres: Number(inspectingFarmer.acres) || 0,
                    verifiedAcres: Number(verifiedAcres) || 0,
                    latitude: gpsCoords.lat,
                    longitude: gpsCoords.lng,
                    photoUrl: selectedPhoto,
                    photoLabel: selectedPhotoLabel,
                    status: "Pending Review",
                    verificationDate: new Date().toISOString().split("T")[0],
                    assistantName: currentAssistantName,
                    comments: inspectionComments.trim() || "Acreage verified by supervisor."
                  };

                  const filtered = fieldVerifications.filter(v => !(v.farmerId === inspectingFarmer.id && (v.status === "Rejected" || v.status === "Rejected / Flagged")));
                  const updated = [newVerification, ...filtered];
                  
                  updateFieldVerifications(updated);

                  const savedNotifs = localStorage.getItem("ks_notifications");
                  let notificationsList = savedNotifs ? JSON.parse(savedNotifs) : [];
                  const newNotif = {
                    id: `N-FV-${Date.now()}`,
                    title: "New Field Tally Awaiting Review",
                    message: `${currentAssistantName} submitted GPS/Photo field audit for ${inspectingFarmer.farmerName} (${verifiedAcres} Acres).`,
                    type: "approval",
                    time: "Just now",
                    isRead: false,
                    role: "Accountant"
                  };
                  notificationsList = [newNotif, ...notificationsList];
                  localStorage.setItem("ks_notifications", JSON.stringify(notificationsList));

                  setVerificationSuccessAlert(`Successfully submitted physical acreage audit for ${inspectingFarmer.farmerName} to the Central Accountant for review!`);
                  setShowVerificationForm(false);
                  setInspectingFarmer(null);
                  setGpsCoords(null);
                  setInspectionComments("");

                  setTimeout(() => {
                    setVerificationSuccessAlert(null);
                  }, 5000);
                }}
                className="flex-1 overflow-y-auto p-4 space-y-4 text-xs text-left"
              >
                {/* Farmer Overview Banner */}
                <div className="bg-slate-50 border border-slate-200 p-3.5 rounded-xl space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-[10px] font-bold uppercase text-slate-400 tracking-wider">Farmer Under Audit</span>
                    <span className="font-mono text-[10px] text-brand-800 bg-brand-50 px-1.5 py-0.5 rounded font-bold">
                      {inspectingFarmer.id}
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <span className="text-[10px] text-slate-400 block font-medium">Farmer Name</span>
                      <strong className="text-slate-800 text-sm font-bold block">{inspectingFarmer.farmerName}</strong>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 block font-medium">Enrolled Village Boundary</span>
                      <strong className="text-slate-800 text-sm font-bold block">{inspectingFarmer.villageName}</strong>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 block font-medium">Enrolled Seed Variety</span>
                      <span className="text-slate-700 font-semibold block">{inspectingFarmer.seedVariety || "Premium Maize Special"}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 block font-medium">Declared Sown Acreage</span>
                      <strong className="text-slate-800 font-bold text-xs flex items-center gap-1">
                        <CheckSquare size={12} className="text-brand-800" /> {inspectingFarmer.acres} Acres
                      </strong>
                    </div>
                  </div>
                </div>

                {/* Sowing Advance Warning Check */}
                {(() => {
                  const requests = Array.isArray(paymentRequests) ? paymentRequests : [];
                  const hasAdvance = requests.some(
                    pr => (pr.farmerName || "").toLowerCase().trim() === (inspectingFarmer.farmerName || "").toLowerCase().trim() && pr.status === "Approved"
                  );
                  if (!hasAdvance) {
                    return (
                      <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-amber-800 flex items-start gap-2">
                        <AlertTriangle size={15} className="shrink-0 text-amber-600 mt-0.5" />
                        <div className="text-[10.5px] font-semibold leading-relaxed">
                          <strong className="font-bold text-amber-900 block">Sowing Advance Check Required</strong>
                          No approved sowing advance payment has been finalized for this farmer in the Central accounts ledger yet. Ensure this physical verification is still valid for processing.
                        </div>
                      </div>
                    );
                  }
                  return null;
                })()}

                {/* Step 1: Acreage input */}
                <div className="space-y-1.5">
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                    Actual standing Crop cultivation Acreage (Acres)
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="number"
                      step="0.1"
                      required
                      value={verifiedAcres}
                      onChange={(e) => setVerifiedAcres(Math.max(0.1, parseFloat(e.target.value) || 0))}
                      className="w-full p-2.5 border border-slate-200 rounded-xl font-bold text-slate-800 bg-slate-50 text-xs focus:ring-1 focus:ring-brand-800 outline-none"
                    />
                    <div className="bg-slate-100 border border-slate-200 px-4 py-2.5 rounded-xl font-bold text-slate-600 flex items-center shrink-0">
                      Acres Tally
                    </div>
                  </div>
                  {Number(verifiedAcres) > Number(inspectingFarmer.acres) && (
                    <div className="p-2.5 bg-rose-50 border border-rose-150 rounded-lg text-rose-800 text-[10px] font-semibold flex items-center gap-1.5 animate-pulse">
                      <AlertTriangle size={12} className="text-rose-600 shrink-0" />
                      <span>Fraud Check: verified acres exceed enrolled declarations by {(((Number(verifiedAcres) - Number(inspectingFarmer.acres)) / Number(inspectingFarmer.acres)) * 100).toFixed(1)}%. Central Audit may flag this.</span>
                    </div>
                  )}
                </div>

                {/* Step 2: Simulated Live GPS Capture */}
                <div className="space-y-2 border-t border-slate-100 pt-3">
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                    Physical GPS Boundary Coordinates Lock
                  </label>
                  <div className="flex flex-col sm:flex-row gap-2.5">
                    <button
                      type="button"
                      onClick={() => {
                        setGpsLoading(true);
                        setTimeout(() => {
                          const offsetLat = (Math.random() - 0.5) * 0.002;
                          const offsetLng = (Math.random() - 0.5) * 0.002;
                          setGpsCoords({
                            lat: Number((22.7543 + offsetLat).toFixed(6)),
                            lng: Number((75.8921 + offsetLng).toFixed(6)),
                            accuracy: Number((2.5 + Math.random() * 2).toFixed(1))
                          });
                          setGpsLoading(false);
                        }, 1000);
                      }}
                      className="py-2.5 px-4 bg-slate-900 hover:bg-black text-white rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 shrink-0 cursor-pointer"
                    >
                      {gpsLoading ? (
                        <>
                          <RefreshCw size={13} className="animate-spin text-emerald-400" />
                          Locking Satellite GPS...
                        </>
                      ) : (
                        <>
                          <Compass size={13} className="text-emerald-400" />
                          Capture GPS Plot Coords
                        </>
                      )}
                    </button>

                    {gpsCoords ? (
                      <div className="flex-1 bg-emerald-50/50 border border-emerald-200 p-2 rounded-xl flex items-center justify-between">
                        <div className="text-[10px] space-y-0.5">
                          <span className="text-emerald-800 font-extrabold flex items-center gap-1">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping inline-block" />
                            GPS Position Verified Lock
                          </span>
                          <span className="font-mono text-slate-600 block font-semibold">
                            Lat: {gpsCoords.lat}, Lng: {gpsCoords.lng}
                          </span>
                        </div>
                        <span className="text-[9.5px] text-emerald-700 bg-emerald-100/50 px-2 py-0.5 rounded font-mono font-bold shrink-0">
                          &plusmn;{gpsCoords.accuracy}m Accuracy
                        </span>
                      </div>
                    ) : (
                      <div className="flex-1 bg-slate-50 border border-slate-200 p-2 rounded-xl flex items-center justify-center text-slate-400 italic text-[10.5px]">
                        No active GPS lock standing on field. Capture coordinate audit log.
                      </div>
                    )}
                  </div>
                </div>

                {/* Step 3: Photo Verification */}
                <div className="space-y-2 border-t border-slate-100 pt-3">
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                    Standing Crop visual Photo Verification
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {/* Visual Preset Selector */}
                    <div className="space-y-1.5">
                      <span className="text-[9.5px] font-bold text-slate-400 block uppercase">Select Sowing Crop Stage</span>
                      {[
                        { label: "Healthy Maize Crop - Tassel Stage", url: "https://images.unsplash.com/photo-1551893086-c02450bd01d6?w=400&auto=format&fit=crop&q=60" },
                        { label: "Golden Corn Cobs - Ready for Harvest", url: "https://images.unsplash.com/photo-1530595467537-0b5996c41f2d?w=400&auto=format&fit=crop&q=60" },
                        { label: "Seedling & Sprout Emergence", url: "https://images.unsplash.com/photo-1523348837708-15d4a09cfac2?w=400&auto=format&fit=crop&q=60" },
                        { label: "Sowing and Soil Preparation", url: "https://images.unsplash.com/photo-1500937386664-56d1dfef3854?w=400&auto=format&fit=crop&q=60" }
                      ].map((item, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => {
                            setSelectedPhoto(item.url);
                            setSelectedPhotoLabel(item.label);
                          }}
                          className={`w-full text-left p-1.5 rounded-lg border text-[10px] font-bold transition flex items-center justify-between cursor-pointer ${
                            selectedPhotoLabel === item.label
                              ? "bg-brand-50 border-brand-300 text-brand-900 shadow-3xs"
                              : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50"
                          }`}
                        >
                          <span>{item.label}</span>
                          <span className="w-1.5 h-1.5 rounded-full bg-brand-800 opacity-80" />
                        </button>
                      ))}
                    </div>

                    {/* Camera Preview */}
                    <div className="space-y-1.5">
                      <span className="text-[9.5px] font-bold text-slate-400 block uppercase">Visual Camera Preview</span>
                      <div className="relative rounded-xl overflow-hidden border border-slate-250 aspect-video bg-slate-900 flex flex-col items-center justify-center text-white">
                        {cameraLoading ? (
                          <div className="space-y-2 text-center">
                            <RefreshCw size={24} className="animate-spin text-emerald-400 mx-auto" />
                            <span className="text-[10px] font-mono tracking-wider block text-slate-300">SNAPPING PICTURE...</span>
                          </div>
                        ) : (
                          <>
                            <img
                              src={selectedPhoto}
                              alt="Crop field inspection preview"
                              referrerPolicy="no-referrer"
                              className="w-full h-full object-cover"
                            />
                            <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 to-transparent p-2 text-left">
                              <span className="text-[8px] uppercase tracking-wider text-slate-300 font-mono block">GPS-STAMPED CAPTURE</span>
                              <strong className="text-[10px] font-bold text-white font-sans block truncate">{selectedPhotoLabel}</strong>
                            </div>
                            <button
                              type="button"
                              onClick={() => {
                                setCameraLoading(true);
                                setTimeout(() => {
                                  setCameraLoading(false);
                                  alert("Live camera simulated! Physical crop photo snapped and coordinate-stamped successfully.");
                                }, 800);
                              }}
                              className="absolute top-2 right-2 p-1.5 bg-black/55 hover:bg-black/85 text-white rounded-lg transition"
                              title="Re-snap Crop field"
                            >
                              <Camera size={13} />
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Step 4: Comments */}
                <div className="space-y-1.5 border-t border-slate-100 pt-3">
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                    Physical inspection remarks / supervisor Notes
                  </label>
                  <textarea
                    rows={2}
                    value={inspectionComments}
                    onChange={(e) => setInspectionComments(e.target.value)}
                    placeholder="e.g. Crops look healthy. Soil moisture looks well-maintained. Measured 5 acres exactly using coordinate walk."
                    className="w-full p-2.5 border border-slate-200 rounded-xl bg-slate-50 text-xs font-semibold outline-none focus:ring-1 focus:ring-brand-800"
                  />
                </div>

                {/* Form CTA Actions */}
                <div className="flex gap-2.5 pt-3 border-t border-slate-100 sticky bottom-0 bg-white">
                  <button
                    type="button"
                    onClick={() => {
                      setShowVerificationForm(false);
                      setInspectingFarmer(null);
                    }}
                    className="flex-1 py-2.5 border border-slate-200 rounded-xl font-bold text-slate-500 hover:bg-slate-50 cursor-pointer"
                  >
                    Cancel Audit
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-2.5 bg-brand-800 hover:bg-brand-900 text-white rounded-xl font-bold text-xs cursor-pointer shadow-sm transition flex items-center justify-center gap-1.5"
                  >
                    <FileCheck size={14} className="text-emerald-400" />
                    Submit Audit Report
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
