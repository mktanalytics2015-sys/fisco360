import { useState } from 'react';
import { Building2, Users, DollarSign, MapPin, Briefcase, Calendar, Package, Plane } from 'lucide-react';
import { companyTypes, activityTypes, provinces } from '@/data/angolaTaxData';

interface FormData {
  companyType: string;
  annualRevenue: string;
  employeeCount: string;
  province: string;
  activityType: string;
  establishmentYear: string;
  hasAssets: boolean;
  hasImportExport: boolean;
  hasVehicles: boolean;
}

interface SimulatorFormProps {
  onSimulate: (data: FormData) => void;
  isLoading: boolean;
}

const SimulatorForm = ({ onSimulate, isLoading }: SimulatorFormProps) => {
  const [formData, setFormData] = useState<FormData>({
    companyType: '',
    annualRevenue: '',
    employeeCount: '',
    province: '',
    activityType: '',
    establishmentYear: '',
    hasAssets: false,
    hasImportExport: false,
    hasVehicles: false
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSimulate(formData);
  };

  const handleChange = (field: keyof FormData, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 50 }, (_, i) => currentYear - i);

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Tipo de Empresa */}
      <div className="space-y-2">
        <label className="flex items-center gap-2 text-sm font-medium text-foreground">
          <Building2 className="w-4 h-4 text-primary" />
          Tipo de Empresa *
        </label>
        <select
          value={formData.companyType}
          onChange={(e) => handleChange('companyType', e.target.value)}
          className="input-styled"
          required
        >
          <option value="">Seleccione o tipo de empresa</option>
          {companyTypes.map(type => (
            <option key={type.id} value={type.id}>
              {type.name} - {type.description}
            </option>
          ))}
        </select>
      </div>

      {/* Volume de Negócios */}
      <div className="space-y-2">
        <label className="flex items-center gap-2 text-sm font-medium text-foreground">
          <DollarSign className="w-4 h-4 text-primary" />
          Volume de Negócios Anual (Kz) *
        </label>
        <input
          type="number"
          value={formData.annualRevenue}
          onChange={(e) => handleChange('annualRevenue', e.target.value)}
          className="input-styled"
          placeholder="Ex: 50000000"
          min="0"
          required
        />
        <p className="text-xs text-muted-foreground">
          Insira o valor em Kwanzas sem pontos ou vírgulas
        </p>
      </div>

      {/* Número de Trabalhadores */}
      <div className="space-y-2">
        <label className="flex items-center gap-2 text-sm font-medium text-foreground">
          <Users className="w-4 h-4 text-primary" />
          Número de Trabalhadores *
        </label>
        <input
          type="number"
          value={formData.employeeCount}
          onChange={(e) => handleChange('employeeCount', e.target.value)}
          className="input-styled"
          placeholder="Ex: 15"
          min="0"
          required
        />
      </div>

      {/* Província */}
      <div className="space-y-2">
        <label className="flex items-center gap-2 text-sm font-medium text-foreground">
          <MapPin className="w-4 h-4 text-primary" />
          Província *
        </label>
        <select
          value={formData.province}
          onChange={(e) => handleChange('province', e.target.value)}
          className="input-styled"
          required
        >
          <option value="">Seleccione a província</option>
          {provinces.map(province => (
            <option key={province} value={province}>{province}</option>
          ))}
        </select>
      </div>

      {/* Tipo de Actividade */}
      <div className="space-y-2">
        <label className="flex items-center gap-2 text-sm font-medium text-foreground">
          <Briefcase className="w-4 h-4 text-primary" />
          Tipo de Actividade Principal *
        </label>
        <select
          value={formData.activityType}
          onChange={(e) => handleChange('activityType', e.target.value)}
          className="input-styled"
          required
        >
          <option value="">Seleccione o tipo de actividade</option>
          {activityTypes.map(type => (
            <option key={type.id} value={type.id}>
              {type.name} - {type.description}
            </option>
          ))}
        </select>
      </div>

      {/* Ano de Constituição */}
      <div className="space-y-2">
        <label className="flex items-center gap-2 text-sm font-medium text-foreground">
          <Calendar className="w-4 h-4 text-primary" />
          Ano de Constituição
        </label>
        <select
          value={formData.establishmentYear}
          onChange={(e) => handleChange('establishmentYear', e.target.value)}
          className="input-styled"
        >
          <option value="">Seleccione o ano</option>
          {years.map(year => (
            <option key={year} value={year}>{year}</option>
          ))}
        </select>
      </div>

      {/* Opções Adicionais */}
      <div className="space-y-4 pt-4 border-t border-border">
        <p className="text-sm font-medium text-foreground">Informações Adicionais</p>
        
        <label className="flex items-center gap-3 cursor-pointer group">
          <input
            type="checkbox"
            checked={formData.hasAssets}
            onChange={(e) => handleChange('hasAssets', e.target.checked)}
            className="w-5 h-5 rounded border-border text-primary focus:ring-primary"
          />
          <Package className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
          <span className="text-sm text-foreground">Possui imóveis ou propriedades</span>
        </label>

        <label className="flex items-center gap-3 cursor-pointer group">
          <input
            type="checkbox"
            checked={formData.hasImportExport}
            onChange={(e) => handleChange('hasImportExport', e.target.checked)}
            className="w-5 h-5 rounded border-border text-primary focus:ring-primary"
          />
          <Plane className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
          <span className="text-sm text-foreground">Realiza importação/exportação</span>
        </label>

        <label className="flex items-center gap-3 cursor-pointer group">
          <input
            type="checkbox"
            checked={formData.hasVehicles}
            onChange={(e) => handleChange('hasVehicles', e.target.checked)}
            className="w-5 h-5 rounded border-border text-primary focus:ring-primary"
          />
          <span className="text-sm text-foreground">Possui veículos empresariais</span>
        </label>
      </div>

      {/* Submit Button */}
      <button
        type="submit"
        disabled={isLoading}
        className="btn-gold w-full text-lg disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isLoading ? (
          <span className="flex items-center justify-center gap-2">
            <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
            A processar...
          </span>
        ) : (
          'SIMULAR ENQUADRAMENTO'
        )}
      </button>
    </form>
  );
};

export default SimulatorForm;
