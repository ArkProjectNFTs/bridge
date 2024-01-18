"use client";

import {
  useConnectors,
  // useAccount as useStarknetAccount,
} from "@starknet-react/core";
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

const connectedPages = [
  { name: "Portfolio", path: "/portfolio" },
  { name: "Bridge", path: "/bridge" },
  { name: "Lounge room", path: "/lounge" },
];

export default function Header() {
  const [openedModal, setOpenedModal] = useState<Chain | undefined>(undefined);
  const {
    isConnected: isEthereumConnected,
    isConnecting: isEthereumConnecting,
  } = useEthereumAccount();
  // const { isConnected: isStarknetConnected } = useStarknetAccount();
  const { isLoading: isStarknetLoading } = useConnectors();

  const router = useRouter();
  const pathname = usePathname();

  const isFullyConnected = isEthereumConnected;
  // TODO @YohanTz: fix isConnecting in starknet-react
  const isConnecting = isEthereumConnecting || isStarknetLoading;

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
    <header className="fixed z-20 flex h-23 w-full items-center  justify-between bg-white p-6 dark:bg-galaxy-blue">
      <Link href="/">
        <Typography variant="logo">starklane</Typography>
      </Link>
      {isFullyConnected && (
        <div className="hidden items-center gap-8 md:flex">
          {connectedPages.map((connectedPage) => {
            return (
              <Link href={connectedPage.path} key={connectedPage.name}>
                <Typography
                  className={
                    pathname === connectedPage.path
                      ? pathname === "/portfolio"
                        ? "text-sunshine-yellow-600"
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
      <div className="flex gap-4">
        <div className="hidden gap-4 md:flex">
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
    </header>
  );
}
