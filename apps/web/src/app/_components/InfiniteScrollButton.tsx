import { Button } from "design-system";
import { useInView } from "framer-motion";
import { useEffect, useRef } from "react";

interface InfiniteScrollButtonProps {
  className: string;
  fetchAuto?: boolean;
  fetchNextPage: () => void;
  hasNextPage: boolean | undefined;
  isFetchingNextPage: boolean;
}

export default function InfiniteScrollButton({
  className,
  fetchAuto = true,
  fetchNextPage,
  hasNextPage,
  isFetchingNextPage,
}: InfiniteScrollButtonProps) {
  const ref = useRef(null);

  const isInView = useInView(ref);

  useEffect(() => {
    if (fetchAuto && isInView && hasNextPage) {
      fetchNextPage();
    }
  }, [fetchNextPage, hasNextPage, isInView, fetchAuto]);

  return (
    <div className={className} ref={ref}>
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
