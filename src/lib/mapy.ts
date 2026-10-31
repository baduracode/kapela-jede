import { DistanceCalculationResult } from './types';

// Známé orientační vzdálenosti ze Zlína pro fallback, pokud uživatel ještě nevložil Mapy.cz klíč
const KNOWN_DISTANCES_FROM_ZLIN: Record<string, number> = {
  praha: 300,
  brno: 98,
  ostrava: 105,
  olomouc: 62,
  'uherské hradiště': 27,
  'uherske hradiste': 27,
  kroměříž: 32,
  kromeriz: 32,
  otrokovice: 12,
  holešov: 16,
  holesov: 16,
  vsetín: 32,
  vsetin: 32,
  'valašské meziříčí': 45,
  'valasske mezirici': 45,
  bratislava: 155,
  vídeň: 195,
  viden: 195,
  plzeň: 385,
  plzen: 385,
  liberec: 340,
  hradec: 210,
  pardubice: 190,
  jihlava: 180,
  'české budějovice': 280,
  'ceske budejovice': 280,
};

function normalizeCity(str: string): string {
  return str.toLowerCase().trim().replace(/[-–,].*$/, '').trim();
}

export async function calculateDistanceMapyCz(
  origin: string,
  destination: string,
  apiKey?: string
): Promise<DistanceCalculationResult> {
  const key = apiKey || process.env.MAPY_CZ_API_KEY || process.env.NEXT_PUBLIC_MAPY_CZ_API_KEY || '';

  if (!key || key === 'your_mapy_cz_api_key_here') {
    // Simulovaný/orientační výpočet ze Zlína, pokud API klíč ještě není nastaven
    const normDest = normalizeCity(destination);
    const normOrig = normalizeCity(origin);

    for (const [city, dist] of Object.entries(KNOWN_DISTANCES_FROM_ZLIN)) {
      if (normDest.includes(city) || city.includes(normDest)) {
        return {
          success: true,
          distanceKm: dist,
          durationMinutes: Math.round(dist * 0.9),
          originLabel: origin,
          destinationLabel: destination,
          error: 'Orientační výpočet (vložte MAPY_CZ_API_KEY do .env.local pro přesné Mapy.cz REST API)',
        };
      }
    }

    // Obecný odhad
    return {
      success: true,
      distanceKm: 45.0,
      durationMinutes: 40,
      originLabel: origin,
      destinationLabel: destination,
      error: 'Orientační odhad (pro přesnou trasu doplňte MAPY_CZ_API_KEY v .env.local)',
    };
  }

  try {
    // 1. Geokódování počátku (Origin)
    const originGeoUrl = new URL('https://api.mapy.cz/v1/geocode');
    originGeoUrl.searchParams.set('query', origin);
    originGeoUrl.searchParams.set('lang', 'cs');
    originGeoUrl.searchParams.set('apikey', key);

    const originRes = await fetch(originGeoUrl.toString(), {
      headers: { Accept: 'application/json' },
      next: { revalidate: 3600 },
    });

    if (!originRes.ok) {
      const errText = await originRes.text();
      throw new Error(`Chyba geokódování startu (${originRes.status}): ${errText}`);
    }

    const originData = await originRes.json();
    if (!originData.items || originData.items.length === 0) {
      return {
        success: false,
        error: `Výchozí místo "${origin}" nebylo na Mapy.cz nalezeno.`,
      };
    }

    const startPos = originData.items[0].position; // { lon, lat }
    const startLabel = originData.items[0].label || origin;

    // 2. Geokódování cíle (Destination)
    const destGeoUrl = new URL('https://api.mapy.cz/v1/geocode');
    destGeoUrl.searchParams.set('query', destination);
    destGeoUrl.searchParams.set('lang', 'cs');
    destGeoUrl.searchParams.set('apikey', key);

    const destRes = await fetch(destGeoUrl.toString(), {
      headers: { Accept: 'application/json' },
      next: { revalidate: 3600 },
    });

    if (!destRes.ok) {
      const errText = await destRes.text();
      throw new Error(`Chyba geokódování cíle (${destRes.status}): ${errText}`);
    }

    const destData = await destRes.json();
    if (!destData.items || destData.items.length === 0) {
      return {
        success: false,
        error: `Cílové místo "${destination}" nebylo na Mapy.cz nalezeno.`,
      };
    }

    const endPos = destData.items[0].position; // { lon, lat }
    const endLabel = destData.items[0].label || destination;

    // 3. Výpočet automobilové trasy (Routing)
    const routeUrl = new URL('https://api.mapy.cz/v1/routing/route');
    routeUrl.searchParams.set('start', `${startPos.lon},${startPos.lat}`);
    routeUrl.searchParams.set('end', `${endPos.lon},${endPos.lat}`);
    routeUrl.searchParams.set('routeType', 'car_fast');
    routeUrl.searchParams.set('apikey', key);

    const routeRes = await fetch(routeUrl.toString(), {
      headers: { Accept: 'application/json' },
    });

    if (!routeRes.ok) {
      const errText = await routeRes.text();
      throw new Error(`Chyba plánování trasy (${routeRes.status}): ${errText}`);
    }

    const routeData = await routeRes.json();
    // délka je v metrech, duration v sekundách
    const lengthMeters = routeData.length ?? routeData.geometry?.length ?? 0;
    const durationSeconds = routeData.duration ?? 0;

    const distanceKm = Math.round((lengthMeters / 1000) * 10) / 10;
    const durationMinutes = Math.round(durationSeconds / 60);

    return {
      success: true,
      distanceKm,
      durationMinutes,
      originLabel: startLabel,
      destinationLabel: endLabel,
    };
  } catch (err: unknown) {
    console.error('Chyba při volání Mapy.cz API:', err);
    return {
      success: false,
      error: err instanceof Error ? err.message : 'Nepodařilo se spočítat trasu.',
    };
  }
}
