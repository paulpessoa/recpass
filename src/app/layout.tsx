import type { Metadata, Viewport } from "next";
import { Geist_Mono, Inter } from "next/font/google";
import Script from "next/script";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "RecPass — REC'n'Play",
  description: "Check-in de contexto via NFC + agente de mobilidade e acessibilidade para o Bairro do Recife.",
  applicationName: "RecPass",
  appleWebApp: { capable: true, title: "RecPass", statusBarStyle: "black-translucent" },
  icons: { icon: "/icons/icon-192.png", apple: "/icons/apple-touch-icon.png" },
};

export const viewport: Viewport = {
  themeColor: "#121212",
};

// Registro do service worker (PWA), fora da árvore do React.
const BOOT = `
(function () {
  if ("serviceWorker" in navigator) {
    var reg = function () { navigator.serviceWorker.register("/sw.js").catch(function () {}); };
    if (document.readyState === "complete") reg(); else window.addEventListener("load", reg);
  }
})();
`;

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="pt-BR" className={`${inter.variable} ${geistMono.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col">
        {children}
        <Script id="boot" strategy="afterInteractive">
          {BOOT}
        </Script>
      </body>
    </html>
  );
}
