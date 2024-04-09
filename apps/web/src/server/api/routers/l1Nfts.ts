import { Alchemy, Network, NftFilters } from "alchemy-sdk";
import { createClient, getContract, http } from "viem";
import { mainnet, sepolia } from "viem/chains";
import { z } from "zod";

import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";

import l1_bridge_contract from "../../../app/_abis/bridge_l1_abi.json";
import { getMediaObjectFromAlchemyMedia } from "../helpers/l1nfts";
import { type Collection, type Nft } from "../types";

const viemClient = createClient({
  chain: process.env.NEXT_PUBLIC_ENVIRONMENT === "dev" ? sepolia : mainnet,
  transport: http(process.env.NEXT_PUBLIC_ALCHEMY_ETHEREUM_RPC_ENDPOINT ?? ""),
});

const bridgeL1Contract = getContract({
  abi: l1_bridge_contract,
  address: process.env.NEXT_PUBLIC_L1_BRIDGE_ADDRESS as `0x${string}`,
  client: viemClient,
});

const alchemy = new Alchemy({
  apiKey: process.env.ALCHEMY_API_KEY,
  network:
    process.env.NEXT_PUBLIC_ENVIRONMENT === "dev"
      ? Network.ETH_SEPOLIA
      : Network.ETH_MAINNET,
});

export const l1NftsRouter = createTRPCRouter({
  getCollectionInfo: publicProcedure
    .input(z.object({ contractAddress: z.string() }))
    .query(async ({ input }) => {
      const { contractAddress } = input;

      const { name } = await alchemy.nft.getContractMetadata(contractAddress);

      return { name: name ?? "" };
    }),

  getNftCollectionsByWallet: publicProcedure
    .input(
      z.object({
        address: z.string(),
        cursor: z.string().optional(),
        pageSize: z.number().min(1).max(100).optional(),
      })
    )
    .query(async ({ input }) => {
      const { address, cursor, pageSize } = input;
      const { contracts, pageKey, totalCount } =
        await alchemy.nft.getContractsForOwner(address.toLowerCase(), {
          excludeFilters: [NftFilters.SPAM],
          pageKey: cursor,
          pageSize,
        });

      const whitelistedCollections =
        (await bridgeL1Contract.read?.getWhiteListedCollections?.()) as
          | Array<string>
          | undefined;

      const collections: Array<Collection> = contracts.map((contract) => {
        const media = getMediaObjectFromAlchemyMedia(contract.media[0]);
        const isBridgeable =
          whitelistedCollections !== undefined &&
          whitelistedCollections.find(
            (whitelistedCollection) =>
              whitelistedCollection.toLowerCase() ===
              contract.address.toLocaleLowerCase()
          ) !== undefined;

        return {
          contractAddress: contract.address,
          isBridgeable,
          media,
          name: contract.name ?? contract.symbol ?? "Unknown",
          totalBalance: contract.totalBalance,
        };
      });

      return { collections, nextCursor: pageKey, totalCount };
    }),

  getNftMetadataBatch: publicProcedure
    .input(
      z.object({ contractAddress: z.string(), tokenIds: z.array(z.string()) })
    )
    .query(async ({ input }) => {
      const { contractAddress, tokenIds } = input;
      if (tokenIds.length === 0) {
        return [];
      }

      const response = await alchemy.nft.getNftMetadataBatch(
        tokenIds.map((tokenId) => ({
          contractAddress,
          tokenId,
        }))
      );

      return response.map((nft) => {
        const media = getMediaObjectFromAlchemyMedia(nft.media[0]);
        const tokenName = nft.title.length > 0 ? nft.title : `#${nft.tokenId}`;

        return {
          collectionName: nft.contract.name,
          media,
          tokenId: nft.tokenId,
          tokenName,
        };
      });
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
        pageSize: z.number().min(1).max(100).optional(),
        userAddress: z.string(),
      })
    )
    .query(async ({ input }) => {
      const { contractAddress, cursor, pageSize, userAddress } = input;
      const {
        ownedNfts: nfts,
        pageKey,
        totalCount,
      } = await alchemy.nft.getNftsForOwner(userAddress.toLowerCase(), {
        contractAddresses:
          contractAddress !== undefined ? [contractAddress] : undefined,
        excludeFilters: [NftFilters.SPAM],
        pageKey: cursor,
        pageSize,
      });

      const ownedNfts: Array<Nft> = nfts.map((nft) => {
        const media = getMediaObjectFromAlchemyMedia(nft.media[0]);
        const name =
          nft.title.length > 0
            ? nft.title
            : `${nft.title ?? nft.contract.name} #${nft.tokenId}`;

        return {
          contractAddress: nft.contract.address,
          media,
          name,
          tokenId: nft.tokenId,
        };
      });

      return { nextCursor: pageKey, ownedNfts, totalCount };
    }),
});
