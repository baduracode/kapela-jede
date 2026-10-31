'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Lock, ShieldCheck, X, AlertCircle } from 'lucide-react';

interface PinModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (pin: string) => boolean;
  title?: string;
  description?: string;
}

export function PinModal({
  isOpen,
  onClose,
  onSuccess,
  title = 'Zadejte kapelní PIN',
  description = 'Pro uložení či změnu jízdy zadejte 4místný bezpečnostní PIN.',
}: PinModalProps) {
  const [pinDigits, setPinDigits] = useState<string[]>(['', '', '', '']);
  const [error, setError] = useState<string | null>(null);
  const inputRefs = [
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
  ];

  useEffect(() => {
    if (isOpen) {
      setPinDigits(['', '', '', '']);
      setError(null);
      setTimeout(() => {
        inputRefs[0].current?.focus();
      }, 50);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleDigitChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return;

    const newDigits = [...pinDigits];
    const lastChar = value.slice(-1);
    newDigits[index] = lastChar;
    setPinDigits(newDigits);
    setError(null);

    // Auto posun na další políčko
    if (lastChar && index < 3) {
      inputRefs[index + 1].current?.focus();
    }

    // Pokud jsou vyplněny všechny 4 číslice, zkusíme automaticky potvrdit
    const fullPin = newDigits.join('');
    if (fullPin.length === 4) {
      const ok = onSuccess(fullPin);
      if (!ok) {
        setError('Nesprávný PIN. Zkuste to znovu.');
        setPinDigits(['', '', '', '']);
        setTimeout(() => {
          inputRefs[0].current?.focus();
        }, 50);
      }
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !pinDigits[index] && index > 0) {
      inputRefs[index - 1].current?.focus();
    }
    if (e.key === 'Escape') {
      onClose();
    }
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text').trim();
    if (/^\d{4}$/.test(pasted)) {
      const digits = pasted.split('').slice(0, 4);
      setPinDigits(digits);
      const ok = onSuccess(pasted);
      if (!ok) {
        setError('Nesprávný PIN.');
        setPinDigits(['', '', '', '']);
        inputRefs[0].current?.focus();
      }
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
      <div className="relative w-full max-w-sm rounded-2xl bg-slate-900 border border-slate-700/80 p-6 shadow-2xl text-slate-100">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
          aria-label="Zavřít"
        >
          <X size={18} />
        </button>

        <div className="flex flex-col items-center text-center">
          <div className="w-12 h-12 rounded-xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400 mb-3">
            <Lock size={24} />
          </div>

          <h3 className="text-lg font-bold text-white mb-1">{title}</h3>
          <p className="text-xs text-slate-400 max-w-xs mb-6">{description}</p>

          {/* 4 PIN políčka */}
          <div className="flex gap-3 justify-center mb-4">
            {pinDigits.map((digit, idx) => (
              <input
                key={idx}
                ref={inputRefs[idx]}
                type="password"
                inputMode="numeric"
                maxLength={1}
                value={digit}
                onChange={(e) => handleDigitChange(idx, e.target.value)}
                onKeyDown={(e) => handleKeyDown(idx, e)}
                onPaste={handlePaste}
                className={`w-12 h-14 text-center text-2xl font-bold rounded-xl border bg-slate-800/90 text-white shadow-inner focus:outline-none focus:ring-2 transition ${
                  error
                    ? 'border-rose-500 focus:ring-rose-500/50'
                    : 'border-slate-700 focus:border-amber-400 focus:ring-amber-400/40'
                }`}
              />
            ))}
          </div>

          {error && (
            <div className="flex items-center gap-1.5 text-xs text-rose-400 font-medium mb-3">
              <AlertCircle size={14} />
              <span>{error}</span>
            </div>
          )}

          <div className="text-[11px] text-slate-500 bg-slate-800/50 px-3 py-1.5 rounded-md border border-slate-800">
            Výchozí PIN je <span className="font-mono text-amber-300 font-semibold">1234</span> (nastavitelný v .env.local)
          </div>
        </div>
      </div>
    </div>
  );
}
