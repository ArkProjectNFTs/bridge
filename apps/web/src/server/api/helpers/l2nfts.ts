import { Contract, RpcProvider, validateAndParseAddress } from "starknet";

import { type NftMedia } from "../types";

const requestsHeader = {
  "Content-Type": "application/json",
  "X-API-KEY": process.env.ARK_API_KEY ?? "",
};
const nftApiUrl = process.env.NEXT_PUBLIC_ARK_API_DOMAIN ?? "";

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
export async function getL2ContractsForOwner(address: string) {
  const url = `${nftApiUrl}/v1/owners/${validateAndParseAddress(
    address
  )}/contracts`;

  const contractsResponse = await fetch(url, {
    headers: requestsHeader,
  });
  const contracts =
    (await contractsResponse.json()) as ArkCollectionsApiResponse;

  return contracts;
}

type ArkBatchNftsApiResponse = {
  result: Array<{
    contract_address: string;
    contract_name: string;
    metadata?: { normalized: { image?: string; name?: string } };
    owner: string;
    token_id: string;
  }>;
};
export async function getL2NftsMetadataBatch(
  tokens: Array<{ contract_address: string; token_id: string }>
) {
  const url = `${nftApiUrl}/v1/tokens/batch`;

  const body = JSON.stringify({
    tokens: tokens.map((token) => ({
      contract_address: validateAndParseAddress(token.contract_address),
      token_id: token.token_id,
    })),
  });

  const nftsResponse = await fetch(url, {
    body,
    headers: requestsHeader,
    method: "POST",
  });

  const nfts = (await nftsResponse.json()) as ArkBatchNftsApiResponse;

  return nfts;
}

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
export async function getL2NftsForOwner(
  userAddress: string,
  contractAddress: string | undefined
) {
  const url = `${nftApiUrl}/v1/owners/${validateAndParseAddress(
    userAddress
  )}/tokens${
    contractAddress !== undefined
      ? `?contract_address=${validateAndParseAddress(contractAddress)}`
      : ""
  }`;

  const nftsResponse = await fetch(url, {
    headers: requestsHeader,
  });

  const nfts = (await nftsResponse.json()) as ArkNftsApiResponse;

  return nfts;
}

type ArkCollectionInfoApiResponse = {
  result: { contract_address: string; name: string; symbol: string };
};
export async function getL2ContractMetadata(contractAddress: string) {
  const url = `${nftApiUrl}/v1/contracts/${validateAndParseAddress(
    contractAddress
  )}`;

  const contractInfoResponse = await fetch(url, {
    headers: requestsHeader,
  });

  const contractInfo =
    (await contractInfoResponse.json()) as ArkCollectionInfoApiResponse;

  return contractInfo;
}

export async function getL2WhitelistedCollections() {
  const provider = new RpcProvider({
    nodeUrl: process.env.NEXT_PUBLIC_ALCHEMY_STARKNET_RPC_ENDPOINT,
  });
  const bridgeAddress = process.env.NEXT_PUBLIC_L2_BRIDGE_ADDRESS;

  if (bridgeAddress === undefined) {
    return undefined;
  }

  try {
    const { abi: bridgeAbi } = await provider.getClassAt(bridgeAddress);

    if (bridgeAbi === undefined) {
      return undefined;
    }

    const bridgeContract = new Contract(
      bridgeAbi,
      bridgeAddress,
      provider
    ) as unknown as {
      get_white_listed_collections: () => Promise<Array<string>>;
    };

    const whitelistedCollectionsResponse =
      await bridgeContract.get_white_listed_collections();

    return whitelistedCollectionsResponse.map((collection) =>
      validateAndParseAddress(collection)
    );
  } catch (error) {
    console.error(error);
    return undefined;
  }
}

export function getMediaObjectFromUrl(image: string | undefined): NftMedia {
  if (image === undefined) {
    return { format: "image", src: undefined };
  }
  const mediaSrc = image.replace("ipfs://", process.env.IPFS_GATEWAY ?? "");
  const mediaFormat = mediaSrc?.split(".").pop() === "mp4" ? "video" : "image";

  return { format: mediaFormat, src: mediaSrc };
}
