import React, { useState, useEffect } from 'react';
import { ListPlus, Trash2, Plus } from 'lucide-react';
import { extractVideoId } from '../utils/youtube';

export default function Queue({ onLoadToDeckA, onLoadToDeckB, newTrackFromSearch }) {
  const [queue, setQueue] = useState(() => {
    try {
      const saved = localStorage.getItem('dj_queue_tracks');
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      return [];
    }
  });

  const [newTitle, setNewTitle] = useState('');
  const [newUrl, setNewUrl] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  // Persist queue to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('dj_queue_tracks', JSON.stringify(queue));
    } catch (e) {}
  }, [queue]);

  // Handle incoming track from search component
  useEffect(() => {
    if (newTrackFromSearch) {
      const exists = queue.some(t => t.videoId === newTrackFromSearch.videoId);
      if (!exists) {
        setQueue(prev => [newTrackFromSearch, ...prev]);
      }
    }
  }, [newTrackFromSearch]);

  const handleAddTrack = (e) => {
    e.preventDefault();
    setErrorMsg('');

    if (!newUrl.trim()) return;

    const extractedId = extractVideoId(newUrl);
    if (!extractedId) {
      setErrorMsg('Invalid YouTube URL or Video ID.');
      return;
    }

    const newItem = {
      id: Date.now().toString(),
      title: newTitle.trim() || `YouTube Track (${extractedId})`,
      url: `https://www.youtube.com/watch?v=${extractedId}`,
      videoId: extractedId,
      channel: 'Direct URL Load',
      thumbnail: `https://i.ytimg.com/vi/${extractedId}/hqdefault.jpg`,
      duration: '03:45'
    };

    setQueue([newItem, ...queue]);
    setNewTitle('');
    setNewUrl('');
  };

  const handleRemoveTrack = (id) => {
    setQueue(queue.filter(t => (t.id || t.videoId) !== id));
  };

  return (
    <div className="glass-panel rounded-2xl p-4 border border-slate-800/80 shadow-xl flex flex-col gap-3">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
        <div className="flex items-center gap-2">
          <ListPlus className="w-5 h-5 text-purple-400" />
          <h3 className="font-orbitron font-extrabold text-sm text-slate-100 tracking-wider">
            DJ MUSIC QUEUE ({queue.length} TRACKS)
          </h3>
        </div>
        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-purple-950/80 border border-purple-500/40 text-purple-300 font-bold">
          SAVED LOCALLY
        </span>
      </div>

      {/* Manual Quick URL Add Form */}
      <form onSubmit={handleAddTrack} className="grid grid-cols-1 sm:grid-cols-5 gap-2 bg-slate-900/70 p-2.5 rounded-xl border border-slate-800">
        <input
          type="text"
          placeholder="Track Title (Optional)"
          value={newTitle}
          onChange={(e) => setNewTitle(e.target.value)}
          className="sm:col-span-2 bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-purple-500"
        />
        <input
          type="text"
          placeholder="Paste YouTube Link or Video ID..."
          value={newUrl}
          onChange={(e) => setNewUrl(e.target.value)}
          className="sm:col-span-2 bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-purple-500"
        />
        <button
          type="submit"
          className="py-1.5 px-3 bg-purple-600 hover:bg-purple-500 text-white rounded-lg font-bold text-xs flex items-center justify-center gap-1 shadow transition-all active:scale-95"
        >
          <Plus className="w-4 h-4" />
          Add Track
        </button>
      </form>

      {errorMsg && (
        <p className="text-red-400 text-xs px-1">{errorMsg}</p>
      )}

      {/* Queue Items Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2.5 max-h-64 overflow-y-auto pr-1">
        {queue.length === 0 ? (
          <div className="col-span-full text-center py-6 text-slate-500 text-xs font-mono">
            Queue is empty. Click "+ QUEUE" on any YouTube search result above to add tracks!
          </div>
        ) : (
          queue.map((track) => {
            const trackKey = track.id || track.videoId;
            return (
              <div
                key={trackKey}
                className="flex items-center justify-between gap-2.5 bg-slate-900/80 hover:bg-slate-800/90 border border-slate-800 p-2 rounded-xl transition-all group"
              >
                {/* Thumbnail */}
                <img
                  src={track.thumbnail || `https://i.ytimg.com/vi/${track.videoId}/hqdefault.jpg`}
                  alt={track.title}
                  className="w-12 h-9 object-cover rounded-lg shrink-0 border border-slate-800"
                  onError={(e) => { e.target.src = `https://i.ytimg.com/vi/${track.videoId}/hqdefault.jpg`; }}
                />

                <div className="min-w-0 flex-1">
                  <h4 className="text-xs font-semibold text-slate-100 truncate" title={track.title}>
                    {track.title}
                  </h4>
                  <span className="text-[10px] font-mono text-slate-400 truncate block">
                    {track.channel || track.artist || 'YouTube'} • {track.duration || '03:45'}
                  </span>
                </div>

                {/* Actions: LOAD A, LOAD B, REMOVE */}
                <div className="flex items-center gap-1 shrink-0">
                  <button
                    onClick={() => onLoadToDeckA(track)}
                    className="px-2 py-1 rounded-md bg-cyan-950 hover:bg-cyan-900 border border-cyan-500/40 text-cyan-300 font-orbitron font-black text-[10px] transition-colors"
                    title="Load into Deck A"
                  >
                    LOAD A
                  </button>

                  <button
                    onClick={() => onLoadToDeckB(track)}
                    className="px-2 py-1 rounded-md bg-purple-950 hover:bg-purple-900 border border-purple-500/40 text-purple-300 font-orbitron font-black text-[10px] transition-colors"
                    title="Load into Deck B"
                  >
                    LOAD B
                  </button>

                  <button
                    onClick={() => handleRemoveTrack(trackKey)}
                    className="p-1 rounded-md text-slate-500 hover:text-red-400 hover:bg-red-950/40 transition-colors"
                    title="Remove from queue"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
