import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: '大模型通俗深度学习站｜从原理到 AI 应用',
  description:
    '用通俗直觉讲清大模型底层原理、训练、推理、调优、RAG 与 Agent，并配套面试回答与闭卷自测。',
  openGraph: {
    title: '大模型通俗深度学习站',
    description: '先理解原理，再走向 AI 应用与面试',
    type: 'website',
    locale: 'zh_CN',
  },
  twitter: {
    card: 'summary_large_image',
    title: '大模型通俗深度学习站',
    description: '先理解原理，再走向 AI 应用与面试',
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
