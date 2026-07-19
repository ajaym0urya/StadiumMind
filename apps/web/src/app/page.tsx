import Link from "next/link";
import { Shield, Users, HelpCircle, Activity, Leaf, Landmark } from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-screen bg-[#07080e] relative overflow-hidden flex flex-col justify-between">
      {/* Background gradients */}
      <div className="absolute top-[-20%] left-[-10%] w-[50%] aspect-square rounded-full bg-indigo-900/20 blur-[120px] pointer-events-none"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[45%] aspect-square rounded-full bg-emerald-900/10 blur-[100px] pointer-events-none"></div>

      {/* Header */}
      <header className="w-full max-w-7xl mx-auto px-6 py-6 flex items-center justify-between border-b border-slate-900 z-10">
        <div className="flex items-center space-x-2.5">
          <div className="h-9 w-9 rounded bg-indigo-600 flex items-center justify-center font-bold text-lg text-white shadow-lg shadow-indigo-600/30">
            S
          </div>
          <span className="font-outfit text-xl font-bold tracking-tight bg-gradient-to-r from-white via-slate-200 to-indigo-400 bg-clip-text text-transparent">
            StadiumMind <span className="text-indigo-500">AI</span>
          </span>
        </div>
        <div className="flex items-center space-x-4">
          <span className="text-xs font-mono bg-slate-900 px-3 py-1.5 rounded-full border border-slate-800 text-indigo-400">
            FIFA 2026 Operations Edition
          </span>
        </div>
      </header>

      {/* Main Hero & Role Selection */}
      <main className="max-w-7xl mx-auto px-6 py-12 md:py-20 flex flex-col items-center justify-center text-center z-10 flex-grow">
        <h1 className="font-outfit text-4xl md:text-6xl font-extrabold tracking-tight max-w-4xl text-slate-100 leading-tight">
          Next-Gen <span className="bg-gradient-to-r from-indigo-400 to-emerald-400 bg-clip-text text-transparent">Decision Support</span> for Large-Scale Venues
        </h1>
        <p className="mt-6 text-slate-400 text-base md:text-lg max-w-2xl font-light">
          StadiumMind AI leverages Google Gemini to monitor crowd congestion, expedite safety responses, coordinate volunteers, translate announcements, and deliver sustainability analytics.
        </p>

        {/* Live status indicators */}
        <div className="mt-8 flex flex-wrap justify-center gap-4 text-xs font-mono text-slate-400">
          <div className="bg-slate-950/80 px-4 py-2 rounded-lg border border-slate-900 flex items-center space-x-2">
            <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span>MATCH LIVE: USA v MEX</span>
          </div>
          <div className="bg-slate-950/80 px-4 py-2 rounded-lg border border-slate-900 flex items-center space-x-2">
            <Activity className="h-3.5 w-3.5 text-indigo-400" />
            <span>ATTENDANCE: 82,400</span>
          </div>
          <div className="bg-slate-950/80 px-4 py-2 rounded-lg border border-slate-900 flex items-center space-x-2">
            <Shield className="h-3.5 w-3.5 text-rose-400" />
            <span>COPILOT ACTIVE</span>
          </div>
        </div>

        {/* Roles Selection Title */}
        <h2 className="mt-16 md:mt-24 font-outfit text-2xl font-bold text-slate-200">
          Enter Platform by Selecting Your Role
        </h2>
        
        {/* Roles Grid */}
        <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 w-full max-w-6xl">
          {/* Fan */}
          <Link
            href="/dashboard?role=fan"
            className="group flex flex-col justify-between items-center text-center p-6 rounded-xl bg-slate-950/40 border border-slate-900 hover:border-indigo-500/40 hover:bg-slate-900/20 transition-all duration-300 shadow-md"
          >
            <div className="h-12 w-12 rounded-full bg-indigo-500/10 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
              <Users className="h-6 w-6 text-indigo-400" />
            </div>
            <div className="mt-4">
              <h3 className="font-semibold text-slate-100 group-hover:text-indigo-400 transition-colors">Spectator Portal</h3>
              <p className="mt-2 text-xs text-slate-500">Navigation, queue alerts, food recommendations, and voice guide.</p>
            </div>
            <span className="mt-4 text-xs text-indigo-400 font-medium group-hover:underline">Launch Fan →</span>
          </Link>

          {/* Organizer */}
          <Link
            href="/dashboard?role=organizer"
            className="group flex flex-col justify-between items-center text-center p-6 rounded-xl bg-slate-950/40 border border-slate-900 hover:border-emerald-500/40 hover:bg-slate-900/20 transition-all duration-300 shadow-md"
          >
            <div className="h-12 w-12 rounded-full bg-emerald-500/10 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
              <Landmark className="h-6 w-6 text-emerald-400" />
            </div>
            <div className="mt-4">
              <h3 className="font-semibold text-slate-100 group-hover:text-emerald-400 transition-colors">Operations Director</h3>
              <p className="mt-2 text-xs text-slate-500">Live Copilot warnings, daily reports, announcements, & logistics.</p>
            </div>
            <span className="mt-4 text-xs text-emerald-400 font-medium group-hover:underline">Launch Organizer →</span>
          </Link>

          {/* Volunteer */}
          <Link
            href="/dashboard?role=volunteer"
            className="group flex flex-col justify-between items-center text-center p-6 rounded-xl bg-slate-950/40 border border-slate-900 hover:border-yellow-500/40 hover:bg-slate-900/20 transition-all duration-300 shadow-md"
          >
            <div className="h-12 w-12 rounded-full bg-yellow-500/10 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
              <HelpCircle className="h-6 w-6 text-yellow-400" />
            </div>
            <div className="mt-4">
              <h3 className="font-semibold text-slate-100 group-hover:text-yellow-400 transition-colors">Volunteer Force</h3>
              <p className="mt-2 text-xs text-slate-500">Search rules/SOPs, lost-and-found registry, report incidents.</p>
            </div>
            <span className="mt-4 text-xs text-yellow-400 font-medium group-hover:underline">Launch Volunteer →</span>
          </Link>

          {/* Security */}
          <Link
            href="/dashboard?role=security"
            className="group flex flex-col justify-between items-center text-center p-6 rounded-xl bg-slate-950/40 border border-slate-900 hover:border-rose-500/40 hover:bg-slate-900/20 transition-all duration-300 shadow-md"
          >
            <div className="h-12 w-12 rounded-full bg-rose-500/10 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
              <Shield className="h-6 w-6 text-rose-400" />
            </div>
            <div className="mt-4">
              <h3 className="font-semibold text-slate-100 group-hover:text-rose-400 transition-colors">Command Center</h3>
              <p className="mt-2 text-xs text-slate-500">Incident prioritization, emergency exit mapping, and hazard routing.</p>
            </div>
            <span className="mt-4 text-xs text-rose-400 font-medium group-hover:underline">Launch Security →</span>
          </Link>

          {/* Venue Staff */}
          <Link
            href="/dashboard?role=staff"
            className="group flex flex-col justify-between items-center text-center p-6 rounded-xl bg-slate-950/40 border border-slate-900 hover:border-sky-500/40 hover:bg-slate-900/20 transition-all duration-300 shadow-md"
          >
            <div className="h-12 w-12 rounded-full bg-sky-500/10 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
              <Leaf className="h-6 w-6 text-sky-400" />
            </div>
            <div className="mt-4">
              <h3 className="font-semibold text-slate-100 group-hover:text-sky-400 transition-colors">Venue & Cleaning</h3>
              <p className="mt-2 text-xs text-slate-500">Waste bin telemetry, water flow metrics, and tasks checklist.</p>
            </div>
            <span className="mt-4 text-xs text-sky-400 font-medium group-hover:underline">Launch Staff →</span>
          </Link>
        </div>
      </main>

      {/* Footer */}
      <footer className="w-full max-w-7xl mx-auto px-6 py-6 border-t border-slate-900/60 text-center z-10 text-xs text-slate-500">
        <p>© 2026 StadiumMind AI. Developed exclusively for FIFA World Cup 2026 Smart Stadium Operations.</p>
        <p className="mt-1 text-slate-600 font-mono">Powered by Google Gemini 2.5 Pro & Vertex AI Search</p>
      </footer>
    </div>
  );
}
