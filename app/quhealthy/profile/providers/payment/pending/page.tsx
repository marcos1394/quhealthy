"use client";
import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  Clock, 
  ArrowRight, 
  Home,
  RotateCcw,
  AlertCircle,
  Mail,
  RefreshCcw,
  HelpCircle
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";

interface PaymentPendingProps {
  orderNumber?: string;
  planName?: string;
  planPrice?: number;
  planDuration?: string;
  estimatedTime?: string;
}

export default function PaymentPending({ 
  orderNumber = "123456",
  planName = "Plan Estándar",
  planPrice = 900,
  planDuration = "mes",
  estimatedTime = "5-10 minutos"
}: PaymentPendingProps) {
  const [progress, setProgress] = React.useState(0);
  
  React.useEffect(() => {
    const timer = setInterval(() => {
      setProgress((oldProgress) => {
        const newProgress = oldProgress + 1;
        return newProgress >= 100 ? 0 : newProgress;
      });
    }, 300);

    return () => clearInterval(timer);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 via-gray-800 to-black text-white p-4 md:p-8 flex items-center justify-center">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-xl"
      >
        <Card className="bg-gray-800 border-gray-700 overflow-hidden">
          <CardHeader className="relative overflow-hidden p-0">
            <div className="absolute inset-0 bg-yellow-500/10 backdrop-blur-sm" />
            <div className="relative p-6 text-center">
              <motion.div 
                animate={{ rotate: 360 }}
                transition={{ 
                  duration: 4,
                  repeat: Infinity,
                  ease: "linear"
                }}
                className="mx-auto mb-4"
              >
                <div className="relative">
                  <div className="absolute inset-0 bg-yellow-500/20 rounded-full animate-pulse" />
                  <Clock className="w-20 h-20 text-yellow-500 mx-auto relative" />
                </div>
              </motion.div>
              <h2 className="text-3xl font-bold text-white mb-2">Pago en Proceso</h2>
              <p className="text-gray-400">
                Estamos verificando tu pago
              </p>
            </div>
          </CardHeader>

          <CardContent className="p-6">
            <div className="mb-6">
              <Progress value={progress} className="bg-gray-700 h-2" />
            </div>

            <div className="bg-gray-700/50 rounded-lg p-4 mb-6">
              <div className="flex justify-between items-center mb-4">
                <div>
                  <h3 className="font-medium text-white">{planName}</h3>
                  <p className="text-sm text-gray-400">Orden #{orderNumber}</p>
                </div>
                <Badge className="bg-yellow-500/20 text-yellow-400">
                  ${planPrice}/{planDuration}
                </Badge>
              </div>
              
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm text-gray-300">
                  <Clock className="w-4 h-4 text-yellow-400" />
                  <span>Tiempo estimado: {estimatedTime}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-300">
                  <Mail className="w-4 h-4 text-yellow-400" />
                  <span>Te notificaremos por correo cuando se complete</span>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <Button 
                className="w-full bg-yellow-500 hover:bg-yellow-600 text-white"
                onClick={() => window.location.reload()}
              >
                <RefreshCcw className="w-4 h-4 mr-2" />
                Actualizar estado
              </Button>
              
              <div className="grid grid-cols-2 gap-3">
                <Button 
                  variant="outline" 
                  className="text-gray-400 border-gray-700 hover:bg-gray-700"
                  onClick={() => window.location.href = "/support"}
                >
                  <HelpCircle className="w-4 h-4 mr-2" />
                  Necesito ayuda
                </Button>
                <Button 
                  variant="outline"
                  className="text-gray-400 border-gray-700 hover:bg-gray-700"
                  onClick={() => window.location.href = "/orders"}
                >
                  <AlertCircle className="w-4 h-4 mr-2" />
                  Ver detalles
                </Button>
              </div>

              <Button 
                variant="ghost" 
                className="w-full text-gray-400 hover:bg-gray-700"
                onClick={() => window.location.href = "/"}
              >
                <Home className="w-4 h-4 mr-2" />
                Volver al inicio
              </Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}