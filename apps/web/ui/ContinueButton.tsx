'use client';

import { useContractWrite, usePrepareContractWrite } from 'wagmi';

import abi from '#/abi/abi.json';
import { useEffect } from 'react';

type ContinueButtonProps = {
  nft: any;
  l2Address: string;
  onSuccess: (t: `0x${string}` | undefined) => void;
};

export default function ContinueButton({
  nft,
  l2Address,
  onSuccess,
}: ContinueButtonProps) {
  const { config } = usePrepareContractWrite({
    address: '0xD0d5f4b5308CeFa87630cD2D9Fe808F974116616',
    abi,
    functionName: 'claim',
    args: [nft.contract.address, nft.tokenId, l2Address, 1],
  });
  const { data, isLoading, isSuccess, write } = useContractWrite(config);

  const handleClick = () => {
    if (write) {
      write();
    }
  };

  useEffect(() => {
    if (isSuccess) {
      onSuccess(data?.hash);
    }
  }, [isSuccess]);

  return (
    <>
      <button
        disabled={!write}
        onClick={handleClick}
        className="w-full rounded-lg bg-indigo-600 px-3 py-2 text-sm font-medium leading-4 text-white"
      >
        {isLoading ? 'Loading...' : 'Continue'}
      </button>
    </>
  );
}
