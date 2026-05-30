import { renderToBuffer } from '@react-pdf/renderer';
import { InformePDFDocument } from '@/components/informes/InformePDF';
import { formatDate } from '@/lib/utils';

interface GenerateReportInput {
  titulo: string;
  periodo: string;
  agronomo: string;
  organizacion?: string;
  visitas: {
    fecha: Date;
    parcela: { nombre: string };
    fenologia: string;
    severidad: string;
    observaciones: string;
    fotosUrls: string[];
  }[];
}

export async function generateReportBuffer(input: GenerateReportInput): Promise<Buffer> {
  const doc = InformePDFDocument({
    titulo: input.titulo,
    periodo: input.periodo,
    agronomo: input.agronomo,
    organizacion: input.organizacion,
    visitas: input.visitas.map((v) => ({
      fecha: formatDate(v.fecha),
      parcela: v.parcela.nombre,
      fenologia: v.fenologia,
      severidad: v.severidad,
      observaciones: v.observaciones,
      fotosUrls: v.fotosUrls,
    })),
  });

  const buffer = await renderToBuffer(doc);
  return Buffer.from(buffer);
}
