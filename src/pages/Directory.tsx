import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Search, ArrowLeft, Sparkles, Building2, Plus, ScrollText } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ProviderCard } from '@/components/ProviderCard';
import { ANGOLA_PROVINCES, SPECIALTY_OPTIONS, type AccountingProvider } from '@/types/provider';
import { useAuth } from '@/hooks/useAuth';

const Directory = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [providers, setProviders] = useState<AccountingProvider[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [province, setProvince] = useState<string>('all');
  const [specialty, setSpecialty] = useState<string>('all');

  useEffect(() => {
    (async () => {
      const { data } = await supabase
        .from('public_providers' as any)
        .select('*')
        .order('is_featured', { ascending: false })
        .order('rating_avg', { ascending: false });
      setProviders((data as any[] as AccountingProvider[]) || []);
      setLoading(false);
    })();
  }, []);

  const filtered = useMemo(() => {
    return providers.filter((p) => {
      const q = search.toLowerCase();
      const matchesSearch =
        !q ||
        p.name.toLowerCase().includes(q) ||
        (p.description || '').toLowerCase().includes(q) ||
        p.specialties?.some((s) => s.toLowerCase().includes(q));
      const matchesProvince = province === 'all' || p.province === province;
      const matchesSpecialty = specialty === 'all' || p.specialties?.includes(specialty);
      return matchesSearch && matchesProvince && matchesSpecialty;
    });
  }, [providers, search, province, specialty]);

  const featured = filtered.filter((p) => p.is_featured);
  const rest = filtered.filter((p) => !p.is_featured);

  return (
    <div className="min-h-screen bg-background">
      <header className="hero-gradient text-primary-foreground">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between mb-6">
            <button onClick={() => navigate('/')} className="flex items-center gap-2 text-primary-foreground/80 hover:text-primary-foreground text-sm">
              <ArrowLeft className="w-4 h-4" /> Voltar ao simulador
            </button>
            <div className="flex items-center gap-2">
              <Button size="sm" variant="ghost" className="text-primary-foreground/80 hover:bg-white/10" onClick={() => navigate(user ? '/empresa/perfil' : '/auth')}>
                <Plus className="w-4 h-4 mr-1" /> Cadastrar a minha empresa
              </Button>
            </div>
          </div>
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-accent/20 text-accent text-xs font-semibold mb-4">
              <Sparkles className="w-3 h-3" /> Diretório Profissional Certificado
            </div>
            <h1 className="text-3xl md:text-4xl font-display font-bold mb-3">
              Encontre o seu <span className="text-gradient-gold">contabilista</span> ou empresa de contabilidade
            </h1>
            <p className="text-primary-foreground/80">
              Profissionais e empresas de contabilidade certificados pela Ordem dos Contabilistas e Peritos Contabilistas de Angola, prontos a apoiar o seu negócio.
            </p>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 space-y-6">
        {/* Filters */}
        <div className="card-elevated p-4 flex flex-col md:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Pesquisar por nome, especialidade..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10"
            />
          </div>
          <select
            value={province}
            onChange={(e) => setProvince(e.target.value)}
            className="h-10 rounded-md border border-input bg-background px-3 text-sm"
          >
            <option value="all">Todas as províncias</option>
            {ANGOLA_PROVINCES.map((p) => (
              <option key={p} value={p}>{p}</option>
            ))}
          </select>
          <select
            value={specialty}
            onChange={(e) => setSpecialty(e.target.value)}
            className="h-10 rounded-md border border-input bg-background px-3 text-sm"
          >
            <option value="all">Todas as especialidades</option>
            {SPECIALTY_OPTIONS.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </div>

        {/* Stats */}
        <div className="flex items-center gap-3 flex-wrap">
          <Badge variant="secondary" className="gap-1"><Building2 className="w-3 h-3" /> {filtered.length} resultado(s)</Badge>
          <Link to="/orcamento" className="text-xs text-primary hover:underline flex items-center gap-1">
            <ScrollText className="w-3 h-3" /> Pedir orçamento a vários profissionais
          </Link>
        </div>

        {loading ? (
          <div className="text-center py-16 text-muted-foreground">A carregar...</div>
        ) : filtered.length === 0 ? (
          <div className="card-elevated p-16 text-center">
            <Building2 className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
            <h3 className="font-display font-bold text-lg mb-1">Nenhuma empresa encontrada</h3>
            <p className="text-sm text-muted-foreground mb-4">Ajuste os filtros ou seja a primeira empresa do diretório.</p>
            <Button onClick={() => navigate(user ? '/empresa/perfil' : '/auth')} className="btn-gold">
              <Plus className="w-4 h-4 mr-1" /> Cadastrar a minha empresa
            </Button>
          </div>
        ) : (
          <>
            {featured.length > 0 && (
              <section>
                <h2 className="font-display font-bold text-xl text-foreground mb-3 flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-accent" /> Em destaque
                </h2>
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {featured.map((p) => <ProviderCard key={p.id} provider={p} />)}
                </div>
              </section>
            )}
            {rest.length > 0 && (
              <section>
                <h2 className="font-display font-bold text-xl text-foreground mb-3">Todos os profissionais</h2>
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {rest.map((p) => <ProviderCard key={p.id} provider={p} />)}
                </div>
              </section>
            )}
          </>
        )}
      </main>
    </div>
  );
};

export default Directory;
