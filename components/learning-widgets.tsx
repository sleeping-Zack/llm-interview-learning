'use client';

import { useMemo, useState } from 'react';
import { Binary, Eye, EyeOff, Gauge, RotateCcw, Sparkles } from 'lucide-react';

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
      <div className="flex items-start gap-3">
        <span className="mt-2 h-5 w-1 rounded-full bg-gradient-to-b from-primary to-cyan-400" />
        <div>
        {eyebrow ? (
          <p className="mb-1 text-xs font-semibold tracking-[0.12em] text-primary uppercase">
            {eyebrow}
          </p>
        ) : null}
        <h2 className="font-heading text-2xl font-semibold tracking-tight">{title}</h2>
        </div>
      </div>
      <div className="lesson-copy space-y-4 text-[15px] leading-7 text-muted-foreground">
        {children}
      </div>
    </section>
  );
}

export function KeyStatement({ children }: { children: React.ReactNode }) {
  return (
    <Card className="relative overflow-hidden border-0 bg-[linear-gradient(135deg,oklch(0.27_0.11_262),oklch(0.49_0.21_258)_62%,oklch(0.62_0.15_196))] text-white ring-0">
      <div className="pointer-events-none absolute -top-20 -right-16 size-56 rounded-full border border-white/12" />
      <div className="pointer-events-none absolute -right-2 -bottom-28 size-56 rounded-full bg-cyan-300/12 blur-2xl" />
      <CardHeader className="relative p-6 sm:p-7">
        <div className="mb-1 flex items-center gap-2 text-primary-foreground/75">
          <Sparkles className="size-4" />
          <span className="text-xs font-semibold tracking-wide">本课核心句</span>
        </div>
        <CardTitle className="max-w-3xl text-xl leading-8 text-balance sm:text-2xl">{children}</CardTitle>
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
    <div className="relative overflow-x-auto rounded-xl border border-white/8 bg-[oklch(0.16_0.035_260)] p-4 shadow-inner">
      {label ? (
          <p className="mb-2 text-xs font-semibold tracking-wide text-cyan-300/75 uppercase">
          {label}
        </p>
      ) : null}
      <code className="font-mono text-sm leading-7 whitespace-pre text-slate-100">
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
    <Card className="overflow-hidden border-l-4 border-l-primary bg-[linear-gradient(115deg,var(--card),color-mix(in_oklch,var(--secondary)_42%,var(--card)))]">
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
                <div className="rounded-lg border border-primary/10 bg-primary/5 px-3 py-3 leading-6 text-muted-foreground">
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

const attentionExample = [
  { token: '小猫', weights: [62, 14, 8, 16], note: '“小猫”主要保留自身身份，也会读取后面的动作和宾语。' },
  { token: '吃了', weights: [33, 18, 7, 42], note: '“吃了”会把主语“小猫”和宾语“鱼”联系起来。' },
  { token: '一条', weights: [8, 12, 54, 26], note: '数量词更关注自身与被修饰的“鱼”。' },
  { token: '鱼', weights: [24, 36, 10, 30], note: '“鱼”结合“吃了”和“小猫”，形成当前句子中的宾语语义。' },
];

export function AttentionDemo() {
  const [query, setQuery] = useState(1);
  const selected = attentionExample[query];

  return (
    <Card className="overflow-hidden">
      <CardHeader className="border-b bg-muted/45">
        <div className="flex items-center gap-2 text-primary">
          <Binary className="size-4" />
          <CardTitle>Self-Attention 观察台</CardTitle>
        </div>
        <CardDescription>选择一个 Query Token，观察它从同一句话的哪些位置聚合信息。</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6 pt-6">
        <div className="flex flex-wrap gap-2" role="group" aria-label="选择查询 Token">
          {attentionExample.map((item, index) => (
            <Button key={item.token} variant={query === index ? 'default' : 'outline'} onClick={() => setQuery(index)}>
              {item.token}
              {query === index ? <span className="ml-1 text-[10px] opacity-70">Query</span> : null}
            </Button>
          ))}
        </div>

        <div className="space-y-3">
          {attentionExample.map((item, index) => {
            const weight = selected.weights[index];
            return (
              <div key={item.token} className="grid grid-cols-[56px_minmax(0,1fr)_48px] items-center gap-3 text-sm">
                <code className="font-mono text-foreground">{item.token}</code>
                <div className="h-3 overflow-hidden rounded-full bg-muted">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-primary to-cyan-400 transition-[width] duration-300"
                    style={{ width: `${weight}%` }}
                  />
                </div>
                <span className="text-right font-mono text-xs text-muted-foreground">{weight}%</span>
              </div>
            );
          })}
        </div>

        <div className="rounded-xl border border-primary/15 bg-primary/5 p-4 text-sm leading-6 text-muted-foreground">
          <strong className="text-foreground">当前直觉：</strong>{selected.note}
        </div>
        <p className="text-xs leading-5 text-muted-foreground">
          权重仅为教学示意。真实权重由层、Head、位置与输入共同决定；“权重高”也不能直接等同于可解释的人类推理原因。
        </p>
      </CardContent>
    </Card>
  );
}

const sftSegments = [
  { role: 'SYSTEM', text: '你是一个可靠的助手', tokens: ['你是', '一个', '可靠', '的', '助手'], defaultTrain: false },
  { role: 'USER', text: '解释什么是 Token', tokens: ['解释', '什么', '是', 'Token'], defaultTrain: false },
  { role: 'ASSISTANT', text: 'Token 是模型处理文本的基本片段', tokens: ['Token', '是', '模型', '处理', '文本', '的', '基本', '片段'], defaultTrain: true },
];

export function SftMaskDemo() {
  const [trainPrompt, setTrainPrompt] = useState(false);

  return (
    <Card className="overflow-hidden">
      <CardHeader className="border-b bg-muted/45">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <CardTitle>SFT Loss Mask 演示</CardTitle>
            <CardDescription className="mt-1">常见做法是输入完整对话，但只在 Assistant 回答部分计算损失。</CardDescription>
          </div>
          <Button variant={trainPrompt ? 'secondary' : 'outline'} onClick={() => setTrainPrompt((value) => !value)}>
            {trainPrompt ? <Eye data-icon="inline-start" /> : <EyeOff data-icon="inline-start" />}
            {trainPrompt ? '当前：全序列计算' : '当前：仅回答计算'}
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4 pt-6">
        {sftSegments.map((segment) => {
          const included = segment.defaultTrain || trainPrompt;
          return (
            <div key={segment.role} className="grid gap-2 rounded-xl border p-4 sm:grid-cols-[92px_1fr]">
              <div>
                <Badge variant={included ? 'default' : 'secondary'}>{segment.role}</Badge>
                <p className="mt-1 text-[11px] text-muted-foreground">{included ? '计入 Loss' : 'Label = -100'}</p>
              </div>
              <div>
                <p className="mb-2 text-sm text-foreground">{segment.text}</p>
                <div className="flex flex-wrap gap-1.5">
                  {segment.tokens.map((token) => (
                    <code key={token} className={`rounded-md px-2 py-1 text-xs ${included ? 'bg-primary/12 text-primary' : 'bg-muted text-muted-foreground line-through decoration-muted-foreground/45'}`}>
                      {token}
                    </code>
                  ))}
                </div>
              </div>
            </div>
          );
        })}
        <p className="text-xs leading-5 text-muted-foreground">
          Mask 掉 Prompt 不代表模型“看不到”它；Prompt 仍参与前向计算并提供条件，只是不对这些位置累计训练损失。
        </p>
      </CardContent>
    </Card>
  );
}

export function LoraParameterDemo() {
  const [dimension, setDimension] = useState(4096);
  const [rank, setRank] = useState(8);
  const full = dimension * dimension;
  const lora = 2 * dimension * rank;
  const ratio = (lora / full) * 100;
  const formatter = new Intl.NumberFormat('zh-CN');

  return (
    <Card className="overflow-hidden">
      <CardHeader className="border-b bg-muted/45">
        <div className="flex items-center gap-2 text-primary"><Gauge className="size-4" /><CardTitle>LoRA 参数量计算器</CardTitle></div>
        <CardDescription>以一个 d × d 的线性层为例，对比全量更新与低秩增量。</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6 pt-6">
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="space-y-1.5 text-sm font-medium text-foreground">
            <span className="block">模型维度 d</span>
            <NativeSelect value={String(dimension)} onChange={(event) => setDimension(Number(event.target.value))}>
              {[2048, 4096, 5120, 8192].map((value) => <NativeSelectOption key={value} value={value}>{formatter.format(value)}</NativeSelectOption>)}
            </NativeSelect>
          </label>
          <label className="space-y-1.5 text-sm font-medium text-foreground">
            <span className="block">LoRA Rank r</span>
            <NativeSelect value={String(rank)} onChange={(event) => setRank(Number(event.target.value))}>
              {[4, 8, 16, 32, 64].map((value) => <NativeSelectOption key={value} value={value}>{value}</NativeSelectOption>)}
            </NativeSelect>
          </label>
        </div>

        <div className="grid gap-3 sm:grid-cols-3">
          <div className="rounded-xl bg-muted p-4"><p className="text-xs text-muted-foreground">原矩阵参数</p><p className="mt-1 font-mono text-lg font-semibold text-foreground">{formatter.format(full)}</p></div>
          <div className="rounded-xl bg-primary/8 p-4"><p className="text-xs text-muted-foreground">LoRA 可训练参数</p><p className="mt-1 font-mono text-lg font-semibold text-primary">{formatter.format(lora)}</p></div>
          <div className="rounded-xl bg-cyan-500/8 p-4"><p className="text-xs text-muted-foreground">占原矩阵比例</p><p className="mt-1 font-mono text-lg font-semibold text-cyan-700 dark:text-cyan-300">{ratio.toFixed(3)}%</p></div>
        </div>

        <FormulaBlock>W' = W + (α / r) · B · A
A ∈ R^(r × d),  B ∈ R^(d × r)</FormulaBlock>
        <p className="text-xs leading-5 text-muted-foreground">
          这是单个方阵的示意。真实训练会选择多个层与多个 Target Modules，实际总参数量要对所有目标矩阵求和。
        </p>
      </CardContent>
    </Card>
  );
}
