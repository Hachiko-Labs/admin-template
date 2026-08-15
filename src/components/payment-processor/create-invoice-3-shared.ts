export type InvoiceItem = {
  id: string;
  name: string;
  description: string;
  quantity: number;
  unitPrice: number;
};

export type InvoiceDraft = {
  companyName: string;
  companyAddress: string;
  companyEmail: string;
  clientName: string;
  clientAddress: string;
  clientEmail: string;
  currency: string;
  invoiceNumber: string;
  invoiceDate: string;
  dueDate: string;
  paymentTerms: string;
  taxRate: number;
  notes: string;
  items: InvoiceItem[];
};

export type InvoiceTotals = {
  subtotal: number;
  tax: number;
  total: number;
};

export type PdfTemplateProps = {
  invoice: InvoiceDraft;
  totals: InvoiceTotals;
};

export const currencySymbols: Record<string, string> = {
  USD: "$",
  EUR: "€",
  GBP: "£",
  INR: "₹",
  CAD: "$",
  AUD: "$",
  SGD: "$",
};

export const formatInvoiceMoney = (
  currency: string,
  amount: number,
  showCode = false,
) => {
  const symbol = currencySymbols[currency] ?? currency;
  const value = `${symbol}${amount.toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;

  return showCode ? `${value} ${currency}` : value;
};
