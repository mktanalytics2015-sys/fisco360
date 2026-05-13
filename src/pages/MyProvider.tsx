import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Upload, Save, Trash2, Plus, ScrollText } from 'lucide-react';
import { ANGOLA_PROVINCES, SPECIALTY_OPTIONS, LANGUAGE_OPTIONS, type AccountingProvider, type ProviderService } from '@/types/provider';

const empty = {
  type: 'company' as const,
  name: '', nif: '', email: '', phone: '', whatsapp: '', website: '',
  address: '', province: '', description: '', logo_url: '',
  cedula_number: '', years_experience: 0,
  specialties: [] as string[], languages: [] as string[],
  services: [] as ProviderService[],
  price_range_min: '' as any, price_range_max: '' as any,
};

const MyProvider = () => {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [existing, setExisting] = useState<AccountingProvider | null>(null);
  const [form, setForm] = useState<any>(empty);
  const [quotes, setQuotes] = useState<any[]>([]);

  useEffect(() => {
    if (!authLoading && !user) navigate('/auth');
  }, [authLoading, user, navigate]);

  useEffect(() => {
    if (!user) return;
    (async () => {
      const { data } = await supabase
        .from('accounting_providers')
        .select('*')
        .eq('owner_id', user.id)
        .maybeSingle();
      if (data) {
        setExisting(data as any);
        setForm({
          ...empty, ...data,
          specialties: (data as any).specialties || [],
          languages: (data as any).languages || [],
          services: (data as any).services || [],
          price_range_min: (data as any).price_range_min ?? '',
          price_range_max: (data as any).price_range_max ?? '',
        });
        const { data: q } = await supabase.from('quote_requests').select('*').eq('provider_id', (data as any).id).order('created_at', { ascending: false });
        setQuotes(q || []);
      } else {
        setForm({ ...empty, email: user.email || '' });
      }
      setLoading(false);
    })();
  }, [user]);

  const toggleArr = (key: 'specialties' | 'languages', val: string) => {
    setForm((f: any) => ({
      ...f,
      [key]: f[key].includes(val) ? f[key].filter((v: string) => v !== val) : [...f[key], val],
    }));
  };

  const addService = () => setForm((f: any) => ({ ...f, services: [...f.services, { name: '', price_min: null, price_max: null, modality: '' }] }));
  const updateService = (i: number, key: keyof ProviderService, value: any) => {
    setForm((f: any) => ({ ...f, services: f.services.map((s: any, idx: number) => idx === i ? { ...s, [key]: value } : s) }));
  };
  const removeService = (i: number) => setForm((f: any) => ({ ...f, services: f.services.filter((_: any, idx: number) => idx !== i) }));

  const uploadLogo = async (file: File) => {
    if (!user) return;
    const ext = file.name.split('.').pop();
    const path = `${user.id}/logo-${Date.now()}.${ext}`;
    const { error } = await supabase.storage.from('provider-logos').upload(path, file, { upsert: true });
    if (error) { toast({ title: 'Erro no upload', description: error.message, variant: 'destructive' }); return; }
    const { data: { publicUrl } } = supabase.storage.from('provider-logos').getPublicUrl(path);
    setForm((f: any) => ({ ...f, logo_url: publicUrl }));
    toast({ title: 'Logotipo carregado' });
  };

  const save = async () => {
    if (!user) return;
    if (!form.name || !form.email) { toast({ title: 'Nome e email são obrigatórios', variant: 'destructive' }); return; }
    setSaving(true);
    const payload = {
      owner_id: user.id,
      type: form.type,
      name: form.name,
      nif: form.nif || null,
      email: form.email,
      phone: form.phone || null,
      whatsapp: form.whatsapp || null,
      website: form.website || null,
      address: form.address || null,
      province: form.province || null,
      description: form.description || null,
      logo_url: form.logo_url || null,
      cedula_number: form.cedula_number || null,
      years_experience: Number(form.years_experience) || 0,
      specialties: form.specialties,
      languages: form.languages,
      services: form.services,
      price_range_min: form.price_range_min ? Number(form.price_range_min) : null,
      price_range_max: form.price_range_max ? Number(form.price_range_max) : null,
    };
    let res;
    if (existing) {
      res = await supabase.from('accounting_providers').update(payload).eq('id', existing.id).select().maybeSingle();
    } else {
      res = await supabase.from('accounting_providers').insert(payload).select().maybeSingle();
    }
    if (res.error) toast({ title: 'Erro', description: res.error.message, variant: 'destructive' });
    else {
      setExisting(res.data as any);
      toast({ title: existing ? '✅ Perfil actualizado' : '🎉 Perfil criado — aguarda aprovação do admin' });
    }
    setSaving(false);
  };

  if (authLoading || loading) return <div className="min-h-screen flex items-center justify-center">A carregar...</div>;

  return (
    <div className="min-h-screen bg-background">
      <header className="hero-gradient text-primary-foreground py-6">
        <div className="container mx-auto px-4">
          <button onClick={() => navigate('/diretorio')} className="flex items-center gap-2 text-primary-foreground/80 hover:text-primary-foreground text-sm mb-4">
            <ArrowLeft className="w-4 h-4" /> Voltar ao diretório
          </button>
          <h1 className="text-2xl md:text-3xl font-display font-bold">A minha empresa</h1>
          <p className="text-primary-foreground/80 text-sm">Gere o perfil da sua empresa ou prática profissional no diretório Fisco 360.</p>
          {existing && (
            <div className="mt-3 flex gap-2">
              <Badge className={existing.status === 'approved' ? 'bg-green-600' : existing.status === 'pending' ? 'bg-amber-500' : 'bg-destructive'}>
                {existing.status === 'approved' ? '✓ Aprovado' : existing.status === 'pending' ? '⏳ Pendente de aprovação' : '✗ Rejeitado'}
              </Badge>
              {existing.is_featured && <Badge className="bg-accent text-accent-foreground">⭐ Em destaque</Badge>}
              {existing.is_verified && <Badge className="bg-white/20">Selo Ordem</Badge>}
            </div>
          )}
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-4xl space-y-6">
        {/* Quotes received */}
        {existing && quotes.length > 0 && (
          <section className="card-elevated p-6">
            <h2 className="font-display font-bold text-lg mb-4 flex items-center gap-2"><ScrollText className="w-5 h-5" /> Pedidos de orçamento ({quotes.length})</h2>
            <div className="space-y-3">
              {quotes.map(q => (
                <div key={q.id} className="border border-border rounded-lg p-3">
                  <div className="flex justify-between items-start mb-1">
                    <p className="font-semibold text-sm">{q.service_needed}</p>
                    <span className="text-xs text-muted-foreground">{new Date(q.created_at).toLocaleDateString('pt-AO')}</span>
                  </div>
                  <p className="text-sm text-muted-foreground mb-2">{q.description}</p>
                  <div className="text-xs text-muted-foreground flex flex-wrap gap-3">
                    <span>{q.contact_name}</span>
                    <a href={`mailto:${q.contact_email}`} className="text-primary hover:underline">{q.contact_email}</a>
                    {q.contact_phone && <a href={`tel:${q.contact_phone}`} className="text-primary hover:underline">{q.contact_phone}</a>}
                    {q.budget_estimate && <span>Orçamento: {q.budget_estimate} Kz</span>}
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Basic */}
        <section className="card-elevated p-6 space-y-4">
          <h2 className="font-display font-bold text-lg">Informação básica</h2>
          <div className="grid sm:grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-muted-foreground">Tipo</label>
              <select value={form.type} onChange={e => setForm({ ...form, type: e.target.value })} className="w-full h-10 rounded-md border border-input bg-background px-3 text-sm">
                <option value="company">Empresa de Contabilidade</option>
                <option value="individual">Profissional Individual</option>
              </select>
            </div>
            <Input placeholder="Nome da empresa / profissional *" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} maxLength={150} />
            <Input placeholder="NIF" value={form.nif} onChange={e => setForm({ ...form, nif: e.target.value })} />
            <Input placeholder="Email *" type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} />
            <Input placeholder="Telefone" value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} />
            <Input placeholder="WhatsApp (com indicativo, ex: +244923000000)" value={form.whatsapp} onChange={e => setForm({ ...form, whatsapp: e.target.value })} />
            <Input placeholder="Website" value={form.website} onChange={e => setForm({ ...form, website: e.target.value })} />
            <select value={form.province} onChange={e => setForm({ ...form, province: e.target.value })} className="h-10 rounded-md border border-input bg-background px-3 text-sm">
              <option value="">Província</option>
              {ANGOLA_PROVINCES.map(p => <option key={p} value={p}>{p}</option>)}
            </select>
            <Input placeholder="Morada" value={form.address} onChange={e => setForm({ ...form, address: e.target.value })} className="sm:col-span-2" />
          </div>
          <Textarea placeholder="Descrição (apresente a sua empresa, valores, missão, clientes-alvo...)" value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} maxLength={2000} rows={4} />
          <div>
            <label className="text-xs text-muted-foreground">Logotipo</label>
            <div className="flex items-center gap-3 mt-1">
              {form.logo_url && <img src={form.logo_url} alt="logo" className="w-16 h-16 rounded-lg object-cover border border-border" />}
              <label className="cursor-pointer">
                <input type="file" accept="image/*" className="hidden" onChange={e => e.target.files?.[0] && uploadLogo(e.target.files[0])} />
                <span className="inline-flex items-center gap-2 px-4 py-2 rounded-md border border-input bg-background text-sm hover:bg-muted">
                  <Upload className="w-4 h-4" /> Carregar logotipo
                </span>
              </label>
            </div>
          </div>
        </section>

        {/* Professional */}
        <section className="card-elevated p-6 space-y-4">
          <h2 className="font-display font-bold text-lg">Credenciais profissionais</h2>
          <div className="grid sm:grid-cols-2 gap-3">
            <Input placeholder="Nº Cédula Ordem dos Contabilistas" value={form.cedula_number} onChange={e => setForm({ ...form, cedula_number: e.target.value })} />
            <Input placeholder="Anos de experiência" type="number" value={form.years_experience} onChange={e => setForm({ ...form, years_experience: e.target.value })} />
          </div>
          <div>
            <p className="text-xs text-muted-foreground mb-2">Especialidades</p>
            <div className="flex flex-wrap gap-2">
              {SPECIALTY_OPTIONS.map(s => (
                <button key={s} type="button" onClick={() => toggleArr('specialties', s)}
                  className={`text-xs px-3 py-1 rounded-full border transition-colors ${form.specialties.includes(s) ? 'bg-primary text-primary-foreground border-primary' : 'bg-background border-border hover:bg-muted'}`}>
                  {s}
                </button>
              ))}
            </div>
          </div>
          <div>
            <p className="text-xs text-muted-foreground mb-2">Idiomas</p>
            <div className="flex flex-wrap gap-2">
              {LANGUAGE_OPTIONS.map(s => (
                <button key={s} type="button" onClick={() => toggleArr('languages', s)}
                  className={`text-xs px-3 py-1 rounded-full border transition-colors ${form.languages.includes(s) ? 'bg-primary text-primary-foreground border-primary' : 'bg-background border-border hover:bg-muted'}`}>
                  {s}
                </button>
              ))}
            </div>
          </div>
        </section>

        {/* Services */}
        <section className="card-elevated p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-display font-bold text-lg">Serviços e preços</h2>
            <Button size="sm" variant="outline" onClick={addService}><Plus className="w-4 h-4 mr-1" /> Adicionar</Button>
          </div>
          <div className="grid sm:grid-cols-2 gap-3">
            <Input placeholder="Faixa de preços mínima (Kz)" type="number" value={form.price_range_min} onChange={e => setForm({ ...form, price_range_min: e.target.value })} />
            <Input placeholder="Faixa de preços máxima (Kz)" type="number" value={form.price_range_max} onChange={e => setForm({ ...form, price_range_max: e.target.value })} />
          </div>
          <div className="space-y-3">
            {form.services.map((s: ProviderService, i: number) => (
              <div key={i} className="grid sm:grid-cols-[1fr_120px_120px_140px_40px] gap-2 items-center p-3 rounded-lg bg-muted/30">
                <Input placeholder="Nome do serviço" value={s.name} onChange={e => updateService(i, 'name', e.target.value)} />
                <Input placeholder="Mín. Kz" type="number" value={s.price_min || ''} onChange={e => updateService(i, 'price_min', e.target.value ? Number(e.target.value) : null)} />
                <Input placeholder="Máx. Kz" type="number" value={s.price_max || ''} onChange={e => updateService(i, 'price_max', e.target.value ? Number(e.target.value) : null)} />
                <Input placeholder="Modalidade (mensal/único)" value={s.modality || ''} onChange={e => updateService(i, 'modality', e.target.value)} />
                <Button size="icon" variant="ghost" onClick={() => removeService(i)}><Trash2 className="w-4 h-4 text-destructive" /></Button>
              </div>
            ))}
            {form.services.length === 0 && <p className="text-sm text-muted-foreground">Adicione os serviços que oferece e os respectivos preços.</p>}
          </div>
        </section>

        <div className="sticky bottom-4 z-10 flex justify-end">
          <Button onClick={save} disabled={saving} size="lg" className="btn-gold shadow-xl">
            <Save className="w-4 h-4 mr-2" /> {saving ? 'A guardar...' : (existing ? 'Guardar alterações' : 'Submeter para aprovação')}
          </Button>
        </div>
      </main>
    </div>
  );
};

export default MyProvider;
