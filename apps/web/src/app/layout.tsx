import type { Metadata } from "next";
import "@/styles/globals.css";

export const metadata: Metadata = {
  title: "A11y Form Validator",
  description:
    "Platform-independent accessible form validation by BM Web Studio.",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
