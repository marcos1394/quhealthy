"use client";

import React, { useEffect, useState, useRef, useCallback } from 'react';
import { Html5QrcodeScanner, Html5QrcodeScanType } from 'html5-qrcode';
import { Input } from './input';
import { Label } from './label';
import { Camera, Keyboard, X } from 'lucide-react';
import { Button } from './button';

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
    <div className="border border-slate-200 dark:border-slate-800 rounded-xl p-4 bg-white dark:bg-slate-900 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-bold text-slate-800 dark:text-slate-200">Escanear Producto</h3>
        <div className="flex items-center gap-2 bg-slate-100 dark:bg-slate-800 p-1 rounded-lg">
          <button
            type="button"
            className={`px-3 py-1.5 rounded-md text-sm font-medium flex items-center gap-2 transition-colors ${
              mode === 'physical'
                ? 'bg-white dark:bg-slate-700 text-medical-600 dark:text-medical-400 shadow-sm'
                : 'text-slate-500 hover:text-slate-700 dark:text-slate-400'
            }`}
            onClick={() => setMode('physical')}
          >
            <Keyboard className="w-4 h-4" /> Lector Físico
          </button>
          <button
            type="button"
            className={`px-3 py-1.5 rounded-md text-sm font-medium flex items-center gap-2 transition-colors ${
              mode === 'camera'
                ? 'bg-white dark:bg-slate-700 text-medical-600 dark:text-medical-400 shadow-sm'
                : 'text-slate-500 hover:text-slate-700 dark:text-slate-400'
            }`}
            onClick={() => setMode('camera')}
          >
            <Camera className="w-4 h-4" /> Cámara
          </button>
        </div>
      </div>

      {mode === 'physical' ? (
        <div className="space-y-4">
          <div className="bg-blue-50 dark:bg-blue-500/10 border border-blue-200 dark:border-blue-500/20 text-blue-800 dark:text-blue-300 rounded-lg p-4 text-center">
            <p className="text-sm">El lector físico está activo. Puedes escanear en cualquier momento.</p>
          </div>
          <form onSubmit={handleManualSubmit} className="flex gap-2">
            <Input 
              placeholder="O ingresa el código/SKU manualmente..."
              value={manualInput}
              onChange={(e) => setManualInput(e.target.value)}
              className="flex-1 font-mono uppercase"
            />
            <Button type="submit" variant="secondary">Buscar</Button>
          </form>
        </div>
      ) : (
        <div className="relative rounded-lg overflow-hidden border border-slate-200 dark:border-slate-800">
          <div id="qr-reader" className="w-full" />
        </div>
      )}
    </div>
  );
}
