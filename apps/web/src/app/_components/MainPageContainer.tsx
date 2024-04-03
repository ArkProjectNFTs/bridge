interface MainPageContainerProps {
  children: React.ReactNode;
}

export default function MainPageContainer({
  children,
}: MainPageContainerProps) {
  return (
    <main className="mx-auto mt-[5.75rem] w-full max-w-7xl px-6 text-center">
      {children}
    </main>
  );
}
