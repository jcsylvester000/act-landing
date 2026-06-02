import { create } from 'zustand';
import { persist } from 'zustand/middleware';

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
  createdAt: string;
}

export type JobStatus = 'Pending' | 'Awaiting Payment' | 'Confirmed' | 'Scheduled' | 'Active' | 'Completed' | 'Cancelled';
export type PaymentStatus = 'Unpaid' | 'Awaiting Confirmation' | 'Fee paid' | 'Fully paid' | 'Refunded';
export type TimeSlot = 'AM' | 'PM' | 'Flexible';
export type ServiceType = 'Basic Cleaning' | 'Deep Clean / Chemical Wash';
export type ACType = 'Split Type' | 'Window Type' | 'Cassette Type';
export type CoverageCity = 'Quezon City' | 'Makati' | 'Pasig' | 'Taguig' | 'Mandaluyong' | 'Parañaque';

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

export type MessageType = 'text' | 'calendar_invite' | 'status_update' | 'system';
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
  paymentMethod?: 'GCash' | 'Cash' | 'Bank Transfer';
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
  invoices: Invoice[];
  serviceInvoices: ServiceInvoice[];
  billingStatements: BillingStatement[];

  // Auth
  login: (email: string, password: string) => { success: boolean; role?: UserRole; error?: string };
  register: (data: Partial<User> & { password: string }) => { success: boolean; error?: string };
  logout: () => void;

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
  respondToCalendarInvite: (messageId: string, accepted: boolean, userId: string) => void;

  // Operators
  addOperator: (op: Omit<User, 'id' | 'createdAt' | 'role'>) => void;
  updateOperator: (id: string, updates: Partial<User>) => void;

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
  markBillingPaid: (id: string, paymentMethod: BillingStatement['paymentMethod']) => void;
}

// ─── PRICING ──────────────────────────────────────────────────────────────────
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
};

const generateId = () => Math.random().toString(36).substr(2, 9).toUpperCase();

// ─── SEED DATA ────────────────────────────────────────────────────────────────
const seedTechnicians: Technician[] = [
  { id: 'TECH001', fullName: 'Mark Santos', phone: '09171234567', type: 'Inhouse', skillLevel: 'Senior', coverageCities: ['Quezon City', 'Mandaluyong', 'Pasig'], isAvailable: true, active: true, averageRating: 4.8, totalJobsCompleted: 127, createdAt: '2026-01-15' },
  { id: 'TECH002', fullName: 'Jose Reyes', phone: '09281234567', type: 'Inhouse', skillLevel: 'Lead', coverageCities: ['Makati', 'Taguig', 'Parañaque'], isAvailable: true, active: true, averageRating: 4.9, totalJobsCompleted: 215, createdAt: '2025-11-01' },
  { id: 'TECH003', fullName: 'Carlo Cruz', phone: '09391234567', type: 'Outsource', skillLevel: 'Junior', coverageCities: ['Quezon City', 'Mandaluyong'], isAvailable: true, active: true, averageRating: 4.5, totalJobsCompleted: 43, createdAt: '2026-03-01' },
  { id: 'TECH004', fullName: 'Rodel Garcia', phone: '09451234567', type: 'Outsource', skillLevel: 'Senior', coverageCities: ['Pasig', 'Makati', 'Taguig'], isAvailable: false, active: true, averageRating: 4.7, totalJobsCompleted: 89, createdAt: '2026-02-10' },
];

const fmt = (d: Date) => d.toISOString().split('T')[0];
const daysAgo = (n: number) => { const d = new Date(); d.setDate(d.getDate() - n); return fmt(d); };
const daysAhead = (n: number) => { const d = new Date(); d.setDate(d.getDate() + n); return fmt(d); };

const seedJobs: Job[] = [
  { id: 'JOB001', clientId: 'CLIENT001', clientName: 'Ana Villanueva', serviceType: 'Basic Cleaning', acType: 'Split Type', numberOfUnits: 2, serviceAddress: '45 Katipunan Ave', city: 'Quezon City', preferredDate: daysAhead(2), timeSlot: 'AM', totalPrice: 3000, reservationFee: 300, balanceDue: 2700, paymentStatus: 'Fee paid', status: 'Confirmed', technicianId: 'TECH001', technicianName: 'Mark Santos', operatorId: 'OP001', operatorName: 'Maria Santos', createdAt: daysAgo(1), nextDueDate: daysAhead(90) },
  { id: 'JOB002', clientId: 'CLIENT002', clientName: 'Bong Mendoza', serviceType: 'Deep Clean / Chemical Wash', acType: 'Split Type', numberOfUnits: 3, serviceAddress: '12 Ayala Ave', city: 'Makati', preferredDate: daysAhead(1), timeSlot: 'PM', totalPrice: 7500, reservationFee: 500, balanceDue: 7000, paymentStatus: 'Awaiting Confirmation', status: 'Awaiting Payment', operatorId: 'OP002', operatorName: 'Danny Cruz', createdAt: daysAgo(0), nextDueDate: daysAhead(180) },
  { id: 'JOB003', clientId: 'CLIENT003', clientName: 'Cris Lim', serviceType: 'Basic Cleaning', acType: 'Window Type', numberOfUnits: 1, serviceAddress: '88 Ortigas Ave', city: 'Pasig', preferredDate: daysAgo(7), timeSlot: 'AM', totalPrice: 1200, reservationFee: 300, balanceDue: 0, paymentStatus: 'Fully paid', status: 'Completed', technicianId: 'TECH002', technicianName: 'Jose Reyes', operatorId: 'OP001', operatorName: 'Maria Santos', createdAt: daysAgo(10), nextDueDate: daysAhead(83), rating: 5, review: 'Excellent service!' },
  { id: 'JOB004', clientId: 'CLIENT004', clientName: 'Diana Torres', serviceType: 'Deep Clean / Chemical Wash', acType: 'Cassette Type', numberOfUnits: 4, serviceAddress: '200 BGC High Street', city: 'Taguig', preferredDate: daysAgo(3), timeSlot: 'AM', totalPrice: 12000, reservationFee: 500, balanceDue: 0, paymentStatus: 'Fully paid', status: 'Completed', technicianId: 'TECH002', technicianName: 'Jose Reyes', operatorId: 'OP002', operatorName: 'Danny Cruz', createdAt: daysAgo(5), nextDueDate: daysAhead(177), rating: 4, review: 'Very thorough.' },
  { id: 'JOB005', clientId: 'CLIENT005', clientName: 'Enzo Pascual', serviceType: 'Basic Cleaning', acType: 'Split Type', numberOfUnits: 1, serviceAddress: '55 Shaw Blvd', city: 'Mandaluyong', preferredDate: fmt(new Date()), timeSlot: 'AM', totalPrice: 1500, reservationFee: 300, balanceDue: 1200, paymentStatus: 'Fee paid', status: 'Active', technicianId: 'TECH001', technicianName: 'Mark Santos', operatorId: 'OP001', operatorName: 'Maria Santos', createdAt: daysAgo(2), nextDueDate: daysAhead(90) },
  { id: 'JOB006', clientId: 'CLIENT001', clientName: 'Ana Villanueva', serviceType: 'Basic Cleaning', acType: 'Split Type', numberOfUnits: 2, serviceAddress: '45 Katipunan Ave', city: 'Quezon City', preferredDate: daysAgo(95), timeSlot: 'PM', totalPrice: 3000, reservationFee: 300, balanceDue: 0, paymentStatus: 'Fully paid', status: 'Completed', technicianId: 'TECH001', technicianName: 'Mark Santos', operatorId: 'OP001', operatorName: 'Maria Santos', createdAt: daysAgo(97), nextDueDate: daysAgo(5), rating: 5, review: 'Always reliable!' },
  { id: 'JOB007', clientId: 'CLIENT006', clientName: 'Fia Navarro', serviceType: 'Basic Cleaning', acType: 'Split Type', numberOfUnits: 2, serviceAddress: '10 Sucat Rd', city: 'Parañaque', preferredDate: daysAhead(3), timeSlot: 'PM', totalPrice: 3000, reservationFee: 300, balanceDue: 2700, paymentStatus: 'Unpaid', status: 'Pending', createdAt: daysAgo(0), nextDueDate: daysAhead(93) },
];

const seedUsers: User[] = [
  { id: 'ADMIN001', email: 'admin@act.ph', firstName: 'Admin', lastName: 'ACT', phone: '09171111111', role: 'admin', createdAt: '2026-01-01' },
  { id: 'CLIENT001', email: 'ana@email.com', firstName: 'Ana', lastName: 'Villanueva', phone: '09172345678', role: 'client', address: '45 Katipunan Ave', city: 'Quezon City', clientType: 'Residential', acUnits: 2, lastServiceDate: daysAgo(95), nextDueDate: daysAgo(5), followUpStatus: 'Overdue', createdAt: '2026-02-01' },
  { id: 'OP001', email: 'maria@act.ph', firstName: 'Maria', lastName: 'Santos', phone: '09181234567', role: 'operator', operatorStatus: 'Active', assignedCities: ['Quezon City', 'Pasig', 'Mandaluyong'], createdAt: '2026-01-10' },
  { id: 'OP002', email: 'danny@act.ph', firstName: 'Danny', lastName: 'Cruz', phone: '09191234567', role: 'operator', operatorStatus: 'Active', assignedCities: ['Makati', 'Taguig', 'Parañaque'], createdAt: '2026-01-15' },
];

const seedMessages: Message[] = [
  { id: 'MSG001', jobId: 'JOB001', senderId: 'OP001', senderName: 'Maria Santos', senderRole: 'operator', content: "Hi Ana! I'm Maria, your ACT coordinator. I'll be managing your aircon cleaning this week. Technician Mark Santos will handle the job.", type: 'text', createdAt: daysAgo(1), readBy: ['CLIENT001', 'OP001'] },
  { id: 'MSG002', jobId: 'JOB001', senderId: 'OP001', senderName: 'Maria Santos', senderRole: 'operator', content: "I've sent you a calendar confirmation. Please confirm.", type: 'calendar_invite', calendarData: { confirmedDate: daysAhead(2), timeSlot: 'AM', technicianName: 'Mark Santos', address: '45 Katipunan Ave, Quezon City', serviceType: 'Basic Cleaning — 2 Split Type units', accepted: undefined }, createdAt: daysAgo(0), readBy: ['OP001'] },
  { id: 'MSG003', jobId: 'JOB005', senderId: 'OP001', senderName: 'Maria Santos', senderRole: 'operator', content: 'Hi Enzo! Mark Santos is on his way. ETA: 15 minutes.', type: 'text', createdAt: daysAgo(0), readBy: ['OP001'] },
  { id: 'MSG004', jobId: 'JOB005', senderId: 'OP001', senderName: 'Maria Santos', senderRole: 'operator', content: 'Mark has arrived and is cleaning your unit.', type: 'status_update', createdAt: daysAgo(0), readBy: ['OP001'] },
  { id: 'MSG005', jobId: 'JOB002', senderId: 'OP002', senderName: 'Danny Cruz', senderRole: 'operator', content: "Hi Bong! I'm Danny from ACT. Your payment is under review. Once verified I'll send over the calendar invite.", type: 'text', createdAt: daysAgo(0), readBy: ['OP002'] },
];

// ─── SEED SERVICE INVOICES ────────────────────────────────────────────────────
const seedServiceInvoices: ServiceInvoice[] = [
  // JOB001 — sent to Ana, awaiting her response (shows cancel-on-high-price workflow)
  {
    id: 'SINV-JOB001-001',
    jobId: 'JOB001',
    clientId: 'CLIENT001',
    clientName: 'Ana Villanueva',
    operatorId: 'OP001',
    operatorName: 'Maria Santos',
    lineItems: [
      { id: 'LI001', description: 'Basic Cleaning — Split Type AC (×2 units)', category: 'Service', quantity: 2, unitPrice: 1500, amount: 3000 },
      { id: 'LI002', description: 'Travel & Logistics — Quezon City', category: 'Travel', quantity: 1, unitPrice: 0, amount: 0 },
    ],
    subtotal: 3000,
    reservationFeePaid: 300,
    balanceDue: 2700,
    totalAmount: 3000,
    status: 'Sent',
    notes: 'Price per unit is ₱1,500. Reservation fee of ₱300 already collected. Balance of ₱2,700 due after service.',
    sentAt: daysAgo(0),
    createdAt: daysAgo(1),
  },
  // JOB005 — accepted invoice for Enzo's active job
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
  // JOB003 — Cris's completed job, billing sent to client
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
  // JOB005 — Enzo's active job, billing draft by operator (not yet submitted)
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
  // JOB004 — Diana's completed job, billing submitted to admin for review
  {
    id: 'BILL-JOB004-001',
    jobId: 'JOB004',
    clientId: 'CLIENT004',
    clientName: 'Diana Torres',
    operatorId: 'OP002',
    operatorName: 'Danny Cruz',
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
      users: seedUsers,
      jobs: seedJobs,
      technicians: seedTechnicians,
      notifications: [],
      messages: seedMessages,
      invoices: [],
      serviceInvoices: seedServiceInvoices,
      billingStatements: seedBillingStatements,

      // ── AUTH ──────────────────────────────────────────────────────────────
      login: (email, password) => {
        const { users } = get();
        const e = email.trim().toLowerCase();
        const p = password.trim();
        const adminEmails = ['admin@act.ph', 'admin@test.com', 'admin@admin.com', 'admin'];
        if (adminEmails.includes(e) && p === 'admin') {
          const u = users.find(u => u.role === 'admin');
          if (u) { set({ currentUser: u }); return { success: true, role: 'admin' as const }; }
        }
        const op = users.find(u => u.role === 'operator' && u.email.toLowerCase() === e);
        if (op && p === 'operator') { set({ currentUser: op }); return { success: true, role: 'operator' as const }; }
        const ex = users.find(u => u.email.toLowerCase() === e);
        if (ex) { set({ currentUser: ex }); return { success: true, role: ex.role }; }
        const nu: User = { id: 'CLIENT' + generateId(), email: e, firstName: e.split('@')[0], lastName: 'User', phone: '09170000000', role: 'client', clientType: 'Residential', acUnits: 1, followUpStatus: 'On track', createdAt: new Date().toISOString() };
        set(s => ({ users: [...s.users, nu], currentUser: nu }));
        return { success: true, role: 'client' as const };
      },

      register: (data) => {
        const { users } = get();
        if (users.find(u => u.email === data.email)) return { success: false, error: 'Email already registered.' };
        const nu: User = { id: 'CLIENT' + generateId(), email: data.email!, firstName: data.firstName!, lastName: data.lastName!, phone: data.phone!, role: 'client', address: data.address, city: data.city as CoverageCity, clientType: 'Residential', acUnits: 1, followUpStatus: 'On track', createdAt: new Date().toISOString() };
        set(s => ({ users: [...s.users, nu], currentUser: nu }));
        return { success: true };
      },

      logout: () => set({ currentUser: null }),

      // ── JOBS ──────────────────────────────────────────────────────────────
      addJob: (j) => { const job: Job = { ...j, id: 'JOB' + generateId(), createdAt: new Date().toISOString() }; set(s => ({ jobs: [job, ...s.jobs] })); return job; },
      updateJob: (id, u) => set(s => ({ jobs: s.jobs.map(j => j.id === id ? { ...j, ...u } : j) })),
      getJobsByClient: (cid) => get().jobs.filter(j => j.clientId === cid),

      // ── TECHNICIANS ───────────────────────────────────────────────────────
      addTechnician: (t) => { const tech: Technician = { ...t, id: 'TECH' + generateId(), createdAt: new Date().toISOString() }; set(s => ({ technicians: [...s.technicians, tech] })); },
      updateTechnician: (id, u) => set(s => ({ technicians: s.technicians.map(t => t.id === id ? { ...t, ...u } : t) })),

      // ── NOTIFICATIONS ─────────────────────────────────────────────────────
      addNotification: (n) => { const notif: _N = { ...n, id: generateId(), createdAt: new Date().toISOString() }; set(s => ({ notifications: [notif, ...s.notifications] })); },
      markNotificationRead: (id) => set(s => ({ notifications: s.notifications.map(n => n.id === id ? { ...n, read: true } : n) })),

      // ── MESSAGES ──────────────────────────────────────────────────────────
      sendMessage: (m) => { const msg: Message = { ...m, id: 'MSG' + generateId(), createdAt: new Date().toISOString() }; set(s => ({ messages: [...s.messages, msg] })); return msg; },
      markMessagesRead: (jid, uid) => set(s => ({ messages: s.messages.map(m => m.jobId === jid && !m.readBy.includes(uid) ? { ...m, readBy: [...m.readBy, uid] } : m) })),
      respondToCalendarInvite: (mid, accepted, uid) => set(s => ({ messages: s.messages.map(m => m.id === mid && m.calendarData ? { ...m, calendarData: { ...m.calendarData, accepted }, readBy: [...new Set([...m.readBy, uid])] } : m) })),

      // ── OPERATORS ─────────────────────────────────────────────────────────
      addOperator: (op) => { const o: User = { ...op, id: 'OP' + generateId(), role: 'operator', operatorStatus: 'Active', createdAt: new Date().toISOString() }; set(s => ({ users: [...s.users, o] })); },
      updateOperator: (id, u) => set(s => ({ users: s.users.map(x => x.id === id ? { ...x, ...u } : x) })),

      // ── LEGACY INVOICES ───────────────────────────────────────────────────
      addInvoice: (inv) => set(s => ({ invoices: [...s.invoices, { ...inv, id: 'INV' + generateId() }] })),
      updateInvoice: (id, u) => set(s => ({ invoices: s.invoices.map(i => i.id === id ? { ...i, ...u } : i) })),

      // ── SERVICE INVOICES (pre-service quotes) ──────────────────────────────
      createServiceInvoice: (inv) => {
        const si: ServiceInvoice = { ...inv, id: 'SINV-' + inv.jobId + '-' + generateId().slice(0, 4), createdAt: new Date().toISOString() };
        set(s => ({ serviceInvoices: [si, ...s.serviceInvoices] }));
        return si;
      },
      updateServiceInvoice: (id, u) => set(s => ({ serviceInvoices: s.serviceInvoices.map(i => i.id === id ? { ...i, ...u } : i) })),
      sendServiceInvoice: (id) => {
        const now = new Date().toISOString();
        set(s => ({ serviceInvoices: s.serviceInvoices.map(i => i.id === id ? { ...i, status: 'Sent' as InvoiceStatus, sentAt: now } : i) }));
        // Notify client
        const inv = get().serviceInvoices.find(i => i.id === id);
        if (inv) get().addNotification({ userId: inv.clientId, jobId: inv.jobId, message: `Your service invoice ${inv.id} for ₱${inv.totalAmount.toLocaleString()} has been sent. Please review and respond.`, type: 'info', read: false });
      },
      respondToServiceInvoice: (id, action, note, clientId) => {
        const now = new Date().toISOString();
        const statusMap = { accept: 'Accepted' as InvoiceStatus, revision: 'Revision Requested' as InvoiceStatus, cancel: 'Cancelled by Client' as InvoiceStatus };
        set(s => ({ serviceInvoices: s.serviceInvoices.map(i => i.id === id ? { ...i, status: statusMap[action], clientNote: note, respondedAt: now } : i) }));
        const inv = get().serviceInvoices.find(i => i.id === id);
        if (inv) {
          // If cancelled, update job
          if (action === 'cancel') {
            get().updateJob(inv.jobId, { status: 'Cancelled', cancellationReason: note || 'Client cancelled after reviewing invoice.' });
          }
          // Notify operator
          get().addNotification({
            userId: inv.operatorId, jobId: inv.jobId,
            message: action === 'accept' ? `Client ${inv.clientName} accepted invoice ${inv.id}.` : action === 'revision' ? `Client ${inv.clientName} requested a revision on invoice ${inv.id}: "${note}"` : `Client ${inv.clientName} cancelled booking ${inv.jobId} after reviewing invoice ${inv.id}.`,
            type: action === 'accept' ? 'success' : action === 'revision' ? 'warning' : 'error', read: false,
          });
          // Also notify admin
          get().addNotification({ userId: 'ADMIN001', jobId: inv.jobId, message: `Invoice ${inv.id}: client ${action === 'accept' ? 'accepted' : action === 'revision' ? 'requested revision' : 'cancelled after reviewing'}.`, type: action === 'accept' ? 'success' : 'warning', read: false });
        }
      },

      // ── BILLING STATEMENTS (post-service) ─────────────────────────────────
      createBillingStatement: (bill) => {
        const bs: BillingStatement = { ...bill, id: 'BILL-' + bill.jobId + '-' + generateId().slice(0, 4), createdAt: new Date().toISOString() };
        set(s => ({ billingStatements: [bs, ...s.billingStatements] }));
        return bs;
      },
      updateBillingStatement: (id, u) => set(s => ({ billingStatements: s.billingStatements.map(b => b.id === id ? { ...b, ...u } : b) })),
      submitBillingToAdmin: (id) => {
        const now = new Date().toISOString();
        set(s => ({ billingStatements: s.billingStatements.map(b => b.id === id ? { ...b, status: 'Submitted to Admin' as BillingStatus, submittedAt: now } : b) }));
        get().addNotification({ userId: 'ADMIN001', message: `Billing statement ${id} submitted for review.`, type: 'info', read: false });
      },
      adminReviewBilling: (id, approved, adminNotes) => {
        const now = new Date().toISOString();
        const newStatus: BillingStatus = approved ? 'Admin Approved' : 'Admin Rejected';
        set(s => ({ billingStatements: s.billingStatements.map(b => b.id === id ? { ...b, status: newStatus, adminNotes, adminReviewedAt: now } : b) }));
        const bill = get().billingStatements.find(b => b.id === id);
        if (bill) get().addNotification({ userId: bill.operatorId, jobId: bill.jobId, message: approved ? `Your billing statement ${id} was approved by admin.` : `Your billing statement ${id} was returned for revision. Notes: "${adminNotes}"`, type: approved ? 'success' : 'warning', read: false });
      },
      sendBillingToClient: (id) => {
        const now = new Date().toISOString();
        set(s => ({ billingStatements: s.billingStatements.map(b => b.id === id ? { ...b, status: 'Sent to Client' as BillingStatus, sentToClientAt: now } : b) }));
        const bill = get().billingStatements.find(b => b.id === id);
        if (bill) get().addNotification({ userId: bill.clientId, jobId: bill.jobId, message: `Your billing statement ${bill.id} for ₱${bill.amountDue.toLocaleString()} is ready. ${bill.amountDue > 0 ? 'Balance due.' : 'Fully paid!'}`, type: bill.amountDue > 0 ? 'info' : 'success', read: false });
      },
      markBillingPaid: (id, paymentMethod) => {
        const now = new Date().toISOString();
        set(s => ({
          billingStatements: s.billingStatements.map(b => b.id === id ? { ...b, status: 'Paid' as BillingStatus, paidAt: now, paymentMethod, amountDue: 0 } : b),
        }));
        // Update job payment status
        const bill = get().billingStatements.find(b => b.id === id);
        if (bill) {
          get().updateJob(bill.jobId, { paymentStatus: 'Fully paid', balanceDue: 0 });
          get().addNotification({ userId: bill.operatorId, jobId: bill.jobId, message: `Billing ${id} for job ${bill.jobId} marked as paid (${paymentMethod}).`, type: 'success', read: false });
        }
      },
    }),
    {
      name: 'act-store-v5',
      partialize: (s) => ({
        currentUser: s.currentUser,
        users: s.users,
        jobs: s.jobs,
        technicians: s.technicians,
        notifications: s.notifications,
        messages: s.messages,
        invoices: s.invoices,
        serviceInvoices: s.serviceInvoices,
        billingStatements: s.billingStatements,
      }),
    }
  )
);

export const SERVICE_PRICING = SERVICE_PRICES;
