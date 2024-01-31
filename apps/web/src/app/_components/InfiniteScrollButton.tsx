import { Button } from "design-system";

interface InfiniteScrollButtonProps {
  className: string;
  fetchNextPage: () => void;
  hasNextPage: boolean | undefined;
  isFetchingNextPage: boolean;
}

export default function InfiniteScrollButton({
  className,
  fetchNextPage,
  hasNextPage,
  isFetchingNextPage,
}: InfiniteScrollButtonProps) {
  return (
    <div className={className}>
      {isFetchingNextPage ? (
        <Button size="small">Loading...</Button>
      ) : hasNextPage ? (
        // eslint-disable-next-line @typescript-eslint/no-misused-promises
        <Button
          onClick={() => !isFetchingNextPage && fetchNextPage()}
          size="small"
        >
          Load more
        </Button>
      ) : null}
    </div>
  );
}
