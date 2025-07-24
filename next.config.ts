import type { NextConfig } from "next";

const nextConfig: NextConfig = {
   eslint: {
    // Warning: Esto evitará que el build falle por errores de ESLint.
    // Úsalo solo si estás seguro de que quieres desplegar a pesar de los warnings.
    ignoreDuringBuilds: true,
  },
};

export default nextConfig;
