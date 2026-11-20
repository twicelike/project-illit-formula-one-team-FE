import type { Metadata } from "next";
import { WeverseAppProvider } from "@/components/sites/weverse/WeverseAppProvider";
import "./weverse-fonts.css";
import "./globals.css";

export const metadata: Metadata = {
  title: "Global Fandom Platform - Weverse",
  description: "Connect with global artists and fans on Weverse.",
  icons: {
    icon: [
      {
        url: "/sites/weverse/logo192.png",
        sizes: "192x192",
        type: "image/png",
      },
    ],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" data-wev-theme="light" className="h-full antialiased">
      <body className="min-h-full bg-white text-black">
        <WeverseAppProvider>{children}</WeverseAppProvider>
      </body>
    </html>
  );
}
