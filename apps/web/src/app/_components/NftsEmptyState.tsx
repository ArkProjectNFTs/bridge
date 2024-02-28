import Image from "next/image";
import { Fragment } from "react";

interface NftsEmptyStateProps {
  className?: string;
  type: "collection" | "token";
}

export default function NftsEmptyState({
  className = "",
  type,
}: NftsEmptyStateProps) {
  return (
    <div className={`grid grid-cols-2 gap-5 sm:grid-cols-5 ${className}`}>
      {[1, 2, 3, 4, 5].map((emptyCardNumber) => {
        return (
          <Fragment key={emptyCardNumber}>
            <Image
              src={
                type === "collection"
                  ? `/medias/dark/empty_collection_card_${emptyCardNumber}.png`
                  : `/medias/dark/empty_token_card_${emptyCardNumber}.png`
              }
              alt={`empty card ${emptyCardNumber}`}
              className="hidden h-auto w-full dark:block dark:last:hidden sm:dark:last:block"
              height={208}
              width={182}
            />
            <Image
              src={
                type === "collection"
                  ? `/medias/empty_collection_card_${emptyCardNumber}.png`
                  : `/medias/empty_token_card_${emptyCardNumber}.png`
              }
              alt={`empty card ${emptyCardNumber}`}
              className="block h-auto w-full last:hidden dark:hidden sm:last:block sm:dark:last:hidden"
              height={208}
              width={182}
            />
          </Fragment>
        );
      })}
    </div>
  );
}
