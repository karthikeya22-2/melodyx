import React, { useEffect, useState, useRef } from 'react';
import { X, Mic2 } from 'lucide-react';
import { usePlayerStore } from '../store/usePlayerStore';
import { api } from '../services/api';
import { SyncedLyrics } from '../types';

export const LyricsModal: React.FC = () => {
  const { currentTrack, isLyricsOpen, toggleLyrics, progress, seek } = usePlayerStore();
  const [lyrics, setLyrics] = useState<SyncedLyrics | null>(null);
  const activeLineRef = useRef<HTMLParagraphElement>(null);

  useEffect(() => {
    if (currentTrack) {
      api.getLyrics(currentTrack).then(setLyrics);
    }
  }, [currentTrack]);

  useEffect(() => {
    if (activeLineRef.current) {
      activeLineRef.current.scrollIntoView({
        behavior: 'smooth',
        block: 'center'
      });
    }
  }, [progress]);

  if (!isLyricsOpen || !currentTrack) return null;

  let activeIndex = -1;
  if (lyrics && lyrics.lines) {
    for (let i = 0; i < lyrics.lines.length; i++) {
      if (progress >= lyrics.lines[i].time) {
        activeIndex = i;
      } else {
        break;
      }
    }
  }

  return (
    <div className="fixed inset-0 z-50 bg-[#0A0A0C]/95 backdrop-blur-xl flex flex-col p-8 select-none">
      {/* Top Header */}
      <div className="flex items-center justify-between pb-6 max-w-4xl mx-auto w-full border-b border-white/10">
        <div className="flex items-center space-x-4">
          <img
            src={currentTrack.artwork}
            alt={currentTrack.title}
            className="w-14 h-14 rounded-xl shadow-xl object-cover ring-1 ring-white/10"
          />
          <div>
            <h2 className="text-xl font-extrabold text-white">{currentTrack.title}</h2>
            <p className="text-sm text-[#94A3B8]">{currentTrack.artist}</p>
          </div>
        </div>

        <button
          onClick={toggleLyrics}
          className="p-2.5 rounded-full bg-[#131316] hover:bg-[#1A1A20] text-white border border-white/10 transition-colors"
        >
          <X className="w-6 h-6" />
        </button>
      </div>

      {/* Lyrics Scroll Body */}
      <div className="flex-1 overflow-y-auto max-w-3xl mx-auto w-full py-12 space-y-8 text-center">
        {lyrics && lyrics.lines && lyrics.lines.length > 0 ? (
          lyrics.lines.map((line, idx) => {
            const isActive = idx === activeIndex;
            return (
              <p
                key={idx}
                ref={isActive ? activeLineRef : null}
                onClick={() => seek(line.time)}
                className={`text-2xl sm:text-3xl font-extrabold transition-all cursor-pointer ${
                  isActive
                    ? 'text-white scale-105 drop-shadow-[0_0_12px_rgba(255,255,255,0.6)] font-black'
                    : 'text-[#4D4D4D] hover:text-[#94A3B8]'
                }`}
              >
                {line.text}
              </p>
            );
          })
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-[#757575] space-y-3">
            <Mic2 className="w-12 h-12 stroke-1 text-[#4D4D4D]" />
            <p className="text-base font-semibold text-white">Lyrics not available for this song</p>
          </div>
        )}
      </div>
    </div>
  );
};
