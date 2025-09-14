import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
  fallback: ["system-ui", "arial"],
});

export const metadata: Metadata = {
  title: "Investify",
  description:
    "Experience the next generation of goal-based investing with AI-powered insights and seamless portfolio management.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // Suppress hydration warnings for the html element
  // as they're caused by browser extensions and don't affect functionality
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <body
        className={`${inter.variable} antialiased font-sans bg-neo-dark text-white`}
      >
        {children}
      </body>
    </html>
  );
}
