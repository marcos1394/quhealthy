"use client";

import React, { useMemo, useRef, useEffect } from 'react';
import { Plyr, APITypes, PlyrProps } from 'plyr-react';
import Hls from 'hls.js';
import 'plyr-react/plyr.css';
import { PlayCircle } from 'lucide-react';

interface EnterpriseVideoPlayerProps {
  url: string;
  poster?: string;
}

export function EnterpriseVideoPlayer({ url, poster }: EnterpriseVideoPlayerProps) {
  const ref = useRef<APITypes>(null);

  const isYouTube = url.includes('youtube.com') || url.includes('youtu.be');
  const isVimeo = url.includes('vimeo.com');
  const isHls = url.includes('.m3u8');
  
  let provider: 'youtube' | 'vimeo' | 'html5' = 'html5';
  if (isYouTube) provider = 'youtube';
  else if (isVimeo) provider = 'vimeo';

  const plyrProps = useMemo<PlyrProps>(() => {
    return {
      source: {
        type: 'video',
        sources: [
          {
            src: url,
            provider,
            // For standard MP4, it's good to specify type if not HLS
            type: !isHls && provider === 'html5' ? 'video/mp4' : undefined
          }
        ],
        poster: poster,
      },
      options: {
        controls: [
          'play-large',
          'play',
          'progress',
          'current-time',
          'mute',
          'volume',
          'captions',
          'settings',
          'pip',
          'airplay',
          'fullscreen'
        ],
        settings: ['captions', 'quality', 'speed'],
        hideControls: true,
        youtube: {
          noCookie: true,
          rel: 0,
          showinfo: 0,
          iv_load_policy: 3,
          modestbranding: 1
        },
      }
    };
  }, [url, poster, provider, isHls]);

  useEffect(() => {
    // If it's an HLS stream and HLS is supported in this browser
    if (isHls && Hls.isSupported() && ref.current?.plyr?.media) {
      const hls = new Hls({
        debug: false,
      });
      hls.loadSource(url);
      hls.attachMedia(ref.current.plyr.media as HTMLMediaElement);
      
      return () => {
        hls.destroy();
      };
    }
  }, [url, isHls]);

  if (!url) {
    return (
      <div className="w-full h-full flex flex-col items-center justify-center bg-black">
        <PlayCircle className="w-12 h-12 text-gray-700 mb-4" />
        <p className="text-[10px] font-bold uppercase tracking-widest text-gray-500">Video no disponible</p>
      </div>
    );
  }

  return (
    <div className="w-full h-full relative group bg-black overflow-hidden [&_.plyr]:h-full [&_.plyr]:w-full">
      <Plyr ref={ref} {...plyrProps} />
    </div>
  );
}
