import * as Tabs from "@radix-ui/react-tabs";
import { Typography } from "design-system";

interface NftTabsTriggerProps {
  className?: string;
  isLoading: boolean;
  tabName: string;
  tabValue: string;
  totalCount: number;
}

export default function NftTabsTrigger({
  className,
  isLoading,
  tabName,
  tabValue,
  totalCount,
}: NftTabsTriggerProps) {
  return (
    <Tabs.Trigger
      className={`group flex items-center gap-2.5 whitespace-nowrap rounded-full bg-[#e4edec] py-1.5 pl-3 pr-2 data-[state=active]:bg-night-blue-source data-[state=active]:text-white dark:bg-dark-blue-900 dark:data-[state=active]:bg-sunshine-yellow-400 dark:data-[state=active]:text-night-blue-source ${
        className || ""
      }`}
      value={tabValue}
    >
      <Typography variant="button_text_s">{tabName}</Typography>
      <Typography
        className="grid h-[18px] min-w-[18px] place-items-center rounded-full bg-sunshine-yellow-400 px-1 text-night-blue-source dark:text-dark-blue-900 dark:group-data-[state=active]:bg-night-blue-source dark:group-data-[state=active]:text-sunshine-yellow-400"
        variant="button_text_xs"
      >
        {isLoading ? (
          <div className="h-3 w-3 animate-spin rounded-full border-2 border-current border-r-transparent" />
        ) : (
          totalCount
        )}
      </Typography>
    </Tabs.Trigger>
  );
}
