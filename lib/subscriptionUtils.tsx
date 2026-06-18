import React from 'react';
import { Bot, MessageCircle, FileText, ShoppingBag, Receipt, Truck, Users, BookOpen } from 'lucide-react';

// 1. Mapeamos exactamente la respuesta que envía el nuevo PublicPlanController
export interface BackendPlan {
  id: number;
  name: string;
  description: string;
  price: number;
  commissionRate?: number; // 🚀 NUEVO
  transactionFee?: number; // 🚀 NUEVO
  currency: string;
  billingInterval: string;
  features?: string;
  
  // Límites
  maxAppointments?: number;
  maxServices?: number;
  maxProducts?: number;
  maxCourses?: number;
  maxPackages?: number;
  userManagement?: number;

  // 🚀 Nuevas Banderas (Feature Gating)
  qumarketAccess?: boolean;
  qublocksAccess?: boolean;
  analyticsAccess?: boolean;
  payrollAccess?: boolean;
  advancedReports?: boolean;
  aiCopilotAccess?: boolean;
  aiMarketingAccess?: boolean;
  whatsappChatbot?: boolean;
  shippingIntegration?: boolean;
  invoicingAccess?: boolean;
  referralCampaigns?: boolean;
  
  // (Este campo lo usa Stripe internamente, pero lo guardamos para el mapeo)
  stripePriceId?: string;
}

// 2. Interfaz esperada por tu UI (PricingSection)
export interface UIPlanFeature {
  title: string;
  icon?: React.ReactNode;
  highlighted?: boolean;
}

/**
 * 🛠️ Transforma las banderas booleanas de la base de datos en una lista visual
 * para el componente de Pricing en la Landing Page.
 */
export const buildFeaturesForPlan = (plan: BackendPlan, isAnnual: boolean, t: any): UIPlanFeature[] => {
  const features: UIPlanFeature[] = [];

  // 🚀 1. EL GANCHO FINANCIERO (Siempre al principio)
  if (plan.commissionRate !== undefined && plan.transactionFee !== undefined) {
    const commissionPct = (plan.commissionRate * 100).toFixed(1).replace('.0', '');
    
    if (plan.commissionRate === 0) {
      features.push({ 
        title: t('features.zero_commission'), 
        highlighted: true // Destacado para el plan Enterprise
      });
    } else {
      features.push({ 
        title: t('features.preferential_commission', { pct: commissionPct, fee: plan.transactionFee }), 
        highlighted: true // ✨ El usuario debe ver esto de inmediato
      });
    }
  }

  // 1. Funcionalidades Base (Para todos los planes, porque el volumen es ilimitado)
  features.push({ title: t('features.unlimited_appointments'), highlighted: false });
  features.push({ title: t('features.unlimited_catalog'), highlighted: false });

  // 2. Tienda y Pacientes (Todos lo tienen, pero lo destacamos)
  if (plan.qumarketAccess) {
    features.push({ 
      title: t('features.qumarket_sales'), 
      icon: React.createElement(ShoppingBag, { className: "w-3.5 h-3.5" }), 
      highlighted: false 
    });
  }

  // 3. Facturación y Referidos (Desde Básico)
  if (plan.invoicingAccess) {
    features.push({ 
      title: t('features.cfdi_invoicing'), 
      icon: React.createElement(Receipt, { className: "w-3.5 h-3.5" }), 
      highlighted: false 
    });
  }
  if (plan.referralCampaigns) {
    features.push({ 
      title: t('features.referral_campaigns'), 
      highlighted: false 
    });
  }

  // 4. Copiloto IA y Paqueterías (Desde Estándar)
  if (plan.aiCopilotAccess) {
    features.push({ 
      title: t('features.ai_copilot'), 
      icon: React.createElement(Bot, { className: "w-3.5 h-3.5" }), 
      highlighted: true // ✨ Destacamos la IA
    });
  }
  if (plan.shippingIntegration) {
    features.push({ 
      title: t('features.shipping_integration'), 
      icon: React.createElement(Truck, { className: "w-3.5 h-3.5" }), 
      highlighted: false 
    });
  }

  // 5. Cursos, Chatbots y Marketing (Desde Premium)
  if (plan.qublocksAccess) {
    features.push({ 
      title: t('features.qublocks_sales'), 
      icon: React.createElement(BookOpen, { className: "w-3.5 h-3.5" }), 
      highlighted: false 
    });
  }
  if (plan.whatsappChatbot) {
    features.push({ 
      title: t('features.whatsapp_chatbot'), 
      icon: React.createElement(MessageCircle, { className: "w-3.5 h-3.5" }), 
      highlighted: true 
    });
  }
  if (plan.aiMarketingAccess) {
    features.push({ 
      title: t('features.ai_marketing'), 
      highlighted: false 
    });
  }

  // 6. Equipo y Roles (Si userManagement > 1)
  if (plan.userManagement && plan.userManagement > 1) {
    features.push({ 
      title: plan.userManagement === 999 ? t('features.unlimited_users') : t('features.up_to_users', { count: plan.userManagement }), 
      icon: React.createElement(Users, { className: "w-3.5 h-3.5" }), 
      highlighted: false 
    });
  }

  // 7. Bono Anual: Si el usuario activó el Switch de "Anual", podemos mostrar un feature extra de regalo
  if (isAnnual && plan.price > 0) {
    features.push({ 
      title: t('features.vip_support'), 
      highlighted: true 
    });
  }

  return features;
};