import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { FavoriteButton } from '@/components/ui/FavoriteButton';
import {
  Stethoscope,
  Clock,
  CreditCard,
  ShoppingBag,
  Package,
  BookOpen,
  Calendar,
  GraduationCap,
  Navigation,
  User,
  Star
} from 'lucide-react';

interface Props {
  service: any;
  doctorId: string;
  brandColor?: string;
  onSelect: (service: any) => void;
}

export const ServiceCardWidget: React.FC<Props> = ({ service, doctorId, brandColor = '#10b981', onSelect }) => {
  const getTypeConfig = () => {
    switch (service.category?.toUpperCase() || 'SERVICE') {
      case "SERVICE":
        return {
          icon: <Stethoscope className="w-3 h-3 mr-1" />,
          label: "Servicio",
          ctaLabel: "Reservar Cita",
          ctaIcon: <Calendar className="w-3.5 h-3.5 mr-1.5" />,
        };
      case "PRODUCT":
        return {
          icon: <ShoppingBag className="w-3 h-3 mr-1" />,
          label: "Producto",
          ctaLabel: "Comprar",
          ctaIcon: <CreditCard className="w-3.5 h-3.5 mr-1.5" />,
        };
      case "PACKAGE":
        return {
          icon: <Package className="w-3 h-3 mr-1" />,
          label: "Paquete",
          ctaLabel: "Contratar",
          ctaIcon: <CreditCard className="w-3.5 h-3.5 mr-1.5" />,
        };
      case "COURSE":
        return {
          icon: <BookOpen className="w-3 h-3 mr-1" />,
          label: "Curso",
          ctaLabel: "Inscribirme",
          ctaIcon: <GraduationCap className="w-3.5 h-3.5 mr-1.5" />,
        };
      default:
        return {
          icon: <Stethoscope className="w-3 h-3 mr-1" />,
          label: "Servicio",
          ctaLabel: "Ver",
          ctaIcon: null,
        };
    }
  };

  const typeConfig = getTypeConfig();
  const imageUrl = service.galleryUrls?.[0] || service.imageUrl;

  return (
    <div className="group snap-start shrink-0 w-full min-w-0 overflow-hidden flex flex-col bg-white dark:bg-[#111] border border-gray-100 dark:border-gray-800 hover:border-gray-200 dark:hover:border-gray-700 transition-all cursor-pointer rounded-2xl shadow-sm hover:shadow-xl hover:-translate-y-1">
      {/* IMAGEN */}
      <div className="relative aspect-video w-full bg-gray-50 dark:bg-black overflow-hidden rounded-t-2xl border-b border-gray-100 dark:border-gray-800">
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={service.name}
            className="w-full h-full object-cover transition-all duration-500"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <span className="text-gray-400 font-bold tracking-widest uppercase text-xs flex items-center">
              {typeConfig.icon} {typeConfig.label}
            </span>
          </div>
        )}

        {/* Badges */}
        <div className="absolute top-2 left-2 flex gap-1 flex-col items-start">
          <Badge className="bg-white/90 text-gray-800 dark:bg-black/90 dark:text-gray-200 border border-black/5 dark:border-white/10 text-[10px] font-semibold tracking-wide rounded-full shadow-sm backdrop-blur-md">
            <span className="flex items-center">
              {typeConfig.icon} {typeConfig.label}
            </span>
          </Badge>
          <div className="flex gap-1">
            {(service.discountPercentage ?? 0) > 0 && (
              <Badge className="bg-red-50 text-red-600 dark:bg-red-950/50 dark:text-red-400 text-[9px] font-bold tracking-wide rounded-full border-none shadow-sm backdrop-blur-md">
                -{service.discountPercentage}% OFF
              </Badge>
            )}
          </div>
        </div>

        {/* Botón de Favorito */}
        <div className="absolute top-2 right-2 z-20">
          <FavoriteButton
            entityType={service.category?.toUpperCase() || "SERVICE"}
            entityId={service.serviceId}
            initialIsFavorite={false}
            brandColor={brandColor}
          />
        </div>
      </div>

      {/* CONTENIDO */}
      <div className="p-4 flex flex-col flex-1 bg-transparent rounded-b-2xl min-w-0">
        <h3 className="font-semibold text-[14px] text-gray-900 dark:text-gray-100 leading-snug line-clamp-2 mb-1" title={service.name}>
          {service.name}
        </h3>
        <p className="text-[11px] font-medium line-clamp-1 mb-3 capitalize" style={{ color: brandColor }}>
          {(service.category || "Servicio").toLowerCase()}
        </p>

        {/* Separador */}
        <div className="w-full h-px bg-gray-100 dark:bg-gray-800/50 mb-3" />

        {/* Precio + Duración */}
        <div className="flex items-end justify-between gap-3 mb-4 min-w-0">
          <div className="flex flex-col min-w-0">
            <span className="text-[10px] font-medium text-gray-400 mb-0.5">
              Precio
            </span>
            <div className="flex items-baseline gap-1.5 flex-wrap min-w-0">
              {service.price > 0 ? (
                <>
                  <span className="text-[14px] font-bold text-gray-900 dark:text-gray-100 leading-none">
                    ${service.price.toLocaleString()}
                  </span>
                  {service.compareAtPrice && service.compareAtPrice > service.price && (
                    <span className="text-[10px] text-gray-400 line-through">
                      ${service.compareAtPrice.toLocaleString()}
                    </span>
                  )}
                </>
              ) : (
                <span className="text-[11px] font-semibold" style={{ color: brandColor }}>
                  Por cotizar
                </span>
              )}
            </div>
          </div>
          {service.durationMinutes && (
            <div className="flex items-center text-[10px] font-semibold text-gray-600 dark:text-gray-300 bg-gray-50 dark:bg-gray-900/50 rounded-full px-2 py-1 shrink-0">
              <Clock className="w-3 h-3 mr-1 text-gray-400 shrink-0" />{" "}
              {service.durationMinutes} min
            </div>
          )}
        </div>

        {/* CTA BUTTON */}
        <Button
          onClick={(e) => {
            e.stopPropagation();
            onSelect(service);
          }}
          className="w-full mt-auto rounded-xl h-10 text-xs font-semibold flex items-center justify-center gap-2 transition-all text-white shadow-md hover:shadow-lg hover:opacity-90"
          style={{ backgroundColor: brandColor }}
        >
          {typeConfig.ctaIcon}
          {typeConfig.ctaLabel}
        </Button>
      </div>
    </div>
  );
};
