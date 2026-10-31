-- ========================================================================
-- KAPELA JEDE - Evidence kapelních jízd
-- Databázové schéma pro Supabase (PostgreSQL)
-- ========================================================================

-- 1. Vytvoření tabulky 'trips'
CREATE TABLE IF NOT EXISTS public.trips (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    date DATE NOT NULL DEFAULT CURRENT_DATE,
    trip_type TEXT NOT NULL CHECK (trip_type IN ('Koncert', 'Zkouška')),
    origin TEXT NOT NULL DEFAULT 'Zlín',
    destination TEXT NOT NULL,
    distance_km NUMERIC(10, 1) NOT NULL CHECK (distance_km >= 0),
    driver TEXT NOT NULL CHECK (driver IN ('Jan', 'Tom')),
    is_resolved BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 2. Indexy pro rychlé řazení a filtrování
CREATE INDEX IF NOT EXISTS idx_trips_is_resolved ON public.trips (is_resolved);
CREATE INDEX IF NOT EXISTS idx_trips_date ON public.trips (date DESC);
CREATE INDEX IF NOT EXISTS idx_trips_driver ON public.trips (driver);

-- 3. Nastavení Row Level Security (RLS)
-- Tabulku zabezpečíme RLS politikami tak, aby aplikace s Anon klíčem mohla
-- číst i zapisovat záznamy (autorizace zápisu je řízena PINem v aplikaci).
ALTER TABLE public.trips ENABLE ROW LEVEL SECURITY;

-- Politika pro čtení (veřejné pro všechny)
CREATE POLICY "Umožnit veřejné čtení jízd" 
ON public.trips 
FOR SELECT 
USING (true);

-- Politika pro vkládání nových jízd
CREATE POLICY "Umožnit vkládání jízd" 
ON public.trips 
FOR INSERT 
WITH CHECK (true);

-- Politika pro aktualizaci jízd (označení jako vyřešeno, vrácení z archivu)
CREATE POLICY "Umožnit aktualizaci jízd" 
ON public.trips 
FOR UPDATE 
USING (true)
WITH CHECK (true);

-- Politika pro mazání jízd (případné odstranění)
CREATE POLICY "Umožnit mazání jízd" 
ON public.trips 
FOR DELETE 
USING (true);

-- ========================================================================
-- 4. Ukázková počáteční data pro otestování (volitelné)
-- ========================================================================
INSERT INTO public.trips (date, trip_type, origin, destination, distance_km, driver, is_resolved)
VALUES
    (CURRENT_DATE - INTERVAL '10 days', 'Koncert', 'Zlín', 'Brno - Fléda', 198.0, 'Jan', true),
    (CURRENT_DATE - INTERVAL '7 days', 'Zkouška', 'Zlín', 'Uherské Hradiště', 54.0, 'Tom', true),
    (CURRENT_DATE - INTERVAL '4 days', 'Koncert', 'Zlín', 'Ostrava - Barrák', 212.0, 'Tom', true),
    (CURRENT_DATE - INTERVAL '2 days', 'Zkouška', 'Zlín', 'Otrokovice', 24.0, 'Jan', false),
    (CURRENT_DATE, 'Koncert', 'Zlín', 'Praha - Akropolis', 602.0, 'Jan', false)
ON CONFLICT DO NOTHING;
