import {
  Button,
  Drawer,
  IconButton,
  Modal,
  Notification,
  Typography,
} from "design-system";
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
      <Notification
        icon={
          <svg
            className="shrink-0"
            fill="none"
            height="32"
            viewBox="0 0 32 32"
            width="32"
            xmlns="http://www.w3.org/2000/svg"
          >
            <mask fill="white" id="path-1-inside-1_502_17917">
              <path
                clipRule="evenodd"
                d="M28.5 13.3726V11.7351C28.5 10.346 27.7794 9.05644 26.5964 8.32845L24.9915 7.34082C23.8136 7.90428 23 9.1071 23 10.4999C23 12.4329 24.567 13.9999 26.5 13.9999C27.2436 13.9999 27.9331 13.768 28.5 13.3726Z"
                fillRule="evenodd"
              />
            </mask>
            <path
              clipRule="evenodd"
              d="M28.5 13.3726V11.7351C28.5 10.346 27.7794 9.05644 26.5964 8.32845L24.9915 7.34082C23.8136 7.90428 23 9.1071 23 10.4999C23 12.4329 24.567 13.9999 26.5 13.9999C27.2436 13.9999 27.9331 13.768 28.5 13.3726Z"
              fill="#B4E1AC"
              fillRule="evenodd"
            />
            <path
              d="M28.5 13.3726L29.0721 14.1928L29.5 13.8943V13.3726H28.5ZM26.5964 8.32845L26.0723 9.18011L26.5964 8.32845ZM24.9915 7.34082L25.5156 6.48916L25.0515 6.20358L24.56 6.43872L24.9915 7.34082ZM27.5 11.7351V13.3726H29.5V11.7351H27.5ZM26.0723 9.18011C26.9595 9.7261 27.5 10.6933 27.5 11.7351H29.5C29.5 9.99878 28.5992 8.38678 27.1205 7.47679L26.0723 9.18011ZM24.4674 8.19248L26.0723 9.18011L27.1205 7.47679L25.5156 6.48916L24.4674 8.19248ZM24 10.4999C24 9.50656 24.5793 8.64651 25.423 8.24292L24.56 6.43872C23.0479 7.16206 22 8.70765 22 10.4999H24ZM26.5 12.9999C25.1193 12.9999 24 11.8807 24 10.4999H22C22 12.9852 24.0147 14.9999 26.5 14.9999V12.9999ZM27.9279 12.5524C27.5234 12.8346 27.0325 12.9999 26.5 12.9999V14.9999C27.4548 14.9999 28.3428 14.7015 29.0721 14.1928L27.9279 12.5524Z"
              fill="#0E2230"
              mask="url(#path-1-inside-1_502_17917)"
            />
            <path
              d="M9 5.5H14C16.4853 5.5 18.5 7.51472 18.5 10V28H4.5V10C4.5 7.51472 6.51472 5.5 9 5.5Z"
              fill="#B4E1AC"
              stroke="#0E2230"
            />
            <path
              d="M7.5 10C7.5 9.17157 8.17157 8.5 9 8.5H14C14.8284 8.5 15.5 9.17157 15.5 10V13C15.5 13.8284 14.8284 14.5 14 14.5H9C8.17157 14.5 7.5 13.8284 7.5 13V10Z"
              fill="#E3FADE"
              stroke="#0E2230"
            />
            <path d="M1 28H22" stroke="#0E2230" strokeLinecap="round" />
            <path
              d="M22 6L27.5039 9.21059C27.8111 9.3898 28 9.7187 28 10.0744V21C28 22.1046 27.1046 23 26 23V23C24.8954 23 24 22.1046 24 21V17C24 15.8954 23.1046 15 22 15H19"
              stroke="#0E2230"
              strokeLinecap="round"
            />
          </svg>
        }
        className="mt-8"
        variant="gas_fee"
      >
        Gas fees are free, handed by Ark Project!
      </Notification>
      <Button className="mt-8" onClick={() => depositTokens()} size="small">
        <Typography variant="button_text_s">
          {isDepositLoading
            ? "Approval in Progress..."
            : `Confirm transfer to ${targetChain}`}
        </Typography>
      </Button>
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
          className="mt-8 flex gap-2.5 rounded-xl bg-playground-purple-100 p-3 text-dark-blue-950 dark:bg-playground-purple-400"
          component="p"
          variant="body_text_14"
        >
          <svg
            className="flex-shrink-0"
            fill="none"
            height="32"
            viewBox="0 0 32 32"
            width="32"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M30.555 13.0686C30.7391 18.8906 26.2996 25.363 18.8398 26.5409C14.1036 27.2888 10.0434 25.9494 7.11476 23.7515C4.1716 21.5427 2.40664 18.497 2.20463 15.8707C2.00595 13.2876 3.3401 10.8487 5.91453 8.95722C8.4917 7.06374 12.2804 5.75054 16.8548 5.46463C21.4456 5.1777 24.7793 5.87994 27.0008 7.24017C29.1963 8.58448 30.349 10.5966 30.555 13.0686Z"
              fill="#7D56E5"
              stroke="#0E2230"
            />
            <path
              d="M25.8054 14.2174C25.6899 12.2929 24.0361 10.8264 22.1116 10.942C20.1871 11.0575 18.7206 12.7112 18.8361 14.6358"
              stroke="#0E2230"
              stroke-linecap="round"
              stroke-linejoin="round"
            />
            <path
              d="M14.6758 15.4133C14.1347 13.5628 12.196 12.5013 10.3455 13.0423C8.495 13.5834 7.43347 15.5221 7.9745 17.3726"
              stroke="#0E2230"
              stroke-linecap="round"
              stroke-linejoin="round"
            />
          </svg>
          You must approve the selection of your assets before confirming the
          migration. Each collection will require a signature via your wallet.
        </Typography>
      )}
      <Button
        className={`mt-8 ${
          numberOfSelectedNfts === 0
            ? "cursor-no-drop bg-[#1c2f55] opacity-30 dark:bg-dark-blue-900"
            : "bg-dark-blue-900 dark:bg-dark-blue-700"
        }`}
        // disabled={numberOfSelectedNfts === 0}
        color="default"
        onClick={() => numberOfSelectedNfts > 0 && approveForAll()}
        size="small"
      >
        <Typography variant="button_text_s">
          {isApproveLoading
            ? "Approve in progress..."
            : numberOfSelectedNfts === 0
            ? `Confirm transfer to ${targetChain}`
            : "Approve the selected Nfts"}
        </Typography>
      </Button>
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

                {/* <Button onClick={() => setShowMobileSummary(true)} variant="s">
                  Continue
                </Button> */}
              </div>
            </>
          )}
        </Modal>
      )}
    </>
  );
}
