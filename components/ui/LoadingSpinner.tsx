// ============================================
// 📁 components/ui/LoadingSpinner.tsx
// ============================================
export const LoadingSpinner = () => (
  <div className="flex items-center justify-center min-h-[400px]">
    <div className="relative w-16 h-16">
      <div className="absolute inset-0 border-4 border-blue-200 rounded-full animate-pulse" />
      <div className="absolute inset-0 border-4 border-emerald-500 rounded-full border-t-transparent animate-spin" />
    </div>
  </div>
);