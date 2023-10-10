import { XMarkIcon } from "@heroicons/react/24/solid";
import { Button, Drawer, IconButton, Modal, Typography } from "design-system";
import Image from "next/image";
import { redirect } from "next/navigation";
import { useEffect, useState } from "react";

import useCurrentChain from "~/app/_hooks/useCurrentChain";

import useNftSelection from "../_hooks/useNftSelection";
import useTransferNftsFromChain from "../_hooks/useTransferNfts";
import WalletsTransferSummary from "./WalletsTransferSummary";

function TransferAction() {
  const { sourceChain, targetChain } = useCurrentChain();
  const { numberOfSelectedNfts } = useNftSelection();

  const {
    approveForAll,
    depositTokens,
    isApproveLoading,
    isApprovedForAll,
    isDepositLoading,
    isDepositSuccess,
  } = useTransferNftsFromChain(sourceChain);

  useEffect(() => {
    if (isDepositSuccess) {
      redirect("/lounge");
    }
  }, [isDepositSuccess]);

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
        className="mt-8 w-full rounded-full bg-dark-blue-950 p-3 text-sm text-white dark:bg-dark-blue-700"
        onClick={() => depositTokens()}
      >
        <Typography variant="button_text_s">
          {isDepositLoading
            ? "Approval in Progress..."
            : `Confirm transfer to ${targetChain}`}
        </Typography>
      </button>
      {isDepositLoading && (
        <Image
          alt="Bridge loading animation"
          // className="fixed bottom-0 left-0 right-0 top-23 object-cover"
          className="fixed inset-0 h-screen w-screen object-cover"
          height={3000}
          src="/medias/bridge_animation.gif"
          width={3000}
        />
      )}
    </>
  ) : (
    <>
      {numberOfSelectedNfts > 0 && (
        <Typography
          className="mt-8 rounded-xl bg-purple-100 p-3 text-dark-blue-950"
          component="p"
          variant="body_text_14"
        >
          You must approve the selection of your assets before confirming the
          migration. Each collection will require a signature via your wallet.
        </Typography>
      )}
      <button
        className={`mt-8 w-full rounded-full p-3 text-sm text-white ${
          numberOfSelectedNfts === 0
            ? "cursor-no-drop bg-[#1c2f55] opacity-30 dark:bg-dark-blue-900"
            : "bg-dark-blue-900 dark:bg-dark-blue-700"
        }`}
        disabled={numberOfSelectedNfts === 0}
        onClick={() => numberOfSelectedNfts > 0 && approveForAll()}
      >
        <Typography variant="button_text_s">
          {numberOfSelectedNfts === 0
            ? `Confirm transfer to ${targetChain}`
            : "Approve the selected Nfts"}
        </Typography>
      </button>
      {isApproveLoading && "Loading..."}
    </>
  );
}

function TransferSummary() {
  // TODO @YohanTz: Support both sides
  const { deselectNft, selectedNfts } = useNftSelection();

  return (
    <>
      <Typography
        className="w-full text-left"
        component="h2"
        variant="heading_light_xxs"
      >
        Your assets to transfer
      </Typography>

      <WalletsTransferSummary />

      {selectedNfts.length > 0 ? (
        <Typography className="mt-8 w-full" variant="body_text_14">
          {selectedNfts.length} Nfts selected
        </Typography>
      ) : (
        <div className="mt-8 flex w-full items-center gap-4">
          <Image
            alt="no nft selected nft image"
            height={68}
            src="/medias/nft_selection_empty.png"
            width={62}
          />
          <Typography component="p" variant="body_text_14">
            No Nfts selected yet...
            <br />
            Select a collection to start.
          </Typography>
        </div>
      )}

      {/* TODO @YohanTz: Always show scroll bar to indicate that there is more content to view (with Radix ScrollArea ?) */}
      {selectedNfts.length > 0 && (
        <div className="mt-8 flex w-full flex-col gap-4 overflow-y-auto">
          {selectedNfts.map((selectedNft) => {
            return (
              <div className="flex justify-between" key={selectedNft?.id}>
                <div className="flex items-center gap-4">
                  {selectedNft?.image ? (
                    <Image
                      alt={selectedNft?.title ?? ""}
                      className="rounded"
                      height={52}
                      src={selectedNft?.image ?? ""}
                      width={52}
                    />
                  ) : (
                    // <div className="flex h-[52px] w-[52px] items-center justify-center rounded bg-dark-blue-100 dark:bg-dark-blue-900"></div>
                    <>
                      <Image
                        alt="empty Nft image"
                        className="hidden rounded dark:block"
                        height={52}
                        src={`/medias/dark/empty_nft.png`}
                        width={52}
                      />
                      <Image
                        alt="empty Nft image"
                        className="rounded dark:hidden"
                        height={52}
                        src={`/medias/empty_nft.png`}
                        width={52}
                      />
                    </>
                  )}
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
  const { numberOfSelectedNfts } = useNftSelection();

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
