import { useAccount as useStarknetAccount } from "@starknet-react/core";
import clsx from "clsx";
import { Button, Drawer, SideModal, Typography } from "design-system";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { useAccount as useEthereumAccount } from "wagmi";

import ConnectModal from "~/app/_components/ConnectModal";
import useCurrentChain from "~/app/_hooks/useCurrentChain";
import useIsFullyConnected from "~/app/_hooks/useIsFullyConnected";

import useNftSelection from "../_hooks/useNftSelection";
import SmallBridgingQuestBanner from "./SmallBridgingQuestBanner";
import TransferNftsAction from "./TransferNftsAction";
import TransferNftsList from "./TransferNftsList";
import TransferNftsWalletSummary from "./TransferNftsWalletSummary";

function NoNftsImage() {
  const { sourceChain } = useCurrentChain();

  if (sourceChain === "Starknet") {
    return (
      <>
        <Image
          alt="no nft selected nft image"
          className="hidden dark:block"
          height={68}
          src="/medias/dark/nft_selection_starknet_empty.png"
          width={62}
        />
        <Image
          alt="no nft selected nft image"
          className="dark:hidden"
          height={68}
          src="/medias/nft_selection_starknet_empty.png"
          width={62}
        />
      </>
    );
  }

  return (
    <>
      <Image
        alt="no nft selected nft image"
        className="hidden dark:block"
        height={68}
        src="/medias/dark/nft_selection_eth_empty.png"
        width={62}
      />
      <Image
        alt="no nft selected nft image"
        className="dark:hidden"
        height={68}
        src="/medias/nft_selection_eth_empty.png"
        width={62}
      />
    </>
  );
}

function TransferNftsNotConnected() {
  const { address: ethereumAddress } = useEthereumAccount();
  const { address: starknetAddress } = useStarknetAccount();
  const [isOpen, setIsOpen] = useState(false);

  if (ethereumAddress === undefined && starknetAddress === undefined) {
    return (
      <>
        <ConnectModal isOpen={isOpen} onOpenChange={setIsOpen} />
        <Image
          alt={`Wallets`}
          className="mx-auto mt-8"
          height={100}
          src={"/medias/wallet_default.png"}
          width={100}
        />
        <Button
          className="mt-8"
          color="default"
          onClick={() => setIsOpen(true)}
          size="small"
        >
          Connect wallets
        </Button>
      </>
    );
  } else if (ethereumAddress === undefined) {
    return (
      <>
        <Image
          alt={`Ethereum logo`}
          className="mx-auto mt-8"
          height={100}
          src={"/medias/ethereum_wallet.png"}
          width={100}
        />
        <ConnectModal
          initialChain="Ethereum"
          isOpen={isOpen}
          onOpenChange={setIsOpen}
        />
        <Button
          className="mt-8"
          color="default"
          onClick={() => setIsOpen(true)}
          size="small"
        >
          Connect Ethereum wallet
        </Button>
      </>
    );
  } else if (starknetAddress === undefined) {
    return (
      <>
        <Image
          alt={`Starknet logo`}
          className="mx-auto mt-8"
          height={100}
          src={"/medias/starknet_wallet.png"}
          width={100}
        />

        <Button
          className="mt-8"
          color="default"
          onClick={() => setIsOpen(true)}
          size="small"
        >
          Connect Starknet wallet
        </Button>

        <ConnectModal
          initialChain="Starknet"
          isOpen={isOpen}
          onOpenChange={setIsOpen}
        />
      </>
    );
  }

  return null;
}

function TransferSummary() {
  const { totalSelectedNfts } = useNftSelection();
  const pathname = usePathname();

  const hasSelectedNfts = totalSelectedNfts > 0;
  const showBridgingQuestBanner = pathname === "/bridge";
  const isFullyConnected = useIsFullyConnected();

  return (
    <>
      <Typography
        className="w-full text-left"
        component="h2"
        variant="heading_light_xxs"
      >
        Your assets to transfer
      </Typography>

      <TransferNftsWalletSummary />

      {isFullyConnected ? (
        <>
          {hasSelectedNfts ? (
            <>
              <Typography className="mt-8 w-full" variant="body_text_14">
                {totalSelectedNfts} Nfts selected
              </Typography>
              <TransferNftsList />
            </>
          ) : (
            <div className="mt-8 flex w-full items-center gap-4">
              <NoNftsImage />
              <Typography component="p" variant="body_text_14">
                No Nfts selected yet...
                <br />
                For now you can only select Everai collection!
              </Typography>
            </div>
          )}
          <TransferNftsAction />
        </>
      ) : (
        <TransferNftsNotConnected />
      )}

      {showBridgingQuestBanner && <SmallBridgingQuestBanner className="mt-8" />}
    </>
  );
}

export default function TransferSummaryContainer() {
  const [showMobileSummary, setShowMobileSummary] = useState(false);
  const { totalSelectedNfts } = useNftSelection();

  return (
    <>
      <Drawer className="hidden md:block">
        <TransferSummary />
      </Drawer>
      {totalSelectedNfts > 0 && (
        <SideModal
          backdropClassName={clsx("md:hidden", !showMobileSummary && "hidden")}
          className="text-left md:hidden"
          isOpen
          onOpenChange={setShowMobileSummary}
        >
          {showMobileSummary ? (
            <TransferSummary />
          ) : (
            <>
              <Typography
                className="self-start"
                component="h3"
                variant="heading_light_xxs"
              >
                Your assets to transfer
              </Typography>
              <div className="mb-3 mt-1 flex w-full items-center justify-between">
                <Typography variant="body_text_14">
                  {totalSelectedNfts} {totalSelectedNfts > 1 ? "Nfts" : "Nft"}{" "}
                  selected
                </Typography>

                {/* <Button onClick={() => setShowMobileSummary(true)} variant="s">
                  Continue
                </Button> */}
              </div>
            </>
          )}
        </SideModal>
      )}
    </>
  );
}
