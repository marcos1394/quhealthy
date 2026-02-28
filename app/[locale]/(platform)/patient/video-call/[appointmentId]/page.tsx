/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import React, { useState, useEffect, useRef } from 'react';
import { useParams } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { useSessionStore } from '@/stores/SessionStore';
import Video from 'twilio-video';
import axios from 'axios';
import { Loader2, Mic, MicOff, Video as VideoIcon, VideoOff, PhoneOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export default function VideoCallPage() {
  const params = useParams();
  const t = useTranslations('PatientVideoCall');
  const appointmentId = params.appointmentId as string;
  const { user } = useSessionStore();

  const [room, setRoom] = useState<Video.Room | null>(null);
  const [isMuted, setIsMuted] = useState(false);
  const [videoEnabled, setVideoEnabled] = useState(true);
  const localVideoRef = useRef<HTMLDivElement>(null);
  const remoteVideoRef = useRef<HTMLDivElement>(null);
  const [isConnecting, setIsConnecting] = useState(true);

  useEffect(() => {
    if (!appointmentId || !user) return;

    const connectToRoom = async () => {
      try {
        const { data } = await axios.get(`/api/twilio/video/token/${appointmentId}`, {
          withCredentials: true
        });

        const videoRoom = await Video.connect(data.token, {
          name: data.roomName,
          audio: true,
          video: { width: 640 }
        });

        setRoom(videoRoom);
        setIsConnecting(false);

        if (localVideoRef.current && videoRoom.localParticipant.videoTracks.size > 0) {
          const localTrackPublication = Array.from(videoRoom.localParticipant.videoTracks.values())[0];
          if (localTrackPublication.track) {
            localVideoRef.current.appendChild(localTrackPublication.track.attach() as HTMLElement);
          }
        }

        const handleParticipant = (participant: Video.RemoteParticipant) => {
          participant.on('trackSubscribed', (track: Video.RemoteTrack) => {
            if (track.kind === 'video' || track.kind === 'audio') {
              if (remoteVideoRef.current) {
                remoteVideoRef.current.innerHTML = '';
                remoteVideoRef.current.appendChild(track.attach() as HTMLElement);
              }
            }
          });
        };

        videoRoom.participants.forEach(handleParticipant);
        videoRoom.on('participantConnected', handleParticipant);

      } catch (error) {
        console.error("Error connecting to Twilio room:", error);
        setIsConnecting(false);
      }
    };

    connectToRoom();

    return () => {
      if (room) {
        room.disconnect();
      }
    };
  }, [appointmentId, user, room]);

  const handleHangUp = () => {
    if (room) room.disconnect();
    window.history.back();
  };

  if (!room) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col justify-center items-center text-white font-sans">
        <Loader2 className="w-10 h-10 animate-spin text-medical-400 mb-4" />
        <p className="text-slate-400 font-medium">{t('connecting')}</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-white flex flex-col items-center justify-center p-4 relative font-sans">
      {/* Remote video */}
      <div ref={remoteVideoRef} className="absolute inset-0 w-full h-full" />

      {/* Local video */}
      <div ref={localVideoRef} className="absolute top-4 right-4 w-48 h-36 border-2 border-medical-500 rounded-xl overflow-hidden z-10 shadow-2xl" />

      {/* Controls */}
      <div className="absolute bottom-8 flex gap-3 z-10 bg-slate-900/80 backdrop-blur-xl p-3 rounded-2xl border border-slate-700/50 shadow-2xl">
        <Button
          variant="outline"
          size="default"
          className={cn(
            "w-12 h-12 rounded-full border-slate-600 hover:bg-slate-800 transition-all",
            isMuted ? "bg-rose-500/20 border-rose-500 text-rose-400 hover:bg-rose-500/30" : ""
          )}
          onClick={() => setIsMuted(!isMuted)}
        >
          {isMuted ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
        </Button>
        <Button
          variant="outline"
          size="default"
          className={cn(
            "w-12 h-12 rounded-full border-slate-600 hover:bg-slate-800 transition-all",
            !videoEnabled ? "bg-rose-500/20 border-rose-500 text-rose-400 hover:bg-rose-500/30" : ""
          )}
          onClick={() => setVideoEnabled(!videoEnabled)}
        >
          {videoEnabled ? <VideoIcon className="w-5 h-5" /> : <VideoOff className="w-5 h-5" />}
        </Button>
        <Button
          variant="destructive"
          size="default"
          className="w-16 h-12 rounded-full bg-rose-600 hover:bg-rose-700 shadow-lg shadow-rose-500/30"
          onClick={handleHangUp}
        >
          <PhoneOff className="w-5 h-5" />
        </Button>
      </div>
    </div>
  );
}