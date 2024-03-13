import * as Tabs from "@radix-ui/react-tabs";
import clsx from "clsx";
import { Typography } from "design-system";

import useIsFullyConnected from "~/app/_hooks/useIsFullyConnected";

interface NftTabsTriggerProps {
  className?: string;
  isLoading: boolean;
  tabName: string;
  tabValue: string;
  totalCount: number | undefined;
}

export default function NftTabsTrigger({
  className,
  isLoading,
  tabName,
  tabValue,
  totalCount,
}: NftTabsTriggerProps) {
  const isFullyConnected = useIsFullyConnected();

  return (
    <Tabs.Trigger
      className={clsx(
        className,
        "group flex items-center gap-2.5 whitespace-nowrap rounded-full bg-asteroid-grey-100 py-1.5 pl-3 pr-2 transition-colors hover:bg-galaxy-blue hover:text-white  data-[state=active]:bg-galaxy-blue data-[state=active]:text-white dark:bg-space-blue-900 dark:hover:bg-space-blue-source dark:hover:text-galaxy-blue dark:data-[state=active]:bg-space-blue-source dark:data-[state=active]:text-galaxy-blue"
      )}
      value={tabValue}
    >
      <Typography variant="button_text_s">{tabName}</Typography>
      <Typography
        className="grid h-[18px] min-w-[18px] place-items-center rounded-full bg-space-blue-source px-1 text-white dark:text-space-blue-900 dark:group-data-[state=active]:bg-galaxy-blue dark:group-data-[state=active]:text-space-blue-source"
        variant="button_text_xs"
      >
        {!isFullyConnected ? (
          0
        ) : isLoading ? (
          <div className="h-3 w-3 animate-spin rounded-full border-2 border-current border-r-transparent" />
        ) : (
          totalCount
        )}
      </Typography>
    </Tabs.Trigger>
  );
}
