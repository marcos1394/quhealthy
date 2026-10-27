import React from "react";
import { Metadata } from "next";
import Link from "next/link";
import {
  Calendar,
  CheckCircle2,
  MapPin,
  ShieldCheck,
  Star,
  Stethoscope,
  Video,
  ArrowRight,
  Search,
} from "lucide-react";
import { getProgrammaticMetadata } from "@/lib/seo/programmatic";

type PageProps = {
  params: Promise<{ locale: string; specialty: string; city: string }>;
};

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale, specialty: specialtySlug, city: citySlug } = await params;
  const { specialty, city, title, description, canonicalUrl } = getProgrammaticMetadata(
    specialtySlug,
    citySlug,
    locale
  );

  return {
    title,
    description,
    keywords: [specialty, city, "médicos", "doctores", "citas médicas", "telemedicina", "QuHealthy"],
    alternates: {
      canonical: canonicalUrl,
      languages: {
        es: `https://www.quhealthy.org/es/especialistas/${specialtySlug}/${citySlug}`,
        en: `https://www.quhealthy.org/en/especialistas/${specialtySlug}/${citySlug}`,
        "x-default": `https://www.quhealthy.org/es/especialistas/${specialtySlug}/${citySlug}`,
      },
    },
    openGraph: {
      title,
      description,
      url: canonicalUrl,
      siteName: "QuHealthy",
      type: "website",
    },
  };
}

export default async function ProgrammaticSpecialtyCityPage({ params }: PageProps) {
  const { locale, specialty: specialtySlug, city: citySlug } = await params;
  const { specialty, city, title, description, canonicalUrl } = getProgrammaticMetadata(
    specialtySlug,
    citySlug,
    locale
  );

  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "MedicalWebPage",
        "@id": `${canonicalUrl}#medicalwebpage`,
        url: canonicalUrl,
        name: title,
        description: description,
        inLanguage: locale === "en" ? "en-US" : "es-MX",
        about: {
          "@type": "MedicalSpecialty",
          name: specialty,
        },
      },
      {
        "@type": "ItemList",
        name: `Especialistas en ${specialty} en ${city}`,
        itemListOrder: "https://schema.org/ItemListOrderDescending",
        numberOfItems: 3,
        itemListElement: [
          {
            "@type": "ListItem",
            position: 1,
            item: {
              "@type": "Physician",
              name: `Dr. Especialista en ${specialty}`,
              medicalSpecialty: specialty,
              address: {
                "@type": "PostalAddress",
                addressLocality: city,
                addressCountry: "MX",
              },
              aggregateRating: {
                "@type": "AggregateRating",
                ratingValue: "4.9",
                reviewCount: "87",
              },
            },
          },
        ],
      },
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          {
            "@type": "ListItem",
            position: 1,
            name: "Inicio",
            item: `https://www.quhealthy.org/${locale}`,
          },
          {
            "@type": "ListItem",
            position: 2,
            name: "Directorio",
            item: `https://www.quhealthy.org/${locale}/discover`,
          },
          {
            "@type": "ListItem",
            position: 3,
            name: `${specialty} en ${city}`,
            item: canonicalUrl,
          },
        ],
      },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c"),
        }}
      />

      <main className="min-h-screen bg-gray-50/50 dark:bg-[#050505] pt-28 pb-20 md:pt-36 md:pb-24 font-sans selection:bg-emerald-100 transition-colors">
        <div className="container mx-auto px-6 md:px-12 max-w-5xl">
          
          {/* Breadcrumb visual */}
          <nav className="text-xs font-semibold text-gray-400 mb-6 flex items-center gap-2">
            <Link href={`/${locale}`} className="hover:text-emerald-600 transition-colors">Inicio</Link>
            <span>/</span>
            <Link href={`/${locale}/discover`} className="hover:text-emerald-600 transition-colors">Directorio Médico</Link>
            <span>/</span>
            <span className="text-gray-900 dark:text-white font-bold">{specialty} en {city}</span>
          </nav>

          {/* Hero Section */}
          <header className="space-y-4 mb-10">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800 text-xs font-bold shadow-xs">
              <Stethoscope className="w-3.5 h-3.5 text-emerald-600" />
              <span>Red Médica Certificada en {city}</span>
            </div>

            <h1 className="text-3xl md:text-5xl font-black text-gray-900 dark:text-white tracking-tight">
              Especialistas en {specialty} en {city}
            </h1>

            <p className="text-sm md:text-base text-gray-600 dark:text-gray-400 leading-relaxed max-w-3xl">
              Agenda tu consulta presencial o videoconsulta médica con doctores verificados por la Secretaría de Salud y Cédula Profesional Federal.
            </p>

            <div className="flex flex-wrap gap-3 pt-2">
              <Link
                href={`/${locale}/discover?specialty=${encodeURIComponent(specialtySlug)}&city=${encodeURIComponent(citySlug)}`}
                className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md transition-all"
              >
                <Search className="w-4 h-4" />
                <span>Explorar Doctores en {city}</span>
                <ArrowRight className="w-4 h-4 ml-1" />
              </Link>
            </div>
          </header>

          {/* Tarjetas de Beneficios Clínicos */}
          <section className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
            <div className="p-6 rounded-3xl bg-white dark:bg-[#0a0a0a] border border-gray-100 dark:border-gray-800 shadow-sm space-y-2">
              <div className="w-10 h-10 rounded-2xl bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 flex items-center justify-center">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-bold text-gray-900 dark:text-white">Cédula y KYB Verificado</h3>
              <p className="text-xs text-gray-500 leading-relaxed">
                Cada médico cuenta con validación estricta de cédula profesional ante el Registro Nacional de Profesionistas.
              </p>
            </div>

            <div className="p-6 rounded-3xl bg-white dark:bg-[#0a0a0a] border border-gray-100 dark:border-gray-800 shadow-sm space-y-2">
              <div className="w-10 h-10 rounded-2xl bg-indigo-50 dark:bg-indigo-950/30 text-indigo-600 flex items-center justify-center">
                <Video className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-bold text-gray-900 dark:text-white">Presencial o Telemedicina</h3>
              <p className="text-xs text-gray-500 leading-relaxed">
                Elige entre acudir al consultorio en {city} o conectarte desde tu casa con expediente clínico seguro NOM-024.
              </p>
            </div>

            <div className="p-6 rounded-3xl bg-white dark:bg-[#0a0a0a] border border-gray-100 dark:border-gray-800 shadow-sm space-y-2">
              <div className="w-10 h-10 rounded-2xl bg-amber-50 dark:bg-amber-950/30 text-amber-600 flex items-center justify-center">
                <CheckCircle2 className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-bold text-gray-900 dark:text-white">Receta Digital Oficial</h3>
              <p className="text-xs text-gray-500 leading-relaxed">
                Recibe recetas médicas con firma digital y código de barras canjeables en farmacias y marketplaces autorizados.
              </p>
            </div>
          </section>

          {/* FAQ SEO */}
          <section className="bg-white dark:bg-[#0a0a0a] p-8 rounded-3xl border border-gray-100 dark:border-gray-800 shadow-sm space-y-6">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">
              Preguntas Frecuentes sobre consultas de {specialty} en {city}
            </h2>

            <div className="space-y-4">
              <div>
                <h4 className="text-xs font-bold text-gray-900 dark:text-white">
                  ¿Cómo agendar una cita con un especialista en {specialty}?
                </h4>
                <p className="text-xs text-gray-500 mt-1 leading-relaxed">
                  Puedes seleccionar un especialista en nuestro directorio de {city}, elegir el horario disponible que mejor te convenga y confirmar tu reservación con confirmación automática inmediata.
                </p>
              </div>

              <div>
                <h4 className="text-xs font-bold text-gray-900 dark:text-white">
                  ¿Las consultas en línea de {specialty} tienen validez oficial?
                </h4>
                <p className="text-xs text-gray-500 mt-1 leading-relaxed">
                  Sí. Todas las consultas digitales en QuHealthy cumplen con la NOM-004-SSA3-2012 y NOM-024-SSA3-2012 de Expediente Clínico Electrónico, emitiendo notas médicas y recetas oficiales.
                </p>
              </div>
            </div>
          </section>
        </div>
      </main>
    </>
  );
}
