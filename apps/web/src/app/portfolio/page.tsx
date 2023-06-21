import { Typography } from "design-system";
import Link from "next/link";
import Image from "next/image";

export default function Page() {
  return (
    <div className="flex">
      <main className="mx-auto mt-[5.875rem] w-full max-w-7xl px-4 text-center">
        <Typography component="h1" variant="heading_light_l" className="mt-13">
          Welcome to your
          <br />
          Digital goods portfolio
        </Typography>

        <Link
          className="mx-auto mb-23 mt-12 inline-flex items-center gap-2.5 rounded-full bg-dark-blue-950 px-6 py-5"
          href="/bridge"
        >
          <Image
            src="/icons/picture.svg"
            height={32}
            width={32}
            alt="picture icon"
          />
          <Typography variant="body_text_bold_16" className="text-white">
            Start bridging
          </Typography>
        </Link>
      </main>
    </div>
  );
}
