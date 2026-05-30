import { z } from 'zod';

export const severidadEnum = z.enum(['BAJA', 'MEDIA', 'ALTA', 'CRITICA']);

export const visitaSchema = z.object({
  parcelaId: z.string().min(1, 'Selecciona una parcela'),
  fecha: z.string().min(1, 'Fecha requerida'),
  fenologia: z.string().min(2, 'Describe la fenología'),
  observaciones: z.string().min(10, 'Mínimo 10 caracteres'),
  severidad: severidadEnum,
  recomendacion: z.string().optional(),
  productoAplicado: z.string().optional(),
  dosis: z.string().optional(),
  seguimiento: z.string().optional(),
  diagnosticoId: z.string().optional(),
  fotosUrls: z.array(z.string()).optional(),
});

export const visitaOfflineSchema = visitaSchema.extend({
  offlineId: z.string().uuid(),
  fotosBase64: z.array(z.string()).optional(),
});

export type VisitaFormData = z.infer<typeof visitaSchema>;
