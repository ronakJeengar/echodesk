import { Recording } from '../types';

export function printWorkOrderPdf(recording: Recording, companyName = 'Pro HVAC Solutions', techName = 'Dave Miller') {
  const data = recording.extractedData;
  const customerName = recording.customer?.name || data?.customerInfo?.name || 'Customer';
  const customerCompany = recording.customer?.companyName || data?.customerInfo?.companyName || '';
  const customerPhone = recording.customer?.phone || data?.customerInfo?.phone || 'N/A';
  const customerAddress = recording.customer?.address || data?.customerInfo?.address || 'N/A';

  const invoiceNo = `WO-${recording.id.replace('rec-', '').toUpperCase()}`;
  const dateStr = new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });

  const printWindow = window.open('', '_blank');
  if (!printWindow) {
    alert('Please allow popups to generate and print PDF work orders.');
    return;
  }

  const html = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Work Order - ${invoiceNo}</title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
      margin: 0;
      padding: 40px;
      color: #1e293b;
      background: #ffffff;
      font-size: 14px;
      line-height: 1.5;
    }
    .header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      border-bottom: 2px solid #0f172a;
      padding-bottom: 20px;
      margin-bottom: 24px;
    }
    .brand-title {
      font-size: 24px;
      font-weight: 800;
      color: #0f172a;
      letter-spacing: -0.5px;
      margin: 0;
    }
    .brand-sub {
      font-size: 11px;
      color: #64748b;
      margin-top: 2px;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
    .ai-badge {
      font-size: 10px;
      color: #059669;
      font-weight: 700;
      margin-top: 4px;
    }
    .meta-box {
      text-align: right;
    }
    .invoice-id {
      font-size: 16px;
      font-weight: 700;
      color: #0f172a;
    }
    .meta-item {
      font-size: 12px;
      color: #475569;
      margin-top: 2px;
    }
    .customer-box {
      background: #f8fafc;
      border: 1px solid #e2e8f0;
      border-radius: 8px;
      padding: 16px;
      margin-bottom: 24px;
      display: flex;
      justify-content: space-between;
    }
    .box-title {
      font-size: 11px;
      font-weight: 700;
      color: #64748b;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      margin-bottom: 6px;
    }
    .section-title {
      font-size: 13px;
      font-weight: 700;
      color: #0f172a;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      margin-bottom: 8px;
      margin-top: 20px;
    }
    .summary-box {
      border: 1px solid #e2e8f0;
      border-radius: 8px;
      padding: 14px;
      background: #ffffff;
      margin-bottom: 20px;
    }
    table {
      width: 100%;
      border-collapse: collapse;
      margin-bottom: 24px;
    }
    th {
      background: #f1f5f9;
      text-align: left;
      padding: 10px 12px;
      font-size: 12px;
      font-weight: 700;
      color: #334155;
      border-bottom: 1px solid #cbd5e1;
    }
    td {
      padding: 10px 12px;
      border-bottom: 1px solid #e2e8f0;
      font-size: 13px;
    }
    .text-right { text-align: right; }
    .text-center { text-align: center; }
    .totals-box {
      display: flex;
      justify-content: flex-end;
      margin-bottom: 24px;
    }
    .totals-table {
      width: 280px;
    }
    .totals-table td {
      border: none;
      padding: 4px 8px;
    }
    .total-due {
      font-size: 16px;
      font-weight: 800;
      color: #059669;
      border-top: 2px solid #cbd5e1 !important;
      padding-top: 8px !important;
    }
    .actions-box {
      background: #fffbeb;
      border: 1px solid #fef3c7;
      border-radius: 8px;
      padding: 12px;
      margin-bottom: 28px;
    }
    .action-item {
      font-size: 12px;
      color: #92400e;
      margin-bottom: 4px;
    }
    .signatures {
      display: flex;
      justify-content: space-between;
      margin-top: 48px;
      padding-top: 16px;
    }
    .sig-line {
      width: 220px;
      border-top: 1px solid #64748b;
      padding-top: 6px;
      font-size: 11px;
      color: #64748b;
    }
    @media print {
      body { padding: 0; }
      @page { margin: 1.5cm; }
    }
  </style>
</head>
<body>
  <div class="header">
    <div>
      <h1 class="brand-title">${companyName}</h1>
      <div class="brand-sub">Field Operations & Work Order Invoice</div>
      <div class="ai-badge">⚡ Extracted & Synced via EchoDesk Voice AI</div>
    </div>
    <div class="meta-box">
      <div class="invoice-id">${invoiceNo}</div>
      <div class="meta-item">Date: ${dateStr}</div>
      <div class="meta-item">Technician: ${techName}</div>
    </div>
  </div>

  <div class="customer-box">
    <div>
      <div class="box-title">Client Information</div>
      <div style="font-weight: 700; font-size: 14px;">${customerName} ${customerCompany ? `(${customerCompany})` : ''}</div>
      <div style="color: #64748b; font-size: 12px; margin-top: 2px;">${customerAddress}</div>
    </div>
    <div style="text-align: right;">
      <div class="box-title">Contact & Status</div>
      <div style="font-size: 12px; font-weight: 600;">${customerPhone}</div>
      <div style="display: inline-block; background: #dcfce7; color: #166534; font-size: 10px; font-weight: 700; padding: 2px 6px; border-radius: 4px; margin-top: 4px;">COMPLETED</div>
    </div>
  </div>

  <div class="section-title">Diagnostic & Service Summary</div>
  <div class="summary-box">
    ${data?.executiveSummary || recording.rawTranscript || 'Field diagnosis logged.'}
  </div>

  ${data?.partsAndServices && data.partsAndServices.length > 0 ? `
    <div class="section-title">Itemized Materials & Parts</div>
    <table>
      <thead>
        <tr>
          <th>Description</th>
          <th class="text-center">Qty</th>
          <th class="text-right">Unit Price</th>
          <th class="text-right">Amount</th>
        </tr>
      </thead>
      <tbody>
        ${data.partsAndServices.map(p => `
          <tr>
            <td>${p.name}</td>
            <td class="text-center">${p.quantity}</td>
            <td class="text-right">$${p.unitCost.toFixed(2)}</td>
            <td class="text-right">$${(p.totalCost || p.unitCost * p.quantity).toFixed(2)}</td>
          </tr>
        `).join('')}
      </tbody>
    </table>
  ` : ''}

  ${data?.financials ? `
    <div class="totals-box">
      <table class="totals-table">
        ${data.financials.laborCost ? `
          <tr>
            <td>Labor & Diagnostics:</td>
            <td class="text-right">$${data.financials.laborCost.toFixed(2)}</td>
          </tr>
        ` : ''}
        ${data.financials.partsCost ? `
          <tr>
            <td>Materials & Parts:</td>
            <td class="text-right">$${data.financials.partsCost.toFixed(2)}</td>
          </tr>
        ` : ''}
        <tr>
          <td class="total-due">TOTAL DUE:</td>
          <td class="text-right total-due">$${data.financials.quotedAmount.toFixed(2)}</td>
        </tr>
      </table>
    </div>
  ` : ''}

  ${data?.actionItems && data.actionItems.length > 0 ? `
    <div class="section-title">Scheduled Follow-Ups & Next Steps</div>
    <div class="actions-box">
      ${data.actionItems.map(a => `
        <div class="action-item">• ${a.title} [Priority: ${a.priority}]</div>
      `).join('')}
    </div>
  ` : ''}

  <div class="signatures">
    <div class="sig-line">
      Technician Signature (${techName})
    </div>
    <div class="sig-line">
      Customer Acceptance Signature
    </div>
  </div>

  <script>
    window.onload = function() {
      window.print();
    }
  </script>
</body>
</html>
  `;

  printWindow.document.open();
  printWindow.document.write(html);
  printWindow.document.close();
}
