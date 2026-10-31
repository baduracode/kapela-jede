'use client';

import React from 'react';
import { Trip, Driver } from '@/lib/types';
import {
  Gauge,
  User,
  Music,
  Calendar,
  Sparkles,
  TrendingUp,
  CheckCircle2,
  Clock,
  Car,
} from 'lucide-react';

interface StatsViewProps {
  trips: Trip[];
}

export function StatsView({ trips }: StatsViewProps) {
  // Výpočet agregací
  const totalKm = trips.reduce((sum, t) => sum + Number(t.distance_km || 0), 0);
  const totalTrips = trips.length;

  const activeTrips = trips.filter((t) => !t.is_resolved);
  const activeKm = activeTrips.reduce((sum, t) => sum + Number(t.distance_km || 0), 0);

  const resolvedTrips = trips.filter((t) => t.is_resolved);
  const resolvedKm = resolvedTrips.reduce((sum, t) => sum + Number(t.distance_km || 0), 0);

  // Řidiči: Jan vs. Tom
  const janTrips = trips.filter((t) => t.driver === 'Jan');
  const tomTrips = trips.filter((t) => t.driver === 'Tom');

  const janKm = janTrips.reduce((sum, t) => sum + Number(t.distance_km || 0), 0);
  const tomKm = tomTrips.reduce((sum, t) => sum + Number(t.distance_km || 0), 0);

  const janPercent = totalKm > 0 ? Math.round((janKm / totalKm) * 100) : 50;
  const tomPercent = totalKm > 0 ? 100 - janPercent : 50;

  // Typy jízd: Koncert vs Zkouška
  const concertTrips = trips.filter((t) => t.trip_type === 'Koncert');
  const rehearsalTrips = trips.filter((t) => t.trip_type === 'Zkouška');

  const concertKm = concertTrips.reduce((sum, t) => sum + Number(t.distance_km || 0), 0);
  const rehearsalKm = rehearsalTrips.reduce((sum, t) => sum + Number(t.distance_km || 0), 0);

  // Doporučení pro příští jízdu (kdo má méně km)
  let nextDriver: Driver = 'Jan';
  let diffKm = 0;
  if (janKm > tomKm) {
    nextDriver = 'Tom';
    diffKm = Math.round((janKm - tomKm) * 10) / 10;
  } else if (tomKm > janKm) {
    nextDriver = 'Jan';
    diffKm = Math.round((tomKm - janKm) * 10) / 10;
  }

  const avgKm = totalTrips > 0 ? Math.round((totalKm / totalTrips) * 10) / 10 : 0;

  return (
    <div className="space-y-6">
      {/* 1. Hlavní přehledové karty */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Celkem km */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-xl relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-24 h-24 bg-amber-500/10 rounded-full blur-2xl group-hover:bg-amber-500/20 transition"></div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Celkem najeto
            </span>
            <div className="w-8 h-8 rounded-lg bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <Gauge size={16} />
            </div>
          </div>
          <div className="text-3xl font-black font-mono text-white mb-1">
            {Math.round(totalKm * 10) / 10} <span className="text-base font-normal text-slate-400">km</span>
          </div>
          <div className="text-xs text-slate-400 flex items-center gap-1.5">
            <Car size={13} className="text-amber-400" />
            <span>Celkem za {totalTrips} kapelních jízd</span>
          </div>
        </div>

        {/* Aktivní km (k vyřešení) */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-xl relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-24 h-24 bg-rose-500/10 rounded-full blur-2xl group-hover:bg-rose-500/20 transition"></div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Nevyřešeno
            </span>
            <div className="w-8 h-8 rounded-lg bg-rose-500/15 border border-rose-500/30 flex items-center justify-center text-rose-400">
              <Clock size={16} />
            </div>
          </div>
          <div className="text-3xl font-black font-mono text-white mb-1">
            {Math.round(activeKm * 10) / 10} <span className="text-base font-normal text-slate-400">km</span>
          </div>
          <div className="text-xs text-slate-400 flex items-center gap-1.5">
            <span>{activeTrips.length} aktivních jízd</span>
          </div>
        </div>

        {/* Vyřešeno v archivu */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-xl relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/10 rounded-full blur-2xl group-hover:bg-emerald-500/20 transition"></div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Vyřešeno v archivu
            </span>
            <div className="w-8 h-8 rounded-lg bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <CheckCircle2 size={16} />
            </div>
          </div>
          <div className="text-3xl font-black font-mono text-white mb-1">
            {Math.round(resolvedKm * 10) / 10} <span className="text-base font-normal text-slate-400">km</span>
          </div>
          <div className="text-xs text-slate-400 flex items-center gap-1.5">
            <span>{resolvedTrips.length} archivovaných jízd</span>
          </div>
        </div>

        {/* Průměr na jízdu */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-xl relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-24 h-24 bg-blue-500/10 rounded-full blur-2xl group-hover:bg-blue-500/20 transition"></div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Průměr na jízdu
            </span>
            <div className="w-8 h-8 rounded-lg bg-blue-500/15 border border-blue-500/30 flex items-center justify-center text-blue-400">
              <TrendingUp size={16} />
            </div>
          </div>
          <div className="text-3xl font-black font-mono text-white mb-1">
            {avgKm} <span className="text-base font-normal text-slate-400">km</span>
          </div>
          <div className="text-xs text-slate-400 flex items-center gap-1.5">
            <span>Na 1 otočku / štaci</span>
          </div>
        </div>
      </div>

      {/* 2. Rozpad podle řidičů (Jan vs. Tom) s Progress barem */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6">
          <div>
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <User size={18} className="text-amber-400" />
              Srovnání řidičů: Jan vs. Tom
            </h3>
            <p className="text-xs text-slate-400">
              Procentuální a kilometrové vyvážení odřízených jízd v kapele
            </p>
          </div>

          {/* Doporučení pro férovost */}
          <div className="px-3.5 py-1.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs flex items-center gap-2">
            <Sparkles size={14} className="text-amber-400" />
            <span>
              Příště by měl řídit: <strong className="font-bold underline">{nextDriver}</strong>
              {diffKm > 0 ? ` (má o ${diffKm} km méně)` : ' (ideální plichta!)'}
            </span>
          </div>
        </div>

        {/* Velký grafický Progress Bar */}
        <div className="space-y-2 mb-6">
          <div className="flex justify-between items-end text-sm font-bold">
            <div className="flex items-center gap-2 text-blue-400">
              <span className="w-3 h-3 rounded-full bg-blue-500"></span>
              <span>Jan: {janPercent}%</span>
            </div>
            <div className="flex items-center gap-2 text-emerald-400">
              <span>Tom: {tomPercent}%</span>
              <span className="w-3 h-3 rounded-full bg-emerald-500"></span>
            </div>
          </div>

          <div className="w-full h-5 bg-slate-800 rounded-full overflow-hidden flex p-1 border border-slate-700/80 shadow-inner">
            <div
              style={{ width: `${janPercent}%` }}
              className="h-full bg-gradient-to-r from-blue-600 to-blue-400 rounded-l-full transition-all duration-700 relative group"
              title={`Jan: ${janKm} km (${janPercent}%)`}
            ></div>
            <div
              style={{ width: `${tomPercent}%` }}
              className="h-full bg-gradient-to-r from-emerald-400 to-emerald-600 rounded-r-full transition-all duration-700 relative group"
              title={`Tom: ${tomKm} km (${tomPercent}%)`}
            ></div>
          </div>
        </div>

        {/* Detailní porovnání ve dvou sloupcích */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Jan karta */}
          <div className="p-4 rounded-xl bg-blue-950/20 border border-blue-500/30 space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-bold text-blue-300 flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-blue-500"></span>
                Jan
              </span>
              <span className="text-xl font-mono font-black text-white">
                {Math.round(janKm * 10) / 10} <span className="text-xs font-normal text-slate-400">km</span>
              </span>
            </div>
            <div className="text-xs text-slate-400 space-y-1 pt-1 border-t border-blue-900/40">
              <div className="flex justify-between">
                <span>Počet odřízených jízd:</span>
                <span className="text-slate-200 font-medium">{janTrips.length}</span>
              </div>
              <div className="flex justify-between">
                <span>Aktivní / dosud nevyřešené:</span>
                <span className="text-slate-200 font-medium">
                  {janTrips.filter((t) => !t.is_resolved).reduce((s, t) => s + Number(t.distance_km || 0), 0)} km
                </span>
              </div>
            </div>
          </div>

          {/* Tom karta */}
          <div className="p-4 rounded-xl bg-emerald-950/20 border border-emerald-500/30 space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-bold text-emerald-300 flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
                Tom
              </span>
              <span className="text-xl font-mono font-black text-white">
                {Math.round(tomKm * 10) / 10} <span className="text-xs font-normal text-slate-400">km</span>
              </span>
            </div>
            <div className="text-xs text-slate-400 space-y-1 pt-1 border-t border-emerald-900/40">
              <div className="flex justify-between">
                <span>Počet odřízených jízd:</span>
                <span className="text-slate-200 font-medium">{tomTrips.length}</span>
              </div>
              <div className="flex justify-between">
                <span>Aktivní / dosud nevyřešené:</span>
                <span className="text-slate-200 font-medium">
                  {tomTrips.filter((t) => !t.is_resolved).reduce((s, t) => s + Number(t.distance_km || 0), 0)} km
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 3. Rozpad podle typu akce (Koncerty vs. Zkoušky) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Koncerty */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 shadow-lg flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-rose-400 uppercase tracking-wider block mb-1">
              🎸 Koncerty & Šňůry
            </span>
            <div className="text-2xl font-black font-mono text-white">
              {Math.round(concertKm * 10) / 10} <span className="text-sm font-normal text-slate-400">km</span>
            </div>
            <span className="text-xs text-slate-500">{concertTrips.length} vystoupení</span>
          </div>
          <div className="text-right">
            <span className="text-lg font-mono font-bold text-rose-400">
              {totalKm > 0 ? Math.round((concertKm / totalKm) * 100) : 0}%
            </span>
            <span className="block text-[11px] text-slate-500">ze všech km</span>
          </div>
        </div>

        {/* Zkoušky */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 shadow-lg flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-indigo-400 uppercase tracking-wider block mb-1">
              🥁 Zkoušky kapely
            </span>
            <div className="text-2xl font-black font-mono text-white">
              {Math.round(rehearsalKm * 10) / 10} <span className="text-sm font-normal text-slate-400">km</span>
            </div>
            <span className="text-xs text-slate-500">{rehearsalTrips.length} zkoušek</span>
          </div>
          <div className="text-right">
            <span className="text-lg font-mono font-bold text-indigo-400">
              {totalKm > 0 ? Math.round((rehearsalKm / totalKm) * 100) : 0}%
            </span>
            <span className="block text-[11px] text-slate-500">ze všech km</span>
          </div>
        </div>
      </div>
    </div>
  );
}
