"use client";

import localFont from "next/font/local";
import { useLocalStorage } from "usehooks-ts";

import "~/styles/globals.css";
import { api } from "~/utils/api";

import Footer from "./bridge/components/Footer";
import Header from "./bridge/components/Header";
import { type Chain } from "./bridge/helpers";
import Providers from "./providers";

const arkProjectFont = localFont({
  src: [
    {
      path: "../font/ArkProject-Light.woff2",
      style: "normal",
      weight: "400",
    },
    {
      path: "../font/ArkProject-Regular.woff2",
      style: "normal",
      weight: "500",
    },
    {
      path: "../font/ArkProject-Medium.woff2",
      style: "normal",
      weight: "600",
    },
    {
      path: "../font/ArkProject-Bold.woff2",
      style: "normal",
      weight: "700",
    },
    {
      path: "../font/ArkProject-ExtraBold.woff2",
      style: "normal",
      weight: "800",
    },
  ],
  variable: "--font-ark-project",
});

const styreneAFont = localFont({
  src: [
    {
      path: "../font/StyreneA-Regular-Web.woff2",
      style: "normal",
      weight: "500",
    },
    {
      path: "../font/StyreneA-RegularItalic-Web.woff2",
      style: "italic",
      weight: "500",
    },
    {
      path: "../font/StyreneA-Bold-Web.woff2",
      style: "normal",
      weight: "700",
    },
  ],
  variable: "--font-styrene-a",
});

function RootLayout({ children }: { children: React.ReactNode }) {
  const [targetChain] = useLocalStorage<Chain>("chain", "Ethereum");

  return (
    <html
      className={`${arkProjectFont.variable} ${styreneAFont.variable}`}
      lang="en"
      // suppresHydrationWarning only applies one level deep, necessary because <html> is updated before page load by next-themes
      suppressHydrationWarning
    >
      <body
        className={`min-h-screen bg-neutral-50 text-dark-blue-950 dark:bg-[#0e2230] dark:text-white ${targetChain}`}
      >
        <Providers>
          <Header />
          {children}
          <Footer />
        </Providers>
      </body>
    </html>
  );
}

export default api.withTRPC(RootLayout);
