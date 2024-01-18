interface DrawerProps {
  className?: string;
  children: React.ReactNode;
}

export function Drawer({ children, className }: DrawerProps) {
  return (
    <>
      <div className={`mr-3 w-[21.875rem] shrink-0 ${className}`}>
        {/* TODO @YohanTz: Extract magic values like this somewhere (top-[5.75rem]) */}
        <div className="dark:border-dark-blue-900 dark:bg-dark-blue-950 fixed bottom-0 right-0 top-[5.75rem] m-3 flex w-[21.875rem] shrink-0 flex-col rounded-2xl border border-neutral-100 bg-white px-5 pb-5 pt-8">
          {children}
        </div>
      </div>
    </>
  );
}
