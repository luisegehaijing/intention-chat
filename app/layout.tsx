import type { Metadata } from "next";
import "./globals.css";
import { Nav } from "@/components/layout/nav";

export const metadata: Metadata = {
  title: "Synchria — Land of Synchronicities",
  description: "One-campus weekly conversations with low-friction setup and trust-centered matching."
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <Nav />
        <main>{children}</main>
      </body>
    </html>
  );
}
