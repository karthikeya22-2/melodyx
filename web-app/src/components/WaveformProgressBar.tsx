import React, { useMemo, useRef, useState } from 'react';

interface WaveformProps {
  progress: number;
  duration: number;
  onSeek: (seconds: number) => void;
  trackId?: string;
  barCount?: number;
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
  barCount = 52
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [hoverPosition, setHoverPosition] = useState<number | null>(null);

  // Generate a consistent, organic waveform amplitude pattern per track
  const bars = useMemo(() => {
    let seed = 0;
    for (let i = 0; i < trackId.length; i++) {
      seed = (seed * 31 + trackId.charCodeAt(i)) % 100000;
    }

    const heights: number[] = [];
    for (let i = 0; i < barCount; i++) {
      // Natural music structure curve: intro -> build -> chorus -> bridge -> outro
      const section = i / barCount;
      const wave1 = Math.sin(section * Math.PI * 3);
      const wave2 = Math.cos(section * Math.PI * 7);
      seed = (seed * 9301 + 49297) % 233280;
      const pseudoRandom = seed / 233280;
      
      const heightPercent = Math.min(
        100,
        Math.max(18, Math.round(35 + wave1 * 25 + wave2 * 15 + pseudoRandom * 25))
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
    <div className="w-full flex items-center space-x-3 select-none">
      {/* Current Time */}
      <span className="text-[11px] font-mono text-neutral-400 w-10 text-right shrink-0">
        {formatTime(progress)}
      </span>

      {/* Waveform Canvas Container */}
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
        className="relative flex-1 h-8 flex items-center justify-between cursor-pointer group py-1"
        title="Seek via waveform"
      >
        {/* Vertical Waveform Bars */}
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
                      ? 'bg-[#E50914]'
                      : 'bg-[#333333] group-hover:bg-[#444444]'
                  } ${isCurrent ? 'ring-1 ring-white/60 brightness-125' : ''}`}
                />
              </div>
            );
          })}
        </div>

        {/* Hover Time Tooltip */}
        {hoverPosition !== null && (
          <div
            className="absolute -top-7 transform -translate-x-1/2 bg-[#1A1A1A] text-white text-[10px] px-2 py-0.5 rounded border border-neutral-700 pointer-events-none shadow-lg z-20 font-mono"
            style={{
              left: `${(hoverPosition / duration) * 100}%`
            }}
          >
            {formatTime(hoverPosition)}
          </div>
        )}
      </div>

      {/* Total Duration */}
      <span className="text-[11px] font-mono text-neutral-400 w-10 text-left shrink-0">
        {formatTime(duration)}
      </span>
    </div>
  );
};
