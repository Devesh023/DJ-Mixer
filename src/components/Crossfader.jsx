import React from 'react';
import { SlidersHorizontal } from 'lucide-react';

export default function Crossfader({ value, onChange }) {
  // value goes from 0.0 (Deck A full) to 1.0 (Deck B full)
  // center is 0.5

  const deckAPercent = Math.round((1 - value) * 100);
  const deckBPercent = Math.round(value * 100);

  return (
    <div className="glass-panel rounded-2xl p-4 flex flex-col items-center justify-center gap-3 border border-slate-800 shadow-xl relative overflow-hidden">
      {/* Visual Header */}
      <div className="flex items-center justify-between w-full font-orbitron text-xs">
        <div className="flex items-center gap-1.5 text-cyan-400 font-bold">
          <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse"></span>
          DECK A ({deckAPercent}%)
        </div>

        <div className="flex items-center gap-1.5 text-purple-300 font-bold tracking-widest text-[11px]">
          <SlidersHorizontal className="w-4 h-4 text-purple-400" />
          CROSSFADER
        </div>

        <div className="flex items-center gap-1.5 text-purple-400 font-bold">
          DECK B ({deckBPercent}%)
          <span className="w-2 h-2 rounded-full bg-purple-400 animate-pulse"></span>
        </div>
      </div>

      {/* Crossfader Slider Track */}
      <div className="w-full relative px-2 flex items-center">
        {/* Custom Track Background with A to B Gradient */}
        <div className="w-full h-4 rounded-full bg-gradient-to-r from-cyan-600/60 via-purple-600/40 to-purple-600/60 p-0.5 border border-slate-700 shadow-inner flex items-center">
          <input
            type="range"
            min="0"
            max="1"
            step="0.005"
            value={value}
            onChange={(e) => onChange(parseFloat(e.target.value))}
            className="w-full h-full bg-transparent appearance-none cursor-pointer accent-purple-400 focus:outline-none"
          />
        </div>
      </div>

      {/* Quick Preset Buttons */}
      <div className="flex items-center justify-center gap-2 w-full pt-1">
        <button
          onClick={() => onChange(0.0)}
          className={`px-3 py-1 rounded-lg font-mono text-[11px] font-bold border transition-all ${
            value === 0.0
              ? 'bg-cyan-600 text-white border-cyan-400 shadow-md shadow-cyan-500/30'
              : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-cyan-400 hover:border-slate-700'
          }`}
        >
          FULL A
        </button>

        <button
          onClick={() => onChange(0.5)}
          className={`px-4 py-1 rounded-lg font-mono text-[11px] font-bold border transition-all ${
            Math.abs(value - 0.5) < 0.02
              ? 'bg-purple-600 text-white border-purple-400 shadow-md shadow-purple-500/30'
              : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-purple-300 hover:border-slate-700'
          }`}
        >
          CENTER (50/50)
        </button>

        <button
          onClick={() => onChange(1.0)}
          className={`px-3 py-1 rounded-lg font-mono text-[11px] font-bold border transition-all ${
            value === 1.0
              ? 'bg-purple-600 text-white border-purple-400 shadow-md shadow-purple-500/30'
              : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-purple-400 hover:border-slate-700'
          }`}
        >
          FULL B
        </button>
      </div>
    </div>
  );
}
