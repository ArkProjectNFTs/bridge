import { Typography } from "design-system";
import Image from "next/image";
import Link from "next/link";

export default function Banner() {
  return (
    <div className="mt-6 flex flex-col-reverse items-center rounded-3xl bg-space-blue-source px-5 pt-8 text-center text-space-blue-900 md:mt-18 md:flex-row md:gap-11 md:px-8 md:pt-0 md:text-left">
      <Image
        alt="portfolio banner illustration"
        height={314}
        src="/medias/vault.svg"
        width={330}
      />
      <div className="text-center md:py-8 md:text-left">
        <Typography component="h1" variant="heading_light_l">
          Welcome to your
          <br />
          Digital goods portfolio
        </Typography>

        <Link
          className="mx-auto mt-6 inline-flex items-center gap-2.5 rounded-full bg-galaxy-blue px-8 py-5 transition-colors hover:bg-space-blue-700 md:mt-11"
          href="/bridge"
        >
          <Image
            alt="bridge icon"
            height={24}
            src="/icons/bridge.svg"
            width={24}
          />
          <Typography className="text-white" variant="button_text_l">
            Start bridging
          </Typography>
        </Link>
      </div>
    </div>
  );
}
