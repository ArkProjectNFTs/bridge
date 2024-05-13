"use client";

import clsx from "clsx";
import { cn } from "design-system/src/lib/utils";
import { usePathname } from "next/navigation";
import React, { type PropsWithChildren } from "react";

import { api } from "~/utils/api";

import Header from "../_components/Header";
import MobilePlaceholder from "../_components/MobilePlaceholder";
import useCurrentChain from "../_hooks/useCurrentChain";
import Providers from "./providers";

function RootLayoutContainer({ children }: PropsWithChildren) {
  const { targetChain } = useCurrentChain();
  const pathname = usePathname();
  const isHomePage = pathname === "/";

  return (
    <body
      className={clsx(
        "bg-space-blue-50 text-galaxy-blue dark:bg-void-black dark:text-white",
        targetChain
      )}
    >
      <Providers>
        <Header />
        <div className={cn("desktop block min-h-screen")}>{children}</div>
      </Providers>
      {!isHomePage && (
        <div className="mobile hidden h-screen">
          <MobilePlaceholder />
        </div>
      )}
    </body>
  );
}

const Component = api.withTRPC(
  RootLayoutContainer
) as React.FC<PropsWithChildren>;

export default Component;
