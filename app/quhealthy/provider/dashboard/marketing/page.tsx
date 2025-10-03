/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import React, { useState, useEffect } from 'react';
import { useSessionStore } from '@/stores/SessionStore';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { toast } from 'react-toastify';
import axios from 'axios';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Link as LinkIcon, CheckCircle, Facebook, Instagram, Sparkles, Copy, Loader2, CalendarClock } from 'lucide-react';
import Image from 'next/image';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';


interface Service { id: number; name: string; }


export default function MarketingPage() {
  const { user, fetchSession } = useSessionStore();
  const router = useRouter();
  const searchParams = useSearchParams();
  // Estados para el generador de IA
  const [services, setServices] = useState<Service[]>([]);
  const [selectedServiceId, setSelectedServiceId] = useState<string>('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedContent, setGeneratedContent] = useState<{ imageUrl: string; postText: string } | null>(null);
  // --- NUEVOS ESTADOS PARA LA PROGRAMACIÓN ---
  const [publishAt, setPublishAt] = useState('');
  const [isScheduling, setIsScheduling] = useState(false);
    const [selectedConnectionId, setSelectedConnectionId] = useState<string>('');



  
  // Verificamos si la conexión fue exitosa al volver de Facebook
  useEffect(() => {
    const success = searchParams.get('success');
    const error = searchParams.get('error');
    
    if (success) {
        let platformName = '';
        if (success === 'facebook') platformName = 'Facebook/Instagram';
        if (success === 'linkedin') platformName = 'LinkedIn';
        if (success === 'google_business') platformName = 'Google Business'; // <-- AÑADE ESTO
        
        toast.success(`¡Cuenta de ${platformName} conectada exitosamente!`);
        fetchSession();
        router.replace('/provider/dashboard/marketing');
    }
    if (error) {
        toast.error("No se pudo conectar la cuenta.");
        router.replace('/provider/dashboard/marketing');
    }
  }, [searchParams, router, fetchSession]);

   // Cargar los servicios del proveedor para el selector
  useEffect(() => {
    axios.get('/api/provider/services', { withCredentials: true })
      .then(res => setServices(res.data));
  }, []);

  const handleConnectFacebook = async () => {
    try {
      // 1. Pedimos la URL de autorización a nuestro backend
      const { data } = await axios.get('/api/auth/social/facebook', { withCredentials: true });
      // 2. Redirigimos al usuario a la página de consentimiento de Meta
      window.location.href = data.authUrl;
    } catch (error) {
      toast.error("No se pudo iniciar la conexión.");
    }
  };

    const handleConnectLinkedIn = async () => {
    try {
      const { data } = await axios.get('/api/auth/social/linkedin', { withCredentials: true });
      window.location.href = data.authUrl;
    } catch (error) {
      toast.error("No se pudo iniciar la conexión con LinkedIn.");
    }
  };

  const handleConnectGoogleBusiness = async () => {
    try {
      const { data } = await axios.get('/api/google/business/auth', { withCredentials: true });
      window.location.href = data.authUrl;
    } catch (error) {
      toast.error("No se pudo iniciar la conexión con Google Business.");
    }
  };

  const isFacebookConnected = user?.socialConnections?.some(c => c.platform === 'facebook');
    const isLinkedInConnected = user?.socialConnections?.some(c => c.platform === 'linkedin');
     const isGoogleBusinessConnected = user?.socialConnections?.some(c => c.platform === 'google_business');



  // Función para llamar al backend de Gemini
  const handleGeneratePost = async () => {
    if (!selectedServiceId) {
      toast.warn("Por favor, selecciona un servicio primero.");
      return;
    }
    setIsGenerating(true);
    setGeneratedContent(null);
    try {
      const { data } = await axios.post('/api/ai/generate-post', {
        serviceId: parseInt(selectedServiceId)
      }, { withCredentials: true });
      setGeneratedContent(data);
    } catch (error) {
      toast.error("No se pudo generar el contenido con IA.");
    } finally {
      setIsGenerating(false);
    }
  };

 const handleSchedulePost = async () => {
    // --- INICIO DE LA CORRECCIÓN ---
    if (!generatedContent || !publishAt || !selectedConnectionId) {
      toast.warn("Por favor, genera contenido, selecciona una red social y una fecha para programar.");
      return;
    }
    // --- FIN DE LA CORRECCIÓN ---
    
    setIsScheduling(true);
    try {
      await axios.post('/api/social/schedule-post', {
        socialConnectionId: parseInt(selectedConnectionId),
        content: generatedContent.postText,
        imageUrl: generatedContent.imageUrl,
        publishAt: new Date(publishAt).toISOString(),
      }, { withCredentials: true });

      toast.success("¡Publicación programada exitosamente!");
      setGeneratedContent(null);
      setPublishAt('');
      setSelectedConnectionId('');
    } catch (error) {
      toast.error("No se pudo programar la publicación.");
    } finally {
      setIsScheduling(false);
    }
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-8">
      <h1 className="text-3xl font-bold text-white">Centro de Marketing</h1>
      <p className="text-gray-400">Conecta tus redes sociales para empezar a crear contenido con IA y programar publicaciones.</p>

      <Card className="bg-gray-800/50 border-gray-700">
        <CardHeader>
          <CardTitle>Conexiones Sociales</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="p-4 bg-gray-900/50 rounded-lg flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex -space-x-2">
                <div className="w-8 h-8 bg-[#1877F2] rounded-full flex items-center justify-center text-white"><Facebook size={20}/></div>
                <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-white"><Instagram size={20}/></div>
              </div>
              <div>
                <p className="font-medium text-white">Facebook & Instagram</p>
                <p className="text-sm text-gray-400">Publica en tus páginas de negocio.</p>
              </div>
            </div>
            {isFacebookConnected ? (
              <div className="flex items-center gap-2 text-green-400 font-semibold">
                <CheckCircle className="w-5 h-5"/>
                <span>Conectado</span>
              </div>
            ) : (
              <Button onClick={handleConnectFacebook}>
                <LinkIcon className="w-4 h-4 mr-2"/>
                Conectar
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
      {/* NUEVA TARJETA: Generador de Contenido con IA */}
      <Card className="bg-gray-800/50 border-gray-700">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="text-purple-400"/> Generador de Contenido (Gemini)
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="text-sm font-medium text-gray-300">1. Elige un servicio para promocionar</label>
            <Select onValueChange={setSelectedServiceId} value={selectedServiceId}>
              <SelectTrigger><SelectValue placeholder="Selecciona un servicio..." /></SelectTrigger>
              <SelectContent>
                {services.map(s => <SelectItem key={s.id} value={s.id.toString()}>{s.name}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <Button onClick={handleGeneratePost} disabled={isGenerating || !selectedServiceId}>
            {isGenerating ? <Loader2 className="animate-spin mr-2"/> : <Sparkles className="w-4 h-4 mr-2"/>}
            Generar Post
          </Button>

          {isGenerating && <p className="text-sm text-gray-400">Gemini está creando tu post, esto puede tardar un momento...</p>}
          
          {generatedContent && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-6 pt-4 border-t border-gray-700 space-y-4">
              <h3 className="font-semibold text-white">Contenido Generado:</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Image src={generatedContent.imageUrl} alt="Imagen generada por IA" className="rounded-lg"/>
                <div>
                  <Textarea value={generatedContent.postText} readOnly rows={8} className="bg-gray-700"/>
                  <Button variant="outline" onClick={() => { navigator.clipboard.writeText(generatedContent.postText); toast.success("Texto copiado"); }} className="mt-2">
                    <Copy className="w-4 h-4 mr-2"/> Copiar Texto
                  </Button>
                </div>
              </div>
              {/* --- NUEVA SECCIÓN DE PROGRAMACIÓN --- */}
              <div className="mt-4 pt-4 border-t border-dashed border-gray-600 space-y-4">
      <h3 className="font-semibold text-white">2. Programa tu publicación</h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="platform">Plataforma</Label>
          <Select onValueChange={setSelectedConnectionId} value={selectedConnectionId}>
            <SelectTrigger id="platform"><SelectValue placeholder="Selecciona una red..." /></SelectTrigger>
            <SelectContent>
              {user?.socialConnections?.map(c => (
                <SelectItem key={c.id} value={c.id.toString()}>
                  {c.platform.charAt(0).toUpperCase() + c.platform.slice(1)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label htmlFor="publishAt">Fecha y Hora</Label>
          <Input
            id="publishAt"
            type="datetime-local"
            value={publishAt}
            onChange={(e) => setPublishAt(e.target.value)}
            className="bg-gray-700 border-gray-600"
          />
        </div>
      </div>
      <Button onClick={handleSchedulePost} disabled={isScheduling || !publishAt || !selectedConnectionId}>
        {isScheduling ? <Loader2 className="animate-spin mr-2"/> : <CalendarClock className="w-4 h-4 mr-2"/>}
        Programar Publicación
      </Button>
    </div>
            </motion.div>
          )}

          {/* --- AÑADE ESTE NUEVO DIV --- */}
  <div className="p-4 bg-gray-900/50 rounded-lg flex items-center justify-between">
    <div className="flex items-center gap-3">
      <div className="w-8 h-8 bg-[#0A66C2] rounded-full flex items-center justify-center text-white">
        {/* Aquí iría un ícono de LinkedIn si lo tienes, o usa texto */}
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/></svg>
      </div>
      <div>
        <p className="font-medium text-white">LinkedIn</p>
        <p className="text-sm text-gray-400">Publica en tu perfil profesional.</p>
      </div>
    </div>
    {isLinkedInConnected ? (
      <div className="flex items-center gap-2 text-green-400 font-semibold">
        <CheckCircle className="w-5 h-5"/>
        <span>Conectado</span>
      </div>
    ) : (
      <Button onClick={handleConnectLinkedIn}>
        <LinkIcon className="w-4 h-4 mr-2"/>
        Conectar
      </Button>
    )}
  </div>
  {/* --- AÑADE ESTE NUEVO DIV --- */}
  <div className="p-4 bg-gray-900/50 rounded-lg flex items-center justify-between">
    <div className="flex items-center gap-3">
      <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center">
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24"><path fill="#4285F4" d="M21.35,11.1H12.18V13.83H18.69C18.36,17.64 15.19,19.27 12.19,19.27C8.36,19.27 5.03,16.25 5.03,12.5C5.03,8.75 8.36,5.73 12.19,5.73C15.22,5.73 17.1,6.74 17.1,6.74L19,4.42C19,4.42 16.58,2.77 12.19,2.77C6.8,2.77 2.63,7.15 2.63,12.5C2.63,17.85 6.8,22.23 12.19,22.23C17.6,22.23 21.5,18.33 21.5,12.79C21.5,12.33 21.45,11.71 21.35,11.1Z"/></svg>
      </div>
      <div>
        <p className="font-medium text-white">Google Business Profile</p>
        <p className="text-sm text-gray-400">Publica en tu perfil de Google.</p>
      </div>
    </div>
    {isGoogleBusinessConnected ? (
      <div className="flex items-center gap-2 text-green-400 font-semibold">
        <CheckCircle className="w-5 h-5"/>
        <span>Conectado</span>
      </div>
    ) : (
      <Button onClick={handleConnectGoogleBusiness}>
        <LinkIcon className="w-4 h-4 mr-2"/>
        Conectar
      </Button>
    )}
  </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}