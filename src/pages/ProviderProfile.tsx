import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { ArrowLeft, Building2, MapPin, Phone, Mail, Globe, Star, BadgeCheck, Crown, MessageCircle, ScrollText, Award, Languages, Briefcase } from 'lucide-react';
import type { AccountingProvider } from '@/types/provider';

interface Review { id: string; user_id: string; rating: number; comment: string | null; created_at: string }

const ProviderProfile = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const [provider, setProvider] = useState<AccountingProvider | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [quote, setQuote] = useState({ contact_name: '', contact_email: '', contact_phone: '', service_needed: '', description: '', budget_estimate: '' });
  const [quoteOpen, setQuoteOpen] = useState(false);

  const load = async () => {
    if (!id) return;
    const [{ data: p }, { data: r }] = await Promise.all([
      supabase.from('accounting_providers').select('*').eq('id', id).maybeSingle(),
      supabase.from('provider_reviews').select('*').eq('provider_id', id).order('created_at', { ascending: false }),
    ]);
    setProvider((p as any) || null);
    setReviews((r as any) || []);
    setLoading(false);
  };

  useEffect(() => { load(); }, [id]);

  const submitReview = async () => {
    if (!user) { navigate('/auth'); return; }
    if (!id) return;
    const { error } = await supabase
      .from('provider_reviews')
      .upsert({ provider_id: id, user_id: user.id, rating, comment: comment || null }, { onConflict: 'provider_id,user_id' });
    if (error) toast({ title: 'Erro', description: error.message, variant: 'destructive' });
    else { toast({ title: 'Avaliação enviada' }); setComment(''); load(); }
  };

  const submitQuote = async () => {
    if (!id) return;
    if (!quote.contact_name || !quote.contact_email || !quote.service_needed || !quote.description) {
      toast({ title: 'Preencha os campos obrigatórios', variant: 'destructive' }); return;
    }
    const { error } = await supabase.from('quote_requests').insert({
      provider_id: id,
      requester_id: user?.id || null,
      contact_name: quote.contact_name,
      contact_email: quote.contact_email,
      contact_phone: quote.contact_phone || null,
      service_needed: quote.service_needed,
      description: quote.description,
      budget_estimate: quote.budget_estimate ? Number(quote.budget_estimate) : null,
    });
    if (error) toast({ title: 'Erro', description: error.message, variant: 'destructive' });
    else { toast({ title: '✅ Pedido enviado', description: 'O profissional irá responder por email/telefone.' }); setQuoteOpen(false); }
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center">A carregar...</div>;
  if (!provider) return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-4">
      <p>Empresa não encontrada</p>
      <Button onClick={() => navigate('/diretorio')}>Voltar ao diretório</Button>
    </div>
  );

  const whatsappUrl = provider.whatsapp
    ? `https://wa.me/${provider.whatsapp.replace(/\D/g, '')}?text=${encodeURIComponent(`Olá ${provider.name}, encontrei-vos no diretório Fisco 360 e gostaria de saber mais sobre os vossos serviços.`)}`
    : null;

  return (
    <div className="min-h-screen bg-background">
      <header className="hero-gradient text-primary-foreground py-6">
        <div className="container mx-auto px-4">
          <button onClick={() => navigate('/diretorio')} className="flex items-center gap-2 text-primary-foreground/80 hover:text-primary-foreground text-sm mb-6">
            <ArrowLeft className="w-4 h-4" /> Diretório
          </button>
          <div className="flex flex-col md:flex-row gap-6 items-start">
            {provider.logo_url ? (
              <img src={provider.logo_url} alt={provider.name} className="w-24 h-24 rounded-xl object-cover border-2 border-white/20" />
            ) : (
              <div className="w-24 h-24 rounded-xl bg-white/10 flex items-center justify-center">
                <Building2 className="w-10 h-10" />
              </div>
            )}
            <div className="flex-1">
              <div className="flex items-center gap-2 flex-wrap mb-2">
                <h1 className="text-3xl font-display font-bold">{provider.name}</h1>
                {provider.is_verified && <Badge className="bg-accent text-accent-foreground gap-1"><BadgeCheck className="w-3 h-3" /> Selo Ordem</Badge>}
                {provider.is_premium && <Badge className="bg-white/20 gap-1"><Crown className="w-3 h-3" /> Premium</Badge>}
              </div>
              <p className="text-primary-foreground/80 mb-3">{provider.type === 'company' ? 'Empresa de Contabilidade' : 'Contabilista Certificado'}</p>
              <div className="flex flex-wrap gap-4 text-sm">
                {provider.province && <span className="flex items-center gap-1"><MapPin className="w-4 h-4" /> {provider.province}</span>}
                <span className="flex items-center gap-1"><Star className="w-4 h-4 fill-accent text-accent" /> {Number(provider.rating_avg).toFixed(1)} ({provider.rating_count} avaliações)</span>
                {provider.years_experience ? <span className="flex items-center gap-1"><Award className="w-4 h-4" /> {provider.years_experience}+ anos</span> : null}
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {provider.description && (
            <section className="card-elevated p-6">
              <h2 className="font-display font-bold text-lg mb-3">Sobre</h2>
              <p className="text-sm text-muted-foreground whitespace-pre-line">{provider.description}</p>
            </section>
          )}

          {provider.specialties?.length > 0 && (
            <section className="card-elevated p-6">
              <h2 className="font-display font-bold text-lg mb-3 flex items-center gap-2"><Briefcase className="w-5 h-5 text-primary" /> Especialidades</h2>
              <div className="flex flex-wrap gap-2">
                {provider.specialties.map(s => <Badge key={s} variant="secondary">{s}</Badge>)}
              </div>
            </section>
          )}

          {provider.services?.length > 0 && (
            <section className="card-elevated p-6">
              <h2 className="font-display font-bold text-lg mb-3">Serviços e preços</h2>
              <div className="space-y-2">
                {provider.services.map((s, i) => (
                  <div key={i} className="flex items-center justify-between p-3 rounded-lg bg-muted/40">
                    <div>
                      <p className="font-medium text-sm">{s.name}</p>
                      {s.modality && <p className="text-xs text-muted-foreground">{s.modality}</p>}
                    </div>
                    {(s.price_min || s.price_max) && (
                      <p className="text-sm font-semibold text-primary">
                        {s.price_min && s.price_max ? `${s.price_min}–${s.price_max}` : (s.price_min || s.price_max)} Kz
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Reviews */}
          <section className="card-elevated p-6">
            <h2 className="font-display font-bold text-lg mb-4">Avaliações ({reviews.length})</h2>
            {user && (
              <div className="mb-6 p-4 rounded-lg border border-border space-y-3">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium">Sua nota:</span>
                  {[1,2,3,4,5].map(n => (
                    <button key={n} onClick={() => setRating(n)} type="button">
                      <Star className={`w-5 h-5 ${n <= rating ? 'fill-accent text-accent' : 'text-muted-foreground'}`} />
                    </button>
                  ))}
                </div>
                <Textarea placeholder="Deixe um comentário (opcional)..." value={comment} onChange={e => setComment(e.target.value)} maxLength={500} />
                <Button size="sm" onClick={submitReview}>Publicar avaliação</Button>
              </div>
            )}
            {reviews.length === 0 ? (
              <p className="text-sm text-muted-foreground">Ainda sem avaliações. Seja o primeiro!</p>
            ) : (
              <div className="space-y-4">
                {reviews.map(r => (
                  <div key={r.id} className="border-b border-border pb-3 last:border-0">
                    <div className="flex items-center gap-1 mb-1">
                      {[1,2,3,4,5].map(n => <Star key={n} className={`w-4 h-4 ${n <= r.rating ? 'fill-accent text-accent' : 'text-muted-foreground'}`} />)}
                      <span className="text-xs text-muted-foreground ml-2">{new Date(r.created_at).toLocaleDateString('pt-AO')}</span>
                    </div>
                    {r.comment && <p className="text-sm text-muted-foreground">{r.comment}</p>}
                  </div>
                ))}
              </div>
            )}
          </section>
        </div>

        {/* Sidebar */}
        <aside className="space-y-4">
          <div className="card-elevated p-6 space-y-3">
            <h3 className="font-display font-bold">Contactos</h3>
            <a href={`mailto:${provider.email}`} className="flex items-center gap-2 text-sm text-foreground hover:text-primary"><Mail className="w-4 h-4" /> {provider.email}</a>
            {provider.phone && <a href={`tel:${provider.phone}`} className="flex items-center gap-2 text-sm text-foreground hover:text-primary"><Phone className="w-4 h-4" /> {provider.phone}</a>}
            {provider.website && <a href={provider.website} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-sm text-foreground hover:text-primary"><Globe className="w-4 h-4" /> Website</a>}
            {provider.address && <p className="flex items-start gap-2 text-sm text-muted-foreground"><MapPin className="w-4 h-4 mt-0.5" /> {provider.address}</p>}

            {whatsappUrl && (
              <a href={whatsappUrl} target="_blank" rel="noopener noreferrer">
                <Button className="w-full bg-green-600 hover:bg-green-700 text-white"><MessageCircle className="w-4 h-4 mr-1" /> WhatsApp</Button>
              </a>
            )}

            <Dialog open={quoteOpen} onOpenChange={setQuoteOpen}>
              <DialogTrigger asChild>
                <Button className="w-full btn-gold"><ScrollText className="w-4 h-4 mr-1" /> Pedir Orçamento</Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader><DialogTitle>Pedir orçamento a {provider.name}</DialogTitle></DialogHeader>
                <div className="space-y-3">
                  <Input placeholder="Seu nome *" value={quote.contact_name} onChange={e => setQuote({ ...quote, contact_name: e.target.value })} />
                  <Input placeholder="Email *" type="email" value={quote.contact_email} onChange={e => setQuote({ ...quote, contact_email: e.target.value })} />
                  <Input placeholder="Telefone (opcional)" value={quote.contact_phone} onChange={e => setQuote({ ...quote, contact_phone: e.target.value })} />
                  <Input placeholder="Serviço pretendido *" value={quote.service_needed} onChange={e => setQuote({ ...quote, service_needed: e.target.value })} />
                  <Textarea placeholder="Descreva a sua necessidade *" value={quote.description} onChange={e => setQuote({ ...quote, description: e.target.value })} maxLength={1000} />
                  <Input placeholder="Orçamento estimado em Kz (opcional)" type="number" value={quote.budget_estimate} onChange={e => setQuote({ ...quote, budget_estimate: e.target.value })} />
                </div>
                <DialogFooter>
                  <Button onClick={submitQuote} className="w-full btn-gold">Enviar pedido</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>

          {(provider.cedula_number || provider.languages?.length > 0) && (
            <div className="card-elevated p-6 space-y-3">
              {provider.cedula_number && (
                <div>
                  <p className="text-xs uppercase text-muted-foreground">Nº Cédula da Ordem</p>
                  <p className="font-semibold text-foreground">{provider.cedula_number}</p>
                </div>
              )}
              {provider.languages?.length > 0 && (
                <div>
                  <p className="text-xs uppercase text-muted-foreground flex items-center gap-1"><Languages className="w-3 h-3" /> Idiomas</p>
                  <p className="text-sm">{provider.languages.join(', ')}</p>
                </div>
              )}
              {(provider.price_range_min || provider.price_range_max) && (
                <div>
                  <p className="text-xs uppercase text-muted-foreground">Faixa de preços</p>
                  <p className="text-sm font-semibold text-primary">
                    {provider.price_range_min || 0} – {provider.price_range_max || '∞'} Kz
                  </p>
                </div>
              )}
            </div>
          )}
        </aside>
      </main>
    </div>
  );
};

export default ProviderProfile;
