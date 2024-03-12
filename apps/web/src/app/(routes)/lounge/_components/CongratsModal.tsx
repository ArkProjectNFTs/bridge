"use client";

import clsx from "clsx";
import {
  ArrowIcon,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
  Typography,
} from "design-system";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

interface ArkQuestsBannerProps {
  className?: string;
}

function ArkQuestsBanner({ className }: ArkQuestsBannerProps) {
  return (
    <div
      className={clsx(
        className,
        "relative flex h-40 flex-col items-center justify-center gap-2 overflow-hidden rounded-2xl"
      )}
    >
      <Image
        alt="Quest banner"
        className="absolute inset-0 -z-10"
        height={160}
        src="/medias/quest_banner.png"
        width={583}
      />
      <div>
        <svg
          fill="none"
          height="45"
          viewBox="0 0 272 45"
          width="272"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            clipRule="evenodd"
            d="M24.4377 39.8606C36.9361 38.9 45.6887 27.0543 44.959 17.3622C44.3218 9.20402 35.5936 5.0288 24.1946 5.89895C10.6634 6.9444 -0.643688 14.6435 0.0286062 23.6366C0.736951 32.6603 13.0387 40.7307 24.4377 39.8606ZM17.0104 13.8651C17.2642 13.2332 18.0931 13.1019 18.3469 13.6535L20.3038 17.9064L24.3635 19.2576C24.9108 19.4398 24.9108 20.2293 24.3635 20.5848L20.3038 23.2221L18.3469 28.0949C18.0931 28.7268 17.2642 28.8581 17.0104 28.3065L15.0535 24.0537L10.9938 22.7024C10.4465 22.5202 10.4465 21.7307 10.9938 21.3752L15.0535 18.7379L17.0104 13.8651ZM34.7952 12.8094C34.5694 12.286 33.8219 12.299 33.596 12.8304L31.845 16.9493L27.7581 18.7632C27.2304 18.9974 27.2291 19.745 27.7561 19.9626L31.845 21.6514L33.596 25.7092C33.8219 26.2327 34.5694 26.2196 34.7952 25.6883L36.5463 21.5693L40.6331 19.7555C41.1608 19.5213 41.1621 18.7736 40.6352 18.556L36.5463 16.8673L34.7952 12.8094Z"
            fill="#FCDA29"
            fillRule="evenodd"
          />
          <path
            d="M71.5497 36.4286L69.4839 29.8496H57.5655L55.4996 36.4286H49.2385L58.3283 9.41361H68.7529L77.779 36.4286H71.5497ZM59.1228 24.7645H67.9265L64.494 13.7678H62.5553L59.1228 24.7645ZM81.0486 36.4286V14.2127H93.6344V19.3297H86.833V36.4286H81.0486ZM112.896 36.4286L106.508 27.8156H102.662V36.4286H96.8777V9.41361H102.662V22.6986H106.381L111.943 14.2127H118.521L110.925 25.1458L119.666 36.4286H112.896Z"
            fill="white"
          />
          <path
            d="M134.514 41.1959V36.9053C126.346 36.9053 120.466 30.9302 120.466 22.9211C120.466 14.8802 126.346 8.93687 134.514 8.93687C142.682 8.93687 148.593 14.8802 148.593 22.9211C148.593 29.1822 145.002 34.172 139.535 36.079H148.593V41.1959H134.514ZM134.514 31.8201C138.995 31.8201 142.491 28.6419 142.491 22.9211C142.491 17.2003 138.995 14.0538 134.514 14.0538C130.032 14.0538 126.536 17.2003 126.536 22.9211C126.536 28.6419 130.032 31.8201 134.514 31.8201ZM164.72 36.9053C157.41 36.9053 152.77 32.5829 152.77 24.5738V9.41361H158.586V24.7009C158.586 29.214 160.652 31.8201 164.72 31.8201C168.82 31.8201 170.886 29.214 170.886 24.7009V9.41361H176.702V24.5738C176.702 32.5829 172.062 36.9053 164.72 36.9053ZM182.612 36.4286V9.41361H199.647V14.467H188.396V20.156H198.471V25.2094H188.396V31.3752H200.601V36.4286H182.612ZM215.12 36.9053C208.255 36.9053 203.614 33.5046 203.138 27.9109H208.827C208.986 30.5488 211.401 31.8837 215.183 31.8837C218.393 31.8837 220.173 30.9302 220.173 29.2775C220.173 23.4296 204.345 28.1334 204.345 17.1685C204.345 11.9244 208.382 8.90509 214.579 8.90509C220.967 8.90509 225.163 12.3376 225.639 17.9313H219.95C219.76 15.2933 217.63 13.9267 214.484 13.9267C211.751 13.9267 210.448 15.0391 210.448 16.5646C210.448 22.349 226.275 17.677 226.275 28.6737C226.275 34.2356 221.762 36.9053 215.12 36.9053ZM234.779 36.4286V14.5306H226.897V9.41361H248.413V14.5306H240.563V36.4286H234.779ZM260.713 36.9053C253.848 36.9053 249.208 33.5046 248.732 27.9109H254.421C254.579 30.5488 256.995 31.8837 260.777 31.8837C263.987 31.8837 265.767 30.9302 265.767 29.2775C265.767 23.4296 249.939 28.1334 249.939 17.1685C249.939 11.9244 253.976 8.90509 260.173 8.90509C266.561 8.90509 270.757 12.3376 271.233 17.9313H265.544C265.354 15.2933 263.224 13.9267 260.078 13.9267C257.345 13.9267 256.041 15.0391 256.041 16.5646C256.041 22.349 271.869 17.677 271.869 28.6737C271.869 34.2356 267.356 36.9053 260.713 36.9053Z"
            fill="#FCDA29"
          />
        </svg>
      </div>
      <a
        className="flex h-[2.625rem] items-center justify-center rounded-full bg-sunshine-yellow-source px-6"
        href="/"
      >
        <Typography className="text-void-black" variant="button_text_s">
          Join now
        </Typography>
      </a>
    </div>
  );
}

function EveraiCards() {
  return (
    <div className="relative flex-shrink-0">
      <div className="absolute inset-0 mx-5 my-3 w-40 rotate-12 rounded-xl border border-space-blue-600 bg-space-blue-900 p-2.5 dark:border-space-blue-700 dark:bg-space-blue-800" />
      <div className="relative z-10 mx-5 my-3 w-40 rounded-xl border border-space-blue-600 bg-space-blue-900 p-2.5 dark:border-space-blue-700 dark:bg-space-blue-800">
        <svg
          className="absolute -left-3 top-12"
          fill="none"
          height="31"
          viewBox="0 0 31 31"
          width="31"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M23.6964 9.35851H18.7591L16.774 5.22689L15.4163 3.087C14.6193 1.83097 12.7263 2.04142 12.2247 3.44183L8.97161 12.5235L1.98774 17.1656C0.994434 17.8259 0.914263 19.2553 1.82751 20.0225L4.2638 22.0691L9.77124 21.652L14.7881 27.8051C15.3677 28.516 16.4996 28.3327 16.8253 27.4753L20.1704 18.6703L27.1992 12.4865L25.0534 9.98271C24.7139 9.58653 24.2182 9.35851 23.6964 9.35851Z"
            fill="#FFFEEB"
            stroke="#163349"
            strokeWidth="1.55847"
          />
          <path
            d="M25.9313 12.0059L20.5723 12.1104L17.1696 5.73108C16.4398 4.36284 14.4331 4.50963 13.9101 5.96951L10.7848 14.6946L4.22376 19.0842C2.86656 19.9923 3.33759 22.0949 4.95248 22.3371L10.9887 23.2424L16.0055 29.3954C16.5852 30.1063 17.717 29.9231 18.0428 29.0657L21.3879 20.2606L27.1544 15.1278C28.3943 14.0241 27.591 11.9736 25.9313 12.0059Z"
            fill="#F8545C"
            stroke="#163349"
          />
          <path
            d="M10.8035 14.8095L9.01648 12.7769L4.54883 15.6807L6.63373 17.423L10.8035 14.8095Z"
            fill="#163349"
          />
        </svg>

        <svg
          className="absolute -right-6 top-2"
          fill="none"
          height="47"
          viewBox="0 0 54 47"
          width="54"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M25.5329 12.8829L20.0873 11.2979C18.1746 10.7412 16.1378 10.8174 14.2824 11.5151L10.7307 12.8506L28.4327 41.4784L33.1368 39.2666C34.443 38.6525 35.345 37.4189 35.5351 35.9869L36.7143 27.1039L45.6184 22.9949C47.673 22.0468 47.4218 19.0498 45.2351 18.4215L36.6888 15.966L37.083 7.00836C37.179 4.8251 35.0156 3.23086 32.9617 3.97141L29.0435 5.38409L25.5329 12.8829Z"
            fill="#FFFEEB"
            stroke="#163349"
            strokeLinecap="round"
            strokeWidth="1.30201"
          />
          <path
            d="M14.2072 24.8735L7.36872 33.401C6.23857 34.8103 7.63475 36.8439 9.365 36.3087L19.2754 33.243L25.4971 41.3097C26.4715 42.5731 28.4742 42.101 28.7581 40.5411L30.7372 29.6649L41.1304 24.8706C42.6713 24.1598 42.4824 21.9121 40.8422 21.4406L30.7092 18.5277L31.0651 7.38852C31.12 5.66855 28.9857 4.80787 27.8476 6.09102L19.5526 15.4426L11.9284 13.0398C9.76454 12.3579 7.93381 14.7119 9.1261 16.6432L14.2072 24.8735Z"
            fill="#FCDA29"
            stroke="#163349"
            strokeLinecap="round"
            strokeWidth="1.30201"
          />
          <path
            d="M36.9894 27.0511L30.7404 29.3269L29.9789 35.8746L35.7985 33.0409L36.9894 27.0511Z"
            fill="#163349"
          />
          <path
            d="M37.4888 15.8235L31.0254 18.4501L31.5815 11.2098L36.9719 9.01466L37.4888 15.8235Z"
            fill="#163349"
          />
        </svg>

        <Image
          alt="Success Everai"
          className="mb-2 w-full rounded-md"
          height={140}
          src="/medias/everai_congrats.png"
          width={140}
        />
        <div className="flex items-center justify-between">
          <div>
            <Typography
              className="text-sunshine-yellow-source"
              component="p"
              variant="heading_light_s"
            >
              123
            </Typography>
            <Typography
              className="text-white"
              component="p"
              variant="body_text_11"
            >
              Everais bridged
            </Typography>
          </div>
          <Image
            alt="Starknet Logo"
            className="flex-shrink-0"
            height={30}
            src="/logos/starknet.svg"
            width={30}
          />
        </div>
      </div>
    </div>
  );
}

interface CongratsModalProps {
  isFromTransfer: boolean;
}

export default function CongratsModal({ isFromTransfer }: CongratsModalProps) {
  const [open, setOpen] = useState(isFromTransfer);

  const router = useRouter();

  useEffect(() => {
    router.push("/lounge");
  }, [router]);

  return (
    <Dialog onOpenChange={setOpen} open={open}>
      <DialogContent>
        <div className="flex items-center gap-4">
          <EveraiCards />
          <div className="flex flex-col items-start">
            <Typography component={DialogTitle} variant="heading_light_s">
              Congratulations!
            </Typography>
            <Typography
              className="mt-4"
              component={DialogDescription}
              variant="body_text_16"
            >
              Your Everai(s) have joined <b>356</b> others Everais on Starknet!
              Check now your eligibility and achievements on{" "}
              <a className="text-space-blue-source underline">Ark Quests</a>.
            </Typography>
            <a
              className="mt-6 flex h-12 items-center rounded-full bg-space-blue-source px-5 text-white transition-colors hover:bg-space-blue-500 dark:text-galaxy-blue"
              href="https://twitter.com/intent/tweet?text=I've just transferred my @Everai(s) on @Starknet using the ArkProject Bridge! Let's come together, holders and hit a new milestone on Ark Quests!"
              rel="noreferrer"
              target="_blank"
            >
              <Typography variant="button_text_s">Share on</Typography>
              <svg
                className="ml-2.5"
                fill="none"
                height="20"
                viewBox="0 0 20 20"
                width="20"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M15.2706 1.58659H18.0818L11.9401 8.60617L19.1654 18.1582H13.5081L9.07706 12.365L4.00699 18.1582H1.19406L7.76323 10.65L0.832031 1.58659H6.63296L10.6382 6.88187L15.2706 1.58659ZM14.284 16.4756H15.8417L5.78653 3.18087H4.11492L14.284 16.4756Z"
                  fill="currentColor"
                />
              </svg>
            </a>
          </div>
        </div>
        <Typography className="mt-6" variant="heading_light_xs">
          Check the collection on Starknet marketplaces
        </Typography>
        <div className="mt-2 grid grid-cols-2 gap-4">
          <a
            className="flex h-14 items-center justify-between rounded-xl border border-galaxy-blue pl-2 pr-4 transition-colors  hover:bg-space-blue-100 dark:bg-space-blue-800 dark:hover:bg-space-blue-700"
            href="/"
          >
            <Image
              alt="Element"
              className="hidden h-7 w-auto dark:block"
              height={97}
              src="/logos/dark/element.svg"
              width={399}
            />
            <Image
              alt="Element"
              className="h-7 w-auto dark:hidden"
              height={97}
              src="/logos/element.svg"
              width={399}
            />
            <ArrowIcon className="flex-shrink-0" />
          </a>
          <a
            className="flex h-14 items-center justify-between rounded-xl border border-galaxy-blue pl-2 pr-4 transition-colors hover:bg-space-blue-100 dark:bg-space-blue-800 dark:hover:bg-space-blue-700"
            href="/"
          >
            <Image
              alt="Unframed"
              className="hidden h-9 w-auto dark:block"
              height={97}
              src="/logos/dark/unframed.svg"
              width={389}
            />
            <Image
              alt="Unframed"
              className="h-9 w-auto dark:hidden"
              height={97}
              src="/logos/unframed.svg"
              width={389}
            />
            <ArrowIcon className="flex-shrink-0" />
          </a>
          <a
            className="flex h-14 items-center justify-between rounded-xl border border-galaxy-blue pl-2 pr-4 transition-colors hover:bg-space-blue-100 dark:bg-space-blue-800 dark:hover:bg-space-blue-700"
            href="/"
          >
            <Image
              alt="Pyramid"
              className="h-7 w-auto dark:hidden"
              height={108}
              src="/logos/pyramid.png"
              width={390}
            />
            <Image
              alt="Pyramid"
              className="hidden h-7 w-auto dark:block"
              height={108}
              src="/logos/dark/pyramid.png"
              width={390}
            />
            <ArrowIcon className="flex-shrink-0" />
          </a>
          <a
            className="flex h-14 items-center justify-between rounded-xl border border-galaxy-blue pl-2 pr-4 transition-colors hover:bg-space-blue-100 dark:bg-space-blue-800 dark:hover:bg-space-blue-700"
            href="/"
          >
            <Image
              alt="Flex"
              className="mb-1 h-9 w-auto dark:hidden"
              height={138}
              src="/logos/flex.png"
              width={189}
            />
            <Image
              alt="Flex"
              className="mb-1 hidden h-9 w-auto dark:block"
              height={138}
              src="/logos/dark/flex.png"
              width={189}
            />
            <ArrowIcon className="flex-shrink-0" />
          </a>
          <a
            className="flex h-14 items-center justify-between rounded-xl border border-galaxy-blue pl-2 pr-4 transition-colors hover:bg-space-blue-100 dark:bg-space-blue-800 dark:hover:bg-space-blue-700"
            href="/"
          >
            <Image
              alt="Ventory"
              className="h-9 w-auto dark:hidden"
              height={97}
              src="/logos/ventory.png"
              width={389}
            />
            <Image
              alt="Ventory"
              className="hidden h-9 w-auto dark:block"
              height={97}
              src="/logos/dark/ventory.png"
              width={389}
            />
            <ArrowIcon className="flex-shrink-0" />
          </a>
        </div>
        <ArkQuestsBanner className="mt-2" />
      </DialogContent>
    </Dialog>
  );
}
