import { NextRequest, NextResponse } from 'next/server';
import { fetchClima } from '@/lib/clima';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const lat = searchParams.get('lat');
  const lng = searchParams.get('lng');

  if (!lat || !lng) {
    return NextResponse.json({ error: 'lat y lng requeridos' }, { status: 400 });
  }

  try {
    const clima = await fetchClima(parseFloat(lat), parseFloat(lng));
    return NextResponse.json(clima);
  } catch {
    return NextResponse.json({ error: 'Error al obtener clima' }, { status: 500 });
  }
}
