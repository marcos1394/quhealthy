"use client";
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Calendar, Clock, Trash2, Minus, Plus, Info, User, MapPin } from "lucide-react";
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
  duration: number; // en minutos
  category: "service" | "product";
  provider?: ServiceProvider;
  scheduledDate?: string;
  scheduledTime?: string;
  location?: string;
}

const Cart: React.FC = () => {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [total, setTotal] = useState(0);
  const [totalDuration, setTotalDuration] = useState(0);

  useEffect(() => {
    // Simulación de items iniciales
    setCartItems([
      {
        id: "1",
        name: "Masaje Terapéutico",
        price: 85.00,
        quantity: 1,
        imageUrl: "/api/placeholder/120/120",
        duration: 60,
        category: "service",
        provider: {
          id: "p1",
          name: "Dra. María García",
          specialization: "Fisioterapeuta",
          rating: 4.8
        },
        scheduledDate: "2025-01-20",
        scheduledTime: "10:00",
        location: "Sala 3 - Centro Médico"
      },
      {
        id: "2",
        name: "Crema Post-tratamiento",
        price: 35.99,
        quantity: 1,
        imageUrl: "/api/placeholder/120/120",
        duration: 0,
        category: "product"
      }
    ]);
  }, []);

  useEffect(() => {
    const newTotal = cartItems.reduce((acc, item) => acc + item.price * item.quantity, 0);
    setTotal(newTotal);
    
    const newDuration = cartItems.reduce((acc, item) => acc + (item.duration || 0) * item.quantity, 0);
    setTotalDuration(newDuration);
  }, [cartItems]);

  const handleIncreaseQuantity = (id: string) => {
    setCartItems((prevItems) =>
      prevItems.map((item) => {
        if (item.id === id) {
          // Para servicios, mostrar advertencia si se intenta añadir más de uno
          if (item.category === "service" && item.quantity >= 1) {
            Toast({
              title: "Advertencia",
              variant: "destructive",
              children:(
                <ToastDescription>
                Los servicios deben reservarse individualmente para diferentes horarios
                </ToastDescription>

              )
            });
            return item;
          }
          return { ...item, quantity: item.quantity + 1 };
        }
        return item;
      })
    );
  };

  const handleDecreaseQuantity = (id: string) => {
    setCartItems((prevItems) =>
      prevItems.map((item) =>
        item.id === id && item.quantity > 1
          ? { ...item, quantity: item.quantity - 1 }
          : item
      )
    );
  };

  const handleRemoveItem = (id: string) => {
    setCartItems((prevItems) => prevItems.filter((item) => item.id !== id));
    Toast({
        title: "Advertencia",
        variant: "destructive", // Cambiado a 'destructive'
        children: (
          <ToastDescription>
            Los servicios deben reservarse individualmente para diferentes horarios.
          </ToastDescription>
        ),
      });
  };

  const renderItemDetails = (item: CartItem) => {
    if (item.category === "service") {
      return (
        <div className="space-y-2 text-sm text-gray-300">
          {item.provider && (
            <div className="flex items-center gap-2">
              <User className="w-4 h-4" />
              <span>{item.provider.name}</span>
              <span className="text-yellow-400">★ {item.provider.rating}</span>
            </div>
          )}
          {item.scheduledDate && item.scheduledTime && (
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              <span>{new Date(item.scheduledDate).toLocaleDateString()}</span>
              <Clock className="w-4 h-4 ml-2" />
              <span>{item.scheduledTime}</span>
            </div>
          )}
          {item.location && (
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4" />
              <span>{item.location}</span>
            </div>
          )}
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4" />
            <span>{item.duration} minutos</span>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 via-gray-800 to-gray-900 text-white p-6">
      <h1 className="text-3xl font-bold mb-6">Tu Carrito de Servicios y Productos</h1>

      {cartItems.length === 0 ? (
        <Card className="bg-gray-800 border-gray-700">
          <CardContent className="p-6">
            <p className="text-gray-400">Tu carrito está vacío.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          <Alert className="bg-blue-900/50 border-blue-500">
            <Info className="w-4 h-4" />
            <AlertDescription>
              Los servicios requieren confirmación del proveedor. Recibirás una notificación una vez confirmada tu cita.
            </AlertDescription>
          </Alert>

          <Card className="bg-gray-800 border-gray-700">
            <CardContent className="p-6">
              <Table>
                <TableHeader className="bg-gray-700">
                  <TableRow>
                    <TableHead className="text-gray-300">Producto/Servicio</TableHead>
                    <TableHead className="text-gray-300">Cantidad</TableHead>
                    <TableHead className="text-gray-300">Precio</TableHead>
                    <TableHead className="text-gray-300 text-right">Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {cartItems.map((item) => (
                    <TableRow key={item.id} className="hover:bg-gray-700/50">
                      <TableCell>
                        <div className="flex gap-4">
                          <img 
                            src={item.imageUrl} 
                            alt={item.name} 
                            className="w-16 h-16 object-cover rounded-lg"
                          />
                          <div className="space-y-2">
                            <div className="font-medium">{item.name}</div>
                            {renderItemDetails(item)}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Button
                            onClick={() => handleDecreaseQuantity(item.id)}
                            size="sm"
                            variant="ghost"
                            className="text-gray-400 hover:text-white"
                            disabled={item.category === "service"}
                          >
                            <Minus className="w-4 h-4" />
                          </Button>
                          <span>{item.quantity}</span>
                          <Button
                            onClick={() => handleIncreaseQuantity(item.id)}
                            size="sm"
                            variant="ghost"
                            className="text-gray-400 hover:text-white"
                            disabled={item.category === "service"}
                          >
                            <Plus className="w-4 h-4" />
                          </Button>
                        </div>
                      </TableCell>
                      <TableCell>${(item.price * item.quantity).toFixed(2)}</TableCell>
                      <TableCell className="text-right">
                        <Button
                          onClick={() => handleRemoveItem(item.id)}
                          variant="ghost"
                          size="sm"
                          className="text-red-400 hover:text-red-600"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="bg-gray-800 border-gray-700">
              <CardContent className="p-6">
                <h2 className="text-xl font-semibold mb-4">Resumen de la Reserva</h2>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span>Subtotal:</span>
                    <span>${total.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Duración total de servicios:</span>
                    <span>{totalDuration} minutos</span>
                  </div>
                  <div className="flex justify-between text-lg font-bold pt-3 border-t border-gray-700">
                    <span>Total:</span>
                    <span>${total.toFixed(2)}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gray-800 border-gray-700">
              <CardContent className="p-6 space-y-4">
                <Button
                  className="w-full bg-teal-500 hover:bg-teal-600 text-lg py-6"
                >
                  Proceder al Pago
                </Button>
                <p className="text-sm text-gray-400 text-center">
                  Al continuar, aceptas nuestros términos y condiciones de reserva de servicios.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
};

export default Cart;