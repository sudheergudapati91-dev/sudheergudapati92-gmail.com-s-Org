/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { WarehouseStock, DispatchRecord, FarmerDistribution, SupplierBill, VillageStockStatus, AppNotification, TimelineEvent, ModificationRequest, PaymentRequest, FertilizerOrderRequest } from "./types";

export const INITIAL_WAREHOUSE_STOCK: WarehouseStock[] = [];

export const INITIAL_DISPATCH_RECORDS: DispatchRecord[] = [];

export const INITIAL_FARMER_DISTRIBUTIONS: FarmerDistribution[] = [];

export const INITIAL_SUPPLIER_BILLS: SupplierBill[] = [];

export const INITIAL_VILLAGE_STOCK: VillageStockStatus[] = [];

export const INITIAL_NOTIFICATIONS: AppNotification[] = [];

export const DEMO_SUPPLIERS = [
  "IFFCO Ltd.",
  "Chambal Fertilisers",
  "Coromandel International",
  "NFL India",
  "GSFC Ltd."
];

export const DEMO_FERTILIZERS = [
  "Urea (46% N)",
  "DAP (18-46-0)",
  "Potash / MOP",
  "NPK 19-19-19",
  "NPK 12-32-16",
  "SSP (Single Super Phosphate)",
  "Chlorpyriphos 20% EC (Pesticide)",
  "Imidacloprid 17.8% SL (Pesticide)",
  "Monocrotophos 36% SL (Pesticide)",
  "Neem Oil 1500 PPM (Natural)",
  "Glyphosate 41% SL (Herbicide)",
  "Carbendazim 50% WP (Fungicide)"
];

export const DEMO_VILLAGES_MAPPING = [
  { villageName: "Rampur", assistantName: "Ramesh Kumar" },
  { villageName: "Dhamnod", assistantName: "Vijay Patel" },
  { villageName: "Chandanpur", assistantName: "Anil Sharma" },
  { villageName: "Pali", assistantName: "Sanjay Singh" },
  { villageName: "Kharagpur", assistantName: "Deepak Rao" }
];

export const INITIAL_TIMELINE_EVENTS: TimelineEvent[] = [];

export const INITIAL_MODIFICATION_REQUESTS: ModificationRequest[] = [];

export const INITIAL_PAYMENT_REQUESTS: PaymentRequest[] = [];

export const INITIAL_FERTILIZER_REQUESTS: FertilizerOrderRequest[] = [];
