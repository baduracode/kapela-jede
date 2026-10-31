'use client';

import React, { useState } from 'react';
import { TripFormData, TripType, Driver } from '@/lib/types';
import { MapPin, Navigation, Compass, Loader2, Plus, Calendar, User, Gauge, ChevronDown, ChevronUp } from 'lucide-react';

interface TripFormProps {
  onSubmit: (data: TripFormData) => Promise<void>;
  requirePinAction: (action: () => void, title?: string, desc?: string) => void;
  isUnlocked: boolean;
}

export function TripForm({ onSubmit, requirePinAction, isUnlocked }: TripFormProps) {
  const todayStr = new Date().toISOString().split('T')[0];

  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [date, setDate] = useState<string>(todayStr);
  const [tripType, setTripType] = useState<TripType>('Koncert');
  const [origin, setOrigin] = useState<string>('Zlín');
  const [destination, setDestination] = useState<string>('');
  const [driver, setDriver] = useState<Driver>('Jan');
  const [distanceKm, setDistanceKm] = useState<string>('');

  // Stavy pro Mapy.cz výpočet
  const [isCalculating, setIsCalculating] = useState<boolean>(false);
  const [mapyMessage, setMapyMessage] = useState<{
    text: string;
    isError?: boolean;
    durationMin?: number;
  } | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  // Volání Mapy.cz API
  const handleCalculateMapy = async () => {
    if (!origin.trim() || !destination.trim()) {
      setMapyMessage({
        text: 'Nejprve vyplňte Výchozí místo i Cíl cesty.',
        isError: true,
      });
      return;
    }

    setIsCalculating(true);
    setMapyMessage(null);

    try {
      const res = await fetch('/api/distance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          origin: origin.trim(),
          destination: destination.trim(),
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        setMapyMessage({
          text: data.error || 'Nepodařilo se spočítat trasu.',
          isError: true,
        });
        return;
      }

      if (data.distanceKm !== undefined) {
        setDistanceKm(String(data.distanceKm));
        setMapyMessage({
          text: `Vypočteno: ${data.distanceKm} km${
            data.durationMinutes ? ` (cca ${Math.floor(data.durationMinutes / 60)}h ${data.durationMinutes % 60}m)` : ''
          }${data.destinationLabel ? ` [${data.destinationLabel}]` : ''}`,
          durationMin: data.durationMinutes,
        });
      }
    } catch (err: unknown) {
      setMapyMessage({
        text: err instanceof Error ? err.message : 'Chyba při komunikaci s API.',
        isError: true,
      });
    } finally {
      setIsCalculating(false);
    }
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!destination.trim()) {
      alert('Vyplňte cíl jízdy.');
      return;
    }

    const distNum = parseFloat(distanceKm);
    if (isNaN(distNum) || distNum <= 0) {
      alert('Zadejte platnou vzdálenost v km (nebo klikněte na "Spočítat přes Mapy.cz").');
      return;
    }

    // Akce chráněná PINem
    requirePinAction(
      async () => {
        setIsSubmitting(true);
        try {
          await onSubmit({
            date,
            trip_type: tripType,
            origin: origin.trim(),
            destination: destination.trim(),
            distance_km: distNum,
            driver,
          });

          // Reset formuláře po úspěšném přidání
          setDestination('');
          setDistanceKm('');
          setMapyMessage(null);
        } finally {
          setIsSubmitting(false);
        }
      },
      'Zadání nové jízdy',
      'Pro uložení nové jízdy do databáze zadejte kapelní PIN.'
    );
  };

  if (!isOpen) {
    return (
      <div className="mb-6">
        <button
          type="button"
          onClick={() => setIsOpen(true)}
          className="w-full p-4 sm:p-4.5 rounded-2xl bg-slate-900/90 border border-slate-800 hover:border-amber-500/50 shadow-lg text-left transition group flex items-center justify-between"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400 group-hover:scale-105 group-hover:bg-amber-500/25 transition">
              <Plus size={20} className="stroke-[2.5]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-white group-hover:text-amber-300 transition">
                  Zapsat novou jízdu
                </h2>
                {!isUnlocked && (
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-800 border border-slate-700 text-slate-400 font-normal">
                    🔒 vyžaduje PIN
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-400">
                Kliknutím rozbalíte formulář pro zadání koncertu nebo zkoušky
              </p>
            </div>
          </div>
          <div className="flex items-center gap-1.5 text-xs font-semibold text-amber-300 group-hover:translate-x-0.5 transition px-3 py-1.5 rounded-xl bg-amber-500/10 border border-amber-500/20">
            <span>Rozbalit</span>
            <ChevronDown size={16} />
          </div>
        </button>
      </div>
    );
  }

  return (
    <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 sm:p-6 shadow-xl mb-8 animate-fadeIn">
      <div className="flex items-center justify-between pb-4 mb-5 border-b border-slate-800">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400">
            <Plus size={18} />
          </div>
          <h2 className="text-lg font-bold text-white tracking-wide">Zapsat novou jízdu</h2>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-xs text-slate-400 hidden sm:inline">
            {!isUnlocked && '🔒 Vyžaduje PIN při odeslání'}
          </span>
          <button
            type="button"
            onClick={() => setIsOpen(false)}
            className="flex items-center gap-1 text-xs text-slate-400 hover:text-white px-2.5 py-1.5 rounded-xl bg-slate-800/80 hover:bg-slate-800 border border-slate-700 transition"
          >
            <span>Sbalit</span>
            <ChevronUp size={15} />
          </button>
        </div>
      </div>

      <form onSubmit={handleFormSubmit} className="space-y-4">
        {/* 1. Řádek: Datum a Typ jízdy */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
              <Calendar size={13} className="text-slate-400" />
              Datum jízdy
            </label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              required
              className="w-full bg-slate-800/90 border border-slate-700 rounded-xl px-3.5 py-2.5 text-white text-sm focus:outline-none focus:ring-2 focus:ring-amber-400/40 focus:border-amber-400 transition"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
              Typ jízdy
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setTripType('Koncert')}
                className={`py-2 px-3 rounded-xl text-sm font-semibold border transition flex items-center justify-center gap-1.5 ${
                  tripType === 'Koncert'
                    ? 'bg-rose-500/20 border-rose-500/50 text-rose-300 shadow-sm'
                    : 'bg-slate-800/80 border-slate-700 text-slate-400 hover:text-slate-200'
                }`}
              >
                🎸 Koncert
              </button>
              <button
                type="button"
                onClick={() => setTripType('Zkouška')}
                className={`py-2 px-3 rounded-xl text-sm font-semibold border transition flex items-center justify-center gap-1.5 ${
                  tripType === 'Zkouška'
                    ? 'bg-indigo-500/20 border-indigo-500/50 text-indigo-300 shadow-sm'
                    : 'bg-slate-800/80 border-slate-700 text-slate-400 hover:text-slate-200'
                }`}
              >
                🥁 Zkouška
              </button>
            </div>
          </div>
        </div>

        {/* 2. Řádek: Odkud a Kam */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
              <MapPin size={13} className="text-amber-400" />
              Start (Odkud)
            </label>
            <input
              type="text"
              value={origin}
              onChange={(e) => setOrigin(e.target.value)}
              placeholder="např. Zlín"
              required
              className="w-full bg-slate-800/90 border border-slate-700 rounded-xl px-3.5 py-2.5 text-white text-sm focus:outline-none focus:ring-2 focus:ring-amber-400/40 focus:border-amber-400 transition"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
              <Navigation size={13} className="text-emerald-400" />
              Cíl (Kam)
            </label>
            <input
              type="text"
              value={destination}
              onChange={(e) => setDestination(e.target.value)}
              placeholder="např. Praha, Brno - Fléda, Ostrava"
              required
              className="w-full bg-slate-800/90 border border-slate-700 rounded-xl px-3.5 py-2.5 text-white text-sm placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-400/40 focus:border-amber-400 transition"
            />
          </div>
        </div>

        {/* 3. Řádek: Řidič a Vzdálenost s Mapy.cz tlačítkem */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
              <User size={13} className="text-slate-400" />
              Řidič
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setDriver('Jan')}
                className={`py-2 px-3 rounded-xl text-sm font-bold border transition flex items-center justify-center gap-2 ${
                  driver === 'Jan'
                    ? 'bg-blue-600/25 border-blue-500/60 text-blue-300 shadow-md ring-1 ring-blue-500/40'
                    : 'bg-slate-800/80 border-slate-700 text-slate-400 hover:text-slate-200'
                }`}
              >
                <span className="w-2.5 h-2.5 rounded-full bg-blue-500"></span>
                Jan
              </button>
              <button
                type="button"
                onClick={() => setDriver('Tom')}
                className={`py-2 px-3 rounded-xl text-sm font-bold border transition flex items-center justify-center gap-2 ${
                  driver === 'Tom'
                    ? 'bg-emerald-600/25 border-emerald-500/60 text-emerald-300 shadow-md ring-1 ring-emerald-500/40'
                    : 'bg-slate-800/80 border-slate-700 text-slate-400 hover:text-slate-200'
                }`}
              >
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
                Tom
              </button>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
              <Gauge size={13} className="text-amber-400" />
              Vzdálenost (km)
            </label>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <input
                  type="number"
                  step="0.1"
                  min="0"
                  value={distanceKm}
                  onChange={(e) => setDistanceKm(e.target.value)}
                  placeholder="např. 198"
                  required
                  className="w-full bg-slate-800/90 border border-slate-700 rounded-xl px-3.5 py-2.5 pr-10 text-white text-sm font-mono focus:outline-none focus:ring-2 focus:ring-amber-400/40 focus:border-amber-400 transition"
                />
                <span className="absolute right-3.5 top-2.5 text-xs text-slate-400 font-medium">
                  km
                </span>
              </div>

              <button
                type="button"
                onClick={handleCalculateMapy}
                disabled={isCalculating}
                title="Automaticky spočítá vzdálenost autem přes Mapy.cz REST API"
                className="px-3.5 py-2.5 rounded-xl bg-amber-500/15 hover:bg-amber-500/25 border border-amber-500/40 text-amber-300 text-xs font-bold transition flex items-center gap-1.5 whitespace-nowrap active:scale-95 disabled:opacity-50"
              >
                {isCalculating ? (
                  <>
                    <Loader2 size={14} className="animate-spin" />
                    <span>Počítám...</span>
                  </>
                ) : (
                  <>
                    <Compass size={14} className="text-amber-400" />
                    <span>Spočítat přes Mapy.cz</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Informační zpráva z Mapy.cz API */}
        {mapyMessage && (
          <div
            className={`text-xs px-3.5 py-2 rounded-xl border flex items-center gap-2 animate-fadeIn ${
              mapyMessage.isError
                ? 'bg-rose-950/40 border-rose-500/30 text-rose-300'
                : 'bg-emerald-950/40 border-emerald-500/30 text-emerald-300'
            }`}
          >
            <span>{mapyMessage.text}</span>
          </div>
        )}

        {/* Tlačítko Odeslat */}
        <div className="pt-2">
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full sm:w-auto px-6 py-3 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold text-sm shadow-lg shadow-amber-500/20 transition transform active:scale-[0.99] flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {isSubmitting ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                <span>Ukládám jízdu...</span>
              </>
            ) : (
              <>
                <Plus size={16} className="stroke-[2.5]" />
                <span>Zapsat jízdu do evidence</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
