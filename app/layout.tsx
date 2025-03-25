import CustomProvider from "@/components/ui/provider";
import "./globals.css";
import Navbar from "@/components/Navbar"; // Asegúrate de que la ruta sea correcta
import Footer from "@/components/Footer"; // Asegúrate de que la ruta sea correcta

export const metadata = {
  title: "QuHealthy - Bienestar Digital",
  description: "Gestiona tu salud de manera eficiente y moderna.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" suppressHydrationWarning>
      <body className="bg-gray-900 text-white">
        <CustomProvider>
          {/* Navbar */}
          <Navbar />

          {/* Main Content */}
          <main className="min-h-screen" style={{ padding: "2rem" }}>
            {children}
          </main>

          {/* Footer */}
          <Footer />
        </CustomProvider>
      </body>
    </html>
  );
}