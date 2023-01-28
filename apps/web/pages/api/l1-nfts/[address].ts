import { NextApiResponse, NextApiRequest } from 'next';
import { Alchemy, Network } from 'alchemy-sdk';

type ResponseError = {
  message: string;
};

const alchemy = new Alchemy({
  apiKey: process.env.ALCHEMY_API_KEY,
  // network: Network.ETH_MAINNET,
  network: Network.ETH_GOERLI,
});

interface ApiResponseData {
  nfts: {
    title?: string;
    image?: string;
    tokenId: string;
    contract: string;
  }[];
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

    const nfts = ownedNfts.map((nft) => {
      return {
        title: nft.title || nft.contract.name,
        image:
          nft.media && nft.media.length > 0
            ? nft.media[0].thumbnail
            : undefined,
        tokenId: nft.tokenId,
        contract: nft.contract.address,
      };
    });

    return res.status(200).json({ nfts });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Server error' });
  }
}
