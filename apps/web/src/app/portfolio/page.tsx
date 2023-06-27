import { Typography } from "design-system";

import Banner from "./components/Banner";
import NftsTabs from "./components/NftsTabs";

export default function Page() {
  return (
    <div className="flex">
      <main className="mx-auto mt-[5.875rem] w-full max-w-5xl px-4 text-center">
        <Banner />

        <NftsTabs />

        <Typography
          className="mt-18 text-left"
          component="h2"
          variant="heading_light_s"
        >
          Your past transactions
        </Typography>
        <hr className="my-5 border-[#e4edec] dark:border-dark-blue-900" />
      </main>
    </div>
  );
}
