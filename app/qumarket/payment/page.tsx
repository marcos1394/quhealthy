"use client";
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Input } from "@/components/ui/input";
import {
  CreditCard,
  Shield,
  Clock,
  CheckCircle2,
  AlertCircle,
  Wallet,
  BadgeDollarSign,
  Ban,
  QrCode,
  ArrowRight
} from "lucide-react";
import { Toast, ToastDescription } from "@/components/ui/toast";

interface PaymentMethod {
  id: string;
  name: string;
  icon: React.ReactNode;
  description: string;
  additionalInfo?: string;
}

const Payment: React.FC = () => {
  const [selectedMethod, setSelectedMethod] = useState<string>("");
  const [processing, setProcessing] = useState(false);
  const [cardNumber, setCardNumber] = useState("");
  const [expiryDate, setExpiryDate] = useState("");
  const [cvv, setCvv] = useState("");
  const [cardName, setCardName] = useState("");

  const paymentMethods: PaymentMethod[] = [
    {
      id: "credit-card",
      name: "Tarjeta de Crédito/Débito",
      icon: <CreditCard className="w-6 h-6" />,
      description: "Paga de forma segura con tu tarjeta",
      additionalInfo: "Aceptamos Visa, Mastercard, American Express"
    },
    {
      id: "mercado-pago",
      name: "Mercado Pago",
      icon: <Wallet className="w-6 h-6" />,
      description: "Paga con tu saldo o tarjetas guardadas",
      additionalInfo: "Aprovecha MSI y promociones disponibles"
    },
    {
      id: "bank-transfer",
      name: "Transferencia Bancaria",
      icon: <Ban className="w-6 h-6" />,
      description: "Transferencia directa desde tu banco",
      additionalInfo: "Proceso el pago en 24-48 horas hábiles"
    },
    {
      id: "cash-payment",
      name: "Pago en Efectivo",
      icon: <BadgeDollarSign className="w-6 h-6" />,
      description: "Genera un código para pagar en tiendas",
      additionalInfo: "OXXO, 7-Eleven, Circle K"
    }
  ];

  const handlePayment = async () => {
    if (!selectedMethod) {
      Toast({
        title: "Error",
        variant: "destructive",
        children:(
            <ToastDescription>
                Por favor selecciona un método de pago
            </ToastDescription>

          )
      });
      return;
    }

    if (selectedMethod === 'credit-card') {
      if (!cardNumber || !expiryDate || !cvv || !cardName) {
        Toast({
          title: "Error",
          variant: "destructive",
          children:(
            <ToastDescription>
                Por favor completa todos los campos de la tarjeta
            </ToastDescription>

          )

        });
        return;
      }
    }

    setProcessing(true);

    try {
      // Simulamos el proceso de pago
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      Toast({
        title: "¡Pago exitoso!",
        variant: "default",
        children:(
            <ToastDescription>
                Tu reserva ha sido confirmada
            </ToastDescription>

          )

      });
      
      // Aquí iría la redirección a la página de confirmación
    } catch (error) {
      Toast({
        title: "Error en el pago",
        variant: "destructive",
        children:(
            <ToastDescription>
               Por favor intenta nuevamente
            </ToastDescription>

          )
      });
    } finally {
      setProcessing(false);
    }
  };

  const formatCardNumber = (value: string) => {
    const v = value.replace(/\s+/g, '').replace(/\D/g, '');
    const matches = v.match(/\d{4,16}/g);
    const match = matches && matches[0] || '';
    const parts = [];
    for (let i = 0, len = match.length; i < len; i += 4) {
      parts.push(match.substring(i, i + 4));
    }
    if (parts.length) {
      return parts.join(' ');
    } else {
      return value;
    }
  };

  const handleCardNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatCardNumber(e.target.value);
    setCardNumber(formatted);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 via-gray-800 to-gray-900 text-white p-6">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">Método de Pago</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <Card className="bg-gray-800 border-gray-700">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="w-5 h-5 text-teal-500" />
                  Pago Seguro
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {paymentMethods.map((method) => (
                    <div
                      key={method.id}
                      className={`p-4 rounded-lg border cursor-pointer transition-all ${
                        selectedMethod === method.id
                          ? "border-teal-500 bg-gray-700"
                          : "border-gray-600 hover:border-gray-500"
                      }`}
                      onClick={() => setSelectedMethod(method.id)}
                    >
                      <div className="flex items-center gap-3">
                        <div className="text-teal-500">{method.icon}</div>
                        <div>
                          <h3 className="font-medium">{method.name}</h3>
                          <p className="text-sm text-gray-400">{method.description}</p>
                        </div>
                      </div>
                      {method.additionalInfo && (
                        <p className="text-xs text-gray-500 mt-2">{method.additionalInfo}</p>
                      )}
                    </div>
                  ))}
                </div>

                {selectedMethod === "credit-card" && (
                  <div className="space-y-4 mt-6 p-4 bg-gray-700 rounded-lg">
                    <Input
                      placeholder="Número de tarjeta"
                      value={cardNumber}
                      onChange={handleCardNumberChange}
                      maxLength={19}
                      className="bg-gray-600 border-gray-500"
                    />
                    <Input
                      placeholder="Nombre en la tarjeta"
                      value={cardName}
                      onChange={(e) => setCardName(e.target.value)}
                      className="bg-gray-600 border-gray-500"
                    />
                    <div className="grid grid-cols-2 gap-4">
                      <Input
                        placeholder="MM/YY"
                        value={expiryDate}
                        onChange={(e) => setExpiryDate(e.target.value)}
                        maxLength={5}
                        className="bg-gray-600 border-gray-500"
                      />
                      <Input
                        placeholder="CVV"
                        value={cvv}
                        onChange={(e) => setCvv(e.target.value)}
                        maxLength={4}
                        type="password"
                        className="bg-gray-600 border-gray-500"
                      />
                    </div>
                  </div>
                )}

                {selectedMethod === "cash-payment" && (
                  <Alert className="bg-blue-900/50 border-blue-500 mt-4">
                    <QrCode className="w-4 h-4" />
                    <AlertDescription>
                      Generaremos un código de pago que podrás utilizar en cualquier tienda afiliada.
                      El código tiene una validez de 48 horas.
                    </AlertDescription>
                  </Alert>
                )}
              </CardContent>
            </Card>

            <Button
              onClick={handlePayment}
              className="w-full bg-teal-500 hover:bg-teal-600 py-6 text-lg"
              disabled={processing}
            >
              {processing ? (
                <div className="flex items-center gap-2">
                  <span className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></span>
                  Procesando...
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <span>Pagar ${(299.99).toFixed(2)}</span>
                  <ArrowRight className="w-5 h-5" />
                </div>
              )}
            </Button>
          </div>

          <div className="lg:col-span-1 space-y-6">
            <Card className="bg-gray-800 border-gray-700">
              <CardHeader>
                <CardTitle>Resumen del Pago</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between py-2 border-b border-gray-700">
                  <span>Subtotal</span>
                  <span>$285.99</span>
                </div>
                <div className="flex justify-between py-2 border-b border-gray-700">
                  <span>IVA (16%)</span>
                  <span>$14.00</span>
                </div>
                <div className="flex justify-between py-2 font-bold text-lg">
                  <span>Total</span>
                  <span>$299.99</span>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gray-800 border-gray-700">
              <CardContent className="p-4 space-y-3">
                <div className="flex items-center gap-2 text-sm">
                  <Shield className="w-4 h-4 text-teal-500" />
                  <span>Pago 100% seguro y encriptado</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Clock className="w-4 h-4 text-teal-500" />
                  <span>Confirmación inmediata</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <CheckCircle2 className="w-4 h-4 text-teal-500" />
                  <span>Garantía de satisfacción</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Payment;