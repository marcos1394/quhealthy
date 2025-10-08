// ============================================
// 📁 lib/constants/colors.ts
// ============================================
export const COLORS = {
  primary: {
    blue: {
      50: '#EFF6FF',
      100: '#DBEAFE',
      500: '#3B82F6',
      600: '#2563EB',
      700: '#1D4ED8',
      900: '#1E3A8A',
    },
    emerald: {
      50: '#ECFDF5',
      100: '#D1FAE5',
      400: '#34D399',
      500: '#10B981',
      600: '#059669',
      700: '#047857',
    },
    teal: {
      400: '#2DD4BF',
      500: '#14B8A6',
      600: '#0D9488',
    }
  },
  neutral: {
    slate: {
      50: '#F8FAFC',
      100: '#F1F5F9',
      200: '#E2E8F0',
      600: '#475569',
      700: '#334155',
      800: '#1E293B',
      900: '#0F172A',
    }
  },
  semantic: {
    success: '#10B981',
    warning: '#F59E0B',
    error: '#EF4444',
    info: '#3B82F6',
  }
} as const;

export const GRADIENTS = {
  primary: 'from-blue-600 via-emerald-500 to-teal-500',
  hero: 'from-slate-900 via-blue-900 to-slate-900',
  card: 'from-blue-500 to-emerald-500',
  accent: 'from-violet-500 to-purple-500',
} as const;