"use client";

import { useAccount as useStarknetAccount } from "@starknet-react/core";
import { Typography } from "design-system";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useAccount as useEthereumAccount } from "wagmi";

import DarkModeButton from "~/app/_components/DarkModeButton";

import { type Chain } from "../_types";
import BridgeCountIndicator from "./BridgeCountIndicator";
import ConnectEthereumButton from "./ConnectEthereumButton";
import ConnectStarkNetButton from "./ConnectStarkNetButton";
import EthereumSwitchNetwork from "./EthereumSwitchNetwork";
import Logo from "./Logo";
import StarknetSwitchNetwork from "./StarknetSwitchNetwork";

const connectedPages = [
  { name: "Portfolio", path: "/portfolio" },
  { name: "Bridge", path: "/bridge" },
  { name: "Lounge", path: "/lounge" },
];

export default function Header() {
  const [openedModal, setOpenedModal] = useState<Chain | undefined>(undefined);
  const {
    isConnected: isEthereumConnected,
    // isConnecting: isEthereumConnecting,
  } = useEthereumAccount();
  const { isConnected: isStarknetConnected } = useStarknetAccount();

  const router = useRouter();
  const pathname = usePathname();

  const isFullyConnected = isEthereumConnected && isStarknetConnected;
  // TODO @YohanTz: fix isConnecting in starknet-react
  const isConnecting = false;
  // const isConnecting = isEthereumConnecting;

  useEffect(() => {
    if (pathname === "/" && isFullyConnected) {
      router.push("/bridge");
      return;
    }

    if (pathname !== "/" && !isFullyConnected && !isConnecting) {
      router.push("/");
    }
  }, [pathname, isFullyConnected, router, isConnecting]);

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
      {isFullyConnected && (
        <div className="hidden items-center gap-8 md:flex">
          {connectedPages.map((connectedPage) => {
            return (
              <Link href={connectedPage.path} key={connectedPage.name}>
                <Typography
                  className={
                    pathname?.includes(connectedPage.path)
                      ? pathname === "/portfolio"
                        ? "text-space-blue-source"
                        : "text-primary-source"
                      : ""
                  }
                  variant="heading_light_xxs"
                >
                  {connectedPage.name}
                </Typography>
              </Link>
            );
          })}
        </div>
      )}
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
        <BridgeCountIndicator />
      </div>
      <EthereumSwitchNetwork />
      <StarknetSwitchNetwork />
    </header>
  );
}
