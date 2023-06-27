import Banner from "./components/Banner";
import NftsTabs from "./components/NftsTabs";

export default function Page() {
  return (
    <div className="flex">
      <main className="mx-auto mt-[5.875rem] w-full max-w-5xl px-4 text-center">
        <Banner />

        <NftsTabs />
      </main>
    </div>
  );
}
