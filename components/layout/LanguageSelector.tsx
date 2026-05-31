'use client';

import React from 'react';
import { useLanguage, Language } from '@/lib/language';

export function LanguageSelector() {
  const { language, setLanguage } = useLanguage();

  const options: { value: Language; label: string; desc: string; flag: string }[] = [
    { value: 'es', label: 'Castellano', desc: 'Español estándar', flag: '🇧🇴' },
    { value: 'chq', label: 'Bésiro', desc: 'Chiquitano (Santa Cruz)', flag: '🏹' },
    { value: 'gn', label: 'Guaraní', desc: 'Isoso / Cordillera', flag: '🍃' },
  ];

  return (
    <div className="bg-emerald-950/20 border border-emerald-500/10 rounded-xl p-3">
      <p className="text-[9px] font-mono text-emerald-500/60 uppercase tracking-widest mb-2 flex items-center justify-between">
        <span>Idiomas del Oriente</span>
        <span className="animate-pulse h-1.5 w-1.5 rounded-full bg-emerald-500"></span>
      </p>
      <div className="space-y-1.5">
        {options.map((opt) => (
          <button
            key={opt.value}
            onClick={() => setLanguage(opt.value)}
            className={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs transition-all duration-300 flex items-center justify-between ${
              language === opt.value
                ? 'bg-emerald-500 text-white font-bold shadow-lg shadow-emerald-500/20'
                : 'text-slate-400 hover:bg-white/5 hover:text-white'
            }`}
          >
            <div className="flex items-center gap-2">
              <span className="text-sm shrink-0">{opt.flag}</span>
              <div>
                <p className="leading-none text-[12px]">{opt.label}</p>
                <p className={`text-[8px] mt-0.5 ${language === opt.value ? 'text-emerald-100' : 'text-slate-500'}`}>
                  {opt.desc}
                </p>
              </div>
            </div>
            {language === opt.value && (
              <span className="text-[10px] bg-emerald-600/50 px-1 py-0.2 rounded font-mono">
                ACT
              </span>
            )}
          </button>
        ))}
      </div>
    </div>
  );
}
