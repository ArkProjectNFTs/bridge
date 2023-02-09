'use client';

import { Fragment, useEffect, useState } from 'react';
import { useAccount } from 'wagmi';
import { useAccount as useStarkNetAccount } from '@starknet-react/core';
import { Dialog, Listbox, Transition, Combobox } from '@headlessui/react';
import { CheckIcon, ChevronUpDownIcon } from '@heroicons/react/24/solid';

import ContinueButton from '#/ui/ContinueButton';
import Image from 'next/image';
import { OwnedNft } from 'alchemy-sdk';

export default function L1TokenList() {
  const [nfts, setNfts] = useState<OwnedNft[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [transaction, setTransaction] = useState<any>(null);
  const { address } = useAccount();
  const { address: l2Address } = useStarkNetAccount();
  const [selectedNft, setSelectedNft] = useState<OwnedNft | null>(
    nfts && nfts.length > 0 ? nfts[0] : null,
  );

  const [query, setQuery] = useState('');

  const filteredNFTs =
    query === ''
      ? nfts
      : nfts.filter((nft) => {
          return `${(
            nft.contract.name || ''
          ).toLowerCase()} #${nft.tokenId.toLowerCase()}`.includes(
            query.toLowerCase(),
          );
        });

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

      if (nfts && nfts.length) {
        setNfts(nfts);
      }
    }

    fetchNfts();
  }, [address]);

  if (!nfts.length) {
    return <div className="font-medium">L1 wallet has no tokens</div>;
  }

  if (!address) {
    return <div className="font-medium">L1 wallet not connected</div>;
  }

  return (
    <div className="">
      <div className="mb-4 font-medium">L1 Tokens</div>
      <div className="relative mb-4">
        <div>
          <Combobox value={selectedNft} onChange={setSelectedNft}>
            <div className="relative mt-1">
              <div className="relative w-full cursor-default overflow-hidden rounded-lg bg-white text-left shadow-md focus:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-opacity-75 focus-visible:ring-offset-2 focus-visible:ring-offset-teal-300 sm:text-sm">
                <Combobox.Input
                  className="w-full border-none py-2 pl-3 pr-10 text-sm leading-5 text-gray-900 focus:ring-0"
                  displayValue={(nft) =>
                    nft
                      ? `${(nft as any as OwnedNft).contract.name} #${
                          (nft as any as OwnedNft).tokenId
                        }`
                      : ''
                  }
                  onChange={(event) => setQuery(event.target.value)}
                />
                <Combobox.Button className="absolute inset-y-0 right-0 flex items-center pr-2">
                  <ChevronUpDownIcon
                    className="h-5 w-5 text-gray-400"
                    aria-hidden="true"
                  />
                </Combobox.Button>
              </div>
              <Transition
                as={Fragment}
                leave="transition ease-in duration-100"
                leaveFrom="opacity-100"
                leaveTo="opacity-0"
                afterLeave={() => setQuery('')}
              >
                <Combobox.Options className="absolute mt-1 max-h-60 w-full overflow-auto rounded-md bg-white py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm">
                  {filteredNFTs.length === 0 && query !== '' ? (
                    <div className="relative cursor-default select-none py-2 px-4 text-gray-700">
                      Nothing found.
                    </div>
                  ) : (
                    filteredNFTs.map((nft) => (
                      <Combobox.Option
                        key={`${nft.contract.address}-#${nft.tokenId}`}
                        className={({ active }) =>
                          `relative cursor-default select-none py-2 pl-10 pr-4 ${
                            active ? 'bg-teal-600 text-white' : 'text-gray-900'
                          }`
                        }
                        value={nft}
                      >
                        {({ selected, active }) => (
                          <>
                            <span
                              className={`block truncate ${
                                selected ? 'font-medium' : 'font-normal'
                              }`}
                            >
                              {nft.contract.name} #{nft.tokenId}
                            </span>
                            {selected ? (
                              <span
                                className={`absolute inset-y-0 left-0 flex items-center pl-3 ${
                                  active ? 'text-white' : 'text-teal-600'
                                }`}
                              >
                                <CheckIcon
                                  className="h-5 w-5"
                                  aria-hidden="true"
                                />
                              </span>
                            ) : null}
                          </>
                        )}
                      </Combobox.Option>
                    ))
                  )}
                </Combobox.Options>
              </Transition>
            </div>
          </Combobox>
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
        <div>
          <ContinueButton
            nft={selectedNft}
            l2Address={l2Address}
            onSuccess={handleSuccess}
          />
          <div>{selectedNft.contract.address}</div>
        </div>
      )}
    </div>
  );
}
