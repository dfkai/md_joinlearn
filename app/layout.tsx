import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Markdown 练习器",
  description: "学习和练习 Markdown 语法的工具",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN" suppressHydrationWarning>
      <body>{children}</body>
    </html>
  );
}
