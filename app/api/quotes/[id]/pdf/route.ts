import { NextRequest, NextResponse } from 'next/server';
import { getQuoteById } from '@/lib/models/quote';
import { getCompanySettings } from '@/lib/models/settings';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const quote = await getQuoteById(parseInt(id, 10));
    const companySettings = await getCompanySettings();

    if (!quote) {
      return NextResponse.json({ error: 'Quote not found' }, { status: 404 });
    }

    const currency = 'currency' in companySettings && typeof companySettings.currency === 'string'
      ? companySettings.currency
      : 'EUR';

    const formatCurrency = (value: number) => {
      return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency,
      }).format(value);
    };

    const formatDate = (date: string) => {
      return new Date(date).toLocaleDateString('en-US', {
        month: 'long',
        day: 'numeric',
        year: 'numeric',
      });
    };

    // Generate HTML for the PDF
    const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>Quote ${quote.quote_number}</title>
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      color: #1a1a1a;
      background: #ffffff;
      line-height: 1.35;
      font-size: 12px;
      padding: 24px 28px;
      max-width: 760px;
      margin: 0 auto;
    }
    @page {
      size: A4;
      margin: 10mm 12mm;
    }
    .header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      gap: 24px;
      margin-bottom: 18px;
      padding-bottom: 12px;
      border-bottom: 2px solid #10b981;
      break-inside: avoid;
      page-break-inside: avoid;
    }
    .logo {
      font-size: 24px;
      line-height: 1.1;
      font-weight: bold;
      color: #10b981;
    }
    .logo-img {
      height: 34px;
      max-width: 230px;
      object-fit: contain;
    }
    .company-details {
      font-size: 11px;
      color: #666;
      margin-top: 6px;
      line-height: 1.35;
      max-width: 360px;
    }
    .quote-info {
      text-align: right;
      min-width: 180px;
    }
    .quote-number {
      font-size: 21px;
      line-height: 1.15;
      font-weight: bold;
      color: #1a1a1a;
    }
    .quote-date {
      color: #666;
      margin-top: 4px;
    }
    .status {
      display: inline-block;
      padding: 3px 10px;
      border-radius: 20px;
      font-size: 10px;
      font-weight: 600;
      text-transform: uppercase;
      margin-top: 8px;
    }
    .status-draft { background: #e2e8f0; color: #64748b; }
    .status-sent { background: #dbeafe; color: #2563eb; }
    .status-approved { background: #d1fae5; color: #059669; }
    .status-rejected { background: #fee2e2; color: #dc2626; }
    .status-expired { background: #fef3c7; color: #d97706; }
    
    .section {
      margin-bottom: 14px;
    }
    .details-grid {
      display: grid;
      grid-template-columns: minmax(0, 1fr) 190px;
      gap: 14px;
      margin-bottom: 16px;
      break-inside: avoid;
      page-break-inside: avoid;
    }
    .section-title {
      font-size: 11px;
      font-weight: 600;
      color: #666;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      margin-bottom: 6px;
    }
    .customer-info {
      background: #f8fafc;
      padding: 11px 12px;
      border-radius: 6px;
      break-inside: avoid;
      page-break-inside: avoid;
    }
    .customer-name {
      font-size: 15px;
      line-height: 1.2;
      font-weight: 600;
      margin-bottom: 5px;
    }
    .customer-details {
      color: #666;
      line-height: 1.35;
    }
    .quote-details {
      background: #f8fafc;
      border-radius: 6px;
      padding: 11px 12px;
      color: #555;
    }
    .quote-detail-row {
      display: flex;
      justify-content: space-between;
      gap: 12px;
      padding: 2px 0;
    }
    .quote-detail-label {
      color: #777;
    }
    
    .items-section {
      margin-bottom: 12px;
    }
    table {
      width: 100%;
      border-collapse: collapse;
      margin-top: 6px;
      table-layout: fixed;
      break-inside: auto;
    }
    thead {
      display: table-header-group;
    }
    th {
      text-align: left;
      padding: 7px 9px;
      background: #f1f5f9;
      font-weight: 600;
      font-size: 10px;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      color: #64748b;
    }
    th:nth-child(1) { width: 48%; }
    th:nth-child(2) { width: 21%; }
    th:nth-child(3) { width: 10%; }
    th:nth-child(4) { width: 21%; }
    th:last-child, td:last-child {
      text-align: right;
    }
    th:nth-child(3), td:nth-child(3) {
      text-align: center;
    }
    tr {
      break-inside: avoid;
      page-break-inside: avoid;
    }
    td {
      padding: 8px 9px;
      border-bottom: 1px solid #e2e8f0;
      vertical-align: top;
      line-height: 1.28;
    }
    .product-name {
      font-weight: 500;
      overflow-wrap: anywhere;
    }
    .product-sku {
      font-size: 10px;
      color: #666;
      margin-top: 2px;
    }
    
    .totals {
      margin-top: 10px;
      text-align: right;
      break-inside: avoid;
      page-break-inside: avoid;
    }
    .totals-row {
      display: flex;
      justify-content: flex-end;
      padding: 4px 0;
    }
    .totals-label {
      width: 138px;
      text-align: left;
      color: #666;
    }
    .totals-value {
      width: 112px;
      text-align: right;
      font-weight: 500;
    }
    .totals-row.discount {
      color: #dc2626;
    }
    .totals-row.total {
      font-size: 16px;
      font-weight: bold;
      border-top: 2px solid #1a1a1a;
      padding-top: 8px;
      margin-top: 5px;
    }
    .totals-row.total .totals-value {
      color: #10b981;
    }
    
    .notes {
      background: #fef9c3;
      padding: 10px 12px;
      border-radius: 6px;
      border-left: 4px solid #eab308;
      break-inside: avoid;
      page-break-inside: avoid;
    }
    .notes-title {
      font-weight: 600;
      margin-bottom: 5px;
    }
    
    .footer {
      margin-top: 22px;
      padding-top: 10px;
      border-top: 1px solid #e2e8f0;
      text-align: center;
      color: #666;
      font-size: 10px;
      line-height: 1.35;
      break-inside: avoid;
      page-break-inside: avoid;
    }
    
    @media print {
      html, body {
        width: auto;
        height: auto;
        background: #ffffff;
      }
      body {
        max-width: none;
        padding: 0;
        -webkit-print-color-adjust: exact;
        print-color-adjust: exact;
      }
      .header,
      .details-grid,
      .customer-info,
      .quote-details,
      .totals,
      .notes,
      .footer {
        break-inside: avoid;
        page-break-inside: avoid;
      }
      thead {
        display: table-header-group;
      }
      tr {
        break-inside: avoid;
        page-break-inside: avoid;
      }
    }
  </style>
</head>
<body>
  <div class="header">
    <div>
      ${companySettings.logo_url
        ? `<img src="${companySettings.logo_url}" alt="${companySettings.company_name}" class="logo-img">`
        : `<div class="logo">${companySettings.company_name}</div>`
      }
      <div class="company-details">
        ${companySettings.company_email ? `<div>${companySettings.company_email}</div>` : ''}
        ${companySettings.company_phone ? `<div>${companySettings.company_phone}</div>` : ''}
        ${companySettings.company_address ? `<div>${companySettings.company_address.replace(/\n/g, ', ')}</div>` : ''}
      </div>
    </div>
    <div class="quote-info">
      <div class="quote-number">${quote.quote_number}</div>
      <div class="quote-date">${formatDate(quote.created_at)}</div>
      <div class="status status-${quote.status}">${quote.status}</div>
    </div>
  </div>

  <div class="details-grid">
    <div class="section">
      <div class="section-title">Bill To</div>
      <div class="customer-info">
        <div class="customer-name">${quote.customer_name}</div>
        <div class="customer-details">
          ${quote.customer_email ? `<div>${quote.customer_email}</div>` : ''}
          ${quote.customer_phone ? `<div>${quote.customer_phone}</div>` : ''}
          ${quote.customer_address ? `<div>${quote.customer_address.replace(/\n/g, '<br>')}</div>` : ''}
        </div>
      </div>
    </div>

    <div class="section">
      <div class="section-title">Quote Details</div>
      <div class="quote-details">
        <div class="quote-detail-row">
          <span class="quote-detail-label">Issued</span>
          <span>${formatDate(quote.created_at)}</span>
        </div>
        ${quote.valid_until ? `
        <div class="quote-detail-row">
          <span class="quote-detail-label">Valid Until</span>
          <span>${formatDate(quote.valid_until)}</span>
        </div>
        ` : ''}
        ${quote.delivery_weeks ? `
        <div class="quote-detail-row">
          <span class="quote-detail-label">Delivery</span>
          <span>${quote.delivery_weeks} weeks</span>
        </div>
        ` : ''}
      </div>
    </div>
  </div>

  <div class="section items-section">
    <div class="section-title">Items</div>
    <table>
      <thead>
        <tr>
          <th>Product</th>
          <th>Unit Price</th>
          <th>Qty</th>
          <th>Total</th>
        </tr>
      </thead>
      <tbody>
        ${quote.items?.map(item => `
        <tr>
          <td>
            <div class="product-name">${item.product_name}</div>
            <div class="product-sku">${item.product_sku}</div>
          </td>
          <td>${formatCurrency(item.unit_price)}</td>
          <td>${item.quantity}</td>
          <td>${formatCurrency(item.line_total)}</td>
        </tr>
        `).join('')}
      </tbody>
    </table>

    <div class="totals">
      <div class="totals-row">
        <div class="totals-label">Subtotal</div>
        <div class="totals-value">${formatCurrency(quote.subtotal)}</div>
      </div>
      ${quote.discount_percent > 0 ? `
      <div class="totals-row discount">
        <div class="totals-label">Discount (${quote.discount_percent}%)</div>
        <div class="totals-value">-${formatCurrency(quote.discount_amount)}</div>
      </div>
      ` : ''}
      ${quote.shipping_fee > 0 ? `
      <div class="totals-row" style="color:#2563eb;">
        <div class="totals-label">Shipping Fee${quote.incoterm ? ` (${quote.incoterm})` : ''}</div>
        <div class="totals-value">+${formatCurrency(quote.shipping_fee)}</div>
      </div>
      ` : ''}
      <div class="totals-row total">
        <div class="totals-label">Total</div>
        <div class="totals-value">${formatCurrency(quote.total)}</div>
      </div>
    </div>
  </div>

  ${quote.notes ? `
  <div class="section">
    <div class="notes">
      <div class="notes-title">Notes</div>
      <div>${quote.notes.replace(/\n/g, '<br>')}</div>
    </div>
  </div>
  ` : ''}

  <div class="footer">
    <p>${companySettings.footer_text || 'Thank you for your business!'}</p>
    ${companySettings.company_website ? `<p>${companySettings.company_website}</p>` : ''}
    ${companySettings.tax_id ? `<p>Tax ID: ${companySettings.tax_id}</p>` : ''}
  </div>
</body>
</html>
    `;

    return new NextResponse(html, {
      headers: {
        'Content-Type': 'text/html',
      },
    });
  } catch (error) {
    console.error('Error generating PDF:', error);
    return NextResponse.json({ error: 'Failed to generate PDF' }, { status: 500 });
  }
}
