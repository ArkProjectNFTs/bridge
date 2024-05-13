import { Analytics } from "@vercel/analytics/react";
import clsx from "clsx";
import { type Metadata } from "next";
import localFont from "next/font/local";
import { type PropsWithChildren } from "react";

import "~/styles/globals.css";

import RootLayoutContainer from "./root-layout-container";

export const metadata: Metadata = {
  description: "Seamlessly transfer NFTs from Ethereum to Starknet",
  metadataBase: new URL("https://bridge.arkproject.dev"),
  openGraph: {
    description: "Seamlessly transfer NFTs from Ethereum to Starknet",
    images: ["https://bridge.arkproject.dev/medias/bridge_thumbnail.png"],
    title: "ArkProject NFT Bridge",
    type: "website",
    url: "https://bridge.arkproject.dev",
  },
  title: "ArkProject NFT Bridge",
  twitter: {
    card: "summary_large_image",
    creator: "@ArkProjectNFTs",
    description: "Seamlessly transfer NFTs from Ethereum to Starknet",
    images: ["https://bridge.arkproject.dev/medias/bridge_thumbnail.png"],
    site: "@ArkProjectNFTs",
    title: "ArkProject",
  },
};

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

function RootLayout({ children }: PropsWithChildren) {
  return (
    <html
      className={clsx(arkProjectFont.variable, styreneAFont.variable)}
      lang="en"
      // suppresHydrationWarning only applies one level deep, necessary because <html> is updated before page load by next-themes
      suppressHydrationWarning
    >
      <RootLayoutContainer>{children}</RootLayoutContainer>
      <Analytics />
    </html>
  );
}

export default RootLayout;
