import { validateAndParseAddress } from "starknet";
import { z } from "zod";

import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";

import { type Collection, type Nft } from "../types";

type ArkNftsApiResponse = {
  result: Array<{
    contract_address: string;
    metadata: {
      normalized: { image: null | string; name: null | string };
    } | null;
    owner: string;
    token_id: string;
  }>;
  total_count: number;
};

type ArkCollectionsApiResponse = {
  result: Array<{
    contract_address: string;
    contract_type: string;
    image?: string;
    name: string;
    symbol: string;
    tokens_count: number;
  }>;
  total_count: number;
};

type ArkBatchNftsApiResponse = {
  result: Array<{
    contract_address: string;
    metadata?: { normalized: { image?: string; name?: string } };
    owner: string;
    token_id: string;
  }>;
};

type ArkCollectionInfoApiResponse = {
  result: { contract_address: string; name: string; symbol: string };
};

export const l2NftsRouter = createTRPCRouter({
  getCollectionInfo: publicProcedure
    .input(z.object({ contractAddress: z.string() }))
    .query(async ({ input }) => {
      const { contractAddress } = input;

      try {
        const url = `${
          process.env.NEXT_PUBLIC_ARK_API_DOMAIN ?? ""
        }/v1/contracts/${validateAndParseAddress(contractAddress)}`;

        const contractInfoResponse = await fetch(url, {
          headers: {
            "Content-Type": "application/json",
            "X-API-KEY": process.env.ARK_API_KEY ?? "",
          },
        });

        const contractInfo =
          (await contractInfoResponse.json()) as ArkCollectionInfoApiResponse;

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
        const url = `${
          process.env.NEXT_PUBLIC_ARK_API_DOMAIN ?? ""
        }/v1/owners/${validateAndParseAddress(address)}/contracts`;

        const contractsResponse = await fetch(url, {
          headers: {
            "Content-Type": "application/json",
            "X-API-KEY": process.env.ARK_API_KEY ?? "",
          },
        });
        const contracts =
          (await contractsResponse.json()) as ArkCollectionsApiResponse;

        const collections: Array<Collection> = contracts.result.map(
          (contract) => ({
            contractAddress: contract.contract_address,
            image: contract.image,

            isBridgeable:
              contract.contract_address ===
              process.env.EVERAI_L2_CONTRACT_ADDRESS,
            name: contract.name ?? contract.symbol,
            totalBalance: contract.tokens_count,
          })
        );

        return { collections, totalCount: contracts.total_count };
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
        const url = `${
          process.env.NEXT_PUBLIC_ARK_API_DOMAIN ?? ""
        }/v1/tokens/batch`;

        const nftsResponse = await fetch(url, {
          body: JSON.stringify({
            tokens: tokenIds.map((tokenId) => ({
              contract_address: validateAndParseAddress(contractAddress),
              token_id: tokenId,
            })),
          }),
          headers: {
            "Content-Type": "application/json",
            "X-API-KEY": process.env.ARK_API_KEY ?? "",
          },
          method: "POST",
        });

        const nfts = (await nftsResponse.json()) as ArkBatchNftsApiResponse;

        return nfts.result
          .filter(
            (nft) =>
              ownerAddress === undefined ||
              validateAndParseAddress(nft.owner) ===
                validateAndParseAddress(ownerAddress)
          )
          .map((nft) => ({
            collectionName: "EveraiDuo",
            image: nft.metadata?.normalized.image,
            tokenId: nft.token_id,
            tokenName: nft.metadata?.normalized.name ?? `#${nft.token_id}`,
          }));
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
        const url = `${
          process.env.NEXT_PUBLIC_ARK_API_DOMAIN ?? ""
        }/v1/owners/${validateAndParseAddress(userAddress)}/tokens${
          contractAddress !== undefined
            ? `?contract_address=${validateAndParseAddress(contractAddress)}`
            : ""
        }`;

        const nftsResponse = await fetch(url, {
          headers: {
            "Content-Type": "application/json",
            "X-API-KEY": process.env.ARK_API_KEY ?? "",
          },
        });

        const nfts = (await nftsResponse.json()) as ArkNftsApiResponse;

        const ownedNfts: Array<Nft> = nfts.result.map((nft) => ({
          contractAddress: nft.contract_address,
          image: nft.metadata?.normalized.image ?? undefined,
          name:
            nft.metadata?.normalized.name?.length ?? 0 > 0
              ? nft.metadata?.normalized?.name ?? ""
              : `${nft.token_id}`,
          tokenId: nft.token_id,
        }));

        return { ownedNfts, totalCount: nfts.total_count };
      } catch (error) {
        console.error("getL2OwnerNftsFromCollection error: ", error);
        return { ownedNfts: [], totalCount: 0 };
      }
    }),
});
