import React, { useState, useEffect } from 'react';
import { Sparkles } from 'lucide-react';
import { triggerSoundFX } from '../utils/audioEngine';

export const SOUND_FX_LIST = [
  { id: 'kick', name: 'KICK', emoji: '🥁', key: 'Z' },
  { id: 'snare', name: 'SNARE', emoji: '🥁', key: 'X' },
  { id: 'clap', name: 'CLAP', emoji: '👏', key: 'C' },
  { id: 'hihat', name: 'HI-HAT', emoji: '💥', key: 'V' },
  { id: 'open_hihat', name: 'OPEN HI-HAT', emoji: '✨', key: 'B' },
  { id: 'rimshot', name: 'RIM SHOT', emoji: '🎯', key: 'N' },

  { id: 'bass', name: 'BASS', emoji: '🎸', key: 'M' },
  { id: 'bass_drop', name: 'BASS DROP', emoji: '💣', key: 'Y' },
  { id: 'boom', name: 'BOOM', emoji: '💥', key: 'T' },
  { id: 'air_horn', name: 'AIR HORN', emoji: '📢', key: 'Q' },
  { id: 'siren', name: 'SIREN', emoji: '🚨', key: 'W' },
  { id: 'bell', name: 'BELL', emoji: '🔔', key: 'U' },

  { id: 'laser', name: 'LASER', emoji: '🔫', key: 'E' },
  { id: 'zap', name: 'ZAP', emoji: '⚡', key: 'I' },
  { id: 'whoosh', name: 'WHOOSH', emoji: '💨', key: 'R' },
  { id: 'impact', name: 'IMPACT', emoji: '🌠', key: 'O' },
  { id: 'crowd', name: 'CROWD', emoji: '🙌', key: 'P' },
  { id: 'applause', name: 'APPLAUSE', emoji: '👏', key: 'L' },

  { id: 'scratch', name: 'SCRATCH', emoji: '💿', key: ',' },
  { id: 'reverse', name: 'REVERSE', emoji: '◀️', key: '.' },
  { id: 'dj_drop', name: 'DJ DROP', emoji: '🎧', key: '/' },
  { id: 'record_stop', name: 'RECORD STOP', emoji: '🛑', key: ';' },
  { id: 'vinyl_scratch', name: 'VINYL SCRATCH', emoji: '🎛️', key: "'" },
  { id: 'echo_hit', name: 'ECHO HIT', emoji: '📡', key: '-' }
];

export default function SoundFX({ activeFxKey, onOpenShortcuts }) {
  const [activePad, setActivePad] = useState(null);

  const handlePadClick = (id) => {
    try {
      triggerSoundFX(id);
    } catch (e) {
      console.warn("Audio trigger error:", e);
    }
    setActivePad(id);
    setTimeout(() => setActivePad(null), 180);
  };

  useEffect(() => {
    if (activeFxKey) {
      const match = SOUND_FX_LIST.find(f => f.key.toUpperCase() === activeFxKey.toUpperCase());
      if (match) {
        handlePadClick(match.id);
      }
    }
  }, [activeFxKey]);

  return (
    <div className="glass-panel rounded-2xl p-4 border border-slate-800/80 shadow-xl flex flex-col gap-3">
      {/* Title Header */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
        <div className="flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-cyan-400" />
          <h2 className="font-orbitron font-bold text-xs sm:text-sm text-slate-100 tracking-wider">
            DJ SOUND FX PAD (ALL 24 FX ASSIGNED TO HOTKEYS)
          </h2>
        </div>
        <button
          onClick={onOpenShortcuts}
          className="text-[10px] font-mono px-2.5 py-1 rounded-lg bg-cyan-950/80 hover:bg-cyan-900 border border-cyan-500/40 text-cyan-300 font-bold transition-colors"
        >
          VIEW HOTKEYS MAP
        </button>
      </div>

      {/* 6-Column FX Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2">
        {SOUND_FX_LIST.map((fx) => {
          const isActive = activePad === fx.id;
          return (
            <button
              key={fx.id}
              onClick={() => handlePadClick(fx.id)}
              className={`p-2.5 rounded-xl flex flex-col items-center justify-between gap-1 transition-all duration-100 border active:scale-95 group h-20 relative overflow-hidden ${
                isActive
                  ? 'bg-gradient-to-tr from-cyan-600 to-purple-600 border-cyan-300 text-white shadow-lg shadow-cyan-500/40 scale-95 ring-2 ring-cyan-400'
                  : 'bg-slate-900/90 hover:bg-slate-800 border-slate-800 hover:border-purple-500/40 text-slate-200'
              }`}
            >
              {/* Shortcut badge on top right */}
              <span className="self-end px-1.5 py-0.5 text-[9px] font-mono font-black rounded bg-black/60 border border-white/20 text-cyan-300">
                [{fx.key}]
              </span>

              <span className="text-lg group-hover:scale-110 transition-transform">
                {fx.emoji}
              </span>

              <span className="font-orbitron font-extrabold text-[10px] truncate w-full text-center tracking-tight">
                {fx.name}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
