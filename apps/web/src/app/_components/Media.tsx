import Image from "next/image";

interface MediaProps {
  alt: string;
  className?: string;
  height: number;
  src: string;
  width: number;
}

export default function Media({
  alt,
  className,
  height,
  src,
  width,
}: MediaProps) {
  const extension = src.split(".").pop();

  if (extension === "mp4") {
    return (
      <video
        autoPlay
        className={className}
        height={height}
        loop
        muted
        width={width}
      >
        <source src={src} type="video/mp4" />
        Your browser does not support the video tag.
      </video>
    );
  } else {
    return (
      <Image
        alt={alt}
        className={className}
        height={height}
        src={src}
        width={width}
      />
    );
  }
}
