import {
  GitHubIcon,
  TelegramIcon,
  TwitterIcon,
  Typography,
} from "design-system";
import Image from "next/image";

import Logo from "./Logo";

export default function Footer() {
  return (
    <footer className="sticky bottom-0 left-0 top-[100vh] flex w-full flex-col bg-void-black px-6 py-9 text-night-blue-200 sm:h-[7.125rem] sm:flex-row sm:items-center sm:justify-between">
      <div className="flex items-center gap-9 text-white">
        <Logo />
        <div className="flex items-center gap-2">
          <Typography variant="body_text_14">In Partnership with</Typography>
          <Image
            alt="Starkware"
            height={30}
            src="/logos/starkware.svg"
            width={164}
          />
        </div>
      </div>
      <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:gap-8">
        <Typography variant="body_text_14">Terms of use</Typography>
        <Typography variant="body_text_14">FAQ</Typography>
        {/* <Typography variant="button_text_l">Documentation</Typography> */}
        <Typography variant="body_text_14">
          © {new Date().getFullYear()} ArkProject
        </Typography>
        <div className="flex items-center gap-3">
          <a
            className="hover:text-white"
            href="https://github.com/ArkProjectNFTs"
            rel="noreferrer"
            target="_blank"
          >
            <GitHubIcon />
          </a>
          <a
            className="hover:text-white"
            href="https://t.me/arkprojectnfts"
            rel="noreferrer"
            target="_blank"
          >
            <TelegramIcon />
          </a>
          <a
            className="hover:text-white"
            href="https://twitter.com/ArkProjectNFTs"
            rel="noreferrer"
            target="_blank"
          >
            <TwitterIcon />
          </a>
        </div>
      </div>
    </footer>
  );
}
