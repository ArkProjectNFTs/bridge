import { type ReactElement } from "react";

interface ConditionalWrapperProps {
  children: React.ReactNode;
  wrapper: (children: React.ReactNode) => ReactElement;
}

export default function ConditionalWrapper({
  children,
  wrapper,
}: ConditionalWrapperProps) {
  return wrapper(children);
}
