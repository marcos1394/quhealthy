"use client";

import React, { useEffect, useRef, useState } from 'react';
import Hls from 'hls.js';
import { PlayCircle } from 'lucide-react';

interface EnterpriseVideoPlayerProps {
 url: string;
 poster?: string;
}

export function EnterpriseVideoPlayer({ url, poster }: EnterpriseVideoPlayerProps) {
 const videoRef = useRef<HTMLVideoElement>(null);
 const [error, setError] = useState(false);

 useEffect(() => {
 const video = videoRef.current;
 if (!video || !url) return;

 setError(false);
 const isHls = url.includes('.m3u8');

 if (isHls && Hls.isSupported()) {
 const hls = new Hls({ debug: false });
 hls.loadSource(url);
 hls.attachMedia(video);
 
 hls.on(Hls.Events.ERROR, (event, data) => {
 if (data.fatal) {
 console.error("HLS Error:", data);
 setError(true);
 }
 });
 
 return () => hls.destroy();
 } else if (isHls && video.canPlayType('application/vnd.apple.mpegurl')) {
 // For Safari
 video.src = url;
 } else {
 // Standard MP4
 video.src = url;
 }
 }, [url]);

 if (!url) {
 return (
 <div className="w-full h-full flex flex-col items-center justify-center bg-black">
 <PlayCircle className="w-12 h-12 text-gray-700 mb-4" />
 <p className="text-[10px] font-bold uppercase tracking-widest text-gray-500">Video no disponible</p>
 </div>
 );
 }

 if (error) {
 return (
 <div className="w-full h-full flex flex-col items-center justify-center bg-black">
 <p className="text-[10px] font-bold uppercase tracking-widest text-red-500">Error al cargar el video.</p>
 <p className="text-xs text-gray-400 mt-2">Por favor revisa la consola para errores de CORS o Red.</p>
 </div>
 );
 }

 return (
 <div className="w-full h-full relative group bg-black overflow-hidden flex items-center justify-center">
 <video 
 ref={videoRef}
 poster={poster}
 controls
 className="w-full h-full max-h-full object-contain"
 />
 </div>
 );
}
