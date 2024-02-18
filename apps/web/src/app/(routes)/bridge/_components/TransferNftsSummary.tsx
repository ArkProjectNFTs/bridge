import clsx from "clsx";
import { Drawer, IconButton, SideModal, Typography } from "design-system";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useState } from "react";

import { api } from "~/utils/api";

import useNftSelection from "../_hooks/useNftSelection";
import SmallBridgingQuestBanner from "./SmallBridgingQuestBanner";
import TransferNftsAction from "./TransferNftsAction";
import TransferNftsWalletSummary from "./TransferNftsWalletSummary";
import useCurrentChain from "~/app/_hooks/useCurrentChain";

function NoNftsImage() {
  const { sourceChain } = useCurrentChain();

  if (sourceChain === "Starknet") {
    return (
      <>
        <Image
          alt="no nft selected nft image"
          height={68}
          src="/medias/dark/nft_selection_starknet_empty.png"
          width={62}
          className="hidden dark:block"
        />
        <Image
          alt="no nft selected nft image"
          height={68}
          src="/medias/nft_selection_starknet_empty.png"
          width={62}
          className="dark:hidden"
        />
      </>
    );
  }

  return (
    <>
      <Image
        alt="no nft selected nft image"
        height={68}
        src="/medias/dark/nft_selection_eth_empty.png"
        width={62}
        className="hidden dark:block"
      />
      <Image
        alt="no nft selected nft image"
        height={68}
        src="/medias/nft_selection_eth_empty.png"
        width={62}
        className="dark:hidden"
      />
    </>
  );
}

function TransferSummary() {
  const {
    deselectNft,
    selectedCollectionAddress,
    selectedTokenIds,
    totalSelectedNfts,
  } = useNftSelection();
  const pathname = usePathname();

  const { data: selectedNfts } = api.l1Nfts.getNftMetadataBatch.useQuery(
    {
      contractAddress: selectedCollectionAddress ?? "",
      tokenIds: selectedTokenIds,
    },
    {
      keepPreviousData: true,
    }
  );

  const hasSelectedNfts = totalSelectedNfts > 0;
  const showBridgingQuestBanner = pathname === "/bridge";

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

      {hasSelectedNfts ? (
        <Typography className="mt-8 w-full" variant="body_text_14">
          {totalSelectedNfts} Nfts selected
        </Typography>
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

      {/* TODO @YohanTz: Always show scroll bar to indicate that there is more content to view (with Radix ScrollArea ?) */}
      {selectedNfts !== undefined && (
        <div className="mt-8 flex w-full flex-col gap-4 overflow-y-auto">
          {selectedNfts.map((selectedNft) => {
            return (
              <div className="flex justify-between" key={selectedNft.tokenId}>
                <div className="flex items-center gap-4">
                  {selectedNft?.image ? (
                    <Image
                      alt={selectedNft.tokenName}
                      className="rounded"
                      height={52}
                      src={selectedNft.image}
                      width={52}
                    />
                  ) : (
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
                      {selectedNft.collectionName}
                    </Typography>
                    <Typography ellipsable variant="body_text_bold_14">
                      {selectedNft.tokenName}
                    </Typography>
                  </div>
                </div>
                <IconButton
                  icon={
                    <svg
                      fill="none"
                      height="21"
                      viewBox="0 0 21 21"
                      width="21"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        d="M5.0531 15.1982L10.0531 10.1982M10.0531 10.1982L15.0531 5.19824M10.0531 10.1982L5.0531 5.19824M10.0531 10.1982L15.0531 15.1982"
                        stroke="currentColor"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                      />
                    </svg>
                  }
                  onClick={() =>
                    deselectNft(
                      selectedNft.tokenId,
                      selectedCollectionAddress ?? ""
                    )
                  }
                  className="flex-shrink-0"
                />
              </div>
            );
          })}
        </div>
      )}
      <TransferNftsAction />
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
