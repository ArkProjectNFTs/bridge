import Image from "next/image";

export default function Header() {
  return (
    <div className="sticky top-[100vh] w-full px-8 py-8">
      <a
        href="https://www.screenshot.co"
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center text-sm"
      >
        Built by{" "}
        <Image
          src="/logos/screenshot.svg"
          alt="Screenshot Logo"
          className="ml-1"
          width={20}
          height={20}
          priority
        />
      </a>
    </div>
  );
}
