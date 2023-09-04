import { Typography } from "design-system";
import Image from "next/image";

import { CHAIN_LOGOS_BY_NAME } from "../_lib/utils/connectors";
import { type Chain } from "../_types";
import ConditionalWrapper from "./ConditionalWrapper";

type NftCardProps = {
  chain: Chain;
  image?: string;
  isSelected: boolean;
  onClick?: () => void;
  title: string;
} & (
  | {
      cardType: "collection";
      numberOfNfts: number;
    }
  | { cardType: "nft"; numberOfNfts?: never }
);

export default function NftCard({
  cardType,
  chain,
  image,
  isSelected,
  numberOfNfts,
  onClick,
  title,
}: NftCardProps) {
  return (
    <div className="relative w-full">
      {cardType === "collection" && (
        <>
          <div
            className={`absolute inset-0 z-[-1] -translate-x-[5px] translate-y-[5px] rounded-2xl bg-white dark:bg-dark-blue-950 ${
              isSelected && cardType === "collection"
                ? "border-2 border-primary-300"
                : "border border-neutral-200 dark:border-dark-blue-600"
            }`}
          />
          <div
            className={`absolute inset-0 z-[-2] -translate-x-[9px] translate-y-[9px] rounded-2xl bg-white dark:bg-dark-blue-950 ${
              isSelected && cardType === "collection"
                ? "border-2 border-primary-300"
                : "border border-neutral-200 dark:border-dark-blue-600"
            }`}
          />
        </>
      )}
      {/* TODO @YohanTz: handle focus visible style properly */}
      <ConditionalWrapper
        wrapper={(children) =>
          onClick === undefined ? (
            <div
              className={`h-full w-full overflow-hidden rounded-2xl border border-neutral-300 bg-white p-3 dark:border-dark-blue-600 dark:bg-dark-blue-950`}
            >
              {children}
            </div>
          ) : (
            <button
              className={`h-full w-full overflow-hidden rounded-2xl border bg-white p-3 dark:bg-dark-blue-950 ${
                isSelected
                  ? "border-primary-300 outline outline-1 outline-primary-300"
                  : "border-neutral-300 dark:border-dark-blue-600"
              }`}
              onClick={onClick}
            >
              {children}
            </button>
          )
        }
      >
        <div className="relative">
          {image ? (
            <Image
              alt={title}
              className="aspect-square h-full w-full rounded-lg object-cover"
              height={300}
              // TODO @YohanTz: Handle no image case
              src={image}
              width={300}
            />
          ) : (
            <div className="flex aspect-square h-full w-full items-center justify-center rounded-lg bg-dark-blue-100 dark:bg-dark-blue-900">
              <Typography variant="body_text_18">No metadata</Typography>
            </div>
          )}
          <Image
            alt={`${chain} logo`}
            className="absolute right-2 top-2"
            height={32}
            src={CHAIN_LOGOS_BY_NAME[chain]}
            width={32}
          />
        </div>
        <div className="mt-3 text-left">
          <div className="flex items-center justify-between">
            <Typography
              variant={
                cardType === "nft" ? "body_text_bold_14" : "body_text_bold_16"
              }
              ellipsable
            >
              {title}
            </Typography>
            {cardType === "nft" && onClick !== undefined && (
              <div
                className={`h-5 w-5 rounded-full ${
                  isSelected
                    ? "border-[6px] border-primary-300 bg-white "
                    : "bg-neutral-300 dark:bg-dark-blue-300"
                }`}
              />
            )}
          </div>
          {cardType === "collection" ? (
            <Typography
              className="dark:text-dark-blue-300"
              variant="body_text_14"
            >
              {numberOfNfts}
              {numberOfNfts > 1 ? " Nfts" : " Nft"}
            </Typography>
          ) : null}
        </div>
      </ConditionalWrapper>
    </div>
  );
}
