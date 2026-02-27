"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Bell, Menu, Search, User, LogOut, Settings, CreditCard, HelpCircle, Sparkles, Calendar, Users, X } from "lucide-react";
import { Sidebar } from "./Sidebar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

const mockNotifications = [
  { id: 1, type: "appointment", message: "New appointment scheduled", time: "5 min", unread: true },
  { id: 2, type: "review", message: "New review received", time: "1h", unread: true },
  { id: 3, type: "payment", message: "Payment processed", time: "2h", unread: false }
];

const searchSuggestions = [
  { type: "patient", label: "Juan Pérez", icon: User },
  { type: "appointment", label: "Today's appointments", icon: Calendar },
  { type: "setting", label: "Settings", icon: Settings }
];

export const Header = () => {
  const [searchFocused, setSearchFocused] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const unreadCount = mockNotifications.filter(n => n.unread).length;

  return (
    <header className="h-14 border-b border-slate-200 dark:border-slate-800 bg-white/95 dark:bg-slate-950/95 backdrop-blur-xl sticky top-0 z-40 flex items-center justify-between px-4 md:px-6 shadow-sm transition-colors">
      {/* Left */}
      <div className="flex items-center gap-3 flex-1">
        <div className="md:hidden">
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="default" className="text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg h-9 w-9">
                <Menu className="w-4 h-4" />
              </Button>
            </SheetTrigger>
            <SheetContent className="p-0 bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-800 w-72">
              <Sidebar />
            </SheetContent>
          </Sheet>
        </div>

        <div className="hidden md:block relative flex-1 max-w-xl">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <Input placeholder="Search patients, appointments or settings..."
              value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
              onFocus={() => setSearchFocused(true)} onBlur={() => setTimeout(() => setSearchFocused(false), 200)}
              className={cn("pl-9 pr-9 bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-200 rounded-lg h-9 text-sm transition-all",
                searchFocused ? "border-medical-500 ring-1 ring-medical-500/20" : "")} />
            {searchQuery && (
              <Button variant="ghost" size="default" onClick={() => setSearchQuery("")}
                className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7 text-slate-400 hover:text-slate-900 dark:hover:text-white">
                <X className="w-3 h-3" />
              </Button>
            )}
            {!searchFocused && !searchQuery && (
              <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-0.5 text-[10px] text-slate-400">
                <kbd className="px-1 py-0.5 bg-slate-100 dark:bg-slate-700 rounded border border-slate-200 dark:border-slate-600 font-mono">⌘K</kbd>
              </div>
            )}
          </div>
          <AnimatePresence>
            {searchFocused && (
              <motion.div initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -5 }}
                className="absolute top-full mt-1.5 w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl shadow-lg overflow-hidden">
                <div className="p-1.5">
                  <p className="text-[10px] font-medium text-slate-400 uppercase tracking-wider px-2.5 py-1.5">Suggestions</p>
                  {searchSuggestions.map((s, i) => {
                    const SIcon = s.icon;
                    return (
                      <button key={i} className="w-full flex items-center gap-2.5 px-2.5 py-2 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-lg transition-colors text-left">
                        <div className="p-1.5 bg-slate-100 dark:bg-slate-800 rounded-lg"><SIcon className="w-3.5 h-3.5 text-slate-500" /></div>
                        <span className="font-medium text-sm">{s.label}</span>
                        <kbd className="ml-auto px-1 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-[10px] text-slate-400 font-mono">↵</kbd>
                      </button>
                    );
                  })}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Right */}
      <div className="flex items-center gap-1.5">
        <div className="md:hidden">
          <Button variant="ghost" size="default" className="text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg h-9 w-9">
            <Search className="w-4 h-4" />
          </Button>
        </div>

        {/* Notifications */}
        <DropdownMenu open={notificationsOpen} onOpenChange={setNotificationsOpen}>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="default" className="relative text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg h-9 w-9">
              <Bell className="w-4 h-4" />
              {unreadCount > 0 && (
                <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="absolute -top-0.5 -right-0.5">
                  <Badge className="bg-medical-600 dark:bg-medical-500 text-white text-[10px] px-1 min-w-[16px] h-4 flex items-center justify-center border-2 border-white dark:border-slate-950">
                    {unreadCount}
                  </Badge>
                </motion.div>
              )}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-72 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-200 p-0" align="end">
            <div className="p-3 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold text-slate-900 dark:text-white">Notifications</h3>
                {unreadCount > 0 && <Badge className="bg-medical-50 dark:bg-medical-500/10 text-medical-600 dark:text-medical-400 border-0 text-xs">{unreadCount} new</Badge>}
              </div>
            </div>
            <div className="max-h-80 overflow-y-auto">
              {mockNotifications.map((n, i) => (
                <button key={n.id}
                  className={cn("w-full flex items-start gap-2.5 p-3 text-left transition-colors",
                    n.unread ? "bg-medical-50/50 dark:bg-medical-500/5 hover:bg-medical-50 dark:hover:bg-medical-500/10" : "hover:bg-slate-50 dark:hover:bg-slate-800",
                    i !== mockNotifications.length - 1 ? "border-b border-slate-100 dark:border-slate-800" : "")}>
                  <div className={cn("p-1.5 rounded-lg flex-shrink-0",
                    n.type === "appointment" ? "bg-blue-50 dark:bg-blue-500/10" : "",
                    n.type === "review" ? "bg-emerald-50 dark:bg-emerald-500/10" : "",
                    n.type === "payment" ? "bg-medical-50 dark:bg-medical-500/10" : "")}>
                    {n.type === "appointment" && <Calendar className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />}
                    {n.type === "review" && <Sparkles className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />}
                    {n.type === "payment" && <CreditCard className="w-3.5 h-3.5 text-medical-600 dark:text-medical-400" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className={cn("text-sm", n.unread ? "font-medium text-slate-900 dark:text-white" : "text-slate-600 dark:text-slate-300 font-light")}>{n.message}</p>
                    <p className="text-xs text-slate-400 mt-0.5 font-light">{n.time} ago</p>
                  </div>
                  {n.unread && <div className="w-1.5 h-1.5 bg-medical-600 dark:bg-medical-400 rounded-full flex-shrink-0 mt-1.5" />}
                </button>
              ))}
            </div>
            <div className="p-2 border-t border-slate-100 dark:border-slate-800">
              <Button variant="ghost" className="w-full text-medical-600 dark:text-medical-400 hover:text-medical-700 dark:hover:text-medical-300 hover:bg-medical-50 dark:hover:bg-medical-500/10 text-xs font-medium">
                View all notifications
              </Button>
            </div>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* User Dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="relative h-9 gap-2 pl-1.5 pr-2.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800">
              <Avatar className="h-7 w-7 border border-slate-200 dark:border-slate-700">
                <AvatarImage src="/avatars/01.png" alt="@user" />
                <AvatarFallback className="bg-medical-600 dark:bg-medical-500 text-white font-semibold text-xs">DR</AvatarFallback>
              </Avatar>
              <span className="hidden sm:block text-sm font-medium text-slate-900 dark:text-white">Dr. Marcos</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-64 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-200 p-0" align="end" forceMount>
            <div className="p-3.5 bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-800">
              <div className="flex items-start gap-2.5">
                <Avatar className="h-10 w-10 border border-slate-200 dark:border-slate-700">
                  <AvatarImage src="/avatars/01.png" alt="@user" />
                  <AvatarFallback className="bg-medical-600 dark:bg-medical-500 text-white font-semibold">DR</AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-slate-900 dark:text-white mb-0.5">Dr. Marcos Sandoval</p>
                  <p className="text-xs text-slate-500 truncate font-light">m.sandoval@quhealthy.com</p>
                  <Badge className="bg-medical-50 dark:bg-medical-500/10 text-medical-600 dark:text-medical-400 border-0 mt-1.5 text-[10px]">
                    <Sparkles className="w-2.5 h-2.5 mr-1" />Premium Plan
                  </Badge>
                </div>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-1.5 p-2.5 border-b border-slate-100 dark:border-slate-800">
              {[{ value: "24", label: "Today" }, { value: "4.8", label: "Rating" }, { value: "156", label: "Patients" }].map(s => (
                <div key={s.label} className="text-center p-1.5 bg-slate-50 dark:bg-slate-800 rounded-lg">
                  <p className="text-sm font-semibold text-slate-900 dark:text-white">{s.value}</p>
                  <p className="text-[9px] text-slate-500 uppercase tracking-wider font-medium">{s.label}</p>
                </div>
              ))}
            </div>
            <div className="p-1.5">
              {[{ icon: User, label: "My Profile", color: "text-medical-600 dark:text-medical-400" },
              { icon: Calendar, label: "Calendar", color: "text-blue-600 dark:text-blue-400" },
              { icon: Users, label: "Patients", color: "text-emerald-600 dark:text-emerald-400" }].map(item => (
                <DropdownMenuItem key={item.label} className="cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800 focus:bg-slate-50 dark:focus:bg-slate-800 rounded-lg px-2.5 py-2">
                  <item.icon className={cn("mr-2.5 h-3.5 w-3.5", item.color)} /><span className="font-medium text-sm">{item.label}</span>
                </DropdownMenuItem>
              ))}
            </div>
            <Separator className="bg-slate-100 dark:bg-slate-800" />
            <div className="p-1.5">
              {[{ icon: Settings, label: "Settings" }, { icon: CreditCard, label: "Billing" }, { icon: HelpCircle, label: "Help & Support" }].map(item => (
                <DropdownMenuItem key={item.label} className="cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800 focus:bg-slate-50 dark:focus:bg-slate-800 rounded-lg px-2.5 py-2">
                  <item.icon className="mr-2.5 h-3.5 w-3.5 text-slate-400" /><span className="text-sm font-light">{item.label}</span>
                </DropdownMenuItem>
              ))}
            </div>
            <Separator className="bg-slate-100 dark:bg-slate-800" />
            <div className="p-1.5">
              <DropdownMenuItem className="text-red-600 dark:text-red-400 focus:text-red-600 dark:focus:text-red-400 focus:bg-red-50 dark:focus:bg-red-500/10 cursor-pointer rounded-lg px-2.5 py-2 font-medium">
                <LogOut className="mr-2.5 h-3.5 w-3.5" />Log Out
              </DropdownMenuItem>
            </div>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
};