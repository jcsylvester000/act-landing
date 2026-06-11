'use client';

import React, { useState } from 'react';
import type { BillingStatement, BillingStatus } from '@/store';
import { Button } from '@/components/ui';
import { printDocument, PrintRoot } from './PrintExport';

// ─── STATUS CONFIG ────────────────────────────────────────────────────────────
const statusConfig: Record<BillingStatus, { bg: string; color: string; icon: string }> = {
  'Draft':               { bg: '#F3F4F6', color: '#374151', icon: '📝' },
  'Submitted to Admin':  { bg: '#DBEAFE', color: '#1E40AF', icon: '📋' },
  'Admin Approved':      { bg: '#D1FAE5', color: '#065F46', icon: '✅' },
  'Admin Rejected':      { bg: '#FEE2E2', color: '#991B1B', icon: '↩' },
  'Sent to Client':      { bg: '#E0F2FE', color: '#0369A1', icon: '📤' },
  'Paid':                { bg: '#D1FAE5', color: '#065F46', icon: '💚' },
  'Overdue':             { bg: '#FEE2E2', color: '#991B1B', icon: '⚠️' },
  'Disputed':            { bg: '#FEF3C7', color: '#92400E', icon: '⚠️' },
};

interface Props {
  billing: BillingStatement;
  viewerRole: 'client' | 'operator' | 'admin';
  onSubmitToAdmin?: () => void;
  onEdit?: () => void;
  onApprove?: () => void;
  onReject?: () => void;
  onSendToClient?: () => void;
  onMarkPaid?: () => void;
  compact?: boolean;
}

const BillingCard: React.FC<Props> = ({
  billing, viewerRole, onSubmitToAdmin, onEdit, onApprove, onReject, onSendToClient, onMarkPaid, compact = false,
}) => {
  const sc = statusConfig[billing.status] ?? statusConfig['Draft'];
  const [showPrint, setShowPrint] = useState(false);

  const handlePrint = () => {
    setShowPrint(true);
    setTimeout(() => {
      printDocument(billing.id);
      setTimeout(() => setShowPrint(false), 1000);
    }, 100);
  };

  return (
    <div style={{ background: 'white', border: '1px solid var(--border)', borderRadius: 16, overflow: 'hidden', boxShadow: 'var(--shadow-xs)' }}>
      {/* Header */}
      <div style={{ background: 'linear-gradient(135deg, #1a2e3b, var(--midnight))', padding: '16px 20px', color: 'white' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 8 }}>
          <div>
            <div style={{ fontSize: 11, fontWeight: 800, color: 'rgba(255,255,255,0.5)', letterSpacing: '1px', textTransform: 'uppercase', marginBottom: 4 }}>
              Billing Statement
            </div>
            <div style={{ fontFamily: 'var(--font-display)', fontSize: 18, fontWeight: 800 }}>{billing.id}</div>
            <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.65)', marginTop: 3 }}>
              Job: {billing.jobId} · {billing.clientName}
              {billing.technicianName && ` · Tech: ${billing.technicianName}`}
            </div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 6 }}>
            <span style={{ background: sc.bg, color: sc.color, fontSize: 11, fontWeight: 800, padding: '3px 10px', borderRadius: 99, display: 'flex', alignItems: 'center', gap: 4 }}>
              {sc.icon} {billing.status}
            </span>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: 22, fontWeight: 800 }}>
              ₱{billing.totalAmount.toLocaleString()}
            </div>
          </div>
        </div>
      </div>

      <div style={{ padding: '16px 20px' }}>
        {/* Dates */}
        <div style={{ display: 'flex', gap: 20, marginBottom: 16, flexWrap: 'wrap' }}>
          <div>
            <div style={{ fontSize: 11, color: 'var(--slate)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 2 }}>Created</div>
            <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--ink)' }}>{new Date(billing.createdAt).toLocaleDateString('en-PH', { year: 'numeric', month: 'short', day: 'numeric' })}</div>
          </div>
          {billing.submittedAt && (
            <div>
              <div style={{ fontSize: 11, color: 'var(--slate)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 2 }}>Submitted</div>
              <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--ink)' }}>{new Date(billing.submittedAt).toLocaleDateString('en-PH', { year: 'numeric', month: 'short', day: 'numeric' })}</div>
            </div>
          )}
          {billing.paidAt && (
            <div>
              <div style={{ fontSize: 11, color: 'var(--slate)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 2 }}>Paid</div>
              <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--verified)' }}>{new Date(billing.paidAt).toLocaleDateString('en-PH', { year: 'numeric', month: 'short', day: 'numeric' })} · {billing.paymentMethod}</div>
            </div>
          )}
        </div>

        {/* Line items */}
        {!compact && (
          <div style={{ marginBottom: 16 }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--slate)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 8 }}>Work Performed</div>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: '2px solid var(--mist)' }}>
                  {['Description', 'Qty', 'Unit Price', 'Amount'].map(h => (
                    <th key={h} style={{ textAlign: h === 'Amount' || h === 'Unit Price' ? 'right' : 'left', padding: '6px 8px', fontSize: 11, fontWeight: 700, color: 'var(--slate)', textTransform: 'uppercase' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {billing.lineItems.map(item => (
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
            { label: 'Total Service Value', value: billing.subtotal },
            { label: 'Reservation Fee (Collected)', value: -billing.reservationFeePaid, color: 'var(--verified)' },
            { label: billing.status === 'Paid' ? 'Total Paid' : 'Balance Due', value: billing.amountDue, bold: true, color: billing.status === 'Paid' ? 'var(--verified)' : billing.amountDue > 0 ? 'var(--polar)' : 'var(--verified)' },
          ].map(r => (
            <div key={r.label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: r.bold ? 0 : 6, paddingTop: r.bold ? 8 : 0, borderTop: r.bold ? '1px solid var(--mist)' : 'none' }}>
              <span style={{ fontSize: 13, color: 'var(--slate)', fontWeight: r.bold ? 700 : 400 }}>{r.label}</span>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: r.bold ? 16 : 13, fontWeight: r.bold ? 800 : 500, color: r.color || 'var(--ink)' }}>
                {r.value < 0 ? `−₱${Math.abs(r.value).toLocaleString()}` : `₱${r.value.toLocaleString()}`}
              </span>
            </div>
          ))}
        </div>

        {/* Work notes */}
        {billing.workNotes && (
          <div style={{ background: 'var(--breeze)', borderRadius: 10, padding: '10px 14px', marginBottom: 12, fontSize: 13, color: 'var(--slate)', lineHeight: 1.6 }}>
            <strong style={{ color: 'var(--polar)' }}>Work Notes:</strong> {billing.workNotes}
          </div>
        )}

        {/* Admin notes */}
        {billing.adminNotes && (
          <div style={{ background: billing.status === 'Admin Rejected' ? '#FEE2E2' : 'var(--cloud)', borderRadius: 10, padding: '10px 14px', marginBottom: 12, fontSize: 13, color: 'var(--slate)', lineHeight: 1.6 }}>
            <strong style={{ color: billing.status === 'Admin Rejected' ? '#991B1B' : 'var(--midnight)' }}>Admin Notes:</strong> {billing.adminNotes}
          </div>
        )}

        {/* Actions by role */}
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          {/* Operator actions */}
          {viewerRole === 'operator' && billing.status === 'Draft' && (
            <>
              {onSubmitToAdmin && <Button variant="secondary" size="sm" onClick={onSubmitToAdmin}>📋 Submit to Admin</Button>}
              {onEdit && <Button variant="ghost" size="sm" onClick={onEdit}>✏️ Edit</Button>}
            </>
          )}
          {viewerRole === 'operator' && billing.status === 'Admin Rejected' && (
            <>
              {onEdit && <Button variant="ghost" size="sm" onClick={onEdit}>✏️ Revise Billing</Button>}
              {onSubmitToAdmin && <Button variant="secondary" size="sm" onClick={onSubmitToAdmin}>📋 Re-submit</Button>}
            </>
          )}

          {/* Admin actions */}
          {viewerRole === 'admin' && billing.status === 'Submitted to Admin' && (
            <>
              {onApprove && <Button variant="success" size="sm" onClick={onApprove}>✓ Approve</Button>}
              {onReject && <Button variant="danger" size="sm" onClick={onReject}>↩ Return for Revision</Button>}
            </>
          )}
          {viewerRole === 'admin' && billing.status === 'Admin Approved' && (
            <>
              {onSendToClient && <Button variant="secondary" size="sm" onClick={onSendToClient}>📤 Send to Client</Button>}
            </>
          )}
          {viewerRole === 'admin' && billing.status === 'Sent to Client' && billing.amountDue > 0 && (
            <>
              {onMarkPaid && <Button variant="success" size="sm" onClick={onMarkPaid}>💚 Mark as Paid</Button>}
            </>
          )}

          {/* Client view */}
          {viewerRole === 'client' && billing.status === 'Paid' && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: 'var(--verified)', fontWeight: 700 }}>
              💚 Paid — Thank you!
            </div>
          )}
          {viewerRole === 'client' && billing.status === 'Sent to Client' && billing.amountDue > 0 && (
            <div style={{ background: '#FEF3C7', borderRadius: 10, padding: '10px 14px', width: '100%', fontSize: 13, color: '#92400E' }}>
              💳 Balance of <strong style={{ fontFamily: 'var(--font-mono)' }}>₱{billing.amountDue.toLocaleString()}</strong> is due. Please pay your technician or coordinate with your ACT operator.
            </div>
          )}

          {/* Download Receipt / PDF — available once billing is sent or paid */}
          {(billing.status === 'Sent to Client' || billing.status === 'Paid' || billing.status === 'Admin Approved') && (
            <Button variant="ghost" size="sm" onClick={handlePrint} style={{ marginLeft: 'auto' }}>
              🖨️ {billing.status === 'Paid' ? 'Download Receipt' : 'Download PDF'}
            </Button>
          )}
        </div>
      </div>

      {showPrint && <PrintRoot activeBilling={billing} />}
    </div>
  );
};

export default BillingCard;
