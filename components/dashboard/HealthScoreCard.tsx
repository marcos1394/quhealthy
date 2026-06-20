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
        <Card className="bg-white dark:bg-[#0a0a0a] border border-black dark:border-white rounded-none shadow-none relative overflow-hidden h-full">
            <CardContent className="p-8 md:p-10 flex flex-col items-center justify-center text-center h-full">
                <div className="flex justify-between w-full items-start mb-6">
                    <div className="border border-black dark:border-white px-2 py-1 text-[9px] font-bold uppercase tracking-widest text-black dark:text-white flex items-center">
                        <ShieldCheck className="w-3 h-3 mr-2" /> Excellent
                    </div>
                    <div className="p-2 border border-black dark:border-white bg-gray-50 dark:bg-[#050505] text-black dark:text-white">
                        <Activity className="w-4 h-4" />
                    </div>
                </div>

                <div className="relative flex items-center justify-center w-40 h-40 mb-8">
                    {/* Background Circle */}
                    <svg className="absolute inset-0 w-full h-full transform -rotate-90">
                        <circle
                            cx="80"
                            cy="80"
                            r={radius}
                            stroke="currentColor"
                            strokeWidth="4"
                            fill="transparent"
                            className="text-gray-200 dark:text-gray-800"
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
                            strokeLinecap="square"
                            className="text-black dark:text-white"
                        />
                    </svg>
                    <div className="absolute flex flex-col items-center justify-center">
                        <motion.span
                            initial={{ opacity: 0, scale: 0.5 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: 0.5, duration: 0.5 }}
                            className="text-5xl font-bold tracking-tight text-black dark:text-white pb-1"
                        >
                            {score}
                        </motion.span>
                        <span className="text-[10px] font-bold uppercase tracking-widest text-gray-500">/ 100</span>
                    </div>
                </div>

                <h3 className="text-xl font-semibold tracking-tight text-black dark:text-white mb-2">{title}</h3>
                <p className="text-xs font-light text-gray-500 dark:text-gray-400 max-w-[200px]">
                    {subtitle}
                </p>

                <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-800 w-full flex items-center justify-center gap-3">
                    <TrendingUp className="w-4 h-4 text-black dark:text-white" />
                    <span className="text-[10px] font-bold uppercase tracking-widest text-black dark:text-white">Top 15% of users</span>
                </div>
            </CardContent>
        </Card>
    );
};
