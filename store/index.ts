import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { api } from '@/lib/apiClient';

// ─── CORE TYPES ───────────────────────────────────────────────────────────────
export type UserRole = 'client' | 'admin' | 'operator';

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone: string;
  role: UserRole;
  address?: string;
  city?: string;
  clientType?: 'Residential' | 'Commercial';
  acUnits?: number;
  lastServiceDate?: string;
  nextDueDate?: string;
  followUpStatus?: 'On track' | 'Due soon' | 'Overdue' | 'No response' | 'Converted';
  operatorStatus?: 'Active' | 'Inactive';
  assignedCities?: string[];
  // New fields from client feedback
  preferredTechnicianId?: string;
  preferredTechnicianName?: string;
  leadSource?: 'Referral' | 'Organic' | 'Facebook' | 'Walk-in' | 'Other';
  createdAt: string;
}

export type JobStatus = 'Pending' | 'Awaiting Payment' | 'Confirmed' | 'Scheduled' | 'Active' | 'Completed' | 'Cancelled';
export type PaymentStatus = 'Unpaid' | 'Awaiting Confirmation' | 'Fee paid' | 'Fully paid' | 'Refunded';
export type TimeSlot = 'AM' | 'PM' | 'Flexible';
// Updated service types based on client feedback — they already offer all four
export type ServiceType = 'Basic Cleaning' | 'Deep Clean / Chemical Wash' | 'AC Installation' | 'Repair & Diagnostics' | 'Refrigerant Recharge';
export type ACType = 'Split Type' | 'Window Type' | 'Cassette Type';
// Updated to actual coverage area: South Metro Manila / South Laguna
export type CoverageCity = 'Biñan' | 'San Pedro' | 'Sta. Rosa' | 'Cabuyao' | 'Muntinlupa' | 'Carmona' | 'GMA Cavite';

export interface Job {
  id: string;
  clientId: string;
  clientName: string;
  serviceType: ServiceType;
  acType: ACType;
  numberOfUnits: number;
  serviceAddress: string;
  city: CoverageCity;
  preferredDate: string;
  timeSlot: TimeSlot;
  totalPrice: number;
  reservationFee: number;
  balanceDue: number;
  paymentStatus: PaymentStatus;
  paymentScreenshot?: string;
  status: JobStatus;
  technicianId?: string;
  technicianName?: string;
  operatorId?: string;
  operatorName?: string;
  specialInstructions?: string;
  notes?: string;
  createdAt: string;
  nextDueDate?: string;
  cancellationReason?: string;
  rating?: number;
  review?: string;
  // New fields from client feedback
  customPrice?: number;           // negotiated price override (client said all prices are negotiated)
  requiresQuote?: boolean;        // true for installation / repair / freon — no fixed price
  preferredTechnicianId?: string; // client may request a specific tech they trust
  preferredTechnicianName?: string;
  techFieldNotes?: string;        // technician's on-site report (issues found, scope changes)
  preferredPaymentMethod?: 'GCash' | 'Cash' | 'Bank Transfer' | 'Check';
  isAdminCreated?: boolean;       // admin booked on behalf of client
}

export interface Technician {
  id: string;
  fullName: string;
  phone: string;
  type: 'Inhouse' | 'Outsource';
  skillLevel: 'Junior' | 'Senior' | 'Lead';
  coverageCities: CoverageCity[];
  isAvailable: boolean;
  active: boolean;
  averageRating: number;
  totalJobsCompleted: number;
  createdAt: string;
}

export interface AppNotification {
  id: string;
  userId: string;
  jobId?: string;
  message: string;
  type: 'success' | 'info' | 'warning' | 'error';
  read: boolean;
  createdAt: string;
}
type _N = AppNotification;

export type MessageType = 'text' | 'calendar_invite' | 'status_update' | 'system' | 'quick_reply';
export type MessageSenderRole = UserRole | 'system';

export interface CalendarInviteData {
  confirmedDate: string;
  timeSlot: TimeSlot;
  technicianName: string;
  address: string;
  serviceType: string;
  accepted?: boolean;
}

export interface Message {
  id: string;
  jobId: string;
  senderId: string;
  senderName: string;
  senderRole: MessageSenderRole;
  content: string;
  type: MessageType;
  calendarData?: CalendarInviteData;
  createdAt: string;
  readBy: string[];
}

// ─── CHAT ARCHIVES (7-day retention → JSON chat history) ─────────────────────
// Live chats never stay on the server longer than CHAT_RETENTION_DAYS.
// archiveExpiredChats() moves expired messages into JSON-shaped ChatArchive
// records (one per job thread). In the future Neon backend this maps to a
// scheduled job writing rows into a chat_archives table with a JSON payload.
export const CHAT_RETENTION_DAYS = 7;

export interface ArchivedMessage {
  id: string;
  senderId: string;
  senderName: string;
  senderRole: MessageSenderRole;
  content: string;
  type: MessageType;
  createdAt: string;
}

export interface ChatArchive {
  id: string;            // ARC-<jobId>
  jobId: string;
  clientId: string;
  clientName: string;
  operatorId?: string;
  operatorName?: string;
  archivedAt: string;
  fromDate: string;
  toDate: string;
  messageCount: number;
  messages: ArchivedMessage[]; // the JSON chat-history payload
}

// ─── QUICK REPLY TEMPLATES ────────────────────────────────────────────────────
// Pre-written messages the admin can send in one click — replaces texting on Messenger
export interface QuickReplyTemplate {
  id: string;
  label: string;
  category: 'greeting' | 'availability' | 'confirmation' | 'dispatch' | 'update' | 'payment' | 'completion';
  template: string; // uses {{clientName}}, {{techName}}, {{date}}, {{time}}, {{amount}}, {{service}}, {{city}} placeholders
  emoji: string;
}

export const QUICK_REPLY_TEMPLATES: QuickReplyTemplate[] = [
  // Greeting
  { id: 'QR01', label: 'Welcome', category: 'greeting', emoji: '👋', template: "Hi {{clientName}}! I'm your ACT coordinator. Thank you for choosing us for your {{service}} service. I'll take care of everything from here — I'll check technician availability and confirm your schedule shortly." },
  { id: 'QR02', label: 'Inquiry Response', category: 'greeting', emoji: '💬', template: "Hi {{clientName}}! Thanks for reaching out to ACT Aircon Service. For {{service}}, our prices depend on the number of units. Could you let me know how many units you have and your preferred schedule?" },
  // Availability
  { id: 'QR03', label: 'Checking Availability', category: 'availability', emoji: '🔍', template: "Hi {{clientName}}! I'm currently checking technician availability for your preferred date of {{date}}. I'll confirm within the hour. 🙏" },
  { id: 'QR04', label: 'Date Conflict', category: 'availability', emoji: '📅', template: "Hi {{clientName}}, unfortunately {{date}} is fully booked for {{city}}. Could you choose from {{time}} or another date? We want to make sure you get the best technician for the job!" },
  // Confirmation
  { id: 'QR05', label: 'Schedule Confirmed', category: 'confirmation', emoji: '✅', template: "Great news, {{clientName}}! {{techName}} is confirmed for your {{service}} on {{date}} {{time}}. I've sent a calendar invite — please tap Accept to lock it in. See you then!" },
  { id: 'QR06', label: 'Payment Confirmed', category: 'confirmation', emoji: '💚', template: "Payment received, {{clientName}}! Your booking is now confirmed. {{techName}} will be at {{city}} on {{date}} {{time}}. We'll message you when the technician is on the way." },
  // Dispatch
  { id: 'QR07', label: 'Tech on the Way', category: 'dispatch', emoji: '🚗', template: "Hi {{clientName}}! {{techName}} is on the way to you right now. ETA: approximately 15–20 minutes. Please make sure someone is home to let them in. 🙏" },
  { id: 'QR08', label: 'Tech Arrived', category: 'dispatch', emoji: '📍', template: "{{techName}} has arrived and is starting the service now. The job typically takes {{time}}. We'll update you once it's done!" },
  // Update
  { id: 'QR09', label: 'Issue Found', category: 'update', emoji: '⚠️', template: "Hi {{clientName}}, our technician found an issue that may affect the scope of work. {{techName}} will walk you through it on-site. Any additional work will be quoted before proceeding — nothing changes without your approval." },
  { id: 'QR10', label: 'Scope Change', category: 'update', emoji: '📋', template: "Hi {{clientName}}, we need to adjust the service scope based on what the technician found. I'll send an updated quote shortly. Thank you for your understanding!" },
  // Payment
  { id: 'QR11', label: 'Payment Reminder', category: 'payment', emoji: '💳', template: "Hi {{clientName}}, just a reminder that the balance of ₱{{amount}} is due after today's service. You can pay via GCash, cash, or bank transfer. Let us know your preferred method!" },
  { id: 'QR12', label: 'Payment Options', category: 'payment', emoji: '💰', template: "Hi {{clientName}}! For payment, we accept: GCash (we'll send the QR), cash on-site, or bank transfer. Which works best for you?" },
  // Completion
  { id: 'QR13', label: 'Service Done', category: 'completion', emoji: '🎉', template: "Great news, {{clientName}}! Your {{service}} is complete! Your AC should now be running at full efficiency. We'll send your billing summary shortly. Thank you for choosing ACT! 🙏❄️" },
  { id: 'QR14', label: 'Review Request', category: 'completion', emoji: '⭐', template: "Hi {{clientName}}! We hope your {{service}} went smoothly! We'd love to hear your feedback — could you leave a quick rating? It helps us improve and helps other clients choose the right service. 🙏" },
  { id: 'QR15', label: 'Follow-up Due', category: 'completion', emoji: '📆', template: "Hi {{clientName}}! It's been about 3 months since your last service. We recommend a check-up to keep your AC running efficiently — especially with the hot weather. Want to schedule a maintenance visit?" },
];

// ─── BILLING & INVOICE TYPES ──────────────────────────────────────────────────

export type LineItemCategory = 'Service' | 'Labor' | 'Parts' | 'Travel' | 'Other';

export interface InvoiceLineItem {
  id: string;
  description: string;
  category: LineItemCategory;
  quantity: number;
  unitPrice: number;
  amount: number; // quantity × unitPrice
}

/**
 * ServiceInvoice — formal quote sent by operator to client BEFORE service.
 * Client can Accept, Request Revision, or Cancel based on this.
 */
export type InvoiceStatus =
  | 'Draft'
  | 'Sent'
  | 'Viewed by Client'
  | 'Accepted'
  | 'Revision Requested'
  | 'Cancelled by Client';

export interface ServiceInvoice {
  id: string;          // e.g. SINV-JOB001-001
  jobId: string;
  clientId: string;
  clientName: string;
  operatorId: string;
  operatorName: string;
  lineItems: InvoiceLineItem[];
  subtotal: number;
  reservationFeePaid: number;  // already collected
  balanceDue: number;          // subtotal - reservationFeePaid
  totalAmount: number;         // = subtotal
  status: InvoiceStatus;
  notes?: string;              // operator notes on the invoice
  clientNote?: string;         // client's response note (revision request / cancellation reason)
  sentAt?: string;
  viewedAt?: string;
  respondedAt?: string;
  revisionCount?: number;
  revisedAt?: string;
  dueDate?: string;
  createdAt: string;
}

/**
 * BillingStatement — record of actual work done, created by operator AFTER service.
 * Goes through Admin approval before being sent to client.
 */
export type BillingStatus =
  | 'Draft'
  | 'Submitted to Admin'
  | 'Admin Approved'
  | 'Admin Rejected'
  | 'Sent to Client'
  | 'Paid'
  | 'Overdue'
  | 'Disputed';

export interface BillingStatement {
  id: string;          // e.g. BILL-JOB001-001
  jobId: string;
  clientId: string;
  clientName: string;
  operatorId: string;
  operatorName: string;
  technicianName?: string;
  lineItems: InvoiceLineItem[];
  subtotal: number;
  reservationFeePaid: number;
  amountDue: number;           // subtotal - reservationFeePaid
  totalAmount: number;         // = subtotal
  status: BillingStatus;
  workNotes?: string;          // operator's notes on work performed
  adminNotes?: string;         // admin feedback / approval notes
  submittedAt?: string;
  adminReviewedAt?: string;
  sentToClientAt?: string;
  paidAt?: string;
  paymentMethod?: 'GCash' | 'Cash' | 'Bank Transfer' | 'Check';
  dueDate?: string;
  amountPaidAtClose?: number;
  receiptNumber?: string;
  paymentReference?: string;   // GCash ref no. / bank transaction ID — proof of payment
  checkNumber?: string;
  internalNotes?: string;
  createdAt: string;
}

// Legacy simple Invoice (kept for backward compat)
export interface Invoice {
  id: string;
  jobId: string;
  clientId: string;
  totalAmount: number;
  reservationFee: number;
  balanceDue: number;
  paymentMethod: 'GCash' | 'Cash' | 'Bank Transfer';
  status: 'Pending' | 'Fee paid' | 'Fully paid' | 'Overdue' | 'Refunded';
  issuedAt: string;
  paidAt?: string;
}

// ─── APP STATE ────────────────────────────────────────────────────────────────
interface AppState {
  currentUser: User | null;
  users: User[];
  jobs: Job[];
  technicians: Technician[];
  notifications: AppNotification[];
  messages: Message[];
  chatArchives: ChatArchive[];
  invoices: Invoice[];
  serviceInvoices: ServiceInvoice[];
  billingStatements: BillingStatement[];

  // Auth
  login: (email: string, password: string) => Promise<{ success: boolean; role?: UserRole; error?: string }>;
  register: (data: Partial<User> & { password: string }) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  hydrate: () => Promise<void>;

  // Jobs
  addJob: (job: Omit<Job, 'id' | 'createdAt'>) => Job;
  updateJob: (id: string, updates: Partial<Job>) => void;
  getJobsByClient: (clientId: string) => Job[];

  // Technicians
  addTechnician: (tech: Omit<Technician, 'id' | 'createdAt'>) => void;
  updateTechnician: (id: string, updates: Partial<Technician>) => void;

  // Notifications
  addNotification: (notif: Omit<AppNotification, 'id' | 'createdAt'>) => void;
  markNotificationRead: (id: string) => void;

  // Messages
  sendMessage: (msg: Omit<Message, 'id' | 'createdAt'>) => Message;
  markMessagesRead: (jobId: string, userId: string) => void;
  archiveExpiredChats: () => number;
  respondToCalendarInvite: (messageId: string, accepted: boolean, userId: string) => void;

  // Operators / Users
  addOperator: (op: Omit<User, 'id' | 'createdAt' | 'role'>) => void;
  updateOperator: (id: string, updates: Partial<User>) => void;
  addUserAsAdmin: (data: Partial<User>) => User;  // admin creates client on behalf
  updateUser: (id: string, updates: Partial<User>) => void;

  // Legacy invoices
  addInvoice: (inv: Omit<Invoice, 'id'>) => void;
  updateInvoice: (id: string, updates: Partial<Invoice>) => void;

  // Service Invoices (operator → client, pre-service quotes)
  createServiceInvoice: (inv: Omit<ServiceInvoice, 'id' | 'createdAt'>) => ServiceInvoice;
  updateServiceInvoice: (id: string, updates: Partial<ServiceInvoice>) => void;
  sendServiceInvoice: (id: string) => void;
  respondToServiceInvoice: (id: string, action: 'accept' | 'revision' | 'cancel', note?: string, clientId?: string) => void;

  // Billing Statements (operator → admin → client, post-service)
  createBillingStatement: (bill: Omit<BillingStatement, 'id' | 'createdAt'>) => BillingStatement;
  updateBillingStatement: (id: string, updates: Partial<BillingStatement>) => void;
  submitBillingToAdmin: (id: string) => void;
  adminReviewBilling: (id: string, approved: boolean, adminNotes?: string) => void;
  sendBillingToClient: (id: string) => void;
  markBillingPaid: (id: string, paymentMethod: BillingStatement['paymentMethod'], paymentReference?: string) => void;
  markBillingOverdue: (id: string) => void;
}

// ─── PRICING ──────────────────────────────────────────────────────────────────
// Basic Cleaning & Deep Clean: fixed per-unit pricing
// Installation, Repair, Freon: negotiated (price = 0 triggers quote flow)
const SERVICE_PRICES: Record<ServiceType, Record<ACType, { price: number; fee: number }>> = {
  'Basic Cleaning': {
    'Split Type': { price: 1500, fee: 300 },
    'Window Type': { price: 1200, fee: 300 },
    'Cassette Type': { price: 1800, fee: 300 },
  },
  'Deep Clean / Chemical Wash': {
    'Split Type': { price: 2500, fee: 500 },
    'Window Type': { price: 2000, fee: 500 },
    'Cassette Type': { price: 3000, fee: 500 },
  },
  // Quote-based — actual price set by admin per job
  'AC Installation': {
    'Split Type': { price: 0, fee: 0 },
    'Window Type': { price: 0, fee: 0 },
    'Cassette Type': { price: 0, fee: 0 },
  },
  'Repair & Diagnostics': {
    'Split Type': { price: 0, fee: 0 },
    'Window Type': { price: 0, fee: 0 },
    'Cassette Type': { price: 0, fee: 0 },
  },
  'Refrigerant Recharge': {
    'Split Type': { price: 0, fee: 0 },
    'Window Type': { price: 0, fee: 0 },
    'Cassette Type': { price: 0, fee: 0 },
  },
};

// Services that require a custom quote instead of fixed pricing
export const QUOTE_REQUIRED_SERVICES: ServiceType[] = ['AC Installation', 'Repair & Diagnostics', 'Refrigerant Recharge'];

const generateId = () => Math.random().toString(36).substr(2, 9).toUpperCase();

// ─── SEED DATA ────────────────────────────────────────────────────────────────
// 3 outsourced technicians covering actual service area (South Metro / South Laguna)
const seedTechnicians: Technician[] = [
  { id: 'TECH001', fullName: 'Mark Santos', phone: '09171234567', type: 'Outsource', skillLevel: 'Senior', coverageCities: ['Biñan', 'San Pedro', 'Muntinlupa'], isAvailable: true, active: true, averageRating: 4.8, totalJobsCompleted: 127, createdAt: '2026-01-15' },
  { id: 'TECH002', fullName: 'Jose Reyes', phone: '09281234567', type: 'Outsource', skillLevel: 'Lead', coverageCities: ['Sta. Rosa', 'Cabuyao', 'Biñan'], isAvailable: true, active: true, averageRating: 4.9, totalJobsCompleted: 215, createdAt: '2025-11-01' },
  { id: 'TECH003', fullName: 'Carlo Cruz', phone: '09391234567', type: 'Outsource', skillLevel: 'Junior', coverageCities: ['Carmona', 'GMA Cavite', 'San Pedro'], isAvailable: true, active: true, averageRating: 4.5, totalJobsCompleted: 43, createdAt: '2026-03-01' },
];

const fmt = (d: Date) => d.toISOString().split('T')[0];
const daysAgo = (n: number) => { const d = new Date(); d.setDate(d.getDate() - n); return fmt(d); };
const daysAhead = (n: number) => { const d = new Date(); d.setDate(d.getDate() + n); return fmt(d); };

const seedJobs: Job[] = [
  { id: 'JOB001', clientId: 'CLIENT001', clientName: 'Ana Villanueva', serviceType: 'Basic Cleaning', acType: 'Split Type', numberOfUnits: 2, serviceAddress: '45 Brgy. Sto. Tomas', city: 'Biñan', preferredDate: daysAhead(2), timeSlot: 'AM', totalPrice: 3000, reservationFee: 300, balanceDue: 2700, paymentStatus: 'Fee paid', status: 'Confirmed', technicianId: 'TECH001', technicianName: 'Mark Santos', operatorId: 'OP001', operatorName: 'Maria Santos', createdAt: daysAgo(1), nextDueDate: daysAhead(90), preferredTechnicianId: 'TECH001', preferredTechnicianName: 'Mark Santos' },
  { id: 'JOB002', clientId: 'CLIENT002', clientName: 'Bong Mendoza', serviceType: 'Deep Clean / Chemical Wash', acType: 'Split Type', numberOfUnits: 3, serviceAddress: '12 San Antonio St', city: 'Sta. Rosa', preferredDate: daysAhead(1), timeSlot: 'PM', totalPrice: 7500, reservationFee: 500, balanceDue: 7000, paymentStatus: 'Awaiting Confirmation', status: 'Awaiting Payment', operatorId: 'OP001', operatorName: 'Maria Santos', createdAt: daysAgo(0), nextDueDate: daysAhead(180) },
  { id: 'JOB003', clientId: 'CLIENT003', clientName: 'Cris Lim', serviceType: 'Basic Cleaning', acType: 'Window Type', numberOfUnits: 1, serviceAddress: '88 Brgy. Poblacion', city: 'San Pedro', preferredDate: daysAgo(7), timeSlot: 'AM', totalPrice: 1200, reservationFee: 300, balanceDue: 0, paymentStatus: 'Fully paid', status: 'Completed', technicianId: 'TECH002', technicianName: 'Jose Reyes', operatorId: 'OP001', operatorName: 'Maria Santos', createdAt: daysAgo(10), nextDueDate: daysAhead(83), rating: 5, review: 'Excellent service!' },
  { id: 'JOB004', clientId: 'CLIENT004', clientName: 'Diana Torres', serviceType: 'Deep Clean / Chemical Wash', acType: 'Cassette Type', numberOfUnits: 4, serviceAddress: '200 Nuvali Blvd', city: 'Sta. Rosa', preferredDate: daysAgo(3), timeSlot: 'AM', totalPrice: 12000, reservationFee: 500, balanceDue: 0, paymentStatus: 'Fully paid', status: 'Completed', technicianId: 'TECH002', technicianName: 'Jose Reyes', operatorId: 'OP001', operatorName: 'Maria Santos', createdAt: daysAgo(5), nextDueDate: daysAhead(177), rating: 4, review: 'Very thorough.' },
  { id: 'JOB005', clientId: 'CLIENT005', clientName: 'Enzo Pascual', serviceType: 'Basic Cleaning', acType: 'Split Type', numberOfUnits: 1, serviceAddress: '55 Brgy. Alabang', city: 'Muntinlupa', preferredDate: fmt(new Date()), timeSlot: 'AM', totalPrice: 1500, reservationFee: 300, balanceDue: 1200, paymentStatus: 'Fee paid', status: 'Active', technicianId: 'TECH001', technicianName: 'Mark Santos', operatorId: 'OP001', operatorName: 'Maria Santos', createdAt: daysAgo(2), nextDueDate: daysAhead(90) },
  { id: 'JOB006', clientId: 'CLIENT001', clientName: 'Ana Villanueva', serviceType: 'Basic Cleaning', acType: 'Split Type', numberOfUnits: 2, serviceAddress: '45 Brgy. Sto. Tomas', city: 'Biñan', preferredDate: daysAgo(95), timeSlot: 'PM', totalPrice: 3000, reservationFee: 300, balanceDue: 0, paymentStatus: 'Fully paid', status: 'Completed', technicianId: 'TECH001', technicianName: 'Mark Santos', operatorId: 'OP001', operatorName: 'Maria Santos', createdAt: daysAgo(97), nextDueDate: daysAgo(5), rating: 5, review: 'Always reliable!' },
  { id: 'JOB007', clientId: 'CLIENT006', clientName: 'Fia Navarro', serviceType: 'Basic Cleaning', acType: 'Split Type', numberOfUnits: 2, serviceAddress: '10 Brgy. Putatan', city: 'Muntinlupa', preferredDate: daysAhead(3), timeSlot: 'PM', totalPrice: 3000, reservationFee: 300, balanceDue: 2700, paymentStatus: 'Unpaid', status: 'Pending', createdAt: daysAgo(0), nextDueDate: daysAhead(93) },
  // New: a repair/diagnostics job (quote-based) to demonstrate that flow
  { id: 'JOB008', clientId: 'CLIENT002', clientName: 'Bong Mendoza', serviceType: 'Repair & Diagnostics', acType: 'Split Type', numberOfUnits: 1, serviceAddress: '12 San Antonio St', city: 'Sta. Rosa', preferredDate: daysAhead(4), timeSlot: 'AM', totalPrice: 0, reservationFee: 0, balanceDue: 0, paymentStatus: 'Unpaid', status: 'Pending', requiresQuote: true, createdAt: daysAgo(0), specialInstructions: 'AC not cooling properly, making clicking noise when starting up.', nextDueDate: undefined },
];

const seedUsers: User[] = [
  { id: 'ADMIN001', email: 'admin@act.ph', firstName: 'Admin', lastName: 'ACT', phone: '09171111111', role: 'admin', createdAt: '2026-01-01' },
  { id: 'CLIENT001', email: 'ana@email.com', firstName: 'Ana', lastName: 'Villanueva', phone: '09172345678', role: 'client', address: '45 Brgy. Sto. Tomas', city: 'Biñan', clientType: 'Residential', acUnits: 2, lastServiceDate: daysAgo(95), nextDueDate: daysAgo(5), followUpStatus: 'Overdue', leadSource: 'Referral', preferredTechnicianId: 'TECH001', preferredTechnicianName: 'Mark Santos', createdAt: '2026-02-01' },
  { id: 'CLIENT002', email: 'bong@email.com', firstName: 'Bong', lastName: 'Mendoza', phone: '09183456789', role: 'client', address: '12 San Antonio St', city: 'Sta. Rosa', clientType: 'Commercial', acUnits: 4, followUpStatus: 'On track', leadSource: 'Referral', createdAt: '2026-02-15' },
  { id: 'CLIENT003', email: 'cris@email.com', firstName: 'Cris', lastName: 'Lim', phone: '09194567890', role: 'client', address: '88 Brgy. Poblacion', city: 'San Pedro', clientType: 'Residential', acUnits: 1, followUpStatus: 'On track', leadSource: 'Organic', createdAt: '2026-03-01' },
  { id: 'CLIENT004', email: 'diana@email.com', firstName: 'Diana', lastName: 'Torres', phone: '09175678901', role: 'client', address: '200 Nuvali Blvd', city: 'Sta. Rosa', clientType: 'Commercial', acUnits: 4, followUpStatus: 'On track', leadSource: 'Referral', createdAt: '2026-01-20' },
  { id: 'CLIENT005', email: 'enzo@email.com', firstName: 'Enzo', lastName: 'Pascual', phone: '09186789012', role: 'client', address: '55 Brgy. Alabang', city: 'Muntinlupa', clientType: 'Residential', acUnits: 1, followUpStatus: 'On track', leadSource: 'Organic', createdAt: '2026-03-10' },
  { id: 'CLIENT006', email: 'fia@email.com', firstName: 'Fia', lastName: 'Navarro', phone: '09197890123', role: 'client', address: '10 Brgy. Putatan', city: 'Muntinlupa', clientType: 'Residential', acUnits: 2, followUpStatus: 'On track', leadSource: 'Referral', createdAt: '2026-04-01' },
  { id: 'OP001', email: 'maria@act.ph', firstName: 'Maria', lastName: 'Santos', phone: '09181234567', role: 'operator', operatorStatus: 'Active', assignedCities: ['Biñan', 'San Pedro', 'Muntinlupa', 'Sta. Rosa', 'Cabuyao', 'Carmona', 'GMA Cavite'], createdAt: '2026-01-10' },
];

const seedMessages: Message[] = [
  { id: 'MSG001', jobId: 'JOB001', senderId: 'OP001', senderName: 'Maria Santos', senderRole: 'operator', content: "Hi Ana! I'm Maria, your ACT coordinator. I'll be managing your aircon cleaning this week. Mark Santos will handle the job — he's serviced your unit before and knows your setup well.", type: 'text', createdAt: daysAgo(1), readBy: ['CLIENT001', 'OP001'] },
  { id: 'MSG002', jobId: 'JOB001', senderId: 'OP001', senderName: 'Maria Santos', senderRole: 'operator', content: "I've sent you a calendar confirmation. Please confirm.", type: 'calendar_invite', calendarData: { confirmedDate: daysAhead(2), timeSlot: 'AM', technicianName: 'Mark Santos', address: '45 Brgy. Sto. Tomas, Biñan', serviceType: 'Basic Cleaning — 2 Split Type units', accepted: undefined }, createdAt: daysAgo(0), readBy: ['OP001'] },
  { id: 'MSG003', jobId: 'JOB005', senderId: 'OP001', senderName: 'Maria Santos', senderRole: 'operator', content: 'Hi Enzo! Mark Santos is on his way to Muntinlupa. ETA: 15 minutes.', type: 'text', createdAt: daysAgo(0), readBy: ['OP001'] },
  { id: 'MSG004', jobId: 'JOB005', senderId: 'OP001', senderName: 'Maria Santos', senderRole: 'operator', content: 'Mark has arrived and is starting the cleaning. Should take about 45–60 minutes.', type: 'status_update', createdAt: daysAgo(0), readBy: ['OP001'] },
  { id: 'MSG005', jobId: 'JOB002', senderId: 'OP001', senderName: 'Maria Santos', senderRole: 'operator', content: "Hi Bong! I'm Maria from ACT. Your payment screenshot is under review. Once confirmed, I'll send your calendar invite with the technician details.", type: 'text', createdAt: daysAgo(0), readBy: ['OP001'] },
  { id: 'MSG006', jobId: 'JOB007', senderId: 'ADMIN001', senderName: 'ACT Admin', senderRole: 'admin', content: "Hi Fia! Thank you for booking with ACT. I'm checking technician availability for your preferred date. I'll confirm shortly!", type: 'text', createdAt: daysAgo(0), readBy: ['ADMIN001'] },
  { id: 'MSG007', jobId: 'JOB008', senderId: 'ADMIN001', senderName: 'ACT Admin', senderRole: 'admin', content: "Hi Bong! Got your repair request — clicking noise on startup is usually a refrigerant or fan issue. I'll have our technician do a full diagnostic. I'll check availability and confirm your schedule!", type: 'text', createdAt: daysAgo(0), readBy: ['ADMIN001'] },
];

// ─── SEED SERVICE INVOICES ────────────────────────────────────────────────────
const seedServiceInvoices: ServiceInvoice[] = [
  {
    id: 'SINV-JOB001-001',
    jobId: 'JOB001',
    clientId: 'CLIENT001',
    clientName: 'Ana Villanueva',
    operatorId: 'OP001',
    operatorName: 'Maria Santos',
    lineItems: [
      { id: 'LI001', description: 'Basic Cleaning — Split Type AC (×2 units)', category: 'Service', quantity: 2, unitPrice: 1500, amount: 3000 },
      { id: 'LI002', description: 'Travel & Logistics — Biñan', category: 'Travel', quantity: 1, unitPrice: 0, amount: 0 },
    ],
    subtotal: 3000,
    reservationFeePaid: 300,
    balanceDue: 2700,
    totalAmount: 3000,
    status: 'Sent',
    notes: 'Price per unit is ₱1,500. Balance of ₱2,700 due after service.',
    sentAt: daysAgo(0),
    createdAt: daysAgo(1),
  },
  {
    id: 'SINV-JOB005-001',
    jobId: 'JOB005',
    clientId: 'CLIENT005',
    clientName: 'Enzo Pascual',
    operatorId: 'OP001',
    operatorName: 'Maria Santos',
    lineItems: [
      { id: 'LI003', description: 'Basic Cleaning — Split Type AC (×1 unit)', category: 'Service', quantity: 1, unitPrice: 1500, amount: 1500 },
    ],
    subtotal: 1500,
    reservationFeePaid: 300,
    balanceDue: 1200,
    totalAmount: 1500,
    status: 'Accepted',
    notes: 'Standard basic clean for 1 split-type unit.',
    sentAt: daysAgo(2),
    viewedAt: daysAgo(2),
    respondedAt: daysAgo(2),
    createdAt: daysAgo(3),
  },
];

// ─── SEED BILLING STATEMENTS ──────────────────────────────────────────────────
const seedBillingStatements: BillingStatement[] = [
  {
    id: 'BILL-JOB003-001',
    jobId: 'JOB003',
    clientId: 'CLIENT003',
    clientName: 'Cris Lim',
    operatorId: 'OP001',
    operatorName: 'Maria Santos',
    technicianName: 'Jose Reyes',
    lineItems: [
      { id: 'BL001', description: 'Basic Cleaning — Window Type AC (×1 unit)', category: 'Service', quantity: 1, unitPrice: 1200, amount: 1200 },
      { id: 'BL002', description: 'Filter replacement (included)', category: 'Parts', quantity: 1, unitPrice: 0, amount: 0 },
    ],
    subtotal: 1200,
    reservationFeePaid: 300,
    amountDue: 0,
    totalAmount: 1200,
    status: 'Paid',
    workNotes: 'Unit cleaned thoroughly. Filter was clogged — cleared. Drain flushed. Unit running at full capacity.',
    adminNotes: 'Approved. Work completed per standard protocol.',
    submittedAt: daysAgo(7),
    adminReviewedAt: daysAgo(6),
    sentToClientAt: daysAgo(6),
    paidAt: daysAgo(6),
    paymentMethod: 'Cash',
    createdAt: daysAgo(8),
  },
  {
    id: 'BILL-JOB005-001',
    jobId: 'JOB005',
    clientId: 'CLIENT005',
    clientName: 'Enzo Pascual',
    operatorId: 'OP001',
    operatorName: 'Maria Santos',
    technicianName: 'Mark Santos',
    lineItems: [
      { id: 'BL003', description: 'Basic Cleaning — Split Type AC (×1 unit)', category: 'Service', quantity: 1, unitPrice: 1500, amount: 1500 },
    ],
    subtotal: 1500,
    reservationFeePaid: 300,
    amountDue: 1200,
    totalAmount: 1500,
    status: 'Draft',
    workNotes: 'Unit cleaned. Coils washed, drain cleared, filters cleaned. Cooling performance restored.',
    createdAt: daysAgo(0),
  },
  {
    id: 'BILL-JOB004-001',
    jobId: 'JOB004',
    clientId: 'CLIENT004',
    clientName: 'Diana Torres',
    operatorId: 'OP001',
    operatorName: 'Maria Santos',
    technicianName: 'Jose Reyes',
    lineItems: [
      { id: 'BL004', description: 'Deep Clean / Chemical Wash — Cassette Type (×4 units)', category: 'Service', quantity: 4, unitPrice: 3000, amount: 12000 },
      { id: 'BL005', description: 'Anti-bacterial treatment (add-on)', category: 'Parts', quantity: 4, unitPrice: 200, amount: 800 },
    ],
    subtotal: 12800,
    reservationFeePaid: 500,
    amountDue: 0,
    totalAmount: 12800,
    status: 'Submitted to Admin',
    workNotes: 'Full chemical wash on all 4 cassette units. Added anti-bacterial treatment per client request. Additional ₱800 for treatment.',
    submittedAt: daysAgo(3),
    createdAt: daysAgo(4),
  },
];

// ─── STORE ────────────────────────────────────────────────────────────────────
export const useStore = create<AppState>()(
  persist(
    (set, get) => ({
      currentUser: null,
      users: [],
      jobs: [],
      technicians: [],
      notifications: [],
      messages: [],
      chatArchives: [],
      invoices: [],
      serviceInvoices: [],
      billingStatements: [],

      // ── AUTH ──────────────────────────────────────────────────────────────
      login: async (email, password) => {
        const res = await api.login(email.trim().toLowerCase(), password.trim());
        if (!res.ok || !res.data) return { success: false, error: res.error || 'Invalid email or password.' };
        const u = res.data;
        set({ currentUser: u });
        void get().hydrate();
        return { success: true, role: u.role };
      },

      register: async (data) => {
        const res = await api.register(data as Record<string, unknown>);
        if (!res.ok || !res.data) return { success: false, error: res.error || 'Registration failed.' };
        const u = res.data;
        set(s => ({ users: [...s.users, u], currentUser: u }));
        void get().hydrate();
        return { success: true };
      },

      logout: () => { api.logout(); set({ currentUser: null }); },

      // ── HYDRATION (server is the system of record) ────────────────────────
      hydrate: async () => {
        const me = get().currentUser;
        if (!me) return;
        const isStaff = me.role === 'admin' || me.role === 'operator';
        try {
          const [techs, jobs, invoices, messages, notifications, archives, users] = await Promise.all([
            api.getTechnicians(),
            api.getJobs(isStaff ? undefined : me.id),
            api.getInvoices(isStaff ? undefined : me.id),
            api.getMessages(),
            api.getNotifications(me.id),
            api.getArchives(me.role === 'client' ? me.id : undefined, me.role === 'operator' ? me.id : undefined),
            isStaff ? api.getClients() : Promise.resolve(null),
          ]);
          const jobIds = new Set((jobs ?? get().jobs).map(j => j.id));
          set(s => ({
            technicians: techs ?? s.technicians,
            jobs: jobs ?? s.jobs,
            serviceInvoices: invoices ? invoices.serviceInvoices : s.serviceInvoices,
            billingStatements: invoices ? invoices.billingStatements : s.billingStatements,
            messages: messages ? (isStaff ? messages : messages.filter(m => jobIds.has(m.jobId))) : s.messages,
            notifications: notifications ?? s.notifications,
            chatArchives: archives ?? s.chatArchives,
            users: users ?? s.users,
          }));
        } catch { /* offline — keep local cache */ }
        // 7-day retention job runs server-side; refresh archives after
        void api.runArchiveJob().then(async ran => {
          if (!ran) return;
          const a = await api.getArchives(me.role === 'client' ? me.id : undefined, me.role === 'operator' ? me.id : undefined);
          if (a) set({ chatArchives: a });
        });
      },

      // ── JOBS ──────────────────────────────────────────────────────────────
      addJob: (j) => { const job: Job = { ...j, id: 'JOB' + generateId(), createdAt: new Date().toISOString() }; set(s => ({ jobs: [job, ...s.jobs] })); api.createJob(job); return job; },
      updateJob: (id, u) => {
        const prevJob = get().jobs.find(j => j.id === id);
        set(s => ({ jobs: s.jobs.map(j => j.id === id ? { ...j, ...u } : j) }));
        api.updateJob(id, u);
        if (!prevJob) return;
        if (u.status === 'Completed' && prevJob.status !== 'Completed') {
          get().addNotification({ userId: prevJob.clientId, jobId: id, message: `Your ${prevJob.serviceType} service is complete! Please rate your experience — it takes just 5 seconds. ⭐`, type: 'success', read: false });
          // Guarantee: every completed job has a billing statement (full proof-of-payment trail)
          if (!get().billingStatements.some(b => b.jobId === id)) {
            const opId = prevJob.operatorId || 'ADMIN001';
            const opName = prevJob.operatorName || 'ACT Admin';
            get().createBillingStatement({
              jobId: id, clientId: prevJob.clientId, clientName: prevJob.clientName,
              operatorId: opId, operatorName: opName,
              technicianName: u.technicianName || prevJob.technicianName,
              lineItems: [{ id: '1', description: `${prevJob.serviceType} — ${prevJob.acType} (×${prevJob.numberOfUnits} unit${prevJob.numberOfUnits > 1 ? 's' : ''})`, category: 'Service', quantity: prevJob.numberOfUnits, unitPrice: prevJob.numberOfUnits > 0 ? prevJob.totalPrice / prevJob.numberOfUnits : prevJob.totalPrice, amount: prevJob.totalPrice }],
              subtotal: prevJob.totalPrice, reservationFeePaid: prevJob.reservationFee,
              amountDue: Math.max(0, prevJob.totalPrice - prevJob.reservationFee), totalAmount: prevJob.totalPrice,
              status: 'Draft', workNotes: u.techFieldNotes || prevJob.techFieldNotes,
            });
            get().addNotification({ userId: opId, jobId: id, message: `A draft billing statement was auto-created for completed job ${id}. Review and submit it to admin.`, type: 'info', read: false });
          }
        }
        if (u.status === 'Cancelled' && prevJob.status !== 'Cancelled') {
          get().addNotification({ userId: 'ADMIN001', jobId: id, message: `Job ${id} (${prevJob.clientName}) was cancelled. ${u.cancellationReason ? 'Reason: ' + u.cancellationReason : ''}`, type: 'warning', read: false });
          if (prevJob.operatorId) get().addNotification({ userId: prevJob.operatorId, jobId: id, message: `Job ${id} (${prevJob.clientName}) has been cancelled.`, type: 'warning', read: false });
        }
        if (u.technicianId && u.technicianName && u.technicianId !== prevJob.technicianId) {
          get().addNotification({ userId: prevJob.clientId, jobId: id, message: `${u.technicianName} has been assigned to your ${prevJob.serviceType} on ${prevJob.preferredDate}. We'll message you shortly with details!`, type: 'success', read: false });
        }
      },
      getJobsByClient: (cid) => get().jobs.filter(j => j.clientId === cid),

      // ── TECHNICIANS ───────────────────────────────────────────────────────
      addTechnician: (t) => { const tech: Technician = { ...t, id: 'TECH' + generateId(), createdAt: new Date().toISOString() }; set(s => ({ technicians: [...s.technicians, tech] })); api.createTechnician(tech); },
      updateTechnician: (id, u) => { api.updateTechnician(id, u); set(s => ({ technicians: s.technicians.map(t => t.id === id ? { ...t, ...u } : t) })); },

      // ── NOTIFICATIONS ─────────────────────────────────────────────────────
      addNotification: (n) => { const notif: _N = { ...n, id: generateId(), createdAt: new Date().toISOString() }; set(s => ({ notifications: [notif, ...s.notifications] })); api.createNotification(notif); },
      markNotificationRead: (id) => { api.markNotificationsRead([id]); set(s => ({ notifications: s.notifications.map(n => n.id === id ? { ...n, read: true } : n) })); },

      // ── MESSAGES ──────────────────────────────────────────────────────────
      sendMessage: (m) => { const msg: Message = { ...m, id: 'MSG' + generateId(), createdAt: new Date().toISOString() }; set(s => ({ messages: [...s.messages, msg] })); api.sendMessage(msg); return msg; },
      markMessagesRead: (jid, uid) => { api.markThreadRead(jid, uid); set(s => ({ messages: s.messages.map(m => m.jobId === jid && !m.readBy.includes(uid) ? { ...m, readBy: [...m.readBy, uid] } : m) })); },
      respondToCalendarInvite: (mid, accepted, uid) => { api.calendarResponse(mid, accepted, uid); set(s => ({ messages: s.messages.map(m => m.id === mid && m.calendarData ? { ...m, calendarData: { ...m.calendarData, accepted }, readBy: [...new Set([...m.readBy, uid])] } : m) })); },
      archiveExpiredChats: () => {
        const cutoff = Date.now() - CHAT_RETENTION_DAYS * 24 * 60 * 60 * 1000;
        const { messages, jobs } = get();
        const expired = messages.filter(m => new Date(m.createdAt).getTime() < cutoff);
        if (expired.length === 0) return 0;
        const live = messages.filter(m => new Date(m.createdAt).getTime() >= cutoff);
        const byJob: Record<string, Message[]> = {};
        expired.forEach(m => { (byJob[m.jobId] = byJob[m.jobId] || []).push(m); });
        const now = new Date().toISOString();
        set(s => {
          const archives = [...s.chatArchives];
          Object.entries(byJob).forEach(([jobId, msgs]) => {
            const job = jobs.find(j => j.id === jobId);
            const slim: ArchivedMessage[] = msgs.map(m => ({ id: m.id, senderId: m.senderId, senderName: m.senderName, senderRole: m.senderRole, content: m.content, type: m.type, createdAt: m.createdAt }));
            const idx = archives.findIndex(a => a.jobId === jobId);
            if (idx >= 0) {
              const merged = [...archives[idx].messages, ...slim].sort((a, b) => a.createdAt.localeCompare(b.createdAt));
              archives[idx] = { ...archives[idx], messages: merged, messageCount: merged.length, archivedAt: now, fromDate: merged[0].createdAt, toDate: merged[merged.length - 1].createdAt };
            } else {
              const sorted = [...slim].sort((a, b) => a.createdAt.localeCompare(b.createdAt));
              archives.push({ id: 'ARC-' + jobId, jobId, clientId: job?.clientId || '', clientName: job?.clientName || 'Unknown', operatorId: job?.operatorId, operatorName: job?.operatorName, archivedAt: now, fromDate: sorted[0].createdAt, toDate: sorted[sorted.length - 1].createdAt, messageCount: sorted.length, messages: sorted });
            }
          });
          return { chatArchives: archives, messages: live };
        });
        return expired.length;
      },

      // ── OPERATORS / USERS ──────────────────────────────────────────────────
      addOperator: (op) => { const o: User = { ...op, id: 'OP' + generateId(), role: 'operator', operatorStatus: 'Active', createdAt: new Date().toISOString() }; set(s => ({ users: [...s.users, o] })); void api.register({ ...o, role: 'operator', password: 'operator' + generateId().slice(0, 6) }).then(() => api.updateClient(o.id, { operatorStatus: o.operatorStatus, assignedCities: o.assignedCities })); },
      updateOperator: (id, u) => { api.updateClient(id, u); set(s => ({ users: s.users.map(x => x.id === id ? { ...x, ...u } : x) })); },
      updateUser: (id, u) => { api.updateClient(id, u); set(s => ({ users: s.users.map(x => x.id === id ? { ...x, ...u } : x) })); },
      addUserAsAdmin: (data) => {
        const nu: User = {
          id: 'CLIENT' + generateId(),
          email: data.email || `client_${generateId()}@act.ph`,
          firstName: data.firstName || 'Client',
          lastName: data.lastName || '',
          phone: data.phone || '09170000000',
          role: 'client',
          address: data.address,
          city: data.city,
          clientType: data.clientType || 'Residential',
          acUnits: data.acUnits || 1,
          followUpStatus: 'On track',
          leadSource: data.leadSource || 'Referral',
          preferredTechnicianId: data.preferredTechnicianId,
          preferredTechnicianName: data.preferredTechnicianName,
          createdAt: new Date().toISOString(),
        };
        set(s => ({ users: [...s.users, nu] }));
        void api.register({ ...nu, password: 'client' + generateId().slice(0, 8) });
        return nu;
      },

      // ── LEGACY INVOICES ───────────────────────────────────────────────────
      addInvoice: (inv) => set(s => ({ invoices: [...s.invoices, { ...inv, id: 'INV' + generateId() }] })),
      updateInvoice: (id, u) => set(s => ({ invoices: s.invoices.map(i => i.id === id ? { ...i, ...u } : i) })),

      // ── SERVICE INVOICES (pre-service quotes) ──────────────────────────────
      createServiceInvoice: (inv) => {
        const si: ServiceInvoice = { ...inv, id: 'SINV-' + inv.jobId + '-' + generateId().slice(0, 4), createdAt: new Date().toISOString() };
        set(s => ({ serviceInvoices: [si, ...s.serviceInvoices] }));
        api.createInvoice('service_invoice', si);
        return si;
      },
      updateServiceInvoice: (id, u) => { set(s => ({ serviceInvoices: s.serviceInvoices.map(i => i.id === id ? { ...i, ...u } : i) })); api.pushServiceInvoice(get().serviceInvoices.find(i => i.id === id)); },
      sendServiceInvoice: (id) => {
        const now = new Date().toISOString();
        const existing = get().serviceInvoices.find(i => i.id === id);
        const isRevision = existing?.status === 'Revision Requested';
        set(s => ({ serviceInvoices: s.serviceInvoices.map(i => i.id === id ? { ...i, status: 'Sent' as InvoiceStatus, sentAt: now, viewedAt: undefined, respondedAt: undefined, clientNote: undefined, revisionCount: isRevision ? (i.revisionCount || 0) + 1 : (i.revisionCount || 0), revisedAt: isRevision ? now : i.revisedAt } : i) }));
        const inv = get().serviceInvoices.find(i => i.id === id);
        api.pushServiceInvoice(inv);
        if (inv) {
          const msg = isRevision
            ? `Revised invoice ${inv.id} (Rev. ${inv.revisionCount}) for ₱${inv.totalAmount.toLocaleString()} is ready. Please review the updated quote.`
            : `Your service invoice ${inv.id} for ₱${inv.totalAmount.toLocaleString()} has been sent. Please review and respond.`;
          get().addNotification({ userId: inv.clientId, jobId: inv.jobId, message: msg, type: 'info', read: false });
        }
      },
      respondToServiceInvoice: (id, action, note, clientId) => {
        const now = new Date().toISOString();
        const statusMap = { accept: 'Accepted' as InvoiceStatus, revision: 'Revision Requested' as InvoiceStatus, cancel: 'Cancelled by Client' as InvoiceStatus };
        set(s => ({ serviceInvoices: s.serviceInvoices.map(i => i.id === id ? { ...i, status: statusMap[action], clientNote: note, respondedAt: now } : i) }));
        const inv = get().serviceInvoices.find(i => i.id === id);
        api.pushServiceInvoice(inv);
        if (inv) {
          if (action === 'cancel') {
            get().updateJob(inv.jobId, { status: 'Cancelled', cancellationReason: note || 'Client cancelled after reviewing invoice.' });
          }
          if (action === 'accept') {
            get().updateJob(inv.jobId, { status: 'Confirmed', totalPrice: inv.totalAmount, balanceDue: inv.balanceDue });
          }
          get().addNotification({
            userId: inv.operatorId, jobId: inv.jobId,
            message: action === 'accept' ? `Client ${inv.clientName} accepted invoice ${inv.id}.` : action === 'revision' ? `Client ${inv.clientName} requested a revision on invoice ${inv.id}: "${note}"` : `Client ${inv.clientName} cancelled booking ${inv.jobId} after reviewing invoice ${inv.id}.`,
            type: action === 'accept' ? 'success' : action === 'revision' ? 'warning' : 'error', read: false,
          });
          get().addNotification({ userId: 'ADMIN001', jobId: inv.jobId, message: `Invoice ${inv.id}: client ${action === 'accept' ? 'accepted' : action === 'revision' ? 'requested revision' : 'cancelled after reviewing'}.`, type: action === 'accept' ? 'success' : 'warning', read: false });
        }
      },

      // ── BILLING STATEMENTS (post-service) ─────────────────────────────────
      createBillingStatement: (bill) => {
        const bs: BillingStatement = { ...bill, id: 'BILL-' + bill.jobId + '-' + generateId().slice(0, 4), createdAt: new Date().toISOString() };
        set(s => ({ billingStatements: [bs, ...s.billingStatements] }));
        api.createInvoice('billing_statement', bs);
        return bs;
      },
      updateBillingStatement: (id, u) => { set(s => ({ billingStatements: s.billingStatements.map(b => b.id === id ? { ...b, ...u } : b) })); api.pushBillingStatement(get().billingStatements.find(b => b.id === id)); },
      submitBillingToAdmin: (id) => {
        const now = new Date().toISOString();
        set(s => ({ billingStatements: s.billingStatements.map(b => b.id === id ? { ...b, status: 'Submitted to Admin' as BillingStatus, submittedAt: now } : b) }));
        api.pushBillingStatement(get().billingStatements.find(b => b.id === id));
        get().addNotification({ userId: 'ADMIN001', message: `Billing statement ${id} submitted for review.`, type: 'info', read: false });
      },
      adminReviewBilling: (id, approved, adminNotes) => {
        const now = new Date().toISOString();
        const newStatus: BillingStatus = approved ? 'Admin Approved' : 'Admin Rejected';
        set(s => ({ billingStatements: s.billingStatements.map(b => b.id === id ? { ...b, status: newStatus, adminNotes, adminReviewedAt: now } : b) }));
        api.pushBillingStatement(get().billingStatements.find(b => b.id === id));
        const bill = get().billingStatements.find(b => b.id === id);
        if (bill) get().addNotification({ userId: bill.operatorId, jobId: bill.jobId, message: approved ? `Your billing statement ${id} was approved by admin.` : `Your billing statement ${id} was returned for revision. Notes: "${adminNotes}"`, type: approved ? 'success' : 'warning', read: false });
      },
      sendBillingToClient: (id) => {
        const now = new Date().toISOString();
        set(s => ({ billingStatements: s.billingStatements.map(b => b.id === id ? { ...b, status: 'Sent to Client' as BillingStatus, sentToClientAt: now } : b) }));
        api.pushBillingStatement(get().billingStatements.find(b => b.id === id));
        const bill = get().billingStatements.find(b => b.id === id);
        if (bill) get().addNotification({ userId: bill.clientId, jobId: bill.jobId, message: `Your billing statement ${bill.id} for ₱${bill.amountDue.toLocaleString()} is ready. ${bill.amountDue > 0 ? 'Balance due.' : 'Fully paid!'}`, type: bill.amountDue > 0 ? 'info' : 'success', read: false });
      },
      markBillingPaid: (id, paymentMethod, paymentReference) => {
        const now = new Date().toISOString();
        const bill = get().billingStatements.find(b => b.id === id);
        if (!bill) return;
        const amountPaidAtClose = bill.amountDue;
        const receiptNumber = bill.receiptNumber || ('OR-' + new Date().getFullYear() + '-' + String(Date.now()).slice(-6));
        set(s => ({ billingStatements: s.billingStatements.map(b => b.id === id ? { ...b, status: 'Paid' as BillingStatus, paidAt: now, paymentMethod, paymentReference, receiptNumber, amountDue: 0, amountPaidAtClose } : b) }));
        api.pushBillingStatement(get().billingStatements.find(b => b.id === id));
        get().updateJob(bill.jobId, { paymentStatus: 'Fully paid', balanceDue: 0 });
        get().addNotification({ userId: bill.operatorId, jobId: bill.jobId, message: `Billing ${id} for job ${bill.jobId} marked as paid (${paymentMethod}).`, type: 'success', read: false });
        get().addNotification({ userId: bill.clientId, jobId: bill.jobId, message: `Payment received! Official Receipt ${receiptNumber} issued. Your service is now fully settled. Thank you for choosing ACT! 🙏`, type: 'success', read: false });
        get().addNotification({ userId: 'ADMIN001', jobId: bill.jobId, message: `Payment recorded for ${bill.clientName} — ${paymentMethod}${paymentReference ? ' (ref: ' + paymentReference + ')' : ''}, OR ${receiptNumber}.`, type: 'success', read: false });
      },
      markBillingOverdue: (id) => {
        set(s => ({ billingStatements: s.billingStatements.map(b => b.id === id ? { ...b, status: 'Overdue' as BillingStatus } : b) }));
        api.pushBillingStatement(get().billingStatements.find(b => b.id === id));
        const bill = get().billingStatements.find(b => b.id === id);
        if (bill) {
          get().addNotification({ userId: bill.clientId, jobId: bill.jobId, message: `⚠️ Your payment for job ${bill.jobId} (₱${bill.amountDue.toLocaleString()}) is now overdue. Please settle at your earliest convenience.`, type: 'warning', read: false });
          get().addNotification({ userId: 'ADMIN001', jobId: bill.jobId, message: `Billing ${id} for ${bill.clientName} is overdue (₱${bill.amountDue.toLocaleString()}).`, type: 'warning', read: false });
        }
      },
    }),
    {
      name: 'act-store-v8',
      partialize: (s) => ({
        currentUser: s.currentUser,
        users: s.users,
        jobs: s.jobs,
        technicians: s.technicians,
        notifications: s.notifications,
        messages: s.messages,
        chatArchives: s.chatArchives,
        invoices: s.invoices,
        serviceInvoices: s.serviceInvoices,
        billingStatements: s.billingStatements,
      }),
    }
  )
);

export const SERVICE_PRICING = SERVICE_PRICES;
