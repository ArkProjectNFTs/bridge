interface NftsEmptyStateProps {
  className?: string;
}

export default function TokenNftsEmptyState({
  className = "",
}: NftsEmptyStateProps) {
  return (
    <div className={`grid grid-cols-2 gap-5 sm:grid-cols-5 ${className}`}></div>
  );
}
