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

  // Find currently active lyrics line index
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
    <div className="fixed inset-0 z-50 bg-[#121212]/95 backdrop-blur-2xl flex flex-col p-8 select-none">
      {/* Top Header */}
      <div className="flex items-center justify-between pb-6 max-w-4xl mx-auto w-full">
        <div className="flex items-center space-x-4">
          <img src={currentTrack.artwork} alt={currentTrack.title} className="w-14 h-14 rounded-lg shadow-xl" />
          <div>
            <h2 className="text-xl font-extrabold text-white">{currentTrack.title}</h2>
            <p className="text-sm text-neutral-400">{currentTrack.artist}</p>
          </div>
        </div>

        <button
          onClick={toggleLyrics}
          className="p-2.5 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
        >
          <X className="w-6 h-6" />
        </button>
      </div>

      {/* Lyrics Scroll Body */}
      <div className="flex-1 overflow-y-auto max-w-3xl mx-auto w-full py-12 space-y-8 text-center sm:text-left">
        {lyrics && lyrics.lines && lyrics.lines.length > 0 ? (
          lyrics.lines.map((line, idx) => {
            const isActive = idx === activeIndex;
            return (
              <p
                key={idx}
                ref={isActive ? activeLineRef : null}
                onClick={() => seek(line.time)}
                className={`text-2xl sm:text-4xl font-extrabold transition-all duration-300 cursor-pointer ${
                  isActive
                    ? 'text-[#1DB954] scale-105 opacity-100'
                    : 'text-white/40 hover:text-white/80 opacity-60'
                }`}
              >
                {line.text}
              </p>
            );
          })
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-neutral-500">
            <Mic2 className="w-12 h-12 stroke-1 mb-4 text-neutral-600" />
            <p className="text-xl font-bold">Synchronized Lyrics Unavailable</p>
            <p className="text-sm mt-1">Enjoy the music streaming in full high-definition</p>
          </div>
        )}
      </div>
    </div>
  );
};

