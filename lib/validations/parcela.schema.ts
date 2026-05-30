import { z } from 'zod';

export const cultivoEnum = z.enum([
  'SOYA',
  'MAIZ',
  'QUINUA',
  'PAPA',
  'TRIGO',
  'GIRASOL',
  'CITRICOS',
  'TOMATE',
  'CEBOLLA',
  'OTRO',
]);

export const parcelaSchema = z.object({
  nombre: z.string().min(2, 'Nombre requerido'),
  cultivo: cultivoEnum,
  superficie: z.coerce.number().positive('Superficie inválida'),
  lat: z.coerce.number().min(-90).max(90),
  lng: z.coerce.number().min(-180).max(180),
  productor: z.string().min(2, 'Productor requerido'),
  municipio: z.string().min(2),
  departamento: z.string().min(2),
  activa: z.boolean().optional().default(true),
});

export type ParcelaFormData = z.infer<typeof parcelaSchema>;
