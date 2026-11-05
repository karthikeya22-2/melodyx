import React from 'react';

export const AppLoadingScreen: React.FC = () => {
  return (
    <div className="w-full h-full min-h-screen bg-[#0A0A0C] flex flex-col items-center justify-center select-none relative overflow-hidden">
      {/* Centered Logo with Ambient Silver Chrome Glow */}
      <div className="relative flex flex-col items-center">
        {/* Soft Ambient Silver Halo behind the logo */}
        <div className="absolute -top-6 w-52 h-52 rounded-full bg-slate-300/15 blur-3xl -z-10 animate-pulse" />

        {/* 3D Metallic Squircle Logo */}
        <div className="w-28 h-28 rounded-2xl overflow-hidden shadow-2xl shadow-black ring-1 ring-white/15 mb-4 animate-pulse">
          <img
            src="/logo.png"
            alt="Melodyx Logo"
            className="w-full h-full object-cover"
          />
        </div>

        {/* Brand Name: Shiny Silver Metallic */}
        <h1 className="text-2xl font-extrabold tracking-tight bg-gradient-to-r from-white via-slate-200 to-slate-400 bg-clip-text text-transparent mb-4 drop-shadow-sm">
          Melodyx
        </h1>

        {/* Shiny Silver Soundwave Visualizer Loading Bars */}
        <div className="flex items-center space-x-1.5 h-6">
          <span className="w-1 bg-gradient-to-t from-slate-400 to-white rounded-full animate-bounce [animation-delay:-0.4s] h-3 shadow-[0_0_8px_rgba(255,255,255,0.3)]" />
          <span className="w-1 bg-gradient-to-t from-slate-400 to-white rounded-full animate-bounce [animation-delay:-0.2s] h-5 shadow-[0_0_8px_rgba(255,255,255,0.4)]" />
          <span className="w-1 bg-gradient-to-t from-slate-400 to-white rounded-full animate-bounce [animation-delay:0s] h-6 shadow-[0_0_8px_rgba(255,255,255,0.5)]" />
          <span className="w-1 bg-gradient-to-t from-slate-400 to-white rounded-full animate-bounce [animation-delay:-0.2s] h-4 shadow-[0_0_8px_rgba(255,255,255,0.4)]" />
          <span className="w-1 bg-gradient-to-t from-slate-400 to-white rounded-full animate-bounce [animation-delay:-0.4s] h-2.5 shadow-[0_0_8px_rgba(255,255,255,0.3)]" />
        </div>
      </div>
    </div>
  );
};

