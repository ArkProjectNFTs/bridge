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
    name: string;
    symbol: string;
    tokens_count: number;
  }>;
  total_count: number;
};

export const l2NftsRouter = createTRPCRouter({
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
            image: undefined,
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
