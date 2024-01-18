import Image from "next/image";

interface NftsLoadingStateProps {
  className?: string;
}

export default function NftsLoadingState({
  className = "",
}: NftsLoadingStateProps) {
  return (
    <div className={`grid grid-cols-2 gap-5 sm:grid-cols-5 ${className}`}>
      {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((lodingCardNumber) => {
        return (
          <Image
            alt={`loadingcard ${lodingCardNumber}`}
            className="hidden h-auto w-full dark:block dark:last:hidden sm:dark:last:block"
            height={208}
            key={`dark-${lodingCardNumber}`}
            src={`/medias/dark/loading_card.png`}
            width={182}
          />
        );
      })}
      {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((loadingCardNumber) => {
        return (
          <Image
            alt={`loading card ${loadingCardNumber}`}
            className="block h-auto w-full last:hidden dark:hidden sm:last:block sm:dark:last:hidden"
            height={208}
            key={loadingCardNumber}
            src={`/medias/loading_card.png`}
            width={182}
          />
        );
      })}
    </div>
  );
}
