"use client";
import React, { useState } from 'react';
import { Mail, Lock, CheckCircle2, XCircle, Eye, EyeOff, AlertCircle, Shield } from "lucide-react";
import { FormData, PasswordRule } from '@/app/quhealthy/types/signup';

interface SignupStep1Props {
  formData: FormData;
  passwordValidation: PasswordRule[];
  handleInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export const SignupStep1: React.FC<SignupStep1Props> = ({ 
  formData, 
  passwordValidation, 
  handleInputChange 
}) => {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [focusedField, setFocusedField] = useState<string | null>(null);

  const passwordsMatch = formData.password && formData.confirmPassword && 
    formData.password === formData.confirmPassword;
  
  const passwordsDontMatch = formData.password && formData.confirmPassword && 
    formData.password !== formData.confirmPassword;

  const isEmailValid = formData.email && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email);
  const showEmailError = formData.email && !isEmailValid;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center space-y-3">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl mb-4">
          <Shield className="w-8 h-8 text-white" />
        </div>
        <h2 className="text-2xl font-bold text-white">Información de Acceso</h2>
        <p className="text-gray-400 text-sm leading-relaxed">
          Crea tus credenciales de acceso seguras para comenzar a ofrecer tus servicios de salud y belleza
        </p>
      </div>

      <div className="space-y-6">
        {/* Email Field */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-300">
            Correo electrónico profesional
          </label>
          <div className="relative group">
            <Mail className={`absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 transition-colors duration-200 ${
              focusedField === 'email' ? 'text-purple-400' : 
              showEmailError ? 'text-red-400' : 
              isEmailValid ? 'text-green-400' : 'text-gray-500'
            }`} />
            <input
              type="email"
              name="email"
              placeholder="tu.email@empresa.com"
              value={formData.email}
              onChange={handleInputChange}
              onFocus={() => setFocusedField('email')}
              onBlur={() => setFocusedField(null)}
              className={`w-full pl-11 pr-4 py-3.5 rounded-xl bg-gray-800/50 backdrop-blur-sm border-2 transition-all duration-300 text-white placeholder-gray-500 ${
                focusedField === 'email' ? 'border-purple-400 bg-gray-800/70 shadow-lg shadow-purple-400/20' :
                showEmailError ? 'border-red-400 bg-red-900/10' :
                isEmailValid ? 'border-green-400 bg-green-900/10' :
                'border-gray-600 hover:border-gray-500'
              }`}
              required
            />
            {isEmailValid && (
              <CheckCircle2 className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-green-400" />
            )}
            {showEmailError && (
              <AlertCircle className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-red-400" />
            )}
          </div>
          {showEmailError && (
            <div className="flex items-center text-sm text-red-400 mt-1">
              <AlertCircle className="w-4 h-4 mr-1" />
              Ingresa un correo electrónico válido
            </div>
          )}
        </div>

        {/* Password Field */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-300">
            Contraseña
          </label>
          <div className="relative group">
            <Lock className={`absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 transition-colors duration-200 ${
              focusedField === 'password' ? 'text-purple-400' : 'text-gray-500'
            }`} />
            <input
              type={showPassword ? "text" : "password"}
              name="password"
              placeholder="Crea una contraseña segura"
              value={formData.password}
              onChange={handleInputChange}
              onFocus={() => setFocusedField('password')}
              onBlur={() => setFocusedField(null)}
              className={`w-full pl-11 pr-12 py-3.5 rounded-xl bg-gray-800/50 backdrop-blur-sm border-2 transition-all duration-300 text-white placeholder-gray-500 ${
                focusedField === 'password' ? 'border-purple-400 bg-gray-800/70 shadow-lg shadow-purple-400/20' :
                'border-gray-600 hover:border-gray-500'
              }`}
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-md hover:bg-gray-700/50 transition-colors duration-200"
            >
              {showPassword ? 
                <EyeOff className="w-4 h-4 text-gray-400" /> : 
                <Eye className="w-4 h-4 text-gray-400" />
              }
            </button>
          </div>
        </div>

        {/* Confirm Password Field */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-300">
            Confirmar contraseña
          </label>
          <div className="relative group">
            <Lock className={`absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 transition-colors duration-200 ${
              focusedField === 'confirmPassword' ? 'text-purple-400' : 
              passwordsDontMatch ? 'text-red-400' :
              passwordsMatch ? 'text-green-400' : 'text-gray-500'
            }`} />
            <input
              type={showConfirmPassword ? "text" : "password"}
              name="confirmPassword"
              placeholder="Repite tu contraseña"
              value={formData.confirmPassword}
              onChange={handleInputChange}
              onFocus={() => setFocusedField('confirmPassword')}
              onBlur={() => setFocusedField(null)}
              className={`w-full pl-11 pr-12 py-3.5 rounded-xl bg-gray-800/50 backdrop-blur-sm border-2 transition-all duration-300 text-white placeholder-gray-500 ${
                focusedField === 'confirmPassword' ? 'border-purple-400 bg-gray-800/70 shadow-lg shadow-purple-400/20' :
                passwordsDontMatch ? 'border-red-400 bg-red-900/10' :
                passwordsMatch ? 'border-green-400 bg-green-900/10' :
                'border-gray-600 hover:border-gray-500'
              }`}
              required
            />
            <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center space-x-2">
              {passwordsMatch && (
                <CheckCircle2 className="w-5 h-5 text-green-400" />
              )}
              {passwordsDontMatch && (
                <XCircle className="w-5 h-5 text-red-400" />
              )}
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="p-1 rounded-md hover:bg-gray-700/50 transition-colors duration-200"
              >
                {showConfirmPassword ? 
                  <EyeOff className="w-4 h-4 text-gray-400" /> : 
                  <Eye className="w-4 h-4 text-gray-400" />
                }
              </button>
            </div>
          </div>
          {passwordsDontMatch && (
            <div className="flex items-center text-sm text-red-400 mt-1">
              <XCircle className="w-4 h-4 mr-1" />
              Las contraseñas no coinciden
            </div>
          )}
        </div>

        {/* Password Requirements */}
        {formData.password && (
          <div className="bg-gray-800/30 backdrop-blur-sm rounded-xl p-4 border border-gray-700/50">
            <h4 className="text-sm font-medium text-gray-300 mb-3 flex items-center">
              <Shield className="w-4 h-4 mr-2 text-purple-400" />
              Requisitos de seguridad
            </h4>
            <div className="grid grid-cols-1 gap-2">
              {passwordValidation.map((rule, index) => (
                <div key={index} className="flex items-center text-sm group">
                  <div className={`flex-shrink-0 w-5 h-5 mr-3 transition-all duration-300 ${
                    rule.valid ? 'text-green-400 scale-110' : 'text-gray-500'
                  }`}>
                    {rule.valid ? 
                      <CheckCircle2 className="w-full h-full" /> : 
                      <div className="w-2 h-2 bg-gray-500 rounded-full mx-auto mt-1.5" />
                    }
                  </div>
                  <span className={`transition-colors duration-300 ${
                    rule.valid ? "text-green-400 font-medium" : "text-gray-400"
                  }`}>
                    {rule.message}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Security Notice */}
        <div className="bg-gradient-to-r from-purple-900/20 to-pink-900/20 rounded-xl p-4 border border-purple-500/20">
          <div className="flex items-start space-x-3">
            <div className="flex-shrink-0">
              <Shield className="w-5 h-5 text-purple-400 mt-0.5" />
            </div>
            <div>
              <p className="text-sm text-gray-300 leading-relaxed">
                <span className="font-medium text-purple-400">Tu seguridad es importante.</span>
                {' '}Usamos encriptación de última generación para proteger tu información y la de tus clientes.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};