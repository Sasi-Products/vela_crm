export const formatDate = (value) => {
  if (!value) return "—";
  const date = new Date(`${String(value).slice(0, 10)}T00:00:00`);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat("en-IN", { day: "2-digit", month: "short", year: "numeric" }).format(date);
};

export const formatDateTime = (value) => {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat("en-IN", {
    day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit"
  }).format(date);
};

export const formatNumber = (value, digits = 2) =>
  new Intl.NumberFormat("en-IN", { maximumFractionDigits: digits }).format(Number(value || 0));

export const formatCurrency = (value) =>
  new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 2 }).format(Number(value || 0));

export const titleCase = (value = "") =>
  String(value).replace(/_/g, " ").replace(/\b\w/g, (x) => x.toUpperCase());

export const today = () => new Date().toISOString().slice(0, 10);
