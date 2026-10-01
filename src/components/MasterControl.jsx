import React, { useState, useRef } from 'react';
import { Volume2, VolumeX, Activity, Zap, Music } from 'lucide-react';
import { setMasterFxVolume } from '../utils/audioEngine';

export default function MasterControl({
  masterVolume,
  onMasterVolumeChange,
  isMuted,
  onToggleMute,
  masterBpm,
  onMasterBpmChange
}) {
  const [selectedKey, setSelectedKey] = useState('8A (A Minor)');
  const tapTimesRef = useRef([]);

  // Tap BPM calculation
  const handleTapBpm = () => {
    const now = Date.now();
    tapTimesRef.current.push(now);

    if (tapTimesRef.current.length > 4) {
      tapTimesRef.current.shift();
    }

    if (tapTimesRef.current.length > 1) {
      const intervals = [];
      for (let i = 1; i < tapTimesRef.current.length; i++) {
        intervals.push(tapTimesRef.current[i] - tapTimesRef.current[i - 1]);
      }
      const avgInterval = intervals.reduce((a, b) => a + b, 0) / intervals.length;
      const calculatedBpm = Math.round(60000 / avgInterval);
      if (calculatedBpm >= 60 && calculatedBpm <= 200) {
        onMasterBpmChange(calculatedBpm);
      }
    }
  };

  const keysList = [
    '1A (Ab Minor)', '2A (Eb Minor)', '3A (Bb Minor)', '4A (F Minor)',
    '5A (C Minor)', '6A (G Minor)', '7A (D Minor)', '8A (A Minor)',
    '9A (E Minor)', '10A (B Minor)', '11A (F# Minor)', '12A (Db Minor)'
  ];

  return (
    <div className="glass-panel rounded-2xl p-3.5 flex flex-col gap-3 border border-slate-800 shadow-xl w-full">
      {/* Title Header */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-2">
        <div className="flex items-center gap-1.5">
          <Activity className="w-4 h-4 text-purple-400" />
          <h3 className="font-orbitron font-extrabold text-xs text-slate-100 tracking-wider">
            MASTER CONSOLE
          </h3>
        </div>
        <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-purple-950/80 border border-purple-500/40 text-purple-300 font-bold">
          MAIN BUS
        </span>
      </div>

      <div className="flex flex-col gap-3">
        {/* MASTER VOLUME SECTION */}
        <div className="flex flex-col gap-1.5 bg-slate-900/80 p-2.5 rounded-xl border border-slate-800">
          <div className="flex items-center justify-between text-[11px] font-orbitron font-bold text-slate-200">
            <span className="flex items-center gap-1">
              {isMuted ? <VolumeX className="w-3.5 h-3.5 text-pink-500" /> : <Volume2 className="w-3.5 h-3.5 text-cyan-400" />}
              MASTER VOLUME
            </span>
            <span className="font-mono text-cyan-400">
              {isMuted ? 'MUTED' : `${Math.round(masterVolume * 100)}%`}
            </span>
          </div>

          <input
            type="range"
            min="0"
            max="1"
            step="0.01"
            value={isMuted ? 0 : masterVolume}
            onChange={(e) => {
              const val = parseFloat(e.target.value);
              onMasterVolumeChange(val);
              setMasterFxVolume(val);
            }}
            className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-purple-500"
          />
        </div>

        {/* MASTER TEMPO SECTION */}
        <div className="flex flex-col gap-1.5 bg-slate-900/80 p-2.5 rounded-xl border border-slate-800">
          <div className="flex items-center justify-between text-[11px] font-orbitron font-bold text-slate-200">
            <span className="flex items-center gap-1">
              <Zap className="w-3.5 h-3.5 text-amber-400" />
              MASTER TEMPO
            </span>
            <span className="font-orbitron text-amber-400 font-extrabold">
              {masterBpm} BPM
            </span>
          </div>

          <div className="flex items-center gap-2">
            <input
              type="range"
              min="70"
              max="180"
              step="1"
              value={masterBpm}
              onChange={(e) => onMasterBpmChange(parseInt(e.target.value, 10))}
              className="flex-1 h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-amber-400"
            />
            <button
              onClick={handleTapBpm}
              className="px-2.5 py-1 rounded-md bg-amber-600 hover:bg-amber-500 text-white font-mono text-[10px] font-bold shadow transition-all active:scale-95 shrink-0"
              title="Click repeatedly to tap tempo"
            >
              TAP
            </button>
          </div>
        </div>

        {/* HARMONIC KEY SECTION */}
        <div className="flex flex-col gap-1.5 bg-slate-900/80 p-2.5 rounded-xl border border-slate-800">
          <div className="flex items-center justify-between text-[11px] font-orbitron font-bold text-slate-200">
            <span className="flex items-center gap-1">
              <Music className="w-3.5 h-3.5 text-violet-400" />
              HARMONIC KEY
            </span>
            <span className="font-mono text-violet-400">
              {selectedKey.split(' ')[0]}
            </span>
          </div>

          <select
            value={selectedKey}
            onChange={(e) => setSelectedKey(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 text-[11px] text-slate-200 rounded-lg p-1.5 focus:outline-none focus:border-purple-500 font-mono"
          >
            {keysList.map(k => (
              <option key={k} value={k}>{k}</option>
            ))}
          </select>
        </div>

        {/* MASTER MUTE BUTTON */}
        <button
          onClick={onToggleMute}
          className={`w-full py-2 rounded-xl text-xs font-orbitron font-bold transition-all border shadow ${
            isMuted
              ? 'bg-pink-950/90 border-pink-500/60 text-pink-300 shadow-pink-500/20 animate-pulse'
              : 'bg-slate-900 hover:bg-slate-800 border-slate-800 text-slate-300 hover:text-white'
          }`}
        >
          {isMuted ? 'UNMUTE MASTER BUS' : 'MUTE MASTER BUS'}
        </button>
      </div>
    </div>
  );
}
