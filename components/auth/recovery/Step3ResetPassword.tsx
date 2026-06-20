"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Eye, EyeOff, Loader2, ArrowRight } from "lucide-react";
import { toast } from "react-toastify";
import { useTranslations } from "next-intl";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
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

  const rulesMessages = [ "8 CHARS", "A-Z", "0-9" ];

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
    <motion.form 
      key="step3" 
      initial={{ opacity: 0, x: 20 }} 
      animate={{ opacity: 1, x: 0 }} 
      exit={{ opacity: 0, x: -20 }} 
      transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      onSubmit={handleSubmit} 
      className="space-y-8"
    >
      
      <div className="space-y-3 group relative">
        <label className="text-[10px] font-bold uppercase tracking-widest text-gray-400 dark:text-gray-500 block group-focus-within:text-black dark:group-focus-within:text-white transition-colors">
          {t('new_password_label')}
        </label>
        <div className="relative">
          <input 
            type={showPassword ? "text" : "password"} 
            value={newPassword} 
            onChange={(e) => setNewPassword(e.target.value)} 
            placeholder={t('new_password_placeholder')}
            className="w-full bg-transparent border-0 border-b border-gray-300 dark:border-gray-800 py-3 pr-10 text-lg font-light outline-none transition-colors focus:border-black dark:focus:border-white text-black dark:text-white placeholder:text-gray-300 dark:placeholder:text-gray-700" 
            required 
          />
          <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-0 top-1/2 -translate-y-1/2 text-gray-400 hover:text-black dark:hover:text-white transition-colors">
            {showPassword ? <EyeOff size={18} strokeWidth={1.5} /> : <Eye size={18} strokeWidth={1.5} />}
          </button>
        </div>
        
        {/* Architect Badges */}
        <div className="flex flex-wrap gap-3 pt-2">
          {passwordValidation.map((rule, idx) => (
            <span 
              key={idx} 
              className={cn(
                "text-[9px] font-bold uppercase tracking-widest pb-1 border-b-2 transition-all", 
                rule.valid ? "border-black text-black dark:border-white dark:text-white" : "border-gray-200 text-gray-400 dark:border-gray-800 dark:text-gray-600"
              )}
            >
              {rulesMessages[idx]}
            </span>
          ))}
        </div>
      </div>

      <div className="space-y-2 group relative">
        <label className="text-[10px] font-bold uppercase tracking-widest text-gray-400 dark:text-gray-500 block group-focus-within:text-black dark:group-focus-within:text-white transition-colors">
          {t('confirm_password_label')}
        </label>
        <div className="relative">
          <input 
            type={showConfirmPassword ? "text" : "password"} 
            value={confirmPassword} 
            onChange={(e) => setConfirmPassword(e.target.value)} 
            placeholder={t('confirm_password_placeholder')}
            className={cn(
              "w-full bg-transparent border-0 border-b py-3 pr-10 text-lg font-light outline-none transition-colors placeholder:text-gray-300 dark:placeholder:text-gray-700", 
              confirmPassword && newPassword !== confirmPassword 
                ? "border-red-500 text-red-500" 
                : "border-gray-300 dark:border-gray-800 focus:border-black dark:focus:border-white text-black dark:text-white"
            )}
            required 
          />
          <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="absolute right-0 top-1/2 -translate-y-1/2 text-gray-400 hover:text-black dark:hover:text-white transition-colors">
            {showConfirmPassword ? <EyeOff size={18} strokeWidth={1.5} /> : <Eye size={18} strokeWidth={1.5} />}
          </button>
        </div>
        {confirmPassword && newPassword !== confirmPassword && (
          <p className="text-[10px] font-bold uppercase tracking-widest text-red-500 mt-2">
            {t('passwords_not_match')}
          </p>
        )}
      </div>

      {error && (
        <Alert variant="destructive" className="bg-transparent border border-red-500/50 text-red-600 dark:text-red-400 rounded-none mt-6">
          <AlertDescription className="text-xs font-medium tracking-wide">{error}</AlertDescription>
        </Alert>
      )}

      <Button 
        type="submit" 
        disabled={loading || !passwordValidation.every(r => r.valid) || newPassword !== confirmPassword} 
        className="w-full flex items-center justify-between bg-black hover:bg-black/90 dark:bg-white dark:text-black dark:hover:bg-gray-100 text-white rounded-none h-14 px-6 text-xs font-bold uppercase tracking-widest transition-all group/btn mt-10"
      >
        {loading ? (
          <span className="flex items-center"><Loader2 className="animate-spin mr-3 w-4 h-4" />{t('updating')}</span>
        ) : (
          <>
            <span>{t('reset_password_button')}</span>
            <ArrowRight className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
          </>
        )}
      </Button>
    </motion.form>
  );
}