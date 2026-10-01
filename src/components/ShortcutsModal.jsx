import React from 'react';
import { X, Keyboard } from 'lucide-react';
import { SOUND_FX_LIST } from './SoundFX';

export default function ShortcutsModal({ isOpen, onClose }) {
  if (!isOpen) return null;

  const deckKeys = [
    { key: 'SPACE', desc: 'Play / Pause Active Deck' },
    { key: '1', desc: 'Select Deck A as Active' },
    { key: '2', desc: 'Select Deck B as Active' }
  ];

  const drumKeys = [
    { key: 'A', name: 'Kick Drum' },
    { key: 'S', name: 'Snare Drum' },
    { key: 'D', name: 'Hand Clap' },
    { key: 'F', name: 'Hi-Hat' },
    { key: 'G', name: 'Low Tom' },
    { key: 'H', name: 'Crash Cymbal' },
    { key: 'J', name: 'Ride Cymbal' },
    { key: 'K', name: 'Percussion' }
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
      <div className="glass-panel w-full max-w-4xl rounded-3xl p-6 border border-purple-500/30 shadow-2xl flex flex-col gap-6 relative max-h-[90vh] overflow-y-auto animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-purple-950 border border-purple-500/40 text-purple-400">
              <Keyboard className="w-6 h-6" />
            </div>
            <div>
              <h2 className="font-orbitron font-extrabold text-lg text-slate-100">
                COMPLETE DJ KEYBOARD SHORTCUTS MAP
              </h2>
              <p className="text-xs text-slate-400">
                All 24 Sound FX, 8 Drum Machine Pads, and Deck transport controls mapped.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Shortcuts Mapping Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Deck Controls */}
          <div className="bg-slate-900/80 p-4 rounded-2xl border border-slate-800 flex flex-col gap-3">
            <h3 className="font-orbitron font-bold text-xs text-cyan-400 border-b border-slate-800 pb-1.5">
              DECK CONTROL HOTKEYS
            </h3>
            {deckKeys.map(k => (
              <div key={k.key} className="flex items-center justify-between text-xs py-1 border-b border-slate-800/40">
                <span className="text-slate-300 font-medium">{k.desc}</span>
                <kbd className="px-2 py-0.5 font-mono font-bold text-cyan-300 bg-cyan-950 border border-cyan-500/40 rounded shadow">
                  [{k.key}]
                </kbd>
              </div>
            ))}

            <h3 className="font-orbitron font-bold text-xs text-pink-400 border-b border-slate-800 pb-1.5 mt-3">
              DRUM MACHINE PADS (8)
            </h3>
            {drumKeys.map(k => (
              <div key={k.key} className="flex items-center justify-between text-xs py-0.5">
                <span className="text-slate-300 font-medium">{k.name}</span>
                <kbd className="px-2 py-0.5 font-mono font-bold text-pink-300 bg-pink-950 border border-pink-500/40 rounded shadow">
                  [{k.key}]
                </kbd>
              </div>
            ))}
          </div>

          {/* Sound FX Column 1 */}
          <div className="bg-slate-900/80 p-4 rounded-2xl border border-slate-800 flex flex-col gap-2">
            <h3 className="font-orbitron font-bold text-xs text-purple-400 border-b border-slate-800 pb-1.5">
              SOUND FX PADS (1 - 12)
            </h3>
            {SOUND_FX_LIST.slice(0, 12).map(fx => (
              <div key={fx.id} className="flex items-center justify-between text-xs py-1 border-b border-slate-800/40">
                <span className="text-slate-300 font-medium flex items-center gap-1.5">
                  <span>{fx.emoji}</span> {fx.name}
                </span>
                <kbd className="px-2 py-0.5 font-mono font-bold text-purple-300 bg-purple-950 border border-purple-500/40 rounded shadow">
                  [{fx.key}]
                </kbd>
              </div>
            ))}
          </div>

          {/* Sound FX Column 2 */}
          <div className="bg-slate-900/80 p-4 rounded-2xl border border-slate-800 flex flex-col gap-2">
            <h3 className="font-orbitron font-bold text-xs text-purple-400 border-b border-slate-800 pb-1.5">
              SOUND FX PADS (13 - 24)
            </h3>
            {SOUND_FX_LIST.slice(12, 24).map(fx => (
              <div key={fx.id} className="flex items-center justify-between text-xs py-1 border-b border-slate-800/40">
                <span className="text-slate-300 font-medium flex items-center gap-1.5">
                  <span>{fx.emoji}</span> {fx.name}
                </span>
                <kbd className="px-2 py-0.5 font-mono font-bold text-purple-300 bg-purple-950 border border-purple-500/40 rounded shadow">
                  [{fx.key}]
                </kbd>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end pt-2 border-t border-slate-800">
          <button
            onClick={onClose}
            className="px-6 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs shadow-lg transition-all active:scale-95"
          >
            Close Map
          </button>
        </div>
      </div>
    </div>
  );
}
