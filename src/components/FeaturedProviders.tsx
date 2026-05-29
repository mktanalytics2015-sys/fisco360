import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { ProviderCard } from '@/components/ProviderCard';
import type { AccountingProvider } from '@/types/provider';

interface Props {
  title?: string;
  subtitle?: string;
  limit?: number;
  featuredOnly?: boolean;
  variant?: 'section' | 'compact';
}

const FeaturedProviders = ({
  title = 'Diretório de Empresas',
  subtitle = 'Empresas e contabilistas certificados pela Ordem dos Contabilistas de Angola',
  limit = 6,
  featuredOnly = false,
  variant = 'section',
}: Props) => {
  const [providers, setProviders] = useState<AccountingProvider[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      let q = supabase
        .from('accounting_providers')
        .select('*')
        .eq('status', 'approved')
        .order('is_featured', { ascending: false })
        .order('rating_avg', { ascending: false })
        .limit(limit);
      if (featuredOnly) q = q.eq('is_featured', true);
      const { data } = await q;
      setProviders((data as any[] as AccountingProvider[]) || []);
      setLoading(false);
    })();
  }, [limit, featuredOnly]);

  if (!loading && providers.length === 0) return null;

  const isCompact = variant === 'compact';

  return (
    <section className={isCompact ? 'py-6 border-t border-border bg-muted/20' : 'py-12 bg-muted/30 border-y border-border'}>
      <div className="container mx-auto px-4">
        <div className="flex items-end justify-between gap-4 mb-4 flex-wrap">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-accent/10 text-accent text-xs font-semibold mb-2">
              <Users className="w-3 h-3" /> {featuredOnly ? 'Empresas em Destaque' : 'Profissionais Certificados'}
            </div>
            <h2 className={`${isCompact ? 'text-xl' : 'text-2xl md:text-3xl'} font-display font-bold text-foreground`}>{title}</h2>
            {subtitle && <p className="text-sm text-muted-foreground mt-1 max-w-2xl">{subtitle}</p>}
          </div>
          <Link
            to="/diretorio"
            className="text-sm font-medium text-primary hover:text-primary/80 inline-flex items-center gap-1"
          >
            Ver todos <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {loading ? (
          <div className={isCompact ? 'grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3' : 'grid sm:grid-cols-2 lg:grid-cols-3 gap-4'}>
            {Array.from({ length: Math.min(limit, 5) }).map((_, i) => (
              <div key={i} className={`card-elevated ${isCompact ? 'p-3 h-16' : 'p-5 h-44'} animate-pulse bg-muted/40`} />
            ))}
          </div>
        ) : isCompact ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
            {providers.map((p) => (
              <ProviderCard key={p.id} provider={p} compact />
            ))}
          </div>
        ) : (
          <div className={`grid sm:grid-cols-2 ${limit >= 5 ? 'lg:grid-cols-3 xl:grid-cols-5' : 'lg:grid-cols-3'} gap-4`}>
            {providers.map((p) => (
              <ProviderCard key={p.id} provider={p} />
            ))}
          </div>
        )}

        {!isCompact && (
          <div className="flex justify-center mt-8">
            <Button asChild size="lg" className="font-semibold">
              <Link to="/diretorio" className="inline-flex items-center gap-2">
                Explorar Diretório <ArrowRight className="w-4 h-4" />
              </Link>
            </Button>
          </div>
        )}
      </div>
    </section>
  );
};


export default FeaturedProviders;
