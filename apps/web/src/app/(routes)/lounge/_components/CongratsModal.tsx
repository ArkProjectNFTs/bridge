"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
  Typography,
} from "design-system";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import { api } from "~/utils/api";

function EveraiCards() {
  const { data: totalTokensBridgeOnStarknet } =
    api.stats.getEveraiBridgeNumber.useQuery();

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
              {totalTokensBridgeOnStarknet ?? 0}
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
  const { data: totalTokensBridgeOnStarknet } =
    api.stats.getEveraiBridgeNumber.useQuery();

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
              In a few minutes, your Everai(s) will join the{" "}
              <b>{totalTokensBridgeOnStarknet}</b> others Everais on Starknet!
              <br />
              <br />
              <button
                className="text-space-blue-source underline"
                onClick={() => setOpen(false)}
              >
                Follow your transaction status here
              </button>
            </Typography>
            <a
              className="mt-6 flex h-12 items-center rounded-full bg-space-blue-source px-5 text-white transition-colors hover:bg-space-blue-500 dark:text-galaxy-blue"
              href="https://twitter.com/intent/tweet?text=I've just transferred my @Everai(s) on @Starknet using the ArkProject Bridge! Let's come together and hit a new milestone on Ark Quests! https://bridge.arkproject.dev/"
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
      </DialogContent>
    </Dialog>
  );
}
