// YouTube API Utilities for DJ Mixer Pro

// Safely extract 11-character YouTube video ID from various URL patterns
export function extractVideoId(urlOrId) {
  if (!urlOrId || typeof urlOrId !== 'string') return null;

  const trimmed = urlOrId.trim();

  // If already an 11-character ID (alphanumeric, -, _)
  if (/^[a-zA-Z0-9_-]{11}$/.test(trimmed)) {
    return trimmed;
  }

  // Regular expressions for YouTube URLs
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/|youtube\.com\/shorts\/)([a-zA-Z0-9_-]{11})/,
    /youtube\.com\/watch\?.*&v=([a-zA-Z0-9_-]{11})/,
    /youtube\.com\/v\/([a-zA-Z0-9_-]{11})/
  ];

  for (const pattern of patterns) {
    const match = trimmed.match(pattern);
    if (match && match[1]) {
      return match[1];
    }
  }

  return null;
}

// Load YouTube IFrame API script dynamically once with error handling
let ytApiPromise = null;

export function loadYouTubeIframeAPI() {
  if (ytApiPromise) return ytApiPromise;

  ytApiPromise = new Promise((resolve) => {
    try {
      if (window.YT && window.YT.Player) {
        resolve(window.YT);
        return;
      }

      const previousCallback = window.onYouTubeIframeAPIReady;
      window.onYouTubeIframeAPIReady = () => {
        try {
          if (previousCallback) previousCallback();
        } catch (e) {
          console.warn("Previous YouTube callback error:", e);
        }
        resolve(window.YT || null);
      };

      const tag = document.createElement('script');
      tag.src = 'https://www.youtube.com/iframe_api';
      tag.onerror = () => {
        console.warn("YouTube IFrame script failed to load.");
        resolve(null);
      };

      const firstScriptTag = document.getElementsByTagName('script')[0];
      if (firstScriptTag && firstScriptTag.parentNode) {
        firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
      } else if (document.head) {
        document.head.appendChild(tag);
      } else {
        resolve(null);
      }
    } catch (err) {
      console.warn("YouTube API script injection error:", err);
      resolve(null);
    }
  });

  return ytApiPromise;
}

// Format time helper (seconds -> mm:ss)
export function formatTime(seconds) {
  if (isNaN(seconds) || seconds < 0) return '00:00';
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

// Format ISO 8601 YouTube duration (e.g. PT4M13S -> 04:13)
export function parseISO8601Duration(durationStr) {
  if (!durationStr) return '00:00';
  const match = durationStr.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
  if (!match) return '00:00';
  const hours = parseInt(match[1] || 0, 10);
  const mins = parseInt(match[2] || 0, 10);
  const secs = parseInt(match[3] || 0, 10);

  if (hours > 0) {
    return `${hours}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

// Helper to decode HTML entities in YouTube titles
export function decodeHTMLEntities(text) {
  if (!text) return '';
  const textarea = document.createElement('textarea');
  textarea.innerHTML = text;
  return textarea.value;
}

// Official YouTube Data API v3 Live Search
export async function searchYouTubeAPI(query, apiKey, pageToken = '') {
  if (!query || !query.trim()) return { items: [], nextPageToken: '', totalResults: 0 };
  if (!apiKey || !apiKey.trim()) {
    throw new Error("API_KEY_MISSING");
  }

  const cleanKey = apiKey.trim();
  let searchUrl = `https://www.googleapis.com/youtube/v3/search?part=snippet&maxResults=24&q=${encodeURIComponent(query.trim())}&type=video&key=${cleanKey}`;
  if (pageToken) {
    searchUrl += `&pageToken=${pageToken}`;
  }

  let res;
  try {
    res = await fetch(searchUrl);
  } catch (netErr) {
    throw new Error("Network error: Unable to connect to YouTube Data API servers.");
  }

  if (!res.ok) {
    const errData = await res.json().catch(() => ({}));
    const reason = errData.error?.errors?.[0]?.reason || errData.error?.message || '';

    if (res.status === 400) {
      throw new Error("Invalid YouTube API key. Please check your API key settings.");
    } else if (res.status === 403) {
      if (reason === 'quotaExceeded' || errData.error?.message?.includes('quota')) {
        throw new Error("YouTube Data API quota exceeded. Please check your Google Cloud project API quota.");
      }
      if (reason === 'accessNotConfigured' || errData.error?.message?.includes('disabled')) {
        throw new Error("YouTube Data API v3 is not enabled in your Google Cloud Console project.");
      }
      throw new Error(errData.error?.message || "YouTube API 403 Forbidden: Access restricted.");
    }
    throw new Error(errData.error?.message || `YouTube API error (${res.status})`);
  }

  const data = await res.json();
  if (!data.items || data.items.length === 0) {
    return { items: [], nextPageToken: '', totalResults: 0 };
  }

  const videoIds = data.items.map(item => item.id?.videoId).filter(Boolean).join(',');

  // Fetch video durations using contentDetails endpoint
  let durationMap = {};
  if (videoIds) {
    try {
      const detailsUrl = `https://www.googleapis.com/youtube/v3/videos?part=contentDetails&id=${videoIds}&key=${cleanKey}`;
      const dRes = await fetch(detailsUrl);
      if (dRes.ok) {
        const dData = await dRes.json();
        dData.items?.forEach(v => {
          durationMap[v.id] = parseISO8601Duration(v.contentDetails?.duration);
        });
      }
    } catch (e) {
      console.warn("Could not fetch video durations:", e);
    }
  }

  const items = data.items.map(item => {
    const vId = item.id?.videoId;
    const snippet = item.snippet || {};
    const thumbs = snippet.thumbnails || {};
    const thumbnailUrl = thumbs.high?.url || thumbs.medium?.url || thumbs.default?.url || `https://i.ytimg.com/vi/${vId}/hqdefault.jpg`;

    return {
      id: vId,
      videoId: vId,
      title: decodeHTMLEntities(snippet.title || 'Untitled Track'),
      channel: decodeHTMLEntities(snippet.channelTitle || 'YouTube Channel'),
      thumbnail: thumbnailUrl,
      duration: durationMap[vId] || '03:45',
      url: `https://www.youtube.com/watch?v=${vId}`
    };
  });

  return {
    items,
    nextPageToken: data.nextPageToken || '',
    totalResults: data.pageInfo?.totalResults || items.length
  };
}
