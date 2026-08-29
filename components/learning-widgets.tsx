'use client';

import { useMemo, useState } from 'react';
import { RotateCcw, Sparkles } from 'lucide-react';

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  NativeSelect,
  NativeSelectOption,
} from '@/components/ui/native-select';
import { Slider } from '@/components/ui/slider';

export function LessonSection({
  id,
  title,
  eyebrow,
  children,
}: {
  id: string;
  title: string;
  eyebrow?: string;
  children: React.ReactNode;
}) {
  return (
    <section id={id} className="scroll-mt-24 space-y-4">
      <div>
        {eyebrow ? (
          <p className="mb-1 text-xs font-semibold tracking-[0.12em] text-primary uppercase">
            {eyebrow}
          </p>
        ) : null}
        <h2 className="font-heading text-2xl font-semibold tracking-tight">{title}</h2>
      </div>
      <div className="lesson-copy space-y-4 text-[15px] leading-7 text-muted-foreground">
        {children}
      </div>
    </section>
  );
}

export function KeyStatement({ children }: { children: React.ReactNode }) {
  return (
    <Card className="bg-primary text-primary-foreground ring-0">
      <CardHeader>
        <div className="mb-1 flex items-center gap-2 text-primary-foreground/75">
          <Sparkles className="size-4" />
          <span className="text-xs font-semibold tracking-wide">本课核心句</span>
        </div>
        <CardTitle className="text-xl leading-8 sm:text-2xl">{children}</CardTitle>
      </CardHeader>
    </Card>
  );
}

export function FormulaBlock({
  label,
  children,
}: {
  label?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="overflow-x-auto rounded-xl border bg-[oklch(from_var(--muted)_l_c_h/0.55)] p-4">
      {label ? (
        <p className="mb-2 text-xs font-semibold tracking-wide text-muted-foreground uppercase">
          {label}
        </p>
      ) : null}
      <code className="font-mono text-sm leading-7 whitespace-pre text-foreground">
        {children}
      </code>
    </div>
  );
}

export function InterviewAnswer({
  question,
  children,
}: {
  question: string;
  children: React.ReactNode;
}) {
  return (
    <Card className="border-l-4 border-l-primary">
      <CardHeader>
        <Badge variant="secondary" className="mb-1">
          面试口述
        </Badge>
        <CardTitle>{question}</CardTitle>
      </CardHeader>
      <CardContent>
        <blockquote className="text-[15px] leading-7 text-muted-foreground">
          {children}
        </blockquote>
      </CardContent>
    </Card>
  );
}

export function QuizList({
  questions,
}: {
  questions: Array<{ question: string; answer: React.ReactNode }>;
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>闭卷自测</CardTitle>
        <CardDescription>先口头回答，再展开核对。面试能力来自主动回忆。</CardDescription>
      </CardHeader>
      <CardContent>
        <Accordion>
          {questions.map((item, index) => (
            <AccordionItem key={item.question} value={`question-${index}`}>
              <AccordionTrigger>
                <span className="pr-4">
                  <span className="mr-2 font-mono text-xs text-primary">Q{index + 1}</span>
                  {item.question}
                </span>
              </AccordionTrigger>
              <AccordionContent>
                <div className="rounded-lg bg-muted px-3 py-3 leading-6 text-muted-foreground">
                  {item.answer}
                </div>
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </CardContent>
    </Card>
  );
}

const generationStates = [
  {
    candidates: [
      ['北京', 82],
      ['上海', 7],
      ['南京', 4],
      ['广州', 3],
      ['其他', 4],
    ] as Array<[string, number]>,
    chosen: '北京',
    append: '北京',
  },
  {
    candidates: [
      ['。', 67],
      ['，', 19],
      ['市', 6],
      ['。它', 5],
      ['其他', 3],
    ] as Array<[string, number]>,
    chosen: '。',
    append: '。',
  },
  {
    candidates: [
      ['<结束>', 91],
      ['北京', 3],
      ['中国', 2],
      ['其他', 4],
    ] as Array<[string, number]>,
    chosen: '<结束>',
    append: '',
  },
];

export function NextTokenDemo() {
  const [step, setStep] = useState(0);
  const [context, setContext] = useState('中国的首都是');
  const [lastChoice, setLastChoice] = useState('');
  const done = step >= generationStates.length;
  const current = generationStates[Math.min(step, generationStates.length - 1)];

  function advance() {
    if (done) return;
    setLastChoice(current.chosen);
    setContext((value) => value + current.append);
    setStep((value) => value + 1);
  }

  function reset() {
    setStep(0);
    setContext('中国的首都是');
    setLastChoice('');
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>逐 Token 生成演示</CardTitle>
        <CardDescription>候选概率仅用于说明生成机制，不是某个真实模型的输出。</CardDescription>
      </CardHeader>
      <CardContent className="space-y-5">
        <div className="rounded-xl bg-muted p-4">
          <p className="mb-1 text-xs text-muted-foreground">当前上下文</p>
          <p className="font-medium text-foreground" aria-live="polite">
            {context}
          </p>
        </div>

        {!done ? (
          <div className="space-y-2.5">
            <p className="text-sm font-medium text-foreground">下一 Token 候选概率</p>
            {current.candidates.map(([token, probability]) => (
              <div key={token} className="grid grid-cols-[72px_minmax(0,1fr)_42px] items-center gap-3 text-sm">
                <code className="truncate font-mono text-foreground">{token}</code>
                <div className="h-2 overflow-hidden rounded-full bg-muted">
                  <div
                    className="h-full rounded-full bg-primary transition-[width] duration-300"
                    style={{ width: `${probability}%` }}
                  />
                </div>
                <span className="text-right font-mono text-xs text-muted-foreground">
                  {probability}%
                </span>
              </div>
            ))}
          </div>
        ) : (
          <div className="rounded-xl border border-emerald-500/25 bg-emerald-500/10 p-4 text-sm text-emerald-700 dark:text-emerald-300">
            已选择结束标记，生成完成。
          </div>
        )}

        <div className="flex flex-wrap items-center gap-2">
          <Button onClick={advance} disabled={done}>
            {current.chosen === '<结束>' && !done ? '选择结束标记' : '选择并追加下一个 Token'}
          </Button>
          <Button variant="outline" onClick={reset}>
            <RotateCcw data-icon="inline-start" />
            重新开始
          </Button>
          {lastChoice ? (
            <span className="text-xs text-muted-foreground" aria-live="polite">
              上一轮选择：{lastChoice}
            </span>
          ) : null}
        </div>
      </CardContent>
    </Card>
  );
}

const budgetFields = [
  { key: 'system', label: '系统提示与指令', color: 'bg-chart-1', max: 12000, step: 256 },
  { key: 'history', label: '历史消息', color: 'bg-chart-2', max: 24000, step: 512 },
  { key: 'rag', label: 'RAG 证据', color: 'bg-chart-3', max: 32000, step: 512 },
  { key: 'tools', label: '工具定义与结果', color: 'bg-chart-4', max: 20000, step: 512 },
  { key: 'output', label: '输出预留', color: 'bg-chart-5', max: 16000, step: 512 },
] as const;

type BudgetKey = (typeof budgetFields)[number]['key'];

export function ContextBudgetDemo() {
  const [limit, setLimit] = useState(32768);
  const [values, setValues] = useState<Record<BudgetKey, number>>({
    system: 2048,
    history: 6144,
    rag: 12288,
    tools: 4096,
    output: 4096,
  });

  const total = useMemo(
    () => budgetFields.reduce((sum, field) => sum + values[field.key], 0),
    [values],
  );
  const remaining = limit - total;
  const scale = Math.max(limit, total, 1);
  const formatter = new Intl.NumberFormat('zh-CN');

  return (
    <Card>
      <CardHeader>
        <CardTitle>Context Window 预算分配</CardTitle>
        <CardDescription>切换窗口或拖动各项，观察输入和输出如何共享同一空间。</CardDescription>
      </CardHeader>
      <CardContent className="space-y-5">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <label className="space-y-1.5 text-sm font-medium text-foreground">
            <span className="block">模型上下文窗口</span>
            <NativeSelect
              value={String(limit)}
              onChange={(event) => setLimit(Number(event.target.value))}
            >
              {[8192, 16384, 32768, 65536, 131072].map((value) => (
                <NativeSelectOption key={value} value={value}>
                  {value >= 1024 ? `${value / 1024}K` : value}
                </NativeSelectOption>
              ))}
            </NativeSelect>
          </label>
          <div className="text-right">
            <p className="font-mono text-sm font-medium text-foreground">
              {formatter.format(total)} / {formatter.format(limit)} tokens
            </p>
            <p className={`text-xs ${remaining < 0 ? 'text-destructive' : 'text-muted-foreground'}`}>
              {remaining < 0
                ? `超出 ${formatter.format(Math.abs(remaining))} tokens`
                : `剩余 ${formatter.format(remaining)} tokens`}
            </p>
          </div>
        </div>

        <div className="relative flex h-8 overflow-hidden rounded-lg bg-muted" aria-label="Token 预算分配图">
          {budgetFields.map((field) => (
            <div
              key={field.key}
              className={`${field.color} h-full transition-[width] duration-300`}
              style={{ width: `${(values[field.key] / scale) * 100}%` }}
            />
          ))}
          {remaining > 0 ? (
            <div className="h-full bg-muted" style={{ width: `${(remaining / scale) * 100}%` }} />
          ) : null}
          {remaining < 0 ? (
            <div
              className="pointer-events-none absolute inset-y-0 right-0 bg-destructive/35"
              style={{ width: `${(Math.abs(remaining) / scale) * 100}%` }}
            />
          ) : null}
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          {budgetFields.map((field) => (
            <label key={field.key} className="space-y-2 text-sm text-foreground">
              <span className="flex items-center justify-between gap-3">
                <span className="flex min-w-0 items-center gap-2">
                  <span className={`size-2.5 shrink-0 rounded-sm ${field.color}`} />
                  <span className="truncate">{field.label}</span>
                </span>
                <span className="shrink-0 font-mono text-xs text-muted-foreground">
                  {formatter.format(values[field.key])}
                </span>
              </span>
              <Slider
                min={0}
                max={field.max}
                step={field.step}
                value={[values[field.key]]}
                onValueChange={(next) =>
                  setValues((current) => ({ ...current, [field.key]: next[0] ?? 0 }))
                }
                aria-label={field.label}
              />
            </label>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
