import { createClient } from '@supabase/supabase-js';
import { Trip } from './types';

const rawUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
export const supabaseUrl = rawUrl.replace(/\/rest\/v1\/?$/, '').replace(/\/+$/, '');
export const supabaseAnonKey = (process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '').trim();

export const isSupabaseConfigured = (): boolean => {
  return Boolean(
    supabaseUrl &&
    supabaseAnonKey &&
    supabaseUrl.startsWith('http') &&
    supabaseAnonKey.length > 15
  );
};

export const supabase = isSupabaseConfigured()
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

// Počáteční ukázková data pro lokální režim (když Supabase ještě není nakonfigurována)
const INITIAL_DEMO_TRIPS: Trip[] = [
  {
    id: 'demo-1',
    date: '2026-10-21',
    trip_type: 'Koncert',
    origin: 'Zlín',
    destination: 'Brno - Fléda',
    distance_km: 198.0,
    driver: 'Jan',
    is_resolved: true,
    created_at: new Date(Date.now() - 10 * 86400000).toISOString(),
  },
  {
    id: 'demo-2',
    date: '2026-10-24',
    trip_type: 'Zkouška',
    origin: 'Zlín',
    destination: 'Uherské Hradiště',
    distance_km: 54.0,
    driver: 'Tom',
    is_resolved: true,
    created_at: new Date(Date.now() - 7 * 86400000).toISOString(),
  },
  {
    id: 'demo-3',
    date: '2026-10-27',
    trip_type: 'Koncert',
    origin: 'Zlín',
    destination: 'Ostrava - Barrák',
    distance_km: 212.0,
    driver: 'Tom',
    is_resolved: true,
    created_at: new Date(Date.now() - 4 * 86400000).toISOString(),
  },
  {
    id: 'demo-4',
    date: '2026-10-29',
    trip_type: 'Zkouška',
    origin: 'Zlín',
    destination: 'Otrokovice',
    distance_km: 24.0,
    driver: 'Jan',
    is_resolved: false,
    created_at: new Date(Date.now() - 2 * 86400000).toISOString(),
  },
  {
    id: 'demo-5',
    date: '2026-10-31',
    trip_type: 'Koncert',
    origin: 'Zlín',
    destination: 'Praha - Palác Akropolis',
    distance_km: 602.0,
    driver: 'Jan',
    is_resolved: false,
    created_at: new Date().toISOString(),
  },
];

const LOCAL_STORAGE_KEY = 'kapela_jede_trips_offline';

function getLocalTrips(): Trip[] {
  if (typeof window === 'undefined') return INITIAL_DEMO_TRIPS;
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(INITIAL_DEMO_TRIPS));
      return INITIAL_DEMO_TRIPS;
    }
    return JSON.parse(raw);
  } catch {
    return INITIAL_DEMO_TRIPS;
  }
}

function saveLocalTrips(trips: Trip[]) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(trips));
  } catch (err) {
    console.error('Failed to save to localStorage:', err);
  }
}

// -------------------------------------------------------------
// API metody pro práci s jízdami
// -------------------------------------------------------------

export async function fetchTrips(): Promise<Trip[]> {
  if (supabase && isSupabaseConfigured()) {
    const { data, error } = await supabase
      .from('trips')
      .select('*')
      .order('date', { ascending: false })
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Chyba při načítání jízd ze Supabase:', error);
      throw new Error(error.message);
    }
    return (data || []) as Trip[];
  }

  // Lokální demo režim
  return getLocalTrips().sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );
}

export async function createTrip(
  trip: Omit<Trip, 'id' | 'created_at' | 'is_resolved'>
): Promise<Trip> {
  const newTripData = {
    ...trip,
    distance_km: Number(trip.distance_km),
    is_resolved: false,
  };

  if (supabase && isSupabaseConfigured()) {
    const { data, error } = await supabase
      .from('trips')
      .insert([newTripData])
      .select()
      .single();

    if (error) {
      console.error('Chyba při vkládání jízdy do Supabase:', error);
      throw new Error(error.message);
    }
    return data as Trip;
  }

  // Lokální demo režim
  const localTrips = getLocalTrips();
  const created: Trip = {
    ...newTripData,
    id: 'local-' + Date.now() + '-' + Math.random().toString(36).substr(2, 6),
    created_at: new Date().toISOString(),
  };
  localTrips.unshift(created);
  saveLocalTrips(localTrips);
  return created;
}

export async function toggleTripResolved(id: string, is_resolved: boolean): Promise<boolean> {
  if (supabase && isSupabaseConfigured()) {
    const { error } = await supabase
      .from('trips')
      .update({ is_resolved })
      .eq('id', id);

    if (error) {
      console.error('Chyba při aktualizaci stavu jízdy v Supabase:', error);
      throw new Error(error.message);
    }
    return true;
  }

  // Lokální demo režim
  const localTrips = getLocalTrips();
  const updated = localTrips.map((t) => (t.id === id ? { ...t, is_resolved } : t));
  saveLocalTrips(updated);
  return true;
}

export async function deleteTrip(id: string): Promise<boolean> {
  if (supabase && isSupabaseConfigured()) {
    const { error } = await supabase
      .from('trips')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Chyba při mazání jízdy ze Supabase:', error);
      throw new Error(error.message);
    }
    return true;
  }

  // Lokální demo režim
  const localTrips = getLocalTrips();
  const filtered = localTrips.filter((t) => t.id !== id);
  saveLocalTrips(filtered);
  return true;
}
