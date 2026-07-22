"use client";

import React, { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import { useParams, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { ArrowLeft, Baby } from 'lucide-react';
import { ParentGrowthContainer } from '@/components/growth/ParentGrowthContainer';
import { useFamily } from '@/hooks/useFamily';
import { QhSpinner } from '@/components/ui/QhSpinner';

export default function DependentGrowthPage() {
  const t = useTranslations('PatientFamilyDashboard');
  const params = useParams();
  const router = useRouter();
  const memberId = Number(params.id);

  const { family, isLoading } = useFamily();
  const [activeDependent, setActiveDependent] = useState<any>(null);

  useEffect(() => {
    if (!isLoading && family) {
      const dep = family.find(f => f.id === memberId);
      if (dep) {
        setActiveDependent(dep);
      } else {
        router.push('/patient/dashboard/family');
      }
    }
  }, [isLoading, family, memberId, router]);

  if (isLoading || !activeDependent) {
    return (
      <div className="flex flex-col justify-center items-center min-h-[60vh] bg-white dark:bg-[#0a0a0a]">
        <QhSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white dark:bg-[#0a0a0a] font-sans text-black dark:text-white selection:bg-gray-200 dark:selection:bg-white/20 transition-colors duration-300">
      <div className="max-w-4xl mx-auto px-6 py-12 md:py-16 space-y-12">
        <motion.div initial={{ opacity: 0, y: -16 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => router.back()}
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 text-gray-500 hover:text-gray-900 dark:hover:text-white transition-all shadow-sm"
            >
              <ArrowLeft className="h-4 w-4" strokeWidth={2} />
            </button>
            <div className="flex flex-col">
              <span className="text-xs font-bold text-gray-500 mb-1">
                {activeDependent.firstName} {activeDependent.lastName}
              </span>
              <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white flex items-center gap-3">
                <div className="h-8 w-8 rounded-xl bg-quhealthy-green/10 text-quhealthy-green flex items-center justify-center">
                  <Baby className="h-5 w-5" strokeWidth={2} />
                </div>
                Crecimiento Pediátrico
              </h1>
            </div>
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <ParentGrowthContainer 
            dependentId={memberId} 
            sex={activeDependent.gender === 'FEMALE' ? 'FEMALE' : 'MALE'} 
          />
        </motion.div>
      </div>
    </div>
  );
}
