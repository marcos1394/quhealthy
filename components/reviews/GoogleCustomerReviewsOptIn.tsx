"use client";

import { useEffect } from "react";

interface GoogleCustomerReviewsOptInProps {
  orderId: string | number;
  email?: string | null;
  deliveryDate?: string | Date | null;
  country?: string;
}

export function GoogleCustomerReviewsOptIn({
  orderId,
  email,
  deliveryDate,
  country = "MX",
}: GoogleCustomerReviewsOptInProps) {
  useEffect(() => {
    if (!orderId || !email || !email.includes("@")) return;

    let formattedDate: string;
    try {
      if (!deliveryDate) {
        const d = new Date();
        d.setDate(d.getDate() + 1);
        formattedDate = d.toISOString().split("T")[0];
      } else if (typeof deliveryDate === "string") {
        formattedDate = deliveryDate.split("T")[0];
      } else {
        formattedDate = deliveryDate.toISOString().split("T")[0];
      }
    } catch {
      const d = new Date();
      d.setDate(d.getDate() + 1);
      formattedDate = d.toISOString().split("T")[0];
    }

    const renderOptIn = () => {
      if (typeof window !== "undefined" && (window as any).gapi?.surveyoptin) {
        try {
          (window as any).gapi.surveyoptin.render({
            merchant_id: 5836869157,
            order_id: String(orderId),
            email: email.trim(),
            delivery_country: country,
            estimated_delivery_date: formattedDate,
          });
        } catch (e) {
          console.warn("GCR render error:", e);
        }
      } else if (typeof window !== "undefined" && (window as any).gapi?.load) {
        (window as any).gapi.load("surveyoptin", () => {
          try {
            (window as any).gapi.surveyoptin.render({
              merchant_id: 5836869157,
              order_id: String(orderId),
              email: email.trim(),
              delivery_country: country,
              estimated_delivery_date: formattedDate,
            });
          } catch (e) {
            console.warn("GCR render error:", e);
          }
        });
      }
    };

    (window as any).renderOptIn = renderOptIn;

    if (typeof window !== "undefined" && (window as any).gapi) {
      renderOptIn();
    } else {
      const existingScript = document.getElementById("google-gapi-platform");
      if (!existingScript) {
        const script = document.createElement("script");
        script.id = "google-gapi-platform";
        script.src = "https://apis.google.com/js/platform.js?onload=renderOptIn";
        script.async = true;
        script.defer = true;
        document.body.appendChild(script);
      }
    }
  }, [orderId, email, deliveryDate, country]);

  return null;
}
