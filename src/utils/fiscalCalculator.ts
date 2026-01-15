import { 
  fiscalRegimes, 
  taxes, 
  fiscalObligations,
  TaxInfo,
  FiscalObligation,
  FiscalRegime 
} from '@/data/angolaTaxData';

interface FormData {
  companyType: string;
  annualRevenue: string;
  employeeCount: string;
  province: string;
  activityType: string;
  establishmentYear: string;
  hasAssets: boolean;
  hasImportExport: boolean;
  hasVehicles: boolean;
}

export interface SimulationResult {
  regime: FiscalRegime;
  applicableTaxes: TaxInfo[];
  obligations: {
    monthly: FiscalObligation[];
    quarterly: FiscalObligation[];
    annual: FiscalObligation[];
  };
  formattedRevenue: string;
  employeeCount: number;
}

export function calculateFiscalFramework(formData: FormData): SimulationResult {
  const revenue = parseInt(formData.annualRevenue) || 0;
  const employees = parseInt(formData.employeeCount) || 0;
  
  // Determinar o regime fiscal baseado no volume de negócios
  let regime = fiscalRegimes.find(r => 
    revenue >= r.revenueRange.min && revenue <= r.revenueRange.max
  ) || fiscalRegimes[0];

  // Determinar impostos aplicáveis
  const applicableTaxes: TaxInfo[] = [];
  
  // Impostos base para todas as empresas
  const baseTaxIds = ['imposto_industrial', 'iva', 'imposto_selo'];
  
  // Adicionar impostos base
  taxes.forEach(tax => {
    if (baseTaxIds.includes(tax.id)) {
      applicableTaxes.push(tax);
    }
  });

  // Se tem trabalhadores, adicionar IRT e INSS
  if (employees > 0) {
    const employeeTaxes = taxes.filter(t => 
      ['irt', 'inss_entidade', 'inss_trabalhador'].includes(t.id)
    );
    applicableTaxes.push(...employeeTaxes);
  }

  // Se tem propriedades/imóveis
  if (formData.hasAssets) {
    const assetTaxes = taxes.filter(t => 
      ['ipu', 'sisa'].includes(t.id)
    );
    applicableTaxes.push(...assetTaxes);
  }

  // Se faz importação/exportação
  if (formData.hasImportExport) {
    const importTaxes = taxes.filter(t => 
      ['direitos_aduaneiros', 'ice'].includes(t.id)
    );
    applicableTaxes.push(...importTaxes);
  }

  // Se tem veículos
  if (formData.hasVehicles) {
    const vehicleTaxes = taxes.filter(t => t.id === 'taxa_circulacao');
    applicableTaxes.push(...vehicleTaxes);
  }

  // Adicionar imposto específico do sector financeiro
  if (formData.activityType === 'financeiro') {
    const financialTax = taxes.find(t => t.id === 'iac');
    if (financialTax && !applicableTaxes.find(t => t.id === 'iac')) {
      applicableTaxes.push(financialTax);
    }
  }

  // Determinar obrigações fiscais
  const regimeId = regime.id;
  
  const monthlyObligations = fiscalObligations.filter(o => 
    o.frequency === 'mensal' && 
    (o.applicableTo.includes('all') || o.applicableTo.includes(regimeId))
  );

  const quarterlyObligations = fiscalObligations.filter(o => 
    o.frequency === 'trimestral' && 
    (o.applicableTo.includes('all') || o.applicableTo.includes(regimeId))
  );

  const annualObligations = fiscalObligations.filter(o => 
    o.frequency === 'anual' && 
    (o.applicableTo.includes('all') || o.applicableTo.includes(regimeId))
  );

  // Adicionar taxa de circulação se tem veículos
  if (formData.hasVehicles) {
    const taxaCirculacao = fiscalObligations.find(o => o.id === 'taxa_circulacao');
    if (taxaCirculacao && !annualObligations.find(o => o.id === 'taxa_circulacao')) {
      annualObligations.push(taxaCirculacao);
    }
  }

  // Formatar o valor do volume de negócios
  const formattedRevenue = revenue.toLocaleString('pt-AO');

  return {
    regime,
    applicableTaxes,
    obligations: {
      monthly: monthlyObligations,
      quarterly: quarterlyObligations,
      annual: annualObligations
    },
    formattedRevenue,
    employeeCount: employees
  };
}
