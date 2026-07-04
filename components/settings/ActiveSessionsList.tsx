"use client";

import React, { useEffect, useState } from "react";
import { Laptop, Smartphone, Globe, Monitor, ShieldOff, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "react-toastify";
import { securityService } from "@/services/security.service";
import { ActiveSessionResponse } from "@/types/security";

export function ActiveSessionsList() {
 const [sessions, setSessions] = useState<ActiveSessionResponse[]>([]);
 const [isLoading, setIsLoading] = useState(true);
 const [isRevoking, setIsRevoking] = useState<string | null>(null);

 useEffect(() => {
 fetchSessions();
 }, []);

 const fetchSessions = async () => {
 try {
 const data = await securityService.getActiveSessions();
 setSessions(data);
 } catch (error) {
 console.error("Error fetching sessions", error);
 toast.error("No se pudieron cargar las sesiones activas.");
 } finally {
 setIsLoading(false);
 }
 };

 const handleRevoke = async (sessionId: string) => {
 setIsRevoking(sessionId);
 try {
 await securityService.revokeSession(sessionId);
 toast.success("Sesión revocada exitosamente.");
 setSessions(prev => prev.filter(s => s.sessionId !== sessionId));
 } catch (error) {
 toast.error("Error al revocar la sesión.");
 } finally {
 setIsRevoking(null);
 }
 };

 const handleRevokeAll = async () => {
 setIsRevoking('ALL');
 try {
 await securityService.revokeAllExceptCurrent();
 toast.success("Todas las demás sesiones fueron revocadas.");
 setSessions(prev => prev.filter(s => s.current));
 } catch (error) {
 toast.error("Error al revocar sesiones.");
 } finally {
 setIsRevoking(null);
 }
 };

 if (isLoading) {
 return (
 <div className="py-8 flex justify-center">
 <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
 </div>
 );
 }

 const otherSessions = sessions.filter(s => !s.current);

 return (
 <div className="space-y-6">
 <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
 <div>
 <h3 className="text-sm font-semibold text-black dark:text-white uppercase tracking-tight">Sesiones Activas</h3>
 <p className="text-xs text-gray-500 mt-1">Dispositivos con acceso a tu cuenta.</p>
 </div>
 {otherSessions.length > 0 && (
 <Button 
 variant="outline" 
 onClick={handleRevokeAll}
 disabled={isRevoking === 'ALL'}
 className="rounded-none border border-black dark:border-white h-8 text-[9px] font-bold uppercase tracking-widest hover:bg-black hover:text-white transition-colors"
 >
 {isRevoking === 'ALL' ? <Loader2 className="w-3 h-3 animate-spin" /> : "Revocar Restantes"}
 </Button>
 )}
 </div>

 <div className="border border-gray-200 dark:border-gray-800 bg-white dark:bg-[#0a0a0a] divide-y divide-gray-200 dark:divide-gray-800">
 {sessions.map((session) => (
 <div key={session.sessionId} className="p-4 sm:p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-colors hover:bg-gray-50 dark:hover:bg-[#050505]">
 <div className="flex items-start gap-4">
 <div className="w-10 h-10 border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-black flex items-center justify-center shrink-0">
 {session.deviceName?.toLowerCase().includes('mac') || session.deviceName?.toLowerCase().includes('windows') ? (
 <Laptop className="w-5 h-5 text-gray-600 dark:text-gray-400" strokeWidth={1.5} />
 ) : session.deviceName?.toLowerCase().includes('iphone') || session.deviceName?.toLowerCase().includes('android') ? (
 <Smartphone className="w-5 h-5 text-gray-600 dark:text-gray-400" strokeWidth={1.5} />
 ) : (
 <Monitor className="w-5 h-5 text-gray-600 dark:text-gray-400" strokeWidth={1.5} />
 )}
 </div>
 <div>
 <h4 className="text-sm font-semibold text-black dark:text-white uppercase tracking-tight">
 {session.deviceName || "Dispositivo Desconocido"}
 </h4>
 <div className="flex items-center gap-2 mt-1">
 <span className="text-[10px] font-bold uppercase tracking-widest text-gray-500">
 {session.ipAddress}
 </span>
 <span className="w-1 h-1 rounded-full bg-gray-300 dark:bg-gray-700" />
 <span className="text-[10px] font-medium text-gray-400">
 Última vez: {new Date(session.lastActiveAt).toLocaleString()}
 </span>
 </div>
 {session.current && (
 <span className="inline-block mt-2 text-[9px] font-bold uppercase tracking-widest text-green-600 border border-green-600 px-2 py-0.5">
 Este dispositivo
 </span>
 )}
 </div>
 </div>
 
 {!session.current && (
 <Button 
 variant="outline" 
 onClick={() => handleRevoke(session.sessionId)}
 disabled={isRevoking === session.sessionId}
 className="rounded-none border-gray-300 dark:border-gray-700 h-8 text-[9px] font-bold uppercase tracking-widest hover:text-red-600 hover:border-red-600 transition-colors self-start sm:self-auto"
 >
 {isRevoking === session.sessionId ? <Loader2 className="w-3 h-3 animate-spin" /> : "Revocar"}
 </Button>
 )}
 </div>
 ))}
 </div>
 </div>
 );
}
