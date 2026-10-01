import React, { useState, useEffect } from 'react';
import { Activity } from 'lucide-react';
import { 
  playKick, playSnare, playClap, playHiHat, 
  playTom, playCrash, playRide, playPercussion 
} from '../utils/audioEngine';

export const DRUM_PADS = [
  { id: 'kick', name: 'KICK', key: 'A', color: 'from-pink-600 to-rose-600', fn: playKick },
  { id: 'snare', name: 'SNARE', key: 'S', color: 'from-purple-600 to-indigo-600', fn: playSnare },
  { id: 'clap', name: 'CLAP', key: 'D', color: 'from-violet-600 to-purple-600', fn: playClap },
  { id: 'hihat', name: 'HI-HAT', key: 'F', color: 'from-cyan-600 to-blue-600', fn: () => playHiHat(false) },
  { id: 'tom', name: 'TOM', key: 'G', color: 'from-teal-600 to-emerald-600', fn: playTom },
  { id: 'crash', name: 'CRASH', key: 'H', color: 'from-amber-600 to-orange-600', fn: playCrash },
  { id: 'ride', name: 'RIDE', key: 'J', color: 'from-blue-600 to-cyan-600', fn: playRide },
  { id: 'percussion', name: 'PERCUSSION', key: 'K', color: 'from-fuchsia-600 to-pink-600', fn: playPercussion }
];

export default function DrumPad({ activeKeyTrigger }) {
  const [activePadId, setActivePadId] = useState(null);

  const triggerPad = (pad) => {
    try {
      pad.fn();
    } catch (e) {
      console.warn("Drum pad audio error:", e);
    }
    setActivePadId(pad.id);
    setTimeout(() => setActivePadId(null), 180);
  };

  useEffect(() => {
    if (activeKeyTrigger) {
      const match = DRUM_PADS.find(p => p.key.toUpperCase() === activeKeyTrigger.toUpperCase());
      if (match) {
        triggerPad(match);
      }
    }
  }, [activeKeyTrigger]);

  return (
    <div className="glass-panel rounded-2xl p-4 border border-slate-800/80 shadow-xl flex flex-col gap-3">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
        <div className="flex items-center gap-2">
          <Activity className="w-5 h-5 text-pink-400" />
          <h2 className="font-orbitron font-bold text-xs sm:text-sm text-slate-100 tracking-wider">
            LIVE DRUM MACHINE PADS
          </h2>
        </div>
        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-pink-950/80 border border-pink-500/40 text-pink-300 font-bold">
          SHORTCUTS: A - K
        </span>
      </div>

      {/* 4 x 2 Drum Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
        {DRUM_PADS.map((pad) => {
          const isActive = activePadId === pad.id;
          return (
            <button
              key={pad.id}
              onClick={() => triggerPad(pad)}
              className={`h-24 rounded-2xl p-3 flex flex-col justify-between items-start transition-all duration-100 border active:scale-95 relative overflow-hidden group shadow-lg ${
                isActive
                  ? `bg-gradient-to-br ${pad.color} border-white text-white shadow-purple-500/50 scale-95 ring-4 ring-purple-400/40`
                  : 'bg-slate-900/90 hover:bg-slate-800 border-slate-800 hover:border-slate-700 text-slate-200'
              }`}
            >
              {/* Hotkey badge */}
              <div className="w-full flex justify-between items-center">
                <span className="px-2 py-0.5 text-[10px] font-mono font-black rounded bg-black/60 border border-white/20 text-cyan-300 shadow">
                  KEY [{pad.key}]
                </span>
                <span className="w-2 h-2 rounded-full bg-slate-700 group-hover:bg-cyan-400 transition-colors"></span>
              </div>

              {/* Pad Name */}
              <div className="w-full text-left">
                <span className="font-orbitron font-extrabold text-sm text-white tracking-wider block">
                  {pad.name}
                </span>
                <span className="text-[9px] font-mono text-slate-400 block group-hover:text-slate-200 uppercase tracking-wider">
                  SYNTHESIS
                </span>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
