import Image from "next/image";

interface NftsEmptyStateProps {
  className?: string;
}

export default function NftsEmptyState({
  className = "",
}: NftsEmptyStateProps) {
  return (
    <div className={`grid grid-cols-2 gap-5 sm:grid-cols-5 ${className}`}>
      {[1, 2, 3, 4, 5].map((emptyCardNumber) => {
        return (
          <Image
            alt={`empty card ${emptyCardNumber}`}
            className="hidden h-auto w-full dark:block dark:last:hidden sm:dark:last:block"
            height={208}
            key={`dark-${emptyCardNumber}`}
            src={`/medias/dark/empty_card_${emptyCardNumber}.png`}
            width={182}
          />
        );
      })}
      {[1, 2, 3, 4, 5].map((emptyCardNumber) => {
        return (
          <Image
            alt={`empty card ${emptyCardNumber}`}
            className="block h-auto w-full last:hidden dark:hidden sm:last:block sm:dark:last:hidden"
            height={208}
            key={emptyCardNumber}
            src={`/medias/empty_card_${emptyCardNumber}.png`}
            width={182}
          />
        );
      })}
    </div>
  );
}
