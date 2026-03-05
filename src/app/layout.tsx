import type { Metadata, Viewport } from "next";
import { ThemeProvider } from "@/components/ThemeProvider";
import "./globals.css";

export const metadata: Metadata = {
  title: { default: "SGO", template: "%s | SGO" },
  description: "Sistema de Gestão Operacional",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "SGO",
  },
};

export const viewport: Viewport = {
  themeColor: "#4f6ef7", // ← atualizado para o novo accent
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <head>
        {/* Aplica tema antes da hidratação — evita flash */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              try {
                const theme = localStorage.getItem('sgo-theme');
                const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
                const applied = theme ?? (prefersDark ? 'dark' : 'light');
                document.documentElement.classList.add(applied);
              } catch(e) {}
            `,
          }}
        />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
      </head>
      <body suppressHydrationWarning>
        <ThemeProvider>{children}</ThemeProvider>
      </body>
    </html>
  );
}
