"use client";
import React from "react";
import { motion } from "framer-motion";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  CheckCircle, 
  XCircle, 
  Clock, 
  ArrowRight, 
  Home,
  RotateCcw 
} from "lucide-react";

const PaymentPending = ({ orderNumber = "123456" }) => (
  <div className="min-h-screen bg-gradient-to-b from-gray-900 via-gray-800 to-black text-white p-4 md:p-8 flex items-center justify-center">
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className="w-full max-w-lg"
    >
      <Card className="bg-gradient-to-br from-gray-50 to-gray-100 border-gray-200/30 backdrop-blur-sm">
        <CardContent className="p-8 text-center">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            className="mx-auto mb-6"
          >
            <Clock className="w-24 h-24 text-yellow-500 mx-auto" />
          </motion.div>
          <h2 className="text-3xl font-bold text-gray-800 mb-4">Pago en Proceso</h2>
          <p className="text-gray-600 mb-6">
            Tu orden #{orderNumber} está siendo procesada.
            Te notificaremos cuando se complete la transacción.
          </p>
          <div className="space-y-3">
            <Button className="w-full bg-yellow-500 hover:bg-yellow-600">
              Actualizar estado
              <RotateCcw className="w-5 h-5 ml-2" />
            </Button>
            <Button variant="outline" className="w-full text-gray-600 border-gray-300">
              Volver al inicio
              <Home className="w-5 h-5 ml-2" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  </div>
);

export default PaymentPending;