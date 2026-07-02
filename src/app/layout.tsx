import type { Metadata } from "next";
import { Playfair_Display, Lato, Archivo_Black, League_Spartan, Cormorant_Garamond, Space_Grotesk } from "next/font/google";
import "./globals.css";

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

export const metadata: Metadata = {
  title: "Florencia Acevedo — Locutora Nacional",
  description: "Portfolio de Florencia Acevedo, Locutora Nacional",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="es"
      className={`${playfairDisplay.variable} ${lato.variable} ${archivoBlack.variable} ${leagueSpartan.variable} ${cormorantGaramond.variable} ${spaceGrotesk.variable}`}
    >
      <body className="font-body h-full antialiased">
        {children}
      </body>
    </html>
  );
}
