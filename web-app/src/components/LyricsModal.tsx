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
    <div className="fixed inset-0 z-50 bg-[#090909]/95 backdrop-blur-md flex flex-col p-8 select-none">
      {/* Top Header */}
      <div className="flex items-center justify-between pb-6 max-w-3xl mx-auto w-full border-b border-[#222222]">
        <div className="flex items-center space-x-3">
          <img src={currentTrack.artwork} alt={currentTrack.title} className="w-12 h-12 rounded shadow" />
          <div>
            <h2 className="text-base font-bold text-white">{currentTrack.title}</h2>
            <p className="text-xs text-neutral-400">{currentTrack.artist}</p>
          </div>
        </div>

        <button
          onClick={toggleLyrics}
          className="p-2 rounded bg-[#1D1D1D] hover:bg-[#2A2A2A] text-white transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Lyrics Scroll Body */}
      <div className="flex-1 overflow-y-auto max-w-2xl mx-auto w-full py-10 space-y-6 text-center">
        {lyrics && lyrics.lines && lyrics.lines.length > 0 ? (
          lyrics.lines.map((line, idx) => {
            const isActive = idx === activeIndex;
            return (
              <p
                key={idx}
                ref={isActive ? activeLineRef : null}
                onClick={() => seek(line.time)}
                className={`text-xl sm:text-2xl font-bold transition-all cursor-pointer ${
                  isActive
                    ? 'text-[#E50914] scale-105'
                    : 'text-neutral-500 hover:text-neutral-300'
                }`}
              >
                {line.text}
              </p>
            );
          })
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-neutral-500">
            <Mic2 className="w-10 h-10 stroke-1 mb-3 text-neutral-600" />
            <p className="text-sm font-semibold">Lyrics not available for this track</p>
          </div>
        )}
      </div>
    </div>
  );
};
