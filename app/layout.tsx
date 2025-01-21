import CustomProvider from "@/components/ui/provider";
import "./globals.css";


export const metadata = {
  title: "QuHealthy - Bienestar Digital",
  description: "Gestiona tu salud de manera eficiente y moderna.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" suppressHydrationWarning>
      <body>
        <CustomProvider>
          {/* Header */}
          <header
            style={{
              backgroundColor: "#0B1727", // Oscuro con tonos azulados
              color: "white",
              padding: "1rem",
            }}
          >
            <div
              style={{
                maxWidth: "1200px",
                margin: "0 auto",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
              }}
            >
              <h1 style={{ fontSize: "1.5rem", fontWeight: "bold", color: "#7FFF00" }}>
                QuHealthy
              </h1>
              <nav>
                <a
                  href="#features"
                  style={{
                    margin: "0 1rem",
                    color: "#7FFF00", // Verde neón
                    textDecoration: "none",
                  }}
                >
                  Características
                </a>
                <a
                  href="#about"
                  style={{
                    margin: "0 1rem",
                    color: "#7FFF00",
                    textDecoration: "none",
                  }}
                >
                  Acerca de
                </a>
                <a
                  href="#contact"
                  style={{
                    margin: "0 1rem",
                    color: "#7FFF00",
                    textDecoration: "none",
                  }}
                >
                  Contacto
                </a>
              </nav>
            </div>
          </header>

          {/* Main Content */}
          <main
            style={{
              minHeight: "80vh",
              padding: "2rem",
              backgroundColor: "black", // Fondo oscuro
              color: "white", // Texto claro para contraste
            }}
          >
            {children}
          </main>

          {/* Footer */}
          <footer
            style={{
              backgroundColor: "#0B1727",
              color: "#7FFF00", // Verde neón
              padding: "1rem",
              textAlign: "center",
            }}
          >
            <p>© {new Date().getFullYear()} QuHealthy. Todos los derechos reservados.</p>
          </footer>
        </CustomProvider>
      </body>
    </html>
  );
}
