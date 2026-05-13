export type ProviderType = 'company' | 'individual';
export type ProviderStatus = 'pending' | 'approved' | 'rejected';

export interface ProviderService {
  name: string;
  price_min?: number | null;
  price_max?: number | null;
  modality?: string;
}

export interface AccountingProvider {
  id: string;
  owner_id: string;
  type: ProviderType;
  name: string;
  nif: string | null;
  email: string;
  phone: string | null;
  whatsapp: string | null;
  website: string | null;
  address: string | null;
  province: string | null;
  description: string | null;
  logo_url: string | null;
  cedula_number: string | null;
  years_experience: number | null;
  specialties: string[];
  languages: string[];
  services: ProviderService[];
  price_range_min: number | null;
  price_range_max: number | null;
  status: ProviderStatus;
  is_featured: boolean;
  is_verified: boolean;
  is_premium: boolean;
  rating_avg: number;
  rating_count: number;
  created_at: string;
  updated_at: string;
}

export const ANGOLA_PROVINCES = [
  'Bengo', 'Benguela', 'Bié', 'Cabinda', 'Cuando-Cubango', 'Cuanza Norte',
  'Cuanza Sul', 'Cunene', 'Huambo', 'Huíla', 'Luanda', 'Lunda Norte',
  'Lunda Sul', 'Malanje', 'Moxico', 'Namibe', 'Uíge', 'Zaire'
];

export const SPECIALTY_OPTIONS = [
  'Contabilidade Geral', 'Auditoria', 'Consultoria Fiscal', 'Folha de Salários',
  'Declarações AGT', 'IVA', 'IRT', 'Imposto Industrial', 'Constituição de Empresas',
  'Recuperação de Empresas', 'Contabilidade Bancária', 'NIF e Licenciamentos'
];

export const LANGUAGE_OPTIONS = ['Português', 'Inglês', 'Francês', 'Espanhol', 'Umbundu', 'Kimbundu'];
