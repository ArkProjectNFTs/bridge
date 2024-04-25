import { ArrowIcon, Typography } from "design-system";
import Image from "next/image";

export default function MarketplacesList() {
  return (
    <div className="mb-16">
      <Typography
        className="mb-8 text-left"
        component="h3"
        variant="heading_light_s"
      >
        Discover Everai on Starknet Marketplaces
      </Typography>
      <div className="mt-2 grid grid-cols-4 gap-6">
        <a
          className="flex h-[5.625rem] items-center justify-between rounded-xl border border-asteroid-grey-100 bg-white px-6 transition-colors hover:bg-space-blue-100 dark:border-space-blue-800 dark:bg-space-blue-900 dark:hover:bg-space-blue-800"
          href="https://element.market/collections/everai-starknet"
          rel="noreferrer"
          target="_blank"
        >
          <Image
            alt="Element"
            className="mx-auto hidden h-8 w-auto dark:block"
            height={32}
            src="/logos/dark/element.svg"
            width={136}
          />
          <Image
            alt="Element"
            className="mx-auto h-8 w-auto dark:hidden"
            height={32}
            src="/logos/element.svg"
            width={136}
          />
          <ArrowIcon className="flex-shrink-0" />
        </a>
        <a
          className="flex h-[5.625rem] items-center justify-between rounded-xl border border-asteroid-grey-100 bg-white px-6 transition-colors hover:bg-space-blue-100 dark:border-space-blue-800 dark:bg-space-blue-900 dark:hover:bg-space-blue-800"
          href="https://unframed.co/collection/0x02acee8c430f62333cf0e0e7a94b2347b5513b4c25f699461dd8d7b23c072478"
          rel="noreferrer"
          target="_blank"
        >
          <Image
            alt="Unframed"
            className="mx-auto hidden w-auto dark:block"
            height={42}
            src="/logos/dark/unframed.svg"
            width={144}
          />
          <Image
            alt="Unframed"
            className="mx-auto w-auto dark:hidden"
            height={42}
            src="/logos/unframed.svg"
            width={144}
          />
          <ArrowIcon className="flex-shrink-0" />
        </a>
        <a
          className="flex h-[5.625rem] items-center justify-between rounded-xl border border-asteroid-grey-100 bg-white px-6 transition-colors hover:bg-space-blue-100 dark:border-space-blue-800 dark:bg-space-blue-900 dark:hover:bg-space-blue-800"
          href="https://pyramid.market/collection/0x2acee8c430f62333cf0e0e7a94b2347b5513b4c25f699461dd8d7b23c072478"
          rel="noreferrer"
          target="_blank"
        >
          <Image
            alt="Pyramid"
            className="mx-auto h-8 w-auto dark:hidden"
            height={32}
            src="/logos/pyramid.png"
            width={140}
          />
          <Image
            alt="Pyramid"
            className="mx-auto hidden h-8 w-auto dark:block"
            height={32}
            src="/logos/dark/pyramid.png"
            width={140}
          />
          <ArrowIcon className="flex-shrink-0" />
        </a>
        {/* <a
          className="flex h-[5.625rem] items-center justify-between rounded-xl border border-asteroid-grey-100 bg-white px-6 transition-colors hover:bg-space-blue-100 dark:border-space-blue-800 dark:bg-space-blue-900 dark:hover:bg-space-blue-800"
          href="https://hyperflex.market/starknet/collection/0x02acee8c430f62333cf0e0e7a94b2347b5513b4c25f699461dd8d7b23c072478"
          rel="noreferrer"
          target="_blank"
        >
          <Image
            alt="Flex"
            className="mx-auto h-12 w-auto dark:hidden"
            height={46}
            src="/logos/flex.png"
            width={68}
          />
          <Image
            alt="Flex"
            className="mx-auto mb-1 hidden h-12 w-auto dark:block"
            height={46}
            src="/logos/dark/flex.png"
            width={68}
          />
          <ArrowIcon className="flex-shrink-0" />
        </a> */}
        <a
          className="flex h-[5.625rem] items-center justify-between rounded-xl border border-asteroid-grey-100 bg-white px-6 transition-colors hover:bg-space-blue-100 dark:border-space-blue-800 dark:bg-space-blue-900 dark:hover:bg-space-blue-800"
          href="https://ventory.gg/collection/0x02acee8c430f62333cf0e0e7a94b2347b5513b4c25f699461dd8d7b23c072478"
          rel="noreferrer"
          target="_blank"
        >
          <Image
            alt="Ventory"
            className="mx-auto h-[2.625rem] w-auto dark:hidden"
            height={42}
            src="/logos/ventory.png"
            width={146}
          />
          <Image
            alt="Ventory"
            className="mx-auto hidden h-[2.625rem] w-auto dark:block"
            height={42}
            src="/logos/dark/ventory.png"
            width={146}
          />
          <ArrowIcon className="flex-shrink-0" />
        </a>
      </div>
    </div>
  );
}
