"use client";

import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface PreferenceCardProps {
 icon: React.ElementType;
 title: string;
 description: string;
 children: React.ReactNode;
 className?: string;
 badge?: string;
 highlighted?: boolean;
 onClick?: () => void;
}

export const PreferenceCardCompact: React.FC<PreferenceCardProps> = (props) => {
 const { icon: Icon, title, description, children, className, badge, highlighted } = props;

 return (
 <Card 
 className={cn(
 "bg-slate-900/50 border-slate-800 shadow-md transition-all duration-300",
 "hover:border-slate-700",
 highlighted ? "border-purple-500/30 bg-purple-500/5" : "",
 className ? "" + className : ""
 )}
 >
 <CardContent className="p-4">
 <div className="flex items-start gap-3">
 <div className={cn(
 "p-2 rounded-lg shrink-0",
 "bg-gradient-to-br from-medical-500/10 to-medical-600/10",
 "border border-purple-500/20"
 )}>
 <Icon className="w-5 h-5 text-purple-400" />
 </div>
 
 <div className="flex-1 space-y-2 min-w-0">
 <div className="flex items-center gap-2">
 <h4 className="text-sm font-bold text-white">{title}</h4>
 {badge && (
 <Badge variant="outline" className="bg-purple-500/10 text-purple-400 border-purple-500/20 text-xs">
 {badge}
 </Badge>
 )}
 </div>
 <p className="text-xs text-slate-500">{description}</p>
 <div className="space-y-2">
 {children}
 </div>
 </div>
 </div>
 </CardContent>
 </Card>
 );
};
