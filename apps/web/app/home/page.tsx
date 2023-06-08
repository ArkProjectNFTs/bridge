"use client";

interface CardProps {
  index: number;
}

const cardHeight = "150px";
const cardWidth = "150px";
const numberOfNfts = 12;

function Card({ index }: CardProps) {
  return (
    <div
      className="absolute border border-black"
      style={{
        height: cardHeight,
        width: cardWidth,
        transform: `rotate(${
          (360 / numberOfNfts) * index
        }deg) translateX(calc(25vw + ${cardHeight} / 2))`,
        left: `calc(50% - ${cardHeight} / 2)`,
        top: `calc(50% - ${cardWidth} / 2)`,
      }}
    />
  );
}

export default function Page() {
  return (
    <main className="flex">
      <div className="border-1 relative h-[50vw] w-[50vw]  animate-[spin_25s_linear_infinite] rounded-full border border-neutral-200 ">
        {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11].map((value) => {
          return <Card index={value} />;
        })}
      </div>
    </main>
  );
}
