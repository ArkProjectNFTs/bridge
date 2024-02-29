"use client";

import clsx from "clsx";
import { Typography } from "design-system";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

import DarkModeButton from "~/app/_components/DarkModeButton";
import { api } from "~/utils/api";

import useNftSelection from "../(routes)/bridge/_hooks/useNftSelection";
import useAccountFromChain from "../_hooks/useAccountFromChain";
import useCurrentChain from "../_hooks/useCurrentChain";
import { type Chain } from "../_types";
import ConnectEthereumButton from "./ConnectEthereumButton";
import ConnectStarkNetButton from "./ConnectStarkNetButton";
import EthereumSwitchNetwork from "./EthereumSwitchNetwork";
import Logo from "./Logo";
import StarknetSwitchNetwork from "./StarknetSwitchNetwork";

function BridgeLink() {
  const pathname = usePathname();
  const { totalSelectedNfts } = useNftSelection();

  return (
    <Link className="flex items-center gap-1" href="/bridge">
      <Typography
        className={clsx(
          pathname?.includes("/bridge") && "text-space-blue-source",
          "transition-colors hover:text-space-blue-source"
        )}
        variant="heading_light_xxs"
      >
        Bridge
      </Typography>

      {totalSelectedNfts > 0 && (
        <div className="flex h-5 items-center rounded-full bg-space-blue-100 px-2 dark:bg-space-blue-400">
          <Typography
            className="text-space-blue-source dark:text-galaxy-blue"
            variant="button_text_xs"
          >
            {totalSelectedNfts}
          </Typography>
        </div>
      )}
    </Link>
  );
}

function LoungeLink() {
  const { targetChain } = useCurrentChain();
  const { address } = useAccountFromChain(targetChain);

  const pathname = usePathname();

  const { data: bridgeRequests } =
    api.bridgeRequest.getBridgeRequestsFromAddress.useQuery(
      {
        address: address ?? "",
      },
      { enabled: address !== undefined }
    );

  return (
    <Link className="flex items-center gap-1" href="/lounge">
      <Typography
        className={clsx(
          pathname === "/lounge" && "text-space-blue-source",
          "transition-colors hover:text-space-blue-source"
        )}
        variant="heading_light_xxs"
      >
        Lounge
      </Typography>
      {(bridgeRequests?.inTransit.totalCount ?? 0) > 0 && (
        <div className="flex h-5 items-center rounded-full bg-space-blue-100 px-2 dark:bg-space-blue-400">
          <Typography
            className="text-space-blue-source dark:text-galaxy-blue"
            variant="button_text_xs"
          >
            {bridgeRequests?.inTransit.totalCount}
          </Typography>
        </div>
      )}
    </Link>
  );
}

export default function Header() {
  const [openedModal, setOpenedModal] = useState<Chain | undefined>(undefined);

  const pathname = usePathname();

  function openModal(chain: Chain) {
    setOpenedModal(chain);
  }

  function closeModal() {
    setOpenedModal(undefined);
  }

  return (
    <header className="fixed z-20 flex h-23 w-full items-center justify-center bg-white p-6 dark:bg-void-black md:justify-between">
      <Link href="/">
        <Logo />
      </Link>
      <div className="hidden items-center gap-8 md:flex">
        <Link href="/portfolio">
          <Typography
            className={clsx(
              pathname === "/portfolio" && "text-space-blue-source",
              "transition-colors hover:text-space-blue-source"
            )}
            variant="heading_light_xxs"
          >
            Portfolio
          </Typography>
        </Link>
        <BridgeLink />
        <LoungeLink />
      </div>
      <div className="hidden gap-4 md:flex">
        <div className="flex gap-4">
          {/* TODO @YohanTz: Modal context? */}
          <ConnectEthereumButton
            onOpenModalChange={(open) => {
              open ? openModal("Ethereum") : closeModal();
            }}
            isModalOpen={openedModal === "Ethereum"}
          />
          <ConnectStarkNetButton
            onOpenModalChange={(open) => {
              open ? openModal("Starknet") : closeModal();
            }}
            isModalOpen={openedModal === "Starknet"}
          />
        </div>
        <DarkModeButton />
      </div>
      <EthereumSwitchNetwork />
      <StarknetSwitchNetwork />
    </header>
  );
}
