"use client";

import { useAccount as useStarknetAccount } from "@starknet-react/core";
import { Typography } from "design-system";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useAccount as useEthereumAccount } from "wagmi";

import DarkModeButton from "~/app/components/DarkModeButton";
import { useIsSSR } from "~/app/hooks/useIsSSR";

import { type Chain } from "../helpers";
import useNftSelection from "../hooks/useNftSelection";
import ConnectEthereumButton from "./ConnectEthereumButton";
import ConnectStarkNetButton from "./ConnectStarkNetButton";

const connectedPages = [
  { name: "Portfolio", path: "/portfolio" },
  { name: "Bridge", path: "/bridge" },
  { name: "Lounge room", path: "/lounge" },
];

export default function Header() {
  const { selectedNftIds } = useNftSelection("Ethereum");
  const [openedModal, setOpenedModal] = useState<Chain | undefined>(undefined);
  const {
    isConnected: isEthereumConnected,
    isConnecting: isEthereumConnecting,
  } = useEthereumAccount();
  const {
    isConnected: isStarknetConnected,
    isConnecting: isStarknetConnecting,
  } = useStarknetAccount();

  const isSSR = useIsSSR();

  const router = useRouter();
  const pathname = usePathname();

  const isFullyConnected = isEthereumConnected && isStarknetConnected;
  // TODO @YohanTz: fix isConnecting in starknet-react
  const isConnecting =
    isEthereumConnecting ||
    isStarknetConnecting ||
    isStarknetConnecting === undefined;

  useEffect(() => {
    if (pathname === "/" && isFullyConnected) {
      router.push("/bridge");
      return;
    }

    if (!isFullyConnected && !isConnecting) {
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
    <header className="fixed z-20 flex h-23 w-full items-center  justify-between bg-white p-6 dark:bg-[#0e2230]">
      <Link href="/">
        <Typography variant="logo">starklane</Typography>
      </Link>
      <div className="flex gap-20">
        {isFullyConnected && (
          <div className="flex items-center gap-8">
            {connectedPages.map((connectedPage) => {
              return (
                <Link href={connectedPage.path} key={connectedPage.name}>
                  <Typography
                    className={
                      pathname === connectedPage.path ? "text-primary-300" : ""
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
          <DarkModeButton />
          <div className="relative flex items-center">
            <Image
              alt="bridge icon"
              height={32}
              src="/icons/bridge.svg"
              width={32}
            />
            {}
            {!isSSR && selectedNftIds.length > 0 && (
              <Typography
                className="absolute -right-2 top-0 min-w-[1.5rem] rounded-full border-2 border-white bg-primary-300 px-1.5 py-0.5 text-center text-white"
                variant="body_text_12"
              >
                {selectedNftIds.length}
              </Typography>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
