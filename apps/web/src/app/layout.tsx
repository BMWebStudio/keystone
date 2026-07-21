import type { Metadata } from "next";
import "@/styles/globals.css";

export const metadata: Metadata = {
  title: "Keystone",
  description:
    "Platform-independent accessible form validation by BM Web Studio.",
  icons: {
    icon: "/brand/bm-icon.png",
    apple: "/brand/bm-icon.png",
  },
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
