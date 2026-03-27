import type { ReactNode } from "react";
import type { Metadata } from "next";

import "./globals.css";

export const metadata: Metadata = {
  title: "CompeteIQ | AI 竞品分析平台",
  description: "输入产品和竞品名称，快速生成结构化 AI 竞品分析报告。",
  keywords: ["CompeteIQ", "AI 竞品分析", "竞争分析", "Next.js", "OpenAI"],
  applicationName: "CompeteIQ",
  metadataBase: new URL("https://competeiq.vercel.app"),
  openGraph: {
    title: "CompeteIQ | AI 竞品分析平台",
    description: "生成概览、雷达图、功能矩阵、SWOT 与战略机会点。",
    siteName: "CompeteIQ",
    type: "website"
  },
  twitter: {
    card: "summary_large_image",
    title: "CompeteIQ | AI 竞品分析平台",
    description: "生成概览、雷达图、功能矩阵、SWOT 与战略机会点。"
  }
};

export default function RootLayout({
  children
}: Readonly<{
  children: ReactNode;
}>) {
  return (
    <html lang="zh-CN" className="dark">
      <body>{children}</body>
    </html>
  );
}
