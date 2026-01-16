"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { Check, X } from "lucide-react";
import { cn } from "@/lib/utils";

// Componentes UI de ShadCN
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

// Definición de tipos
export interface PricingPlan {
  title: string;
  price: number;
  description: string;
  features: string[]; // Características incluidas
  notIncluded?: string[]; // Características NO incluidas (para diferenciar planes)
  isPopular?: boolean;
  buttonText?: string;
}

interface PricingSectionProps {
  plans: PricingPlan[];
}

const PricingSection: React.FC<PricingSectionProps> = ({ plans }) => {
  const [isAnnual, setIsAnnual] = useState(true); // Empezamos en anual para mostrar el valor

  return (
    <section id="pricing" className="py-24 relative overflow-hidden bg-gray-900">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-gray-800/40 via-gray-900 to-gray-950 pointer-events-none"></div>
      
      <div className="container mx-auto px-4 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-purple-400 to-pink-500 bg-clip-text text-transparent">
            Planes Flexibles
          </h2>
          <p className="text-lg text-gray-400 max-w-2xl mx-auto mb-8">
            Elige el plan que se adapte a tu etapa actual. Escala cuando lo necesites.
          </p>

          {/* Toggle Anual/Mensual */}
          <div className="flex items-center justify-center gap-4">
            <span className={cn("text-sm font-medium", !isAnnual ? "text-white" : "text-gray-400")}>
              Mensual
            </span>
            <Switch
              checked={isAnnual}
              onCheckedChange={setIsAnnual}
              className="data-[state=checked]:bg-purple-600"
            />
            <span className={cn("text-sm font-medium", isAnnual ? "text-white" : "text-gray-400")}>
              Anual <span className="text-emerald-400 text-xs ml-1 font-bold">(-20%)</span>
            </span>
          </div>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-8 max-w-7xl mx-auto">
          {plans.map((plan, index) => {
            // Cálculo de precio
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
                  "h-full flex flex-col relative border-gray-800 bg-gray-900/50 backdrop-blur-sm transition-all duration-300 hover:border-purple-500/30",
                  plan.isPopular ? "border-purple-500 shadow-lg shadow-purple-900/20 scale-105 z-10 bg-gray-900/80" : ""
                )}>
                  {plan.isPopular && (
                    <div className="absolute -top-4 left-0 right-0 flex justify-center">
                      <Badge className="bg-purple-600 hover:bg-purple-700 text-white border-0 px-4 py-1">
                        Más Popular
                      </Badge>
                    </div>
                  )}

                  <CardHeader>
                    <CardTitle className="text-xl text-white font-bold">{plan.title}</CardTitle>
                    <CardDescription className="text-gray-400 min-h-[40px]">
                      {plan.description}
                    </CardDescription>
                  </CardHeader>

                  <CardContent className="flex-1">
                    <div className="mb-6">
                      <span className="text-4xl font-bold text-white">${finalPrice}</span>
                      <span className="text-gray-500 ml-2">/mes</span>
                      {isAnnual && (
                        <p className="text-xs text-emerald-400 mt-1">Facturado anualmente (${finalPrice * 12})</p>
                      )}
                    </div>

                    <Separator className="bg-gray-800 mb-6" />

                    <ul className="space-y-3 text-sm">
                      {plan.features.map((feature, i) => (
                        <li key={i} className="flex items-start text-gray-300">
                          <Check className="h-4 w-4 text-emerald-500 mr-2 mt-0.5 shrink-0" />
                          {feature}
                        </li>
                      ))}
                      {/* Características NO incluidas (opcional para contraste) */}
                      {plan.notIncluded?.map((feature, i) => (
                        <li key={`not-${i}`} className="flex items-start text-gray-600">
                          <X className="h-4 w-4 text-gray-600 mr-2 mt-0.5 shrink-0" />
                          {feature}
                        </li>
                      ))}
                    </ul>
                  </CardContent>

                  <CardFooter>
                    <Button 
                      className={cn(
                        "w-full font-bold",
                        plan.isPopular 
                          ? "bg-purple-600 hover:bg-purple-700 text-white" 
                          : "bg-gray-800 hover:bg-gray-700 text-white"
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

        <motion.p
          className="text-center text-gray-500 text-sm mt-12"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
        >
          Todos los precios están en MXN. Incluye 14 días de prueba gratis.
        </motion.p>
      </div>
    </section>
  );
};

export default PricingSection;