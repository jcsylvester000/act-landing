// ─── API CLIENT (browser → /api routes → Neon) ────────────────────────────────
// Dual-write bridge for the Zustand store: local state updates instantly for
// the UI, and every mutation is persisted to the server with the SAME id.
// Hydration replaces local slices with server truth on dashboard load.
// All calls are fire-safe: network failures log and never throw into the UI.

import type {
  User, Job, Technician, Message, ChatArchive, ArchivedMessage,
  ServiceInvoice, BillingStatement, AppNotification,
} from '@/store';

type Envelope<T> = { ok: boolean; data?: T; error?: string };

async function call<T = unknown>(path: string, method = 'GET', body?: unknown): Promise<Envelope<T>> {
  try {
    const res = await fetch(`/api${path}`, {
      method,
      headers: body ? { 'Content-Type': 'application/json' } : undefined,
      body: body ? JSON.stringify(body) : undefined,
      credentials: 'same-origin',
    });
    const json = (await res.json()) as Envelope<T>;
    if (!json.ok) console.warn(`[api] ${method} ${path} →`, json.error);
    return json;
  } catch (e) {
    console.warn(`[api] ${method} ${path} failed:`, e);
    return { ok: false, error: 'Network error — working from local cache.' };
  }
}

// ─── shape mappers (server ↔ store) ──────────────────────────────────────────

type ServerJob = Job & { client?: { firstName: string; lastName: string }; cancelReason?: string; assignments?: { technicianId: string; technician?: { fullName: string } }[] };
function mapJob(j: ServerJob): Job {
  const a = j.assignments?.[0];
  return {
    ...j,
    clientName: j.client ? `${j.client.firstName} ${j.client.lastName}` : (j.clientName ?? ''),
    preferredDate: (String(j.preferredDate) || '').split('T')[0],
    cancellationReason: j.cancelReason ?? undefined,
    technicianId: j.technicianId ?? a?.technicianId,
    technicianName: j.technicianName ?? a?.technician?.fullName,
  } as Job;
}

type ServerMessage = { id: string; jobId: string; senderId: string; senderRole: Message['senderRole']; body: string; kind: string; meta?: { senderName?: string; calendarData?: Message['calendarData'] } | null; readBy: string[]; createdAt: string };
function mapMessage(m: ServerMessage): Message {
  return {
    id: m.id, jobId: m.jobId, senderId: m.senderId, senderRole: m.senderRole,
    senderName: m.meta?.senderName ?? (m.senderRole === 'admin' ? 'ACT Admin' : m.senderRole === 'operator' ? 'ACT Operator' : 'Client'),
    content: m.body, type: (m.kind as Message['type']) || 'text',
    calendarData: m.meta?.calendarData, readBy: m.readBy ?? [], createdAt: m.createdAt,
  };
}

type ServerInvoice = Record<string, unknown> & { id: string; kind: string; invoiceStatus?: string; billingStatus?: string; clientResponseNote?: string };
function mapServiceInvoice(i: ServerInvoice): ServiceInvoice {
  return { ...(i as object), status: i.invoiceStatus ?? 'Draft', clientNote: i.clientResponseNote ?? undefined } as unknown as ServiceInvoice;
}
function mapBillingStatement(i: ServerInvoice): BillingStatement {
  return { ...(i as object), status: i.billingStatus ?? 'Draft' } as unknown as BillingStatement;
}
function invoiceToServer(rec: object, kind: 'service_invoice' | 'billing_statement'): Record<string, unknown> {
  const { status, clientNote, ...rest } = rec as Record<string, unknown> & { status?: string; clientNote?: string };
  return {
    ...rest,
    ...(kind === 'service_invoice' ? { invoiceStatus: status } : { billingStatus: status }),
    ...(clientNote !== undefined ? { clientResponseNote: clientNote } : {}),
  };
}

type ServerArchive = { id: string; jobId: string; clientId: string; clientName: string; operatorId?: string | null; operatorName?: string | null; archivedAt: string; fromDate: string; toDate: string; messageCount: number; payload: (ArchivedMessage & { kind?: string })[] };
function mapArchive(a: ServerArchive): ChatArchive {
  return {
    id: a.id, jobId: a.jobId, clientId: a.clientId, clientName: a.clientName,
    operatorId: a.operatorId ?? undefined, operatorName: a.operatorName ?? undefined,
    archivedAt: a.archivedAt, fromDate: a.fromDate, toDate: a.toDate,
    messageCount: a.messageCount,
    messages: (a.payload ?? []).map(m => ({ ...m, type: (m.type ?? m.kind ?? 'text') as ArchivedMessage['type'] })),
  };
}

// ─── public API ───────────────────────────────────────────────────────────────

export const api = {
  // auth
  async login(email: string, password: string) { return call<User>('/auth/login', 'POST', { email, password }); },
  async register(data: Record<string, unknown>) { return call<User>('/auth/register', 'POST', data); },
  logout() { void call('/auth/logout', 'POST'); },
  async me() { return call<User>('/auth/me'); },

  // jobs
  createJob(job: Job) { void call('/jobs', 'POST', job); },
  updateJob(id: string, updates: Partial<Job>) {
    const { cancellationReason, ...rest } = updates;
    void call(`/jobs/${id}`, 'PATCH', { ...rest, ...(cancellationReason !== undefined ? { cancelReason: cancellationReason } : {}), clientManaged: true });
  },
  async getJobs(clientId?: string): Promise<Job[] | null> {
    const r = await call<ServerJob[]>(`/jobs${clientId ? `?clientId=${clientId}` : ''}`);
    return r.ok && r.data ? r.data.map(mapJob) : null;
  },

  // technicians
  createTechnician(t: Technician) { void call('/technicians', 'POST', t); },
  updateTechnician(id: string, updates: Partial<Technician>) { void call(`/technicians/${id}`, 'PATCH', updates); },
  async getTechnicians(): Promise<Technician[] | null> {
    const r = await call<Technician[]>('/technicians');
    return r.ok && r.data ? r.data : null;
  },

  // clients / users
  updateClient(id: string, updates: Partial<User>) { void call(`/clients/${id}`, 'PATCH', updates); },
  async getClients(): Promise<User[] | null> {
    const r = await call<User[]>('/clients');
    return r.ok && r.data ? r.data : null;
  },

  // notifications
  createNotification(n: AppNotification) { void call('/notifications', 'POST', n); },
  markNotificationsRead(ids: string[]) { void call('/notifications', 'PATCH', { ids }); },
  async getNotifications(userId: string): Promise<AppNotification[] | null> {
    const r = await call<AppNotification[]>(`/notifications?userId=${userId}`);
    return r.ok && r.data ? r.data : null;
  },

  // messages
  sendMessage(m: Message) {
    void call('/messages', 'POST', {
      id: m.id, jobId: m.jobId, senderId: m.senderId, senderRole: m.senderRole,
      body: m.content, kind: m.type,
      meta: { senderName: m.senderName, ...(m.calendarData ? { calendarData: m.calendarData } : {}) },
    });
  },
  markThreadRead(jobId: string, userId: string) { void call('/messages', 'PATCH', { action: 'markRead', jobId, userId }); },
  calendarResponse(messageId: string, accepted: boolean, userId: string) { void call('/messages', 'PATCH', { action: 'calendarResponse', messageId, accepted, userId }); },
  async getMessages(): Promise<Message[] | null> {
    const r = await call<ServerMessage[]>('/messages');
    return r.ok && r.data ? r.data.map(mapMessage) : null;
  },

  // chat archives (7-day retention)
  async runArchiveJob(): Promise<boolean> { return (await call('/messages/archive', 'POST')).ok; },
  async getArchives(clientId?: string, operatorId?: string): Promise<ChatArchive[] | null> {
    const q = clientId ? `?clientId=${clientId}` : operatorId ? `?operatorId=${operatorId}` : '';
    const r = await call<ServerArchive[]>(`/messages/archive${q}`);
    return r.ok && r.data ? r.data.map(mapArchive) : null;
  },

  // invoices & billing (unified server model, kind-discriminated)
  createInvoice(kind: 'service_invoice' | 'billing_statement', rec: ServiceInvoice | BillingStatement) {
    void call('/invoices', 'POST', { ...invoiceToServer(rec, kind), kind });
  },
  pushServiceInvoice(rec?: ServiceInvoice) {
    if (rec) void call(`/invoices/${rec.id}`, 'PATCH', invoiceToServer(rec, 'service_invoice'));
  },
  pushBillingStatement(rec?: BillingStatement) {
    if (rec) void call(`/invoices/${rec.id}`, 'PATCH', invoiceToServer(rec, 'billing_statement'));
  },
  async getInvoices(clientId?: string): Promise<{ serviceInvoices: ServiceInvoice[]; billingStatements: BillingStatement[] } | null> {
    const r = await call<ServerInvoice[]>(`/invoices${clientId ? `?clientId=${clientId}` : ''}`);
    if (!r.ok || !r.data) return null;
    return {
      serviceInvoices: r.data.filter(i => i.kind === 'service_invoice').map(mapServiceInvoice),
      billingStatements: r.data.filter(i => i.kind === 'billing_statement').map(mapBillingStatement),
    };
  },
};
