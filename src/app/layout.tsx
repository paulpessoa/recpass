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

// VLibras e service worker entram fora da árvore do React: o widget mexe no DOM por conta própria.
const BOOT = `
(function () {
  if ("serviceWorker" in navigator) {
    var reg = function () { navigator.serviceWorker.register("/sw.js").catch(function () {}); };
    if (document.readyState === "complete") reg(); else window.addEventListener("load", reg);
  }
  function vlibras() {
    if (!window.VLibras) return setTimeout(vlibras, 500);
    if (document.querySelector("[vw]")) return;
    var root = document.createElement("div");
    root.setAttribute("vw", ""); root.className = "enabled";
    root.innerHTML = '<div vw-access-button class="active"></div><div vw-plugin-wrapper><div class="vw-plugin-top-wrapper"></div></div>';
    document.body.appendChild(root);
    new window.VLibras.Widget("https://vlibras.gov.br/app");
  }
  vlibras();
})();
`;

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="pt-BR" className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col">
        {children}
        <Script src="https://vlibras.gov.br/app/vlibras-plugin.js" strategy="afterInteractive" />
        <Script id="boot" strategy="afterInteractive">
          {BOOT}
        </Script>
      </body>
    </html>
  );
}
