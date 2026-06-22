"use client";

import React, { useEffect, useState, useRef, useCallback } from 'react';
import { Html5QrcodeScanner, Html5QrcodeScanType } from 'html5-qrcode';
import { Input } from './input';
import { Label } from './label';
import { Camera, Keyboard, X } from 'lucide-react';
import { Button } from './button';
import { cn } from "@/lib/utils";

interface BarcodeScannerProps {
  onScan: (barcode: string) => void;
}

export function BarcodeScanner({ onScan }: BarcodeScannerProps) {
  const [mode, setMode] = useState<'camera' | 'physical'>('physical');
  const [manualInput, setManualInput] = useState('');
  const scannerRef = useRef<Html5QrcodeScanner | null>(null);

  // Handle Physical Scanner (Keyboard emulation)
  useEffect(() => {
    if (mode !== 'physical') return;

    let buffer = '';
    let timeoutId: NodeJS.Timeout;

    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore if typing in an input
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return;
      }

      if (e.key === 'Enter') {
        if (buffer.length > 0) {
          onScan(buffer);
          buffer = '';
        }
      } else if (e.key.length === 1) {
        buffer += e.key;
        clearTimeout(timeoutId);
        timeoutId = setTimeout(() => {
          buffer = ''; // Reset if typing is too slow (human typing instead of scanner)
        }, 50); // Scanners typically type very fast
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      clearTimeout(timeoutId);
    };
  }, [mode, onScan]);

  // Handle Camera Scanner
  useEffect(() => {
    if (mode === 'camera') {
      scannerRef.current = new Html5QrcodeScanner(
        'qr-reader',
        { fps: 10, qrbox: { width: 250, height: 150 }, supportedScanTypes: [Html5QrcodeScanType.SCAN_TYPE_CAMERA] },
        false
      );

      scannerRef.current.render(
        (decodedText) => {
          onScan(decodedText);
          // Optional: we can close scanner or keep it running. Let's beep and continue.
        },
        (error) => {
          // Ignored. html5-qrcode frequently logs missing patterns as errors.
        }
      );
    }

    return () => {
      if (scannerRef.current) {
        scannerRef.current.clear().catch(console.error);
      }
    };
  }, [mode, onScan]);

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (manualInput.trim()) {
      onScan(manualInput.trim());
      setManualInput('');
    }
  };

    return (
    <div className="w-full flex flex-col bg-white dark:bg-[#0a0a0a]">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <h3 className="font-bold text-[10px] uppercase tracking-widest text-black dark:text-white">METODOLOGÍA DE ESCANEO</h3>
        <div className="flex items-center gap-0 border border-black/20 dark:border-white/20 bg-gray-50 dark:bg-[#050505]">
          <button
            type="button"
            className={cn(
              "flex-1 px-4 py-2 text-[9px] font-bold uppercase tracking-widest flex items-center justify-center gap-2 transition-colors min-w-[120px]",
              mode === 'physical'
                ? "bg-black text-white dark:bg-white dark:text-black"
                : "text-gray-500 hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black"
            )}
            onClick={() => setMode('physical')}
          >
            <Keyboard className="w-3.5 h-3.5" strokeWidth={1.5} /> FÍSICO
          </button>
          <button
            type="button"
            className={cn(
              "flex-1 px-4 py-2 text-[9px] font-bold uppercase tracking-widest flex items-center justify-center gap-2 transition-colors min-w-[120px] border-l border-black/20 dark:border-white/20",
              mode === 'camera'
                ? "bg-black text-white dark:bg-white dark:text-black"
                : "text-gray-500 hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black"
            )}
            onClick={() => setMode('camera')}
          >
            <Camera className="w-3.5 h-3.5" strokeWidth={1.5} /> CÁMARA
          </button>
        </div>
      </div>

      {mode === 'physical' ? (
        <div className="flex flex-col gap-4">
          <div className="bg-gray-50 dark:bg-[#050505] border border-black/20 dark:border-white/20 p-6 text-center">
            <p className="text-[10px] font-bold uppercase tracking-widest text-gray-500">LECTOR FÍSICO HABILITADO. ESCANEE EL CÓDIGO.</p>
          </div>
          <form onSubmit={handleManualSubmit} className="flex flex-col sm:flex-row gap-0 border border-black/20 dark:border-white/20">
            <input 
              placeholder="O INGRESE SKU / CÓDIGO..."
              value={manualInput}
              onChange={(e) => setManualInput(e.target.value)}
              className="flex-1 h-12 px-4 bg-transparent border-0 text-[10px] font-bold uppercase tracking-widest text-black dark:text-white focus:outline-none focus:ring-0 placeholder:text-gray-400 font-mono"
            />
            <button type="submit" className="h-12 px-6 bg-black text-white dark:bg-white dark:text-black text-[10px] font-bold uppercase tracking-widest hover:bg-gray-800 dark:hover:bg-gray-200 transition-colors">BUSCAR</button>
          </form>
        </div>
      ) : (
        <div className="w-full border border-black/20 dark:border-white/20 bg-gray-50 dark:bg-[#050505]">
          <div id="qr-reader" className="w-full" />
        </div>
      )}
    </div>
  );
}
