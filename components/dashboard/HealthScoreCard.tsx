"use client";

import React from "react";
import { motion } from "framer-motion";
import { Activity, ShieldCheck, TrendingUp } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export const HealthScoreCard = ({ score = 85, title = "Health Score", subtitle = "Based on your recent activity" }) => {
    // Calculate SVG stroke dasharray and dashoffset
    const radius = 60;
    const circumference = 2 * Math.PI * radius;
    const strokeDashoffset = circumference - (score / 100) * circumference;

    return (
        <Card className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 shadow-sm relative overflow-hidden group h-full">
            <CardContent className="p-6 md:p-8 flex flex-col items-center justify-center text-center h-full">
                <div className="flex justify-between w-full items-start mb-4">
                    <Badge variant="outline" className="bg-medical-50 dark:bg-medical-500/10 text-medical-600 dark:text-medical-400 border-medical-200 dark:border-medical-500/20 text-xs font-semibold">
                        <ShieldCheck className="w-3 h-3 mr-1" /> Excellent
                    </Badge>
                    <div className="p-1.5 bg-slate-50 dark:bg-slate-800 rounded-lg text-slate-400">
                        <Activity className="w-4 h-4" />
                    </div>
                </div>

                <div className="relative flex items-center justify-center w-40 h-40 mb-4">
                    {/* Background Circle */}
                    <svg className="absolute inset-0 w-full h-full transform -rotate-90">
                        <circle
                            cx="80"
                            cy="80"
                            r={radius}
                            stroke="currentColor"
                            strokeWidth="12"
                            fill="transparent"
                            className="text-slate-100 dark:text-slate-800"
                        />
                        {/* Progress Circle */}
                        <motion.circle
                            initial={{ strokeDashoffset: circumference }}
                            animate={{ strokeDashoffset }}
                            transition={{ duration: 1.5, ease: "easeOut" }}
                            cx="80"
                            cy="80"
                            r={radius}
                            stroke="currentColor"
                            strokeWidth="12"
                            fill="transparent"
                            strokeDasharray={circumference}
                            strokeLinecap="round"
                            className="text-medical-500"
                        />
                    </svg>
                    <div className="absolute flex flex-col items-center justify-center">
                        <motion.span
                            initial={{ opacity: 0, scale: 0.5 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: 0.5, duration: 0.5 }}
                            className="text-4xl font-bold text-slate-900 dark:text-white pb-1"
                        >
                            {score}
                        </motion.span>
                        <span className="text-xs font-medium text-slate-400 uppercase tracking-wider">/ 100</span>
                    </div>
                </div>

                <h3 className="text-lg font-semibold text-slate-900 dark:text-white">{title}</h3>
                <p className="text-sm font-light text-slate-500 dark:text-slate-400 mt-1 max-w-[200px]">
                    {subtitle}
                </p>

                <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-800 w-full flex items-center justify-center gap-2">
                    <TrendingUp className="w-4 h-4 text-emerald-500" />
                    <span className="text-xs font-medium text-slate-600 dark:text-slate-300">Top 15% of users</span>
                </div>
            </CardContent>
        </Card>
    );
};
