import React from 'react';
import { BaseWidget } from '@quhealthy/health-os-contract';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ShoppingBag, BookOpen, Truck, CheckCircle2, ChevronRight, Package, ExternalLink } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';

interface OrderData {
  id: string;
  orderNumber: string;
  date: string;
  status: 'PENDING' | 'PROCESSING' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED';
  total: number;
  items: Array<{
    name: string;
    quantity: number;
  }>;
}

interface CourseData {
  id: string;
  title: string;
  progress: number;
  thumbnailUrl?: string;
  lastAccessed?: string;
}

interface OrdersAndCoursesData {
  orders?: {
    content?: OrderData[];
  };
  courses?: CourseData[];
}

type OrderWidgetType = BaseWidget<OrdersAndCoursesData>;

interface Props {
  widget: OrderWidgetType;
  onAction?: (action: any) => void;
}

export const OrderWidget: React.FC<Props> = ({ widget, onAction }) => {
  const { data } = widget;
  const orders = data.orders?.content || [];
  const courses = data.courses || [];

  const getOrderStatusIcon = (status: string) => {
    switch (status) {
      case 'PENDING':
      case 'PROCESSING':
        return <Package className="w-3.5 h-3.5" />;
      case 'SHIPPED':
        return <Truck className="w-3.5 h-3.5" />;
      case 'DELIVERED':
        return <CheckCircle2 className="w-3.5 h-3.5" />;
      default:
        return <ShoppingBag className="w-3.5 h-3.5" />;
    }
  };

  const getOrderStatusColor = (status: string) => {
    switch (status) {
      case 'PENDING':
      case 'PROCESSING':
        return 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 border-amber-200 dark:border-amber-800/50';
      case 'SHIPPED':
        return 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 border-blue-200 dark:border-blue-800/50';
      case 'DELIVERED':
        return 'bg-quhealthy-green/10 text-quhealthy-green dark:bg-emerald-900/30 dark:text-emerald-400 border-quhealthy-green/20 dark:border-emerald-800/50';
      default:
        return 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400 border-gray-200 dark:border-gray-700';
    }
  };

  const statusLabel: Record<string, string> = {
    PENDING: 'Pendiente',
    PROCESSING: 'En proceso',
    SHIPPED: 'Enviado',
    DELIVERED: 'Entregado',
    CANCELLED: 'Cancelado',
  };

  return (
    <Card className="w-full max-w-md bg-white dark:bg-[#050505] border-gray-200 dark:border-gray-800 shadow-sm rounded-2xl overflow-hidden flex flex-col">
      <CardHeader className="pb-4 border-b border-gray-100 dark:border-gray-800">
        <CardTitle className="text-base font-bold flex items-center gap-2 text-gray-900 dark:text-white">
          <div className="bg-quhealthy-green/10 dark:bg-emerald-900/30 p-2 rounded-xl text-quhealthy-green dark:text-emerald-400">
            <ShoppingBag className="w-4 h-4" />
          </div>
          Mis Compras y Cursos
        </CardTitle>
      </CardHeader>
      
      <ScrollArea className="flex-1 max-h-[400px]">
        <div className="p-4 space-y-6">
          {/* ORDERS SECTION */}
          <section>
            <h4 className="text-xs font-bold text-gray-900 dark:text-white uppercase tracking-wider mb-3 flex items-center gap-1.5">
              <Package className="w-3.5 h-3.5 text-gray-400" />
              Pedidos Recientes
            </h4>
            
            {orders.length === 0 ? (
              <div className="text-center p-4 border border-dashed border-gray-200 dark:border-gray-800 rounded-xl text-sm text-gray-500">
                No tienes pedidos recientes.
              </div>
            ) : (
              <div className="space-y-3">
                {orders.map((order) => (
                  <div key={order.id} className="border border-gray-100 dark:border-gray-800 rounded-xl p-3 bg-white dark:bg-[#0a0a0a]">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <div className="font-semibold text-sm text-gray-900 dark:text-white">Pedido #{order.orderNumber}</div>
                        <div className="text-[10px] text-gray-500">{order.date}</div>
                      </div>
                      <span className={`flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full border ${getOrderStatusColor(order.status)}`}>
                        {getOrderStatusIcon(order.status)}
                        {statusLabel[order.status] || order.status}
                      </span>
                    </div>
                    
                    <div className="mt-2 pt-2 border-t border-gray-100 dark:border-gray-800/60">
                      <div className="text-xs text-gray-600 dark:text-gray-400 mb-2">
                        {order.items?.length || 0} artículos • <span className="font-semibold text-gray-900 dark:text-gray-200">${order.total} MXN</span>
                      </div>
                      <div className="flex flex-wrap gap-1">
                        {order.items?.slice(0, 2).map((item, idx) => (
                          <div key={idx} className="bg-gray-50 dark:bg-gray-900 text-gray-600 dark:text-gray-400 text-[10px] px-2 py-1 rounded-md max-w-full truncate">
                            {item.quantity}x {item.name}
                          </div>
                        ))}
                        {(order.items?.length || 0) > 2 && (
                          <div className="bg-gray-50 dark:bg-gray-900 text-gray-500 text-[10px] px-2 py-1 rounded-md">
                            +{(order.items?.length || 0) - 2} más
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>

          {/* COURSES SECTION */}
          <section>
            <h4 className="text-xs font-bold text-gray-900 dark:text-white uppercase tracking-wider mb-3 flex items-center gap-1.5">
              <BookOpen className="w-3.5 h-3.5 text-gray-400" />
              Mis Cursos
            </h4>
            
            {courses.length === 0 ? (
              <div className="text-center p-4 border border-dashed border-gray-200 dark:border-gray-800 rounded-xl text-sm text-gray-500">
                No has adquirido ningún curso aún.
              </div>
            ) : (
              <div className="grid gap-3">
                {courses.map((course) => (
                  <div key={course.id} className="flex gap-3 border border-gray-100 dark:border-gray-800 rounded-xl p-3 bg-white dark:bg-[#0a0a0a] group hover:border-quhealthy-green/30 transition-colors">
                    <div className="w-16 h-16 rounded-lg bg-gray-100 dark:bg-gray-800 overflow-hidden shrink-0 relative">
                      {course.thumbnailUrl ? (
                        <img src={course.thumbnailUrl} alt={course.title} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-400">
                          <BookOpen className="w-6 h-6" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0 flex flex-col justify-between">
                      <div>
                        <div className="font-semibold text-sm text-gray-900 dark:text-white line-clamp-1 group-hover:text-quhealthy-green transition-colors">{course.title}</div>
                        {course.lastAccessed && (
                          <div className="text-[10px] text-gray-500 mt-0.5">Último acceso: {course.lastAccessed}</div>
                        )}
                      </div>
                      
                      <div className="mt-2">
                        <div className="flex justify-between items-end mb-1">
                          <span className="text-[10px] font-medium text-gray-500">Progreso</span>
                          <span className="text-[10px] font-bold text-gray-700 dark:text-gray-300">{course.progress}%</span>
                        </div>
                        <div className="w-full bg-gray-100 dark:bg-gray-800 h-1.5 rounded-full overflow-hidden">
                          <div 
                            className="bg-quhealthy-green dark:bg-emerald-500 h-full rounded-full transition-all duration-500" 
                            style={{ width: `${course.progress}%` }}
                          />
                        </div>
                      </div>
                    </div>
                    
                    <button 
                      className="shrink-0 self-center w-8 h-8 rounded-full bg-gray-50 dark:bg-gray-900 flex items-center justify-center text-gray-400 hover:text-quhealthy-green hover:bg-quhealthy-green/10 transition-colors"
                      onClick={() => onAction && onAction({ type: 'open_course', payload: { courseId: course.id } })}
                    >
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </section>
        </div>
      </ScrollArea>
    </Card>
  );
};
