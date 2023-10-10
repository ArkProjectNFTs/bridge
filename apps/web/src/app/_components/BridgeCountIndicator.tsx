import { Typography } from "design-system";
import { usePathname } from "next/navigation";

import useNftSelection from "../(routes)/bridge/_hooks/useNftSelection";
import { useIsSSR } from "../_hooks/useIsSSR";

export default function BrigetCountIndicator() {
  const { selectedNftIds } = useNftSelection();

  const isSSR = useIsSSR();

  const pathname = usePathname();
  return (
    <div className="relative flex items-center">
      <svg
        className="fill-[#3c607c] stroke-[#3c607c] dark:fill-white dark:stroke-white"
        fill="none"
        height="32"
        viewBox="0 0 32 32"
        width="32"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M2 2H1C1 1.46304 1.42407 1.02192 1.96062 1.00078C2.49716 0.97963 2.95464 1.386 2.9969 1.9213L2 2ZM30 2L29.0023 1.93198C29.039 1.39419 29.4953 0.982235 30.034 1.00058C30.5728 1.01892 31 1.46096 31 2H30ZM3 18C3 18.5523 2.55228 19 2 19C1.44772 19 1 18.5523 1 18H3ZM31 18C31 18.5523 30.5523 19 30 19C29.4477 19 29 18.5523 29 18H31ZM2.9969 1.9213C3.21634 4.70091 4.72954 6.68125 7.05712 8.00589C9.42038 9.35083 12.6075 10 16 10V12C12.3925 12 8.82962 11.3158 6.06788 9.74411C3.27046 8.15208 1.28366 5.63243 1.0031 2.0787L2.9969 1.9213ZM30.9977 2.06802C30.7233 6.09301 28.7614 8.64778 25.8991 10.1371C23.119 11.5836 19.5468 12 16 12V10C19.4532 10 22.631 9.58303 24.9759 8.3629C27.2386 7.18556 28.7767 5.24032 29.0023 1.93198L30.9977 2.06802ZM3 2V18H1V2H3ZM31 2V18H29V2H31Z"
          stroke="none"
        />
        <path
          d="M30 28L30 18C30 16.8954 29.1046 16 28 16L4 16C2.89543 16 2 16.8954 2 18L2 28"
          fill="none"
          strokeLinecap="round"
          strokeWidth="2"
        />
        <path
          d="M11 16L11 11"
          fill="none"
          strokeLinecap="round"
          strokeWidth="2"
        />
        <path
          d="M21 16L21 11"
          fill="none"
          strokeLinecap="round"
          strokeWidth="2"
        />
        <path
          d="M13.5 28L13.5 24.4444C13.5 22.3704 12.8 20 10 20C7.2 20 6.5 22.3704 6.5 24.4444L6.5 28"
          fill="none"
          strokeLinecap="round"
          strokeWidth="2"
        />
        <path
          d="M25.5 28L25.5 24.4444C25.5 22.3704 24.8 20 22 20C19.2 20 18.5 22.3704 18.5 24.4444L18.5 28"
          fill="none"
          strokeLinecap="round"
          strokeWidth="2"
        />
      </svg>

      {!isSSR && selectedNftIds.length > 0 && pathname === "/bridge" && (
        <Typography
          className="absolute -right-2 top-0 min-w-[1.5rem] rounded-full border-2 border-white bg-primary-source px-1.5 py-0.5 text-center text-white dark:border-galaxy-blue"
          variant="body_text_12"
        >
          {selectedNftIds.length}
        </Typography>
      )}
    </div>
  );
}
