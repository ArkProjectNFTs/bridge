import { Typography } from "design-system";
import Link from "next/link";

import TokenList from "./TokenList";

interface PageProps {
  params: { address: string };
}

export default function Page({ params: { address } }: PageProps) {
  return (
    <>
      {/* TODO @YohanTz: Refacto to be a variant in the Button component */}
      <div className="flex items-start">
        <Link
          className="mb-10 flex h-12 items-center gap-1.5 rounded-full border-2 border-asteroid-grey-600 px-[0.875rem] py-3 text-asteroid-grey-600 transition-colors hover:border-asteroid-grey-800 hover:text-asteroid-grey-800 dark:border-space-blue-300 dark:text-space-blue-300 dark:hover:border-space-blue-200 dark:hover:text-space-blue-200"
          href="/bridge"
          prefetch
        >
          {/* TODO @YohanTz: Export svg to icons file */}
          <svg
            fill="none"
            height="24"
            viewBox="0 0 24 24"
            width="24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M20.25 12L12.7297 12C11.9013 12 11.2297 12.6716 11.2297 13.5L11.2297 16.4369C11.2297 17.0662 10.5013 17.4157 10.0104 17.0219L4.47931 12.585C4.10504 12.2848 4.10504 11.7152 4.47931 11.415L10.0104 6.97808C10.5013 6.58428 11.2297 6.93377 11.2297 7.56311L11.2297 9.375"
              stroke="currentColor"
              strokeLinecap="round"
              strokeWidth="1.5"
            />
          </svg>
          <Typography variant="button_text_s">Back</Typography>
        </Link>
      </div>
      <TokenList nftContractAddress={address} />
    </>
  );
}
