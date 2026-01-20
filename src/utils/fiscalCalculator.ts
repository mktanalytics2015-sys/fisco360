import { 
  fiscalRegimes, 
  taxes, 
  fiscalObligations,
  irtBrackets,
  industrialTaxRegimes,
  ivaRegimes,
  TaxInfo,
  FiscalObligation,
  FiscalRegime,
  IndustrialTaxRegime,
  IvaRegime
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
  formula: string; // Fórmula de cálculo
}

export interface SimulationResult {
  regime: FiscalRegime;
  industrialTaxRegime: IndustrialTaxRegime;
  ivaRegime: IvaRegime;
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

// Calcular IRT baseado nas tabelas oficiais (isenção até 150.000 Kz)
function calculateIRT(monthlySalary: number): { amount: number; rate: number; formula: string } {
  // Salários até 150.000 Kz estão isentos
  if (monthlySalary <= 150000) {
    return { 
      amount: 0, 
      rate: 0, 
      formula: 'Isento (salário ≤ 150.000 Kz)' 
    };
  }
  
  const bracket = irtBrackets.find(b => monthlySalary >= b.min && monthlySalary <= b.max);
  if (!bracket) return { amount: 0, rate: 0, formula: 'N/A' };
  
  const amount = Math.max(0, monthlySalary * bracket.rate - bracket.deduction);
  const formula = `IRT = (${monthlySalary.toLocaleString('pt-AO')} × ${(bracket.rate * 100).toFixed(0)}%) - ${bracket.deduction.toLocaleString('pt-AO')} = ${amount.toLocaleString('pt-AO')} Kz`;
  
  return { amount, rate: bracket.rate, formula };
}

// Determinar regime do Imposto Industrial
function getIndustrialTaxRegime(revenue: number, activityType: string): IndustrialTaxRegime {
  let regime = industrialTaxRegimes.find(r => 
    revenue >= r.volumeNegociosMin && revenue <= r.volumeNegociosMax
  ) || industrialTaxRegimes[2]; // Default: Grupo C
  
  return regime;
}

// Determinar regime do IVA
function getIvaRegime(revenue: number): IvaRegime {
  return ivaRegimes.find(r => 
    revenue >= r.volumeNegociosMin && revenue <= r.volumeNegociosMax
  ) || ivaRegimes[2]; // Default: Exclusão
}

export function calculateFiscalFramework(formData: FormData): SimulationResult {
  const revenue = parseInt(formData.annualRevenue) || 0;
  const employees = parseInt(formData.employeeCount) || 0;
  const averageSalary = parseInt(formData.averageSalary || '150000') || 150000;
  const assetValue = parseInt(formData.assetValue || '0') || 0;
  const importValue = parseInt(formData.importValue || '0') || 0;
  
  // Determinar o regime fiscal geral
  let regime = fiscalRegimes.find(r => 
    revenue >= r.revenueRange.min && revenue <= r.revenueRange.max
  ) || fiscalRegimes[0];

  // Determinar regimes específicos de II e IVA
  const industrialTaxRegime = getIndustrialTaxRegime(revenue, formData.activityType);
  const ivaRegime = getIvaRegime(revenue);

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

  // ========== CÁLCULO DO IMPOSTO INDUSTRIAL ==========
  let iiRate = industrialTaxRegime.taxa;
  let iiBaseValue: number;
  let iiAmount: number;
  let iiFormula: string;
  let iiNotes: string;

  if (industrialTaxRegime.grupo === 'C') {
    // Regime Simplificado: taxa sobre volume de negócios
    iiBaseValue = revenue;
    iiAmount = revenue * iiRate;
    iiFormula = `II = ${revenue.toLocaleString('pt-AO')} × 6,5% = ${iiAmount.toLocaleString('pt-AO')} Kz`;
    iiNotes = `Grupo C (Simplificado): 6,5% sobre volume de negócios`;
  } else {
    // Regime Geral: taxa sobre matéria colectável (lucro tributável)
    // Estimativa: 10-15% do volume de negócios como lucro
    const estimatedProfit = revenue * 0.12;
    iiBaseValue = estimatedProfit;
    
    // Ajustar taxa por sector
    if (formData.activityType === 'agricultura') {
      iiRate = 0.15;
      iiNotes = `Grupo ${industrialTaxRegime.grupo} (Geral): 15% para agricultura`;
    } else if (['financeiro', 'tecnologia'].includes(formData.activityType)) {
      iiRate = 0.35;
      iiNotes = `Grupo ${industrialTaxRegime.grupo} (Geral): 35% para sector financeiro/telecom`;
    } else {
      iiNotes = `Grupo ${industrialTaxRegime.grupo} (Geral): 25% sobre lucro tributável`;
    }
    
    iiAmount = estimatedProfit * iiRate;
    iiFormula = `II = Lucro Tributável × ${(iiRate * 100).toFixed(0)}% = ${estimatedProfit.toLocaleString('pt-AO')} × ${(iiRate * 100).toFixed(0)}% = ${iiAmount.toLocaleString('pt-AO')} Kz`;
  }
  
  taxCalculations.push({
    taxId: 'imposto_industrial',
    taxName: 'Imposto Industrial',
    abbreviation: 'II',
    baseValue: iiBaseValue,
    rate: iiRate,
    estimatedAmount: iiAmount,
    frequency: 'anual',
    notes: iiNotes,
    formula: iiFormula
  });

  // ========== CÁLCULO DO IVA ==========
  let ivaRate = ivaRegime.taxa;
  let ivaAmount: number;
  let ivaFormula: string;
  let ivaNotes: string;

  if (ivaRegime.id === 'iva_exclusao') {
    ivaAmount = 0;
    ivaFormula = 'Isento (Regime de Exclusão)';
    ivaNotes = 'Regime de Exclusão: Volume de negócios até 25 milhões Kz';
  } else if (ivaRegime.id === 'iva_simplificado') {
    // Regime simplificado: 7% sobre recebimentos
    ivaAmount = revenue * 0.07;
    ivaFormula = `IVA = ${revenue.toLocaleString('pt-AO')} × 7% = ${ivaAmount.toLocaleString('pt-AO')} Kz`;
    ivaNotes = 'Regime Simplificado: 7% sobre recebimentos (trimestral)';
  } else {
    // Regime Geral: 14% com dedução
    // IVA a pagar = IVA das vendas - IVA das compras
    // Estimando margem de 30% de valor acrescentado
    const valueAdded = revenue * 0.3;
    ivaAmount = valueAdded * 0.14;
    
    if (formData.province === 'Cabinda') {
      ivaRate = 0.01;
      ivaAmount = valueAdded * 0.01;
      ivaNotes = 'Taxa especial de 1% para Cabinda';
      ivaFormula = `IVA = Valor Acrescentado × 1% = ${valueAdded.toLocaleString('pt-AO')} × 1% = ${ivaAmount.toLocaleString('pt-AO')} Kz`;
    } else {
      ivaNotes = 'Regime Geral: 14% (IVA vendas - IVA compras)';
      ivaFormula = `IVA = (Vendas - Compras) × 14% ≈ ${valueAdded.toLocaleString('pt-AO')} × 14% = ${ivaAmount.toLocaleString('pt-AO')} Kz`;
    }
  }
  
  taxCalculations.push({
    taxId: 'iva',
    taxName: 'IVA',
    abbreviation: 'IVA',
    baseValue: revenue,
    rate: ivaRate,
    estimatedAmount: ivaAmount,
    frequency: ivaRegime.id === 'iva_simplificado' ? 'trimestral' : 'mensal',
    notes: ivaNotes,
    formula: ivaFormula
  });

  // ========== IMPOSTO DE SELO ==========
  const seloAmount = revenue * 0.003;
  taxCalculations.push({
    taxId: 'imposto_selo',
    taxName: 'Imposto de Selo',
    abbreviation: 'IS',
    baseValue: revenue,
    rate: 0.003,
    estimatedAmount: seloAmount,
    frequency: 'pontual',
    notes: '0,3% sobre operações documentadas',
    formula: `IS = ${revenue.toLocaleString('pt-AO')} × 0,3% = ${seloAmount.toLocaleString('pt-AO')} Kz`
  });

  // ========== IRT E INSS (se tem trabalhadores) ==========
  if (employees > 0) {
    const employeeTaxes = taxes.filter(t => 
      ['irt', 'inss_entidade', 'inss_trabalhador', 'fundo_desemprego'].includes(t.id)
    );
    applicableTaxes.push(...employeeTaxes);

    const monthlyPayroll = averageSalary * employees;
    const annualPayroll = monthlyPayroll * 12;

    // IRT (isenção até 150.000 Kz)
    const irtCalc = calculateIRT(averageSalary);
    const annualIRT = irtCalc.amount * employees * 12;
    
    let irtNotes: string;
    let irtFormula: string;
    
    if (averageSalary <= 150000) {
      irtNotes = `Isento: salário médio de ${averageSalary.toLocaleString('pt-AO')} Kz ≤ 150.000 Kz`;
      irtFormula = 'IRT = 0 (Salários até 150.000 Kz são isentos)';
    } else {
      irtNotes = `Salário médio: ${averageSalary.toLocaleString('pt-AO')} Kz × ${employees} trabalhadores`;
      irtFormula = `${irtCalc.formula} × ${employees} trabalhadores × 12 meses = ${annualIRT.toLocaleString('pt-AO')} Kz/ano`;
    }
    
    taxCalculations.push({
      taxId: 'irt',
      taxName: 'IRT - Imposto sobre Rendimentos do Trabalho',
      abbreviation: 'IRT',
      baseValue: annualPayroll,
      rate: irtCalc.rate,
      estimatedAmount: annualIRT,
      frequency: 'mensal',
      notes: irtNotes,
      formula: irtFormula
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
      notes: 'Contribuição patronal: 8% sobre massa salarial',
      formula: `INSS-E = ${annualPayroll.toLocaleString('pt-AO')} × 8% = ${inssEntidade.toLocaleString('pt-AO')} Kz/ano`
    });

    // INSS Trabalhador (3%)
    const inssTrabalhador = annualPayroll * 0.03;
    taxCalculations.push({
      taxId: 'inss_trabalhador',
      taxName: 'INSS Trabalhador',
      abbreviation: 'INSS-T',
      baseValue: annualPayroll,
      rate: 0.03,
      estimatedAmount: inssTrabalhador,
      frequency: 'mensal',
      notes: 'Retenção sobre salários: 3%',
      formula: `INSS-T = ${annualPayroll.toLocaleString('pt-AO')} × 3% = ${inssTrabalhador.toLocaleString('pt-AO')} Kz/ano`
    });
  }

  // ========== IMPOSTO PREDIAL (se tem imóveis) ==========
  if (formData.hasAssets) {
    const assetTaxes = taxes.filter(t => 
      ['imposto_predial', 'sisa'].includes(t.id)
    );
    applicableTaxes.push(...assetTaxes);

    if (assetValue > 5000000) {
      const taxableValue = assetValue - 5000000;
      const ipAmount = taxableValue * 0.005;
      taxCalculations.push({
        taxId: 'imposto_predial',
        taxName: 'Imposto Predial',
        abbreviation: 'IP',
        baseValue: assetValue,
        rate: 0.005,
        estimatedAmount: ipAmount,
        frequency: 'anual',
        notes: 'Isento até 5M Kz; 0,5% sobre excedente',
        formula: `IP = (${assetValue.toLocaleString('pt-AO')} - 5.000.000) × 0,5% = ${ipAmount.toLocaleString('pt-AO')} Kz`
      });
    } else {
      taxCalculations.push({
        taxId: 'imposto_predial',
        taxName: 'Imposto Predial',
        abbreviation: 'IP',
        baseValue: assetValue,
        rate: 0,
        estimatedAmount: 0,
        frequency: 'anual',
        notes: 'Isento: valor patrimonial até 5 milhões Kz',
        formula: 'IP = 0 (Isento - valor até 5.000.000 Kz)'
      });
    }
  }

  // ========== DIREITOS ADUANEIROS (se importa) ==========
  if (formData.hasImportExport) {
    const importTaxes = taxes.filter(t => 
      ['direitos_aduaneiros', 'ice', 'taxa_servicos_aduaneiros'].includes(t.id)
    );
    applicableTaxes.push(...importTaxes);

    if (importValue > 0) {
      const daAmount = importValue * 0.15;
      taxCalculations.push({
        taxId: 'direitos_aduaneiros',
        taxName: 'Direitos Aduaneiros',
        abbreviation: 'DA',
        baseValue: importValue,
        rate: 0.15,
        estimatedAmount: daAmount,
        frequency: 'pontual',
        notes: 'Taxa média estimada: 15% sobre valor CIF',
        formula: `DA = ${importValue.toLocaleString('pt-AO')} × 15% = ${daAmount.toLocaleString('pt-AO')} Kz`
      });

      const tsaAmount = importValue * 0.02;
      taxCalculations.push({
        taxId: 'taxa_servicos_aduaneiros',
        taxName: 'Taxa Serviços Aduaneiros',
        abbreviation: 'TSA',
        baseValue: importValue,
        rate: 0.02,
        estimatedAmount: tsaAmount,
        frequency: 'pontual',
        notes: '2% sobre valor aduaneiro',
        formula: `TSA = ${importValue.toLocaleString('pt-AO')} × 2% = ${tsaAmount.toLocaleString('pt-AO')} Kz`
      });
    }
  }

  // ========== IVM - IMPOSTO SOBRE VEÍCULOS MOTORIZADOS ==========
  if (formData.hasVehicles) {
    const vehicleTaxes = taxes.filter(t => t.id === 'taxa_circulacao');
    applicableTaxes.push(...vehicleTaxes);
    
    taxCalculations.push({
      taxId: 'taxa_circulacao',
      taxName: 'Imposto sobre Veículos Motorizados',
      abbreviation: 'IVM',
      baseValue: 0,
      rate: 0,
      estimatedAmount: 50000,
      frequency: 'anual',
      notes: 'Valor varia conforme tipo e cilindrada do veículo',
      formula: 'IVM = Valor fixo por categoria de veículo (5.000 a 200.000 Kz)'
    });
  }

  // ========== IMPOSTOS ESPECÍFICOS POR SECTOR ==========
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
      const ctAmount = revenue * 0.02;
      taxCalculations.push({
        taxId: 'contribuicao_turismo',
        taxName: 'Contribuição para o Turismo',
        abbreviation: 'CT',
        baseValue: revenue,
        rate: 0.02,
        estimatedAmount: ctAmount,
        frequency: 'mensal',
        notes: '2% sobre facturação hoteleira',
        formula: `CT = ${revenue.toLocaleString('pt-AO')} × 2% = ${ctAmount.toLocaleString('pt-AO')} Kz`
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
  if (regime.id !== 'simplified' && regime.id !== 'exclusao') {
    const rfTax = taxes.find(t => t.id === 'retencao_fonte');
    if (rfTax && !applicableTaxes.find(t => t.id === 'retencao_fonte')) {
      applicableTaxes.push(rfTax);
    }
  }

  // ========== OBRIGAÇÕES FISCAIS ==========
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

  // Obrigações específicas
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
    industrialTaxRegime,
    ivaRegime,
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