import Link from "next/link";

import useCurrentChain from "~/app/_hooks/useCurrentChain";
import { useIsSSR } from "~/app/_hooks/useIsSSR";

export default function TargetChainButton() {
  const { toggle } = useCurrentChain();

  const isSSR = useIsSSR();

  return (
    <div className="relative">
      {!isSSR && (
        <Link href="/bridge">
          <button
            className="absolute right-1/2 top-1/2 flex h-11 w-11 -translate-y-1/2 translate-x-1/2 items-center justify-center rounded-full border-4 border-space-blue-50 bg-primary-source transition-[background-color] hover:bg-primary-400 dark:border-void-black"
            onClick={toggle}
          >
            <svg
              className="stroke-white dark:stroke-galaxy-blue"
              fill="none"
              height="26"
              viewBox="0 0 27 26"
              width="26"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M14.4552 19.4214L10.1076 19.4214L10.1076 21.7163C10.1076 22.4232 9.26746 22.7929 8.74626 22.3154L2.77553 16.8459C2.42524 16.525 2.42377 15.9734 2.77235 15.6506L8.74307 10.1223C9.26323 9.64066 10.1076 10.0096 10.1076 10.7185L10.1076 13L16.8927 13L16.8927 15.2815C16.8927 15.9904 17.737 16.3593 18.2572 15.8777L24.2278 10.3494C24.5764 10.0266 24.5749 9.47497 24.2246 9.15408L18.254 3.68458C17.7328 3.20712 16.8927 3.57686 16.8927 4.28369L16.8927 6.57863L12.5451 6.57863"
                // stroke="white"
                strokeLinecap="round"
                strokeWidth="1.625"
              />
            </svg>
          </button>
        </Link>
      )}
    </div>
  );
}
