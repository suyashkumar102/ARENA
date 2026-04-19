import Link from 'next/link';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[#0F172A] text-slate-100 flex flex-col font-sans overflow-x-hidden">
      
      {/* Navbar */}
      <nav className="flex justify-between items-center p-6 lg:px-12 border-b border-slate-800">
        <div className="text-xl font-bold tracking-widest uppercase flex items-center gap-3">
          <div className="w-3 h-3 bg-amber-500 rounded-full"></div>
          ARENA
        </div>
        <button className="bg-white text-black px-5 py-2 rounded font-bold text-sm hover:bg-slate-200 transition-colors">
          Request Demo
        </button>
      </nav>

      {/* Hero Section */}
      <main className="flex-1 flex flex-col items-center justify-center text-center px-4 py-20 relative">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/4 left-1/4 w-[50vw] h-[50vw] bg-amber-500/5 blur-[120px] rounded-full"></div>
          <div className="absolute bottom-0 right-1/4 w-[40vw] h-[40vw] bg-blue-500/5 blur-[120px] rounded-full"></div>
        </div>

        <h1 className="text-5xl md:text-7xl font-bold tracking-tight mb-6 max-w-4xl z-10 leading-tight">
          Every stadium. <br className="hidden md:block"/>
          <span className="text-amber-500">Always in control.</span>
        </h1>
        
        <p className="text-lg md:text-xl text-slate-400 max-w-2xl mb-10 z-10">
          Real-time crowd intelligence for venue operators.<br/>
          Predict what happens next. Act before it does.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 z-10">
          <Link href="/operator" className="bg-amber-500 hover:bg-amber-400 text-black px-8 py-4 rounded-lg font-bold text-lg transition-colors flex items-center justify-center gap-2">
            Operator Dashboard <span aria-hidden="true">&rarr;</span>
          </Link>
          <Link href="/fan" className="bg-slate-800 hover:bg-slate-700 border border-slate-700 text-white px-8 py-4 rounded-lg font-bold text-lg transition-colors flex items-center justify-center gap-2">
            Fan Experience <span aria-hidden="true">&rarr;</span>
          </Link>
        </div>
      </main>

      {/* The Problem */}
      <section className="py-24 px-6 lg:px-12 bg-slate-900 border-y border-slate-800 flex justify-center text-center">
        <blockquote className="max-w-4xl">
          <p className="text-2xl md:text-4xl font-medium leading-relaxed text-slate-300">
            &quot;A venue director managing 60,000 people has less real-time intelligence than a delivery manager handling 200 orders.&quot;
          </p>
          <footer className="mt-8 text-amber-500 font-bold uppercase tracking-wider text-sm">
            ARENA FIXES THAT
          </footer>
        </blockquote>
      </section>

      {/* How it works */}
      <section className="py-24 px-6 lg:px-12 max-w-7xl mx-auto w-full">
        <div className="grid md:grid-cols-3 gap-8">
          <div className="bg-slate-800/50 border border-slate-700 p-8 rounded-2xl">
            <h3 className="text-xl font-bold mb-4 text-white">Match-Aware Prediction</h3>
            <p className="text-slate-400">Reads the game state to predict crowd movements 10 minutes ahead with 85-91% confidence.</p>
          </div>
          <div className="bg-slate-800/50 border border-slate-700 p-8 rounded-2xl">
            <h3 className="text-xl font-bold mb-4 text-white">Operator Command Centre</h3>
            <p className="text-slate-400">A dense, real-time intelligence dashboard to visualize zones, staff, and AI briefings.</p>
          </div>
          <div className="bg-slate-800/50 border border-slate-700 p-8 rounded-2xl">
            <h3 className="text-xl font-bold mb-4 text-white">Fan Communication Layer</h3>
            <p className="text-slate-400">Operator-controlled fan experience that prevents surges before they happen.</p>
          </div>
        </div>
      </section>

      {/* Metrics Row */}
      <section className="py-12 border-t border-slate-800 bg-slate-900/50">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-around items-center gap-8 text-center">
          <div>
            <div className="text-4xl font-bold font-mono-numbers text-white mb-2">85-91%</div>
            <div className="text-sm font-bold tracking-widest text-slate-500 uppercase">Prediction Confidence</div>
          </div>
          <div>
            <div className="text-4xl font-bold font-mono-numbers text-white mb-2">10 Min</div>
            <div className="text-sm font-bold tracking-widest text-slate-500 uppercase">Look-Ahead</div>
          </div>
          <div>
            <div className="text-4xl font-bold font-mono-numbers text-white mb-2">6</div>
            <div className="text-sm font-bold tracking-widest text-slate-500 uppercase">Google Services</div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="p-8 text-center text-slate-500 border-t border-slate-800 text-sm">
        ARENA — Stadium Operations Intelligence
      </footer>

    </div>
  );
}
