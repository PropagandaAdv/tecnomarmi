import type { Metadata, Viewport } from "next";
import { Josefin_Sans } from "next/font/google";
import "./globals.css";

const josefin = Josefin_Sans({
  subsets: ["latin"],
  weight: ["300", "400", "600", "700"],
  variable: "--font-josefin",
  display: "swap",
  preload: true,
});

export const metadata: Metadata = {
  title: "Tecnomarmi | Lavorazione di marmo, pietra e granito su progetto",
  description:
    "Marmo, pietra, granito, quarzo e solid surface lavorati su disegno per studi di architettura e aziende d'arredo. Altivole, Treviso. Nessun limite all'immaginazione.",
  openGraph: {
    title: "Tecnomarmi | Nessun limite all'immaginazione",
    description:
      "Dal blocco al pezzo finito: lavorazione di marmo, pietra e granito su progetto. Altivole, Treviso.",
    type: "website",
    locale: "it_IT",
    // DEPLOY STEP: sostituire con l'URL di produzione assoluto
    images: [{ url: "/media/hero-ending.jpg", width: 1920, height: 1080 }],
  },
  icons: {
    icon: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 32 32'%3E%3Crect width='32' height='32' fill='%23101214'/%3E%3Cpath d='M6 8h20v3H17v13h-3V11H6z' fill='%23eaebeb'/%3E%3C/svg%3E",
  },
};

export const viewport: Viewport = {
  themeColor: "#101214",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="it" className={josefin.variable}>
      <head>
        <link
          rel="preload"
          as="image"
          href="/media/hero-poster.jpg"
          media="(min-width: 1025px) and (orientation: landscape)"
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
