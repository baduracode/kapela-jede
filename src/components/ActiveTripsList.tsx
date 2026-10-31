'use client';

import React from 'react';
import { Trip } from '@/lib/types';
import { CheckCircle2, Trash2, ArrowRight, Calendar, User, Gauge } from 'lucide-react';

interface ActiveTripsListProps {
  trips: Trip[];
  onResolve: (id: string) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
  requirePinAction: (action: () => void, title?: string, desc?: string) => void;
}

export function ActiveTripsList({
  trips,
  onResolve,
  onDelete,
  requirePinAction,
}: ActiveTripsListProps) {
  const activeTrips = trips.filter((t) => !t.is_resolved);

  const handleResolveClick = (id: string, destination: string) => {
    requirePinAction(
      () => onResolve(id),
      'Označení jízdy jako vyřešené',
      `Opravdu chcete označit jízdu do "${destination}" jako vyřešenou a přesunout ji do archivu?`
    );
  };

  const handleDeleteClick = (id: string, destination: string) => {
    requirePinAction(
      () => onDelete(id),
      'Smazání záznamu jízdy',
      `Opravdu chcete nenávratně smazat jízdu do "${destination}"?`
    );
  };

  const formatDate = (dateStr: string) => {
    try {
      const d = new Date(dateStr);
      return d.toLocaleDateString('cs-CZ', {
        day: 'numeric',
        month: 'numeric',
        year: 'numeric',
      });
    } catch {
      return dateStr;
    }
  };

  return (
    <div className="mb-8">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-pulse"></span>
          <h2 className="text-lg font-bold text-white tracking-wide">
            Aktivní nevyřešené jízdy
          </h2>
          <span className="text-xs px-2 py-0.5 rounded-full bg-slate-800 border border-slate-700 text-slate-300 font-mono">
            {activeTrips.length}
          </span>
        </div>
        <p className="text-xs text-slate-400 hidden sm:block">
          Čekají na vyúčtování / rozpočet cesťáku
        </p>
      </div>

      {activeTrips.length === 0 ? (
        <div className="bg-slate-900/50 border border-slate-800/80 rounded-2xl p-8 text-center">
          <div className="w-12 h-12 mx-auto rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 mb-3">
            <CheckCircle2 size={24} />
          </div>
          <h3 className="text-sm font-semibold text-slate-200 mb-1">
            Žádné aktivní jízdy k vyřešení
          </h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Všechny dosavadní jízdy jsou uzavřeny v archivu, nebo zadejte novou jízdu formulářem výše.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {activeTrips.map((trip) => {
            const isJan = trip.driver === 'Jan';
            return (
              <div
                key={trip.id}
                className="bg-slate-900/90 border border-slate-800 hover:border-slate-700/80 rounded-2xl p-4 sm:p-5 shadow-lg transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4"
              >
                {/* Levá část: Datum, Typ a Trasa */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2.5 mb-2 flex-wrap">
                    <span className="text-xs font-mono text-slate-400 flex items-center gap-1">
                      <Calendar size={12} />
                      {formatDate(trip.date)}
                    </span>

                    <span
                      className={`text-[11px] font-semibold px-2 py-0.5 rounded-md border ${
                        trip.trip_type === 'Koncert'
                          ? 'bg-rose-500/15 border-rose-500/30 text-rose-300'
                          : 'bg-indigo-500/15 border-indigo-500/30 text-indigo-300'
                      }`}
                    >
                      {trip.trip_type === 'Koncert' ? '🎸 Koncert' : '🥁 Zkouška'}
                    </span>

                    {/* Štítek řidiče */}
                    <span
                      className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full border flex items-center gap-1.5 ${
                        isJan
                          ? 'bg-blue-500/15 border-blue-500/30 text-blue-300'
                          : 'bg-emerald-500/15 border-emerald-500/30 text-emerald-300'
                      }`}
                    >
                      <span
                        className={`w-1.5 h-1.5 rounded-full ${isJan ? 'bg-blue-400' : 'bg-emerald-400'}`}
                      ></span>
                      Řídil: {trip.driver}
                    </span>
                  </div>

                  {/* Trasa */}
                  <div className="flex items-center gap-2 text-white font-semibold text-base sm:text-lg truncate">
                    <span className="text-slate-300">{trip.origin}</span>
                    <ArrowRight size={16} className="text-amber-400 flex-shrink-0" />
                    <span className="text-amber-300 truncate">{trip.destination}</span>
                  </div>
                </div>

                {/* Pravá část: Kilometry a akční tlačítka */}
                <div className="flex items-center justify-between sm:justify-end gap-3 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-800">
                  {/* Počet km */}
                  <div className="text-right sm:mr-3">
                    <div className="text-lg sm:text-xl font-black font-mono text-white tracking-tight">
                      {trip.distance_km}{' '}
                      <span className="text-xs font-normal text-slate-400 font-sans">km</span>
                    </div>
                  </div>

                  {/* Tlačítko Vyřešeno */}
                  <button
                    onClick={() => handleResolveClick(trip.id, trip.destination)}
                    className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-600/20 hover:bg-emerald-600/30 border border-emerald-500/40 text-emerald-300 hover:text-emerald-200 text-xs font-bold transition active:scale-95 shadow-sm"
                    title="Označit jako vyřešeno a přesunout do archivu"
                  >
                    <CheckCircle2 size={15} className="text-emerald-400" />
                    <span>Vyřešeno</span>
                  </button>

                  {/* Tlačítko Smazat */}
                  <button
                    onClick={() => handleDeleteClick(trip.id, trip.destination)}
                    className="p-2 rounded-xl text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 border border-transparent hover:border-rose-500/30 transition"
                    title="Smazat jízdu"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
