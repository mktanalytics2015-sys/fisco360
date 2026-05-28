import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Building2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { ProviderCard } from '@/components/ProviderCard';
import { Button } from '@/components/ui/button';
import type { AccountingProvider } from '@/types/provider';

interface FeaturedProvidersProps {
  title?: string;
  subtitle?: string;
  limit?: number;
  compact?: boolean;
}

export const FeaturedProviders = ({
  title = 'Diretório de Empresas',
  subtitle = 'Empresas e contabilistas certificados pela Ordem dos Contabilistas de Angola',
  limit = 6,
  compact = false,
}: FeaturedProvidersProps) => {
  const [providers, setProviders] = useState<AccountingProvider[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const { data } = await supabase
        .from('public_providers' as any)
        .select('*')
        .eq('status', 'approved')
        .order('is_featured', { ascending: false })
        .order('is_premium', { ascending: false })
        .order('rating_avg', { ascending: false })
        .limit(limit);
      setProviders(((data as unknown) as AccountingProvider[]) || []);
      setLoading(false);
    })();
  }, [limit]);

  if (loading) return null;
  if (providers.length === 0) return null;

  return (
    <section className={compact ? 'py-8' : 'py-12'}>
      <div className="container mx-auto px-4">
        <div className="flex items-end justify-between mb-6 flex-wrap gap-3">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-semibold mb-2">
              <Building2 className="w-3.5 h-3.5" /> Profissionais Certificados
            </div>
            <h2 className="text-2xl md:text-3xl font-display font-bold text-foreground">{title}</h2>
            {subtitle && <p className="text-sm text-muted-foreground mt-1 max-w-2xl">{subtitle}</p>}
          </div>
          <Button variant="outline" size="sm" asChild>
            <Link to="/diretorio">
              Ver todos <ArrowRight className="w-4 h-4 ml-1" />
            </Link>
          </Button>
        </div>
        <div className={`grid gap-4 ${compact ? 'sm:grid-cols-2 lg:grid-cols-5' : 'sm:grid-cols-2 lg:grid-cols-3'}`}>
          {providers.map((p) => (
            <ProviderCard key={p.id} provider={p} />
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturedProviders;
