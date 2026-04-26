"use client";

import React from "react";
import { useTranslations } from "next-intl";
import { motion } from "framer-motion";
import { 
  ShieldAlert, 
  ShieldCheck,
  Shield,
  CheckCircle2,
  TrendingDown,
  FileText
} from "lucide-react";

import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface CancellationPolicyProps {
  policyText: string;
  onChange: (text: string) => void;
}

export function CancellationPolicySection({ policyText, onChange }: CancellationPolicyProps) {
  const t = useTranslations('StorePolicies.Section');
  
  const charCount = policyText?.length || 0;
  const charLimit = 800;

  // --- PLANTILLAS LEGALES DINÁMICAS (Ahora dentro para usar 't') ---
  const POLICY_TEMPLATES = [
    {
      id: "flexible",
      name: t('templates.flexible.name'),
      icon: Shield,
      color: "text-emerald-500 dark:text-emerald-400",
      bgColor: "bg-emerald-50 dark:bg-emerald-500/10",
      borderColor: "border-emerald-200 dark:border-emerald-500/30",
      shadowColor: "shadow-emerald-500/10",
      text: t('templates.flexible.text')
    },
    {
      id: "moderate",
      name: t('templates.moderate.name'),
      icon: ShieldCheck,
      color: "text-blue-500 dark:text-blue-400",
      bgColor: "bg-blue-50 dark:bg-blue-500/10",
      borderColor: "border-blue-200 dark:border-blue-500/30",
      shadowColor: "shadow-blue-500/10",
      text: t('templates.moderate.text')
    },
    {
      id: "strict",
      name: t('templates.strict.name'),
      icon: ShieldAlert,
      color: "text-purple-500 dark:text-purple-400",
      bgColor: "bg-purple-50 dark:bg-purple-500/10",
      borderColor: "border-purple-200 dark:border-purple-500/30",
      shadowColor: "shadow-purple-500/10",
      text: t('templates.strict.text')
    }
  ];

  return (
    <Card className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 shadow-xl">
      <CardHeader>
        <div className="flex items-start gap-3">
          <motion.div
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ type: "spring", stiffness: 200 }}
            className="p-2 bg-gradient-to-br from-red-50 to-orange-50 dark:from-red-500/10 dark:to-orange-500/10 rounded-xl border border-red-100 dark:border-red-500/20"
          >
            <ShieldAlert className="w-5 h-5 text-red-500 dark:text-red-400" />
          </motion.div>
          <div>
            <CardTitle className="text-xl font-black text-slate-900 dark:text-white mb-1">
              {t('title')}
            </CardTitle>
            <CardDescription className="text-slate-500 dark:text-slate-400">
              {t('description')}
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-6 pt-2">
        
        {/* Plantillas Rápidas */}
        <div className="space-y-3">
          <Label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
            {t('templates_label')}
          </Label>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {POLICY_TEMPLATES.map((template) => {
              const Icon = template.icon;
              const isSelected = policyText === template.text;

              return (
                <motion.button
                  key={template.id}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => onChange(template.text)}
                  className={cn(
                    "flex flex-col items-start gap-3 p-4 rounded-xl border text-left transition-all duration-200 relative overflow-hidden",
                    isSelected 
                      ? `${template.bgColor} ${template.borderColor} shadow-lg ${template.shadowColor}` 
                      : "bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700"
                  )}
                >
                  <div className="flex items-center gap-2">
                    <Icon className={cn("w-5 h-5", template.color)} />
                    <span className="font-bold text-slate-900 dark:text-white">{template.name}</span>
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-500 line-clamp-3">
                    {template.text}
                  </p>
                  {isSelected && (
                    <div className="absolute top-3 right-3">
                      <CheckCircle2 className={cn("w-5 h-5", template.color)} />
                    </div>
                  )}
                </motion.button>
              );
            })}
          </div>
        </div>

        {/* Editor Personalizado */}
        <div className="space-y-3 pt-4">
          <div className="flex justify-between items-center">
            <Label className="flex items-center gap-2 text-sm font-bold text-slate-900 dark:text-white">
              <FileText className="w-4 h-4 text-purple-500 dark:text-purple-400" />
              {t('editor_label')}
            </Label>
            <span className={cn(
              "text-xs font-semibold",
              charCount > charLimit ? "text-red-500 dark:text-red-400" : "text-slate-500"
            )}>
              {charCount}/{charLimit}
            </span>
          </div>
          
          <Textarea 
            value={policyText || ""}
            onChange={(e) => onChange(e.target.value)}
            placeholder={t('editor_placeholder')}
            className="bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-700 resize-none min-h-[150px] focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 text-slate-900 dark:text-slate-300 leading-relaxed"
          />
          <p className="text-xs text-slate-500 dark:text-slate-500">
            {t('editor_hint')}
          </p>
        </div>

        {/* Tip Educativo */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-blue-50 dark:bg-blue-500/10 border border-blue-200 dark:border-blue-500/20 rounded-xl p-4 flex items-start gap-3 mt-6"
        >
          <TrendingDown className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
          <div className="text-xs text-blue-800 dark:text-blue-300/80">
            <p className="font-semibold text-blue-700 dark:text-blue-400 mb-1">
              {t('tip_title')}
            </p>
            <p dangerouslySetInnerHTML={{ __html: t('tip_desc') }} />
          </div>
        </motion.div>

      </CardContent>
    </Card>
  );
}