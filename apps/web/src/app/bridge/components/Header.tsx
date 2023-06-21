"use client";

import ConnectStarkNetButton from "./ConnectStarkNetButton";
import ConnectEthereumButton from "./ConnectEthereumButton";
import { useEffect, useState } from "react";
import { type Chain } from "../helpers";
import { Typography } from "design-system";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAccount as useStarknetAccount } from "@starknet-react/core";
import { useAccount as useEthereumAccount } from "wagmi";
import Image from "next/image";

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
  const {
    isConnected: isStarknetConnected,
    isConnecting: isStarknetConnecting,
  } = useStarknetAccount();

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
    <div className="fixed z-20 flex w-full items-center justify-between border-b border-neutral-50 bg-white p-6">
      <Link href="/">
        <Typography variant="logo">starklane</Typography>
      </Link>
      <div className="flex gap-20">
        {isFullyConnected && (
          <div className="flex items-center gap-8">
            {connectedPages.map((connectedPage) => {
              return (
                <Link key={connectedPage.name} href={connectedPage.path}>
                  <Typography
                    variant="heading_light_xxs"
                    className={
                      pathname === connectedPage.path ? "text-primary-300" : ""
                    }
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
            isModalOpen={openedModal === "Ethereum"}
            onOpenModalChange={(open) => {
              open ? openModal("Ethereum") : closeModal();
            }}
          />
          <ConnectStarkNetButton
            isModalOpen={openedModal === "Starknet"}
            onOpenModalChange={(open) => {
              open ? openModal("Starknet") : closeModal();
            }}
          />
          <button>
            <Image
              src="/icons/light_mode.svg"
              alt="light mode icon"
              height={32}
              width={32}
            />
          </button>
          <Image
            src="/icons/bridge.svg"
            alt="bridge icon"
            height={32}
            width={32}
          />
        </div>
      </div>
    </div>
  );
}
