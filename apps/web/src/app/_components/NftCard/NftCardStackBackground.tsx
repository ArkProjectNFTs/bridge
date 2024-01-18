interface NftCardStackBackground {
  isSelected?: boolean;
}

export default function NftCardStackBackground({
  isSelected,
}: NftCardStackBackground) {
  return (
    <>
      <div
        className={`absolute inset-0 z-[-1] -translate-x-[5px] translate-y-[5px] rounded-2xl border-2 bg-white transition-[outline_border] group-hover:border-primary-source dark:bg-dark-blue-950 ${
          isSelected
            ? "border-2 border-primary-source"
            : "border border-neutral-200 dark:border-dark-blue-600"
        }`}
      />
      <div
        className={`absolute inset-0 z-[-2] -translate-x-[9px] translate-y-[9px] rounded-2xl border-2 bg-white transition-[outline_border]  group-hover:border-primary-source dark:bg-dark-blue-950  ${
          isSelected
            ? "border-2 border-primary-source"
            : "border border-neutral-200 dark:border-dark-blue-600"
        }`}
      />
    </>
  );
}
