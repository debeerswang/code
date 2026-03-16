import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Strava Dashboard",
  description: "View your Strava activity stats and trends",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="bg-gray-950 text-white min-h-screen antialiased">
        {children}
      </body>
    </html>
  );
}
