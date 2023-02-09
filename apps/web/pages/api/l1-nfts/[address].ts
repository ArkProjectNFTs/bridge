import { NextApiResponse, NextApiRequest } from 'next';
import { Alchemy, Network, OwnedNft } from 'alchemy-sdk';

type ResponseError = {
  message: string;
};

const alchemy = new Alchemy({
  apiKey: process.env.ALCHEMY_API_KEY,
  // network: Network.ETH_MAINNET,
  network: Network.ETH_GOERLI,
});

interface ApiResponseData {
  nfts: OwnedNft[];
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ApiResponseData | ResponseError>,
) {
  const { query } = req;

  if (!query.address) {
    return res.status(404).json({ message: 'Address not found' });
  }

  const address = query.address as string;

  try {
    const { ownedNfts } = await alchemy.nft.getNftsForOwner(
      address.toLowerCase(),
    );

    let nfts: OwnedNft[] = [];
    for await (const nft of alchemy.nft.getNftsForOwnerIterator(
      address.toLowerCase(),
    )) {
      nfts.push(nft);
    }

    return res.status(200).json({ nfts });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Server error' });
  }
}
