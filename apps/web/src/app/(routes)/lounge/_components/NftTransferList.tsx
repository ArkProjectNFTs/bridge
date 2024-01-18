"use client";

import * as Toolbar from "@radix-ui/react-toolbar";
import { Typography } from "design-system";
import Image from "next/image";
import { useState } from "react";

import NftsEmptyState from "~/app/_components/NftsEmptyState";
import NftsLoadingState from "~/app/_components/NftsLoadingState";
import useAccountFromChain from "~/app/_hooks/useAccountFromChain";
import useCurrentChain from "~/app/_hooks/useCurrentChain";
import { api } from "~/utils/api";

import NftTransferCard from "./NftTransferCard";

export default function NftTransferList() {
  const [displayOption, setDisplayOption] = useState("card");
  const { targetChain } = useCurrentChain();
  const { address } = useAccountFromChain(targetChain);

  const { data: bridgeRequestData } =
    api.bridgeRequest.getBridgeRequestsFromAddress.useQuery(
      {
        address: address ?? "",
      },
      { enabled: address !== undefined, refetchInterval: 3000 }
    );

  if (bridgeRequestData === undefined) {
    return <NftsLoadingState className="mt-9 sm:mt-23" />;
  }

  return bridgeRequestData.length === 0 ? (
    <>
      <NftsEmptyState className="mt-9 sm:mt-23" />
      <Typography
        className="mt-5 sm:mt-16"
        component="p"
        variant="body_text_18"
      >
        There is nothing there...
      </Typography>
    </>
  ) : (
    <div className="mb-6 mt-9 sm:mt-18">
      <div className="flex justify-between">
        <Typography variant="button_text_l">
          Nfts in transit ({bridgeRequestData.length})
        </Typography>
        <Toolbar.Root>
          <Toolbar.ToggleGroup
            onValueChange={(value) => {
              if (value) {
                setDisplayOption(value);
              }
            }}
            aria-label="Display options"
            className="hidden overflow-hidden rounded-md border border-[#d3e2e1] dark:border-dark-blue-600 sm:flex"
            type="single"
            value={displayOption}
          >
            <Toolbar.ToggleItem
              className="group grid place-items-center border-r border-[#d3e2e1] px-2 py-1.5 data-[state=on]:bg-[#e4edec] dark:border-dark-blue-600  dark:data-[state=on]:bg-dark-blue-900"
              value="card"
            >
              <svg
                className="stroke-[#3c607c] dark:stroke-dark-blue-600 dark:group-data-[state=on]:stroke-dark-blue-300"
                fill="none"
                height="20"
                viewBox="0 0 20 20"
                width="20"
                xmlns="http://www.w3.org/2000/svg"
              >
                <g id="ArkIcons_small">
                  <rect
                    height="5.625"
                    id="Rectangle 5592"
                    rx="1.25"
                    strokeWidth="1.25"
                    width="5.625"
                    x="2.5"
                    y="2.5"
                  />
                  <rect
                    height="5.625"
                    id="Rectangle 5594"
                    rx="1.25"
                    strokeWidth="1.25"
                    width="5.625"
                    x="2.5"
                    y="11.875"
                  />
                  <rect
                    height="5.625"
                    id="Rectangle 5593"
                    rx="1.25"
                    strokeWidth="1.25"
                    width="5.625"
                    x="11.875"
                    y="2.5"
                  />
                  <rect
                    height="5.625"
                    id="Rectangle 5595"
                    rx="1.25"
                    strokeWidth="1.25"
                    width="5.625"
                    x="11.875"
                    y="11.875"
                  />
                </g>
              </svg>
            </Toolbar.ToggleItem>
            <Toolbar.ToggleItem
              className="group grid place-items-center px-2 py-1.5 data-[state=on]:bg-[#e4edec] dark:data-[state=on]:bg-dark-blue-900"
              value="list"
            >
              <svg
                className="fill-[#3c607c] stroke-[#3c607c] dark:fill-dark-blue-600 dark:stroke-dark-blue-600 dark:group-data-[state=on]:fill-dark-blue-300 dark:group-data-[state=on]:stroke-dark-blue-300"
                fill="none"
                height="20"
                viewBox="0 0 20 20"
                width="20"
                xmlns="http://www.w3.org/2000/svg"
              >
                <g id="ArkIcons_small">
                  <rect
                    height="2.5"
                    id="Rectangle 5593"
                    rx="0.625"
                    stroke="none"
                    width="2.5"
                    x="1.25"
                    y="15"
                  />
                  <rect
                    height="2.5"
                    id="Rectangle 5594"
                    rx="0.625"
                    stroke="none"
                    width="2.5"
                    x="1.25"
                    y="8.75"
                  />
                  <rect
                    height="2.5"
                    id="Rectangle 5595"
                    rx="0.625"
                    stroke="none"
                    width="2.5"
                    x="1.25"
                    y="2.5"
                  />
                  <path
                    d="M6.25 3.75H18.125"
                    fill="none"
                    id="Line 587"
                    strokeLinecap="round"
                    strokeWidth="1.25"
                  />
                  <path
                    d="M6.25 10H18.125"
                    fill="none"
                    id="Line 588"
                    strokeLinecap="round"
                    strokeWidth="1.25"
                  />
                  <path
                    d="M6.25 16.25H18.125"
                    fill="none"
                    id="Line 589"
                    strokeLinecap="round"
                    strokeWidth="1.25"
                  />
                </g>
              </svg>
            </Toolbar.ToggleItem>
          </Toolbar.ToggleGroup>
        </Toolbar.Root>
      </div>

      {displayOption === "card" ? (
        <div className="mt-6 grid grid-cols-2 gap-5 sm:grid-cols-5">
          {bridgeRequestData.map((bridgeRequest, index) => {
            return (
              <NftTransferCard
                image={undefined}
                key={index}
                name={bridgeRequest.sourceCollection}
                status={bridgeRequest.status}
                statusTimestamp={bridgeRequest.statusTimestamp}
              />
            );
          })}
        </div>
      ) : (
        <table className="w-full text-left">
          <thead>
            <tr>
              <Typography
                className="pb-5 pl-6"
                component="th"
                variant="button_text_l"
              >
                Nfts in transit ({bridgeRequestData.length})
              </Typography>
              <Typography
                className="pb-5"
                component="th"
                variant="button_text_l"
              >
                Transfer status
              </Typography>
              <Typography
                className="pb-5"
                component="th"
                variant="button_text_l"
              >
                Arrival
              </Typography>
              <Typography
                className=" pb-5 pr-6 text-right"
                component="th"
                variant="button_text_l"
              >
                Grid options
              </Typography>
            </tr>
          </thead>

          <tbody className="rounded-3xl">
            {bridgeRequestData.map((bridgeRequest, index) => {
              return (
                <tr className="group" key={index}>
                  <td
                    className={`bg-white pb-4 pl-6 group-first:rounded-ss-3xl group-first:pt-6 group-last:rounded-es-3xl`}
                  >
                    <div className="flex gap-4 ">
                      <Image
                        alt="nft image"
                        className="rounded-lg"
                        height={52}
                        src=""
                        width={52}
                      />
                      <div className="flex flex-col gap-1.5">
                        <Typography variant="body_text_14">
                          {bridgeRequest.sourceCollection}
                        </Typography>
                        <Typography variant="body_text_bold_14">
                          No Nft name
                        </Typography>
                      </div>
                    </div>
                  </td>

                  <td className="bg-white pb-4 group-first:pt-6">
                    {/* TODO @YohanTz: Extract this badge to its own component (used in cards also) */}
                    <Typography
                      className="mt-3 rounded-full bg-red-100 px-2 py-1 text-center"
                      variant="button_text_xs"
                    >
                      {bridgeRequest.status}
                    </Typography>
                  </td>
                  <td className=" bg-white pb-4 group-first:pt-6">
                    <div className="flex gap-10">
                      <div className="flex flex-col">
                        <Typography
                          className="text-[#686c73]"
                          variant="body_text_12"
                        >
                          Estimated arrival
                        </Typography>
                        <Typography variant="button_text_s">
                          {bridgeRequest.statusTimestamp}
                        </Typography>
                      </div>
                      {/* <Button color="default" size="large">
                        Stop transfer
                      </Button> */}
                    </div>
                  </td>
                  <td className="bg-white pb-4 pr-6 text-right group-first:rounded-se-3xl group-first:pt-6 group-last:rounded-ee-3xl">
                    +
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      )}
    </div>
  );
}
