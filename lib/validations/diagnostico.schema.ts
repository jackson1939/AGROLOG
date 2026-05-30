import { z } from 'zod';
import { cultivoEnum } from './parcela.schema';

export const diagnosticoSchema = z.object({
  cultivo: cultivoEnum,
});

export type DiagnosticoFormData = z.infer<typeof diagnosticoSchema>;
