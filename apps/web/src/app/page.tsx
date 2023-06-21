import { Typography } from "design-system";
import ConnectWalletsButton from "./components/ConnectWalletsButton";

export default function Page() {
  return (
    <div className="flex">
      {/* TODO @YohanTz: Extract magic values like this somewhere (top-[5.75rem]) */}
      <main className="mx-auto mt-[5.875rem] w-full max-w-7xl px-4 text-center">
        <Typography
          component="h1"
          variant="heading_light_l"
          className="mt-15.5"
        >
          Connect your wallets
          <br />
          to start moving your Digital Goods
        </Typography>

        <ConnectWalletsButton />

        <div className="rounded-3xl bg-white p-6">
          <Typography component="p" variant="body_text_20">
            In this space, you can explore and enjoy your digital treasures from
            any blockchain.
          </Typography>
        </div>
      </main>
    </div>
  );
}
