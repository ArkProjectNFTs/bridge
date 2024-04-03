import clsx from "clsx";
import { Typography } from "design-system";
import Image from "next/image";

interface BannerProps {
  className?: string;
}
export default function Banner({ className }: BannerProps) {
  return (
    <div
      className={clsx(
        className,
        "flex items-center gap-11 rounded-3xl bg-space-blue-source px-8 text-space-blue-900"
      )}
    >
      <Image alt="FAQ" height={330} src="/medias/faq_banner.svg" width={345} />
      <Typography
        className="text-left"
        component="h1"
        variant="heading_light_l"
      >
        Frequently Asked
        <br />
        Questions
      </Typography>
    </div>
  );
}
