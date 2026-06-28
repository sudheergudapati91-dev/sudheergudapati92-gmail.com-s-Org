/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type PaymentStatus = "Paid" | "Partial" | "Pending";
export type ApprovalStatus = "Pending Approval" | "Approved" | "Rejected" | "Hold";

export interface WarehouseStock {
  id: string;
  invoiceNumber?: string;
  supplierName: string;
  productName: string;
  bagCount: number;
  ratePerBag: number;
  totalAmount: number;
  receivedDate: string;
  createdBy?: string;
  createdTime?: string;
}

export interface DispatchRecord {
  id: string;
  sourceWarehouse: string;
  productName: string;
  bagCount: number;
  villageName: string;
  assistantName: string;
  dispatchDate: string;
  status: "In-Transit" | "Acknowledged";
  createdBy?: string;
  createdTime?: string;
  acknowledgedBy?: string;
  acknowledgedTime?: string;
  acknowledgedDate?: string;
}

export interface FarmerDistribution {
  id: string;
  farmerName: string;
  mobileNumber: string;
  villageName: string;
  assistantName: string;
  productName: string;
  bagCount: number;
  ratePerBag: number;
  totalAmount: number;
  amountCollected: number;
  balanceAmount: number;
  paymentStatus: PaymentStatus;
  date: string;
}

export interface SupplierBill {
  id: string;
  billNumber: string;
  supplierName: string;
  productName: string;
  bagCount: number;
  ratePerBag: number;
  totalAmount: number;
  billDate: string;
  paymentStatus: PaymentStatus;
  approvalStatus: ApprovalStatus;
  notes?: string;
  requestedAt?: string;
}

export interface VillageStockStatus {
  villageName: string;
  assistantName: string;
  productName: string;
  totalReceived: number;
  totalDistributed: number;
  availableStock: number;
}

export interface AppNotification {
  id: string;
  title: string;
  message: string;
  type: "stock" | "payment" | "approval";
  time: string;
  isRead: boolean;
  role: "Warehouse Manager" | "Village Assistant" | "Owner" | "Accountant" | "all";
}

export type ActiveRole = "Warehouse Manager" | "Village Assistant" | "Owner" | "Accountant" | "Login";

export interface TimelineEvent {
  id: string;
  assistantName: string;
  villageName: string;
  actionType: "acknowledge" | "sale" | "payment_update" | "modification_request" | "modification_approved" | "modification_rejected" | "payment_request" | "payment_approved" | "payment_rejected";
  title: string;
  description: string;
  timestamp: string;
  date: string;
}

export interface PaymentRequest {
  id: string;
  distributionId: string;
  farmerName: string;
  assistantName: string;
  villageName: string;
  amountProposed: number;
  paymentMode: "Cash" | "Online";
  status: "Pending" | "Approved" | "Rejected";
  dateRequested: string;
  timeRequested: string;
  notes?: string;
  approvedBy?: string;
  approvedDate?: string;
  amountModified?: number;
  paid?: boolean;
  ownerApprovalRequested?: boolean;
  ownerApproved?: boolean;
  ownerRejected?: boolean;
}

export interface ModificationRequest {
  id: string;
  distributionId: string;
  assistantName: string;
  villageName: string;
  farmerName: string;
  originalData: {
    farmerName: string;
    mobileNumber: string;
    productName: string;
    bagCount: number;
    ratePerBag: number;
    totalAmount: number;
    amountCollected: number;
    balanceAmount: number;
    paymentStatus: PaymentStatus;
  };
  requestedChanges: {
    farmerName: string;
    mobileNumber: string;
    productName: string;
    bagCount: number;
    ratePerBag: number;
    totalAmount: number;
    amountCollected: number;
    balanceAmount: number;
    paymentStatus: PaymentStatus;
  };
  justification: string;
  status: "Pending" | "Approved" | "Rejected";
  dateRequested: string;
}

export interface AssistantUser {
  mobileNumber: string;
  name: string;
  villageName: string;
  password?: string;
  isActive?: boolean;
  roleType?: "assistant" | "employee";
  designation?: string;
  aadhaarNumber?: string;
  bankName?: string;
  bankAccountNo?: string;
  bankIfscCode?: string;
  emergencyContact?: string;
  salaryAmount?: number;
  salaryLocked?: boolean;
}

export interface FertilizerOrderRequest {
  id: string;
  villageName: string;
  assistantName: string;
  productName: string;
  bagCount: number;
  status: "Pending" | "Dispatched" | "Cancelled";
  dateRequested: string;
  notes?: string;
}

export interface RateChangeRequest {
  id: string;
  type: "seed" | "fertilizer";
  itemId: string; // ID of the registry record
  cropOrProductName: string;
  companyOrMfrName: string;
  year: string;
  currentRate: number;
  requestedRate: number;
  requestNotes: string;
  status: "Pending" | "Approved" | "Rejected";
  dateRequested: string;
  action: "update" | "delete";
}

export interface FarmerChangeRequest {
  id: string;
  farmerId: string;
  farmerName: string;
  assistantName: string;
  villageName: string;
  originalData: any; // EnrolledFarmer type representation
  requestedChanges?: any; // EnrolledFarmer type representation with updates
  justification: string;
  status: "Pending" | "Approved" | "Rejected";
  dateRequested: string;
  action: "update" | "delete";
}

export interface AdvanceChangeRequest {
  id: string;
  requestId: string; // The ID of the PaymentRequest (PAY-...)
  farmerName: string;
  assistantName: string;
  villageName: string;
  originalAmount: number;
  originalMode: "Cash" | "Online";
  originalNotes: string;
  requestedAmount?: number;
  requestedMode?: "Cash" | "Online";
  requestedNotes?: string;
  justification: string;
  status: "Pending" | "Approved" | "Rejected";
  dateRequested: string;
  action: "update" | "delete";
}

export interface SalaryUnlockRequest {
  id: string;
  staffMobile: string;
  staffName: string;
  designation: string;
  currentSalary: number;
  reason: string;
  status: "Pending" | "Approved" | "Rejected";
  dateRequested: string;
}


