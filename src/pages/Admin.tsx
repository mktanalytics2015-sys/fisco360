import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Scale, Users, BarChart3, ArrowLeft, Shield, Crown, Ban, CheckCircle, Search, RefreshCw, Download, ShieldCheck } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface UserProfile {
  id: string;
  user_id: string;
  full_name: string | null;
  email: string | null;
  avatar_url: string | null;
  subscription_status: 'free' | 'premium' | 'cancelled';
  simulations_this_month: number;
  is_active: boolean;
  created_at: string;
}

const Admin = () => {
  const { isAdmin, loading, user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<UserProfile[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'free' | 'premium'>('all');
  const [stats, setStats] = useState({ total: 0, premium: 0, active: 0, simulationsMonth: 0 });
  const [loadingUsers, setLoadingUsers] = useState(true);
  const [adminUserIds, setAdminUserIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (!loading && (!user || !isAdmin)) {
      navigate('/');
    }
  }, [loading, user, isAdmin, navigate]);

  useEffect(() => {
    if (isAdmin) fetchUsers();
  }, [isAdmin]);

  useEffect(() => {
    let result = users;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      result = result.filter(u =>
        (u.full_name || '').toLowerCase().includes(q) ||
        (u.email || '').toLowerCase().includes(q)
      );
    }
    if (filterStatus !== 'all') {
      result = result.filter(u => u.subscription_status === filterStatus);
    }
    setFilteredUsers(result);
  }, [users, searchQuery, filterStatus]);

  const fetchUsers = async () => {
    setLoadingUsers(true);
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .order('created_at', { ascending: false });

    // Fetch admin roles
    const { data: roles } = await supabase
      .from('user_roles')
      .select('user_id, role');
    
    const adminIds = new Set<string>(
      (roles || []).filter(r => r.role === 'admin').map(r => r.user_id)
    );
    setAdminUserIds(adminIds);

    if (data) {
      setUsers(data as UserProfile[]);
      setStats({
        total: data.length,
        premium: data.filter(u => u.subscription_status === 'premium').length,
        active: data.filter(u => u.is_active).length,
        simulationsMonth: data.reduce((sum, u) => sum + u.simulations_this_month, 0),
      });
    }
    if (error) toast({ title: 'Erro', description: error.message, variant: 'destructive' });
    setLoadingUsers(false);
  };

  const toggleActive = async (userId: string, currentStatus: boolean) => {
    const { error } = await supabase
      .from('profiles')
      .update({ is_active: !currentStatus })
      .eq('user_id', userId);
    if (!error) {
      toast({ title: currentStatus ? 'Conta desactivada' : 'Conta activada' });
      fetchUsers();
    }
  };

  const togglePremium = async (userId: string, currentStatus: string) => {
    const newStatus = currentStatus === 'premium' ? 'free' : 'premium';
    const { error } = await supabase
      .from('profiles')
      .update({ subscription_status: newStatus })
      .eq('user_id', userId);
    if (!error) {
      toast({ title: newStatus === 'premium' ? '⭐ Plano Premium atribuído' : 'Plano revertido para gratuito' });
      fetchUsers();
    }
  };

  const toggleAdmin = async (userId: string) => {
    // Check if user already has admin role
    const { data: existingRole } = await supabase
      .from('user_roles')
      .select('*')
      .eq('user_id', userId)
      .eq('role', 'admin')
      .maybeSingle();

    if (existingRole) {
      // Remove admin role
      const { error } = await supabase
        .from('user_roles')
        .delete()
        .eq('user_id', userId)
        .eq('role', 'admin');
      if (!error) {
        toast({ title: 'Role de administrador removido' });
      }
    } else {
      // Add admin role
      const { error } = await supabase
        .from('user_roles')
        .insert({ user_id: userId, role: 'admin' });
      if (!error) {
        toast({ title: '🛡️ Role de administrador atribuído' });
      }
    }
  };

  const exportCSV = () => {
    const headers = ['Nome', 'Email', 'Plano', 'Simulações/Mês', 'Estado', 'Data de Registo'];
    const rows = filteredUsers.map(u => [
      u.full_name || 'Sem nome',
      u.email || '',
      u.subscription_status === 'premium' ? 'Premium' : 'Gratuito',
      u.simulations_this_month.toString(),
      u.is_active ? 'Activo' : 'Inactivo',
      new Date(u.created_at).toLocaleDateString('pt-AO'),
    ]);
    const csv = [headers, ...rows].map(r => r.map(c => `"${c}"`).join(',')).join('\n');
    const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `utilizadores_fisco360_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast({ title: 'CSV exportado com sucesso!' });
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="hero-gradient text-primary-foreground py-6">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Shield className="w-6 h-6" />
              <div>
                <h1 className="text-2xl font-display font-bold">Backoffice</h1>
                <p className="text-sm text-primary-foreground/70">Gestão da plataforma Fisco 360</p>
              </div>
            </div>
            <button onClick={() => navigate('/')} className="flex items-center gap-2 text-primary-foreground/80 hover:text-primary-foreground text-sm">
              <ArrowLeft className="w-4 h-4" /> Voltar
            </button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 space-y-8">
        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { icon: Users, label: 'Total Utilizadores', value: stats.total, color: 'text-primary' },
            { icon: Crown, label: 'Premium', value: stats.premium, color: 'text-accent' },
            { icon: CheckCircle, label: 'Activos', value: stats.active, color: 'text-green-600' },
            { icon: BarChart3, label: 'Simulações (mês)', value: stats.simulationsMonth, color: 'text-primary' },
          ].map((stat, i) => (
            <div key={i} className="card-elevated p-4">
              <div className="flex items-center gap-2 mb-2">
                <stat.icon className={`w-5 h-5 ${stat.color}`} />
                <span className="text-xs text-muted-foreground">{stat.label}</span>
              </div>
              <p className="text-2xl font-bold text-foreground">{stat.value}</p>
            </div>
          ))}
        </div>

        {/* Filters */}
        <div className="card-elevated p-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Pesquisar por nome ou email..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex gap-2">
              {(['all', 'free', 'premium'] as const).map(status => (
                <Button
                  key={status}
                  size="sm"
                  variant={filterStatus === status ? 'default' : 'outline'}
                  onClick={() => setFilterStatus(status)}
                >
                  {status === 'all' ? 'Todos' : status === 'free' ? 'Gratuitos' : 'Premium'}
                </Button>
              ))}
              <Button size="sm" variant="outline" onClick={fetchUsers}>
                <RefreshCw className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>

        {/* Users Table */}
        <div className="card-elevated overflow-hidden">
          <div className="p-4 border-b border-border flex items-center justify-between">
            <h2 className="font-display font-bold text-lg text-foreground">Gestão de Utilizadores</h2>
            <div className="flex items-center gap-3">
              <span className="text-sm text-muted-foreground">{filteredUsers.length} resultado(s)</span>
              <Button size="sm" variant="outline" onClick={exportCSV}>
                <Download className="w-4 h-4 mr-1" /> Exportar CSV
              </Button>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                 <tr className="border-b border-border bg-muted/50">
                   <th className="text-left p-3 text-xs font-medium text-muted-foreground uppercase">Utilizador</th>
                   <th className="text-left p-3 text-xs font-medium text-muted-foreground uppercase">Email</th>
                   <th className="text-left p-3 text-xs font-medium text-muted-foreground uppercase">Role</th>
                   <th className="text-left p-3 text-xs font-medium text-muted-foreground uppercase">Plano</th>
                   <th className="text-left p-3 text-xs font-medium text-muted-foreground uppercase">Simulações</th>
                   <th className="text-left p-3 text-xs font-medium text-muted-foreground uppercase">Estado</th>
                   <th className="text-left p-3 text-xs font-medium text-muted-foreground uppercase">Registado em</th>
                   <th className="text-right p-3 text-xs font-medium text-muted-foreground uppercase">Acções</th>
                 </tr>
              </thead>
              <tbody>
                {loadingUsers ? (
                   <tr><td colSpan={8} className="p-8 text-center text-muted-foreground">A carregar...</td></tr>
                 ) : filteredUsers.length === 0 ? (
                   <tr><td colSpan={8} className="p-8 text-center text-muted-foreground">Nenhum utilizador encontrado</td></tr>
                ) : filteredUsers.map(u => (
                  <tr key={u.id} className="border-b border-border hover:bg-muted/30 transition-colors">
                    <td className="p-3">
                      <div className="flex items-center gap-3">
                        {u.avatar_url ? (
                          <img src={u.avatar_url} alt="" className="w-8 h-8 rounded-full" />
                        ) : (
                          <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                            <Users className="w-4 h-4 text-primary" />
                          </div>
                        )}
                        <span className="text-sm font-medium text-foreground">{u.full_name || 'Sem nome'}</span>
                      </div>
                    </td>
                    <td className="p-3 text-sm text-muted-foreground">{u.email || '—'}</td>
                    <td className="p-3">
                      <Badge variant={u.subscription_status === 'premium' ? 'default' : 'secondary'}>
                        {u.subscription_status === 'premium' ? '⭐ Premium' : 'Gratuito'}
                      </Badge>
                    </td>
                    <td className="p-3 text-sm text-muted-foreground">{u.simulations_this_month}/mês</td>
                    <td className="p-3">
                      <Badge variant={u.is_active ? 'default' : 'destructive'}>
                        {u.is_active ? 'Activo' : 'Inactivo'}
                      </Badge>
                    </td>
                    <td className="p-3 text-sm text-muted-foreground">
                      {new Date(u.created_at).toLocaleDateString('pt-AO')}
                    </td>
                    <td className="p-3">
                      <div className="flex gap-2 justify-end">
                        <Button
                          size="sm"
                          variant={u.subscription_status === 'premium' ? 'outline' : 'default'}
                          onClick={() => togglePremium(u.user_id, u.subscription_status)}
                          title={u.subscription_status === 'premium' ? 'Remover Premium' : 'Dar Premium'}
                          className={u.subscription_status !== 'premium' ? 'btn-gold' : ''}
                        >
                          <Crown className="w-4 h-4 mr-1" />
                          {u.subscription_status === 'premium' ? 'Remover' : 'Premium'}
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => toggleAdmin(u.user_id)}
                          title="Atribuir/Remover Admin"
                        >
                          <ShieldCheck className="w-4 h-4 mr-1" />
                          Admin
                        </Button>
                        <Button
                          size="sm"
                          variant={u.is_active ? 'destructive' : 'default'}
                          onClick={() => toggleActive(u.user_id, u.is_active)}
                          title={u.is_active ? 'Desactivar' : 'Activar'}
                        >
                          {u.is_active ? <Ban className="w-4 h-4" /> : <CheckCircle className="w-4 h-4" />}
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Admin;
