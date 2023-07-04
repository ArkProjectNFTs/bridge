import { Typography } from "design-system";

export default function Header() {
  return (
    <footer className="sticky bottom-0 left-0 top-[100vh] mt-6 flex w-full items-center bg-primary-300 px-6 py-9 text-dark-blue-950 sm:h-[7.125rem] sm:justify-center">
      <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:gap-8">
        <Typography variant="button_text_s">
          Made with ❤️ by Screenshot
        </Typography>
        <Typography variant="button_text_s">Terms of use</Typography>
        <Typography variant="button_text_s">Documentation</Typography>
        <Typography variant="button_text_s">FAQ</Typography>

        <Typography variant="button_text_s">Connect with us on</Typography>
      </div>
    </footer>
  );
}
