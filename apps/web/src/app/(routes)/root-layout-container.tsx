"use client";

import clsx from "clsx";
import { type PropsWithChildren } from "react";

import { api } from "~/utils/api";

import Header from "../_components/Header";
import MobilePlaceholder from "../_components/MobilePlaceholder";
import useCurrentChain from "../_hooks/useCurrentChain";
import Providers from "./providers";

function RootLayoutContainer({ children }: PropsWithChildren) {
  const { targetChain } = useCurrentChain();

  return (
    <body
      className={clsx(
        "bg-space-blue-50 text-galaxy-blue dark:bg-void-black dark:text-white",
        targetChain
      )}
    >
      <Providers>
        <Header />
        <div className="hidden min-h-screen md:block">{children}</div>
      </Providers>
      <div className="block h-screen md:hidden">
        <MobilePlaceholder />
      </div>
    </body>
  );
}

export default api.withTRPC(RootLayoutContainer);
