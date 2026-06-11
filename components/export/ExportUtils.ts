// ─── CSV EXPORT UTILITIES ─────────────────────────────────────────────────────
import type { Job, BillingStatement } from '@/store';

export function downloadCSV(filename: string, rows: string[][]): void {
  const csvContent = rows.map(row =>
    row.map(cell => {
      const str = String(cell ?? '');
      return str.includes(',') || str.includes('"') || str.includes('\n')
        ? `"${str.replace(/"/g, '""')}"` : str;
    }).join(',')
  ).join('\n');
  const blob = new Blob(['﻿' + csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url; a.download = filename; a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

export function exportJobsCSV(jobs: Job[], startDate?: string, endDate?: string): void {
  const filtered = jobs.filter(j => {
    if (!startDate && !endDate) return true;
    const d = j.preferredDate;
    if (startDate && d < startDate) return false;
    if (endDate && d > endDate) return false;
    return true;
  });
  const headers = ['Job ID','Client','Service Type','AC Type','Units','City','Address','Date','Time Slot','Technician','Operator','Total Price (₱)','Balance Due (₱)','Payment Status','Job Status','Preferred Payment','Created At','Notes'];
  const rows = filtered.map(j => [
    j.id, j.clientName, j.serviceType, j.acType, String(j.numberOfUnits),
    j.city, j.serviceAddress, j.preferredDate, j.timeSlot,
    j.technicianName || '', j.operatorName || '',
    String(j.totalPrice), String(j.balanceDue),
    j.paymentStatus, j.status,
    j.preferredPaymentMethod || '',
    new Date(j.createdAt).toLocaleDateString('en-PH'),
    j.specialInstructions || ''
  ]);
  downloadCSV(`ACT_Jobs_${startDate || 'all'}_to_${endDate || 'all'}.csv`, [headers, ...rows]);
}

export function exportBillingCSV(billingStatements: BillingStatement[], startDate?: string, endDate?: string, includeUnpaid = false): void {
  const filtered = billingStatements.filter(b => {
    if (includeUnpaid ? b.status === 'Draft' : b.status !== 'Paid') return false;
    if (!startDate && !endDate) return true;
    const d = b.paidAt ? b.paidAt.split('T')[0] : b.createdAt.split('T')[0];
    if (startDate && d < startDate) return false;
    if (endDate && d > endDate) return false;
    return true;
  });
  const headers = ['Billing ID','Job ID','Client','Operator','Technician','Status','Subtotal (₱)','Reservation Fee (₱)','Amount Paid (₱)','Outstanding (₱)','Payment Method','Check No.','Paid Date','Created At','Work Notes'];
  const rows = filtered.map(b => [
    b.id, b.jobId, b.clientName, b.operatorName, b.technicianName || '',
    b.status,
    String(b.subtotal), String(b.reservationFeePaid),
    String(b.status === 'Paid' ? (b.amountPaidAtClose !== undefined ? b.amountPaidAtClose : 0) : 0),
    String(b.status === 'Paid' ? 0 : b.amountDue),
    b.paymentMethod || '', b.checkNumber || '',
    b.paidAt ? new Date(b.paidAt).toLocaleDateString('en-PH') : '',
    new Date(b.createdAt).toLocaleDateString('en-PH'),
    b.workNotes || ''
  ]);
  const label = includeUnpaid ? 'Billing_All' : 'Payments';
  downloadCSV(`ACT_${label}_${startDate || 'all'}_to_${endDate || 'all'}.csv`, [headers, ...rows]);
}

export function exportMonthlySummaryCSV(billingStatements: BillingStatement[], jobs: Job[]): void {
  // Group paid billings by month
  const byMonth: Record<string, { revenue: number; jobs: number; clients: Set<string> }> = {};
  billingStatements.filter(b => b.status === 'Paid' && b.paidAt).forEach(b => {
    const d = new Date(b.paidAt!);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
    if (!byMonth[key]) byMonth[key] = { revenue: 0, jobs: 0, clients: new Set() };
    byMonth[key].revenue += b.amountPaidAtClose !== undefined ? b.amountPaidAtClose : (b.totalAmount - b.reservationFeePaid);
    byMonth[key].jobs++;
    byMonth[key].clients.add(b.clientId);
  });
  const headers = ['Month','Jobs Completed','Unique Clients','Revenue Collected (₱)','Avg Revenue per Job (₱)'];
  const rows = Object.entries(byMonth).sort().map(([month, data]) => [
    month,
    String(data.jobs),
    String(data.clients.size),
    String(data.revenue),
    String(Math.round(data.revenue / data.jobs))
  ]);
  downloadCSV('ACT_Monthly_Summary.csv', [headers, ...rows]);
}

export function downloadJSON(filename: string, data: unknown): void {
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url; a.download = filename; a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
