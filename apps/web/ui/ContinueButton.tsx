'use client';

import { useContractWrite, usePrepareContractWrite } from 'wagmi';

import abi from '#/abi/abi.json';
import { FC, useEffect } from 'react';
import { ethers } from 'ethers';
import { NFT } from '#/types';

type ContinueButtonProps = {
  nft: NFT;
  l2Address: string;
  onSuccess: (t: `0x${string}` | undefined) => void;
};

const ContinueButton: FC<ContinueButtonProps> = (props) => {
  const { nft, l2Address, onSuccess } = props;
  const { config } = usePrepareContractWrite({
    address: process.env.NEXT_PUBLIC_L1_BRIDGE_ADDRESS as `0x${string}`,
    abi,
    functionName: 'deposit',
    args: [nft.contract, l2Address, nft.tokenId],
    overrides: {
      value: ethers.utils.parseEther('0.01'),
    },
  });
  const writeContract = useContractWrite(config);
  const { data, isLoading, isSuccess, write } = writeContract;

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
};

export default ContinueButton;
