import { Crown, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';

const PAYMENT_URL = 'https://pay.kambafy.com/checkout/0404bffa-de5f-47df-bca3-da0caa7dfe71';

const PremiumBanner = () => {
  const { user, isPremium, profile } = useAuth();
  const { toast } = useToast();

  if (!user || isPremium) return null;

  const remaining = 3 - (profile?.simulations_this_month ?? 0);

  const handleUpgrade = () => {
    window.open(PAYMENT_URL, '_blank');
    toast({
      title: '🎉 Parabéns!',
      description: 'Após concluir o pagamento, o seu plano será actualizado para Premium automaticamente.',
    });
  };

  return (
    <div className="card-elevated p-6 border-l-4 border-l-accent mb-6">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Crown className="w-5 h-5 text-accent" />
            <h3 className="font-display font-bold text-foreground">Actualizar para Premium</h3>
          </div>
          <p className="text-sm text-muted-foreground mb-2">
            Restam-lhe <span className="font-bold text-foreground">{remaining}</span> simulações gratuitas este mês.
          </p>
          <ul className="space-y-1">
            {['Simulações ilimitadas', 'Exportação PDF completa', 'Calendário fiscal detalhado', 'Pressupostos de cálculo avançados'].map((f, i) => (
              <li key={i} className="flex items-center gap-2 text-xs text-muted-foreground">
                <Check className="w-3 h-3 text-accent" /> {f}
              </li>
            ))}
          </ul>
        </div>
        <div className="text-center">
          <p className="text-2xl font-bold text-primary">3.999 Kz</p>
          <p className="text-xs text-muted-foreground mb-2">/trimestre</p>
          <Button className="btn-gold text-sm py-2 px-6" onClick={handleUpgrade}>Actualizar agora</Button>
        </div>
      </div>
    </div>
  );
};

export default PremiumBanner;
