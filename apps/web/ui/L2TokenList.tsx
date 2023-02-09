'use client';

import { useAccount } from '@starknet-react/core';
import { useEffect, useState } from 'react';

export default function L2TokenList() {
  const [nfts, setNfts] = useState<any[]>([]);
  const { address } = useAccount();

  useEffect(() => {
    if (!address) {
      return;
    }

    async function fetchNfts() {
      const res = await fetch(`/api/l2-nfts/${address}`);
      const { nfts } = await res.json();
      setNfts(nfts);
    }

    fetchNfts();
  }, [address]);

  if (!nfts) {
    return null;
  }

  if (!address) {
    return <div className="font-medium">L2 wallet not connected</div>;
  }

  return (
    <div className="flex flex-col space-y-2">
      <div className="mb-4 font-medium">L2 Tokens</div>
      {nfts.map((nft) => (
        <div key={`${nft.title}-${nft.tokenId}`} className="flex space-x-2">
          <img src={nft.image} className="h-6 w-6" alt={nft.title} />
          <div className="">{nft.title}</div>
        </div>
      ))}
    </div>
  );
}
