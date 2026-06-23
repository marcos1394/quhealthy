"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { Mail, Phone, ArrowRight, Loader2 } from "lucide-react";
import { toast } from "react-toastify";
import { useTranslations } from "next-intl";
import { useAuth } from "@/hooks/useAuth";
import { Turnstile } from '@marsidev/react-turnstile';
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface Props {
  email: string;
  setEmail: (val: string) => void;
  deliveryMethod: 'OTP_EMAIL' | 'OTP_SMS';
  setDeliveryMethod: (val: 'OTP_EMAIL' | 'OTP_SMS') => void;
  onSuccess: () => void;
}

export default function Step1SendCode({ email, setEmail, deliveryMethod, setDeliveryMethod, onSuccess }: Props) {
  const t = useTranslations('AuthForgotPassword');
  const { sendRecoveryCode } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [captchaToken, setCaptchaToken] = useState<string>("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true); setError("");

    try {
      await sendRecoveryCode({ email, deliveryMethod, captchaToken });
      toast.success(t('code_sent_title'));
      onSuccess();
    } catch (err: any) {
      setError(err.message || "Error al enviar el código");
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.form 
      key="step1" 
      initial={{ opacity: 0, x: 20 }} 
      animate={{ opacity: 1, x: 0 }} 
      exit={{ opacity: 0, x: -20 }} 
      transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      onSubmit={handleSubmit} 
      className="space-y-8"
    >
      <div className="space-y-2 group">
        <label className="text-[10px] font-bold uppercase tracking-widest text-gray-400 dark:text-gray-500 block group-focus-within:text-black dark:group-focus-within:text-white transition-colors">
          {t('recovery_method_label')}
        </label>
        <Select value={deliveryMethod} onValueChange={(val: any) => setDeliveryMethod(val)}>
          <SelectTrigger className="h-14 bg-transparent border-0 border-b border-gray-300 dark:border-gray-800 text-black dark:text-white rounded-none shadow-none focus:ring-0 focus:border-black dark:focus:border-white px-0 text-lg font-light transition-colors">
            <SelectValue placeholder={t('select_method_placeholder')} />
          </SelectTrigger>
          <SelectContent className="bg-white dark:bg-[#0a0a0a] border-gray-200 dark:border-gray-800 rounded-none shadow-xl">
            <SelectItem value="OTP_EMAIL" className="focus:bg-gray-100 dark:focus:bg-gray-900 cursor-pointer">
              <div className="flex items-center gap-3 text-black dark:text-white py-1">
                <Mail className="w-4 h-4 opacity-50" />
                <span className="font-light">{t('email_method')}</span>
              </div>
            </SelectItem>
            <SelectItem value="OTP_SMS" className="focus:bg-gray-100 dark:focus:bg-gray-900 cursor-pointer">
              <div className="flex items-center gap-3 text-black dark:text-white py-1">
                <Phone className="w-4 h-4 opacity-50" />
                <span className="font-light">{t('sms_method')}</span>
              </div>
            </SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2 group relative">
        <label className="text-[10px] font-bold uppercase tracking-widest text-gray-400 dark:text-gray-500 block group-focus-within:text-black dark:group-focus-within:text-white transition-colors">
          {deliveryMethod === "OTP_EMAIL" ? t('your_email_label') : t('your_phone_label')}
        </label>
        <div className="relative">
          <input
            type={deliveryMethod === "OTP_EMAIL" ? "email" : "tel"}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder={deliveryMethod === "OTP_EMAIL" ? t('email_placeholder') : t('phone_placeholder')}
            className="w-full bg-transparent border-0 border-b border-gray-300 dark:border-gray-800 py-3 text-lg font-light outline-none transition-colors focus:border-black dark:focus:border-white text-black dark:text-white placeholder:text-gray-300 dark:placeholder:text-gray-700"
            required
          />
        </div>
      </div>

      {error && (
        <Alert variant="destructive" className="bg-transparent border border-red-500/50 text-red-600 dark:text-red-400 rounded-none">
          <AlertDescription className="text-xs font-medium tracking-wide">{error}</AlertDescription>
        </Alert>
      )}

      {/* Turnstile Invisible Captcha */}
      <Turnstile
        siteKey={process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY || ""}
        onSuccess={(token) => setCaptchaToken(token)}
        options={{ theme: 'auto', size: 'invisible' }}
      />

      <Button
        type="submit"
        disabled={loading || !email || !captchaToken}
        className="w-full flex items-center justify-between bg-black hover:bg-black/90 dark:bg-white dark:text-black dark:hover:bg-gray-100 text-white rounded-none h-14 px-6 text-xs font-bold uppercase tracking-widest transition-all group/btn mt-8"
      >
        {loading ? (
          <span className="flex items-center"><Loader2 className="animate-spin mr-3 w-4 h-4" />{t('sending')}</span>
        ) : (
          <>
            <span>{t('send_code_button')}</span>
            <ArrowRight className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
          </>
        )}
      </Button>
    </motion.form>
  );
}