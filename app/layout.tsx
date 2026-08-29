import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'LLM 面试知识库｜AI 应用开发复习站',
  description:
    '面向 AI 应用开发与 Agent 后端岗位的大模型学习笔记、面试回答与项目追问地图。',
  openGraph: {
    title: 'LLM 面试知识库',
    description: 'AI 应用开发 · 从原理到面试',
    type: 'website',
    locale: 'zh_CN',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'LLM 面试知识库',
    description: 'AI 应用开发 · 从原理到面试',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN">
      <body>{children}</body>
    </html>
  );
}
