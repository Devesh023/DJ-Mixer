import React from 'react';
import { Volume2, VolumeX, Keyboard, Disc3 } from 'lucide-react';

export default function Header({ 
  masterVolume, 
  onMasterVolumeChange, 
  isMuted, 
  onToggleMute,
  onOpenShortcuts 
}) {
  return (
    <header className="w-full glass-panel border-b border-purple-900/30 px-4 py-2.5 sticky top-0 z-40 shadow-xl">
      <div className="max-w-[1440px] mx-auto flex items-center justify-between gap-4">
        {/* Brand Logo & Title */}
        <div className="flex items-center gap-3">
          <div className="relative flex items-center justify-center w-9 h-9 rounded-xl bg-gradient-to-tr from-purple-600 via-violet-600 to-cyan-400 p-0.5 shadow-lg shadow-purple-500/20 shrink-0">
            <div className="w-full h-full bg-neutral-950 rounded-[10px] flex items-center justify-center">
              <Disc3 className="w-5 h-5 text-cyan-400 animate-spin-slow" />
            </div>
          </div>
          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              <h1 className="font-orbitron text-lg font-black tracking-wider bg-gradient-to-r from-purple-400 via-violet-300 to-cyan-400 bg-clip-text text-transparent leading-none">
                DJ MIXER PRO
              </h1>
              <span className="px-2 py-0.5 text-[9px] font-mono font-bold bg-purple-950/80 border border-purple-500/40 text-purple-300 rounded-full flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse"></span>
                ONLINE
              </span>
            </div>
            <p className="text-[11px] text-slate-400 font-medium tracking-wide">
              Professional Web DJ Console
            </p>
          </div>
        </div>

        {/* Master Quick Controls & Shortcuts */}
        <div className="flex items-center gap-3">
          {/* Master Volume Quick Control */}
          <div className="hidden sm:flex items-center gap-2 bg-slate-900/90 border border-slate-800 px-3 py-1.5 rounded-xl shadow-inner">
            <button 
              onClick={onToggleMute}
              className="text-slate-400 hover:text-cyan-400 transition-colors p-0.5"
              title={isMuted ? "Unmute Master" : "Mute Master"}
            >
              {isMuted || masterVolume === 0 ? (
                <VolumeX className="w-4 h-4 text-pink-500" />
              ) : (
                <Volume2 className="w-4 h-4 text-cyan-400" />
              )}
            </button>
            <span className="font-orbitron text-[10px] font-bold text-slate-400 tracking-wider">
              MASTER
            </span>
            <input 
              type="range" 
              min="0" 
              max="1" 
              step="0.01"
              value={isMuted ? 0 : masterVolume}
              onChange={(e) => onMasterVolumeChange(parseFloat(e.target.value))}
              className="w-24 h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-purple-500"
            />
            <span className="font-mono text-xs text-slate-200 w-8 text-right font-bold">
              {isMuted ? '0%' : `${Math.round(masterVolume * 100)}%`}
            </span>
          </div>

          {/* Keyboard Shortcuts Button */}
          <button
            onClick={onOpenShortcuts}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-purple-950/60 hover:bg-purple-900/80 border border-purple-500/40 text-purple-300 text-xs font-bold transition-all hover:shadow-lg hover:shadow-purple-500/20 active:scale-95"
            title="Keyboard Shortcuts Map"
          >
            <Keyboard className="w-4 h-4 text-purple-400" />
            <span className="font-orbitron tracking-wider">Hotkeys</span>
          </button>
        </div>
      </div>
    </header>
  );
}
