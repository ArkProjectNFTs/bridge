import { Fragment } from "react";

import LoadingCollectionCard from "./LoadingCollectionCard";
import LoadingTokenCard from "./LoadingTokenCard";

interface NftsLoadingStateProps {
  className?: string;
  type: "collection" | "token";
}

export default function NftsLoadingState({
  className = "",
  type,
}: NftsLoadingStateProps) {
  return (
    <div
      className={`grid grid-cols-2 gap-5 sm:grid-cols-3 lg:grid-cols-5 ${className}`}
    >
      {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((lodingCardNumber) => {
        return (
          <Fragment key={`dark-${lodingCardNumber}`}>
            {type === "collection" ? (
              <LoadingCollectionCard className="h-auto w-full" />
            ) : (
              <LoadingTokenCard className="h-auto w-full" />
            )}
          </Fragment>
        );
      })}
    </div>
  );
}
