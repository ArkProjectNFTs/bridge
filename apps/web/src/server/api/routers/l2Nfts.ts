import { validateAndParseAddress } from "starknet";
import { z } from "zod";

import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";

import {
  getL2ContractMetadata,
  getL2ContractsForOwner,
  getL2NftsForOwner,
  getL2NftsMetadataBatch,
  getL2WhitelistedCollections,
  getMediaObjectFromUrl,
} from "../helpers/l2nfts";
import { type Collection, type Nft } from "../types";

export const l2NftsRouter = createTRPCRouter({
  getCollectionInfo: publicProcedure
    .input(z.object({ contractAddress: z.string() }))
    .query(async ({ input }) => {
      const { contractAddress } = input;

      try {
        const contractInfo = await getL2ContractMetadata(contractAddress);

        return { name: contractInfo.result.name };
      } catch (error) {
        return { name: "" };
      }
    }),
  getNftCollectionsByWallet: publicProcedure
    .input(z.object({ address: z.string(), cursor: z.string().optional() }))
    .query(async ({ input }) => {
      const {
        address,
        // cursor
      } = input;

      try {
        const contractsForOwner = await getL2ContractsForOwner(address);
        const whitelistedCollections = await getL2WhitelistedCollections();

        const collections: Array<Collection> = contractsForOwner.result.map(
          (contract) => {
            const media = getMediaObjectFromUrl(contract.image);
            const isBridgeable =
              whitelistedCollections === undefined ||
              whitelistedCollections.some(
                (whitelistedCollection) =>
                  validateAndParseAddress(
                    whitelistedCollection
                  ).toLowerCase() ===
                  validateAndParseAddress(
                    contract.contract_address
                  ).toLowerCase()
              );

            return {
              contractAddress: contract.contract_address,
              isBridgeable,
              media,
              name: contract.name ?? contract.symbol ?? "Unknown",
              totalBalance: contract.tokens_count,
            };
          }
        );

        return { collections, totalCount: contractsForOwner.total_count };
      } catch (error) {
        console.error("getL2NftCollectionsByWallet error: ", error);
        return { collections: [], totalCount: 0 };
      }
    }),

  getNftMetadataBatch: publicProcedure
    .input(
      z.object({
        contractAddress: z.string(),
        ownerAddress: z.string().optional(),
        tokenIds: z.array(z.string()),
      })
    )
    .query(async ({ input }) => {
      const { contractAddress, ownerAddress, tokenIds } = input;
      if (tokenIds.length === 0) {
        return [];
      }

      try {
        const nfts = await getL2NftsMetadataBatch(
          tokenIds.map((tokenId) => ({
            contract_address: contractAddress,
            token_id: tokenId,
          }))
        );

        return nfts.result
          .filter(
            (nft) =>
              ownerAddress === undefined ||
              validateAndParseAddress(nft.owner) ===
                validateAndParseAddress(ownerAddress)
          )
          .map((nft) => {
            const media = getMediaObjectFromUrl(nft.metadata?.normalized.image);

            return {
              collectionName: nft.contract_name,
              media,
              tokenId: nft.token_id,
              tokenName: nft.metadata?.normalized.name ?? `#${nft.token_id}`,
            };
          });
      } catch (error) {
        console.error("getL2NftMetadataBatch error:", error);
        return [];
      }
    }),

  getOwnerNftsFromCollection: publicProcedure
    .input(
      z.object({
        contractAddress: z.string().optional(),
        /**
         * cursor is the page key returned by the previous Alchemy request
         * It is used to fetch the next page
         */
        cursor: z.string().optional(),
        userAddress: z.string(),
      })
    )
    .query(async ({ input }) => {
      const {
        contractAddress,
        // cursor
        userAddress,
      } = input;

      try {
        const nfts = await getL2NftsForOwner(userAddress, contractAddress);

        const ownedNfts: Array<Nft> = nfts.result.map((nft) => {
          const media = getMediaObjectFromUrl(
            nft.metadata?.normalized.image ?? undefined
          );
          const name =
            nft.metadata?.normalized.name?.length ?? 0 > 0
              ? nft.metadata?.normalized?.name ?? ""
              : `${nft.token_id}`;

          return {
            contractAddress: nft.contract_address,
            media,
            name,
            tokenId: nft.token_id,
          };
        });

        return { ownedNfts, totalCount: nfts.total_count };
      } catch (error) {
        console.error("getL2OwnerNftsFromCollection error: ", error);
        return { ownedNfts: [], totalCount: 0 };
      }
    }),
});
