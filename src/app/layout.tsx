import type { Metadata, Viewport } from "next";
import { Playfair_Display, Lato, Archivo_Black, League_Spartan, Cormorant_Garamond, Space_Grotesk } from "next/font/google";
import "./globals.css";
import { SITE_URL } from "@/lib/site";

const playfairDisplay = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
});

const lato = Lato({
  variable: "--font-lato",
  subsets: ["latin"],
  weight: ["400", "700"],
});

const archivoBlack = Archivo_Black({
  variable: "--font-archivo-black",
  subsets: ["latin"],
  weight: "400",
});

const leagueSpartan = League_Spartan({
  variable: "--font-league-spartan",
  subsets: ["latin"],
  weight: ["400", "700", "900"],
});

const cormorantGaramond = Cormorant_Garamond({
  variable: "--font-cormorant-garamond",
  subsets: ["latin"],
  weight: ["400", "700"],
});

const spaceGrotesk = Space_Grotesk({
  variable: "--font-space-grotesk",
  subsets: ["latin"],
  weight: ["300", "700"],
});

const NAME = "Florencia Acevedo";
const ROLE = "Locutora Nacional";
const DESCRIPTION =
  "Portfolio de Florencia Acevedo, Locutora Nacional. Demos, muestras de voz y trabajos de locución, doblaje y publicidad.";

export const metadata: Metadata = {
  // Without this every relative URL below resolves against nothing and the
  // Open Graph tags ship broken. It is the one field the whole block depends on.
  metadataBase: new URL(SITE_URL),
  title: `${NAME} — ${ROLE}`,
  description: DESCRIPTION,
  applicationName: NAME,
  authors: [{ name: NAME, url: SITE_URL }],
  creator: NAME,
  publisher: NAME,
  keywords: [
    "locutora nacional",
    "locución",
    "voz en off",
    "doblaje",
    "locutora argentina",
    "demo de voz",
    "publicidad",
    NAME,
  ],
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    locale: "es_AR",
    url: "/",
    siteName: `${NAME} — ${ROLE}`,
    title: `${NAME} — ${ROLE}`,
    description: DESCRIPTION,
  },
  twitter: {
    card: "summary_large_image",
    title: `${NAME} — ${ROLE}`,
    description: DESCRIPTION,
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      // Let Google use a full-size thumbnail and an unclipped snippet; the
      // defaults truncate both and this is a portfolio that lives on visuals.
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  // Keep the virtual keyboard out of the layout viewport. Otherwise it shrinks
  // every `h-dvh` section, and the contact card — vertically centred — climbs
  // into the hanging phone decoration hanging off the top of the section.
  // With `resizes-visual` the browser pans the visual viewport instead, so
  // nothing reflows while a field is focused.
  interactiveWidget: "resizes-visual",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="es-AR"
      className={`${playfairDisplay.variable} ${lato.variable} ${archivoBlack.variable} ${leagueSpartan.variable} ${cormorantGaramond.variable} ${spaceGrotesk.variable}`}
    >
      <body className="font-body h-full antialiased">
        {children}
      </body>
    </html>
  );
}
