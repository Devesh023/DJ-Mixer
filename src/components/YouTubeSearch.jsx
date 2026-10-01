import React, { useState, useEffect } from 'react';
import { Search, Youtube, Key, Check, Plus, RefreshCw, AlertTriangle, Play, X, SlidersHorizontal } from 'lucide-react';
import { searchYouTubeAPI } from '../utils/youtube';

export default function YouTubeSearch({ onLoadToDeckA, onLoadToDeckB, onAddToQueue }) {
  const [query, setQuery] = useState('');
  
  // API Key priority: 1. Local storage, 2. Environment variable
  const [apiKey, setApiKey] = useState(() => {
    return localStorage.getItem('yt_api_key') || import.meta.env.VITE_YOUTUBE_API_KEY || '';
  });

  const [inputKey, setInputKey] = useState(apiKey);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  const [results, setResults] = useState([]);
  const [nextPageToken, setNextPageToken] = useState('');
  const [totalResults, setTotalResults] = useState(0);
  const [currentSearchTerm, setCurrentSearchTerm] = useState('');

  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [errorInfo, setErrorInfo] = useState(null);

  // Search History from localStorage (no demo data)
  const [history, setHistory] = useState(() => {
    try {
      const saved = localStorage.getItem('yt_search_history');
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      return [];
    }
  });

  // Sync API key if updated externally or saved
  useEffect(() => {
    const keyToUse = localStorage.getItem('yt_api_key') || import.meta.env.VITE_YOUTUBE_API_KEY || '';
    setApiKey(keyToUse);
  }, [isModalOpen]);

  const handleSaveKey = () => {
    const trimmed = inputKey.trim();
    if (trimmed) {
      localStorage.setItem('yt_api_key', trimmed);
      setApiKey(trimmed);
    } else {
      localStorage.removeItem('yt_api_key');
      setApiKey(import.meta.env.VITE_YOUTUBE_API_KEY || '');
    }
    setSavedSuccess(true);
    setTimeout(() => {
      setSavedSuccess(false);
      setIsModalOpen(false);
    }, 1200);
  };

  const handleSearch = async (searchTermToUse, token = '', append = false) => {
    const term = searchTermToUse !== undefined ? searchTermToUse : query;
    if (!term || !term.trim()) return;

    const activeKey = localStorage.getItem('yt_api_key') || import.meta.env.VITE_YOUTUBE_API_KEY || apiKey;

    if (!activeKey || !activeKey.trim()) {
      setErrorInfo({
        title: '⚠️ YouTube API Key Missing',
        message: 'YouTube API key is not configured. Please add VITE_YOUTUBE_API_KEY in .env or click "Set YouTube API Key" to save your key.'
      });
      setResults([]);
      return;
    }

    const trimmedTerm = term.trim();
    if (append) {
      setIsLoadingMore(true);
    } else {
      setIsLoading(true);
      setErrorInfo(null);
    }

    // Save search history (max 10 items)
    if (!append) {
      const updatedHistory = [trimmedTerm, ...history.filter(h => h.toLowerCase() !== trimmedTerm.toLowerCase())].slice(0, 10);
      setHistory(updatedHistory);
      try {
        localStorage.setItem('yt_search_history', JSON.stringify(updatedHistory));
      } catch (e) {}
    }

    try {
      const data = await searchYouTubeAPI(trimmedTerm, activeKey, token);
      
      setCurrentSearchTerm(trimmedTerm);
      setNextPageToken(data.nextPageToken || '');
      setTotalResults(data.totalResults || 0);

      if (append) {
        setResults(prev => [...prev, ...data.items]);
      } else {
        setResults(data.items);
        if (data.items.length === 0) {
          setErrorInfo({
            title: 'No Results Found',
            message: `No YouTube videos found matching "${trimmedTerm}". Try a different search term.`
          });
        }
      }
    } catch (err) {
      console.error("YouTube Search error:", err);
      setErrorInfo({
        title: '⚠️ YouTube Search Error',
        message: err.message || 'Unable to fetch YouTube results.'
      });
      if (!append) setResults([]);
    } finally {
      setIsLoading(false);
      setIsLoadingMore(false);
    }
  };

  const handleLoadMore = () => {
    if (nextPageToken && currentSearchTerm) {
      handleSearch(currentSearchTerm, nextPageToken, true);
    }
  };

  const activeKeyPresent = Boolean(apiKey && apiKey.trim());

  return (
    <div className="glass-panel rounded-2xl p-4 border border-slate-800/80 shadow-xl flex flex-col gap-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-800 pb-3 gap-2">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-red-950/80 border border-red-500/40 text-red-400">
            <Youtube className="w-5 h-5" />
          </div>
          <div>
            <h2 className="font-orbitron font-extrabold text-sm text-slate-100 tracking-wider">
              OFFICIAL YOUTUBE DATA API V3 MUSIC BROWSER
            </h2>
            <p className="text-[11px] text-slate-400">
              Live YouTube queries with direct 1-click Deck A/B loading.
            </p>
          </div>
        </div>

        {/* API Key Status / Settings Trigger */}
        <button
          onClick={() => { setInputKey(apiKey); setIsModalOpen(true); }}
          className={`px-3 py-1.5 rounded-xl border text-xs font-bold flex items-center gap-1.5 transition-all self-start sm:self-auto shadow ${
            activeKeyPresent
              ? 'bg-emerald-950/80 border-emerald-500/50 text-emerald-300 hover:bg-emerald-900/90'
              : 'bg-amber-950/90 border-amber-500/60 text-amber-300 animate-pulse'
          }`}
        >
          <Key className="w-3.5 h-3.5" />
          <span>{activeKeyPresent ? 'API KEY CONNECTED ✓' : 'Set YouTube API Key'}</span>
        </button>
      </div>

      {/* API Key Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-150">
          <div className="glass-panel w-full max-w-md rounded-2xl p-5 border border-purple-500/40 shadow-2xl flex flex-col gap-4 relative">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2 text-slate-100 font-orbitron font-extrabold text-sm">
                <Key className="w-4 h-4 text-purple-400" />
                <span>YouTube Data API Key Settings</span>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="p-1 text-slate-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">
              Enter your Google Cloud <b>YouTube Data API v3 Key</b>. Priority is given to your saved local key over the default <code>.env</code> file.
            </p>

            <div className="flex flex-col gap-1.5">
              <label className="text-[11px] font-mono text-slate-400">API Key String:</label>
              <input
                type="password"
                placeholder="AIzaSy..."
                value={inputKey}
                onChange={(e) => setInputKey(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-100 font-mono focus:outline-none focus:border-purple-500"
              />
            </div>

            {savedSuccess && (
              <div className="p-2 rounded-lg bg-emerald-950 border border-emerald-500/40 text-emerald-300 text-xs font-semibold flex items-center gap-1.5">
                <Check className="w-4 h-4" /> API Key saved successfully!
              </div>
            )}

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-800">
              <button
                onClick={() => setIsModalOpen(false)}
                className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 text-xs font-semibold"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveKey}
                className="px-5 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold shadow-lg"
              >
                Save Key
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main Search Input Form */}
      <form onSubmit={(e) => { e.preventDefault(); handleSearch(); }} className="flex gap-2">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
          <input
            type="text"
            placeholder="Search YouTube music, Garba, EDM, DJ Remixes..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full bg-slate-900/90 border border-slate-800 focus:border-red-500 rounded-xl pl-10 pr-4 py-2.5 text-xs text-slate-100 placeholder-slate-500 focus:outline-none transition-all shadow-inner"
          />
        </div>
        <button
          type="submit"
          disabled={isLoading}
          className="px-6 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-white font-orbitron font-bold text-xs flex items-center gap-2 shadow-lg shadow-red-600/20 transition-all active:scale-95 shrink-0"
        >
          {isLoading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
          <span>SEARCH</span>
        </button>
      </form>

      {/* Search History Tags */}
      {history.length > 0 && (
        <div className="flex items-center gap-2 flex-wrap text-xs">
          <span className="text-[11px] font-mono text-slate-400 font-bold shrink-0">RECENT SEARCHES:</span>
          {history.map((term, idx) => (
            <button
              key={idx}
              onClick={() => { setQuery(term); handleSearch(term); }}
              className="px-2.5 py-1 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 hover:text-cyan-400 text-[11px] font-medium transition-colors"
            >
              {term}
            </button>
          ))}
        </div>
      )}

      {/* Error / Warning Banner */}
      {errorInfo && (
        <div className="p-3.5 rounded-xl bg-amber-950/80 border border-amber-500/50 text-amber-200 text-xs flex flex-col gap-1 shadow-lg">
          <div className="flex items-center gap-2 font-bold text-amber-300 text-sm">
            <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
            <span>{errorInfo.title}</span>
          </div>
          <p className="text-slate-300">{errorInfo.message}</p>
        </div>
      )}

      {/* Result Count Header */}
      {currentSearchTerm && results.length > 0 && !isLoading && (
        <div className="flex items-center justify-between border-b border-slate-800 pb-2">
          <span className="font-orbitron font-bold text-xs text-cyan-400 tracking-wider">
            {results.length} RESULTS FOR "{currentSearchTerm.toUpperCase()}"
          </span>
          <span className="text-[10px] font-mono text-slate-400">
            TOTAL MATCHES: {totalResults.toLocaleString()}
          </span>
        </div>
      )}

      {/* Results Grid (3-4 cols desktop, 1 col mobile) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
        {results.map((video, idx) => (
          <div
            key={`${video.videoId}-${idx}`}
            className="bg-slate-900/80 hover:bg-slate-800/90 border border-slate-800 hover:border-slate-700 rounded-xl p-2.5 flex flex-col justify-between gap-2.5 transition-all shadow-md group"
          >
            {/* Real YouTube Thumbnail */}
            <div className="relative aspect-video w-full rounded-lg overflow-hidden bg-slate-950 border border-slate-800">
              <img
                src={video.thumbnail}
                alt={video.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                onError={(e) => { e.target.src = `https://i.ytimg.com/vi/${video.videoId}/hqdefault.jpg`; }}
              />
              <span className="absolute bottom-1.5 right-1.5 px-1.5 py-0.5 text-[10px] font-mono font-bold bg-black/85 text-white rounded">
                {video.duration}
              </span>
            </div>

            {/* Song Metadata */}
            <div className="flex flex-col min-w-0">
              <h4 className="font-semibold text-xs text-slate-100 line-clamp-2 leading-snug" title={video.title}>
                {video.title}
              </h4>
              <span className="text-[11px] font-mono text-slate-400 truncate mt-1">
                {video.channel}
              </span>
            </div>

            {/* Load Buttons */}
            <div className="grid grid-cols-3 gap-1.5 pt-1 border-t border-slate-800/60">
              <button
                onClick={() => onLoadToDeckA(video)}
                className="py-1.5 rounded-lg bg-cyan-950 hover:bg-cyan-900 border border-cyan-500/40 text-cyan-300 font-orbitron font-black text-[10px] transition-all active:scale-95 flex items-center justify-center gap-0.5"
                title="Load into Deck A"
              >
                <Play className="w-3 h-3 fill-cyan-300" />
                LOAD A
              </button>

              <button
                onClick={() => onLoadToDeckB(video)}
                className="py-1.5 rounded-lg bg-purple-950 hover:bg-purple-900 border border-purple-500/40 text-purple-300 font-orbitron font-black text-[10px] transition-all active:scale-95 flex items-center justify-center gap-0.5"
                title="Load into Deck B"
              >
                <Play className="w-3 h-3 fill-purple-300" />
                LOAD B
              </button>

              <button
                onClick={() => onAddToQueue && onAddToQueue(video)}
                className="py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 font-bold text-[10px] transition-all active:scale-95 flex items-center justify-center gap-0.5"
                title="Add to DJ Queue"
              >
                <Plus className="w-3.5 h-3.5" />
                QUEUE
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Pagination Load More Button */}
      {nextPageToken && !isLoading && (
        <div className="flex justify-center pt-2">
          <button
            onClick={handleLoadMore}
            disabled={isLoadingMore}
            className="px-6 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-200 font-orbitron font-bold text-xs flex items-center gap-2 transition-all shadow active:scale-95"
          >
            {isLoadingMore ? <RefreshCw className="w-4 h-4 animate-spin text-cyan-400" /> : null}
            <span>LOAD MORE RESULTS</span>
          </button>
        </div>
      )}
    </div>
  );
}
