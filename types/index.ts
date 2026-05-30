export type Role = 'AGRONOMO' | 'SUPERVISOR' | 'ADMIN';

export type Cultivo =
  | 'SOYA'
  | 'MAIZ'
  | 'QUINUA'
  | 'PAPA'
  | 'TRIGO'
  | 'GIRASOL'
  | 'CITRICOS'
  | 'TOMATE'
  | 'CEBOLLA'
  | 'OTRO';

export type Severidad = 'BAJA' | 'MEDIA' | 'ALTA' | 'CRITICA';

export type TipoInforme = 'FITOSANITARIO' | 'MENSUAL' | 'PARCELA' | 'CAMPANA';

export type TipoDiagnostico =
  | 'ENFERMEDAD'
  | 'PLAGA'
  | 'DEFICIENCIA'
  | 'FISIOLOGICO'
  | 'NORMAL';

export type UrgenciaDiagnostico = 'INMEDIATA' | 'ESTA_SEMANA' | 'MONITOREAR';

export type RiesgoEconomico = 'BAJO' | 'MEDIO' | 'ALTO' | 'CRITICO';

export interface HipotesisDiagnostico {
  nombre: string;
  tipo: TipoDiagnostico;
  confianza: number;
  descripcion: string;
  sintomas: string;
  accion: string;
  urgencia: UrgenciaDiagnostico;
}

export interface DiagnosticoResult {
  hipotesis: HipotesisDiagnostico[];
  observacionGeneral: string;
  riesgoEconomico: RiesgoEconomico;
}

export interface User {
  id: string;
  email: string;
  name: string;
  role: Role;
  organizacion?: string | null;
  createdAt: Date;
}

export interface Parcela {
  id: string;
  nombre: string;
  cultivo: Cultivo;
  superficie: number;
  lat: number;
  lng: number;
  poligono?: unknown;
  productor: string;
  municipio: string;
  departamento: string;
  activa: boolean;
  createdAt: Date;
  updatedAt: Date;
  userId: string;
}

export interface Visita {
  id: string;
  fecha: Date;
  fenologia: string;
  observaciones: string;
  fotosUrls: string[];
  severidad: Severidad;
  temperaturaMin?: number | null;
  temperaturaMax?: number | null;
  humedad?: number | null;
  diagnosticoId?: string | null;
  recomendacion?: string | null;
  productoAplicado?: string | null;
  dosis?: string | null;
  seguimiento?: string | null;
  offlineId?: string | null;
  syncedAt?: Date | null;
  createdAt: Date;
  parcelaId: string;
  userId: string;
  parcela?: Parcela;
  diagnostico?: Diagnostico;
}

export interface Diagnostico {
  id: string;
  fotoUrl: string;
  hipotesis: HipotesisDiagnostico[];
  modelVersion: string;
  createdAt: Date;
}

export interface Informe {
  id: string;
  titulo: string;
  periodo: string;
  tipo: TipoInforme;
  pdfUrl?: string | null;
  visitasIds: string[];
  metadata: Record<string, unknown>;
  createdAt: Date;
  userId: string;
}

export interface VisitaLocal {
  offlineId: string;
  parcelaId: string;
  fecha: string;
  fenologia: string;
  observaciones: string;
  severidad: string;
  fotosBase64: string[];
  recomendacion?: string;
  createdAt: string;
  synced: boolean;
}

export interface OfflineVisita {
  offlineId: string;
  parcelaId: string;
  fecha: string;
  fenologia: string;
  observaciones: string;
  severidad: string;
  fotosBase64?: string[];
  recomendacion?: string;
}

export interface SyncResult {
  id?: string;
  offlineId: string;
  status: 'CREATED' | 'SKIPPED' | 'ERROR';
  error?: string;
}

export interface ClimaAlertas {
  helada: boolean;
  sequia: boolean;
  viento: boolean;
}

export interface ClimaResponse {
  forecast: {
    time: string[];
    temperature_2m_max: number[];
    temperature_2m_min: number[];
    precipitation_sum: number[];
    windspeed_10m_max: number[];
  };
  current: {
    temperature: number;
    windspeed: number;
    weathercode: number;
  };
  alertas: ClimaAlertas;
}

export interface DashboardStats {
  totalParcelas: number;
  visitasMes: number;
  diagnosticos: number;
  informes: number;
}
