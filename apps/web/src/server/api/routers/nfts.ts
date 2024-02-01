import { Alchemy, Network, NftFilters } from "alchemy-sdk";
import { validateAndParseAddress } from "starknet";
import { z } from "zod";

import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";

import { type Collection, type Nft } from "../types";

const alchemy = new Alchemy({
  apiKey: process.env.ALCHEMY_API_KEY,
  // network: Network.ETH_MAINNET,
  network: Network.ETH_GOERLI,
});

type ArkNftsApiResponse = {
  result: Array<{
    contract_address: string;
    metadata: {
      normalized: { image: null | string; name: null | string };
    } | null;
    owner: string;
    token_id: string;
  }>;
};

type ArkCollectionsApiResponse = {
  result: Array<{
    contract_address: string;
    contract_type: string;
    name: string;
    symbol: string;
  }>;
};

// const EthereumAddress = z.object({
//   address: z.custom<string>((address) => {
//     return isAddress(address as string);
//   }, "Invalid Address"),
// });

export const nftsRouter = createTRPCRouter({
  getL1NftCollectionsByWallet: publicProcedure
    .input(z.object({ address: z.string(), cursor: z.string().optional() }))
    .query(async ({ input }) => {
      const { address, cursor } = input;
      const { contracts, pageKey, totalCount } =
        await alchemy.nft.getContractsForOwner(address.toLowerCase(), {
          excludeFilters: [NftFilters.SPAM],
          pageKey: cursor,
        });

      const collections: Array<Collection> = contracts.map((contract) => ({
        contractAddress: contract.address,
        image: contract.media[0]?.thumbnail,
        name: contract.name ?? contract.symbol ?? "Unknown",
        totalBalance: contract.totalBalance,
      }));

      return { collections, nextCursor: pageKey, totalCount };
    }),

  getL1OwnerNftsFromCollection: publicProcedure
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
      const { contractAddress, cursor, userAddress } = input;
      const {
        ownedNfts: nfts,
        pageKey,
        totalCount,
      } = await alchemy.nft.getNftsForOwner(userAddress.toLowerCase(), {
        contractAddresses:
          contractAddress !== undefined ? [contractAddress] : undefined,
        excludeFilters: [NftFilters.SPAM],
        pageKey: cursor,
      });

      // TODO @YohanTz: Handle videos
      const ownedNfts: Array<Nft> = nfts.map((nft) => ({
        contractAddress: nft.contract.address,
        image: nft.media[0]?.thumbnail,
        name:
          nft.title.length > 0
            ? nft.title
            : `${nft.title ?? nft.contract.name} #${nft.tokenId}`,
        tokenId: nft.tokenId,
      }));

      // TODO @YohanTz: Filter spam NFTs
      return { nextCursor: pageKey, ownedNfts, totalCount };
    }),

  getL2NftCollectionsByWallet: publicProcedure
    .input(z.object({ address: z.string(), cursor: z.string().optional() }))
    .query(async ({ input }) => {
      const { address, cursor } = input;

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
            name: contract.name ?? contract.symbol,
            totalBalance: 0,
          })
        );

        return { collections };
      } catch (error) {
        console.error("getL2NftCollectionsByWallet error: ", error);
        return { collections: [] };
      }
    }),

  getL2OwnerNftsFromCollection: publicProcedure
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
      const { contractAddress, cursor, userAddress } = input;

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

        return { ownedNfts };
      } catch (error) {
        console.error("getL2NftCollectionsByWallet error: ", error);
        return { ownedNfts: [] };
      }
    }),
  // getAll: publicProcedure.query(({ ctx }) => {
  //   return ctx.prisma.example.findMany();
  // }),
});
