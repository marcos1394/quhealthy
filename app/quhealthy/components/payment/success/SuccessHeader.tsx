"use client";
import { motion } from "framer-motion";
import { CardHeader } from "@/components/ui/card";
import { CheckCircle } from "lucide-react";

export const SuccessHeader = () => (
  <CardHeader className="relative overflow-hidden p-0">
    <div className="absolute inset-0 bg-gradient-to-br from-purple-600/10 via-purple-500/10 to-transparent backdrop-blur-sm" />
    <div className="relative p-8 text-center">
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: "spring", stiffness: 260, damping: 20, delay: 0.1 }}
        className="mx-auto mb-5"
      >
        <div className="relative inline-block">
          <div className="absolute -inset-2 bg-purple-500/30 rounded-full animate-ping opacity-75" />
          <div className="relative bg-purple-500/20 p-4 rounded-full inline-block">
            <CheckCircle className="w-16 h-16 text-purple-400 mx-auto" strokeWidth={1.5}/>
          </div>
        </div>
      </motion.div>
      <h2 className="text-3xl font-bold text-white mb-2">¡Pago Exitoso!</h2>
      <p className="text-gray-300 text-lg">
        Tu suscripción a QuHealthy ha sido activada.
      </p>
    </div>
  </CardHeader>
);