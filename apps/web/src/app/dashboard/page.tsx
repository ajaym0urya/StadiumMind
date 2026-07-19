"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import StadiumMap from "@/components/stadium-map";
import { 
  Shield, Users, HelpCircle, Activity, Leaf, Landmark, AlertTriangle, 
  MessageSquare, Compass, Send, CheckCircle, Volume2, PlusCircle, 
  BookOpen, Eye, EyeOff, VolumeX, Sparkles, RefreshCw, LogOut, ArrowRight, Download 
} from "lucide-react";

// Wrap dashboard logic in Suspense to safely use useSearchParams in Next.js 15
export default function DashboardPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#07080e] flex items-center justify-center">
        <div className="flex items-center space-x-2">
          <RefreshCw className="h-6 w-6 text-indigo-500 animate-spin" />
          <span className="text-slate-400">Loading Operations Center...</span>
        </div>
      </div>
    }>
      <DashboardContent />
    </Suspense>
  );
}

function DashboardContent() {
  const searchParams = useSearchParams();
  const initialRole = searchParams.get("role") || "organizer";

  // State Management
  const [role, setRole] = useState(initialRole);
  const [highContrast, setHighContrast] = useState(false);
  const [largeFont, setLargeFont] = useState(false);
  const [voiceOn, setVoiceOn] = useState(false);
  
  // Data State
  const [matches, setMatches] = useState<any[]>([]);
  const [gates, setGates] = useState<any[]>([]);
  const [incidents, setIncidents] = useState<any[]>([]);
  const [transport, setTransport] = useState<any[]>([]);
  const [sustainability, setSustainability] = useState<any[]>([]);
  const [alerts, setAlerts] = useState<any[]>([]);
  const [announcements, setAnnouncements] = useState<any[]>([]);
  const [selectedGate, setSelectedGate] = useState("");
  const [selectedSector, setSelectedSector] = useState("");
  const [emergencyMode, setEmergencyMode] = useState(false);

  // Form State
  const [newIncidentText, setNewIncidentText] = useState("");
  const [newAnnouncementText, setNewAnnouncementText] = useState("");
  const [chatMessage, setChatMessage] = useState("");
  const [chatHistory, setChatHistory] = useState<any[]>([
    { text: "StadiumMind RAG Engine online. How can I assist you with World Cup operations today?", isUser: false, source: "System" }
  ]);
  const [sustainabilityRecs, setSustainabilityRecs] = useState("");
  const [execReport, setExecReport] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const API_BASE = "http://localhost:8000/api";

  // Fetch all live data
  const fetchAllData = async () => {
    try {
      const matchRes = await fetch(`${API_BASE}/matches`).then(r => r.json());
      setMatches(matchRes);
      
      const gateRes = await fetch(`${API_BASE}/gates`).then(r => r.json());
      setGates(gateRes);

      const incidentRes = await fetch(`${API_BASE}/incidents`).then(r => r.json());
      setIncidents(incidentRes);

      const transportRes = await fetch(`${API_BASE}/transport`).then(r => r.json());
      setTransport(transportRes);

      const sustRes = await fetch(`${API_BASE}/sustainability/metrics`).then(r => r.json());
      setSustainability(sustRes);

      const alertRes = await fetch(`${API_BASE}/alerts`).then(r => r.json());
      setAlerts(alertRes);

      const announRes = await fetch(`${API_BASE}/announcements`).then(r => r.json());
      setAnnouncements(announRes);
    } catch (e) {
      console.warn("Backend down, seeding offline simulator mock data states.", e);
      // Fallback local seed states
      setMatches([{ id: 1, home_team: "USA", away_team: "Mexico", status: "live", score: "2 - 1", attendance: 82400 }]);
      setGates([
        { name: "Gate A - North Plaza", current_flow: 110, queue_time_mins: 4, status: "nominal" },
        { name: "Gate B - Metro Connector", current_flow: 490, queue_time_mins: 24, status: "critical" },
        { name: "Gate C - VIP Suite Entrance", current_flow: 25, queue_time_mins: 2, status: "nominal" },
        { name: "Gate D - Parking Express shuttle", current_flow: 180, queue_time_mins: 8, status: "nominal" },
        { name: "Gate E - ADA Accessibility", current_flow: 40, queue_time_mins: 3, status: "nominal" }
      ]);
      setTransport([
        { id: 1, mode: "metro", destination: "Downtown Express Line 1", delay_mins: 12, congestion_level: "critical", status: "delayed" },
        { id: 2, mode: "bus", destination: "Shuttle Route A", delay_mins: 3, congestion_level: "low", status: "normal" }
      ]);
      setSustainability([
        { bin_id: "BIN-G1-R", bin_type: "recycle", fill_level: 52 },
        { bin_id: "BIN-G2-L", bin_type: "landfill", fill_level: 86 }
      ]);
      setAlerts([
        { id: 101, message: "AI Copilot Notice: Gate B queue time is projected to exceed 30 minutes in 8 minutes due to arriving trains.", type: "copilot", is_active: true, recommended_action: "Reroute 25% of fans to Gate A. Dispatch 2 volunteers to Section B to direct the flow." }
      ]);
    }
  };

  // Run periodic fetch
  useEffect(() => {
    fetchAllData();
    const interval = setInterval(fetchAllData, 6000);
    return () => clearInterval(interval);
  }, []);

  // Sync simulator ticks manually
  const triggerTick = async () => {
    try {
      await fetch(`${API_BASE}/simulator/tick`, { method: "POST" });
      fetchAllData();
    } catch (e) {
      // Simulate locally
      setGates(prev => prev.map(g => {
        if (g.name.includes("Gate B")) return { ...g, current_flow: g.current_flow + 10, queue_time_mins: g.queue_time_mins + 1 };
        return g;
      }));
    }
  };

  // RAG Chat Submission
  const handleChatSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatMessage.trim()) return;

    const userMsg = chatMessage;
    setChatMessage("");
    setChatHistory(prev => [...prev, { text: userMsg, isUser: true, source: "User" }]);

    try {
      const response = await fetch(`${API_BASE}/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: userMsg, role: role })
      }).then(r => r.json());

      setChatHistory(prev => [...prev, { text: response.response, isUser: false, source: response.source }]);
      
      if (voiceOn && typeof window !== "undefined" && window.speechSynthesis) {
        const utterance = new SpeechSynthesisUtterance(response.response);
        window.speechSynthesis.speak(utterance);
      }
    } catch (err) {
      // Local RAG matcher if backend is offline
      let reply = "I do not have specific data on that in my offline handbook. Please seek help at Gate E (ADA) or Gate C.";
      if (userMsg.toLowerCase().includes("gate")) {
        reply = "Gate B (Metro) is experiencing high congestion (24m queues). Gates A and E have elevator accessibility and under 4 min wait times.";
      } else if (userMsg.toLowerCase().includes("stair") || userMsg.toLowerCase().includes("wheelchair")) {
        reply = "Gate E is the primary ADA entryway. Elevated elevators are located at Section 204 to transport fans directly to level 2.";
      }
      setChatHistory(prev => [...prev, { text: reply, isUser: false, source: "Offline Rule Matcher" }]);
    }
  };

  // Submit Incident
  const handleIncidentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newIncidentText.trim()) return;

    setIsSubmitting(true);
    try {
      await fetch(`${API_BASE}/incidents`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ description: newIncidentText, reporter_role: role })
      });
      setNewIncidentText("");
      fetchAllData();
    } catch (err) {
      // Local push mock
      const mockInc = {
        id: Date.now(),
        description: newIncidentText,
        severity: "medium",
        status: "open",
        category: "general",
        reporter_role: role,
        ai_summary: "Reported: " + newIncidentText.substring(0, 30),
        assigned_dept: "cleaning_crew",
        timestamp: new Date().toISOString()
      };
      setIncidents(prev => [mockInc, ...prev]);
      setNewIncidentText("");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Create Announcement translations
  const handleAnnouncementSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAnnouncementText.trim()) return;

    setIsSubmitting(true);
    try {
      await fetch(`${API_BASE}/announcements`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ original_text: newAnnouncementText })
      });
      setNewAnnouncementText("");
      fetchAllData();
    } catch (err) {
      const mockAnn = {
        id: Date.now(),
        original_text: newAnnouncementText,
        english: newAnnouncementText,
        spanish: "Atención: " + newAnnouncementText,
        french: "Attention: " + newAnnouncementText,
        arabic: "تنبيه: " + newAnnouncementText,
        portuguese: "Atenção: " + newAnnouncementText,
        timestamp: new Date().toISOString()
      };
      setAnnouncements(prev => [mockAnn, ...prev]);
      setNewAnnouncementText("");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Apply AI Copilot Action
  const applyCopilotAction = async (alertId: number) => {
    try {
      await fetch(`${API_BASE}/alerts/${alertId}/apply`, { method: "POST" });
      fetchAllData();
    } catch (e) {
      // Execute local mitigation logic
      setGates(prev => prev.map(g => {
        if (g.name.includes("Gate B")) return { ...g, current_flow: 300, queue_time_mins: 15, status: "crowded" };
        if (g.name.includes("Gate A")) return { ...g, current_flow: 200, queue_time_mins: 9, status: "crowded" };
        return g;
      }));
      setAlerts(prev => prev.filter(a => a.id !== alertId));
    }
  };

  // Dismiss regular alerts
  const dismissAlert = async (alertId: number) => {
    try {
      await fetch(`${API_BASE}/alerts/${alertId}/dismiss`, { method: "POST" });
      fetchAllData();
    } catch (e) {
      setAlerts(prev => prev.filter(a => a.id !== alertId));
    }
  };

  // Sustainability Recommendations
  const fetchSustainabilityRecs = async () => {
    try {
      const res = await fetch(`${API_BASE}/sustainability/recommendations`).then(r => r.json());
      setSustainabilityRecs(res.recommendations);
    } catch (e) {
      setSustainabilityRecs("- **Priority Clean Required:** Bins near Gate B are filling rapidly (86% capacity).\n- **Energy Savings:** Toggle LED screen luminance in corridors to 80% to trim utility usage.");
    }
  };

  // Daily executive reports
  const fetchExecutiveReport = async () => {
    try {
      const res = await fetch(`${API_BASE}/reports/executive`).then(r => r.json());
      setExecReport(res.report);
    } catch (e) {
      setExecReport("### FIFA World Cup Daily Operations Log\n\n**Stadium Status:** Active Live Shift\n- Gates: Gate B is currently critical.\n- Incidents: 2 active hazards responding.\n- Recommendation: Keep Gate A routing alerts active.");
    }
  };

  // Quick switch role
  const handleRoleChange = (newRole: string) => {
    setRole(newRole);
    setSelectedGate("");
    setSelectedSector("");
  };

  // Get active match
  const liveMatch = matches.find(m => m.status === "live") || { home_team: "USA", away_team: "Mexico", score: "2 - 1", attendance: 82400 };

  return (
    <div className={`min-h-screen flex flex-col bg-[#07080e] ${highContrast ? "theme-high-contrast" : ""} ${largeFont ? "theme-large-font" : ""}`}>
      {/* Top Navbar */}
      <nav className={`w-full border-b border-slate-900 bg-[#090b13]/85 backdrop-blur-md sticky top-0 z-20 px-6 py-4 flex flex-wrap items-center justify-between gap-4 ${highContrast ? "border-white bg-black" : ""}`}>
        <div className="flex items-center space-x-3">
          <Link href="/" className="h-8 w-8 rounded bg-indigo-600 flex items-center justify-center font-bold text-white shadow shadow-indigo-500/20">
            S
          </Link>
          <div>
            <h1 className="font-outfit font-bold text-base text-slate-100 flex items-center space-x-2">
              <span>StadiumMind AI</span>
              <span className="text-xs bg-slate-900 border border-slate-800 text-indigo-400 font-mono px-2 py-0.5 rounded ml-2">
                Operations Center
              </span>
            </h1>
          </div>
        </div>

        {/* Live Match Overlay */}
        <div className="hidden md:flex items-center space-x-4 bg-slate-950/80 px-4 py-1.5 rounded-lg border border-slate-900 text-xs font-mono text-slate-300">
          <span className="flex h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></span>
          <span>LIVE SHIFT</span>
          <span className="text-slate-500">|</span>
          <span className="text-indigo-400 font-bold">{liveMatch.home_team} {liveMatch.score} {liveMatch.away_team}</span>
          <span className="text-slate-500">|</span>
          <span>Gate Wait: {gates.find(g=>g.name.includes("Gate B"))?.queue_time_mins || 24}m Max</span>
        </div>

        {/* Accessibility & Role Toggle */}
        <div className="flex items-center space-x-2">
          {/* High Contrast */}
          <button 
            onClick={() => setHighContrast(!highContrast)}
            className={`p-2 rounded border text-xs flex items-center space-x-1 transition-all ${highContrast ? "bg-white text-black border-white" : "border-slate-800 text-slate-400 hover:text-slate-200"}`}
            title="Toggle High Contrast (WCAG 2.2 AA)"
          >
            {highContrast ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            <span className="hidden sm:inline">Contrast</span>
          </button>

          {/* Large Font */}
          <button 
            onClick={() => setLargeFont(!largeFont)}
            className={`p-2 rounded border text-xs flex items-center space-x-1 transition-all ${largeFont ? "bg-indigo-600 text-white border-indigo-600" : "border-slate-800 text-slate-400 hover:text-slate-200"}`}
            title="Toggle Large Fonts"
          >
            <span className="font-bold font-mono">A+</span>
            <span className="hidden sm:inline">Font</span>
          </button>

          {/* Voice Speech Assist */}
          <button 
            onClick={() => setVoiceOn(!voiceOn)}
            className={`p-2 rounded border text-xs flex items-center space-x-1 transition-all ${voiceOn ? "bg-emerald-600 text-white border-emerald-600" : "border-slate-800 text-slate-400 hover:text-slate-200"}`}
            title="Voice Reader for RAG responses"
          >
            {voiceOn ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
            <span className="hidden sm:inline">Voice</span>
          </button>

          {/* Manual Simulator Tick */}
          <button 
            onClick={triggerTick}
            className="p-2 rounded border border-slate-800 text-slate-400 hover:text-slate-200 text-xs flex items-center space-x-1"
            title="Step simulator stats"
          >
            <RefreshCw className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Tick</span>
          </button>

          <Link href="/" className="p-2 rounded border border-slate-800 text-slate-400 hover:text-slate-200 text-xs flex items-center space-x-1">
            <LogOut className="h-3.5 w-3.5 text-rose-400" />
            <span className="hidden sm:inline">Exit</span>
          </Link>
        </div>
      </nav>

      {/* Role Navigation Dashboard Tabs */}
      <div className="bg-[#090a10]/50 border-b border-slate-900 py-2.5 px-6 flex flex-wrap gap-2 items-center justify-between">
        <div className="flex flex-wrap gap-1.5">
          <button 
            onClick={() => handleRoleChange("organizer")}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium flex items-center space-x-1.5 transition-all ${role === "organizer" ? "bg-indigo-600 text-white shadow shadow-indigo-600/30" : "text-slate-400 hover:text-slate-200 bg-slate-950/30"}`}
          >
            <Landmark className="h-3.5 w-3.5" />
            <span>Organizer Portal</span>
          </button>
          <button 
            onClick={() => handleRoleChange("fan")}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium flex items-center space-x-1.5 transition-all ${role === "fan" ? "bg-indigo-600 text-white shadow shadow-indigo-600/30" : "text-slate-400 hover:text-slate-200 bg-slate-950/30"}`}
          >
            <Users className="h-3.5 w-3.5" />
            <span>Spectator</span>
          </button>
          <button 
            onClick={() => handleRoleChange("volunteer")}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium flex items-center space-x-1.5 transition-all ${role === "volunteer" ? "bg-indigo-600 text-white shadow shadow-indigo-600/30" : "text-slate-400 hover:text-slate-200 bg-slate-950/30"}`}
          >
            <HelpCircle className="h-3.5 w-3.5" />
            <span>Volunteer Force</span>
          </button>
          <button 
            onClick={() => handleRoleChange("security")}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium flex items-center space-x-1.5 transition-all ${role === "security" ? "bg-indigo-600 text-white shadow shadow-indigo-600/30" : "text-slate-400 hover:text-slate-200 bg-slate-950/30"}`}
          >
            <Shield className="h-3.5 w-3.5" />
            <span>Security</span>
          </button>
          <button 
            onClick={() => handleRoleChange("staff")}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium flex items-center space-x-1.5 transition-all ${role === "staff" ? "bg-indigo-600 text-white shadow shadow-indigo-600/30" : "text-slate-400 hover:text-slate-200 bg-slate-950/30"}`}
          >
            <Leaf className="h-3.5 w-3.5" />
            <span>Venue Staff</span>
          </button>
        </div>
        <div className="text-xs text-indigo-400 font-mono flex items-center space-x-1 bg-indigo-500/10 px-3 py-1 rounded border border-indigo-500/10">
          <Sparkles className="h-3.5 w-3.5 animate-pulse" />
          <span>Active Role Workspace: {role.toUpperCase()}</span>
        </div>
      </div>

      {/* Main Grid Content */}
      <div className="flex-grow p-6 grid grid-cols-1 lg:grid-cols-12 gap-6 max-w-8xl mx-auto w-full">
        
        {/* Left Column: Interactive Map & Live Stats (7 cols) */}
        <div className="lg:col-span-7 flex flex-col space-y-6">
          
          {/* PROACTIVE AI OPERATIONS COPILOT (Standout feature) */}
          {alerts.filter(a => a.type === "copilot").map((alert) => (
            <div 
              key={alert.id} 
              className={`p-4 rounded-xl border border-rose-500/30 bg-gradient-to-r from-rose-950/50 to-indigo-950/30 flex flex-col md:flex-row md:items-center justify-between gap-4 animate-pulse ${highContrast ? "border-white bg-black" : ""}`}
            >
              <div className="flex items-start space-x-3">
                <div className="h-10 w-10 rounded-lg bg-rose-500/20 flex items-center justify-center shrink-0 border border-rose-500/30">
                  <AlertTriangle className="h-5 w-5 text-rose-400" />
                </div>
                <div>
                  <h4 className="font-bold text-slate-100 flex items-center space-x-2">
                    <span className="bg-rose-500 text-white text-[10px] font-mono px-1.5 py-0.5 rounded font-black tracking-wide uppercase">AI Operations Copilot</span>
                    <span>Proactive Recommendation</span>
                  </h4>
                  <p className="text-slate-300 text-xs mt-1 leading-relaxed">
                    {alert.message}
                  </p>
                  <p className="text-slate-400 text-[11px] mt-1.5 italic">
                    💡 Action: {alert.recommended_action}
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-2 shrink-0">
                <button 
                  onClick={() => applyCopilotAction(alert.id)}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs px-4 py-2 rounded-lg transition-colors flex items-center space-x-1 shadow-md shadow-emerald-950/20"
                >
                  <CheckCircle className="h-3.5 w-3.5" />
                  <span>Apply Mitigation</span>
                </button>
                <button 
                  onClick={() => dismissAlert(alert.id)}
                  className="bg-slate-900 hover:bg-slate-800 text-slate-400 text-xs px-3 py-2 rounded-lg border border-slate-800"
                >
                  Dismiss
                </button>
              </div>
            </div>
          ))}

          {/* Interactive Map */}
          <StadiumMap 
            gates={gates} 
            incidents={incidents} 
            emergencyMode={emergencyMode} 
            selectedGate={selectedGate}
            onSelectGate={setSelectedGate}
            selectedSector={selectedSector}
            onSelectSector={setSelectedSector}
          />

          {/* Quick Metrics Widgets Panel */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="bg-slate-950/40 border border-slate-900 rounded-xl p-4 text-center">
              <span className="text-slate-500 text-xs font-mono uppercase block">Average Wait</span>
              <span className="font-outfit font-extrabold text-2xl text-indigo-400">
                {gates.length > 0 ? (gates.reduce((acc, g) => acc + g.queue_time_mins, 0) / gates.length).toFixed(1) : "5.4"}m
              </span>
            </div>
            <div className="bg-slate-950/40 border border-slate-900 rounded-xl p-4 text-center">
              <span className="text-slate-500 text-xs font-mono uppercase block">Active Incidents</span>
              <span className="font-outfit font-extrabold text-2xl text-rose-400">
                {incidents.filter(i=>i.status !== "resolved").length}
              </span>
            </div>
            <div className="bg-slate-950/40 border border-slate-900 rounded-xl p-4 text-center">
              <span className="text-slate-500 text-xs font-mono uppercase block">Metro Station status</span>
              <span className={`font-outfit font-extrabold text-sm block mt-2 uppercase ${transport.some(t=>t.status === "delayed") ? "text-amber-400" : "text-emerald-400"}`}>
                {transport.some(t=>t.status === "delayed") ? "Delays Active" : "Nominal"}
              </span>
            </div>
            <div className="bg-slate-950/40 border border-slate-900 rounded-xl p-4 text-center">
              <span className="text-slate-500 text-xs font-mono uppercase block">Waste Overflow Risks</span>
              <span className="font-outfit font-extrabold text-2xl text-sky-400">
                {sustainability.filter(b => b.fill_level > 80).length}
              </span>
            </div>
          </div>
        </div>

        {/* Right Column: Role Workspaces & AI chatbot (5 cols) */}
        <div className="lg:col-span-5 flex flex-col space-y-6">

          {/* AI STADIUM ASSISTANT / RAG CHATBOT WIDGET (Persistent across roles) */}
          <div className="bg-[#090b11]/80 backdrop-blur-md border border-slate-800 rounded-xl p-4 flex flex-col h-[340px]">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-3">
              <div className="flex items-center space-x-2">
                <MessageSquare className="h-5 w-5 text-indigo-400" />
                <h3 className="font-semibold font-outfit text-slate-200">Gemini RAG Stadium Assistant</h3>
              </div>
              <span className="text-[10px] font-mono bg-indigo-500/10 px-2 py-0.5 rounded text-indigo-300">
                Zero-Hallucination Guard
              </span>
            </div>

            {/* Chat Messages Log */}
            <div className="flex-grow overflow-y-auto space-y-3 pr-2 text-xs">
              {chatHistory.map((chat, idx) => (
                <div key={idx} className={`flex flex-col ${chat.isUser ? "items-end" : "items-start"}`}>
                  <div className={`max-w-[85%] rounded-lg p-2.5 leading-relaxed ${chat.isUser ? "bg-indigo-600 text-white" : "bg-slate-900/90 text-slate-200 border border-slate-800"}`}>
                    {chat.text}
                  </div>
                  <span className="text-[9px] text-slate-500 mt-0.5 font-mono">
                    {chat.source}
                  </span>
                </div>
              ))}
            </div>

            {/* Input Form */}
            <form onSubmit={handleChatSubmit} className="mt-3 flex items-center space-x-2">
              <input 
                type="text" 
                value={chatMessage} 
                onChange={(e) => setChatMessage(e.target.value)}
                placeholder="Ask about Gate accessibility, transit options, or emergency SOPs..."
                className="flex-grow bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-indigo-500 transition-colors"
              />
              <button 
                type="submit" 
                className="bg-indigo-600 hover:bg-indigo-700 p-2 rounded-lg text-white shadow shadow-indigo-600/20"
              >
                <Send className="h-4 w-4" />
              </button>
            </form>
          </div>

          {/* DYNAMIC ROLE WORKSPACE */}
          
          {/* ROLE: ORGANIZER */}
          {role === "organizer" && (
            <div className="bg-[#090b11]/80 backdrop-blur-md border border-slate-800 rounded-xl p-5 space-y-4">
              <h3 className="font-bold font-outfit text-base text-slate-200 border-b border-slate-800 pb-2 flex items-center space-x-2">
                <Landmark className="h-5 w-5 text-emerald-400" />
                <span>Organizer Operations Hub</span>
              </h3>

              {/* Multilingual Announcement Generator */}
              <form onSubmit={handleAnnouncementSubmit} className="space-y-2">
                <label className="text-xs text-slate-400 font-medium block">Translate & Broadcast Operations Alert</label>
                <textarea 
                  value={newAnnouncementText}
                  onChange={(e) => setNewAnnouncementText(e.target.value)}
                  placeholder="E.g., Gate B crowded. ADA spectators utilize Gate E."
                  rows={2}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
                />
                <button 
                  type="submit"
                  disabled={isSubmitting}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs px-3.5 py-2 rounded-lg flex items-center space-x-1.5 disabled:opacity-50"
                >
                  <PlusCircle className="h-3.5 w-3.5" />
                  <span>Translate (5 Languages)</span>
                </button>
              </form>

              {/* Translation Results List */}
              {announcements.length > 0 && (
                <div className="bg-slate-950/60 rounded-lg p-3 space-y-2 border border-slate-900 text-xs">
                  <span className="text-slate-500 font-mono text-[10px] block uppercase">Live Broadcast Log</span>
                  <div className="max-h-[120px] overflow-y-auto space-y-2.5 pr-1">
                    {announcements.slice(0, 2).map((ann) => (
                      <div key={ann.id} className="border-b border-slate-900 pb-2 last:border-b-0">
                        <strong className="text-slate-300 block mb-1">📢 EN: {ann.english}</strong>
                        <span className="text-slate-400 block ml-2">🇪🇸 ES: {ann.spanish}</span>
                        <span className="text-slate-400 block ml-2">🇸🇦 AR: {ann.arabic}</span>
                        <span className="text-slate-400 block ml-2">🇫🇷 FR: {ann.french}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Report Export Widget */}
              <div className="flex gap-2">
                <button 
                  onClick={fetchExecutiveReport}
                  className="flex-1 bg-indigo-950/40 hover:bg-indigo-950/80 border border-indigo-500/20 text-indigo-400 font-semibold text-xs py-2.5 rounded-lg flex items-center justify-center space-x-2"
                >
                  <BookOpen className="h-4 w-4" />
                  <span>Generate Daily Shift Report</span>
                </button>
              </div>

              {execReport && (
                <div className="bg-slate-950 border border-slate-900 rounded-lg p-3 max-h-[200px] overflow-y-auto">
                  <div className="flex items-center justify-between border-b border-slate-900 pb-1.5 mb-2">
                    <span className="text-xs font-bold text-slate-300">Daily Executive Report</span>
                    <button 
                      onClick={() => setExecReport("")}
                      className="text-slate-500 hover:text-slate-300 text-[10px]"
                    >
                      Clear
                    </button>
                  </div>
                  <pre className="text-[10px] text-slate-300 whitespace-pre-wrap font-sans leading-relaxed">
                    {execReport}
                  </pre>
                </div>
              )}
            </div>
          )}

          {/* ROLE: FAN */}
          {role === "fan" && (
            <div className="bg-[#090b11]/80 backdrop-blur-md border border-slate-800 rounded-xl p-5 space-y-4">
              <h3 className="font-bold font-outfit text-base text-slate-200 border-b border-slate-800 pb-2 flex items-center space-x-2">
                <Users className="h-5 w-5 text-indigo-400" />
                <span>Spectator Concierge</span>
              </h3>

              {/* Gate Queue Status Tracker */}
              <div className="space-y-2">
                <span className="text-xs text-slate-400 font-semibold block">Select Entry Gate for Smart Routing</span>
                <div className="grid grid-cols-2 gap-2">
                  {gates.map((g) => (
                    <button 
                      key={g.name}
                      onClick={() => setSelectedGate(g.name)}
                      className={`p-2.5 rounded-lg text-left text-xs border transition-all ${selectedGate === g.name ? "bg-indigo-600/10 border-indigo-500 text-indigo-300" : "bg-slate-950/40 border-slate-900 text-slate-400 hover:border-slate-800"}`}
                    >
                      <span className="font-semibold block truncate text-slate-200">{g.name.split(" - ")[0]}</span>
                      <span className="text-[10px] text-slate-400">Queue: {g.queue_time_mins} min</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* ADA Accessibility Guide */}
              <div className="bg-emerald-950/30 border border-emerald-500/15 rounded-lg p-3 text-xs">
                <span className="font-bold text-emerald-400 block mb-1 flex items-center space-x-1">
                  <span>♿ Accessibility Features Enabled</span>
                </span>
                <p className="text-slate-300 leading-relaxed">
                  Avoid stairs? Select **Gate E** for dedicated wheelchair lifts, step-free navigation, and volunteer assistants waiting at the landing zone.
                </p>
              </div>

              {/* Food recommendations */}
              <div className="bg-slate-950/80 border border-slate-900 rounded-lg p-3 text-xs">
                <span className="text-slate-400 block font-semibold mb-1">🍔 Local Food recommendation (Matchday Peak)</span>
                <p className="text-slate-300">
                  Hot dog stall at Section 102 has zero queue times right now. Traditional tacos available at East Concourse (Section 104).
                </p>
              </div>
            </div>
          )}

          {/* ROLE: VOLUNTEER */}
          {role === "volunteer" && (
            <div className="bg-[#090b11]/80 backdrop-blur-md border border-slate-800 rounded-xl p-5 space-y-4">
              <h3 className="font-bold font-outfit text-base text-slate-200 border-b border-slate-800 pb-2 flex items-center space-x-2">
                <HelpCircle className="h-5 w-5 text-yellow-400" />
                <span>Volunteer Task Center</span>
              </h3>

              {/* Report New Incident */}
              <form onSubmit={handleIncidentSubmit} className="space-y-2">
                <label className="text-xs text-slate-400 font-semibold block">Report Incident / Safety Hazard</label>
                <textarea 
                  value={newIncidentText}
                  onChange={(e) => setNewIncidentText(e.target.value)}
                  placeholder="E.g., Slippery liquid on stairs in row 4 near concession 6."
                  rows={2}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
                />
                <button 
                  type="submit"
                  disabled={isSubmitting}
                  className="bg-yellow-600 hover:bg-yellow-700 text-black font-bold text-xs px-4 py-2 rounded-lg flex items-center space-x-1.5 disabled:opacity-50"
                >
                  <PlusCircle className="h-3.5 w-3.5" />
                  <span>Report to Security Command</span>
                </button>
              </form>

              {/* Translation Tool */}
              <div className="bg-slate-950/60 rounded-lg p-3 border border-slate-900 text-xs space-y-1">
                <span className="text-slate-400 font-semibold block">💬 Instant SOP Handbook Search</span>
                <p className="text-slate-500 text-[11px] leading-relaxed">
                  Type any rule query in the RAG Stadium Assistant chat above. E.g. &quot;What uniform must volunteers wear?&quot; or &quot;Who to call during emergency?&quot;.
                </p>
              </div>
            </div>
          )}

          {/* ROLE: SECURITY */}
          {role === "security" && (
            <div className="bg-[#090b11]/80 backdrop-blur-md border border-slate-800 rounded-xl p-5 space-y-4">
              <h3 className="font-bold font-outfit text-base text-slate-200 border-b border-slate-800 pb-2 flex items-center space-x-2">
                <Shield className="h-5 w-5 text-rose-400" />
                <span>Security Command Board</span>
              </h3>

              {/* Evac Mode Trigger */}
              <div className="p-3.5 rounded-lg border border-red-500/20 bg-red-500/5 flex items-center justify-between">
                <div>
                  <span className="font-bold text-rose-500 block text-xs">EMERGENCY EVACUATION ROUTER</span>
                  <span className="text-slate-400 text-[10px]">Overrides map to highlight fastest outward flow routes.</span>
                </div>
                <button 
                  onClick={() => setEmergencyMode(!emergencyMode)}
                  className={`px-3 py-1.5 rounded font-bold text-xs transition-colors ${emergencyMode ? "bg-red-600 text-white animate-pulse" : "bg-slate-900 border border-slate-800 text-rose-500"}`}
                >
                  {emergencyMode ? "DEACTIVATE" : "ACTIVATE"}
                </button>
              </div>

              {/* Incidents Queue */}
              <div className="space-y-2">
                <span className="text-xs text-slate-400 font-semibold block">Active Operational Incidents</span>
                <div className="max-h-[160px] overflow-y-auto space-y-2 pr-1">
                  {incidents.length > 0 ? (
                    incidents.map((inc) => (
                      <div 
                        key={inc.id} 
                        onClick={() => inc.category === "medical" ? setSelectedSector("Section 204 (ADA)") : setSelectedSector("Section 102 (East)")}
                        className={`p-2.5 rounded-lg border bg-slate-950/60 cursor-pointer hover:border-indigo-500/50 transition-colors ${inc.severity === "critical" ? "border-red-500/30" : "border-slate-900"}`}
                      >
                        <div className="flex items-center justify-between">
                          <span className={`text-[9px] font-mono uppercase px-1.5 py-0.5 rounded font-bold ${inc.severity === "critical" ? "bg-red-500/20 text-red-400" : inc.severity === "high" ? "bg-amber-500/20 text-amber-400" : "bg-indigo-500/20 text-indigo-400"}`}>
                            {inc.severity}
                          </span>
                          <span className="text-[10px] text-slate-500 font-mono">
                            Status: {inc.status}
                          </span>
                        </div>
                        <p className="text-slate-200 text-xs mt-1.5 leading-relaxed font-medium">
                          {inc.ai_summary || inc.description}
                        </p>
                        <div className="mt-1.5 flex items-center justify-between text-[10px] text-slate-400 font-mono">
                          <span>Dept: {inc.assigned_dept}</span>
                          <span className="text-indigo-400 hover:underline flex items-center space-x-0.5">
                            <span>Locate on Map</span>
                            <ArrowRight className="h-2.5 w-2.5" />
                          </span>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-slate-600 text-xs text-center py-4">No active incidents.</div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* ROLE: VENUE STAFF */}
          {role === "staff" && (
            <div className="bg-[#090b11]/80 backdrop-blur-md border border-slate-800 rounded-xl p-5 space-y-4">
              <h3 className="font-bold font-outfit text-base text-slate-200 border-b border-slate-800 pb-2 flex items-center space-x-2">
                <Leaf className="h-5 w-5 text-sky-400" />
                <span>Venue & Facility Operations</span>
              </h3>

              {/* Utility Telemetry */}
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="bg-slate-950/40 p-3 rounded-lg border border-slate-900">
                  <span className="text-slate-500 block">Water Consumption</span>
                  <span className="font-mono font-bold text-slate-200 text-sm mt-1 block">18.4 L / sec</span>
                </div>
                <div className="bg-slate-950/40 p-3 rounded-lg border border-slate-900">
                  <span className="text-slate-500 block">Energy Load</span>
                  <span className="font-mono font-bold text-slate-200 text-sm mt-1 block">48.2 kW / hour</span>
                </div>
              </div>

              {/* Sustainability advisor trigger */}
              <button 
                onClick={fetchSustainabilityRecs}
                className="w-full bg-slate-900 hover:bg-slate-800 border border-slate-800 text-sky-400 font-semibold text-xs py-2 rounded-lg flex items-center justify-center space-x-1.5"
              >
                <Sparkles className="h-3.5 w-3.5 text-sky-400" />
                <span>Consult Sustainability Advisor</span>
              </button>

              {sustainabilityRecs && (
                <div className="bg-slate-950/80 border border-slate-900 rounded-lg p-3 text-xs leading-relaxed text-slate-300 whitespace-pre-wrap font-sans">
                  {sustainabilityRecs}
                </div>
              )}

              {/* Bins List */}
              <div className="space-y-1.5">
                <span className="text-xs text-slate-400 font-semibold block">Waste bin Sensor logs</span>
                <div className="max-h-[120px] overflow-y-auto space-y-1.5 pr-1 font-mono text-[10px]">
                  {sustainability.slice(0, 4).map((b, idx) => (
                    <div key={idx} className="flex justify-between items-center bg-slate-950 p-2 rounded border border-slate-900">
                      <span className="text-slate-300">{b.bin_id} ({b.bin_type})</span>
                      <span className={b.fill_level > 80 ? "text-red-400 font-bold" : "text-slate-400"}>
                        {b.fill_level.toFixed(0)}% Filled
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
