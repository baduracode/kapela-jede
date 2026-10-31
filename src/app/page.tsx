'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Trip, TripFormData } from '@/lib/types';
import {
  fetchTrips,
  createTrip,
  toggleTripResolved,
  deleteTrip,
  isSupabaseConfigured,
} from '@/lib/supabase';
import { usePinAuth } from '@/hooks/usePinAuth';
import { Header } from '@/components/Header';
import { PinModal } from '@/components/PinModal';
import { TripForm } from '@/components/TripForm';
import { ActiveTripsList } from '@/components/ActiveTripsList';
import { ResolvedTripsArchive } from '@/components/ResolvedTripsArchive';
import { StatsView } from '@/components/StatsView';
import { AlertCircle, CheckCircle, Info, Loader2, RefreshCw } from 'lucide-react';

export default function HomePage() {
  const [activeTab, setActiveTab] = useState<'trips' | 'stats'>('trips');
  const [trips, setTrips] = useState<Trip[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(
    null
  );

  const isSupabaseLive = isSupabaseConfigured();

  const {
    isUnlocked,
    isModalOpen,
    modalTitle,
    modalDescription,
    unlockWithPin,
    lock,
    executeProtectedAction,
    openUnlockModal,
    closeUnlockModal,
  } = usePinAuth();

  const showToast = useCallback((message: string, type: 'success' | 'error' | 'info' = 'success') => {
    setToast({ message, type });
    setTimeout(() => {
      setToast((prev) => (prev?.message === message ? null : prev));
    }, 4000);
  }, []);

  const loadTrips = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await fetchTrips();
      setTrips(data);
    } catch (err: unknown) {
      console.error('Chyba při načítání:', err);
      showToast('Nepodařilo se načíst jízdy.', 'error');
    } finally {
      setIsLoading(false);
    }
  }, [showToast]);

  useEffect(() => {
    loadTrips();
  }, [loadTrips]);

  // Vytvoření nové jízdy
  const handleCreateTrip = async (formData: TripFormData) => {
    try {
      const created = await createTrip({
        date: formData.date,
        trip_type: formData.trip_type,
        origin: formData.origin,
        destination: formData.destination,
        distance_km: Number(formData.distance_km),
        driver: formData.driver,
      });

      setTrips((prev) => [created, ...prev]);
      showToast(`Jízda do "${formData.destination}" (${formData.distance_km} km) byla uložena!`, 'success');
    } catch (err: unknown) {
      showToast('Chyba při ukládání jízdy.', 'error');
      throw err;
    }
  };

  // Označení jako vyřešeno
  const handleResolveTrip = async (id: string) => {
    try {
      await toggleTripResolved(id, true);
      setTrips((prev) =>
        prev.map((t) => (t.id === id ? { ...t, is_resolved: true } : t))
      );
      showToast('Jízda byla přesunuta do archivu vyřešených.', 'success');
    } catch (err: unknown) {
      showToast('Nepodařilo se označit jízdu jako vyřešenou.', 'error');
    }
  };

  // Vrácení z archivu
  const handleUnresolveTrip = async (id: string) => {
    try {
      await toggleTripResolved(id, false);
      setTrips((prev) =>
        prev.map((t) => (t.id === id ? { ...t, is_resolved: false } : t))
      );
      showToast('Jízda byla vrácena mezi aktivní.', 'info');
    } catch (err: unknown) {
      showToast('Nepodařilo se vrátit jízdu mezi aktivní.', 'error');
    }
  };

  // Smazání jízdy
  const handleDeleteTrip = async (id: string) => {
    try {
      await deleteTrip(id);
      setTrips((prev) => prev.filter((t) => t.id !== id));
      showToast('Jízda byla smazána.', 'info');
    } catch (err: unknown) {
      showToast('Nepodařilo se smazat jízdu.', 'error');
    }
  };

  const activeTripsCount = trips.filter((t) => !t.is_resolved).length;

  return (
    <div className="min-h-screen flex flex-col bg-[#0a0f18]">
      {/* Horní hlavička a navigace */}
      <Header
        activeTab={activeTab}
        onTabChange={setActiveTab}
        isUnlocked={isUnlocked}
        onLock={lock}
        onOpenPinModal={() => openUnlockModal()}
        isSupabaseLive={isSupabaseLive}
        pendingTripsCount={activeTripsCount}
      />

      {/* Plovoucí notifikace (Toast) */}
      {toast && (
        <div className="fixed bottom-5 right-5 z-50 animate-fadeIn">
          <div
            className={`px-4 py-3 rounded-xl shadow-2xl flex items-center gap-2.5 text-xs font-semibold border ${
              toast.type === 'error'
                ? 'bg-rose-950/90 border-rose-500/50 text-rose-200'
                : toast.type === 'info'
                ? 'bg-blue-950/90 border-blue-500/50 text-blue-200'
                : 'bg-emerald-950/90 border-emerald-500/50 text-emerald-200'
            }`}
          >
            {toast.type === 'error' && <AlertCircle size={16} className="text-rose-400" />}
            {toast.type === 'info' && <Info size={16} className="text-blue-400" />}
            {toast.type === 'success' && <CheckCircle size={16} className="text-emerald-400" />}
            <span>{toast.message}</span>
          </div>
        </div>
      )}

      {/* Hlavní obsah */}
      <main className="flex-1 max-w-5xl w-full mx-auto px-4 py-6 sm:py-8">
        {/* Banner pokud Supabase ještě není nakonfigurovaná */}
        {!isSupabaseLive && (
          <div className="mb-6 p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-200 text-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-lg">
            <div className="flex items-start gap-2.5">
              <Info size={18} className="text-amber-400 flex-shrink-0 mt-0.5" />
              <div>
                <strong className="text-white block font-semibold mb-0.5">
                  Aplikace běží v lokálním testovacím režimu
                </strong>
                <span>
                  Pro propojení se skutečnou databází Supabase doplňte proměnné v{' '}
                  <code className="bg-amber-950/60 px-1.5 py-0.5 rounded text-amber-300 font-mono">
                    .env.local
                  </code>{' '}
                  a spusťte SQL skript{' '}
                  <code className="bg-amber-950/60 px-1.5 py-0.5 rounded text-amber-300 font-mono">
                    schema.sql
                  </code>{' '}
                  v Supabase SQL Editoru. Zápis a výpočty fungují ihned i v tomto režimu!
                </span>
              </div>
            </div>
            <button
              onClick={() => loadTrips()}
              className="px-3 py-1.5 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/40 text-amber-300 font-semibold text-xs transition flex items-center gap-1.5 whitespace-nowrap self-end sm:self-auto"
            >
              <RefreshCw size={13} />
              <span>Obnovit</span>
            </button>
          </div>
        )}

        {/* Indikátor načítání */}
        {isLoading && trips.length === 0 ? (
          <div className="py-20 flex flex-col items-center justify-center gap-3 text-slate-400">
            <Loader2 size={32} className="animate-spin text-amber-400" />
            <p className="text-sm">Načítám kapelní jízdy...</p>
          </div>
        ) : (
          <>
            {/* Záložka 1: Jízdy & Zápis */}
            {activeTab === 'trips' && (
              <div>
                <TripForm
                  onSubmit={handleCreateTrip}
                  requirePinAction={executeProtectedAction}
                  isUnlocked={isUnlocked}
                />

                <ActiveTripsList
                  trips={trips}
                  onResolve={handleResolveTrip}
                  onDelete={handleDeleteTrip}
                  requirePinAction={executeProtectedAction}
                />

                <ResolvedTripsArchive
                  trips={trips}
                  onUnresolve={handleUnresolveTrip}
                  onDelete={handleDeleteTrip}
                  requirePinAction={executeProtectedAction}
                />
              </div>
            )}

            {/* Záložka 2: Statistiky & Agregace */}
            {activeTab === 'stats' && <StatsView trips={trips} />}
          </>
        )}
      </main>

      {/* Patička */}
      <footer className="border-t border-slate-900 bg-slate-950/60 py-6 text-center text-xs text-slate-500">
        <div className="max-w-5xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>🎸 Kapela Jede • Evidence jízd & cesťáků</span>
          <span>Propojeno s Mapy.cz REST API v2 & Supabase</span>
        </div>
      </footer>

      {/* Modální okno pro zadání PINu */}
      <PinModal
        isOpen={isModalOpen}
        onClose={closeUnlockModal}
        onSuccess={unlockWithPin}
        title={modalTitle}
        description={modalDescription}
      />
    </div>
  );
}
