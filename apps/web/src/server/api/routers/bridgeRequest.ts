import { z } from "zod";

import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";

export type BridgeRequestEventStatus =
  | "deposit_initiated_l1"
  | "deposit_initiated_l2"
  | "error"
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
}>;

type BridgeRequestResponse = {
  sourceCollection: string;
  status: BridgeRequestEventStatus;
  statusTimestamp: number;
};

export const bridgeRequestRouter = createTRPCRouter({
  getBridgeRequestsFromAddress: publicProcedure
    .input(z.object({ address: z.string() }))
    .query(async ({ input }): Promise<Array<BridgeRequestResponse>> => {
      const { address } = input;

      const bridgeRequestsResponse = await fetch(
        `${
          process.env.NEXT_PUBLIC_STARKLANE_API_DOMAIN ?? ""
        }/requests/${address}`,
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (bridgeRequestsResponse.status !== 200) {
        return [];
      }

      const bridgeRequests =
        (await bridgeRequestsResponse.json()) as BridgeRequestApiResponse;

      return bridgeRequests.map((bridgeRequest) => {
        const lastBridgeRequestEvent =
          bridgeRequest.events[bridgeRequest.events.length - 1];
        console.log(bridgeRequest.req.hash);
        return {
          // sourceCollection: bridgeRequest.req.collection_src ?? "",
          sourceCollection: bridgeRequest.req.hash ?? "",
          status: lastBridgeRequestEvent?.label ?? "error",
          statusTimestamp: lastBridgeRequestEvent?.block_timestamp ?? 0,
        };
      });
    }),
  // getAll: publicProcedure.query(({ ctx }) => {
  //   return ctx.prisma.example.findMany();
  // }),
});
