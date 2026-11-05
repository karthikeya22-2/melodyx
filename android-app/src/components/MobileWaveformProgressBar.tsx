import React, { useMemo, useRef } from 'react';

interface MobileWaveformProps {
  progress: number;
  duration: number;
  onSeek: (seconds: number) => void;
  trackId?: string;
  barCount?: number;
  isPlaying?: boolean;
}

function formatTime(seconds: number): string {
  if (isNaN(seconds) || seconds < 0) return '0:00';
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
}

export const MobileWaveformProgressBar: React.FC<MobileWaveformProps> = ({
  progress,
  duration,
  onSeek,
  trackId = 'default',
  barCount = 42,
  isPlaying = false
}) => {
  const containerRef = useRef<HTMLDivElement>(null);

  const bars = useMemo(() => {
    let seed = 0;
    for (let i = 0; i < trackId.length; i++) {
      seed = (seed * 31 + trackId.charCodeAt(i)) % 100000;
    }

    const heights: number[] = [];
    for (let i = 0; i < barCount; i++) {
      const section = i / barCount;
      const wave1 = Math.sin(section * Math.PI * 3);
      const wave2 = Math.cos(section * Math.PI * 6);
      seed = (seed * 9301 + 49297) % 233280;
      const pseudoRandom = seed / 233280;

      const heightPercent = Math.min(
        100,
        Math.max(18, Math.round(30 + wave1 * 25 + wave2 * 16 + pseudoRandom * 25))
      );
      heights.push(heightPercent);
    }
    return heights;
  }, [trackId, barCount]);

  const handleTouchSeek = (clientX: number) => {
    if (!containerRef.current || duration <= 0) return;
    const rect = containerRef.current.getBoundingClientRect();
    const touchX = Math.max(0, Math.min(clientX - rect.left, rect.width));
    const targetSeconds = (touchX / rect.width) * duration;
    onSeek(targetSeconds);
  };

  const playRatio = duration > 0 ? Math.min(1, Math.max(0, progress / duration)) : 0;
  const activeBarIndex = Math.floor(playRatio * barCount);

  return (
    <div className="w-full select-none space-y-1.5">
      {/* Waveform Bars Scrubber */}
      <div
        ref={containerRef}
        onClick={e => handleTouchSeek(e.clientX)}
        onTouchStart={e => handleTouchSeek(e.touches[0].clientX)}
        onTouchMove={e => handleTouchSeek(e.touches[0].clientX)}
        className="w-full h-10 flex items-center justify-between gap-[2.5px] py-1 cursor-pointer"
      >
        {bars.map((height, idx) => {
          const isPlayed = idx <= activeBarIndex;
          const isCurrent = idx === activeBarIndex;

          return (
            <div
              key={idx}
              className="flex-1 flex items-center justify-center h-full"
            >
              <div
                style={{ height: `${height}%` }}
                className={`w-full rounded-full transition-all duration-75 ${
                  isPlayed
                    ? 'bg-gradient-to-t from-slate-300 to-white'
                    : 'bg-white/10'
                } ${isCurrent ? 'ring-1 ring-white shadow-[0_0_8px_rgba(255,255,255,0.8)]' : ''} ${
                  isPlayed && isPlaying ? 'mobile-waveform-active' : ''
                }`}
              />
            </div>
          );
        })}
      </div>

      {/* Time Display */}
      <div className="flex justify-between text-[11px] font-mono text-[#94A3B8] px-0.5">
        <span>{formatTime(progress)}</span>
        <span>{formatTime(duration)}</span>
      </div>
    </div>
  );
};
