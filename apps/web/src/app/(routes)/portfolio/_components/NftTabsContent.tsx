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
    l2NftsData.pages[0]?.nfts.length === 0
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
          return page.nfts.map((nft) => {
            return (
              <NftCard
                title={
                  nft.metadata?.normalized?.name?.length ?? 0 > 0
                    ? nft.metadata?.normalized?.name
                    : `#${nft.token_id}`
                }
                cardType="nft"
                chain="Starknet"
                image={nft.metadata?.normalized?.image}
                isSelected={false}
                key={`${nft.contract_address}-${nft.token_id}`}
              />
            );
          });
        })}

        {l1NftsData.pages.map((page) => {
          return page.ownedNfts.map((nft) => {
            return (
              <NftCard
                title={
                  nft.title.length > 0
                    ? nft.title
                    : `${nft.title ?? nft.contract.name} #${nft.tokenId}`
                }
                cardType="nft"
                chain="Ethereum"
                image={nft.media[0]?.thumbnail}
                isSelected={false}
                key={`${nft.contract.address}-${nft.tokenId}`}
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

  return (
    <Tabs.Content value="collections">
      <div className="grid grid-cols-2 gap-5 sm:grid-cols-5">
        {l2CollectionsData.pages.map((page) => {
          return page.contracts.map((nftContract) => {
            return (
              <NftCard
                title={
                  nftContract.name ?? nftContract.symbol ?? "No collection name"
                }
                cardType="collection"
                chain="Starknet"
                // image={nftContract.media[0]?.thumbnail}
                isSelected={false}
                key={nftContract.contract_address}
                // numberOfNfts={nftContract.totalBalance}
                numberOfNfts={0}
              />
            );
          });
        })}

        {l1CollectionsData.pages.map((page) => {
          return page.contracts.map((nftContract) => {
            return (
              <NftCard
                cardType="collection"
                chain="Ethereum"
                image={nftContract.media[0]?.thumbnail}
                isSelected={false}
                key={nftContract.address}
                numberOfNfts={nftContract.totalBalance}
                title={nftContract.name ?? nftContract.symbol ?? ""}
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
                title={
                  nft.title.length > 0
                    ? nft.title
                    : `${nft.title ?? nft.contract.name} #${nft.tokenId}`
                }
                cardType="nft"
                chain="Ethereum"
                image={nft.media[0]?.thumbnail}
                isSelected={false}
                key={`${nft.contract.address}-${nft.tokenId}`}
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
  } else if (l2NftsData.pages[0].nfts.length === 0) {
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
        return page.nfts.map((nft) => {
          return (
            <NftCard
              title={
                nft.metadata?.normalized?.name?.length ?? 0 > 0
                  ? nft.metadata?.normalized?.name
                  : `#${nft.token_id}`
              }
              cardType="nft"
              chain="Starknet"
              image={nft.metadata?.normalized?.image}
              isSelected={false}
              key={`${nft.contract_address}-${nft.token_id}`}
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
