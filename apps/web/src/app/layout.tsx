"use client";

import "~/styles/globals.css";

import { useLocalStorage } from "usehooks-ts";
import localFont from "next/font/local";

import Footer from "./bridge/components/Footer";
import Header from "./bridge/components/Header";
import { api } from "~/utils/api";
import { type Chain } from "./bridge/helpers";
import Providers from "./providers";

const arkProjectFont = localFont({
  src: [
    {
      path: "../font/ArkProject-Light.woff2",
      weight: "400",
      style: "normal",
    },
    {
      path: "../font/ArkProject-Regular.woff2",
      weight: "500",
      style: "normal",
    },
    {
      path: "../font/ArkProject-Medium.woff2",
      weight: "600",
      style: "normal",
    },
    {
      path: "../font/ArkProject-Bold.woff2",
      weight: "700",
      style: "normal",
    },
    {
      path: "../font/ArkProject-ExtraBold.woff2",
      weight: "800",
      style: "normal",
    },
  ],
  variable: "--font-ark-project",
});

const styreneAFont = localFont({
  src: [
    {
      path: "../font/StyreneA-Regular-Web.woff2",
      weight: "500",
      style: "normal",
    },
    {
      path: "../font/StyreneA-RegularItalic-Web.woff2",
      weight: "500",
      style: "italic",
    },
    {
      path: "../font/StyreneA-Bold-Web.woff2",
      weight: "700",
      style: "normal",
    },
  ],
  variable: "--font-styrene-a",
});

function RootLayout({ children }: { children: React.ReactNode }) {
  const [targetChain] = useLocalStorage<Chain>("chain", "Ethereum");

  return (
    <html
      lang="en"
      className={`${arkProjectFont.variable} ${styreneAFont.variable}`}
    >
      <body
        className={`min-h-screen bg-neutral-50 text-sky-950 dark:bg-black dark:text-white ${targetChain}`}
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
