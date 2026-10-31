import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Kapela Jede | Evidence kapelních jízd',
  description: 'Chytrá evidence kapelních cesťáků a rozpadu kilometrů (Jan vs. Tom) s Mapy.cz API a Supabase.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="cs" className="dark">
      <body className="min-h-screen bg-[#0a0f18] text-slate-100 antialiased selection:bg-amber-500/30 selection:text-amber-200">
        {children}
      </body>
    </html>
  );
}
