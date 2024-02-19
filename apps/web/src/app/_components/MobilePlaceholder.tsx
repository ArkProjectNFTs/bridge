import { Typography } from "design-system";

export default function MobilePlaceholder() {
  return (
    <div className="flex h-full flex-col items-center justify-center gap-6 px-6 pt-[5.75rem] text-center">
      <Typography component="h2" variant="heading_light_xxs">
        Sorry bridging is not available on mobile for now...
      </Typography>
      <Typography
        className="text-asteroid-grey-700"
        component="p"
        variant="body_text_14"
      >
        But the great news is that the desktop experience is incredibly
        enjoyable!
      </Typography>
    </div>
  );
}
