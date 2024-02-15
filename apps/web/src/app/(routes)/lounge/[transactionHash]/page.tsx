"use client";
import Image from "next/image";
import { redirect } from "next/navigation";
import { useEffect } from "react";

import { api } from "~/utils/api";

interface PageProps {
  params: { transactionHash: string };
}

/**
 * Page used when waiting for a deposit transaction to be detected by the bridge
 */
export default function Page({ params: { transactionHash } }: PageProps) {
  const { data: hasBridgeRequestBeenIndexed } =
    api.bridgeRequest.getHasBrigeRequestIndexed.useQuery(
      {
        transactionHash,
      },
      { refetchInterval: 2500 }
    );

  useEffect(() => {
    if (hasBridgeRequestBeenIndexed) {
      redirect("/lounge");
    }
  }, [hasBridgeRequestBeenIndexed]);

  return (
    <Image
      alt="Bridge loading animation"
      className="fixed inset-0 h-screen w-screen object-cover"
      height={3000}
      src="/medias/bridge_animation.gif"
      width={3000}
    />
  );
}
