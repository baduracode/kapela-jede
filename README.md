# 🎸 KAPELA JEDE – Evidence kapelních jízd

Kompletní webová aplikace v **Next.js (App Router)** s **Tailwind CSS**, propojená na **Supabase** a **Mapy.cz REST API v2**, navržená pro spravedlivé sledování kilometrů mezi řidiči kapely (Jan vs. Tom).

---

## 🚀 Hlavní funkce

### 1. Záložka „Jízdy & Zápis“
- **Formulář pro novou jízdu:**
  - Datum (výchozí dnešek).
  - Typ jízdy (Koncert / Zkouška).
  - Start (předvyplněno `Zlín`, editovatelné).
  - Cíl cesty (např. *Praha - Palác Akropolis*, *Brno - Fléda* apod.).
  - Řidič (`Jan` nebo `Tom`).
  - Vzdálenost v km (editovatelná).
  - Tlačítko **„Spočítat přes Mapy.cz“**:
    - Zavolá API Route `/api/distance`.
    - Přes Mapy.cz REST API v2 provede geokódování startu i cíle a naplánuje optimální automobilovou trasu.
    - Doporučenou vzdálenost v kilometrech a odhadovaný čas automaticky doplní do inputu.
- **Seznam aktivních jízd (`is_resolved = false`):**
  - Karty s informacemi o trase, řidiči, datu a kilometrech.
  - Tlačítko **„Vyřešeno“** pro uzavření cesťáku a přesunutí do archivu.
- **Archiv vyřešených jízd (Akordeon):**
  - Rozbalovací přehled všech uzavřených historických jízd.
  - Možnost jízdu vrátit zpět mezi aktivní nebo smazat.

### 2. Záložka „Statistiky & Agregace“
- Přehledné karty se součtem:
  - Celkem najeté kilometry kapely.
  - Kilometry k vyřešení vs. archivované kilometry.
  - Průměrná vzdálenost na jednu jízdu.
- **Rozpad podle jednotlivých řidičů (Jan vs. Tom):**
  - Vizuální poměrový **Progress Bar** ukazující procentuální zastoupení obou řidičů.
  - Karty s celkovými km, počtem odřízených akcí a nevyřešenými km pro každého zvlášť.
  - **Doporučení pro příští jízdu:** Automaticky spočítá, kdo má méně kilometrů a měl by řídit příště pro férové vyrovnání.
- Rozpad poměru km podle typu akce (Koncerty vs. Zkoušky).

### 3. Zabezpečení zápisu 4místným PINem
- Prohlížení evidence i statistik je veřejné.
- Jakýkoliv zápis (vytvoření jízdy, označení jako vyřešeno, vrácení z archivu, smazání) vyžaduje zadání 4místného PINu (výchozí: `1234`, konfigurovatelný v proměnné `NEXT_PUBLIC_APP_PIN`).
- Po úspěšném zadání se stav uloží do `localStorage`, takže uživatel nemusí PIN při další akci zadávat znovu.
- V záhlaví je indikátor stavu a možnost jedním klikem aplikaci opět zamknout.

---

## 🛠️ Nastavení a instalace

### 1. Požadavky
- [Node.js](https://nodejs.org/) verze 18 nebo vyšší.

### 2. Nastavení proměnných prostředí
Zkopírujte `.env.local.example` na `.env.local`:
```bash
cp .env.local.example .env.local
```
V `.env.local` upravte:
- `NEXT_PUBLIC_SUPABASE_URL`: URL vašeho Supabase projektu.
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`: Veřejný Anon klíč z vašeho Supabase projektu.
- `MAPY_CZ_API_KEY`: API klíč pro Mapy.cz REST API (získat můžete zdarma na [developer.mapy.cz](https://developer.mapy.cz/)).
- `NEXT_PUBLIC_APP_PIN`: Váš 4místný PIN pro autorizaci zápisu (např. `1234`).

> **Poznámka:** Pokud Supabase proměnné zatím nevyplníte, aplikace automaticky funguje v lokálním testovacím režimu (data ukládá do prohlížeče a předvyplní ukázkové jízdy).

### 3. Nastavení databáze v Supabase
1. Přihlaste se do [Supabase Dashboardu](https://supabase.com).
2. Přejděte do sekce **SQL Editor**.
3. Otevřete a zkopírujte obsah souboru [`schema.sql`](file:///schema.sql).
4. Spusťte skript kliknutím na tlačítko **Run**. Tím se vytvoří tabulka `trips`, indexy, bezpečnostní politiky Row Level Security (RLS) a vzorová data.

### 4. Instalace balíčků a spuštění
```bash
npm install
npm run dev
```
Aplikace poběží na [http://localhost:3000](http://localhost:3000).

---

## 📂 Struktura projektu

- `schema.sql` – SQL schéma tabulky `trips` a RLS pro Supabase
- `.env.local.example` & `.env.local` – Konfigurace API klíčů a PINu
- `src/app/page.tsx` – Hlavní single page aplikace se 2 záložkami
- `src/app/api/distance/route.ts` – API route pro výpočet vzdálenosti přes Mapy.cz
- `src/components/TripForm.tsx` – Formulář zápisu jízdy s Mapy.cz kalkulací
- `src/components/ActiveTripsList.tsx` – Seznam aktivních jízd s tlačítkem „Vyřešeno“
- `src/components/ResolvedTripsArchive.tsx` – Akordeon pro archiv starších jízd
- `src/components/StatsView.tsx` – Statistiky, agregace km a poměr Jan vs. Tom
- `src/components/PinModal.tsx` – 4místné modální ověření PINu
- `src/hooks/usePinAuth.ts` – Hook pro správu odemčeného stavu v `localStorage`
- `src/lib/mapy.ts` – Klient pro Mapy.cz REST API v2 (geocoding + routing)
- `src/lib/supabase.ts` – Databázový klient a offline fallback
