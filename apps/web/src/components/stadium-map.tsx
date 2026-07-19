"use client";

import React, { useState } from "react";
import { MapPin, AlertTriangle, RefreshCw, Compass } from "lucide-react";

interface StadiumMapProps {
  gates?: any[];
  incidents?: any[];
  emergencyMode?: boolean;
  onSelectGate?: (gateName: string) => void;
  selectedGate?: string;
  selectedSector?: string;
  onSelectSector?: (sectorName: string) => void;
}

export default function StadiumMap({
  gates = [],
  incidents = [],
  emergencyMode = false,
  onSelectGate,
  selectedGate,
  selectedSector,
  onSelectSector
}: StadiumMapProps) {
  const [highlightedPath, setHighlightedPath] = useState<string | null>(null);

  // Gates coordinate locations on our 800x500 SVG map
  const gateCoords: Record<string, { x: number; y: number; color: string }> = {
    "Gate A - North Plaza": { x: 400, y: 55, color: "#10b981" },
    "Gate B - Metro Connector": { x: 710, y: 250, color: "#ef4444" }, // Red/critical in mock
    "Gate C - VIP Suite Entrance": { x: 570, y: 440, color: "#10b981" },
    "Gate D - Parking Express shuttle": { x: 400, y: 445, color: "#eab308" }, // Yellow/warning
    "Gate E - ADA Accessibility": { x: 230, y: 440, color: "#10b981" },
    "Gate F - West Boulevard": { x: 90, y: 250, color: "#10b981" }
  };

  // Seating sector coordinate nodes
  const sectors = [
    { id: "S1", name: "Section 100 (North)", x: 400, y: 150, color: "#3b82f6" },
    { id: "S2", name: "Section 102 (East)", x: 550, y: 250, color: "#3b82f6" },
    { id: "S3", name: "Section 104 (South)", x: 400, y: 350, color: "#3b82f6" },
    { id: "S4", name: "Section 106 (West)", x: 250, y: 250, color: "#3b82f6" },
    { id: "S5", name: "Tier 2 - Section 200", x: 400, y: 110, color: "#8b5cf6" },
    { id: "S6", name: "Tier 2 - Section 202", x: 610, y: 250, color: "#8b5cf6" },
    { id: "S7", name: "Tier 2 - Section 204 (ADA)", x: 400, y: 390, color: "#8b5cf6" },
    { id: "S8", name: "Tier 2 - Section 206", x: 190, y: 250, color: "#8b5cf6" }
  ];

  // Match db gates array into coordinate gates mapping
  const activeGates = gates.length > 0 ? gates : Object.keys(gateCoords).map(name => ({
    name,
    queue_time_mins: name.includes("Gate B") ? 24 : name.includes("Gate D") ? 8 : 3,
    status: name.includes("Gate B") ? "critical" : name.includes("Gate D") ? "crowded" : "nominal"
  }));

  const getGateStatusColor = (status: string) => {
    if (status === "critical") return "rgba(239, 68, 68, 0.4)";
    if (status === "crowded") return "rgba(234, 179, 8, 0.4)";
    return "rgba(16, 185, 129, 0.4)";
  };

  const handleGateClick = (gateName: string) => {
    if (onSelectGate) onSelectGate(gateName);
    setHighlightedPath(gateName);
  };

  const handleSectorClick = (sectorId: string, sectorName: string) => {
    if (onSelectSector) onSelectSector(sectorName);
  };

  return (
    <div className="w-full flex flex-col relative rounded-xl border border-slate-800 bg-[#090b11]/80 backdrop-blur-md p-4">
      <div className="flex items-center justify-between mb-4 border-b border-slate-800 pb-3">
        <div className="flex items-center space-x-2">
          <Compass className="h-5 w-5 text-indigo-400" />
          <h3 className="font-semibold text-lg text-slate-100 font-outfit">Interactive FIFA 2026 Stadium Map</h3>
        </div>
        <div className="flex items-center space-x-3 text-xs">
          <div className="flex items-center space-x-1">
            <span className="h-2.5 w-2.5 rounded-full bg-emerald-500"></span>
            <span className="text-slate-400">Nominal</span>
          </div>
          <div className="flex items-center space-x-1">
            <span className="h-2.5 w-2.5 rounded-full bg-yellow-500"></span>
            <span className="text-slate-400">Crowded</span>
          </div>
          <div className="flex items-center space-x-1">
            <span className="h-2.5 w-2.5 rounded-full bg-red-500"></span>
            <span className="text-slate-400">Critical</span>
          </div>
          {emergencyMode && (
            <div className="flex items-center space-x-1 text-red-500 font-bold px-2 py-0.5 border border-red-500/30 rounded bg-red-500/10">
              <AlertTriangle className="h-3.5 w-3.5 animate-pulse" />
              <span>EVAC MODE</span>
            </div>
          )}
        </div>
      </div>

      <div className="w-full aspect-[8/5] bg-slate-950/80 rounded-lg overflow-hidden border border-slate-900 shadow-inner relative">
        <svg viewBox="0 0 800 500" className="w-full h-full select-none">
          {/* Gradients */}
          <defs>
            <radialGradient id="fieldGradient" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#15803d" />
              <stop offset="100%" stopColor="#166534" />
            </radialGradient>
            <linearGradient id="glowLine" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#818cf8" stopOpacity="0.8" />
              <stop offset="100%" stopColor="#ec4899" stopOpacity="0.2" />
            </linearGradient>
            <linearGradient id="evacLine" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#f43f5e" />
              <stop offset="100%" stopColor="#e11d48" stopOpacity="0.1" />
            </linearGradient>
          </defs>

          {/* Grid lines background */}
          <g stroke="rgba(255,255,255,0.02)" strokeWidth="1">
            {Array.from({ length: 16 }).map((_, i) => (
              <line key={`v-${i}`} x1={i * 50} y1="0" x2={i * 50} y2="500" />
            ))}
            {Array.from({ length: 10 }).map((_, i) => (
              <line key={`h-${i}`} x1="0" y1={i * 50} x2="800" y2={i * 50} />
            ))}
          </g>

          {/* Outer Ring - Stadium Outer wall */}
          <ellipse
            cx="400"
            cy="250"
            rx="320"
            ry="210"
            fill="none"
            stroke="rgba(255, 255, 255, 0.05)"
            strokeWidth="8"
          />
          <ellipse
            cx="400"
            cy="250"
            rx="310"
            ry="200"
            fill="none"
            stroke="#1e293b"
            strokeWidth="3"
            strokeDasharray="10, 5"
          />

          {/* Inner seating ring */}
          <ellipse
            cx="400"
            cy="250"
            rx="210"
            ry="130"
            fill="none"
            stroke="#334155"
            strokeWidth="4"
          />

          {/* Soccer Pitch Center */}
          <g>
            <rect
              x="300"
              y="180"
              width="200"
              height="140"
              fill="url(#fieldGradient)"
              stroke="#4ade80"
              strokeWidth="2"
              rx="4"
            />
            {/* Center circle */}
            <circle cx="400" cy="250" r="30" fill="none" stroke="#4ade80" strokeWidth="1.5" />
            {/* Center line */}
            <line x1="400" y1="180" x2="400" y2="320" stroke="#4ade80" strokeWidth="1.5" />
            {/* Penalty boxes */}
            <rect x="300" y="215" width="30" height="70" fill="none" stroke="#4ade80" strokeWidth="1.5" />
            <rect x="470" y="215" width="30" height="70" fill="none" stroke="#4ade80" strokeWidth="1.5" />
          </g>

          {/* Seating Sectors (Interactive polygons or dots) */}
          {sectors.map((sec) => (
            <g
              key={sec.id}
              className="cursor-pointer group"
              onClick={() => handleSectorClick(sec.id, sec.name)}
            >
              <circle
                cx={sec.x}
                cy={sec.y}
                r={16}
                fill={selectedSector === sec.name ? "#f43f5e" : "#1e293b"}
                stroke={selectedSector === sec.name ? "#ffffff" : "#475569"}
                strokeWidth="2"
                className="transition-all duration-300 group-hover:fill-slate-700"
              />
              <text
                x={sec.x}
                y={sec.y + 4}
                textAnchor="middle"
                fill="#ffffff"
                fontSize="9"
                fontWeight="bold"
              >
                {sec.id}
              </text>
              {/* Tooltip on hover */}
              <title>{sec.name}</title>
            </g>
          ))}

          {/* Highlight Paths (Flow routes from Metro Gate B or ADA Gate E) */}
          {highlightedPath && !emergencyMode && (
            <g>
              {highlightedPath.includes("Gate B") && (
                <path
                  d="M 710 250 Q 550 250 400 250"
                  fill="none"
                  stroke="url(#glowLine)"
                  strokeWidth="5"
                  strokeLinecap="round"
                  strokeDasharray="10, 5"
                  className="animate-pulse"
                />
              )}
              {highlightedPath.includes("Gate E") && (
                <path
                  d="M 230 440 Q 300 350 400 350"
                  fill="none"
                  stroke="#10b981"
                  strokeWidth="5"
                  strokeLinecap="round"
                  strokeDasharray="8, 4"
                  className="animate-pulse"
                />
              )}
              {highlightedPath.includes("Gate A") && (
                <path
                  d="M 400 55 L 400 150"
                  fill="none"
                  stroke="#818cf8"
                  strokeWidth="4"
                  strokeDasharray="6, 3"
                />
              )}
            </g>
          )}

          {/* Evacuation Routes (Glowing orange paths directed out of the gates) */}
          {emergencyMode && (
            <g>
              {/* Path outward to Gate B */}
              <path d="M 400 250 L 710 250" fill="none" stroke="url(#evacLine)" strokeWidth="6" />
              {/* Path outward to Gate F */}
              <path d="M 400 250 L 90 250" fill="none" stroke="url(#evacLine)" strokeWidth="6" />
              {/* Path outward to Gate A */}
              <path d="M 400 150 L 400 55" fill="none" stroke="url(#evacLine)" strokeWidth="6" />
              {/* Path outward to Gate D */}
              <path d="M 400 350 L 400 445" fill="none" stroke="url(#evacLine)" strokeWidth="6" />
            </g>
          )}

          {/* Render Gate Coordinates & Pulse status rings */}
          {activeGates.map((gate) => {
            const coords = gateCoords[gate.name];
            if (!coords) return null;
            
            const isSelected = selectedGate === gate.name;
            const isCritical = gate.status === "critical";
            const isCrowded = gate.status === "crowded";

            return (
              <g
                key={gate.name}
                className="cursor-pointer group"
                onClick={() => handleGateClick(gate.name)}
              >
                {/* Outer animated rings */}
                <circle
                  cx={coords.x}
                  cy={coords.y}
                  r={28}
                  fill="none"
                  stroke={isCritical ? "#ef4444" : isCrowded ? "#eab308" : "#10b981"}
                  strokeWidth="1.5"
                  className={isCritical || isCrowded ? "animate-pulse-critical" : "animate-pulse-nominal"}
                />

                {/* Main Node Point */}
                <circle
                  cx={coords.x}
                  cy={coords.y}
                  r={12}
                  fill={isSelected ? "#ffff00" : isCritical ? "#ef4444" : isCrowded ? "#eab308" : "#10b981"}
                  stroke="#ffffff"
                  strokeWidth="2.5"
                />

                {/* Gate Label overlay */}
                <text
                  x={coords.x}
                  y={coords.y - 20}
                  textAnchor="middle"
                  fill="#ffffff"
                  fontSize="11"
                  fontWeight="bold"
                  className="bg-black/90 p-0.5 rounded"
                >
                  {gate.name.split(" - ")[0]} ({gate.queue_time_mins}m)
                </text>
              </g>
            );
          })}

          {/* Render Incident Pins */}
          {incidents.map((incident) => {
            // Place incident pins on random seating coordinates
            const isCritical = incident.severity === "critical" || incident.severity === "high";
            const isResponding = incident.status === "responding";
            const x = incident.category === "medical" ? 415 : 380;
            const y = incident.category === "medical" ? 370 : 270;

            if (incident.status === "resolved") return null;

            return (
              <g key={incident.id} className="animate-bounce">
                <rect
                  x={x - 12}
                  y={y - 30}
                  width="24"
                  height="24"
                  rx="4"
                  fill={isCritical ? "#ef4444" : "#eab308"}
                  stroke="#ffffff"
                  strokeWidth="1.5"
                />
                <AlertTriangle x={x - 10} y={y - 28} className="h-5 w-5 text-white" />
                <title>{incident.description}</title>
              </g>
            );
          })}
        </svg>

        {/* Floating Controls */}
        <div className="absolute bottom-3 left-3 flex space-x-2">
          <div className="bg-slate-900/90 backdrop-blur-sm border border-slate-800 rounded px-2.5 py-1 text-xs text-slate-400 flex items-center space-x-1.5 shadow-md">
            <MapPin className="h-3.5 w-3.5 text-indigo-400" />
            <span>Interactive Simulator</span>
          </div>
        </div>
      </div>
      
      {/* Selected Node card */}
      {(selectedGate || selectedSector) && (
        <div className="mt-3 bg-slate-950/80 border border-indigo-500/20 rounded-lg p-3 text-sm flex items-center justify-between">
          <div>
            {selectedGate && (
              <>
                <span className="text-slate-400">Selected Gate:</span>{" "}
                <strong className="text-slate-100">{selectedGate}</strong>
                {selectedGate.includes("Gate B") && (
                  <span className="text-red-400 block text-xs mt-0.5">⚠️ Rerouting suggested. Metro congestion peak active.</span>
                )}
                {selectedGate.includes("Gate E") && (
                  <span className="text-emerald-400 block text-xs mt-0.5">♿ Dedicated accessibility entry route. Lift systems active.</span>
                )}
              </>
            )}
            {selectedSector && (
              <>
                <span className="text-slate-400">Selected Sector:</span>{" "}
                <strong className="text-slate-100">{selectedSector}</strong>
                <span className="text-indigo-400 block text-xs mt-0.5">Direct routing generated from nearest Gate to sector seating.</span>
              </>
            )}
          </div>
          <button 
            onClick={() => {
              if (onSelectGate) onSelectGate("");
              if (onSelectSector) onSelectSector("");
              setHighlightedPath(null);
            }}
            className="text-slate-400 hover:text-slate-200 text-xs flex items-center space-x-1"
          >
            <RefreshCw className="h-3 w-3" />
            <span>Reset</span>
          </button>
        </div>
      )}
    </div>
  );
}
