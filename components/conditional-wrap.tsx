import { cloneElement } from "react";

export const ConditionalWrap = ({
  condition,
  children,
  wrap,
}: {
  condition: boolean;
  wrap: (children: JSX.Element) => JSX.Element;
  children: JSX.Element;
}) => (condition ? cloneElement(wrap(children)) : children);
