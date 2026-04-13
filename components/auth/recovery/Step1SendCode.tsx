"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { Mail, Phone, ArrowRight, Loader2 } from "lucide-react";
import { toast } from "react-toastify";
import { useTranslations } from "next-intl";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true); setError("");

    try {
      await sendRecoveryCode({ email, deliveryMethod });
      toast.success(t('code_sent_title'));
      onSuccess();
    } catch (err: any) {
      setError(err.message || "Error al enviar el código");
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.form key="step1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} onSubmit={handleSubmit} className="space-y-5">
      <div className="space-y-2">
        <Label className="text-slate-700 dark:text-slate-300 font-medium">{t('recovery_method_label')}</Label>
        <Select value={deliveryMethod} onValueChange={(val: any) => setDeliveryMethod(val)}>
          <SelectTrigger className="h-14 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white focus:border-medical-500 focus:ring-medical-500/20 rounded-xl">
            <SelectValue placeholder={t('select_method_placeholder')} />
          </SelectTrigger>
          <SelectContent className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800">
            <SelectItem value="OTP_EMAIL">
              <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300">
                <Mail className="w-4 h-4 text-slate-500" />
                <span>{t('email_method')}</span>
              </div>
            </SelectItem>
            <SelectItem value="OTP_SMS">
              <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300">
                <Phone className="w-4 h-4 text-slate-500" />
                <span>{t('sms_method')}</span>
              </div>
            </SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label className="text-slate-700 dark:text-slate-300 font-medium">
          {deliveryMethod === "OTP_EMAIL" ? t('your_email_label') : t('your_phone_label')}
        </Label>
        <div className="relative">
          {deliveryMethod === "OTP_EMAIL" ? (
            <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
          ) : (
            <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
          )}
          <Input
            type={deliveryMethod === "OTP_EMAIL" ? "email" : "tel"}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder={deliveryMethod === "OTP_EMAIL" ? t('email_placeholder') : t('phone_placeholder')}
            className="pl-11 h-14 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white focus:border-medical-500 focus:ring-medical-500/20 rounded-xl"
            required
          />
        </div>
      </div>

      {error && (
        <Alert variant="destructive" className="bg-red-50 text-red-900 border-red-200 dark:bg-red-900/20 dark:border-red-900 dark:text-red-200">
          <AlertDescription className="text-sm font-medium">{error}</AlertDescription>
        </Alert>
      )}

      <Button
        type="submit"
        disabled={loading || !email}
        className="w-full h-14 text-base font-semibold text-white bg-slate-900 hover:bg-slate-800 dark:bg-white dark:text-slate-900 dark:hover:bg-slate-100 shadow-none rounded-xl mt-4"
      >
        {loading ? (
          <><Loader2 className="animate-spin mr-2 w-5 h-5" />{t('sending')}</>
        ) : (
          <>{t('send_code_button')}<ArrowRight className="ml-2 w-5 h-5" /></>
        )}
      </Button>
    </motion.form>
  );
}