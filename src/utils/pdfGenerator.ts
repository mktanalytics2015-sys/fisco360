import { TaxInfo, FiscalObligation, FiscalRegime } from '@/data/angolaTaxData';

interface PDFData {
  regime: FiscalRegime;
  applicableTaxes: TaxInfo[];
  obligations: {
    monthly: FiscalObligation[];
    quarterly: FiscalObligation[];
    annual: FiscalObligation[];
  };
  formattedRevenue: string;
  employeeCount: number;
  companyType?: string;
  activityType?: string;
  province?: string;
}

const getCategoryLabel = (category: TaxInfo['category']) => {
  switch (category) {
    case 'rendimento': return 'Rendimento';
    case 'consumo': return 'Consumo';
    case 'patrimonio': return 'Património';
    case 'social': return 'Social';
    case 'especial': return 'Especial';
    default: return category;
  }
};

export const generateFiscalReportHTML = (data: PDFData): string => {
  const currentDate = new Date().toLocaleDateString('pt-AO', {
    day: '2-digit',
    month: 'long',
    year: 'numeric'
  });

  const taxesHTML = data.applicableTaxes.map(tax => `
    <tr>
      <td style="padding: 12px; border-bottom: 1px solid #e5e7eb;">
        <strong>${tax.name}</strong><br>
        <span style="color: #6b7280; font-size: 12px;">${tax.abbreviation}</span>
      </td>
      <td style="padding: 12px; border-bottom: 1px solid #e5e7eb; color: #6b7280; font-size: 13px;">${tax.description}</td>
      <td style="padding: 12px; border-bottom: 1px solid #e5e7eb; font-weight: 600; color: #1e3a5f;">${tax.rate}</td>
      <td style="padding: 12px; border-bottom: 1px solid #e5e7eb;">
        <span style="background: #f3f4f6; padding: 4px 8px; border-radius: 4px; font-size: 12px; text-transform: capitalize;">${getCategoryLabel(tax.category)}</span>
      </td>
      <td style="padding: 12px; border-bottom: 1px solid #e5e7eb; text-transform: capitalize;">${tax.frequency}</td>
    </tr>
  `).join('');

  const generateObligationsHTML = (obligations: FiscalObligation[], title: string, color: string) => {
    if (obligations.length === 0) return '';
    
    const rows = obligations.map(obl => `
      <tr>
        <td style="padding: 10px; border-bottom: 1px solid #e5e7eb;"><strong>${obl.name}</strong></td>
        <td style="padding: 10px; border-bottom: 1px solid #e5e7eb; color: #6b7280; font-size: 13px;">${obl.description}</td>
        <td style="padding: 10px; border-bottom: 1px solid #e5e7eb; font-weight: 500; color: ${color};">${obl.deadline}</td>
      </tr>
    `).join('');

    return `
      <div style="margin-top: 24px;">
        <h3 style="color: ${color}; font-size: 16px; margin-bottom: 12px; border-bottom: 2px solid ${color}; padding-bottom: 8px;">${title}</h3>
        <table style="width: 100%; border-collapse: collapse; font-size: 14px;">
          <thead>
            <tr style="background: #f9fafb;">
              <th style="padding: 10px; text-align: left; font-weight: 600;">Obrigação</th>
              <th style="padding: 10px; text-align: left; font-weight: 600;">Descrição</th>
              <th style="padding: 10px; text-align: left; font-weight: 600;">Prazo</th>
            </tr>
          </thead>
          <tbody>
            ${rows}
          </tbody>
        </table>
      </div>
    `;
  };

  return `
    <!DOCTYPE html>
    <html lang="pt">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Relatório de Enquadramento Fiscal - FISCO360</title>
      <style>
        @media print {
          body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
          .page-break { page-break-before: always; }
          .no-print { display: none !important; }
        }
        body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; margin: 0; padding: 0; color: #1f2937; line-height: 1.6; }
        .container { max-width: 800px; margin: 0 auto; padding: 40px; }
        .header { text-align: center; border-bottom: 3px solid #c9a227; padding-bottom: 24px; margin-bottom: 32px; }
        .logo { font-size: 28px; font-weight: bold; color: #1e3a5f; }
        .logo span { color: #c9a227; }
        .subtitle { color: #6b7280; font-size: 14px; margin-top: 8px; }
        .date { color: #9ca3af; font-size: 12px; margin-top: 16px; }
        .regime-box { background: linear-gradient(135deg, #1e3a5f 0%, #2d5a8b 100%); color: white; padding: 24px; border-radius: 12px; margin-bottom: 32px; }
        .regime-title { font-size: 22px; font-weight: bold; margin-bottom: 8px; }
        .regime-desc { opacity: 0.9; font-size: 14px; margin-bottom: 16px; }
        .regime-stats { display: flex; gap: 24px; margin-top: 16px; }
        .stat-box { background: rgba(255,255,255,0.1); padding: 12px 16px; border-radius: 8px; }
        .stat-label { font-size: 11px; opacity: 0.8; text-transform: uppercase; }
        .stat-value { font-size: 16px; font-weight: 600; margin-top: 4px; }
        .section-title { color: #1e3a5f; font-size: 18px; font-weight: bold; margin: 32px 0 16px 0; padding-bottom: 8px; border-bottom: 2px solid #c9a227; }
        .characteristics { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; }
        .char-item { display: flex; align-items: center; gap: 8px; font-size: 14px; color: #4b5563; }
        .char-dot { width: 6px; height: 6px; background: #c9a227; border-radius: 50%; }
        table { width: 100%; border-collapse: collapse; font-size: 14px; }
        th { background: #f9fafb; padding: 12px; text-align: left; font-weight: 600; color: #374151; }
        .footer { margin-top: 48px; padding-top: 24px; border-top: 1px solid #e5e7eb; text-align: center; }
        .footer-warning { background: #fef3c7; border: 1px solid #f59e0b; border-radius: 8px; padding: 16px; margin-bottom: 24px; }
        .footer-warning-title { font-weight: 600; color: #92400e; font-size: 14px; }
        .footer-warning-text { color: #a16207; font-size: 12px; margin-top: 4px; }
        .footer-brand { color: #9ca3af; font-size: 12px; }
        .print-btn { background: #c9a227; color: white; border: none; padding: 12px 32px; font-size: 16px; font-weight: 600; border-radius: 8px; cursor: pointer; margin-top: 24px; }
        .print-btn:hover { background: #b38b1f; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <div class="logo">FISCO<span>360</span></div>
          <div class="subtitle">Sistema de Enquadramento Fiscal de Angola</div>
          <div class="date">Relatório gerado em ${currentDate}</div>
        </div>

        <div class="regime-box">
          <div class="regime-title">${data.regime.name}</div>
          <div class="regime-desc">${data.regime.description}</div>
          <div class="regime-stats">
            <div class="stat-box">
              <div class="stat-label">Volume de Negócios</div>
              <div class="stat-value">${data.formattedRevenue} Kz</div>
            </div>
            <div class="stat-box">
              <div class="stat-label">Trabalhadores</div>
              <div class="stat-value">${data.employeeCount}</div>
            </div>
          </div>
        </div>

        <h2 class="section-title">Características do Regime</h2>
        <div class="characteristics">
          ${data.regime.characteristics.map(char => `
            <div class="char-item">
              <div class="char-dot"></div>
              <span>${char}</span>
            </div>
          `).join('')}
        </div>

        <h2 class="section-title">Impostos Aplicáveis (${data.applicableTaxes.length})</h2>
        <table>
          <thead>
            <tr>
              <th>Imposto</th>
              <th>Descrição</th>
              <th>Taxa</th>
              <th>Categoria</th>
              <th>Frequência</th>
            </tr>
          </thead>
          <tbody>
            ${taxesHTML}
          </tbody>
        </table>

        <div class="page-break"></div>

        <h2 class="section-title">Obrigações Fiscais</h2>
        
        ${generateObligationsHTML(data.obligations.monthly, `Obrigações Mensais (${data.obligations.monthly.length})`, '#2563eb')}
        ${generateObligationsHTML(data.obligations.quarterly, `Obrigações Trimestrais (${data.obligations.quarterly.length})`, '#d97706')}
        ${generateObligationsHTML(data.obligations.annual, `Obrigações Anuais (${data.obligations.annual.length})`, '#16a34a')}

        <div class="footer">
          <div class="footer-warning">
            <div class="footer-warning-title">⚠️ Aviso Importante</div>
            <div class="footer-warning-text">
              Este relatório fornece informações gerais baseadas no Código Geral Tributário de Angola. 
              Para uma análise detalhada da sua situação fiscal específica, recomendamos consultar 
              um contabilista certificado ou a Administração Geral Tributária (AGT).
            </div>
          </div>
          <div class="footer-brand">
            FISCO360 © ${new Date().getFullYear()} - Sistema de Enquadramento Fiscal de Angola
          </div>
        </div>

        <div class="no-print" style="text-align: center;">
          <button class="print-btn" onclick="window.print()">🖨️ Imprimir Relatório</button>
        </div>
      </div>
    </body>
    </html>
  `;
};

export const openPrintableReport = (data: PDFData): void => {
  const html = generateFiscalReportHTML(data);
  const printWindow = window.open('', '_blank');
  
  if (printWindow) {
    printWindow.document.write(html);
    printWindow.document.close();
  }
};
