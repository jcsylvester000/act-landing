'use client';
import React from 'react';
import type { ServiceInvoice, BillingStatement } from '@/store';

// ─── PRINT CSS ─────────────────────────────────────────────────────────────────
const PRINT_STYLES = `
  @media print {
    body > *:not(#act-print-root) { display: none !important; }
    #act-print-root { display: block !important; position: fixed; top: 0; left: 0; width: 100%; z-index: 99999; background: white; }
    @page { margin: 20mm; size: A4 portrait; }
  }
  #act-print-root { display: none; font-family: Arial, sans-serif; color: #111; }
  .print-doc { max-width: 700px; margin: 0 auto; padding: 32px; background: white; }
  .print-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 32px; border-bottom: 2px solid #0A6E8F; padding-bottom: 20px; }
  .print-logo { font-size: 22px; font-weight: 900; color: #0A6E8F; letter-spacing: -0.5px; }
  .print-logo span { color: #F97316; }
  .print-doc-info { text-align: right; font-size: 12px; color: #555; }
  .print-doc-info .doc-number { font-size: 16px; font-weight: 800; color: #111; margin-bottom: 4px; }
  .print-parties { display: grid; grid-template-columns: 1fr 1fr; gap: 24px; margin-bottom: 28px; }
  .print-party-label { font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: 1px; color: #888; margin-bottom: 6px; }
  .print-party-name { font-size: 15px; font-weight: 700; margin-bottom: 2px; }
  .print-party-detail { font-size: 12px; color: #555; line-height: 1.5; }
  .print-table { width: 100%; border-collapse: collapse; margin-bottom: 24px; }
  .print-table th { background: #F1F5F9; padding: 10px 12px; text-align: left; font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px; color: #555; }
  .print-table td { padding: 10px 12px; border-bottom: 1px solid #E2E8F0; font-size: 13px; vertical-align: top; }
  .print-table tr:last-child td { border-bottom: none; }
  .print-totals { margin-left: auto; width: 260px; }
  .print-totals-row { display: flex; justify-content: space-between; padding: 6px 0; font-size: 13px; border-bottom: 1px solid #E2E8F0; }
  .print-totals-row span:last-child { font-family: 'IBM Plex Mono', monospace; }
  .print-totals-row.total { font-weight: 800; font-size: 15px; border-top: 2px solid #0A6E8F; border-bottom: none; margin-top: 4px; padding-top: 10px; color: #0A6E8F; }
  .print-totals-row.paid { color: #1BA87E; font-weight: 700; }
  .print-footer { margin-top: 40px; padding-top: 20px; border-top: 1px solid #E2E8F0; font-size: 11px; color: #888; text-align: center; line-height: 1.6; }
  .print-status-badge { display: inline-block; padding: 4px 12px; border-radius: 99px; font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px; }
  .print-status-paid { background: #D1FAE5; color: #065F46; }
  .print-status-pending { background: #FEF3C7; color: #92400E; }
  .print-notes { background: #F8FAFC; border: 1px solid #E2E8F0; border-radius: 8px; padding: 14px; margin-bottom: 24px; font-size: 12px; color: #555; line-height: 1.6; }
  .no-print { } /* used on interactive elements hidden during print */
`;

// ─── INVOICE PRINT DOCUMENT ────────────────────────────────────────────────────
export const InvoicePrintDocument: React.FC<{ invoice: ServiceInvoice }> = ({ invoice }) => (
  <div className="print-doc">
    <div className="print-header">
      <div>
        <div className="print-logo">ACT<span>.</span></div>
        <div style={{ fontSize: 11, color: '#888', marginTop: 4 }}>Aircon Cleaning &amp; Technician Services</div>
        <div style={{ fontSize: 11, color: '#888' }}>South Metro Manila &amp; South Laguna</div>
      </div>
      <div className="print-doc-info">
        <div className="doc-number">SERVICE INVOICE</div>
        <div>{invoice.id}</div>
        <div style={{ marginTop: 6 }}>Date Issued: {new Date(invoice.createdAt).toLocaleDateString('en-PH', { year: 'numeric', month: 'long', day: 'numeric' })}</div>
        {invoice.dueDate && <div>Due Date: {new Date(invoice.dueDate).toLocaleDateString('en-PH', { year: 'numeric', month: 'long', day: 'numeric' })}</div>}
        <div style={{ marginTop: 6 }}>
          <span className={`print-status-badge ${invoice.status === 'Accepted' ? 'print-status-paid' : 'print-status-pending'}`}>{invoice.status}</span>
        </div>
      </div>
    </div>

    <div className="print-parties">
      <div>
        <div className="print-party-label">Billed To</div>
        <div className="print-party-name">{invoice.clientName}</div>
        <div className="print-party-detail">Job Reference: {invoice.jobId}</div>
      </div>
      <div>
        <div className="print-party-label">Service Provider</div>
        <div className="print-party-name">ACT Aircon Service</div>
        <div className="print-party-detail">Coordinator: {invoice.operatorName}</div>
      </div>
    </div>

    <table className="print-table">
      <thead>
        <tr>
          <th>Description</th>
          <th>Category</th>
          <th style={{ textAlign: 'center' }}>Qty</th>
          <th style={{ textAlign: 'right' }}>Unit Price</th>
          <th style={{ textAlign: 'right' }}>Amount</th>
        </tr>
      </thead>
      <tbody>
        {invoice.lineItems.map(item => (
          <tr key={item.id}>
            <td>{item.description}</td>
            <td style={{ color: '#888' }}>{item.category}</td>
            <td style={{ textAlign: 'center' }}>{item.quantity}</td>
            <td style={{ textAlign: 'right', fontFamily: 'monospace' }}>₱{item.unitPrice.toLocaleString()}</td>
            <td style={{ textAlign: 'right', fontFamily: 'monospace', fontWeight: 600 }}>₱{item.amount.toLocaleString()}</td>
          </tr>
        ))}
      </tbody>
    </table>

    <div className="print-totals">
      <div className="print-totals-row"><span>Subtotal</span><span>₱{invoice.subtotal.toLocaleString()}</span></div>
      {invoice.reservationFeePaid > 0 && <div className="print-totals-row paid"><span>Reservation Fee Paid</span><span>&#8722; ₱{invoice.reservationFeePaid.toLocaleString()}</span></div>}
      <div className="print-totals-row total"><span>Balance Due</span><span>₱{invoice.balanceDue.toLocaleString()}</span></div>
    </div>

    {invoice.notes && <div className="print-notes"><strong>Notes:</strong> {invoice.notes}</div>}
    {invoice.revisionCount && invoice.revisionCount > 0 ? <div style={{ fontSize: 11, color: '#888', marginBottom: 16 }}>Revision {invoice.revisionCount} &middot; Last revised: {invoice.revisedAt ? new Date(invoice.revisedAt).toLocaleDateString('en-PH') : '—'}</div> : null}

    <div className="print-footer">
      <div>Thank you for choosing ACT Aircon Service. Payment is due upon completion of service.</div>
      <div style={{ marginTop: 4 }}>Accepted payment methods: GCash &middot; Cash &middot; Bank Transfer &middot; Check</div>
      <div style={{ marginTop: 8, color: '#AAA' }}>This is a computer-generated document. For inquiries, reply to your booking message thread.</div>
    </div>
  </div>
);

// ─── BILLING STATEMENT PRINT DOCUMENT ─────────────────────────────────────────
export const BillingPrintDocument: React.FC<{ billing: BillingStatement }> = ({ billing }) => (
  <div className="print-doc">
    <div className="print-header">
      <div>
        <div className="print-logo">ACT<span>.</span></div>
        <div style={{ fontSize: 11, color: '#888', marginTop: 4 }}>Aircon Cleaning &amp; Technician Services</div>
        <div style={{ fontSize: 11, color: '#888' }}>South Metro Manila &amp; South Laguna</div>
      </div>
      <div className="print-doc-info">
        <div className="doc-number">{billing.status === 'Paid' ? 'OFFICIAL RECEIPT' : 'BILLING STATEMENT'}</div>
        <div>{billing.id}</div>
        {billing.receiptNumber && <div>OR No.: {billing.receiptNumber}</div>}
        <div style={{ marginTop: 6 }}>Date: {new Date(billing.createdAt).toLocaleDateString('en-PH', { year: 'numeric', month: 'long', day: 'numeric' })}</div>
        {billing.paidAt && <div>Paid: {new Date(billing.paidAt).toLocaleDateString('en-PH', { year: 'numeric', month: 'long', day: 'numeric' })}</div>}
        <div style={{ marginTop: 6 }}>
          <span className={`print-status-badge ${billing.status === 'Paid' ? 'print-status-paid' : 'print-status-pending'}`}>{billing.status}</span>
        </div>
      </div>
    </div>

    <div className="print-parties">
      <div>
        <div className="print-party-label">Client</div>
        <div className="print-party-name">{billing.clientName}</div>
        <div className="print-party-detail">Job Reference: {billing.jobId}</div>
      </div>
      <div>
        <div className="print-party-label">Service Provider</div>
        <div className="print-party-name">ACT Aircon Service</div>
        <div className="print-party-detail">
          Operator: {billing.operatorName}
          {billing.technicianName && <><br />Technician: {billing.technicianName}</>}
        </div>
      </div>
    </div>

    <table className="print-table">
      <thead>
        <tr>
          <th>Description</th>
          <th>Category</th>
          <th style={{ textAlign: 'center' }}>Qty</th>
          <th style={{ textAlign: 'right' }}>Unit Price</th>
          <th style={{ textAlign: 'right' }}>Amount</th>
        </tr>
      </thead>
      <tbody>
        {billing.lineItems.map(item => (
          <tr key={item.id}>
            <td>{item.description}</td>
            <td style={{ color: '#888' }}>{item.category}</td>
            <td style={{ textAlign: 'center' }}>{item.quantity}</td>
            <td style={{ textAlign: 'right', fontFamily: 'monospace' }}>₱{item.unitPrice.toLocaleString()}</td>
            <td style={{ textAlign: 'right', fontFamily: 'monospace', fontWeight: 600 }}>₱{item.amount.toLocaleString()}</td>
          </tr>
        ))}
      </tbody>
    </table>

    <div className="print-totals">
      <div className="print-totals-row"><span>Subtotal</span><span>₱{billing.subtotal.toLocaleString()}</span></div>
      {billing.reservationFeePaid > 0 && <div className="print-totals-row paid"><span>Previously Paid</span><span>&#8722; ₱{billing.reservationFeePaid.toLocaleString()}</span></div>}
      <div className="print-totals-row total">
        <span>{billing.status === 'Paid' ? 'Total Paid' : 'Balance Due'}</span>
        <span>₱{billing.status === 'Paid' ? (billing.amountPaidAtClose !== undefined ? billing.amountPaidAtClose : billing.totalAmount - billing.reservationFeePaid).toLocaleString() : billing.amountDue.toLocaleString()}</span>
      </div>
      {billing.status === 'Paid' && billing.paymentMethod && (
        <div className="print-totals-row paid" style={{ fontSize: 12, marginTop: 4 }}>
          <span>Payment Method</span><span>{billing.paymentMethod}</span>
        </div>
      )}
      {billing.status === 'Paid' && billing.paymentReference && (
        <div className="print-totals-row paid" style={{ fontSize: 12 }}>
          <span>Payment Reference</span><span>{billing.paymentReference}</span>
        </div>
      )}
    </div>

    {billing.workNotes && <div className="print-notes"><strong>Work Performed:</strong> {billing.workNotes}</div>}

    <div className="print-footer">
      {billing.status === 'Paid'
        ? <div><strong>PAID IN FULL.</strong> Thank you for your payment! We look forward to serving you again.</div>
        : <div>Please settle the balance due within 3 business days. Contact your ACT coordinator for payment options.</div>}
      <div style={{ marginTop: 4 }}>Accepted: GCash &middot; Cash &middot; Bank Transfer &middot; Check</div>
      <div style={{ marginTop: 8, color: '#AAA' }}>This is a computer-generated document. ACT Aircon Cleaning &amp; Technician Services.</div>
    </div>
  </div>
);

// ─── PRINT TRIGGER HOOK ────────────────────────────────────────────────────────
export function printDocument(docId: string) {
  const root = document.getElementById('act-print-root');
  if (!root) return;
  root.setAttribute('data-active', docId);
  // Inject styles if not already there
  if (!document.getElementById('act-print-styles')) {
    const style = document.createElement('style');
    style.id = 'act-print-styles';
    style.textContent = PRINT_STYLES;
    document.head.appendChild(style);
  }
  window.print();
}

// ─── PRINT ROOT PORTAL ─────────────────────────────────────────────────────────
// Add <PrintRoot /> once at app layout level, and populate it before printing
export const PrintRoot: React.FC<{
  activeInvoice?: ServiceInvoice | null;
  activeBilling?: BillingStatement | null;
}> = ({ activeInvoice, activeBilling }) => (
  <div id="act-print-root">
    {activeInvoice && <InvoicePrintDocument invoice={activeInvoice} />}
    {activeBilling && <BillingPrintDocument billing={activeBilling} />}
  </div>
);
