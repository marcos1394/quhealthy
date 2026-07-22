"use client";

import React, { useState, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Shield, Bell, Database, Watch } from "lucide-react";
import { SecuritySettings } from "@/components/settings/SecuritySettings";
import { NotificationSettings } from "@/components/settings/NotificationSettings";
import { PrivacySettings } from "@/components/settings/PrivacySettings";
import { WearablesSettings } from "@/components/settings/WearablesSettings";
import { consumerProfileService } from "@/services/consumerProfile.service";
import { toast } from "react-toastify";
import { Loader2 } from "lucide-react";

export default function SettingsPage() {
 const [activeTab, setActiveTab] = useState("security");
 const [profile, setProfile] = useState<any>(null);
 const [isLoading, setIsLoading] = useState(true);

 useEffect(() => {
 fetchProfile();
 }, []);

 const fetchProfile = async () => {
 try {
 const data = await consumerProfileService.getProfile();
 setProfile(data);
 } catch (error) {
 console.error("Error fetching profile", error);
 } finally {
 setIsLoading(false);
 }
 };

 const handleConsentChange = async (accepted: boolean) => {
 if (!profile) return false;
 try {
 const updated = await consumerProfileService.updateProfile({ ...profile, algorithmicConsentAccepted: accepted });
 setProfile(updated);
 toast.success(accepted ? "Consentimiento otorgado." : "Consentimiento revocado.");
 return true;
 } catch (error) {
 console.error("Error updating consent", error);
 return false;
 }
 };

 if (isLoading) {
 return (
 <div className="flex h-[50vh] items-center justify-center">
 <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
 </div>
 );
 }

 return (
 <div className="max-w-5xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
 <div className="mb-8">
 <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
 Configuración
 </h1>
 <p className="text-base text-gray-500 mt-2">
 Administra tu seguridad, privacidad y preferencias de la plataforma.
 </p>
 </div>

 <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-8">
 <TabsList className="bg-transparent border-b border-gray-100 dark:border-gray-800 w-full justify-start h-auto p-0 rounded-none overflow-x-auto flex-nowrap gap-6">
 <TabsTrigger 
 value="security"
 className="rounded-none border-b-2 border-transparent data-[state=active]:border-emerald-600 dark:data-[state=active]:border-emerald-500 data-[state=active]:bg-transparent data-[state=active]:shadow-none px-2 py-4 text-sm font-semibold text-gray-500 data-[state=active]:text-emerald-700 dark:data-[state=active]:text-emerald-400 flex items-center gap-2 hover:text-gray-700 dark:hover:text-gray-300 transition-colors"
 >
 <Shield className="w-4 h-4" /> Seguridad
 </TabsTrigger>
 <TabsTrigger 
 value="notifications"
 className="rounded-none border-b-2 border-transparent data-[state=active]:border-emerald-600 dark:data-[state=active]:border-emerald-500 data-[state=active]:bg-transparent data-[state=active]:shadow-none px-2 py-4 text-sm font-semibold text-gray-500 data-[state=active]:text-emerald-700 dark:data-[state=active]:text-emerald-400 flex items-center gap-2 hover:text-gray-700 dark:hover:text-gray-300 transition-colors"
 >
 <Bell className="w-4 h-4" /> Notificaciones
 </TabsTrigger>
 <TabsTrigger 
 value="privacy"
 className="rounded-none border-b-2 border-transparent data-[state=active]:border-emerald-600 dark:data-[state=active]:border-emerald-500 data-[state=active]:bg-transparent data-[state=active]:shadow-none px-2 py-4 text-sm font-semibold text-gray-500 data-[state=active]:text-emerald-700 dark:data-[state=active]:text-emerald-400 flex items-center gap-2 hover:text-gray-700 dark:hover:text-gray-300 transition-colors"
 >
 <Database className="w-4 h-4" /> Privacidad
 </TabsTrigger>
 <TabsTrigger 
 value="wearables"
 className="rounded-none border-b-2 border-transparent data-[state=active]:border-emerald-600 dark:data-[state=active]:border-emerald-500 data-[state=active]:bg-transparent data-[state=active]:shadow-none px-2 py-4 text-sm font-semibold text-gray-500 data-[state=active]:text-emerald-700 dark:data-[state=active]:text-emerald-400 flex items-center gap-2 hover:text-gray-700 dark:hover:text-gray-300 transition-colors"
 >
 <Watch className="w-4 h-4" /> Integraciones
 </TabsTrigger>
 </TabsList>

 <TabsContent value="security" className="mt-0 focus-visible:ring-0">
 <SecuritySettings />
 </TabsContent>
 
 <TabsContent value="notifications" className="mt-0 focus-visible:ring-0">
 <NotificationSettings />
 </TabsContent>
 
 <TabsContent value="privacy" className="mt-0 focus-visible:ring-0">
 <PrivacySettings 
 algorithmicConsent={profile?.algorithmicConsentAccepted ?? false} 
 onConsentChange={handleConsentChange} 
 />
 </TabsContent>
 
 <TabsContent value="wearables" className="mt-0 focus-visible:ring-0">
 <WearablesSettings />
 </TabsContent>
 </Tabs>
 </div>
 );
}
