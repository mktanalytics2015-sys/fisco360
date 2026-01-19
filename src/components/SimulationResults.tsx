import { CheckCircle, AlertTriangle, FileText, Calendar, Clock, BadgePercent, Building, ChevronDown, ChevronUp, Printer, Calculator, TrendingUp } from 'lucide-react';
import { useState } from 'react';
import { TaxInfo, FiscalObligation, FiscalRegime } from '@/data/angolaTaxData';
import { TaxCalculation } from '@/utils/fiscalCalculator';
import { openPrintableReport } from '@/utils/pdfGenerator';
import { Button } from '@/components/ui/button';

interface SimulationResultsProps {
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

const SimulationResults = ({ 
  regime, 
  applicableTaxes,
  taxCalculations,
  obligations,
  formattedRevenue,
  employeeCount,
  totalAnnualTaxEstimate
}: SimulationResultsProps) => {
  const [expandedSections, setExpandedSections] = useState({
    calculations: true,
    taxes: true,
    monthly: true,
    quarterly: true,
    annual: true
  });

  const toggleSection = (section: keyof typeof expandedSections) => {
    setExpandedSections(prev => ({ ...prev, [section]: !prev[section] }));
  };

  const getCategoryColor = (category: TaxInfo['category']) => {
    switch (category) {
      case 'rendimento': return 'bg-blue-100 text-blue-800';
      case 'consumo': return 'bg-green-100 text-green-800';
      case 'patrimonio': return 'bg-purple-100 text-purple-800';
      case 'social': return 'bg-orange-100 text-orange-800';
      case 'especial': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

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

  const formatCurrency = (value: number) => {
    return value.toLocaleString('pt-AO', { minimumFractionDigits: 0, maximumFractionDigits: 0 }) + ' Kz';
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Regime Fiscal Recomendado */}
      <div className="card-elevated p-6 border-l-4 border-l-success">
        <div className="flex items-start gap-4">
          <div className="p-3 rounded-full bg-success/10">
            <CheckCircle className="w-8 h-8 text-success" />
          </div>
          <div className="flex-1">
            <h3 className="text-xl font-display font-bold text-foreground mb-2">
              {regime.name}
            </h3>
            <p className="text-muted-foreground mb-4">{regime.description}</p>
            
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div className="p-3 rounded-lg bg-muted">
                <p className="text-xs text-muted-foreground">Volume de Negócios</p>
                <p className="font-semibold text-foreground">{formattedRevenue} Kz</p>
              </div>
              <div className="p-3 rounded-lg bg-muted">
                <p className="text-xs text-muted-foreground">Trabalhadores</p>
                <p className="font-semibold text-foreground">{employeeCount}</p>
              </div>
            </div>

            <div className="space-y-2">
              <p className="text-sm font-medium text-foreground">Características:</p>
              <ul className="space-y-1">
                {regime.characteristics.map((char, index) => (
                  <li key={index} className="flex items-center gap-2 text-sm text-muted-foreground">
                    <span className="w-1.5 h-1.5 rounded-full bg-accent" />
                    {char}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Cálculo Estimado de Impostos */}
      {taxCalculations.length > 0 && (
        <div className="card-elevated overflow-hidden border-2 border-accent/30">
          <button
            onClick={() => toggleSection('calculations')}
            className="w-full p-4 flex items-center justify-between bg-accent/10 hover:bg-accent/20 transition-colors"
          >
            <div className="flex items-center gap-3">
              <Calculator className="w-5 h-5 text-accent" />
              <span className="font-semibold text-foreground">
                Cálculo Estimado de Impostos
              </span>
            </div>
            {expandedSections.calculations ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
          </button>
          
          {expandedSections.calculations && (
            <div className="p-4">
              {/* Total Estimado */}
              <div className="mb-4 p-4 rounded-lg bg-gradient-to-r from-accent/20 to-accent/5 border border-accent/30">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-accent" />
                    <span className="font-medium text-foreground">Total Anual Estimado</span>
                  </div>
                  <span className="text-2xl font-bold text-accent">
                    {formatCurrency(totalAnnualTaxEstimate)}
                  </span>
                </div>
              </div>

              {/* Tabela de Cálculos */}
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="text-left py-2 px-2 font-medium text-muted-foreground">Imposto</th>
                      <th className="text-right py-2 px-2 font-medium text-muted-foreground">Base</th>
                      <th className="text-right py-2 px-2 font-medium text-muted-foreground">Taxa</th>
                      <th className="text-right py-2 px-2 font-medium text-muted-foreground">Valor Est.</th>
                    </tr>
                  </thead>
                  <tbody>
                    {taxCalculations.map((calc) => (
                      <tr key={calc.taxId} className="border-b border-border/50 hover:bg-muted/50">
                        <td className="py-3 px-2">
                          <div>
                            <span className="font-medium text-foreground">{calc.abbreviation}</span>
                            <p className="text-xs text-muted-foreground">{calc.notes}</p>
                          </div>
                        </td>
                        <td className="text-right py-3 px-2 text-muted-foreground">
                          {calc.baseValue > 0 ? formatCurrency(calc.baseValue) : '-'}
                        </td>
                        <td className="text-right py-3 px-2 text-muted-foreground">
                          {calc.rate > 0 ? `${(calc.rate * 100).toFixed(1)}%` : '-'}
                        </td>
                        <td className="text-right py-3 px-2 font-semibold text-primary">
                          {formatCurrency(calc.estimatedAmount)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              
              <p className="mt-3 text-xs text-muted-foreground italic">
                * Valores estimados para efeitos de planeamento. Consulte um contabilista para cálculos exactos.
              </p>
            </div>
          )}
        </div>
      )}

      {/* Impostos Aplicáveis */}
      <div className="card-elevated overflow-hidden">
        <button
          onClick={() => toggleSection('taxes')}
          className="w-full p-4 flex items-center justify-between bg-primary/5 hover:bg-primary/10 transition-colors"
        >
          <div className="flex items-center gap-3">
            <BadgePercent className="w-5 h-5 text-primary" />
            <span className="font-semibold text-foreground">
              Impostos Aplicáveis ({applicableTaxes.length})
            </span>
          </div>
          {expandedSections.taxes ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
        </button>
        
        {expandedSections.taxes && (
          <div className="p-4 space-y-3">
            {applicableTaxes.map((tax) => (
              <div key={tax.id} className="p-4 rounded-lg border border-border hover:border-primary/30 transition-colors">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-semibold text-foreground">{tax.name}</h4>
                      <span className="text-xs font-bold text-primary bg-primary/10 px-2 py-0.5 rounded">
                        {tax.abbreviation}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground">{tax.description}</p>
                  </div>
                  <span className={`text-xs font-medium px-2 py-1 rounded ${getCategoryColor(tax.category)}`}>
                    {getCategoryLabel(tax.category)}
                  </span>
                </div>
                <div className="flex items-center justify-between mt-3 pt-3 border-t border-border">
                  <span className="text-sm font-medium text-foreground">
                    Taxa: <span className="text-primary">{tax.rate}</span>
                  </span>
                  <span className="badge-primary text-xs capitalize">{tax.frequency}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Obrigações Mensais */}
      {obligations.monthly.length > 0 && (
        <div className="card-elevated overflow-hidden">
          <button
            onClick={() => toggleSection('monthly')}
            className="w-full p-4 flex items-center justify-between bg-blue-50 hover:bg-blue-100 transition-colors"
          >
            <div className="flex items-center gap-3">
              <Clock className="w-5 h-5 text-blue-600" />
              <span className="font-semibold text-foreground">
                Obrigações Mensais ({obligations.monthly.length})
              </span>
            </div>
            {expandedSections.monthly ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
          </button>
          
          {expandedSections.monthly && (
            <div className="p-4 space-y-3">
              {obligations.monthly.map((obl) => (
                <div key={obl.id} className="p-3 rounded-lg bg-muted">
                  <div className="flex items-start gap-3">
                    <FileText className="w-4 h-4 text-muted-foreground mt-0.5" />
                    <div>
                      <h5 className="font-medium text-foreground text-sm">{obl.name}</h5>
                      <p className="text-xs text-muted-foreground mt-1">{obl.description}</p>
                      <p className="text-xs text-primary font-medium mt-2">
                        Prazo: {obl.deadline}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Obrigações Trimestrais */}
      {obligations.quarterly.length > 0 && (
        <div className="card-elevated overflow-hidden">
          <button
            onClick={() => toggleSection('quarterly')}
            className="w-full p-4 flex items-center justify-between bg-amber-50 hover:bg-amber-100 transition-colors"
          >
            <div className="flex items-center gap-3">
              <Calendar className="w-5 h-5 text-amber-600" />
              <span className="font-semibold text-foreground">
                Obrigações Trimestrais ({obligations.quarterly.length})
              </span>
            </div>
            {expandedSections.quarterly ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
          </button>
          
          {expandedSections.quarterly && (
            <div className="p-4 space-y-3">
              {obligations.quarterly.map((obl) => (
                <div key={obl.id} className="p-3 rounded-lg bg-muted">
                  <div className="flex items-start gap-3">
                    <FileText className="w-4 h-4 text-muted-foreground mt-0.5" />
                    <div>
                      <h5 className="font-medium text-foreground text-sm">{obl.name}</h5>
                      <p className="text-xs text-muted-foreground mt-1">{obl.description}</p>
                      <p className="text-xs text-warning font-medium mt-2">
                        Prazo: {obl.deadline}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Obrigações Anuais */}
      {obligations.annual.length > 0 && (
        <div className="card-elevated overflow-hidden">
          <button
            onClick={() => toggleSection('annual')}
            className="w-full p-4 flex items-center justify-between bg-green-50 hover:bg-green-100 transition-colors"
          >
            <div className="flex items-center gap-3">
              <Building className="w-5 h-5 text-green-600" />
              <span className="font-semibold text-foreground">
                Obrigações Anuais ({obligations.annual.length})
              </span>
            </div>
            {expandedSections.annual ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
          </button>
          
          {expandedSections.annual && (
            <div className="p-4 space-y-3">
              {obligations.annual.map((obl) => (
                <div key={obl.id} className="p-3 rounded-lg bg-muted">
                  <div className="flex items-start gap-3">
                    <FileText className="w-4 h-4 text-muted-foreground mt-0.5" />
                    <div>
                      <h5 className="font-medium text-foreground text-sm">{obl.name}</h5>
                      <p className="text-xs text-muted-foreground mt-1">{obl.description}</p>
                      <p className="text-xs text-success font-medium mt-2">
                        Prazo: {obl.deadline}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Aviso Legal */}
      <div className="p-4 rounded-lg bg-warning/10 border border-warning/30">
        <div className="flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-warning flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-medium text-foreground">Aviso Importante</p>
            <p className="text-xs text-muted-foreground mt-1">
              Este simulador fornece informações gerais baseadas no Código Geral Tributário de Angola e calendário fiscal da AGT (2024/2025). 
              Para uma análise detalhada da sua situação fiscal específica, recomendamos consultar 
              um contabilista certificado ou a Administração Geral Tributária (AGT).
            </p>
          </div>
        </div>
      </div>

      {/* Botão Gerar PDF */}
      <div className="flex justify-center pt-4">
        <Button
          onClick={() => openPrintableReport({
            regime,
            applicableTaxes,
            taxCalculations,
            obligations,
            formattedRevenue,
            employeeCount,
            totalAnnualTaxEstimate
          })}
          className="btn-gold gap-2 px-8 py-6 text-base font-semibold"
        >
          <Printer className="w-5 h-5" />
          Gerar Relatório para Impressão (PDF)
        </Button>
      </div>
    </div>
  );
};

export default SimulationResults;
