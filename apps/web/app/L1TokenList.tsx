'use client';

import { Fragment, useEffect, useState } from 'react';
import { useAccount } from 'wagmi';
import { useAccount as useStarkNetAccount } from '@starknet-react/core';
import { Dialog, Listbox, Transition } from '@headlessui/react';
import { ChevronUpDownIcon } from '@heroicons/react/24/solid';

import ContinueButton from '#/ui/ContinueButton';
import Image from 'next/image';

export default function L1TokenList() {
  const [nfts, setNfts] = useState<any[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [transaction, setTransaction] = useState<any>(null);
  const { address } = useAccount();
  const { address: l2Address } = useStarkNetAccount();
  const [selectedNft, setSelectedNft] = useState(
    nfts && nfts.length > 0 ? nfts[0] : null,
  );

  function closeModal() {
    setIsOpen(false);
  }

  function openModal() {
    setIsOpen(true);
  }

  function handleSuccess(t: `0x${string}` | undefined) {
    setSelectedNft(null);
    setTransaction(t);
    openModal();
  }

  useEffect(() => {
    if (!address) {
      return;
    }

    async function fetchNfts() {
      const res = await fetch(`/api/l1-nfts/${address}`);
      const { nfts } = await res.json();
      setNfts(nfts);
    }

    fetchNfts();
  }, [address]);

  if (!nfts) {
    return null;
  }

  if (!address) {
    return <div className="font-medium">L1 wallet not connected</div>;
  }

  return (
    <div className="">
      <div className="mb-4 font-medium">L1 Tokens</div>
      <div className="relative mb-4">
        <div className="">
          <Listbox value={selectedNft} onChange={setSelectedNft}>
            <Listbox.Button className="relative w-full cursor-default rounded-lg border border-gray-100 bg-white py-2 pl-3 pr-10 text-left focus:outline-none focus-visible:border-indigo-500 focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-opacity-75 focus-visible:ring-offset-2 focus-visible:ring-offset-orange-300 sm:text-sm">
              <div className="flex items-center space-x-4">
                {selectedNft && selectedNft.image && (
                  <Image
                    src={selectedNft.image}
                    alt={selectedNft.title}
                    className="h6 w-6"
                    width={20}
                    height={20}
                    priority
                  />
                )}
                <span className="truncate">
                  {selectedNft?.title || 'Select a token'}
                </span>
              </div>
              <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2">
                <ChevronUpDownIcon
                  className="h-5 w-5 text-gray-400"
                  aria-hidden="true"
                />
              </span>
            </Listbox.Button>
            <Transition
              as={Fragment}
              leave="transition ease-in duration-100"
              leaveFrom="opacity-100"
              leaveTo="opacity-0"
            >
              <Listbox.Options className="absolute mt-1 max-h-60 w-full overflow-auto rounded-md bg-white py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm">
                {nfts.map((nft) => (
                  <Listbox.Option
                    key={`${nft.title}-${nft.tokenId}`}
                    value={nft}
                    className={({ active }) =>
                      `relative flex cursor-default select-none items-center space-x-4 py-2 px-2 pr-4 ${
                        active ? 'bg-gray-100 text-indigo-500' : 'text-gray-900'
                      }`
                    }
                  >
                    {nft.image && (
                      <Image
                        src={nft.image}
                        alt={nft.title}
                        className="h6 w-6"
                        width={20}
                        height={20}
                        priority
                      />
                    )}
                    <div>{nft.title}</div>
                  </Listbox.Option>
                ))}
              </Listbox.Options>
            </Transition>
          </Listbox>
        </div>
      </div>
      <Transition appear show={isOpen} as={Fragment}>
        <Dialog as="div" className="relative z-10" onClose={closeModal}>
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-black bg-opacity-25" />
          </Transition.Child>

          <div className="fixed inset-0 overflow-y-auto">
            <div className="flex min-h-full items-center justify-center p-4 text-center">
              <Transition.Child
                as={Fragment}
                enter="ease-out duration-300"
                enterFrom="opacity-0 scale-95"
                enterTo="opacity-100 scale-100"
                leave="ease-in duration-200"
                leaveFrom="opacity-100 scale-100"
                leaveTo="opacity-0 scale-95"
              >
                <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all">
                  <Dialog.Title
                    as="h3"
                    className="text-lg font-medium leading-6 text-gray-900"
                  >
                    Transaction successfull
                  </Dialog.Title>
                  <div className="mt-2">
                    <p className="break-words text-sm text-gray-500">
                      Transaction hash: {transaction}
                    </p>
                  </div>

                  <div className="mt-4">
                    <button
                      type="button"
                      className="justify-center rounded-md border border-transparent bg-gray-100 px-4 py-2 text-sm font-medium"
                      onClick={closeModal}
                    >
                      Got it, thanks!
                    </button>
                  </div>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </Dialog>
      </Transition>
      {l2Address && selectedNft && (
        <ContinueButton
          nft={selectedNft}
          l2Address={l2Address}
          onSuccess={handleSuccess}
        />
      )}
    </div>
  );
}
