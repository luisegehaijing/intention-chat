import { HTMLAttributes } from "react";

export function Card({ className = "", ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={`rounded-[1.75rem] border border-moss/25 bg-paper/92 shadow-soft backdrop-blur-sm transition-all duration-200 ${className}`}
      {...props}
    />
  );
}
