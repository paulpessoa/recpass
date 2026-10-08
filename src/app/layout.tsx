import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Script from "next/script";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
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
  themeColor: "#123b8c",
};

// Registro do service worker (PWA), fora da árvore do React.
const BOOT = `
(function () {
  if (!("serviceWorker" in navigator)) return;
  // No dev local os chunks não mudam de nome entre edições: o cache do SW serviria código velho.
  if (/^(localhost|127\\.0\\.0\\.1|\\[::1\\])$/.test(location.hostname)) {
    navigator.serviceWorker.getRegistrations().then(function (rs) { rs.forEach(function (r) { r.unregister(); }); });
    if (window.caches) caches.keys().then(function (ks) { ks.forEach(function (k) { caches.delete(k); }); });
    return;
  }
  var reg = function () { navigator.serviceWorker.register("/sw.js").catch(function () {}); };
  if (document.readyState === "complete") reg(); else window.addEventListener("load", reg);
})();
`;

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="pt-BR" className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col">
        {children}
        <Script id="boot" strategy="afterInteractive">
          {BOOT}
        </Script>
      </body>
    </html>
  );
}
