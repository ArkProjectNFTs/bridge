interface ConditionalWrapperProps {
  children: React.ReactNode;
  wrapper: (children: React.ReactNode) => React.ReactNode;
}

export default function ConditionalWrapper({
  children,
  wrapper,
}: ConditionalWrapperProps) {
  return wrapper(children);
}
