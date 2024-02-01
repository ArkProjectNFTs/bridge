export type Nft = {
  contractAddress: string;
  image: string | undefined;
  name: string;
  tokenId: string;
};

export type Collection = {
  contractAddress: string;
  image: string | undefined;
  name: string;
  totalBalance: number;
};
