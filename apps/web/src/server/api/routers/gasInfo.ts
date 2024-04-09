import { createTRPCRouter, publicProcedure } from "../trpc";

interface EtherscanGasInfoResponse {
  result: {
    FastGasPrice: string;
    LastBlock: string;
    ProposeGasPrice: string;
    SafeGasPrice: string;
    gasUsedRatio: string;
    suggestBaseFee: string;
  };
}

export const gasInfoRouter = createTRPCRouter({
  getCurrentGasPrice: publicProcedure.query(async () => {
    const url = `${
      process.env.ETHERSCAN_API_DOMAIN ?? ""
    }?module=gastracker&action=gasoracle&apikey=${
      process.env.ETHERSCAN_API_KEY
    }`;

    try {
      const gasPriceResponse = await fetch(url, {
        headers: { "Content-Type": "application/json" },
      });

      const gasPrice =
        (await gasPriceResponse.json()) as EtherscanGasInfoResponse;

      return parseInt(gasPrice.result.SafeGasPrice);
    } catch (error) {
      console.error(error);
    }
  }),
});
