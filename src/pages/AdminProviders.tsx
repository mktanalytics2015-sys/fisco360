import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, BadgeCheck, Sparkles, CheckCircle, XCircle, Trash2, Building2, Crown } from 'lucide-react';
import type { AccountingProvider } from '@/types/provider';

const AdminProviders = () => {
  const { isAdmin, loading, user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [providers, setProviders] = useState<AccountingProvider[]>([]);
  const [loadingList, setLoadingList] = useState(true);
  const [filter, setFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('pending');

  useEffect(() => {
    if (!loading && (!user || !isAdmin)) navigate('/');
  }, [loading, user, isAdmin, navigate]);

  const load = async () => {
    setLoadingList(true);
    const { data } = await supabase.from('accounting_providers').select('*').order('created_at', { ascending: false });
    setProviders((data as any) || []);
    setLoadingList(false);
  };

  useEffect(() => { if (isAdmin) load(); }, [isAdmin]);

  const update = async (id: string, patch: Partial<AccountingProvider>) => {
    const { error } = await supabase.from('accounting_providers').update(patch as any).eq('id', id);
    if (error) toast({ title: 'Erro', description: error.message, variant: 'destructive' });
    else { toast({ title: 'Actualizado' }); load(); }
  };

  const remove = async (id: string) => {
    if (!confirm('Apagar esta empresa?')) return;
    const { error } = await supabase.from('accounting_providers').delete().eq('id', id);
    if (error) toast({ title: 'Erro', description: error.message, variant: 'destructive' });
    else { toast({ title: 'Apagado' }); load(); }
  };

  const filtered = filter === 'all' ? providers : providers.filter(p => p.status === filter);

  return (
    <div className="min-h-screen bg-background">
      <header className="hero-gradient text-primary-foreground py-6">
        <div className="container mx-auto px-4 flex items-center justify-between">
          <div>
            <button onClick={() => navigate('/admin')} className="flex items-center gap-2 text-primary-foreground/80 text-sm mb-2"><ArrowLeft className="w-4 h-4" /> Backoffice</button>
            <h1 className="text-2xl font-display font-bold">Diretório de Contabilistas</h1>
            <p className="text-sm text-primary-foreground/70">Aprovar, destacar e verificar empresas e profissionais</p>
          </div>
          <Building2 className="w-8 h-8" />
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 space-y-4">
        <div className="flex gap-2 flex-wrap">
          {(['pending','approved','rejected','all'] as const).map(f => (
            <Button key={f} size="sm" variant={filter === f ? 'default' : 'outline'} onClick={() => setFilter(f)}>
              {f === 'pending' ? 'Pendentes' : f === 'approved' ? 'Aprovados' : f === 'rejected' ? 'Rejeitados' : 'Todos'}
              <span className="ml-2 opacity-70">{f === 'all' ? providers.length : providers.filter(p => p.status === f).length}</span>
            </Button>
          ))}
        </div>

        {loadingList ? <p className="text-center py-12 text-muted-foreground">A carregar...</p> :
         filtered.length === 0 ? <p className="text-center py-12 text-muted-foreground">Sem registos</p> :
        <div className="space-y-3">
          {filtered.map(p => (
            <div key={p.id} className="card-elevated p-4 flex flex-col md:flex-row gap-4 md:items-center">
              <div className="flex items-start gap-3 flex-1">
                {p.logo_url ? <img src={p.logo_url} className="w-12 h-12 rounded-lg object-cover" alt="" /> : <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center"><Building2 className="w-5 h-5 text-primary" /></div>}
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="font-semibold text-foreground">{p.name}</p>
                    <Badge variant={p.status === 'approved' ? 'default' : p.status === 'pending' ? 'secondary' : 'destructive'}>{p.status}</Badge>
                    {p.is_featured && <Badge className="bg-accent text-accent-foreground gap-1"><Sparkles className="w-3 h-3" />Destaque</Badge>}
                    {p.is_verified && <Badge className="gap-1"><BadgeCheck className="w-3 h-3" />Selo</Badge>}
                    {p.is_premium && <Badge variant="outline" className="gap-1"><Crown className="w-3 h-3" />Premium</Badge>}
                  </div>
                  <p className="text-xs text-muted-foreground">{p.email} · {p.province || 'sem província'} · cédula: {p.cedula_number || '—'}</p>
                </div>
              </div>
              <div className="flex flex-wrap gap-2">
                {p.status !== 'approved' && <Button size="sm" onClick={() => update(p.id, { status: 'approved' })}><CheckCircle className="w-4 h-4 mr-1" />Aprovar</Button>}
                {p.status !== 'rejected' && <Button size="sm" variant="outline" onClick={() => update(p.id, { status: 'rejected' })}><XCircle className="w-4 h-4 mr-1" />Rejeitar</Button>}
                <Button size="sm" variant={p.is_featured ? 'default' : 'outline'} onClick={() => update(p.id, { is_featured: !p.is_featured })} className={p.is_featured ? 'btn-gold' : ''}><Sparkles className="w-4 h-4 mr-1" />{p.is_featured ? 'Tirar destaque' : 'Destacar'}</Button>
                <Button size="sm" variant={p.is_verified ? 'default' : 'outline'} onClick={() => update(p.id, { is_verified: !p.is_verified })}><BadgeCheck className="w-4 h-4 mr-1" />{p.is_verified ? 'Tirar selo' : 'Verificar'}</Button>
                <Button size="sm" variant="ghost" onClick={() => navigate(`/diretorio/${p.id}`)}>Ver</Button>
                <Button size="sm" variant="ghost" onClick={() => remove(p.id)}><Trash2 className="w-4 h-4 text-destructive" /></Button>
              </div>
            </div>
          ))}
        </div>}
      </main>
    </div>
  );
};

export default AdminProviders;
