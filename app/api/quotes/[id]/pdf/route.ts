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
      line-height: 1.55;
      padding: 40px;
      max-width: 800px;
      margin: 0 auto;
    }
    .header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 34px;
      padding-bottom: 20px;
      border-bottom: 2px solid #10b981;
      break-inside: avoid;
      page-break-inside: avoid;
    }
    .logo {
      font-size: 28px;
      font-weight: bold;
      color: #10b981;
    }
    .logo-img {
      height: 40px;
      max-width: 260px;
      object-fit: contain;
    }
    .company-details {
      font-size: 12px;
      color: #666;
      margin-top: 8px;
      line-height: 1.45;
      max-width: 430px;
    }
    .quote-info {
      text-align: right;
    }
    .quote-number {
      font-size: 24px;
      font-weight: bold;
      color: #1a1a1a;
    }
    .quote-date {
      color: #666;
      margin-top: 4px;
    }
    .status {
      display: inline-block;
      padding: 4px 12px;
      border-radius: 20px;
      font-size: 12px;
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
      margin-bottom: 26px;
    }
    .section-title {
      font-size: 14px;
      font-weight: 600;
      color: #666;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      margin-bottom: 12px;
    }
    .customer-info {
      background: #f8fafc;
      padding: 20px;
      border-radius: 8px;
      break-inside: avoid;
      page-break-inside: avoid;
    }
    .customer-name {
      font-size: 18px;
      font-weight: 600;
      margin-bottom: 8px;
    }
    .customer-details {
      color: #666;
    }
    
    .items-section {
      margin-bottom: 22px;
    }
    table {
      width: 100%;
      border-collapse: collapse;
      margin-top: 8px;
      break-inside: auto;
    }
    thead {
      display: table-header-group;
    }
    th {
      text-align: left;
      padding: 12px 16px;
      background: #f1f5f9;
      font-weight: 600;
      font-size: 12px;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      color: #64748b;
    }
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
      padding: 13px 16px;
      border-bottom: 1px solid #e2e8f0;
      vertical-align: top;
    }
    .product-name {
      font-weight: 500;
      overflow-wrap: anywhere;
    }
    .product-sku {
      font-size: 12px;
      color: #666;
    }
    
    .totals {
      margin-top: 18px;
      text-align: right;
      break-inside: avoid;
      page-break-inside: avoid;
    }
    .totals-row {
      display: flex;
      justify-content: flex-end;
      padding: 7px 0;
    }
    .totals-label {
      width: 150px;
      text-align: left;
      color: #666;
    }
    .totals-value {
      width: 120px;
      text-align: right;
      font-weight: 500;
    }
    .totals-row.discount {
      color: #dc2626;
    }
    .totals-row.total {
      font-size: 18px;
      font-weight: bold;
      border-top: 2px solid #1a1a1a;
      padding-top: 12px;
      margin-top: 8px;
    }
    .totals-row.total .totals-value {
      color: #10b981;
    }
    
    .notes {
      background: #fef9c3;
      padding: 16px;
      border-radius: 8px;
      border-left: 4px solid #eab308;
      break-inside: avoid;
      page-break-inside: avoid;
    }
    .notes-title {
      font-weight: 600;
      margin-bottom: 8px;
    }
    
    .footer {
      margin-top: 46px;
      padding-top: 18px;
      border-top: 1px solid #e2e8f0;
      text-align: center;
      color: #666;
      font-size: 12px;
      break-inside: avoid;
      page-break-inside: avoid;
    }
    
    @media print {
      @page {
        size: A4;
        margin: 0;
      }
      body {
        max-width: none;
        padding: 25px 40px;
        -webkit-print-color-adjust: exact;
        print-color-adjust: exact;
      }
      .header {
        margin-bottom: 25px;
        page-break-after: avoid;
      }
      .section {
        margin-bottom: 20px;
      }
      .items-section {
        margin-bottom: 16px;
      }
      td {
        padding: 12px 16px;
      }
      .totals {
        margin-top: 18px;
      }
      .totals-row {
        padding: 6px 0;
      }
      .footer {
        margin-top: 38px;
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

  ${quote.valid_until ? `
  <div class="section">
    <div class="section-title">Valid Until</div>
    <div>${formatDate(quote.valid_until)}</div>
  </div>
  ` : ''}

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
