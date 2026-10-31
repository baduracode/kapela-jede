import { NextRequest, NextResponse } from 'next/server';
import { calculateDistanceMapyCz } from '@/lib/mapy';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { origin, destination } = body;

    if (!origin || !destination) {
      return NextResponse.json(
        { success: false, error: 'Musíte vyplnit výchozí místo i cíl cesty.' },
        { status: 400 }
      );
    }

    const result = await calculateDistanceMapyCz(origin, destination);
    return NextResponse.json(result);
  } catch (err: unknown) {
    return NextResponse.json(
      {
        success: false,
        error: err instanceof Error ? err.message : 'Chyba serveru při výpočtu vzdálenosti.',
      },
      { status: 500 }
    );
  }
}
