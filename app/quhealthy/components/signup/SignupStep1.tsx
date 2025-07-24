"use client";
import React from 'react';
import { Mail, Lock, CheckCircle2, XCircle } from "lucide-react";
import { FormData, PasswordRule } from '@/app/quhealthy/types/signup';

interface SignupStep1Props {
  formData: FormData;
  passwordValidation: PasswordRule[];
  handleInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export const SignupStep1: React.FC<SignupStep1Props> = ({ formData, passwordValidation, handleInputChange }) => (
  <div className="space-y-6">
    <div className="relative">
      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-purple-400" />
      <input type="email" name="email" placeholder="Correo electrónico profesional" value={formData.email} onChange={handleInputChange} className="w-full pl-10 p-3 rounded-lg bg-gray-700/50 border border-gray-600 focus:border-purple-400" required />
    </div>
    <div className="relative">
      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-purple-400" />
      <input type="password" name="password" placeholder="Contraseña" value={formData.password} onChange={handleInputChange} className="w-full pl-10 p-3 rounded-lg bg-gray-700/50 border border-gray-600 focus:border-purple-400" required />
    </div>
    <div className="relative">
      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-purple-400" />
      <input type="password" name="confirmPassword" placeholder="Confirmar contraseña" value={formData.confirmPassword} onChange={handleInputChange} className="w-full pl-10 p-3 rounded-lg bg-gray-700/50 border border-gray-600 focus:border-purple-400" required />
    </div>
    <div className="space-y-2">
      {passwordValidation.map((rule, index) => (
        <div key={index} className="flex items-center text-sm">
          {rule.valid ? <CheckCircle2 className="w-4 h-4 text-green-500 mr-2" /> : <XCircle className="w-4 h-4 text-red-500 mr-2" />}
          <span className={rule.valid ? "text-green-500" : "text-gray-400"}>{rule.message}</span>
        </div>
      ))}
    </div>
  </div>
);