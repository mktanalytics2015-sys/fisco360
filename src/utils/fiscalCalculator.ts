import { 
  fiscalRegimes, 
  taxes, 
  fiscalObligations,
  irtBrackets,
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
  averageSalary?: string;
  assetValue?: string;
  importValue?: string;
}

export interface TaxCalculation {
  taxId: string;
  taxName: string;
  abbreviation: string;
  baseValue: number;
  rate: number;
  estimatedAmount: number;
  frequency: string;
  notes: string;
}

export interface SimulationResult {
  regime: FiscalRegime;
  applicableTaxes: TaxInfo[];
  taxCalculations: TaxCalculation[];
  obligations: {
    monthly: FiscalObligation[];
    quarterly: FiscalObligation[];
    annual: FiscalObligation[];
  };
  formattedRevenue: string;
  employeeCount: number;
  totalAnnualTaxEstimate: number;
}

// Calcular IRT baseado nas tabelas oficiais
function calculateIRT(monthlySalary: number): number {
  const bracket = irtBrackets.find(b => monthlySalary >= b.min && monthlySalary <= b.max);
  if (!bracket) return 0;
  return Math.max(0, monthlySalary * bracket.rate - bracket.deduction);
}

export function calculateFiscalFramework(formData: FormData): SimulationResult {
  const revenue = parseInt(formData.annualRevenue) || 0;
  const employees = parseInt(formData.employeeCount) || 0;
  const averageSalary = parseInt(formData.averageSalary || '150000') || 150000;
  const assetValue = parseInt(formData.assetValue || '0') || 0;
  const importValue = parseInt(formData.importValue || '0') || 0;
  
  // Determinar o regime fiscal baseado no volume de negócios
  let regime = fiscalRegimes.find(r => 
    revenue >= r.revenueRange.min && revenue <= r.revenueRange.max
  ) || fiscalRegimes[0];

  // Determinar impostos aplicáveis
  const applicableTaxes: TaxInfo[] = [];
  const taxCalculations: TaxCalculation[] = [];
  
  // Impostos base para todas as empresas
  const baseTaxIds = ['imposto_industrial', 'iva', 'imposto_selo'];
  
  // Adicionar impostos base
  taxes.forEach(tax => {
    if (baseTaxIds.includes(tax.id)) {
      applicableTaxes.push(tax);
    }
  });

  // Calcular Imposto Industrial
  let iiRate = 0.25;
  let iiNotes = 'Taxa geral de 25%';
  
  if (formData.activityType === 'agricultura') {
    iiRate = 0.15;
    iiNotes = 'Taxa reduzida de 15% para agricultura';
  } else if (['financeiro', 'tecnologia'].includes(formData.activityType)) {
    iiRate = 0.35;
    iiNotes = 'Taxa de 35% para sector financeiro/telecom';
  } else if (regime.id === 'simplified' && revenue <= 10000000) {
    iiRate = 0.065;
    iiNotes = 'Taxa simplificada de 6,5% para Grupo C';
  }
  
  // Estimar lucro tributável (aproximação: 10-15% do volume de negócios)
  const estimatedProfit = revenue * 0.12;
  const iiAmount = estimatedProfit * iiRate;
  
  taxCalculations.push({
    taxId: 'imposto_industrial',
    taxName: 'Imposto Industrial',
    abbreviation: 'II',
    baseValue: estimatedProfit,
    rate: iiRate,
    estimatedAmount: iiAmount,
    frequency: 'anual',
    notes: iiNotes
  });

  // Calcular IVA
  let ivaRate = 0.14;
  let ivaNotes = 'Taxa normal de 14%';
  
  if (formData.province === 'Cabinda') {
    ivaRate = 0.01;
    ivaNotes = 'Taxa especial de 1% para Cabinda';
  } else if (regime.id === 'simplified') {
    ivaRate = 0.07;
    ivaNotes = 'Taxa simplificada de 7%';
  }
  
  // IVA sobre vendas (mensal, anualizando)
  const ivaAmount = revenue * ivaRate * 0.3; // Estimando 30% de valor acrescentado
  
  taxCalculations.push({
    taxId: 'iva',
    taxName: 'IVA',
    abbreviation: 'IVA',
    baseValue: revenue,
    rate: ivaRate,
    estimatedAmount: ivaAmount,
    frequency: 'mensal',
    notes: ivaNotes
  });

  // Imposto de Selo (estimativa sobre operações)
  const seloAmount = revenue * 0.003; // 0,3% sobre operações
  taxCalculations.push({
    taxId: 'imposto_selo',
    taxName: 'Imposto de Selo',
    abbreviation: 'IS',
    baseValue: revenue,
    rate: 0.003,
    estimatedAmount: seloAmount,
    frequency: 'pontual',
    notes: 'Estimativa sobre operações documentadas'
  });

  // Se tem trabalhadores, adicionar IRT e INSS
  if (employees > 0) {
    const employeeTaxes = taxes.filter(t => 
      ['irt', 'inss_entidade', 'inss_trabalhador', 'fundo_desemprego'].includes(t.id)
    );
    applicableTaxes.push(...employeeTaxes);

    // Calcular massa salarial anual
    const monthlyPayroll = averageSalary * employees;
    const annualPayroll = monthlyPayroll * 12;

    // IRT (média por trabalhador * 12 meses)
    const monthlyIRTPerEmployee = calculateIRT(averageSalary);
    const annualIRT = monthlyIRTPerEmployee * employees * 12;
    
    taxCalculations.push({
      taxId: 'irt',
      taxName: 'IRT',
      abbreviation: 'IRT',
      baseValue: annualPayroll,
      rate: annualIRT / annualPayroll,
      estimatedAmount: annualIRT,
      frequency: 'mensal',
      notes: `Baseado em salário médio de ${averageSalary.toLocaleString('pt-AO')} Kz`
    });

    // INSS Entidade (8%)
    const inssEntidade = annualPayroll * 0.08;
    taxCalculations.push({
      taxId: 'inss_entidade',
      taxName: 'INSS Patronal',
      abbreviation: 'INSS-E',
      baseValue: annualPayroll,
      rate: 0.08,
      estimatedAmount: inssEntidade,
      frequency: 'mensal',
      notes: 'Contribuição patronal obrigatória'
    });

    // INSS Trabalhador (3%) - retido
    const inssTrabalhador = annualPayroll * 0.03;
    taxCalculations.push({
      taxId: 'inss_trabalhador',
      taxName: 'INSS Trabalhador',
      abbreviation: 'INSS-T',
      baseValue: annualPayroll,
      rate: 0.03,
      estimatedAmount: inssTrabalhador,
      frequency: 'mensal',
      notes: 'Retenção sobre salários dos trabalhadores'
    });
  }

  // Se tem propriedades/imóveis
  if (formData.hasAssets) {
    const assetTaxes = taxes.filter(t => 
      ['imposto_predial', 'sisa'].includes(t.id)
    );
    applicableTaxes.push(...assetTaxes);

    if (assetValue > 5000000) {
      const ipAmount = (assetValue - 5000000) * 0.005;
      taxCalculations.push({
        taxId: 'imposto_predial',
        taxName: 'Imposto Predial',
        abbreviation: 'IP',
        baseValue: assetValue,
        rate: 0.005,
        estimatedAmount: ipAmount,
        frequency: 'anual',
        notes: '0,5% sobre valor acima de 5 milhões Kz'
      });
    }
  }

  // Se faz importação/exportação
  if (formData.hasImportExport) {
    const importTaxes = taxes.filter(t => 
      ['direitos_aduaneiros', 'ice', 'taxa_servicos_aduaneiros'].includes(t.id)
    );
    applicableTaxes.push(...importTaxes);

    if (importValue > 0) {
      // Direitos aduaneiros (média 15%)
      const daAmount = importValue * 0.15;
      taxCalculations.push({
        taxId: 'direitos_aduaneiros',
        taxName: 'Direitos Aduaneiros',
        abbreviation: 'DA',
        baseValue: importValue,
        rate: 0.15,
        estimatedAmount: daAmount,
        frequency: 'pontual',
        notes: 'Taxa média estimada de 15%'
      });

      // Taxa de serviços aduaneiros (2%)
      const tsaAmount = importValue * 0.02;
      taxCalculations.push({
        taxId: 'taxa_servicos_aduaneiros',
        taxName: 'Taxa Serviços Aduaneiros',
        abbreviation: 'TSA',
        baseValue: importValue,
        rate: 0.02,
        estimatedAmount: tsaAmount,
        frequency: 'pontual',
        notes: '2% sobre valor aduaneiro'
      });
    }
  }

  // Se tem veículos
  if (formData.hasVehicles) {
    const vehicleTaxes = taxes.filter(t => t.id === 'taxa_circulacao');
    applicableTaxes.push(...vehicleTaxes);
    
    taxCalculations.push({
      taxId: 'taxa_circulacao',
      taxName: 'Taxa de Circulação',
      abbreviation: 'TCV',
      baseValue: 0,
      rate: 0,
      estimatedAmount: 50000, // Valor médio estimado por veículo
      frequency: 'anual',
      notes: 'Valor varia conforme tipo de veículo'
    });
  }

  // Adicionar impostos específicos por sector
  if (formData.activityType === 'financeiro') {
    const financialTax = taxes.find(t => t.id === 'iac');
    if (financialTax && !applicableTaxes.find(t => t.id === 'iac')) {
      applicableTaxes.push(financialTax);
    }
  }

  if (formData.activityType === 'turismo') {
    const tourismTax = taxes.find(t => t.id === 'contribuicao_turismo');
    if (tourismTax && !applicableTaxes.find(t => t.id === 'contribuicao_turismo')) {
      applicableTaxes.push(tourismTax);
      
      taxCalculations.push({
        taxId: 'contribuicao_turismo',
        taxName: 'Contribuição para o Turismo',
        abbreviation: 'CT',
        baseValue: revenue,
        rate: 0.02,
        estimatedAmount: revenue * 0.02,
        frequency: 'mensal',
        notes: '2% sobre facturação hoteleira'
      });
    }
  }

  if (formData.activityType === 'petroleo') {
    const oilTax = taxes.find(t => t.id === 'imposto_petroleo');
    if (oilTax && !applicableTaxes.find(t => t.id === 'imposto_petroleo')) {
      applicableTaxes.push(oilTax);
    }
  }

  if (formData.activityType === 'mineracao') {
    const miningTax = taxes.find(t => t.id === 'imposto_mineiro');
    if (miningTax && !applicableTaxes.find(t => t.id === 'imposto_mineiro')) {
      applicableTaxes.push(miningTax);
    }
  }

  // Adicionar retenção na fonte para regime geral
  if (regime.id !== 'simplified') {
    const rfTax = taxes.find(t => t.id === 'retencao_fonte');
    if (rfTax && !applicableTaxes.find(t => t.id === 'retencao_fonte')) {
      applicableTaxes.push(rfTax);
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

  // Adicionar obrigações específicas
  if (formData.hasVehicles) {
    const taxaCirculacao = fiscalObligations.find(o => o.id === 'taxa_circulacao');
    if (taxaCirculacao && !annualObligations.find(o => o.id === 'taxa_circulacao')) {
      annualObligations.push(taxaCirculacao);
    }
  }

  if (formData.hasAssets) {
    const ipObligation = fiscalObligations.find(o => o.id === 'declaracao_imposto_predial');
    if (ipObligation && !annualObligations.find(o => o.id === 'declaracao_imposto_predial')) {
      annualObligations.push(ipObligation);
    }
  }

  // Calcular total anual estimado
  const totalAnnualTaxEstimate = taxCalculations.reduce((sum, calc) => sum + calc.estimatedAmount, 0);

  // Formatar o valor do volume de negócios
  const formattedRevenue = revenue.toLocaleString('pt-AO');

  return {
    regime,
    applicableTaxes,
    taxCalculations,
    obligations: {
      monthly: monthlyObligations,
      quarterly: quarterlyObligations,
      annual: annualObligations
    },
    formattedRevenue,
    employeeCount: employees,
    totalAnnualTaxEstimate
  };
}
