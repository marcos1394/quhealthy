"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Users, Calendar, Settings, FileText, X } from "lucide-react";
import { Button } from "@/components/ui/button";

export const QuickActions = () => {
    const router = useRouter();
    const [isOpen, setIsOpen] = useState(false);

    const actions = [
        { icon: Calendar, label: "New Appointment", href: "/provider/appointments?action=new", color: "text-blue-500", bg: "bg-blue-50 dark:bg-blue-500/10" },
        { icon: Users, label: "Add Patient", href: "/provider/patients?action=new", color: "text-emerald-500", bg: "bg-emerald-50 dark:bg-emerald-500/10" },
        { icon: FileText, label: "Upload Document", href: "/provider/documents?action=upload", color: "text-amber-500", bg: "bg-amber-50 dark:bg-amber-500/10" },
        { icon: Settings, label: "Store Settings", href: "/provider/store", color: "text-purple-500", bg: "bg-purple-50 dark:bg-purple-500/10" },
    ];

    return (
        <div className="fixed bottom-6 lg:bottom-10 right-6 lg:right-10 z-50">
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: 15, scale: 0.9 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 15, scale: 0.9 }}
                        transition={{ type: "spring", stiffness: 300, damping: 25 }}
                        className="absolute bottom-16 right-0 mb-2 w-56 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xl overflow-hidden"
                    >
                        <div className="p-3 bg-slate-50 dark:bg-slate-800/50 border-b border-slate-100 dark:border-slate-800">
                            <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Quick Actions</h4>
                        </div>
                        <div className="p-2 space-y-1">
                            {actions.map((action, idx) => (
                                <button
                                    key={idx}
                                    onClick={() => {
                                        setIsOpen(false);
                                        router.push(action.href);
                                    }}
                                    className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors group text-left"
                                >
                                    <div className={`p-1.5 rounded-lg ${action.bg}`}>
                                        <action.icon className={`w-4 h-4 ${action.color}`} />
                                    </div>
                                    <span className="text-sm font-medium text-slate-700 dark:text-slate-300 group-hover:text-slate-900 dark:group-hover:text-white transition-colors">
                                        {action.label}
                                    </span>
                                </button>
                            ))}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setIsOpen(!isOpen)}
                className="w-14 h-14 bg-medical-600 dark:bg-medical-500 text-white rounded-full shadow-lg flex items-center justify-center hover:bg-medical-700 dark:hover:bg-medical-600 transition-colors border-4 border-white dark:border-slate-950"
                aria-label="Toggle quick actions"
            >
                <motion.div
                    animate={{ rotate: isOpen ? 45 : 0 }}
                    transition={{ type: "spring", stiffness: 300, damping: 20 }}
                >
                    <Plus className="w-6 h-6" />
                </motion.div>
            </motion.button>
        </div>
    );
};
