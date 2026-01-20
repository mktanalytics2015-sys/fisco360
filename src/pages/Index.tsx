import { useState } from 'react';
import { Scale, FileCheck, Calculator, Shield, ArrowRight, RefreshCw } from 'lucide-react';
import SimulatorForm from '@/components/SimulatorForm';
import SimulationResults from '@/components/SimulationResults';
import FeedbackWidget from '@/components/FeedbackWidget';
import { calculateFiscalFramework, SimulationResult } from '@/utils/fiscalCalculator';

const Index = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [results, setResults] = useState<SimulationResult | null>(null);

  const handleSimulate = async (formData: any) => {
    setIsLoading(true);
    
    // Simular processamento
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    const simulationResults = calculateFiscalFramework(formData);
    setResults(simulationResults);
    setIsLoading(false);
  };

  const handleReset = () => {
    setResults(null);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <header className="hero-gradient text-primary-foreground">
        <div className="container mx-auto px-4 py-12 md:py-16">
          <div className="max-w-4xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-sm mb-6">
              <Scale className="w-4 h-4" />
              <span className="text-sm font-medium">Sistema Fiscal Angolano</span>
            </div>
            
            <h1 className="text-3xl md:text-5xl font-display font-bold mb-4 leading-tight">
              Simulador de{' '}
              <span className="text-gradient-gold">Enquadramento Fiscal</span>
            </h1>
            
            <p className="text-lg md:text-xl text-primary-foreground/80 max-w-2xl mx-auto">
              Descubra o regime fiscal correcto para a sua empresa e conheça todas as 
              obrigações tributárias segundo o Código Geral Tributário de Angola.
            </p>
          </div>
        </div>
        
        {/* Wave decoration */}
        <div className="h-16 bg-background" style={{
          clipPath: 'ellipse(70% 100% at 50% 100%)',
          marginTop: '-1px'
        }} />
      </header>

      {/* Features Strip */}
      <section className="py-8 border-b border-border">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-8">
            {[
              { icon: Calculator, label: 'Cálculo Automático' },
              { icon: FileCheck, label: 'Código Fiscal Actualizado' },
              { icon: Shield, label: 'Análise Completa' },
              { icon: Scale, label: 'Conformidade Legal' }
            ].map((feature, index) => (
              <div key={index} className="flex items-center gap-3 justify-center md:justify-start">
                <div className="p-2 rounded-lg bg-primary/10">
                  <feature.icon className="w-5 h-5 text-primary" />
                </div>
                <span className="text-sm font-medium text-foreground hidden sm:inline">
                  {feature.label}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-12">
        <div className="max-w-6xl mx-auto">
          {!results ? (
            <div className="grid lg:grid-cols-5 gap-8 lg:gap-12">
              {/* Form Section */}
              <div className="lg:col-span-3">
                <div className="card-elevated p-6 md:p-8">
                  <div className="mb-6">
                    <h2 className="text-2xl font-display font-bold text-foreground mb-2">
                      Dados da Empresa
                    </h2>
                    <p className="text-muted-foreground">
                      Preencha os dados abaixo para obter o diagnóstico fiscal completo
                    </p>
                  </div>
                  
                  <SimulatorForm onSimulate={handleSimulate} isLoading={isLoading} />
                </div>
              </div>

              {/* Info Sidebar */}
              <aside className="lg:col-span-2 space-y-6">
                <div className="card-elevated p-6">
                  <h3 className="font-display font-bold text-lg text-foreground mb-4">
                    O que vou descobrir?
                  </h3>
                  <ul className="space-y-3">
                    {[
                      'O regime fiscal mais adequado à sua empresa',
                      'Todos os impostos aplicáveis ao seu sector',
                      'Obrigações fiscais mensais, trimestrais e anuais',
                      'Prazos de entrega e pagamento'
                    ].map((item, index) => (
                      <li key={index} className="flex items-start gap-3">
                        <ArrowRight className="w-4 h-4 text-accent mt-1 flex-shrink-0" />
                        <span className="text-sm text-muted-foreground">{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="card-elevated p-6 border-l-4 border-l-accent">
                  <h3 className="font-display font-bold text-lg text-foreground mb-2">
                    Porquê usar este simulador?
                  </h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Empresas mal enquadradas no regime fiscal podem enfrentar multas, 
                    penalizações e perda de benefícios fiscais. Este diagnóstico ajuda 
                    a garantir a conformidade com a legislação angolana.
                  </p>
                  <div className="flex items-center gap-2 text-sm font-medium text-accent">
                    <Shield className="w-4 h-4" />
                    <span>Evite problemas com a AGT</span>
                  </div>
                </div>

                <div className="p-4 rounded-lg bg-muted">
                  <p className="text-xs text-muted-foreground text-center">
                    Baseado no Código Geral Tributário de Angola e legislação fiscal vigente
                  </p>
                </div>
              </aside>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Results Header */}
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-display font-bold text-foreground">
                    Resultado do Diagnóstico
                  </h2>
                  <p className="text-muted-foreground">
                    Análise completa do enquadramento fiscal da sua empresa
                  </p>
                </div>
                <button
                  onClick={handleReset}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg border border-border hover:bg-muted transition-colors"
                >
                  <RefreshCw className="w-4 h-4" />
                  <span className="hidden sm:inline">Nova Simulação</span>
                </button>
              </div>

              {/* Results Content */}
              <SimulationResults 
                regime={results.regime}
                industrialTaxRegime={results.industrialTaxRegime}
                ivaRegime={results.ivaRegime}
                applicableTaxes={results.applicableTaxes}
                taxCalculations={results.taxCalculations}
                obligations={results.obligations}
                formattedRevenue={results.formattedRevenue}
                employeeCount={results.employeeCount}
                totalAnnualTaxEstimate={results.totalAnnualTaxEstimate}
              />
            </div>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-border py-8 mt-12">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <Scale className="w-5 h-5 text-primary" />
              <span className="font-display font-bold text-foreground">
                Simulador Fiscal Angola
              </span>
            </div>
            <p className="text-sm text-muted-foreground text-center md:text-right">
              Ferramenta de diagnóstico fiscal. Consulte sempre um profissional certificado.
            </p>
          </div>
        </div>
      </footer>

      {/* Feedback Widget */}
      <FeedbackWidget />
    </div>
  );
};

export default Index;
