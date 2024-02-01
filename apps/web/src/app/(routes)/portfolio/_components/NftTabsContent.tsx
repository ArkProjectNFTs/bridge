/* eslint-disable @typescript-eslint/no-misused-promises */
import * as Tabs from "@radix-ui/react-tabs";

import InfiniteScrollButton from "~/app/_components/InfiniteScrollButton";
import NftCard from "~/app/_components/NftCard/NftCard";
import NftsEmptyState from "~/app/_components/NftsEmptyState";
import NftsLoadingState from "~/app/_components/NftsLoadingState";
import useInfiniteEthereumCollections from "~/app/_hooks/useInfiniteEthereumCollections";
import useInfiniteEthereumNfts from "~/app/_hooks/useInfiniteEthereumNfts";
import useInfiniteStarknetCollections from "~/app/_hooks/useInfiniteStarknetCollections";
import useInfiniteStarknetNfts from "~/app/_hooks/useInfiniteStarknetNfts";

function AllNftsTabsContent() {
  const {
    data: l1NftsData,
    fetchNextPage: fetchNextL1NftsPage,
    hasNextPage: hasNextL1NftsPage,
    isFetchingNextPage: isFetchingNextL1NftsPage,
  } = useInfiniteEthereumNfts();

  const {
    data: l2NftsData,
    // fetchNextPage: fetchNextL2NftsPage,
    // hasNextPage: hasNextL2NftsPage,
    // isFetchingNextPage: isFetchingNextL2NftsPage,
  } = useInfiniteStarknetNfts();

  if (l1NftsData === undefined || l2NftsData === undefined) {
    return (
      <Tabs.Content value="all">
        <NftsLoadingState />
      </Tabs.Content>
    );
  } else if (
    l1NftsData.pages[0]?.totalCount === 0 &&
    l2NftsData.pages[0]?.ownedNfts.length === 0
  ) {
    return (
      <Tabs.Content value="all">
        <NftsEmptyState />
      </Tabs.Content>
    );
  }

  return (
    <Tabs.Content value="all">
      <div className="grid grid-cols-2 gap-5 sm:grid-cols-5">
        {l2NftsData.pages.map((page) => {
          return page.ownedNfts.map((nft) => {
            return (
              <NftCard
                cardType="nft"
                chain="Starknet"
                image={nft.image}
                isSelected={false}
                key={`${nft.contractAddress}-${nft.tokenId}`}
                title={nft.name}
              />
            );
          });
        })}

        {l1NftsData.pages.map((page) => {
          return page.ownedNfts.map((nft) => {
            return (
              <NftCard
                cardType="nft"
                chain="Ethereum"
                image={nft.image}
                isSelected={false}
                key={`${nft.contractAddress}-${nft.tokenId}`}
                title={nft.name}
              />
            );
          });
        })}
      </div>
      <InfiniteScrollButton
        className="mx-auto mt-14 flex w-full justify-center"
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
  } = useInfiniteEthereumCollections();

  const {
    data: l2CollectionsData,
    // fetchNextPage: fetchNextL2CollectionsPage,
    // hasNextPage: hasNextL2CollectionsPage,
    // isFetchingNextPage: isFetchingNextL2CollectionsPage,
  } = useInfiniteStarknetCollections();

  if (l1CollectionsData === undefined || l2CollectionsData === undefined) {
    return (
      <Tabs.Content value="collections">
        <NftsLoadingState />
      </Tabs.Content>
    );
  }

  console.log(l2CollectionsData);

  return (
    <Tabs.Content value="collections">
      <div className="grid grid-cols-2 gap-5 sm:grid-cols-5">
        {l2CollectionsData.pages.map((page) => {
          return page.collections.map((collection) => {
            return (
              <NftCard
                cardType="collection"
                chain="Starknet"
                image={collection.image}
                isSelected={false}
                key={collection.contractAddress}
                numberOfNfts={collection.totalBalance}
                title={collection.name}
              />
            );
          });
        })}

        {l1CollectionsData.pages.map((page) => {
          return page.collections.map((collection) => {
            return (
              <NftCard
                cardType="collection"
                chain="Ethereum"
                image={collection.image}
                isSelected={false}
                key={collection.contractAddress}
                numberOfNfts={collection.totalBalance}
                title={collection.name}
              />
            );
          });
        })}
      </div>
      <InfiniteScrollButton
        className="mx-auto mt-14 flex w-full justify-center"
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
  } = useInfiniteEthereumNfts();

  if (l1NftsData === undefined) {
    return (
      <Tabs.Content value="ethereum">
        <NftsLoadingState />
      </Tabs.Content>
    );
  } else if (l1NftsData.pages[0]?.totalCount === 0) {
    return (
      <Tabs.Content value="ethereum">
        <NftsEmptyState />
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
                image={nft.image}
                isSelected={false}
                key={`${nft.contractAddress}-${nft.tokenId}`}
                title={nft.name}
              />
            );
          });
        })}
      </div>
      <InfiniteScrollButton
        className="mx-auto mt-14 flex w-full justify-center"
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

  if (l2NftsData === undefined) {
    return (
      <Tabs.Content value="starknet">
        <NftsLoadingState />
      </Tabs.Content>
    );
  } else if (l2NftsData.pages[0]?.ownedNfts.length === 0) {
    return (
      <Tabs.Content value="starknet">
        <NftsEmptyState />
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
              image={nft.image}
              isSelected={false}
              key={`${nft.contractAddress}-${nft.tokenId}`}
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
    <div className="mb-4 mt-10.5">
      <AllNftsTabsContent />
      <CollectionsTabsContent />
      <EthereumNTabsContent />
      <StarknetTabsContent />
    </div>
  );
}
