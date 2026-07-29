import React from "react";
import { getTranslations } from "next-intl/server";
import { PrescriptionSettings } from "@/components/provider/PrescriptionSettings";

export async function generateMetadata() {
  const t = await getTranslations("PrescriptionSettings");
  return {
    title: t("meta_title"),
    description: t("meta_description"),
  };
}

export default function PrescriptionSettingsPage() {
  return (
    <div className="w-full min-h-screen bg-gray-50/50 dark:bg-[#050505] font-sans text-gray-900 dark:text-white selection:bg-emerald-100 dark:selection:bg-emerald-950/30 transition-colors duration-500 pt-8 px-6 md:px-10 pb-24">
      <div className="max-w-7xl mx-auto space-y-8">
        <PrescriptionSettings />
      </div>
    </div>
  );
}