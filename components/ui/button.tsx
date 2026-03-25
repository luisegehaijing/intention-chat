import { ButtonHTMLAttributes } from "react";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "ghost";
}

export function Button({ variant = "primary", className = "", ...props }: ButtonProps) {
  const base =
    "rounded-full px-5 py-2.5 text-sm font-medium transition duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2";
  const styles = {
    primary: "bg-pine text-paper hover:bg-terracotta focus:ring-pine focus:ring-offset-sand",
    secondary: "bg-paper text-ink border border-moss/40 hover:bg-sand focus:ring-moss focus:ring-offset-sand",
    ghost: "text-moss hover:text-ink hover:bg-paper focus:ring-moss focus:ring-offset-sand"
  };

  return <button className={`${base} ${styles[variant]} ${className}`} {...props} />;
}
