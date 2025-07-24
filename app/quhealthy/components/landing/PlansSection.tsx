"use client";
import { useState, useMemo } from 'react';
import { motion } from "framer-motion";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CheckCircle2 } from "lucide-react";
import { Plan, UserType } from '@/app/quhealthy/types/landing';
import Link from 'next/link';

const plansData: Record<UserType, Plan[]> = {
  consumer: [
    { id: 'cons_free', name: 'Explorador', description: 'Empieza a descubrir el bienestar.', priceMonthly: 0, priceYearly: 0, features: ['Búsqueda y agenda de citas', 'Perfil de salud básico', 'Comunicación segura por chat'] },
    { id: 'cons_plus', name: 'Plus', description: 'Tu pasaporte a un bienestar integral.', priceMonthly: 199, priceYearly: 1990, isPopular: true, features: ['Todo lo del plan Explorador', 'Teleconsultas con especialistas', 'Descuentos exclusivos en servicios', 'Recomendaciones personalizadas con IA'] },
    { id: 'cons_vip', name: 'Concierge', description: 'Atención exclusiva y sin preocupaciones.', priceMonthly: 499, priceYearly: 4990, features: ['Todo lo del plan Plus', 'Asistente de bienestar personal', 'Gestión de viajes y logística', 'Acceso prioritario y 24/7'] },
  ],
  provider: [
    { id: 'prov_starter', name: 'Profesional', description: 'Digitaliza y organiza tu práctica.', priceMonthly: 499, priceYearly: 4990, features: ['Perfil profesional verificado', 'Agenda digital inteligente', 'Gestión de hasta 50 pacientes', 'Pagos seguros (tarjeta y cripto)'] },
    { id: 'prov_business', name: 'Clínica', description: 'Expande tu alcance y optimiza tu gestión.', priceMonthly: 1499, priceYearly: 14990, isPopular: true, features: ['Todo lo del plan Profesional', 'Herramientas de marketing (Nivel 2)', 'Reportes y analíticas de negocio', 'Visibilidad en QuMarket'] },
    { id: 'prov_enterprise', name: 'Enterprise', description: 'La solución completa para centros médicos.', priceMonthly: 2999, priceYearly: 29990, features: ['Todo lo del plan Clínica', 'Gestión de múltiples profesionales', 'Soporte prioritario y dedicado', 'Acceso a API para integraciones'] },
  ],
};

export const PlansSection = () => {
  const [userType, setUserType] = useState<UserType>('consumer');
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly');
  const activePlans = useMemo(() => plansData[userType], [userType]);

  return (
    <section className="py-20 px-8 bg-gray-900">
      <div className="max-w-7xl mx-auto">
        <motion.h2 initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true, amount: 0.5 }} className="text-4xl font-bold text-center mb-4 text-white">Planes Flexibles para Todos</motion.h2>
        <motion.p initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true, amount: 0.5 }} className="text-center text-gray-400 max-w-2xl mx-auto mb-12">Tanto si buscas un servicio como si quieres ofrecer el tuyo, tenemos un plan diseñado para tus necesidades.</motion.p>
        
        <Tabs value={userType} onValueChange={(value) => setUserType(value as UserType)} className="w-full max-w-md mx-auto mb-12">
          <TabsList className="grid w-full grid-cols-2 bg-gray-800 border-gray-700">
            <TabsTrigger value="consumer">Para Usuarios</TabsTrigger>
            <TabsTrigger value="provider">Para Profesionales</TabsTrigger>
          </TabsList>
        </Tabs>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 items-stretch">
          {activePlans.map((plan, index) => (
            <motion.div
              key={plan.id}
              className={`p-8 rounded-xl bg-gray-800 border border-gray-700 flex flex-col ${plan.isPopular ? 'ring-2 ring-purple-500' : ''}`}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ delay: index * 0.15 }}
            >
              <h3 className="text-2xl font-bold mb-4 text-white">{plan.name}</h3>
              <p className="text-4xl font-bold mb-8 text-purple-400">{billingCycle === 'monthly' ? `$${plan.priceMonthly}` : `$${plan.priceYearly}`}<span className="text-base text-gray-400 font-normal">/{billingCycle === 'monthly' ? 'mes' : 'año'}</span></p>
              <p className="text-gray-400 mb-8 min-h-[50px]">{plan.description}</p>
              <ul className="space-y-4 mb-8 flex-grow">
                {plan.features.map((feature, idx) => (
                  <li key={idx} className="flex items-center gap-3"><CheckCircle2 className="w-5 h-5 text-purple-400" /><span>{feature}</span></li>
                ))}
              </ul>
              <Link href={userType === 'consumer' ? '/quhealthy/authentication/signup' : '/quhealthy/authentication/providers/signup'} className="w-full mt-auto bg-purple-600 text-white font-semibold py-3 px-6 rounded-lg hover:bg-purple-700 text-center transition-transform hover:scale-105">
                Comenzar
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};