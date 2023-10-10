import { Button, Typography } from "design-system";

import NftsEmptyState from "~/app/_components/NftsEmptyState";
import NftsLoadingState from "~/app/_components/NftsLoadingState";
import useCurrentChain from "~/app/_hooks/useCurrentChain";
import { type Nft } from "~/server/api/routers/nfts";

import NftCard from "../../../_components/NftCard/NftCard";
import useNftSelection from "../_hooks/useNftSelection";

interface CollectionGridProps {
  selectCollection: (collectionName: string) => void;
}

function CollectionGrid({ selectCollection }: CollectionGridProps) {
  const { lastSelectedCollectionName, nfts } = useNftSelection();
  const { sourceChain } = useCurrentChain();

  if (nfts === undefined) {
    return <NftsLoadingState />;
  }

  if (nfts.raw.length === 0) {
    return <NftsEmptyState />;
  }

  return (
    <div className="grid grid-cols-2 gap-5 sm:grid-cols-3 lg:grid-cols-5">
      {Object.entries(nfts.byCollection).map(
        ([collectionName, collectionNfts]) => {
          return (
            <NftCard
              cardType="collection"
              chain={sourceChain}
              image={collectionNfts[0]?.image}
              isSelected={collectionName === lastSelectedCollectionName}
              key={collectionName}
              numberOfNfts={collectionNfts.length}
              onClick={() => selectCollection(collectionName)}
              title={collectionName}
            />
          );
        }
      )}
    </div>
  );
}

function CollectionList({ selectCollection }: CollectionGridProps) {
  const { sourceChain, targetChain } = useCurrentChain();
  const { nfts } = useNftSelection();

  return (
    <>
      <div className="mb-9 text-left">
        <div className="flex max-w-full items-center gap-3.5">
          <Typography ellipsable variant="heading_light_s">
            Collections on {sourceChain}
          </Typography>
          {nfts === undefined ? null : (
            <Typography
              className="rounded-full bg-primary-source px-2 py-1 text-white"
              variant="button_text_s"
            >
              {Object.keys(nfts?.byCollection)?.length ?? 0}
            </Typography>
          )}
        </div>
        <Typography className="mt-4" component="p" variant="body_text_20">
          {nfts === undefined
            ? "Loading collections in progress..."
            : nfts.raw.length === 0
            ? `It looks like you have no nfts collection on ${sourceChain}...`
            : `Select the assets you want to transfer to ${targetChain}`}
        </Typography>
      </div>
      <CollectionGrid selectCollection={selectCollection} />
    </>
  );
}

interface CollectionTokenListProps {
  allCollectionSelected: boolean;
  selectedCollection: Array<Nft>;
  selectedCollectionName: null | string;
  toggleNftSelection: (nftId: string) => void;
  toggleSelectAll: () => void;
}

function CollectionTokenList({
  allCollectionSelected,
  selectedCollection,
  selectedCollectionName,
  toggleNftSelection,
  toggleSelectAll,
}: CollectionTokenListProps) {
  const { sourceChain } = useCurrentChain();

  const { isSelected } = useNftSelection();

  return (
    <div>
      <div className="mb-10 flex w-full flex-wrap justify-between gap-3.5">
        <div className="flex max-w-full items-center gap-3.5">
          <Typography ellipsable variant="heading_light_s">
            {selectedCollectionName} Collection
          </Typography>
          <Typography
            className="shrink-0 rounded-full bg-primary-source px-2 py-1.5 text-white"
            variant="body_text_12"
          >
            {selectedCollection.length}
            {selectedCollection.length > 1 ? " Nfts" : " Nft"}
          </Typography>
        </div>
        <Button color="default" onClick={toggleSelectAll} size="small">
          <Typography variant="button_text_s">
            {allCollectionSelected ? "Deselect all" : "Select all"}
          </Typography>
        </Button>
      </div>

      <div className="grid grid-cols-2 gap-5 sm:grid-cols-3 lg:grid-cols-5">
        {selectedCollection.map((nft) => {
          return (
            <NftCard
              cardType="nft"
              chain={sourceChain}
              image={nft.image}
              isSelected={isSelected(nft.id)}
              key={nft.id}
              onClick={() => toggleNftSelection(nft.id)}
              title={nft.title.length > 0 ? nft.title : nft.tokenId}
            />
          );
        })}
      </div>
    </div>
  );
}

/*
 * TODO @YohanTz: Take time to optimize the lists with React.memo etc.
 */
export default function TokenList() {
  // TODO @YohanTz: Refactor this part of the hook
  const {
    allCollectionSelected,
    selectCollection,
    selectedCollection,
    selectedCollectionName,
    toggleNftSelection,
    toggleSelectAll,
  } = useNftSelection();

  return (
    <div className="w-full">
      {selectedCollection.length === 0 ? (
        <CollectionList selectCollection={selectCollection} />
      ) : (
        <CollectionTokenList
          allCollectionSelected={allCollectionSelected}
          selectedCollection={selectedCollection}
          selectedCollectionName={selectedCollectionName}
          toggleNftSelection={toggleNftSelection}
          toggleSelectAll={toggleSelectAll}
        />
      )}
    </div>
  );
}
