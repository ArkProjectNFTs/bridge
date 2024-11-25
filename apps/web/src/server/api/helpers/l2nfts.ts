import { Contract, RpcProvider, validateAndParseAddress } from "starknet";

import { type NftMedia } from "../types";

const requestsHeader = {
  "Content-Type": "application/json",
  "X-API-KEY": process.env.ARK_API_KEY ?? "",
};
const nftApiUrl = process.env.NEXT_PUBLIC_ARK_API_DOMAIN ?? "";

type PortfolioApiResponse = {
  data: Array<{
    best_offer: null | string;
    collection_address: string;
    collection_name: string;
    currency_address: string;
    floor: string;
    list_price: string;
    metadata?: {
      animation_key: null | string;
      animation_mime_type: null | string;
      animation_url: null | string;
      attributes: null | string;
      background_color: null | string;
      description: null | string;
      external_url: null | string;
      image: null | string;
      image_data: null | string;
      image_key: null | string;
      image_mime_type: null | string;
      name: null | string;
      youtube_url: null | string;
    };
    token_id: string;
  }>;
  token_count: number;
};
export async function getL2ContractsForOwner(address: string) {
  const url = `${nftApiUrl}/portfolio/${validateAndParseAddress(address)}`;

  const contractsResponse = await fetch(url, {
    headers: requestsHeader,
  });
  const apiResponse = (await contractsResponse.json()) as PortfolioApiResponse;

  return apiResponse;
}

type TokenApiResponse = {
  data: Array<{
    collection_address: string;
    collection_image: null | string;
    collection_name: null | string;
    metadata: {
      animation_key: null | string;
      animation_mime_type: null | string;
      animation_url: null | string;
      background_color: null | string;
      description: null | string;
      external_url: null | string;
      image: null | string;
      image_data: null | string;
      image_key: null | string;
      image_key_540_540: null | string;
      image_mime_type: null | string;
      name: null | string;
      youtube_url: null | string;
    };
    owner: string;
    token_id: string;
  }>;
};

export async function getL2NftsMetadataBatch(
  tokens: Array<{ contract_address: string; token_id: string }>
) {

  let nfts: {
    collection_address: string;
    collection_image: null | string;
    collection_name: null | string;
    metadata: {
      animation_key: null | string;
      animation_mime_type: null | string;
      animation_url: null | string;
      background_color: null | string;
      description: null | string;
      external_url: null | string;
      image: null | string;
      image_data: null | string;
      image_key: null | string;
      image_key_540_540: null | string;
      image_mime_type: null | string;
      name: null | string;
      youtube_url: null | string;
    };
    owner: string;
    token_id: string;
  }[] = [];

  for (const token of tokens) {
    const url = `${nftApiUrl}/tokens/${token.contract_address}/0x534e5f4d41494e/${token.token_id}`;
    const nftsResponse = await fetch(url, {
      headers: requestsHeader,
      method: "GET",
    });

    const response = (await nftsResponse.json()) as TokenApiResponse;
    nfts = nfts.concat(response.data);
  }

  return nfts;
}

export async function getL2NftsForOwner(
  userAddress: string,
  contractAddress: string | undefined
) {
  const url = `${nftApiUrl}/portfolio/${validateAndParseAddress(userAddress)}`;

  const nftsResponse = await fetch(url, {
    headers: requestsHeader,
  });

  const nfts = (await nftsResponse.json()) as PortfolioApiResponse;

  return {
    data: contractAddress
      ? nfts.data.filter(
          (d) =>
            d.collection_address === validateAndParseAddress(contractAddress)
        )
      : nfts.data,
    token_count: nfts.token_count,
  };
}

type ArkCollectionInfoApiResponse = {
  data: {
    address: string;
    description: null | string;
    image: null | string;
    name: null | string;
  };
};
export async function getL2ContractMetadata(contractAddress: string) {
  const url = `${nftApiUrl}/collections/${validateAndParseAddress(
    contractAddress
  )}/0x534e5f4d41494e`;

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

export function getMediaObjectFromUrl(
  image: null | string | undefined
): NftMedia {
  if (image === undefined) {
    return { format: "image", src: undefined };
  }
  const mediaSrc = image?.replace("ipfs://", process.env.IPFS_GATEWAY ?? "");
  const mediaFormat = mediaSrc?.split(".").pop() === "mp4" ? "video" : "image";

  return { format: mediaFormat, src: mediaSrc };
}
