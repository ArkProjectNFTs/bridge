import { XMarkIcon } from "@heroicons/react/24/solid";
import { useAccount as useStarknetAccount } from "@starknet-react/core";
import { Button, Drawer, IconButton, Modal, Typography } from "design-system";
import Image from "next/image";
import { useMemo, useState } from "react";
import { parseGwei } from "viem";
import {
  erc721ABI,
  useContractRead,
  useContractWrite,
  useAccount as useEthereumAccount,
  useWaitForTransaction,
} from "wagmi";

import useCurrentChain from "~/hooks/useCurrentChain";
import { useIsSSR } from "~/hooks/useIsSSR";

import {
  BRIDGE_ADDRESS,
  CHAIN_LOGOS_BY_NAME,
  CONNECTOR_LABELS_BY_ID,
  type Chain,
  WALLET_LOGOS_BY_ID,
} from "../../helpers";
import useNftSelection from "../hooks/useNftSelection";
import TargetChainButton from "./TargetChainButton";

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
      className={`flex w-full justify-between gap-3 rounded-2xl bg-neutral-50 px-3 dark:bg-[#0e2230] ${
        isTargetChain ? "pb-3 pt-7" : "pb-7 pt-3"
      }`}
    >
      <div className="flex items-center gap-3">
        <Image
          alt={`${chain} logo`}
          height={42}
          src={CHAIN_LOGOS_BY_NAME[chain]}
          width={42}
        />
        <div>
          <span className="rounded-md bg-dark-blue-100 p-1 text-xs font-semibold text-dark-blue-700 dark:bg-dark-blue-300 dark:text-[#0e2230]">
            {isTargetChain ? "To" : "From"}
          </span>
          <Typography component="div" variant="body_text_14">
            {chain}
          </Typography>
        </div>
      </div>
      {!isSSR && connectorId !== undefined && (
        <div className="flex items-center gap-3">
          <Image
            alt={`${CONNECTOR_LABELS_BY_ID[connectorId] ?? ""} logo`}
            height={42}
            src={WALLET_LOGOS_BY_ID[connectorId] ?? ""}
            width={42}
          />
          <div>
            <span className="rounded-md bg-dark-blue-100 p-1 text-xs font-semibold text-dark-blue-700 dark:bg-dark-blue-300 dark:text-[#0e2230]">
              Wallet
            </span>
            <Typography component="div" variant="body_text_14">
              {shortAddress}
            </Typography>
          </div>
        </div>
      )}
    </div>
  );
}

function TransferAction() {
  const { targetChain } = useCurrentChain();
  const { selectedNfts } = useNftSelection("Ethereum");

  const { address: ethereumAddress } = useEthereumAccount();
  const { address: starknetAddress } = useStarknetAccount();

  const { data: isApprovedForAll } = useContractRead({
    abi: erc721ABI,
    address: selectedNfts[0]?.collectionContractAddress as `0x${string}`,
    args: [ethereumAddress ?? "0xtest", BRIDGE_ADDRESS],
    functionName: "isApprovedForAll",
    watch: true,
  });

  // TODO @YohanTz: use usePrepareContractWrite
  const { data: approveData, write: approveForAll } = useContractWrite({
    abi: erc721ABI,
    address: selectedNfts[0]?.collectionContractAddress as `0x${string}`,
    args: [BRIDGE_ADDRESS, true],
    functionName: "setApprovalForAll",
  });

  const { isLoading: isApproveLoading } = useWaitForTransaction({
    hash: approveData?.hash,
  });

  // TODO @YohanTz: use usePrepareContractWrite
  const { data: depositData, write: depositTokens } = useContractWrite({
    // abi: bridgeAbi,
    abi: [
      {
        inputs: [
          { internalType: "uint256", name: "reqHash", type: "uint256" },
          {
            internalType: "address",
            name: "collectionAddress",
            type: "address",
          },
          {
            internalType: "uint256",
            name: "ownerL2Address",
            type: "uint256",
          },
          { internalType: "uint256[]", name: "tokensIds", type: "uint256[]" },
        ],
        name: "depositTokens",
        outputs: [],
        stateMutability: "payable",
        type: "function",
      },
    ],
    address: BRIDGE_ADDRESS,
    args: [
      "0xbeef",
      selectedNfts[0]?.collectionContractAddress,
      starknetAddress,
      selectedNfts.map((selectedNft) => selectedNft?.tokenId),
    ],
    functionName: "depositTokens",
    value: parseGwei("40000"),
  });

  const { isLoading: isDepositLoading } = useWaitForTransaction({
    hash: depositData?.hash,
  });

  return isApprovedForAll ? (
    <>
      <Typography
        className="mt-8 rounded-xl bg-[#60D2B34D] p-3 text-dark-blue-950"
        component="p"
        variant="body_text_14"
      >
        Gas fees are free, handed by Everai!
      </Typography>
      <button
        className="mt-8 w-full rounded-full bg-dark-blue-950 p-3 text-sm text-white"
        onClick={() => depositTokens()}
      >
        <Typography variant="button_text_s">
          {isDepositLoading
            ? "Loading..."
            : `Confirm transfer to ${targetChain}`}
        </Typography>
      </button>
    </>
  ) : (
    <>
      <Typography
        className="mt-8 rounded-xl bg-purple-100 p-3 text-dark-blue-950"
        component="p"
        variant="body_text_14"
      >
        You must approve the selection of your assets before confirming the
        migration. Each collection will require a signature via your wallet.
      </Typography>
      <button
        className="mt-8 w-full rounded-full bg-dark-blue-950 p-3 text-sm text-white"
        onClick={() => approveForAll()}
      >
        <Typography variant="button_text_s">
          {isApproveLoading ? "Loading..." : "Approve the selected Nfts"}
        </Typography>
      </button>
    </>
  );
}

function TransferSummary() {
  const { address: ethereumAddress, connector: ethereumConnector } =
    useEthereumAccount();
  const { address: starknetAddress, connector: starknetConnector } =
    useStarknetAccount();

  const { targetChain } = useCurrentChain();

  // TODO @YohanTz: Support both sides
  const { deselectNft, selectedNfts } = useNftSelection("Ethereum");

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

  return (
    <>
      <Typography
        className="w-full text-left"
        component="h2"
        variant="heading_light_xxs"
      >
        Your assets to transfer
      </Typography>
      <Typography
        className="mt-4 dark:text-dark-blue-300"
        component="p"
        variant="body_text_14"
      >
        You need to confirm the transaction in your wallet to start the
        migration.
      </Typography>
      <div
        className={`mt-8 flex w-full gap-1.5 ${
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
          // eslint-disable-next-line @typescript-eslint/unbound-method
          connectorId={starknetConnector?.id}
          shortAddress={shortStarknetAddress}
          targetChain={targetChain}
        />
      </div>

      {selectedNfts.length > 0 ? (
        <Typography className="mt-8 w-full" variant="body_text_14">
          {selectedNfts.length} Nfts selected
        </Typography>
      ) : (
        <Typography
          className="mt-8 w-full"
          component="p"
          variant="body_text_14"
        >
          No Nfts selected yet...
          <br />
          Select a collection to start
        </Typography>
      )}

      {/* TODO @YohanTz: Always show scroll bar to indicate that there is more content to view (with Radix ScrollArea ?) */}
      {selectedNfts.length > 0 && (
        <div className="mt-8 flex w-full flex-col gap-4 overflow-y-auto">
          {selectedNfts.map((selectedNft) => {
            return (
              <div className="flex justify-between" key={selectedNft?.id}>
                <div className="flex items-center gap-4">
                  <Image
                    alt={selectedNft?.title ?? ""}
                    className="rounded"
                    height={52}
                    src={selectedNft?.image ?? ""}
                    width={52}
                  />
                  <div className="flex flex-col">
                    <Typography ellipsable variant="body_text_14">
                      {selectedNft?.collectionName}
                    </Typography>
                    <Typography ellipsable variant="body_text_bold_14">
                      {selectedNft?.title.length ?? 0 > 0
                        ? selectedNft?.title
                        : selectedNft?.tokenId}
                    </Typography>
                  </div>
                </div>
                <IconButton
                  icon={
                    <XMarkIcon className="h-5 w-5 text-dark-blue-700 dark:text-dark-blue-400" />
                  }
                  className="border-2 border-dark-blue-700 bg-transparent dark:border-dark-blue-400"
                  onClick={() => deselectNft(selectedNft?.id ?? "")}
                />
              </div>
            );
          })}
        </div>
      )}
      <TransferAction />
    </>
  );
}

export default function TransferSummaryContainer() {
  const [showMobileSummary, setShowMobileSummary] = useState(false);
  const { numberOfSelectedNfts } = useNftSelection("Ethereum");

  return (
    <>
      <Drawer className="hidden md:block">
        <TransferSummary />
      </Drawer>
      {numberOfSelectedNfts > 0 && (
        <Modal
          backdropClassName={`md:hidden ${showMobileSummary ? "" : "hidden"}`}
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
                  {numberOfSelectedNfts}{" "}
                  {numberOfSelectedNfts > 1 ? "Nfts" : "Nft"} selected
                </Typography>
                <Button onClick={() => setShowMobileSummary(true)} variant="s">
                  Continue
                </Button>
              </div>
            </>
          )}
        </Modal>
      )}
    </>
  );
}
