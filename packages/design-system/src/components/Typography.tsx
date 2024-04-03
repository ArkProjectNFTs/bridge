// font-thin	    font-weight: 100;
// font-extralight	font-weight: 200;
// font-light	    font-weight: 300;
// font-normal	    font-weight: 400;
// font-medium	    font-weight: 500;
// font-semibold	font-weight: 600;
// font-bold	    font-weight: 700;
// font-extrabold	font-weight: 800;
// font-black	    font-weight: 900;

// import clsx from "clsx";
import clsx from "clsx";

// text-xs	    font-size: 0.75rem; /* 12px */
// text-sm	    font-size: 0.875rem; /* 14px */
// text-base	font-size: 1rem; /* 16px */
// text-lg	    font-size: 1.125rem; /* 18px */
// text-xl	    font-size: 1.25rem; /* 20px */
// text-2xl	    font-size: 1.5rem; /* 24px */
// text-3xl	    font-size: 1.875rem; /* 30px */
// text-4xl	    font-size: 2.25rem; /* 36px */
// text-5xl	    font-size: 3rem; /* 48px */
// text-6xl	    font-size: 3.75rem; /* 60px */
// text-7xl	    font-size: 4.5rem; /* 72px */
// text-8xl	    font-size: 6rem; /* 96px */
// text-9xl	    font-size: 8rem; /* 128px */

/* TODO @YohanTz: line-height */
const variants = {
  /* Headings */
  heading_xl: "font-bold sm:text-5xl text-2xl font-ark-project",
  heading_l: "font-bold sm:text-4xl text-xl font-ark-project",
  heading_m: "font-bold sm:text-2xl text-lg font-ark-project",
  heading_s: "font-bold sm:text-xl text-base font-ark-project",
  heading_xs: "font-bold sm:text-base text-sm font-ark-project",
  heading_xxs: "font-bold sm:text-sm text-xs font-ark-project",

  /* Headings Light */
  heading_light_xl: "font-semibold sm:text-5xl text-2xl font-ark-project",
  heading_light_l: "font-semibold sm:text-4xl text-xl font-ark-project",
  heading_light_m: "font-semibold sm:text-2xl text-lg font-ark-project",
  heading_light_s: " font-semibold sm:text-xl text-base font-ark-project",
  heading_light_xs: "font-semibold sm:text-base text-sm font-ark-project",
  heading_light_xxs: "font-semibold sm:text-sm text-xs font-ark-project",

  /* Body */
  body_text_24: "font-normal text-2xl font-styrene-a",
  body_text_bold_24: "font-bold text-2xl font-styrene-a",
  body_text_20: "font-normal sm:text-xl text-base font-styrene-a",
  body_text_bold_20: "font-bold text-xl font-styrene-a",
  body_text_18: "font-normal sm:text-lg text-base font-styrene-a",
  body_text_bold_18: "font-bold text-lg font-styrene-a",
  body_text_16: "font-normal text-base font-styrene-a",
  body_text_bold_16: "font-bold text-base font-styrene-a",
  body_text_14: "font-normal text-sm font-styrene-a",
  body_text_bold_14: "font-bold text-sm font-styrene-a",
  body_text_12: "font-normal text-xs font-styrene-a",
  body_text_bold_12: "font-bold text-xs font-styrene-a",
  body_text_11: "font-normal text-[0.6875rem] font-styrene-a",

  /* Logo */
  logo: "font-semibold text-2xl font-ark-project",

  /* Buton */
  button_text_xl: "font-medium text-lg font-styrene-a",
  button_text_l: "font-medium sm:text-base text-sm font-styrene-a",
  button_text_s: "font-medium text-sm font-styrene-a",
  button_text_xs: "font-medium text-xs font-styrene-a",

  /* Exceptions */
  quests_banner: "font-black text-4xl font-ark-project",
};

const ellipsableClasses = "whitespace-nowrap text-ellipsis overflow-hidden";

/* Make typography classes not overidable */
interface TypographyProps {
  children: React.ReactNode;
  className?: string;
  component?: React.ElementType;
  ellipsable?: boolean;
  variant: keyof typeof variants;
}

export function Typography({
  children,
  className,
  component,
  ellipsable,
  variant,
}: TypographyProps) {
  const Component = component ?? "span";

  return (
    // TODO @YohanTz: Use tailwind-merge
    <Component
      className={clsx(
        variants[variant],
        className,
        ellipsable && ellipsableClasses,
      )}
    >
      {children}
    </Component>
  );
}
