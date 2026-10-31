export type Driver = 'Jan' | 'Tom';
export type TripType = 'Koncert' | 'Zkouška';

export interface Trip {
  id: string;
  date: string; // YYYY-MM-DD
  trip_type: TripType;
  origin: string;
  destination: string;
  distance_km: number;
  driver: Driver;
  is_resolved: boolean;
  created_at?: string;
}

export interface TripFormData {
  date: string;
  trip_type: TripType;
  origin: string;
  destination: string;
  distance_km: number | string;
  driver: Driver;
}

export interface DistanceCalculationResult {
  success: boolean;
  distanceKm?: number;
  durationMinutes?: number;
  originLabel?: string;
  destinationLabel?: string;
  error?: string;
}

export interface DriverStats {
  name: Driver;
  totalKm: number;
  tripCount: number;
  resolvedKm: number;
  activeKm: number;
  concertKm: number;
  rehearsalKm: number;
  percentage: number;
}

export interface AggregatedStats {
  totalKm: number;
  totalTrips: number;
  activeTripsCount: number;
  activeKm: number;
  resolvedTripsCount: number;
  resolvedKm: number;
  concertKm: number;
  rehearsalKm: number;
  drivers: Record<Driver, DriverStats>;
  nextDriverRecommendation: Driver;
}
