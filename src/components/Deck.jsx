import React, { useState, useEffect, useRef, useCallback } from 'react';
import { 
  Play, Pause, Square, SkipBack, SkipForward, RotateCcw, 
  Repeat, Volume2, VolumeX, Link2, Sparkles, AlertCircle, Info, Sliders, Disc3
} from 'lucide-react';
import { extractVideoId, loadYouTubeIframeAPI, formatTime } from '../utils/youtube';

export default function Deck({
  deckId, // 'A' or 'B'
  title = `DECK ${deckId}`,
  color = deckId === 'A' ? 'cyan' : 'purple',
  crossfaderMultiplier = 1,
  masterVolume = 1,
  onBpmChange,
  otherDeckBpm,
  isActiveDeck,
  onSelectActiveDeck,
  initialVideoId = deckId === 'A' ? '60ItHLz5WEA' : 'bM7SZ5SBzyY'
}) {
  const [urlInput, setUrlInput] = useState('');
  const [videoId, setVideoId] = useState(initialVideoId);
  const [player, setPlayer] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(0.8);
  const [pitch, setPitch] = useState(1.0); // 0.8x to 1.2x
  const [bpm, setBpm] = useState(deckId === 'A' ? 128 : 124);
  const [isLooping, setIsLooping] = useState(false);
  const [cuePoint, setCuePoint] = useState(0);
  const [trackTitle, setTrackTitle] = useState(deckId === 'A' ? 'Alan Walker - Faded' : 'Tobu - Hope');
  const [errorMsg, setErrorMsg] = useState(null);
  const [isReady, setIsReady] = useState(false);

  const containerId = `yt-player-container-${deckId}`;
  const progressIntervalRef = useRef(null);

  // Computed effective volume = deck volume * crossfader volume multiplier * master volume
  const effectiveVolume = volume * crossfaderMultiplier * masterVolume;

  // Function: Load new track URL (declared before hooks)
  const handleLoadUrl = useCallback((urlToLoad) => {
    setErrorMsg(null);
    const targetUrl = urlToLoad || urlInput;
    const extractedId = extractVideoId(targetUrl);

    if (!extractedId) {
      setErrorMsg("Invalid YouTube URL or Video ID. Please check the link.");
      return;
    }

    setVideoId(extractedId);
    setTrackTitle(`Track ID: ${extractedId}`);

    if (player && typeof player.loadVideoById === 'function') {
      try {
        player.loadVideoById(extractedId);
        setIsPlaying(true);
      } catch (err) {
        setErrorMsg("Unable to load YouTube video.");
      }
    }
    setUrlInput('');
  }, [urlInput, player]);

  // Function: Playback control toggle (declared before hooks)
  const togglePlayPause = useCallback(() => {
    onSelectActiveDeck(deckId);
    if (!player) return;
    try {
      if (isPlaying) {
        player.pauseVideo();
      } else {
        player.playVideo();
      }
    } catch (err) {
      console.warn("YouTube play/pause error:", err);
    }
  }, [onSelectActiveDeck, deckId, player, isPlaying]);

  // Listen for track loads and play toggles from Queue / Hotkeys
  useEffect(() => {
    const handleCustomLoad = (e) => {
      if (e.detail && e.detail.deck === deckId && e.detail.track) {
        const target = e.detail.track.url || e.detail.track.videoId;
        if (target) {
          handleLoadUrl(target);
        }
      }
    };
    window.addEventListener('dj-load-deck', handleCustomLoad);

    const handleTogglePlay = (e) => {
      if (e.detail && e.detail.deck === deckId) {
        togglePlayPause();
      }
    };
    window.addEventListener('dj-toggle-play', handleTogglePlay);

    return () => {
      window.removeEventListener('dj-load-deck', handleCustomLoad);
      window.removeEventListener('dj-toggle-play', handleTogglePlay);
    };
  }, [deckId, handleLoadUrl, togglePlayPause]);

  // Initialize YouTube Player safely
  useEffect(() => {
    let isMounted = true;

    loadYouTubeIframeAPI().then((YT) => {
      if (!isMounted) return;

      if (!YT || !YT.Player) {
        setErrorMsg("Unable to load YouTube player");
        return;
      }

      try {
        const newPlayer = new YT.Player(containerId, {
          height: '100%',
          width: '100%',
          videoId: videoId,
          playerVars: {
            autoplay: 0,
            controls: 0,
            disablekb: 1,
            fs: 0,
            modestbranding: 1,
            rel: 0,
            origin: window.location.origin
          },
          events: {
            onReady: (event) => {
              if (!isMounted) return;
              setPlayer(event.target);
              setIsReady(true);
              try {
                setDuration(event.target.getDuration() || 0);
                event.target.setVolume(Math.round(effectiveVolume * 100));
              } catch (e) {
                // ignore
              }
            },
            onStateChange: (event) => {
              if (!isMounted) return;
              if (event.data === 1) {
                setIsPlaying(true);
              } else if (event.data === 2 || event.data === 0) {
                setIsPlaying(false);
              }
            },
            onError: () => {
              if (!isMounted) return;
              setErrorMsg("Unable to load YouTube player for this video.");
            }
          }
        });
      } catch (err) {
        console.warn("YouTube player creation error:", err);
        if (isMounted) setErrorMsg("Unable to load YouTube player");
      }
    }).catch((err) => {
      console.warn("YouTube API error:", err);
      if (isMounted) setErrorMsg("Unable to load YouTube player");
    });

    return () => {
      isMounted = false;
      if (progressIntervalRef.current) clearInterval(progressIntervalRef.current);
    };
  }, [containerId]);

  // Update volume when effectiveVolume changes
  useEffect(() => {
    if (player && typeof player.setVolume === 'function') {
      try {
        player.setVolume(Math.round(effectiveVolume * 100));
      } catch (err) {
        // ignore iframe sync errors
      }
    }
  }, [effectiveVolume, player]);

  // Sync playback progress
  useEffect(() => {
    if (isPlaying && player) {
      progressIntervalRef.current = setInterval(() => {
        try {
          if (typeof player.getCurrentTime === 'function') {
            const cur = player.getCurrentTime();
            setCurrentTime(cur);

            const dur = player.getDuration();
            if (dur && dur !== duration) setDuration(dur);

            // Loop logic if enabled
            if (isLooping && cur >= cuePoint + 16) {
              player.seekTo(cuePoint, true);
            }
          }
        } catch (e) {
          // ignore
        }
      }, 250);
    } else {
      if (progressIntervalRef.current) clearInterval(progressIntervalRef.current);
    }

    return () => {
      if (progressIntervalRef.current) clearInterval(progressIntervalRef.current);
    };
  }, [isPlaying, player, isLooping, cuePoint, duration]);

  const handleStop = () => {
    if (!player) return;
    try {
      player.stopVideo();
      player.seekTo(0);
    } catch (e) {}
    setIsPlaying(false);
    setCurrentTime(0);
  };

  const handleSeek = (newTime) => {
    setCurrentTime(newTime);
    if (player && typeof player.seekTo === 'function') {
      try {
        player.seekTo(newTime, true);
      } catch (e) {}
    }
  };

  const handlePitchChange = (newPitch) => {
    setPitch(newPitch);
    if (player && typeof player.setPlaybackRate === 'function') {
      try {
        player.setPlaybackRate(newPitch);
      } catch (err) {
        // Some YT videos only support standard rates
      }
    }
  };

  const handleSetCue = () => {
    setCuePoint(currentTime);
  };

  const handleJumpCue = () => {
    handleSeek(cuePoint);
  };

  const handleSyncBpm = () => {
    if (otherDeckBpm) {
      setBpm(otherDeckBpm);
      if (onBpmChange) onBpmChange(otherDeckBpm);
    }
  };

  const isCyan = color === 'cyan';
  const borderGlowClass = isActiveDeck
    ? isCyan 
      ? 'border-cyan-500 shadow-lg shadow-cyan-500/20' 
      : 'border-purple-500 shadow-lg shadow-purple-500/20'
    : 'border-slate-800 hover:border-slate-700';

  const badgeBg = isCyan ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40' : 'bg-purple-500/20 text-purple-300 border-purple-500/40';

  return (
    <div 
      onClick={() => onSelectActiveDeck(deckId)}
      className={`glass-panel rounded-2xl p-4 transition-all duration-300 border ${borderGlowClass} relative flex flex-col gap-4`}
    >
      {/* Header Badge */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-3">
        <div className="flex items-center gap-2">
          <span className={`px-3 py-1 font-orbitron font-extrabold text-sm rounded-lg border ${badgeBg}`}>
            DECK {deckId}
          </span>
          <h3 className="font-semibold text-slate-200 text-sm truncate max-w-[180px] sm:max-w-[240px]" title={trackTitle}>
            {trackTitle}
          </h3>
        </div>

        {/* BPM & Sync */}
        <div className="flex items-center gap-2">
          <div className="bg-slate-900 border border-slate-800 px-2 py-1 rounded-lg flex items-center gap-1 font-mono text-xs text-slate-300">
            <span className="text-slate-500 text-[10px]">BPM</span>
            <span className="font-bold text-cyan-400">{Math.round(bpm * pitch)}</span>
          </div>
          <button
            onClick={handleSyncBpm}
            className="px-2 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-[11px] font-bold text-purple-400 hover:text-purple-300 transition-colors"
            title="Sync BPM with other deck"
          >
            SYNC
          </button>
        </div>
      </div>

      {/* Main Deck Visual Area: Video Embed & Vinyl Turntable */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-center bg-neutral-950/70 p-3 rounded-xl border border-slate-800/80">
        {/* YouTube Embedded Video Box */}
        <div className="relative aspect-video w-full rounded-lg overflow-hidden bg-slate-900 border border-slate-800 shadow-inner flex items-center justify-center">
          <div id={containerId} className="w-full h-full pointer-events-auto" />
          {!isReady && !errorMsg && (
            <div className="absolute inset-0 bg-slate-900/90 flex flex-col items-center justify-center gap-2 text-slate-400 text-xs font-mono">
              <Disc3 className="w-6 h-6 animate-spin text-purple-400" />
              <span>Loading YouTube Player...</span>
            </div>
          )}
          {errorMsg && (
            <div className="absolute inset-0 bg-slate-950/95 flex flex-col items-center justify-center p-3 text-center gap-1.5 text-amber-400 text-xs">
              <AlertCircle className="w-6 h-6 text-amber-400 shrink-0" />
              <span className="font-semibold">Unable to load YouTube player</span>
              <span className="text-[10px] text-slate-400">{errorMsg}</span>
            </div>
          )}
        </div>

        {/* Vinyl Record Platter Visualizer */}
        <div className="flex flex-col items-center justify-center relative p-2">
          <div className="relative w-36 h-36 sm:w-40 sm:h-40 flex items-center justify-center">
            {/* Spinning Vinyl Disc */}
            <div 
              className={`w-full h-full rounded-full bg-gradient-to-tr from-neutral-900 via-neutral-950 to-slate-900 border-4 ${isCyan ? 'border-cyan-500/40 shadow-cyan-500/20' : 'border-purple-500/40 shadow-purple-500/20'} shadow-2xl flex items-center justify-center relative transition-transform ${
                isPlaying ? 'animate-spin-slow' : 'animate-spin-paused'
              }`}
              style={{ animationDuration: `${3 / pitch}s` }}
            >
              {/* Vinyl grooves */}
              <div className="w-3/4 h-3/4 rounded-full border border-slate-800/60" />
              <div className="w-1/2 h-1/2 rounded-full border border-slate-800/40" />
              
              {/* Record Label Center */}
              <div className={`w-14 h-14 rounded-full ${isCyan ? 'bg-gradient-to-tr from-cyan-600 to-purple-600' : 'bg-gradient-to-tr from-purple-600 to-pink-600'} flex items-center justify-center shadow-lg border-2 border-neutral-950`}>
                <Disc3 className="w-6 h-6 text-white" />
              </div>
              <div className="w-3 h-3 rounded-full bg-neutral-950 absolute" />
            </div>

            {/* Tonearm overlay */}
            <div 
              className={`absolute top-0 right-2 w-12 h-20 border-r-2 ${isPlaying ? 'border-cyan-400 rotate-12' : 'border-slate-600 -rotate-6'} origin-top-right transition-transform duration-500 pointer-events-none`} 
            />
          </div>

          <span className="text-[11px] font-mono text-slate-400 mt-2">
            PITCH: <span className={isCyan ? 'text-cyan-400 font-bold' : 'text-purple-400 font-bold'}>{pitch > 1 ? `+${Math.round((pitch - 1) * 100)}%` : pitch < 1 ? `${Math.round((pitch - 1) * 100)}%` : '0.0%'}</span>
          </span>
        </div>
      </div>

      {/* URL Loader Input */}
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Link2 className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Paste YouTube Video URL..."
            value={urlInput}
            onChange={(e) => setUrlInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleLoadUrl()}
            className="w-full bg-slate-900/90 border border-slate-800 focus:border-purple-500 rounded-xl pl-9 pr-3 py-1.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none transition-colors"
          />
        </div>
        <button
          onClick={() => handleLoadUrl()}
          className={`px-4 py-1.5 rounded-xl font-semibold text-xs text-white bg-gradient-to-r ${isCyan ? 'from-cyan-600 to-violet-600 hover:from-cyan-500 hover:to-violet-500' : 'from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500'} shadow-md transition-all active:scale-95`}
        >
          Load Track
        </button>
      </div>

      {/* Time Progress Bar */}
      <div className="flex flex-col gap-1">
        <div className="flex justify-between items-center text-[11px] font-mono text-slate-400">
          <span>{formatTime(currentTime)}</span>
          <span>{formatTime(duration)}</span>
        </div>
        <input
          type="range"
          min="0"
          max={duration || 100}
          step="0.1"
          value={currentTime}
          onChange={(e) => handleSeek(parseFloat(e.target.value))}
          className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-400"
        />
      </div>

      {/* Main Transport & Pitch Controls Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
        {/* Playback Buttons */}
        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={togglePlayPause}
            className={`flex-1 min-w-[70px] py-2 px-3 rounded-xl flex items-center justify-center gap-1.5 font-bold text-xs text-white transition-all shadow-md active:scale-95 ${
              isPlaying 
                ? 'bg-amber-600 hover:bg-amber-500 border border-amber-400/40' 
                : 'bg-emerald-600 hover:bg-emerald-500 border border-emerald-400/40 shadow-emerald-900/30'
            }`}
          >
            {isPlaying ? <Pause className="w-4 h-4 fill-white" /> : <Play className="w-4 h-4 fill-white" />}
            {isPlaying ? 'PAUSE' : 'PLAY'}
          </button>

          <button
            onClick={handleStop}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 hover:text-white transition-colors"
            title="Stop"
          >
            <Square className="w-4 h-4" />
          </button>

          <button
            onClick={handleJumpCue}
            className="px-2.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-xs font-mono font-bold text-amber-400 hover:text-amber-300 transition-colors"
            title="Jump to Cue Point"
          >
            CUE
          </button>

          <button
            onClick={handleSetCue}
            className="px-2 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-[10px] font-mono text-slate-400 hover:text-slate-200 transition-colors"
            title="Set Cue Point at Current Position"
          >
            SET CUE
          </button>

          <button
            onClick={() => setIsLooping(!isLooping)}
            className={`p-2 rounded-xl border transition-colors ${
              isLooping 
                ? 'bg-purple-600 border-purple-400 text-white shadow-lg shadow-purple-500/30' 
                : 'bg-slate-800 border-slate-700 text-slate-400 hover:text-slate-200'
            }`}
            title="Toggle Seamless Loop"
          >
            <Repeat className="w-4 h-4" />
          </button>
        </div>

        {/* Volume & Pitch Controls */}
        <div className="flex flex-col gap-2 bg-slate-900/60 p-2.5 rounded-xl border border-slate-800">
          {/* Deck Volume */}
          <div className="flex items-center gap-2">
            <Volume2 className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <input
              type="range"
              min="0"
              max="1"
              step="0.01"
              value={volume}
              onChange={(e) => setVolume(parseFloat(e.target.value))}
              className="flex-1 h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-purple-500"
            />
            <span className="font-mono text-[10px] text-slate-400 w-7 text-right">
              {Math.round(volume * 100)}%
            </span>
          </div>

          {/* Pitch Slider & Reset */}
          <div className="flex items-center gap-2">
            <Sliders className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <input
              type="range"
              min="0.75"
              max="1.25"
              step="0.01"
              value={pitch}
              onChange={(e) => handlePitchChange(parseFloat(e.target.value))}
              className="flex-1 h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-400"
            />
            <button
              onClick={() => handlePitchChange(1.0)}
              className="px-1.5 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-[10px] font-mono text-slate-300 transition-colors"
              title="Reset Pitch to 1.0x"
            >
              RESET
            </button>
          </div>
        </div>
      </div>

      {/* Tooltip notice regarding YouTube CORS API boundaries */}
      <div className="flex items-center gap-1.5 text-[10px] text-slate-500 pt-1">
        <Info className="w-3 h-3 text-slate-600 shrink-0" />
        <span>YouTube player volume, speed, seek & state synced via official IFrame API.</span>
      </div>
    </div>
  );
}
