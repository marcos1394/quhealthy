"use client";
import React from 'react';
import { Loader2, AlertCircle, CheckCircle2 } from "lucide-react";
import { ValidationDetails } from '@/app/quhealthy/types/location';

interface ValidationStatusProps {
  isValidating: boolean;
  validationStatus: ValidationDetails | null;
}

export const ValidationStatus: React.FC<ValidationStatusProps> = ({ isValidating, validationStatus }) => {
  if (isValidating) {
    return (
      <div className="p-3 bg-blue-500/80 text-white rounded-lg flex items-center gap-2">
        <Loader2 className="w-5 h-5 animate-spin" />
        <p>Validando dirección...</p>
      </div>
    );
  }

  if (validationStatus) {
    return (
      <div className={`p-3 ${validationStatus.isValid ? 'bg-green-500/80' : 'bg-red-500/80'} text-white rounded-lg flex items-center gap-2`}>
        {validationStatus.isValid ? <CheckCircle2 className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
        <p>{validationStatus.message}</p>
      </div>
    );
  }

  return null;
};