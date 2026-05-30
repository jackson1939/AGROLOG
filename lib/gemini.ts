import { GoogleGenerativeAI } from '@google/generative-ai';
import type { DiagnosticoResult } from '@/types';

const genai = new GoogleGenerativeAI(process.env.GEMINI_API_KEY ?? '');

export const DIAGNOSTICO_PROMPT = (cultivo: string) =>
  `Eres un experto en fitopatología con especialización en cultivos de Bolivia y Latinoamérica.

Analiza esta imagen de campo del cultivo: ${cultivo}.

Responde ÚNICAMENTE con un JSON válido con esta estructura exacta:
{
  "hipotesis": [
    {
      "nombre": "nombre de la enfermedad/plaga/deficiencia",
      "tipo": "ENFERMEDAD|PLAGA|DEFICIENCIA|FISIOLOGICO|NORMAL",
      "confianza": 85,
      "descripcion": "descripción breve del diagnóstico en español",
      "sintomas": "síntomas observados que sustentan el diagnóstico",
      "accion": "recomendación de acción inmediata concreta",
      "urgencia": "INMEDIATA|ESTA_SEMANA|MONITOREAR"
    }
  ],
  "observacionGeneral": "observación general del estado del cultivo",
  "riesgoEconomico": "BAJO|MEDIO|ALTO|CRITICO"
}

Proporciona entre 1 y 3 hipótesis ordenadas por probabilidad descendente. Sé específico para condiciones bolivianas.`;

export async function analyzeImage(
  base64: string,
  mimeType: string,
  cultivo: string
): Promise<DiagnosticoResult> {
  if (!process.env.GEMINI_API_KEY) {
    return getMockDiagnostico(cultivo);
  }

  const model = genai.getGenerativeModel({ model: 'gemini-1.5-flash' });

  const result = await model.generateContent([
    { inlineData: { data: base64, mimeType } },
    DIAGNOSTICO_PROMPT(cultivo),
  ]);

  const text = result.response.text();
  const jsonMatch = text.match(/\{[\s\S]*\}/);
  if (!jsonMatch) throw new Error('No se pudo parsear la respuesta de Gemini');

  return JSON.parse(jsonMatch[0]) as DiagnosticoResult;
}

function getMockDiagnostico(cultivo: string): DiagnosticoResult {
  return {
    hipotesis: [
      {
        nombre: 'Mancha foliar (demo)',
        tipo: 'ENFERMEDAD',
        confianza: 72,
        descripcion: `Posible afectación foliar en ${cultivo}. Configure GEMINI_API_KEY para análisis real.`,
        sintomas: 'Lesiones necróticas en hojas inferiores',
        accion: 'Tomar muestra y enviar a laboratorio fitosanitario',
        urgencia: 'ESTA_SEMANA',
      },
    ],
    observacionGeneral: 'Análisis de demostración — configure GEMINI_API_KEY',
    riesgoEconomico: 'MEDIO',
  };
}
