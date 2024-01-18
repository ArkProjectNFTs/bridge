import { Button, Typography } from "design-system";

import NftsEmptyState from "~/app/_components/NftsEmptyState";
import NftsLoadingState from "~/app/_components/NftsLoadingState";
import useCurrentChain from "~/app/_hooks/useCurrentChain";
import { type Nft } from "~/server/api/routers/nfts";

import NftCard from "../../../_components/NftCard/NftCard";
import useNftSelection from "../_hooks/useNftSelection";

interface CollectionGridProps {
  selectCollection: (collectionName: null | string) => void;
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
              className="rounded-full bg-primary-source px-2.5 py-1 text-white"
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
  selectCollection: (collectionName: null | string) => void;
  selectedCollection: Array<Nft>;
  selectedCollectionName: null | string;
  toggleNftSelection: (nftId: string) => void;
  toggleSelectAll: () => void;
}

function CollectionTokenList({
  allCollectionSelected,
  selectCollection,
  selectedCollection,
  selectedCollectionName,
  toggleNftSelection,
  toggleSelectAll,
}: CollectionTokenListProps) {
  const { sourceChain } = useCurrentChain();

  const { isSelected } = useNftSelection();

  return (
    <div>
      {/* TODO @YohanTz: Refacto to be a variant in the Button component */}
      <button
        className="mb-10 flex h-12 items-center gap-1.5 rounded-full border-2 border-asteroid-grey-600 px-6 py-3 text-asteroid-grey-600 dark:border-space-blue-300 dark:text-space-blue-300"
        onClick={() => selectCollection(null)}
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
      </button>
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
          selectCollection={selectCollection}
          selectedCollection={selectedCollection}
          selectedCollectionName={selectedCollectionName}
          toggleNftSelection={toggleNftSelection}
          toggleSelectAll={toggleSelectAll}
        />
      )}
    </div>
  );
}
