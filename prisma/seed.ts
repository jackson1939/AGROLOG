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
      organizacion: 'AgroConsult Santa Cruz',
    },
  });

  const adminPassword = await bcrypt.hash('admin2024', 10);
  await prisma.user.upsert({
    where: { email: 'admin@agrolog.bo' },
    update: {},
    create: {
      email: 'admin@agrolog.bo',
      name: 'Administrador Central',
      password: adminPassword,
      role: 'ADMIN',
      organizacion: 'AgroLog Central',
    },
  });

  const parcelas = await Promise.all([
    // Norte Integrado - Soya (zona de mayor producción soyera de Bolivia)
    prisma.parcela.upsert({
      where: { id: 'seed-lote-soya-montero' },
      update: {},
      create: {
        id: 'seed-lote-soya-montero',
        nombre: 'Lote Soya Norte',
        cultivo: 'SOYA',
        superficie: 12.5,
        lat: -17.3378,
        lng: -63.2490,
        productor: 'Cooperativa El Progreso - Montero',
        municipio: 'Montero',
        departamento: 'Santa Cruz',
        userId: user.id,
      },
    }),
    // Valles Cruceños - Papa (Samaipata, zona alta de SCZ)
    prisma.parcela.upsert({
      where: { id: 'seed-papa-samaipata' },
      update: {},
      create: {
        id: 'seed-papa-samaipata',
        nombre: 'Sector Papa Valles',
        cultivo: 'PAPA',
        superficie: 4.8,
        lat: -18.1793,
        lng: -63.8670,
        productor: 'Asociación Productores Samaipata',
        municipio: 'Samaipata',
        departamento: 'Santa Cruz',
        userId: user.id,
      },
    }),
    // Expansión Este - Soya (Cuatro Cañadas, frontera agrícola)
    prisma.parcela.upsert({
      where: { id: 'seed-soya-cuatro-canadas' },
      update: {},
      create: {
        id: 'seed-soya-cuatro-canadas',
        nombre: 'Lote Expansión Este',
        cultivo: 'SOYA',
        superficie: 22.0,
        lat: -16.7881,
        lng: -62.5208,
        productor: 'CAICO - Cuatro Cañadas',
        municipio: 'Cuatro Cañadas',
        departamento: 'Santa Cruz',
        userId: user.id,
      },
    }),
    // Valles Cruceños - Cítricos (Buena Vista, zona subtropical)
    prisma.parcela.upsert({
      where: { id: 'seed-citricos-buena-vista' },
      update: {},
      create: {
        id: 'seed-citricos-buena-vista',
        nombre: 'Huerto Cítricos Buena Vista',
        cultivo: 'CITRICOS',
        superficie: 2.1,
        lat: -17.4615,
        lng: -63.6658,
        productor: 'Finca Los Tucanes - Buena Vista',
        municipio: 'Buena Vista',
        departamento: 'Santa Cruz',
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
            descripcion: 'Tizón en papa, condiciones favorables en los Valles de Samaipata',
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
