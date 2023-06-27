import { Typography } from "design-system";

interface NftTransferCard {
  arrivalDate: string;
  image: string;
  name: string;
  status: "error" | "progress" | "transfered";
}

export default function NftTransferCard({
  arrivalDate,
  image,
  name,
  status,
}: NftTransferCard) {
  return (
    <div className="h-full w-full overflow-hidden rounded-2xl border border-neutral-300 bg-white p-3 text-left dark:border-dark-blue-600 dark:bg-dark-blue-950">
      <div className="h-32 w-full rounded-lg bg-gray-300" />
      <Typography className="mt-3" component="p" variant="body_text_bold_14">
        {name}
      </Typography>

      <Typography
        className="mt-3 rounded-full bg-red-200 px-2 py-1 text-center"
        component="p"
        variant="body_text_12"
      >
        Error Transfer
      </Typography>

      <Typography
        className="mt-4 text-[#686c73]"
        component="p"
        variant="body_text_12"
      >
        Arrival
      </Typography>
      <Typography variant="button_text_s">{arrivalDate}</Typography>

      <Typography
        className="mt-2 underline"
        component="p"
        variant="button_text_s"
      >
        View more
      </Typography>
    </div>
  );
}
