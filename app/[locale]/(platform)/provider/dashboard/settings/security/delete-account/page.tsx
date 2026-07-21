"use client";

import React, { useState } from "react";
import { useTranslations } from "next-intl";
import { motion } from "framer-motion";
import { UserX, ArrowLeft, AlertTriangle } from "lucide-react";
import Link from "next/link";
import { toast } from "react-hot-toast";
import { useForm } from "react-hook-form";
import { useRouter } from "next/navigation";

import { securityService } from "@/services/security.service";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/hooks/useAuth";

export default function DeleteAccountPage() {
  const t = useTranslations("SettingsSecurity");
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { logout } = useAuth(); // Assuming there's a useAuth hook to clear local state

  const { register, handleSubmit, formState: { errors } } = useForm();

  const onSubmit = async (data: any) => {
    // Check if the user really typed 'ELIMINAR' or 'DELETE' if needed, here we just use password.
    try {
      setLoading(true);
      await securityService.deleteAccount(data.password);
      toast.success("Tu cuenta ha sido eliminada. Lamentamos verte partir.");
      
      // Cleanup & Redirect
      if (logout) {
        await logout();
      }
      router.push("/");
    } catch (error: any) {
      toast.error(error.response?.data?.error || "Error al eliminar la cuenta. Verifica tu contraseña.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-transparent p-4 md:p-8 font-sans">
      <div className="max-w-xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex items-center space-x-4 mb-4">
          <Link href="/provider/dashboard/settings" className="p-2 border border-black dark:border-white hover:bg-black/5 dark:hover:bg-white/5 transition-colors">
            <ArrowLeft className="w-5 h-5 text-black dark:text-white" />
          </Link>
          <div className="p-3 bg-red-600 border border-red-600 w-fit">
            <UserX className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold uppercase tracking-tighter text-red-600 dark:text-red-500">
              Eliminar Cuenta
            </h1>
            <p className="text-[10px] uppercase font-bold tracking-widest text-gray-500 dark:text-gray-400 mt-1">
              Zona de Peligro
            </p>
          </div>
        </div>

        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
          <form onSubmit={handleSubmit(onSubmit)}>
            <Card className="bg-transparent border-red-600/50 rounded-none">
              <CardHeader className="bg-red-50 dark:bg-red-950/20">
                <div className="flex items-center space-x-2 text-red-600 dark:text-red-500 mb-2">
                  <AlertTriangle className="w-5 h-5" />
                  <CardTitle className="text-lg font-bold uppercase tracking-tight">
                    Advertencia
                  </CardTitle>
                </div>
                <CardDescription className="text-xs uppercase tracking-wide mt-1 text-red-600/80 dark:text-red-400/80">
                  Esta acción es irreversible. Todos tus datos, historial de consultas, pacientes y configuraciones serán eliminados permanentemente.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6 pt-6">
                
                <div className="space-y-2">
                  <Label className="text-xs uppercase font-bold tracking-widest text-red-600 dark:text-red-400">
                    Ingresa tu contraseña para confirmar
                  </Label>
                  <Input 
                    type="password"
                    placeholder="Tu contraseña actual"
                    className="rounded-none border-red-600/30 focus-visible:ring-red-600" 
                    {...register("password", { required: "La contraseña es requerida para esta acción" })}
                  />
                  {errors.password && <p className="text-red-500 text-[10px] uppercase font-bold">{errors.password.message as string}</p>}
                </div>

              </CardContent>
              <CardFooter className="bg-red-50 dark:bg-red-950/20 border-t border-red-600/20 p-4">
                <Button 
                  type="submit" 
                  disabled={loading}
                  variant="destructive"
                  className="w-full rounded-none uppercase text-[10px] tracking-widest font-bold bg-red-600 hover:bg-red-700"
                >
                  {loading ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  ) : (
                    <>
                      <UserX className="w-4 h-4 mr-2" />
                      Eliminar Mi Cuenta Permanentemente
                    </>
                  )}
                </Button>
              </CardFooter>
            </Card>
          </form>
        </motion.div>
      </div>
    </div>
  );
}
