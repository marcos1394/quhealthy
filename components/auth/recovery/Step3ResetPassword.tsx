"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Lock, Eye, EyeOff, Loader2, Sparkles, Check, AlertCircle } from "lucide-react";
import { toast } from "react-toastify";
import { useTranslations } from "next-intl";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { cn } from "@/lib/utils";

interface Props {
  resetToken: string;
}

export default function Step3ResetPassword({ resetToken }: Props) {
  const router = useRouter();
  const t = useTranslations('AuthForgotPassword');
  const { recoveryResetPassword } = useAuth();
  
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const passwordRulesConfig = [ { regex: /.{8,}/ }, { regex: /[A-Z]/ }, { regex: /\d/ } ];
  const [passwordValidation, setPasswordValidation] = useState(passwordRulesConfig.map(r => ({ ...r, valid: false })));

  const rulesMessages = [ t('new_password_placeholder'), "A-Z", "0-9" ];

  useEffect(() => {
    setPasswordValidation(passwordRulesConfig.map(rule => ({ ...rule, valid: rule.regex.test(newPassword) })));
  }, [newPassword]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!passwordValidation.every(r => r.valid) || newPassword !== confirmPassword) return;
    setLoading(true); setError("");

    try {
      await recoveryResetPassword({ token: resetToken, newPassword });
      toast.success(t('reset_password_button'), { position: "top-center" });
      setTimeout(() => router.push("/login"), 2000);
    } catch (err: any) {
      setError(err.message || "Error al actualizar contraseña");
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.form key="step3" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} onSubmit={handleSubmit} className="space-y-6">
      
      <div className="space-y-2">
        <Label className="text-slate-700 dark:text-slate-300 font-medium">{t('new_password_label')}</Label>
        <div className="relative">
          <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
          <Input 
            type={showPassword ? "text" : "password"} 
            value={newPassword} 
            onChange={(e) => setNewPassword(e.target.value)} 
            placeholder={t('new_password_placeholder')}
            className="pl-11 pr-12 h-14 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white focus:border-medical-500 focus:ring-medical-500/20 rounded-xl" 
            required 
          />
          <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">
            {showPassword ? <EyeOff size={20} strokeWidth={1.5} /> : <Eye size={20} strokeWidth={1.5} />}
          </button>
        </div>
        
        {/* Badges de Validación Restaurados */}
        <div className="flex flex-wrap gap-2 mt-2">
          {passwordValidation.map((rule, idx) => (
            <span key={idx} className={cn("flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-md transition-all", rule.valid ? "bg-medical-50 text-medical-600 dark:bg-medical-500/10 dark:text-medical-400" : "bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400")}>
              {rule.valid && <Check size={12} strokeWidth={2} />}
              {rulesMessages[idx]}
            </span>
          ))}
        </div>
      </div>

      <div className="space-y-2">
        <Label className="text-slate-700 dark:text-slate-300 font-medium">{t('confirm_password_label')}</Label>
        <div className="relative">
          <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
          <Input 
            type={showConfirmPassword ? "text" : "password"} 
            value={confirmPassword} 
            onChange={(e) => setConfirmPassword(e.target.value)} 
            placeholder={t('confirm_password_placeholder')}
            className={cn("pl-11 pr-12 h-14 bg-white dark:bg-slate-900 text-slate-900 dark:text-white rounded-xl", confirmPassword && newPassword !== confirmPassword ? "border-red-500 focus:border-red-500 focus:ring-red-500/20" : "border-slate-200 dark:border-slate-800 focus:border-medical-500 focus:ring-medical-500/20")}
            required 
          />
          <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">
            {showConfirmPassword ? <EyeOff size={20} strokeWidth={1.5} /> : <Eye size={20} strokeWidth={1.5} />}
          </button>
        </div>
        {confirmPassword && newPassword !== confirmPassword && (
          <p className="text-xs text-red-500 flex items-center gap-1.5 mt-1">
            <AlertCircle className="w-3 h-3" />{t('passwords_not_match')}
          </p>
        )}
      </div>

      {error && (
        <Alert variant="destructive" className="bg-red-50 text-red-900 border-red-200 dark:bg-red-900/20 dark:border-red-900 dark:text-red-200">
          <AlertDescription className="text-sm font-medium">{error}</AlertDescription>
        </Alert>
      )}

      <Button 
        type="submit" 
        disabled={loading || !passwordValidation.every(r => r.valid) || newPassword !== confirmPassword} 
        className="w-full h-14 text-base font-semibold text-white bg-slate-900 hover:bg-slate-800 dark:bg-white dark:text-slate-900 dark:hover:bg-slate-100 shadow-none rounded-xl mt-4"
      >
        {loading ? (
          <><Loader2 className="animate-spin mr-2 w-5 h-5" />{t('updating')}</>
        ) : (
          <><Sparkles className="mr-2 w-5 h-5 text-yellow-500 dark:text-yellow-600" />{t('reset_password_button')}</>
        )}
      </Button>
    </motion.form>
  );
}