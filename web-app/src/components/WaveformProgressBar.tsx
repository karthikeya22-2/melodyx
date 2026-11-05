import React, { useMemo, useRef, useState } from 'react';

interface WaveformProps {
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

export const WaveformProgressBar: React.FC<WaveformProps> = ({
  progress,
  duration,
  onSeek,
  trackId = 'default',
  barCount = 64,
  isPlaying = false
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [hoverPosition, setHoverPosition] = useState<number | null>(null);

  // Generate consistent waveform pattern from trackId
  const bars = useMemo(() => {
    let seed = 0;
    for (let i = 0; i < trackId.length; i++) {
      seed = (seed * 31 + trackId.charCodeAt(i)) % 100000;
    }

    const heights: number[] = [];
    for (let i = 0; i < barCount; i++) {
      const section = i / barCount;
      const wave1 = Math.sin(section * Math.PI * 3);
      const wave2 = Math.cos(section * Math.PI * 7);
      seed = (seed * 9301 + 49297) % 233280;
      const pseudoRandom = seed / 233280;

      const heightPercent = Math.min(
        100,
        Math.max(16, Math.round(30 + wave1 * 28 + wave2 * 18 + pseudoRandom * 24))
      );
      heights.push(heightPercent);
    }
    return heights;
  }, [trackId, barCount]);

  const handleSeekFromEvent = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current || duration <= 0) return;
    const rect = containerRef.current.getBoundingClientRect();
    const clickX = Math.max(0, Math.min(e.clientX - rect.left, rect.width));
    const targetSeconds = (clickX / rect.width) * duration;
    onSeek(targetSeconds);
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current || duration <= 0) return;
    const rect = containerRef.current.getBoundingClientRect();
    const hoverX = Math.max(0, Math.min(e.clientX - rect.left, rect.width));
    setHoverPosition((hoverX / rect.width) * duration);

    if (isDragging) {
      handleSeekFromEvent(e);
    }
  };

  const playRatio = duration > 0 ? Math.min(1, Math.max(0, progress / duration)) : 0;
  const activeBarIndex = Math.floor(playRatio * barCount);

  return (
    <div className="w-full flex items-center space-x-2.5 select-none">
      {/* Current Time */}
      <span className="text-[11px] font-mono text-[#B3B3B3] w-10 text-right shrink-0">
        {formatTime(progress)}
      </span>

      {/* Waveform Scrubber */}
      <div
        ref={containerRef}
        onClick={handleSeekFromEvent}
        onMouseDown={e => {
          setIsDragging(true);
          handleSeekFromEvent(e);
        }}
        onMouseUp={() => setIsDragging(false)}
        onMouseLeave={() => {
          setIsDragging(false);
          setHoverPosition(null);
        }}
        onMouseMove={handleMouseMove}
        className="relative flex-1 h-7 flex items-center justify-between cursor-pointer group py-1"
        title="Seek via animated waveform"
      >
        {/* Bars */}
        <div className="w-full h-full flex items-center justify-between gap-[2px]">
          {bars.map((height, idx) => {
            const isPlayed = idx <= activeBarIndex;
            const isCurrent = idx === activeBarIndex;

            return (
              <div
                key={idx}
                className="flex-1 flex items-center justify-center h-full transition-all duration-75"
              >
                <div
                  style={{ height: `${height}%` }}
                  className={`w-full rounded-full transition-colors duration-100 ${
                    isPlayed
                      ? 'bg-gradient-to-t from-slate-300 to-white'
                      : 'bg-white/10 group-hover:bg-white/20'
                  } ${isCurrent ? 'ring-1 ring-white shadow-[0_0_8px_rgba(255,255,255,0.8)] brightness-125' : ''} ${
                    isPlayed && isPlaying ? 'waveform-bar-playing' : ''
                  }`}
                />
              </div>
            );
          })}
        </div>

        {/* Hover Time Tooltip */}
        {hoverPosition !== null && (
          <div
            className="absolute -top-7 transform -translate-x-1/2 bg-[#1E1E1E] text-white text-[10px] px-2 py-0.5 rounded border border-[#333333] pointer-events-none shadow-xl z-20 font-mono"
            style={{
              left: `${(hoverPosition / duration) * 100}%`
            }}
          >
            {formatTime(hoverPosition)}
          </div>
        )}
      </div>

      {/* Total Duration */}
      <span className="text-[11px] font-mono text-[#B3B3B3] w-10 text-left shrink-0">
        {formatTime(duration)}
      </span>
    </div>
  );
};
