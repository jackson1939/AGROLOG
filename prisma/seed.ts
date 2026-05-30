import { PrismaClient, Severidad } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  const password = await bcrypt.hash('campo2024', 10);

  const user = await prisma.user.upsert({
    where: { email: 'demo@agrolog.bo' },
    update: {},
    create: {
      email: 'demo@agrolog.bo',
      name: 'Carlos Mendoza',
      password,
      role: 'AGRONOMO',
      organizacion: 'AgroConsult Bolivia',
    },
  });

  const parcelas = await Promise.all([
    prisma.parcela.upsert({
      where: { id: 'seed-lote-norte' },
      update: {},
      create: {
        id: 'seed-lote-norte',
        nombre: 'Lote Norte',
        cultivo: 'SOYA',
        superficie: 12.5,
        lat: -17.34,
        lng: -63.25,
        productor: 'Cooperativa El Progreso',
        municipio: 'Montero',
        departamento: 'Santa Cruz',
        userId: user.id,
      },
    }),
    prisma.parcela.upsert({
      where: { id: 'seed-quinua-a' },
      update: {},
      create: {
        id: 'seed-quinua-a',
        nombre: 'Parcela Quinua A',
        cultivo: 'QUINUA',
        superficie: 3.2,
        lat: -17.73,
        lng: -67.02,
        productor: 'Familia Quispe',
        municipio: 'Caracollo',
        departamento: 'Oruro',
        userId: user.id,
      },
    }),
    prisma.parcela.upsert({
      where: { id: 'seed-papa-1' },
      update: {},
      create: {
        id: 'seed-papa-1',
        nombre: 'Sector Papa 1',
        cultivo: 'PAPA',
        superficie: 4.8,
        lat: -17.32,
        lng: -65.95,
        productor: 'Asociación Tiraque',
        municipio: 'Tiraque',
        departamento: 'Cochabamba',
        userId: user.id,
      },
    }),
    prisma.parcela.upsert({
      where: { id: 'seed-citricos' },
      update: {},
      create: {
        id: 'seed-citricos',
        nombre: 'Huerto Cítricos',
        cultivo: 'CITRICOS',
        superficie: 2.1,
        lat: -15.83,
        lng: -67.88,
        productor: 'Finca Los Yungas',
        municipio: 'Caranavi',
        departamento: 'La Paz',
        userId: user.id,
      },
    }),
  ]);

  const diagnosticos = await Promise.all([
    prisma.diagnostico.create({
      data: {
        fotoUrl: '',
        modelVersion: 'gemini-1.5-flash',
        hipotesis: [
          {
            nombre: 'Mancha marrón (Septoria glycines)',
            tipo: 'ENFERMEDAD',
            confianza: 82,
            descripcion: 'Manchas necróticas en hojas inferiores de soya',
            sintomas: 'Lesiones circulares marrones con halo amarillo',
            accion: 'Aplicar fungicida triazol + estrobilurina',
            urgencia: 'ESTA_SEMANA',
          },
        ],
      },
    }),
    prisma.diagnostico.create({
      data: {
        fotoUrl: '',
        modelVersion: 'gemini-1.5-flash',
        hipotesis: [
          {
            nombre: 'Mildiu (Peronospora farinosa)',
            tipo: 'ENFERMEDAD',
            confianza: 78,
            descripcion: 'Mildiu en quinua, típico en épocas húmedas',
            sintomas: 'Manchas blancuzcas en envés foliar',
            accion: 'Monitorear y aplicar cobre si progresa',
            urgencia: 'MONITOREAR',
          },
        ],
      },
    }),
    prisma.diagnostico.create({
      data: {
        fotoUrl: '',
        modelVersion: 'gemini-1.5-flash',
        hipotesis: [
          {
            nombre: 'Tizón tardío (Phytophthora infestans)',
            tipo: 'ENFERMEDAD',
            confianza: 88,
            descripcion: 'Tizón en papa, condiciones favorables en Tiraque',
            sintomas: 'Manchas acuosas que se tornan necróticas',
            accion: 'Eliminar plantas afectadas y aplicar fungicida sistémico',
            urgencia: 'INMEDIATA',
          },
        ],
      },
    }),
  ]);

  const visitasData = [
    {
      parcelaId: parcelas[0].id,
      fecha: new Date('2025-05-10'),
      fenologia: 'R3 - inicio formación vainas',
      observaciones:
        'Presencia de mancha marrón en hojas inferiores. Aproximadamente 15% del lote afectado. Condiciones húmedas favorables.',
      severidad: 'MEDIA' as Severidad,
      diagnosticoId: diagnosticos[0].id,
      recomendacion: 'Aplicar fungicida en las próximas 48 horas',
    },
    {
      parcelaId: parcelas[0].id,
      fecha: new Date('2025-05-22'),
      fenologia: 'R5 - llenado de vainas',
      observaciones:
        'Evolución favorable post-tratamiento. Mancha controlada al 5%.',
      severidad: 'BAJA' as Severidad,
    },
    {
      parcelaId: parcelas[1].id,
      fecha: new Date('2025-05-08'),
      fenologia: 'Florecimiento pleno',
      observaciones:
        'Síntomas de mildiu en 20% de plantas. Humedad relativa alta por lluvias recientes.',
      severidad: 'MEDIA' as Severidad,
      diagnosticoId: diagnosticos[1].id,
    },
    {
      parcelaId: parcelas[1].id,
      fecha: new Date('2025-05-20'),
      fenologia: 'Grano lechoso',
      observaciones: 'Mildiu estacionado. Buen desarrollo del grano.',
      severidad: 'BAJA' as Severidad,
    },
    {
      parcelaId: parcelas[2].id,
      fecha: new Date('2025-05-05'),
      fenologia: 'Tuberización activa',
      observaciones:
        'Tizón tardío detectado en borde del lote. Eliminadas 12 plantas foco.',
      severidad: 'ALTA' as Severidad,
      diagnosticoId: diagnosticos[2].id,
      recomendacion: 'Tratamiento urgente con metalaxil + mancozeb',
    },
    {
      parcelaId: parcelas[2].id,
      fecha: new Date('2025-05-18'),
      fenologia: 'Engrosamiento tubérculos',
      observaciones: 'Foco de tizón contenido. Sin nuevos focos detectados.',
      severidad: 'MEDIA' as Severidad,
    },
    {
      parcelaId: parcelas[3].id,
      fecha: new Date('2025-05-12'),
      fenologia: 'Fructificación',
      observaciones:
        'Presencia de minador de hoja en 8% de plantas. Control biológico recomendado.',
      severidad: 'BAJA' as Severidad,
    },
    {
      parcelaId: parcelas[3].id,
      fecha: new Date('2025-05-25'),
      fenologia: 'Cosecha próxima',
      observaciones:
        'Helada leve reportada en zona. Revisar frutos en sector bajo.',
      severidad: 'CRITICA' as Severidad,
      recomendacion: 'Monitorear temperatura nocturna próximos 5 días',
    },
  ];

  for (const v of visitasData) {
    await prisma.visita.create({
      data: {
        ...v,
        fotosUrls: [],
        userId: user.id,
      },
    });
  }

  await prisma.informe.create({
    data: {
      titulo: 'Informe Fitosanitario Mayo 2025',
      periodo: 'Mayo 2025',
      tipo: 'FITOSANITARIO',
      visitasIds: [],
      metadata: { totalVisitas: 8, agronomo: user.name },
      userId: user.id,
    },
  });

  console.log('Seed completado: demo@agrolog.bo / campo2024');
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
