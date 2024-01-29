import { Alchemy, Network, NftFilters } from "alchemy-sdk";
import { validateAndParseAddress } from "starknet";
import { isAddress } from "viem";
import { z } from "zod";

import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";

const alchemy = new Alchemy({
  apiKey: process.env.ALCHEMY_API_KEY,
  // network: Network.ETH_MAINNET,
  network: Network.ETH_GOERLI,
});

export type Nft = {
  collectionContractAddress: string;
  collectionName: string;
  id: string;
  image: string | undefined;
  title: string;
  tokenId: string;
};

const EthereumAddress = z.object({
  address: z.custom<string>((address) => {
    return isAddress(address as string);
  }, "Invalid Address"),
});

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

      console.log(contracts, pageKey, totalCount);

      return { contracts, nextCursor: pageKey, totalCount };
    }),

  getL1NftsByCollection: publicProcedure
    .input(EthereumAddress)
    .query(async ({ input }) => {
      const { address } = input;

      const { ownedNfts } = await alchemy.nft.getNftsForOwner(
        address.toLowerCase(),
        { excludeFilters: [NftFilters.SPAM] }
      );

      const rawNfts = ownedNfts
        // .filter(
        //   (nft) =>
        //     nft.contract.tokenType === "ERC721" ||
        //     nft.contract.tokenType === "ERC1155"
        // )
        .map((nft) => ({
          collectionContractAddress: nft.contract.address,
          collectionName:
            nft.contract.openSea?.collectionName ??
            nft.contract.name ??
            "No metadata",
          id: `${nft.contract.address}-${nft.tokenId}`,
          // TODO @YohanTz: Support videos
          image: nft.media[0]?.thumbnail ?? undefined,
          title: nft.title,
          tokenId: nft.tokenId,
        }));

      const nftsByCollection = rawNfts.reduce<Record<string, Array<Nft>>>(
        (acc, nft) => {
          if (acc[nft.collectionName] === undefined) {
            acc[nft.collectionName] = [];
          }

          acc[nft.collectionName]?.push(nft);
          return acc;
        },
        {}
      );

      return { byCollection: nftsByCollection, raw: rawNfts };
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
      const { ownedNfts, pageKey, totalCount } =
        await alchemy.nft.getNftsForOwner(userAddress.toLowerCase(), {
          contractAddresses:
            contractAddress !== undefined ? [contractAddress] : undefined,
          excludeFilters: [NftFilters.SPAM],
          pageKey: cursor,
        });

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
        const contracts = (await contractsResponse.json()) as {
          result: unknown;
        };

        return { contracts: contracts.result };
      } catch (error) {
        console.error("getL2NftCollectionsByWallet error: ", error);
        return [];
      }
    }),

  getL2NftsByCollection: publicProcedure
    .input(z.object({ address: z.string() }))
    .query(async ({ input }) => {
      const { address } = input;

      try {
        // TODO @YohanTz: Type env object

        const url = `${
          process.env.NEXT_PUBLIC_ARK_API_DOMAIN ?? ""
        }/v1/owners/${validateAndParseAddress(address)}/tokens`;

        const ownedNftsResponse = await fetch(url, {
          headers: {
            "Content-Type": "application/json",
            "X-API-KEY": "yW0akON1f55mOFwBPXPme4AFfLktbRiQ2GNdT1Mc",
          },
        });

        if (ownedNftsResponse.status !== 200) {
          return { byCollection: {}, raw: [] };
        }

        const ownedNfts = (await ownedNftsResponse.json()) as {
          result: Array<{
            contract_address: string;
            token_id: string;
          }>;
        };

        const rawNfts = ownedNfts.result.map((ownedNft) => {
          return {
            collectionContractAddress: ownedNft.contract_address,
            collectionName: "No metadata",
            id: `${ownedNft.contract_address}-${ownedNft.token_id}`,
            image: undefined,
            title: `#${ownedNft.token_id}`,
            tokenId: ownedNft.token_id,
          };
        });

        const nftsByCollection = rawNfts.reduce<Record<string, Array<Nft>>>(
          (acc, nft) => {
            if (acc[nft.collectionName] === undefined) {
              acc[nft.collectionName] = [];
            }

            acc[nft.collectionName]?.push(nft);
            return acc;
          },
          {}
        );

        return { byCollection: nftsByCollection, raw: rawNfts };
      } catch (err) {
        console.error("getL2NftsByCollection error: ", err);
        return { byCollection: {}, raw: [] };
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
        const nfts = (await nftsResponse.json()) as { result: unknown };

        return { nfts: nfts.result };
      } catch (error) {
        console.error("getL2NftCollectionsByWallet error: ", error);
        return [];
      }
    }),
  // getAll: publicProcedure.query(({ ctx }) => {
  //   return ctx.prisma.example.findMany();
  // }),
});
