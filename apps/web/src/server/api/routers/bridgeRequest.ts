import { Alchemy, Network } from "alchemy-sdk";
import { z } from "zod";

import { type Chain } from "~/app/_types";
import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";

import { getMediaObjectFromAlchemyMedia } from "../helpers/l1nfts";
import {
  getL2NftsMetadataBatch,
  getMediaObjectFromUrl,
} from "../helpers/l2nfts";
import { type NftMedia } from "../types";

const alchemy = new Alchemy({
  apiKey: process.env.ALCHEMY_API_KEY,
  network:
    process.env.NEXT_PUBLIC_ENVIRONMENT === "dev"
      ? Network.ETH_SEPOLIA
      : Network.ETH_MAINNET,
  // network: Network.ETH_SEPOLIA,
});

export type BridgeRequestEventStatus =
  | "deposit_initiated_l1"
  | "deposit_initiated_l2"
  | "error"
  | "withdraw_available_l1"
  | "withdraw_completed_l1"
  | "withdraw_completed_l2";

type BridgeRequestApiResponse = Array<{
  events: Array<{
    block_number: number;
    block_timestamp: number;
    label: BridgeRequestEventStatus;
    req_hash: string;
    tx_hash: string;
  }>;
  req: {
    chain_src: "eth" | "sn";
    collection_dst: string;
    collection_src: string;
    content: string;
    from: string;
    hash: string;
    to: string;
  };
  token_ids: [string, ...Array<string>];
}>;

type BridgeRequestResponse = {
  arrivalAddress: string;
  arrivalChain: Chain;
  arrivalTimestamp?: number;
  collectionMedia: NftMedia;
  collectionName: string;
  collectionSourceAddress: string;
  requestContent: Array<string>;
  status: BridgeRequestEventStatus;
  statusTimestamp: number;
  tokenIds: Array<string>;
  totalCount: number;
  txHash?: string;
};

export const bridgeRequestRouter = createTRPCRouter({
  getBridgeRequestsFromAddress: publicProcedure
    .input(z.object({ address: z.string() }))
    .query(
      async ({
        input,
      }): Promise<{
        inTransit: {
          requests: Array<BridgeRequestResponse>;
          totalCount: number;
        };
        past: { requests: Array<BridgeRequestResponse>; totalCount: number };
      }> => {
        const { address } = input;

        const url = `${
          process.env.NEXT_PUBLIC_ARKLANE_API_DOMAIN ?? ""
        }/requests/${address}`;

        const bridgeRequestsResponse = await fetch(url, {
          headers: {
            "Content-Type": "application/json",
          },
        });

        if (bridgeRequestsResponse.status !== 200) {
          return {
            inTransit: { requests: [], totalCount: 0 },
            past: { requests: [], totalCount: 0 },
          };
        }

        const bridgeRequests =
          (await bridgeRequestsResponse.json()) as BridgeRequestApiResponse;

        if (bridgeRequests.length === 0) {
          return {
            inTransit: { requests: [], totalCount: 0 },
            past: { requests: [], totalCount: 0 },
          };
        }

        let requestMetadataByReqHash: Record<
          string,
          { contractName: string; media: NftMedia }
        > = {};

        if (bridgeRequests[0]?.req.chain_src === "eth") {
          const requestMetadatas = await alchemy.nft.getNftMetadataBatch(
            bridgeRequests.reverse().map((bridgeRequest) => ({
              contractAddress: bridgeRequest.req.collection_src,
              tokenId: bridgeRequest.token_ids[0],
            }))
          );

          requestMetadataByReqHash = requestMetadatas.reduce((acc, current) => {
            return {
              ...acc,
              [`${current.tokenId}`]: {
                contractName: current.contract.name,
                media: getMediaObjectFromAlchemyMedia(current.media[0]),
              },
            };
          }, {});
        } else {
          const bridgeRequestsTokens = bridgeRequests.map((bridgeRequest) => ({
            contract_address: bridgeRequest.req.collection_src,
            token_id: bridgeRequest.token_ids[0],
          }));
          const requestMetadatas = await getL2NftsMetadataBatch(
            Object.values(
              bridgeRequestsTokens.reduce((acc, token) => {
                acc[token.token_id] = token;
                return acc;
              }, {} as Record<string, { contract_address: string; token_id: string }>)
            )
          );
          requestMetadataByReqHash = requestMetadatas.result.reduce(
            (acc, current) => {
              return {
                ...acc,
                [`${current.token_id}`]: {
                  contractName: current.contract_name,
                  media: getMediaObjectFromUrl(
                    current.metadata?.normalized.image
                  ),
                },
              };
            },
            {}
          );
        }

        const bridgeRequestsWithMetadata = bridgeRequests.map(
          (bridgeRequest) => {
            const lastBridgeRequestEvent =
              bridgeRequest.events[bridgeRequest.events.length - 1];
            const isArrived =
              lastBridgeRequestEvent?.label === "withdraw_available_l1" ||
              lastBridgeRequestEvent?.label === "withdraw_completed_l1" ||
              lastBridgeRequestEvent?.label === "withdraw_completed_l2";
            const requestMetadata =
              requestMetadataByReqHash[`${bridgeRequest.token_ids[0]}`];
            const collectionMedia = requestMetadata?.media ?? {
              format: "image",
              src: undefined,
            };
            const collectionName = requestMetadata?.contractName ?? "Unknown";

            return {
              arrivalAddress: bridgeRequest.req.to,
              arrivalChain:
                bridgeRequest.req.chain_src === "eth"
                  ? "Starknet"
                  : ("Ethereum" as Chain),
              arrivalTimestamp: isArrived
                ? lastBridgeRequestEvent?.block_timestamp
                : undefined,
              collectionMedia,
              collectionName,
              collectionSourceAddress: bridgeRequest.req.collection_src,
              requestContent: JSON.parse(
                bridgeRequest.req.content
              ) as Array<string>,
              status: lastBridgeRequestEvent?.label ?? "error",
              statusTimestamp: lastBridgeRequestEvent?.block_timestamp ?? 0,
              tokenIds: bridgeRequest.token_ids,
              totalCount: bridgeRequest.token_ids.length,
              txHash: lastBridgeRequestEvent?.tx_hash,
            };
          }
        );

        const inTransitRequests: Array<BridgeRequestResponse> = [];
        const pastRequests: Array<BridgeRequestResponse> = [];

        bridgeRequestsWithMetadata.forEach((request) => {
          if (
            request.status === "deposit_initiated_l2" ||
            request.status === "deposit_initiated_l1"
          ) {
            inTransitRequests.push(request);
          } else {
            pastRequests.push(request);
          }
        });

        const inTransitTotalNfts = inTransitRequests.reduce(
          (acc, current) => acc + current.tokenIds.length,
          0
        );
        const pastTotalNfts = pastRequests.reduce(
          (acc, current) => acc + current.tokenIds.length,
          0
        );

        return {
          inTransit: {
            requests: inTransitRequests,
            totalCount: inTransitTotalNfts,
          },
          past: { requests: pastRequests, totalCount: pastTotalNfts },
        };
      }
    ),
  getHasBridgeRequestIndexed: publicProcedure
    .input(z.object({ transactionHash: z.string() }))
    .query(async ({ input }): Promise<boolean> => {
      const { transactionHash } = input;

      const bridgeRequestIndexedResponse = await fetch(
        `${
          process.env.NEXT_PUBLIC_ARKLANE_API_DOMAIN ?? ""
        }/tx/${transactionHash}`,
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (bridgeRequestIndexedResponse.status !== 200) {
        return false;
      }

      return true;
    }),
});
