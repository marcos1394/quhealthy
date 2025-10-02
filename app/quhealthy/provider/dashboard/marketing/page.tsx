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


  
  // Verificamos si la conexión fue exitosa al volver de Facebook
  useEffect(() => {
    const success = searchParams.get('success');
    const error = searchParams.get('error');
    if (success) {
      toast.success("¡Cuenta de Facebook/Instagram conectada exitosamente!");
      fetchSession(); // Recargamos la sesión para ver el nuevo estado
      router.replace('/provider/dashboard/marketing'); // Limpiamos la URL
    }
        else if (success === 'linkedin') { // Para LinkedIn
      toast.success("¡Cuenta de LinkedIn conectada exitosamente!");
      fetchSession();
      router.replace('/provider/dashboard/marketing');
    if (error) {
      toast.error("No se pudo conectar la cuenta.");
      router.replace('/provider/dashboard/marketing');
    }
}}, [searchParams, router, fetchSession]);

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

  const isFacebookConnected = user?.socialConnections?.some(c => c.platform === 'facebook');
    const isLinkedInConnected = user?.socialConnections?.some(c => c.platform === 'linkedin');


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

  // --- NUEVA FUNCIÓN PARA PROGRAMAR EL POST ---
  const handleSchedulePost = async () => {
    if (!generatedContent || !publishAt) {
      toast.warn("Por favor, genera contenido y selecciona una fecha para programar.");
      return;
    }
    
    // Asumimos que la primera conexión de FB/IG es la que usaremos
    const connection = user?.socialConnections?.find(c => c.platform === 'facebook');
    if (!connection) {
      toast.error("No se encontró una cuenta de red social conectada.");
      return;
    }

    setIsScheduling(true);
    try {
      await axios.post('/api/social/schedule-post', {
        socialConnectionId: connection.id, // Necesitarás que la sesión devuelva el ID de la conexión
        content: generatedContent.postText,
        imageUrl: generatedContent.imageUrl,
        publishAt: new Date(publishAt).toISOString(),
      }, { withCredentials: true });

      toast.success("¡Publicación programada exitosamente!");
      setGeneratedContent(null); // Limpiamos el formulario
      setPublishAt('');
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
              <div className="mt-4 pt-4 border-t border-dashed border-gray-600 space-y-2">
                <Label htmlFor="publishAt">3. Programa tu publicación</Label>
                <Input
                  id="publishAt"
                  type="datetime-local"
                  value={publishAt}
                  onChange={(e) => setPublishAt(e.target.value)}
                  className="bg-gray-700 border-gray-600"
                />
              </div>
              <Button onClick={handleSchedulePost} disabled={isScheduling || !publishAt}>
                {isScheduling ? <Loader2 className="animate-spin mr-2"/> : <CalendarClock className="w-4 h-4 mr-2"/>}
                Programar Publicación
              </Button>
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
        </CardContent>
      </Card>
    </motion.div>
  );
}