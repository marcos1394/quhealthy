"use client";
/* eslint-disable react-doctor/rerender-defer-reads-hook */

import React, { useState, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ShieldCheck, Loader2, ArrowRight, LockKeyhole } from "lucide-react";
import { toast } from "react-toastify";
import { Turnstile } from "@marsidev/react-turnstile";
import { setAuthCookies } from "@/app/actions/auth-cookies";
import apiClient from "@/lib/axios";
import { useSessionStore } from "@/stores/SessionStore";

export default function AdminLoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();

  const [captchaToken, setCaptchaToken] = useState<string>("");
  const turnstileRef = useRef<any>(null);
  const isIntentionalSubmitRef = useRef(false);

  const processLogin = async (token: string) => {
    try {
      const response = await apiClient.post("/api/auth/admin/login", {
        email,
        password,
        captchaToken: token,
      });

      // The backend returns { token, refreshToken, role }
      // Ensure cookies/tokens are set securely via server action
      await setAuthCookies(response.data.role, response.data.refreshToken);

      // 🚀 FIX: Save the token in the session store so axios intercepts it!
      useSessionStore.getState().updateToken({
        token: response.data.token,
        role: response.data.role,
        status: "ACTIVE" as any,
      });

      toast.success("Bienvenido al panel de administración");

      const callbackUrl = searchParams.get("callbackUrl");
      if (callbackUrl) {
        router.push(callbackUrl);
      } else {
        router.push("/admin/dashboard");
      }
    } catch (error: any) {
      console.error("Error logging in admin:", error);
      const msg =
        error.response?.data?.message ||
        "Credenciales inválidas o sin permisos.";
      toast.error(msg);
      // Reset state on error
      turnstileRef.current?.reset();
      setCaptchaToken("");
      isIntentionalSubmitRef.current = false;
    } finally {
      setIsLoading(false);
    }
  };

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    isIntentionalSubmitRef.current = true;
    turnstileRef.current?.execute();
  };

  return (
    <div className="min-h-screen bg-white flex flex-col justify-center items-center p-4 selection:bg-medical-500/30">
      {/* Ambient Background */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute top-1/4 left-1/4 w-[50%] h-[50%] rounded-full bg-slate-100 blur-[120px]" />
        <div className="absolute bottom-1/4 right-1/4 w-[50%] h-[50%] rounded-full bg-slate-50 blur-[120px]" />
      </div>

      <div className="w-full max-w-md relative z-10">
        <div className="flex justify-center mb-8">
          <div className="w-16 h-16 bg-white border border-slate-200 rounded-2xl flex items-center justify-center shadow-lg">
            <ShieldCheck className="w-8 h-8 text-slate-800" />
          </div>
        </div>

        <div className="text-center mb-10">
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">
            QuHealthy Admin
          </h1>
          <p className="text-slate-500 mt-2">
            Acceso restringido a personal autorizado
          </p>
        </div>

        <div className="bg-white border border-slate-200 rounded-3xl p-8 shadow-xl backdrop-blur-xl">
          <form onSubmit={handleLoginSubmit} className="space-y-6">
            <div className="space-y-1">
              <label className="text-sm font-semibold text-slate-700 ml-1">
                Correo Corporativo
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@quhealthy.org"
                className="w-full h-14 bg-white border border-slate-300 rounded-2xl px-4 text-slate-900 placeholder-slate-400 focus:outline-none focus:border-slate-800 focus:ring-1 focus:ring-slate-800 transition-all"
              />
            </div>

            <div className="space-y-1">
              <label className="text-sm font-semibold text-slate-700 ml-1">
                Contraseña
              </label>
              <div className="relative">
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full h-14 bg-white border border-slate-300 rounded-2xl pl-12 pr-4 text-slate-900 placeholder-slate-400 focus:outline-none focus:border-slate-800 focus:ring-1 focus:ring-slate-800 transition-all"
                />
                <LockKeyhole className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              </div>
            </div>

            <Turnstile
              ref={turnstileRef}
              siteKey={process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY || ""}
              onSuccess={(token) => {
                setCaptchaToken(token);
                if (isIntentionalSubmitRef.current) {
                  processLogin(token);
                }
              }}
              onError={(errorCode) => {
                console.error("Turnstile error code:", errorCode);
                toast.error(
                  "Error al validar la seguridad. Por favor, intenta de nuevo.",
                );
                setIsLoading(false);
                isIntentionalSubmitRef.current = false;
                turnstileRef.current?.reset();
              }}
              options={{
                theme: "auto",
                size: "invisible",
                execution: "execute",
              }}
            />

            <button
              type="submit"
              disabled={isLoading || !email || !password}
              className="w-full h-14 bg-slate-900 hover:bg-slate-800 text-white rounded-full font-bold flex items-center justify-center gap-2 transition-all disabled:opacity-50 disabled:hover:bg-slate-900 shadow-md"
            >
              {isLoading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <>
                  Ingresar al Dashboard
                  <ArrowRight className="w-5 h-5" />
                </>
              )}
            </button>
          </form>
        </div>

        <p className="text-center text-slate-500 text-xs mt-8">
          &copy; {new Date().getFullYear()} QuHealthy Inc. Todos los derechos
          reservados.
        </p>
      </div>
    </div>
  );
}
