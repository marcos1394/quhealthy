"use client";

import { useEffect, useRef } from "react";
import { trackEcommerceEvent } from "@/lib/analytics/funnel-events";

interface ItemViewTrackerProps {
  itemId: number | string;
  itemType: string;
  category?: string;
  price?: number;
  currency?: string;
  providerId?: number | string;
}

/**
 * Registra el evento estándar GA4 `view_item` al visualizar un producto,
 * servicio, paquete o curso en el Marketplace (sin PII).
 */
export function ItemViewTracker({
  itemId,
  itemType,
  category,
  price,
  currency = "MXN",
  providerId,
}: ItemViewTrackerProps) {
  const trackedRef = useRef<string | null>(null);

  useEffect(() => {
    const key = `${itemId}:${itemType}`;
    if (trackedRef.current === key) return;
    trackedRef.current = key;

    trackEcommerceEvent("view_item", {
      item_id: String(itemId),
      item_type: itemType,
      item_category: category || itemType,
      value: typeof price === "number" ? price : undefined,
      currency,
      providerId,
    });
  }, [itemId, itemType, category, price, currency, providerId]);

  return null;
}
