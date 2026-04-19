import { Metadata } from 'next';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'ARENA | Command Centre',
  description: 'Stadium Operations Intelligence',
};

export default function OperatorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-[#0F172A] text-white font-sans">
      <a href="#main-content" className="sr-only focus:not-sr-only focus:absolute focus:p-4 focus:bg-amber-500 focus:text-black">
        Skip to main content
      </a>
      <main id="main-content" className="p-4 h-screen max-h-screen overflow-hidden flex flex-col">
        {children}
      </main>
    </div>
  );
}
