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
  title: "Rota Livre — REC'n'Play",
  description: "Check-in de contexto via NFC + agente de mobilidade e acessibilidade para o Bairro do Recife.",
};

export const viewport: Viewport = {
  themeColor: "#123b8c",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="pt-BR" className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col">
        {children}
        {/* VLibras: tradutor oficial do governo para Libras */}
        <div {...{ vw: "" }} className="enabled">
          <div {...{ "vw-access-button": "" }} className="active" />
          <div {...{ "vw-plugin-wrapper": "" }}>
            <div className="vw-plugin-top-wrapper" />
          </div>
        </div>
        <Script src="https://vlibras.gov.br/app/vlibras-plugin.js" strategy="afterInteractive" />
        <Script id="vlibras-init" strategy="afterInteractive">
          {`(function init(){ if (window.VLibras) { new window.VLibras.Widget('https://vlibras.gov.br/app'); } else { setTimeout(init, 500); } })();`}
        </Script>
      </body>
    </html>
  );
}
