// ─── API HELPERS ──────────────────────────────────────────────────────────────
// Shared utilities for the /api route layer:
//  • ok()/fail() JSON responses
//  • serialize(): Prisma Decimal → number, Date → ISO string (recursive)
//  • toApp()/fromApp(): translate Prisma enum KEYS (e.g. "BasicCleaning",
//    "Binan", "FullyPaid") to the app's display strings (e.g. "Basic Cleaning",
//    "Biñan", "Fully paid") and back — applied only on known enum fields.

import { NextResponse } from 'next/server';
import { Prisma } from '@prisma/client';

export function ok(data: unknown, status = 200) {
  return NextResponse.json({ ok: true, data: serialize(data) }, { status });
}
export function fail(message: string, status = 400) {
  return NextResponse.json({ ok: false, error: message }, { status });
}

// ─── Decimal / Date serialization ─────────────────────────────────────────────
export function serialize(v: unknown): unknown {
  if (v === null || v === undefined) return v;
  if (v instanceof Prisma.Decimal) return Number(v);
  if (v instanceof Date) return v.toISOString();
  if (Array.isArray(v)) return v.map(serialize);
  if (typeof v === 'object') {
    const out: Record<string, unknown> = {};
    for (const [k, val] of Object.entries(v as Record<string, unknown>)) out[k] = serialize(val);
    return out;
  }
  return v;
}

// ─── Enum key ↔ app string translation ────────────────────────────────────────
const KEY_TO_APP: Record<string, string> = {
  // ServiceType
  BasicCleaning: 'Basic Cleaning',
  DeepClean: 'Deep Clean / Chemical Wash',
  ACInstallation: 'AC Installation',
  RepairDiagnostics: 'Repair & Diagnostics',
  RefrigerantRecharge: 'Refrigerant Recharge',
  // CoverageCity
  Binan: 'Biñan',
  SanPedro: 'San Pedro',
  StaRosa: 'Sta. Rosa',
  GMACavite: 'GMA Cavite',
  // JobStatus / PaymentStatus
  AwaitingPayment: 'Awaiting Payment',
  AwaitingConfirmation: 'Awaiting Confirmation',
  ReservationPaid: 'Reservation paid',
  FullyPaid: 'Fully paid',
  // PaymentMethod
  BankTransfer: 'Bank Transfer',
  // InvoiceStatus / BillingStatus
  ViewedByClient: 'Viewed by Client',
  RevisionRequested: 'Revision Requested',
  CancelledByClient: 'Cancelled by Client',
  SubmittedToAdmin: 'Submitted to Admin',
  AdminApproved: 'Admin Approved',
  AdminRejected: 'Admin Rejected',
  SentToClient: 'Sent to Client',
  // ClientFollowUpStatus / LeadSource
  OnTrack: 'On track',
  DueSoon: 'Due soon',
  NoResponse: 'No response',
  WalkIn: 'Walk-in',
};
const APP_TO_KEY: Record<string, string> = Object.fromEntries(
  Object.entries(KEY_TO_APP).map(([k, v]) => [v, k]),
);

// Fields whose values are Prisma enums needing translation
const ENUM_FIELDS = new Set([
  'serviceType', 'city', 'status', 'paymentStatus', 'paymentMethod',
  'preferredPaymentMethod', 'followUpStatus', 'leadSource',
  'invoiceStatus', 'billingStatus', 'coverageCities', 'assignedCities',
]);

function translate(v: unknown, dict: Record<string, string>): unknown {
  if (typeof v === 'string') return dict[v] ?? v;
  if (Array.isArray(v)) return v.map(x => (typeof x === 'string' ? dict[x] ?? x : x));
  return v;
}

function walk(v: unknown, dict: Record<string, string>): unknown {
  if (v === null || v === undefined) return v;
  if (Array.isArray(v)) return v.map(x => walk(x, dict));
  if (v instanceof Date || v instanceof Prisma.Decimal) return v;
  if (typeof v === 'object') {
    const out: Record<string, unknown> = {};
    for (const [k, val] of Object.entries(v as Record<string, unknown>)) {
      out[k] = ENUM_FIELDS.has(k) ? translate(val, dict) : walk(val, dict);
    }
    return out;
  }
  return v;
}

/** DB record(s) → app-facing strings ("BasicCleaning" → "Basic Cleaning") */
export function toApp<T>(v: T): T { return walk(v, KEY_TO_APP) as T; }
/** Incoming app payload → Prisma enum keys ("Biñan" → "Binan") */
export function fromApp<T>(v: T): T { return walk(v, APP_TO_KEY) as T; }

/** Strip fields callers must never set directly */
export function omit<T extends Record<string, unknown>>(obj: T, keys: string[]): Partial<T> {
  const out = { ...obj };
  for (const k of keys) delete out[k];
  return out;
}
