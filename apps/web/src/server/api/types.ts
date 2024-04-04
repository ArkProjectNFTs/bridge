export type NftMedia = { format: string; src: string | undefined };

export type Nft = {
  contractAddress: string;
  media: NftMedia;
  name: string;
  tokenId: string;
};

export type Collection = {
  contractAddress: string;
  isBridgeable: boolean;
  media: NftMedia;
  name: string;
  totalBalance: number;
};
