"use client";

import React, { useMemo } from 'react';
import { Plyr, APITypes, PlyrProps } from 'plyr-react';
import 'plyr-react/plyr.css';
import { PlayCircle } from 'lucide-react';

interface EnterpriseVideoPlayerProps {
  url: string;
  poster?: string;
}

export function EnterpriseVideoPlayer({ url, poster }: EnterpriseVideoPlayerProps) {
  
  const plyrProps = useMemo<PlyrProps>(() => {
    // Detect YouTube
    const isYouTube = url.includes('youtube.com') || url.includes('youtu.be');
    // Detect Vimeo
    const isVimeo = url.includes('vimeo.com');

    let provider: 'youtube' | 'vimeo' | 'html5' = 'html5';
    if (isYouTube) provider = 'youtube';
    else if (isVimeo) provider = 'vimeo';

    return {
      source: {
        type: 'video',
        sources: [
          {
            src: url,
            provider,
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
  }, [url, poster]);

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
      <Plyr {...plyrProps} />
    </div>
  );
}
