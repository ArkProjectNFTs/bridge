/* eslint-disable @typescript-eslint/no-misused-promises */
import * as Tabs from "@radix-ui/react-tabs";
import { Typography } from "design-system";

import CollectionNftsEmptyState from "~/app/_components/CollectionNftsEmptyState";
import InfiniteScrollButton from "~/app/_components/InfiniteScrollButton";
import NftCard from "~/app/_components/NftCard/NftCard";
import NftsLoadingState from "~/app/_components/NftsLoadingState";
import TokenNftsEmptyState from "~/app/_components/TokenNftsEmptyState";
import useInfiniteEthereumCollections from "~/app/_hooks/useInfiniteEthereumCollections";
import useInfiniteEthereumNfts from "~/app/_hooks/useInfiniteEthereumNfts";
import useInfiniteStarknetCollections from "~/app/_hooks/useInfiniteStarknetCollections";
import useInfiniteStarknetNfts from "~/app/_hooks/useInfiniteStarknetNfts";
import useIsFullyConnected from "~/app/_hooks/useIsFullyConnected";

function AllNftsTabsContent() {
  const {
    data: l1NftsData,
    fetchNextPage: fetchNextL1NftsPage,
    hasNextPage: hasNextL1NftsPage,
    isFetchingNextPage: isFetchingNextL1NftsPage,
  } = useInfiniteEthereumNfts({ pageSize: 5 });

  const {
    data: l2NftsData,
    // fetchNextPage: fetchNextL2NftsPage,
    // hasNextPage: hasNextL2NftsPage,
    // isFetchingNextPage: isFetchingNextL2NftsPage,
  } = useInfiniteStarknetNfts();

  const isFullyConnected = useIsFullyConnected();

  if (
    (l1NftsData?.pages[0]?.totalCount === 0 &&
      l2NftsData?.pages[0]?.ownedNfts.length === 0) ||
    !isFullyConnected
  ) {
    return (
      <Tabs.Content value="all">
        <Typography className="pb-12" component="p" variant="body_text_18">
          {"You have no NFT(s) in your wallets..."}
        </Typography>
        <TokenNftsEmptyState />
      </Tabs.Content>
    );
  }

  if (l1NftsData === undefined || l2NftsData === undefined) {
    return (
      <Tabs.Content value="all">
        <NftsLoadingState type="token" />
      </Tabs.Content>
    );
  }

  return (
    <Tabs.Content value="all">
      <div className="grid grid-cols-2 gap-5 sm:grid-cols-5">
        {l1NftsData.pages.map((page) => {
          return page.ownedNfts.map((nft) => {
            return (
              <NftCard
                cardType="nft"
                chain="Ethereum"
                isSelected={false}
                key={`${nft.contractAddress}-${nft.tokenId}`}
                media={nft.media}
                title={nft.name}
              />
            );
          });
        })}

        {!hasNextL1NftsPage &&
          l2NftsData.pages.map((page) => {
            return page.ownedNfts.map((nft) => {
              return (
                <NftCard
                  cardType="nft"
                  chain="Starknet"
                  isSelected={false}
                  key={`${nft.contractAddress}-${nft.tokenId}`}
                  media={nft.media}
                  title={nft.name}
                />
              );
            });
          })}
      </div>
      <InfiniteScrollButton
        className="mx-auto mt-14 flex w-full justify-center"
        fetchAuto={false}
        fetchNextPage={() => fetchNextL1NftsPage()}
        hasNextPage={hasNextL1NftsPage}
        isFetchingNextPage={isFetchingNextL1NftsPage}
      />
    </Tabs.Content>
  );
}

function CollectionsTabsContent() {
  const {
    data: l1CollectionsData,
    fetchNextPage: fetchNextL1CollectionsPage,
    hasNextPage: hasNextL1CollectionsPage,
    isFetchingNextPage: isFetchingNextL1CollectionsPage,
  } = useInfiniteEthereumCollections({ pageSize: 5 });

  const {
    data: l2CollectionsData,
    // fetchNextPage: fetchNextL2CollectionsPage,
    // hasNextPage: hasNextL2CollectionsPage,
    // isFetchingNextPage: isFetchingNextL2CollectionsPage,
  } = useInfiniteStarknetCollections();

  const isFullyConnected = useIsFullyConnected();

  if (
    (l1CollectionsData?.pages[0]?.collections.length === 0 &&
      l2CollectionsData?.pages[0]?.collections.length === 0) ||
    !isFullyConnected
  ) {
    return (
      <Tabs.Content value="collections">
        <Typography className="pb-12" component="p" variant="body_text_18">
          {"You have no NFT(s) in your wallets..."}
        </Typography>
        <CollectionNftsEmptyState />
      </Tabs.Content>
    );
  }

  if (l1CollectionsData === undefined || l2CollectionsData === undefined) {
    return (
      <Tabs.Content value="collections">
        <NftsLoadingState type="collection" />
      </Tabs.Content>
    );
  }

  return (
    <Tabs.Content value="collections">
      <div className="grid grid-cols-2 gap-5 sm:grid-cols-5">
        {l1CollectionsData.pages.map((page) => {
          return page.collections.map((collection) => {
            return (
              <NftCard
                cardType="collection"
                chain="Ethereum"
                isSelected={false}
                key={collection.contractAddress}
                media={collection.media}
                numberOfNfts={collection.totalBalance}
                title={collection.name}
              />
            );
          });
        })}
        {!hasNextL1CollectionsPage &&
          l2CollectionsData.pages.map((page) => {
            return page.collections.map((collection) => {
              return (
                <NftCard
                  cardType="collection"
                  chain="Starknet"
                  isSelected={false}
                  key={collection.contractAddress}
                  media={collection.media}
                  numberOfNfts={collection.totalBalance}
                  title={collection.name}
                />
              );
            });
          })}
      </div>
      <InfiniteScrollButton
        className="mx-auto mt-14 flex w-full justify-center"
        fetchAuto={false}
        fetchNextPage={() => fetchNextL1CollectionsPage()}
        hasNextPage={hasNextL1CollectionsPage}
        isFetchingNextPage={isFetchingNextL1CollectionsPage}
      />
    </Tabs.Content>
  );
}

function EthereumNTabsContent() {
  const {
    data: l1NftsData,
    fetchNextPage: fetchNextL1NftsPage,
    hasNextPage: hasNextL1NftsPage,
    isFetchingNextPage: isFetchingNextL1NftsPage,
  } = useInfiniteEthereumNfts({ pageSize: 5 });

  const isFullyConnected = useIsFullyConnected();

  if (l1NftsData?.pages[0]?.totalCount === 0 || !isFullyConnected) {
    return (
      <Tabs.Content value="ethereum">
        <Typography className="pb-12" component="p" variant="body_text_18">
          {"You have no NFT(s) in your Ethereum wallet..."}
        </Typography>
        <TokenNftsEmptyState />
      </Tabs.Content>
    );
  }

  if (l1NftsData === undefined) {
    return (
      <Tabs.Content value="ethereum">
        <NftsLoadingState type="token" />
      </Tabs.Content>
    );
  }

  return (
    <Tabs.Content value="ethereum">
      <div className="grid grid-cols-2 gap-5 sm:grid-cols-5">
        {l1NftsData.pages.map((page) => {
          return page.ownedNfts.map((nft) => {
            return (
              <NftCard
                cardType="nft"
                chain="Ethereum"
                isSelected={false}
                key={`${nft.contractAddress}-${nft.tokenId}`}
                media={nft.media}
                title={nft.name}
              />
            );
          });
        })}
      </div>
      <InfiniteScrollButton
        className="mx-auto mt-14 flex w-full justify-center"
        fetchAuto={false}
        fetchNextPage={() => fetchNextL1NftsPage()}
        hasNextPage={hasNextL1NftsPage}
        isFetchingNextPage={isFetchingNextL1NftsPage}
      />
    </Tabs.Content>
  );
}

function StarknetTabsContent() {
  const {
    data: l2NftsData,
    // fetchNextPage: fetchNextL2NftsPage,
    // hasNextPage: hasNextL2NftsPage,
    // isFetchingNextPage: isFetchingNextL2NftsPage,
  } = useInfiniteStarknetNfts();

  const isFullyConnected = useIsFullyConnected();

  if (l2NftsData?.pages[0]?.ownedNfts.length === 0 || !isFullyConnected) {
    return (
      <Tabs.Content value="starknet">
        <Typography className="pb-12" component="p" variant="body_text_18">
          {"You have no NFT(s) in your Starknet wallet..."}
        </Typography>
        <TokenNftsEmptyState />
      </Tabs.Content>
    );
  }

  if (l2NftsData === undefined) {
    return (
      <Tabs.Content value="starknet">
        <NftsLoadingState type="token" />
      </Tabs.Content>
    );
  }

  return (
    <Tabs.Content
      className="grid grid-cols-2 gap-5 sm:grid-cols-5"
      value="starknet"
    >
      {l2NftsData.pages.map((page) => {
        return page.ownedNfts.map((nft) => {
          return (
            <NftCard
              cardType="nft"
              chain="Starknet"
              isSelected={false}
              key={`${nft.contractAddress}-${nft.tokenId}`}
              media={nft.media}
              title={nft.name}
            />
          );
        });
      })}
    </Tabs.Content>
  );
}

export default function NftTabsContent() {
  return (
    <div className="mt-10.5">
      <AllNftsTabsContent />
      <CollectionsTabsContent />
      <EthereumNTabsContent />
      <StarknetTabsContent />
    </div>
  );
}
