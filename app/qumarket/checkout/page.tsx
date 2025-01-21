"use client";
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  Calendar, 
  Clock, 
  CreditCard, 
  Info, 
  MapPin, 
  Phone, 
  Shield, 
  User,
  Calendar as CalendarIcon
} from "lucide-react";
import { Toast, ToastDescription } from "@/components/ui/toast";

interface ServiceProvider {
  id: string;
  name: string;
  specialization: string;
  rating: number;
}

interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  imageUrl: string;
  duration?: number;
  category: "service" | "product";
  provider?: ServiceProvider;
  scheduledDate?: string;
  scheduledTime?: string;
  location?: string;
}

const Checkout: React.FC = () => {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [total, setTotal] = useState(0);
  const [step, setStep] = useState(1);

  const [form, setForm] = useState({
    // Información personal
    name: "",
    email: "",
    phone: "",
    // Información de entrega
    address: "",
    city: "",
    zipCode: "",
    // Información médica
    allergies: "",
    medicalConditions: "",
    currentMedications: "",
    // Preferencias
    communicationPreference: "email",
    reminderPreference: "24h",
    // Información de pago
    cardNumber: "",
    cardExpiry: "",
    cardCVC: "",
    saveCard: false
  });

  useEffect(() => {
    // Simulamos obtener los items del carrito
    const items: CartItem[] = [
      {
        id: "1",
        name: "Masaje Terapéutico",
        price: 85.0,
        quantity: 1,
        imageUrl: "/api/placeholder/120/120",
        duration: 60,
        category: "service", // Debe coincidir con las opciones definidas en el tipo
        provider: {
          id: "p1",
          name: "Dra. María García",
          specialization: "Fisioterapeuta",
          rating: 4.8,
        },
        scheduledDate: "2025-01-20",
        scheduledTime: "10:00",
        location: "Sala 3 - Centro Médico",
      },
      {
        id: "2",
        name: "Crema Post-tratamiento",
        price: 35.99,
        quantity: 1,
        imageUrl: "/api/placeholder/120/120",
        category: "product", // Debe coincidir con las opciones definidas en el tipo
      },
    ];
  
    setCartItems(items);
    setTotal(items.reduce((acc, item) => acc + item.price * item.quantity, 0));
  }, []);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
  };

  const validateStep = (currentStep: number) => {
    switch (currentStep) {
      case 1:
        if (!form.name || !form.email || !form.phone) {
          Toast({
            title: "Campos requeridos",
            variant: "destructive",
            children:(
                <ToastDescription>
                Por favor completa todos los campos personales.
                </ToastDescription>

              )
          });
          return false;
        }
        break;
      case 2:
        if (!form.address || !form.city || !form.zipCode) {
          Toast({
            title: "Campos requeridos",
            variant: "destructive",
            children:(
                            <ToastDescription>
                                Por favor completa todos los campos de dirección.
                            </ToastDescription>
            
                          )
          });
          return false;
        }
        break;
      case 3:
        // La información médica es opcional, pero validamos el formato si se proporciona
        break;
      case 4:
        if (!form.cardNumber || !form.cardExpiry || !form.cardCVC) {
          Toast({
            title: "Campos requeridos",
            variant: "destructive",
            children:(
                            <ToastDescription>
                                Por favor completa todos los campos de pago.
                            </ToastDescription>
            
                          )
          });
          return false;
        }
        break;
    }
    return true;
  };

  const handleNextStep = () => {
    if (validateStep(step)) {
      setStep(step + 1);
    }
  };

  const handlePrevStep = () => {
    setStep(step - 1);
  };

  const handleCheckout = () => {
    if (validateStep(4)) {
      Toast({
        title: "Reserva Exitosa",
        variant: "default",
        children:(
                        <ToastDescription>
                            Tu reserva ha sido confirmada. Recibirás un correo con los detalles.
                        </ToastDescription>
        
                      )
      });
      // Aquí iría la lógica de procesamiento de pago y reserva
    }
  };

  const renderOrderSummary = () => (
    <Card className="bg-gray-800 border-gray-700">
      <CardHeader>
        <CardTitle>Resumen de tu Reserva</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {cartItems.map((item) => (
          <div key={item.id} className="flex justify-between items-start py-2 border-b border-gray-700">
            <div className="space-y-1">
              <p className="font-medium">{item.name}</p>
              {item.category === "service" && (
                <div className="text-sm text-gray-400 space-y-1">
                  <div className="flex items-center gap-2">
                    <CalendarIcon className="w-4 h-4" />
                    <span>{item.scheduledDate} - {item.scheduledTime}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4" />
                    <span>{item.location}</span>
                  </div>
                </div>
              )}
            </div>
            <p className="font-medium">${(item.price * item.quantity).toFixed(2)}</p>
          </div>
        ))}
        <div className="pt-4 border-t border-gray-700">
          <div className="flex justify-between font-bold">
            <span>Total</span>
            <span>${total.toFixed(2)}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <Card className="bg-gray-800 border-gray-700">
            <CardHeader>
              <CardTitle>Información Personal</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Input
                name="name"
                placeholder="Nombre completo"
                className="bg-gray-700 border-gray-600"
                value={form.name}
                onChange={handleInputChange}
                icon={<User className="w-4 h-4" />}
              />
              <Input
                name="email"
                type="email"
                placeholder="Correo electrónico"
                className="bg-gray-700 border-gray-600"
                value={form.email}
                onChange={handleInputChange}
              />
              <Input
                name="phone"
                placeholder="Teléfono"
                className="bg-gray-700 border-gray-600"
                value={form.phone}
                onChange={handleInputChange}
                icon={<Phone className="w-4 h-4" />}
              />
            </CardContent>
          </Card>
        );

      case 2:
        return (
          <Card className="bg-gray-800 border-gray-700">
            <CardHeader>
              <CardTitle>Dirección</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Input
                name="address"
                placeholder="Dirección"
                className="bg-gray-700 border-gray-600"
                value={form.address}
                onChange={handleInputChange}
                icon={<MapPin className="w-4 h-4" />}
              />
              <div className="grid grid-cols-2 gap-4">
                <Input
                  name="city"
                  placeholder="Ciudad"
                  className="bg-gray-700 border-gray-600"
                  value={form.city}
                  onChange={handleInputChange}
                />
                <Input
                  name="zipCode"
                  placeholder="Código Postal"
                  className="bg-gray-700 border-gray-600"
                  value={form.zipCode}
                  onChange={handleInputChange}
                />
              </div>
            </CardContent>
          </Card>
        );

      case 3:
        return (
          <Card className="bg-gray-800 border-gray-700">
            <CardHeader>
              <CardTitle>Información Médica</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Alert className="bg-blue-900/50 border-blue-500">
                <Info className="w-4 h-4" />
                <AlertDescription>
                  Esta información nos ayuda a brindarte un mejor servicio y garantizar tu seguridad.
                </AlertDescription>
              </Alert>
              <Textarea
                name="allergies"
                placeholder="Alergias (si aplica)"
                className="bg-gray-700 border-gray-600"
                value={form.allergies}
                onChange={handleInputChange}
              />
              <Textarea
                name="medicalConditions"
                placeholder="Condiciones médicas relevantes"
                className="bg-gray-700 border-gray-600"
                value={form.medicalConditions}
                onChange={handleInputChange}
              />
              <Textarea
                name="currentMedications"
                placeholder="Medicamentos actuales"
                className="bg-gray-700 border-gray-600"
                value={form.currentMedications}
                onChange={handleInputChange}
              />
            </CardContent>
          </Card>
        );

      case 4:
        return (
          <Card className="bg-gray-800 border-gray-700">
            <CardHeader>
              <CardTitle>Información de Pago</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-2 text-sm text-gray-400 mb-4">
                <Shield className="w-4 h-4" />
                <span>Tus datos de pago están seguros y encriptados</span>
              </div>
              <Input
                name="cardNumber"
                placeholder="Número de tarjeta"
                className="bg-gray-700 border-gray-600"
                value={form.cardNumber}
                onChange={handleInputChange}
                icon={<CreditCard className="w-4 h-4" />}
              />
              <div className="grid grid-cols-2 gap-4">
                <Input
                  name="cardExpiry"
                  placeholder="MM/YY"
                  className="bg-gray-700 border-gray-600"
                  value={form.cardExpiry}
                  onChange={handleInputChange}
                />
                <Input
                  name="cardCVC"
                  placeholder="CVC"
                  className="bg-gray-700 border-gray-600"
                  value={form.cardCVC}
                  onChange={handleInputChange}
                />
              </div>
            </CardContent>
          </Card>
        );
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 via-gray-800 to-gray-900 text-white p-6">
      <h1 className="text-3xl font-bold mb-6">Finalizar Reserva</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {/* Progress Steps */}
          <div className="flex justify-between mb-8">
            {['Información Personal', 'Dirección', 'Información Médica', 'Pago'].map((stepName, index) => (
              <div
                key={stepName}
                className={`flex flex-col items-center ${
                  index + 1 === step
                    ? 'text-teal-500'
                    : index + 1 < step
                    ? 'text-gray-400'
                    : 'text-gray-600'
                }`}
              >
                <div className={`w-8 h-8 rounded-full flex items-center justify-center mb-2 ${
                  index + 1 === step
                    ? 'bg-teal-500 text-white'
                    : index + 1 < step
                    ? 'bg-gray-400 text-white'
                    : 'bg-gray-600'
                }`}>
                  {index + 1}
                </div>
                <span className="text-sm hidden md:block">{stepName}</span>
              </div>
            ))}
          </div>

          {renderStep()}

          <div className="flex justify-between mt-6">
            {step > 1 && (
              <Button
                onClick={handlePrevStep}
                variant="outline"
                className="border-gray-600 text-gray-400 hover:text-white"
              >
                Anterior
              </Button>
            )}
            {step < 4 ? (
              <Button
                onClick={handleNextStep}
                className="bg-teal-500 hover:bg-teal-600 ml-auto"
              >
                Siguiente
              </Button>
            ) : (
              <Button
                onClick={handleCheckout}
                className="bg-teal-500 hover:bg-teal-600 ml-auto"
              >
                Confirmar y Pagar
              </Button>
            )}
          </div>
        </div>

        <div className="lg:col-span-1">
          {renderOrderSummary()}
          
          <Card className="bg-gray-800 border-gray-700 mt-6">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 text-sm text-gray-400">
                <Calendar className="w-4 h-4" />
                <span>Política de cancelación: Gratuita hasta 24h antes</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Checkout;