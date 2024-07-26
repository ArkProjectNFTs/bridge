"use client";

import clsx from "clsx";
import { Typography } from "design-system";
import Link from "next/link";
import { usePathname } from "next/navigation";

import DarkModeButton from "~/app/_components/DarkModeButton";
import { api } from "~/utils/api";

import useNftSelection from "../(routes)/bridge/_hooks/useNftSelection";
import useAccountFromChain from "../_hooks/useAccountFromChain";
import useCurrentChain from "../_hooks/useCurrentChain";
import useIsFullyConnected from "../_hooks/useIsFullyConnected";
import Banner from "./Banner";
import ConnectEthereumButton from "./ConnectEthereumButton";
import ConnectStarkNetButton from "./ConnectStarkNetButton";
import Logo from "./Logo";

function BridgeLink() {
  const pathname = usePathname();
  const { totalSelectedNfts } = useNftSelection();

  const isFullyConnected = useIsFullyConnected();

  return (
    <Link
      className={clsx(
        pathname?.includes("/bridge") && "text-space-blue-source",
        "flex items-center gap-1 transition-colors hover:text-space-blue-source"
      )}
      href="/bridge"
    >
      <Typography variant="heading_light_xxs">Bridge</Typography>

      {isFullyConnected && totalSelectedNfts > 0 && (
        <div className="flex h-5 items-center rounded-full bg-space-blue-100 px-2 dark:bg-space-blue-800">
          <Typography
            className="text-space-blue-source dark:text-space-blue-400"
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

  const isFullyConnected = useIsFullyConnected();

  const { data: bridgeRequests } =
    api.bridgeRequest.getBridgeRequestsFromAddress.useQuery(
      {
        address: address ?? "",
      },
      { enabled: address !== undefined }
    );

  return (
    <Link
      className={clsx(
        pathname?.includes("/lounge") && "text-space-blue-source",
        "flex items-center gap-1 transition-colors hover:text-space-blue-source"
      )}
      href="/lounge"
    >
      <Typography variant="heading_light_xxs">Lounge</Typography>
      {isFullyConnected && (bridgeRequests?.inTransit.totalCount ?? 0) > 0 && (
        <div className="flex h-5 items-center rounded-full bg-space-blue-100 px-2 dark:bg-space-blue-800">
          <Typography
            className="text-space-blue-source dark:text-space-blue-400"
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
  const pathname = usePathname();

  return (
    <header className="fixed z-20 w-full">
      <Banner />
      <div className="flex h-23 w-full items-center justify-center bg-white p-6 dark:bg-void-black md:justify-between">
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
          <a
            href="https://everai.typeform.com/to/PMyHymLn"
            rel="noreferrer"
            target="_blank"
          >
            <Typography
              className="transition-colors hover:text-space-blue-source"
              variant="heading_light_xxs"
            >
              Submit Collection
            </Typography>
          </a>
        </div>
        <div className="hidden items-center gap-4 md:flex">
          <div className="flex gap-4">
            {/* TODO @YohanTz: Modal context? */}
            <ConnectEthereumButton />
            <ConnectStarkNetButton />
          </div>
          <DarkModeButton />
        </div>
      </div>
    </header>
  );
}
