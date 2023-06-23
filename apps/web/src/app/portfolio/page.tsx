import { Typography } from "design-system";
import Image from "next/image";
import Link from "next/link";

export default function Page() {
  return (
    <div className="flex">
      <main className="mx-auto mt-[5.875rem] w-full max-w-7xl px-4 text-center">
        <Typography className="mt-13" component="h1" variant="heading_light_l">
          Welcome to your
          <br />
          Digital goods portfolio
        </Typography>

        <Link
          className="mx-auto mb-23 mt-12 inline-flex items-center gap-2.5 rounded-full bg-dark-blue-950 px-6 py-5"
          href="/bridge"
        >
          <Image
            alt="picture icon"
            height={32}
            src="/icons/picture.svg"
            width={32}
          />
          <Typography className="text-white" variant="body_text_bold_16">
            Start bridging
          </Typography>
        </Link>
      </main>
    </div>
  );
}
