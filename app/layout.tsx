import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Enigma - Secure Secret Sharing",
  description: "Host-proof secret sharing with burn-after-reading",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="bg-white text-black antialiased">
        {children}
      </body>
    </html>
  );
}

