import { NextApiResponse, NextApiRequest } from 'next';

type Data = any;

type ResponseError = {
  message: string;
};

const TESTNET_URL = 'https://api-testnet.aspect.co/api/v0/assets';
const URL = 'https://api.aspect.co/api/v0/assets';

type AspectAsset = {
  token_id: string;
  name: string;
  image_medium_url_copy: string;
  contract: { name: string };
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data | ResponseError>,
) {
  const { query } = req;

  if (!query.address) {
    return res.status(404).json({ message: 'Address not found' });
  }

  const address = query.address as string;

  let nfts = [];

  try {
    const options = {
      method: 'GET',
      headers: { accept: 'application/json' },
    };
    const r = await fetch(`${TESTNET_URL}?owner_address=${address}`, options);
    const { assets } = await r.json();

    nfts = assets.map((asset: AspectAsset) => ({
      title: asset.name || `${asset.contract.name} #${asset.token_id}`,
      image: asset.image_medium_url_copy,
      tokenId: asset.token_id,
    }));
  } catch (error) {
    return res.status(500).json({ message: 'Server error' });
  }

  return res.status(200).json({ nfts });
}
