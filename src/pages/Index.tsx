import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Scale, FileCheck, Calculator, Shield, ArrowRight, RefreshCw, LogIn, LogOut, Crown, Settings } from 'lucide-react';
import SimulatorForm from '@/components/SimulatorForm';
import SimulationResults from '@/components/SimulationResults';
import FeedbackWidget from '@/components/FeedbackWidget';
import PremiumBanner from '@/components/PremiumBanner';
import { calculateFiscalFramework, SimulationResult } from '@/utils/fiscalCalculator';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import sendizaLogo from '@/assets/Logo_Sendiza.png';

const PAYMENT_URL = 'https://pay.kambafy.com/checkout/0404bffa-de5f-47df-bca3-da0caa7dfe71';

const Index = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [results, setResults] = useState<SimulationResult | null>(null);
  const [showSignupDialog, setShowSignupDialog] = useState(false);
  const { user, isPremium, isAdmin, canSimulate, incrementSimulation, signOut, loading, profile } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const getGuestSimCount = () => parseInt(localStorage.getItem('guest_sim_count') || '0', 10);

  const handleSimulate = async (formData: any) => {
    // Guest user: track locally, after 3 show signup popup
    if (!user) {
      const count = getGuestSimCount();
      if (count >= 3) {
        setShowSignupDialog(true);
        return;
      }
      localStorage.setItem('guest_sim_count', String(count + 1));
    } else if (!canSimulate) {
      toast({
        title: 'Limite atingido',
        description: 'Atingiu o limite de 3 simulações gratuitas este mês. Actualize para Premium para simulações ilimitadas.',
        variant: 'destructive'
      });
      return;
    }

    setIsLoading(true);
    await new Promise((resolve) => setTimeout(resolve, 1500));
    const simulationResults = calculateFiscalFramework(formData);
    setResults(simulationResults);
    setIsLoading(false);

    if (user) await incrementSimulation();
  };

  const handleUpgradePremium = () => {
    window.open(PAYMENT_URL, '_blank');
    toast({
      title: '🎉 Parabéns!',
      description: 'Após concluir o pagamento, o seu plano será actualizado para Premium automaticamente.',
    });
  };

  const handleReset = () => {
    setResults(null);
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Hero Section */}
      <header className="hero-gradient text-primary-foreground">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-2">
              <Scale className="w-5 h-5" />
              <span className="font-display font-bold text-lg">Fisco 360</span>
            </div>
            <div className="flex items-center gap-2">
              {user ?
              <>
                  {isAdmin &&
                <Button variant="ghost" size="sm" onClick={() => navigate('/admin')} className="text-primary-foreground/80 hover:text-primary-foreground hover:bg-white/10">
                      <Settings className="w-4 h-4 mr-1" /> Admin
                    </Button>
                }
                  {!isPremium &&
                <Button size="sm" className="btn-gold text-xs py-1 px-3" onClick={handleUpgradePremium}>
                      <Crown className="w-3 h-3 mr-1" /> Premium
                    </Button>
                }
                  {isPremium &&
                <span className="text-xs bg-accent/20 text-accent px-2 py-1 rounded-full font-medium">⭐ Premium</span>
                }
                  <Button variant="ghost" size="sm" onClick={signOut} className="text-primary-foreground/80 hover:text-primary-foreground hover:bg-white/10">
                    <LogOut className="w-4 h-4" />
                  </Button>
                </> :

              <Button variant="ghost" size="sm" onClick={() => navigate('/auth')} className="text-primary-foreground/80 hover:text-primary-foreground hover:bg-white/10">
                  <LogIn className="w-4 h-4 mr-1" /> Entrar
                </Button>
              }
            </div>
          </div>
          <div className="max-w-4xl mx-auto text-center pb-8">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-sm mb-6">
              <Scale className="w-4 h-4" />
              <span className="text-sm font-medium">Sistema Fiscal Angolano</span>
            </div>
            <h1 className="text-3xl md:text-5xl font-display font-bold mb-4 leading-tight">
              Simulador de <span className="text-gradient-gold">Enquadramento Fiscal</span>
            </h1>
            <p className="text-lg md:text-xl text-primary-foreground/80 max-w-2xl mx-auto">
              Descubra o regime fiscal correcto para a sua empresa e conheça todas as obrigações tributárias segundo o Código Geral Tributário de Angola.
            </p>
          </div>
        </div>
        <div className="h-16 bg-background" style={{ clipPath: 'ellipse(70% 100% at 50% 100%)', marginTop: '-1px' }} />
      </header>

      {/* Features Strip */}
      <section className="py-8 border-b border-border">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-8">
            {[
            { icon: Calculator, label: 'Cálculo Automático' },
            { icon: FileCheck, label: 'Código Fiscal Actualizado' },
            { icon: Shield, label: 'Análise Completa' },
            { icon: Scale, label: 'Conformidade Legal' }].
            map((feature, index) =>
            <div key={index} className="flex items-center gap-3 justify-center md:justify-start">
                <div className="p-2 rounded-lg bg-primary/10">
                  <feature.icon className="w-5 h-5 text-primary" />
                </div>
                <span className="text-sm font-medium text-foreground hidden sm:inline">{feature.label}</span>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-12 flex-1">
        <div className="max-w-6xl mx-auto">
          {/* Premium Banner for free users */}
          {user && !isPremium && <PremiumBanner />}

          {/* Free user simulation count */}
          {user && !isPremium && profile &&
          <div className="mb-4 text-sm text-muted-foreground text-center">
              Simulações utilizadas: <span className="font-bold text-foreground">{profile.simulations_this_month}/3</span> este mês
            </div>
          }

          {!results ?
          <div className="grid lg:grid-cols-5 gap-8 lg:gap-12">
              <div className="lg:col-span-3">
                <div className="card-elevated p-6 md:p-8">
                  <div className="mb-6">
                    <h2 className="text-2xl font-display font-bold text-foreground mb-2">Dados da Empresa</h2>
                    <p className="text-muted-foreground">Preencha os dados abaixo para obter o diagnóstico fiscal completo</p>
                  </div>
                  <SimulatorForm onSimulate={handleSimulate} isLoading={isLoading} />
                </div>
              </div>
              <aside className="lg:col-span-2 space-y-6">
                <div className="card-elevated p-6">
                  <h3 className="font-display font-bold text-lg text-foreground mb-4">O que vou descobrir?</h3>
                  <ul className="space-y-3">
                    {['O regime fiscal mais adequado à sua empresa', 'Todos os impostos aplicáveis ao seu sector', 'Obrigações fiscais mensais, trimestrais e anuais', 'Prazos de entrega e pagamento'].map((item, index) =>
                  <li key={index} className="flex items-start gap-3">
                        <ArrowRight className="w-4 h-4 text-accent mt-1 flex-shrink-0" />
                        <span className="text-sm text-muted-foreground">{item}</span>
                      </li>
                  )}
                  </ul>
                </div>
                <div className="card-elevated p-6 border-l-4 border-l-accent">
                  <h3 className="font-display font-bold text-lg text-foreground mb-2">Porquê usar este simulador?</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Empresas mal enquadradas no regime fiscal podem enfrentar multas, penalizações e perda de benefícios fiscais.
                  </p>
                  <div className="flex items-center gap-2 text-sm font-medium text-accent">
                    <Shield className="w-4 h-4" />
                    <span>Evite problemas com a AGT</span>
                  </div>
                </div>
                {!user &&
              <div className="card-elevated p-6 text-center">
                    <Crown className="w-8 h-8 text-accent mx-auto mb-2" />
                    <h3 className="font-display font-bold text-foreground mb-1">Crie a sua conta</h3>
                    <p className="text-xs text-muted-foreground mb-3">2 simulações gratuitas por mês. Actualize para Premium por apenas 3.999 Kz/trimestre e tenha acesso ilimitado.</p>
                    <Button onClick={() => navigate('/auth')} className="w-full" size="sm">Criar conta gratuita</Button>
                  </div>
              }
              </aside>
            </div> :

          <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-display font-bold text-foreground">Resultado do Diagnóstico</h2>
                  <p className="text-muted-foreground">Análise completa do enquadramento fiscal da sua empresa</p>
                </div>
                <button onClick={handleReset} className="flex items-center gap-2 px-4 py-2 rounded-lg border border-border hover:bg-muted transition-colors">
                  <RefreshCw className="w-4 h-4" />
                  <span className="hidden sm:inline">Nova Simulação</span>
                </button>
              </div>
              <SimulationResults
              regime={results.regime}
              industrialTaxRegime={results.industrialTaxRegime}
              ivaRegime={results.ivaRegime}
              applicableTaxes={results.applicableTaxes}
              taxCalculations={results.taxCalculations}
              obligations={results.obligations}
              formattedRevenue={results.formattedRevenue}
              employeeCount={results.employeeCount}
              totalAnnualTaxEstimate={results.totalAnnualTaxEstimate} />
            
            </div>
          }
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-border py-8 mt-12">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <Scale className="w-5 h-5 text-primary" />
              <span className="font-display font-bold text-foreground">Fisco 360</span>
            </div>
            <p className="text-sm text-muted-foreground text-center">
              Ferramenta de diagnóstico fiscal. Consulte sempre um profissional certificado.
            </p>
            <div className="flex items-center gap-2">
              <span className="text-xs text-muted-foreground">Criado e mantido pela</span>
              <img src={sendizaLogo} alt="Sendiza" className="h-6" />
            </div>
          </div>
        </div>
      </footer>

      <FeedbackWidget />
    </div>);

};

export default Index;