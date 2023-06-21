import Image from "next/image";
import { useAccount as useEthereumAccount } from "wagmi";
import { useAccount as useStarknetAccount } from "@starknet-react/core";

import { api } from "~/utils/api";
import {
  CHAIN_LOGOS_BY_NAME,
  WALLET_LOGOS_BY_ID,
  type Chain,
  CONNECTOR_LABELS_BY_ID,
} from "../helpers";
import TargetChainButton from "./TargetChainButton";
import { useMemo } from "react";
import { useIsSSR } from "~/app/hooks/useIsSSR";
import { IconButton, Typography } from "design-system";
import { XMarkIcon } from "@heroicons/react/24/solid";

interface ChainTransferSummaryProps {
  chain: Chain;
  connectorId?: string;
  shortAddress: string;
  targetChain: Chain;
}

function ChainTransferSummary({
  chain,
  connectorId,
  shortAddress,
  targetChain,
}: ChainTransferSummaryProps) {
  const isTargetChain = chain === targetChain;
  const isSSR = useIsSSR();

  return (
    <div
      className={`flex justify-between gap-3 rounded-2xl bg-neutral-50 px-3.5 ${
        isTargetChain ? "pb-3 pt-7" : "pb-7 pt-3"
      }`}
    >
      <div className="flex items-center gap-3">
        <Image
          src={CHAIN_LOGOS_BY_NAME[chain]}
          height={42}
          width={42}
          alt={`${chain} logo`}
        />
        <div>
          <span className="rounded-md bg-neutral-200 p-1 text-xs font-semibold">
            {isTargetChain ? "To" : "From"}
          </span>
          <Typography variant="body_text_14" component="div">
            {chain}
          </Typography>
        </div>
      </div>
      {!isSSR && connectorId !== undefined && (
        <div className="flex items-center gap-3">
          <Image
            src={WALLET_LOGOS_BY_ID[connectorId] ?? ""}
            height={42}
            width={42}
            alt={`${CONNECTOR_LABELS_BY_ID[connectorId] ?? ""} logo`}
          />
          <div>
            <span className="rounded-md bg-neutral-200 p-1 text-xs font-semibold">
              Wallet
            </span>
            <Typography variant="body_text_14" component="div">
              {shortAddress}
            </Typography>
          </div>
        </div>
      )}
    </div>
  );
}

interface NftTansferDrawerProps {
  selectedNftIds: Array<string>;
  setSelectedNftIds: (nfts: Array<string>) => void;
  targetChain: Chain;
}

export default function NftTransferDrawer({
  selectedNftIds,
  setSelectedNftIds,
  targetChain,
}: NftTansferDrawerProps) {
  const { address: ethereumAddress, connector: ethereumConnector } =
    useEthereumAccount();
  const { address: starknetAddress, connector: starknetConnector } =
    useStarknetAccount();

  // TODO @YohanTz: Support both sides
  const { data: nfts } = api.nfts.getL1NftsByCollection.useQuery(
    {
      address: ethereumAddress ?? "",
    },
    { enabled: ethereumAddress !== undefined }
  );

  function OnNftDelete(nftId: string) {
    setSelectedNftIds(
      selectedNftIds.filter((selectedNftId) => selectedNftId !== nftId)
    );
  }

  // TODO @YohanTz: Hook wrapper around wagmi and starknet-react
  const shortEthereumAddress = useMemo(
    () =>
      ethereumAddress
        ? `${ethereumAddress.slice(0, 6)}...${ethereumAddress.slice(-4)}`
        : "",
    [ethereumAddress]
  );

  const shortStarknetAddress = useMemo(
    () =>
      starknetAddress
        ? `${starknetAddress.slice(0, 6)}...${starknetAddress.slice(-4)}`
        : "",
    [starknetAddress]
  );

  const selectedNfts = selectedNftIds.map((selectedNftId) =>
    nfts?.raw.find((nft) => nft.id === selectedNftId)
  );

  return (
    <div className="mr-3 w-[21.875rem] shrink-0">
      {/* TODO @YohanTz: Extract magic values like this somewhere (top-[5.75rem]) */}
      <div className="fixed bottom-0 right-0 top-[5.75rem] m-3 flex w-[21.875rem] shrink-0 flex-col rounded-2xl border border-neutral-100 bg-white px-5 pb-5 pt-8 dark:border-none dark:bg-dark-blue-900">
        <Typography variant="heading_light_xxs" component="h2">
          Your assets to transfer
        </Typography>
        <Typography component="p" className="mt-4" variant="body_text_14">
          You need to confirm the transaction in your wallet to start the
          migration.
        </Typography>
        <div
          className={`mt-8 flex gap-1.5 ${
            targetChain === "Ethereum" ? "flex-col-reverse" : "flex-col"
          }`}
        >
          <ChainTransferSummary
            chain="Ethereum"
            connectorId={ethereumConnector?.id}
            shortAddress={shortEthereumAddress}
            targetChain={targetChain}
          />
          <TargetChainButton orientation="vertical" />
          <ChainTransferSummary
            chain="Starknet"
            connectorId={starknetConnector?.id()}
            shortAddress={shortStarknetAddress}
            targetChain={targetChain}
          />
        </div>
        {/* TODO @YohanTz: Always show scroll bar to indicate that there is more content to view (with Radix ScrollArea ?) */}
        <div className="mt-8 flex flex-col gap-4 overflow-y-auto">
          {selectedNfts.map((selectedNft) => {
            return (
              <div className="flex justify-between" key={selectedNft?.id}>
                <div className="flex items-center gap-4">
                  <Image
                    src={selectedNft?.image ?? ""}
                    height={52}
                    width={52}
                    alt={selectedNft?.title ?? ""}
                    className="rounded"
                  />
                  <div className="flex flex-col">
                    <Typography variant="body_text_14">
                      {selectedNft?.collectionName}
                    </Typography>
                    <Typography variant="body_text_bold_14">
                      {selectedNft?.title}
                    </Typography>
                  </div>
                </div>
                <IconButton
                  onClick={() => OnNftDelete(selectedNft?.id ?? "")}
                  icon={<XMarkIcon className="h-5 w-5 text-primary-300" />}
                />
              </div>
            );
          })}
        </div>
        <div className="mt-4 flex justify-between text-sm">
          <Typography variant="body_text_14">Total Nfts to migrate</Typography>
          <Typography variant="body_text_14">
            {selectedNfts.length}/{selectedNfts.length}
          </Typography>
        </div>
        <Typography
          className="mt-8 rounded-xl bg-purple-100 p-3"
          variant="body_text_14"
          component="p"
        >
          You must approve the selection of your assets before confirming the
          migration. Each collection will require a signature via your wallet.
        </Typography>
        <button className="mt-8 w-full rounded-full bg-dark-blue-950 p-3 text-sm text-white">
          <Typography variant="body_text_bold_14">
            Approve the selected Nfts
          </Typography>
        </button>
      </div>
    </div>
  );
}
