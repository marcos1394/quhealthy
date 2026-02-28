/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import React, { useState, useEffect, useRef } from 'react';
import { useParams } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { useSessionStore } from '@/stores/SessionStore';
import Video from 'twilio-video';
import axios from 'axios';
import { Loader2, Mic, MicOff, Video as VideoIcon, VideoOff, PhoneOff, X, ShieldCheck } from 'lucide-react';
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
      <div className="min-h-screen bg-slate-950 flex flex-col justify-center items-center text-white font-sans relative overflow-hidden">
        {/* Background Effects */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-medical-500/20 rounded-full blur-[100px] pointer-events-none" />

        <div className="relative z-10 flex flex-col items-center bg-slate-900/50 backdrop-blur-xl p-10 rounded-3xl border border-slate-800 shadow-2xl">
          <div className="relative mb-6 text-emerald-400 p-4 bg-emerald-500/10 rounded-full border border-emerald-500/20">
            <ShieldCheck className="w-10 h-10" />
            <div className="absolute bottom-0 right-0 w-4 h-4 rounded-full bg-slate-900 flex items-center justify-center">
              <Loader2 className="w-3 h-3 animate-spin text-medical-400" />
            </div>
          </div>
          <h2 className="text-2xl font-bold tracking-tight mb-2">{t('connecting_secure') || "Establishing Secure Connection"}</h2>
          <p className="text-slate-400 font-medium text-sm text-center max-w-xs">{t('connecting_desc') || "Please wait while we connect you to your provider securely..."}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-white flex flex-col items-center justify-center p-4 relative font-sans">
      {/* Remote video background */}
      <div className="absolute inset-0 bg-slate-900 flex flex-col items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-slate-700" />
      </div>
      <div ref={remoteVideoRef} className="absolute inset-0 w-full h-full [&>video]:w-full [&>video]:h-full [&>video]:object-cover" />

      {/* Header Overlay */}
      <div className="absolute top-0 left-0 right-0 p-6 z-20 bg-gradient-to-b from-slate-950/90 via-slate-900/50 to-transparent flex justify-between items-start pointer-events-none">
        <div className="flex items-center gap-3 bg-slate-900/60 backdrop-blur-md px-4 py-2.5 rounded-2xl border border-white/10 shadow-lg pointer-events-auto">
          <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_10px_rgba(16,185,129,0.8)]"></div>
          <div>
            <p className="text-white font-semibold text-sm tracking-wide flex items-center gap-1.5"><ShieldCheck className="w-3.5 h-3.5 text-medical-400" />{t('secure_call') || "Encrypted Session"}</p>
            <p className="text-emerald-400 text-xs font-bold mt-0.5">Connected</p>
          </div>
        </div>
        <Button variant="ghost" onClick={handleHangUp} className="text-slate-300 hover:text-white bg-slate-900/60 hover:bg-slate-800 backdrop-blur-md rounded-full w-12 h-12 p-0 border border-white/10 pointer-events-auto transition-all hover:scale-105">
          <X className="w-6 h-6" />
        </Button>
      </div>

      {/* Local video thumbnail */}
      <div className="absolute bottom-28 right-6 w-32 md:w-48 aspect-[3/4] md:aspect-video bg-slate-800 border-2 border-white/20 rounded-2xl overflow-hidden z-10 shadow-2xl transition-transform hover:scale-105 hover:border-medical-500/50 cursor-move">
        <div className="absolute inset-0 flex items-center justify-center">
          <VideoIcon className="w-6 h-6 text-slate-600" />
        </div>
        <div ref={localVideoRef} className="absolute inset-0 w-full h-full [&>video]:w-full [&>video]:h-full [&>video]:object-cover" />
      </div>

      {/* Controls */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex items-center gap-4 z-20 bg-slate-900/80 backdrop-blur-xl px-6 py-4 rounded-3xl border border-white/10 shadow-[0_20px_40px_-15px_rgba(0,0,0,0.5)]">
        <div className="flex flex-col items-center gap-1.5">
          <Button
            variant="outline"
            size="default"
            className={cn(
              "w-12 h-12 rounded-full border-slate-600/50 bg-slate-800/80 hover:bg-slate-700 transition-all text-white backdrop-blur-md",
              isMuted ? "bg-rose-500/20 border-rose-500/50 text-rose-400 hover:bg-rose-500/30" : ""
            )}
            onClick={() => setIsMuted(!isMuted)}
          >
            {isMuted ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
          </Button>
          <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400">{isMuted ? "Unmute" : "Mute"}</span>
        </div>
        <div className="w-px h-8 bg-white/10 mx-1 rounded-full"></div>

        <div className="flex flex-col items-center gap-1.5">
          <Button
            variant="outline"
            size="default"
            className={cn(
              "w-12 h-12 rounded-full border-slate-600/50 bg-slate-800/80 hover:bg-slate-700 transition-all text-white backdrop-blur-md",
              !videoEnabled ? "bg-rose-500/20 border-rose-500/50 text-rose-400 hover:bg-rose-500/30" : ""
            )}
            onClick={() => setVideoEnabled(!videoEnabled)}
          >
            {videoEnabled ? <VideoIcon className="w-5 h-5" /> : <VideoOff className="w-5 h-5" />}
          </Button>
          <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400">{videoEnabled ? "Stop" : "Start"}</span>
        </div>

        <div className="w-px h-8 bg-white/10 mx-1 rounded-full"></div>

        <div className="flex flex-col items-center gap-1.5">
          <Button
            variant="destructive"
            size="default"
            className="w-16 h-12 rounded-[20px] bg-rose-600 hover:bg-rose-500 shadow-[0_0_20px_rgba(225,29,72,0.4)] transition-all hover:scale-105"
            onClick={handleHangUp}
          >
            <PhoneOff className="w-6 h-6" />
          </Button>
          <span className="text-[10px] uppercase font-bold tracking-wider text-rose-400">End</span>
        </div>
      </div>
    </div>
  );
}