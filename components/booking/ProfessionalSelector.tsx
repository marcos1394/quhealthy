import React from 'react';
import { motion } from 'framer-motion';
import { UserCircle, CheckCircle2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { StorefrontStaff } from '@/types/storefront';

interface ProfessionalSelectorProps {
  staff: StorefrontStaff[];
  selectedStaffId: number | null;
  onSelect: (staffId: number | null) => void;
  safeColor: string;
  stepCounter: number;
  title: string;
  subtitle: string;
  noPreferenceText: string;
}

export function ProfessionalSelector({
  staff,
  selectedStaffId,
  onSelect,
  safeColor,
  stepCounter,
  title,
  subtitle,
  noPreferenceText
}: ProfessionalSelectorProps) {
  return (
    <motion.section
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: "auto" }}
      exit={{ opacity: 0, height: 0 }}
      className="overflow-hidden space-y-6"
    >
      <div className="flex items-center gap-4 border-b border-gray-100 dark:border-gray-800 pb-4">
        <div
          className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0 font-bold text-xs shadow-sm"
          style={{ backgroundColor: safeColor, color: "#ffffff" }}
        >
          {stepCounter}
        </div>
        <div>
          <h2 className="text-lg font-bold tracking-tight text-gray-900 dark:text-white">
            {title}
          </h2>
          <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mt-0.5">
            {subtitle}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* Opción: Sin preferencia (Asignado al dueño) */}
        <button
          className={cn(
            "p-5 rounded-2xl border flex items-center gap-4 transition-all duration-300 text-left shadow-sm",
            selectedStaffId === null
              ? "bg-store-50/50 dark:bg-store-950/20 text-gray-900 dark:text-white ring-2"
              : "border-gray-100 dark:border-gray-800 bg-white dark:bg-[#0a0a0a] text-gray-500 hover:border-gray-200 dark:hover:border-gray-700"
          )}
          style={{ 
            borderColor: selectedStaffId === null ? safeColor : undefined,
            boxShadow: selectedStaffId === null ? `0 0 0 2px ${safeColor}33` : undefined 
          }}
          onClick={() => onSelect(null)}
        >
          <div
            className={cn(
              "w-12 h-12 rounded-full flex items-center justify-center shrink-0 transition-colors border",
              selectedStaffId === null
                ? "text-white"
                : "bg-gray-100 dark:bg-gray-800 text-gray-400 border-gray-200 dark:border-gray-700"
            )}
            style={{ backgroundColor: selectedStaffId === null ? safeColor : undefined }}
          >
            {selectedStaffId === null ? (
              <CheckCircle2 className="w-6 h-6" strokeWidth={2} />
            ) : (
              <UserCircle className="w-6 h-6" strokeWidth={2} />
            )}
          </div>
          <div>
            <h4 className="font-bold text-sm text-gray-900 dark:text-white">
              {noPreferenceText}
            </h4>
          </div>
        </button>

        {/* Lista de Profesionales */}
        {staff.map((member) => (
          <button
            key={member.id}
            className={cn(
              "p-5 rounded-2xl border flex items-center gap-4 transition-all duration-300 text-left shadow-sm",
              selectedStaffId === member.providerId
                ? "bg-store-50/50 dark:bg-store-950/20 text-gray-900 dark:text-white ring-2"
                : "border-gray-100 dark:border-gray-800 bg-white dark:bg-[#0a0a0a] text-gray-500 hover:border-gray-200 dark:hover:border-gray-700"
            )}
            style={{ 
              borderColor: selectedStaffId === member.providerId ? safeColor : undefined,
              boxShadow: selectedStaffId === member.providerId ? `0 0 0 2px ${safeColor}33` : undefined 
            }}
            onClick={() => onSelect(member.providerId)}
          >
            <div
              className={cn(
                "w-12 h-12 rounded-full flex items-center justify-center shrink-0 transition-colors border overflow-hidden",
                selectedStaffId === member.providerId
                  ? ""
                  : "bg-gray-100 dark:bg-gray-800 text-gray-400 border-gray-200 dark:border-gray-700"
              )}
              style={{ backgroundColor: selectedStaffId === member.providerId ? safeColor : undefined }}
            >
              {member.imageUrl ? (
                <img src={member.imageUrl} alt={member.name} className="w-full h-full object-cover" />
              ) : selectedStaffId === member.providerId ? (
                <CheckCircle2 className="w-6 h-6 text-white" strokeWidth={2} />
              ) : (
                <span className="text-xs font-bold">{member.name.charAt(0).toUpperCase()}</span>
              )}
            </div>
            <div>
              <h4 className="font-bold text-sm text-gray-900 dark:text-white">
                {member.name}
              </h4>
              {member.specialty && (
                <p className="text-[11px] font-medium text-gray-500 dark:text-gray-400 mt-0.5">
                  {member.specialty}
                </p>
              )}
            </div>
          </button>
        ))}
      </div>
    </motion.section>
  );
}
