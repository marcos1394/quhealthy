"use client";

/* eslint-disable react-doctor/no-react19-deprecated-apis */
/* eslint-disable react-doctor/button-has-type */

import React, { useEffect, useState, useRef } from 'react';
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

    // Escáner Físico (Lectura de teclado emulada rápida)
    useEffect(() => {
        if (mode !== 'physical') return;

        let buffer = '';
        let timeoutId: NodeJS.Timeout;

        const handleKeyDown = (e: KeyboardEvent) => {
            // Ignorar si el usuario está escribiendo directamente en un input o textarea
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
                    buffer = ''; // Reiniciar si la escritura es lenta (tecleo humano)
                }, 50);
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => {
            window.removeEventListener('keydown', handleKeyDown);
            clearTimeout(timeoutId);
        };
    }, [mode, onScan]);

    // Escáner de Cámara con Html5QrcodeScanner
    useEffect(() => {
        let scannerInstance: Html5QrcodeScanner | null = null;

        if (mode === 'camera') {
            const timer = setTimeout(() => {
                try {
                    scannerInstance = new Html5QrcodeScanner(
                        'qr-reader',
                        {
                            fps: 10,
                            qrbox: { width: 220, height: 140 },
                            supportedScanTypes: [Html5QrcodeScanType.SCAN_TYPE_CAMERA],
                        },
                        false
                    );

                    scannerRef.current = scannerInstance;

                    scannerInstance.render(
                        (decodedText) => {
                            onScan(decodedText);
                        },
                        () => {
                            // Ignorar callbacks continuos de patròn no detectado
                        }
                    );
                } catch (err) {
                    console.error("Error al inicializar la cámara:", err);
                }
            }, 100);

            return () => {
                clearTimeout(timer);
                if (scannerRef.current) {
                    scannerRef.current.clear().catch(console.error);
                    scannerRef.current = null;
                }
            };
        }
    }, [mode, onScan]);

    const handleManualSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (manualInput.trim()) {
            onScan(manualInput.trim());
            setManualInput('');
        }
    };

    return (
        <div className="w-full flex flex-col gap-5 overflow-hidden">
            {/* Pestañas para cambiar modo */}
            <div className="flex w-full items-center bg-gray-100 dark:bg-gray-800/50 p-1 rounded-2xl">
                <button
                    type="button"
                    className={cn(
                        "flex-1 h-9 px-3 text-xs font-semibold rounded-xl flex items-center justify-center gap-2 transition-all",
                        mode === 'physical'
                            ? "bg-white text-emerald-700 dark:bg-[#0a0a0a] dark:text-emerald-400 shadow-sm"
                            : "text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
                    )}
                    onClick={() => setMode('physical')}
                >
                    <Keyboard className="w-4 h-4 shrink-0" strokeWidth={2} />
                    <span className="truncate">Lector Físico</span>
                </button>
                <button
                    type="button"
                    className={cn(
                        "flex-1 h-9 px-3 text-xs font-semibold rounded-xl flex items-center justify-center gap-2 transition-all",
                        mode === 'camera'
                            ? "bg-white text-emerald-700 dark:bg-[#0a0a0a] dark:text-emerald-400 shadow-sm"
                            : "text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
                    )}
                    onClick={() => setMode('camera')}
                >
                    <Camera className="w-4 h-4 shrink-0" strokeWidth={2} />
                    <span className="truncate">Cámara</span>
                </button>
            </div>

            {mode === 'physical' ? (
                <div className="flex flex-col gap-4 w-full">
                    <div className="bg-gray-50 dark:bg-[#050505] border border-gray-200 dark:border-gray-800 p-5 text-center rounded-2xl flex flex-col items-center justify-center gap-2">
                        <div className="w-10 h-10 bg-white dark:bg-[#0a0a0a] border border-gray-100 dark:border-gray-800 rounded-xl flex items-center justify-center shadow-sm">
                            <Keyboard className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                        </div>
                        <p className="text-xs font-bold text-gray-700 dark:text-gray-300">
                            Listo para escanear código de barras
                        </p>
                        <p className="text-[11px] text-gray-500 font-medium">
                            Asegúrate de no tener el cursor en un campo de texto.
                        </p>
                    </div>

                    {/* Formulario de Búsqueda Manual Adaptativo */}
                    <form onSubmit={handleManualSubmit} className="flex flex-col sm:flex-row gap-2 w-full">
                        <div className="relative flex-1 min-w-0">
                            <input 
                                type="text"
                                placeholder="SKU / Código..."
                                value={manualInput}
                                onChange={(e) => setManualInput(e.target.value)}
                                className="w-full h-11 px-3.5 bg-white dark:bg-[#0a0a0a] border border-gray-200 dark:border-gray-800 text-xs font-semibold text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 placeholder:text-gray-400 font-mono rounded-xl shadow-sm"
                            />
                        </div>
                        <button 
                            type="submit" 
                            className="h-11 px-4 bg-emerald-600 text-white text-xs font-bold hover:bg-emerald-700 transition-colors rounded-xl shadow-sm flex items-center justify-center gap-2 shrink-0"
                        >
                            <Search className="w-4 h-4 shrink-0" />
                            <span>Buscar</span>
                        </button>
                    </form>
                </div>
            ) : (
                <div className="w-full border border-gray-200 dark:border-gray-800 bg-white dark:bg-[#0a0a0a] p-3 rounded-2xl shadow-sm overflow-hidden">
                    <div id="qr-reader" className="w-full overflow-hidden rounded-xl" />
                </div>
            )}
        </div>
    );
}