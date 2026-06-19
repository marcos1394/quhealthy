"use client";
import React from "react";
import { motion } from "framer-motion";
import { ChevronRight, Cookie, ShieldAlert, BarChart3, Clock, Settings, UserCheck, ShieldCheck, Globe, Users, History, Mail } from "lucide-react";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";

const parseBoldAndItalic = (text: string) => {
  const parts = text.split(/(\*\*.*?\*\*)/g);
  return parts.map((part, i) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return <strong key={`b-${i}`} className="text-slate-900 dark:text-white font-semibold">{part.slice(2, -2)}</strong>;
    }
    const italicParts = part.split(/(\*[^*]+\*)/g);
    return italicParts.map((ip, j) => {
      if (ip.startsWith('*') && ip.endsWith('*')) {
         return <em key={`i-${j}`} className="text-slate-500 dark:text-slate-400 italic">{ip.slice(1, -1)}</em>;
      }
      return ip;
    });
  });
};

const renderText = (text: string) => {
  return text.split('\n\n').map((block, idx) => {
    if (block.includes('\n- ')) {
      const parts = block.split('\n- ');
      const intro = parts[0];
      const items = parts.slice(1);
      return (
        <div key={idx} className="mb-6">
          {intro && <p className="mb-3">{parseBoldAndItalic(intro)}</p>}
          <ul className="list-disc pl-6 space-y-2 marker:text-slate-400">
            {items.map((item, i) => (
              <li key={i}>{parseBoldAndItalic(item)}</li>
            ))}
          </ul>
        </div>
      );
    }
    return <p key={idx} className="mb-6">{parseBoldAndItalic(block)}</p>;
  });
};

export default function CookiesPage() {
  const t = useTranslations("PublicCookies");

  const sections = [
    { id: "intro", title: t('intro_title'), icon: Cookie },
    { id: "legal-frameworks", title: t('legal_title'), icon: ShieldCheck },
    { id: "tipos", title: t('types_title'), icon: Settings },
    { id: "duration", title: t('duration_title'), icon: Clock },
    { id: "sensitive-data", title: t('sensitive_title'), icon: ShieldAlert },
    { id: "rights", title: t('rights_title'), icon: UserCheck },
    { id: "consentimiento", title: t('consent_title'), icon: Settings },
    { id: "terceros", title: t('thirdparty_title'), icon: Globe },
    { id: "children", title: t('children_title'), icon: Users },
    { id: "changes", title: t('changes_title'), icon: History },
    { id: "contacto", title: t('contact_title'), icon: Mail },
  ];

  const handleManagePreferences = () => {
    if (typeof window !== "undefined") {
      localStorage.removeItem("quhealthy_cookie_consent");
      window.location.reload();
    }
  };

  return (
    <div className="min-h-screen bg-white dark:bg-slate-950 font-sans selection:bg-slate-200 dark:selection:bg-slate-800">
      
      {/* Hero Section */}
      <section className="pt-32 pb-16 md:pt-40 md:pb-24 border-b border-slate-200 dark:border-slate-800">
        <div className="container mx-auto px-6 md:px-12 max-w-5xl">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="max-w-3xl"
          >
            <div className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400 font-semibold uppercase tracking-widest mb-6">
              <Link href="/" className="hover:text-slate-900 dark:hover:text-white transition-colors">QuHealthy</Link>
              <ChevronRight className="w-4 h-4" />
              <span className="text-slate-900 dark:text-white">{t('breadcrumb')}</span>
            </div>
            <h1 className="text-4xl md:text-6xl font-semibold tracking-tight text-slate-900 dark:text-white mb-6">
              {t('title')}
            </h1>
            <p className="text-xl md:text-2xl text-slate-500 dark:text-slate-400 font-light max-w-3xl leading-relaxed mb-6">
              {t('subtitle')}
            </p>
            <p className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest bg-slate-100 dark:bg-slate-900 inline-block px-3 py-1 rounded-full">
              {t('date')}
            </p>
          </motion.div>
        </div>
      </section>

      {/* Content Section */}
      <section className="py-20 md:py-32">
        <div className="container mx-auto px-6 md:px-12 max-w-6xl">
          <div className="flex flex-col md:flex-row gap-16 lg:gap-24">
            
            {/* Sidebar / Table of Contents */}
            <motion.aside 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="w-full md:w-72 shrink-0 md:sticky md:top-32 h-fit hidden lg:block"
            >
              <h3 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-widest mb-6">{t('toc')}</h3>
              <ul className="space-y-3 border-l border-slate-200 dark:border-slate-800 relative">
                {sections.map((sec) => (
                  <li key={sec.id}>
                    <a 
                      href={`#${sec.id}`}
                      className="group flex items-center pl-4 py-1 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:border-l-2 hover:-ml-[1px] hover:border-slate-900 dark:hover:border-white transition-all font-medium text-sm"
                    >
                      {sec.title}
                    </a>
                  </li>
                ))}
              </ul>
            </motion.aside>

            {/* Main Content */}
            <motion.article 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="prose prose-slate dark:prose-invert prose-lg max-w-none text-slate-600 dark:text-slate-400 font-light leading-relaxed w-full"
            >
              <h2 id="intro" className="text-2xl font-semibold text-slate-900 dark:text-white mt-0 mb-6">{t('intro_title')}</h2>
              {renderText(t('intro_desc'))}

              <div className="w-full h-px bg-slate-100 dark:bg-slate-800/50 my-12" />

              <h2 id="legal-frameworks" className="text-2xl font-semibold text-slate-900 dark:text-white mt-12 mb-6">{t('legal_title')}</h2>
              {renderText(t('legal_desc'))}

              <div className="w-full h-px bg-slate-100 dark:bg-slate-800/50 my-12" />

              <h2 id="tipos" className="text-2xl font-semibold text-slate-900 dark:text-white mt-12 mb-6">{t('types_title')}</h2>
              
              <div className="space-y-8 my-8">
                <div className="flex gap-4 p-6 rounded-2xl bg-slate-50 dark:bg-slate-900/50 border border-slate-100 dark:border-slate-800/50">
                  <div className="mt-1">
                    <ShieldAlert className="w-6 h-6 text-slate-800 dark:text-slate-200" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-slate-900 dark:text-white m-0">{t('types_essential')}</h3>
                    <p className="text-slate-500 dark:text-slate-400 text-base mt-2 m-0 leading-relaxed">{t('types_essential_desc')}</p>
                  </div>
                </div>
                
                <div className="flex gap-4 p-6 rounded-2xl bg-slate-50 dark:bg-slate-900/50 border border-slate-100 dark:border-slate-800/50">
                  <div className="mt-1">
                    <Settings className="w-6 h-6 text-slate-800 dark:text-slate-200" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-slate-900 dark:text-white m-0">{t('types_functional')}</h3>
                    <p className="text-slate-500 dark:text-slate-400 text-base mt-2 m-0 leading-relaxed">{t('types_functional_desc')}</p>
                  </div>
                </div>

                <div className="flex gap-4 p-6 rounded-2xl bg-slate-50 dark:bg-slate-900/50 border border-slate-100 dark:border-slate-800/50">
                  <div className="mt-1">
                    <BarChart3 className="w-6 h-6 text-slate-800 dark:text-slate-200" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-slate-900 dark:text-white m-0">{t('types_analytics')}</h3>
                    <p className="text-slate-500 dark:text-slate-400 text-base mt-2 m-0 leading-relaxed">{t('types_analytics_desc')}</p>
                  </div>
                </div>

                <div className="flex gap-4 p-6 rounded-2xl bg-slate-50 dark:bg-slate-900/50 border border-slate-100 dark:border-slate-800/50">
                  <div className="mt-1">
                    <Cookie className="w-6 h-6 text-slate-800 dark:text-slate-200" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-slate-900 dark:text-white m-0">{t('types_marketing')}</h3>
                    <div className="text-slate-500 dark:text-slate-400 text-base mt-2 m-0 leading-relaxed">
                      {renderText(t('types_marketing_desc'))}
                    </div>
                  </div>
                </div>
              </div>

              <div className="w-full h-px bg-slate-100 dark:bg-slate-800/50 my-12" />

              <h2 id="duration" className="text-2xl font-semibold text-slate-900 dark:text-white mt-12 mb-6">{t('duration_title')}</h2>
              {renderText(t('duration_desc'))}

              {/* Table for Duration */}
              <div className="overflow-x-auto my-8 border border-slate-200 dark:border-slate-800 rounded-xl">
                <table className="w-full text-left border-collapse text-sm">
                  <thead className="bg-slate-50 dark:bg-slate-900/80">
                    <tr>
                      <th className="p-4 font-semibold text-slate-900 dark:text-white border-b border-slate-200 dark:border-slate-800">{t('duration_th_cookie')}</th>
                      <th className="p-4 font-semibold text-slate-900 dark:text-white border-b border-slate-200 dark:border-slate-800">{t('duration_th_category')}</th>
                      <th className="p-4 font-semibold text-slate-900 dark:text-white border-b border-slate-200 dark:border-slate-800">{t('duration_th_purpose')}</th>
                      <th className="p-4 font-semibold text-slate-900 dark:text-white border-b border-slate-200 dark:border-slate-800">{t('duration_th_duration')}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                    <tr className="hover:bg-slate-50/50 dark:hover:bg-slate-800/20 transition-colors">
                      <td className="p-4 text-slate-600 dark:text-slate-400">{t('duration_row1_cookie')}</td>
                      <td className="p-4"><span className="px-2 py-1 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded text-xs font-medium">{t('duration_row1_category')}</span></td>
                      <td className="p-4 text-slate-600 dark:text-slate-400">{t('duration_row1_purpose')}</td>
                      <td className="p-4 font-medium text-slate-900 dark:text-white">{t('duration_row1_duration')}</td>
                    </tr>
                    <tr className="hover:bg-slate-50/50 dark:hover:bg-slate-800/20 transition-colors">
                      <td className="p-4 text-slate-600 dark:text-slate-400">{t('duration_row2_cookie')}</td>
                      <td className="p-4"><span className="px-2 py-1 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded text-xs font-medium">{t('duration_row2_category')}</span></td>
                      <td className="p-4 text-slate-600 dark:text-slate-400">{t('duration_row2_purpose')}</td>
                      <td className="p-4 font-medium text-slate-900 dark:text-white">{t('duration_row2_duration')}</td>
                    </tr>
                    <tr className="hover:bg-slate-50/50 dark:hover:bg-slate-800/20 transition-colors">
                      <td className="p-4 text-slate-600 dark:text-slate-400">{t('duration_row3_cookie')}</td>
                      <td className="p-4"><span className="px-2 py-1 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded text-xs font-medium">{t('duration_row3_category')}</span></td>
                      <td className="p-4 text-slate-600 dark:text-slate-400">{t('duration_row3_purpose')}</td>
                      <td className="p-4 font-medium text-slate-900 dark:text-white">{t('duration_row3_duration')}</td>
                    </tr>
                    <tr className="hover:bg-slate-50/50 dark:hover:bg-slate-800/20 transition-colors">
                      <td className="p-4 text-slate-600 dark:text-slate-400">{t('duration_row4_cookie')}</td>
                      <td className="p-4"><span className="px-2 py-1 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded text-xs font-medium">{t('duration_row4_category')}</span></td>
                      <td className="p-4 text-slate-600 dark:text-slate-400">{t('duration_row4_purpose')}</td>
                      <td className="p-4 font-medium text-slate-900 dark:text-white">{t('duration_row4_duration')}</td>
                    </tr>
                    <tr className="hover:bg-slate-50/50 dark:hover:bg-slate-800/20 transition-colors">
                      <td className="p-4 text-slate-600 dark:text-slate-400 font-mono text-xs">{t('duration_row5_cookie')}</td>
                      <td className="p-4"><span className="px-2 py-1 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded text-xs font-medium">{t('duration_row5_category')}</span></td>
                      <td className="p-4 text-slate-600 dark:text-slate-400">{t('duration_row5_purpose')}</td>
                      <td className="p-4 font-medium text-slate-900 dark:text-white">{t('duration_row5_duration')}</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <div className="w-full h-px bg-slate-100 dark:bg-slate-800/50 my-12" />

              <h2 id="sensitive-data" className="text-2xl font-semibold text-slate-900 dark:text-white mt-12 mb-6">{t('sensitive_title')}</h2>
              {renderText(t('sensitive_desc'))}

              <div className="w-full h-px bg-slate-100 dark:bg-slate-800/50 my-12" />

              <h2 id="rights" className="text-2xl font-semibold text-slate-900 dark:text-white mt-12 mb-6">{t('rights_title')}</h2>
              {renderText(t('rights_desc'))}

              <div className="w-full h-px bg-slate-100 dark:bg-slate-800/50 my-12" />

              <h2 id="consentimiento" className="text-2xl font-semibold text-slate-900 dark:text-white mt-12 mb-6">{t('consent_title')}</h2>
              {renderText(t('consent_desc'))}

              <div className="my-8 p-8 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl flex flex-col items-start gap-4 shadow-inner">
                <Button 
                  onClick={handleManagePreferences}
                  className="bg-slate-900 dark:bg-white text-white dark:text-slate-900 hover:bg-slate-800 dark:hover:bg-slate-100 rounded-xl px-6"
                >
                  {t('manage_btn')}
                </Button>
              </div>

              <div className="w-full h-px bg-slate-100 dark:bg-slate-800/50 my-12" />

              <h2 id="terceros" className="text-2xl font-semibold text-slate-900 dark:text-white mt-12 mb-6">{t('thirdparty_title')}</h2>
              {renderText(t('thirdparty_desc'))}

              <div className="w-full h-px bg-slate-100 dark:bg-slate-800/50 my-12" />

              <h2 id="children" className="text-2xl font-semibold text-slate-900 dark:text-white mt-12 mb-6">{t('children_title')}</h2>
              {renderText(t('children_desc'))}

              <div className="w-full h-px bg-slate-100 dark:bg-slate-800/50 my-12" />

              <h2 id="changes" className="text-2xl font-semibold text-slate-900 dark:text-white mt-12 mb-6">{t('changes_title')}</h2>
              {renderText(t('changes_desc'))}

              <div className="w-full h-px bg-slate-100 dark:bg-slate-800/50 my-12" />

              <h2 id="contacto" className="text-2xl font-semibold text-slate-900 dark:text-white mt-12 mb-6">{t('contact_title')}</h2>
              {renderText(t('contact_desc'))}
              
              <div className="mt-8 mb-16">
                <a href={`mailto:${t('contact_link')}`} className="inline-flex items-center gap-2 text-slate-900 dark:text-white font-medium hover:underline bg-slate-100 dark:bg-slate-800 px-4 py-2 rounded-lg">
                  <Mail className="w-4 h-4" />
                  {t('contact_link')}
                </a>
              </div>
            </motion.article>

          </div>
        </div>
      </section>

    </div>
  );
}
