import { Typography } from "design-system";
import Image from "next/image";
import Link from "next/link";

export default function Banner() {
  return (
    // TODO @YohanTz: Padding
    <div className="mt-18 flex items-center gap-11 rounded-3xl bg-primary-200 px-8 text-dark-blue-950">
      <Image
        alt="portfolio banner illustration"
        height={300}
        src="/medias/vault.svg"
        width={330}
      />
      <div className="py-8 text-left">
        <Typography className="" component="h1" variant="heading_light_l">
          Welcome to your
          <br />
          Digital goods portfolio
        </Typography>

        <Link
          className="mx-auto mt-11 inline-flex items-center gap-2.5 rounded-full bg-dark-blue-950 px-8 py-5"
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
