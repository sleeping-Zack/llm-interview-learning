'use client';

import { useEffect, useMemo, useState } from 'react';
import {
  ArrowRight,
  BookOpen,
  BrainCircuit,
  Check,
  CheckCircle2,
  Circle,
  Clock3,
  Menu,
  Search,
  Sparkles,
  Target,
} from 'lucide-react';

import { LessonOne } from '@/components/lesson-one';
import { LessonTwo } from '@/components/lesson-two';
import { LessonThree } from '@/components/lesson-three';
import { LessonFour } from '@/components/lesson-four';
import { LessonFive } from '@/components/lesson-five';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Progress, ProgressLabel, ProgressValue } from '@/components/ui/progress';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';

type PageId = 'roadmap' | 'lesson-1' | 'lesson-2' | 'lesson-3' | 'lesson-4' | 'lesson-5';

type Lesson = {
  id: string;
  number: string;
  title: string;
  shortTitle: string;
  stage: string;
  priority: 'P0' | 'P1';
  duration: string;
  description: string;
  available: boolean;
};

const lessons: Lesson[] = [
  { id: 'lesson-1', number: '01', title: '大模型到底在做什么：从上下文到下一个 Token', shortTitle: 'LLM 到底在做什么', stage: '全景直觉', priority: 'P0', duration: '40 分钟', description: '自回归生成、参数、Logits、困惑度、解码与幻觉。', available: true },
  { id: 'lesson-2', number: '02', title: '文字如何进入模型：Tokenizer、Embedding 与 Context', shortTitle: '文字如何进入模型', stage: '输入表示', priority: 'P0', duration: '50 分钟', description: 'Token、三种向量、权重共享、RoPE、上下文内学习与预算。', available: true },
  { id: 'lesson-3', number: '03', title: 'Transformer 总览：Attention 取信息，FFN 做加工', shortTitle: 'Transformer 信息流', stage: '模型内部', priority: 'P0', duration: '55 分钟', description: 'Q/K/V、Mask、多头、残差、FFN、参数组成与 KV Cache。', available: true },
  { id: 'lesson-4', number: '04', title: '大模型如何学会续写：预训练与参数更新', shortTitle: '预训练与参数更新', stage: '训练基础', priority: 'P0', duration: '60 分钟', description: '交叉熵、反向传播、优化器、显存、数据工程与 Scaling Law。', available: true },
  { id: 'lesson-5', number: '05', title: '从会续写到会对话：SFT、LoRA 与偏好对齐', shortTitle: '微调与偏好对齐', stage: '能力塑造', priority: 'P0', duration: '60 分钟', description: 'SFT、低秩微调、QLoRA、RLHF、DPO 与方法边界。', available: true },
  { id: 'lesson-6', number: '06', title: '参数到底是什么：模型容量、规模与显存', shortTitle: '参数、规模与显存', stage: '模型内部', priority: 'P0', duration: '待更新', description: '参数、超参数、激活、KV Cache、7B/72B 与显存手算。', available: false },
  { id: 'lesson-7', number: '07', title: 'Transformer 第二遍：位置、FFN、残差与归一化', shortTitle: 'Transformer 深入', stage: '模型内部', priority: 'P0', duration: '待更新', description: '深入 Q/K/V、RoPE、SwiGLU、Residual 与 RMSNorm。', available: false },
  { id: 'lesson-8', number: '08', title: '训练为什么这么贵：优化器、Batch 与分布式训练', shortTitle: '训练成本与并行', stage: '训练深入', priority: 'P1', duration: '待更新', description: 'AdamW、混合精度、梯度检查点与三类分布式并行。', available: false },
  { id: 'lesson-9', number: '09', title: 'LoRA 与 QLoRA 深入：少改参数为什么有效', shortTitle: 'LoRA / QLoRA 深入', stage: '训练深入', priority: 'P0', duration: '待更新', description: '低秩假设、Rank、Target Modules、量化基座与选型。', available: false },
  { id: 'lesson-10', number: '10', title: '模型如何学习人类偏好：RLHF 与 DPO', shortTitle: 'RLHF / DPO 深入', stage: '对齐深入', priority: 'P1', duration: '待更新', description: '奖励模型、PPO、偏好对、KL、DPO 与对齐风险。', available: false },
  { id: 'lesson-11', number: '11', title: '模型如何决定下一句话：解码与生成控制', shortTitle: '解码与生成控制', stage: '推理原理', priority: 'P0', duration: '待更新', description: 'Greedy、Temperature、Top-k、Top-p、停止条件与结构化输出。', available: false },
  { id: 'lesson-12', number: '12', title: '一次请求怎样被推理引擎处理', shortTitle: '推理引擎全过程', stage: '推理工程', priority: 'P0', duration: '待更新', description: 'Prefill、Decode、KV Cache、Paged Attention、延迟与吞吐。', available: false },
  { id: 'lesson-13', number: '13', title: '量化与模型压缩：为什么 INT4 还能工作', shortTitle: '量化与模型压缩', stage: '部署优化', priority: 'P1', duration: '待更新', description: 'FP16/INT8/INT4、PTQ/QAT、蒸馏、质量与硬件权衡。', available: false },
  { id: 'lesson-14', number: '14', title: 'MoE：参数很多，为什么每次只用一部分', shortTitle: 'Dense 与 MoE', stage: '模型架构', priority: 'P1', duration: '待更新', description: 'Router、专家选择、激活参数、负载均衡与部署代价。', available: false },
  { id: 'lesson-15', number: '15', title: 'RAG 为什么有效，又为什么经常效果不好', shortTitle: 'RAG 完整链路', stage: 'AI 应用', priority: 'P0', duration: '待更新', description: '切分、召回、混合检索、重排、忠实度与分层排错。', available: false },
  { id: 'lesson-16', number: '16', title: 'Agent 的本质：模型、工具与状态循环', shortTitle: 'Agent 核心机制', stage: 'AI 应用', priority: 'P0', duration: '待更新', description: 'Tool Calling、状态、记忆、终止条件、权限与工作流边界。', available: false },
  { id: 'lesson-17', number: '17', title: '如何证明系统有效：评测、安全与可观测性', shortTitle: '评测、安全与观测', stage: '可靠性', priority: 'P0', duration: '待更新', description: '测试集、LLM Judge、Bad Case、Prompt Injection 与审计。', available: false },
  { id: 'lesson-18', number: '18', title: '综合系统设计与项目答辩', shortTitle: '系统设计与答辩', stage: '综合实战', priority: 'P0', duration: '待更新', description: '模型选型、成本延迟、可靠性权衡、项目复盘与连续追问。', available: false },
];

const curriculumStages = [
  { title: '第一阶段 · 建立完整心智模型', range: [1, 5], description: '先看懂文本如何进入模型、模型怎样生成、训练又如何改变参数。' },
  { title: '第二阶段 · 深入模型内部', range: [6, 10], description: '再拆参数、Transformer、训练成本、LoRA 与偏好对齐，回答“为什么有效”。' },
  { title: '第三阶段 · 推理与部署原理', range: [11, 14], description: '理解解码、推理引擎、量化与 MoE，把性能现象连接到底层机制。' },
  { title: '第四阶段 · AI 应用与系统落地', range: [15, 18], description: '最后进入 RAG、Agent、评测安全与系统设计，把大模型真正用进项目。' },
] as const;

const searchEntries = [
  { page: 'lesson-1' as PageId, type: '知识点', title: 'Next Token Prediction', text: '自回归、条件概率、逐 Token 生成、当前上下文' },
  { page: 'lesson-1' as PageId, type: '知识点', title: 'Logits、Softmax 与 Temperature', text: '未归一化分数、概率分布、随机性、解码' },
  { page: 'lesson-1' as PageId, type: '训练', title: 'Teacher Forcing 与 Causal Mask', text: '交叉熵、训练并行、推理串行、参数更新' },
  { page: 'lesson-1' as PageId, type: '工程', title: '幻觉为什么出现', text: '概率续写不等于事实核验、RAG、Tool、Verifier' },
  { page: 'lesson-1' as PageId, type: '底层原理', title: '参数、上下文与外部知识', text: '分布式知识、权重固定、临时 Hidden State、RAG 不改参数' },
  { page: 'lesson-1' as PageId, type: '评测', title: 'Cross Entropy 与 Perplexity', text: '负对数似然、困惑度、同数据同 Tokenizer 才可比较' },
  { page: 'lesson-2' as PageId, type: '知识点', title: 'BPE、WordPiece 与 Unigram', text: 'Tokenizer、子词、SentencePiece、词表大小' },
  { page: 'lesson-2' as PageId, type: '知识点', title: 'Token ID 与 Token Embedding', text: '词表索引、Embedding Matrix、V × d、参数量' },
  { page: 'lesson-2' as PageId, type: '知识点', title: 'Hidden State 与 Sentence Embedding', text: '上下文化表示、向量检索、余弦相似度、RAG' },
  { page: 'lesson-2' as PageId, type: '知识点', title: 'RoPE、Chat Template 与 Mask', text: '位置信息、特殊 Token、Padding Mask、Causal Mask' },
  { page: 'lesson-2' as PageId, type: '项目追问', title: '32k Token 预算口径', text: '模型窗口、单次业务预算、Agent Run 累计预算、reserve' },
  { page: 'lesson-2' as PageId, type: '工程', title: 'Context Window 与截断', text: '系统提示、历史、工具 Schema、RAG、输出预留、摘要' },
  { page: 'lesson-2' as PageId, type: '底层原理', title: 'Weight Tying 与 LM Head', text: '输入查 Embedding，输出从 Hidden State 投影回词表' },
  { page: 'lesson-2' as PageId, type: '学习机制', title: 'In-context Learning', text: 'Zero-shot、Few-shot、上下文临时学习、不更新模型权重' },
  { page: 'lesson-3' as PageId, type: '底层原理', title: 'Q、K、V 与 Attention 公式', text: 'Scaled Dot-Product Attention、Softmax、√d_k、Value 聚合' },
  { page: 'lesson-3' as PageId, type: '底层原理', title: 'Causal Mask、多头注意力与 FFN', text: 'MHA、GQA、MQA、Residual、RMSNorm、SwiGLU' },
  { page: 'lesson-3' as PageId, type: '推理工程', title: 'Prefill、Decode 与 KV Cache', text: 'TTFT、TPOT、长上下文、FlashAttention、显存与并发' },
  { page: 'lesson-3' as PageId, type: '模型规模', title: '参数量从哪里来', text: 'Embedding、Attention、FFN、隐藏维度平方、层数线性' },
  { page: 'lesson-4' as PageId, type: '训练', title: 'Cross Entropy 与 Teacher Forcing', text: '负对数似然、因果掩码、反向传播、训练并行' },
  { page: 'lesson-4' as PageId, type: '数据工程', title: '清洗、去重、数据配比与泄漏', text: '近似去重、去污染、训练验证测试集、Scaling Law' },
  { page: 'lesson-4' as PageId, type: '训练', title: 'SFT 与 Loss Mask', text: 'Base、Instruct、Chat、Assistant Token、Label -100' },
  { page: 'lesson-5' as PageId, type: '模型调优', title: 'LoRA 原理与参数量', text: '低秩分解、Rank、Alpha、Dropout、Target Modules、合并' },
  { page: 'lesson-5' as PageId, type: '模型调优', title: 'QLoRA 与训练显存', text: '4-bit、NF4、Double Quantization、Paged Optimizer、OOM' },
  { page: 'lesson-5' as PageId, type: '偏好对齐', title: 'RLHF 与 DPO', text: 'Reward Model、PPO、KL、Chosen、Rejected、Reference Model' },
];

const pageMeta: Record<PageId, { label: string; title: string; description: string; duration: string }> = {
  roadmap: { label: 'Course Roadmap', title: '大模型通俗深度学习地图', description: '先形成直觉，再理解准确机制；从生成原理、训练、推理一路走到 RAG、Agent 与系统设计。', duration: '共 18 课' },
  'lesson-1': { label: 'Lesson 01 · P0 必会', title: '大模型到底在做什么', description: '从下一个 Token 出发，理解参数、概率、困惑度、生成闭环以及幻觉的根本原因。', duration: '约 40 分钟' },
  'lesson-2': { label: 'Lesson 02 · P0 必会', title: '文字如何进入模型', description: '理解 Token、Embedding、隐藏状态、RoPE、上下文内学习与 Context Window。', duration: '约 50 分钟' },
  'lesson-3': { label: 'Lesson 03 · 底层核心', title: 'Transformer 如何让信息流动', description: 'Attention 负责取信息，FFN 负责加工；同时看懂参数组成与推理时的 KV Cache。', duration: '约 55 分钟' },
  'lesson-4': { label: 'Lesson 04 · 训练主线', title: '大模型如何学会续写', description: '从一次完整参数更新出发，理解预训练、优化器、训练显存、数据与 Scaling Law。', duration: '约 60 分钟' },
  'lesson-5': { label: 'Lesson 05 · 能力塑造', title: '从会续写到会对话', description: '分清 SFT、LoRA、QLoRA、RLHF 与 DPO 各自改变什么，以及它们做不到什么。', duration: '约 60 分钟' },
};

function SidebarContent({
  active,
  completed,
  onNavigate,
}: {
  active: PageId;
  completed: Set<string>;
  onNavigate: (id: PageId) => void;
}) {
  return (
    <>
      <button type="button" onClick={() => onNavigate('roadmap')} className="flex h-20 w-full items-center gap-3 border-b border-sidebar-border px-5 text-left">
        <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-gradient-to-br from-blue-500 to-cyan-400 text-white shadow-lg shadow-blue-500/20">
          <BrainCircuit className="size-5" />
        </span>
        <span className="min-w-0">
          <span className="block font-heading font-semibold text-sidebar-foreground">大模型深度学习站</span>
          <span className="block truncate text-xs text-sidebar-foreground/50">通俗讲原理 · 最后落到面试</span>
        </span>
      </button>

      <nav className="flex-1 overflow-y-auto px-3 py-5" aria-label="课程目录">
        <button
          type="button"
          onClick={() => onNavigate('roadmap')}
          className={`mb-3 flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left transition-all ${active === 'roadmap' ? 'bg-sidebar-primary text-sidebar-primary-foreground shadow-lg shadow-blue-950/25' : 'text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground'}`}
        >
          <span className="font-mono text-xs opacity-70">00</span>
          <span className="flex-1 text-sm font-medium">完整学习地图</span>
          <BookOpen className="size-4 opacity-70" />
        </button>

        <p className="mb-2 px-3 text-[11px] font-semibold tracking-[0.14em] text-sidebar-foreground/35 uppercase">已收录课程</p>
        <div className="space-y-1">
          {lessons.slice(0, 5).map((lesson) => (
            <button
              key={lesson.id}
              type="button"
              onClick={() => onNavigate(lesson.id as PageId)}
              className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left transition-all ${active === lesson.id ? 'bg-sidebar-primary text-sidebar-primary-foreground shadow-lg shadow-blue-950/25' : 'text-sidebar-foreground/68 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground'}`}
            >
              <span className="font-mono text-xs opacity-70">{lesson.number}</span>
              <span className="min-w-0 flex-1 truncate text-sm font-medium">{lesson.shortTitle}</span>
              {completed.has(lesson.id) ? <CheckCircle2 className="size-4 text-emerald-500" /> : <Circle className="size-3 opacity-35" />}
            </button>
          ))}
        </div>

        <p className="mt-6 mb-2 px-3 text-[11px] font-semibold tracking-[0.14em] text-sidebar-foreground/35 uppercase">后续路线</p>
        <div className="space-y-1">
          {lessons.slice(5).map((lesson) => (
            <div key={lesson.id} className="flex items-center gap-3 rounded-xl px-3 py-2 text-sidebar-foreground/35">
              <span className="font-mono text-xs">{lesson.number}</span>
              <span className="min-w-0 flex-1 truncate text-xs">{lesson.shortTitle}</span>
              <span className="text-[10px]">待更新</span>
            </div>
          ))}
        </div>
      </nav>

      <div className="border-t border-sidebar-border p-4 text-sidebar-foreground">
        <Progress value={(completed.size / lessons.length) * 100} aria-label="课程学习进度">
          <ProgressLabel>学习进度</ProgressLabel>
          <ProgressValue>{() => `${completed.size} / ${lessons.length}`}</ProgressValue>
        </Progress>
        <p className="mt-2 text-xs leading-5 text-sidebar-foreground/45">进度保存在当前浏览器，可随时回来继续。</p>
      </div>
    </>
  );
}

function Roadmap({ onNavigate }: { onNavigate: (id: PageId) => void }) {
  return (
    <article className="space-y-9">
      <Card className="relative overflow-hidden border-0 bg-[linear-gradient(135deg,oklch(0.20_0.075_265),oklch(0.36_0.17_261)_60%,oklch(0.50_0.13_202))] text-white ring-0">
        <div className="pointer-events-none absolute -top-32 -right-24 size-80 rounded-full border border-white/10" />
        <div className="pointer-events-none absolute top-14 right-10 size-32 rounded-full bg-cyan-300/10 blur-3xl" />
        <CardContent className="relative grid gap-7 p-6 sm:p-8 lg:grid-cols-[1fr_240px] lg:items-center">
          <div>
            <div className="mb-3 flex items-center gap-2 text-white/65">
              <Sparkles className="size-4" />
              <span className="text-xs font-semibold tracking-wide">你的学习方法</span>
            </div>
            <h2 className="font-heading text-2xl font-semibold sm:text-3xl">先理解，再口述，最后扛住追问</h2>
            <p className="mt-3 max-w-2xl text-sm leading-7 text-white/68">
              每个难点先给你一个能在脑中形成画面的直觉，再补准确机制和最少必要公式。课程会重复回到关键概念，但每一遍都多回答一个“为什么”和“有什么代价”。
            </p>
            <div className="mt-6 flex flex-wrap gap-5">
              {[
                ['18', '完整课程路线'],
                ['05', '已完整上线'],
                ['06', '交互式演示'],
              ].map(([value, label]) => <div key={label}><p className="font-mono text-xl font-semibold text-cyan-200">{value}</p><p className="text-[11px] text-white/45">{label}</p></div>)}
            </div>
          </div>
          <Button variant="secondary" size="lg" className="shadow-xl shadow-blue-950/25" onClick={() => onNavigate('lesson-1')}>
            从 Lesson 01 开始
            <ArrowRight data-icon="inline-end" />
          </Button>
        </CardContent>
      </Card>

      <section className="space-y-4">
        <div>
          <p className="text-xs font-semibold tracking-[0.12em] text-primary uppercase">课程路线</p>
          <div className="flex flex-wrap items-end justify-between gap-3">
            <h2 className="mt-1 font-heading text-2xl font-semibold tracking-tight">18 课建立完整大模型主线</h2>
            <Badge variant="outline">前 5 课已补充加深</Badge>
          </div>
        </div>
        <div className="space-y-8">
          {curriculumStages.map((stage) => {
            const [start, end] = stage.range;
            return (
              <section key={stage.title} className="space-y-4">
                <div className="rounded-2xl border bg-muted/45 p-4 sm:flex sm:items-center sm:justify-between sm:gap-5">
                  <div>
                    <h3 className="font-heading text-lg font-semibold text-foreground">{stage.title}</h3>
                    <p className="mt-1 text-sm leading-6 text-muted-foreground">{stage.description}</p>
                  </div>
                  <Badge variant="secondary" className="mt-3 shrink-0 sm:mt-0">Lesson {String(start).padStart(2, '0')}–{String(end).padStart(2, '0')}</Badge>
                </div>
                <div className="grid gap-4 md:grid-cols-2">
                  {lessons.slice(start - 1, end).map((lesson) => (
                    <Card key={lesson.id} className={`group relative overflow-hidden transition-all duration-200 ${lesson.available ? 'border-primary/20 hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-xl' : 'opacity-70'}`}>
                      <div className={`absolute inset-x-0 top-0 h-1 ${lesson.available ? 'bg-gradient-to-r from-primary via-blue-400 to-cyan-400' : 'bg-muted'}`} />
                      <CardHeader>
                        <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
                          <div className="flex items-center gap-2">
                            <Badge variant={lesson.available ? 'default' : 'secondary'}>Lesson {lesson.number}</Badge>
                            <Badge variant="outline">{lesson.priority}</Badge>
                          </div>
                          <span className="text-xs text-muted-foreground">{lesson.stage}</span>
                        </div>
                        <CardTitle>{lesson.title}</CardTitle>
                        <CardDescription>{lesson.description}</CardDescription>
                      </CardHeader>
                      <CardContent className="flex items-center justify-between gap-3">
                        <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
                          <Clock3 className="size-3.5" />{lesson.duration}
                        </span>
                        {lesson.available ? (
                          <Button variant="outline" className="group-hover:border-primary/35" onClick={() => onNavigate(lesson.id as PageId)}>
                            进入课程<ArrowRight data-icon="inline-end" />
                          </Button>
                        ) : <Badge variant="secondary">课程规划</Badge>}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </section>
            );
          })}
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-3">
        {[
          ['第一次学习', '完整顺序阅读，拖动交互演示，并用自己的话复述核心概念。'],
          ['第二次复习', '只看核心句、公式卡、易错点和标准回答，补齐模糊处。'],
          ['面试前冲刺', '隐藏答案做闭卷自测；每道 P0 题先答 30 秒，再展开到工程层。'],
        ].map(([title, text], index) => (
          <Card key={title}>
            <CardHeader>
              <span className="mb-2 font-mono text-xs text-primary">0{index + 1}</span>
              <CardTitle>{title}</CardTitle>
            </CardHeader>
            <CardContent className="text-sm leading-6 text-muted-foreground">{text}</CardContent>
          </Card>
        ))}
      </section>
    </article>
  );
}

function SearchResults({ query, onNavigate }: { query: string; onNavigate: (id: PageId) => void }) {
  const normalized = query.trim().toLowerCase();
  const results = searchEntries.filter((entry) => `${entry.type} ${entry.title} ${entry.text}`.toLowerCase().includes(normalized));

  return (
    <section className="space-y-5">
      <div>
        <p className="text-sm text-muted-foreground">搜索“{query}”</p>
        <h2 className="mt-1 font-heading text-2xl font-semibold">找到 {results.length} 个相关知识点</h2>
      </div>
      {results.length ? (
        <div className="space-y-3">
          {results.map((result) => (
            <button key={result.title} type="button" aria-label={`打开 ${result.title}`} onClick={() => onNavigate(result.page)} className="block w-full text-left">
              <Card className="transition-colors hover:border-primary/40 hover:bg-muted/40">
                <CardContent className="flex items-start gap-4 p-5">
                  <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-primary/10 text-primary"><Search className="size-4" /></span>
                  <span className="min-w-0 flex-1">
                    <span className="mb-1 flex flex-wrap items-center gap-2">
                      <Badge variant="secondary">{result.type}</Badge>
                      <span className="font-mono text-xs text-muted-foreground">Lesson {result.page.replace('lesson-', '').padStart(2, '0')}</span>
                    </span>
                    <strong className="block text-foreground">{result.title}</strong>
                    <span className="mt-1 block text-sm leading-6 text-muted-foreground">{result.text}</span>
                  </span>
                  <ArrowRight className="mt-2 size-4 shrink-0 text-muted-foreground" />
                </CardContent>
              </Card>
            </button>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="py-12 text-center">
            <Search className="mx-auto mb-3 size-6 text-muted-foreground" />
            <p className="font-medium text-foreground">暂时没有命中</p>
            <p className="mt-1 text-sm text-muted-foreground">试试 Attention、KV Cache、SFT、LoRA、DPO、32k 或 RAG。</p>
          </CardContent>
        </Card>
      )}
    </section>
  );
}

function StudyAside({ active }: { active: PageId }) {
  const content = ({
    roadmap: {
      goals: ['先完成前五课全景主线', '每课先讲直觉再复述机制', '沿 18 课路线螺旋式深入'],
      mapping: ['P0：应用开发岗位必须脱稿回答', 'P1：常见进阶追问，重点理解取舍'],
      tip: '建议每次只学一课，第二天不看笔记复述一次。看懂不等于会说，主动回忆才会留下来。',
    },
    'lesson-1': {
      goals: ['脱稿解释逐 Token 生成', '区分参数、上下文与外部知识', '说明 PPL 与幻觉的边界'],
      mapping: ['SSE 流式输出：逐 Token 生成的外部表现', 'RAG / Verifier：给概率模型补事实与校验'],
      tip: '面试回答先讲主链，再等追问展开公式，不要一上来堆名词。',
    },
    'lesson-2': {
      goals: ['区分三类向量表示', '用钟表直觉解释 RoPE', '区分上下文学习与参数更新'],
      mapping: ['Embedding + BM25 + Rerank：检索链路', '工具 Schema / Result：都会进入 Token 预算'],
      tip: '简历数字必须回到真实代码口径；不确定时明确说需要核对实现。',
    },
    'lesson-3': {
      goals: ['画出完整 Transformer Block', '说清 Attention 与 FFN 分工', '解释参数量和 KV Cache 从哪里来'],
      mapping: ['SSE 只改善感知延迟，不消除 Decode 串行', '长上下文影响 TTFT、KV Cache 与并发'],
      tip: '回答 Q/K/V 时先讲计算职责，再强调它们不是人工规定的固定语义。',
    },
    'lesson-4': {
      goals: ['复述一次完整训练迭代', '解释 AdamW 为何占显存', '区分混合精度与梯度累积'],
      mapping: ['业务日志如何转成高质量 SFT 数据', '动态知识优先 RAG，行为格式才做 SFT'],
      tip: '训练 Loss 是过程指标，不是上线结论；回答时一定补充独立评测。',
    },
    'lesson-5': {
      goals: ['分开训练目标与更新方式', '解释 QLoRA 具体省了什么', '说明对齐为何不等于事实正确'],
      mapping: ['LoRA 可承载 SFT 或 DPO 更新', 'RAG、微调和偏好对齐解决不同问题'],
      tip: '把“训练目标”和“参数更新方式”分开，是这一课最关键的面试表达。',
    },
  } satisfies Record<PageId, { goals: string[]; mapping: string[]; tip: string }>)[active];

  return (
    <aside className="space-y-4 lg:sticky lg:top-8 lg:self-start">
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2 text-primary"><Target className="size-4" /><CardTitle className="text-base">这一页的通过标准</CardTitle></div>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2.5 text-sm leading-6 text-muted-foreground">
            {content.goals.map((goal) => <li key={goal} className="flex gap-2"><Check className="mt-1.5 size-3.5 shrink-0 text-primary" />{goal}</li>)}
          </ul>
        </CardContent>
      </Card>
      <Card>
        <CardHeader><CardTitle className="text-base">与你的 AI 应用方向</CardTitle></CardHeader>
        <CardContent>
          <ul className="space-y-3 text-sm leading-6 text-muted-foreground">
            {content.mapping.map((item) => <li key={item}>{item}</li>)}
          </ul>
        </CardContent>
      </Card>
      <Card className="bg-muted/65">
        <CardContent className="pt-6 text-sm leading-6 text-muted-foreground">{content.tip}</CardContent>
      </Card>
    </aside>
  );
}

export function LearningSite() {
  const [active, setActive] = useState<PageId>('roadmap');
  const [query, setQuery] = useState('');
  const [completed, setCompleted] = useState<Set<string>>(new Set());
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    let restoreFrame: number | undefined;
    const saved = window.localStorage.getItem('llm-interview-completed');
    if (saved) {
      try {
        const restored = new Set(JSON.parse(saved) as string[]);
        restoreFrame = window.requestAnimationFrame(() => setCompleted(restored));
      } catch {
        window.localStorage.removeItem('llm-interview-completed');
      }
    }

    const syncFromHash = () => {
      const hash = window.location.hash.replace('#', '');
      if (['roadmap', 'lesson-1', 'lesson-2', 'lesson-3', 'lesson-4', 'lesson-5'].includes(hash)) setActive(hash as PageId);
    };
    syncFromHash();
    window.addEventListener('popstate', syncFromHash);
    return () => {
      if (restoreFrame !== undefined) window.cancelAnimationFrame(restoreFrame);
      window.removeEventListener('popstate', syncFromHash);
    };
  }, []);

  const navigate = (id: PageId) => {
    setActive(id);
    setQuery('');
    setMobileOpen(false);
    window.history.pushState(null, '', `#${id}`);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const toggleComplete = () => {
    if (active === 'roadmap') return;
    setCompleted((current) => {
      const next = new Set(current);
      if (next.has(active)) next.delete(active);
      else next.add(active);
      window.localStorage.setItem('llm-interview-completed', JSON.stringify([...next]));
      return next;
    });
  };

  const meta = pageMeta[active];
  const isSearching = query.trim().length > 0;
  const activeCompleted = completed.has(active);
  const searchPlaceholder = useMemo(() => '搜索 参数、RoPE、Attention、SFT、LoRA…', []);

  const renderActivePage = () => {
    switch (active) {
      case 'roadmap':
        return <Roadmap onNavigate={navigate} />;
      case 'lesson-1':
        return <LessonOne onNext={() => navigate('lesson-2')} />;
      case 'lesson-2':
        return <LessonTwo onPrevious={() => navigate('lesson-1')} onNext={() => navigate('lesson-3')} />;
      case 'lesson-3':
        return <LessonThree onPrevious={() => navigate('lesson-2')} onNext={() => navigate('lesson-4')} />;
      case 'lesson-4':
        return <LessonFour onPrevious={() => navigate('lesson-3')} onNext={() => navigate('lesson-5')} />;
      case 'lesson-5':
        return <LessonFive onPrevious={() => navigate('lesson-4')} onRoadmap={() => navigate('roadmap')} />;
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="sticky top-0 z-40 border-b bg-background/92 backdrop-blur-xl md:hidden">
        <div className="flex h-16 items-center justify-between gap-3 px-4">
          <button type="button" onClick={() => navigate('roadmap')} className="flex min-w-0 items-center gap-2.5 text-left">
            <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-primary text-primary-foreground"><BrainCircuit className="size-5" /></span>
            <span className="min-w-0"><span className="block truncate font-heading text-sm font-semibold">大模型深度学习站</span><span className="block truncate text-xs text-muted-foreground">{meta.label}</span></span>
          </button>
          <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
            <SheetTrigger render={<Button variant="outline" size="icon" aria-label="打开课程目录" />}><Menu /></SheetTrigger>
            <SheetContent side="left" className="sidebar-mesh w-[88%] border-sidebar-border bg-sidebar p-0 text-sidebar-foreground" showCloseButton>
              <SheetHeader className="sr-only"><SheetTitle>课程目录</SheetTitle><SheetDescription>选择学习地图或课程</SheetDescription></SheetHeader>
              <SidebarContent active={active} completed={completed} onNavigate={navigate} />
            </SheetContent>
          </Sheet>
        </div>
      </header>

      <aside className="sidebar-mesh fixed inset-y-0 left-0 z-30 hidden w-72 flex-col border-r border-sidebar-border bg-sidebar text-sidebar-foreground md:flex">
        <SidebarContent active={active} completed={completed} onNavigate={navigate} />
      </aside>

      <main className="md:pl-72">
        <div className="border-b bg-background/86 backdrop-blur-xl md:sticky md:top-0 md:z-20">
          <div className="mx-auto flex max-w-7xl items-center gap-3 px-4 py-3 sm:px-7 lg:px-10">
            <div className="relative flex-1 sm:max-w-md">
              <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input value={query} onChange={(event) => setQuery(event.target.value)} placeholder={searchPlaceholder} aria-label="搜索课程知识点" className="h-10 pl-9" />
            </div>
            <div className="hidden items-center gap-1.5 lg:flex" aria-label="前五课课程状态">
              {lessons.slice(0, 5).map((lesson) => <button key={lesson.id} type="button" onClick={() => navigate(lesson.id as PageId)} aria-label={`进入 Lesson ${lesson.number}`} className={`h-1.5 rounded-full transition-all ${active === lesson.id ? 'w-7 bg-primary' : completed.has(lesson.id) ? 'w-3 bg-emerald-500' : 'w-3 bg-border hover:bg-primary/40'}`} />)}
            </div>
            <Badge variant="outline" className="hidden sm:inline-flex">已完成 5 / 18 课内容</Badge>
          </div>
        </div>

        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-7 md:py-10 lg:px-10">
          {!isSearching ? (
            <div className="relative mb-8 overflow-hidden rounded-2xl border bg-card p-6 shadow-sm sm:p-7">
              <div className="pointer-events-none absolute -top-20 -right-16 size-48 rounded-full bg-primary/8 blur-2xl" />
              <div className="pointer-events-none absolute right-5 bottom-0 font-mono text-7xl font-bold text-primary/[0.045] sm:text-8xl">
                {active === 'roadmap' ? '00' : active.replace('lesson-', '').padStart(2, '0')}
              </div>
              <div className="relative flex flex-wrap items-start justify-between gap-5">
              <div className="max-w-3xl">
                <div className="mb-3 flex flex-wrap items-center gap-2">
                  <Badge variant="secondary">{meta.label}</Badge>
                  <span className="flex items-center gap-1.5 text-xs text-muted-foreground"><Clock3 className="size-3.5" />{meta.duration}</span>
                </div>
                <h1 className="font-heading text-3xl font-semibold tracking-tight sm:text-4xl">{meta.title}</h1>
                <p className="mt-3 max-w-2xl text-base leading-7 text-muted-foreground">{meta.description}</p>
              </div>
              {active !== 'roadmap' ? (
                <Button variant={activeCompleted ? 'secondary' : 'outline'} size="lg" className="shadow-sm" onClick={toggleComplete}>
                  {activeCompleted ? '已学完' : '标记已学完'}
                  <CheckCircle2 data-icon="inline-end" />
                </Button>
              ) : null}
              </div>
            </div>
          ) : null}

          <div className={`grid gap-7 ${isSearching ? '' : 'lg:grid-cols-[minmax(0,1fr)_280px]'}`}>
            <div className="min-w-0">
              {isSearching ? <SearchResults query={query} onNavigate={navigate} /> : renderActivePage()}
            </div>
            {!isSearching ? <StudyAside active={active} /> : null}
          </div>
        </div>
      </main>
    </div>
  );
}
