import React, { useEffect, useRef } from 'react';
import { Activity, Radio } from 'lucide-react';
import { getAnalyser } from '../utils/audioEngine';

export default function Visualizer({ isDeckAPlaying, isDeckBPlaying, masterBpm = 128 }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    let animationFrameId;

    let analyser = null;
    try {
      analyser = getAnalyser();
    } catch (e) {
      console.warn("Analyser access error:", e);
    }

    const bufferLength = analyser ? analyser.frequencyBinCount : 64;
    const dataArray = new Uint8Array(bufferLength);

    let phase = 0;

    const render = () => {
      animationFrameId = requestAnimationFrame(render);

      const width = canvas.width;
      const height = canvas.height;

      ctx.clearRect(0, 0, width, height);

      // Fetch live audio data from Web Audio API analyser (Sound FX & Drums)
      if (analyser) {
        try {
          analyser.getByteFrequencyData(dataArray);
        } catch (err) {
          // ignore
        }
      }

      // Check overall active state
      const isAnyDeckActive = isDeckAPlaying || isDeckBPlaying;

      const barCount = 48;
      const barWidth = Math.max(2, (width / barCount) - 2);

      phase += (masterBpm / 60) * 0.05;

      for (let i = 0; i < barCount; i++) {
        let barHeight = 0;

        if (analyser && dataArray[i] > 10) {
          // Real synthesized audio from Web Audio API
          barHeight = (dataArray[i] / 255) * height * 0.85;
        } else if (isAnyDeckActive) {
          // Rhythmic DJ visualizer pulse when decks are playing
          const sinVal = Math.sin(phase + i * 0.2);
          const cosVal = Math.cos(phase * 1.5 + i * 0.1);
          const heightMultiplier = Math.abs(sinVal * cosVal) * 0.7 + 0.15;
          barHeight = heightMultiplier * height * 0.75;
        } else {
          // Idle state subtle pulse
          barHeight = Math.sin(phase + i * 0.3) * 4 + 6;
        }

        const x = i * (barWidth + 2);
        const y = height - barHeight;

        // Gradient color from cyan to purple to pink
        const gradient = ctx.createLinearGradient(0, height, 0, 0);
        gradient.addColorStop(0, '#06b6d4'); // cyan
        gradient.addColorStop(0.5, '#a855f7'); // purple
        gradient.addColorStop(1, '#ec4899'); // pink

        ctx.fillStyle = gradient;
        ctx.shadowBlur = barHeight > 20 ? 10 : 0;
        ctx.shadowColor = '#a855f7';

        // Draw bar safely
        ctx.beginPath();
        if (typeof ctx.roundRect === 'function') {
          try {
            ctx.roundRect(x, y, barWidth, barHeight, 3);
          } catch (e) {
            ctx.rect(x, y, barWidth, barHeight);
          }
        } else {
          ctx.rect(x, y, barWidth, barHeight);
        }
        ctx.fill();
      }
    };

    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, [isDeckAPlaying, isDeckBPlaying, masterBpm]);

  return (
    <div className="glass-panel rounded-2xl p-4 border border-slate-800 shadow-xl flex flex-col gap-3">
      <div className="flex items-center justify-between border-b border-slate-800 pb-2">
        <div className="flex items-center gap-2">
          <Activity className="w-5 h-5 text-cyan-400" />
          <h3 className="font-orbitron font-extrabold text-sm text-slate-200">
            AUDIO SPECTRUM VISUALIZER
          </h3>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping"></span>
          <span className="text-[10px] font-mono text-cyan-400">REALTIME SPECTRUM</span>
        </div>
      </div>

      <div className="w-full bg-neutral-950/80 rounded-xl border border-slate-800/80 p-2 overflow-hidden">
        <canvas
          ref={canvasRef}
          width={800}
          height={100}
          className="w-full h-24 block"
        />
      </div>
    </div>
  );
}
