'use client';

import { useEffect, useState } from 'react';
import {
  BookOpenCheck,
  Boxes,
  Gauge,
  GitCompareArrows,
  Layers3,
  MemoryStick,
  Network,
  Scale,
} from 'lucide-react';

import { FormulaBlock } from '@/components/learning-widgets';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { NativeSelect, NativeSelectOption } from '@/components/ui/native-select';
import { Slider } from '@/components/ui/slider';

export type LessonChapter = {
  id: string;
  label: string;
  title: string;
};

export function LessonNavigator({ chapters }: { chapters: LessonChapter[] }) {
  const [activeId, setActiveId] = useState(chapters[0]?.id ?? '');

  useEffect(() => {
    const sections = chapters
      .map((chapter) => document.getElementById(chapter.id))
      .filter((section): section is HTMLElement => Boolean(section));
    if (!sections.length) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((left, right) => right.intersectionRatio - left.intersectionRatio)[0];
        if (visible) setActiveId(visible.target.id);
      },
      { rootMargin: '-25% 0px -58% 0px', threshold: [0.01, 0.2, 0.6] },
    );

    sections.forEach((section) => observer.observe(section));
    return () => observer.disconnect();
  }, [chapters]);

  return (
    <nav
      aria-label="本课章节导航"
      className="lesson-navigator sticky top-[4.25rem] z-10 -mx-1 overflow-hidden rounded-2xl border border-primary/15 bg-background/88 p-2 shadow-lg shadow-slate-950/5 backdrop-blur-xl"
    >
      <div className="mb-2 flex items-center gap-2 px-2 pt-1 text-xs font-semibold tracking-wide text-primary">
        <BookOpenCheck className="size-3.5" />
        本课学习路径
      </div>
      <div className="flex gap-1 overflow-x-auto pb-1">
        {chapters.map((chapter, index) => (
          <a
            key={chapter.id}
            href={`#${chapter.id}`}
            aria-current={activeId === chapter.id ? 'location' : undefined}
            onClick={() => setActiveId(chapter.id)}
            className={`group flex min-w-max items-center gap-2 rounded-xl px-3 py-2 text-left transition-all focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary ${activeId === chapter.id ? 'bg-primary text-primary-foreground shadow-md shadow-primary/15' : 'hover:bg-primary/8'}`}
          >
            <span className={`grid size-6 place-items-center rounded-lg font-mono text-[10px] transition-colors ${activeId === chapter.id ? 'bg-white/16 text-primary-foreground' : 'bg-muted text-primary group-hover:bg-primary group-hover:text-primary-foreground'}`}>
              {String(index + 1).padStart(2, '0')}
            </span>
            <span>
              <span className={`block text-[10px] ${activeId === chapter.id ? 'text-primary-foreground/65' : 'text-muted-foreground'}`}>{chapter.label}</span>
              <span className={`block text-xs font-medium ${activeId === chapter.id ? 'text-primary-foreground' : 'text-foreground'}`}>{chapter.title}</span>
            </span>
          </a>
        ))}
      </div>
    </nav>
  );
}

const modelSizes = [
  { label: '7B', params: 7e9 },
  { label: '14B', params: 14e9 },
  { label: '32B', params: 32e9 },
  { label: '72B', params: 72e9 },
] as const;

const precisions = [
  { label: 'FP32 · 4 bytes', bytes: 4 },
  { label: 'BF16 / FP16 · 2 bytes', bytes: 2 },
  { label: 'INT8 · 1 byte', bytes: 1 },
  { label: 'INT4 · 0.5 byte', bytes: 0.5 },
] as const;

function formatGb(value: number) {
  return `${value.toFixed(value >= 100 ? 0 : 1)} GB`;
}

export function ModelStorageLab() {
  const [modelIndex, setModelIndex] = useState(0);
  const [precisionIndex, setPrecisionIndex] = useState(1);
  const model = modelSizes[modelIndex];
  const precision = precisions[precisionIndex];
  const weightsGb = (model.params * precision.bytes) / 1e9;
  const mixedTrainingGb = (model.params * 16) / 1e9;
  const scale = Math.max(mixedTrainingGb, 1);

  return (
    <Card className="overflow-hidden border-primary/20">
      <CardHeader className="border-b bg-[linear-gradient(110deg,color-mix(in_oklch,var(--primary)_10%,var(--card)),var(--card))]">
        <div className="flex items-center gap-2 text-primary"><MemoryStick className="size-4" /><CardTitle>参数存储实验室</CardTitle></div>
        <CardDescription>切换模型规模与精度，先建立“权重能否放下”的数量级直觉。</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6 pt-6">
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="space-y-1.5 text-sm font-medium text-foreground">
            <span className="block">模型参数量</span>
            <NativeSelect value={String(modelIndex)} onChange={(event) => setModelIndex(Number(event.target.value))}>
              {modelSizes.map((item, index) => <NativeSelectOption key={item.label} value={index}>{item.label}</NativeSelectOption>)}
            </NativeSelect>
          </label>
          <label className="space-y-1.5 text-sm font-medium text-foreground">
            <span className="block">权重保存精度</span>
            <NativeSelect value={String(precisionIndex)} onChange={(event) => setPrecisionIndex(Number(event.target.value))}>
              {precisions.map((item, index) => <NativeSelectOption key={item.label} value={index}>{item.label}</NativeSelectOption>)}
            </NativeSelect>
          </label>
        </div>

        <div className="grid gap-3 sm:grid-cols-3">
          <div className="rounded-xl border bg-card p-4"><p className="text-xs text-muted-foreground">纯权重理论值</p><p className="mt-1 font-mono text-xl font-semibold text-primary">{formatGb(weightsGb)}</p></div>
          <div className="rounded-xl border bg-card p-4"><p className="text-xs text-muted-foreground">常见全量训练状态</p><p className="mt-1 font-mono text-xl font-semibold text-foreground">≈ {formatGb(mixedTrainingGb)}</p></div>
          <div className="rounded-xl border bg-card p-4"><p className="text-xs text-muted-foreground">两者相差</p><p className="mt-1 font-mono text-xl font-semibold text-cyan-700 dark:text-cyan-300">≈ {(mixedTrainingGb / weightsGb).toFixed(0)}×</p></div>
        </div>

        <div className="space-y-3">
          {[
            ['当前精度的纯权重', weightsGb, 'bg-primary'],
            ['混合精度全量训练状态', mixedTrainingGb, 'bg-gradient-to-r from-primary to-cyan-400'],
          ].map(([label, value, color]) => (
            <div key={label as string} className="grid grid-cols-[150px_1fr_72px] items-center gap-3 text-xs">
              <span className="text-muted-foreground">{label as string}</span>
              <div className="h-2 overflow-hidden rounded-full bg-muted"><div className={`h-full rounded-full ${color as string}`} style={{ width: `${((value as number) / scale) * 100}%` }} /></div>
              <span className="text-right font-mono text-foreground">{formatGb(value as number)}</span>
            </div>
          ))}
        </div>
        <p className="text-xs leading-5 text-muted-foreground">纯权重公式不含量化元数据、KV Cache、激活、临时张量与框架开销，因此“理论能放下”不等于服务一定能稳定运行。训练的 16 bytes/参数也是常见数量级，并非所有框架的固定常数。</p>
      </CardContent>
    </Card>
  );
}

function RopeDial({ angle, label, tone }: { angle: number; label: string; tone: string }) {
  return (
    <div className="space-y-2 text-center">
      <div className="relative mx-auto size-36 rounded-full border border-primary/20 bg-[radial-gradient(circle,var(--card)_0_16%,var(--muted)_17%_18%,transparent_19%),linear-gradient(90deg,transparent_49.5%,var(--border)_50%,transparent_50.5%),linear-gradient(transparent_49.5%,var(--border)_50%,transparent_50.5%)] shadow-inner">
        <div className={`absolute top-1/2 left-1/2 h-1 w-[39%] origin-left -translate-y-1/2 rounded-full ${tone} transition-transform duration-300`} style={{ transform: `rotate(${angle}deg)` }} />
        <div className="absolute top-1/2 left-1/2 size-3 -translate-1/2 rounded-full bg-foreground" />
      </div>
      <p className="font-mono text-xs text-foreground">{label} · {angle.toFixed(1)}°</p>
    </div>
  );
}

export function RopeRotationLab() {
  const [distance, setDistance] = useState(6);
  const degrees = distance * 11.25;
  const similarity = Math.cos((degrees * Math.PI) / 180);

  return (
    <Card className="overflow-hidden border-primary/20">
      <CardHeader className="border-b bg-[linear-gradient(110deg,color-mix(in_oklch,var(--chart-4)_10%,var(--card)),var(--card))]">
        <div className="flex items-center gap-2 text-primary"><Gauge className="size-4" /><CardTitle>RoPE 旋转观察台</CardTitle></div>
        <CardDescription>用一个二维频率对演示：内容向量相同，位置距离如何改变 Q、K 的相对角度。</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6 pt-6">
        <div className="grid gap-6 sm:grid-cols-2 sm:items-center">
          <div className="grid grid-cols-2 gap-3">
            <RopeDial angle={0} label="Query" tone="bg-primary" />
            <RopeDial angle={degrees} label="Key" tone="bg-chart-4" />
          </div>
          <div className="space-y-4 rounded-2xl border bg-muted/45 p-5">
            <div className="flex items-end justify-between gap-3"><div><p className="text-xs text-muted-foreground">相对位置距离</p><p className="mt-1 font-mono text-2xl font-semibold text-foreground">{distance} tokens</p></div><Badge variant="secondary">单频率示意</Badge></div>
            <Slider min={0} max={32} step={1} value={[distance]} onValueChange={(next) => setDistance(typeof next === 'number' ? next : (next[0] ?? 0))} aria-label="调整相对位置距离" />
            <div className="grid grid-cols-2 gap-3 text-sm"><div className="rounded-xl bg-card p-3"><p className="text-xs text-muted-foreground">相对角度</p><p className="mt-1 font-mono text-foreground">{degrees.toFixed(1)}°</p></div><div className="rounded-xl bg-card p-3"><p className="text-xs text-muted-foreground">余弦示意</p><p className="mt-1 font-mono text-foreground">{similarity.toFixed(3)}</p></div></div>
          </div>
        </div>
        <p className="text-xs leading-5 text-muted-foreground">真实 RoPE 会把向量分成许多二维对，并为不同维度使用不同旋转频率；模型最终的 Attention 分数还同时取决于内容。这里仅展示“相对位置进入点积”的核心几何直觉。</p>
      </CardContent>
    </Card>
  );
}

const trainingModels = [
  { label: '7B · 32L / 4096d', params: 7e9, layers: 32, hidden: 4096 },
  { label: '14B · 40L / 5120d', params: 14e9, layers: 40, hidden: 5120 },
  { label: '32B · 64L / 5120d', params: 32e9, layers: 64, hidden: 5120 },
] as const;

export function TrainingMemoryLab() {
  const [modelIndex, setModelIndex] = useState(0);
  const [gpuCount, setGpuCount] = useState(4);
  const [zeroStage, setZeroStage] = useState(2);
  const [sequence, setSequence] = useState(4096);
  const [microBatch, setMicroBatch] = useState(1);
  const [checkpoint, setCheckpoint] = useState(true);
  const model = trainingModels[modelIndex];
  const bytesPerParam = zeroStage === 0 ? 16 : zeroStage === 1 ? 4 + 12 / gpuCount : zeroStage === 2 ? 2 + 14 / gpuCount : 16 / gpuCount;
  const stateGb = (model.params * bytesPerParam) / 1e9;
  const activationFactor = checkpoint ? 8 / 3.5 : 8;
  const activationGb = (microBatch * sequence * model.layers * model.hidden * 2 * activationFactor) / 1e9;
  const totalGb = stateGb + activationGb;

  return (
    <Card className="overflow-hidden border-primary/20">
      <CardHeader className="border-b bg-[linear-gradient(110deg,color-mix(in_oklch,var(--chart-3)_11%,var(--card)),var(--card))]">
        <div className="flex items-center gap-2 text-primary"><Network className="size-4" /><CardTitle>训练显存拆账台</CardTitle></div>
        <CardDescription>观察参数状态分片、序列长度与激活如何共同决定单卡峰值。</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6 pt-6">
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          <label className="space-y-1.5 text-sm font-medium text-foreground"><span className="block">模型示例</span><NativeSelect value={String(modelIndex)} onChange={(event) => setModelIndex(Number(event.target.value))}>{trainingModels.map((item, index) => <NativeSelectOption key={item.label} value={index}>{item.label}</NativeSelectOption>)}</NativeSelect></label>
          <label className="space-y-1.5 text-sm font-medium text-foreground"><span className="block">GPU 数</span><NativeSelect value={String(gpuCount)} onChange={(event) => setGpuCount(Number(event.target.value))}>{[1, 2, 4, 8].map((value) => <NativeSelectOption key={value} value={value}>{value} GPUs</NativeSelectOption>)}</NativeSelect></label>
          <label className="space-y-1.5 text-sm font-medium text-foreground"><span className="block">ZeRO Stage</span><NativeSelect value={String(zeroStage)} onChange={(event) => setZeroStage(Number(event.target.value))}>{[0, 1, 2, 3].map((value) => <NativeSelectOption key={value} value={value}>Stage {value}</NativeSelectOption>)}</NativeSelect></label>
          <label className="space-y-1.5 text-sm font-medium text-foreground"><span className="block">Sequence Length</span><NativeSelect value={String(sequence)} onChange={(event) => setSequence(Number(event.target.value))}>{[2048, 4096, 8192, 16384].map((value) => <NativeSelectOption key={value} value={value}>{value.toLocaleString('zh-CN')}</NativeSelectOption>)}</NativeSelect></label>
          <label className="space-y-1.5 text-sm font-medium text-foreground"><span className="block">Micro Batch</span><NativeSelect value={String(microBatch)} onChange={(event) => setMicroBatch(Number(event.target.value))}>{[1, 2, 4].map((value) => <NativeSelectOption key={value} value={value}>{value}</NativeSelectOption>)}</NativeSelect></label>
          <div className="space-y-1.5 text-sm font-medium text-foreground"><span className="block">激活策略</span><Button variant={checkpoint ? 'default' : 'outline'} className="w-full" onClick={() => setCheckpoint((value) => !value)}>{checkpoint ? '已开启 Checkpointing' : '保存完整激活'}</Button></div>
        </div>

        <div className="grid gap-3 sm:grid-cols-3">
          <div className="rounded-xl bg-primary/8 p-4"><p className="text-xs text-muted-foreground">每卡参数相关状态</p><p className="mt-1 font-mono text-xl font-semibold text-primary">≈ {formatGb(stateGb)}</p></div>
          <div className="rounded-xl bg-chart-3/10 p-4"><p className="text-xs text-muted-foreground">激活数量级示意</p><p className="mt-1 font-mono text-xl font-semibold text-foreground">≈ {formatGb(activationGb)}</p></div>
          <div className="rounded-xl bg-muted p-4"><p className="text-xs text-muted-foreground">两项合计</p><p className="mt-1 font-mono text-xl font-semibold text-foreground">≈ {formatGb(totalGb)}</p></div>
        </div>
        <FormulaBlock label="这个演示采用的分片直觉">Stage 1：分片 Optimizer States
Stage 2：再分片 Gradients
Stage 3：再分片 Parameters</FormulaBlock>
        <p className="text-xs leading-5 text-muted-foreground">激活显存高度依赖算子融合、Attention 实现、重计算粒度和框架，本演示只用于观察变量趋势，不能当作采购 GPU 的精确计算器。通信缓冲、碎片和临时张量也未计入。</p>
      </CardContent>
    </Card>
  );
}

const loraModels = [
  { label: '7B · 32L / 4096d', params: 7e9, layers: 32, hidden: 4096 },
  { label: '14B · 40L / 5120d', params: 14e9, layers: 40, hidden: 5120 },
  { label: '32B · 64L / 5120d', params: 32e9, layers: 64, hidden: 5120 },
] as const;

const targetSets = [
  { label: '只做 q_proj + v_proj', matrices: 2 },
  { label: '覆盖 Q / K / V / O', matrices: 4 },
  { label: 'Attention + MLP 主线性层', matrices: 7 },
] as const;

export function LoraCoverageLab() {
  const [modelIndex, setModelIndex] = useState(0);
  const [rank, setRank] = useState(16);
  const [targetIndex, setTargetIndex] = useState(1);
  const model = loraModels[modelIndex];
  const targets = targetSets[targetIndex];
  const trainable = 2 * model.hidden * rank * targets.matrices * model.layers;
  const ratio = (trainable / model.params) * 100;
  const bf16BaseGb = (model.params * 2) / 1e9;
  const qloraBaseGb = (model.params * 0.625) / 1e9;
  const adapterStateGb = (trainable * 16) / 1e9;
  const compact = new Intl.NumberFormat('zh-CN', { notation: 'compact', maximumFractionDigits: 2 });

  return (
    <Card className="overflow-hidden border-primary/20">
      <CardHeader className="border-b bg-[linear-gradient(110deg,color-mix(in_oklch,var(--chart-2)_11%,var(--card)),var(--card))]">
        <div className="flex items-center gap-2 text-primary"><Layers3 className="size-4" /><CardTitle>LoRA 覆盖范围实验室</CardTitle></div>
        <CardDescription>Rank 与 Target Modules 如何一起决定可训练参数，而不是只盯着一个 r。</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6 pt-6">
        <div className="grid gap-4 sm:grid-cols-3">
          <label className="space-y-1.5 text-sm font-medium text-foreground"><span className="block">基座示例</span><NativeSelect value={String(modelIndex)} onChange={(event) => setModelIndex(Number(event.target.value))}>{loraModels.map((item, index) => <NativeSelectOption key={item.label} value={index}>{item.label}</NativeSelectOption>)}</NativeSelect></label>
          <label className="space-y-1.5 text-sm font-medium text-foreground"><span className="block">Rank r</span><NativeSelect value={String(rank)} onChange={(event) => setRank(Number(event.target.value))}>{[4, 8, 16, 32, 64].map((value) => <NativeSelectOption key={value} value={value}>{value}</NativeSelectOption>)}</NativeSelect></label>
          <label className="space-y-1.5 text-sm font-medium text-foreground"><span className="block">Target Modules</span><NativeSelect value={String(targetIndex)} onChange={(event) => setTargetIndex(Number(event.target.value))}>{targetSets.map((item, index) => <NativeSelectOption key={item.label} value={index}>{item.label}</NativeSelectOption>)}</NativeSelect></label>
        </div>

        <div className="grid gap-3 sm:grid-cols-4">
          <div className="rounded-xl border bg-card p-4"><p className="text-xs text-muted-foreground">LoRA 参数</p><p className="mt-1 font-mono text-lg font-semibold text-primary">{compact.format(trainable)}</p></div>
          <div className="rounded-xl border bg-card p-4"><p className="text-xs text-muted-foreground">占基座比例</p><p className="mt-1 font-mono text-lg font-semibold text-foreground">{ratio.toFixed(3)}%</p></div>
          <div className="rounded-xl border bg-card p-4"><p className="text-xs text-muted-foreground">4-bit 基座示意</p><p className="mt-1 font-mono text-lg font-semibold text-foreground">≈ {formatGb(qloraBaseGb)}</p></div>
          <div className="rounded-xl border bg-card p-4"><p className="text-xs text-muted-foreground">Adapter 训练状态</p><p className="mt-1 font-mono text-lg font-semibold text-foreground">≈ {formatGb(adapterStateGb)}</p></div>
        </div>

        <div className="rounded-xl border bg-muted/45 p-4 text-sm leading-6 text-muted-foreground">同一基座若以 BF16 保存，纯权重约 <strong className="font-mono text-foreground">{formatGb(bf16BaseGb)}</strong>；4-bit 基座加量化元数据的示意约 <strong className="font-mono text-foreground">{formatGb(qloraBaseGb)}</strong>。QLoRA 主要从这里省显存，长序列激活仍然存在。</div>
        <p className="text-xs leading-5 text-muted-foreground">为了让关系可手算，演示把目标层近似成 d × d 矩阵；真实 MLP 的 Up/Gate/Down 形状不同，模型是否含 Bias、GQA 以及框架实现也会改变精确参数量。</p>
      </CardContent>
    </Card>
  );
}

const preferenceScenarios = [
  { label: '训练起点', note: '当前模型与参考模型相同，相对偏好差为 0。', chosenCurrent: -12, rejectedCurrent: -12.8, chosenRef: -12, rejectedRef: -12.8 },
  { label: '正确拉开', note: 'Chosen 相对提升，Rejected 相对下降，偏好方向正确。', chosenCurrent: -10.5, rejectedCurrent: -13.2, chosenRef: -12, rejectedRef: -12.8 },
  { label: '一起抬高', note: '两个回答都变得更可能，但 Rejected 提升更多，DPO 仍会惩罚。', chosenCurrent: -10.5, rejectedCurrent: -10.7, chosenRef: -12, rejectedRef: -12.8 },
] as const;

export function PreferenceLab() {
  const [scenarioIndex, setScenarioIndex] = useState(0);
  const [beta, setBeta] = useState(0.1);
  const scenario = preferenceScenarios[scenarioIndex];
  const chosenShift = scenario.chosenCurrent - scenario.chosenRef;
  const rejectedShift = scenario.rejectedCurrent - scenario.rejectedRef;
  const margin = chosenShift - rejectedShift;
  const preferenceProbability = 1 / (1 + Math.exp(-beta * margin));
  const loss = -Math.log(preferenceProbability);

  return (
    <Card className="overflow-hidden border-primary/20">
      <CardHeader className="border-b bg-[linear-gradient(110deg,color-mix(in_oklch,var(--chart-4)_11%,var(--card)),var(--card))]">
        <div className="flex items-center gap-2 text-primary"><Scale className="size-4" /><CardTitle>DPO 偏好天平</CardTitle></div>
        <CardDescription>观察 DPO 比较的不是单独一个概率，而是“当前模型相对参考模型”的变化差。</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6 pt-6">
        <div className="flex flex-wrap gap-2">
          {preferenceScenarios.map((item, index) => <Button key={item.label} variant={scenarioIndex === index ? 'default' : 'outline'} onClick={() => setScenarioIndex(index)}>{item.label}</Button>)}
          <label className="ml-auto flex items-center gap-2 text-xs text-muted-foreground"><span>β</span><NativeSelect value={String(beta)} onChange={(event) => setBeta(Number(event.target.value))}>{[0.05, 0.1, 0.2, 0.5].map((value) => <NativeSelectOption key={value} value={value}>{value}</NativeSelectOption>)}</NativeSelect></label>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          {[
            ['Chosen', scenario.chosenRef, scenario.chosenCurrent, chosenShift, 'border-emerald-500/25 bg-emerald-500/7'],
            ['Rejected', scenario.rejectedRef, scenario.rejectedCurrent, rejectedShift, 'border-rose-500/25 bg-rose-500/7'],
          ].map(([label, ref, current, shift, className]) => (
            <div key={label as string} className={`rounded-2xl border p-5 ${className as string}`}>
              <div className="mb-4 flex items-center justify-between"><strong className="text-foreground">{label as string}</strong><Badge variant="secondary">变化 {Number(shift) >= 0 ? '+' : ''}{Number(shift).toFixed(1)}</Badge></div>
              <div className="grid grid-cols-2 gap-3 text-sm"><div><p className="text-xs text-muted-foreground">参考模型 log π</p><p className="mt-1 font-mono text-lg text-foreground">{Number(ref).toFixed(1)}</p></div><div><p className="text-xs text-muted-foreground">当前模型 log π</p><p className="mt-1 font-mono text-lg font-semibold text-foreground">{Number(current).toFixed(1)}</p></div></div>
            </div>
          ))}
        </div>

        <div className="grid gap-3 sm:grid-cols-3">
          <div className="rounded-xl bg-muted p-4"><p className="text-xs text-muted-foreground">相对偏好 Margin</p><p className="mt-1 font-mono text-xl font-semibold text-foreground">{margin >= 0 ? '+' : ''}{margin.toFixed(2)}</p></div>
          <div className="rounded-xl bg-primary/8 p-4"><p className="text-xs text-muted-foreground">σ(β · Margin)</p><p className="mt-1 font-mono text-xl font-semibold text-primary">{preferenceProbability.toFixed(3)}</p></div>
          <div className="rounded-xl bg-muted p-4"><p className="text-xs text-muted-foreground">示意 Loss</p><p className="mt-1 font-mono text-xl font-semibold text-foreground">{loss.toFixed(3)}</p></div>
        </div>
        <div className="flex gap-3 rounded-xl border border-primary/15 bg-primary/5 p-4 text-sm leading-6 text-muted-foreground"><GitCompareArrows className="mt-0.5 size-5 shrink-0 text-primary" /><p><strong className="text-foreground">当前场景：</strong>{scenario.note}</p></div>
        <p className="text-xs leading-5 text-muted-foreground">数值仅用于解释目标函数，未包含真实训练中的序列长度归一化、批次聚合和实现差异。β 控制偏好信号相对参考约束的尺度，不是普通学习率。</p>
      </CardContent>
    </Card>
  );
}

export function ParallelismQuickMap() {
  return (
    <div className="grid gap-3 md:grid-cols-3">
      {[
        [Boxes, 'Data Parallel', '每张卡放一份模型，各自处理不同数据，再同步梯度。', '模型要能放进单卡或配合 ZeRO'],
        [Layers3, 'Tensor Parallel', '把同一层的大矩阵切到多张卡，同一步需要频繁通信。', '适合单层矩阵已放不下'],
        [Network, 'Pipeline Parallel', '把不同层放在不同设备，Micro Batches 像流水线流过。', '会有流水线气泡与调度复杂度'],
      ].map(([Icon, title, text, boundary]) => {
        const ItemIcon = Icon as typeof Boxes;
        return <Card key={title as string}><CardHeader><ItemIcon className="size-5 text-primary" /><CardTitle className="font-mono text-base">{title as string}</CardTitle></CardHeader><CardContent className="space-y-3 text-sm leading-6 text-muted-foreground"><p>{text as string}</p><Badge variant="secondary">{boundary as string}</Badge></CardContent></Card>;
      })}
    </div>
  );
}
