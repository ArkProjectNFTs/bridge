import {
  GitHubIcon,
  TelegramIcon,
  TwitterIcon,
  Typography,
} from "design-system";
import Image from "next/image";
import Link from "next/link";

export default function Footer() {
  return (
    <footer className="sticky bottom-0 left-0 top-[100vh] flex w-full flex-col bg-void-black px-6 py-9 text-asteroid-grey-200 md:h-[7.125rem] md:flex-row md:items-center md:justify-between">
      <div className="flex items-center gap-9 text-white">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
          <Typography variant="body_text_14">In Partnership with</Typography>
          <Image
            alt="Starkware"
            height={30}
            src="/logos/starkware.svg"
            width={164}
          />
        </div>
      </div>
      <div className="mt-6 flex flex-col gap-6 md:mt-0 md:flex-row md:items-center md:gap-8">
        <Link
          className="transition-colors hover:text-space-blue-source"
          href="/terms-of-use"
        >
          <Typography variant="body_text_14">Terms of use</Typography>
        </Link>
        <Link
          className="transition-colors hover:text-space-blue-source"
          href="/privacy"
        >
          <Typography variant="body_text_14">Privacy Policy</Typography>
        </Link>
        <Link
          className="transition-colors hover:text-space-blue-source"
          href="/legal-notice"
        >
          <Typography variant="body_text_14">Legal Notice</Typography>
        </Link>
        <Link
          className="transition-colors hover:text-space-blue-source"
          href="/faq"
        >
          <Typography variant="body_text_14">FAQ</Typography>
        </Link>
        {/* <Typography variant="button_text_l">Documentation</Typography> */}
        <Typography variant="body_text_14">
          © {new Date().getFullYear()} ArkProject
        </Typography>
        <div className="flex items-center gap-3">
          <a
            className="rounded-full transition-colors hover:text-white"
            href="https://github.com/ArkProjectNFTs"
            rel="noreferrer"
            target="_blank"
          >
            <GitHubIcon />
          </a>
          <a
            className="rounded-full transition-colors hover:text-white"
            href="https://t.me/arkprojectnfts"
            rel="noreferrer"
            target="_blank"
          >
            <TelegramIcon />
          </a>
          <a
            className="rounded-full transition-colors hover:text-white"
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
