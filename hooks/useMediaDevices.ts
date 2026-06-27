import { useState, useCallback, useEffect } from 'react';
import { useTeleconsultationStore } from '@/stores/TeleconsultationStore';

export const useMediaDevices = () => {
  const { setLocalStream, setSystemCheck } = useTeleconsultationStore();
  const [devices, setDevices] = useState<MediaDeviceInfo[]>([]);
  const [selectedVideoDevice, setSelectedVideoDevice] = useState<string>('');
  const [selectedAudioDevice, setSelectedAudioDevice] = useState<string>('');
  const [isInitializing, setIsInitializing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getDevices = useCallback(async () => {
    try {
      const allDevices = await navigator.mediaDevices.enumerateDevices();
      setDevices(allDevices);
      
      // Select defaults if not selected
      const videoDevices = allDevices.filter(d => d.kind === 'videoinput');
      const audioDevices = allDevices.filter(d => d.kind === 'audioinput');
      
      if (!selectedVideoDevice && videoDevices.length > 0) setSelectedVideoDevice(videoDevices[0].deviceId);
      if (!selectedAudioDevice && audioDevices.length > 0) setSelectedAudioDevice(audioDevices[0].deviceId);
    } catch (err) {
      console.error("Error enumerating devices:", err);
    }
  }, [selectedAudioDevice, selectedVideoDevice]);

  const requestPermissions = useCallback(async () => {
    setIsInitializing(true);
    setError(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: selectedVideoDevice ? { deviceId: { exact: selectedVideoDevice } } : true,
        audio: selectedAudioDevice ? { deviceId: { exact: selectedAudioDevice } } : true
      });
      
      setLocalStream(stream);
      setSystemCheck('camera', stream.getVideoTracks().length > 0);
      setSystemCheck('mic', stream.getAudioTracks().length > 0);
      
      await getDevices(); // Reload with proper labels now that we have permission
      return stream;
    } catch (err: any) {
      console.error("Error getting user media:", err);
      setError(err.message || 'No se pudo acceder a la cámara o micrófono');
      setSystemCheck('camera', false);
      setSystemCheck('mic', false);
      return null;
    } finally {
      setIsInitializing(false);
    }
  }, [getDevices, selectedAudioDevice, selectedVideoDevice, setLocalStream, setSystemCheck]);

  // Cleanup effect
  useEffect(() => {
    return () => {
      // We don't cleanup the stream here because it might be used in the call.
      // Cleanup happens in the orchestrator hook.
    };
  }, []);

  return {
    devices,
    selectedVideoDevice,
    selectedAudioDevice,
    setSelectedVideoDevice,
    setSelectedAudioDevice,
    requestPermissions,
    isInitializing,
    error,
    getDevices
  };
};
