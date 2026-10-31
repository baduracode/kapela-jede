'use client';

import React, { useState } from 'react';
import { Trip } from '@/lib/types';
import { ChevronDown, ChevronUp, Archive, RotateCcw, Trash2, Calendar, ArrowRight } from 'lucide-react';

interface ResolvedTripsArchiveProps {
  trips: Trip[];
  onUnresolve: (id: string) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
  requirePinAction: (action: () => void, title?: string, desc?: string) => void;
}

export function ResolvedTripsArchive({
  trips,
  onUnresolve,
  onDelete,
  requirePinAction,
}: ResolvedTripsArchiveProps) {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const resolvedTrips = trips.filter((t) => t.is_resolved);

  const totalResolvedKm = resolvedTrips.reduce((acc, t) => acc + Number(t.distance_km || 0), 0);

  const handleUnresolve = (id: string, destination: string) => {
    requirePinAction(
      () => onUnresolve(id),
      'Vrátit jízdu mezi aktivní',
      `Opravdu chcete vrátit jízdu do "${destination}" zpět mezi aktivní neuzavřené jízdy?`
    );
  };

  const handleDelete = (id: string, destination: string) => {
    requirePinAction(
      () => onDelete(id),
      'Smazání archivované jízdy',
      `Opravdu chcete tuto jízdu do "${destination}" z archivu smazat?`
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
    <div className="bg-slate-900/60 border border-slate-800 rounded-2xl overflow-hidden shadow-lg transition">
      {/* Akordeon hlavička */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-5 py-4 flex items-center justify-between text-left hover:bg-slate-800/40 transition"
      >
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-400">
            <Archive size={17} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm sm:text-base font-bold text-slate-200">
                Archiv vyřešených jízd
              </h3>
              <span className="text-xs px-2 py-0.5 rounded-full bg-slate-800 border border-slate-700 text-slate-400 font-mono">
                {resolvedTrips.length}
              </span>
            </div>
            <p className="text-xs text-slate-500">
              Celkem v archivu: {Math.round(totalResolvedKm * 10) / 10} km
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 text-slate-400">
          <span className="text-xs font-medium hidden sm:inline">
            {isOpen ? 'Sbalit archiv' : 'Zobrazit historii'}
          </span>
          {isOpen ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
        </div>
      </button>

      {/* Tělo akordeonu */}
      {isOpen && (
        <div className="p-4 sm:p-5 border-t border-slate-800/80 bg-slate-950/40">
          {resolvedTrips.length === 0 ? (
            <div className="text-center py-6 text-xs text-slate-500">
              V archivu zatím nejsou žádné vyřešené jízdy. Jakmile označíte aktivní jízdu jako
              "Vyřešeno", zobrazí se zde.
            </div>
          ) : (
            <div className="space-y-2.5">
              {resolvedTrips.map((trip) => {
                const isJan = trip.driver === 'Jan';
                return (
                  <div
                    key={trip.id}
                    className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800/70 hover:border-slate-700 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-slate-300 transition"
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <span className="text-[11px] font-mono text-slate-400 flex items-center gap-1">
                          <Calendar size={11} />
                          {formatDate(trip.date)}
                        </span>
                        <span className="text-[10px] px-1.5 py-0.2 rounded bg-slate-800 text-slate-400 border border-slate-700">
                          {trip.trip_type}
                        </span>
                        <span
                          className={`text-[10px] font-semibold px-2 py-0.2 rounded-full border ${
                            isJan
                              ? 'bg-blue-950/40 border-blue-500/20 text-blue-300'
                              : 'bg-emerald-950/40 border-emerald-500/20 text-emerald-300'
                          }`}
                        >
                          {trip.driver}
                        </span>
                      </div>

                      <div className="flex items-center gap-1.5 text-sm font-medium text-slate-200">
                        <span className="text-slate-400">{trip.origin}</span>
                        <ArrowRight size={13} className="text-slate-500" />
                        <span className="text-slate-100">{trip.destination}</span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between sm:justify-end gap-3 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-800/60">
                      <span className="font-mono text-sm font-bold text-slate-200">
                        {trip.distance_km} <span className="text-xs font-normal text-slate-500">km</span>
                      </span>

                      {/* Tlačítko pro vrácení mezi aktivní */}
                      <button
                        onClick={() => handleUnresolve(trip.id, trip.destination)}
                        className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 hover:text-white text-xs font-medium transition"
                        title="Vrátit jízdu zpět mezi aktivní"
                      >
                        <RotateCcw size={12} />
                        <span>Vrátit</span>
                      </button>

                      <button
                        onClick={() => handleDelete(trip.id, trip.destination)}
                        className="p-1.5 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 transition"
                        title="Smazat z archivu"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
