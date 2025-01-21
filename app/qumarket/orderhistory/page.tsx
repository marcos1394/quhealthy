"use client";
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Loader2,
  Eye,
  ClipboardList,
  Package,
  CheckCircle,
  Clock,
  XCircle,
  Search,
  Calendar,
  Filter,
  Download,
  ArrowUpDown,
  MapPin,
  User,
  AlertCircle
} from "lucide-react";
import { format, parseISO, isAfter, isBefore, subMonths } from "date-fns";
import { es } from "date-fns/locale";

interface ServiceProvider {
  id: string;
  name: string;
  specialization: string;
}

interface OrderItem {
  id: string;
  name: string;
  quantity: number;
  price: number;
  type: "service" | "product";
  provider?: ServiceProvider;
  scheduledDate?: string;
  location?: string;
}

interface Order {
  id: string;
  date: string;
  total: number;
  status: "completed" | "pending" | "cancelled" | "in_progress";
  items: OrderItem[];
  paymentMethod: string;
  trackingInfo?: {
    status: string;
    estimatedDelivery?: string;
  };
}

const OrderHistory: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [sortBy, setSortBy] = useState<"date" | "total">("date");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");
  const [dateRange, setDateRange] = useState<"all" | "1m" | "3m" | "6m">("all");

  useEffect(() => {
    setLoading(true);
    setTimeout(() => {
      setOrders([
        {
          id: "ORD-001",
          date: new Date().toISOString(),
          total: 185.99,
          status: "completed",
          paymentMethod: "Tarjeta de crédito",
          items: [
            {
              id: "1",
              name: "Masaje terapéutico",
              quantity: 1,
              price: 85.99,
              type: "service",
              provider: {
                id: "p1",
                name: "Dra. María García",
                specialization: "Fisioterapeuta"
              },
              scheduledDate: "2025-01-20T10:00:00",
              location: "Sala 3 - Centro Médico"
            },
            {
              id: "2",
              name: "Crema post-tratamiento",
              quantity: 2,
              price: 49.99,
              type: "product"
            }
          ]
        },
        {
          id: "ORD-002",
          date: new Date(new Date().setDate(new Date().getDate() - 3)).toISOString(),
          total: 129.50,
          status: "in_progress",
          paymentMethod: "Mercado Pago",
          items: [
            {
              id: "3",
              name: "Limpieza facial profunda",
              quantity: 1,
              price: 89.50,
              type: "service",
              provider: {
                id: "p2",
                name: "Ana Martínez",
                specialization: "Cosmetóloga"
              },
              scheduledDate: "2025-01-25T15:30:00",
              location: "Sala 2 - Centro de Belleza"
            },
            {
              id: "4",
              name: "Mascarilla hidratante",
              quantity: 2,
              price: 19.99,
              type: "product"
            }
          ]
        },
        {
          id: "ORD-003",
          date: new Date(new Date().setDate(new Date().getDate() - 7)).toISOString(),
          total: 75.0,
          status: "cancelled",
          paymentMethod: "Transferencia bancaria",
          items: [
            {
              id: "5",
              name: "Kit de cuidado facial",
              quantity: 1,
              price: 75.0,
              type: "product"
            }
          ]
        }
      ]);
      setLoading(false);
    }, 1000);
  }, []);

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      completed: { className: "bg-green-500/20 text-green-400", icon: CheckCircle, label: "Completado" },
      pending: { className: "bg-yellow-500/20 text-yellow-400", icon: Clock, label: "Pendiente" },
      cancelled: { className: "bg-red-500/20 text-red-400", icon: XCircle, label: "Cancelado" },
      in_progress: { className: "bg-blue-500/20 text-blue-400", icon: Package, label: "En proceso" }
    };
    const config = statusConfig[status as keyof typeof statusConfig];
    const StatusIcon = config.icon;
    return (
      <span className={`px-3 py-1 rounded-full text-sm font-medium flex items-center gap-2 w-fit ${config.className}`}>
        <StatusIcon className="w-4 h-4" />
        {config.label}
      </span>
    );
  };

  const filteredOrders = orders
    .filter(order => {
      const matchesSearch = 
        order.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.items.some(item => item.name.toLowerCase().includes(searchTerm.toLowerCase()));
      
      const matchesStatus = filterStatus === "all" || order.status === filterStatus;
      
      const matchesDateRange = () => {
        if (dateRange === "all") return true;
        const orderDate = parseISO(order.date);
        const monthsAgo = subMonths(new Date(), parseInt(dateRange));
        return isAfter(orderDate, monthsAgo);
      };

      return matchesSearch && matchesStatus && matchesDateRange();
    })
    .sort((a, b) => {
      const dateA = parseISO(a.date);
      const dateB = parseISO(b.date);
      if (sortBy === "date") {
        return sortDirection === "asc" 
          ? dateA.getTime() - dateB.getTime()
          : dateB.getTime() - dateA.getTime();
      } else {
        return sortDirection === "asc"
          ? a.total - b.total
          : b.total - a.total;
      }
    });

  const handleSort = (field: "date" | "total") => {
    if (sortBy === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortBy(field);
      setSortDirection("desc");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex justify-center items-center bg-gradient-to-b from-gray-900 via-gray-800 to-gray-900 text-white">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-8 h-8 animate-spin text-teal-400" />
          <p className="text-gray-400">Cargando tu historial de pedidos...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 via-gray-800 to-gray-900 text-white p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">Historial de Pedidos</h1>
          <Button
            variant="outline"
            className="border-gray-600 text-gray-300 hover:text-white"
          >
            <Download className="w-4 h-4 mr-2" />
            Exportar Historial
          </Button>
        </div>

        {/* Resumen de estadísticas */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          {[
            { label: "Total Pedidos", value: orders.length, icon: Package },
            { label: "Completados", value: orders.filter(o => o.status === "completed").length, icon: CheckCircle },
            { label: "En Proceso", value: orders.filter(o => o.status === "in_progress").length, icon: Clock },
            { label: "Cancelados", value: orders.filter(o => o.status === "cancelled").length, icon: XCircle }
          ].map((stat, index) => (
            <Card key={index} className="bg-gray-800 border-gray-700">
              <CardContent className="p-6 flex justify-between items-center">
                <div>
                  <p className="text-sm text-gray-400">{stat.label}</p>
                  <p className="text-2xl font-bold mt-1">{stat.value}</p>
                </div>
                <stat.icon className="w-8 h-8 text-gray-400" />
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Filtros y búsqueda */}
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Buscar por ID o producto..."
                className="pl-10 bg-gray-700 border-gray-600"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
          <div className="flex gap-4">
            <select
              className="bg-gray-700 border-gray-600 rounded-md px-4 py-2"
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
            >
              <option value="all">Todos los estados</option>
              <option value="completed">Completados</option>
              <option value="in_progress">En proceso</option>
              <option value="pending">Pendientes</option>
              <option value="cancelled">Cancelados</option>
            </select>
            <select
              className="bg-gray-700 border-gray-600 rounded-md px-4 py-2"
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value as any)}
            >
              <option value="all">Todo el historial</option>
              <option value="1">Último mes</option>
              <option value="3">Últimos 3 meses</option>
              <option value="6">Últimos 6 meses</option>
            </select>
          </div>
        </div>

        {filteredOrders.length === 0 ? (
          <Card className="bg-gray-800 border-gray-700">
            <CardContent className="p-12 flex flex-col items-center justify-center text-center">
              <ClipboardList className="w-12 h-12 text-gray-400 mb-4" />
              <p className="text-gray-400 mb-2">No se encontraron pedidos</p>
              <p className="text-sm text-gray-500">Prueba ajustando los filtros de búsqueda</p>
            </CardContent>
          </Card>
        ) : (
          <Card className="bg-gray-800 border-gray-700">
            <CardContent className="p-6">
              <Table>
                <TableHeader className="bg-gray-700">
                  <TableRow>
                    <TableHead className="text-gray-300">ID Pedido</TableHead>
                    <TableHead 
                      className="text-gray-300 cursor-pointer"
                      onClick={() => handleSort("date")}
                    >
                      <div className="flex items-center gap-2">
                        Fecha
                        <ArrowUpDown className="w-4 h-4" />
                      </div>
                    </TableHead>
                    <TableHead 
                      className="text-gray-300 cursor-pointer"
                      onClick={() => handleSort("total")}
                    >
                      <div className="flex items-center gap-2">
                        Total
                        <ArrowUpDown className="w-4 h-4" />
                      </div>
                    </TableHead>
                    <TableHead className="text-gray-300">Estado</TableHead>
                    <TableHead className="text-gray-300">Método de Pago</TableHead>
                    <TableHead className="text-gray-300 text-right">Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredOrders.map((order) => (
                    <TableRow
                      key={order.id}
                      className="hover:bg-gray-700/50 transition-colors"
                    >
                      <TableCell className="font-medium">{order.id}</TableCell>
                      <TableCell>{format(parseISO(order.date), "dd MMM yyyy", { locale: es })}</TableCell>
                      <TableCell>${order.total.toFixed(2)}</TableCell>
                      <TableCell>{getStatusBadge(order.status)}</TableCell>
                      <TableCell>{order.paymentMethod}</TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="hover:bg-gray-700"
                          onClick={() => setSelectedOrder(order)}
                        >
                          <Eye className="w-4 h-4 mr-2" />
                          Ver detalles
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        )}

        {/* Modal de detalles del pedido */}
        <Dialog open={!!selectedOrder} onOpenChange={() => setSelectedOrder(null)}>
          <DialogContent className="bg-gray-800 text-white border-gray-700 max-w-3xl">
            <DialogHeader>
              <DialogTitle className="text-xl">
                Detalles del Pedido {selectedOrder?.id}
              </DialogTitle>
            </DialogHeader>
            {selectedOrder && (
              <div className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h4 className="text-sm font-medium text-gray-400">Fecha</h4>
                    <p className="text-white">
                      {format(parseISO(selectedOrder.date), "dd MMM yyyy, HH:mm", { locale: es })}
                    </p>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-gray-400">Estado</h4>
                    {getStatusBadge(selectedOrder.status)}
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-gray-400">Método de Pago</h4>
                    <p className="text-white">{selectedOrder.paymentMethod}</p>
                  </div>
                  {selectedOrder.trackingInfo && (
                    <div>
                      <h4 className="text-sm font-medium text-gray-400">Rastreo</h4>
                      <p className="text-white">{selectedOrder.trackingInfo.status}</p>
                      {selectedOrder.trackingInfo.estimatedDelivery && (
                        <p className="text-gray-400">
                          Entrega estimada:{" "}
                          {format(
                            parseISO(selectedOrder.trackingInfo.estimatedDelivery),
                            "dd MMM yyyy",
                            { locale: es }
                          )}
                        </p>
                      )}
                    </div>
                  )}
                </div>

                <div>
                  <h4 className="text-sm font-medium text-gray-400 mb-2">Artículos</h4>
                  <div className="space-y-4">
                    {selectedOrder.items.map((item) => (
                      <div
                        key={item.id}
                        className="flex items-start justify-between bg-gray-700/50 rounded-md p-4"
                      >
                        <div>
                          <p className="font-medium">{item.name}</p>
                          <p className="text-sm text-gray-400">
                            {item.type === "service" && item.provider
                              ? `Proveedor: ${item.provider.name} (${item.provider.specialization})`
                              : "Producto"}
                          </p>
                          {item.type === "service" && item.scheduledDate && (
                            <div className="text-sm text-gray-400 mt-2">
                              <Calendar className="inline w-4 h-4 mr-1" />
                              {format(parseISO(item.scheduledDate), "dd MMM yyyy, HH:mm", {
                                locale: es,
                              })}
                              <MapPin className="inline w-4 h-4 ml-3 mr-1" />
                              {item.location}
                            </div>
                          )}
                        </div>
                        <div className="text-right">
                          <p className="font-medium">${(item.price * item.quantity).toFixed(2)}</p>
                          <p className="text-sm text-gray-400">Cantidad: {item.quantity}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="pt-4 border-t border-gray-700">
                  <div className="flex justify-between font-bold">
                    <span>Total</span>
                    <span>${selectedOrder.total.toFixed(2)}</span>
                  </div>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

export default OrderHistory;
