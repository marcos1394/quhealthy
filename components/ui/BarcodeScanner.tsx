"use client"
/* eslint-disable react-doctor/no-react19-deprecated-apis */;;

import React, { useEffect, useState, useRef, useCallback } from 'react';
import { Html5QrcodeScanner, Html5QrcodeScanType } from 'html5-qrcode';
import { Camera, Keyboard, Search } from 'lucide-react';
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
        <div className="w-full flex flex-col gap-6">
            {/* Tabs */}
            <div className="flex w-full items-center bg-gray-100 dark:bg-gray-800/50 p-1.5 rounded-2xl shadow-inner">
                <button
                    type="button"
                    className={cn(
                        "flex-1 h-10 px-4 text-sm font-semibold rounded-xl flex items-center justify-center gap-2 transition-all",
                        mode === 'physical'
                            ? "bg-white text-emerald-700 dark:bg-[#0a0a0a] dark:text-emerald-400 shadow-sm"
                            : "text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
                    )}
                    onClick={() => setMode('physical')}
                >
                    <Keyboard className="w-4 h-4" strokeWidth={2} />
                    Lector Físico
                </button>
                <button
                    type="button"
                    className={cn(
                        "flex-1 h-10 px-4 text-sm font-semibold rounded-xl flex items-center justify-center gap-2 transition-all",
                        mode === 'camera'
                            ? "bg-white text-emerald-700 dark:bg-[#0a0a0a] dark:text-emerald-400 shadow-sm"
                            : "text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
                    )}
                    onClick={() => setMode('camera')}
                >
                    <Camera className="w-4 h-4" strokeWidth={2} />
                    Cámara
                </button>
            </div>

            {mode === 'physical' ? (
                <div className="flex flex-col gap-4">
                    <div className="bg-gray-50 dark:bg-[#050505] border border-gray-200 dark:border-gray-800 p-6 text-center rounded-2xl flex flex-col items-center justify-center gap-3">
                        <div className="w-12 h-12 bg-white dark:bg-[#0a0a0a] border border-gray-100 dark:border-gray-800 rounded-2xl flex items-center justify-center shadow-sm">
                            <Keyboard className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
                        </div>
                        <p className="text-sm font-bold text-gray-700 dark:text-gray-300">
                            Listo para escanear código de barras
                        </p>
                        <p className="text-xs text-gray-500 font-medium">Asegúrate de no tener el cursor en un campo de texto.</p>
                    </div>

                    <form onSubmit={handleManualSubmit} className="flex gap-2">
                        <input 
                            placeholder="O ingrese SKU / código manualmente..."
                            value={manualInput}
                            onChange={(e) => setManualInput(e.target.value)}
                            className="flex-1 h-12 px-5 bg-white dark:bg-[#0a0a0a] border border-gray-200 dark:border-gray-800 text-sm font-semibold text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 placeholder:text-gray-400 placeholder:font-normal font-mono rounded-xl shadow-sm"
                        />
                        <button 
                            type="submit" 
                            className="h-12 px-6 bg-emerald-600 text-white text-sm font-bold hover:bg-emerald-700 transition-colors rounded-xl shadow-sm flex items-center justify-center gap-2"
                        >
                            <Search className="w-4 h-4" />
                            Buscar
                        </button>
                    </form>
                </div>
            ) : (
                <div className="w-full border border-gray-200 dark:border-gray-800 bg-white dark:bg-[#0a0a0a] p-4 rounded-3xl shadow-sm">
                    <div id="qr-reader" className="w-full overflow-hidden rounded-2xl" />
                </div>
            )}
        </div>
    );
}
