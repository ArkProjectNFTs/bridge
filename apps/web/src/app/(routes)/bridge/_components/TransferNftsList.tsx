import { IconButton, Typography } from "design-system";

import Media from "~/app/_components/Media";
import useAccountFromChain from "~/app/_hooks/useAccountFromChain";
import useCurrentChain from "~/app/_hooks/useCurrentChain";
import { api } from "~/utils/api";

import useNftSelection from "../_hooks/useNftSelection";

export default function TransferNftsList() {
  const { deselectNft, selectedCollectionAddress, selectedTokenIds } =
    useNftSelection();

  const { sourceChain } = useCurrentChain();
  const { address } = useAccountFromChain(sourceChain);

  const { data: l1SelectedNfts } = api.l1Nfts.getNftMetadataBatch.useQuery(
    {
      contractAddress: selectedCollectionAddress ?? "",
      tokenIds: selectedTokenIds,
    },
    {
      enabled: sourceChain === "Ethereum",
      keepPreviousData: true,
    }
  );

  const { data: l2SelectedNfts } = api.l2Nfts.getNftMetadataBatch.useQuery(
    {
      contractAddress: selectedCollectionAddress ?? "",
      ownerAddress: address ?? "",
      tokenIds: selectedTokenIds,
    },
    {
      enabled: sourceChain === "Starknet",
      keepPreviousData: true,
    }
  );

  const selectedNfts =
    sourceChain === "Ethereum" ? l1SelectedNfts : l2SelectedNfts;

  if (selectedNfts === undefined) {
    return null;
  }

  return (
    <div className="mt-8 flex w-full flex-col gap-4 overflow-y-auto">
      {selectedNfts.map((selectedNft) => {
        return (
          <div className="flex justify-between" key={selectedNft.tokenId}>
            <div className="flex items-center gap-4">
              {selectedNft?.image ? (
                <Media
                  alt={selectedNft.tokenName}
                  className="rounded"
                  height={52}
                  src={selectedNft.image}
                  width={52}
                />
              ) : (
                <>
                  <Media
                    alt="empty Nft image"
                    className="hidden rounded dark:block"
                    height={52}
                    src={`/medias/dark/empty_nft.png`}
                    width={52}
                  />
                  <Media
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
  );
}
