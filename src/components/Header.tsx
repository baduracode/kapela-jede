'use client';

import React from 'react';
import { Truck, Music, Lock, Unlock, Database, BarChart3, ListPlus } from 'lucide-react';

interface HeaderProps {
  activeTab: 'trips' | 'stats';
  onTabChange: (tab: 'trips' | 'stats') => void;
  isUnlocked: boolean;
  onLock: () => void;
  onOpenPinModal: () => void;
  isSupabaseLive: boolean;
  pendingTripsCount: number;
}

export function Header({
  activeTab,
  onTabChange,
  isUnlocked,
  onLock,
  onOpenPinModal,
  isSupabaseLive,
  pendingTripsCount,
}: HeaderProps) {
  return (
    <header className="border-b border-slate-800 bg-slate-900/90 backdrop-blur-md sticky top-0 z-40">
      <div className="max-w-5xl mx-auto px-4 py-3 sm:py-4">
        {/* Horní řádek s logem a stavem PINu */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-500 via-rose-500 to-indigo-600 flex items-center justify-center text-white shadow-lg shadow-amber-500/20">
              <Truck size={22} className="stroke-[2.2]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-black tracking-tight text-white flex items-center gap-1.5">
                  KAPELA JEDE
                  <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30">
                    v2.0
                  </span>
                </h1>
              </div>
              <p className="text-xs text-slate-400">
                Evidence najetých km pro kapelu (Jan vs. Tom)
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-auto">
            {/* Supabase status badge pouze pokud je online */}
            {isSupabaseLive && (
              <div
                title="Data se synchronizují s cloudovou databází Supabase"
                className="flex items-center gap-1.5 text-[11px] px-2.5 py-1 rounded-lg border font-medium bg-emerald-950/40 border-emerald-500/30 text-emerald-300 transition"
              >
                <Database size={13} className="text-emerald-400" />
                <span>Supabase online</span>
              </div>
            )}

            {/* PIN Security toggle */}
            {isUnlocked ? (
              <button
                onClick={onLock}
                className="flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-lg bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 hover:bg-emerald-500/25 transition group"
                title="Kliknutím zamknete zápis"
              >
                <Unlock size={14} className="text-emerald-400" />
                <span className="font-semibold">Odemčeno</span>
                <span className="text-[10px] text-emerald-400/80 group-hover:underline">(zamknout)</span>
              </button>
            ) : (
              <button
                onClick={onOpenPinModal}
                className="flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-lg bg-amber-500/15 border border-amber-500/30 text-amber-300 hover:bg-amber-500/25 transition"
                title="Zadejte PIN pro odemčení zápisu nových jízd"
              >
                <Lock size={14} className="text-amber-400" />
                <span className="font-medium">Pouze čtení</span>
                <span className="text-[10px] bg-amber-500/20 px-1.5 py-0.5 rounded font-mono">PIN</span>
              </button>
            )}
          </div>
        </div>

        {/* Přepínač 2 hlavních záložek */}
        <div className="flex border-b border-slate-800 -mb-[1px]">
          <button
            onClick={() => onTabChange('trips')}
            className={`flex items-center gap-2 px-4 py-2.5 text-sm font-semibold border-b-2 transition ${
              activeTab === 'trips'
                ? 'border-amber-400 text-amber-300 bg-amber-400/5'
                : 'border-transparent text-slate-400 hover:text-slate-200 hover:border-slate-700'
            }`}
          >
            <ListPlus size={16} />
            <span>Jízdy & Zápis</span>
            {pendingTripsCount > 0 && (
              <span className="ml-1 px-1.5 py-0.2 rounded-full text-[10px] bg-amber-500/20 text-amber-300 border border-amber-500/30">
                {pendingTripsCount} aktivní
              </span>
            )}
          </button>

          <button
            onClick={() => onTabChange('stats')}
            className={`flex items-center gap-2 px-4 py-2.5 text-sm font-semibold border-b-2 transition ${
              activeTab === 'stats'
                ? 'border-amber-400 text-amber-300 bg-amber-400/5'
                : 'border-transparent text-slate-400 hover:text-slate-200 hover:border-slate-700'
            }`}
          >
            <BarChart3 size={16} />
            <span>Statistiky & Agregace</span>
          </button>
        </div>
      </div>
    </header>
  );
}
