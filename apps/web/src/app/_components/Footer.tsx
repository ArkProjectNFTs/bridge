import { Typography } from "design-system";

export default function Header() {
  return (
    <footer className="sticky bottom-0 left-0 top-[100vh] mt-14 flex w-full items-center bg-night-blue-source px-6 py-9 text-night-blue-200 md:h-[7.125rem] md:justify-center">
      <div className="flex flex-col gap-6 md:flex-row md:items-center md:gap-8">
        <Typography variant="button_text_l">
          Made with ❤️ by Screenshot
        </Typography>
        <Typography variant="button_text_l">Terms of use</Typography>
        <Typography variant="button_text_l">Documentation</Typography>
        <Typography variant="button_text_l">FAQ</Typography>
        <Typography variant="button_text_l">Connect with us on</Typography>
      </div>
    </footer>
  );
}
