import React, { useState, useEffect, useCallback } from 'react';
import Header from './components/Header';
import Deck from './components/Deck';
import Crossfader from './components/Crossfader';
import MasterControl from './components/MasterControl';
import SoundFX, { SOUND_FX_LIST } from './components/SoundFX';
import DrumPad, { DRUM_PADS } from './components/DrumPad';
import Queue from './components/Queue';
import YouTubeSearch from './components/YouTubeSearch';
import Visualizer from './components/Visualizer';
import ShortcutsModal from './components/ShortcutsModal';
import ErrorBoundary from './components/ErrorBoundary';
import { triggerSoundFX } from './utils/audioEngine';

export default function App() {
  const [masterVolume, setMasterVolume] = useState(0.9);
  const [isMuted, setIsMuted] = useState(false);
  const [crossfaderPos, setCrossfaderPos] = useState(0.5); // 0.0 (A) -> 1.0 (B)
  const [masterBpm, setMasterBpm] = useState(128);
  const [activeDeck, setActiveDeck] = useState('A'); // 'A' or 'B'
  const [isShortcutsOpen, setIsShortcutsOpen] = useState(false);

  // Active key triggers for drum pads and FX
  const [activeDrumKey, setActiveDrumKey] = useState(null);
  const [activeFxKey, setActiveFxKey] = useState(null);

  // Track to add directly to Queue from YouTube Search
  const [searchTrackToQueue, setSearchTrackToQueue] = useState(null);

  // Crossfader volume multipliers using equal-power curve
  const deckAMultiplier = Math.cos((Math.PI / 2) * crossfaderPos);
  const deckBMultiplier = Math.sin((Math.PI / 2) * crossfaderPos);

  // State to track if decks are currently playing (for visualizer)
  const [isDeckAPlaying, setIsDeckAPlaying] = useState(false);
  const [isDeckBPlaying, setIsDeckBPlaying] = useState(false);

  // Global Keyboard Shortcuts Listener
  const handleKeyDown = useCallback((e) => {
    // Ignore keypresses when typing inside input elements
    const tag = document.activeElement?.tagName;
    if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') {
      return;
    }

    const key = e.key;
    const upperKey = key.toUpperCase();

    // SPACE = Play / Pause active deck
    if (e.code === 'Space' || upperKey === ' ') {
      e.preventDefault();
      window.dispatchEvent(new CustomEvent('dj-toggle-play', { detail: { deck: activeDeck } }));
      return;
    }

    // 1 & 2 for deck switching
    if (upperKey === '1') {
      setActiveDeck('A');
    } else if (upperKey === '2') {
      setActiveDeck('B');
    }

    // Drum pads (A, S, D, F, G, H, J, K)
    const isDrumKey = DRUM_PADS.some(p => p.key.toUpperCase() === upperKey);
    if (isDrumKey) {
      setActiveDrumKey(upperKey);
      setTimeout(() => setActiveDrumKey(null), 50);
      return;
    }

    // Sound FX Hotkeys (All 24 FX)
    const matchFx = SOUND_FX_LIST.find(f => f.key === key || f.key.toUpperCase() === upperKey);
    if (matchFx) {
      try {
        triggerSoundFX(matchFx.id);
        setActiveFxKey(matchFx.key);
        setTimeout(() => setActiveFxKey(null), 50);
      } catch (err) {
        console.warn("Sound FX error:", err);
      }
    }
  }, [activeDeck]);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  // Load track handlers from Search / Queue to Deck A or Deck B
  const handleLoadToDeckA = (track) => {
    window.dispatchEvent(new CustomEvent('dj-load-deck', { detail: { deck: 'A', track } }));
  };

  const handleLoadToDeckB = (track) => {
    window.dispatchEvent(new CustomEvent('dj-load-deck', { detail: { deck: 'B', track } }));
  };

  const handleAddToQueueFromSearch = (track) => {
    setSearchTrackToQueue({ ...track, id: Date.now().toString() });
  };

  return (
    <div className="min-h-screen bg-neutral-950 text-slate-100 flex flex-col selection:bg-purple-600 selection:text-white font-sans antialiased">
      {/* Fixed Sticky Header */}
      <ErrorBoundary name="Header">
        <Header
          masterVolume={masterVolume}
          onMasterVolumeChange={setMasterVolume}
          isMuted={isMuted}
          onToggleMute={() => setIsMuted(!isMuted)}
          onOpenShortcuts={() => setIsShortcutsOpen(true)}
        />
      </ErrorBoundary>

      {/* Main Console Workspace */}
      <main className="flex-1 max-w-[1440px] w-full mx-auto p-3 sm:p-4 flex flex-col gap-5">
        
        {/* TOP SECTION: DECK A - CENTER MIXER - DECK B */}
        <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_260px_minmax(0,1fr)] gap-4 items-start">
          
          {/* DECK A Container */}
          <div className="w-full flex flex-col">
            <ErrorBoundary name="Deck A">
              <Deck
                deckId="A"
                color="cyan"
                crossfaderMultiplier={deckAMultiplier}
                masterVolume={isMuted ? 0 : masterVolume}
                onBpmChange={setMasterBpm}
                otherDeckBpm={masterBpm}
                isActiveDeck={activeDeck === 'A'}
                onSelectActiveDeck={(id) => setActiveDeck(id)}
                initialVideoId="60ItHLz5WEA"
              />
            </ErrorBoundary>
          </div>

          {/* CENTER MIXER: CROSSFADER & MASTER CONTROLS */}
          <div className="w-full flex flex-col gap-3">
            <ErrorBoundary name="Crossfader">
              <Crossfader
                value={crossfaderPos}
                onChange={setCrossfaderPos}
              />
            </ErrorBoundary>

            <ErrorBoundary name="Master Console">
              <MasterControl
                masterVolume={masterVolume}
                onMasterVolumeChange={setMasterVolume}
                isMuted={isMuted}
                onToggleMute={() => setIsMuted(!isMuted)}
                masterBpm={masterBpm}
                onMasterBpmChange={setMasterBpm}
              />
            </ErrorBoundary>
          </div>

          {/* DECK B Container */}
          <div className="w-full flex flex-col">
            <ErrorBoundary name="Deck B">
              <Deck
                deckId="B"
                color="purple"
                crossfaderMultiplier={deckBMultiplier}
                masterVolume={isMuted ? 0 : masterVolume}
                onBpmChange={setMasterBpm}
                otherDeckBpm={masterBpm}
                isActiveDeck={activeDeck === 'B'}
                onSelectActiveDeck={(id) => setActiveDeck(id)}
                initialVideoId="bM7SZ5SBzyY"
              />
            </ErrorBoundary>
          </div>
        </div>

        {/* VISUALIZER SECTION */}
        <ErrorBoundary name="Visualizer">
          <Visualizer
            isDeckAPlaying={isDeckAPlaying}
            isDeckBPlaying={isDeckBPlaying}
            masterBpm={masterBpm}
          />
        </ErrorBoundary>

        {/* SOUND FX & DRUM PADS SECTION */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
          <div className="lg:col-span-8">
            <ErrorBoundary name="Sound FX Pad">
              <SoundFX 
                activeFxKey={activeFxKey} 
                onOpenShortcuts={() => setIsShortcutsOpen(true)} 
              />
            </ErrorBoundary>
          </div>

          <div className="lg:col-span-4">
            <ErrorBoundary name="Drum Machine">
              <DrumPad activeKeyTrigger={activeDrumKey} />
            </ErrorBoundary>
          </div>
        </div>

        {/* YOUTUBE MUSIC SEARCH BROWSER */}
        <ErrorBoundary name="YouTube Music Search">
          <YouTubeSearch
            onLoadToDeckA={handleLoadToDeckA}
            onLoadToDeckB={handleLoadToDeckB}
            onAddToQueue={handleAddToQueueFromSearch}
          />
        </ErrorBoundary>

        {/* MUSIC QUEUE SECTION */}
        <ErrorBoundary name="Music Queue">
          <Queue
            onLoadToDeckA={handleLoadToDeckA}
            onLoadToDeckB={handleLoadToDeckB}
            newTrackFromSearch={searchTrackToQueue}
          />
        </ErrorBoundary>
      </main>

      {/* Keyboard Shortcuts Modal */}
      <ErrorBoundary name="Shortcuts Modal">
        <ShortcutsModal
          isOpen={isShortcutsOpen}
          onClose={() => setIsShortcutsOpen(false)}
        />
      </ErrorBoundary>

      {/* Footer */}
      <footer className="w-full text-center py-4 text-xs font-mono text-slate-500 border-t border-slate-900 mt-6">
        DJ Mixer Pro • Web Audio Synthesis & Official YouTube API • Single Port Localhost:5173
      </footer>
    </div>
  );
}
