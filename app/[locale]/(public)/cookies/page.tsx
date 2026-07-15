"use client";
/* eslint-disable react-doctor/prefer-module-scope-pure-function */
import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  ChevronRight,
  Cookie,
  ShieldAlert,
  BarChart3,
  Clock,
  Settings,
  UserCheck,
  ShieldCheck,
  Globe,
  Users,
  History,
  Mail,
  ArrowRight,
} from "lucide-react";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";

// Actualizado al nuevo esquema de colores (black/white/gray)
const parseBoldAndItalic = (text: string) => {
  const parts = text.split(/(\*\*.*?\*\*)/g);
  return parts.map((part, i) => {
    if (part.startsWith("**") && part.endsWith("**")) {
      return (
        <strong
          key={`b-${i}`}
          className="text-black dark:text-white font-medium"
        >
          {part.slice(2, -2)}
        </strong>
      );
    }
    const italicParts = part.split(/(\*[^*]+\*)/g);
    return italicParts.map((ip, j) => {
      if (ip.startsWith("*") && ip.endsWith("*")) {
        return (
          <em
            key={`i-${j}`}
            className="text-gray-500 dark:text-gray-400 italic"
          >
            {ip.slice(1, -1)}
          </em>
        );
      }
      return ip;
    });
  });
};

const renderText = (text: string) => {
  return text.split("\n\n").map((block, idx) => {
    if (block.includes("\n- ")) {
      const parts = block.split("\n- ");
      const intro = parts[0];
      const items = parts.slice(1);
      return (
        <div key={idx} className="mb-6">
          {intro && <p className="mb-3">{parseBoldAndItalic(intro)}</p>}
          <ul className="list-disc pl-6 space-y-2 marker:text-black dark:marker:text-white font-light text-gray-600 dark:text-gray-300">
            {items.map((item, i) => (
              <li key={i}>{parseBoldAndItalic(item)}</li>
            ))}
          </ul>
        </div>
      );
    }
    return (
      <p
        key={idx}
        className="mb-6 text-gray-600 dark:text-gray-300 font-light leading-relaxed"
      >
        {parseBoldAndItalic(block)}
      </p>
    );
  });
};

export default function CookiesPage() {
  const t = useTranslations("PublicCookies");
  const [activeSection, setActiveSection] = useState("intro");

  const sections = [
    { id: "intro", title: t("intro_title"), icon: Cookie },
    { id: "legal-frameworks", title: t("legal_title"), icon: ShieldCheck },
    { id: "tipos", title: t("types_title"), icon: Settings },
    { id: "duration", title: t("duration_title"), icon: Clock },
    { id: "sensitive-data", title: t("sensitive_title"), icon: ShieldAlert },
    { id: "rights", title: t("rights_title"), icon: UserCheck },
    { id: "consentimiento", title: t("consent_title"), icon: Settings },
    { id: "terceros", title: t("thirdparty_title"), icon: Globe },
    { id: "children", title: t("children_title"), icon: Users },
    { id: "changes", title: t("changes_title"), icon: History },
    { id: "contacto", title: t("contact_title"), icon: Mail },
  ];

  // UX Improvement: ScrollSpy
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveSection(entry.target.id);
          }
        });
      },
      { rootMargin: "-20% 0px -80% 0px" },
    );

    sections.forEach((sec) => {
      const element = document.getElementById(sec.id);
      if (element) observer.observe(element);
    });

    return () => observer.disconnect();
  }, [t]);

  // UX Improvement: Smooth Scroll con compensación
  const scrollToSection = (
    e: React.MouseEvent<HTMLAnchorElement>,
    id: string,
  ) => {
    e.preventDefault();
    const element = document.getElementById(id);
    if (element) {
      const offset = 120;
      const elementPosition =
        element.getBoundingClientRect().top + window.scrollY;
      window.scrollTo({
        top: elementPosition - offset,
        behavior: "smooth",
      });
    }
  };

  const handleManagePreferences = () => {
    if (typeof window !== "undefined") {
      localStorage.removeItem("quhealthy_cookie_consent");
      window.location.reload();
    }
  };

  return (
    <div className="min-h-screen bg-white dark:bg-[#0a0a0a] font-sans selection:bg-gray-200 dark:selection:bg-white/20">
      {/* Header Editorial */}
      <section className="pt-32 pb-16 md:pt-40 md:pb-20 border-b border-gray-100 dark:border-white/10 bg-gray-50/50 dark:bg-[#0a0a0a]">
        <div className="container mx-auto px-6 md:px-12 max-w-5xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          >
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-gray-400 dark:text-gray-500 mb-8">
              <Link
                href="/"
                className="hover:text-black dark:hover:text-white transition-colors"
              >
                QuHealthy
              </Link>
              <ChevronRight className="w-3 h-3" />
              <span className="text-black dark:text-white">
                {t("breadcrumb")}
              </span>
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-semibold tracking-tight text-black dark:text-white mb-6 leading-tight">
              {t("title")}
            </h1>
            <p className="text-lg md:text-xl text-gray-500 dark:text-gray-400 font-light max-w-3xl leading-relaxed mb-6">
              {t("subtitle")}
            </p>
            <p className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest">
              {t("date")}
            </p>
          </motion.div>
        </div>
      </section>

      {/* Content Section */}
      <section className="py-16 md:py-24">
        <div className="container mx-auto px-6 md:px-12 max-w-5xl">
          <div className="flex flex-col md:flex-row gap-16 lg:gap-24 items-start">
            {/* Sidebar Navigation: ScrollSpy Activo */}
            <motion.aside
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{
                duration: 0.7,
                delay: 0.2,
                ease: [0.16, 1, 0.3, 1],
              }}
              className="w-full md:w-64 shrink-0 md:sticky md:top-32 hidden lg:block"
            >
              <h3 className="text-xs font-bold text-gray-900 dark:text-white uppercase tracking-widest mb-6">
                {t("toc")}
              </h3>
              <nav className="flex flex-col space-y-1 relative border-l border-gray-200 dark:border-gray-800">
                {sections.map((sec) => {
                  const isActive = activeSection === sec.id;
                  return (
                    <a
                      key={sec.id}
                      href={`#${sec.id}`}
                      onClick={(e) => scrollToSection(e, sec.id)}
                      className={`relative pl-5 py-2 text-sm transition-all duration-300 ${
                        isActive
                          ? "text-black dark:text-white font-medium"
                          : "text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-300 font-normal"
                      }`}
                    >
                      {/* Indicador activo animado */}
                      {isActive && (
                        <motion.div
                          layoutId="activeCookieSection"
                          className="absolute left-[-1px] top-0 bottom-0 w-[2px] bg-black dark:bg-white"
                          initial={false}
                          transition={{
                            type: "spring",
                            stiffness: 300,
                            damping: 30,
                          }}
                        />
                      )}
                      {sec.title}
                    </a>
                  );
                })}
              </nav>
            </motion.aside>

            {/* Document Body: Tipografía y espaciado mejorados */}
            <motion.article
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                duration: 0.7,
                delay: 0.3,
                ease: [0.16, 1, 0.3, 1],
              }}
              className="flex-1 prose prose-gray dark:prose-invert prose-lg max-w-none 
 prose-headings:font-semibold prose-headings:tracking-tight prose-headings:text-black dark:prose-headings:text-white"
            >
              <h2 id="intro" className="text-2xl mt-0 mb-6 scroll-mt-32">
                {t("intro_title")}
              </h2>
              {renderText(t("intro_desc"))}

              <h2
                id="legal-frameworks"
                className="text-2xl mt-16 mb-6 scroll-mt-32"
              >
                {t("legal_title")}
              </h2>
              {renderText(t("legal_desc"))}

              <h2 id="tipos" className="text-2xl mt-16 mb-8 scroll-mt-32">
                {t("types_title")}
              </h2>

              {/* Tipos de Cookies (Estilo Arquitectónico, sin cajas) */}
              <div className="grid gap-10 my-8">
                <div className="border-t border-gray-200 dark:border-gray-800 pt-6">
                  <div className="flex items-center gap-3 mb-3">
                    <ShieldAlert
                      className="w-5 h-5 text-black dark:text-white"
                      strokeWidth={1.5}
                    />
                    <h3 className="text-lg font-semibold text-black dark:text-white m-0">
                      {t("types_essential")}
                    </h3>
                  </div>
                  <p className="text-gray-600 dark:text-gray-300 font-light text-base m-0 leading-relaxed">
                    {t("types_essential_desc")}
                  </p>
                </div>

                <div className="border-t border-gray-200 dark:border-gray-800 pt-6">
                  <div className="flex items-center gap-3 mb-3">
                    <Settings
                      className="w-5 h-5 text-black dark:text-white"
                      strokeWidth={1.5}
                    />
                    <h3 className="text-lg font-semibold text-black dark:text-white m-0">
                      {t("types_functional")}
                    </h3>
                  </div>
                  <p className="text-gray-600 dark:text-gray-300 font-light text-base m-0 leading-relaxed">
                    {t("types_functional_desc")}
                  </p>
                </div>

                <div className="border-t border-gray-200 dark:border-gray-800 pt-6">
                  <div className="flex items-center gap-3 mb-3">
                    <BarChart3
                      className="w-5 h-5 text-black dark:text-white"
                      strokeWidth={1.5}
                    />
                    <h3 className="text-lg font-semibold text-black dark:text-white m-0">
                      {t("types_analytics")}
                    </h3>
                  </div>
                  <p className="text-gray-600 dark:text-gray-300 font-light text-base m-0 leading-relaxed">
                    {t("types_analytics_desc")}
                  </p>
                </div>

                <div className="border-t border-gray-200 dark:border-gray-800 pt-6">
                  <div className="flex items-center gap-3 mb-3">
                    <Cookie
                      className="w-5 h-5 text-black dark:text-white"
                      strokeWidth={1.5}
                    />
                    <h3 className="text-lg font-semibold text-black dark:text-white m-0">
                      {t("types_marketing")}
                    </h3>
                  </div>
                  <div className="text-gray-600 dark:text-gray-300 font-light text-base m-0 leading-relaxed">
                    {renderText(t("types_marketing_desc"))}
                  </div>
                </div>
              </div>

              <h2 id="duration" className="text-2xl mt-16 mb-6 scroll-mt-32">
                {t("duration_title")}
              </h2>
              {renderText(t("duration_desc"))}

              {/* Table for Duration: Diseño Flush y Limpio */}
              <div className="overflow-x-auto my-10">
                <table className="w-full text-left border-collapse text-sm">
                  <thead>
                    <tr className="border-b-2 border-black dark:border-white">
                      <th className="py-4 pr-4 font-bold text-black dark:text-white uppercase tracking-widest text-xs">
                        {t("duration_th_cookie")}
                      </th>
                      <th className="py-4 pr-4 font-bold text-black dark:text-white uppercase tracking-widest text-xs">
                        {t("duration_th_category")}
                      </th>
                      <th className="py-4 pr-4 font-bold text-black dark:text-white uppercase tracking-widest text-xs">
                        {t("duration_th_purpose")}
                      </th>
                      <th className="py-4 font-bold text-black dark:text-white uppercase tracking-widest text-xs">
                        {t("duration_th_duration")}
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 dark:divide-gray-800">
                    <tr className="group">
                      <td className="py-4 pr-4 text-gray-600 dark:text-gray-400 group-hover:text-black dark:group-hover:text-white transition-colors">
                        {t("duration_row1_cookie")}
                      </td>
                      <td className="py-4 pr-4">
                        <span className="text-xs border border-gray-300 dark:border-gray-700 px-2 py-1 rounded-full text-gray-500">
                          {t("duration_row1_category")}
                        </span>
                      </td>
                      <td className="py-4 pr-4 text-gray-600 dark:text-gray-400 font-light">
                        {t("duration_row1_purpose")}
                      </td>
                      <td className="py-4 font-medium text-black dark:text-white">
                        {t("duration_row1_duration")}
                      </td>
                    </tr>
                    <tr className="group">
                      <td className="py-4 pr-4 text-gray-600 dark:text-gray-400 group-hover:text-black dark:group-hover:text-white transition-colors">
                        {t("duration_row2_cookie")}
                      </td>
                      <td className="py-4 pr-4">
                        <span className="text-xs border border-gray-300 dark:border-gray-700 px-2 py-1 rounded-full text-gray-500">
                          {t("duration_row2_category")}
                        </span>
                      </td>
                      <td className="py-4 pr-4 text-gray-600 dark:text-gray-400 font-light">
                        {t("duration_row2_purpose")}
                      </td>
                      <td className="py-4 font-medium text-black dark:text-white">
                        {t("duration_row2_duration")}
                      </td>
                    </tr>
                    <tr className="group">
                      <td className="py-4 pr-4 text-gray-600 dark:text-gray-400 group-hover:text-black dark:group-hover:text-white transition-colors">
                        {t("duration_row3_cookie")}
                      </td>
                      <td className="py-4 pr-4">
                        <span className="text-xs border border-gray-300 dark:border-gray-700 px-2 py-1 rounded-full text-gray-500">
                          {t("duration_row3_category")}
                        </span>
                      </td>
                      <td className="py-4 pr-4 text-gray-600 dark:text-gray-400 font-light">
                        {t("duration_row3_purpose")}
                      </td>
                      <td className="py-4 font-medium text-black dark:text-white">
                        {t("duration_row3_duration")}
                      </td>
                    </tr>
                    <tr className="group">
                      <td className="py-4 pr-4 text-gray-600 dark:text-gray-400 group-hover:text-black dark:group-hover:text-white transition-colors">
                        {t("duration_row4_cookie")}
                      </td>
                      <td className="py-4 pr-4">
                        <span className="text-xs border border-gray-300 dark:border-gray-700 px-2 py-1 rounded-full text-gray-500">
                          {t("duration_row4_category")}
                        </span>
                      </td>
                      <td className="py-4 pr-4 text-gray-600 dark:text-gray-400 font-light">
                        {t("duration_row4_purpose")}
                      </td>
                      <td className="py-4 font-medium text-black dark:text-white">
                        {t("duration_row4_duration")}
                      </td>
                    </tr>
                    <tr className="group">
                      <td className="py-4 pr-4 text-gray-600 dark:text-gray-400 font-mono text-xs group-hover:text-black dark:group-hover:text-white transition-colors">
                        {t("duration_row5_cookie")}
                      </td>
                      <td className="py-4 pr-4">
                        <span className="text-xs border border-gray-300 dark:border-gray-700 px-2 py-1 rounded-full text-gray-500">
                          {t("duration_row5_category")}
                        </span>
                      </td>
                      <td className="py-4 pr-4 text-gray-600 dark:text-gray-400 font-light">
                        {t("duration_row5_purpose")}
                      </td>
                      <td className="py-4 font-medium text-black dark:text-white">
                        {t("duration_row5_duration")}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <h2
                id="sensitive-data"
                className="text-2xl mt-16 mb-6 scroll-mt-32"
              >
                {t("sensitive_title")}
              </h2>
              {renderText(t("sensitive_desc"))}

              <h2 id="rights" className="text-2xl mt-16 mb-6 scroll-mt-32">
                {t("rights_title")}
              </h2>
              {renderText(t("rights_desc"))}

              <h2
                id="consentimiento"
                className="text-2xl mt-16 mb-6 scroll-mt-32"
              >
                {t("consent_title")}
              </h2>
              {renderText(t("consent_desc"))}

              {/* Action Button */}
              <div className="my-8">
                <Button
                  onClick={handleManagePreferences}
                  className="bg-black hover:bg-black/90 dark:bg-white dark:text-black dark:hover:bg-gray-100 text-white rounded-none h-12 px-8 text-xs font-bold uppercase tracking-widest transition-all"
                >
                  {t("manage_btn")}
                </Button>
              </div>

              <h2 id="terceros" className="text-2xl mt-16 mb-6 scroll-mt-32">
                {t("thirdparty_title")}
              </h2>
              {renderText(t("thirdparty_desc"))}

              <h2 id="children" className="text-2xl mt-16 mb-6 scroll-mt-32">
                {t("children_title")}
              </h2>
              {renderText(t("children_desc"))}

              <h2 id="changes" className="text-2xl mt-16 mb-6 scroll-mt-32">
                {t("changes_title")}
              </h2>
              {renderText(t("changes_desc"))}

              <h2 id="contacto" className="text-2xl mt-16 mb-6 scroll-mt-32">
                {t("contact_title")}
              </h2>
              {renderText(t("contact_desc"))}

              {/* Footer Section */}
              <div className="mt-24 pt-8 border-t border-gray-200 dark:border-gray-800">
                <a
                  href={`mailto:${t("contact_link")}`}
                  className="inline-flex items-center gap-2 text-black dark:text-white font-medium border-b border-black/20 dark:border-white/20 hover:border-black dark:hover:border-white transition-colors no-underline pb-1"
                >
                  <Mail className="w-4 h-4" />
                  {t("contact_link")} <ArrowRight className="w-3 h-3 ml-1" />
                </a>
              </div>
            </motion.article>
          </div>
        </div>
      </section>
    </div>
  );
}
