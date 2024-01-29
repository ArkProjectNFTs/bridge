"use client";

import { Button, Typography } from "design-system";
import Link from "next/link";

import NftCard from "~/app/_components/NftCard/NftCard";
import useCurrentChain from "~/app/_hooks/useCurrentChain";
import useInfiniteEthereumNfts from "~/app/_hooks/useInfiniteEthereumNfts";

import useNftSelection from "../_hooks/useNftSelection2";

interface TokenListProps {
  nftContractAddress: string;
}

export default function TokenList({ nftContractAddress }: TokenListProps) {
  const { sourceChain } = useCurrentChain();

  const { isNftSelected, toggleNftSelection } = useNftSelection();

  const { data, fetchNextPage, hasNextPage, isFetchingNextPage } =
    useInfiniteEthereumNfts({ contractAddress: nftContractAddress });

  if (data === undefined) {
    return;
  }

  return (
    <div className="mb-4 flex flex-col items-start">
      {/* TODO @YohanTz: Refacto to be a variant in the Button component */}
      <Link
        className="mb-10 inline-flex h-12 items-center gap-1.5 rounded-full border-2 border-asteroid-grey-600 px-6 py-3 text-asteroid-grey-600 dark:border-space-blue-300 dark:text-space-blue-300"
        href="/bridge"
      >
        {/* TODO @YohanTz: Export svg to icons file */}
        <svg
          fill="none"
          height="24"
          viewBox="0 0 24 24"
          width="24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M20.25 12L12.7297 12C11.9013 12 11.2297 12.6716 11.2297 13.5L11.2297 16.4369C11.2297 17.0662 10.5013 17.4157 10.0104 17.0219L4.47931 12.585C4.10504 12.2848 4.10504 11.7152 4.47931 11.415L10.0104 6.97808C10.5013 6.58428 11.2297 6.93377 11.2297 7.56311L11.2297 9.375"
            stroke="currentColor"
            stroke-linecap="round"
            stroke-width="1.5"
          />
        </svg>
        <Typography variant="button_text_s">Back</Typography>
      </Link>
      <div className="mb-10 flex w-full flex-wrap justify-between gap-3.5">
        <div className="flex max-w-full items-center gap-3.5">
          <Typography ellipsable variant="heading_light_s">
            {data.pages[0]?.ownedNfts[0]?.contract.name ??
              data.pages[0]?.ownedNfts[0]?.contract.symbol}{" "}
            Collection
          </Typography>
          <Typography
            className="shrink-0 rounded-full bg-primary-source px-2 py-1.5 text-white"
            variant="body_text_12"
          >
            {data.pages[0]?.totalCount ?? 0}
            {data.pages[0]?.totalCount ?? 2 > 1 ? " Nfts" : " Nft"}
          </Typography>
        </div>
        {/* <Button color="default" onClick={toggleSelectAll} size="small">
          <Typography variant="button_text_s">
            {allCollectionSelected ? "Deselect all" : "Select all"}
          </Typography>
        </Button> */}
      </div>

      <div className="grid w-full grid-cols-2 gap-5 sm:grid-cols-3 lg:grid-cols-5">
        {data.pages.map((page) => {
          return page.ownedNfts.map((ownedNft) => {
            const isSelected = isNftSelected(
              ownedNft.tokenId,
              ownedNft.contract.address
            );

            return (
              <NftCard
                // onClick={() => toggleNftSelection(nft.id)}
                onClick={() =>
                  toggleNftSelection(
                    ownedNft.tokenId,
                    ownedNft.contract.address
                  )
                }
                title={
                  ownedNft.title.length > 0
                    ? ownedNft.title
                    : `#${ownedNft.tokenId}`
                }
                cardType="nft"
                chain={sourceChain}
                image={ownedNft.media[0]?.thumbnail}
                // isSelected={isSelected(nft.id)}
                isSelected={isSelected}
                key={ownedNft.tokenId}
              />
            );
          });
        })}
      </div>
      <div className="mx-auto mt-14">
        {isFetchingNextPage ? (
          <div>Loading...</div>
        ) : hasNextPage ? (
          // eslint-disable-next-line @typescript-eslint/no-misused-promises
          <Button onClick={() => fetchNextPage()} size="small">
            Load more
          </Button>
        ) : null}
      </div>
    </div>
  );
}
