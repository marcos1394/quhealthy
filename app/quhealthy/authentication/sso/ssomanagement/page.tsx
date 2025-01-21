"use client";

import React from "react";
import { motion } from "framer-motion";
import {
  Shield,
  LockKeyhole,
  ArrowLeft,
  Bell,
  Settings,
  HelpCircle,
  ExternalLink,
  Clock,
  Smartphone,
  ShieldCheck
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import ConnectedPlatforms from "../../../components/connectedplatforms";
import LoginProviders from "../../../components/loginproviders";

const fadeIn = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.5 }
};

const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.2
    }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 }
};

export default function SSOManagement() {
  const [activeTab, setActiveTab] = React.useState("overview");
  
  const tabs = [
    { id: "overview", label: "Vista General", icon: Shield },
    { id: "platforms", label: "Plataformas", icon: ExternalLink },
    { id: "providers", label: "Proveedores", icon: LockKeyhole },
    { id: "settings", label: "Configuración", icon: Settings },
  ];

  return (
    <motion.div
      className="min-h-screen bg-gradient-to-b from-black via-gray-900 to-black text-white"
      initial="hidden"
      animate="show"
      variants={containerVariants}
    >
      {/* Header */}
      <div className="border-b border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              <button className="p-2 hover:bg-gray-800 rounded-lg transition-colors">
                <ArrowLeft className="w-5 h-5 text-gray-400" />
              </button>
              <h1 className="text-xl font-semibold text-white">Seguridad y Acceso</h1>
            </div>
            <div className="flex items-center gap-2">
              <button className="p-2 hover:bg-gray-800 rounded-lg transition-colors relative">
                <Bell className="w-5 h-5 text-gray-400" />
                <span className="absolute top-1 right-1 w-2 h-2 bg-teal-400 rounded-full" />
              </button>
              <button className="p-2 hover:bg-gray-800 rounded-lg transition-colors">
                <HelpCircle className="w-5 h-5 text-gray-400" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Tabs */}
        <div className="flex space-x-1 bg-gray-800/50 p-1 rounded-lg mb-8 overflow-x-auto">
          {tabs.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setActiveTab(id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                activeTab === id
                  ? "bg-gray-700 text-white"
                  : "text-gray-400 hover:text-white hover:bg-gray-700/50"
              }`}
            >
              <Icon className="w-4 h-4" />
              {label}
            </button>
          ))}
        </div>

        {/* Overview Alert */}
        <motion.div
          variants={itemVariants}
          className="mb-8"
        >
          <Alert className="bg-teal-500/10 border-teal-500/20">
            <Shield className="w-4 h-4 text-teal-400" />
            <AlertDescription className="text-teal-300">
              Tu cuenta está protegida con autenticación de dos factores y tiene 2 plataformas vinculadas activas.
            </AlertDescription>
          </Alert>
        </motion.div>

        {/* Components */}
        <motion.div
          variants={containerVariants}
          className="space-y-8"
        >
          {/* Security Stats */}
          <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              { label: "Último acceso", value: "Hoy, 14:30", icon: Clock },
              { label: "Dispositivos activos", value: "3 dispositivos", icon: Smartphone },
              { label: "Estado de seguridad", value: "Protegido", icon: ShieldCheck }
            ].map((stat, index) => (
              <Card key={index} className="bg-gray-800/50 border-gray-700">
                <CardContent className="p-6 flex items-center gap-4">
                  <div className="p-3 bg-gray-700 rounded-lg">
                    <stat.icon className="w-5 h-5 text-teal-400" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-400">{stat.label}</p>
                    <p className="text-lg font-semibold text-white">{stat.value}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </motion.div>

          {/* Connected Platforms */}
          <motion.div variants={itemVariants}>
            <ConnectedPlatforms />
          </motion.div>

          {/* Login Providers */}
          <motion.div variants={itemVariants}>
            <LoginProviders />
          </motion.div>
        </motion.div>
      </div>
    </motion.div>
  );
}