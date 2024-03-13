"use client";
import Image from "next/image";
import { redirect } from "next/navigation";
import { useEffect } from "react";

import { api } from "~/utils/api";

import useNftSelection from "../../bridge/_hooks/useNftSelection";

interface PageProps {
  params: { transactionHash: string };
  searchParams: { from: string };
}

/**
 * Page used when waiting for a deposit transaction to be detected by the bridge
 */
export default function Page({
  params: { transactionHash },
  searchParams,
}: PageProps) {
  const { data: hasBridgeRequestBeenIndexed } =
    api.bridgeRequest.getHasBridgeRequestIndexed.useQuery(
      {
        transactionHash,
      },
      { refetchInterval: 2500 }
    );
  const { deselectAllNfts, totalSelectedNfts } = useNftSelection();

  useEffect(() => {
    if (totalSelectedNfts > 0) {
      deselectAllNfts();
    }
  }, [totalSelectedNfts, deselectAllNfts]);

  if (hasBridgeRequestBeenIndexed) {
    redirect(
      `/lounge${searchParams.from === "ethereum" ? "?fromEthereum=" : ""}`
    );
  }

  return (
    <>
      <Image
        alt="Bridge loading animation"
        className="fixed inset-0 h-screen w-screen object-cover dark:hidden"
        height={3000}
        src="/medias/bridge_animation.gif"
        width={3000}
      />
      <Image
        alt="Bridge loading animation"
        className="fixed inset-0 hidden h-screen w-screen object-cover dark:block"
        height={3000}
        src="/medias/dark/bridge_animation.gif"
        width={3000}
      />
    </>
  );
}
