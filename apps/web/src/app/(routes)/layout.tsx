"use client";

import clsx from "clsx";
// import { type Metadata } from "next";
import localFont from "next/font/local";

import "~/styles/globals.css";
import { api } from "~/utils/api";

import Header from "../_components/Header";
import MobilePlaceholder from "../_components/MobilePlaceholder";
import useCurrentChain from "../_hooks/useCurrentChain";
import Providers from "./providers";

// export const metadata: Metadata = {
//   description: "",
//   // openGraph: {
//   //   description:
//   //     "",
//   //   images: [""],
//   //   title: "ArkProject",
//   //   type: "website",
//   //   url: "https://www.arkproject.dev",
//   // },
//   title: "ArkProject Bridge",
//   // twitter: {
//   //   card: "summary_large_image",
//   //   creator: "@ArkProjectNFTs",
//   //   description:
//   //     "",
//   //   images: [""],
//   //   site: "@ArkProjectNFTs",
//   //   title: "ArkProject",
//   // },
// };

const arkProjectFont = localFont({
  src: [
    {
      path: "../../font/ArkProject-Light.woff2",
      style: "normal",
      weight: "400",
    },
    {
      path: "../../font/ArkProject-Regular.woff2",
      style: "normal",
      weight: "500",
    },
    {
      path: "../../font/ArkProject-Medium.woff2",
      style: "normal",
      weight: "600",
    },
    {
      path: "../../font/ArkProject-Bold.woff2",
      style: "normal",
      weight: "700",
    },
    {
      path: "../../font/ArkProject-ExtraBold.woff2",
      style: "normal",
      weight: "800",
    },
  ],
  variable: "--font-ark-project",
});

const styreneAFont = localFont({
  src: [
    {
      path: "../../font/StyreneA-Regular-Web.woff2",
      style: "normal",
      weight: "400",
    },
    {
      path: "../../font/StyreneA-RegularItalic-Web.woff2",
      style: "italic",
      weight: "400",
    },
    {
      path: "../../font/StyreneA-Medium-Web.woff2",
      style: "normal",
      weight: "500",
    },
    {
      path: "../../font/StyreneA-Bold-Web.woff2",
      style: "normal",
      weight: "700",
    },
  ],
  variable: "--font-styrene-a",
});

function RootLayout({ children }: { children: React.ReactNode }) {
  const { targetChain } = useCurrentChain();

  return (
    <html
      className={clsx(arkProjectFont.variable, styreneAFont.variable)}
      lang="en"
      // suppresHydrationWarning only applies one level deep, necessary because <html> is updated before page load by next-themes
      suppressHydrationWarning
    >
      <body
        className={clsx(
          "bg-space-blue-50 text-galaxy-blue dark:bg-void-black dark:text-white",
          targetChain
        )}
      >
        <Providers>
          <Header />
          <div className="hidden min-h-screen md:block">{children}</div>
          {/* <EthereumSwitchNetwork />
          <StarknetSwitchNetwork /> */}
        </Providers>
        <div className="block h-screen md:hidden">
          <MobilePlaceholder />
        </div>
      </body>
    </html>
  );
}

export default api.withTRPC(RootLayout);
