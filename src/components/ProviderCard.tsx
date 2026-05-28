import { Link } from 'react-router-dom';
import { Building2, MapPin, Star, BadgeCheck, Crown, Sparkles } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import type { AccountingProvider } from '@/types/provider';

interface Props {
  provider: AccountingProvider;
  compact?: boolean;
}

export const ProviderCard = ({ provider, compact = false }: Props) => {
  if (compact) {
    return (
      <Link
        to={`/diretorio/${provider.id}`}
        className={`card-elevated p-3 flex items-center gap-3 transition-all hover:-translate-y-0.5 hover:shadow-lg relative ${
          provider.is_featured ? 'ring-1 ring-accent/60' : ''
        }`}
      >
        {provider.logo_url ? (
          <img src={provider.logo_url} alt={provider.name} className="w-12 h-12 rounded-lg object-cover border border-border flex-shrink-0" />
        ) : (
          <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
            <Building2 className="w-6 h-6 text-primary" />
          </div>
        )}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1">
            <h3 className="font-display font-bold text-sm text-foreground truncate">{provider.name}</h3>
            {provider.is_verified && <BadgeCheck className="w-3.5 h-3.5 text-primary flex-shrink-0" />}
            {provider.is_premium && <Crown className="w-3.5 h-3.5 text-accent flex-shrink-0" />}
          </div>
          {provider.province && (
            <div className="flex items-center gap-1 text-[11px] text-muted-foreground truncate">
              <MapPin className="w-3 h-3 flex-shrink-0" /> <span className="truncate">{provider.province}</span>
            </div>
          )}
          <div className="flex items-center gap-1 mt-0.5">
            <Star className="w-3 h-3 fill-accent text-accent" />
            <span className="text-[11px] font-semibold text-foreground">{Number(provider.rating_avg).toFixed(1)}</span>
            <span className="text-[10px] text-muted-foreground">({provider.rating_count})</span>
          </div>
        </div>
      </Link>
    );
  }

  return (
    <Link
      to={`/diretorio/${provider.id}`}
      className={`card-elevated p-5 flex flex-col gap-3 transition-all hover:-translate-y-1 hover:shadow-xl ${
        provider.is_featured ? 'ring-2 ring-accent/60 relative overflow-hidden' : ''
      }`}
    >
      {provider.is_featured && (
        <div className="absolute top-0 right-0 bg-gradient-to-l from-accent to-accent/80 text-accent-foreground text-[10px] font-bold px-3 py-1 rounded-bl-lg flex items-center gap-1">
          <Sparkles className="w-3 h-3" /> DESTAQUE
        </div>
      )}
      <div className="flex items-start gap-4">
        {provider.logo_url ? (
          <img src={provider.logo_url} alt={provider.name} className="w-16 h-16 rounded-lg object-cover border border-border" />
        ) : (
          <div className="w-16 h-16 rounded-lg bg-primary/10 flex items-center justify-center">
            <Building2 className="w-7 h-7 text-primary" />
          </div>
        )}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5 flex-wrap">
            <h3 className="font-display font-bold text-foreground truncate">{provider.name}</h3>
            {provider.is_verified && (
              <BadgeCheck className="w-4 h-4 text-primary" aria-label="Verificado pela Ordem" />
            )}
            {provider.is_premium && <Crown className="w-4 h-4 text-accent" />}
          </div>
          <p className="text-xs text-muted-foreground capitalize">
            {provider.type === 'company' ? 'Empresa de Contabilidade' : 'Profissional Certificado'}
          </p>
          {provider.province && (
            <div className="flex items-center gap-1 text-xs text-muted-foreground mt-1">
              <MapPin className="w-3 h-3" /> {provider.province}
            </div>
          )}
        </div>
      </div>

      {provider.description && (
        <p className="text-sm text-muted-foreground line-clamp-2">{provider.description}</p>
      )}

      {provider.specialties?.length > 0 && (
        <div className="flex flex-wrap gap-1">
          {provider.specialties.slice(0, 3).map((s) => (
            <Badge key={s} variant="secondary" className="text-[10px] font-normal">
              {s}
            </Badge>
          ))}
          {provider.specialties.length > 3 && (
            <Badge variant="outline" className="text-[10px] font-normal">+{provider.specialties.length - 3}</Badge>
          )}
        </div>
      )}

      <div className="flex items-center justify-between pt-2 border-t border-border mt-auto">
        <div className="flex items-center gap-1">
          <Star className="w-4 h-4 fill-accent text-accent" />
          <span className="text-sm font-semibold text-foreground">{Number(provider.rating_avg).toFixed(1)}</span>
          <span className="text-xs text-muted-foreground">({provider.rating_count})</span>
        </div>
        {provider.years_experience ? (
          <span className="text-xs text-muted-foreground">{provider.years_experience}+ anos</span>
        ) : null}
      </div>
    </Link>
  );
};
