import { NextApiResponse, NextApiRequest } from 'next';
import { Alchemy, Network } from 'alchemy-sdk';

type Data = any;

type ResponseError = {
  message: string;
};

const alchemy = new Alchemy({
  apiKey: process.env.ALCHEMY_API_KEY,
  // network: Network.ETH_MAINNET,
  network: Network.ETH_GOERLI,
});

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data | ResponseError>,
) {
  const { query } = req;

  if (!query.address) {
    return res.status(404).json({ message: 'Address not found' });
  }

  const address = query.address as string;
  let nfts;

  try {
    const { ownedNfts } = await alchemy.nft.getNftsForOwner(
      address.toLowerCase(),
    );
    nfts = ownedNfts.map((nft) => ({
      title: nft.title,
      image: nft.media[0].thumbnail,
      tokenId: nft.tokenId,
      contract: nft.contract,
      // contractAddress: nft.contract,
    }));
  } catch (error) {
    return res.status(500).json({ message: 'Server error' });
  }

  return res.status(200).json({ nfts });
}
