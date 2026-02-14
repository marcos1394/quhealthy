"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { Check, X, Zap } from "lucide-react";
import { cn } from "@/lib/utils";

import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";

/**
 * PricingSection Component
 * 
 * Principios de Psicología UX aplicados:
 * 
 * 1. ANCLAJE (Anchoring)
 *    - Precio anual mostrado primero (valor mejor)
 *    - Descuento "-20%" como ancla de comparación
 * 
 * 2. AVERSIÓN A LA PÉRDIDA
 *    - "Ahorra 20%" enfatiza pérdida de no elegir anual
 *    - Features "no incluidas" con X roja
 * 
 * 3. PRINCIPIO DE ESCASEZ
 *    - Badge "Más Popular" crea prueba social
 *    - Scale destacado del plan popular
 * 
 * 4. MINIMIZAR CARGA COGNITIVA
 *    - Toggle simple: solo 2 opciones (mensual/anual)
 *    - Máximo 3 planes para comparar (número mágico 7±2)
 * 
 * 5. JERARQUÍA VISUAL
 *    - Plan popular escalado y con border destacado
 *    - Features con checkmarks verdes (positivo)
 * 
 * 6. SIMILITUD (Gestalt)
 *    - Estructura idéntica en todos los planes
 *    - Facilita comparación side-by-side
 * 
 * 7. PRINCIPIO DE RECIPROCIDAD
 *    - "14 días gratis" en todos los planes
 *    - Reduce fricción de compra
 */

export interface PricingPlan {
  title: string;
  price: number;
  description: string;
  features: string[];
  notIncluded?: string[];
  isPopular?: boolean;
  buttonText?: string;
}

interface PricingSectionProps {
  plans: PricingPlan[];
}

const PricingSection: React.FC<PricingSectionProps> = ({ plans }) => {
  const [isAnnual, setIsAnnual] = useState(true);

  return (
    <section id="pricing" className="py-32 relative overflow-hidden bg-gray-900">
      {/* Background con profundidad */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-gray-800/40 via-gray-900 to-gray-950" />
      <div 
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: `linear-gradient(rgba(168, 85, 247, 0.3) 1px, transparent 1px),
                           linear-gradient(90deg, rgba(168, 85, 247, 0.3) 1px, transparent 1px)`,
          backgroundSize: '50px 50px'
        }}
      />
      
      <div className="container mx-auto px-4 relative z-10">
        {/* Header - PRIMING del valor */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16 space-y-6"
        >
          <h2 className="text-4xl md:text-6xl font-black bg-gradient-to-r from-purple-400 via-pink-400 to-purple-400 bg-clip-text text-transparent">
            Planes Flexibles
          </h2>
          <p className="text-xl md:text-2xl text-gray-400 max-w-3xl mx-auto">
            Elige el plan que se adapte a tu etapa actual. Escala cuando lo necesites.
          </p>

          {/* Toggle - MINIMIZAR CARGA COGNITIVA (solo 2 opciones) */}
          <div className="flex items-center justify-center gap-4 pt-4">
            <span className={cn(
              "text-base font-semibold transition-colors duration-200",
              !isAnnual ? "text-white" : "text-gray-500"
            )}>
              Mensual
            </span>
            <Switch
              checked={isAnnual}
              onCheckedChange={setIsAnnual}
              className="data-[state=checked]:bg-purple-600"
            />
            <span className={cn(
              "text-base font-semibold transition-colors duration-200 flex items-center gap-2",
              isAnnual ? "text-white" : "text-gray-500"
            )}>
              Anual 
              {/* ANCLAJE - Descuento visible */}
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-400 text-xs font-bold border border-emerald-500/20">
                <Zap className="w-3 h-3" />
                Ahorra 20%
              </span>
            </span>
          </div>
        </motion.div>

        {/* Grid de Planes - SIMILITUD (Gestalt) */}
        <div className="grid md:grid-cols-3 gap-8 max-w-7xl mx-auto">
          {plans.map((plan, index) => {
            const finalPrice = isAnnual ? Math.round(plan.price * 0.8) : plan.price;
            
            return (
              <motion.div
                key={plan.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1, duration: 0.5 }}
                className="h-full"
              >
                <Card className={cn(
                  "h-full flex flex-col relative border-gray-800 bg-gray-900/50 backdrop-blur-sm transition-all duration-300",
                  plan.isPopular 
                    ? "border-purple-500 shadow-2xl shadow-purple-900/30 scale-105 md:scale-110 z-10 bg-gray-900/80" 
                    : "hover:border-purple-500/30 hover:shadow-lg"
                )}>
                  {/* Badge "Más Popular" - PRUEBA SOCIAL */}
                  {plan.isPopular && (
                    <div className="absolute -top-5 left-0 right-0 flex justify-center">
                      <Badge className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white border-0 px-6 py-2 text-sm font-bold shadow-lg">
                        ⭐ Más Popular
                      </Badge>
                    </div>
                  )}

                  <CardHeader className="space-y-3 pb-8">
                    <CardTitle className="text-2xl font-black text-white">{plan.title}</CardTitle>
                    <CardDescription className="text-gray-400 min-h-[48px] leading-relaxed">
                      {plan.description}
                    </CardDescription>
                  </CardHeader>

                  <CardContent className="flex-1 space-y-8">
                    {/* Precio - JERARQUÍA VISUAL */}
                    <div>
                      <div className="flex items-baseline gap-2">
                        <span className="text-5xl font-black text-white">${finalPrice}</span>
                        <span className="text-gray-500 text-lg">/mes</span>
                      </div>
                      {isAnnual && (
                        <p className="text-sm text-emerald-400 mt-2 font-semibold">
                          💰 ${finalPrice * 12} facturado anualmente
                        </p>
                      )}
                    </div>

                    <div className="h-px bg-gray-800" />

                    {/* Features - RECONOCIMIENTO (checkmarks) */}
                    <ul className="space-y-3">
                      {plan.features.map((feature, i) => (
                        <li key={i} className="flex items-start gap-3 text-gray-300">
                          <Check className="h-5 w-5 text-emerald-500 flex-shrink-0 mt-0.5" />
                          <span className="text-sm leading-relaxed">{feature}</span>
                        </li>
                      ))}
                      
                      {/* Features NO incluidas - AVERSIÓN A LA PÉRDIDA */}
                      {plan.notIncluded?.map((feature, i) => (
                        <li key={`not-${i}`} className="flex items-start gap-3 text-gray-600">
                          <X className="h-5 w-5 text-gray-600 flex-shrink-0 mt-0.5" />
                          <span className="text-sm leading-relaxed line-through">{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>

                  <CardFooter className="pt-6">
                    <Button 
                      className={cn(
                        "w-full font-bold text-base py-6 transition-all duration-300",
                        plan.isPopular 
                          ? "bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white shadow-xl shadow-purple-500/30 hover:shadow-purple-500/50 hover:scale-105" 
                          : "bg-gray-800 hover:bg-gray-700 text-white hover:scale-105"
                      )}
                    >
                      {plan.buttonText || "Comenzar Gratis"}
                    </Button>
                  </CardFooter>
                </Card>
              </motion.div>
            );
          })}
        </div>

        {/* Trust indicator - AVERSIÓN A LA PÉRDIDA */}
        <motion.p
          className="text-center text-gray-500 text-sm mt-16"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
        >
          ✅ Todos los planes incluyen 14 días de prueba gratis • Sin tarjeta requerida • Cancela cuando quieras
        </motion.p>
      </div>
    </section>
  );
};

export default PricingSection;