export const ITEM_CATEGORIES = [
  { value: "yarn", label: "Yarn" },
  { value: "cloth", label: "Cloth / Clothes" },
  { value: "cotton", label: "Cotton" },
  { value: "polyester", label: "Polyester" },
  { value: "pp_woven_bag", label: "Empty PP Woven Bags" }
];

export const CATEGORY_META = {
  yarn: { label: "Yarn", packageLabel: "Bags", standardWeight: 60, tracking: "bag" },
  cloth: { label: "Cloth / Clothes", packageLabel: "Kg", standardWeight: null, tracking: "kg" },
  cotton: { label: "Cotton", packageLabel: "Bales", standardWeight: 150, tracking: "bale" },
  polyester: { label: "Polyester", packageLabel: "Bales", standardWeight: null, tracking: "bale" },
  pp_woven_bag: { label: "Empty PP Woven Bags", packageLabel: "Bales", standardWeight: 370, tracking: "bale" }
};

export const STATUS_OPTIONS = [
  { value: "active", label: "Active" },
  { value: "inactive", label: "Inactive" }
];

export const PARTY_TYPES = [
  { value: "customer", label: "Customer" },
  { value: "supplier", label: "Supplier" },
  { value: "both", label: "Customer & Supplier" }
];

export const DC_STATUSES = ["submitted", "approved", "rejected", "invoiced", "cancelled"];
export const PURCHASE_STATUSES = ["submitted", "approved", "rejected", "cancelled"];
