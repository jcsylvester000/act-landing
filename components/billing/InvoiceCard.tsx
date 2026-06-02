'use client';

import React from 'react';
import type { ServiceInvoice, InvoiceStatus } from '@/store';
import { Button, Badge } from '@/components/ui';

// ─── STATUS CONFIG ────────────────────────────────────────────────────────────
const statusConfig: Record<InvoiceStatus, { bg: string; color: string; icon: string }> = {
  'Draft':              { bg: '#F3F4F6', color: '#374151', icon: '📝' },
  'Sent':               { bg: '#DBEAFE', color: '#1E40AF', icon: '📤' },
  'Viewed by Client':   { bg: '#E0F2FE', color: '#0369A1', icon: '👁️' },
  'Accepted':           { bg: '#D1FAE5', color: '#065F46', icon: '✅' },
  'Revision Requested': { bg: '#FEF3C7', color: '#92400E', icon: '✏️' },
  'Cancelled by Client':{ bg: '#FEE2E2', color: '#991B1B', icon: '✕' },
};

interface Props {
  invoice: ServiceInvoice;
  viewerRole: 'client' | 'operator' | 'admin';
  onAccept?: () => void;
  onRequestRevision?: () => void;
  onCancel?: () => void;
  onSend?: () => void;
  onEdit?: () => void;
  compact?: boolean;
}

const InvoiceCard: React.FC<Props> = ({
  invoice, viewerRole, onAccept, onRequestRevision, onCancel, onSend, onEdit, compact = false,
}) => {
  const sc = statusConfig[invoice.status] ?? statusConfig['Draft'];

  return (
    <div style={{ background: 'white', border: '1px solid var(--border)', borderRadius: 16, overflow: 'hidden', boxShadow: 'var(--shadow-xs)' }}>
      {/* Header */}
      <div style={{ background: 'linear-gradient(135deg, var(--midnight), var(--polar))', padding: '16px 20px', color: 'white' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 8 }}>
          <div>
            <div style={{ fontSize: 11, fontWeight: 800, color: 'rgba(255,255,255,0.5)', letterSpacing: '1px', textTransform: 'uppercase', marginBottom: 4 }}>
              Service Invoice
            </div>
            <div style={{ fontFamily: 'var(--font-display)', fontSize: 18, fontWeight: 800 }}>{invoice.id}</div>
            <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.65)', marginTop: 3 }}>
              Job: {invoice.jobId} · {invoice.clientName}
            </div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 6 }}>
            <span style={{ background: sc.bg, color: sc.color, fontSize: 11, fontWeight: 800, padding: '3px 10px', borderRadius: 99, display: 'flex', alignItems: 'center', gap: 4 }}>
              {sc.icon} {invoice.status}
            </span>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: 22, fontWeight: 800, color: 'white' }}>
              ₱{invoice.totalAmount.toLocaleString()}
            </div>
          </div>
        </div>
      </div>

      <div style={{ padding: '16px 20px' }}>
        {/* Issued / Due dates */}
        <div style={{ display: 'flex', gap: 20, marginBottom: 16, flexWrap: 'wrap' }}>
          <div>
            <div style={{ fontSize: 11, color: 'var(--slate)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 2 }}>Issued</div>
            <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--ink)' }}>{new Date(invoice.createdAt).toLocaleDateString('en-PH', { year: 'numeric', month: 'short', day: 'numeric' })}</div>
          </div>
          {invoice.sentAt && (
            <div>
              <div style={{ fontSize: 11, color: 'var(--slate)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 2 }}>Sent</div>
              <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--ink)' }}>{new Date(invoice.sentAt).toLocaleDateString('en-PH', { year: 'numeric', month: 'short', day: 'numeric' })}</div>
            </div>
          )}
          <div>
            <div style={{ fontSize: 11, color: 'var(--slate)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 2 }}>From</div>
            <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--ink)' }}>{invoice.operatorName} · ACT Operator</div>
          </div>
        </div>

        {/* Line items */}
        {!compact && (
          <div style={{ marginBottom: 16 }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--slate)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 8 }}>Line Items</div>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: '2px solid var(--mist)' }}>
                  {['Description', 'Qty', 'Unit Price', 'Amount'].map(h => (
                    <th key={h} style={{ textAlign: h === 'Amount' || h === 'Unit Price' ? 'right' : 'left', padding: '6px 8px', fontSize: 11, fontWeight: 700, color: 'var(--slate)', textTransform: 'uppercase' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {invoice.lineItems.map(item => (
                  <tr key={item.id} style={{ borderBottom: '1px solid var(--border)' }}>
                    <td style={{ padding: '8px', fontSize: 13, color: 'var(--ink)' }}>
                      <div>{item.description}</div>
                      <div style={{ fontSize: 11, color: 'var(--slate)' }}>{item.category}</div>
                    </td>
                    <td style={{ padding: '8px', fontSize: 13, textAlign: 'right', color: 'var(--slate)' }}>{item.quantity}</td>
                    <td style={{ padding: '8px', fontSize: 13, textAlign: 'right', fontFamily: 'var(--font-mono)', color: 'var(--slate)' }}>
                      {item.unitPrice > 0 ? `₱${item.unitPrice.toLocaleString()}` : '—'}
                    </td>
                    <td style={{ padding: '8px', fontSize: 13, textAlign: 'right', fontFamily: 'var(--font-mono)', fontWeight: 600, color: 'var(--ink)' }}>
                      {item.amount > 0 ? `₱${item.amount.toLocaleString()}` : 'Incl.'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Totals */}
        <div style={{ background: 'var(--cloud)', borderRadius: 12, padding: '14px 16px', marginBottom: 14 }}>
          {[
            { label: 'Subtotal', value: invoice.subtotal, mono: true },
            { label: 'Reservation Fee (Paid)', value: -invoice.reservationFeePaid, mono: true, color: 'var(--verified)' },
            { label: 'Balance Due', value: invoice.balanceDue, mono: true, bold: true, color: 'var(--polar)' },
          ].map(r => (
            <div key={r.label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: r.bold ? 0 : 6, paddingTop: r.bold ? 8 : 0, borderTop: r.bold ? '1px solid var(--mist)' : 'none' }}>
              <span style={{ fontSize: 13, color: 'var(--slate)', fontWeight: r.bold ? 700 : 400 }}>{r.label}</span>
              <span style={{ fontFamily: r.mono ? 'var(--font-mono)' : 'var(--font-body)', fontSize: r.bold ? 16 : 13, fontWeight: r.bold ? 800 : 500, color: r.color || 'var(--ink)' }}>
                {r.value < 0 ? `−₱${Math.abs(r.value).toLocaleString()}` : `₱${r.value.toLocaleString()}`}
              </span>
            </div>
          ))}
        </div>

        {/* Operator notes */}
        {invoice.notes && (
          <div style={{ background: 'var(--breeze)', borderRadius: 10, padding: '10px 14px', marginBottom: 14, fontSize: 13, color: 'var(--slate)', lineHeight: 1.6 }}>
            <strong style={{ color: 'var(--polar)' }}>Note from {invoice.operatorName}:</strong> {invoice.notes}
          </div>
        )}

        {/* Client response note */}
        {invoice.clientNote && (invoice.status === 'Revision Requested' || invoice.status === 'Cancelled by Client') && (
          <div style={{ background: invoice.status === 'Cancelled by Client' ? '#FEE2E2' : '#FEF3C7', borderRadius: 10, padding: '10px 14px', marginBottom: 14, fontSize: 13, lineHeight: 1.6 }}>
            <strong style={{ color: invoice.status === 'Cancelled by Client' ? '#991B1B' : '#92400E' }}>
              {invoice.status === 'Cancelled by Client' ? '✕ Client cancelled:' : '✏️ Revision requested:'}
            </strong> {invoice.clientNote}
          </div>
        )}

        {/* Action buttons */}
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          {/* Operator actions */}
          {viewerRole === 'operator' && invoice.status === 'Draft' && (
            <>
              {onSend && <Button variant="secondary" size="sm" onClick={onSend}>📤 Send to Client</Button>}
              {onEdit && <Button variant="ghost" size="sm" onClick={onEdit}>✏️ Edit</Button>}
            </>
          )}
          {viewerRole === 'operator' && invoice.status === 'Revision Requested' && (
            <>
              {onEdit && <Button variant="secondary" size="sm" onClick={onEdit}>✏️ Revise Invoice</Button>}
            </>
          )}

          {/* Client actions */}
          {viewerRole === 'client' && (invoice.status === 'Sent' || invoice.status === 'Viewed by Client') && (
            <>
              {onAccept && (
                <Button variant="secondary" size="sm" onClick={onAccept} style={{ flex: 1 }}>✓ Accept Invoice</Button>
              )}
              {onRequestRevision && (
                <Button variant="ghost" size="sm" onClick={onRequestRevision} style={{ flex: 1 }}>✏️ Request Revision</Button>
              )}
              {onCancel && (
                <Button variant="danger" size="sm" onClick={onCancel} style={{ flex: 1 }}>✕ Cancel Booking</Button>
              )}
            </>
          )}
          {viewerRole === 'client' && invoice.status === 'Accepted' && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: 'var(--verified)', fontWeight: 700 }}>
              ✅ You accepted this invoice
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default InvoiceCard;
