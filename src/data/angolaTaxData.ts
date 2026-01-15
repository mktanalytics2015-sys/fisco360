// Dados fiscais de Angola baseados no Código Geral Tributário

export interface TaxInfo {
  id: string;
  name: string;
  abbreviation: string;
  description: string;
  rate: string;
  frequency: 'mensal' | 'trimestral' | 'anual' | 'pontual';
  applicableTo: string[];
  category: 'rendimento' | 'consumo' | 'patrimonio' | 'social' | 'especial';
}

export interface FiscalRegime {
  id: string;
  name: string;
  description: string;
  revenueRange: { min: number; max: number };
  characteristics: string[];
}

export const fiscalRegimes: FiscalRegime[] = [
  {
    id: 'simplified',
    name: 'Regime Simplificado',
    description: 'Para pequenos contribuintes com volume de negócios reduzido',
    revenueRange: { min: 0, max: 10000000 },
    characteristics: [
      'Contabilidade simplificada',
      'Pagamento trimestral',
      'Menos obrigações declarativas',
      'Taxa fixa de 6,5% sobre o volume de negócios'
    ]
  },
  {
    id: 'general',
    name: 'Regime Geral',
    description: 'Regime aplicável à maioria das empresas',
    revenueRange: { min: 10000001, max: 500000000 },
    characteristics: [
      'Contabilidade organizada obrigatória',
      'Declarações mensais de IVA',
      'Pagamento por conta trimestral',
      'Auditoria fiscal possível'
    ]
  },
  {
    id: 'large_taxpayers',
    name: 'Regime dos Grandes Contribuintes',
    description: 'Para empresas com elevado volume de negócios',
    revenueRange: { min: 500000001, max: Infinity },
    characteristics: [
      'Acompanhamento fiscal permanente',
      'Obrigações declarativas reforçadas',
      'Representante fiscal obrigatório',
      'Auditoria fiscal regular'
    ]
  }
];

export const taxes: TaxInfo[] = [
  // Impostos sobre Rendimento
  {
    id: 'imposto_industrial',
    name: 'Imposto Industrial',
    abbreviation: 'II',
    description: 'Imposto sobre os lucros das empresas comerciais e industriais',
    rate: '25% (geral) / 15% (agricultura, silvicultura e pecuária)',
    frequency: 'anual',
    applicableTo: ['comercio', 'industria', 'servicos', 'agricultura'],
    category: 'rendimento'
  },
  {
    id: 'irt',
    name: 'Imposto sobre Rendimentos do Trabalho',
    abbreviation: 'IRT',
    description: 'Imposto retido na fonte sobre salários e remunerações',
    rate: 'Progressivo: 0% a 25%',
    frequency: 'mensal',
    applicableTo: ['all'],
    category: 'rendimento'
  },
  {
    id: 'iac',
    name: 'Imposto sobre Aplicação de Capitais',
    abbreviation: 'IAC',
    description: 'Imposto sobre rendimentos de investimentos e aplicações financeiras',
    rate: '10% a 15%',
    frequency: 'pontual',
    applicableTo: ['financeiro', 'investimentos'],
    category: 'rendimento'
  },
  
  // Impostos sobre Consumo
  {
    id: 'iva',
    name: 'Imposto sobre o Valor Acrescentado',
    abbreviation: 'IVA',
    description: 'Imposto sobre o consumo de bens e serviços',
    rate: '14% (normal) / 5% (reduzida) / 0% (isenta)',
    frequency: 'mensal',
    applicableTo: ['comercio', 'industria', 'servicos'],
    category: 'consumo'
  },
  {
    id: 'ice',
    name: 'Imposto Especial de Consumo',
    abbreviation: 'IEC',
    description: 'Imposto sobre produtos específicos (tabaco, álcool, combustíveis)',
    rate: 'Variável por produto',
    frequency: 'mensal',
    applicableTo: ['importacao', 'producao_especial'],
    category: 'consumo'
  },
  {
    id: 'imposto_selo',
    name: 'Imposto de Selo',
    abbreviation: 'IS',
    description: 'Imposto sobre actos jurídicos documentados e operações financeiras',
    rate: '0,1% a 1%',
    frequency: 'pontual',
    applicableTo: ['all'],
    category: 'consumo'
  },
  
  // Impostos sobre Património
  {
    id: 'ipu',
    name: 'Imposto Predial Urbano',
    abbreviation: 'IPU',
    description: 'Imposto sobre propriedades urbanas',
    rate: '0,5% (rendas) / 25% (rendimento)',
    frequency: 'anual',
    applicableTo: ['imobiliario'],
    category: 'patrimonio'
  },
  {
    id: 'sisa',
    name: 'SISA',
    abbreviation: 'SISA',
    description: 'Imposto sobre transmissão onerosa de imóveis',
    rate: '2%',
    frequency: 'pontual',
    applicableTo: ['imobiliario'],
    category: 'patrimonio'
  },
  
  // Contribuições Sociais
  {
    id: 'inss_entidade',
    name: 'Segurança Social (Entidade Empregadora)',
    abbreviation: 'INSS-E',
    description: 'Contribuição patronal para a segurança social',
    rate: '8%',
    frequency: 'mensal',
    applicableTo: ['all'],
    category: 'social'
  },
  {
    id: 'inss_trabalhador',
    name: 'Segurança Social (Trabalhador)',
    abbreviation: 'INSS-T',
    description: 'Contribuição do trabalhador para a segurança social',
    rate: '3%',
    frequency: 'mensal',
    applicableTo: ['all'],
    category: 'social'
  },
  
  // Impostos Especiais
  {
    id: 'direitos_aduaneiros',
    name: 'Direitos Aduaneiros',
    abbreviation: 'DA',
    description: 'Impostos sobre importação de mercadorias',
    rate: '2% a 50% (conforme pauta)',
    frequency: 'pontual',
    applicableTo: ['importacao'],
    category: 'especial'
  },
  {
    id: 'taxa_circulacao',
    name: 'Taxa de Circulação',
    abbreviation: 'TC',
    description: 'Taxa sobre veículos automóveis',
    rate: 'Variável por tipo de veículo',
    frequency: 'anual',
    applicableTo: ['transporte', 'veiculos'],
    category: 'especial'
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

export const fiscalObligations: FiscalObligation[] = [
  // Obrigações Mensais
  {
    id: 'declaracao_iva',
    name: 'Declaração Periódica de IVA',
    description: 'Entrega da declaração mensal de IVA',
    deadline: 'Até ao último dia útil do mês seguinte',
    frequency: 'mensal',
    applicableTo: ['general', 'large_taxpayers']
  },
  {
    id: 'retencao_irt',
    name: 'Retenção e Entrega do IRT',
    description: 'Retenção na fonte e entrega do IRT dos trabalhadores',
    deadline: 'Até ao dia 15 do mês seguinte',
    frequency: 'mensal',
    applicableTo: ['all']
  },
  {
    id: 'contribuicao_inss',
    name: 'Contribuição INSS',
    description: 'Pagamento das contribuições para a Segurança Social',
    deadline: 'Até ao dia 15 do mês seguinte',
    frequency: 'mensal',
    applicableTo: ['all']
  },
  
  // Obrigações Trimestrais
  {
    id: 'pagamento_conta_ii',
    name: 'Pagamento por Conta do Imposto Industrial',
    description: 'Pagamento antecipado do Imposto Industrial',
    deadline: 'Até ao último dia do mês seguinte ao trimestre',
    frequency: 'trimestral',
    applicableTo: ['general', 'large_taxpayers']
  },
  {
    id: 'declaracao_simplificada',
    name: 'Declaração Trimestral Simplificada',
    description: 'Declaração e pagamento para regime simplificado',
    deadline: 'Até ao último dia do mês seguinte ao trimestre',
    frequency: 'trimestral',
    applicableTo: ['simplified']
  },
  
  // Obrigações Anuais
  {
    id: 'declaracao_modelo1',
    name: 'Declaração Modelo 1 de Imposto Industrial',
    description: 'Declaração anual de rendimentos empresariais',
    deadline: 'Até 31 de Maio do ano seguinte',
    frequency: 'anual',
    applicableTo: ['general', 'large_taxpayers']
  },
  {
    id: 'relatorio_contas',
    name: 'Relatório e Contas',
    description: 'Apresentação do relatório e contas anuais',
    deadline: 'Até 31 de Março do ano seguinte',
    frequency: 'anual',
    applicableTo: ['general', 'large_taxpayers']
  },
  {
    id: 'mapa_pessoal',
    name: 'Mapa de Pessoal',
    description: 'Entrega do mapa de pessoal anual',
    deadline: 'Até 31 de Janeiro do ano seguinte',
    frequency: 'anual',
    applicableTo: ['all']
  },
  {
    id: 'taxa_circulacao',
    name: 'Pagamento da Taxa de Circulação',
    description: 'Pagamento anual da taxa de circulação de veículos',
    deadline: 'Até 31 de Janeiro de cada ano',
    frequency: 'anual',
    applicableTo: ['veiculos']
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
  { id: 'ong', name: 'ONG / Associação', description: 'Organização sem fins lucrativos' }
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
  { id: 'turismo', name: 'Turismo e Hotelaria', description: 'Hotéis, restaurantes e turismo' }
];
