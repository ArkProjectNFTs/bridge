import clsx from "clsx";

interface NftCardStackBackground {
  isSelected?: boolean;
}

export default function NftCardStackBackground({
  isSelected,
}: NftCardStackBackground) {
  return (
    <>
      <div
        className={clsx(
          "absolute inset-0 z-[-1] -translate-x-[5px] translate-y-[5px] rounded-[1.1875rem] bg-white transition-[outline_border] group-hover:border-2 group-hover:border-primary-source dark:bg-space-blue-900",
          isSelected
            ? "border-2 border-primary-source"
            : "border border-neutral-200 dark:border-space-blue-700"
        )}
      />
      <div
        className={clsx(
          "absolute inset-0 z-[-2] -translate-x-[9px] translate-y-[9px] rounded-[1.375rem] bg-white transition-[outline_border] group-hover:border-2 group-hover:border-primary-source dark:bg-space-blue-900",
          isSelected
            ? "border-2 border-primary-source"
            : "border border-neutral-200 dark:border-space-blue-700"
        )}
      />
    </>
  );
}

// 19 / 22
