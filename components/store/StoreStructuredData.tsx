import React from "react";
import { StorefrontData } from "@/types/storefront";

interface StoreStructuredDataProps {
  store: StorefrontData;
  canonicalUrl?: string;
}

export const StoreStructuredData: React.FC<StoreStructuredDataProps> = ({
  store,
  canonicalUrl,
}) => {
  const isClinic = store.providerType === "CLINIC" || (store.staff && store.staff.length > 1);

  const schemaType = isClinic ? "MedicalClinic" : "Physician";

  const schemaData: Record<string, any> = {
    "@context": "https://schema.org",
    "@type": schemaType,
    "@id": canonicalUrl || `https://www.quhealthy.org/store/${store.slug}`,
    name: store.displayName,
    description: store.bio || `Servicios médicos y consultas con ${store.displayName}`,
    url: canonicalUrl || `https://www.quhealthy.org/store/${store.slug}`,
    image: store.logoUrl || store.bannerUrl || "https://www.quhealthy.org/icon-512x512.png",
    priceRange: store.services && store.services.length > 0
      ? `$${Math.min(...store.services.map((s) => s.price))} - $${Math.max(...store.services.map((s) => s.price))} MXN`
      : "$$",
  };

  if (store.specialty) {
    schemaData.medicalSpecialty = store.specialty;
  }

  if (store.phone) {
    schemaData.telephone = store.phone;
  }

  if (store.rating && store.reviewsCount && store.reviewsCount > 0) {
    schemaData.aggregateRating = {
      "@type": "AggregateRating",
      ratingValue: store.rating.toFixed(1),
      reviewCount: store.reviewsCount,
      bestRating: "5",
      worstRating: "1",
    };
  }

  if (store.address || store.city) {
    schemaData.address = {
      "@type": "PostalAddress",
      streetAddress: store.address || "",
      addressLocality: store.city || "",
      addressCountry: "MX",
    };
  }

  if (store.latitude && store.longitude) {
    schemaData.geo = {
      "@type": "GeoCoordinates",
      latitude: store.latitude,
      longitude: store.longitude,
    };
  }

  if (store.services && store.services.length > 0) {
    schemaData.hasOfferCatalog = {
      "@type": "OfferCatalog",
      name: "Servicios y Consultas Médicas",
      itemListElement: store.services.slice(0, 10).map((service, index) => ({
        "@type": "Offer",
        itemOffered: {
          "@type": "MedicalProcedure",
          name: service.name,
          description: service.description,
        },
        price: service.price,
        priceCurrency: "MXN",
        position: index + 1,
      })),
    };
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaData) }}
    />
  );
};
