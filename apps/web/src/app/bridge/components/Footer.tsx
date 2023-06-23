import Image from "next/image";

export default function Header() {
  return (
    <div className="sticky top-[100vh] w-full px-8 py-8">
      <a
        className="flex items-center text-sm"
        href="https://www.screenshot.co"
        rel="noopener noreferrer"
        target="_blank"
      >
        Built by{" "}
        <Image
          alt="Screenshot Logo"
          className="ml-1"
          height={20}
          priority
          src="/logos/screenshot.svg"
          width={20}
        />
      </a>
    </div>
  );
}
