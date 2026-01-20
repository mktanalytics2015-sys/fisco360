// Dados fiscais de Angola baseados no Código Geral Tributário (CGT)
// Atualizado conforme legislação vigente 2025/2026
// Fontes: AGT - Administração Geral Tributária, Decreto Presidencial 71/25

export interface TaxInfo {
  id: string;
  name: string;
  abbreviation: string;
  description: string;
  rate: string;
  rateValue?: number; // Taxa numérica para cálculos
  frequency: 'mensal' | 'trimestral' | 'anual' | 'pontual';
  applicableTo: string[];
  category: 'rendimento' | 'consumo' | 'patrimonio' | 'social' | 'especial';
  baseCalculo?: string; // Base de cálculo para o imposto
  formula?: string; // Fórmula de cálculo
}

export interface FiscalRegime {
  id: string;
  name: string;
  description: string;
  revenueRange: { min: number; max: number };
  characteristics: string[];
}

// Regimes de tributação para Imposto Industrial
export interface IndustrialTaxRegime {
  id: string;
  name: string;
  grupo: string;
  volumeNegociosMin: number;
  volumeNegociosMax: number;
  taxa: number;
  formula: string;
  descricao: string;
}

export const industrialTaxRegimes: IndustrialTaxRegime[] = [
  {
    id: 'ii_geral_grupo_a',
    name: 'Regime Geral - Grupo A',
    grupo: 'A',
    volumeNegociosMin: 2000000001,
    volumeNegociosMax: Infinity,
    taxa: 0.25,
    formula: 'II = Matéria Colectável × 25%',
    descricao: 'Grandes contribuintes com volume de negócios superior a 2 mil milhões Kz. Contabilidade organizada obrigatória.'
  },
  {
    id: 'ii_geral_grupo_b',
    name: 'Regime Geral - Grupo B',
    grupo: 'B',
    volumeNegociosMin: 350000001,
    volumeNegociosMax: 2000000000,
    taxa: 0.25,
    formula: 'II = Matéria Colectável × 25%',
    descricao: 'Contribuintes com volume de negócios entre 350 milhões e 2 mil milhões Kz. Contabilidade organizada obrigatória.'
  },
  {
    id: 'ii_simplificado_grupo_c',
    name: 'Regime Simplificado - Grupo C',
    grupo: 'C',
    volumeNegociosMin: 0,
    volumeNegociosMax: 350000000,
    taxa: 0.065,
    formula: 'II = Volume de Negócios × 6,5%',
    descricao: 'Pequenos contribuintes com volume de negócios até 350 milhões Kz. Tributação sobre volume de negócios.'
  }
];

// Regimes de tributação para IVA
export interface IvaRegime {
  id: string;
  name: string;
  volumeNegociosMin: number;
  volumeNegociosMax: number;
  taxa: number;
  formula: string;
  descricao: string;
  obrigacoes: string[];
}

export const ivaRegimes: IvaRegime[] = [
  {
    id: 'iva_geral',
    name: 'Regime Geral do IVA',
    volumeNegociosMin: 350000001,
    volumeNegociosMax: Infinity,
    taxa: 0.14,
    formula: 'IVA = (Vendas × 14%) - (Compras × 14%)',
    descricao: 'Volume de negócios acima de 350 milhões Kz. Método de dedução (crédito de imposto).',
    obrigacoes: [
      'Declaração mensal de IVA',
      'Software de facturação certificado obrigatório',
      'Contabilidade organizada'
    ]
  },
  {
    id: 'iva_simplificado',
    name: 'Regime Simplificado do IVA',
    volumeNegociosMin: 25000001,
    volumeNegociosMax: 350000000,
    taxa: 0.07,
    formula: 'IVA = Volume de Negócios × 7%',
    descricao: 'Volume de negócios entre 25 e 350 milhões Kz. Taxa reduzida de 7% sobre recebimentos.',
    obrigacoes: [
      'Declaração trimestral de IVA',
      'Software de facturação certificado obrigatório',
      'Pagamento até último dia útil do mês seguinte ao trimestre'
    ]
  },
  {
    id: 'iva_exclusao',
    name: 'Regime de Exclusão do IVA',
    volumeNegociosMin: 0,
    volumeNegociosMax: 25000000,
    taxa: 0,
    formula: 'IVA = 0 (Isento)',
    descricao: 'Volume de negócios até 25 milhões Kz. Não há obrigação de liquidar IVA.',
    obrigacoes: [
      'Pode emitir facturas em blocos impressos ou Portal do Contribuinte',
      'Máximo de 300 facturas/ano via Portal',
      'Sem obrigação de declaração de IVA'
    ]
  }
];

export const fiscalRegimes: FiscalRegime[] = [
  {
    id: 'exclusao',
    name: 'Regime de Exclusão',
    description: 'Para contribuintes com volume de negócios até 25 milhões Kz',
    revenueRange: { min: 0, max: 25000000 },
    characteristics: [
      'Isento de IVA',
      'Pode emitir facturas via Portal do Contribuinte',
      'Imposto Industrial: 6,5% sobre volume de negócios (Grupo C)',
      'Sem obrigação de contabilidade organizada',
      'Máximo 300 facturas/ano via Portal'
    ]
  },
  {
    id: 'simplified',
    name: 'Regime Simplificado',
    description: 'Para contribuintes com volume de negócios entre 25 milhões e 350 milhões Kz',
    revenueRange: { min: 25000001, max: 350000000 },
    characteristics: [
      'IVA à taxa de 7% sobre recebimentos',
      'Imposto Industrial de 6,5% sobre volume de negócios (Grupo C)',
      'Declaração trimestral de IVA',
      'Software de facturação certificado obrigatório',
      'Contabilidade simplificada'
    ]
  },
  {
    id: 'general',
    name: 'Regime Geral',
    description: 'Regime aplicável a empresas com volume de negócios entre 350 milhões e 2 mil milhões Kz',
    revenueRange: { min: 350000001, max: 2000000000 },
    characteristics: [
      'IVA à taxa normal de 14% (método de dedução)',
      'Imposto Industrial: 25% sobre matéria colectável (Grupo B)',
      'Declarações mensais de IVA',
      'Contabilidade organizada obrigatória',
      'Pagamento por conta trimestral do II'
    ]
  },
  {
    id: 'large_taxpayers',
    name: 'Regime dos Grandes Contribuintes',
    description: 'Para empresas com volume de negócios acima de 2 mil milhões Kz',
    revenueRange: { min: 2000000001, max: Infinity },
    characteristics: [
      'IVA à taxa normal de 14% (método de dedução)',
      'Imposto Industrial: 25% sobre matéria colectável (Grupo A)',
      'Acompanhamento fiscal permanente pela AGT',
      'Representante fiscal obrigatório',
      'Auditoria fiscal regular'
    ]
  }
];

export const taxes: TaxInfo[] = [
  // ========== IMPOSTOS SOBRE RENDIMENTO ==========
  {
    id: 'imposto_industrial',
    name: 'Imposto Industrial',
    abbreviation: 'II',
    description: 'Imposto sobre os lucros das empresas comerciais, industriais e agrícolas',
    rate: '25% (geral) | 15% (agricultura) | 35% (sector financeiro/telecom) | 6,5% (Grupo C)',
    rateValue: 0.25,
    frequency: 'anual',
    applicableTo: ['comercio', 'industria', 'servicos', 'agricultura'],
    category: 'rendimento',
    baseCalculo: 'Matéria colectável (lucro tributável)'
  },
  {
    id: 'irt',
    name: 'Imposto sobre Rendimentos do Trabalho',
    abbreviation: 'IRT',
    description: 'Imposto retido na fonte sobre salários, ordenados e remunerações',
    rate: 'Progressivo: 0% (até 100.000 Kz) a 25% (acima 2.500.000 Kz)',
    rateValue: 0.17, // Taxa média estimada
    frequency: 'mensal',
    applicableTo: ['all'],
    category: 'rendimento',
    baseCalculo: 'Total de remunerações brutas dos trabalhadores'
  },
  {
    id: 'iac',
    name: 'Imposto sobre Aplicação de Capitais',
    abbreviation: 'IAC',
    description: 'Imposto sobre juros, dividendos, royalties e outros rendimentos de capitais',
    rate: '10% (juros, dividendos) | 15% (royalties) | 5% (títulos do Estado)',
    rateValue: 0.10,
    frequency: 'pontual',
    applicableTo: ['financeiro', 'investimentos'],
    category: 'rendimento',
    baseCalculo: 'Valor bruto dos rendimentos de capitais'
  },
  {
    id: 'retencao_fonte',
    name: 'Retenção na Fonte',
    abbreviation: 'RF',
    description: 'Retenção sobre pagamentos a terceiros por serviços prestados',
    rate: '6,5% (residentes) | 15% (não residentes)',
    rateValue: 0.065,
    frequency: 'mensal',
    applicableTo: ['servicos', 'all'],
    category: 'rendimento',
    baseCalculo: 'Valor dos serviços contratados a terceiros'
  },

  // ========== IMPOSTOS SOBRE CONSUMO ==========
  {
    id: 'iva',
    name: 'Imposto sobre o Valor Acrescentado',
    abbreviation: 'IVA',
    description: 'Imposto sobre o consumo de bens e prestação de serviços',
    rate: '14% (normal) | 7% (simplificado) | 5% (bens alimentares) | 1% (Cabinda) | 0% (exportações)',
    rateValue: 0.14,
    frequency: 'mensal',
    applicableTo: ['comercio', 'industria', 'servicos'],
    category: 'consumo',
    baseCalculo: 'Volume de vendas e serviços prestados'
  },
  {
    id: 'ice',
    name: 'Imposto Especial de Consumo',
    abbreviation: 'IEC',
    description: 'Imposto sobre tabaco, bebidas alcoólicas, combustíveis, veículos de luxo',
    rate: '2% a 30% (conforme produto) | Até 100% (tabaco)',
    rateValue: 0.15,
    frequency: 'mensal',
    applicableTo: ['importacao', 'producao_especial'],
    category: 'consumo',
    baseCalculo: 'Valor CIF + Direitos Aduaneiros (importação) ou Preço de fábrica (produção)'
  },
  {
    id: 'imposto_selo',
    name: 'Imposto de Selo',
    abbreviation: 'IS',
    description: 'Imposto sobre contratos, documentos, operações bancárias e financeiras',
    rate: '0,1% a 1% (operações) | 0,3% (cheques) | Valores fixos (documentos)',
    rateValue: 0.005,
    frequency: 'pontual',
    applicableTo: ['all'],
    category: 'consumo',
    baseCalculo: 'Valor das operações documentadas'
  },
  {
    id: 'imposto_jogo',
    name: 'Imposto Especial sobre o Jogo',
    abbreviation: 'IEJ',
    description: 'Imposto sobre receitas de casinos, apostas e jogos de fortuna ou azar',
    rate: '15% a 25% (conforme tipo de jogo)',
    rateValue: 0.20,
    frequency: 'mensal',
    applicableTo: ['turismo', 'entretenimento'],
    category: 'consumo',
    baseCalculo: 'Receita bruta do jogo'
  },

  // ========== IMPOSTOS SOBRE PATRIMÓNIO ==========
  {
    id: 'imposto_predial',
    name: 'Imposto Predial',
    abbreviation: 'IP',
    description: 'Imposto sobre propriedade de imóveis (substitui antigo IPU)',
    rate: 'Isento até 5M Kz | 5.000 Kz até 6M Kz | 0,5% acima de 5M Kz (não arrendado) | 15% efectivo (arrendado)',
    rateValue: 0.005,
    frequency: 'anual',
    applicableTo: ['imobiliario'],
    category: 'patrimonio',
    baseCalculo: 'Valor patrimonial do imóvel ou rendas recebidas'
  },
  {
    id: 'sisa',
    name: 'Imposto sobre Transmissão de Imóveis',
    abbreviation: 'SISA',
    description: 'Imposto sobre compra, venda e permuta de imóveis',
    rate: '2% (valor até 60M Kz) | Taxas progressivas até 10%',
    rateValue: 0.02,
    frequency: 'pontual',
    applicableTo: ['imobiliario'],
    category: 'patrimonio',
    baseCalculo: 'Valor de transmissão do imóvel'
  },
  {
    id: 'imposto_sucessoes',
    name: 'Imposto sobre Sucessões e Doações',
    abbreviation: 'ISD',
    description: 'Imposto sobre heranças e doações de bens',
    rate: '10% a 30% (conforme grau de parentesco)',
    rateValue: 0.15,
    frequency: 'pontual',
    applicableTo: ['all'],
    category: 'patrimonio',
    baseCalculo: 'Valor dos bens transmitidos'
  },

  // ========== CONTRIBUIÇÕES SOCIAIS ==========
  {
    id: 'inss_entidade',
    name: 'Segurança Social - Entidade Empregadora',
    abbreviation: 'INSS-E',
    description: 'Contribuição patronal obrigatória para o Instituto Nacional de Segurança Social',
    rate: '8% sobre remunerações',
    rateValue: 0.08,
    frequency: 'mensal',
    applicableTo: ['all'],
    category: 'social',
    baseCalculo: 'Total de remunerações brutas dos trabalhadores'
  },
  {
    id: 'inss_trabalhador',
    name: 'Segurança Social - Trabalhador',
    abbreviation: 'INSS-T',
    description: 'Contribuição do trabalhador retida pela entidade empregadora',
    rate: '3% sobre remuneração',
    rateValue: 0.03,
    frequency: 'mensal',
    applicableTo: ['all'],
    category: 'social',
    baseCalculo: 'Remuneração bruta de cada trabalhador'
  },
  {
    id: 'fundo_desemprego',
    name: 'Contribuição para Fundo de Desemprego',
    abbreviation: 'FD',
    description: 'Contribuição para proteção social em caso de desemprego',
    rate: '3% (entidade) + 3% (trabalhador)',
    rateValue: 0.03,
    frequency: 'mensal',
    applicableTo: ['all'],
    category: 'social',
    baseCalculo: 'Total de remunerações brutas'
  },

  // ========== IMPOSTOS ESPECIAIS ==========
  {
    id: 'direitos_aduaneiros',
    name: 'Direitos Aduaneiros de Importação',
    abbreviation: 'DA',
    description: 'Impostos sobre importação de mercadorias conforme pauta aduaneira',
    rate: '2% (matérias-primas) a 50% (bens de luxo) | Média: 10-20%',
    rateValue: 0.15,
    frequency: 'pontual',
    applicableTo: ['importacao'],
    category: 'especial',
    baseCalculo: 'Valor CIF (Custo + Seguro + Frete)'
  },
  {
    id: 'taxa_servicos_aduaneiros',
    name: 'Taxa de Serviços Aduaneiros',
    abbreviation: 'TSA',
    description: 'Taxa pelos serviços prestados pelas alfândegas',
    rate: '2% sobre valor aduaneiro',
    rateValue: 0.02,
    frequency: 'pontual',
    applicableTo: ['importacao', 'exportacao'],
    category: 'especial',
    baseCalculo: 'Valor aduaneiro das mercadorias'
  },
  {
    id: 'taxa_circulacao',
    name: 'Imposto sobre Veículos Motorizados',
    abbreviation: 'IVM',
    description: 'Imposto anual sobre veículos automóveis matriculados em Angola',
    rate: 'Variável: 5.000 Kz (motociclos) a 200.000 Kz (veículos de luxo)',
    rateValue: 0,
    frequency: 'anual',
    applicableTo: ['transporte', 'veiculos'],
    category: 'especial',
    baseCalculo: 'Tipo e cilindrada do veículo'
  },
  {
    id: 'imposto_petroleo',
    name: 'Imposto sobre a Produção de Petróleo',
    abbreviation: 'IPP',
    description: 'Imposto sobre a produção e exportação de petróleo e gás',
    rate: '20% (royalties) + 50% (lucro do petróleo)',
    rateValue: 0.50,
    frequency: 'trimestral',
    applicableTo: ['petroleo', 'energia'],
    category: 'especial',
    baseCalculo: 'Valor da produção de petróleo'
  },
  {
    id: 'imposto_mineiro',
    name: 'Imposto sobre Recursos Minerais',
    abbreviation: 'IRM',
    description: 'Royalties sobre extracção de diamantes e outros minerais',
    rate: '5% (minerais industriais) a 10% (diamantes e pedras preciosas)',
    rateValue: 0.05,
    frequency: 'mensal',
    applicableTo: ['mineracao'],
    category: 'especial',
    baseCalculo: 'Valor de mercado dos minerais extraídos'
  },
  {
    id: 'taxa_ambiental',
    name: 'Taxa de Licenciamento Ambiental',
    abbreviation: 'TLA',
    description: 'Taxa para licenciamento de actividades com impacto ambiental',
    rate: 'Variável conforme categoria de impacto',
    rateValue: 0,
    frequency: 'anual',
    applicableTo: ['industria', 'mineracao', 'petroleo'],
    category: 'especial',
    baseCalculo: 'Categoria de risco ambiental da actividade'
  },
  {
    id: 'contribuicao_turismo',
    name: 'Contribuição para o Turismo',
    abbreviation: 'CT',
    description: 'Taxa sobre estabelecimentos hoteleiros e turísticos',
    rate: '2% sobre facturação hoteleira',
    rateValue: 0.02,
    frequency: 'mensal',
    applicableTo: ['turismo'],
    category: 'especial',
    baseCalculo: 'Volume de facturação de serviços turísticos'
  }
];

export interface FiscalObligation {
  id: string;
  name: string;
  description: string;
  deadline: string;
  frequency: 'mensal' | 'trimestral' | 'anual';
  applicableTo: string[];
}

// Prazos oficiais conforme Calendário Fiscal da AGT 2026
// Fontes: Lei n.º 14/25 (OGE 2026), Circular n.º 1/GACA/GJ/AGT/2026, Lei n.º 19/14 (CII)
export const fiscalObligations: FiscalObligation[] = [
  // ========== OBRIGAÇÕES MENSAIS ==========
  {
    id: 'declaracao_iva',
    name: 'Declaração Periódica de IVA',
    description: 'Entrega da declaração mensal de IVA e pagamento do imposto (Regime Geral)',
    deadline: 'Até ao último dia útil do mês seguinte ao período de tributação',
    frequency: 'mensal',
    applicableTo: ['general', 'large_taxpayers']
  },
  {
    id: 'retencao_irt',
    name: 'Retenção e Entrega do IRT',
    description: 'Retenção na fonte do IRT sobre salários e remunerações e entrega à AGT',
    deadline: 'Até ao último dia do mês seguinte ao do pagamento ou colocação à disposição',
    frequency: 'mensal',
    applicableTo: ['all']
  },
  {
    id: 'contribuicao_inss',
    name: 'Pagamento das Contribuições ao INSS',
    description: 'Entrega das contribuições patronais (8%) e dos trabalhadores (3%) ao INSS',
    deadline: 'Até ao último dia do mês seguinte ao pagamento de salários',
    frequency: 'mensal',
    applicableTo: ['all']
  },
  {
    id: 'retencao_fonte_servicos',
    name: 'Retenção na Fonte sobre Serviços',
    description: 'Entrega da retenção de 6,5% sobre serviços prestados por terceiros',
    deadline: 'Até ao último dia do mês seguinte ao do pagamento',
    frequency: 'mensal',
    applicableTo: ['general', 'large_taxpayers']
  },
  {
    id: 'declaracao_iec',
    name: 'Declaração de Imposto Especial de Consumo',
    description: 'Declaração mensal para produtores e importadores de bens sujeitos a IEC',
    deadline: 'Até ao dia 20 do mês seguinte',
    frequency: 'mensal',
    applicableTo: ['importacao', 'producao_especial']
  },

  // ========== OBRIGAÇÕES TRIMESTRAIS ==========
  {
    id: 'pagamento_conta_ii',
    name: 'Pagamento por Conta do Imposto Industrial',
    description: 'Pagamento antecipado do II (três prestações iguais baseadas no imposto do ano anterior)',
    deadline: 'Até ao último dia útil dos meses de Abril, Julho e Outubro',
    frequency: 'trimestral',
    applicableTo: ['general', 'large_taxpayers']
  },
  {
    id: 'declaracao_simplificada',
    name: 'Declaração e Pagamento do Regime Simplificado',
    description: 'Declaração trimestral e pagamento de 6,5% sobre o volume de negócios',
    deadline: 'Até ao último dia útil do mês seguinte ao trimestre (Abril, Julho, Outubro, Janeiro)',
    frequency: 'trimestral',
    applicableTo: ['simplified']
  },
  {
    id: 'relatorio_estatistico',
    name: 'Relatório Estatístico Trimestral',
    description: 'Entrega de informação estatística à AGT (grandes contribuintes)',
    deadline: 'Até 30 dias após o término de cada trimestre',
    frequency: 'trimestral',
    applicableTo: ['large_taxpayers']
  },

  // ========== OBRIGAÇÕES ANUAIS ==========
  {
    id: 'declaracao_modelo1_grupoA',
    name: 'Declaração Modelo 1 - Grupo A',
    description: 'Declaração anual do Imposto Industrial para contribuintes do Grupo A',
    deadline: 'Até 31 de Maio do ano seguinte ao exercício fiscal',
    frequency: 'anual',
    applicableTo: ['large_taxpayers']
  },
  {
    id: 'declaracao_modelo1_grupoB',
    name: 'Declaração Modelo 1 - Grupo B',
    description: 'Declaração anual do Imposto Industrial para contribuintes do Grupo B',
    deadline: 'Até 30 de Abril do ano seguinte ao exercício fiscal',
    frequency: 'anual',
    applicableTo: ['general']
  },
  {
    id: 'declaracao_modelo1_grupoC',
    name: 'Declaração Modelo 1 - Grupo C',
    description: 'Declaração anual do Imposto Industrial para pequenos contribuintes',
    deadline: 'Até 31 de Março do ano seguinte ao exercício fiscal',
    frequency: 'anual',
    applicableTo: ['simplified']
  },
  {
    id: 'declaracao_modelo2_irt',
    name: 'Declaração Modelo 2 - IRT Anual',
    description: 'Declaração anual de rendimentos do trabalho pagos e IRT retido',
    deadline: 'Até ao último dia de Fevereiro do ano seguinte',
    frequency: 'anual',
    applicableTo: ['all']
  },
  {
    id: 'relatorio_contas',
    name: 'Relatório e Contas Anuais',
    description: 'Apresentação do relatório de gestão, balanço e demonstração de resultados',
    deadline: 'Até 31 de Março do ano seguinte ao exercício fiscal',
    frequency: 'anual',
    applicableTo: ['general', 'large_taxpayers']
  },
  {
    id: 'dossier_fiscal',
    name: 'Organização do Dossier Fiscal',
    description: 'Preparação e arquivo do dossier fiscal com toda documentação contabilística',
    deadline: 'Até 30 de Junho do ano seguinte ao exercício fiscal',
    frequency: 'anual',
    applicableTo: ['general', 'large_taxpayers']
  },
  {
    id: 'mapa_pessoal',
    name: 'Mapa de Pessoal',
    description: 'Entrega do mapa anual de trabalhadores ao Ministério do Trabalho',
    deadline: 'Até 31 de Janeiro de cada ano',
    frequency: 'anual',
    applicableTo: ['all']
  },
  {
    id: 'taxa_circulacao',
    name: 'Pagamento da Taxa de Circulação',
    description: 'Pagamento anual da taxa de circulação de veículos automóveis',
    deadline: 'Até 31 de Janeiro de cada ano',
    frequency: 'anual',
    applicableTo: ['veiculos']
  },
  {
    id: 'declaracao_imposto_predial',
    name: 'Declaração de Imposto Predial',
    description: 'Declaração anual de imóveis e rendas auferidas',
    deadline: 'Até 31 de Janeiro do ano seguinte',
    frequency: 'anual',
    applicableTo: ['imobiliario']
  },
  {
    id: 'inventario_anual',
    name: 'Inventário Anual de Existências',
    description: 'Levantamento e registo das existências em armazém',
    deadline: 'Até 31 de Dezembro de cada ano',
    frequency: 'anual',
    applicableTo: ['comercio', 'industria']
  }
];

export const provinces = [
  'Bengo', 'Benguela', 'Bié', 'Cabinda', 'Cuando Cubango',
  'Cuanza Norte', 'Cuanza Sul', 'Cunene', 'Huambo', 'Huíla',
  'Luanda', 'Lunda Norte', 'Lunda Sul', 'Malanje', 'Moxico',
  'Namibe', 'Uíge', 'Zaire'
];

export const companyTypes = [
  { id: 'unipessoal', name: 'Empresa Unipessoal', description: 'Empresa individual de responsabilidade limitada' },
  { id: 'lda', name: 'Sociedade por Quotas (Lda)', description: 'Sociedade comercial por quotas' },
  { id: 'sa', name: 'Sociedade Anónima (S.A.)', description: 'Sociedade de capital aberto' },
  { id: 'cooperativa', name: 'Cooperativa', description: 'Organização cooperativa' },
  { id: 'ong', name: 'ONG / Associação', description: 'Organização sem fins lucrativos' },
  { id: 'sucursal', name: 'Sucursal de Empresa Estrangeira', description: 'Representação de empresa estrangeira em Angola' }
];

export const activityTypes = [
  { id: 'comercio', name: 'Comércio', description: 'Compra e venda de mercadorias' },
  { id: 'industria', name: 'Indústria', description: 'Transformação de matérias-primas' },
  { id: 'servicos', name: 'Prestação de Serviços', description: 'Serviços a terceiros' },
  { id: 'agricultura', name: 'Agricultura e Pecuária', description: 'Produção agrícola e animal' },
  { id: 'construcao', name: 'Construção Civil', description: 'Obras e construções' },
  { id: 'transporte', name: 'Transporte e Logística', description: 'Transporte de pessoas ou mercadorias' },
  { id: 'financeiro', name: 'Serviços Financeiros', description: 'Actividades bancárias e seguros' },
  { id: 'imobiliario', name: 'Imobiliário', description: 'Compra, venda e arrendamento de imóveis' },
  { id: 'tecnologia', name: 'Tecnologia e Telecomunicações', description: 'TI, software e telecomunicações' },
  { id: 'saude', name: 'Saúde', description: 'Serviços médicos e farmacêuticos' },
  { id: 'educacao', name: 'Educação', description: 'Ensino e formação' },
  { id: 'turismo', name: 'Turismo e Hotelaria', description: 'Hotéis, restaurantes e turismo' },
  { id: 'petroleo', name: 'Petróleo e Gás', description: 'Exploração e produção petrolífera' },
  { id: 'mineracao', name: 'Mineração', description: 'Extracção de minerais e diamantes' },
  { id: 'entretenimento', name: 'Entretenimento', description: 'Media, eventos e lazer' }
];

// Tabela de IRT para cálculo - Atualizada 2025/2026
// Isenção até 150.000 Kz conforme legislação vigente
export const irtBrackets = [
  { min: 0, max: 150000, rate: 0, deduction: 0, descricao: 'Isento' },
  { min: 150001, max: 200000, rate: 0.13, deduction: 19500, descricao: '13%' },
  { min: 200001, max: 300000, rate: 0.16, deduction: 25500, descricao: '16%' },
  { min: 300001, max: 500000, rate: 0.18, deduction: 31500, descricao: '18%' },
  { min: 500001, max: 1000000, rate: 0.19, deduction: 36500, descricao: '19%' },
  { min: 1000001, max: 1500000, rate: 0.20, deduction: 46500, descricao: '20%' },
  { min: 1500001, max: 2000000, rate: 0.21, deduction: 61500, descricao: '21%' },
  { min: 2000001, max: 2500000, rate: 0.22, deduction: 81500, descricao: '22%' },
  { min: 2500001, max: 5000000, rate: 0.23, deduction: 106500, descricao: '23%' },
  { min: 5000001, max: Infinity, rate: 0.25, deduction: 206500, descricao: '25%' }
];

// Fórmula de cálculo do IRT
export const irtFormula = 'IRT = (Salário Bruto × Taxa) - Dedução';
