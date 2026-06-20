import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "DailyHub AI",
  description: "Scheduled GPT automation dashboard with OpenAI and Telegram integrations.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="th">
      <body>{children}</body>
    </html>
  );
}
