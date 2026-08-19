"use client";

/* eslint-disable react-doctor/button-has-type */

import React, { useState, useMemo } from "react";
import { useTranslations } from "next-intl";
import { motion, AnimatePresence } from "framer-motion";
import {
  Bell,
  Menu,
  Search,
  User,
  LogOut,
  Settings,
  CreditCard,
  HelpCircle,
  Sparkles,
  Calendar,
  Users,
  X,
} from "lucide-react";

import { Sidebar } from "./Sidebar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { LanguageToggle } from "@/components/ui/LanguageToggle";
import { ThemeToggle } from "@/components/ui/ThemeToggle";
import { cn } from "@/lib/utils";

export const Header = () => {
  const t = useTranslations("PlatformHeader");

  const [searchFocused, setSearchFocused] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [notificationsOpen, setNotificationsOpen] = useState(false);

  const mockNotifications = useMemo(
    () => [
      {
        id: 1,
        type: "appointment",
        message: t("notif_appointment"),
        time: t("time_mins", { time: 5 }),
        unread: true,
      },
      {
        id: 2,
        type: "review",
        message: t("notif_review"),
        time: t("time_hours", { time: 1 }),
        unread: true,
      },
      {
        id: 3,
        type: "payment",
        message: t("notif_payment"),
        time: t("time_hours", { time: 2 }),
        unread: false,
      },
    ],
    [t]
  );

  const searchSuggestions = useMemo(
    () => [
      { type: "patient", label: "Juan Pérez", icon: User },
      {
        type: "appointment",
        label: t("suggestion_today_appointments"),
        icon: Calendar,
      },
      { type: "setting", label: t("suggestion_settings"), icon: Settings },
    ],
    [t]
  );

  const unreadCount = mockNotifications.filter((n) => n.unread).length;

  return (
    <header className="h-14 border-b border-gray-100 dark:border-gray-800 bg-white/90 dark:bg-[#0a0a0a]/90 backdrop-blur-md sticky top-0 z-40 flex items-center justify-between px-4 md:px-6 shadow-2xs transition-colors font-sans select-none">
      {/* ── SECCIÓN IZQUIERDA: MENÚ MÓVIL Y BUSCADOR ──────────────────── */}
      <div className="flex items-center gap-3 flex-1">
        {/* Menú Desplegable Móvil */}
        <div className="md:hidden">
          <Sheet>
            <SheetTrigger asChild>
              <Button
                type="button"
                aria-label="Abrir menú de navegación"
                variant="ghost"
                size="icon"
                className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl h-9 w-9 cursor-pointer"
              >
                <Menu className="w-4 h-4" strokeWidth={2} />
              </Button>
            </SheetTrigger>
            <SheetContent
              position="left"
              className="p-0 bg-white dark:bg-[#0a0a0a] border-r border-gray-100 dark:border-gray-800 w-72"
            >
              <Sidebar />
            </SheetContent>
          </Sheet>
        </div>

        {/* Buscador de Escritorio */}
        <div className="hidden md:block relative flex-1 max-w-md">
          <div className="relative">
            <Search
              className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-emerald-600 dark:text-emerald-400 pointer-events-none"
              strokeWidth={2}
            />
            <Input
              placeholder={t("search_placeholder")}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onFocus={() => setSearchFocused(true)}
              onBlur={() => setTimeout(() => setSearchFocused(false), 200)}
              className={cn(
                "pl-10 pr-10 bg-gray-50/60 dark:bg-[#050505] border-gray-200 dark:border-gray-800 text-gray-900 dark:text-white rounded-xl h-9 text-xs font-semibold focus-visible:ring-2 focus-visible:ring-emerald-500/20 focus-visible:border-emerald-500 transition-all shadow-2xs placeholder:text-gray-400 placeholder:font-normal"
              )}
            />

            {searchQuery && (
              <Button
                type="button"
                aria-label="Limpiar búsqueda"
                variant="ghost"
                size="icon"
                onClick={() => setSearchQuery("")}
                className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7 text-gray-400 hover:text-gray-900 dark:hover:text-white rounded-lg cursor-pointer"
              >
                <X className="w-3.5 h-3.5" strokeWidth={2} />
              </Button>
            )}

            {!searchFocused && !searchQuery && (
              <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-0.5 text-[10px] text-gray-400 font-mono pointer-events-none">
                <kbd className="px-1.5 py-0.5 bg-gray-100 dark:bg-gray-800 rounded-md border border-gray-200 dark:border-gray-700 font-bold">
                  ⌘K
                </kbd>
              </div>
            )}
          </div>

          {/* Menú de Sugerencias de Búsqueda */}
          <AnimatePresence>
            {searchFocused && (
              <motion.div
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -5 }}
                transition={{ duration: 0.15, ease: "easeOut" }}
                className="absolute top-full mt-2 w-full bg-white dark:bg-[#0a0a0a] border border-gray-100 dark:border-gray-800 rounded-2xl shadow-xl overflow-hidden z-50 p-1.5"
              >
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider px-3 py-1.5">
                  {t("suggestions_title")}
                </p>
                {searchSuggestions.map((s, i) => {
                  const SIcon = s.icon;
                  return (
                    <button
                      key={i}
                      type="button"
                      className="w-full flex items-center gap-3 px-3 py-2 text-xs font-bold text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-[#050505] rounded-xl transition-colors text-left cursor-pointer"
                    >
                      <div className="p-1.5 bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-100 dark:border-emerald-900/30 rounded-lg text-emerald-600 dark:text-emerald-400 shrink-0">
                        <SIcon className="w-3.5 h-3.5" strokeWidth={2} />
                      </div>
                      <span className="truncate">{s.label}</span>
                      <kbd className="ml-auto px-1.5 py-0.5 bg-gray-100 dark:bg-gray-800 rounded-md text-[10px] text-gray-400 font-mono font-bold">
                        ↵
                      </kbd>
                    </button>
                  );
                })}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* ── SECCIÓN DERECHA: NOTIFICACIONES Y PERFIL DE USUARIO ────────── */}
      <div className="flex items-center gap-1.5 sm:gap-2">
        {/* Botón de Búsqueda Móvil */}
        <div className="md:hidden">
          <Button
            type="button"
            aria-label="Buscar"
            variant="ghost"
            size="icon"
            className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl h-9 w-9 cursor-pointer"
          >
            <Search className="w-4 h-4" strokeWidth={2} />
          </Button>
        </div>

        {/* Selector de Idioma y Tema */}
        <LanguageToggle />
        <ThemeToggle />

        {/* Notificaciones */}
        <DropdownMenu
          open={notificationsOpen}
          onOpenChange={setNotificationsOpen}
        >
          <DropdownMenuTrigger asChild>
            <Button
              type="button"
              aria-label="Abrir notificaciones"
              variant="ghost"
              size="icon"
              className="relative text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl h-9 w-9 cursor-pointer"
            >
              <Bell className="w-4 h-4" strokeWidth={2} />
              {unreadCount > 0 && (
                <motion.div
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="absolute -top-0.5 -right-0.5"
                >
                  <Badge className="bg-emerald-600 dark:bg-emerald-500 text-white text-[10px] font-mono font-bold px-1.5 min-w-[16px] h-4 flex items-center justify-center border-2 border-white dark:border-[#0a0a0a] rounded-full shadow-2xs">
                    {unreadCount}
                  </Badge>
                </motion.div>
              )}
            </Button>
          </DropdownMenuTrigger>

          <DropdownMenuContent
            className="w-80 bg-white dark:bg-[#0a0a0a] border-gray-100 dark:border-gray-800 text-gray-900 dark:text-white p-0 rounded-2xl shadow-xl font-sans"
            align="end"
          >
            <div className="p-3.5 border-b border-gray-100 dark:border-gray-800 bg-gray-50/60 dark:bg-[#050505]">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold text-gray-900 dark:text-white tracking-tight">
                  {t("notifications_title")}
                </h3>
                {unreadCount > 0 && (
                  <span className="bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-900/40 px-2 py-0.5 rounded-full text-[10px] font-bold font-mono shadow-2xs">
                    {t("notifications_new", { count: unreadCount })}
                  </span>
                )}
              </div>
            </div>

            <div className="max-h-80 overflow-y-auto custom-scrollbar divide-y divide-gray-100 dark:divide-gray-800">
              {mockNotifications.map((n) => (
                <button
                  key={n.id}
                  type="button"
                  className={cn(
                    "w-full flex items-start gap-3 p-3.5 text-left transition-colors cursor-pointer",
                    n.unread
                      ? "bg-emerald-50/30 dark:bg-emerald-950/10 hover:bg-emerald-50/50 dark:hover:bg-emerald-950/20"
                      : "hover:bg-gray-50 dark:hover:bg-[#050505]"
                  )}
                >
                  <div
                    className={cn(
                      "p-2 rounded-xl shrink-0 border shadow-2xs",
                      n.type === "appointment"
                        ? "bg-sky-50 dark:bg-sky-950/30 text-sky-600 dark:text-sky-400 border-sky-100 dark:border-sky-900/40"
                        : "",
                      n.type === "review"
                        ? "bg-amber-50 dark:bg-amber-950/30 text-amber-600 dark:text-amber-400 border-amber-100 dark:border-amber-900/40"
                        : "",
                      n.type === "payment"
                        ? "bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-400 border-emerald-100 dark:border-emerald-900/40"
                        : ""
                    )}
                  >
                    {n.type === "appointment" && (
                      <Calendar className="w-3.5 h-3.5" strokeWidth={2} />
                    )}
                    {n.type === "review" && (
                      <Sparkles className="w-3.5 h-3.5" strokeWidth={2} />
                    )}
                    {n.type === "payment" && (
                      <CreditCard className="w-3.5 h-3.5" strokeWidth={2} />
                    )}
                  </div>

                  <div className="flex-1 min-w-0 space-y-0.5">
                    <p
                      className={cn(
                        "text-xs leading-snug",
                        n.unread
                          ? "font-bold text-gray-900 dark:text-white"
                          : "font-medium text-gray-600 dark:text-gray-400"
                      )}
                    >
                      {n.message}
                    </p>
                    <p className="text-[10px] font-semibold font-mono text-gray-400">
                      {n.time}
                    </p>
                  </div>

                  {n.unread && (
                    <div className="w-1.5 h-1.5 bg-emerald-600 dark:bg-emerald-400 rounded-full shrink-0 mt-1.5" />
                  )}
                </button>
              ))}
            </div>

            <div className="p-2 border-t border-gray-100 dark:border-gray-800 bg-gray-50/60 dark:bg-[#050505]">
              <Button
                type="button"
                variant="ghost"
                className="w-full text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 dark:hover:text-emerald-300 hover:bg-emerald-50 dark:hover:bg-emerald-950/30 text-xs font-bold h-9 rounded-xl cursor-pointer"
              >
                {t("view_all_notifications")}
              </Button>
            </div>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Menú Desplegable de Usuario */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              type="button"
              aria-label="Menú de usuario"
              variant="ghost"
              className="relative h-9 gap-2.5 pl-1.5 pr-3 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 cursor-pointer"
            >
              <Avatar className="h-7 w-7 border border-gray-200 dark:border-gray-700">
                <AvatarImage src="/avatars/01.png" alt="Usuario" />
                <AvatarFallback className="bg-emerald-600 text-white font-bold text-xs">
                  DR
                </AvatarFallback>
              </Avatar>
              <span className="hidden sm:block text-xs font-bold text-gray-900 dark:text-white truncate">
                Dr. Marcos
              </span>
            </Button>
          </DropdownMenuTrigger>

          <DropdownMenuContent
            className="w-64 bg-white dark:bg-[#0a0a0a] border-gray-100 dark:border-gray-800 text-gray-900 dark:text-white p-0 rounded-2xl shadow-xl font-sans"
            align="end"
            forceMount
          >
            {/* Header Perfil */}
            <div className="p-4 bg-gray-50/60 dark:bg-[#050505] border-b border-gray-100 dark:border-gray-800 space-y-3">
              <div className="flex items-start gap-3">
                <Avatar className="h-10 w-10 border border-gray-200 dark:border-gray-700 shadow-2xs">
                  <AvatarImage src="/avatars/01.png" alt="Dr. Marcos Sandoval" />
                  <AvatarFallback className="bg-emerald-600 text-white font-bold text-xs">
                    DR
                  </AvatarFallback>
                </Avatar>

                <div className="flex-1 min-w-0 space-y-0.5">
                  <p className="text-xs font-bold text-gray-900 dark:text-white truncate">
                    {t("user_title")}
                  </p>
                  <p className="text-[11px] text-gray-500 dark:text-gray-400 font-mono truncate">
                    {t("user_email")}
                  </p>

                  <span className="inline-flex items-center gap-1 bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-900/40 px-2 py-0.5 rounded-full text-[10px] font-bold shadow-2xs mt-1">
                    <Sparkles className="w-2.5 h-2.5 text-emerald-600 dark:text-emerald-400" strokeWidth={2} />
                    <span>{t("plan_premium")}</span>
                  </span>
                </div>
              </div>
            </div>

            {/* Métricas Rápidas */}
            <div className="grid grid-cols-3 gap-1.5 p-2.5 border-b border-gray-100 dark:border-gray-800">
              {[
                { value: "24", label: t("stat_today") },
                { value: "4.8", label: t("stat_rating") },
                { value: "156", label: t("stat_patients") },
              ].map((s) => (
                <div
                  key={s.label}
                  className="text-center p-2 bg-gray-50/60 dark:bg-[#050505] rounded-xl border border-gray-100 dark:border-gray-800/80 shadow-2xs"
                >
                  <p className="text-xs font-mono font-bold text-gray-900 dark:text-white">
                    {s.value}
                  </p>
                  <p className="text-[9px] text-gray-400 font-bold uppercase tracking-wider">
                    {s.label}
                  </p>
                </div>
              ))}
            </div>

            {/* Accesos Rápidos */}
            <div className="p-1.5 space-y-0.5">
              {[
                {
                  icon: User,
                  label: t("menu_profile"),
                  color: "text-emerald-600 dark:text-emerald-400",
                },
                {
                  icon: Calendar,
                  label: t("menu_calendar"),
                  color: "text-sky-600 dark:text-sky-400",
                },
                {
                  icon: Users,
                  label: t("menu_patients"),
                  color: "text-indigo-600 dark:text-indigo-400",
                },
              ].map((item) => (
                <DropdownMenuItem
                  key={item.label}
                  className="cursor-pointer hover:bg-gray-50 dark:hover:bg-[#050505] focus:bg-gray-50 dark:focus:bg-[#050505] rounded-xl px-3 py-2 text-xs font-bold text-gray-800 dark:text-gray-200"
                >
                  <item.icon className={cn("mr-2.5 h-4 w-4", item.color)} strokeWidth={2} />
                  <span>{item.label}</span>
                </DropdownMenuItem>
              ))}
            </div>

            <Separator className="bg-gray-100 dark:bg-gray-800" />

            <div className="p-1.5 space-y-0.5">
              {[
                { icon: Settings, label: t("menu_settings") },
                { icon: CreditCard, label: t("menu_billing") },
                { icon: HelpCircle, label: t("menu_help") },
              ].map((item) => (
                <DropdownMenuItem
                  key={item.label}
                  className="cursor-pointer hover:bg-gray-50 dark:hover:bg-[#050505] focus:bg-gray-50 dark:focus:bg-[#050505] rounded-xl px-3 py-2 text-xs font-semibold text-gray-700 dark:text-gray-300"
                >
                  <item.icon className="mr-2.5 h-4 w-4 text-gray-400" strokeWidth={2} />
                  <span>{item.label}</span>
                </DropdownMenuItem>
              ))}
            </div>

            <Separator className="bg-gray-100 dark:bg-gray-800" />

            <div className="p-1.5">
              <DropdownMenuItem className="text-rose-600 dark:text-rose-400 focus:text-rose-600 dark:focus:text-rose-400 focus:bg-rose-50 dark:focus:bg-rose-950/30 cursor-pointer rounded-xl px-3 py-2 text-xs font-bold">
                <LogOut className="mr-2.5 h-4 w-4" strokeWidth={2} />
                <span>{t("menu_logout")}</span>
              </DropdownMenuItem>
            </div>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
};